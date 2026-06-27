import type { PaymentProviderAdapter } from '../types';

export const manualPaymentProvider: PaymentProviderAdapter = {
  code: 'manual',
  async createPaymentSession(context) {
    return {
      status: 'created',
      providerSessionId: context.paymentAttemptId,
      checkout: {
        provider: 'manual',
        mode: 'manual',
        message: 'Collect payment at the POS counter to settle this order.',
      },
      requestPayload: {
        provider: 'manual',
        paymentAttemptId: context.paymentAttemptId,
      },
      responsePayload: {
        mode: 'manual',
        paymentAttemptId: context.paymentAttemptId,
      },
    };
  },
};
