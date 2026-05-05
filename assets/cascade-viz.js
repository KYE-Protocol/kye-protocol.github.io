/* Cascade ripple — when the actor is stopped, the signal radiates outward
 * through dependent delegations, payment authorities, and access rights.
 * Each ring touches a node; the side feed logs the resulting cascade events.
 */

const NODES = [
  { id: "actor", x: 220, y: 180, label: "actor", role: "agent", color: "#6366f1" },
  { id: "del1",  x: 100, y: 80,  label: "del:doc",  role: "delegation",  color: "#22d3ee" },
  { id: "del2",  x: 340, y: 80,  label: "del:pay",  role: "delegation",  color: "#22d3ee" },
  { id: "del3",  x: 100, y: 280, label: "del:exp",  role: "delegation",  color: "#22d3ee" },
  { id: "ar1",   x: 60,  y: 180, label: "ar:read",  role: "access_right",color: "#10b981" },
  { id: "pa1",   x: 380, y: 180, label: "pa:wallet",role: "payment_authority", color: "#f59e0b" },
  { id: "ar2",   x: 340, y: 280, label: "ar:write", role: "access_right",color: "#10b981" },
];
const LINKS = [
  { from: "actor", to: "del1" }, { from: "actor", to: "del2" },
  { from: "actor", to: "del3" }, { from: "actor", to: "ar1"  },
  { from: "actor", to: "pa1"  }, { from: "actor", to: "ar2"  },
];

function makeStage(host) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 460 360");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  host.appendChild(svg);

  const linksG = document.createElementNS(ns, "g");
  for (const l of LINKS) {
    const a = NODES.find((n) => n.id === l.from);
    const b = NODES.find((n) => n.id === l.to);
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
    line.setAttribute("stroke", "rgba(74, 84, 120, 0.3)");
    line.setAttribute("stroke-width", "1.4");
    line.dataset.target = b.id;
    linksG.appendChild(line);
  }
  svg.appendChild(linksG);

  const ripplesG = document.createElementNS(ns, "g");
  svg.appendChild(ripplesG);

  const nodesG = document.createElementNS(ns, "g");
  for (const n of NODES) {
    const g = document.createElementNS(ns, "g");
    g.setAttribute("transform", `translate(${n.x},${n.y})`);
    g.dataset.id = n.id;
    const c = document.createElementNS(ns, "circle");
    c.setAttribute("r", n.id === "actor" ? 18 : 13);
    c.setAttribute("fill", n.color);
    c.setAttribute("opacity", "1");
    c.setAttribute("stroke", "rgba(15, 23, 42, 0.55)");
    c.setAttribute("stroke-width", "1.6");
    c.setAttribute("filter", "drop-shadow(0 4px 10px rgba(15,23,42,0.18))");
    g.appendChild(c);
    const t = document.createElementNS(ns, "text");
    t.setAttribute("y", n.id === "actor" ? 36 : 28);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("fill", "#0b0f1c");
    t.setAttribute("font-size", "11");
    t.setAttribute("font-weight", "600");
    t.setAttribute("font-family", "JetBrains Mono, monospace");
    t.setAttribute("paint-order", "stroke");
    t.setAttribute("stroke", "rgba(255,255,255,0.95)");
    t.setAttribute("stroke-width", "3");
    t.setAttribute("stroke-linejoin", "round");
    t.textContent = n.label;
    g.appendChild(t);
    nodesG.appendChild(g);
  }
  svg.appendChild(nodesG);

  return { svg, ripplesG, linksG, nodesG };
}

function ripple(stage, fromX, fromY) {
  const ns = "http://www.w3.org/2000/svg";
  const r = document.createElementNS(ns, "circle");
  r.setAttribute("cx", fromX); r.setAttribute("cy", fromY);
  r.setAttribute("r", 14);
  r.setAttribute("fill", "none");
  r.setAttribute("stroke", "#ef4444");
  r.setAttribute("stroke-width", "2");
  r.setAttribute("opacity", "0.85");
  stage.ripplesG.appendChild(r);
  let radius = 14;
  const interval = setInterval(() => {
    radius += 4;
    r.setAttribute("r", String(radius));
    r.setAttribute("opacity", String(Math.max(0, 0.85 - radius / 220)));
    if (radius > 220) { clearInterval(interval); r.remove(); }
  }, 30);
}

function killNode(stage, id) {
  const g = stage.nodesG.querySelector(`g[data-id="${id}"]`);
  if (!g) return;
  const c = g.querySelector("circle");
  if (c) c.setAttribute("fill", "#ef4444");
  // pulse
  let r = parseFloat(c.getAttribute("r")), grow = true;
  const pulse = setInterval(() => {
    r += grow ? 1 : -1;
    if (r > 18) grow = false;
    if (r < 12) { grow = true; clearInterval(pulse); }
    c.setAttribute("r", String(r));
  }, 40);
  // dim the link to it
  const line = stage.linksG.querySelector(`line[data-target="${id}"]`);
  if (line) { line.setAttribute("stroke", "rgba(239,68,68,0.65)"); line.setAttribute("stroke-dasharray", "3 3"); }
}

function feed(list, kind, text) {
  const li = document.createElement("li");
  const ts = new Date().toLocaleTimeString();
  const pillCls = kind === "audit" ? "audit" : kind === "cascade" ? "cascade" : "signal";
  li.innerHTML = `<span class="pill ${pillCls}">${kind}</span><span style="color:var(--text-dim)">${ts}</span><span>${text}</span>`;
  list.prepend(li);
}

export function initCascadeViz() {
  const host = document.getElementById("cascade-stage");
  const list = document.getElementById("cascade-feed-list");
  const fireBtn = document.getElementById("cascade-fire");
  const resetBtn = document.getElementById("cascade-reset");
  if (!host || !list) return;

  let stage = null;
  function reset() {
    host.innerHTML = "";
    list.innerHTML = "";
    stage = makeStage(host);
  }

  function fire() {
    reset();
    const actor = NODES.find((n) => n.id === "actor");
    feed(list, "signal", "<code style='color:#fca5a5'>entity.stop</code> targeting <code>actor</code>");
    feed(list, "audit", "audit append <code>signal.entity.stop</code>");
    killNode(stage, "actor");
    let i = 0;
    const targets = LINKS.map((l) => l.to);
    const tick = setInterval(() => {
      ripple(stage, actor.x, actor.y);
      const t = targets[i];
      if (t) {
        const node = NODES.find((n) => n.id === t);
        const cascadeKind = node.role === "delegation" ? "delegation.suspended"
                          : node.role === "payment_authority" ? "payment_authority.revoked"
                          : "access_right.revoked";
        feed(list, "cascade", `<code>${cascadeKind}</code> via cascade → <code>${node.label}</code>`);
        feed(list, "audit", `audit append <code>${cascadeKind}</code> (correlation_id matches root)`);
        killNode(stage, t);
      }
      i++;
      if (i >= targets.length) clearInterval(tick);
    }, 600);
  }

  reset();
  fireBtn?.addEventListener("click", fire);
  resetBtn?.addEventListener("click", reset);

  // auto-play once when scrolled into view
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { fire(); io.disconnect(); } }, { threshold: 0.4 });
  io.observe(host);
}
