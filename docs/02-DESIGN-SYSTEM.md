# PawBytes: Design system (summary)

Updated 2026-10-11.

## Fonts
- **Figtree** for all UI.
- **Caveat Bold** only for the oversized hero "PawBytes" wordmark (parallax). The footer's outline wordmark uses Figtree 700.

## Colors

### Core
| Use | Value |
|---|---|
| Brand cobalt (links, focus ring, banner, Testimonials card) | #2A3BD9 |
| Cobalt dark (active sidebar link, wordmark) | #1F2DB0 |
| Green (primary app buttons, success) | #047857 / #059669 (hover) |
| Text | #1F2937 / #4B5563 |
| Border | #D8DEE3 |
| Background | #F9FAFB |
| sky-50 / sky-100 (tints, hover, selected) | #EEF2FF / #DCE5FF |
| App shell backdrop (behind the rounded main card) | #DCE5FF |
| emerald-100 | #D1FAE5 |
| Placeholder | #E5E7EB |
| Danger | #B91C1C / #FEF2F2 (also #FEE2E2, border #FCA5A5) |

### Accent (`paw` in tailwind.config.js)
| Name | Value | Used for |
|---|---|---|
| Pink | #F06AA6 | avatar, review cards, photo frame |
| Rose | #D6347F (hover #BE2A70) | sidebar "Book appointment" button |
| Lime | #D9F25C (hover #C8E544) | banner button, Testimonials line |
| Sky | #5AB4FF / #8CC8FF | shapes, review and appointment cards |
| Mint | #3DAF8A / #7FD1B0 | shapes, review and appointment cards |
| Orange | #F2733F | service shape |
| Violet | #5B21B6 | reserved |
| Card tint | #E9EFFB | service card backdrop |

Retired: blue #0369A1 / #075985 and the old sky-50/100 (#F0F9FF / #E0F2FE). A few leftovers still use #0369A1 (dot grid shader, hero title shadow). Swap them in the palette pass.

## Shape and depth
- **Radius:** pill for marketing buttons, 8px for app buttons and inputs, 20px for cards.
- **Shadow:** one only, `0 8px 24px rgba(28,51,46,0.12)`.

## Rules
- **Marketing pages:** no icons, no gradients. Approved exceptions: footer (background and outline wordmark), auth vignette, spotlight glow, white fade on the pet card photo.
- **App pages and sidebar** may use lucide icons.
- **App shell (logged-in, `lg+`):** sidebar on the #DCE5FF backdrop, content in a rounded 20px white card carrying the one shadow.
- Minimal copy.
- Photo and logo spots are plain placeholders. Photo placeholders may tilt 3-8°. Functional UI is never tilted.
- Section heights: 820px standard, 1230px for Testimonials.
- Landing headings follow the Dr. Friend (Behance) look: big, heavy, tight, short.
- Motion: spring (stiffness 400, damping 28, mass 0.6). Always honor `useReducedMotion`.

## Converting 21st.dev / React Bits components
1. Convert to `.js`/`.jsx` (no TypeScript).
2. Use relative imports.
3. Remap colors, radius, fonts and shadow to the rules above.
4. Write own equivalents for missing helpers (`cn`, shadcn Card, etc.) and say so.
5. New npm dependencies are OK if they improve UI/UX.
6. Say which `src` folder each file goes in.
7. Add a Credits entry.
