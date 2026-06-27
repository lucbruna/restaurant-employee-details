import type { PaymentProviderCode } from '@/types';
import { manualPaymentProvider } from './providers/manual';
import { razorpayPaymentProvider } from './providers/razorpay';
import { stripePaymentProvider } from './providers/stripe';

const PAYMENT_PROVIDERS = {
  manual: manualPaymentProvider,
  stripe: stripePaymentProvider,
  razorpay: razorpayPaymentProvider,
};

export function getPaymentProvider(code: PaymentProviderCode) {
  return PAYMENT_PROVIDERS[code];
}
