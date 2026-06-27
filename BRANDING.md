# Bhukkad Branding System

## Brand Intent
Bhukkad should feel like the operating system of a living dining room, not a generic SaaS dashboard. The visual language needs to carry the pulse of Indian hospitality while still feeling precise enough for operations teams, cashiers, and kitchens under pressure.

The identity should feel:

- bold, hungry, and service-ready
- unmistakably Indian without slipping into nostalgia or kitsch
- expressive in hierarchy, color, and shape while preserving familiar operational flows
- rooted in Material 3 foundations, especially semantic color roles, tactile surfaces, and emotionally resonant focal moments

## Brand Core
- Brand name: `भुक्कड़` / `Bhukkad`
- Primary icon: the Devanagari letter `भ`
- Primary wordmark: `भुक्कड़`
- Supporting Latin wordmark: `Bhukkad`
- Product descriptor: `Restaurant OS`
- Voice: direct, upbeat, practical, confident
- Personality: bold hospitality, reliable operations, sharp service rhythm, modern Indian expressiveness

## Signature System
- The icon is always the `भ` glyph, never a Latin `B`
- The most branded moments should privilege `भुक्कड़` first and `Bhukkad` second
- The Latin wordmark is support text for bilingual readability, not the emotional center of the identity
- Brand moments should feel ceremonial and appetite-inducing: heat, glow, spice, rhythm, and welcome

## Material 3 Direction
The Bhukkad system should follow Material 3, but in its more expressive mode rather than the quiet enterprise interpretation:

- semantic color roles instead of hardcoded decorative fills
- large rounded shapes that feel tactile and approachable
- contrast-rich hierarchy for rush-hour decision making
- strong emotional focal points around primary actions, hero surfaces, and brand moments
- motion and gradients should support rhythm and warmth, not noise
- familiar workflows stay familiar even when the visuals become more expressive

This means Bhukkad should never look sterile or purely corporate. It should feel more like a premium service tool designed for a fast-moving Indian restaurant brand.

## Color Roles
### Light theme
- Background: `#fff7ef`
- Foreground: `#24150f`
- Primary: `#a64218`
- Primary strong: `#8c340c`
- Primary dark: `#7d2c0a`
- Primary soft: `#ffd8c5`
- Secondary: `#6a4a38`
- Tertiary: `#3d6e63`
- Accent: `#ffe6b8`
- Card / Surface: `#fffaf6`
- Surface variant: `#f6e9de`
- Surface container: `#fbefe6`
- Border: `#e2cfbf`
- Muted foreground: `#7d675a`

### Dark theme
- Background: `#1a100c`
- Foreground: `#f7e5d7`
- Primary: `#ffb58b`
- Primary container: `#6f2b0d`
- Primary strong: `#ffe5d6`
- Secondary: `#e2c1ad`
- Tertiary: `#91d6c7`
- Accent: `#5c3f16`
- Card / Surface: `#241611`
- Surface container: `#2b1a14`
- Border: `#5a4034`
- Muted foreground: `#c7ab9a`

Color character:

- primary should read like chili, tandoor heat, or lacquered copper
- accent should feel like saffron light, not neon yellow
- tertiary should feel cooling and fresh, like mint, leaf, or cardamom relief against warm surfaces
- neutrals should stay creamy, edible, and ceramic rather than blue-gray

## Typography
- Display: `Sora`
- UI / body: `Manrope`
- Devanagari / brand script: `Noto Sans Devanagari`

Usage:
- Devanagari font for the `भ` icon and all Hindi-led brand moments
- Display font for page titles, hero statements, and key metrics
- Sans font for navigation, forms, dense operations UI, tables

Typography rules:

- `भुक्कड़` should feel heavy, proud, and slightly condensed by composition, not by distortion
- Latin support text should feel sharp and modern, with generous uppercase tracking for operational labels
- Brand moments can combine Devanagari and Latin, but Hindi should lead the composition

## Shape System
- Compact radius: `10px`
- Medium radius: `16px`
- Large radius: `22px`
- XL radius: `28px`
- XXL radius: `36px`
- Pill radius: `999px`

Use larger radii for navigation shells, hero cards, and branded components so the interface feels welcoming and tactile instead of severe.

## Elevation
- Elevation 1: base card and utility controls
- Elevation 2: interactive surfaces and popovers
- Elevation 3: hero panels and focused brand surfaces
- Brand shadow: warm primary-colored glow for key actions and the `भ` seal only

Shadows should feel soft and warm, not cold and technical.

## Component Rules
- Primary CTAs should feel like a plated hero moment: high contrast, warm, and unmistakable
- Navigation should read like a Material 3 rail/drawer hybrid with premium hospitality warmth
- Input fields should feel soft and elevated, never flat enterprise gray
- Hero containers should use layered gradients and glows sparingly to create appetite and focus
- Charts and reporting surfaces should stay mostly neutral, with brand warmth used as emphasis rather than wallpaper
- The `भ` seal can carry the richest gradient treatment in the system

## Do / Avoid
### Do
- use semantic tokens such as `bg-card`, `text-muted-foreground`, and `border-border`
- let Bhukkad feel bilingual where the brand needs emotional weight
- keep hospitality warmth visible in both themes
- use brand color for emphasis, hierarchy, and appetite
- preserve Material 3 legibility and task clarity even in expressive surfaces

### Avoid
- reverting to blue-gray dashboard chrome
- using a Latin `B` as the primary identity
- flattening every surface into neutral enterprise gray
- overusing saturated gradients on data-heavy screens
- treating the Hindi layer as a decorative add-on instead of the core identity

## Integration Notes
This branding system is integrated through:

- [`app/globals.css`](/Users/debadritamukhopadhyay/Bhukkad/app/globals.css)
- [`app/layout.tsx`](/Users/debadritamukhopadhyay/Bhukkad/app/layout.tsx)
- [`components/layout/header.tsx`](/Users/debadritamukhopadhyay/Bhukkad/components/layout/header.tsx)
- [`components/layout/sidebar.tsx`](/Users/debadritamukhopadhyay/Bhukkad/components/layout/sidebar.tsx)
- [`components/brand/brand-mark.tsx`](/Users/debadritamukhopadhyay/Bhukkad/components/brand/brand-mark.tsx)
