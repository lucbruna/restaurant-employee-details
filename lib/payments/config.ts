import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  PaymentMethodCode,
  PaymentProviderCode,
  PaymentProviderMode,
} from '@/types';
import { PaymentServiceError } from './types';

export function isPaymentProviderCode(value: unknown): value is PaymentProviderCode {
  return value === 'manual' || value === 'stripe' || value === 'razorpay';
}

export function isPaymentMethodCode(value: unknown): value is PaymentMethodCode {
  return (
    value === 'cash' ||
    value === 'card' ||
    value === 'upi' ||
    value === 'wallet' ||
    value === 'complimentary'
  );
}

export function normalizePaymentProviderMode(value: unknown): PaymentProviderMode {
  return value === 'live' ? 'live' : 'sandbox';
}

export function normalizeCurrency(value: unknown, fallback = 'INR') {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();
  return normalized.length > 0 ? normalized : fallback;
}

export function toMinorUnit(amount: number) {
  return Math.round((Number(amount) || 0) * 100);
}

export function fromMinorUnit(amount: number) {
  return Math.round((Number(amount) || 0)) / 100;
}

export function computeHmacSha256Hex(secret: string, payload: string) {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export function secureCompareHex(expected: string, provided: string) {
  if (!expected || !provided) {
    return false;
  }

  try {
    const expectedBuffer = Buffer.from(expected, 'hex');
    const providedBuffer = Buffer.from(provided, 'hex');

    if (expectedBuffer.length === 0 || expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, providedBuffer);
  } catch {
    return false;
  }
}

export function getPaymentsDefaultProvider(): PaymentProviderCode {
  return isPaymentProviderCode(process.env.PAYMENTS_DEFAULT_PROVIDER)
    ? process.env.PAYMENTS_DEFAULT_PROVIDER
    : 'manual';
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new PaymentServiceError(500, `Missing required payment configuration: ${name}`);
  }

  return value;
}

export function getStripeSecretKey() {
  return getRequiredEnv('STRIPE_SECRET_KEY');
}

export function getStripePublishableKey() {
  return getRequiredEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
}

export function getStripeWebhookSecret() {
  return getRequiredEnv('STRIPE_WEBHOOK_SECRET');
}

export function getRazorpayKeyId() {
  return getRequiredEnv('RAZORPAY_KEY_ID');
}

export function getRazorpayKeySecret() {
  return getRequiredEnv('RAZORPAY_KEY_SECRET');
}

export function getRazorpayWebhookSecret() {
  return getRequiredEnv('RAZORPAY_WEBHOOK_SECRET');
}
