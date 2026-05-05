/* KYE Protocol™ vs the existing protocol stack.
 * Y = full support, P = partial / extension exists, N = not in scope.
 */
export const COMPARISON_DIMENSIONS = [
  { key: "entity_id",    label: "Cross-system entity URN" },
  { key: "delegation",   label: "First-class delegation chain" },
  { key: "scope",        label: "Attenuable scope (parent ⊇ child enforced)" },
  { key: "ai_native",    label: "AI agent / model / tool / workflow types" },
  { key: "decision",     label: "Standard decision codes (allow / deny / approval / …)" },
  { key: "stop_signal",  label: "Reactive stop / quarantine / revoke signals" },
  { key: "audit_chain",  label: "Append-only hash-linked audit chain" },
  { key: "proof_bundle", label: "Signed proof bundle export" },
  { key: "transparency", label: "Transparency log + receipts" },
  { key: "federation",   label: "Cross-trust-domain entity portability" },
  { key: "sectoral",     label: "Sectoral overlays (payments, custody, healthcare, …)" },
  { key: "conformance",  label: "Open conformance fixture pack" },
];

export const COMPARISON_PRODUCTS = [
  {
    name: "KYE Protocol™", ver: "v1.0", isKye: true,
    cells: { entity_id:"Y", delegation:"Y", scope:"Y", ai_native:"Y", decision:"Y", stop_signal:"Y", audit_chain:"Y", proof_bundle:"Y", transparency:"Y", federation:"Y", sectoral:"Y", conformance:"Y" },
  },
  {
    name: "Anthropic MCP", ver: "1.x", isKye: false,
    cells: { entity_id:"N", delegation:"N", scope:"P", ai_native:"P", decision:"N", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"N", conformance:"P" },
  },
  {
    name: "Google A2A", ver: "draft", isKye: false,
    cells: { entity_id:"P", delegation:"N", scope:"P", ai_native:"Y", decision:"N", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"P", sectoral:"N", conformance:"N" },
  },
  {
    name: "Google ADK", ver: "1.x", isKye: false,
    cells: { entity_id:"N", delegation:"N", scope:"N", ai_native:"Y", decision:"N", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"N", conformance:"N" },
  },
  {
    name: "OAuth 2.1 / GNAP", ver: "—", isKye: false,
    cells: { entity_id:"N", delegation:"P", scope:"Y", ai_native:"N", decision:"P", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"P", sectoral:"N", conformance:"P" },
  },
  {
    name: "OpenID AuthZEN", ver: "draft", isKye: false,
    cells: { entity_id:"N", delegation:"N", scope:"P", ai_native:"N", decision:"Y", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"N", conformance:"P" },
  },
  {
    name: "SPIFFE / SPIRE", ver: "1.x", isKye: false,
    cells: { entity_id:"P", delegation:"N", scope:"N", ai_native:"P", decision:"N", stop_signal:"P", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"P", sectoral:"N", conformance:"P" },
  },
  {
    name: "OpenSSF SCITT", ver: "draft", isKye: false,
    cells: { entity_id:"N", delegation:"N", scope:"N", ai_native:"N", decision:"N", stop_signal:"N", audit_chain:"P", proof_bundle:"P", transparency:"Y", federation:"N", sectoral:"N", conformance:"N" },
  },
  {
    name: "OpenID SSF / CAEP", ver: "1.x", isKye: false,
    cells: { entity_id:"N", delegation:"N", scope:"N", ai_native:"N", decision:"N", stop_signal:"P", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"P", sectoral:"N", conformance:"P" },
  },
  {
    name: "Visa Trusted Agent", ver: "2026", isKye: false,
    cells: { entity_id:"P", delegation:"P", scope:"P", ai_native:"Y", decision:"P", stop_signal:"N", audit_chain:"P", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"P", conformance:"N" },
  },
  {
    name: "Skyfire KYA", ver: "2026", isKye: false,
    cells: { entity_id:"P", delegation:"N", scope:"P", ai_native:"Y", decision:"P", stop_signal:"N", audit_chain:"P", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"P", conformance:"N" },
  },
  {
    name: "Persona / Sumsub KYA", ver: "2026", isKye: false,
    cells: { entity_id:"P", delegation:"N", scope:"N", ai_native:"Y", decision:"N", stop_signal:"N", audit_chain:"P", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"P", conformance:"N" },
  },
  {
    name: "Trulioo / PayOS DAP", ver: "2026", isKye: false,
    cells: { entity_id:"P", delegation:"N", scope:"N", ai_native:"Y", decision:"N", stop_signal:"N", audit_chain:"N", proof_bundle:"N", transparency:"N", federation:"N", sectoral:"P", conformance:"N" },
  },
];
