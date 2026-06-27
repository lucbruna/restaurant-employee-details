# Bhukkad Brand Guideline System And App-Wide UI Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Bhukkad's canonical brand system, export a full-color editorial brand guideline PDF, and hard-replace the current UI across every major app surface in the same pass.

**Architecture:** Create a single brand source of truth under `docs/brand/`, derive implementation contracts from a shared brand manifest plus semantic CSS/Tailwind tokens, refresh shell and primitives before route sweeps, and generate the PDF from styled HTML plus screenshots of the refactored live app. Keep compatibility aliases short-lived and remove them before final verification so docs, tokens, components, and PDF all describe the same shipped system.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, next/font, next-themes, motion, lucide-react, Node scripts via `tsx`, Playwright (new dev dependency for screenshot and PDF automation)

---

This remains one implementation plan because the detailed brand docs, the live token contract, the app-wide route refactor, the captured screenshots, and the final PDF all depend on the same final visual system. Splitting them would create drift between what Bhukkad says it is and what the shipped product actually looks like.

## File Structure

### Documentation And Source Of Truth

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/BRANDING.md`
  - Convert the current summary into a hub that points to the full brand library and the live token contract.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/core.md`
  - Canonical positioning, principles, audience, and approved visual direction.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/voice-and-messaging.md`
  - Tone rules, approved vocabulary, headline patterns, and do/don't guidance.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/logo-and-usage.md`
  - Logo variants, clear space, minimum sizes, contrast rules, and misuse examples.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/color-system.md`
  - Primitive palette families, semantic roles, ratios, and print-aware values.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/typography.md`
  - Sora and Manrope usage, hierarchy, spacing, casing, and rhythm.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/imagery-iconography.md`
  - Photography, illustration, icon, texture, and pattern guidance.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/product-expression.md`
  - How the brand shows up in dashboard, POS, kitchen, tablet, login, and landing surfaces.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`
  - Final token naming contract and mapping between primitive and semantic roles.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`
  - Migration notes, temporary alias cleanup notes, and final implementation rules.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md`
  - Route-by-route verification checklist for the final UI pass.

### Brand Metadata, Assets, And Automation

- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/manifest.ts`
  - Typed brand metadata reused by docs, code, screenshot automation, and PDF generation.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/tokens.ts`
  - Shared token tables and human-readable labels for semantic role documentation.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/screens.ts`
  - Typed list of routes, viewports, and screenshot IDs used for capture and manual audit.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-wordmark-light.svg`
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-wordmark-dark.svg`
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-mark-light.svg`
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-mark-dark.svg`
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-pattern-spice-house.svg`
  - Standalone exported brand assets derived from the canonical mark and approved material language.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/scripts/capture-brand-screenshots.ts`
  - Capture selected routes into the PDF source image directory.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/scripts/render-brand-pdf.ts`
  - Print the editorial HTML source to the final PDF artifact.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/package.json`
  - Add `brand:screens` and `brand:pdf` scripts plus the new Playwright dependency.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/package-lock.json`
  - Lockfile update for the PDF and screenshot automation dependency.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.html`
  - Presentation-grade editorial layout source.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.css`
  - Print-oriented styles for the PDF source.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/images/screens/.gitkeep`
  - Stable capture directory for generated screenshots.
- **Create:** `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf`
  - Final generated artifact.

### Foundation And Theme Layer

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/layout.tsx`
  - Font loading, metadata, and theme color alignment.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css`
  - Primitive palette families, semantic tokens, elevation, motion, surface, and text contracts.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts`
  - Tailwind exposure of the final semantic contract.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/providers.tsx`
  - Theme and toast styling alignment.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/theme/theme-toggle.tsx`
  - Final light/dark affordance treatment.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx`
  - Canonical mark sizing and usage behavior.
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/lib/utils/motion.ts`
  - Editorial motion timing/easing helpers that match the new system.

### Shell And Global State Surfaces

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/layout.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/loading.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/error.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/loading.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/error.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/not-found.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/app-shell.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/layout/breadcrumb.tsx`
  - Establish the premium hospitality shell and all fallback states.

