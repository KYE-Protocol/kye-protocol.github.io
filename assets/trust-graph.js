/* Trust graph — D3 force-directed visualization of entities, delegations,
 * scopes and access rights. Uses the global d3 loaded from CDN.
 */

const NODES = [
  { id: "ag1",  type: "ai_agent",   label: "agent.proc",    color: "#6366f1" },
  { id: "ag2",  type: "ai_agent",   label: "agent.review",  color: "#6366f1" },
  { id: "ag3",  type: "ai_agent",   label: "agent.invoice", color: "#6366f1" },
  { id: "biz",  type: "business",   label: "Acme Ltd",      color: "#22d3ee" },
  { id: "cfo",  type: "person",     label: "CFO",           color: "#22d3ee" },
  { id: "doc",  type: "resource",   label: "doc.read",      color: "#94a3b8" },
  { id: "wal",  type: "wallet",     label: "wallet.gbp",    color: "#f59e0b" },
  { id: "ven",  type: "resource",   label: "vendor.pay",    color: "#f59e0b" },
  { id: "scp1", type: "scope",      label: "scp:fin:prod",  color: "#10b981" },
  { id: "scp2", type: "scope",      label: "scp:fin:read",  color: "#10b981" },
  { id: "ar1",  type: "access_right", label: "ar:doc:read", color: "#10b981" },
];

const LINKS = [
  { source: "cfo", target: "ag1", layer: "delegation" },
  { source: "cfo", target: "ag2", layer: "delegation" },
  { source: "cfo", target: "ag3", layer: "delegation" },
  { source: "ag1", target: "scp1", layer: "scope" },
  { source: "ag2", target: "scp2", layer: "scope" },
  { source: "ag3", target: "scp1", layer: "scope" },
  { source: "scp1", target: "wal", layer: "scope" },
  { source: "scp1", target: "ven", layer: "scope" },
  { source: "scp2", target: "doc", layer: "scope" },
  { source: "ag1", target: "ar1", layer: "access_right" },
  { source: "ar1", target: "doc", layer: "access_right" },
  { source: "ag2", target: "biz", layer: "delegation" },
  { source: "ag3", target: "biz", layer: "delegation" },
];

const NODE_META = {
  ag1: { kind: "ai_agent", scope: "scp1", entity_id: "kye:ent:acme:ai_agent:01J...PROC" },
  ag2: { kind: "ai_agent", scope: "scp2", entity_id: "kye:ent:acme:ai_agent:01J...REVU" },
  ag3: { kind: "ai_agent", scope: "scp1", entity_id: "kye:ent:acme:ai_agent:01J...INVC" },
  biz: { kind: "business", entity_id: "kye:ent:acme:business:01JACME" },
  cfo: { kind: "person", entity_id: "kye:ent:acme:person:01JCFO" },
  doc: { kind: "resource", entity_id: "kye:ent:acme:resource:01JDOC" },
  wal: { kind: "wallet", entity_id: "kye:ent:acme:wallet:01JGBP" },
  ven: { kind: "resource", entity_id: "kye:ent:acme:vendor:01JVEN" },
  scp1: { kind: "scope", scope_id: "kye:scp:acme:01JFIN-PROD", actions: "payment.initiate, document.render" },
  scp2: { kind: "scope", scope_id: "kye:scp:acme:01JFIN-READ", actions: "document.read" },
  ar1: { kind: "access_right", access_right_id: "kye:ar:acme:01JAR-READ", allowed: "document.read" },
};

