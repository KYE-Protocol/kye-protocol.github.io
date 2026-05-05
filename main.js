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
