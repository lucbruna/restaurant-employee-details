# Bhukkad Agentic AI Handoff

This document is the quick-start handoff for any agentic AI working inside the Bhukkad repository.

## Mission

Bhukkad is a restaurant operations platform. It is not a toy dashboard, not a generic admin starter, and not a frontend-only concept project. It already contains a real operational model across staff workflows, kitchen coordination, public tablet ordering, menu management, tables, customers, inventory, and reporting.

When you work here, preserve product coordination across:

- pages
- route handlers
- shared business logic
- realtime events
- database schema

Do not change one of those layers casually without checking the others.

## Read This First

Recommended reading order:

1. `README.md`
2. `docs/RECREATION_GUIDE.md`
3. `docs/UI_SYSTEM.md`
4. `docs/PAGE_BLUEPRINTS.md`
5. `docs/ARCHITECTURE.md`
6. `docs/API_ENDPOINTS.md`
7. `docs/DATABASE_SCHEMA.md`
8. `docs/TECH_STACK.md`
9. `docs/DEVELOPMENT_WORKFLOW.md`
10. `BRANDING.md`

## Boot Sequence

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Use the npm scripts. Do not bypass the custom runtime with raw `next dev`.

`npm run db:setup` is the clean bootstrap path for local demos. It recreates the target SQLite database file before pushing schema and reseeding demo data. Use `npm run db:push` if you need a non-destructive schema update, or set `SQLITE_DB_PATH` for isolated verification runs.

## Runtime Truths

- The real runtime entrypoint is `server.ts`.
- Next.js App Router is present, but the app depends on a custom Node server.
- There is no separate backend service.
- Route handlers and `lib/` implement backend logic.
- SQLite is the persistence layer.
- Uploads are stored under `public/uploads`.
- Page auth lives in `middleware.ts`.
- API auth happens inside route handlers using `auth()`.
- Socket.IO is part of product correctness, not optional infrastructure.

## High-Value Files

- `server.ts`
- `middleware.ts`
- `app/globals.css`
- `app/layout.tsx`
- `components/layout/app-shell.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/header.tsx`
- `components/brand/brand-mark.tsx`
- `app/(dashboard)`
- `app/tablet/[tableId]`
- `app/api/**`
- `lib/auth.ts`
- `lib/orders/create-order.ts`
- `lib/tablet-ordering.ts`
- `db/schema.ts`
- `db/seed.ts`

## Product Modes

Bhukkad contains multiple intentional UX modes:

- standard authenticated staff shell
- immersive POS mode
- dark kitchen mode
- public guest-safe tablet ordering mode

Do not collapse these into one generic interface style.

## Core Navigation Surface

The main staff app includes:

- Dashboard
- POS
- Tablet Ordering
- KOT
- Orders
- Reservations
- Menu
- Inventory
- Customers
- Reports
- Settings

Navigation truth lives in `components/layout/sidebar.tsx`.

## Realtime Contract

Treat Socket.IO events as product API contracts.

### Client Events

- `kitchen:join`
- `pos:join`
- `table:select`
- `kot:markStatus`

### Server Events

- `kot:new`
- `kot:updated`
- `table:updated`

If you change event names or payload expectations, audit at least:

- `server.ts`
- `lib/orders/create-order.ts`
- kitchen-related route handlers
- payment-related route handlers
- POS page
- Kitchen page

## Order Flow Sensitivity

Order logic is a critical system path.

When changing order behavior, review:

- `lib/orders/create-order.ts`
- `app/api/orders/**`
- `app/api/kitchen/kots/**`
- POS pages
- Kitchen pages
- any table-state interactions

The platform is designed so orders, KOTs, table state, and realtime updates stay coordinated.

## Tablet Ordering Sensitivity

When changing tablet or QR ordering behavior, review:

- `app/tablet/[tableId]/page.tsx`
- `app/api/tablet/session/route.ts`
- `lib/tablet-ordering.ts`
- settings routes that affect tablet availability

## Schema Sensitivity

When changing the database schema, review:

- `db/schema.ts`
- `db/seed.ts`
- affected routes
- affected pages
- `docs/DATABASE_SCHEMA.md`

Remember that most of the model is interconnected:

- outlet scoping
- users and roles
- tables and reservations
- menu, variants, and modifiers
- orders, payments, and KOTs
- inventory and purchasing

## Security and Safety Expectations

Bhukkad already has layered safeguards. Preserve them.

- page protection through middleware
- API protection through route-level auth
- role-aware and outlet-aware session context
- order validation before writes
- menu and variant validation
- upload guardrails
- foreign key integrity
- WAL mode on SQLite
- room-scoped realtime events

Do not weaken any of those layers for convenience.

## Local Demo Credentials

| Role | Email | Password | PIN |
| --- | --- | --- | --- |
| Owner | `admin@admin.com` | `admin` | `1111` |
| Manager | `manager@spicegarden.com` | `Mgr@123` | `2222` |
| Cashier | `cashier@spicegarden.com` | `Cash@123` | `3333` |
| Waiter | `waiter1@spicegarden.com` | `Wait@123` | `4444` |
| Kitchen | `kitchen@spicegarden.com` | `Kitch@123` | `5555` |
| Waiter | `waiter2@spicegarden.com` | `Wait@456` | `6666` |

## Verification Standard

After changes:

- run `npm run lint`
- run `npm run build` for runtime, route, auth, schema, or socket changes
- rerun `npm run db:setup` after schema or seed changes
- smoke test the affected product surface
- for realtime work, test at least two coordinated views if possible

## Behavioral Rules for Agents

- Preserve the custom server and Socket.IO contract.
- Preserve the separation between staff shell, POS, kitchen, and public tablet experiences.
- Prefer recreating current implementation truth over older design intent if documents conflict.
- Treat `app/globals.css` as the implemented visual system source of truth.
- Keep the realistic seeded demo story intact when possible.
- Do not introduce generic enterprise UI patterns that erase the hospitality character of the app.
- Do not assume API routes are protected just because pages are.

## Working Summary

Bhukkad is best understood as a tightly integrated restaurant operating system. The safest way to work in this repo is to think in flows, not files: who is using the feature, what operational state is being changed, what downstream screen depends on that state, and what socket or schema contract carries the effect forward.
