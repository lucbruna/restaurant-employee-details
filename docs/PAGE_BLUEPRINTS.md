# Bhukkad Page Blueprints

This document maps the current Bhukkad product route by route so another agent can rebuild the site without guessing page purpose, audience, or layout behavior.

## Route Summary

| Route | Audience | Role |
| --- | --- | --- |
| `/` | internal | redirect to dashboard |
| `/login` | staff | credentials entry |
| `/dashboard` | staff | operations overview |
| `/pos` | staff | active service console |
| `/kitchen` | staff | dark kitchen display |
| `/kot` | staff | KOT queue management |
| `/orders` | staff | order history and settlement visibility |
| `/menu` | staff | menu management |
| `/menu/indian` | staff/demo | lightweight menu showcase route |
| `/inventory` | staff | stock management |
| `/customers` | staff | customer profiles |
| `/reports` | staff | analytics and reporting |
| `/reservations` | staff | reservation board |
| `/tables` | staff | section and table layout editor |
| `/tablet-ordering` | staff | manage guest ordering entry points |
| `/settings` | staff | outlet configuration |
| `/tablet/[tableId]` | guests | public table ordering flow |

## `/`

- Audience: internal
- Purpose: immediate redirect entrypoint
- Layout treatment: none
- Main implementation anchor: `app/page.tsx`
- Data dependencies: none
- Fidelity notes: must redirect straight to `/dashboard`

## `/login`

- Audience: staff
- Purpose: sign in to the operations suite
- Layout treatment: centered auth card with floating theme toggle
- Main implementation anchors:
  - `app/login/page.tsx`
  - `components/brand/brand-mark.tsx`
- Main components:
  - `BrandMark` with tagline
  - `ThemeToggle`
  - `Card`, `Input`, `Button`
- Data dependencies:
  - NextAuth credentials sign-in
- Fidelity notes:
  - keep the welcome copy and centered card composition
  - preserve the polished single-card presentation, not a split-screen auth layout

## `/dashboard`

- Audience: managers and operators
- Purpose: quick outlet health read across sales, orders, customers, and top items
- Layout treatment: standard staff shell with a large hero panel and KPI/report cards
- Main implementation anchors:
  - `app/(dashboard)/dashboard/page.tsx`
  - `/api/dashboard/overview`
- Main components:
  - hero card with eyebrow `Bhukkad Service Pulse`
  - title `Outlet Dashboard`
  - KPI stat cards
  - sales trend area chart
  - top-selling items list
- Data dependencies:
  - `/dashboard/overview`
- Fidelity notes:
  - the page should feel premium and airy, not dense
  - chart styling should use the Bhukkad brand palette and rounded containers

## `/pos`

- Audience: cashiers and floor staff
- Purpose: run live table service, takeaway, delivery, customer selection, and cart assembly
- Layout treatment: immersive full-surface service console with no standard header
- Main implementation anchors:
  - `app/(dashboard)/pos/page.tsx`
  - `components/pos/*`
  - `/api/menu/categories`
  - `/api/menu/items`
  - `/api/tables`
- Main components:
  - hero with eyebrow `Bhukkad Service Console`
  - title `Faster service, cleaner table control`
  - service mode tabs
  - quick actions
  - category rail
  - item grid
  - order cart
  - floor plan dialog
  - customer modal
  - AI chatbot
- Data dependencies:
  - auth session for outlet id
  - menu categories and items
  - table/section state
  - socket events for live table updates
- Fidelity notes:
  - preserve header suppression
  - preserve the wide three-zone composition
  - this should feel fast, touch-friendly, and operator-centered

## `/kitchen`

- Audience: kitchen staff
- Purpose: receive, monitor, and update active kitchen tickets
- Layout treatment: dark, high-contrast, low-distraction workspace with no standard header
- Main implementation anchors:
  - `app/(dashboard)/kitchen/page.tsx`
  - `components/kitchen/kot-card.tsx`
  - `/api/kitchen/kots`
- Main components:
  - top stats bar
  - title `Kitchen Display`
  - filter chips
  - dense KOT card grid
  - timer and toast feedback
