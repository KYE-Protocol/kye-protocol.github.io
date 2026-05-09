/* Shared component factories for KYE Protocol™ public site.
 *
 * Background: every public/site/*.html page duplicates the top-bar
 * header, the universal footer (with the 16-mark trademark notice),
 * the scroll-top button, and the contact-modal markup inline. That
 * has caused real bugs — missing TMs, drifted nav links, the
 * legal.html page using the legacy `<header class="nav">` while
 * everything else uses `<header class="top-bar">`, etc.
 *
 * This module is the single source of truth for those chrome
 * components. Each factory takes an options object and returns the
 * canonical HTML string. mountKyeComponents() walks the DOM at
 * load time and rehydrates any element with a `data-kye-*` hook
 * with the canonical markup. Pages can ship the inline markup as
 * a "no-JS" fallback or just place an empty `<header data-kye-header>`
 * placeholder — both work.
 *
 * Usage in a page:
 *   <header data-kye-header data-active="developers"></header>
 *   <footer data-kye-footer></footer>
 *   <button data-kye-scroll-top></button>
 *   <!-- contact modal injected on first [data-contact-trigger] click -->
 */

// Top-bar nav: full surface organised into 6 visual groups via the
// `group` field. The kyeHeader render injects a thin divider between
// groups so the structure reads even on a single horizontal strip.
// Mobile (<1100px) collapses dividers; the strip horizontally scrolls.
//
// Group order: Protocol → Build → Compliance → Audience → Sector →
// Programme → Resources.
const NAV_ITEMS = [
  // Protocol
  { id: 'home',                href: './',                       label: 'Home',                                              icon: 'home',                    color: '#1A8754', group: 'protocol' },
  { id: 'protocol',            href: 'protocol.html',            label: 'Protocol',                                          icon: 'architecture',            color: '#00ACC1', group: 'protocol' },
  { id: 'concepts',            href: 'concepts.html',            label: 'Concepts',                                          icon: 'category',                color: '#00ACC1', group: 'protocol' },
  { id: 'continuity',          href: 'continuity.html',          label: 'Continuity',                                        icon: 'timeline',                color: '#1A8754', group: 'protocol' },
  { id: 'discoverability',     href: 'discoverability.html',     label: 'Discoverability',                                   icon: 'search',                  color: '#00ACC1', group: 'protocol' },
  { id: 'value',               href: 'value.html',               label: 'Value',                                             icon: 'auto_graph',              color: '#1A8754', group: 'protocol' },
  { id: 'whitepaper',          href: 'whitepaper.html',          label: 'Whitepaper',                                        icon: 'menu_book',               color: '#00838F', group: 'protocol' },

  // Build — technical entry points for implementing against the protocol
  { id: 'build',               href: 'build.html',               label: 'Build',                                             icon: 'construction',            color: '#1A8754', group: 'build' },
  { id: 'developers',          href: 'developers.html',          label: 'Developers',                                        icon: 'code',                    color: '#1A73E8', group: 'build' },
  { id: 'sandbox',             href: 'sandbox.html',             label: 'Sandbox',                                           icon: 'science',                 color: '#1A8754', group: 'build' },

  // Ecosystem — what's already built and available on top of the protocol
  { id: 'ecosystem',           href: 'ecosystem.html',           label: 'Ecosystem',                                         icon: 'hub',                     color: '#1A8754', group: 'ecosystem' },
  { id: 'wallet',              href: 'apps.html#wallet',         label: 'Wallet',                                            icon: 'account_balance_wallet',  color: '#1A8754', group: 'ecosystem' },
  { id: 'mcp',                 href: 'mcp.html',                 label: 'MCP',                                               icon: 'smart_toy',               color: '#8E24AA', group: 'ecosystem' },
  { id: 'connectors',          href: 'connectors.html',          label: 'Connectors',                                        icon: 'extension',               color: '#FF6D00', group: 'ecosystem' },
  { id: 'connector-profiles',  href: 'connector-profiles.html',  label: 'Profiles',                                          icon: 'grid_view',               color: '#00ACC1', group: 'ecosystem' },
  { id: 'apps',                href: 'apps.html',                label: 'Apps',                                              icon: 'apps',                    color: '#00838F', group: 'ecosystem' },
  { id: 'plugins',             href: 'plugins.html',             label: 'Plugins',                                           icon: 'power',                   color: '#5F6368', group: 'ecosystem' },
  { id: 'widgets',             href: 'widgets.html',             label: 'Widgets',                                           icon: 'widgets',                 color: '#1A8754', group: 'ecosystem' },

  // Compliance
  { id: 'trust',               href: 'trust.html',               label: 'Trust',                                             icon: 'gpp_good',                color: '#1A8754', group: 'compliance' },
  { id: 'compliance',          href: 'compliance.html',          label: 'Compliance',                                        icon: 'rule',                    color: '#1A73E8', group: 'compliance' },
  { id: 'frameworks',          href: 'frameworks.html',          label: 'Frameworks',                                        icon: 'fact_check',              color: '#1A73E8', group: 'compliance' },
  { id: 'oscal',               href: 'oscal.html',               label: 'OSCAL',                                             icon: 'integration_instructions',color: '#1A73E8', group: 'compliance' },
  { id: 'compliance-card',     href: 'compliance-card.html',     label: 'Compliance card',                                   icon: 'badge',                   color: '#009688', group: 'compliance' },
  { id: 'risk',                href: 'risk.html',                label: 'Risk',                                              icon: 'shield',                  color: '#C5221F', group: 'compliance' },
  { id: 'readiness',           href: 'readiness.html',           label: 'Readiness',                                         icon: 'checklist',               color: '#1A8754', group: 'compliance' },

  // By role — single entry into the persona-tab hub on buyers.html.
  // (Footer expands into per-persona deep-links; the top bar stays slim.)
  { id: 'buyers',              href: 'buyers.html#audiences',    label: 'By role',                                           icon: 'groups_2',                color: '#B47200', group: 'audience' },

  // By sector
  { id: 'sectors',             href: 'sectors.html',             label: 'Sectors',                                           icon: 'apartment',               color: '#5F6368', group: 'sector' },
  { id: 'usecases',            href: 'usecases.html',            label: 'Use cases',                                         icon: 'lightbulb',               color: '#F4B400', group: 'sector' },
  { id: 'sovereign-ai',        href: 'sovereign-ai.html',        label: 'Sovereign AI',                                      icon: 'public',                  color: '#1A73E8', group: 'sector' },
  { id: 'open-banking',        href: 'open-banking.html',        label: 'Open Banking',                                      icon: 'payments',                color: '#FF6D00', group: 'sector' },
  { id: 'agent-purchasing',    href: 'agent-purchasing.html',    label: 'Agent Purchasing',                                  icon: 'credit_card',             color: '#F4B400', group: 'sector' },

  // Programme
  { id: 'engage',              href: 'engage.html',              label: 'Engage',                                            icon: 'handshake',               color: '#1A8754', group: 'programme' },
  { id: 'partners',            href: 'partners.html',            label: 'Partners',                                          icon: 'group_work',              color: '#1A8754', group: 'programme' },
  { id: 'certification',       href: 'certification.html',       label: 'Certification',                                     icon: 'workspace_premium',       color: '#B47200', group: 'programme' },
  { id: 'training',            href: 'training.html',            label: 'Training',                                          icon: 'school',                  color: '#1A73E8', group: 'programme' },
  { id: 'working-groups',      href: 'working-groups.html',      label: 'Working groups',                                    icon: 'groups',                  color: '#00ACC1', group: 'programme' },

  // Resources
  { id: 'demos',               href: 'demos.html',               label: 'Demos',                                             icon: 'play_circle',             color: '#EA4335', group: 'resources' },
  { id: 'glossary',            href: 'glossary.html',            label: 'Glossary',                                          icon: 'book_2',                  color: '#5F6368', group: 'resources' },
];

