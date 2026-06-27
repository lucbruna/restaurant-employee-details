import {
  computeHmacSha256Hex,
  fromMinorUnit,
  getRazorpayKeyId,
  getRazorpayKeySecret,
  getRazorpayWebhookSecret,
  secureCompareHex,
  toMinorUnit,
} from '../config';
import { PaymentServiceError } from '../types';
import type { PaymentProviderAdapter } from '../types';

function getRazorpayAuthHeader() {
  return `Basic ${Buffer.from(
    `${getRazorpayKeyId()}:${getRazorpayKeySecret()}`,
  ).toString('base64')}`;
}

function mapRazorpayEventStatus(event: unknown) {
  if (event === 'payment.captured') {
    return 'succeeded' as const;
  }

  if (event === 'payment.failed') {
    return 'failed' as const;
  }

  return null;
}

function verifyRazorpayWebhook(rawBody: string, signatureHeader: string | null) {
  if (!signatureHeader) {
    throw new PaymentServiceError(400, 'Missing Razorpay signature header.');
  }

  const expected = computeHmacSha256Hex(getRazorpayWebhookSecret(), rawBody);

  if (!secureCompareHex(expected, signatureHeader)) {
    throw new PaymentServiceError(400, 'Invalid Razorpay webhook signature.');
  }
}

export const razorpayPaymentProvider: PaymentProviderAdapter = {
  code: 'razorpay',
  async createPaymentSession(context) {
    const requestPayload = {
      amount: toMinorUnit(context.amount),
      currency: context.currency,
      receipt: context.paymentAttemptId,
      notes: {
        paymentAttemptId: context.paymentAttemptId,
        orderId: context.orderId,
        outletId: context.outletId,
        paymentMethod: context.paymentMethod,
      },
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: getRazorpayAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new PaymentServiceError(
        502,
        payload?.error?.description ?? 'Razorpay payment session creation failed.',
        {
          provider: 'razorpay',
          status: response.status,
          code: payload?.error?.code ?? null,
        },
      );
    }

    return {
      status: 'created',
      reference:
        typeof payload?.receipt === 'string' ? payload.receipt : context.paymentAttemptId,
      transactionId: null,
      providerOrderId: typeof payload?.id === 'string' ? payload.id : null,
      providerSessionId: typeof payload?.id === 'string' ? payload.id : null,
      checkout: {
        provider: 'razorpay',
        orderId: payload?.id ?? null,
        keyId: context.providerSettings.keyId || getRazorpayKeyId(),
        amount: payload?.amount ?? requestPayload.amount,
        currency: payload?.currency ?? context.currency,
        name: context.outletName,
        notes: requestPayload.notes,
        returnUrl: context.returnUrl,
      },
      requestPayload,
      responsePayload: payload,
    };
  },
  parseWebhook({ rawBody, headers }) {
    verifyRazorpayWebhook(rawBody, headers.get('x-razorpay-signature'));

    const event = JSON.parse(rawBody);
    const status = mapRazorpayEventStatus(event?.event);

    if (!status) {
      return null;
    }

    const paymentEntity = event?.payload?.payment?.entity;
    const orderEntity = event?.payload?.order?.entity;

    return {
      provider: 'razorpay',
      eventId: typeof event?.contains?.[0] === 'string' ? event.contains[0] : null,
      paymentAttemptId:
        typeof paymentEntity?.notes?.paymentAttemptId === 'string'
          ? paymentEntity.notes.paymentAttemptId
          : typeof orderEntity?.notes?.paymentAttemptId === 'string'
            ? orderEntity.notes.paymentAttemptId
            : null,
      providerOrderId:
        typeof paymentEntity?.order_id === 'string'
          ? paymentEntity.order_id
          : typeof orderEntity?.id === 'string'
            ? orderEntity.id
            : null,
      providerPaymentId:
        typeof paymentEntity?.id === 'string' ? paymentEntity.id : null,
      providerSignature: headers.get('x-razorpay-signature'),
      status,
      amount:
        typeof paymentEntity?.amount === 'number'
          ? fromMinorUnit(paymentEntity.amount)
          : typeof orderEntity?.amount === 'number'
            ? fromMinorUnit(orderEntity.amount)
            : null,
      currency:
        typeof paymentEntity?.currency === 'string'
          ? paymentEntity.currency.toUpperCase()
          : typeof orderEntity?.currency === 'string'
            ? orderEntity.currency.toUpperCase()
            : null,
      reference:
        typeof orderEntity?.receipt === 'string'
          ? orderEntity.receipt
          : typeof paymentEntity?.order_id === 'string'
            ? paymentEntity.order_id
            : null,
      transactionId:
        typeof paymentEntity?.id === 'string' ? paymentEntity.id : null,
      errorCode:
        typeof paymentEntity?.error_code === 'string'
          ? paymentEntity.error_code
          : null,
      errorMessage:
        typeof paymentEntity?.error_description === 'string'
          ? paymentEntity.error_description
          : null,
      metadata:
        paymentEntity?.notes && typeof paymentEntity.notes === 'object'
          ? paymentEntity.notes
          : orderEntity?.notes && typeof orderEntity.notes === 'object'
            ? orderEntity.notes
            : null,
      responsePayload: event,
      completedAt: status === 'succeeded' ? new Date().toISOString() : null,
    };
  },
};
