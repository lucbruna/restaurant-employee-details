# Bhukkad API Endpoints

This document inventories the route handlers currently present under `app/api`.

## Auth Model

- Page requests are protected by `middleware.ts`.
- API requests are not protected by middleware.
- Protected route handlers call `auth()` inside the handler.
- Most protected endpoints are outlet-scoped and require `session.user.outletId`.

## Public and Semi-Public Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/auth/[...nextauth]` | Public | NextAuth route handling. In demo mode, the session endpoint can return a demo session. |
| `POST` | `/api/auth/[...nextauth]` | Public | NextAuth sign-in and auth actions. |
| `GET` | `/api/tablet/session?tableId=...` | Public | Bootstrap outlet, table, categories, menu items, variants, modifiers, and settings for tablet ordering. |
| `POST` | `/api/tablet/session` | Public | Submit a tablet dine-in order for a specific table through the normal order creation flow. |

## Dashboard and Reporting

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard/overview` | Protected | Summary metrics for the dashboard landing view. |
| `GET` | `/api/reports/summary` | Protected | Report summary data for the reports area. |

## Orders and Payments

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/orders` | Protected | List active or relevant outlet orders. |
| `POST` | `/api/orders` | Protected | Create a new order from staff flows. |
| `GET` | `/api/orders/history` | Protected | Historical order listing. |
| `POST` | `/api/orders/[id]/pay` | Protected | Apply payment data to an order and update downstream table state. |
| `POST` | `/api/orders/[id]/payment-session` | Protected | Create or initialize a payment attempt for the selected provider and return checkout or session details. |
| `POST` | `/api/payments/webhooks/[provider]` | Public | Receive gateway webhook updates, reconcile payment attempts, and finalize successful orders idempotently. |

## Kitchen and KOT

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/kitchen/kots` | Protected | Fetch KOT items for kitchen operations. |
| `PATCH` | `/api/kitchen/kots/[id]` | Protected | Update KOT status and emit realtime changes. |

## Tables and Floor Management

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/tables` | Protected | List outlet tables. |
| `POST` | `/api/tables` | Protected | Create a table. |
| `PATCH` | `/api/tables/[id]` | Protected | Update table configuration or state. |
| `DELETE` | `/api/tables/[id]` | Protected | Delete a table. |
| `POST` | `/api/tables/bulk` | Protected | Bulk-create or batch-manage tables. |
| `POST` | `/api/tables/sections` | Protected | Create a table section. |
| `PATCH` | `/api/tables/sections/[id]` | Protected | Update a table section. |
| `DELETE` | `/api/tables/sections/[id]` | Protected | Delete a table section. |

## Menu Management

### Categories

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/menu/categories` | Protected | List menu categories. |
| `POST` | `/api/menu/categories` | Protected | Create a menu category. |
| `PATCH` | `/api/menu/categories/[id]` | Protected | Update a menu category. |
| `DELETE` | `/api/menu/categories/[id]` | Protected | Delete a menu category. |

### Items

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/menu/items` | Protected | List menu items. |
| `POST` | `/api/menu/items` | Protected | Create a menu item. |
| `PATCH` | `/api/menu/items/[id]` | Protected | Update a menu item and related fields. |
| `DELETE` | `/api/menu/items/[id]` | Protected | Delete a menu item. |

### Modifier Groups

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/menu/modifierGroups` | Protected | List modifier groups. |
| `POST` | `/api/menu/modifierGroups` | Protected | Create a modifier group. |
| `PATCH` | `/api/menu/modifierGroups/[id]` | Protected | Update a modifier group. |
| `DELETE` | `/api/menu/modifierGroups/[id]` | Protected | Delete a modifier group. |

### Modifiers

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/menu/modifiers` | Protected | Create a modifier. |
| `PATCH` | `/api/menu/modifiers/[id]` | Protected | Update a modifier. |
| `DELETE` | `/api/menu/modifiers/[id]` | Protected | Delete a modifier. |

## Customers

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/customers` | Protected | List customers. |
| `POST` | `/api/customers` | Protected | Create a customer. |
| `PATCH` | `/api/customers/[id]` | Protected | Update a customer. |
| `DELETE` | `/api/customers/[id]` | Protected | Delete a customer. |

## Inventory

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/inventory` | Protected | List inventory items and related outlet inventory data. |
| `POST` | `/api/inventory` | Protected | Create an inventory record. |
| `PATCH` | `/api/inventory/[id]` | Protected | Update an inventory item. |
| `DELETE` | `/api/inventory/[id]` | Protected | Delete an inventory item. |

## Outlet Settings

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/settings` | Protected | Fetch the authenticated user's outlet record. |
| `PATCH` | `/api/settings` | Protected | Update outlet profile data and merge outlet settings. |

## Uploads

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/upload` | Protected | Upload an image to `public/uploads` and return a public URL. |

Upload constraints:

- Node runtime only
- Max size: 2 MB
- Allowed MIME types:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
  - `image/avif`

## Operational Notes

- The public tablet ordering API is the main exception to the protected staff API pattern.
- The payment and kitchen status APIs are tied to realtime socket events, so behavior changes should be reviewed together with `server.ts` and the relevant pages.
- Route handler filenames are the source of truth for this list. If you add or remove endpoints, update this document.

## Source Files

- `app/api/auth/[...nextauth]/route.ts`
- `app/api/dashboard/overview/route.ts`
- `app/api/reports/summary/route.ts`
- `app/api/orders/**`
- `app/api/payments/**`
- `app/api/kitchen/kots/**`
- `app/api/menu/**`
- `app/api/tables/**`
- `app/api/customers/**`
- `app/api/inventory/**`
- `app/api/settings/route.ts`
- `app/api/tablet/session/route.ts`
- `app/api/upload/route.ts`
