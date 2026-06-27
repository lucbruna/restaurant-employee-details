import { randomUUID } from 'node:crypto';
import type { Server as SocketIOServer } from 'socket.io';
import { and, eq, inArray, ne } from 'drizzle-orm';
import { db } from '@/db';
import {
  orders,
  outlets,
  paymentAttempts,
  payments,
  paymentSplits,
  tables,
} from '@/db/schema';
import { roundCurrency } from '@/lib/billing';
import { normalizeOutletSettings } from '@/lib/outlet-config';
import type {
  PaymentMethodCode,
  PaymentProviderCode,
} from '@/types';
import {
  getPaymentsDefaultProvider,
  isPaymentMethodCode,
  isPaymentProviderCode,
  normalizeCurrency,
} from './config';
import { getPaymentProvider } from './registry';
import type {
  CreatePaymentSessionResult,
  JsonMap,
  ManualPaymentResult,
  PaymentWebhookEvent,
  PaymentWebhookProcessingResult,
} from './types';
import { PaymentServiceError } from './types';

type OrderRow = typeof orders.$inferSelect;
type OutletRow = typeof outlets.$inferSelect;
type PaymentAttemptRow = typeof paymentAttempts.$inferSelect;

type CreateOrderPaymentSessionInput = {
  orderId: string;
  outletId: string;
  cashierId: string | null;
  provider?: PaymentProviderCode;
  paymentMethod?: PaymentMethodCode;
  returnUrl?: string | null;
};

type CollectManualPaymentInput = {
  orderId: string;
  outletId: string;
  cashierId: string;
  paymentMethod: PaymentMethodCode;
  amountPaid?: number;
  reference?: string | null;
  transactionId?: string | null;
};

type SettleOrderPaymentInput = {
  paymentAttemptId: string;
  cashierId?: string | null;
};

const PAYMENT_SESSION_SUCCESS_STATUSES = new Set(['succeeded']);
const OPEN_TABLE_ORDER_STATUSES = ['active', 'billed'] as const;

function normalizeOptionalText(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toSafeNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toJsonMap(value: unknown): JsonMap | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? ({ ...(value as JsonMap) } satisfies JsonMap)
    : null;
}

async function findOrderForOutlet(orderId: string, outletId: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.outletId, outletId)),
  });
}

async function findOutletForId(outletId: string) {
  return db.query.outlets.findFirst({
    where: eq(outlets.id, outletId),
  });
}

function ensureOrderPayable(order: OrderRow | undefined): asserts order is OrderRow {
  if (!order) {
    throw new PaymentServiceError(404, 'Order not found');
  }

  if (order.status === 'paid') {
    throw new PaymentServiceError(409, 'This order has already been paid.');
  }

  if (order.status === 'cancelled' || order.status === 'void') {
    throw new PaymentServiceError(
      409,
      `Cannot collect payment for a ${order.status} order.`,
    );
  }
}

function resolveProviderSettings({
  outlet,
  requestedProvider,
  requestedMethod,
}: {
  outlet: OutletRow;
  requestedProvider?: PaymentProviderCode;
  requestedMethod?: PaymentMethodCode;
}) {
  const normalizedSettings = normalizeOutletSettings(outlet.settings);
  const providerCandidates = requestedProvider
    ? [requestedProvider]
    : [
        normalizedSettings.payments.defaultProvider,
        getPaymentsDefaultProvider(),
        'manual' satisfies PaymentProviderCode,
      ];

  let provider: PaymentProviderCode | null = null;

  for (const candidate of providerCandidates) {
    if (
      isPaymentProviderCode(candidate) &&
      normalizedSettings.payments.providers[candidate]?.enabled
    ) {
      provider = candidate;
      break;
    }
  }

  if (!provider) {
    throw new PaymentServiceError(
      400,
      requestedProvider
        ? `Payment provider "${requestedProvider}" is not enabled for this outlet.`
        : 'No enabled payment provider is configured for this outlet.',
    );
  }

  const providerSettings = normalizedSettings.payments.providers[provider];

  if (!providerSettings.enabled) {
    throw new PaymentServiceError(
      400,
      `Payment provider "${provider}" is not enabled for this outlet.`,
    );
  }

  const paymentMethod = requestedMethod ?? providerSettings.supportedMethods[0] ?? 'cash';

  if (!providerSettings.supportedMethods.includes(paymentMethod)) {
    throw new PaymentServiceError(
      400,
      `Payment method "${paymentMethod}" is not supported by ${providerSettings.displayName}.`,
      {
        provider,
        supportedMethods: providerSettings.supportedMethods,
      },
    );
  }

  return {
    provider,
    paymentMethod,
    providerSettings,
    currency: normalizeCurrency(outlet.currency, 'INR'),
    outletName: outlet.name,
  };
}

