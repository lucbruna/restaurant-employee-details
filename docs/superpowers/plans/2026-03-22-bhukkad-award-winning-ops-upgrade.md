# Bhukkad Award-Winning Ops Upgrade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Bhukkad into a high-fidelity restaurant operations platform with unified dine-in, delivery, reservations, inventory, analytics, AI assistance, multilingual support, and customer tablet ordering.

**Architecture:** Build on the existing schema and route structure instead of introducing parallel demo systems. Scale the seed world first, then progressively surface richer operational modules through shared APIs and cohesive dashboard experiences, ensuring every new front-end surface feeds the same order, payment, kitchen, reservation, and reporting backbone.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, next-themes, Drizzle ORM, better-sqlite3, Zod, Recharts, Socket.IO

---

## File Structure

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/db/seed.ts`
  - Scale dummy restaurant world, seed 7-day operational data, add devices/tablets/languages/images, enrich reservations and delivery records.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/types/index.ts`
  - Add richer typed structures for reports, delivery hub, reservations, inventory ops, tablets, devices, translations, and chatbot presets.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/lib/analytics.ts`
  - Expand executive reporting aggregates and 7-day insights.
- **Create/Modify:** `/Users/debadritamukhopadhyay/Bhukkad/lib/demo-mode.ts`
  - Centralize large-restaurant demo constants and helper accessors.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/lib/ai.ts`
  - Add canned FAQ/preset chatbot logic and assistant behavior helpers.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/lib/i18n.ts`
  - Shared language metadata, labels, and fallback translation helpers.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/dashboard/operations/route.ts`
  - Aggregate large-restaurant operations summary.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/delivery/summary/route.ts`
  - Delivery channel dashboard data.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/reservations/summary/route.ts`
  - Reservation and waitlist aggregates.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/tablet/session/route.ts`
  - Tablet/QR ordering seed bootstrap.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/orders/route.ts`
  - Support richer order projection for drilldowns and source-aware data.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/orders/[id]/pay/route.ts`
  - Harden demo payment behavior and richer metadata handling.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/inventory/route.ts`
  - Add stock summaries and operational fields.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/api/settings/route.ts`
  - Support language/device/AI/tablet/delivery configuration.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/dashboard/page.tsx`
  - Surface stronger owner/operations intelligence.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/orders/page.tsx`
  - Rebuild as command center with drilldown.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/delivery/page.tsx`
  - Dedicated Swiggy/Zomato management center.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reservations/page.tsx`
  - Build robust Dineout/Zomato District reservation desk.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/inventory/page.tsx`
  - Expand into stock control system.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reports/page.tsx`
  - Add deeper reporting modules and insights.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/settings/page.tsx`
  - Expand into operations/settings center.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/tables/page.tsx`
  - Improve 50-table operational usability.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/pos/page.tsx`
  - Integrate better AI placement and tablet/QR entry links.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/app/tablet/[tableId]/page.tsx`
  - Customer-facing tablet/QR ordering UI.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/components/tablet/tablet-order-shell.tsx`
  - Tablet ordering composition.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/components/orders/order-detail-drawer.tsx`
  - Drilldown drawer.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/components/delivery/delivery-kanban.tsx`
  - Delivery management board.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/components/reservations/waitlist-panel.tsx`
  - Reservation waitlist and seating controls.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/components/inventory/inventory-summary.tsx`
  - Inventory KPI widgets.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/ai-chatbot.tsx`
  - Move dock, preset prompts, updated branding, accessibility.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/payment-modal.tsx`
  - Stronger dummy payment UX and device context.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx`
  - Add stable AI access and operational quick actions.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`
  - Add Delivery and Tablet Ordering entries.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css`
  - Extend Material 3-aligned tokens and legible color ramps.
- **Test/Verify:** `npm run lint`, `npm run build`

## Chunk 1: Operations Foundation

### Task 1: Scale demo constants and typing

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/lib/i18n.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/lib/demo-mode.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/types/index.ts`

- [ ] Define the 10 supported Indian languages, device counts, staffing model, and large-restaurant constants.
- [ ] Add typed models for tablets, POS terminals, delivery channels, reservation sources, report slices, and chatbot presets.
- [ ] Export helper utilities used by both APIs and UI.
- [ ] Run TypeScript-aware lint/build checks after these shared types land.

### Task 2: Rebuild the seeded demo world

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/db/seed.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/db/schema.ts` (only if seed gaps require additive schema changes)

- [ ] Expand tables to approximately 50 active tables across realistic sections.
- [ ] Seed staff for waiters, chefs, support, and operational roles.
- [ ] Seed 10 POS devices and 10 customer tablet identities.
- [ ] Replace repeated menu imagery with varied generic food images.
- [ ] Enrich the last 7 days of orders, reservations, delivery orders, payments, attendance, and inventory movement.
- [ ] Keep the seeded data deterministic and consistent across related modules.

## Chunk 2: Orders and Payments Command Center

### Task 3: Expand order API projections

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/orders/route.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/orders/[id]/pay/route.ts`

