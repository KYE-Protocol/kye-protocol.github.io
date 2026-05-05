/* Decision dashboard — animated counters + donut chart of decision mix.
 *
 * A synthetic workload "runs" against the reference Gateway, sampling
 * decisions from a realistic distribution. Counters tick up; donut adjusts.
 */

const DIST = [
  { key: "allow",      label: "allow_with_constraints", color: "#10b981", weight: 62 },
  { key: "approval",   label: "require_approval",       color: "#f59e0b", weight: 14 },
  { key: "deny",       label: "deny",                   color: "#ef4444", weight: 18 },
  { key: "allow_red",  label: "allow_with_redaction",   color: "#22d3ee", weight: 6  },
];

function tickCounter(el, from, to, dur = 600) {
  const start = performance.now();
  function step(t) {
    const k = Math.min(1, (t - start) / dur);
    const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
    el.textContent = v.toLocaleString();
    if (k < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function arc(cx, cy, r, a0, a1) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
  const large = (a1 - a0) > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}

function renderDonut(svg, counts) {
  const ns = "http://www.w3.org/2000/svg";
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  const cx = 120, cy = 120, r = 84;
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
  let theta = -Math.PI / 2;
  for (const seg of DIST) {
    const v = counts[seg.key] || 0;
    const arcLen = (v / total) * Math.PI * 2;
    if (arcLen <= 0.001) continue;
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", arc(cx, cy, r, theta, theta + arcLen));
    path.setAttribute("stroke", seg.color);
    path.setAttribute("stroke-width", "26");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-linecap", "butt");
    svg.appendChild(path);
    theta += arcLen;
  }
}

function pickWeighted() {
  const total = DIST.reduce((s, d) => s + d.weight, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const d of DIST) { acc += d.weight; if (r <= acc) return d.key; }
  return DIST[0].key;
}

function renderLegend(host, counts) {
  host.innerHTML = "";
  const total = Object.values(counts).reduce((s, n) => s + n, 0) || 1;
  for (const seg of DIST) {
    const v = counts[seg.key] || 0;
    const pct = ((v / total) * 100).toFixed(1);
    const row = document.createElement("div");
    row.className = "donut-legend-row";
    row.innerHTML = `<div class="left"><span class="swatch" style="background:${seg.color}"></span><code style="font-family:var(--font-mono);font-size:12px">${seg.label}</code></div><div class="right">${v.toLocaleString()} <span style="color:var(--text-dim)">(${pct}%)</span></div>`;
    host.appendChild(row);
  }
}

export function initDashboard() {
  const svg = document.getElementById("donut");
  const playBtn = document.getElementById("dash-play");
  const pauseBtn = document.getElementById("dash-pause");
  const clearBtn = document.getElementById("dash-clear");
  const legend = document.getElementById("donut-legend");
  if (!svg) return;

  const counts = { allow: 0, approval: 0, deny: 0, allow_red: 0 };
  const els = {
    total: document.getElementById("ct-total"),
    allow: document.getElementById("ct-allow"),
    approval: document.getElementById("ct-approval"),
    deny: document.getElementById("ct-deny"),
    centerV: document.getElementById("donut-center-v"),
  };
  const deltas = {
    total: document.getElementById("ct-total-delta"),
    allow: document.getElementById("ct-allow-delta"),
    approval: document.getElementById("ct-approval-delta"),
    deny: document.getElementById("ct-deny-delta"),
  };
  let timer = null;
  const prev = { total: 0, allow: 0, approval: 0, deny: 0 };

  function refresh() {
    const total = counts.allow + counts.approval + counts.deny + counts.allow_red;
    const allowSum = counts.allow + counts.allow_red;
    tickCounter(els.total, prev.total, total);
    tickCounter(els.allow, prev.allow, allowSum);
    tickCounter(els.approval, prev.approval, counts.approval);
    tickCounter(els.deny, prev.deny, counts.deny);
    deltas.total.textContent = "+" + (total - prev.total);
    deltas.allow.textContent = "+" + (allowSum - prev.allow);
    deltas.approval.textContent = "+" + (counts.approval - prev.approval);
    deltas.deny.textContent = "+" + (counts.deny - prev.deny);
    deltas.deny.classList.toggle("up", false); deltas.deny.classList.toggle("down", true);
    prev.total = total; prev.allow = allowSum; prev.approval = counts.approval; prev.deny = counts.deny;
    renderDonut(svg, counts);
    renderLegend(legend, counts);
    els.centerV.textContent = total ? Math.round((allowSum / total) * 100) + "%" : "0%";
  }

  function tickOne() {
    // simulate a small batch arriving
    const batch = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < batch; i++) {
      const k = pickWeighted();
      counts[k]++;
    }
    refresh();
  }

  function play() {
    if (timer) return;
    tickOne();
    timer = setInterval(tickOne, 1100);
  }
  function pause() { if (timer) { clearInterval(timer); timer = null; } }
  function clear() { pause(); for (const k of Object.keys(counts)) counts[k] = 0; for (const k of Object.keys(prev)) prev[k] = 0; refresh(); }

  // initial seed so the donut isn't empty
  for (let i = 0; i < 80; i++) counts[pickWeighted()]++;
  refresh();

  playBtn?.addEventListener("click", play);
  pauseBtn?.addEventListener("click", pause);
  clearBtn?.addEventListener("click", clear);

  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { play(); io.disconnect(); } }, { threshold: 0.4 });
  io.observe(svg);
}