### Shared UI Primitives

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/avatar.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/badge.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/button.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/card.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/checkbox.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/command.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/date-picker.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/dialog.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/drawer.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/dropdown-menu.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/input.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/label.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/popover.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/progress.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/radio-group.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/scroll-area.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/select.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/separator.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/skeleton.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/state-panel.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/stepper.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/switch.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/table.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/tabs.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/textarea.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/ui/tooltip.tsx`
  - Shared primitives must become the implementation bedrock for the entire route sweep.

### Route And Domain Surfaces

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/dashboard/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/orders/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/tables/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reservations/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/menu/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/menu/indian/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/inventory/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/customers/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/kitchen/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/kot/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reports/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/settings/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/pos/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/tablet-ordering/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/login/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/page.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/app/tablet/[tableId]/page.tsx`

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/menu/category-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/menu/menu-item-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/menu/modifiers-tab.tsx`

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/ai-chatbot.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/category-tabs.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/customer-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/discount-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/item-grid.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/kot-badge.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/modifier-sheet.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/order-cart.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/payment-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/quick-search.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/reservation-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/split-bill-modal.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/table-card.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/pos/table-floor-plan.tsx`

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/kitchen-stats.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/kot-card.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/ticket-card.tsx`
- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/timer-badge.tsx`

- **Modify:** `/Users/debadritamukhopadhyay/Bhukkad/components/tablet/tablet-order-shell.tsx`
  - Every live product surface must adopt the same final token and component contract.

## Chunk 1: Brand Source Of Truth

### Task 1: Scaffold the detailed brand library

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/BRANDING.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/core.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/voice-and-messaging.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/logo-and-usage.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/color-system.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/typography.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/imagery-iconography.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/product-expression.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md`

- [ ] Create the `docs/brand/` source tree and stub every approved chapter before touching product UI.
- [ ] Rewrite `/Users/debadritamukhopadhyay/Bhukkad/BRANDING.md` into a concise entry point that links to the new chapter files instead of duplicating raw token values.
- [ ] Populate `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md` with every route and component family that must be visually checked during final QA.
- [ ] Run `rg --files /Users/debadritamukhopadhyay/Bhukkad/docs/brand`
  - Expected: all brand source files appear exactly once.
- [ ] Commit with `git commit -m "docs: scaffold bhukkad brand library"`

### Task 2: Create the reusable brand manifest and exported assets

**Files:**
- Create: `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/manifest.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/tokens.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-wordmark-light.svg`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-wordmark-dark.svg`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-mark-light.svg`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-mark-dark.svg`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/public/brand/bhukkad-pattern-spice-house.svg`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx`

- [ ] Define typed brand metadata in `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/manifest.ts` for palette families, semantic roles, typography, spacing intent, logo rules, and usage notes.
- [ ] Add `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/tokens.ts` so documentation tables and code-facing labels pull from the same canonical names.
- [ ] Export standalone light and dark SVG brand assets into `/Users/debadritamukhopadhyay/Bhukkad/public/brand/` and align `/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx` to the same proportions and variant names.
- [ ] Run `npx eslint /Users/debadritamukhopadhyay/Bhukkad/lib/brand/manifest.ts /Users/debadritamukhopadhyay/Bhukkad/lib/brand/tokens.ts /Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx`
  - Expected: no lint errors.
- [ ] Commit with `git commit -m "feat: add bhukkad brand manifest and assets"`

## Chunk 2: Token Contract And Global Shell

