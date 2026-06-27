# Bhukkad Development Workflow

This document describes the practical development loops for working safely in the Bhukkad repo.

## Local Bootstrap

```bash
npm install
cp .env.example .env.local
npm run db:setup
npm run dev
```

Open `http://localhost:3000` and log in with one of the seeded demo accounts from `README.md`.

`npm run db:setup` is a destructive local bootstrap command: it removes the target SQLite database file, reapplies the schema, and reseeds demo data. Use `npm run db:push` when you want to keep the current local dataset intact.

## Standard Verification

Minimum verification after code changes:

```bash
npm run lint
```

For runtime-affecting work, also run:

```bash
npm run build
```

Notes:

- There is currently no `test` script in `package.json`.
- Manual smoke testing is important, especially for operational screens and socket-driven workflows.

## Common Change Recipes

## 1. Changing the Schema

Use this when editing `db/schema.ts`.

1. Update the schema.
2. Update `db/seed.ts` if the local demo needs the new fields.
3. Apply the schema without wiping local data:
   `npm run db:push`
4. If the seed assumptions changed, rebuild local state from scratch:
   `npm run db:setup`
5. Update related route handlers and UI.
6. Update `docs/DATABASE_SCHEMA.md`.

## 2. Changing Order Creation or Payment Logic

Primary files:

- `lib/orders/create-order.ts`
- `app/api/orders/route.ts`
- `app/api/orders/[id]/pay/route.ts`
- `app/api/kitchen/kots/[id]/route.ts`
- `app/(dashboard)/pos/page.tsx`
- `app/(dashboard)/kitchen/page.tsx`

Checklist:

1. Preserve outlet scoping.
2. Keep order, KOT, and table state transitions consistent.
3. Keep socket payloads in sync with the listening pages.
4. Smoke test POS plus Kitchen together.

## 3. Changing Tablet and QR Ordering

Primary files:

- `app/tablet/[tableId]/page.tsx`
- `app/api/tablet/session/route.ts`
- `lib/tablet-ordering.ts`
- `app/api/settings/route.ts`

Checklist:

1. Confirm outlet settings still enable the feature as expected.
2. Confirm the bootstrap response still contains the data the tablet UI expects.
3. Submit a real tablet order locally.
4. Confirm the order lands in the normal order and kitchen flows.

## 4. Changing Menu CRUD

Primary files:

- `app/api/menu/categories/**`
- `app/api/menu/items/**`
- `app/api/menu/modifierGroups/**`
- `app/api/menu/modifiers/**`
- menu management pages and forms

Checklist:

1. Keep Zod validation aligned with the persisted fields.
2. Preserve outlet scoping.
3. Check that variants and modifier group links still serialize correctly.

## 5. Changing Realtime Behavior

Primary files:

- `server.ts`
- `lib/orders/create-order.ts`
- `app/api/kitchen/kots/[id]/route.ts`
- `app/api/orders/[id]/pay/route.ts`
- `app/(dashboard)/kitchen/page.tsx`
- `app/(dashboard)/pos/page.tsx`

Checklist:

1. Update both event emitters and listeners.
2. Keep room names consistent.
3. Verify payload shapes on both sides.
4. Manually test at least two pages in parallel.

## 6. Changing Outlet Settings

Primary files:

- `app/api/settings/route.ts`
- `lib/tablet-ordering.ts`
- `db/schema.ts` if settings shape changes materially
- `app/(dashboard)/settings/page.tsx`

Checklist:

1. Preserve merge behavior for settings JSON.
2. Confirm feature flags still default safely.
3. Re-test tablet ordering if those flags are involved.

## UI and Brand Workflow

For UI changes:

1. Check `BRANDING.md`.
2. Reuse existing layout and token patterns from `app/globals.css` and the layout components.
3. If the visual system changes materially, update `BRANDING.md` too.

## Docs Maintenance Rule

If you change any of the following, update docs in the same branch:

- route handlers -> `docs/API_ENDPOINTS.md`
- schema or domain boundaries -> `docs/DATABASE_SCHEMA.md`
- runtime or module layout -> `docs/ARCHITECTURE.md`
- developer setup or commands -> `README.md`, `CLAUDE.md`, or `AGENTS.md`

## Build and Runtime Gotchas

- `middleware.ts` does not protect `/api`.
- `server.ts` is the real runtime entrypoint.
- `npm run db:setup` intentionally recreates the local SQLite target; use `npm run db:push` for non-destructive schema updates.
- `SQLITE_DB_PATH` lets you point setup or build commands at an isolated verification database.
- File uploads persist in `public/uploads`, so cleanup may be manual.