export function initTrustGraph() {
  const stage = document.getElementById("tg-stage");
  if (!stage) return;
  // Wait up to ~3s for d3 to load (deferred CDN script). On a cold mobile
  // load main.js can run a tick before the d3 <script defer> finishes,
  // and silently bailing here meant the trust graph rendered no nodes.
  if (typeof d3 === "undefined") {
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (typeof d3 !== "undefined") { clearInterval(id); initTrustGraph(); }
      else if (tries > 30) { clearInterval(id); /* give up silently */ }
    }, 100);
    return;
  }
  // Use the live stage dimensions; if they're 0 (e.g. layout not settled
  // on first paint), pick a reasonable default that the SVG viewBox will
  // scale into the real container size on resize.
  const W = stage.clientWidth  || 720;
  const H = stage.clientHeight || 480;

  const svg = d3.select(stage).append("svg").attr("viewBox", `0 0 ${W} ${H}`).attr("width", "100%").attr("height", "100%");
  const layers = { entity: true, delegation: true, scope: true, access_right: true };
  const nodes = NODES.map((n) => ({ ...n }));
  const links = LINKS.map((l) => ({ ...l, revoked: false }));

  const linkSel = svg.append("g").selectAll("line")
    .data(links).enter().append("line").attr("class", "tg-link")
    .attr("stroke-linecap", "round");

  const nodeSel = svg.append("g").selectAll("g")
    .data(nodes).enter().append("g")
      .attr("class", "tg-node")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", (d) => `${d.label} — ${d.type}. Press Enter to select.`)
    .call(d3.drag()
      .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
      .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
      .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; }))
    .on("keydown", function(e, d) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(d); }
    });

  nodeSel.append("circle").attr("r", 10).attr("fill", (d) => d.color);
  nodeSel.append("text").attr("dy", -14).attr("text-anchor", "middle").text((d) => d.label);

  const sim = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id((d) => d.id).distance(70).strength(0.7))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(W / 2, H / 2))
    .force("collide", d3.forceCollide(22))
    .on("tick", () => {
      linkSel.attr("x1", (d) => d.source.x).attr("y1", (d) => d.source.y).attr("x2", (d) => d.target.x).attr("y2", (d) => d.target.y);
      nodeSel.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

  function applyVisibility() {
    nodeSel.style("display", (d) => layers[d.type === "ai_agent" || d.type === "business" || d.type === "person" || d.type === "wallet" || d.type === "resource" ? "entity" : d.type] ? null : "none");
    linkSel.style("display", (d) => layers[d.layer] ? null : "none").classed("is-revoked", (d) => d.revoked);
  }

  // Side panel + selection
  const info = document.getElementById("tg-info");
  const titleEl = document.getElementById("tg-info-title");
  const metaEl = document.getElementById("tg-info-meta");

  function select(d) {
    nodeSel.classed("is-selected", (n) => n.id === d.id);
    titleEl.textContent = d.label;
    const meta = NODE_META[d.id] ?? {};
    metaEl.innerHTML = Object.entries(meta).map(([k, v]) =>
      `<dt>${k}</dt><dd>${String(v)}</dd>`).join("");
  }
  nodeSel.on("click", (_e, d) => select(d));

  // Layer toggles
  document.querySelectorAll("#tg-controls .tg-toggle").forEach((b) => {
    b.addEventListener("click", () => {
      const layer = b.getAttribute("data-layer");
      layers[layer] = !layers[layer];
      b.classList.toggle("is-on", layers[layer]);
      applyVisibility();
    });
  });

  // Revoke a delegation
  document.getElementById("tg-revoke")?.addEventListener("click", () => {
    const candidate = links.find((l) => l.layer === "delegation" && !l.revoked);
    if (!candidate) return;
    candidate.revoked = true;
    const targetId = typeof candidate.target === "object" ? candidate.target.id : candidate.target;
    const targetNode = nodes.find((n) => n.id === targetId);
    if (targetNode) targetNode.color = "#ef4444";
    nodeSel.select("circle").attr("fill", (d) => d.color);
    applyVisibility();
  });
  document.getElementById("tg-reset")?.addEventListener("click", () => {
    links.forEach((l) => (l.revoked = false));
    NODES.forEach((n0) => { const live = nodes.find((n) => n.id === n0.id); if (live) live.color = n0.color; });
    nodeSel.select("circle").attr("fill", (d) => d.color);
    applyVisibility();
  });

  applyVisibility();
}
