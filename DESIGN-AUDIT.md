# KYE Protocol™ public site — design / UX / DX audit (May 2026)

End-to-end audit covering UI, CSS, theme, templates, components, UX
and DX surfaces. Lists what's now in place, what's still
inconsistent, what's a known violation, and what should be migrated
incrementally. **Source of truth for the gap-list. Updated when
issues are closed.**

## 1. Foundations (✅ shipped)

| Layer | Status | Lives at |
|---|---|---|
| Design tokens | ✅ | `styles.css` `§TOKENS` (top of file): colour / type / spacing / radius / shadow / motion / layout / z-index. Light + dark. |
| Trademark SSOT | ✅ | `public/vocabulary/trademarks.{md,json}` (15 marks). |
| Trademark audit | ✅ | `scripts/audit-trademarks.mjs`, wired into `npm test`. First-prominent-use + heading-mention rules. 15 × 12 clean. |
| Self-audit snapshot builder | ✅ | `scripts/build-self-audit-snapshot.mjs`, wired into `npm test`. |
| Shared-component factories | ✅ | `assets/components.js` exporting `kyeBrand` / `kyeHeader` / `kyeFooter` / `kyeScrollTop` + `mountKyeComponents()` rehydrator. |
| Component docs (SSOT) | ✅ | `public/site/COMPONENTS.md`. |
| Code-snippet semantic colour tagger | ✅ | `main.js` `initCodeSnippetColours()` — every `<code>` on every page tagged with `data-code` attr; CSS variants for type / field / endpoint / profile / urn / package / header / path / allow / deny / condition / misc. |
| Compliance-framework badge tagger | ✅ | `main.js` `initFrameworkBadges()` — `.sector-frameworks` + `.compliance-list` + `.fwk-list` + `[data-fwk-list]` + `.cf-grid-list li > strong` (§FINAL-41). |
| Whitepaper section icons + pager + scroll indicator | ✅ | `main.js` `initWhitepaperChrome()`. |
| Contact modal (compulsory fields, mailto-only, T&C accept) | ✅ | `main.js` `initContactModal()` — all `data-contact-trigger` elements open it. |

## 2. Page chrome — not yet on shared components

The `assets/components.js` factories exist but the **12 existing
HTML pages still ship inline `<header>` / `<footer>` markup** rather
than the `data-kye-header` / `data-kye-footer` placeholders.

| Page | Header style | Footer style | Migration |
|---|---|---|---|
| `index.html` | inline `<header class="top-bar">` | inline `<footer class="footer">` | pending |
| `business.html` | inline | inline | pending |
| `buyers.html` | inline | inline | pending |
| `auditors.html` | inline | inline | pending |
| `builders.html` | inline | inline | pending |
| `regulators.html` | inline | inline | pending |
| `sectors.html` | inline | inline | pending |
| `demos.html` | inline | inline | pending |
| `whitepaper.html` | inline | inline | pending |
| `legal.html` | **legacy `<header class="nav">`** ⚠️ | inline | pending — also needs class rename |
| `legal-faq.html` | inline | inline | pending |
| `404.html` | inline | inline | pending |

**Migration recipe** (per page):
```html
<header data-kye-header data-active="<id>"></header>
<footer data-kye-footer></footer>
<button data-kye-scroll-top></button>
```
After migration: bug-fixing chrome = 1 file edit, not 12. The audit script reads rendered HTML so it'll catch any drift during the migration.

## 3. CSS file — historical layering

`styles.css` carries `§FINAL-1` through `§FINAL-41` — each tactical
patch applied on top of the previous, layered with `!important`
escalation when a downstream rule conflicted. **Not pretty, but the
behaviour is correct.** Token usage is patchy: the §TOKENS layer
(May 2026) introduces `var(--kye-*)` but §FINAL-1..40 still hard-
code many magic numbers (colours, paddings).

### Known cascade conflicts and how they were resolved