const TM_NOTICE_FULL =
  'KYE<span class="tm">™</span>, ' +
  'KYE Protocol<span class="tm">™</span>, ' +
  'Know Your Entity<span class="tm">™</span>, ' +
  'Authority Finality<span class="tm">™</span>, ' +
  'KYE Chain of Authority<span class="tm">™</span>, ' +
  'Authority Graph<span class="tm">™</span>, ' +
  'Decision Map<span class="tm">™</span>, ' +
  'Evidence Pack<span class="tm">™</span>, ' +
  'Evidence Graph<span class="tm">™</span>, ' +
  'Blast Radius Map<span class="tm">™</span>, ' +
  'Compliance Map<span class="tm">™</span>, ' +
  'KYE Compliance Mapping Rail<span class="tm">™</span>, ' +
  'KYE Cloud Gateway<span class="tm">™</span>, ' +
  'KYE Reference Gateway<span class="tm">™</span>, ' +
  'KYE Runtime Gateway<span class="tm">™</span>, ' +
  'KYE Conformant<span class="tm">™</span>, ' +
  'KYE Certified<span class="tm">™</span>, ' +
  'KYE Self-Tested<span class="tm">™</span>, ' +
  'KYE Self-Attested<span class="tm">™</span>, ' +
  'KYE Sovereign AI Profile<span class="tm">™</span>, ' +
  'KYE Public Sector Profile<span class="tm">™</span>, ' +
  'KYE Cross-Agency Delegation Profile<span class="tm">™</span>, ' +
  'KYE Government API Authority Profile<span class="tm">™</span>, ' +
  'KYE Authority Wallet<span class="tm">™</span>, ' +
  'KYE Connector Hub<span class="tm">™</span>, ' +
  'KYE Connector Profiles<span class="tm">™</span>, ' +
  'KYE App Store<span class="tm">™</span>, ' +
  'KYE Plugin Marketplace<span class="tm">™</span>, ' +
  'KYE MCP Server<span class="tm">™</span>, ' +
  'KYE Signal Bus<span class="tm">™</span>, ' +
  'KYE Continuity Profile<span class="tm">™</span>, ' +
  'Authority Continuity<span class="tm">™</span>, ' +
  'Agency Continuity<span class="tm">™</span>, ' +
  'Continuity Decision Map<span class="tm">™</span>, ' +
  'Continuity Evidence Pack<span class="tm">™</span>, ' +
  'Delegated Agency Graph<span class="tm">™</span>, ' +
  'KYE Continuity Gateway<span class="tm">™</span>, ' +
  'KYE Intent Trace App<span class="tm">™</span>, ' +
  'KYE Agency Drift Monitor<span class="tm">™</span>, ' +
  'KYE Discoverability Profile<span class="tm">™</span>, ' +
  'KYE Authority Directory<span class="tm">™</span>, ' +
  'KYE Discovery Console<span class="tm">™</span>, ' +
  'KYE Authority Path Finder<span class="tm">™</span>, ' +
  'KYE Evidence Finder<span class="tm">™</span>, and ' +
  'KYE Connector Discovery Hub<span class="tm">™</span> ' +
  'are trademarks of the KYE Protocol<span class="tm">™</span> project.';

