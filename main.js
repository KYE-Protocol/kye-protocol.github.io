/* KYE Protocol™ landing — orchestrator. */
import { initHeroStats }    from "./assets/hero-stats.js";
import { initBeforeAfter }  from "./assets/before-after.js";
import { initTrustGraph }   from "./assets/trust-graph.js";
import { initDecisionFlow } from "./assets/decision-flow.js";
import { initCascadeViz }   from "./assets/cascade-viz.js";
import { initDashboard }    from "./assets/dashboard.js";
import { initComparison }   from "./assets/comparison.js";
import { initUrnParser }    from "./assets/urn-parser.js";
import { initProfiles }     from "./assets/profiles.js";
import { initLifecycleSim } from "./assets/lifecycle-sim.js";
import { initVocabBrowser } from "./assets/vocab-browser.js";
import { initScrollTop }    from "./assets/scroll-top.js";
import { initQuickstart, initStarCta } from "./assets/quickstart.js";

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

initHeroStats();
initBeforeAfter();
initTrustGraph();
initDecisionFlow();
initCascadeViz();
initDashboard();
initComparison();
initUrnParser();
initProfiles();
initLifecycleSim();
initVocabBrowser();
initScrollTop();
initQuickstart();
initStarCta();

/* WebMCP: expose KYE Protocol™ tools to AI agents via the browser. */
import { initWebMcp } from "./assets/webmcp.js";
initWebMcp();

/* Theme toggle — persists to localStorage; works alongside @media
   prefers-color-scheme (the toggle, when set, always wins). */
(function initThemeToggle() {
  const STORE_KEY = "kye-theme";
  const root = document.documentElement;
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  function current() {
    const explicit = root.getAttribute("data-theme");
    if (explicit === "dark" || explicit === "light") return explicit;
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function apply(t) {
    root.setAttribute("data-theme", t);
    btn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    btn.title = t === "dark" ? "Light mode" : "Dark mode";
    try { localStorage.setItem(STORE_KEY, t); } catch (_) { /* ignore */ }
  }
  // Initial label/title
  apply(current());
  btn.addEventListener("click", () => apply(current() === "dark" ? "light" : "dark"));
})();

/* Audience toggle — All / Business / Technical. Persists to localStorage. */
(function initAudienceToggle() {
  const KEY = "kye-audience";
  const buttons = document.querySelectorAll(".aud-btn[data-audience]");
  if (!buttons.length) return;
  function apply(aud) {
    if (aud === "all") document.body.removeAttribute("data-audience");
    else document.body.setAttribute("data-audience", aud);
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.audience === aud));
    try { localStorage.setItem(KEY, aud); } catch (_) {}
  }
  let saved = "all";
  try { saved = localStorage.getItem(KEY) || "all"; } catch (_) {}
  if (!["all", "business", "technical"].includes(saved)) saved = "all";
  apply(saved);
  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.audience)));
})();

/* Mega-nav dropdowns — close on outside click, escape, and on selecting a link.
   Also enforce single-open (close other open dropdowns when one opens). */
(function initMegaNav() {
  const megas = document.querySelectorAll('.mega');
  if (!megas.length) return;
  function closeAll(except) {
    megas.forEach(d => { if (d !== except) d.removeAttribute('open'); });
  }
  megas.forEach(d => {
    d.addEventListener('toggle', () => { if (d.open) closeAll(d); });
    d.querySelectorAll('a').forEach(a => a.addEventListener('click', () => closeAll(null)));
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.mega')) closeAll(null);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAll(null);
  });
})();

/* Section accordion — collapses sections by default (per data-default-open).
   Persists state per-section in localStorage. Adds Expand all / Collapse all
   controls to the first .accordion-controls element on the page. */
(function initSectionAccordion() {
  const sections = document.querySelectorAll('.section.collapsible');
  if (!sections.length) return;
  const KEY = id => `kye-sec-${id}`;
  sections.forEach(sec => {
    const details = sec.querySelector('details');
    if (!details) return;
    let stored;
    try { stored = localStorage.getItem(KEY(sec.id)); } catch(_) {}
    const defaultOpen = sec.dataset.defaultOpen === 'true';
    const initial = stored == null ? defaultOpen : stored === 'true';
    if (initial) details.setAttribute('open', '');
    else details.removeAttribute('open');
    details.addEventListener('toggle', () => {
      try { localStorage.setItem(KEY(sec.id), String(details.open)); } catch(_) {}
    });
  });
  document.querySelectorAll('[data-accordion-expand-all]').forEach(b =>
    b.addEventListener('click', () => sections.forEach(s => {
      const d = s.querySelector('details'); if (d) d.setAttribute('open', '');
    })));
  document.querySelectorAll('[data-accordion-collapse-all]').forEach(b =>
    b.addEventListener('click', () => sections.forEach(s => {
      const d = s.querySelector('details'); if (d) d.removeAttribute('open');
    })));
})();

