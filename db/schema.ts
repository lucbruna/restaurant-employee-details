import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  pinHash: text('pin_hash').notNull(),
  roleId: text('role_id').references(() => roles.id),
  outletId: text('outlet_id').references(() => outlets.id),
  avatarUrl: text('avatar_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const roles = sqliteTable('roles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // owner/manager/cashier/waiter/kitchen
  permissions: text('permissions', { mode: 'json' }).$type<string[]>(),
});

export const outlets = sqliteTable('outlets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  gstin: text('gstin'),
  fssaiNumber: text('fssai_number'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  currency: text('currency').default('INR'),
  timezone: text('timezone').default('Asia/Kolkata'),
  settings: text('settings', { mode: 'json' }),
});

export const tableSections = sqliteTable('table_sections', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  floorNumber: integer('floor_number'),
  displayOrder: integer('display_order').default(0),
});

export const tables = sqliteTable('tables', {
  id: text('id').primaryKey(),
  sectionId: text('section_id').references(() => tableSections.id),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  capacity: integer('capacity').default(2),
  shape: text('shape').default('rectangle'), // circle/rectangle/square
  status: text('status').default('available'), // available/occupied/reserved/dirty/inactive
  positionX: integer('position_x').default(0),
  positionY: integer('position_y').default(0),
  width: integer('width').default(100),
  height: integer('height').default(100),
});

export const menuCategories = sqliteTable('menu_categories', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  emoji: text('emoji'),
  imageUrl: text('image_url'),
  displayOrder: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  availableFrom: text('available_from'),
  availableUntil: text('available_until'),
});

export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),
  categoryId: text('category_id').references(() => menuCategories.id),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  description: text('description'),
  shortCode: text('short_code'),
  imageUrl: text('image_url'),
  basePrice: real('base_price').notNull(),
  foodType: text('food_type').default('veg'), // veg/non_veg/vegan/egg
  taxCategoryId: text('tax_category_id').references(() => taxCategories.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isBestseller: integer('is_bestseller', { mode: 'boolean' }).default(false),
  isChefsSpecial: integer('is_chefs_special', { mode: 'boolean' }).default(false),
  spiceLevel: integer('spice_level').default(0), // 0-5
  prepTimeMinutes: integer('prep_time_minutes').default(15),
  displayOrder: integer('display_order').default(0),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
});

export const modifierGroups = sqliteTable('modifier_groups', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  selectionType: text('selection_type').default('single'), // single/multiple
  minSelections: integer('min_selections').default(0),
  maxSelections: integer('max_selections').default(1),
  isRequired: integer('is_required', { mode: 'boolean' }).default(false),
  displayOrder: integer('display_order').default(0),
});

export const itemModifierGroups = sqliteTable('item_modifier_groups', {
  itemId: text('item_id').references(() => menuItems.id),
  groupId: text('group_id').references(() => modifierGroups.id),
  displayOrder: integer('display_order').default(0),
});

export const modifiers = sqliteTable('modifiers', {
  id: text('id').primaryKey(),
  groupId: text('group_id').references(() => modifierGroups.id),
  name: text('name').notNull(),
  priceDelta: real('price_delta').default(0),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  displayOrder: integer('display_order').default(0),
});