function createPaymentAttemptRow({
  paymentAttemptId,
  order,
  cashierId,
  provider,
  paymentMethod,
  amount,
  currency,
  reference,
  transactionId,
  providerSessionId,
  metadata,
  requestPayload,
  responsePayload,
  completedAt,
  status,
}: {
  paymentAttemptId: string;
  order: OrderRow;
  cashierId: string | null;
  provider: PaymentProviderCode;
  paymentMethod: PaymentMethodCode;
  amount: number;
  currency: string;
  reference?: string | null;
  transactionId?: string | null;
  providerSessionId?: string | null;
  metadata?: JsonMap | null;
  requestPayload?: JsonMap | null;
  responsePayload?: JsonMap | null;
  completedAt?: string | null;
  status: PaymentAttemptRow['status'];
}) {
  return db
    .insert(paymentAttempts)
    .values({
      id: paymentAttemptId,
      outletId: order.outletId,
      orderId: order.id,
      cashierId,
      provider,
      paymentMethod,
      status,
      amount,
      currency,
      reference: reference ?? null,
      transactionId: transactionId ?? null,
      providerSessionId: providerSessionId ?? null,
      metadata: metadata ?? null,
      requestPayload: requestPayload ?? null,
      responsePayload: responsePayload ?? null,
      completedAt: completedAt ?? null,
    })
    .returning()
    .get();
}

