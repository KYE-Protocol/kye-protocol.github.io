# KYE Protocol™ public site — design system & shared components

Two layers, one source of truth each:

1. **Design tokens** — top of `styles.css` under `:root` / `:root[data-theme="dark"]`.
   Every colour / spacing / radius / type-scale / motion / z-index value used
   across the site comes from a `--kye-*` token. New components must reach for
   `var(--kye-*)` instead of redefining magic numbers.

2. **Shared components** — `assets/components.js` exports the canonical
   markup factories (`kyeHeader`, `kyeFooter`, `kyeBrand`, `kyeScrollTop`).
   `mountKyeComponents()` runs at page load (from `main.js`) and rehydrates
   any element with a `data-kye-*` hook with the canonical structure.

## Tokens

### Colour
| Token | Light | Dark |
|---|---|---|
| `--kye-color-brand` | `#1A8754` (Google green) | `#81C995` |
| `--kye-color-brand-2` (hover) | `#137333` | `#A8DAB5` |
| `--kye-color-brand-soft` | 10% brand | 16% brand |
| `--kye-color-brand-line` | 22% brand | 30% brand |
| `--kye-color-danger` | `#EA4335` | `#EA4335` |
| `--kye-color-warning` | `#F4B400` | `#F4B400` |
| `--kye-color-info` | `#1A73E8` | `#1A73E8` |
| `--kye-color-success` | `#1A8754` | `#81C995` |
| `--kye-color-bg` | `#fcfcfd` | `#0a0e1a` |
| `--kye-color-surface` | `#ffffff` | `#161c30` |
| `--kye-color-paper-2` | `#f8f9fa` | `#1a2138` |
| `--kye-color-line` | `rgba(15, 23, 42, 0.10)` | `rgba(255, 255, 255, 0.10)` |
| `--kye-color-line-strong` | `rgba(15, 23, 42, 0.18)` | `rgba(255, 255, 255, 0.18)` |
| `--kye-color-text` | `#0b0f1c` | `#F0F4FF` |
| `--kye-color-text-muted` | `#555a72` | `#C9D0E2` |
| `--kye-color-text-dim` | `#8993b0` | `#AAB2CC` |

### Type
| Token | Value |
|---|---|
| `--kye-type-hero` | `clamp(40px, 6vw, 72px)` |
| `--kye-type-h1` | `clamp(28px, 4vw, 44px)` |
| `--kye-type-h2` | `clamp(22px, 2.6vw, 30px)` |
| `--kye-type-h3` | `clamp(17px, 1.6vw, 20px)` |
| `--kye-type-body` | `16px` |
| `--kye-type-small` | `13.5px` |
| `--kye-type-tiny` | `11.5px` |
| `--kye-type-mono` | `12.5px` |

### Spacing (8-pt rhythm)
`--kye-space-1` (4px), `--kye-space-2` (8px), `--kye-space-3` (12px),
`--kye-space-4` (16px), `--kye-space-5` (20px), `--kye-space-6` (24px),
`--kye-space-8` (32px), `--kye-space-10` (40px), `--kye-space-12` (48px),
`--kye-space-16` (64px).

### Radius
`--kye-radius-1` (4px), `--kye-radius-2` (6px), `--kye-radius-3` (10px),
`--kye-radius-4` (14px), `--kye-radius-pill` (999px).

### Shadow / motion / layout / z-index
See the `:root` block at the top of `styles.css`.

## Components

### Top-bar header
```html
<header data-kye-header data-active="builders"></header>
```
`mountKyeComponents()` injects the canonical top-bar markup with the brand
mark, primary nav (8 audience tabs), GitHub CTA, theme toggle and drawer
toggle. `data-active` highlights the matching tab. If `<body data-page="X">`
is set instead, it's used as the fallback.

### Universal footer
```html
<footer data-kye-footer></footer>
```
Injects the universal trademark notice (16 protected marks + ™ on each)
and the standard footer-links row (Home / Whitepaper / Legal / Legal FAQ /
Talk to us). Use `data-kye-year` inside any element to get the current year
stamp for free.

### Scroll-to-top
```html
<button data-kye-scroll-top></button>
```
Injects the SVG progress ring + arrow markup. Behaviour comes from
`assets/scroll-top.js` which is wired by the existing `initScrollTop()`.

### Contact modal (Talk to us / sales)
Any element with `data-contact-trigger` triggers the contact modal. The modal
markup is built once and reused; required fields, role dropdown, and
mailto-only submission are documented in `assets/main.js`'s
`initContactModal()`.

## Migrating an existing page

The 12 existing HTML pages still ship inline `<header>` / `<footer>`
markup. They work as-is, but to canonicalise:

1. Replace the inline `<header class="top-bar"…>…</header>` block with
   `<header data-kye-header data-active="<id>"></header>`.
2. Replace the inline `<footer class="footer"…>…</footer>` block with
   `<footer data-kye-footer></footer>`.
3. Replace the inline scroll-top button with
   `<button data-kye-scroll-top></button>`.
4. Verify the page still ships `<script type="module" src="main.js?v=…">` —
   the JS rehydrates on `mountKyeComponents()` as the first init step.
5. Run `npm run test:trademarks` — the audit script reads the rendered HTML
   so it'll flag any drift.

## Why this layer exists

- Earlier the same chrome was duplicated 12× across pages. Bug fixes (™
  gaps, drifted nav links, legacy `<header class="nav">` on legal.html)
  required 12 separate edits.
- The CSS layered §FINAL-1 through §FINAL-39 patches — each tactical fix on
  top of the previous, with no token discipline.
- One source of truth for chrome + one source of truth for tokens means a
  single edit propagates everywhere, and audit/lint scripts can enforce
  consistency.
