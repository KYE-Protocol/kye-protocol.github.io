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
          <label for="kye-contact-name">Name</label>
          <input type="text" id="kye-contact-name" name="name" autocomplete="name" required />
          <label for="kye-contact-email">Email</label>
          <input type="email" id="kye-contact-email" name="email" autocomplete="email" required />
          <label for="kye-contact-org">Organisation <span style="font-weight:400;color:var(--text-dim)">(optional)</span></label>
          <input type="text" id="kye-contact-org" name="organisation" autocomplete="organization" />
          <label for="kye-contact-topic">Topic</label>
          <select id="kye-contact-topic" name="topic">
            <option value="general">General enquiry</option>
            <option value="trademark">Trademark policy</option>
            <option value="patent">Patent licensing</option>
            <option value="conformance">Conformance &amp; certification</option>
            <option value="security">Security advisory</option>
            <option value="partnership">Partnership / pilot</option>
          </select>
          <label for="kye-contact-message">Message</label>
          <textarea id="kye-contact-message" name="message" required></textarea>
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
    const topic = (fd.get('topic') || 'general').toString();
    const message = (fd.get('message') || '').toString().trim();
    const subject = `[KYE Protocol] ${topic} — ${name || 'enquiry'}`;
    const acceptedAt = new Date().toISOString();
    const body = [
      `From: ${name} <${email}>`,
      org ? `Organisation: ${org}` : null,
      `Topic: ${topic}`,
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
