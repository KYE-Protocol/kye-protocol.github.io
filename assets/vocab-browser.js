/* Vocabulary browser — category tabs + compact list rows.
 *
 * Tabs at the top show every category with a count badge. Click a tab to
 * filter; "all" by default. Free-text search filters across whichever
 * category is active (or all). The results list is compact two-column rows,
 * not full cards, so the section stays short even when 70+ terms exist.
 */
import { VOCAB } from "../data/vocab.js";

const CAT_ORDER = [
  "entity_type", "lifecycle", "decision", "action",
  "signal", "obligation", "stop_condition", "reason_code",
];
const CAT_LABEL = {
  entity_type: "Entity types",
  lifecycle: "Lifecycle",
  decision: "Decisions",
  action: "Actions",
  signal: "Signals",
  obligation: "Obligations",
  stop_condition: "Stop conditions",
  reason_code: "Reason codes",
};

export function initVocabBrowser() {
  const q = document.getElementById("vocab-q");
  const cats = document.getElementById("vocab-cats");
  const out = document.getElementById("vocab-out");
  const counts = document.getElementById("vocab-counts");
  if (!q || !out || !cats) return;

  let active = "entity_type";

  function countsByCat() {
    const c = {};
    for (const v of VOCAB) c[v.category] = (c[v.category] || 0) + 1;
    return c;
  }
  const totals = countsByCat();

  function renderCats() {
    cats.innerHTML = "";
    const allBtn = document.createElement("button");
    allBtn.className = "vocab-cat" + (active === "all" ? " is-on" : "");
    allBtn.innerHTML = `All <span class="badge">${VOCAB.length}</span>`;
    allBtn.addEventListener("click", () => { active = "all"; render(); });
    cats.appendChild(allBtn);
    for (const cat of CAT_ORDER) {
      const n = totals[cat] || 0;
      if (!n) continue;
      const b = document.createElement("button");
      b.className = "vocab-cat" + (active === cat ? " is-on" : "");
      b.innerHTML = `${CAT_LABEL[cat] || cat} <span class="badge">${n}</span>`;
      b.addEventListener("click", () => { active = cat; render(); });
      cats.appendChild(b);
    }
  }

  function render() {
    renderCats();
    const norm = (q.value || "").toLowerCase().trim();
    let items = VOCAB;
    if (active !== "all") items = items.filter((v) => v.category === active);
    if (norm) {
      items = items.filter((v) =>
        v.name.toLowerCase().includes(norm) ||
        v.category.toLowerCase().includes(norm) ||
        v.desc.toLowerCase().includes(norm),
      );
    }
    counts.textContent = `${items.length} term${items.length === 1 ? "" : "s"}` +
      (active !== "all" ? ` in ${CAT_LABEL[active] || active}` : "") +
      (norm ? ` matching "${norm}"` : "");
    out.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.style.cssText = "padding:32px;text-align:center;color:var(--text-dim);font-size:13px";
      empty.textContent = "No matches. Try a different category or query.";
      out.appendChild(empty);
      return;
    }
    items.forEach((v) => {
      const row = document.createElement("div");
      row.className = "vocab-row";
      const left = document.createElement("div");
      left.className = "v-name";
      left.textContent = v.name;
      const right = document.createElement("div");
      right.className = "v-desc";
      if (active === "all") {
        const pill = document.createElement("span");
        pill.className = "v-cat-pill";
        pill.textContent = (CAT_LABEL[v.category] || v.category).toLowerCase();
        right.appendChild(pill);
      }
      right.appendChild(document.createTextNode(v.desc));
      row.appendChild(left); row.appendChild(right);
      out.appendChild(row);
    });
  }

  q.addEventListener("input", render);
  render();
}
