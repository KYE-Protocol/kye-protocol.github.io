/**
 * KYE Protocol™ — Connector Hub™ explorer.
 *
 * Mounts on any element with [data-connector-explorer]. Renders a
 * searchable, filterable directory of the connectors that ship with
 * the Connector Hub™ reference set, plus a clear "publish your own"
 * affordance. Each entry is a kye.connector_manifest.v1 row showing:
 *
 *   name · connector_type · category · status · side_effect_level
 *   risk_level · auth · short description · "view manifest" link
 *
 * The connector list below is the public-reference set (samples +
 * planned managed connectors). Production registry data will be
 * surfaced via the live API on KYE Cloud Gateway™ once the registry opens.
 */

const CATEGORIES = {
  payments:        { label: 'Payments & commerce',     icon: 'payments' },
  agent_runtime:   { label: 'AI & agent runtime',      icon: 'smart_toy' },
  identity:        { label: 'Identity & access',       icon: 'key' },
  policy:          { label: 'Policy & governance',     icon: 'policy' },
  security:        { label: 'Security & observability', icon: 'manage_search' },
  verification:    { label: 'Verification',            icon: 'badge' },
};

const SIDE_EFFECT_BADGES = {
  read_only:             'is-low',
  audit_only:            'is-low',
  decision_only:         'is-low',
  write_internal:        'is-med',
  send_external_message: 'is-med',
  execute_transaction:   'is-high',
  move_money:            'is-high',
  modify_authority:      'is-high',
  admin_action:          'is-high',
  destructive:           'is-high',
};

const STATUS_BADGES = {
  draft:       'is-draft',
  submitted:   'is-draft',
  validating:  'is-draft',
  active:      'is-active',
  deprecated:  'is-warn',
  quarantined: 'is-warn',
  revoked:     'is-deny',
  archived:    'is-warn',
};