/* FAQ audience filter — tabs filter <details class="faq-item" data-faq-aud="..."> */
(function initFaqFilter() {
  const tabs = document.querySelectorAll('.faq-filter');
  const items = document.querySelectorAll('.faq-item');
  if (!tabs.length || !items.length) return;
  function apply(aud) {
    tabs.forEach(t => {
      const on = t.dataset.faqFilter === aud;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    items.forEach(it => {
      const auds = (it.dataset.faqAud || 'all').split(/\s+/);
      const show = aud === 'all' || auds.includes(aud) || auds.includes('all');
      it.classList.toggle('faq-hidden', !show);
    });
  }
  tabs.forEach(t => t.addEventListener('click', () => apply(t.dataset.faqFilter)));
})();

/* Mobile drawer toggle (Material top app bar). */
(function initDrawer() {
  const btn = document.querySelector('[data-drawer-toggle]');
  const topbar = document.querySelector('.top-bar');
  if (!btn || !topbar) return;
  let drawer = document.querySelector('.top-bar-drawer');
  if (!drawer) {
    // Build the drawer from the top-bar-nav children
    drawer = document.createElement('aside');
    drawer.className = 'top-bar-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');
    const sourceLinks = document.querySelectorAll('.top-bar-nav .tb-link');
    sourceLinks.forEach(a => {
      const clone = a.cloneNode(true);
      clone.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        topbar.classList.remove('drawer-open');
      });
      drawer.appendChild(clone);
    });
    // Append a GitHub CTA inside the drawer (top-bar CTA is hidden on mobile)
    const ghLink = document.createElement('a');
    ghLink.href = 'https://github.com/KYE-Protocol';
    ghLink.target = '_blank';
    ghLink.rel = 'noopener';
    ghLink.className = 'tb-link tb-cta-mobile';
    ghLink.innerHTML = '<span class="ms">open_in_new</span><span class="lbl">GitHub</span>';
    drawer.appendChild(ghLink);
    document.body.appendChild(drawer);
  }
  btn.addEventListener('click', () => {
    drawer.classList.toggle('is-open');
    topbar.classList.toggle('drawer-open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      drawer.classList.remove('is-open');
      topbar.classList.remove('drawer-open');
    }
  });
})();

/* Material Symbols font-load gate — set html.ms-loaded once the icon
   font is actually delivered. Until then, .ms spans stay invisible
   so the literal ligature text ('play_circle' etc) never flashes. */
(function gateMaterialSymbols() {
  if (!document.fonts || !document.fonts.load) {
    // Fallback: just show after a delay so the page works without the API
    setTimeout(() => document.documentElement.classList.add('ms-loaded'), 800);
    return;
  }
  document.fonts.load('24px "Material Symbols Outlined"', 'home').then(() => {
    document.documentElement.classList.add('ms-loaded');
  }).catch(() => {
    /* font failed to load — keep .ms hidden, labels remain readable */
  });
})();

/* Compliance-framework badges inside sector cards.
   Replaces every .sector-frameworks block (currently a dot-joined
   string like "SOC 2 · ISO 27001 · PCI DSS 4.0") with individually-
   coloured badges so the eye can scan frameworks at a glance. */
