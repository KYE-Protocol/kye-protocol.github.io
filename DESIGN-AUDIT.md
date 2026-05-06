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

| Priority | Gap | Owner | Notes |
|---|---|---|---|
| P1 | Migrate 12 inline-chrome pages to `data-kye-*` placeholders | site | Each page is 5 minutes — see §2 above for the recipe. |
| P1 | `legal.html` uses legacy `<header class="nav">` — should rename to `top-bar` and use the canonical kyeHeader factory | site | Same as above; flagged in §2. |
| P2 | Refactor `styles.css` into `tokens.css` + `base.css` + `components/*.css` + `pages/*.css` | site | Cosmetic — current monolith works. |
| P2 | Replace remaining magic-number colours / paddings in §FINAL-1..40 with `var(--kye-*)` tokens | site | Incremental; new code already uses tokens. |
| P3 | Whitepaper section icons could carry into top-bar drawer for a richer mobile menu | site | Nice-to-have. |
| P3 | Add automated visual regression (Playwright screenshot diff) so chrome drift fails CI | site | Currently caught only by html-validate + manual inspection. Would close the loop the user has been hitting. |

## 9. How to keep this audit honest

When you change anything in `public/site/`:
1. Run `npm test` — catches schema / trademark / patent-safety drift.
2. Run `npx html-validate public/site/*.html` — catches markup regressions.
3. Run `bash scripts/mirror-pages-manual.sh` after pushing to `main` (until CF Pages quota resets).
4. Update this file when you close a gap above.
