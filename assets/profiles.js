/* Profiles tabs. */
import { PROFILES } from "../data/profiles.js";

export function initProfiles() {
  const tabs = document.getElementById("profile-tabs");
  const detail = document.getElementById("profile-detail");
  if (!tabs || !detail) return;
  let active = PROFILES[0].id;

  function render() {
    tabs.innerHTML = "";
    PROFILES.forEach((p) => {
      const b = document.createElement("button");
      b.className = "profile-tab" + (p.id === active ? " is-active" : "");
      b.textContent = p.name;
      b.addEventListener("click", () => { active = p.id; render(); });
      tabs.appendChild(b);
    });
    const p = PROFILES.find((x) => x.id === active);
    detail.innerHTML = `
      <div class="grid">
        <div>
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:var(--accent-2);font-weight:600">${p.id}${p.status ? ` &middot; ${p.status}` : ""}</p>
          <h3>${p.name}</h3>
          <p style="color:var(--text-muted);line-height:1.6">${p.description}</p>
          <p style="margin-top:18px;font-size:12px;color:var(--text-dim)">Adds vocabulary &amp; conformance &mdash; never new mechanism content into Core.</p>
        </div>
        <div>
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:var(--text-dim);margin-bottom:10px">Required endpoints</p>
          <ul class="endpoints">${p.endpoints.map((e) => `<li>${e}</li>`).join("")}</ul>
          <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.16em;color:var(--text-dim);margin:20px 0 10px">Key vocabulary</p>
          <ul class="terms">${p.terms.map((t) => `<li><code>${t.name}</code> &mdash; ${t.desc}</li>`).join("")}</ul>
        </div>
      </div>
    `;
  }
  render();
}
