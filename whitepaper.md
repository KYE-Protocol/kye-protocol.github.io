# KYE Protocol™ — Whitepaper v1.0

> Cryptographic provenance for every action humans, businesses, AI
> agents, services, models and workflows take. One identity URN. One
> delegation chain. One decision vocabulary. One cascading audit bus.
> Open contracts that unify KYC, KYB and KYA — without locking
> adopters into a vendor.

Version 1.0 · April 2026 · <https://github.com/KYE-Protocol>

## Abstract

The agentic stack — AI agents, models, tools, workflows acting
autonomously on behalf of humans and businesses — is reaching
production at a velocity that has outrun the identity, authorisation
and audit infrastructure beneath it. KYC verifies humans. KYB verifies
businesses. KYA (just emerging in 2026 from Visa, Skyfire, Persona,
Sumsub, Trulioo) verifies agents. Each layer is siloed; each verifies
once, at registration; none answers *"is the answer still true 200 ms
from now when the next call arrives?"*

**KYE Protocol™** — *Know Your Entity™* — is the open contract that
unifies these layers. Every entity (human, business, agent, service,
model, tool, workflow) shares one URN format. Every action is bound
to a delegation chain with attenuable scope. Every decision is
recorded with a standardised reason code. Every revocation cascades
through the trust graph in milliseconds. Every audit event hash-links
to the previous one. Every decision can be exported as a signed proof
bundle a regulator can verify with public keys alone.

## 1. Problem

### 1.1 Fragmented identity

One agent typically holds three or four identities at once: a SPIFFE
SVID for workload attestation, an OAuth `client_id` for the API
gateway, a vendor-specific KYA passport for payment rails, and a
model card for inference governance. Each format is reconcilable only
by hand; auditors stitch traces by timestamp.

### 1.2 Static authorisation

OAuth scopes and KYC files describe state at issuance. Neither
propagates a revocation. When a delegated agent is compromised, the
human delegator may not learn about it until the next compliance
review.

### 1.3 Unprovable history

Audit logs are vendor-specific. The decision, the inputs, the
obligations and the cascade are not portable.

## 2. Conceptual model

KYE Protocol™ defines nine first-class records:

- `Entity` — any actor or resource. Lifecycle, classification, assurance.
- `Delegation` — actor may act for subject, granted by delegator,
  within scope, for allowed actions.
- `Scope` — bundle of constraints + obligations; attenuable through
  `parent_scope_id`.
- `AccessRight` — fine-grained, resource-level grant.
- `Credential` — signed assertion about an entity.
- `Attestation` — workload-identity binding.
- `Signal` — reactive event on the bus (stop / quarantine / revoke / cascade).
- `PolicyDecision` — record of an authorise call.
- `AuditEvent` — append-only, hash-linked entry.

### 2.1 Six-dimension state

Every entity has six independent state dimensions, each transitioning
on its own:

| dimension | values |
|---|---|
| `entity_state` | provisional, active, suspended, quarantined, stopped, tombstoned |
| `authority_state` | none, scoped, elevated, break_glass, frozen |
| `delegation_state` | active, parent_revoked, self_revoked, expired, scope_violated |
| `credential_state` | none, valid, expired, revoked, signature_invalid |
| `recovery_state` | healthy, recovery_requested, recovery_decided, compromised, rotated |
| `risk_state` | nominal, elevated, watch, denylisted |

A composition matrix in `private/specs/state/state-composition-matrix.md`
publishes the legal/illegal composed states and break-glass entry
conditions.

### 2.2 Cascade revocation

Stop signals cascade atomically before the response returns. Revoking
an entity propagates to its delegations (recursively through
`parent_delegation_id`), payment authorities, access rights,
capability grants, and recovery decisions. Each propagation step
emits its own audit event with a shared `correlation_id`.

## 3. Contract surface

v1.0 publishes:

