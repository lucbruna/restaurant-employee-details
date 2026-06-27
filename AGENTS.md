# Bhukkad Agent Handoff

This file is the project handoff for Antigravity and any other coding agent that needs to work inside the Bhukkad repository.

## Mission

Bhukkad is a single-repo restaurant operations product. The current codebase already covers staff-facing operations and a public tablet ordering flow. The main goal when working here is to preserve the tight coupling between pages, route handlers, realtime updates, and the SQLite schema instead of changing one layer in isolation.

## Reading Order

1. `README.md`
2. `docs/RECREATION_GUIDE.md` for exact rebuild work
3. `docs/UI_SYSTEM.md` for visual and shell fidelity
4. `docs/PAGE_BLUEPRINTS.md` for route intent and layout expectations
5. `docs/ARCHITECTURE.md`
6. `docs/API_ENDPOINTS.md`
7. `docs/DATABASE_SCHEMA.md`
8. `docs/DEVELOPMENT_WORKFLOW.md`
9. `BRANDING.md` for supporting UI context

## Boot Sequence

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Use the npm scripts. Do not bypass them with raw `next dev` because the app depends on the custom Socket.IO server in `server.ts`.

## Repo Truths

- This is a Next.js App Router app with a custom Node server.
- There is no separate backend service. Server logic lives in route handlers, `lib/`, and `server.ts`.
- State is persisted to local SQLite in `sqlite.db`.
- Uploads are written to `public/uploads`.
- Page auth is handled in `middleware.ts`.
- API auth is handled inside route handlers with `auth()`.
- Realtime sync is part of the product, not an optional extra.

## Exact Recreation Rules

- Recreate the implementation first, not the older intent in `BRANDING.md`.
- `app/globals.css` wins if any visual token in `BRANDING.md` conflicts with the current app.
- Keep the staff shell, POS mode, kitchen mode, and public tablet mode as separate experiences.
- Keep the custom server and Socket.IO contract intact.
- Keep the seeded demo story intact for local recreation and handoff.

## High-Value Paths

- `server.ts` - Socket.IO setup and room/event wiring
- `middleware.ts` - page-level route protection
- `app/globals.css` - implemented visual system and page atmosphere
- `app/layout.tsx` - fonts and global metadata
- `app/(dashboard)` - authenticated staff application
- `app/tablet/[tableId]` - public tablet ordering surface
- `app/api/**` - staff and public route handlers
- `lib/auth.ts` - credentials plus PIN auth
- `lib/orders/create-order.ts` - main order creation flow
- `lib/tablet-ordering.ts` - tablet/QR ordering feature flags and settings
- `db/schema.ts` - schema source of truth
- `db/seed.ts` - demo data and local user credentials
- `components/layout/app-shell.tsx` - authenticated shell frame
- `components/layout/sidebar.tsx` - navigation order and shell width
- `components/layout/header.tsx` - sticky header and full-screen route suppression
- `components/brand/brand-mark.tsx` - brand signature

## Product Surface

- Dashboard
- POS
- Kitchen
- KOT management
- Orders
- Reservations
- Menu management
- Inventory
- Customers
- Reports
- Settings
- Tablet ordering

Main dashboard navigation is defined in `components/layout/sidebar.tsx`.

## Realtime Contract

Listen or emit carefully around these events:

- Client joins: `kitchen:join`, `pos:join`, `table:select`, `kot:markStatus`
- Server emits: `kot:new`, `kot:updated`, `table:updated`

Any change to event names or payload shapes must be propagated across:

- `server.ts`
- `lib/orders/create-order.ts`
- `app/api/kitchen/kots/[id]/route.ts`
- `app/api/orders/[id]/pay/route.ts`
- `app/(dashboard)/kitchen/page.tsx`
- `app/(dashboard)/pos/page.tsx`

## Common Change Routes

### Menu and pricing changes

Check:

- `app/api/menu/**`
- menu dashboard pages
- `db/schema.ts`

### Order flow changes

Check:

- `lib/orders/create-order.ts`
- `app/api/orders/**`
- `app/api/kitchen/kots/**`
- POS and Kitchen pages

### Tablet ordering changes

Check:

- `app/tablet/[tableId]/page.tsx`
- `app/api/tablet/session/route.ts`
- `lib/tablet-ordering.ts`
- `app/api/settings/route.ts`

### Schema changes

Check:

- `db/schema.ts`
- `db/seed.ts`
- affected route handlers and pages
- `docs/DATABASE_SCHEMA.md`

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

- Run `npm run lint` after changes.
- Run `npm run build` for runtime, routing, auth, schema, or socket changes.
- Rerun `npm run db:setup` after schema or seed edits.
- Manually smoke test the relevant product surface for UI changes.
- For realtime changes, test at least two coordinated views when possible.

## Documentation Index

- `docs/README.md`
- `docs/RECREATION_GUIDE.md`
- `docs/UI_SYSTEM.md`
- `docs/PAGE_BLUEPRINTS.md`
- `docs/ARCHITECTURE.md`
- `docs/API_ENDPOINTS.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/TECH_STACK.md`
- `docs/DEVELOPMENT_WORKFLOW.md`
- `CLAUDE.md`
- `BRANDING.md`
