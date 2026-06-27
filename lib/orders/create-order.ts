import { randomUUID } from 'node:crypto';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  customers,
  kotItems,
  kots,
  menuItemVariants,
  menuItems,
  orderItems,
  orders,
  outlets,
  tables,
} from '@/db/schema';
import { calculateBillPreview, roundCurrency } from '@/lib/billing';
import { normalizeOutletSettings } from '@/lib/outlet-config';

const ORDER_TYPES = new Set(['dine_in', 'takeaway', 'delivery', 'online']);

type RawModifier = {
  modifierId?: unknown;
  modifierName?: unknown;
  id?: unknown;
  name?: unknown;
  priceDelta?: unknown;
};

export type SanitizedModifier = {
  modifierId: string;
  modifierName: string;
  priceDelta: number;
};

type SanitizedCartItem = {
  id: string;
  itemId: string;
  variantId: string | null;
  itemName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
  modifierSummary: SanitizedModifier[];
  itemNote: string | null;
};

type PreparedKotItem = {
  id: string;
  kotId: string;
  orderItemId: string;
  itemName: string;
  quantity: number;
  modifiers: SanitizedModifier[];
  itemNote: string | null;
  status: 'pending';
};

export class OrderCreationError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'OrderCreationError';
  }
}

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toSafeNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeModifiers = (value: unknown) => {
  if (!Array.isArray(value)) return [] as SanitizedModifier[];

  return value.reduce<SanitizedModifier[]>((acc, modifier) => {
    const rawModifier = modifier as RawModifier;
    const modifierId =
      normalizeOptionalText(rawModifier.modifierId) ?? normalizeOptionalText(rawModifier.id);
    const modifierName =
      normalizeOptionalText(rawModifier.modifierName) ?? normalizeOptionalText(rawModifier.name);

    if (!modifierId || !modifierName) {
      return acc;
    }

    acc.push({
      modifierId,
      modifierName,
      priceDelta: roundCurrency(Math.max(0, toSafeNumber(rawModifier.priceDelta))),
    });

    return acc;
  }, []);
};

const generateOrderNumber = () => {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(2, 10);
  return `ORD-${stamp}-${Math.floor(100 + Math.random() * 900)}`;
};

const generateKotNumber = () => `KOT-${Math.floor(100 + Math.random() * 900)}`;