export function kyeBrand() {
  return `
    <a href="./" class="brand" aria-label="KYE Protocol home">
      <span class="brand-mark" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
          <path d="M14 14 L14 50 M14 32 L34 14 M14 32 L34 50 M40 14 L52 50 M52 14 L40 50"
                stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="brand-name">KYE Protocol<span class="tm">™</span></span>
    </a>`;
}

const GROUP_LABELS = {
  protocol:   'Protocol',
  build:      'Build',
  ecosystem:  'Ecosystem',
  compliance: 'Compliance',
  audience:   'By role',
  sector:     'By sector',
  programme:  'Programme',
  resources:  'Resources',
};

export function kyeHeader({ active = '' } = {}) {
  // Render with a thin divider + small group label between groups so
  // the structure of a 32-item nav reads at a glance on desktop.
  // Mobile (<1100px) hides the labels and the strip horizontally
  // scrolls through the items in group order.
  let prev = null;
  const parts = [];
  for (const n of NAV_ITEMS) {
    if (prev && n.group !== prev) {
      parts.push('<span class="tb-divider" aria-hidden="true"></span>');
    }
    if (n.group !== prev && GROUP_LABELS[n.group]) {
      parts.push(`<span class="tb-group-label" aria-hidden="true">${GROUP_LABELS[n.group]}</span>`);
    }
    prev = n.group;
    const cls = n.id === active ? 'tb-link is-active' : 'tb-link';
    parts.push(`<a href="${n.href}" class="${cls}" data-tb="${n.id}" data-group="${n.group || ''}"><span class="ms">${n.icon}</span><span class="lbl">${n.label}</span></a>`);
  }
  const links = parts.join('\n      ');
  return `
  <div class="container top-bar-inner">
    ${kyeBrand()}
    <nav class="top-bar-nav" aria-label="Primary">
      ${links}
    </nav>
    <div class="top-bar-actions">
      <a class="tb-cta" href="https://github.com/KYE-Protocol" target="_blank" rel="noopener" aria-label="GitHub repository">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg><span>GitHub</span>
      </a>
      <button class="theme-toggle" type="button" aria-label="Toggle dark / light theme" data-theme-toggle>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="22" height="22"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
        <svg class="icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="22" height="22"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
      </button>
      <button class="drawer-toggle" type="button" aria-label="Open navigation drawer" data-drawer-toggle>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="24" height="24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>
  </div>`;
}