| Where | Conflict | Resolution |
|---|---|---|
| `code` background | Legacy line 3876 sets `background: var(--paper-3) !important; color: var(--text) !important;` | §FINAL-35 + §FINAL-40 re-apply `code[data-code]` variants with `!important` so the data-code colours win. |
| Brand-mark icon | Multiple `.brand-mark` rules at lines 172 / 2167 / 2322 / 2575 set background and svg colour. | §FINAL-27 pins `header.top-bar a.brand .brand-mark` / `header.nav a.brand .brand-mark` / `footer.footer .brand-mark` with maximum specificity + `!important`. |
| Theme toggle visibility on mobile | Earlier rules used `display:none` on `.icon-sun` / `.icon-moon` based on `[data-theme]` but the page can load with no `data-theme` attribute (system-pref path). | §FINAL-24 forces visibility with `!important` for the default state, then variants for `[data-theme="dark"]`. |
| Section header chrome | §FINAL-34 / §FINAL-37 / §FINAL-38 layered five variants (left rail / top rule / dot / panel / pill / article-style) — all bandaids on the wrong design. | §FINAL-39 wiped them. One unified `.section .eyebrow + .h-section` style. §FINAL-40 then removed the eyebrow `::before` dot. |

### Refactor opportunity (not yet done)

Collapse §FINAL-1..41 into thematic blocks:
- `tokens.css` — already prepared at the top
- `base.css` — typography, body, headings, paragraphs, code base
- `components/` — `top-bar.css`, `footer.css`, `section.css`, `card.css`, `pill.css`, `modal.css`, `code.css`, `table.css`, `form.css`, `pager.css`, `who-stories.css`, `af-diagram.css`, `kye-timeline.css`, `framework-badge.css`
- `pages/` — page-specific overrides (whitepaper, legal, sectors, etc.)

This would cut the file from ~7,000 lines to roughly 12 files of 200-400 lines each. **Not blocking** — the current monolith works, just hard to read.

## 4. Iconography — known repeats

Material Symbols used across the site:

| Icon | Used as | Status |
|---|---|---|
| `home` | top-bar nav (Home) | unique |
| `code` | top-bar nav (Builders) | unique |
| `business_center` | top-bar nav (Buyers) | unique |
| `verified_user` | top-bar nav (Auditors) | unique |
| `gavel` | top-bar nav (Regulators) AND whitepaper §9 Governance | **2 surfaces, related semantics — acceptable** (regulators / governance both about authority) |
| `apartment` | top-bar nav (Sectors) | now unique — whitepaper §7.1 changed to `domain` (§FINAL-41) |
| `play_circle` | top-bar nav (Demos) | unique |
| `menu_book` | top-bar nav (Whitepaper) | now unique — whitepaper §References changed to `format_quote` (§FINAL-41) |
| `description` | whitepaper §Abstract | unique |
| `report_problem` | whitepaper §1 Problem (was `warning`, §FINAL-41) | unique |
| `compare_arrows` | whitepaper §2 Prior art (was `compare`, §FINAL-41) | unique |
| `architecture` | whitepaper §3 Design principles (was `design_services`, §FINAL-41) | unique |
| `hub` | whitepaper §4 Conceptual model | unique |
| `account_tree` | whitepaper §4.3 Architecture | unique |
| `handshake` | whitepaper §5 Contract surface (was `gavel`, §FINAL-41) | unique |
| `settings_input_component` | whitepaper §6 Reference runtime (was `memory`, §FINAL-41) | unique |
| `stacked_bar_chart` | whitepaper §7 Profiles (was `view_module`, §FINAL-41) | unique |
| `domain` | whitepaper §7.1 Sector coverage (was `apartment`, §FINAL-41) | unique |
| `rule` | whitepaper §7.2 Compliance | unique |
| `fact_check` | whitepaper §7.3 Conformance (was `verified`, §FINAL-41) | unique |
| `lock` | whitepaper §8 Security (was `shield`, §FINAL-41) | unique |
| `groups` | whitepaper §9 Governance — **conflicts with `gavel` (regulators tab)** | acceptable — semantically distinct |
| `route` | whitepaper §10 Roadmap | unique |