export const menuItemVariants = sqliteTable('menu_item_variants', {
  id: text('id').primaryKey(),
  itemId: text('item_id').references(() => menuItems.id),
  name: text('name').notNull(), // Half/Full/Small/Large
  price: real('price').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const taxCategories = sqliteTable('tax_categories', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  cgstRate: real('cgst_rate').default(0),
  sgstRate: real('sgst_rate').default(0),
  igstRate: real('igst_rate').default(0),
  isServiceCharge: integer('is_service_charge', { mode: 'boolean' }).default(false),
});

export const discounts = sqliteTable('discounts', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  type: text('type').default('percent'), // flat/percent
  value: real('value').notNull(),
  minOrderAmount: real('min_order_amount').default(0),
  maxDiscountAmount: real('max_discount_amount'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  validFrom: text('valid_from'),
  validUntil: text('valid_until'),
});

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  code: text('code').notNull(),
  discountId: text('discount_id').references(() => discounts.id),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  gstin: text('gstin'),
  dob: text('dob'),
  anniversary: text('anniversary'),
  loyaltyPoints: integer('loyalty_points').default(0),
  totalVisits: integer('total_visits').default(0),
  totalSpend: real('total_spend').default(0),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const loyaltyTransactions = sqliteTable('loyalty_transactions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id),
  orderId: text('order_id'), // Can't strictly reference orders if created before order is finalized, but usually does
  pointsDelta: integer('points_delta').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  reason: text('reason'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  tableId: text('table_id').references(() => tables.id),
  customerId: text('customer_id').references(() => customers.id),
  waiterId: text('waiter_id').references(() => users.id),
  cashierId: text('cashier_id').references(() => users.id),
  orderNumber: text('order_number').notNull(),
  orderType: text('order_type').default('dine_in'), // dine_in/takeaway/delivery/online
  status: text('status').default('active'), // draft/active/billed/paid/cancelled/void
  paxCount: integer('pax_count').default(1),
  subtotal: real('subtotal').default(0),
  discountAmount: real('discount_amount').default(0),
  taxAmount: real('tax_amount').default(0),
  serviceCharge: real('service_charge').default(0),
  totalAmount: real('total_amount').default(0),
  specialInstructions: text('special_instructions'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  billedAt: text('billed_at'),
  paidAt: text('paid_at'),
  cancelledAt: text('cancelled_at'),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  itemId: text('item_id').references(() => menuItems.id),
  variantId: text('variant_id').references(() => menuItemVariants.id),
  itemName: text('item_name').notNull(),
  variantName: text('variant_name'),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  modifierSummary: text('modifier_summary', { mode: 'json' }),
  itemTotal: real('item_total').notNull(),
  itemNote: text('item_note'),
  isVoid: integer('is_void', { mode: 'boolean' }).default(false),
  voidReason: text('void_reason'),
  sentToKitchenAt: text('sent_to_kitchen_at'),
  servedAt: text('served_at'),
});

export const orderItemModifiers = sqliteTable('order_item_modifiers', {
  id: text('id').primaryKey(),
  orderItemId: text('order_item_id').references(() => orderItems.id),
  modifierId: text('modifier_id').references(() => modifiers.id),
  modifierName: text('modifier_name').notNull(),
  priceDelta: real('price_delta').default(0),
});

export const kots = sqliteTable('kots', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  kotNumber: text('kot_number').notNull(),
  status: text('status').default('pending'), // pending/preparing/ready/served/cancelled
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  startedAt: text('started_at'),
  readyAt: text('ready_at'),
  servedAt: text('served_at'),
});

export const kotItems = sqliteTable('kot_items', {
  id: text('id').primaryKey(),
  kotId: text('kot_id').references(() => kots.id),
  orderItemId: text('order_item_id').references(() => orderItems.id),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  modifiers: text('modifiers', { mode: 'json' }),
  itemNote: text('item_note'),
  status: text('status').default('pending'), // pending/preparing/ready/served
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').references(() => orders.id),
  cashierId: text('cashier_id').references(() => users.id),
  totalAmount: real('total_amount').notNull(),
  changeAmount: real('change_amount').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const paymentAttempts = sqliteTable('payment_attempts', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  orderId: text('order_id').references(() => orders.id),
  cashierId: text('cashier_id').references(() => users.id),
  provider: text('provider').notNull(),
  paymentMethod: text('payment_method').notNull(),
  status: text('status').default('created'),
  amount: real('amount').notNull(),
  currency: text('currency').default('INR'),
  reference: text('reference'),
  transactionId: text('transaction_id'),
  providerOrderId: text('provider_order_id'),
  providerPaymentId: text('provider_payment_id'),
  providerSignature: text('provider_signature'),
  providerSessionId: text('provider_session_id'),
  requestPayload: text('request_payload', { mode: 'json' }),
  responsePayload: text('response_payload', { mode: 'json' }),
  metadata: text('metadata', { mode: 'json' }),
  errorCode: text('error_code'),
  errorMessage: text('error_message'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const paymentSplits = sqliteTable('payment_splits', {
  id: text('id').primaryKey(),
  paymentId: text('payment_id').references(() => payments.id),
  method: text('method').notNull(), // cash/card/upi/wallet/complimentary
  amount: real('amount').notNull(),
  reference: text('reference'),
  transactionId: text('transaction_id'),
});

export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  unit: text('unit').notNull(), // kg/g/L/ml/piece/dozen
  currentStock: real('current_stock').default(0),
  minThreshold: real('min_threshold').default(0),
  costPerUnit: real('cost_per_unit').default(0),
  supplierId: text('supplier_id'), // Will reference suppliers.id
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: text('id').primaryKey(),
  itemId: text('item_id').references(() => inventoryItems.id),
  type: text('type').notNull(), // opening/purchase/adjustment/consumption/waste/void
  quantityDelta: real('quantity_delta').notNull(),
  quantityAfter: real('quantity_after').notNull(),
  unitCost: real('unit_cost').default(0),
  referenceId: text('reference_id'),
  reason: text('reason'),
  createdBy: text('created_by').references(() => users.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const itemInventoryMap = sqliteTable('item_inventory_map', {
  id: text('id').primaryKey(),
  menuItemId: text('menu_item_id').references(() => menuItems.id),
  inventoryItemId: text('inventory_item_id').references(() => inventoryItems.id),
  quantityPerServing: real('quantity_per_serving').notNull(),
});

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  gstin: text('gstin'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const purchaseOrders = sqliteTable('purchase_orders', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  poNumber: text('po_number').notNull(),
  status: text('status').default('draft'), // draft/sent/partial/received/cancelled
  totalAmount: real('total_amount').default(0),
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  receivedAt: text('received_at'),
});

export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: text('id').primaryKey(),
  poId: text('po_id').references(() => purchaseOrders.id),
  inventoryItemId: text('inventory_item_id').references(() => inventoryItems.id),
  orderedQty: real('ordered_qty').notNull(),
  receivedQty: real('received_qty').default(0),
  unitCost: real('unit_cost').notNull(),
  total: real('total').notNull(),
});

export const staffAttendance = sqliteTable('staff_attendance', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  date: text('date').notNull(),
  punchIn: text('punch_in'),
  punchOut: text('punch_out'),
  totalHours: real('total_hours'),
  notes: text('notes'),
});

export const onlineOrderSources = sqliteTable('online_order_sources', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  platform: text('platform').notNull(), // swiggy/zomato/website/other
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  webhookSecret: text('webhook_secret'),
  settings: text('settings', { mode: 'json' }),
});

export const onlineOrders = sqliteTable('online_orders', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  sourceId: text('source_id').references(() => onlineOrderSources.id),
  externalOrderId: text('external_order_id').notNull(),
  platform: text('platform').notNull(),
  customerName: text('customer_name'),
  customerPhone: text('customer_phone'),
  deliveryAddress: text('delivery_address', { mode: 'json' }),
  items: text('items', { mode: 'json' }),
  subtotal: real('subtotal').default(0),
  total: real('total').default(0),
  status: text('status').default('pending'),
  acceptedAt: text('accepted_at'),
  readyAt: text('ready_at'),
  dispatchedAt: text('dispatched_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const reservations = sqliteTable('reservations', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  tableId: text('table_id').references(() => tables.id),
  customerId: text('customer_id').references(() => customers.id),
  guestName: text('guest_name').notNull(),
  guestPhone: text('guest_phone').notNull(),
  paxCount: integer('pax_count').notNull(),
  reservationDate: text('reservation_date').notNull(),
  reservationTime: text('reservation_time').notNull(),
  status: text('status').default('pending'), // pending/confirmed/seated/no_show/cancelled
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const dayEndReports = sqliteTable('day_end_reports', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  reportDate: text('report_date').notNull(),
  openingCash: real('opening_cash').default(0),
  closingCash: real('closing_cash').default(0),
  totalOrders: integer('total_orders').default(0),
  totalRevenue: real('total_revenue').default(0),
  paymentBreakdown: text('payment_breakdown', { mode: 'json' }),
  topItems: text('top_items', { mode: 'json' }),
  taxesCollected: text('taxes_collected', { mode: 'json' }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  outletId: text('outlet_id').references(() => outlets.id),
  userId: text('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  oldValue: text('old_value', { mode: 'json' }),
  newValue: text('new_value', { mode: 'json' }),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

import { relations } from 'drizzle-orm';

export const usersRelations = relations(users, ({ one }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  outlet: one(outlets, {
    fields: [users.outletId],
    references: [outlets.id],
  }),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const modifierGroupsRelations = relations(modifierGroups, ({ many }) => ({
  modifiers: many(modifiers),
}));

export const modifiersRelations = relations(modifiers, ({ one }) => ({
  group: one(modifierGroups, {
    fields: [modifiers.groupId],
    references: [modifierGroups.id],
  }),
}));

export const menuItemsRelations = relations(menuItems, ({ many, one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  variants: many(menuItemVariants),
  modifierGroups: many(itemModifierGroups),
}));

export const menuItemVariantsRelations = relations(menuItemVariants, ({ one }) => ({
  item: one(menuItems, {
    fields: [menuItemVariants.itemId],
    references: [menuItems.id],
  }),
}));

export const itemModifierGroupsRelations = relations(itemModifierGroups, ({ one }) => ({
  item: one(menuItems, {
    fields: [itemModifierGroups.itemId],
    references: [menuItems.id],
  }),
  group: one(modifierGroups, {
    fields: [itemModifierGroups.groupId],
    references: [modifierGroups.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many, one }) => ({
  items: many(orderItems),
  kots: many(kots),
  payments: many(payments),
  paymentAttempts: many(paymentAttempts),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ many, one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  modifiers: many(orderItemModifiers),
}));

export const kotsRelations = relations(kots, ({ many, one }) => ({
  order: one(orders, {
    fields: [kots.orderId],
    references: [orders.id],
  }),
  items: many(kotItems),
}));

export const kotItemsRelations = relations(kotItems, ({ one }) => ({
  kot: one(kots, {
    fields: [kotItems.kotId],
    references: [kots.id],
  }),
  orderItem: one(orderItems, {
    fields: [kotItems.orderItemId],
    references: [orderItems.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ many, one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  cashier: one(users, {
    fields: [payments.cashierId],
    references: [users.id],
  }),
  splits: many(paymentSplits),
}));

export const paymentSplitsRelations = relations(paymentSplits, ({ one }) => ({
  payment: one(payments, {
    fields: [paymentSplits.paymentId],
    references: [payments.id],
  }),
}));

export const paymentAttemptsRelations = relations(paymentAttempts, ({ one }) => ({
  order: one(orders, {
    fields: [paymentAttempts.orderId],
    references: [orders.id],
  }),
  outlet: one(outlets, {
    fields: [paymentAttempts.outletId],
    references: [outlets.id],
  }),
  cashier: one(users, {
    fields: [paymentAttempts.cashierId],
    references: [users.id],
  }),
}));

export const tablesRelations = relations(tables, ({ one }) => ({
  section: one(tableSections, {
    fields: [tables.sectionId],
    references: [tableSections.id],
  }),
}));

export const tableSectionsRelations = relations(tableSections, ({ many }) => ({
  tables: many(tables),
}));
