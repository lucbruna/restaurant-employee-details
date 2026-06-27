# Bhukkad UI System

This document describes the current implemented UI system for Bhukkad.

## Primary Rule

For the current product, `app/globals.css` is the visual source of truth.

`BRANDING.md` is still useful for intent and vocabulary, but if the two disagree:

- use `app/globals.css` for exact recreation
- use `BRANDING.md` only as supporting context

## Design Character

Bhukkad is not sterile enterprise software. The product should feel like:

- a premium restaurant operations console
- operationally crisp but still warm
- rounded, layered, and tactile rather than flat
- bright and breathable in the staff shell
- faster and darker in kitchen mode

The overall aesthetic is:

- white and slate surfaces
- orange as the brand/action color
- teal as the supporting accent
- generous radius and shadow depth
- subtle atmospheric gradients instead of flat backgrounds

## Typography

Global fonts are set in `app/layout.tsx`.

- Sans/body font: `Manrope`
- Display font: `Sora`

Usage rules:

- Use the display font for brand moments, hero titles, and major headings.
- Use the sans font for forms, data, tables, buttons, and interface copy.
- The `.brand-display` utility tightens tracking and should be preserved for hero/brand typography.

## Light Theme Tokens

Implemented in `app/globals.css`:

| Token | Value |
| --- | --- |
| `--background` | `#f4f7fa` |
| `--foreground` | `#0f172a` |
| `--card` | `#ffffff` |
| `--surface` | `#ffffff` |
| `--surface-variant` | `#edf2f7` |
| `--surface-container` | `#f8fafc` |
| `--surface-container-high` | `#ffffff` |
| `--surface-container-highest` | `#ffffff` |
| `--primary` | `#ff4d00` |
| `--primary-dark` | `#e64500` |
| `--primary-light` | `#fff0e6` |
| `--primary-strong` | `#cc3e00` |
| `--secondary` | `#1e293b` |
| `--tertiary` | `#38b2ac` |
| `--muted` | `#eef2f6` |
| `--accent` | `#dff7f4` |
| `--border` | `#e2e8f0` |
| `--ring` | `#ff6b35` |
| `--text-primary` | `#0f172a` |
| `--text-secondary` | `#64748b` |
| `--text-muted` | `#94a3b8` |

## Dark Theme Tokens

Implemented in `app/globals.css`:

| Token | Value |
| --- | --- |
| `--background` | `#0f1117` |
| `--foreground` | `#f8fafc` |
| `--card` | `#161b22` |
| `--surface` | `#161b22` |
| `--surface-variant` | `#1f2937` |
| `--surface-container` | `#182130` |
| `--surface-container-high` | `#1e293b` |
| `--surface-container-highest` | `#243244` |
| `--primary` | `#ff7a33` |
| `--primary-dark` | `#ffb089` |
| `--primary-light` | `#7a2e0c` |
| `--primary-strong` | `#ffd0b5` |
| `--secondary` | `#cbd5e1` |
| `--tertiary` | `#4fd1c5` |
| `--muted` | `#1f2937` |
| `--accent` | `#134e4a` |
| `--border` | `#334155` |
| `--ring` | `#ff7a33` |
| `--text-primary` | `#f8fafc` |
| `--text-secondary` | `#cbd5e1` |
| `--text-muted` | `#94a3b8` |

## Radius System

Bhukkad uses intentionally soft geometry.

| Token | Value |
| --- | --- |
| `--radius-compact` | `10px` |
| `--radius-medium` | `16px` |
| `--radius-large` | `22px` |
| `--radius-xl` | `28px` |
| `--radius-xxl` | `36px` |
| `--radius-pill` | `999px` |

Recreation rule:

- Avoid sharp corners.
- Major containers should usually use `large`, `xl`, or `xxl`.

## Shadow System

| Token | Purpose |
| --- | --- |
| `--shadow-elevation-1` | subtle shell chrome, small controls |
| `--shadow-elevation-2` | primary panel depth |
| `--shadow-elevation-3` | high-emphasis surfaces like auth card |
| `--shadow-brand` | active brand-colored emphasis |
| `--shadow-focus` | focus ring halo |

