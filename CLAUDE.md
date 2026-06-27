# Bhukkad

Project memory for Claude Code.

## Start Here

1. Read `README.md` for setup and the docs map.
2. Read `docs/RECREATION_GUIDE.md` when the goal is exact reconstruction.
3. Read `docs/UI_SYSTEM.md` before making visual or shell changes.
4. Read `docs/PAGE_BLUEPRINTS.md` before restructuring routes or page behavior.
5. Read `docs/ARCHITECTURE.md` before changing app structure or runtime behavior.
6. Read `docs/API_ENDPOINTS.md` before touching route handlers.
7. Read `docs/DATABASE_SCHEMA.md` before changing anything in `db/schema.ts`.
8. Read `BRANDING.md` as supporting UI context, not the final visual source of truth.

## Commands

- `npm install`
- `cp .env.example .env.local`
- `npm run db:setup`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`

## Critical Runtime Facts

- Use `npm run dev`, not raw `next dev`. The app depends on `server.ts` for Socket.IO.
- Production builds compile both Next.js and the custom server. `npm run start` serves `dist/server.js`.
- The database is local SQLite at `sqlite.db`.
- SQLite is opened through `better-sqlite3` with `WAL` mode and foreign keys enabled in `db/index.ts`.
- `/api` requests are excluded from middleware protection. Every protected route handler must call `auth()` itself.
- `middleware.ts` protects page navigation, redirects logged-in users away from `/login`, and supports demo mode.
- `APP_DEMO_MODE` changes auth behavior through `lib/demo-mode.ts` and `app/api/auth/[...nextauth]/route.ts`.

## Exact Recreation Notes

- Treat `app/globals.css` as the live visual source of truth.
- If `BRANDING.md` and implementation differ, preserve implementation for fidelity work.
- Preserve the difference between standard staff shell pages, immersive POS, dark kitchen mode, and public tablet ordering.
- Preserve the custom server plus Socket.IO event contract.

## High-Value Files

- `server.ts` - custom HTTP server and Socket.IO event wiring
- `middleware.ts` - page-level auth enforcement
- `app/globals.css` - implemented token system, shell utilities, and gradients
- `app/layout.tsx` - fonts and global document setup
- `lib/auth.ts` - credentials and PIN auth
- `lib/orders/create-order.ts` - primary order creation workflow and realtime KOT/table events
- `app/api/orders/[id]/pay/route.ts` - payment completion and table release behavior
- `app/api/kitchen/kots/[id]/route.ts` - KOT status updates
- `app/api/tablet/session/route.ts` - public tablet bootstrap plus tablet order submission
- `lib/tablet-ordering.ts` - outlet settings normalization and tablet ordering feature flags
- `db/schema.ts` - schema source of truth
- `db/seed.ts` - local demo data and seeded staff accounts
- `components/layout/app-shell.tsx` - authenticated shell composition
- `components/layout/sidebar.tsx` - main product navigation
- `components/layout/header.tsx` - sticky chrome and full-screen route exceptions
- `components/brand/brand-mark.tsx` - brand signature

## Core Product Areas

- Dashboard: `/dashboard`
- POS: `/pos`
- Kitchen: `/kitchen`
- KOT queue: `/kot`
- Orders: `/orders`
- Reservations: `/reservations`
- Menu management: `/menu`
- Inventory: `/inventory`
- Customers: `/customers`
- Reports: `/reports`
- Settings: `/settings`
- Public tablet ordering: `/tablet/[tableId]`

## Realtime Events

Server-side listeners in `server.ts`:

- `kitchen:join`
- `pos:join`
- `table:select`
- `kot:markStatus`

Server-side emissions:

- `kot:new`
- `kot:updated`
- `table:updated`

If you rename or reshape any socket payload, update both `server.ts` and the subscribing pages in `app/(dashboard)/kitchen/page.tsx` and `app/(dashboard)/pos/page.tsx`.

## Change Maps

### Order lifecycle

Touch these together:

- `lib/orders/create-order.ts`
- `app/api/orders/route.ts`
- `app/api/orders/[id]/pay/route.ts`
- `app/api/kitchen/kots/[id]/route.ts`
- `app/(dashboard)/pos/page.tsx`
- `app/(dashboard)/kitchen/page.tsx`

### Tablet ordering

Touch these together:

- `app/tablet/[tableId]/page.tsx`
- `app/api/tablet/session/route.ts`
- `lib/tablet-ordering.ts`
- `app/api/settings/route.ts`

### Menu CRUD

Touch these together:

- `app/api/menu/**`
- `db/schema.ts`
- menu pages and related form components

### Tables and sections

Touch these together:

- `app/api/tables/**`
- `app/(dashboard)/tables/page.tsx`
- POS views that consume table status

## Demo Credentials

Seeded local accounts:

- `admin@admin.com` / `admin` / `1111`
- `manager@spicegarden.com` / `Mgr@123` / `2222`
- `cashier@spicegarden.com` / `Cash@123` / `3333`
- `waiter1@spicegarden.com` / `Wait@123` / `4444`
- `kitchen@spicegarden.com` / `Kitch@123` / `5555`
- `waiter2@spicegarden.com` / `Wait@456` / `6666`

## Verification Expectations

- Run `npm run lint` after code changes.
- Run `npm run build` for runtime-affecting changes, especially `server.ts`, auth, routing, or schema work.
- If you change schema or seed assumptions, rerun `npm run db:setup`.
- If you change realtime behavior, manually smoke test POS plus Kitchen together.

## Docs Map

- `docs/README.md`
- `docs/RECREATION_GUIDE.md`
- `docs/UI_SYSTEM.md`
- `docs/PAGE_BLUEPRINTS.md`
- `docs/ARCHITECTURE.md`
- `docs/API_ENDPOINTS.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/TECH_STACK.md`
- `docs/DEVELOPMENT_WORKFLOW.md`
- `BRANDING.md`
