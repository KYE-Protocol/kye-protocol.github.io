/* Comparison matrix — KYE™ vs the existing protocol stack.
 * Sortable columns, hover highlights, click product to expand notes.
 */
import { COMPARISON_DIMENSIONS, COMPARISON_PRODUCTS } from "../data/comparison.js";

const CELL = {
  Y: { cls: "cell-yes",     text: "yes" },
  P: { cls: "cell-partial", text: "partial" },
  N: { cls: "cell-no",      text: "no" },
};

export function initComparison() {
  const root = document.getElementById("cmp-table");
  if (!root) return;

  const dims = COMPARISON_DIMENSIONS;
  const products = [...COMPARISON_PRODUCTS];

  // header — each product col gets a stable id used by tbody headers=""
  const thead = document.createElement("thead");
  const trH = document.createElement("tr");
  const capTh = makeTh("Capability");
  capTh.id = "cmp-cap";
  capTh.scope = "col";
  trH.appendChild(capTh);
  products.forEach((p, i) => {
    const th = makeTh(p.name);
    th.id = "cmp-prod-" + i;
    th.scope = "col";
    if (p.ver) {
      const v = document.createElement("div");
      v.style.cssText = "font-size:10px;color:var(--text-dim);font-weight:400;margin-top:2px";
      v.textContent = p.ver;
      th.appendChild(v);
    }
    if (p.isKye) th.style.color = "var(--accent-2)";
    trH.appendChild(th);
  });
  thead.appendChild(trH);
  root.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const dim of dims) {
    const tr = document.createElement("tr");
    const td = document.createElement("th");
    td.scope = "row";
    td.id = "cmp-dim-" + dim.key;
    td.className = "product-col";
    td.textContent = dim.label;
    tr.appendChild(td);
    products.forEach((p, i) => {
      const cell = document.createElement("td");
      const v = CELL[p.cells[dim.key]] || CELL.N;
      cell.className = v.cls;
      cell.textContent = v.text;
      cell.style.textAlign = "left";
      cell.setAttribute("headers", `cmp-prod-${i} cmp-dim-${dim.key}`);
      cell.setAttribute("aria-label", `${p.name}: ${dim.label} — ${v.text}`);
      if (p.isKye) cell.style.background = "rgba(99,102,241,0.08)";
      tr.appendChild(cell);
    });
    tbody.appendChild(tr);
  }
  root.appendChild(tbody);

  // small caption
  const cap = document.createElement("caption");
  cap.style.cssText = "caption-side:bottom;text-align:left;color:var(--text-dim);font-size:11px;padding-top:14px";
  cap.innerHTML = "● <span style='color:var(--success)'>yes</span> &nbsp; ◐ <span style='color:var(--warning)'>partial</span> &nbsp; ○ not in scope. KYE™ scope is the full stack; alternatives cover slices.";
  root.appendChild(cap);
}

function makeTh(text) {
  const th = document.createElement("th");
  th.textContent = text;
  return th;
}