- [ ] Extend order list responses with source, waiter, table, customer, payment summary, and timeline metadata.
- [ ] Ensure unreadable service mode/status labels are fixed by data-driven semantic variants rather than fragile local styling.
- [ ] Add richer payment payload support for device references, partials, split methods, and reconciliation notes.
- [ ] Preserve idempotency and guard rails around already-paid and invalid transitions.

### Task 4: Rebuild the orders page

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/orders/page.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/components/orders/order-detail-drawer.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/payment-modal.tsx`

- [ ] Replace the current lightweight list with a richer command-center layout.
- [ ] Add service mode, payment, waiter, table, source, and urgency filters.
- [ ] Add order drilldown by customer and table with full item view.
- [ ] Improve badge contrast in both light and dark mode.
- [ ] Strengthen payment interactions and edge-case visibility.

## Chunk 3: Delivery and Reservations

### Task 5: Build delivery management APIs and UI

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/app/api/delivery/summary/route.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/delivery/page.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/components/delivery/delivery-kanban.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`

- [ ] Surface a dedicated Swiggy/Zomato operations hub.
- [ ] Add status lanes, SLA timers, source KPIs, and issue indicators.
- [ ] Reuse existing online order seed/backend entities instead of duplicating flows.

### Task 6: Rebuild reservations into a real desk

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/app/api/reservations/summary/route.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reservations/page.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/components/reservations/waitlist-panel.tsx`

- [ ] Replace mock-only reservations with source-aware Dineout/Zomato District desk data.
- [ ] Add waitlist, confirmation state, seating, party-size balancing, and no-show insight.
- [ ] Make the flow believable for a busy host stand.

## Chunk 4: Inventory and Back Office

### Task 7: Expand inventory APIs

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/inventory/route.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/inventory/[id]/route.ts`

- [ ] Add KPI summaries, stock risk indicators, movement history, and richer editable fields.
- [ ] Expose inventory operations needed by a serious stock management UI.

### Task 8: Rebuild inventory page

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/inventory/page.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/components/inventory/inventory-summary.tsx`

- [ ] Add summary cards, category views, reorder warnings, stock movement context, and item detail density.
- [ ] Make the page credible as a full inventory management system.

## Chunk 5: Reports, Settings, AI, and Languages

### Task 9: Deepen analytics

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/lib/analytics.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/reports/summary/route.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reports/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/dashboard/page.tsx`

- [ ] Expand executive insight blocks for payment mix, order mix, channel mix, prep performance, reservation conversion, stock health, and staff/device operations.
- [ ] Keep seven-day reporting visible and believable with seeded data.

### Task 10: Upgrade settings and localization

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/api/settings/route.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/settings/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/providers.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/lib/i18n.ts` (if not already completed in Chunk 1)

- [ ] Add outlet ops settings for devices, tablets, AI, language, delivery, reservations, service defaults, and theme.
- [ ] Add 10-language selector support with stable fallback labels.
- [ ] Preserve dark/light mode and make the system more feature-rich without crowding the UI.

### Task 11: Rebuild the AI assistant experience

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/lib/ai.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/ai-chatbot.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx`

- [ ] Move the assistant trigger so it no longer covers primary UI.
- [ ] Add Bhukkad branding, preset Q&A chips, canned answers, and calmer dock behavior.
- [ ] Make it accessible in both desktop and operational surfaces.

## Chunk 6: Tablet and QR Ordering

### Task 12: Build tablet session API

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/app/api/tablet/session/route.ts`

- [ ] Return table-aware tablet ordering bootstrap data using existing menu and outlet context.
- [ ] Include languages, categories, and ordering guard rails.

### Task 13: Build the customer tablet ordering experience

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/app/tablet/[tableId]/page.tsx`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/components/tablet/tablet-order-shell.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/pos/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`

- [ ] Build a first-class tablet/QR ordering flow with table awareness, language switching, modifiers, cart, and notes.
- [ ] Ensure submission reuses the existing orders pipeline.
- [ ] Expose the subsystem from operations surfaces without destabilizing POS flows.

## Chunk 7: Material 3 Polish and Final Verification

### Task 14: Final design system pass

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/button.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/card.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`

- [ ] Tighten tonal surfaces, readable accent usage, and Material 3 button/shape consistency.
- [ ] Verify the app feels richer and more colorful without sacrificing readability.

### Task 15: Verification

**Files:**
- Test only

- [ ] Run `npm run lint`
- [ ] Run `npm run build`
- [ ] Manually review dashboard, orders, delivery, reservations, inventory, reports, settings, and tablet ordering for legibility and interaction issues.
- [ ] Fix any final regressions before handoff.

## Notes

- Prioritize additive changes over risky schema rewrites.
- Prefer composable new components for richer modules instead of growing already-large pages indefinitely.
- Keep demo realism high, but every new subsystem must still feel like part of one coherent Bhukkad operating system.