### Task 3: Replace the global token contract

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/layout.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/providers.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/theme/theme-toggle.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/lib/utils/motion.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`

- [ ] Replace the current orange/slate token set with the approved primitive families: spice, neutral, freshness, and utility.
- [ ] Expose the final semantic role contract in both `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css` and `/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts` so code and docs use the same names.
- [ ] Update `/Users/debadritamukhopadhyay/Bhukkad/app/layout.tsx`, `/Users/debadritamukhopadhyay/Bhukkad/components/providers.tsx`, and `/Users/debadritamukhopadhyay/Bhukkad/components/theme/theme-toggle.tsx` so metadata, theme colors, and global chrome feel native to the new palette.
- [ ] Add restrained editorial motion timing and easing helpers in `/Users/debadritamukhopadhyay/Bhukkad/lib/utils/motion.ts`.
- [ ] Run `npm run lint && npm run build`
  - Expected: ESLint passes, Next.js build passes, `tsc -p tsconfig.server.json` passes.
- [ ] Commit with `git commit -m "feat: ship bhukkad brand token foundation"`

### Task 4: Refactor the app shell and fallback states

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/layout.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/loading.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/error.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/loading.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/error.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/not-found.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/app-shell.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/layout/breadcrumb.tsx`

- [ ] Rebuild the dashboard shell around premium hospitality surfaces, calmer spacing, and stronger editorial hierarchy.
- [ ] Update global and dashboard loading, error, and not-found states so they feel intentional rather than default framework fallback surfaces.
- [ ] Preserve the full-screen exceptions for `/pos` and `/kitchen` without leaking old shell colors or spacing hacks back into those routes.
- [ ] Manually review `/dashboard`, `/orders`, `/pos`, and `/kitchen` after the shell pass.
  - Expected: navigation, page framing, and fallback states all read as one system.
- [ ] Commit with `git commit -m "feat: refactor bhukkad shell for new brand"`

## Chunk 3: Shared UI Primitives

### Task 5: Refresh action and input primitives

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/button.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/input.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/textarea.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/select.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/checkbox.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/radio-group.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/switch.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/dialog.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/drawer.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/popover.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/dropdown-menu.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/date-picker.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/label.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/command.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/stepper.tsx`

- [ ] Update action and input primitives to the new radii, text hierarchy, border contrast, and focus-ring behavior.
- [ ] Remove hard-coded one-off utility classes that still reference the old color assumptions and replace them with semantic token usage.
- [ ] Normalize every overlay component so elevated surfaces, backdrop treatments, and motion feel like the same family.
- [ ] Run `npx eslint /Users/debadritamukhopadhyay/Bhukkad/components/ui`
  - Expected: no lint errors across the primitive layer.
- [ ] Commit with `git commit -m "feat: update bhukkad action and input primitives"`

### Task 6: Refresh display and data primitives

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/card.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/badge.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/avatar.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/tabs.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/table.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/progress.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/skeleton.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/state-panel.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/scroll-area.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/separator.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/ui/tooltip.tsx`

- [ ] Rework cards, tables, badges, and state surfaces so analytics and operations pages feel richer without losing scan speed.
- [ ] Standardize status badge semantics for service, urgency, success, warning, error, and informational accents.
- [ ] Tune data density for report-heavy surfaces so the new styling improves hierarchy instead of inflating layouts unnecessarily.
- [ ] Manually review `/dashboard`, `/reports`, `/inventory`, and `/customers`.
  - Expected: containers, badges, and tables stay legible in both light and dark themes.
- [ ] Commit with `git commit -m "feat: update bhukkad display primitives"`

## Chunk 4: Management And Back-Office Surfaces

### Task 7: Refactor the overview, reporting, and account management routes

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/dashboard/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reports/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/customers/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/settings/page.tsx`

- [ ] Replace generic admin-stat layouts with calmer editorial sectioning, premium metric grouping, and stronger visual rhythm.
- [ ] Align charts, filters, tables, and settings forms to the refreshed primitive set instead of route-local styling.
- [ ] Keep operational clarity first on `/settings` and `/customers`; do not let these pages drift into marketing-only styling.
- [ ] Run `npm run lint` and manually review the four routes above.
  - Expected: page-level chrome, metrics, and forms feel cohesive with the new shell and primitives.
- [ ] Commit with `git commit -m "feat: refactor analytics and management pages"`

### Task 8: Refactor menu, inventory, and tablet-admin surfaces

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/inventory/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/menu/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/menu/indian/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/tablet-ordering/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/menu/category-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/menu/menu-item-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/menu/modifiers-tab.tsx`

