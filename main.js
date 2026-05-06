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
