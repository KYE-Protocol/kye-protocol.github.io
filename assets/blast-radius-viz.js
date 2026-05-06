/**
 * KYE Protocol™ — Blast Radius Map™ visual viewer.
 *
 * Mounts on any element with [data-blast-radius]. Lets a CISO / risk
 * operator pick a "compromised" subject (credential, agent, capability,
 * delegation, principal) and see the downstream impact: affected
 * agents · payment authorities · capabilities · sessions · webhooks ·
 * required revocations.
 *
 * The visualisation is intentionally rule-based and conservative — it
 * exists to make the protocol's blast-radius semantics tangible for a
 * non-technical visitor, NOT to model the production runtime
 * computation. The production runtime mechanism is part of the patent
 * track and is not modelled here.
 */

const SUBJECTS = [
  {
    id:    'cred-001',
    label: 'Credential — agent signing key',
    type:  'credential',
    short: 'kye:credential:signing:agent_456_v2',
    impact: {
      agents:      ['shopping_agent_456', 'fx_router_001'],
      authorities: ['purchase_authority_001', 'fx_authority_004'],
      capabilities: ['payment_action.card_purchase', 'payment_action.fx_initiate'],
      sessions:    ['session_8c4a', 'session_9d12'],
      webhooks:    ['kye.authority.revoked', 'kye.entity.quarantined', 'kye.evidence_pack.generated'],
      revocations: ['Rotate signing key (Ed25519)', 'Revoke active sessions', 'Quarantine agent until re-attestation', 'Emit kye.entity.quarantined to all subscribers'],
    },
  },
  {
    id:    'agent-456',
    label: 'Agent — shopping_agent_456',
    type:  'agent',
    short: 'kye:entity:agent:shopping_agent_456',
    impact: {
      agents:      ['shopping_agent_456'],
      authorities: ['purchase_authority_001', 'merchant_browse_002'],
      capabilities: ['payment_action.card_purchase', 'data.read.merchant_catalog'],
      sessions:    ['session_8c4a'],
      webhooks:    ['kye.entity.quarantined', 'kye.purchase_authority.denied', 'kye.session.revoked'],
      revocations: ['Quarantine agent', 'Freeze card token at issuer', 'Block future agent purchases at merchant', 'Re-evaluate any in-flight authorise calls'],
    },
  },
  {
    id:    'cap-purchase',
    label: 'Capability — payment_action.card_purchase',
    type:  'capability',
    short: 'kye:capability:payment_action:card_purchase',
    impact: {
      agents:      ['shopping_agent_456', 'fx_router_001', 'concierge_agent_220'],
      authorities: ['purchase_authority_001', 'corp_purchasing_010'],
      capabilities: ['payment_action.card_purchase'],
      sessions:    ['session_8c4a', 'session_9d12', 'session_aa01'],
      webhooks:    ['kye.capability.quarantined', 'kye.purchase_authority.denied'],
      revocations: ['Quarantine the capability registry entry', 'Deny any new invocations', 'Notify dependent connectors (IPG, MPG, Checkout Guard™)'],
    },
  },
  {
    id:    'deleg-002',
    label: 'Delegation — TPP → agent (PSD3)',
    type:  'delegation',
    short: 'kye:delegation:tpp_to_agent_002',
    impact: {
      agents:      ['shopping_agent_456'],
      authorities: ['purchase_authority_001', 'sub_delegated_payment_005'],
      capabilities: ['payment_action.card_purchase', 'payment_action.sca_proof'],
      sessions:    ['session_8c4a'],
      webhooks:    ['kye.delegation.revoked', 'kye.authority.revoked', 'kye.purchase_authority.denied'],
      revocations: ['Revoke parent delegation', 'Cascade to all child grants', 'Notify ASPSP via signed webhook', 'Emit replayable evidence pack'],
    },
  },
  {
    id:    'princ-customer',
    label: 'Principal — customer_123',
    type:  'principal',
    short: 'kye:entity:person:customer_123',
    impact: {
      agents:      ['shopping_agent_456', 'concierge_agent_220'],
      authorities: ['purchase_authority_001', 'data_share_authority_003'],
      capabilities: ['payment_action.card_purchase', 'data.read.profile'],
      sessions:    ['session_8c4a', 'session_aa01'],
      webhooks:    ['kye.entity.suspended', 'kye.authority.revoked', 'kye.delegation.revoked'],
      revocations: ['Suspend principal', 'Revoke all delegations granted by this principal', 'Notify all dependent agents and connectors', 'Open audit-pipeline incident ticket'],
    },
  },
];