- 112 OpenAPI operations across 87+ runtime endpoints
- 46 JSON Schemas (JSON Schema 2020-12, absolute `$id`)
- 31 validated example payloads
- 37 black-box conformance fixtures

Resource families: Entities, Delegations, Scopes, Access Rights,
Credentials, Attestations, Capabilities, Capability Grants, Runtime
(authorize / invoke), Signals, Webhooks, Audit, Proof Bundles,
Transparency, Federation, Recoveries, Break-Glass Grants, Compromise
Reports, Keys, Conformance, plus Payments families.

## 4. Profiles (31 normative)

Core, Gateway, Federation, Credentials, Attestation, Signals,
Transparency, Conformance, Treasury, Custody, Healthcare, Telemetry,
**Capability** (skills / tools / MCP / connectors / playbooks /
model_profiles), **Recovery** (recovery requests, decisions, signed
proofs, break-glass grants, compromise reports), Payments — plus
3 payment overlays (EU, Card, High-Assurance).

## 5. Sectors

Retail & commercial banking; payments & cards; healthcare & life
sciences; capital markets & treasury; custody & digital-asset
operators; insurance & underwriting; AI labs & agent platforms;
public sector & defence; marketplaces & platforms.

## 6. Compliance

`private/specs/compliance/control-mappings.md` ships **173 control
mappings** across SOC 2, ISO 27001:2022, PCI DSS 4.0, PSD2/PSD3,
DORA, NIS2, EU AI Act, NIST 800-207, HIPAA. Each row points to the
specific KYE™ artefact (endpoint, schema, profile section, fixture).

## 7. Conformance & certification

37 black-box fixtures speak only HTTP; any conformant implementation
can be tested with the same pack. The conformance reporter emits
machine-readable evidence (`schemas/conformance-report.json`).

Quantitative SLA tiers (Tier-1 Bank / Tier-2 Mid-market / Tier-3
Reference) with p50, p99, throughput, cascade-latency targets are
published in `kye-gateway-v1.md §15`.

## 8. Normative addenda (gap-closure register)

15 / 15 protocol-design gaps closed at the spec contract level.
Algorithms remain in the patent track.

**Blockers (5):** state-composition transition matrix; wire version
negotiation; cascade atomicity contract; RFC 7807 problem+json error
envelope; MCP capability subset.

**Important (5):** recovery m-of-n approval; conformance-report
schema (promoted to v1.0); payments post-execution lifecycle;
telemetry MUST + OTLP/CloudEvents; quantitative SLA tiers.

**Polish (5):** selective disclosure + GDPR right-to-erasure;
cryptographic agility; capability dependency + supply-chain
attestation; multi-region geo-replication; vocabulary completeness.

## 9. Security & threat model

The reference implementation defends against:

- Replay attacks
- Tampered audit events
- Stale revocations
- Forged credentials
- Approval timeout abuse
- Compromised actor (cascade revoke + recovery + key rotation)
- Lost or rotated keys
- Forensic back-dating (point-in-time replay)

## 10. Governance

Vocabulary, schemas, OpenAPI specs and reference Gateway behaviour are
published openly under Apache License 2.0. Specific mechanism designs
(decision algorithms, signal propagation, scope attenuation,
signing-suite construction) sit in a separate patent track and are
not disclosed in the public repositories pre-filing.

Trademark policy: KYE™, KYE Protocol™ and Know Your Entity™ refer to
the protocol as published. Forks, modifications and unrelated projects
must not use the marks to identify themselves.

## 11. Roadmap

- **v1.1:** sector overlays for healthcare (clinical / payer / research,
  42 CFR Part 2); extended signal-bus durability options.
- **v1.2:** certification programme + independent test-vector runners
  - vendor self-attestation portal.
- **v2.0:** Federation v2 with multi-hop attenuation; patent-track
  algorithms move to royalty-free open standard.

## License

Apache License 2.0. KYE™, KYE Protocol™ and Know Your Entity™ are
trademarks of the KYE Protocol™ project.

— KYE Protocol™ Project, 2026.
