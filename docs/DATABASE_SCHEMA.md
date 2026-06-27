# Bhukkad Database Schema

This document summarizes the Drizzle schema in `db/schema.ts`.

## Storage Model

- Database engine: SQLite
- Access layer: Drizzle ORM + `better-sqlite3`
- Default database file: `sqlite.db`
- Optional override: `SQLITE_DB_PATH`
- Seed data: `db/seed.ts`

## Design Principles

- Most business records are outlet-scoped.
- Staff access is role-based.
- Order lifecycle data is split across order, item, KOT, and payment tables.
- Menu configuration supports categories, variants, modifier groups, and modifiers.
- Inventory, suppliers, and purchasing are modeled separately from menu items and mapped together where needed.

## Domain Groups

## 1. Identity and Access

### `roles`

Defines role names and permissions.

### `users`

Staff accounts with:

- email and password hash
- PIN hash for quick auth flows
- role assignment
- outlet assignment

## 2. Outlet and Floor Layout

### `outlets`

Top-level restaurant entity with profile information and settings JSON.

### `table_sections`

Logical floor sections such as dining hall zones or outdoor seating.

### `tables`

Physical tables tied to an outlet and optionally a section. Tracks status such as available or occupied.

### `reservations`

Guest bookings for tables and service windows.

### `staff_attendance`

Attendance and shift-style operational records for staff.

## 3. Menu and Pricing

### `menu_categories`

Top-level menu grouping such as starters, mains, desserts, or beverages.

### `menu_items`

Primary menu entities with pricing, food type, tags, imagery, and presentation metadata.

### `menu_item_variants`

Optional item-level variants such as half, full, or size-based pricing.

### `modifier_groups`

Selection groups such as spice level, add-ons, or combo choices.

### `item_modifier_groups`

Join table mapping menu items to modifier groups.

### `modifiers`

Actual selectable modifier options within a modifier group.

### `tax_categories`

Tax classification records for item pricing and billing.

### `discounts`

Discount definitions used for operational pricing logic.

### `coupons`

Coupon codes and redemption-style promotion records.

## 4. Customers and Loyalty

### `customers`

Customer master records with:

- contact information
- GST and invoice data where relevant
- visit and spend tracking
- notes and loyalty balances

### `loyalty_transactions`

Point accrual and redemption history tied to customers.

## 5. Orders, KOTs, and Payments

### `orders`

Header record for each order with:

- outlet, table, customer, and waiter linkage
- order type
- subtotal, discount, tax, and total
- status

### `order_items`

Line items for each order, including variant and modifier summary data.

### `order_item_modifiers`

Detailed modifier records at the order item level.

### `kots`

Kitchen order ticket headers tied to orders.

### `kot_items`

Kitchen-prep line items with per-item kitchen status.

### `payments`

Payment records linked to orders.

### `payment_attempts`

Provider-facing payment lifecycle records that capture gateway session IDs, reconciliation state, webhook payloads, and settlement errors before an order is marked paid.

### `payment_splits`

Split payment breakdowns for an order or payment flow.

## 6. Inventory and Purchasing

### `inventory_items`

Inventory master records for stock-tracked ingredients and supplies.

### `inventory_transactions`

Stock movement history such as receipts, usage, wastage, or adjustments.

### `item_inventory_map`

Maps menu items to inventory items to support ingredient-level consumption logic.

### `suppliers`

Vendor master records with contact and tax details.

### `purchase_orders`

Purchase order headers for supplier procurement.

### `purchase_order_items`

Line items attached to purchase orders.

## 7. Integrations and Operational Reporting

### `online_order_sources`

Third-party ordering platforms such as Swiggy or Zomato with settings and webhook secrets.

### `online_orders`

Orders received from external platforms.

### `day_end_reports`

Operational end-of-day summaries.

### `audit_logs`

Change history and important operator actions.

## Key Relationships

- `users.roleId -> roles.id`
- `users.outletId -> outlets.id`
- `tables.outletId -> outlets.id`
- `tables.sectionId -> table_sections.id`
- `menu_categories.outletId -> outlets.id`
- `menu_items.categoryId -> menu_categories.id`
- `menu_items.outletId -> outlets.id`
- `menu_item_variants.itemId -> menu_items.id`
- `modifiers.groupId -> modifier_groups.id`
- `item_modifier_groups.itemId -> menu_items.id`
- `item_modifier_groups.groupId -> modifier_groups.id`
- `orders.outletId -> outlets.id`
- `orders.tableId -> tables.id`
- `orders.customerId -> customers.id`
- `orders.waiterId -> users.id`
- `order_items.orderId -> orders.id`
- `order_items.itemId -> menu_items.id`
- `kots.orderId -> orders.id`
- `kot_items.kotId -> kots.id`
- `kot_items.orderItemId -> order_items.id`
- `payment_attempts.outletId -> outlets.id`
- `payment_attempts.orderId -> orders.id`
- `payment_attempts.cashierId -> users.id`
- `payments.orderId -> orders.id`
- `inventory_transactions.inventoryItemId -> inventory_items.id`
- `purchase_orders.supplierId -> suppliers.id`
- `purchase_order_items.purchaseOrderId -> purchase_orders.id`

## Operational Notes

- The schema is dense and highly interconnected. Order changes usually cascade into tables, KOTs, payments, and sometimes customers.
- `db/seed.ts` provides a realistic local restaurant dataset, not just placeholder rows.
- The current setup uses `drizzle-kit push` against SQLite rather than a migration history checked into this repo.
- `npm run db:setup` rebuilds the target SQLite file from scratch before seeding demo data, while `npm run db:push` preserves existing rows.

## When Updating the Schema

1. Update `db/schema.ts`.
2. Update `db/seed.ts` if local demo behavior depends on the new fields.
3. Run `npm run db:push` to preserve local data, or `npm run db:setup` to rebuild the local demo database from scratch.
4. Update affected route handlers and pages.
5. Update this document if tables or domain boundaries changed.

## Source Files

- `../db/schema.ts`
- `../db/index.ts`
- `../db/seed.ts`
