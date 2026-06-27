import type {
  PaymentAttemptStatus,
  PaymentMethodCode,
  PaymentProviderCode,
  PaymentProviderSettings,
} from '@/types';

export type JsonMap = Record<string, unknown>;

export type CreatePaymentSessionResult = {
  paymentAttemptId: string;
  provider: PaymentProviderCode;
  paymentMethod: PaymentMethodCode;
  status: PaymentAttemptStatus;
  amount: number;
  currency: string;
  checkout: JsonMap | null;
  reference: string | null;
  transactionId: string | null;
};

export type ManualPaymentResult = {
  order: Record<string, unknown>;
  paymentId: string;
  paymentAttemptId: string;
  changeAmount: number;
};

export type PaymentProviderContext = {
  paymentAttemptId: string;
  orderId: string;
  outletId: string;
  cashierId: string | null;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodCode;
  returnUrl: string | null;
  outletName: string;
  providerSettings: PaymentProviderSettings;
};

export type PaymentWebhookEvent = {
  provider: PaymentProviderCode;
  eventId?: string | null;
  paymentAttemptId?: string | null;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  providerSessionId?: string | null;
  providerSignature?: string | null;
  status: PaymentAttemptStatus;
  amount?: number | null;
  currency?: string | null;
  reference?: string | null;
  transactionId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  metadata?: JsonMap | null;
  requestPayload?: JsonMap | null;
  responsePayload?: JsonMap | null;
  completedAt?: string | null;
};

export interface PaymentProviderAdapter {
  code: PaymentProviderCode;
  createPaymentSession(context: PaymentProviderContext): Promise<{
    status: PaymentAttemptStatus;
    reference?: string | null;
    transactionId?: string | null;
    providerOrderId?: string | null;
    providerPaymentId?: string | null;
    providerSignature?: string | null;
    providerSessionId?: string | null;
    checkout?: JsonMap | null;
    requestPayload?: JsonMap | null;
    responsePayload?: JsonMap | null;
  }>;
  parseWebhook?(
    input: { rawBody: string; headers: Headers },
  ): Promise<PaymentWebhookEvent | null> | PaymentWebhookEvent | null;
}

export type PaymentWebhookProcessingResult = {
  handled: boolean;
  paymentAttemptId?: string;
  status?: PaymentAttemptStatus;
};

export class PaymentServiceError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: JsonMap,
  ) {
    super(message);
    this.name = 'PaymentServiceError';
  }
}
