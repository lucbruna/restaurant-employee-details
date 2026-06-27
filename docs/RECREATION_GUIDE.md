# Bhukkad Recreation Guide

Use this guide when the goal is not just to work on Bhukkad, but to recreate the current product as faithfully as possible.

## Goal

Bhukkad is not a generic admin dashboard. It is a restaurant operations product with three distinct interaction modes:

- a polished staff shell for most authenticated back-office pages
- an immersive service console for POS
- a darker, faster, kitchen-first surface for active KOT work
- a public, guest-safe tablet ordering flow for table-side ordering

If another agent needs to rebuild the current site exactly, this document should be treated as the starting brief.

## Reading Order For Exact Recreation

1. `README.md`
2. `docs/RECREATION_GUIDE.md`
3. `docs/UI_SYSTEM.md`
4. `docs/PAGE_BLUEPRINTS.md`
5. `docs/ARCHITECTURE.md`
6. `docs/API_ENDPOINTS.md`
7. `docs/DATABASE_SCHEMA.md`
8. `docs/DEVELOPMENT_WORKFLOW.md`
9. `BRANDING.md`

## Source Of Truth Hierarchy

When documents and implementation disagree, use this order:

1. Current implementation files
2. `app/globals.css` for the live visual system
3. Route files in `app/**` and shared components in `components/**`
4. Runtime and domain docs in `docs/**`
5. `BRANDING.md` as an intent-level reference only

The most important conflict to know up front:

- `BRANDING.md` describes an earlier warm cream brand direction.
- `app/globals.css` is the actual current implementation and uses a cooler slate-and-white shell with orange brand accents.

For exact recreation, reproduce the implementation, not the earlier brand intent.

## Exact Implementation Anchors

### Runtime And Product Shape

- `server.ts` - custom Node server, Socket.IO bootstrap, and room wiring
- `middleware.ts` - page-level auth protection
- `db/schema.ts` - data model source of truth
- `db/seed.ts` - local demo users and seeded restaurant data
- `lib/orders/create-order.ts` - order creation and realtime updates
- `lib/tablet-ordering.ts` - guest ordering settings and public link helpers

### Shell And Visual Identity

- `app/globals.css` - live color tokens, radii, shadows, shell utilities, and gradients
- `app/layout.tsx` - global fonts and document metadata
- `components/layout/app-shell.tsx` - authenticated app shell composition
- `components/layout/sidebar.tsx` - navigation order, compact vs expanded widths
- `components/layout/header.tsx` - sticky header behavior and full-screen route suppression
- `components/brand/brand-mark.tsx` - logo treatment, tagline, and compact/full variants

### Page-Level Sources

- `app/login/page.tsx` - login card, centered auth experience, theme toggle placement
- `app/(dashboard)/dashboard/page.tsx` - staff dashboard hero and KPI/reporting layout
- `app/(dashboard)/pos/page.tsx` - immersive POS surface
- `app/(dashboard)/kitchen/page.tsx` - kitchen display surface
- `app/(dashboard)/kot/page.tsx` - KOT management surface
- `app/(dashboard)/orders/page.tsx`
- `app/(dashboard)/menu/page.tsx`
- `app/(dashboard)/inventory/page.tsx`
- `app/(dashboard)/customers/page.tsx`
- `app/(dashboard)/reports/page.tsx`
- `app/(dashboard)/reservations/page.tsx`
- `app/(dashboard)/tables/page.tsx`
- `app/(dashboard)/tablet-ordering/page.tsx`
- `app/(dashboard)/settings/page.tsx`
- `app/tablet/[tableId]/page.tsx`
- `components/tablet/tablet-order-shell.tsx`

## Visual References

Use these screenshots as fidelity references when rebuilding:

- `docs/brand/pdf-source/images/screens/login-light.png`
- `docs/brand/pdf-source/images/screens/dashboard-overview.png`
- `docs/brand/pdf-source/images/screens/pos-workflow.png`

Use the screenshots to validate composition and atmosphere. Use the implementation files to validate exact tokens, layout behavior, and interaction rules.

## Product Fidelity Rules

### 1. Keep The Product Split Intact

Bhukkad is intentionally split into:

- authenticated staff operations under `app/(dashboard)`
- public guest ordering under `app/tablet/[tableId]`

Do not collapse these into one generic dashboard or one generic storefront.

### 2. Preserve The Three UI Modes

- Standard staff pages use the rounded glassy shell and the shared sidebar/header frame.
- `/pos` is an immersive operator console and intentionally hides the standard header.
- `/kitchen` is an even more focused dark surface and also hides the standard header.

If a rebuild turns POS and Kitchen into ordinary shell pages, it is no longer a faithful recreation.

### 3. Preserve The Custom Server

Bhukkad depends on `server.ts`, not only Next.js route handlers.

- development must go through `npm run dev`
- production must go through `npm run build` and `npm run start`

Do not replace the runtime with raw `next dev` assumptions when recreating locally.

### 4. Preserve The Realtime Contract

The current experience relies on Socket.IO room behavior.

Important client joins:

- `kitchen:join`
- `pos:join`
- `table:select`
- `kot:markStatus`

Important server emits:

- `kot:new`
- `kot:updated`
- `table:updated`

If an agent rebuilds only the REST layer and drops these events, the experience will not match the current product.

### 5. Preserve Demoability

The local seeded users are part of the repo's practical handoff.

- `admin@admin.com` / `admin` / `1111`
- `manager@spicegarden.com` / `Mgr@123` / `2222`
- `cashier@spicegarden.com` / `Cash@123` / `3333`
- `waiter1@spicegarden.com` / `Wait@123` / `4444`
- `kitchen@spicegarden.com` / `Kitch@123` / `5555`
- `waiter2@spicegarden.com` / `Wait@456` / `6666`

For a faithful local recreation, the seeded demo story should still work.

### 6. Do Not Replace The UI With Generic Defaults

Avoid rebuilding Bhukkad as:

- a default shadcn dashboard
- a generic POS template
- a flat admin interface with no atmospheric gradients
- a brandless tablet order flow

Bhukkad should feel warm, operational, and hospitality-focused while still being sharp and fast.

## Recreation Checklist

Use this as a final rebuild audit:

- The app launches through the custom server scripts.
- `/` redirects to `/dashboard`.
- `/login` is a centered card with `BrandMark`, theme toggle, and the current welcome copy.
- The standard authenticated shell uses the current sidebar widths and sticky header.
- `/pos` hides the standard header and behaves like a full-screen service console.
- `/kitchen` hides the standard header and keeps the darker high-contrast kitchen mode.
- `/tablet/[tableId]` remains a public guest flow and does not inherit the staff shell.
- `app/globals.css` tokens, shadows, radii, and shell utilities are preserved.
- Realtime events still update kitchen and table state across views.
- Demo users still allow a fresh local walkthrough.

If all of those are true, the recreation is probably faithful enough to the current Bhukkad implementation.