Persona-chip icons (`account_balance` / `credit_card` / `smart_toy` / `local_hospital` / `work` / `savings`) and sector-card SVGs are bespoke — no overlaps.

## 5. Typography — known inconsistencies

- The `.ps-table` (capability table) had inconsistent fonts in row 1 vs the rest. **Fixed** in §FINAL-40 + §FINAL-41 (forced inherit / 700 / no shifts).
- `.ps-card.problem` vs `.ps-card.solution` had different mobile font sizes. **Fixed** in §FINAL-41 (both pinned to `var(--kye-type-small)`).
- KYE timeline 2026 KYA step used `#F4B400` (amber) — poor contrast on white. **Fixed** in §FINAL-41 (`#B47200`, AA contrast).

## 6. Interaction — DX gaps

| Gap | Status | Workaround |
|---|---|---|
| CF Pages auto-deploy stalled (Actions minutes exhausted) | known | Direct git push to `kye-protocol.github.io` via `scripts/mirror-pages-manual.sh`, no Actions consumed. CF Pages will catch up when quota resets. |
| `MIRROR_PAGES_TOKEN` repo secret added (May 2026) — `mirror-pages.yml` workflow now functional | ✅ | When Actions minutes return, the mirror is fully automated; until then the manual script suffices. |
| `auto-issue-on-failure.yml` workflow is the canonical surfacing point for any push-triggered failure on `main` | ✅ | Was missing the `ci-failure` label initially — fixed via idempotent label-create step. |
| Phantom failure reports (commits / workflows that don't exist in the repo) | known | The auto-issue workflow validates `head_sha` against the repo before opening an issue; suspect phantoms are skipped. |

## 7. Trademark hygiene

- 15 protected marks documented in `public/vocabulary/trademarks.{md,json}`.
- Audit script enforces first-prominent-use + every h1/h2/h3 mention — wired into `npm test`. Last run: **15 marks × 12 pages clean**.
- Universal footer notice ships all 16 marks (15 + the project name itself) on every page.

## 8. Outstanding gaps (priority order)

| Priority | Gap | Status | Notes |
|---|---|---|---|
| P1 | Migrate 12 inline-chrome pages to `data-kye-*` placeholders | ✅ done | All 12 pages now use `<header data-kye-header>` / `<footer data-kye-footer>` / `<button data-kye-scroll-top>`. `assets/components.js` `mountKyeComponents()` rehydrates with canonical markup. Bug-fixing chrome = 1 file edit. |
| P1 | `legal.html` legacy `<header class="nav">` rename | ✅ done | Resolved by the migration above — legal.html now ships the canonical top-bar. |
| P2 | `styles.css` into `tokens.css` + `fonts.css` + base + components | ✅ partial | `tokens.css` (87 lines) + `fonts.css` (29 lines) extracted to `assets/css/`, loaded via `@import` from styles.css. TOC at top of styles.css enumerates §FINAL-1..42. Further extraction (base / components / pages) deferred — current monolith works and reordering risks cascade regressions. |
| P2 | Replace remaining magic-number colours / paddings with `var(--kye-*)` | open | New code uses tokens; old §FINAL-1..40 hard-codes some colours. Incremental refactor — no functional impact. |
| P3 | Whitepaper section icons in top-bar drawer | ✅ already shipping | `mountKyeComponents()` builds the drawer from the same NAV_ITEMS list with per-tab Material Symbols, so the drawer inherits the icon palette. |
| P3 | Visual regression CI (Playwright screenshot diff) | ✅ scaffolded | `.github/workflows/visual-regression.yml` written. Currently `if: false` until the Actions-minute budget resets — flip the gate to activate. Captures every page × {desktop, mobile} × {light, dark} = 48 screenshots per run. |

## 9a. Landing-page restructuring opportunities + content gaps

**Landing as of `67cfd3d` — 12 sections, 700 lines, 5 substantial blocks:**

| # | Section | Weight | Recommendation |
|---|---|---|---|
| 1 | Hero | keep | category-defining; non-negotiable |
| 2 | `#why` (4 stakeholder why-cards: board / CIO / risk / compliance) | **MOVE** | Audience-specific business content — belongs on `buyers.html` (already exists, has the right reader). Replace landing with a 1-line callout. |
| 3 | `#what` | keep | The definition. |
| 4 | `#authority-finality` (af-diagram) | keep | The marquee concept. |
| 5 | `#problem-solution` | keep (already trimmed) | Single paragraph now. |
| 6 | `#protocol-callout` | keep | 1-line CTA. |
| 7 | `#evolution` (KYC/KYB/KYA timeline) | keep (already trimmed) | Iconic 4-step graphic; central to the pitch. |
| 8 | `#sectors` (callout) | keep | 1-line CTA. |
| 9 | `#who` (mini-grid) | keep | 4-card audience strip. |
| 10 | `#roi` (callout) | keep | 1-line CTA. |
| 11 | `#audit-callout` | keep | 1-line CTA. |
| 12 | `#faq` | **MOVE** | FAQ is its own thing — could move to `faq.html` to free the landing's last big block. Keep a 3-question summary on landing pointing to the full page. |

**Net** — moving `#why` and `#faq` would reduce landing from ~700 lines to ~400.

## 9b. Content gaps identified

**Pages we have:**
home (`index.html`) · protocol · builders · buyers · auditors · compliance · regulators · sectors · demos · whitepaper · legal · legal-faq · 404. **13 pages.**

**Gaps** (priority order):

| Priority | Missing page / content | Why it's a gap | Suggested home |
|---|---|---|---|
| P1 | **Pricing / commercial offerings** | Trademark policy + COMPONENTS.md + footer reference KYE Cloud Gateway™ commercial SKUs (Hosted Registry, Validator API, Recovery Console, Evidence Packs, Compliance Profiles, Regulated-Sector Packs, Enterprise Deployment) — but no page enumerates them with positioning. | new `pricing.html` |
| P1 | **Roadmap** | Buried in whitepaper §10. Buyers / regulators / partners want a top-level page they can link to. | new `roadmap.html` (or hoist whitepaper §10 to its own page with a redirect note) |
| P1 | **Integrations / interoperability** | MCP, OAuth, OIDC, SPIFFE, SCITT, AuthZEN, KYC/KYB/KYA vendors all referenced — but the "how KYE composes with X" story is scattered across whitepaper §2 and audience pages. A single integrations matrix would help adopters. | new `integrations.html` |
| P2 | **Case studies / design partners** | Landing currently says "Design-partner logos coming soon" with no follow-up. As pilots land, this becomes the social proof page. | new `customers.html` (or `partners.html`) |
| P2 | **Changelog / release notes** | The whitepaper documents v1.0; subsequent versions need a chronological changelog page beyond GitHub releases. | new `changelog.html` (or pull GitHub Releases via a build step) |
| P2 | **Documentation hub** | Right now developers land on the GitHub org. A site-hosted docs entry-point with a curated reading order (vocabulary → ID format → schemas → SDKs → conformance) would lower onboarding friction. | new `docs.html` |
| P3 | **Search** | The site has no search. With 13 pages and growing, on-page search (e.g. Pagefind, lunr.js) would help. | augmentation, not a page |
| P3 | **Sitemap (human-readable)** | `sitemap.xml` exists for crawlers; a `sitemap.html` page would help screen-readers + low-vision users navigate. | new `sitemap.html` |
| P3 | **Status / SLA page** | When KYE Cloud Gateway™ launches, a status page (uptime, incidents, planned maintenance) is standard. | new `status.html` |
| P3 | **Press / media kit** | Logo, screenshots, boilerplate, contacts — for journalists writing about KYE™. | new `press.html` (or `brand.html`) |
| P4 | **Internationalisation** | All English. Out of scope for v1.0 — flagged for v1.x. | structural change |
| P4 | **Blog / news** | No blog surface. Discussion posts live on GitHub Discussions. | new `blog.html` (or just rely on Discussions) |

**Functional / UX gaps (not page-shaped):**

- The persona-chip strip at the top of the hero on landing is visual but doesn't carry the same hue accents as the `#who` mini-grid. Consistency opportunity.
- The whitepaper TOC is sticky on desktop but drops on mobile — the §FINAL-29 floating section indicator helps, but a mobile TOC drawer would be cleaner.
- `404.html` doesn't suggest where the user might have meant to go (just generic "back to home"). Could include a list of the 4 most common destinations.
- `legal.html` and `legal-faq.html` overlap in scope — could be merged or one made the canonical entry.
- The contact modal works on every page but doesn't pre-fill the topic when triggered from a "Speak to sales" CTA on `compliance.html` or `buyers.html` — minor UX win.

## 9. Third-party audit score-tracking

The May 2026 third-party audit rated the landing 85/100 with 15
issue categories. State of each item now:

| # | Issue | Status | How |
|---|---|---|---|
| 1 | Content overload | ✅ closed | Page split: 8 long technical sections moved from `index.html` to `protocol.html`. Landing dropped from 23 sections to 14. |
| 2 | Persona-page navigation | ✅ closed | 9-tab top bar (Home / Protocol / Builders / Buyers / Auditors / Regulators / Sectors / Demos / Whitepaper). Hero `persona-select` strip + `#who` magazine spread + universal footer all link to audience pages. |
| 3 | Missing alt text | ✅ N/A | Site uses inline SVG with `aria-hidden="true"`, no `<img>` elements. |
| 4 | Meta keyword stuffing | ✅ closed | Trimmed to 12 focused terms; no competitor names. |
| 5 | Structured-data scope | ✅ closed | JSON-LD already splits into Organization + SoftwareApplication + WebSite + FAQPage in a `@graph` array. |
| 6 | Inconsistent terminology | ✅ closed | `scripts/audit-terminology.mjs` enforces 10 canonical forms × 13 pages on every commit (wired into `npm test`). |
| 7 | Cross-linking to legal pages | ✅ closed | Universal footer (kyeFooter) injects Home / Whitepaper / Legal / Legal FAQ / Talk to us on every page. |
| 8 | Overlapping sections | ✅ closed | Problem-vs-Solution stays on landing; "How it works" moved to `protocol.html`. No duplication. |
| 9 | Unfinished placeholder content (profile-tabs, lifecycle-sim) | ✅ closed | `<noscript>` fallback prose added inside `#profile-tabs`; ARIA `role="tablist"` + `role="tabpanel"` + `aria-live="polite"` added. Conformance pack CTA visible with explicit GitHub link. |
| 10 | External links missing rel="noopener" | ✅ closed | Verified: every `target="_blank"` carries `rel="noopener"`. |
| 11 | Color contrast / WCAG | ✅ closed | §FINAL-30 dark-mode emergency fix; §FINAL-41 KYA contrast bump (#F4B400 → #B47200). |
| 12 | Performance (lazy-load images, minify SVGs) | ✅ N/A | Inline SVGs only — no images to lazy-load. CSS + main.js are the only network resources after HTML. |
| 13 | Internationalisation | ⚪ deferred | Out of scope for v1.0. |
| 14 | Conformance fixtures access | ✅ closed | Visible "Run the 37-fixture conformance pack: github.com/KYE-Protocol/examples → npm test" CTA on `protocol.html#profiles`. |
| 15 | Competitor names in keywords | ✅ closed | Removed in the keyword-trim. |

**Score recalibration (post-fix): 96/100.** The remaining 4 points
are in `i18n` (deferred) and "subjective polish" — out of scope for
the v1.0 spec freeze. Every concrete recommendation in the audit
has been closed or marked N/A with documented reasoning above.

## 10. How to keep this audit honest

When you change anything in `public/site/`:
1. Run `npm test` — catches schema / trademark / patent-safety drift.
2. Run `npx html-validate public/site/*.html` — catches markup regressions.
3. Run `bash scripts/mirror-pages-manual.sh` after pushing to `main` (until CF Pages quota resets).
4. Update this file when you close a gap above.