// Reference connector set. Real production registry data will be
// served from the live API once KYE Cloud Gateway™ opens; this list is the
// public reference shape and demonstrates the manifest dictionary.
const CONNECTORS = [
  // Payments & commerce
  { name: 'IPG — generic',         type: 'internet_payment_gateway', cat: 'payments',      status: 'active',  side: 'move_money',          tier: 'reference', desc: 'Reference Internet Payment Gateway connector. Adds KYE™ authority pre-checks.' },
  { name: 'MPG — generic',         type: 'mobile_payment_gateway',   cat: 'payments',      status: 'active',  side: 'move_money',          tier: 'reference', desc: 'Reference Mobile Payment Gateway connector for in-app + wallet flows.' },
  { name: 'Checkout Guard™',       type: 'checkout',                 cat: 'payments',      status: 'active',  side: 'execute_transaction', tier: 'flagship',  desc: 'Detect agent-backed checkout flows; verify the agent is allowed to buy.' },
  { name: 'Shopping cart',         type: 'shopping_cart',            cat: 'payments',      status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Generic cart connector — bind basket hash to authority decision.' },
  { name: 'Card token',            type: 'card_token',               cat: 'payments',      status: 'active',  side: 'modify_authority',    tier: 'reference', desc: 'Card-token state binding — bound / unbound / frozen.' },
  { name: 'Wallet',                type: 'wallet',                   cat: 'payments',      status: 'active',  side: 'move_money',          tier: 'reference', desc: 'Wallet-provider connector for delegated authority + balance state.' },
  { name: 'Open banking (PSD3)',   type: 'open_banking',             cat: 'payments',      status: 'active',  side: 'move_money',          tier: 'flagship',  desc: 'PISP/TPP connector — delegated payment-initiation authority.' },
  { name: 'Merchant risk',         type: 'merchant_risk',            cat: 'payments',      status: 'submitted', side: 'decision_only',     tier: 'partner',   desc: 'Per-merchant risk-score binding feeds the policy engine.' },
  { name: 'Chargeback',            type: 'chargeback',               cat: 'payments',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Dispute / chargeback connector — bind dispute to evidence pack.' },
  // AI & agent runtime
  { name: 'KYE MCP Server™',       type: 'mcp_server',               cat: 'agent_runtime', status: 'active',  side: 'decision_only',       tier: 'flagship',  desc: 'Read-only / decision / gated-admin tools + URI resources + prompts.' },
  { name: 'Agent runtime',         type: 'agent_runtime',            cat: 'agent_runtime', status: 'active',  side: 'modify_authority',    tier: 'reference', desc: 'Generic agent-runtime connector — capability binding + state.' },
  { name: 'Tool gateway',          type: 'tool_gateway',             cat: 'agent_runtime', status: 'active',  side: 'decision_only',       tier: 'reference', desc: 'Tool-invocation gateway — pre-invocation authority check.' },
  { name: 'Capability registry',   type: 'capability_registry',      cat: 'agent_runtime', status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Capability-manifest registry sync.' },
  { name: 'Model registry',        type: 'model_registry',           cat: 'agent_runtime', status: 'submitted', side: 'audit_only',        tier: 'partner',   desc: 'Model-card registry binding — model identity + version.' },
  { name: 'Prompt registry',       type: 'prompt_registry',          cat: 'agent_runtime', status: 'draft',   side: 'audit_only',          tier: 'reference', desc: 'Prompt-template registry — bind prompt id to decision.' },
  { name: 'Workflow',              type: 'workflow',                 cat: 'agent_runtime', status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Multi-step workflow connector — chain decisions across steps.' },
  // Identity & access
  { name: 'OAuth / OIDC',          type: 'oauth_oidc',               cat: 'identity',      status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'OAuth/OIDC bridge — wrap KYE™ around your existing IdP.' },
  { name: 'SAML',                  type: 'saml',                     cat: 'identity',      status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'SAML SSO bridge for enterprise SaaS.' },
  { name: 'SCIM',                  type: 'scim',                     cat: 'identity',      status: 'active',  side: 'modify_authority',    tier: 'reference', desc: 'SCIM provisioning — entity creation + lifecycle binding.' },
  { name: 'SPIFFE / SPIRE',        type: 'spiffe_spire',             cat: 'identity',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Workload identity bridge — SPIFFE ID to KYE entity URN.' },
  { name: 'IAM (generic)',         type: 'iam',                      cat: 'identity',      status: 'active',  side: 'modify_authority',    tier: 'reference', desc: 'Generic IAM connector for AWS / Azure / GCP.' },
  { name: 'PAM',                   type: 'pam',                      cat: 'identity',      status: 'submitted', side: 'modify_authority',  tier: 'partner',   desc: 'Privileged-access manager — break-glass authority binding.' },
  { name: 'Passkey',               type: 'passkey',                  cat: 'identity',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'WebAuthn / passkey credential connector.' },
  { name: 'Credential issuer',     type: 'credential_issuer',        cat: 'identity',      status: 'active',  side: 'modify_authority',    tier: 'reference', desc: 'OpenID4VCI / VC issuer connector for verifiable credentials.' },
  // Policy & governance
  { name: 'OPA',                   type: 'opa',                      cat: 'policy',        status: 'active',  side: 'decision_only',       tier: 'reference', desc: 'Open Policy Agent — pre-baked Rego bundles for KYE™ decisions.' },
  { name: 'Cerbos',                type: 'cerbos',                   cat: 'policy',        status: 'active',  side: 'decision_only',       tier: 'reference', desc: 'Cerbos policy bundles for KYE™ decisions.' },
  { name: 'AWS Cedar',             type: 'aws_cedar',                cat: 'policy',        status: 'active',  side: 'decision_only',       tier: 'reference', desc: 'Cedar policy bundles for KYE™ decisions.' },
  { name: 'GRC',                   type: 'grc',                      cat: 'policy',        status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Generic GRC platform connector — control-mapping projection.' },
  { name: 'Control mapping',       type: 'control_mapping',          cat: 'policy',        status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Per-framework control projection (SOC 2 / ISO / EU AI Act / …).' },
  { name: 'Certification',         type: 'certification',            cat: 'policy',        status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Certification-registry sync for KYE Conformant™ / Certified™.' },
  { name: 'Self-audit',            type: 'self_audit',               cat: 'policy',        status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Continuous self-audit attestation export.' },
  // Security & observability
  { name: 'SIEM (generic)',        type: 'siem',                     cat: 'security',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Generic SIEM connector — audit-event stream.' },
  { name: 'SOAR',                  type: 'soar',                     cat: 'security',      status: 'submitted', side: 'admin_action',      tier: 'partner',   desc: 'Security-orchestration playbook trigger from KYE™ signals.' },
  { name: 'Splunk',                type: 'splunk',                   cat: 'security',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Splunk HEC connector — KYE™ events and audit chain.' },
  { name: 'Microsoft Sentinel',    type: 'sentinel',                 cat: 'security',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Sentinel ingestion — events and audit chain.' },
  { name: 'Datadog',               type: 'datadog',                  cat: 'security',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'Datadog logs + metrics for KYE™ runtime.' },
  { name: 'CloudWatch',            type: 'cloudwatch',               cat: 'security',      status: 'active',  side: 'audit_only',          tier: 'reference', desc: 'AWS CloudWatch logs + metrics.' },
  { name: 'Kafka',                 type: 'kafka',                    cat: 'security',      status: 'active',  side: 'send_external_message', tier: 'reference', desc: 'Kafka transport for the KYE Signal Bus™.' },
  { name: 'EventBridge',           type: 'eventbridge',              cat: 'security',      status: 'active',  side: 'send_external_message', tier: 'reference', desc: 'AWS EventBridge transport.' },
  { name: 'Webhook (generic)',     type: 'webhook',                  cat: 'security',      status: 'active',  side: 'send_external_message', tier: 'reference', desc: 'Generic outbound signed-webhook connector.' },
  // Verification
  { name: 'KYC provider',          type: 'kyc_provider',             cat: 'verification',  status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Generic KYC provider connector — bind verification to entity URN.' },
  { name: 'KYB provider',          type: 'kyb_provider',             cat: 'verification',  status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Generic KYB provider connector — entity + beneficial-ownership.' },
  { name: 'KYA provider',          type: 'kya_provider',             cat: 'verification',  status: 'active',  side: 'write_internal',      tier: 'reference', desc: 'Generic KYA provider connector — agent attestation.' },
  { name: 'Agent passport',        type: 'agent_passport',           cat: 'verification',  status: 'submitted', side: 'audit_only',        tier: 'partner',   desc: 'Cross-organisation agent passport binding.' },
  { name: 'Credential verification', type: 'credential_verification', cat: 'verification', status: 'active',  side: 'decision_only',       tier: 'reference', desc: 'Verifiable-credential check connector.' },
];

const TIER_LABEL = {
  flagship:  'Flagship',
  reference: 'Reference',
  partner:   'Partner',
};

function escape(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function controlsHTML() {
  const cats = Object.entries(CATEGORIES).map(([k, v]) =>
    `<button class="ce-cat" data-cat="${k}" type="button">
       <span class="ms" aria-hidden="true">${v.icon}</span> ${v.label}
     </button>`
  ).join('');
  return `
    <div class="ce-controls">
      <label class="ce-search">
        <span class="ms" aria-hidden="true">search</span>
        <input type="search" placeholder="Search connectors by name, type, or description…"
               data-ce-q autocomplete="off" />
        <span class="ce-count" data-ce-count></span>
      </label>
      <div class="ce-cats" role="group" aria-label="Filter by category">
        <button class="ce-cat is-on" data-cat="all" type="button">
          <span class="ms" aria-hidden="true">apps</span> All
        </button>
        ${cats}
      </div>
    </div>
  `;
}

function connectorRowHTML(c) {
  const sideBadge   = SIDE_EFFECT_BADGES[c.side]   || '';
  const statusBadge = STATUS_BADGES[c.status]      || '';
  return `
    <li class="ce-row" data-cat="${c.cat}" data-tier="${c.tier}"
        data-search="${escape((c.name + ' ' + c.type + ' ' + c.desc).toLowerCase())}">
      <div class="ce-row-head">
        <strong class="ce-name">${escape(c.name)}</strong>
        <span class="ce-tier ce-tier-${c.tier}">${TIER_LABEL[c.tier]}</span>
      </div>
      <div class="ce-row-meta">
        <code class="ce-type">${escape(c.type)}</code>
        <span class="ce-status ${statusBadge}">${escape(c.status)}</span>
        <span class="ce-side ${sideBadge}" title="side_effect_level">${escape(c.side)}</span>
      </div>
      <p class="ce-desc">${escape(c.desc)}</p>
    </li>
  `;
}

function shellHTML() {
  const rows = CONNECTORS.map(connectorRowHTML).join('');
  return `
    ${controlsHTML()}
    <ol class="ce-list" data-ce-list>${rows}</ol>
    <div class="ce-empty" data-ce-empty hidden>
      No connectors match your filter. Clear the search or pick another category.
    </div>
  `;
}

function applyFilter(host) {
  const q = (host.querySelector('[data-ce-q]').value || '').toLowerCase().trim();
  const activeCat = host.querySelector('.ce-cat.is-on')?.dataset.cat || 'all';
  let visible = 0;
  for (const row of host.querySelectorAll('.ce-row')) {
    const matchesCat = activeCat === 'all' || row.dataset.cat === activeCat;
    const matchesQ   = !q || row.dataset.search.includes(q);
    const show = matchesCat && matchesQ;
    row.hidden = !show;
    if (show) visible += 1;
  }
  const count = host.querySelector('[data-ce-count]');
  if (count) count.textContent = `${visible} of ${CONNECTORS.length}`;
  const empty = host.querySelector('[data-ce-empty]');
  if (empty) empty.hidden = visible !== 0;
}

export function initConnectorExplorer() {
  const hosts = document.querySelectorAll('[data-connector-explorer]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.ceMounted) return;
    host.dataset.ceMounted = '1';
    host.classList.add('ce-host');
    host.innerHTML = shellHTML();
    applyFilter(host);
    host.addEventListener('input', e => {
      if (e.target.matches('[data-ce-q]')) applyFilter(host);
    });
    host.addEventListener('click', e => {
      const cat = e.target.closest('.ce-cat');
      if (!cat) return;
      host.querySelectorAll('.ce-cat').forEach(c => c.classList.remove('is-on'));
      cat.classList.add('is-on');
      applyFilter(host);
    });
  });
}
