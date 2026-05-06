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

const NAV_ITEMS = [
  { id: 'home',             href: './',                    label: 'Home',             icon: 'home',                    color: '#1A8754' },
  { id: 'protocol',         href: 'protocol.html',         label: 'Protocol',         icon: 'architecture',            color: '#00ACC1' },
  { id: 'developers',       href: 'developers.html',       label: 'Developers',       icon: 'code',                    color: '#1A73E8' },
  { id: 'buyers',           href: 'buyers.html',           label: 'Buyers',           icon: 'business_center',         color: '#B47200' },
  { id: 'auditors',         href: 'auditors.html',         label: 'Auditors',         icon: 'verified_user',           color: '#009688' },
  { id: 'regulators',       href: 'regulators.html',       label: 'Regulators',       icon: 'gavel',                   color: '#8E24AA' },
  { id: 'compliance',       href: 'compliance.html',       label: 'Compliance',       icon: 'rule',                    color: '#1A73E8' },
  { id: 'frameworks',       href: 'frameworks.html',       label: 'Frameworks',       icon: 'fact_check',              color: '#1A73E8' },
  { id: 'oscal',            href: 'oscal.html',            label: 'OSCAL',            icon: 'integration_instructions',color: '#1A73E8' },
  { id: 'compliance-card',  href: 'compliance-card.html',  label: 'Compliance card',  icon: 'badge',                   color: '#009688' },
  { id: 'sectors',          href: 'sectors.html',          label: 'Sectors',          icon: 'apartment',               color: '#5F6368' },
  { id: 'usecases',         href: 'usecases.html',         label: 'Use cases',        icon: 'lightbulb',               color: '#F4B400' },
  { id: 'risk',             href: 'risk.html',             label: 'Risk',             icon: 'shield',                  color: '#C5221F' },
  { id: 'readiness',        href: 'readiness.html',        label: 'Readiness',        icon: 'checklist',               color: '#1A8754' },
  { id: 'demos',            href: 'demos.html',            label: 'Demos',            icon: 'play_circle',             color: '#EA4335' },
  { id: 'whitepaper',       href: 'whitepaper.html',       label: 'Whitepaper',       icon: 'menu_book',               color: '#00838F' },
];

const TM_NOTICE_FULL =
  'KYE<span class="tm">™</span>, ' +
  'KYE Protocol<span class="tm">™</span>, ' +
  'Know Your Entity<span class="tm">™</span>, ' +
  'Authority Finality<span class="tm">™</span>, ' +
  'Authority Graph<span class="tm">™</span>, ' +
  'Decision Map<span class="tm">™</span>, ' +
  'Evidence Graph<span class="tm">™</span>, ' +
  'Blast Radius Map<span class="tm">™</span>, ' +
  'Compliance Map<span class="tm">™</span>, ' +
  'KYE Compliance Mapping Rail<span class="tm">™</span>, ' +
  'KYE Cloud<span class="tm">™</span>, ' +
  'KYE Conformant<span class="tm">™</span>, ' +
  'KYE Certified<span class="tm">™</span>, ' +
  'KYE Self-Tested<span class="tm">™</span>, and ' +
  'KYE Self-Attested<span class="tm">™</span> ' +
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

export function kyeHeader({ active = '' } = {}) {
  const links = NAV_ITEMS.map(n => {
    const cls = n.id === active ? 'tb-link is-active' : 'tb-link';
    return `<a href="${n.href}" class="${cls}" data-tb="${n.id}"><span class="ms">${n.icon}</span><span class="lbl">${n.label}</span></a>`;
  }).join('\n      ');
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

// Grouped column structure for the site footer. Each group has a heading
// and a list of {href, label, attrs?} items. Order matters for visual
// scanning: protocol/spec first (the thing being defined), then the
// compliance pages, then audience pages, then resources, then site/legal.
const FOOTER_GROUPS = [
  {
    heading: 'Protocol',
    items: [
      { href: './',                label: 'Home' },
      { href: 'protocol.html',     label: 'Protocol' },
      { href: 'vocabulary.html',   label: 'Vocabulary' },
      { href: 'whitepaper.html',   label: 'Whitepaper' },
      { href: 'roadmap.html',      label: 'Roadmap' },
      { href: 'integrations.html', label: 'Integrations' },
      { href: 'changelog.html',    label: 'Changelog' },
    ],
  },
  {
    heading: 'Compliance',
    items: [
      { href: 'compliance.html',      label: 'Compliance' },
      { href: 'frameworks.html',      label: 'Frameworks' },
      { href: 'oscal.html',           label: 'OSCAL' },
      { href: 'compliance-card.html', label: 'Compliance card' },
    ],
  },
  {
    heading: 'Audiences',
    items: [
      { href: 'developers.html', label: 'Developers' },
      { href: 'buyers.html',     label: 'Buyers' },
      { href: 'auditors.html',   label: 'Auditors' },
      { href: 'regulators.html', label: 'Regulators' },
      { href: 'sectors.html',    label: 'Sectors' },
      { href: 'customers.html',  label: 'Customers' },
    ],
  },
  {
    heading: 'Resources',
    items: [
      { href: 'usecases.html',  label: 'Use cases' },
      { href: 'risk.html',      label: 'Risk & mitigation' },
      { href: 'readiness.html', label: 'Readiness self-test' },
      { href: 'demos.html',     label: 'Demos' },
      { href: 'docs.html',      label: 'Docs hub' },
      { href: 'faq.html',       label: 'FAQ' },
    ],
  },
  {
    heading: 'Site',
    items: [
      { href: 'status.html',    label: 'Status' },
      { href: 'press.html',     label: 'Press kit' },
      { href: 'sitemap.html',   label: 'Sitemap' },
      { href: 'legal.html',     label: 'Legal' },
      { href: 'legal-faq.html', label: 'Legal FAQ' },
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
}