const TYPE_ICON = {
  credential: 'key',
  agent:      'smart_toy',
  capability: 'extension',
  delegation: 'share',
  principal:  'person',
};

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function shellHTML() {
  const opts = SUBJECTS.map(s =>
    `<option value="${s.id}">${escape(s.label)}</option>`
  ).join('');
  return `
    <div class="br-shell">
      <div class="br-controls" aria-label="Blast Radius Map™ inputs">
        <h3 class="br-h">Compromised subject</h3>
        <fieldset class="br-fs">
          <legend>Pick a subject</legend>
          <select data-br-input="subject">${opts}</select>
        </fieldset>
        <div class="br-subject-card" data-br-subject>
          <div class="br-subject-type" data-br-type></div>
          <div class="br-subject-ref"><code data-br-ref></code></div>
          <p class="br-subject-hint">Pick any subject above to see what KYE<span class="tm">&trade;</span> would mark for revocation, what events fan out, and which downstream systems must react.</p>
        </div>
      </div>
      <div class="br-outputs" aria-live="polite">
        <h3 class="br-h">Blast radius</h3>
        <div class="br-grid">
          <article class="br-card">
            <header><span class="ms">smart_toy</span><strong>Affected agents</strong></header>
            <ul data-br-agents></ul>
          </article>
          <article class="br-card">
            <header><span class="ms">verified_user</span><strong>Affected authorities</strong></header>
            <ul data-br-authorities></ul>
          </article>
          <article class="br-card">
            <header><span class="ms">extension</span><strong>Affected capabilities</strong></header>
            <ul data-br-capabilities></ul>
          </article>
          <article class="br-card">
            <header><span class="ms">cookie</span><strong>Affected sessions</strong></header>
            <ul data-br-sessions></ul>
          </article>
          <article class="br-card">
            <header><span class="ms">send</span><strong>Webhooks fanned out</strong></header>
            <ul data-br-webhooks></ul>
          </article>
          <article class="br-card br-revocations">
            <header><span class="ms">cancel</span><strong>Required revocations</strong></header>
            <ol data-br-revocations></ol>
          </article>
        </div>
      </div>
    </div>
  `;
}

function listFill(host, sel, items, prefix = '') {
  const el = host.querySelector(sel);
  if (!el) return;
  el.innerHTML = items.map(i => `<li><code>${escape(prefix + i)}</code></li>`).join('');
}

function recompute(host) {
  const id = host.querySelector('[data-br-input="subject"]').value;
  const subject = SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
  host.querySelector('[data-br-type]').textContent = subject.type;
  host.querySelector('[data-br-ref]').textContent  = subject.short;
  host.querySelector('[data-br-subject]').dataset.type = subject.type;
  // Fill output cards
  listFill(host, '[data-br-agents]',       subject.impact.agents,       'kye:entity:agent:');
  listFill(host, '[data-br-authorities]',  subject.impact.authorities,  'kye:authority:grant:');
  listFill(host, '[data-br-capabilities]', subject.impact.capabilities, 'kye:capability:');
  listFill(host, '[data-br-sessions]',     subject.impact.sessions,     'kye:session:');
  listFill(host, '[data-br-webhooks]',     subject.impact.webhooks);
  // Required revocations as plain ordered list
  const ol = host.querySelector('[data-br-revocations]');
  ol.innerHTML = subject.impact.revocations.map(r => `<li>${escape(r)}</li>`).join('');
}

export function initBlastRadius() {
  const hosts = document.querySelectorAll('[data-blast-radius]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.brMounted) return;
    host.dataset.brMounted = '1';
    host.classList.add('br-host');
    host.innerHTML = shellHTML();
    host.addEventListener('change', () => recompute(host));
    recompute(host);
  });
}
