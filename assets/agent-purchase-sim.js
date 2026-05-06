/**
 * KYE Protocol™ — agent-backed purchasing simulator.
 *
 * Mounts on any element with [data-agent-sim]. Renders a controls pane
 * (agent state, customer authority, merchant category, basket amount,
 * approval threshold, card-token state, risk state) on the left, and
 * four live outputs on the right:
 *
 *   1. The KYE™ runtime decision (allow / allow_with_constraints /
 *      require_approval / require_step_up / quarantine / deny) plus the
 *      reason code and a list of obligations.
 *   2. The Decision Map™ — visual authority chain that produced the
 *      decision (principal → delegation → actor → capability → scope →
 *      state → policy → decision), bound to audit + evidence refs.
 *   3. The first signed webhook event KYE™ would emit for this decision.
 *   4. An evidence-pack preview (signature + audit_ref + chain refs).
 *
 * The decision logic is intentionally rule-based and conservative — it
 * exists to make the protocol's runtime semantics tangible to a non-
 * technical visitor, NOT to mirror the production runtime gateway. The
 * production runtime's internal mechanism is part of the patent track
 * and is not modelled here.
 */

import { renderDecisionMap } from './decision-map-viz.js?v=1778960000';

const MERCHANT_RISK = {
  groceries:        { label: 'Groceries / supermarket',  risk: 'low'  },
  electronics:      { label: 'Electronics retailer',     risk: 'low'  },
  travel:           { label: 'Travel / airline',         risk: 'med'  },
  digital_goods:    { label: 'Digital goods / SaaS',     risk: 'med'  },
  gambling:         { label: 'Gambling / betting',       risk: 'high' },
  crypto:           { label: 'Crypto exchange',          risk: 'high' },
  unknown_merchant: { label: 'Unknown merchant',         risk: 'high' },
};

const STATE_OPTIONS = {
  agent: [
    { v: 'active',      label: 'active' },
    { v: 'quarantined', label: 'quarantined' },
    { v: 'revoked',     label: 'revoked' },
  ],
  authority: [
    { v: 'active',  label: 'active' },
    { v: 'expired', label: 'expired' },
    { v: 'revoked', label: 'revoked' },
  ],
  card: [
    { v: 'bound',   label: 'bound' },
    { v: 'frozen',  label: 'frozen' },
    { v: 'unbound', label: 'unbound' },
  ],
  risk: [
    { v: 'normal',    label: 'normal' },
    { v: 'elevated',  label: 'elevated (step-up)' },
    { v: 'anomalous', label: 'anomalous (incident)' },
  ],
};

const DECISION_BADGE = {
  allow:                  { cls: 'is-allow',   label: 'allow' },
  allow_with_constraints: { cls: 'is-allow',   label: 'allow_with_constraints' },
  require_approval:       { cls: 'is-approve', label: 'require_approval' },
  require_step_up:        { cls: 'is-approve', label: 'require_step_up' },
  quarantine:             { cls: 'is-deny',    label: 'quarantine' },
  deny:                   { cls: 'is-deny',    label: 'deny' },
};

function decide(s) {
  // Hardest blocks first — anything in a stop state is a deny.
  if (s.agent === 'revoked')          return reason('deny',       'actor_revoked');
  if (s.authority === 'revoked')      return reason('deny',       'authority_revoked');
  if (s.authority === 'expired')      return reason('deny',       'authority_expired');
  if (s.card === 'unbound')           return reason('deny',       'instrument_unbound');
  if (s.card === 'frozen')            return reason('deny',       'instrument_frozen');
  if (s.agent === 'quarantined')      return reason('quarantine', 'actor_quarantined');
  if (s.risk === 'anomalous')         return reason('quarantine', 'risk_threshold_exceeded');

  const merchant = MERCHANT_RISK[s.merchant] || { risk: 'med' };

  // High-risk merchant always needs human approval at minimum.
  if (merchant.risk === 'high')       return reason('require_approval', 'merchant_high_risk');

  // Risk-elevated session always needs step-up at minimum.
  if (s.risk === 'elevated')          return reason('require_step_up', 'risk_elevated');

  // Amount above the customer-set approval threshold needs approval.
  if (s.amount > s.threshold)         return reason('require_approval', 'amount_above_threshold');

  // Medium-risk merchant + non-trivial amount → constraints.
  if (merchant.risk === 'med' && s.amount > 50) {
    return reason('allow_with_constraints', 'scope_within_attenuated_authority',
                  ['audit.emit', 'merchant_category_pinned', 'basket_hash_binding']);
  }

  // Otherwise allow with the standard constraint bundle.
  return reason('allow_with_constraints', 'scope_within_attenuated_authority',
                ['audit.emit', 'basket_hash_binding']);
}

