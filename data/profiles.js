/* KYE Protocol™ profile inventory. */
export const PROFILES = [
  {
    id: "kye-core-1.0", name: "Core",
    description: "The base contract. Entity registration, delegations, scopes, credentials, attestations, runtime authorize/evaluate/events, audit chain, signal bus.",
    endpoints: ["/v1/entities", "/v1/delegations", "/v1/runtime/authorize", "/v1/audit/events", "/v1/signals/publish"],
    terms: [
      { name: "ai_agent", desc: "Autonomous software actor" },
      { name: "delegation", desc: "Authority granted from delegator to actor for a subject" },
      { name: "allow_with_constraints", desc: "Allowed if obligations are honoured" },
    ],
  },
  {
    id: "kye-payments-1.0", name: "Payments",
    description: "Sectoral overlay for payment intents, payment authorities, beneficiaries, wallets, and a sector PDP (sPDP) with currency / amount / rail / approval gating.",
    endpoints: ["/v1/wallets", "/v1/payment-authorities", "/v1/payment-intents", "/v1/payment-intents/{id}/authorize"],
    terms: [
      { name: "payment.initiate", desc: "Begin a payment within a payment authority" },
      { name: "payment_authority", desc: "Wallet-bound delegation analogue with sector constraints" },
      { name: "approval_required_above_minor", desc: "Threshold above which sPDP requires approval" },
    ],
  },
  {
    id: "kye-federation-1.0", name: "Federation",
    description: "Cross-trust-domain entity portability with attenuated scope. JWKS exchange, signed assertions, transferred entities preserve provenance.",
    endpoints: ["/v1/federation/verify", "/v1/federation/transfer", "/v1/trust-domains"],
    terms: [
      { name: "external_origin", desc: "Foreign trust-domain provenance for an imported entity" },
      { name: "federation.entity_imported", desc: "Signal emitted on successful transfer" },
      { name: "federation_scope_attenuation_violation", desc: "Reason when imported scope tries to extend the foreign one" },
    ],
  },
  {
    id: "kye-credentials-1.0", name: "Credentials",
    description: "Issue, verify, present and revoke verifiable credentials. Ed25519 detached signatures over canonical payloads. Verifier checks signature + status + expiry + revocation.",
    endpoints: ["/v1/credentials/issue", "/v1/credentials/verify", "/v1/credentials/present", "/v1/credentials/{id}/revoke"],
    terms: [
      { name: "kye_entity_passport", desc: "A self-contained entity-scoped credential" },
      { name: "credential_signature_invalid", desc: "Reason when verifier cannot check the signature" },
      { name: "credential_revoked", desc: "Status after issuer revocation" },
    ],
  },
  {
    id: "kye-attestation-1.0", name: "Attestation",
    description: "Workload identity. SPIFFE / EAT / build-provenance bindings. Attestations have explicit revocation and stale detection.",
    endpoints: ["/v1/workloads/attest", "/v1/workloads/{entity_id}/attestations", "/v1/attestations/{id}/revoke"],
    terms: [
      { name: "spiffe_id", desc: "SPIFFE identifier of a workload" },
      { name: "attestation_stale", desc: "Reason when attestation is past expiry" },
      { name: "build_provenance_hash", desc: "Hash of the build evidence (field name only)" },
    ],
  },
  {
    id: "kye-signals-1.0", name: "Signals",
    description: "Reactive bus. Subscribers register filters and ack delivery checkpoints. Replay supported. Signed webhook delivery with replay window + key rotation.",
    endpoints: ["/v1/signals/publish", "/v1/signals/subscribe", "/v1/signals/ack", "/v1/signals/replay", "/v1/webhooks"],
    terms: [
      { name: "entity.stop", desc: "Halts an entity and cascades to its delegations" },
      { name: "delegation.revoked", desc: "Recursive revoke through parent_delegation_id" },
      { name: "transparency.receipt_issued", desc: "Emitted when a transparency log appends a statement" },
    ],
  },
  {
    id: "kye-transparency-1.0", name: "Transparency",
    description: "Append-only statement log. Each append returns a signed receipt. External auditors can verify inclusion using only the gateway’s public keys.",
    endpoints: ["/v1/transparency/statements", "/v1/transparency/receipts/{id}", "/v1/transparency/verify"],
    terms: [
      { name: "transparency_statement", desc: "Canonicalised assertion submitted to the log" },
      { name: "transparency_receipt", desc: "Signed proof returned by the log" },
      { name: "log_index", desc: "Position in the transparency log" },
    ],
  },
];