(function initFrameworkBadges() {
  const FW = {
    'SOC 2':         { slug: 'soc2',     hue: '#1A73E8' },
    'ISO 27001':     { slug: 'iso27001', hue: '#34A853' },
    'ISO 27001:2022':{ slug: 'iso27001', hue: '#34A853' },
    'ISO 42001':     { slug: 'iso42001', hue: '#0F9D58' },
    'PCI DSS':       { slug: 'pcidss',   hue: '#F4B400' },
    'PCI DSS 4.0':   { slug: 'pcidss',   hue: '#F4B400' },
    'PSD2':          { slug: 'psd2',     hue: '#FF6D00' },
    'PSD3':          { slug: 'psd3',     hue: '#FF6D00' },
    'PSD2/3':        { slug: 'psd2',     hue: '#FF6D00' },
    'PSD2/PSD3':     { slug: 'psd2',     hue: '#FF6D00' },
    'DORA':          { slug: 'dora',     hue: '#1565C0' },
    'NIS2':          { slug: 'nis2',     hue: '#3F51B5' },
    'EU AI Act':     { slug: 'euaiact',  hue: '#EA4335' },
    'HIPAA':         { slug: 'hipaa',    hue: '#D81B60' },
    'GDPR':          { slug: 'gdpr',     hue: '#8E24AA' },
    'NIST 800-207':  { slug: 'nist800',  hue: '#5F6368' },
    'NIST AI RMF':   { slug: 'nistairmf', hue: '#455A64' },
    'NIST CSF':      { slug: 'nistcsf',  hue: '#37474F' },
    'FedRAMP':       { slug: 'fedramp',  hue: '#1A8754' },
    'MiCA':          { slug: 'mica',     hue: '#C2185B' },
    'FFIEC':         { slug: 'ffiec',    hue: '#0277BD' },
    'RBI':           { slug: 'rbi',      hue: '#009688' },
    'MAS':           { slug: 'mas',      hue: '#6750A4' },
    'CRR3':          { slug: 'crr3',     hue: '#00838F' },
    'IEC 62443':     { slug: 'iec62443', hue: '#6D4C41' },
    'FAA':           { slug: 'faa',      hue: '#1565C0' },
    'EASA':          { slug: 'easa',     hue: '#3949AB' },
    'ICAO':          { slug: 'icao',     hue: '#1976D2' },
    'IATA':          { slug: 'iata',     hue: '#0288D1' },
    'IMO':           { slug: 'imo',      hue: '#00838F' },
    'IFRS':          { slug: 'ifrs',     hue: '#5D4037' },
    '42 CFR Part 2': { slug: 'cfr42',    hue: '#AD1457' },
  };
  const blocks = document.querySelectorAll('.sector-frameworks');
  if (!blocks.length) return;
  for (const el of blocks) {
    if (el.dataset.fwkBuilt) continue;
    const text = (el.textContent || '').trim();
    if (!text) continue;
    // Split on · or | with optional surrounding whitespace
    const parts = text.split(/\s*[·|]\s*/).map(s => s.trim()).filter(Boolean);
    if (!parts.length) continue;
    el.innerHTML = '';
    el.dataset.fwkBuilt = '1';
    el.classList.add('sector-frameworks-badged');
    for (const p of parts) {
      const meta = FW[p] || { slug: 'misc', hue: '#5F6368' };
      const span = document.createElement('span');
      span.className = 'fwk-badge';
      span.dataset.fwk = meta.slug;
      span.style.setProperty('--fwk', meta.hue);
      span.textContent = p;
      el.appendChild(span);
    }
  }
})();

/* Whitepaper section icons + per-section pager + reading progress.
   Prefixes each <h2 id> in .wp-article with a coloured Material
   icon based on the section id. Builds a 'previous / next' pager
   at the end of the article so users don't have to scroll back
   to the TOC. Also injects a small floating progress indicator
   showing 'N / total' as the user scrolls. */
