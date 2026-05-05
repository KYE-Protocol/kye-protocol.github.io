/* Before / After widget — same scenario plays simultaneously in both panes.
 *
 * "Before" pane: an AI agent fans out calls to tools/services with no shared
 * identity, no policy, no audit. Edges blink red on collisions.
 *
 * "After" pane: identical fan-out, but every call goes through PEP → PDP →
 * audit chain → bus. Calls light up green; revoke cascades visibly.
 */

const ENTITIES = [
  { id: "agent", x: 50, y: 50, label: "AI agent", color: "#6366f1" },
  { id: "doc",   x: 180, y: 28, label: "doc.read", color: "#22d3ee" },
  { id: "pay",   x: 220, y: 80, label: "pay.init", color: "#f59e0b" },
  { id: "ext",   x: 200, y: 140, label: "export", color: "#ef4444" },
  { id: "wf",    x: 130, y: 200, label: "workflow", color: "#22d3ee" },
  { id: "tool",  x: 50, y: 180, label: "tool.exec", color: "#22d3ee" },
];

const EDGES = [
  { from: "agent", to: "doc", t: 200 },
  { from: "agent", to: "pay", t: 600 },
  { from: "agent", to: "ext", t: 1100 },
  { from: "agent", to: "wf",  t: 1500 },
  { from: "agent", to: "tool", t: 1900 },
];

function makeStage(host, mode) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 280 240");
  svg.setAttribute("width", "100%");
  svg.setAttribute("height", "100%");
  host.appendChild(svg);

  // chrome layer
  const chrome = document.createElementNS(ns, "g");
  svg.appendChild(chrome);
  if (mode === "after") {
    const ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", 50); ring.setAttribute("cy", 50);
    ring.setAttribute("r", 22); ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "rgba(124, 58, 237, 0.45)");
    ring.setAttribute("stroke-dasharray", "3 4");
    chrome.appendChild(ring);
    const lab = document.createElementNS(ns, "text");
    lab.setAttribute("x", 50); lab.setAttribute("y", 12);
    lab.setAttribute("text-anchor", "middle");
    lab.setAttribute("fill", "#7c3aed");
    lab.setAttribute("font-size", "8");
    lab.setAttribute("font-family", "JetBrains Mono, monospace");
    lab.textContent = "PEP / PDP";
    chrome.appendChild(lab);
  }

  // edges layer (drawn first so nodes overlay)
  const edgesG = document.createElementNS(ns, "g");
  svg.appendChild(edgesG);

  // nodes layer
  const nodesG = document.createElementNS(ns, "g");
  for (const e of ENTITIES) {
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", e.x); c.setAttribute("cy", e.y);
    c.setAttribute("r", e.id === "agent" ? 14 : 10);
    c.setAttribute("fill", e.color);
    c.setAttribute("opacity", "1");
    c.setAttribute("stroke", "rgba(15, 23, 42, 0.55)");
    c.setAttribute("stroke-width", "1.4");
    c.setAttribute("filter", "drop-shadow(0 3px 6px rgba(15,23,42,0.15))");
    nodesG.appendChild(c);
    const t = document.createElementNS(ns, "text");
    t.setAttribute("x", e.x); t.setAttribute("y", e.y + 24);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("fill", "#0b0f1c");
    t.setAttribute("font-size", "9");
    t.setAttribute("font-weight", "600");
    t.setAttribute("font-family", "JetBrains Mono, monospace");
    t.setAttribute("paint-order", "stroke");
    t.setAttribute("stroke", "rgba(255,255,255,0.95)");
    t.setAttribute("stroke-width", "2.5");
    t.setAttribute("stroke-linejoin", "round");
    t.textContent = e.label;
    nodesG.appendChild(t);
  }
  svg.appendChild(nodesG);

  // overlay layer (audit ticker for "after")
  const overlay = document.createElementNS(ns, "g");
  svg.appendChild(overlay);

  return { svg, edgesG, overlay };
}

function fireEdge(stage, edge, mode) {
  const ns = "http://www.w3.org/2000/svg";
  const from = ENTITIES.find((e) => e.id === edge.from);
  const to   = ENTITIES.find((e) => e.id === edge.to);
  const path = document.createElementNS(ns, "line");
  path.setAttribute("x1", from.x); path.setAttribute("y1", from.y);
  path.setAttribute("x2", from.x); path.setAttribute("y2", from.y);
  const blocked = mode === "after" && edge.to === "ext";
  path.setAttribute("stroke", mode === "before"
    ? (Math.random() < 0.4 ? "#e11d48" : "rgba(74,84,120,0.42)")
    : (blocked ? "#e11d48" : "#059669"));
  path.setAttribute("stroke-width", "1.6");
  path.setAttribute("opacity", "0");
  stage.edgesG.appendChild(path);

  const dur = 480;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / dur);
    path.setAttribute("x2", from.x + (to.x - from.x) * t);
    path.setAttribute("y2", from.y + (to.y - from.y) * t);
    path.setAttribute("opacity", String(0.85 * (1 - 0.4 * t)));
    if (t < 1) requestAnimationFrame(step);
    else {
      // fade out
      let f = 1;
      const fade = setInterval(() => {
        f -= 0.07;
        path.setAttribute("opacity", String(Math.max(0, f * 0.6)));
        if (f <= 0) { clearInterval(fade); path.remove(); }
      }, 30);

      if (mode === "after") {
        // append to audit ticker
        const x = to.x, y = to.y;
        const tick = document.createElementNS(ns, "text");
        tick.setAttribute("x", x); tick.setAttribute("y", y - 14);
        tick.setAttribute("text-anchor", "middle");
        tick.setAttribute("fill", blocked ? "#e11d48" : "#059669");
        tick.setAttribute("font-size", "8");
        tick.setAttribute("font-family", "JetBrains Mono, monospace");
        tick.textContent = blocked ? "deny" : "allow";
        stage.overlay.appendChild(tick);
        let o = 1, ty = y - 14;
        const a = setInterval(() => { o -= 0.06; ty -= 0.6; tick.setAttribute("opacity", String(o)); tick.setAttribute("y", String(ty)); if (o <= 0) { clearInterval(a); tick.remove(); } }, 30);
      }
    }
  }
  requestAnimationFrame(step);
}

export function initBeforeAfter() {
  const beforeHost = document.getElementById("ba-stage-before");
  const afterHost  = document.getElementById("ba-stage-after");
  const playBtn = document.getElementById("ba-play");
  const resetBtn = document.getElementById("ba-reset");
  if (!beforeHost || !afterHost) return;

  let timers = [];
  function reset() {
    timers.forEach(clearTimeout); timers = [];
    beforeHost.innerHTML = ""; afterHost.innerHTML = "";
    return { before: makeStage(beforeHost, "before"), after: makeStage(afterHost, "after") };
  }

  function play() {
    const stages = reset();
    EDGES.forEach((e) => {
      timers.push(setTimeout(() => fireEdge(stages.before, e, "before"), e.t));
      timers.push(setTimeout(() => fireEdge(stages.after, e, "after"), e.t));
    });
    // a second wave to make it feel busy
    EDGES.forEach((e) => {
      timers.push(setTimeout(() => fireEdge(stages.before, e, "before"), e.t + 2400));
      timers.push(setTimeout(() => fireEdge(stages.after, e, "after"), e.t + 2400));
    });
  }

  reset();
  playBtn?.addEventListener("click", play);
  resetBtn?.addEventListener("click", () => reset());
  // auto-play once when scrolled into view
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
  io.observe(beforeHost);
}