// Footer column structure: 9 clean groups
//   Protocol · Profiles · Build · Ecosystem · Compliance · By role ·
//   Programme · Resources · Site
// Naming convention (zero inconsistency):
//   - Trademarked names keep their canonical form with ™
//     (e.g., "KYE Continuity Profile™", "AI System Compliance Card™").
//   - Acronyms remain ALL-CAPS ("OSCAL", "FAQ", "AI", "MCP", "CIO").
//   - Recognized-standard / proper-noun product names keep Title Case
//     ("Open Banking", "Sovereign AI", "Agent Purchasing").
//   - Every other label is sentence case (first word capitalised only).
const FOOTER_GROUPS = [
  {
    heading: 'Protocol',
    items: [
      { href: './',                label: 'Home' },
      { href: 'protocol.html',     label: 'Protocol' },
      { href: 'concepts.html',     label: 'Concepts' },
      { href: 'value.html',        label: 'Value' },
      { href: 'vocabulary.html',   label: 'Vocabulary' },
      { href: 'glossary.html',     label: 'Glossary' },
      { href: 'whitepaper.html',   label: 'Whitepaper' },
    ],
  },
  {
    heading: 'Profiles',
    items: [
      { href: 'sectors.html',             label: 'All profiles' },
      { href: 'usecases.html',            label: 'Use cases' },
      { href: 'ontology.html',            label: 'KYE Ontology Profile<span class="tm">™</span>' },
      { href: 'continuity.html',          label: 'KYE Continuity Profile<span class="tm">™</span>' },
      { href: 'discoverability.html',     label: 'KYE Discoverability Profile<span class="tm">™</span>' },
      { href: 'connectors.html',          label: 'KYE Connector Hub<span class="tm">™</span>' },
      { href: 'connector-profiles.html',  label: 'KYE Connector Profiles<span class="tm">™</span>' },
      { href: 'open-banking.html',        label: 'Open Banking' },
      { href: 'agent-purchasing.html',    label: 'Agent Purchasing' },
      { href: 'sovereign-ai.html',        label: 'Sovereign AI' },
    ],
  },
  {
    heading: 'Build',
    items: [
      { href: 'build.html',               label: 'Build with KYE<span class="tm">™</span>' },
      { href: 'developers.html',          label: 'Developer portal' },
      { href: 'sandbox.html',             label: 'Sandbox' },
      { href: 'protocol.html#signals',    label: 'KYE Signal Bus<span class="tm">™</span>' },
      { href: 'integrations.html',        label: 'Integrations' },
      { href: 'demos.html',               label: 'Demos' },
    ],
  },
  {
    heading: 'Ecosystem',
    items: [
      { href: 'ecosystem.html',           label: 'Ecosystem overview' },
      { href: 'apps.html#wallet',         label: 'KYE Authority Wallet<span class="tm">™</span>' },
      { href: 'mcp.html',                 label: 'KYE MCP Server<span class="tm">™</span>' },
      { href: 'apps.html',                label: 'KYE App Store<span class="tm">™</span>' },
      { href: 'plugins.html',             label: 'KYE Plugin Marketplace<span class="tm">™</span>' },
      { href: 'widgets.html',             label: 'Interactive widgets' },
    ],
  },
  {
    heading: 'Compliance',
    items: [
      { href: 'trust.html',           label: 'Trust center' },
      { href: 'trust-self-audit.html', label: 'Self-audit fixture (signed)' },
      { href: 'compliance.html',      label: 'Compliance' },
      { href: 'frameworks.html',      label: 'Frameworks' },
      { href: 'oscal.html',           label: 'OSCAL' },
      { href: 'compliance-card.html', label: 'AI System Compliance Card<span class="tm">™</span>' },
      { href: 'risk.html',            label: 'Risk &amp; mitigation' },
      { href: 'readiness.html',       label: 'Readiness self-test' },
    ],
  },
  {
    heading: 'By role',
    items: [
      { href: 'developers.html',                  label: 'Developers' },
      { href: 'buyers.html#persona-board',        label: 'Board &amp; executives' },
      { href: 'buyers.html#persona-cio',          label: 'CIOs &amp; CTOs' },
      { href: 'buyers.html#persona-risk',         label: 'Risk officers' },
      { href: 'buyers.html#persona-compliance',   label: 'Compliance officers' },
      { href: 'buyers.html#persona-legal',        label: 'Legal teams' },
      { href: 'buyers.html#persona-auditors',     label: 'Auditors' },
      { href: 'buyers.html#persona-regulators',   label: 'Regulators' },
      { href: 'buyers.html#persona-banks',        label: 'Banks &amp; payments' },
      { href: 'buyers.html#persona-utilities',    label: 'Critical infrastructure' },
    ],
  },
  {
    heading: 'Programme',
    items: [
      { href: 'engage.html',         label: 'Engagement model' },
      { href: 'partners.html',       label: 'Partners' },
      { href: 'certification.html',  label: 'Certification' },
      { href: 'training.html',       label: 'Training' },
      { href: 'working-groups.html', label: 'Working groups' },
      { href: 'customers.html',      label: 'Customers' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { href: 'docs.html',      label: 'Docs hub' },
      { href: 'faq.html',       label: 'FAQ' },
      { href: 'changelog.html', label: 'Changelog' },
      { href: 'roadmap.html',   label: 'Roadmap' },
      { href: 'press.html',     label: 'Press kit' },
      { href: 'sitemap.html',   label: 'Sitemap' },
    ],
  },
  {
    heading: 'Site',
    items: [
      { href: 'status.html',    label: 'Status' },
      { href: 'legal.html',     label: 'Legal' },
      { href: '#',              label: 'Talk to us', attrs: 'data-contact-trigger' },
    ],
  },
];

export function kyeFooter({ groups = null } = {}) {
  const all = groups || FOOTER_GROUPS;
  const groupsHtml = all.map(g => {
    const lis = g.items.map(l => {
      const attrs = l.attrs ? ` ${l.attrs}` : '';
      const ext   = (l.href || '').startsWith('http') ? ' target="_blank" rel="noopener"' : '';
      return `<li><a href="${l.href}"${ext}${attrs}>${l.label}</a></li>`;
    }).join('');
    return `
      <section class="footer-col">
        <h4>${g.heading}</h4>
        <ul>${lis}</ul>
      </section>`;
  }).join('');
  return `
  <div class="container footer-inner">
    <div class="footer-grid">${groupsHtml}</div>
    <div class="footer-bar">
      <div class="footer-copy">&copy; <span data-kye-year></span> KYE Protocol<span class="tm">™</span>. <a href="legal.html">Trademark policy &amp; legal FAQ &rarr;</a></div>
      <a href="https://github.com/KYE-Protocol" target="_blank" rel="noopener" class="footer-gh" aria-label="KYE Protocol on GitHub">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg><span>GitHub</span>
      </a>
    </div>
    <div class="footer-tm">${TM_NOTICE_FULL}</div>
  </div>`;
}

export function kyeScrollTop() {
  return `<svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
    <circle class="ring-bg" cx="26" cy="26" r="22" />
    <circle class="ring-progress" id="scroll-top-progress" cx="26" cy="26" r="22"
            stroke-dasharray="138.23" stroke-dashoffset="138.23" />
    <path class="arrow" d="M19 28 L26 21 L33 28 M26 22 L26 33" />
  </svg>`;
}

export function mountKyeComponents() {
  // Auto-detect active nav from <body data-page="X"> or document.body.dataset
  const active = document.body?.dataset?.page || '';

  // Header
  for (const el of document.querySelectorAll('[data-kye-header]')) {
    const a = el.dataset.active || active;
    if (!el.classList.contains('top-bar')) el.classList.add('top-bar');
    if (!el.getAttribute('role')) el.setAttribute('role', 'banner');
    el.innerHTML = kyeHeader({ active: a });
  }

  // Footer
  for (const el of document.querySelectorAll('[data-kye-footer]')) {
    if (!el.classList.contains('footer')) el.classList.add('footer');
    if (!el.getAttribute('role')) el.setAttribute('role', 'contentinfo');
    el.innerHTML = kyeFooter();
  }

  // Scroll-to-top
  for (const el of document.querySelectorAll('[data-kye-scroll-top]')) {
    if (el.tagName !== 'BUTTON') continue;
    if (!el.id) el.id = 'scroll-top';
    if (!el.classList.contains('scroll-top')) el.classList.add('scroll-top');
    if (!el.type) el.type = 'button';
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Scroll to top');
    el.innerHTML = kyeScrollTop();
  }

  // Year token
  const y = new Date().getFullYear();
  for (const el of document.querySelectorAll('[data-kye-year]')) {
    el.textContent = y;
  }

  // Glue ™/® to the preceding word so narrow viewports never wrap
  // "KYE" + "<span class="tm">™</span>" onto separate lines. CSS-only
  // fixes (margin-left, ::before word-joiner, white-space:nowrap on
  // the .tm itself) don't work because the line-break opportunity sits
  // BETWEEN the text node and the span — outside the span's reach.
  // The reliable fix: at load time, wrap each .tm + the trailing
  // chars of its preceding text node up to the last word boundary in
  // a single .tm-glue span with white-space:nowrap.
  glueTrademarkSpans();
}

function glueTrademarkSpans() {
  for (const tm of document.querySelectorAll('.tm, .reg')) {
    // Already wrapped in a glue span?
    const parent = tm.parentNode;
    if (!parent || parent.classList?.contains('tm-glue')) continue;
    const prev = tm.previousSibling;
    if (!prev || prev.nodeType !== 3) continue; // need a preceding text node
    const text = prev.nodeValue;
    if (!text) continue;
    // Find the last word-boundary in the preceding text. Glue from
    // there to the .tm element. Word-boundary = last whitespace, or
    // start-of-text.
    const m = text.match(/\S+\s*$/);
    if (!m) continue;
    const splitAt = m.index;
    // Split the text node so we keep everything before the last word
    // intact, and only re-parent the last word + the .tm.
    const tail = prev.splitText(splitAt);
    const glue = document.createElement('span');
    glue.className = 'tm-glue';
    parent.insertBefore(glue, tail);
    glue.appendChild(tail);
    glue.appendChild(tm);
  }
}