function updatePaymentAttemptRow(
  paymentAttemptId: string,
  values: Partial<typeof paymentAttempts.$inferInsert>,
) {
  return db
    .update(paymentAttempts)
    .set({
      ...values,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(paymentAttempts.id, paymentAttemptId))
    .returning()
    .get();
}

async function findPaymentAttemptForEvent(event: PaymentWebhookEvent) {
  const fields: Array<{
    column:
      | typeof paymentAttempts.id
      | typeof paymentAttempts.providerPaymentId
      | typeof paymentAttempts.providerOrderId
      | typeof paymentAttempts.providerSessionId;
    value: string | null | undefined;
  }> = [
    { column: paymentAttempts.id, value: event.paymentAttemptId },
    { column: paymentAttempts.providerPaymentId, value: event.providerPaymentId },
    { column: paymentAttempts.providerOrderId, value: event.providerOrderId },
    { column: paymentAttempts.providerSessionId, value: event.providerSessionId },
  ];

  for (const field of fields) {
    if (!field.value) {
      continue;
    }

    const attempt = await db.query.paymentAttempts.findFirst({
      where: and(eq(paymentAttempts.provider, event.provider), eq(field.column, field.value)),
    });

    if (attempt) {
      return attempt;
    }
  }

  return null;
}

function emitTableAvailabilityUpdate(outletId: string, tableId: string) {
  const io = (globalThis as typeof globalThis & { io?: SocketIOServer }).io;

  if (!io) {
    return;
  }

  io.to(`outlet:${outletId}`).emit('table:updated', {
    tableId,
    status: 'available',
  });
}

function toPaymentServiceError(
  error: unknown,
  fallbackMessage = 'Payment provider request failed.',
) {
  if (error instanceof PaymentServiceError) {
    return error;
  }

  if (error instanceof Error) {
    return new PaymentServiceError(502, error.message || fallbackMessage);
  }

  return new PaymentServiceError(502, fallbackMessage);
}

async function settleOrderPayment({
  paymentAttemptId,
  cashierId,
}: SettleOrderPaymentInput): Promise<
  ManualPaymentResult & {
    tableReleased: boolean;
    tableId: string | null;
  }
> {
  const paymentAttempt = await db.query.paymentAttempts.findFirst({
    where: eq(paymentAttempts.id, paymentAttemptId),
  });

  if (!paymentAttempt) {
    throw new PaymentServiceError(404, 'Payment attempt not found.');
  }

  if (!paymentAttempt.orderId) {
    throw new PaymentServiceError(409, 'Payment attempt is not linked to an order.');
  }

  const paymentMethod = isPaymentMethodCode(paymentAttempt.paymentMethod)
    ? paymentAttempt.paymentMethod
    : 'cash';
  const orderId = paymentAttempt.orderId;
  const metadata = toJsonMap(paymentAttempt.metadata);
  const changeAmount = roundCurrency(Math.max(0, toSafeNumber(metadata?.changeAmount, 0)));
  const settledAt = paymentAttempt.completedAt ?? new Date().toISOString();

  const result = db.transaction((tx) => {
    const currentOrder = tx
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1)
      .get();

    if (!currentOrder) {
      throw new PaymentServiceError(404, 'Order not found.');
    }

    if (currentOrder.status === 'cancelled' || currentOrder.status === 'void') {
      throw new PaymentServiceError(
        409,
        `Cannot settle payment for a ${currentOrder.status} order.`,
      );
    }

    const currentOutletId = currentOrder.outletId ?? paymentAttempt.outletId;

    if (!currentOutletId) {
      throw new PaymentServiceError(500, 'Order is missing an outlet reference.');
    }

    tx
      .update(paymentAttempts)
      .set({
        cashierId: paymentAttempt.cashierId ?? cashierId ?? currentOrder.cashierId ?? null,
        status: 'succeeded',
        completedAt: settledAt,
        updatedAt: settledAt,
      })
      .where(eq(paymentAttempts.id, paymentAttempt.id))
      .run();

    let paymentRecord = tx
      .select()
      .from(payments)
      .where(eq(payments.orderId, currentOrder.id))
      .limit(1)
      .get();

    if (!paymentRecord) {
      const paymentId = randomUUID();

      paymentRecord = tx
        .insert(payments)
        .values({
          id: paymentId,
          orderId: currentOrder.id,
          cashierId: paymentAttempt.cashierId ?? cashierId ?? currentOrder.cashierId ?? null,
          totalAmount: roundCurrency(Number(currentOrder.totalAmount ?? 0)),
          changeAmount,
        })
        .returning()
        .get();
    }

    const existingSplit = tx
      .select({ id: paymentSplits.id })
      .from(paymentSplits)
      .where(eq(paymentSplits.paymentId, paymentRecord.id))
      .limit(1)
      .get();

    if (!existingSplit) {
      tx
        .insert(paymentSplits)
        .values({
          id: randomUUID(),
          paymentId: paymentRecord.id,
          method: paymentMethod,
          amount: roundCurrency(Number(currentOrder.totalAmount ?? 0)),
          reference: paymentAttempt.reference,
          transactionId: paymentAttempt.transactionId,
        })
        .run();
    }

    const orderAlreadyPaid = currentOrder.status === 'paid';
    const settledOrder = orderAlreadyPaid
      ? currentOrder
      : tx
          .update(orders)
          .set({
            status: 'paid',
            cashierId: paymentAttempt.cashierId ?? cashierId ?? currentOrder.cashierId ?? null,
            billedAt: currentOrder.billedAt ?? settledAt,
            paidAt: settledAt,
          })
          .where(eq(orders.id, currentOrder.id))
          .returning()
          .get();

    let tableReleased = false;

    if (currentOrder.tableId) {
      const remainingOpenOrder = tx
        .select({ id: orders.id })
        .from(orders)
        .where(
          and(
            eq(orders.tableId, currentOrder.tableId),
            eq(orders.outletId, currentOutletId),
            ne(orders.id, currentOrder.id),
            inArray(orders.status, OPEN_TABLE_ORDER_STATUSES),
          ),
        )
        .limit(1)
        .get();

      const tableRecord = tx
        .select({ status: tables.status })
        .from(tables)
        .where(and(eq(tables.id, currentOrder.tableId), eq(tables.outletId, currentOutletId)))
        .limit(1)
        .get();

      if (!remainingOpenOrder && tableRecord && tableRecord.status !== 'available') {
        tx
          .update(tables)
          .set({ status: 'available' })
          .where(and(eq(tables.id, currentOrder.tableId), eq(tables.outletId, currentOutletId)))
          .run();
        tableReleased = true;
      }
    }

    return {
      order: settledOrder,
      paymentId: paymentRecord.id,
      paymentAttemptId: paymentAttempt.id,
      changeAmount,
      tableReleased,
      tableId: currentOrder.tableId ?? null,
      outletId: currentOutletId,
    };
  });

  if (result.tableReleased && result.tableId) {
    emitTableAvailabilityUpdate(result.outletId, result.tableId);
  }

  return {
    order: result.order,
    paymentId: result.paymentId,
    paymentAttemptId: result.paymentAttemptId,
    changeAmount: result.changeAmount,
    tableReleased: result.tableReleased,
    tableId: result.tableId,
  };
}