Recreation rule:

- Do not flatten the interface.
- Depth is part of the product identity.

## Background And Atmosphere

Bhukkad relies on layered backgrounds, not plain fills.

- `body` uses radial color washes plus the main background.
- `.app-canvas` adds a second operational gradient treatment.
- `.app-hero-glow` adds the large hero halo effect used on major staff pages.

If a rebuild strips those gradients, the product will look noticeably more generic.

## Core Layout Utilities

### `.surface-shell`

Use for:

- sidebar
- header
- glassy chrome surfaces

Behavior:

- semi-opaque layered background
- blur/backdrop-filter
- light elevation

### `.app-canvas`

Use for:

- major page canvases
- POS outer shell
- other full-surface page backdrops

Behavior:

- radial color atmosphere
- top-weighted visual glow

### `.app-panel`

Use for:

- primary cards
- hero panels
- large content containers

Behavior:

- crisp border
- almost-solid surface
- stronger shadow

### `.app-panel-subtle`

Use for:

- loaders
- quieter supporting cards
- low-emphasis surface blocks

Behavior:

- softer elevation
- slightly more blended fill

## Shell Rules

### Sidebar

Implemented in `components/layout/sidebar.tsx`.

- compact width: `92px`
- expanded desktop width: `280px`
- compact mode shows only the brand icon
- desktop mode shows full mark with tagline
- active item uses brand color and `shadow-brand`

The navigation order is part of the current product shape and should stay consistent:

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

### Header

Implemented in `components/layout/header.tsx`.

- sticky, rounded, glassy top bar
- shown on standard staff pages
- intentionally hidden on `/pos` and `/kitchen`

This is an important fidelity rule. POS and Kitchen must not be forced back into the normal header pattern.

## Brand Mark

Implemented in `components/brand/brand-mark.tsx`.

Key details:

- square rounded tile
- orange-to-teal gradient fill
- centered `B` in display font
- full version includes `Bhukkad`
- small uppercase tagline reads `Restaurant OS`
- optional supporting description appears in `withTagline` mode

This mark should remain clean and compact. Do not replace it with generic text-only branding.

## Page Mode Rules

### Standard Staff Mode

Applies to:

- Dashboard
- Orders
- Menu
- Inventory
- Customers
- Reports
- Settings
- Reservations
- Tablet Ordering

Characteristics:

- shared sidebar
- shared sticky header
- rounded hero panel
- layered white/slate surfaces

### POS Mode

Applies to:

- `/pos`

Characteristics:

- no standard header
- wide operational composition
- category rail, item grid, cart, and service actions
- service-first density with premium surface styling

### Kitchen Mode

Applies to:

- `/kitchen`

Characteristics:

- no standard header
- very dark background
- bright status contrast
- dense order card grid
- optimized for glanceability and speed

### Public Tablet Mode

Applies to:

- `/tablet/[tableId]`

Characteristics:

- public-safe surface
- large controls
- multilingual copy
- menu browsing + item customization + cart
- no staff shell chrome

## Component Expectations

### Buttons

- Primary buttons should feel bold and brand-led.
- Important CTAs often use uppercase or strong tracking.
- Icon-only controls still keep rounded geometry and surface depth.

### Cards And Panels

- Prefer layered white/slate surfaces over flat gray blocks.
- Use rounded corners generously.
- Important panels should feel substantial and elevated.

### Forms

- Inputs should sit cleanly inside the panel system.
- Login and public tablet forms should feel polished, not plain admin defaults.

### Data Visualizations

- Dashboard and reports use the brand palette inside charts.
- Charts should sit inside the same panel language as the rest of the product.

## Rebuild Guardrails

If another agent is recreating Bhukkad, they should not:

- swap the token system for shadcn defaults
- flatten the shell into plain white rectangles
- remove gradients and glow layers
- replace Sora/Manrope with generic system fonts
- make POS and Kitchen look like normal CRUD pages

If the rebuild preserves the token values, shell utilities, typography, and the three page modes above, it will stay visually close to the current product.