- Data dependencies:
  - auth session for outlet id
  - `/kitchen/kots`
  - socket `kot:new` and `kot:updated`
- Fidelity notes:
  - preserve the dark visual mode
  - preserve audio/toast behavior for new orders
  - this page should optimize for speed and glanceability, not shell consistency

## `/kot`

- Audience: kitchen and service coordinators
- Purpose: monitor and update ticket progress through the KOT-focused management surface
- Layout treatment: standard staff shell, but operational and status-forward
- Main implementation anchors:
  - `app/(dashboard)/kot/page.tsx`
- Main components:
  - prominent title `Kitchen Display System`
  - ticket grouping/status controls
- Data dependencies:
  - kitchen KOT APIs and related status endpoints
- Fidelity notes:
  - keep this distinct from the darker `/kitchen` page
  - this is the shell-integrated KOT view, not the immersive kitchen wallboard

## `/orders`

- Audience: managers and front-of-house staff
- Purpose: review order history, settlement state, and active checks
- Layout treatment: standard staff shell with summary metrics and card-based history
- Main implementation anchors:
  - `app/(dashboard)/orders/page.tsx`
  - `/api/orders/history`
- Main components:
  - eyebrow `Bhukkad Service Ledger`
  - search and status filters
  - summary tiles
  - order history cards
- Data dependencies:
  - `/orders/history`
- Fidelity notes:
  - maintain clear paid vs active state visibility
  - do not reduce this to a generic flat table unless intentionally redesigning

## `/menu`

- Audience: managers
- Purpose: manage categories, items, variants, modifiers, and menu structure
- Layout treatment: standard staff shell with CRUD-heavy management panels
- Main implementation anchors:
  - `app/(dashboard)/menu/page.tsx`
  - `app/api/menu/**`
- Main components:
  - menu sections and management panels
  - item/category forms
  - modifier workflows
- Data dependencies:
  - menu categories, items, modifier groups, modifiers
- Fidelity notes:
  - this is one of the core back-office workflows and should feel robust, not demo-like

## `/menu/indian`

- Audience: staff/demo
- Purpose: lightweight route showing a hardcoded Indian menu set
- Layout treatment: simpler than the main menu system
- Main implementation anchor:
  - `app/(dashboard)/menu/indian/page.tsx`
- Data dependencies:
  - local hardcoded data
- Fidelity notes:
  - treat this as a lightweight showcase/demo route, not the authoritative menu management experience

## `/inventory`

- Audience: managers and stock controllers
- Purpose: view and manage stock levels
- Layout treatment: standard staff shell with hero, search, CTA, and tabular stock view
- Main implementation anchors:
  - `app/(dashboard)/inventory/page.tsx`
  - `/api/inventory`
- Main components:
  - eyebrow `Bhukkad Stockroom`
  - title `Inventory control with calmer operating contrast`
  - search
  - add item CTA
  - stock table with status badges
- Data dependencies:
  - `/inventory`
- Fidelity notes:
  - preserve the calmer operational feel compared to POS/Kitchen

## `/customers`

- Audience: front-of-house and managers
- Purpose: manage guest profiles and lifetime value context
- Layout treatment: standard staff shell with search, add/edit dialog, and customer table
- Main implementation anchors:
  - `app/(dashboard)/customers/page.tsx`
  - `/api/customers`
- Main components:
  - eyebrow `Bhukkad Guestbook`
  - title `Customer profiles with cleaner service context`
  - search field
  - add customer CTA
  - customer table
  - create/edit dialog
- Data dependencies:
  - `/customers`
- Fidelity notes:
  - keep customer spend/order context visible, not just contact data

## `/reports`

- Audience: managers and owners
- Purpose: review reporting and operational analytics
- Layout treatment: standard staff shell with analytics-first hero and data panels
- Main implementation anchors:
  - `app/(dashboard)/reports/page.tsx`
- Main components:
  - eyebrow `Bhukkad Weekly Pulse`
  - title `Analytics & Reports`
  - charting/report blocks
- Data dependencies:
  - reporting endpoints and analytics helpers