(function initWhitepaperChrome() {
  const article = document.querySelector('.wp-article');
  if (!article) return;
  const ICON_FOR = {
    abstract:     ['description', '#1A8754'],
    problem:      ['warning',     '#EA4335'],
    prior:        ['compare',     '#5F6368'],
    design:       ['design_services', '#1A73E8'],
    model:        ['hub',         '#8E24AA'],
    architecture: ['account_tree','#00838F'],
    contract:     ['gavel',       '#3F51B5'],
    runtime:      ['memory',      '#009688'],
    profiles:     ['view_module', '#F57C00'],
    sectors:      ['apartment',   '#5F6368'],
    compliance:   ['rule',        '#1A73E8'],
    conformance:  ['verified',    '#1A8754'],
    addenda:      ['playlist_add_check', '#8E24AA'],
    security:     ['shield',      '#EA4335'],
    governance:   ['groups',      '#3F51B5'],
    roadmap:      ['route',       '#F57C00'],
    references:   ['menu_book',   '#5F6368'],
  };
  const sections = Array.from(article.querySelectorAll('h2[id]'));
  if (!sections.length) return;

  // 1. Section icons
  for (const h of sections) {
    const id = h.id.replace(/-.*$/, '');
    const meta = ICON_FOR[h.id] || ICON_FOR[id];
    if (!meta) continue;
    const [name, colour] = meta;
    if (h.querySelector('.wp-h2-icon')) continue;
    const span = document.createElement('span');
    span.className = 'ms wp-h2-icon';
    span.setAttribute('aria-hidden', 'true');
    span.style.color = colour;
    span.textContent = name;
    h.prepend(span);
    h.dataset.section = h.id;
    h.style.setProperty('--wp-h2-c', colour);
  }

  // 2. Per-section pager just before .wp-cite
  const cite = article.querySelector('.wp-cite');
  const pager = document.createElement('nav');
  pager.className = 'wp-pager';
  pager.setAttribute('aria-label', 'Whitepaper section navigation');
  const list = document.createElement('ol');
  list.className = 'wp-pager-list';
  sections.forEach((h, i) => {
    const li = document.createElement('li');
    const a  = document.createElement('a');
    a.href = '#' + h.id;
    const c = ICON_FOR[h.id] ? ICON_FOR[h.id][1] : (ICON_FOR[h.id.replace(/-.*$/, '')] || ['', '#5F6368'])[1];
    a.style.setProperty('--wp-h2-c', c);
    a.innerHTML = `<span class="wp-pager-num">${String(i + 1).padStart(2, '0')}</span><span class="wp-pager-t">${h.textContent.replace(/^[^A-Za-z0-9]+/, '').replace(/^[a-z_]+\s*/, '')}</span>`;
    li.appendChild(a);
    list.appendChild(li);
  });
  pager.appendChild(list);
  if (cite) cite.parentNode.insertBefore(pager, cite);
  else article.appendChild(pager);

  // 3. Floating section indicator
  const indicator = document.createElement('div');
  indicator.className = 'wp-section-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  indicator.innerHTML = `<span class="wp-section-indicator-num"></span><span class="wp-section-indicator-t"></span>`;
  document.body.appendChild(indicator);
  const numEl = indicator.querySelector('.wp-section-indicator-num');
  const tEl   = indicator.querySelector('.wp-section-indicator-t');
  function update() {
    const y = window.scrollY + 120;
    let active = sections[0];
    let activeIdx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= y) { active = sections[i]; activeIdx = i; }
      else break;
    }
    numEl.textContent = `${String(activeIdx + 1).padStart(2, '0')} / ${String(sections.length).padStart(2, '0')}`;
    tEl.textContent = active.textContent.replace(/^[^A-Za-z0-9]+/, '');
    const pct = Math.max(0, Math.min(1, (window.scrollY) / (document.documentElement.scrollHeight - window.innerHeight)));
    indicator.style.setProperty('--wp-progress', String(pct));
    indicator.classList.toggle('is-visible', window.scrollY > 200);
  }
  let raf = 0;
  window.addEventListener('scroll', () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = 0; update(); });
  }, { passive: true });
  update();
})();

/* Whitepaper / legal code-snippet colour tagger.
   Walks every <code> inside .wp-article and assigns a data-code
   attribute based on the snippet's content. CSS handles the
   actual colour (see §FINAL-26). */
