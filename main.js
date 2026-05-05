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