- Fidelity notes:
  - preserve the more editorial analytics tone of this page
  - the page should feel like a premium reporting surface, not a raw metrics dump

## `/reservations`

- Audience: front-of-house and managers
- Purpose: review and act on upcoming bookings
- Layout treatment: standard staff shell with hero, summary cards, and reservation list/cards
- Main implementation anchors:
  - `app/(dashboard)/reservations/page.tsx`
- Main components:
  - eyebrow `Bhukkad Guest Book`
  - title `Reservations`
  - add reservation CTA
  - summary counters
  - reservation cards
- Data dependencies:
  - currently uses mock/demo-oriented data in the page
- Fidelity notes:
  - call this page functional but not fully production-deep yet
  - keep the guest-book framing and hospitality tone

## `/tables`

- Audience: managers and floor planners
- Purpose: edit dining sections and tables, reserve tables, and manage layout
- Layout treatment: standard staff shell with an interactive editor
- Main implementation anchors:
  - `app/(dashboard)/tables/page.tsx`
  - `components/pos/table-floor-plan.tsx`
  - `components/tables/reservation-modal.tsx`
- Main components:
  - section tabs
  - add section/table actions
  - save layout action
  - drag-and-drop canvas
  - properties panel for the selected table
  - reservation modal
  - AI chatbot
- Data dependencies:
  - `/api/tables/**`
- Fidelity notes:
  - preserve the editable canvas character
  - do not reduce this page to a simple list of tables

## `/tablet-ordering`

- Audience: managers
- Purpose: control and distribute guest ordering entry points
- Layout treatment: standard staff shell with status overview and per-table access cards
- Main implementation anchors:
  - `app/(dashboard)/tablet-ordering/page.tsx`
  - `lib/tablet-ordering.ts`
- Main components:
  - eyebrow `Tablet / QR Ordering`
  - title `First-Class Guest Ordering`
  - feature status summary
  - default language display
  - settings CTA
  - per-table cards with open/copy guest link actions
- Data dependencies:
  - settings
  - tables
  - tablet ordering link generation
- Fidelity notes:
  - preserve the manager-control framing instead of treating this like the public guest experience

## `/settings`

- Audience: managers and owners
- Purpose: configure outlet identity, billing, service behavior, guest ordering, and future admin settings
- Layout treatment: standard staff shell with a large control-room hero and tabbed settings sections
- Main implementation anchors:
  - `app/(dashboard)/settings/page.tsx`
  - `/api/settings`
- Main components:
  - eyebrow `Bhukkad Control Room`
  - title `Outlet Settings`
  - save CTA
  - tabs for general, billing, service, guest ordering, users, notifications
- Data dependencies:
  - `/settings`
- Fidelity notes:
  - `users` and `notifications` are currently more placeholder than fully finished
  - keep the control-room framing and high-confidence management tone

## `/tablet/[tableId]`

- Audience: guests
- Purpose: browse the menu, customize items, and place a table-side order without staff-shell access
- Layout treatment: public ordering shell implemented through a dedicated component
- Main implementation anchors:
  - `app/tablet/[tableId]/page.tsx`
  - `components/tablet/tablet-order-shell.tsx`
  - `/api/tablet/session`
- Main components:
  - eyebrow `Bhukkad Table Ordering` in English mode
  - guest-facing welcome hero
  - language selector
  - category filtering and search
  - item detail/customization dialog
  - cart summary
  - special instructions
  - order placement confirmation
- Data dependencies:
  - `/tablet/session`
  - tablet ordering feature flags
  - public menu/bootstrap payload
- Fidelity notes:
  - preserve the larger touch-friendly controls
  - preserve multilingual copy support
  - this page must remain clearly distinct from the staff shell

## Cross-Page Fidelity Notes

- Standard staff pages should inherit the shared sidebar and sticky header.
- `/pos` and `/kitchen` should not.
- The product tone should stay hospitality-led, not generic SaaS-admin.
- Orange is the primary action color, but the shell should still feel bright and calm rather than aggressive.
- Where pages feel partially scaffolded today, document that honestly instead of smoothing over the difference.