(function initCodeSnippetColours() {
  // Tag every <code> on every page with a data-code category so the
  // CSS in §FINAL-26/31/32 can colour it. Order matters — earlier
  // patterns win. The final fallback ('misc') catches anything else
  // so no <code> ever renders in the default grey-on-grey.
  const codes = document.querySelectorAll('code');
  if (!codes.length) return;
  for (const el of codes) {
    if (el.dataset.code) continue;
    const t = (el.textContent || '').trim();
    if (!t) continue;

    // High-priority semantic categories
    if      (/^(GET|POST|PUT|PATCH|DELETE)\s+\//.test(t))                                el.dataset.code = 'endpoint';
    else if (/^allow(_with_constraints)?$/.test(t))                                      el.dataset.code = 'allow';
    else if (/^(deny|quarantine)$/.test(t))                                              el.dataset.code = 'deny';
    else if (/^require_(approval|step_up|human_review|recovery)$/.test(t))               el.dataset.code = 'condition';

    // KYE typed records, including PascalCase short names with no KYE prefix
    else if (/^KYE[A-Z]/.test(t))                                                        el.dataset.code = 'type';
    else if (/^[A-Z][a-zA-Z0-9]+$/.test(t) && /[a-z][A-Z]/.test(t))                      el.dataset.code = 'type';

    // Profile / schema versions: kye.x.y.v1
    else if (/^kye\.[a-z0-9_]+\.v[0-9]/.test(t))                                         el.dataset.code = 'profile';

    // URNs: kye:class:td:sub:local
    else if (/^kye:[a-z0-9_-]+:/.test(t))                                                el.dataset.code = 'urn';

    // npm packages: @scope/name
    else if (/^@[a-z0-9_-]+\/[a-z0-9_-]+$/.test(t))                                      el.dataset.code = 'package';

    // HTTP headers: capitalised words with hyphens (Accept-Version, Idempotency-Key, X-Break-Glass-...)
    else if (/^[A-Z][a-zA-Z0-9]*(-[A-Z][a-zA-Z0-9]*)+$/.test(t))                         el.dataset.code = 'header';

    // File paths and well-known URLs
    else if (/^\//.test(t) || /\//.test(t) && /\.(md|json|yaml|yml|js|ts|py|go|sql)$/.test(t))
                                                                                          el.dataset.code = 'path';
    else if (/^(private|public|src|scripts|node_modules|schemas)\//.test(t))             el.dataset.code = 'path';
    else if (/\.[a-z0-9_-]+\.(dev|com|io|org)(\/|$)/.test(t))                            el.dataset.code = 'path';

    // Filenames ending with .md / .json (without leading dir)
    else if (/^[a-z0-9_-]+\.(md|json|yaml|yml)$/.test(t))                                el.dataset.code = 'path';

    // Generic snake_case identifiers (state names, field names)
    else if (/^[a-z][a-z0-9_]*$/.test(t) && t.includes('_'))                             el.dataset.code = 'field';

    // Single-word lowercase identifiers (labels, lineage, ownership)
    else if (/^[a-z][a-z0-9]*$/.test(t))                                                 el.dataset.code = 'field';

    // Anything else → misc (still coloured, no longer grey)
    else                                                                                  el.dataset.code = 'misc';
  }
})();

/* Contact modal — Talk to us / Drop us a line.
   All submissions open a mailto: to [email protected] with the
   form fields prefilled in the body. No backend, no third party. */
(function initContactModal() {
  const triggers = document.querySelectorAll('[data-contact-trigger]');
  if (!triggers.length) return;

  const CONTACT_EMAIL = '[email protected]';
  let backdrop = document.getElementById('kye-contact-modal');

  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'kye-contact-modal';
    backdrop.className = 'kye-modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-labelledby', 'kye-contact-title');
    backdrop.innerHTML = `
      <div class="kye-modal">
        <button type="button" class="kye-modal-close" aria-label="Close" data-modal-close>&times;</button>
        <h3 id="kye-contact-title">Talk to us</h3>
        <p class="kye-modal-sub">Send a note straight to the maintainers. Submitting opens your mail client &mdash; nothing leaves your machine until you press <em>send</em>.</p>
        <form data-contact-form>
          <div class="kye-modal-grid">
            <div>
              <label for="kye-contact-name">Name <span class="kye-req" aria-label="required">*</span></label>
              <input type="text" id="kye-contact-name" name="name" autocomplete="name" required />
            </div>
            <div>
              <label for="kye-contact-email">Email <span class="kye-req" aria-label="required">*</span></label>
              <input type="email" id="kye-contact-email" name="email" autocomplete="email" required />
            </div>
            <div>
              <label for="kye-contact-org">Company <span class="kye-req" aria-label="required">*</span></label>
              <input type="text" id="kye-contact-org" name="organisation" autocomplete="organization" required />
            </div>
            <div>
              <label for="kye-contact-phone">Contact number <span class="kye-req" aria-label="required">*</span></label>
              <input type="tel" id="kye-contact-phone" name="phone" autocomplete="tel" inputmode="tel" required />
            </div>
            <div>
              <label for="kye-contact-position">Your role <span class="kye-req" aria-label="required">*</span></label>
              <select id="kye-contact-position" name="position" required>
                <option value="" disabled selected>Select your role&hellip;</option>
                <option value="board">Board / executive</option>
                <option value="cio">CIO / CTO</option>
                <option value="ciso">CISO / security lead</option>
                <option value="risk">Risk officer</option>
                <option value="compliance">Compliance / GRC</option>
                <option value="legal">Legal / general counsel</option>
                <option value="audit">Internal audit</option>
                <option value="regulator">Regulator / supervisor</option>
                <option value="architect">Architect / staff engineer</option>
                <option value="engineer">Engineer / developer</option>
                <option value="product">Product manager</option>
                <option value="procurement">Procurement / vendor management</option>
                <option value="founder">Founder / CEO</option>
                <option value="researcher">Researcher / academic</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label for="kye-contact-topic">Topic <span class="kye-req" aria-label="required">*</span></label>
              <select id="kye-contact-topic" name="topic" required>
                <option value="general">General enquiry</option>
                <option value="adoption">Adoption &mdash; integrating KYE Protocol&trade;</option>
                <option value="sales">Speak to sales &mdash; KYE Cloud&trade; / cost</option>
                <option value="trademark">Trademark policy</option>
                <option value="patent">Patent licensing</option>
                <option value="conformance">Conformance &amp; certification</option>
                <option value="security">Security advisory</option>
                <option value="partnership">Partnership / pilot</option>
              </select>
            </div>
          </div>
          <label for="kye-contact-message">Message <span class="kye-req" aria-label="required">*</span></label>
          <textarea id="kye-contact-message" name="message" required></textarea>
          <p class="kye-modal-note"><span class="kye-req">*</span> All marked fields are required.</p>
          <label class="kye-modal-accept" for="kye-contact-accept">
            <input type="checkbox" id="kye-contact-accept" name="accept" required />
            <span>I have read and accept the <a href="legal.html#terms" target="_blank" rel="noopener">terms &amp; conditions</a> and <a href="legal.html#privacy" target="_blank" rel="noopener">privacy policy</a>, and I confirm the information above is accurate.</span>
          </label>
          <div class="kye-modal-actions">
            <button type="button" class="btn btn-ghost" data-modal-close>Cancel</button>
            <button type="submit" class="btn btn-primary" data-submit disabled>Send via email</button>
          </div>
          <p class="kye-modal-meta">Your mail client will open with a pre-filled message to <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>. Nothing leaves your device until you press <em>Send</em>.</p>
        </form>
      </div>
    `;
    document.body.appendChild(backdrop);
  }

  function open() {
    backdrop.classList.add('is-open');
    const first = backdrop.querySelector('input, textarea, select');
    if (first) first.focus();
  }
  function close() {
    backdrop.classList.remove('is-open');
  }

  triggers.forEach(t => t.addEventListener('click', e => {
    e.preventDefault();
    open();
  }));

  backdrop.addEventListener('click', e => {
    if (e.target === backdrop) close();
    if (e.target.matches('[data-modal-close]')) close();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) close();
  });

  const form = backdrop.querySelector('[data-contact-form]');
  const acceptBox = form.querySelector('#kye-contact-accept');
  const submitBtn = form.querySelector('[data-submit]');
  acceptBox.addEventListener('change', () => {
    submitBtn.disabled = !acceptBox.checked;
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!acceptBox.checked) return;
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const org = (fd.get('organisation') || '').toString().trim();
    const phone = (fd.get('phone') || '').toString().trim();
    const position = (fd.get('position') || '').toString().trim();
    const topic = (fd.get('topic') || 'general').toString();
    const message = (fd.get('message') || '').toString().trim();
    const subject = `[KYE Protocol] ${topic} — ${name || 'enquiry'}`;
    const acceptedAt = new Date().toISOString();
    const body = [
      `From: ${name} <${email}>`,
      org      ? `Company: ${org}`         : null,
      phone    ? `Phone:   ${phone}`       : null,
      position ? `Role:    ${position}`    : null,
      `Topic:   ${topic}`,
      '',
      message,
      '',
      '---',
      `Accepted: terms & conditions + privacy policy at ${acceptedAt}`,
      '— Sent via the KYE Protocol™ contact form (kye-protocol.github.io)'
    ].filter(Boolean).join('\n');
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setTimeout(close, 200);
  });
})();
