/* KYE Protocol™ profile inventory — 15 normative profiles in v1.0. */
export const PROFILES = [
  {
    id: "kye-core-1.0", name: "Core", status: "Normative v1.0",
    description: "The base contract. Entity registration, delegations, scopes, credentials, attestations, runtime authorize/evaluate/events, audit chain, signal bus.",
    endpoints: ["/v1/entities", "/v1/delegations", "/v1/runtime/authorize", "/v1/audit/events", "/v1/signals/publish"],
    terms: [
      { name: "ai_agent", desc: "Autonomous software actor" },
      { name: "delegation", desc: "Authority granted from delegator to actor for a subject" },
      { name: "allow_with_constraints", desc: "Allowed if obligations are honoured" },
    ],
  },
  {
    id: "kye-gateway-1.0", name: "Gateway", status: "Normative v1.0",
    description: "API surface, headers, idempotency, content types, signing, error envelopes. The contract every conformant Gateway implements regardless of vendor or runtime.",
    endpoints: ["/.well-known/kye", "/v1/keys", "/v1/keys:rotate", "/v1/runtime/authorize"],
    terms: [
      { name: "Idempotency-Key", desc: "Header for safe replay of state-changing requests" },
      { name: "X-Break-Glass-Grant-Id", desc: "Required for sensitive ops like key rotation" },
      { name: "well-known/kye", desc: "Discovery document for JWKS, profile list, conformance version" },
    ],
  },
  {
    id: "kye-payments-1.0", name: "Payments", status: "Normative v1.0",
    description: "Sectoral overlay for payment intents, payment authorities, beneficiaries, wallets, and a sector PDP (sPDP) with currency / amount / rail / approval gating.",
    endpoints: ["/v1/wallets", "/v1/payment-authorities", "/v1/payment-intents", "/v1/payment-intents/{id}/authorize"],
    terms: [
      { name: "payment.initiate", desc: "Begin a payment within a payment authority" },
      { name: "payment_authority", desc: "Wallet-bound delegation analogue with sector constraints" },
      { name: "approval_required_above_minor", desc: "Threshold above which sPDP requires approval" },
    ],
  },
  {
    id: "kye-federation-1.0", name: "Federation", status: "Normative v1.0",
    description: "Cross-trust-domain entity portability with attenuated scope. JWKS exchange, signed assertions, transferred entities preserve provenance.",
    endpoints: ["/v1/federation/verify", "/v1/federation/transfer", "/v1/trust-domains"],
    terms: [
      { name: "external_origin", desc: "Foreign trust-domain provenance for an imported entity" },
      { name: "federation.entity_imported", desc: "Signal emitted on successful transfer" },
      { name: "federation_scope_attenuation_violation", desc: "Reason when imported scope tries to extend the foreign one" },
    ],
  },
  {
    id: "kye-credentials-1.0", name: "Credentials", status: "Normative v1.0",
    description: "Issue, verify, present and revoke verifiable credentials. Ed25519 detached signatures over canonical payloads. Verifier checks signature + status + expiry + revocation.",
    endpoints: ["/v1/credentials/issue", "/v1/credentials/verify", "/v1/credentials/present", "/v1/credentials/{id}/revoke"],
    terms: [
      { name: "kye_entity_passport", desc: "A self-contained entity-scoped credential" },
      { name: "credential_signature_invalid", desc: "Reason when verifier cannot check the signature" },
      { name: "credential_revoked", desc: "Status after issuer revocation" },
    ],
  },
  {
    id: "kye-attestation-1.0", name: "Attestation", status: "Normative v1.0",
    description: "Workload identity. SPIFFE / EAT / build-provenance bindings. Attestations have explicit revocation and stale detection.",
    endpoints: ["/v1/workloads/attest", "/v1/workloads/{entity_id}/attestations", "/v1/attestations/{id}/revoke"],
    terms: [
      { name: "spiffe_id", desc: "SPIFFE identifier of a workload" },
      { name: "attestation_stale", desc: "Reason when attestation is past expiry" },
      { name: "build_provenance_hash", desc: "Hash of the build evidence (field name only)" },
    ],
  },
  {
    id: "kye-signals-1.0", name: "Signals", status: "Normative v1.0",
    description: "Reactive bus. Subscribers register filters and ack delivery checkpoints. Replay supported. Signed webhook delivery with replay window + key rotation.",
    endpoints: ["/v1/signals/publish", "/v1/signals/subscribe", "/v1/signals/ack", "/v1/signals/replay", "/v1/webhooks"],
    terms: [
      { name: "entity.stop", desc: "Halts an entity and cascades to its delegations" },
      { name: "delegation.revoked", desc: "Recursive revoke through parent_delegation_id" },
      { name: "transparency.receipt_issued", desc: "Emitted when a transparency log appends a statement" },
    ],
  },
  {
    id: "kye-transparency-1.0", name: "Transparency", status: "Normative v1.0",
    description: "Append-only statement log. Each append returns a signed receipt. External auditors can verify inclusion using only the gateway’s public keys.",
    endpoints: ["/v1/transparency/statements", "/v1/transparency/receipts/{id}", "/v1/transparency/verify"],
    terms: [
      { name: "transparency_statement", desc: "Canonicalised assertion submitted to the log" },
      { name: "transparency_receipt", desc: "Signed proof returned by the log" },
      { name: "log_index", desc: "Position in the transparency log" },
    ],
  },
  {
    id: "kye-conformance-1.0", name: "Conformance", status: "Normative v1.0",
    description: "Black-box fixture pack + reporter. 40 deterministic scenarios that any conforming implementation must pass. The same pack tests vendors, internal stacks, and the reference Gateway.",
    endpoints: ["/v1/conformance/run", "/v1/conformance/report", "/v1/conformance/version"],
    terms: [
      { name: "conformance_fixture", desc: "Single black-box scenario with request + expectation chain" },
      { name: "conformance_report", desc: "Pass/fail evidence the auditor receives" },
      { name: "conformance_version", desc: "Pinned fixture-pack version a deployment is certified against" },
    ],
  },
  {
    id: "kye-treasury-1.0", name: "Treasury", status: "Normative v1.0",
    description: "Treasury authority chain — sweeps, rebalances, intercompany transfers, FX. Reconciliation hooks tie every state-changing intent back to its treasury authority + scope.",
    endpoints: ["/v1/treasury/authorities", "/v1/treasury/intents", "/v1/treasury/reconcile"],
    terms: [
      { name: "treasury_authority", desc: "Bounded right to move funds within a treasury scope" },
      { name: "treasury.rebalance", desc: "Action across owned wallets" },
      { name: "reconciliation_event", desc: "Signal that ties intents back to settled state" },
    ],
  },
  {
    id: "kye-custody-1.0", name: "Custody", status: "Normative v1.0",
    description: "Asset custody chain of authority. Workload attestation binds the runtime; custody authority binds the wallet; audit chain binds the timeline.",
    endpoints: ["/v1/custody/wallets", "/v1/custody/authorities", "/v1/custody/withdraw"],
    terms: [
      { name: "custody_authority", desc: "Right to act on a custodied asset within scope" },
      { name: "custody.withdraw", desc: "Action that removes assets from custody" },
      { name: "asset_class", desc: "Asset taxonomy governed by the custody profile" },
    ],
  },
  {
    id: "kye-healthcare-1.0", name: "Healthcare", status: "Normative v1.0",
    description: "HIPAA-aligned overlay. Binds an agent to consent credentials, attaches redaction obligations and external-send blocks, records the lot in the audit chain.",
    endpoints: ["/v1/healthcare/consents", "/v1/healthcare/redactions", "/v1/healthcare/data-uses"],
    terms: [
      { name: "consent_credential", desc: "Verifiable consent issued by the patient or proxy" },
      { name: "redaction.required", desc: "Obligation a downstream PEP must satisfy" },
      { name: "external.send.block", desc: "Obligation forbidding egress beyond the trust domain" },
    ],
  },
  {
    id: "kye-telemetry-1.0", name: "Telemetry", status: "Normative v1.0",
    description: "Authorisation decision telemetry. Every PDP decision emits a structured event with the policy, inputs, reason code, decision time, and the entity chain that produced it.",
    endpoints: ["/v1/telemetry/decisions", "/v1/telemetry/stream"],
    terms: [
      { name: "policy_decision_id", desc: "URN that pins one decision to one record" },
      { name: "decision_reason_code", desc: "Vocabulary-defined reason a decision came out the way it did" },
      { name: "decision_latency_ms", desc: "Time from request to allow / deny / approval" },
    ],
  },
  {
    id: "kye-capability-1.0", name: "Capability", status: "Normative v1.0",
    description: "Skills, tools, MCP tools, functions, connectors, prompts, workflows, playbooks, runbooks, model profiles, payment actions. Register, grant, invoke (allow / deny / require-approval / quarantine), supersede, revoke.",
    endpoints: ["/v1/capabilities", "/v1/capability-grants", "/v1/runtime/invoke", "/v1/capabilities/{id}:quarantine"],
    terms: [
      { name: "capability_kind", desc: "skill / tool / mcp_tool / function / connector / playbook / model_profile / …" },
      { name: "capability_grant", desc: "Grants an actor the right to invoke a capability within scope" },
      { name: "capability.authority_revoked", desc: "Signal emitted when a grant is cascade-revoked" },
    ],
  },
  {
    id: "kye-recovery-1.0", name: "Recovery", status: "Normative v1.0",
    description: "Recovery requests, decisions, signed proofs, break-glass grants, compromise reports. Replaces ad-hoc admin reset with an auditable, time-boxed, signed flow.",
    endpoints: ["/v1/recoveries", "/v1/recoveries/{id}/decide", "/v1/break-glass-grants", "/v1/compromise-reports"],
    terms: [
      { name: "break_glass_grant", desc: "Time-boxed elevated authority, fully audited" },
      { name: "compromise_report", desc: "Trigger for cascade revocation across delegations + capabilities + payment authorities" },
      { name: "recovery_proof", desc: "Signed artefact proving an entity completed recovery" },
    ],
  },
  {
    id: "kye-taxonomy-metadata-1.0", name: "Taxonomy & Metadata", status: "Normative v1.0",
    description: "Adds canonical taxonomies and metadata bindings — the classification layer authority decisions depend on. 16 V1 taxonomies (entity_type, capability_type, action_type, data_class, risk_state, sector, jurisdiction, decision, evidence_type, compliance_framework, …). Metadata bindings carry labels, classifications, ownership, lineage, and compliance refs — and influence policy decisions at runtime.",
    endpoints: ["/v1/taxonomies", "/v1/taxonomies/{id}/terms", "/v1/taxonomy-mappings", "/v1/metadata-schemas", "/v1/metadata:validate", "/v1/metadata:classify", "/v1/metadata-bindings"],
    terms: [
      { name: "taxonomy_term", desc: "Canonical, versioned, status-bound classification term referenced by every KYE object" },
      { name: "metadata_binding", desc: "Labels + classifications + ownership + lineage + compliance metadata block bound to any KYE subject URN" },
      { name: "taxonomy_mapping", desc: "Versioned mapping from a taxonomy term to a compliance-framework control (EU AI Act, ISO 42001, SOC 2, DORA, …)" },
    ],
  },
  {
    id: "kye-graph-1.0", name: "Graph", status: "Normative v1.0",
    description: "Adds the Authority Graph™ — a canonical node + edge contract for entities, capabilities, credentials, authority grants, delegations, policies, decisions, audit events, and evidence packs. Every decision returns a Decision Map™ (explainability), Evidence Graph™ (proof linkage), Blast Radius Map™ (compromise impact), and Compliance Map™ (framework projection). Storage substrate is implementation choice (Postgres, Neo4j, Neptune, Memgraph, TigerGraph, ArangoDB, RDF).",
    endpoints: ["/v1/graph/nodes", "/v1/graph/edges", "/v1/graph/authority-path", "/v1/graph/delegation-path", "/v1/graph/capability-dependencies", "/v1/graph/blast-radius", "/v1/decisions/{id}/map", "/v1/graph:traverse"],
    terms: [
      { name: "graph_node", desc: "Canonical node wrapping a KYE object (entity, capability, credential, authority, decision, audit, evidence, taxonomy term, metadata schema)" },
      { name: "graph_edge", desc: "Canonical edge type — owns, delegates_to, acts_on_behalf_of, uses_capability, governed_by_policy, produced_decision, included_in_evidence_pack, etc." },
      { name: "decision_map", desc: "Per-decision graph projection returned by /v1/decisions/{id}/map — actor → principal → delegation → capability → authority → policy → decision → audit → evidence" },
    ],
  },
  {
    id: "kye-payload-trust-1.0", name: "Payload Trust", status: "Normative v1.0",
    description: "Adds payload artefacts — signed, hashed, replay-resistant evidence artefacts that record or request an action. Payloads carry state but never authority. The runtime verifies them, binds the resulting policy decision back to the artefact, and emits replayable audit evidence.",
    endpoints: ["/v1/payloads", "/v1/payloads/{id}", "/v1/payloads/{id}/verify", "/v1/payloads/{id}/bind-decision"],
    terms: [
      { name: "payload_artifact", desc: "First-class evidence artefact — not an entity — carrying signed request bytes plus integrity, freshness, decision_binding, audit blocks" },
      { name: "payload_state", desc: "13 lifecycle + denial states (created, signed, submitted, received, verified, rejected, expired, replayed, tampered, bound_to_decision, executed, failed, archived)" },
      { name: "payload_decision_binding_missing", desc: "Deny reason when an action is attempted without a successful bound_to_decision transition" },
    ],
  },
];