function reason(decision, code, obligations = ['audit.emit']) {
  return { decision, reason: code, obligations };
}

function shortId(prefix) {
  // Stable-looking but session-local id.
  const rand = Math.random().toString(36).slice(2, 10).toUpperCase();
  return `${prefix}:01HX${rand}${'0'.repeat(Math.max(0, 18 - rand.length))}`;
}

function eventForDecision(state, result) {
  // Pick the first signal a real publisher would emit for each decision.
  const map = {
    allow:                  'kye.purchase_authority.allowed',
    allow_with_constraints: 'kye.purchase_authority.allowed',
    require_approval:       'kye.purchase_authority.requires_approval',
    require_step_up:        'kye.decision.requires_step_up',
    quarantine:             'kye.entity.quarantined',
    deny:                   'kye.purchase_authority.denied',
  };
  const eventType = map[result.decision] || 'kye.decision.created';
  const eventId   = shortId('kye:event');
  const decId     = shortId('kye:dec');
  return {
    schema_version:  'kye.webhook.v1',
    event_id:        eventId,
    event_type:      eventType,
    event_version:   '1.0',
    occurred_at:     new Date().toISOString(),
    correlation_id:  shortId('kye:corr'),
    actor_entity_id:     'kye:entity:agent:shopping_agent_456',
    principal_entity_id: 'kye:entity:person:customer_123',
    subject_ref:     'kye:authority:grant:purchase_001',
    reason_code:     result.reason,
    data: {
      merchant_category: state.merchant,
      amount:            state.amount,
      currency:          'GBP',
      decision:          result.decision,
    },
    audit_ref:     shortId('kye:audit'),
    evidence_refs: [shortId('kye:evidence-pack')],
    delivery:  { idempotency_key: eventId, replayable: true },
    signature: { algorithm: 'ed25519',
                 key_id:    'kye:key:webhook_signing_001',
                 signature: '...' },
  };
}

function evidenceForDecision(state, result, evt) {
  return {
    pack_id:     evt.evidence_refs[0],
    pack_version: 'kye.evidence_pack.v1',
    bound_decision: { id: shortId('kye:dec'),
                      type: 'agent_purchase',
                      decision: result.decision,
                      reason_code: result.reason },
    chain: [
      { rel: 'principal',   ref: 'kye:entity:person:customer_123' },
      { rel: 'delegation',  ref: 'kye:delegation:tpp_to_agent_002' },
      { rel: 'actor',       ref: 'kye:entity:agent:shopping_agent_456' },
      { rel: 'capability',  ref: 'kye:capability:payment_action:card_purchase' },
      { rel: 'scope',       ref: 'kye:scope:eu_eea_corridor_below_500_gbp' },
      { rel: 'instrument',  ref: 'kye:card_token:tok_abc...' },
    ],
    obligations: result.obligations,
    audit_ref:   evt.audit_ref,
    signature:   { algorithm: 'ed25519',
                   key_id: 'kye:key:evidence_signing_001',
                   signature: '...' },
  };
}

function controlsHTML() {
  const opt = (arr, sel) => arr.map(o =>
    `<option value="${o.v}"${o.v === sel ? ' selected' : ''}>${o.label}</option>`
  ).join('');
  const merch = Object.entries(MERCHANT_RISK).map(([k, v]) =>
    `<option value="${k}">${v.label}</option>`
  ).join('');
  return `
    <fieldset class="aps-fs">
      <legend>Agent state</legend>
      <select data-aps-input="agent">${opt(STATE_OPTIONS.agent, 'active')}</select>
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Customer authority</legend>
      <select data-aps-input="authority">${opt(STATE_OPTIONS.authority, 'active')}</select>
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Merchant</legend>
      <select data-aps-input="merchant">${merch}</select>
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Card / token state</legend>
      <select data-aps-input="card">${opt(STATE_OPTIONS.card, 'bound')}</select>
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Risk state</legend>
      <select data-aps-input="risk">${opt(STATE_OPTIONS.risk, 'normal')}</select>
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Basket amount (£) <span class="aps-num" data-aps-num="amount">99</span></legend>
      <input type="range" data-aps-input="amount" min="1" max="2000" step="1" value="99" />
    </fieldset>
    <fieldset class="aps-fs">
      <legend>Customer approval threshold (£) <span class="aps-num" data-aps-num="threshold">500</span></legend>
      <input type="range" data-aps-input="threshold" min="50" max="2000" step="50" value="500" />
    </fieldset>
  `;
}

