/**
 * KYE Protocol™ — Evidence Pack Preview viewer.
 *
 * Mounts on any element with [data-evidence-preview]. An auditor /
 * regulator / buyer picks a sample evidence pack and runs four common
 * actions:
 *
 *   1. Verify signature — verify the pack's outer signature against
 *      the publisher's published JWKS.
 *   2. Replay decision — walk the bound Decision Map™ and re-run the
 *      authorise call against the snapshot state.
 *   3. View audit chain — show the append-only events linked via the
 *      audit_ref.
 *   4. Map to controls — project the pack onto a chosen framework
 *      (SOC 2, ISO 27001, EU AI Act, …) via the KYE Compliance
 *      Mapping Rail™.
 *
 * The verification + replay logic is intentionally simulated — it
 * exists to make the protocol's audit semantics tangible to a
 * non-technical visitor. Production verifiers ship in the SDKs
 * (TypeScript / Python / Go) and run end-to-end against the
 * publisher's JWKS.
 */

const PACKS = [
  {
    id:    'kye:evidence-pack:01HX-purchase-001',
    label: 'Agent purchase — allow_with_constraints',
    decision: 'allow_with_constraints',
    bound: {
      principal: 'kye:entity:person:customer_123',
      actor:     'kye:entity:agent:shopping_agent_456',
      capability: 'kye:capability:payment_action:card_purchase',
      amount: '£99.99',
      merchant: 'merchant_M-7104',
    },
    audit: [
      'audit:001 — entity.created (agent)',
      'audit:002 — delegation.created (TPP → agent)',
      'audit:003 — authority.granted (purchase)',
      'audit:004 — runtime.authorize (allow_with_constraints)',
      'audit:005 — evidence_pack.generated',
    ],
    framework_hits: {
      'SOC 2':       ['CC6.1 — Logical access', 'CC7.2 — System monitoring'],
      'ISO 27001':   ['A.5.15 — Access control', 'A.8.34 — Protection during testing'],
      'EU AI Act':   ['Art. 12 — Record keeping', 'Art. 14 — Human oversight'],
      'PSD3':        ['SCA at the edge', 'Audit trail of authority chain'],
    },
  },
  {
    id:    'kye:evidence-pack:01HX-revoke-002',
    label: 'Authority revocation — cascade event pack',
    decision: 'revoked',
    bound: {
      principal: 'kye:entity:person:customer_123',
      actor:     'kye:entity:agent:shopping_agent_456',
      capability: 'kye:capability:payment_action:card_purchase',
      reason: 'principal_revoked_authority',
    },
    audit: [
      'audit:101 — authority.revoked (purchase)',
      'audit:102 — delegation.revoked (cascade)',
      'audit:103 — entity.quarantined (agent)',
      'audit:104 — webhook.delivered (5 subscribers)',
      'audit:105 — evidence_pack.generated',
    ],
    framework_hits: {
      'SOC 2':       ['CC7.3 — Incident response'],
      'ISO 27001':   ['A.5.26 — Response to incidents'],
      'EU AI Act':   ['Art. 14 — Human oversight', 'Art. 16 — Provider obligations'],
      'DORA':        ['ICT incident-reporting evidence'],
    },
  },
];

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function shellHTML() {
  const opts = PACKS.map((p, i) =>
    `<option value="${i}">${escape(p.label)}</option>`
  ).join('');
  const fwOpts = ['SOC 2', 'ISO 27001', 'EU AI Act', 'PSD3', 'DORA'].map(f =>
    `<option value="${f}">${f}</option>`
  ).join('');
  return `
    <div class="ep-shell">
      <div class="ep-controls">
        <fieldset class="br-fs">
          <legend>Sample evidence pack</legend>
          <select data-ep-pack>${opts}</select>
        </fieldset>
        <div class="ep-pack-card" data-ep-pack-card>
          <div class="ep-pack-id">pack_id</div>
          <div class="ep-pack-id-val"><code data-ep-pack-id></code></div>
          <p class="ep-pack-meta" data-ep-pack-meta></p>
        </div>
        <div class="ep-actions">
          <button class="ep-action-btn" type="button" data-ep-action="verify"><span class="ms">verified</span> Verify signature</button>
          <button class="ep-action-btn" type="button" data-ep-action="replay"><span class="ms">replay</span> Replay decision</button>
          <button class="ep-action-btn" type="button" data-ep-action="audit"><span class="ms">history</span> View audit chain</button>
          <fieldset class="br-fs">
            <legend>Map to framework</legend>
            <select data-ep-framework>${fwOpts}</select>
            <button class="ep-action-btn" type="button" data-ep-action="map" style="margin-top:8px"><span class="ms">rule</span> Project mapping</button>
          </fieldset>
        </div>
      </div>
      <div class="ep-output" data-ep-output>
        <h4><span class="ms">touch_app</span> Pick an action on the left.</h4>
        <p class="ep-pack-meta">Each action runs against the selected pack and shows what an auditor would see when they replay it offline using the publisher's published JWKS. The verifier SDKs ship in the public org &mdash; this preview shows the same outputs.</p>
      </div>
    </div>
  `;
}

function selectedPack(host) {
  const i = parseInt(host.querySelector('[data-ep-pack]').value, 10) || 0;
  return PACKS[i];
}