- [ ] Apply the new token system to dense catalog and inventory editing flows without sacrificing speed or clarity.
- [ ] Harmonize menu modals and tablet-ordering admin controls with the updated overlay and form primitives.
- [ ] Verify item cards, imagery, field groups, and tab structures follow the same spacing and typography rules as the rest of the app.
- [ ] Run `npm run lint` and manually review `/inventory`, `/menu`, `/menu/indian`, and `/tablet-ordering`.
  - Expected: these routes feel integrated with the rest of Bhukkad rather than like separate mini-apps.
- [ ] Commit with `git commit -m "feat: refactor catalog and inventory surfaces"`

## Chunk 5: Service-Floor, Kitchen, And Guest Surfaces

### Task 9: Refactor dining-room management routes

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/orders/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/tables/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/reservations/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/table-card.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/table-floor-plan.tsx`

- [ ] Recompose `/orders`, `/tables`, and `/reservations` around service rhythm: urgency, occupancy, queue state, and table awareness.
- [ ] Update floor-plan and table-card components so occupancy and service states rely on the new badge and surface semantics instead of one-off highlights.
- [ ] Check filter bars, status chips, tables, and action clusters for contrast and spacing under heavy-use conditions.
- [ ] Run `npm run lint` and manually review `/orders`, `/tables`, and `/reservations`.
  - Expected: service-floor pages remain glanceable and calmer under dense operational data.
- [ ] Commit with `git commit -m "feat: refactor dining room management surfaces"`

### Task 10: Refactor POS, kitchen, and KOT live-service surfaces

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/pos/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/kitchen/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/kot/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/ai-chatbot.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/category-tabs.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/customer-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/discount-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/item-grid.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/kot-badge.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/modifier-sheet.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/order-cart.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/payment-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/quick-search.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/reservation-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/pos/split-bill-modal.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/kitchen-stats.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/kot-card.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/ticket-card.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/kitchen/timer-badge.tsx`

- [ ] Apply the hard-replacement brand system across POS flows, cart behavior, payment actions, modifier sheets, split-bill handling, and the AI dock.
- [ ] Refactor kitchen and KOT surfaces so urgency states use warmer but more controlled contrast while preserving instant readability.
- [ ] Keep full-screen behavior intact for `/pos` and `/kitchen`, but remove leftover shell-era styling assumptions from local components.
- [ ] Run `npm run lint` and manually review `/pos`, `/kitchen`, and `/kot`.
  - Expected: the live-service views feel faster, clearer, and visibly part of the same Bhukkad family.
- [ ] Commit with `git commit -m "feat: refactor pos kitchen and kot surfaces"`

### Task 11: Refactor guest-facing entry and tablet routes

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/login/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/tablet/[tableId]/page.tsx`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/components/tablet/tablet-order-shell.tsx`

- [ ] Refactor the root route and login flow so they bridge brand storytelling with product credibility.
- [ ] Rework the tablet ordering experience to feel simpler, warmer, and more welcoming while still sharing the same token and typography system.
- [ ] Verify guest-facing CTAs, spacing, and content density are intentionally lighter than staff-facing dashboards.
- [ ] Run `npm run lint` and manually review `/`, `/login`, and at least one `/tablet/[tableId]` route.
  - Expected: entry and guest flows feel clearly Bhukkad without reusing dashboard density patterns.
- [ ] Commit with `git commit -m "feat: refactor guest and entry surfaces"`

## Chunk 6: Editorial PDF Pipeline

### Task 12: Add screenshot capture and PDF generation automation

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/package.json`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/package-lock.json`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/screens.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/scripts/capture-brand-screenshots.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/scripts/render-brand-pdf.ts`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.html`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.css`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/images/screens/.gitkeep`

