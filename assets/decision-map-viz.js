/**
 * KYE Protocol™ — Decision Map™ visual viewer.
 *
 * Renders a Decision Map™ as an inline SVG chain: each link in the
 * authority chain (principal → delegation → actor → capability →
 * scope → state → policy) becomes a labelled node, the final decision
 * node is colour-coded by family (allow / approve / deny), and the
 * audit + evidence refs sit below the chain as bound artefacts.
 *
 * Two integration points:
 *
 *   1. Standalone: any element with [data-decision-map] receives a
 *      sample chain on mount (useful for landing-page reference).
 *
 *   2. Programmatic: renderDecisionMap(host, data) — pass a chain
 *      object and the viewer redraws. Used by the agent-purchase
 *      simulator to keep the visual chain in sync with the controls.
 *
 * The chain semantics are public spec; node ordering and node colour
 * mapping are presentational. The runtime mechanism that produced the
 * decision is part of the patent track and is not modelled here.
 */

const NODE_TYPES = {
  principal:  { icon: 'person',          label: 'principal',  hint: 'on whose behalf' },
  delegation: { icon: 'share',           label: 'delegation', hint: 'signed grant' },
  actor:      { icon: 'smart_toy',       label: 'actor',      hint: 'who acted' },
  capability: { icon: 'extension',       label: 'capability', hint: 'what action' },
  scope:      { icon: 'crop_free',       label: 'scope',      hint: 'within what bounds' },
  state:      { icon: 'bolt',            label: 'state',      hint: 'lifecycle status' },
  policy:     { icon: 'policy',          label: 'policy',     hint: 'binding rule' },
  decision:   { icon: 'gavel',           label: 'decision',   hint: 'verdict + reason' },
  audit:      { icon: 'history',         label: 'audit',      hint: 'append-only entry' },
  evidence:   { icon: 'verified',        label: 'evidence',   hint: 'signed pack' },
};

const DECISION_FAMILY = {
  allow:                  'is-allow',
  allow_with_constraints: 'is-allow',
  require_approval:       'is-approve',
  require_step_up:        'is-approve',
  require_human_review:   'is-approve',
  require_recovery:       'is-approve',
  quarantine:             'is-deny',
  deny:                   'is-deny',
};

const SAMPLE_CHAIN = {
  decision: 'allow_with_constraints',
  reason:   'scope_within_attenuated_authority',
  nodes: [
    { type: 'principal',  ref: 'kye:entity:person:customer_123',           short: 'customer_123' },
    { type: 'delegation', ref: 'kye:delegation:tpp_to_agent_002',          short: 'tpp_to_agent_002' },
    { type: 'actor',      ref: 'kye:entity:agent:shopping_agent_456',      short: 'shopping_agent' },
    { type: 'capability', ref: 'kye:capability:payment_action:card_purchase', short: 'card_purchase' },
    { type: 'scope',      ref: 'kye:scope:eu_eea_corridor_below_500_gbp',  short: '≤ £500 EU/EEA' },
    { type: 'state',      ref: 'kye:state:active',                         short: 'active' },
    { type: 'policy',     ref: 'kye:policy:agent_purchase_v1',             short: 'agent_purchase_v1' },
  ],
  audit_ref:     'kye:audit:event_001',
  evidence_refs: ['kye:evidence-pack:authority_revocation_001'],
};

function nodeHTML(node) {
  const cfg = NODE_TYPES[node.type] || { icon: 'circle', label: node.type, hint: '' };
  return `
    <li class="dm-node" data-node-type="${node.type}">
      <span class="ms dm-node-ico" aria-hidden="true">${cfg.icon}</span>
      <div class="dm-node-body">
        <div class="dm-node-type">${cfg.label}</div>
        <div class="dm-node-short">${escape(node.short)}</div>
        <div class="dm-node-ref"><code>${escape(node.ref)}</code></div>
        ${cfg.hint ? `<div class="dm-node-hint">${cfg.hint}</div>` : ''}
      </div>
    </li>
  `;
}

function decisionNodeHTML(decision, reason) {
  const family = DECISION_FAMILY[decision] || '';
  const cfg = NODE_TYPES.decision;
  return `
    <li class="dm-node dm-decision ${family}" data-node-type="decision">
      <span class="ms dm-node-ico" aria-hidden="true">${cfg.icon}</span>
      <div class="dm-node-body">
        <div class="dm-node-type">${cfg.label}</div>
        <div class="dm-node-short"><strong>${escape(decision)}</strong></div>
        <div class="dm-node-ref"><code>reason: ${escape(reason)}</code></div>
      </div>
    </li>
  `;
}

function bottomBindingsHTML(data) {
  const audit = data.audit_ref
    ? `<div class="dm-binding"><span class="ms">history</span><span class="dm-binding-k">audit_ref</span><code>${escape(data.audit_ref)}</code></div>`
    : '';
  const evidence = (data.evidence_refs || []).map(ref =>
    `<div class="dm-binding"><span class="ms">verified</span><span class="dm-binding-k">evidence_ref</span><code>${escape(ref)}</code></div>`
  ).join('');
  return `<div class="dm-bindings">${audit}${evidence}</div>`;
}

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

export function renderDecisionMap(host, data = SAMPLE_CHAIN) {
  if (!host) return;
  const chainNodes = (data.nodes || []).map(nodeHTML).join('');
  const decision   = decisionNodeHTML(data.decision || 'allow', data.reason || '—');
  host.classList.add('dm-host');
  host.innerHTML = `
    <ol class="dm-chain" aria-label="Decision Map authority chain">
      ${chainNodes}
      ${decision}
    </ol>
    ${bottomBindingsHTML(data)}
  `;
}

export function initDecisionMap() {
  const hosts = document.querySelectorAll('[data-decision-map]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.dmMounted) return;
    host.dataset.dmMounted = '1';
    renderDecisionMap(host, SAMPLE_CHAIN);
  });
}