function refreshSubject(host) {
  const p = selectedPack(host);
  host.querySelector('[data-ep-pack-id]').textContent = p.id;
  host.querySelector('[data-ep-pack-meta]').innerHTML =
    `<strong>Decision:</strong> <code>${escape(p.decision)}</code> &middot; <strong>Actor:</strong> <code>${escape(p.bound.actor)}</code> &middot; <strong>Principal:</strong> <code>${escape(p.bound.principal)}</code>`;
}

function renderOutput(host, html, family = '') {
  const out = host.querySelector('[data-ep-output]');
  out.className = `ep-output ${family}`;
  out.innerHTML = html;
}

function actVerify(host) {
  const p = selectedPack(host);
  renderOutput(host,
    `<div class="ep-status is-allow"><span class="ms">verified</span> SIGNATURE VALID</div>
     <h4><span class="ms">verified</span> Pack signature verified offline</h4>
     <ul>
       <li><strong>Algorithm:</strong> <code>ed25519</code></li>
       <li><strong>Key id:</strong> <code>kye:key:evidence_signing_001</code></li>
       <li><strong>JWKS source:</strong> <code>https://issuer.example/.well-known/jwks.json</code> (cached)</li>
       <li><strong>Pack hash:</strong> <code>sha256:9c4a&hellip;f12</code> (matches signed digest)</li>
       <li><strong>Timestamp:</strong> within publisher's stated freshness window</li>
     </ul>
     <p class="ep-pack-meta" style="margin-top:10px">No outbound calls; verification is fully offline using the publisher's published JWKS. The verifier SDKs (TypeScript / Python / Go) ship in the public org.</p>`,
    'is-allow');
}

function actReplay(host) {
  const p = selectedPack(host);
  const obj = {
    actor_entity_id:     p.bound.actor,
    principal_entity_id: p.bound.principal,
    subject:             p.bound.capability,
    resource:            { merchant_id: p.bound.merchant || '—', amount: p.bound.amount || '—' },
    snapshot_at:         '2026-05-06T21:30:00Z',
  };
  const out = {
    decision: p.decision,
    reason:   p.bound.reason || 'scope_within_attenuated_authority',
    obligations: ['audit.emit', 'basket_hash_binding'],
    decision_map_ref: 'kye:decision_map:01HX-purchase-001',
  };
  renderOutput(host,
    `<div class="ep-status is-allow"><span class="ms">replay</span> REPLAY MATCHES ORIGINAL</div>
     <h4><span class="ms">replay</span> Decision replayed against snapshot state</h4>
     <p class="ep-pack-meta">Replaying <code>POST /v1/runtime/authorize</code> with the snapshot inputs from this pack returns the same decision the audit chain recorded:</p>
     <pre><code>// Inputs (from pack)
${escape(JSON.stringify(obj, null, 2))}

// Decision (from runtime)
${escape(JSON.stringify(out, null, 2))}</code></pre>
     <p class="ep-pack-meta" style="margin-top:10px">A mismatch would emit <code>kye.decision.replay_mismatch</code> and open an integrity incident.</p>`,
    'is-allow');
}

function actAudit(host) {
  const p = selectedPack(host);
  renderOutput(host,
    `<h4><span class="ms">history</span> Audit chain entries</h4>
     <p class="ep-pack-meta">Append-only entries linked to this pack via <code>audit_ref</code>. Each entry is hash-linked to the previous; tampering would break the chain.</p>
     <ul>${p.audit.map(a => `<li><code>${escape(a)}</code></li>`).join('')}</ul>`);
}

function actMap(host) {
  const p = selectedPack(host);
  const fw = host.querySelector('[data-ep-framework]').value;
  const hits = p.framework_hits[fw];
  if (!hits) {
    renderOutput(host,
      `<div class="ep-status is-fail"><span class="ms">block</span> NO MAPPING</div>
       <h4><span class="ms">rule</span> ${escape(fw)} &mdash; no controls hit</h4>
       <p class="ep-pack-meta">This pack doesn't carry obligations the KYE Compliance Mapping Rail<span class="tm">™</span> projects to ${escape(fw)} controls. Try a different framework.</p>`,
      'is-fail');
    return;
  }
  renderOutput(host,
    `<div class="ep-status is-allow"><span class="ms">rule</span> ${hits.length} CONTROL${hits.length === 1 ? '' : 'S'} HIT</div>
     <h4><span class="ms">rule</span> ${escape(fw)} &mdash; control mapping</h4>
     <p class="ep-pack-meta">The KYE Compliance Mapping Rail<span class="tm">™</span> projects this pack onto the following ${escape(fw)} controls:</p>
     <ul>${hits.map(h => `<li>${escape(h)}</li>`).join('')}</ul>
     <p class="ep-pack-meta" style="margin-top:10px">The full 266-mapping projection lives on <a href="frameworks.html">the per-framework page</a>.</p>`,
    'is-allow');
}

const ACTIONS = { verify: actVerify, replay: actReplay, audit: actAudit, map: actMap };

export function initEvidencePackPreview() {
  const hosts = document.querySelectorAll('[data-evidence-preview]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.epMounted) return;
    host.dataset.epMounted = '1';
    host.classList.add('ep-host');
    host.innerHTML = shellHTML();
    refreshSubject(host);
    host.addEventListener('change', e => {
      if (e.target.matches('[data-ep-pack]')) refreshSubject(host);
    });
    host.addEventListener('click', e => {
      const btn = e.target.closest('[data-ep-action]');
      if (!btn) return;
      const fn = ACTIONS[btn.dataset.epAction];
      if (fn) fn(host);
    });
  });
}
