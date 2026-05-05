/* KYE™ URN parser. Splits a URN, colour-codes each segment, shows metadata. */

const CLASS_NAMES = {
  ent: "Entity", del: "Delegation", scp: "Scope", cred: "Credential",
  att: "Attestation", sig: "Signal", pdc: "Policy decision",
  aud: "Audit event", rte: "Runtime event", pb: "Proof bundle",
  rcpt: "Transparency receipt", apr: "Approval", ar: "Access right",
  payauth: "Payment authority", tok: "Runtime token",
  td: "Trust domain", key: "Signing key", cor: "Correlation id",
};

function render(value, out) {
  out.innerHTML = "";
  if (!value) {
    out.innerHTML = '<p style="color:var(--text-dim);font-size:13px">Type a URN above or pick a sample.</p>';
    return;
  }
  const parts = value.split(":");
  if (parts.length < 2 || parts[0] !== "kye") {
    const span = document.createElement("span");
    span.className = "urn-token urn-tok-bad";
    span.textContent = value;
    out.appendChild(span);
    const note = document.createElement("p");
    note.style.cssText = "color:#fca5a5;font-size:12px;margin-top:10px";
    note.textContent = "Not a valid KYE URN. Must start with kye:";
    out.appendChild(note);
    return;
  }
  const tokenWrap = document.createElement("div");
  const labels = ["prefix", "class", "td", "sub", "local"];
  parts.forEach((p, i) => {
    const tok = document.createElement("span");
    tok.className = "urn-token urn-tok-" + (labels[Math.min(i, 4)] || "local");
    tok.textContent = p;
    tokenWrap.appendChild(tok);
  });
  out.appendChild(tokenWrap);

  const meta = document.createElement("div");
  meta.className = "urn-meta";
  const classCode = parts[1];
  const known = CLASS_NAMES[classCode];
  function row(k, v) {
    const a = document.createElement("div"); a.innerHTML = `<b>${k}</b>`;
    const b = document.createElement("div"); b.style.fontFamily = "var(--font-mono)"; b.style.fontSize = "12px"; b.textContent = v;
    meta.appendChild(a); meta.appendChild(b);
  }
  row("Class", `${classCode}${known ? " — " + known : " (unknown)"}`);
  if (parts[2]) row("Trust domain", parts[2]);
  if (parts[3]) row("Subclass / record", parts[3]);
  if (parts[4]) row("Local id", parts[4]);
  out.appendChild(meta);

  // Copy-to-clipboard button
  const copy = document.createElement("button");
  copy.type = "button";
  copy.textContent = "copy URN";
  copy.setAttribute("aria-label", "Copy URN to clipboard");
  copy.style.cssText = "margin-top:14px;background:rgba(124,58,237,0.10);color:var(--accent);border:1px solid rgba(124,58,237,0.25);padding:6px 12px;font-size:11px;font-family:var(--font-mono);border-radius:6px;cursor:pointer";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(value);
      const orig = copy.textContent;
      copy.textContent = "✓ copied";
      setTimeout(() => (copy.textContent = orig), 1400);
    } catch { copy.textContent = "× failed"; }
  });
  out.appendChild(copy);
}

export function initUrnParser() {
  const input = document.getElementById("urn-input");
  const out = document.getElementById("urn-out");
  if (!input || !out) return;
  document.querySelectorAll(".urn-sample").forEach((b) => {
    b.addEventListener("click", () => { input.value = b.dataset.sample; render(input.value, out); });
  });
  input.addEventListener("input", () => render(input.value, out));
  input.value = "kye:ent:acme.example:ai_agent:01JY3J1D4E5A7K3JQFK4E0Q1XZ";
  render(input.value, out);
}