export async function createOrderPaymentSession({
  orderId,
  outletId,
  cashierId,
  provider: requestedProvider,
  paymentMethod: requestedMethod,
  returnUrl,
}: CreateOrderPaymentSessionInput): Promise<CreatePaymentSessionResult> {
  const order = await findOrderForOutlet(orderId, outletId);
  ensureOrderPayable(order);

  const outlet = await findOutletForId(outletId);

  if (!outlet) {
    throw new PaymentServiceError(404, 'Outlet not found.');
  }

  const resolved = resolveProviderSettings({
    outlet,
    requestedProvider,
    requestedMethod,
  });
  const amount = roundCurrency(Number(order.totalAmount ?? 0));
  const paymentAttemptId = randomUUID();

  createPaymentAttemptRow({
    paymentAttemptId,
    order,
    cashierId,
    provider: resolved.provider,
    paymentMethod: resolved.paymentMethod,
    amount,
    currency: resolved.currency,
    requestPayload: {
      returnUrl: normalizeOptionalText(returnUrl),
    },
    status: 'created',
  });

  try {
    const providerResponse = await getPaymentProvider(resolved.provider).createPaymentSession({
      paymentAttemptId,
      orderId: order.id,
      outletId,
      cashierId,
      amount,
      currency: resolved.currency,
      paymentMethod: resolved.paymentMethod,
      returnUrl: normalizeOptionalText(returnUrl),
      outletName: resolved.outletName,
      providerSettings: resolved.providerSettings,
    });

    const updatedAttempt = updatePaymentAttemptRow(paymentAttemptId, {
      status: providerResponse.status,
      reference: normalizeOptionalText(providerResponse.reference),
      transactionId: normalizeOptionalText(providerResponse.transactionId),
      providerOrderId: normalizeOptionalText(providerResponse.providerOrderId),
      providerPaymentId: normalizeOptionalText(providerResponse.providerPaymentId),
      providerSignature: normalizeOptionalText(providerResponse.providerSignature),
      providerSessionId: normalizeOptionalText(providerResponse.providerSessionId),
      requestPayload: providerResponse.requestPayload ?? null,
      responsePayload: providerResponse.responsePayload ?? providerResponse.checkout ?? null,
      completedAt: PAYMENT_SESSION_SUCCESS_STATUSES.has(providerResponse.status)
        ? new Date().toISOString()
        : null,
    });

    if (providerResponse.status === 'succeeded') {
      await settleOrderPayment({ paymentAttemptId: updatedAttempt.id, cashierId });
    }

    return {
      paymentAttemptId: updatedAttempt.id,
      provider: resolved.provider,
      paymentMethod: resolved.paymentMethod,
      status: providerResponse.status,
      amount,
      currency: resolved.currency,
      checkout: providerResponse.checkout ?? null,
      reference: updatedAttempt.reference,
      transactionId: updatedAttempt.transactionId,
    };
  } catch (error) {
    const serviceError = toPaymentServiceError(error);

    updatePaymentAttemptRow(paymentAttemptId, {
      status: 'failed',
      errorMessage: serviceError.message,
      responsePayload: serviceError.details ?? null,
    });

    throw serviceError;
  }
}