- [ ] Add `playwright` as a dev dependency, update `/Users/debadritamukhopadhyay/Bhukkad/package-lock.json`, and register `brand:screens` and `brand:pdf` scripts in `/Users/debadritamukhopadhyay/Bhukkad/package.json`.
- [ ] Create `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/screens.ts` as the typed route and viewport manifest used by both automated capture and manual QA.
- [ ] Write `/Users/debadritamukhopadhyay/Bhukkad/scripts/capture-brand-screenshots.ts` to capture the refactored live routes into `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/images/screens/`.
- [ ] Write `/Users/debadritamukhopadhyay/Bhukkad/scripts/render-brand-pdf.ts` to print `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.html` to `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf`.
- [ ] Run `npx playwright install chromium`
  - Expected: Chromium installed for deterministic capture and PDF rendering.
- [ ] Commit with `git commit -m "feat: add bhukkad brand pdf automation"`

### Task 13: Build the editorial brand guideline artifact

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/core.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/voice-and-messaging.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/logo-and-usage.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/color-system.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/typography.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/imagery-iconography.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/product-expression.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.html`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.css`
- Create: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf`

- [ ] Fill every `docs/brand/*.md` chapter with final copy, token tables, do/don't rules, and product-expression guidance that matches the shipped UI.
- [ ] Build the approved PDF structure in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.html` and `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/brand-guidelines.css`.
- [ ] Use only screenshots captured from the refactored app; remove any placeholder images before generating the artifact.
- [ ] Run `npm run brand:screens && npm run brand:pdf`
  - Expected: fresh screenshots land in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/images/screens/` and the PDF is regenerated at `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf`.
- [ ] Visually inspect the PDF for page breaks, font rendering, color fidelity, caption correctness, and cover/detail balance.
- [ ] Commit with `git commit -m "docs: finalize bhukkad editorial brand guidelines"`

## Chunk 7: Hard-Replacement Cleanup And Verification

### Task 14: Remove temporary aliases and align naming everywhere

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/lib/brand/tokens.ts`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`

- [ ] Delete or collapse the temporary compatibility aliases that were only needed during the migration.
- [ ] Update `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md` and `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md` so final names match the shipped CSS and Tailwind contract exactly.
- [ ] Run `rg "(primary-dark|primary-light|slate|gray-|orange-)" /Users/debadritamukhopadhyay/Bhukkad/app /Users/debadritamukhopadhyay/Bhukkad/components /Users/debadritamukhopadhyay/Bhukkad/lib`
  - Expected: only intentional references remain, with no stray legacy theme usage.
- [ ] Run `npm run lint && npm run build`
  - Expected: clean lint and build after alias cleanup.
- [ ] Commit with `git commit -m "chore: remove legacy brand token aliases"`

### Task 15: Final verification and handoff

**Files:**
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`
- Modify: `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf`

- [ ] Manually review every route listed in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md` and mark each surface as verified.
- [ ] Re-run `npm run brand:screens && npm run brand:pdf && npm run lint && npm run build`
  - Expected: screenshots refresh, PDF regenerates, lint passes, build passes.
- [ ] Confirm that shell, primitives, dashboard routes, POS, kitchen, login, root page, and tablet ordering all feel like one premium hospitality system in both light and dark themes.
- [ ] Capture any last implementation caveats or follow-up rules in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md`.
- [ ] Commit with `git commit -m "docs: close bhukkad brand refactor verification"`

## Success Checks Before Declaring Completion

- The detailed source of truth exists under `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/`.
- `/Users/debadritamukhopadhyay/Bhukkad/app/globals.css` and `/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts` expose the same final semantic contract described in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md`.
- Shared primitives under `/Users/debadritamukhopadhyay/Bhukkad/components/ui/` no longer rely on leftover legacy brand assumptions.
- Every major route family in `/Users/debadritamukhopadhyay/Bhukkad/app/` has been visually refactored and checked off in `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/route-audit.md`.
- The final PDF at `/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf` is generated from the live docs and captured app screenshots, not from placeholder art.
- Temporary token aliases introduced during migration are removed before handoff.
