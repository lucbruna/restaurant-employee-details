# Bhukkad Brand Guideline System And App-Wide UI Refactor Design

**Date:** 2026-03-23  
**Project:** Bhukkad  
**Scope:** Create a canonical Bhukkad brand system, generate a presentation-grade full-color brand guideline PDF, and refactor the entire live app UI to match the new system in the same pass.

## Goal

Transform Bhukkad from a product with a partially expressed warm brand into a fully coherent hospitality identity system that exists in three forms at once:

1. a living in-repo brand library
2. a canonical token and component expression system used by the product
3. a polished editorial PDF brand book with reference-level completeness

The end state should feel like a premium restaurant operating system with a warm, composed, service-aware visual identity rather than a generic SaaS dashboard with orange accents.

## Reference Benchmark

The desired level of documentation detail is comparable to the depth and completeness of the GlobalLogic brand guide:

- [GlobalLogic Brand Guide](https://www.globallogic.com/wp-content/uploads/2022/06/GL_BrandGuide.pdf)

Bhukkad should match that document's rigor and breadth, but not its visual tone. Bhukkad's guide should be editorial, premium, and hospitality-led rather than formal corporate.

## Approved Direction

The following decisions were validated during brainstorming:

- Approach: full design-system documentation set
- Brand direction: `Spice House`
- Scope: full brand system, not just a color refresh
- Delivery: documentation, canonical token system, full app-wide UI refactor, and PDF
- Audience: both internal and external
- Cultural expression: globally polished with subtle Indian cues
- PDF visual language: editorial + premium hospitality
- Product migration strategy: hard replacement end state, with only minimal temporary compatibility aliases during implementation if needed

## Core Brand Expression

Bhukkad should be positioned as a premium restaurant operating system that feels warm, composed, and service-aware. It should look globally polished first, with Indian influence expressed through warmth, richness, rhythm, naming flavor, and material cues rather than overt motifs or stereotype-driven decoration.

The brand should be governed by four principles:

- `Warm precision`: hospitality warmth paired with operational control
- `Premium but grounded`: richer, more tactile surfaces without becoming ornamental
- `Service rhythm`: clarity, calm, urgency, and movement shaped by how real dining rooms run
- `Subtle cultural depth`: spice warmth and sensory depth without themed visual cliches

This expression should carry across documentation, UI components, dashboards, POS workflows, kitchen surfaces, and the tablet ordering experience.

## Existing Context

Bhukkad already has a usable visual baseline:

- a root [BRANDING.md](/Users/debadritamukhopadhyay/Bhukkad/BRANDING.md)
- a live token system in [app/globals.css](/Users/debadritamukhopadhyay/Bhukkad/app/globals.css)
- Tailwind mappings in [tailwind.config.ts](/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts)
- a current brand mark in [components/brand/brand-mark.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx)
- a reasonably broad product surface already built across dashboard, POS, kitchen, menu, reports, tablet ordering, and shared UI primitives

The main gap is inconsistency. The existing documentation, live tokens, component styling, and product pages do not yet behave like one canonical system.

## Requested Outcome

This pass must deliver all of the following together:

- canonical Bhukkad brand rules
- detailed written brand documentation
- a full-color shareable PDF
- a full app-wide UI refactor that applies the new system everywhere

This is explicitly not a docs-only pass.

## Brand System Deliverables

The brand system should be documented as a structured library, with one document per major concern:

- [BRANDING.md](/Users/debadritamukhopadhyay/Bhukkad/BRANDING.md)
- [docs/brand/core.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/core.md)
- [docs/brand/voice-and-messaging.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/voice-and-messaging.md)
- [docs/brand/logo-and-usage.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/logo-and-usage.md)
- [docs/brand/color-system.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/color-system.md)
- [docs/brand/typography.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/typography.md)
- [docs/brand/imagery-iconography.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/imagery-iconography.md)
- [docs/brand/product-expression.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/product-expression.md)
- [docs/brand/design-tokens.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/design-tokens.md)
- [docs/brand/implementation-notes.md](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/implementation-notes.md)
- [docs/brand/pdf-source/](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf-source/)
- [docs/brand/pdf/bhukkad-brand-guidelines.pdf](/Users/debadritamukhopadhyay/Bhukkad/docs/brand/pdf/bhukkad-brand-guidelines.pdf)

The root brand doc should become an entry point, while the docs folder becomes the detailed source of truth.

## Source Of Truth Flow

The system should have one clear directional flow so the brand guide, implementation, and PDF do not drift apart:

1. brand principles and usage rules are defined in `docs/brand/`
2. design tokens are derived from those rules in `docs/brand/design-tokens.md`
3. canonical implementation tokens are encoded in [app/globals.css](/Users/debadritamukhopadhyay/Bhukkad/app/globals.css) and [tailwind.config.ts](/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts)
4. shared primitives in [components/ui/](/Users/debadritamukhopadhyay/Bhukkad/components/ui/) consume those tokens
5. product pages and route-specific components consume the shared primitives
6. final product screenshots and examples are pulled from the refactored app into the PDF

This means the PDF should describe the implemented system, not invent a parallel one.

## Product Surfaces In Scope

The refactor should cover the actual product, not just style primitives.

### Shell And Global Experience

- [app/layout.tsx](/Users/debadritamukhopadhyay/Bhukkad/app/layout.tsx)
- [app/globals.css](/Users/debadritamukhopadhyay/Bhukkad/app/globals.css)
- [components/layout/app-shell.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/layout/app-shell.tsx)
- [components/layout/header.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx)
- [components/layout/sidebar.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx)
- global loading, error, empty, not-found, and top-level entry surfaces

### Shared UI Primitive Layer

All shared primitives under [components/ui/](/Users/debadritamukhopadhyay/Bhukkad/components/ui/) are in scope, especially:

- button
- card
- input
- textarea
- badge
- table
- tabs
- dialog
- drawer
- select
- popover
- tooltip
- skeleton
- progress
- state panel
- stepper
- scroll area

These components must become the implementation bedrock for the rest of the app and the examples shown in the PDF.

### Dashboard And Operations Pages

The refactor must cover the pages under [app/(dashboard)/](/Users/debadritamukhopadhyay/Bhukkad/app/(dashboard)/), including:

- dashboard
- orders
- tables
- reservations
- menu
- inventory
- customers
- kitchen
- KOT
- reports
- settings
- tablet ordering admin

### POS And Transactional Flows

All POS-specific components under [components/pos/](/Users/debadritamukhopadhyay/Bhukkad/components/pos/) are in scope, including:

- table cards and floor plan
- item grid and category tabs
- order cart
- quick search
- chatbot dock
- customer, payment, discount, reservation, split bill, and modifier flows

### Guest Tablet Experience

The guest ordering surfaces must be visually aligned with the same system, while still feeling simpler and more welcoming:

- [app/tablet/[tableId]/page.tsx](/Users/debadritamukhopadhyay/Bhukkad/app/tablet/[tableId]/page.tsx)
- [components/tablet/tablet-order-shell.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/tablet/tablet-order-shell.tsx)

### Login And Marketing-Like Entry Surfaces

- [app/login/page.tsx](/Users/debadritamukhopadhyay/Bhukkad/app/login/page.tsx)
- [app/page.tsx](/Users/debadritamukhopadhyay/Bhukkad/app/page.tsx)

These routes should bridge brand storytelling and product clarity more strongly than purely operational screens.

## Canonical Visual System

`Spice House` becomes the canonical Bhukkad visual system.

### Primitive Palette

The foundation palette should be organized into families, not isolated swatches:

- primary spice family: deep saffron, ember, roasted orange, burnished gold
- neutral structural family: cream, parchment, stone, roasted clove, espresso, near-black
- freshness accent family: cardamom, sage, muted teal
- utility family: success, warning, error, info with hospitality-appropriate warmth

Each color should have digital values, print-aware values where useful for the PDF, and explicit usage guidance.

### Semantic Roles

The system should define semantic roles separate from raw hex values. Roles should include:

- brand primary
- primary emphasis
- accent
- accent muted
- background
- surface
- surface elevated
- surface contrast
- border subtle
- border strong
- text primary
- text secondary
- text inverse
- interactive hover
- interactive active
- focus ring
- success
- warning
- error
- info

This layer becomes the actual product contract.

### Product Tokens

Semantic roles should be implemented as canonical tokens mapped into:

- CSS custom properties in [app/globals.css](/Users/debadritamukhopadhyay/Bhukkad/app/globals.css)
- Tailwind theme exposure in [tailwind.config.ts](/Users/debadritamukhopadhyay/Bhukkad/tailwind.config.ts)
- component recipes in the shared UI layer

The goal is to make the token system the real engine of the UI, not a decorative documentation artifact.

## Typography System

Bhukkad should retain the existing Sora + Manrope pairing, but tighten role discipline.

### Sora

Use for:

- brand moments
- page titles
- section dividers
- hero language
- selected high-emphasis metrics or hospitality statements

Sora should feel editorial and expressive, not sprinkled arbitrarily into dense UI.

### Manrope

Use for:

- operational interfaces
- forms
- tables
- modal content
- detailed labels
- explanatory copy
- control text

The app should remain fast to scan under pressure. Manrope carries the system ergonomics.

### Typographic Guidance

The documentation and PDF should define:

- title hierarchy
- display usage rules
- body sizing
- metric sizing
- tracking and line-height intent
- sentence case vs title case behavior
- when expressive type is allowed and when it is not

## Logo And Identity Guidance

Bhukkad's existing [brand-mark.tsx](/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx) should be treated as the current canonical mark reference unless the refactor requires a direct improvement to make it production-worthy within the same visual family.

The brand system should define:

- primary wordmark behavior
- compact mark behavior
- clear space
- minimum sizes
- dark/light usage
- contrast expectations
- placement rules
- correct and incorrect usage

If no standalone asset pack exists yet, the documentation should say so explicitly and use the code-based mark as the current source of truth.

## Imagery, Iconography, And Pattern Direction

The brand should feel rooted in hospitality craft, not decorated like a food flyer.

### Imagery

Preferred imagery should feel:

- tactile
- warm
- ambient
- people-forward
- service-aware
- materially rich

It can include:

- plated food moments
- interior atmosphere
- hands in action
- metal, ceramic, linen, steam, light, and texture
- operational scenes with elegance rather than chaos

### Iconography

Icons should be:

- clean
- confident
- slightly rounded rather than harsh
- operationally clear
- aligned to the warmer component geometry

### Pattern Language

Patterns may be introduced, but should remain subtle. They can draw inspiration from:

- spice layering
- steam movement
- tiled hospitality spaces
- brass and ceramic rhythm
- structured floor-grid geometry from restaurant operations

Patterns are supporting elements, not the star of the system.

## Voice And Messaging

Bhukkad's written voice should be practical, confident, and human. It should avoid cold enterprise cliches and instead sound like a product that understands live service.

Preferred messaging qualities:

- direct
- calm
- assured
- operationally fluent
- hospitality-aware

Preferred language examples:

- "keep service moving"
- "see the floor clearly"
- "run every shift with confidence"
- "stay ahead of the rush"

Avoid language that sounds sterile or generic, such as:

- "optimize workflows"
- "unlock efficiencies"
- "streamline operational outcomes"

The PDF should include tone rules, sample messaging, and approved phrase styles.

## PDF Brand Book Design

The Bhukkad brand book should be a formal, reference-grade manual with editorial pacing.

### Tone And Feel

The PDF should feel:

- editorial
- premium
- warm
- spacious
- cinematic in section transitions
- technically disciplined where rules are explained

It should not feel like a corporate compliance deck.

### Format

Target length should be approximately `30-45 pages`, depending on how many application examples and do/don't pages are included.

The PDF should be built from a styled HTML source for layout control, then exported to PDF for reproducibility.

### Section Structure

The PDF should include, at minimum:

1. cover
2. contents
3. brand core
4. brand story and positioning
5. brand principles
6. voice and messaging
7. logo system
8. logo sizing and clear space
9. logo do and don't
10. color system
11. color roles and usage ratios
12. typography
13. typographic hierarchy
14. imagery and iconography
15. pattern and material language
16. product expression
17. component identity
18. design tokens
19. implementation mapping
20. app showcase examples
21. correct / incorrect application
22. closing asset and source-of-truth notes

### Layout Language

The document should use:

- a consistent editorial grid
- large section-opening spreads
- strong title pages
- refined captions and footers
- alternating narrative, technical, and showcase layouts
- side annotations for technical specs like HEX, RGB, CMYK, spacing, and token aliases

### Source Strategy

The PDF pipeline should be:

- narrative and technical source content in `docs/brand/`
- styled presentation source in `docs/brand/pdf-source/`
- generated artifact in `docs/brand/pdf/`

## App Refactor Strategy

The UI refactor should be implemented from the inside out.

### 1. Foundation Layer

Replace the token base and visual primitives first:

- CSS variables
- Tailwind mappings
- typography definitions
- radii
- borders
- shadows
- focus states
- surface hierarchy
- brand mark usage

### 2. Shell Layer

Refactor the app shell next so the new identity is immediately visible across routes:

- navigation
- header
- sidebar
- page wrappers
- breadcrumbs
- top-level loading and error states

This layer establishes the emotional tone of the application.

### 3. Primitive Layer

Refactor shared UI components before product pages so page work becomes composition instead of local styling churn.

### 4. Product Surface Layer

Sweep operational pages and route-specific components after primitives settle:

- dashboards
- data tables
- analytics
- kitchen workflows
- POS flows
- guest ordering
- login
- settings and system surfaces

### 5. Showcase And Verification Layer

Once the app is visually aligned, capture examples from the real refactor for use in the PDF and final documentation.

## Hard Replacement Strategy

The approved end state is a hard replacement of the current visual system.

That means:

- the old token system is not preserved as a permanent parallel layer
- temporary aliases may be used during implementation only to reduce breakage
- final components and pages should resolve to the new canonical token names and roles

The implementation notes should clearly document:

- which live values were transitional
- which final tokens replaced them
- what naming contract future work must follow

## Error Handling And Refactor Safeguards

This work is visual, but it still needs explicit failure handling.

### Brand System Risks

- token drift between docs and code
- component-level overrides that ignore semantic roles
- accidental color reuse outside approved roles
- typography becoming inconsistent across dense operational surfaces

### PDF Risks

- HTML source diverging from markdown source
- screenshots aging faster than the actual product
- export issues around fonts, page breaks, or image sizing

### Refactor Safeguards

- refactor shared primitives before page-level styling sweeps
- keep temporary token aliases short-lived and documented
- avoid route-by-route one-off style exceptions unless a real product need justifies them
- ensure dark and light treatment remain intentional if both modes are supported

## Testing And Verification Strategy

Verification must cover both implementation correctness and brand consistency.

### Technical Verification

- run lint
- run a production build
- manually inspect major routes after the refactor
- verify shared primitives still function correctly across dialogs, tables, drawers, forms, and tabs

### Visual Verification

- inspect shell consistency across all dashboard routes
- verify POS, kitchen, and tablet flows all feel like one family
- check spacing, hierarchy, and contrast in dense screens
- ensure action states, badges, and focus rings remain legible
- review mobile/tablet behavior for responsive surfaces

### Documentation Verification

- ensure docs and code use the same token names
- ensure the PDF reflects the final implemented system
- ensure screenshots used in the PDF come from the refactored app, not conceptual placeholders

## Success Criteria

This design is successful when all of the following are true:

1. Bhukkad has a canonical brand system documented in a structured, reusable brand library.
2. The live app visibly reflects that system across shell, primitives, and all major routes.
3. The UI feels like a premium hospitality operating system rather than a generic admin dashboard.
4. The brand book is detailed enough to stand alongside reference-grade corporate manuals in rigor while remaining warmer and more editorial in tone.
5. The final UI uses canonical tokens and semantic roles rather than legacy token names.
6. Product examples in the PDF are drawn from the actual refactored application.
7. Future work can treat the brand docs and token system as the source of truth rather than guesswork.

## Next Step

After this spec is reviewed and approved, the next phase should be to create a written implementation plan before touching the actual refactor work.