export async function collectManualPayment({
  orderId,
  outletId,
  cashierId,
  paymentMethod,
  amountPaid,
  reference,
  transactionId,
}: CollectManualPaymentInput): Promise<ManualPaymentResult> {
  const order = await findOrderForOutlet(orderId, outletId);
  ensureOrderPayable(order);

  const outlet = await findOutletForId(outletId);

  if (!outlet) {
    throw new PaymentServiceError(404, 'Outlet not found.');
  }

  const resolved = resolveProviderSettings({
    outlet,
    requestedProvider: 'manual',
    requestedMethod: paymentMethod,
  });
  const amountDue = roundCurrency(Number(order.totalAmount ?? 0));
  const normalizedAmountPaid =
    paymentMethod === 'complimentary'
      ? 0
      : roundCurrency(Math.max(0, toSafeNumber(amountPaid, amountDue)));

  if (paymentMethod !== 'complimentary' && normalizedAmountPaid < amountDue) {
    throw new PaymentServiceError(400, 'Amount paid must cover the full bill in demo mode.');
  }

  const changeAmount =
    paymentMethod === 'complimentary'
      ? 0
      : roundCurrency(Math.max(0, normalizedAmountPaid - amountDue));
  const settledAt = new Date().toISOString();
  const paymentAttemptId = randomUUID();

  createPaymentAttemptRow({
    paymentAttemptId,
    order,
    cashierId,
    provider: resolved.provider,
    paymentMethod,
    amount: amountDue,
    currency: resolved.currency,
    reference: normalizeOptionalText(reference),
    transactionId: normalizeOptionalText(transactionId),
    providerSessionId: paymentAttemptId,
    metadata: {
      amountPaid: normalizedAmountPaid,
      changeAmount,
    },
    requestPayload: {
      amountPaid: normalizedAmountPaid,
      paymentMethod,
      reference: normalizeOptionalText(reference),
      transactionId: normalizeOptionalText(transactionId),
    },
    responsePayload: {
      mode: 'manual',
      paymentAttemptId,
      settledAt,
    },
    completedAt: settledAt,
    status: 'succeeded',
  });

  const result = await settleOrderPayment({ paymentAttemptId, cashierId });

  return {
    order: result.order,
    paymentId: result.paymentId,
    paymentAttemptId: result.paymentAttemptId,
    changeAmount: result.changeAmount,
  };
}

export async function processPaymentWebhook(
  provider: PaymentProviderCode,
  rawBody: string,
  headers: Headers,
): Promise<PaymentWebhookProcessingResult> {
  const adapter = getPaymentProvider(provider);

  if (!adapter.parseWebhook) {
    return { handled: false };
  }

  const event = await adapter.parseWebhook({ rawBody, headers });

  if (!event) {
    return { handled: false };
  }

  const paymentAttempt = await findPaymentAttemptForEvent(event);

  if (!paymentAttempt) {
    return { handled: false };
  }

  const updatedAttempt = updatePaymentAttemptRow(paymentAttempt.id, {
    status: event.status,
    reference: normalizeOptionalText(event.reference) ?? paymentAttempt.reference,
    transactionId:
      normalizeOptionalText(event.transactionId) ?? paymentAttempt.transactionId,
    providerOrderId:
      normalizeOptionalText(event.providerOrderId) ?? paymentAttempt.providerOrderId,
    providerPaymentId:
      normalizeOptionalText(event.providerPaymentId) ?? paymentAttempt.providerPaymentId,
    providerSignature:
      normalizeOptionalText(event.providerSignature) ?? paymentAttempt.providerSignature,
    providerSessionId:
      normalizeOptionalText(event.providerSessionId) ?? paymentAttempt.providerSessionId,
    errorCode: normalizeOptionalText(event.errorCode) ?? paymentAttempt.errorCode,
    errorMessage: normalizeOptionalText(event.errorMessage) ?? paymentAttempt.errorMessage,
    metadata: event.metadata ?? paymentAttempt.metadata ?? null,
    requestPayload: event.requestPayload ?? paymentAttempt.requestPayload ?? null,
    responsePayload: event.responsePayload ?? paymentAttempt.responsePayload ?? null,
    completedAt:
      normalizeOptionalText(event.completedAt) ??
      (event.status === 'succeeded'
        ? paymentAttempt.completedAt ?? new Date().toISOString()
        : paymentAttempt.completedAt),
  });

  if (event.status === 'succeeded') {
    await settleOrderPayment({
      paymentAttemptId: updatedAttempt.id,
      cashierId: updatedAttempt.cashierId ?? null,
    });
  }

  return {
    handled: true,
    paymentAttemptId: updatedAttempt.id,
    status: event.status,
  };
}
