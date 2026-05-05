/* Animated decision-flow walkthrough.
 * Color-codes the result panel and final highlighted step:
 *   allow_with_constraints → green
 *   require_approval       → amber (high-risk)
 *   deny                   → rose
 */
import { FLOW_SCENARIOS } from "../data/flows.js";

const DECISION_CLASS = {
  allow_with_constraints: "allow",
  require_approval: "approval",
  deny: "deny",
};
const ICON = {
  allow:    '<svg class="badge-icon" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#059669"/><path d="M6 11l3.5 3.5L16 8" stroke="white" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  approval: '<svg class="badge-icon" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#d97706"/><path d="M11 6v6M11 15v.5" stroke="white" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
  deny:     '<svg class="badge-icon" width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="#e11d48"/><path d="M7 7l8 8M15 7l-8 8" stroke="white" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
};

export function initDecisionFlow() {
  const stepsEl = document.getElementById("flow-steps");
  const playBtn = document.getElementById("play-flow");
  const stopBtn = document.getElementById("stop-flow");
  const sel = document.getElementById("flow-scenario");
  const card = document.querySelector(".flow-decision");
  const decEl = document.getElementById("flow-decision-value");
  const reasonsEl = document.getElementById("flow-decision-reasons");
  const obsEl = document.getElementById("flow-decision-obligations");
  if (!stepsEl) return;

  let timer = null;
  function reset() {
    clearTimeout(timer);
    decEl.textContent = "—";
    decEl.className = "v";
    if (card) card.className = "flow-decision";
    reasonsEl.textContent = "";
    obsEl.textContent = "";
    render(sel.value);
  }
  function render(scenarioKey) {
    const s = FLOW_SCENARIOS[scenarioKey];
    const cls = DECISION_CLASS[s.decision] || "deny";
    stepsEl.innerHTML = "";
    s.steps.forEach((text) => {
      const li = document.createElement("li");
      li.classList.add("flow-" + cls);
      li.innerHTML = text;
      stepsEl.appendChild(li);
    });
  }
  function play() {
    reset();
    const s = FLOW_SCENARIOS[sel.value];
    const cls = DECISION_CLASS[s.decision] || "deny";
    let i = 0;
    function next() {
      const items = stepsEl.querySelectorAll("li");
      if (i >= items.length) {
        decEl.innerHTML = (ICON[cls] || "") + s.decision;
        decEl.className = "v " + cls;
        if (card) card.className = "flow-decision is-" + cls;
        reasonsEl.innerHTML = "<b>reasons:</b> " + s.reasons.map((r) => `<code>${r}</code>`).join(" ");
        obsEl.innerHTML = s.obligations.length
          ? "<b>obligations:</b> " + s.obligations.map((r) => `<code>${r}</code>`).join(" ")
          : "";
        return;
      }
      items[i].classList.add("is-active");
      i++;
      timer = setTimeout(next, 700);
    }
    next();
  }
  sel.addEventListener("change", reset);
  playBtn.addEventListener("click", play);
  stopBtn.addEventListener("click", reset);
  reset();
}
