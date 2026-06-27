import type { TabletOrderingSettings } from '@/types';

export type BillingPreviewInput = {
  subtotal: number;
  discountAmount?: number;
  taxRate?: number;
  serviceChargeRate?: number;
  applyTaxOnServiceCharge?: boolean;
  roundOffStrategy?: TabletOrderingSettings['roundOffStrategy'];
};

export type BillingPreview = {
  subtotal: number;
  discountAmount: number;
  taxableSubtotal: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  taxRate: number;
  taxBase: number;
  taxAmount: number;
  roundOffAdjustment: number;
  totalAmount: number;
};

export const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const normalizeRate = (value: number | undefined) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

export function calculateBillPreview({
  subtotal,
  discountAmount = 0,
  taxRate = 0,
  serviceChargeRate = 0,
  applyTaxOnServiceCharge = false,
  roundOffStrategy = 'none',
}: BillingPreviewInput): BillingPreview {
  const normalizedSubtotal = roundCurrency(Math.max(0, Number(subtotal) || 0));
  const normalizedDiscountAmount = roundCurrency(
    Math.min(Math.max(0, Number(discountAmount) || 0), normalizedSubtotal),
  );
  const taxableSubtotal = roundCurrency(normalizedSubtotal - normalizedDiscountAmount);
  const normalizedServiceChargeRate = normalizeRate(serviceChargeRate);
  const normalizedTaxRate = normalizeRate(taxRate);
  const serviceChargeAmount = roundCurrency(
    taxableSubtotal * (normalizedServiceChargeRate / 100),
  );
  const taxBase = roundCurrency(
    taxableSubtotal + (applyTaxOnServiceCharge ? serviceChargeAmount : 0),
  );
  const taxAmount = roundCurrency(taxBase * (normalizedTaxRate / 100));
  const grossTotal = roundCurrency(taxableSubtotal + serviceChargeAmount + taxAmount);
  const roundedTotal =
    roundOffStrategy === 'nearest_rupee' ? roundCurrency(Math.round(grossTotal)) : grossTotal;
  const roundOffAdjustment = roundCurrency(roundedTotal - grossTotal);

  return {
    subtotal: normalizedSubtotal,
    discountAmount: normalizedDiscountAmount,
    taxableSubtotal,
    serviceChargeRate: normalizedServiceChargeRate,
    serviceChargeAmount,
    taxRate: normalizedTaxRate,
    taxBase,
    taxAmount,
    roundOffAdjustment,
    totalAmount: roundCurrency(grossTotal + roundOffAdjustment),
  };
}