export async function createOrder({
  outletId,
  waiterId,
  payload,
}: {
  outletId: string;
  waiterId: string | null;
  payload: unknown;
}) {
  const body = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {};
  const tableId = normalizeOptionalText(body.tableId);
  const customerId = normalizeOptionalText(body.customerId);
  const requestedOrderType = normalizeOptionalText(body.orderType);
  const paxCount = Math.max(1, Math.min(20, Math.trunc(toSafeNumber(body.paxCount, 1))));
  const requestedDiscount = roundCurrency(Math.max(0, toSafeNumber(body.discountAmount)));
  const specialInstructions = normalizeOptionalText(body.specialInstructions);
  const items: unknown[] = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    throw new OrderCreationError(400, 'Add at least one item before creating an order.');
  }

  const outlet = await db.query.outlets.findFirst({
    where: eq(outlets.id, outletId),
  });

  if (!outlet) {
    throw new OrderCreationError(404, 'Outlet not found.');
  }

  const outletSettings = normalizeOutletSettings(outlet.settings);
  const enabledOrderTypes = new Set(outletSettings.serviceModes);
  const fallbackOrderType = enabledOrderTypes.has('dine_in')
    ? 'dine_in'
    : outletSettings.serviceModes[0] ?? 'dine_in';
  const orderType =
    requestedOrderType &&
    ORDER_TYPES.has(requestedOrderType) &&
    enabledOrderTypes.has(requestedOrderType as typeof outletSettings.serviceModes[number])
      ? requestedOrderType
      : fallbackOrderType;

  let selectedTable: typeof tables.$inferSelect | null = null;
  if (tableId) {
    selectedTable =
      (await db.query.tables.findFirst({
        where: and(eq(tables.id, tableId), eq(tables.outletId, outletId)),
      })) ?? null;

    if (!selectedTable) {
      throw new OrderCreationError(400, 'Selected table was not found.');
    }

    if (selectedTable.status === 'inactive' || selectedTable.status === 'dirty') {
      throw new OrderCreationError(409, `Table ${selectedTable.name} is not ready for a new order.`);
    }
  }

  if (customerId) {
    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.id, customerId), eq(customers.outletId, outletId)),
    });

    if (!customer) {
      throw new OrderCreationError(400, 'Selected customer was not found.');
    }
  }

  const requestedItemIds = Array.from(
    new Set(
      items
        .map((item: unknown) => normalizeOptionalText((item as Record<string, unknown>)?.itemId))
        .filter((itemId): itemId is string => Boolean(itemId)),
    ),
  );

  if (requestedItemIds.length !== items.length) {
    throw new OrderCreationError(400, 'Each order line must reference a menu item.');
  }

  const menuRecords = await db.query.menuItems.findMany({
    where: and(eq(menuItems.outletId, outletId), inArray(menuItems.id, requestedItemIds)),
  });
  const menuRecordMap = new Map(menuRecords.map((item) => [item.id, item]));

  if (menuRecordMap.size !== requestedItemIds.length) {
    throw new OrderCreationError(400, 'One or more selected items are unavailable.');
  }

  const requestedVariantIds = Array.from(
    new Set(
      items
        .map((item: unknown) => normalizeOptionalText((item as Record<string, unknown>)?.variantId))
        .filter((variantId): variantId is string => Boolean(variantId)),
    ),
  );

  const variantRecords = requestedVariantIds.length
    ? await db.query.menuItemVariants.findMany({
        where: inArray(menuItemVariants.id, requestedVariantIds),
      })
    : [];
  const variantRecordMap = new Map(variantRecords.map((variant) => [variant.id, variant]));

  if (requestedVariantIds.length !== variantRecordMap.size) {
    throw new OrderCreationError(400, 'One or more selected item variants are unavailable.');
  }

  const sanitizedItems = items.reduce<SanitizedCartItem[]>((acc, item: unknown) => {
    const rawItem = item as Record<string, unknown>;
    const itemId = normalizeOptionalText(rawItem.itemId);

    if (!itemId) {
      return acc;
    }

    const menuItemRecord = menuRecordMap.get(itemId);
    if (!menuItemRecord || !menuItemRecord.isActive) {
      return acc;
    }

    const variantId = normalizeOptionalText(rawItem.variantId);
    const variantRecord = variantId ? variantRecordMap.get(variantId) : null;
    if (variantId && (!variantRecord || variantRecord.itemId !== itemId || !variantRecord.isActive)) {
      return acc;
    }

    const quantity = Math.max(1, Math.trunc(toSafeNumber(rawItem.quantity, 1)));
    const modifierSummary = sanitizeModifiers(rawItem.modifiers);
    const modifierTotal = roundCurrency(
      modifierSummary.reduce((sum, modifier) => sum + modifier.priceDelta, 0),
    );
    const baseUnitPrice = variantRecord ? Number(variantRecord.price) : Number(menuItemRecord.basePrice);
    const unitPrice = roundCurrency(baseUnitPrice + modifierTotal);

    acc.push({
      id: randomUUID(),
      itemId,
      variantId: variantRecord?.id ?? null,
      itemName: menuItemRecord.name,
      variantName: variantRecord?.name ?? null,
      quantity,
      unitPrice,
      itemTotal: roundCurrency(unitPrice * quantity),
      modifierSummary,
      itemNote: normalizeOptionalText(rawItem.itemNote),
    });

    return acc;
  }, []);

  if (sanitizedItems.length !== items.length) {
    throw new OrderCreationError(400, 'Some items in the cart are invalid or no longer available.');
  }

  const subtotal = roundCurrency(sanitizedItems.reduce((sum, item) => sum + item.itemTotal, 0));
  const bill = calculateBillPreview({
    subtotal,
    discountAmount: requestedDiscount,
    taxRate: outletSettings.taxRate,
    serviceChargeRate: outletSettings.serviceCharge,
    applyTaxOnServiceCharge: outletSettings.applyTaxOnServiceCharge,
    roundOffStrategy: outletSettings.roundOffStrategy,
  });

  const orderId = randomUUID();
  const orderNumber = generateOrderNumber();
  const kotId = randomUUID();
  const kotNumber = generateKotNumber();
  const preparedKotItems: PreparedKotItem[] = sanitizedItems.map((item) => ({
    id: randomUUID(),
    kotId,
    orderItemId: item.id,
    itemName: item.itemName,
    quantity: item.quantity,
    modifiers: item.modifierSummary,
    itemNote: item.itemNote,
    status: 'pending',
  }));

  const [order] = db.transaction((tx) => {
    const insertedOrders = tx
      .insert(orders)
      .values({
        id: orderId,
        outletId,
        tableId,
        customerId,
        waiterId,
        orderNumber,
        orderType,
        paxCount,
        subtotal: bill.subtotal,
        discountAmount: bill.discountAmount,
        taxAmount: bill.taxAmount,
        serviceCharge: bill.serviceChargeAmount,
        totalAmount: bill.totalAmount,
        specialInstructions,
        status: 'active',
      })
      .returning()
      .all();

    tx
      .insert(orderItems)
      .values(
        sanitizedItems.map((item) => ({
          id: item.id,
          orderId,
          itemId: item.itemId,
          variantId: item.variantId,
          itemName: item.itemName,
          variantName: item.variantName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          itemTotal: item.itemTotal,
          modifierSummary: item.modifierSummary,
          itemNote: item.itemNote,
        })),
      )
      .run();

    tx
      .insert(kots)
      .values({
        id: kotId,
        orderId,
        kotNumber,
        status: 'pending',
      })
      .run();

    tx.insert(kotItems).values(preparedKotItems).run();

    if (customerId) {
      tx
        .update(customers)
        .set({
          totalVisits: sql`coalesce(${customers.totalVisits}, 0) + 1`,
          totalSpend: sql`coalesce(${customers.totalSpend}, 0) + ${bill.totalAmount}`,
        })
        .where(and(eq(customers.id, customerId), eq(customers.outletId, outletId)))
        .run();
    }

    if (tableId) {
      tx
        .update(tables)
        .set({ status: 'occupied' })
        .where(and(eq(tables.id, tableId), eq(tables.outletId, outletId)))
        .run();
    }

    return insertedOrders;
  });

  const io = (global as typeof globalThis & { io?: { to: (room: string) => { emit: (event: string, payload: unknown) => void } } }).io;
  if (io) {
    io.to(`kitchen:${outletId}`).emit('kot:new', {
      id: kotId,
      orderId,
      kotNumber,
      status: 'pending',
      items: preparedKotItems,
      table: selectedTable ? { id: selectedTable.id, name: selectedTable.name } : null,
      orderType,
      totalAmount: bill.totalAmount,
      createdAt: new Date().toISOString(),
    });

    if (tableId) {
      io.to(`outlet:${outletId}`).emit('table:updated', {
        tableId,
        status: 'occupied',
        currentOrderId: orderId,
      });
    }
  }

  return order;
}
