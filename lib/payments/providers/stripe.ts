import {
  computeHmacSha256Hex,
  getStripePublishableKey,
  getStripeSecretKey,
  getStripeWebhookSecret,
  secureCompareHex,
} from '../config';
import { PaymentServiceError } from '../types';
import type { PaymentProviderAdapter, PaymentWebhookEvent } from '../types';

function mapStripePaymentIntentStatus(status: unknown): PaymentWebhookEvent['status'] {
  switch (status) {
    case 'succeeded':
      return 'succeeded';
    case 'processing':
      return 'processing';
    case 'canceled':
      return 'cancelled';
    case 'requires_action':
    case 'requires_confirmation':
    case 'requires_capture':
      return 'requires_action';
    case 'requires_payment_method':
      return 'failed';
    default:
      return 'created';
  }
}

function verifyStripeWebhook(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) {
    throw new PaymentServiceError(400, 'Missing Stripe signature header.');
  }

  const parts = signatureHeader.split(',').map((part) => part.trim());
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signature = parts.find((part) => part.startsWith('v1='))?.slice(3);

  if (!timestamp || !signature) {
    throw new PaymentServiceError(400, 'Malformed Stripe signature header.');
  }

  const expected = computeHmacSha256Hex(
    getStripeWebhookSecret(),
    `${timestamp}.${rawBody}`,
  );

  if (!secureCompareHex(expected, signature)) {
    throw new PaymentServiceError(400, 'Invalid Stripe webhook signature.');
  }
}

export const stripePaymentProvider: PaymentProviderAdapter = {
  code: 'stripe',
  async createPaymentSession(context) {
    const params = new URLSearchParams();
    params.set('amount', String(Math.round(context.amount * 100)));
    params.set('currency', context.currency.toLowerCase());
    params.set('automatic_payment_methods[enabled]', 'true');
    params.set('description', `${context.outletName} order ${context.orderId}`);
    params.set('metadata[paymentAttemptId]', context.paymentAttemptId);
    params.set('metadata[orderId]', context.orderId);
    params.set('metadata[outletId]', context.outletId);
    params.set('metadata[paymentMethod]', context.paymentMethod);

    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getStripeSecretKey()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new PaymentServiceError(
        502,
        payload?.error?.message ?? 'Stripe payment session creation failed.',
        {
          provider: 'stripe',
          status: response.status,
          code: payload?.error?.code ?? null,
        },
      );
    }

    return {
      status: mapStripePaymentIntentStatus(payload?.status),
      reference: payload?.id ?? null,
      transactionId:
        typeof payload?.latest_charge === 'string' ? payload.latest_charge : null,
      providerPaymentId: payload?.id ?? null,
      providerSessionId:
        typeof payload?.client_secret === 'string' ? payload.client_secret : null,
      checkout: {
        provider: 'stripe',
        clientSecret: payload?.client_secret ?? null,
        publishableKey:
          context.providerSettings.publishableKey || getStripePublishableKey(),
        returnUrl: context.returnUrl,
      },
      requestPayload: {
        amount: context.amount,
        currency: context.currency,
        paymentMethod: context.paymentMethod,
        orderId: context.orderId,
      },
      responsePayload: payload,
    };
  },
  parseWebhook({ rawBody, headers }) {
    verifyStripeWebhook(rawBody, headers.get('stripe-signature'));

    const event = JSON.parse(rawBody);
    const paymentIntent = event?.data?.object;

    if (!paymentIntent || typeof paymentIntent !== 'object') {
      return null;
    }

    if (
      event?.type !== 'payment_intent.succeeded' &&
      event?.type !== 'payment_intent.payment_failed' &&
      event?.type !== 'payment_intent.canceled' &&
      event?.type !== 'payment_intent.processing'
    ) {
      return null;
    }

    return {
      provider: 'stripe',
      eventId: typeof event?.id === 'string' ? event.id : null,
      paymentAttemptId:
        typeof paymentIntent.metadata?.paymentAttemptId === 'string'
          ? paymentIntent.metadata.paymentAttemptId
          : null,
      providerPaymentId:
        typeof paymentIntent.id === 'string' ? paymentIntent.id : null,
      providerSessionId:
        typeof paymentIntent.client_secret === 'string'
          ? paymentIntent.client_secret
          : null,
      status: mapStripePaymentIntentStatus(paymentIntent.status),
      amount:
        typeof paymentIntent.amount_received === 'number'
          ? paymentIntent.amount_received / 100
          : typeof paymentIntent.amount === 'number'
            ? paymentIntent.amount / 100
            : null,
      currency:
        typeof paymentIntent.currency === 'string'
          ? paymentIntent.currency.toUpperCase()
          : null,
      reference: typeof paymentIntent.id === 'string' ? paymentIntent.id : null,
      transactionId:
        typeof paymentIntent.latest_charge === 'string'
          ? paymentIntent.latest_charge
          : null,
      errorCode:
        typeof paymentIntent.last_payment_error?.code === 'string'
          ? paymentIntent.last_payment_error.code
          : null,
      errorMessage:
        typeof paymentIntent.last_payment_error?.message === 'string'
          ? paymentIntent.last_payment_error.message
          : null,
      metadata:
        paymentIntent.metadata && typeof paymentIntent.metadata === 'object'
          ? paymentIntent.metadata
          : null,
      responsePayload: event,
      completedAt:
        event?.type === 'payment_intent.succeeded' ? new Date().toISOString() : null,
    };
  },
};
