/**
 * KYE Protocol™ — "Choose your role" landing-page router.
 *
 * Mounts on any element with [data-role-router]. Renders nine role
 * cards: Bank / Payments, CISO, AI Agent Builder, Open Banking
 * Architect, Independent Consultant, Audit Firm, Regulator, Partner /
 * Integrator, Developer. Each card carries an icon, a role-specific
 * one-liner ("you want X"), and 2-3 jump-link CTAs to the most
 * relevant pages on the site.
 *
 * The widget exists so a visitor can self-route in five seconds
 * instead of scanning the nav for the audience they fit. It addresses
 * the expert review point: "KYE supports different users differently.
 * Builders integrate the API. Banks verify delegated payment authority.
 * CISOs map blast radius. Auditors inspect evidence packs. Partners
 * build certified integrations."
 */

const ROLES = [
  {
    id:    'bank',
    icon:  'account_balance',
    label: 'Bank / Payments',
    you:   'You want to verify delegated payment authority before the rail processes the transaction.',
    ctas: [
      { href: 'agent-purchasing.html#simulator', label: 'Try the agent-purchase simulator' },
      { href: 'open-banking.html',                label: 'Open-banking flow' },
      { href: 'usecases.html#financial',          label: 'Banking use cases' },
    ],
  },
  {
    id:    'ciso',
    icon:  'shield',
    label: 'CISO / Risk',
    you:   'You want to see every agent, credential, capability, and the blast radius of any compromise.',
    ctas: [
      { href: 'buyers.html',    label: 'Buyer ROI' },
      { href: 'risk.html',      label: 'Threat model' },
      { href: 'protocol.html',  label: 'Authority Graph™' },
    ],
  },
  {
    id:    'agent-builder',
    icon:  'smart_toy',
    label: 'AI Agent Builder',
    you:   'You want a runtime authority API your agents call before acting on behalf of a customer or business.',
    ctas: [
      { href: 'build.html',     label: 'Build with KYE' },
      { href: 'mcp.html',       label: 'KYE MCP Server™' },
      { href: 'developers.html', label: 'Developer quickstart' },
    ],
  },
  {
    id:    'ob-architect',
    icon:  'payments',
    label: 'Open Banking Architect',
    you:   'You want delegated payment-initiation authority bound to PSD3 SCA, attenuated through the chain.',
    ctas: [
      { href: 'open-banking.html',          label: 'Open-banking page' },
      { href: 'protocol.html#signals',      label: 'Signals & webhooks' },
      { href: 'frameworks.html',            label: 'PSD3 / DORA mapping' },
    ],
  },
  {
    id:    'consultant',
    icon:  'work',
    label: 'Independent Consultant',
    you:   'You want a delivery toolkit and a partner programme so you can run KYE™ pilots for clients.',
    ctas: [
      { href: 'partners.html',  label: 'Partner programme' },
      { href: 'training.html',  label: 'Train-the-trainer' },
      { href: 'engage.html#enterprises', label: 'Pilot scoping' },
    ],
  },
  {
    id:    'auditor',
    icon:  'verified_user',
    label: 'Audit Firm',
    you:   'You want signed evidence packs you can verify offline with public keys and project to your control set.',
    ctas: [
      { href: 'auditors.html',          label: 'Auditor view' },
      { href: 'oscal.html',             label: 'OSCAL projection' },
      { href: 'certification.html#audit', label: 'Audit-firm onboarding' },
    ],
  },
  {
    id:    'regulator',
    icon:  'gavel',
    label: 'Regulator',
    you:   'You want to know which obligations the protocol claims to evidence — and which it does not.',
    ctas: [
      { href: 'regulators.html', label: 'Regulator view' },
      { href: 'frameworks.html', label: 'Per-framework' },
      { href: 'risk.html',       label: 'Threat model + non-goals' },
    ],
  },
  {
    id:    'partner',
    icon:  'handshake',
    label: 'Partner / Integrator',
    you:   'You want a documented integration profile, a conformance fixture, and a public registry listing.',
    ctas: [
      { href: 'partners.html',     label: 'Partner programme' },
      { href: 'connectors.html',   label: 'Connector Hub™' },
      { href: 'certification.html', label: 'Certification ladder' },
    ],
  },
  {
    id:    'developer',
    icon:  'code',
    label: 'Developer',
    you:   'You want SDKs, schemas, the conformance pack, and a 10-minute path to a live decision call.',
    ctas: [
      { href: 'developers.html', label: 'Developer quickstart' },
      { href: 'build.html',      label: 'Build with KYE' },
      { href: 'mcp.html',        label: 'MCP server' },
    ],
  },
];

function shellHTML() {
  const cards = ROLES.map(r => {
    const ctas = r.ctas.map((c, i) =>
      `<a class="rr-cta${i === 0 ? ' is-primary' : ''}" href="${c.href}">${c.label}</a>`
    ).join('');
    return `
      <article class="rr-card" data-role="${r.id}">
        <header class="rr-head">
          <span class="ms rr-ico" aria-hidden="true">${r.icon}</span>
          <h3 class="rr-label">${r.label}</h3>
        </header>
        <p class="rr-you">${r.you}</p>
        <div class="rr-ctas">${ctas}</div>
      </article>
    `;
  }).join('');
  return `<div class="rr-grid">${cards}</div>`;
}

export function initRoleRouter() {
  const hosts = document.querySelectorAll('[data-role-router]');
  if (!hosts.length) return;
  hosts.forEach(host => {
    if (host.dataset.rrMounted) return;
    host.dataset.rrMounted = '1';
    host.classList.add('rr-host');
    host.innerHTML = shellHTML();
    // Card click (anywhere except the explicit CTAs) jumps to the
    // primary CTA. Lets the visitor click the whole card area.
    host.addEventListener('click', e => {
      const cta = e.target.closest('.rr-cta');
      if (cta) return; // explicit CTA click, browser handles it
      const card = e.target.closest('.rr-card');
      if (!card) return;
      const primary = card.querySelector('.rr-cta.is-primary');
      if (primary) window.location.href = primary.href;
    });
  });
}
