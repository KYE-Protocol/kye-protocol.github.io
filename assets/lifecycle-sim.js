/* Lifecycle simulator. */
import { LIFECYCLE_TRANSITIONS } from "../data/lifecycle.js";

const STATUS_FOR = {
  discovered: "active", registered: "active", pending_verification: "active",
  verified: "active", active: "active", limited: "limited",
  under_review: "active", approval_required: "active", suspended: "suspended",
  stopped: "stopped", quarantined: "quarantined", revoked: "revoked",
  transferred: "active", archived: "archived", tombstoned: "tombstoned",
};
const SIGNAL_FOR = {
  suspended: "entity.suspended", stopped: "entity.stop",
  quarantined: "entity.quarantine", revoked: "entity.revoked",
  archived: "entity.archived", verified: "entity.verified",
};
const CASCADE_TRIGGERS = new Set(["stopped", "quarantined", "revoked", "tombstoned"]);

export function initLifecycleSim() {
  const stateEl = document.getElementById("lc-state");
  const statusEl = document.getElementById("lc-status");
  const transitionsEl = document.getElementById("lc-transitions");
  const cascadeEl = document.getElementById("lc-cascade-list");
  const logEl = document.getElementById("lc-log");
  const resetBtn = document.getElementById("lc-reset");
  if (!stateEl) return;

  let current = "active";

  function render() {
    stateEl.textContent = current;
    statusEl.textContent = "status: " + STATUS_FOR[current];
    const next = LIFECYCLE_TRANSITIONS[current] || [];
    transitionsEl.innerHTML = "";
    if (current === "tombstoned" || next.length === 0) {
      const note = document.createElement("p");
      note.style.cssText = "color:var(--text-dim);font-size:13px";
      note.textContent = "no transitions from " + current;
      transitionsEl.appendChild(note);
      return;
    }
    next.forEach((to) => {
      const b = document.createElement("button");
      b.className = "lc-btn";
      b.textContent = "→ " + to;
      b.addEventListener("click", () => transition(to));
      transitionsEl.appendChild(b);
    });
  }
  function appendLog(line) {
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString()} ${line}`;
    logEl.prepend(li);
  }
  function transition(to) {
    const sig = SIGNAL_FOR[to];
    appendLog(`entity.lifecycle.${current} → ${to}`);
    if (sig) appendLog(`signal.publish ${sig}`);
    cascadeEl.innerHTML = "";
    if (CASCADE_TRIGGERS.has(to)) {
      [
        "2 active delegations → suspended",
        "1 payment authority → revoked",
        "3 access rights → revoked",
      ].forEach((c) => {
        const li = document.createElement("li");
        li.textContent = "↳ " + c;
        cascadeEl.appendChild(li);
        appendLog("cascade " + c);
      });
    }
    current = to;
    render();
  }
  resetBtn?.addEventListener("click", () => {
    current = "active";
    cascadeEl.innerHTML = "";
    logEl.innerHTML = "";
    render();
  });
  render();
}