function shellHTML() {
  return `
    <div class="aps-shell">
      <div class="aps-controls" aria-label="Simulator inputs">
        <h3 class="aps-h">Inputs</h3>
        ${controlsHTML()}
      </div>
      <div class="aps-outputs" aria-live="polite">
        <div class="aps-decision-card">
          <h3 class="aps-h">Runtime decision</h3>
          <div class="aps-decision-badge" data-aps-badge>&hellip;</div>
          <div class="aps-decision-meta">
            <div><span class="aps-meta-k">reason_code</span><code data-aps-reason>&hellip;</code></div>
            <div><span class="aps-meta-k">obligations</span><code data-aps-obligations>&hellip;</code></div>
          </div>
        </div>
        <details class="aps-output-block" open>
          <summary><span class="ms">account_tree</span> Decision Map<span class="tm">&trade;</span> &mdash; the chain that produced this decision</summary>
          <div class="aps-output-body" data-aps-decision-map></div>
        </details>
        <details class="aps-output-block">
          <summary><span class="ms">send</span> Webhook event KYE<span class="tm">&trade;</span> would emit</summary>
          <pre class="codeblock"><code data-aps-event></code></pre>
        </details>
        <details class="aps-output-block">
          <summary><span class="ms">verified</span> Evidence pack preview</summary>
          <pre class="codeblock"><code data-aps-evidence></code></pre>
        </details>
      </div>
    </div>
  `;
}

function readState(host) {
  const get = sel => host.querySelector(`[data-aps-input="${sel}"]`);
  return {
    agent:     get('agent').value,
    authority: get('authority').value,
    merchant:  get('merchant').value,
    card:      get('card').value,
    risk:      get('risk').value,
    amount:    parseInt(get('amount').value, 10),
    threshold: parseInt(get('threshold').value, 10),
  };
}

function decisionMapFor(state, result, event, evid) {
  // Project the simulator state into a Decision Map™ data shape that
  // the visual viewer can render. Order = principal → delegation →
  // actor → capability → scope → state → policy → decision.
  return {
    decision: result.decision,
    reason:   result.reason,
    nodes: [
      { type: 'principal',  ref: 'kye:entity:person:customer_123',
        short: 'customer_123' },
      { type: 'delegation', ref: 'kye:delegation:tpp_to_agent_002',
        short: 'tpp_to_agent_002' },
      { type: 'actor',      ref: 'kye:entity:agent:shopping_agent_456',
        short: `shopping_agent (${state.agent})` },
      { type: 'capability', ref: 'kye:capability:payment_action:card_purchase',
        short: 'card_purchase' },
      { type: 'scope',      ref: `kye:scope:cap_${state.threshold}_gbp`,
        short: `≤ £${state.threshold} cap` },
      { type: 'state',      ref: `kye:state:authority_${state.authority}`,
        short: `authority: ${state.authority}` },
      { type: 'policy',     ref: 'kye:policy:agent_purchase_v1',
        short: `merchant: ${state.merchant} · risk: ${state.risk}` },
    ],
    audit_ref:     evid.audit_ref,
    evidence_refs: [evid.pack_id],
  };
}

function recompute(host) {
  const state  = readState(host);
  const result = decide(state);
  const event  = eventForDecision(state, result);
  const evid   = evidenceForDecision(state, result, event);

  const badge = host.querySelector('[data-aps-badge]');
  const cfg = DECISION_BADGE[result.decision];
  badge.className = `aps-decision-badge ${cfg.cls}`;
  badge.textContent = cfg.label;

  host.querySelector('[data-aps-reason]').textContent = result.reason;
  host.querySelector('[data-aps-obligations]').textContent =
    result.obligations.join(', ');

  // Visual Decision Map™ — re-render on every recompute so the chain
  // reflects the current input state live.
  const dmHost = host.querySelector('[data-aps-decision-map]');
  if (dmHost) renderDecisionMap(dmHost, decisionMapFor(state, result, event, evid));

  host.querySelector('[data-aps-event]').textContent =
    JSON.stringify(event, null, 2);
  host.querySelector('[data-aps-evidence]').textContent =
    JSON.stringify(evid, null, 2);

  // Reflect numeric inputs.
  host.querySelector('[data-aps-num="amount"]').textContent    = state.amount;
  host.querySelector('[data-aps-num="threshold"]').textContent = state.threshold;
}

export function initAgentPurchaseSim() {
  const hosts = document.querySelectorAll('[data-agent-sim]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.apsMounted) return;
    host.dataset.apsMounted = '1';
    host.classList.add('aps-host');
    host.innerHTML = shellHTML();
    host.addEventListener('input', () => recompute(host));
    host.addEventListener('change', () => recompute(host));
    recompute(host);
  });
}
