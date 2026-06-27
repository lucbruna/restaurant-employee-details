import { z } from 'zod';

export const orderItemModifierSchema = z.object({
  modifierId: z.string(),
  modifierName: z.string(),
  priceDelta: z.number(),
});

export const orderItemSchema = z.object({
  itemId: z.string(),
  variantId: z.string().optional(),
  itemName: z.string(),
  variantName: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  modifiers: z.array(orderItemModifierSchema).default([]),
  itemNote: z.string().optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().optional(),
  customerId: z.string().optional(),
  orderType: z.enum(['dine_in', 'takeaway', 'delivery', 'online']),
  paxCount: z.number().min(1).default(1),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
  specialInstructions: z.string().optional(),
});

export const paymentSplitSchema = z.object({
  method: z.enum(['cash', 'card', 'upi', 'wallet', 'complimentary']),
  amount: z.number().min(0),
  reference: z.string().optional(),
  transactionId: z.string().optional(),
});

export const processPaymentSchema = z.object({
  orderId: z.string(),
  splits: z.array(paymentSplitSchema).min(1, 'At least one payment method required'),
  totalAmount: z.number().min(0),
  changeAmount: z.number().default(0),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ProcessPaymentInput = z.infer<typeof processPaymentSchema>;
