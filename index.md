# KYE Protocol™ — The Entity Authority Protocol for AI Governance

> Prove **who or what is acting**, **on behalf of whom**, using **which
> capability**, under **what authority**, **in what state**, and with
> **what audit trail** — for every action a human, business, AI agent,
> service, model, tool or workflow takes.
>
> The technical and evidentiary foundation for **Authority Finality™**:
> a replayable proof layer for accountability, compliance, dispute
> resolution, and legally defensible audit trails in agentic systems.
>
> Apache License 2.0.

For the canonical machine-discovery list see
[`/llms.txt`](https://kye-protocol.github.io/llms.txt) and
[`/.well-known/api-catalog`](https://kye-protocol.github.io/.well-known/api-catalog).

## From access control to Authority Finality™

Traditional IAM answers *who logged in*. **KYE answers everything that
comes after** — who or what acted, who they acted for, what authority
they had, what capability they used, what state they were in, and what
evidence proves it. KYE does not replace legal agreements, signatures,
or regulatory obligations; it provides the technical and evidentiary
foundation for authority finality in AI-agent systems.


## Architecture (eight first-class principles)

**Schema-first. Dictionary-first. Profile-first. Registry-first.
API-first. SDK-first. Evidence-first. Conformance-first.**

KYE is designed as an implementable protocol — canonical schemas,
shared dictionaries, extensible profiles, resolvable registries,
runtime APIs, developer SDKs, replayable evidence packs, and
conformance tests.

## In one sentence

KYE Protocol™ is the open contract that answers — for every action a
human, service, AI agent, model, tool or workflow takes — *who acted, on
whose behalf, with what authority, under what scope, with what evidence?*

## Why it exists

- **Fragmented identity.** One agent typically holds three or four
  identities at once (SPIFFE SVID, OAuth client_id, KYA passport, model
  card). Auditors stitch traces by timestamp.
- **Static authorisation.** OAuth scopes describe state at issuance, not
  state now. Revocations don't propagate. A compromised agent keeps
  acting until the next compliance review.
- **Unprovable history.** Audit logs are vendor-specific. The decision,
  the inputs, the obligations and the cascade are not portable.

KYE Protocol™ supplies the missing contract — one URN, one delegation
chain, one decision vocabulary, one cascade, one append-only audit chain.

## v1.0 surface

- 15 normative profiles: Core, Gateway, Federation, Credentials,
  Attestation, Signals, Transparency, Conformance, Treasury, Custody,
  Healthcare, Telemetry, **Capability** (skills / tools / MCP / connectors
  / playbooks / model_profiles), **Recovery** (recovery requests,
  decisions, signed proofs, break-glass grants, compromise reports),
  Payments
- 3 payment overlays: EU (PSD2/3), Card (PCI DSS 4.0), High-Assurance
  (ISO 20022)
- 112 OpenAPI operations across 87+ runtime endpoints
- 28 JSON Schemas (JSON Schema 2020-12) with 31 validated examples
- 37 black-box conformance fixtures (37/37 pass)
- 173 control mappings: SOC 2, ISO 27001:2022, PCI DSS 4.0, PSD2/PSD3,
  DORA, NIS2, EU AI Act, NIST 800-207, HIPAA
- Reference Gateway (Node.js, no Express, zero runtime deps), 67/67 tests
- TypeScript, Python, Go SDKs
- OPA Rego + Cerbos policy bundles at parity (22 fixtures)
- CLI: `@kye/cli` covers entities, delegations, capabilities, recovery,
  break-glass, compromise reports, key rotation, audit replay

## Six-dimension state model

Every entity has six independent state dimensions:

| dimension | values |
|---|---|
| `entity_state` | provisional, active, suspended, quarantined, stopped, tombstoned |
| `authority_state` | none, scoped, elevated, break_glass, frozen |
| `delegation_state` | active, parent_revoked, self_revoked, expired, scope_violated |
| `credential_state` | none, valid, expired, revoked, signature_invalid |
| `recovery_state` | healthy, recovery_requested, recovery_decided, compromised, rotated |
| `risk_state` | nominal, elevated, watch, denylisted |

Each transitions independently and emits its own signal class. "Can this
actor act now?" is a single composed test against the six dimensions
plus scope.

## Sectors

| sector | profiles to adopt |
|---|---|
| Retail & commercial banking | Core + Payments + Treasury + Federation + Capability + Recovery |
| Payments & cards | Core + Payments + Credentials + Signals + Telemetry |
| Healthcare & life sciences | Core + Healthcare + Credentials + Capability + Telemetry |
| Capital markets & treasury | Core + Treasury + Custody + Attestation + Transparency + Recovery |
| Custody & digital-asset operators | Core + Custody + Attestation + Credentials + Recovery + Capability |
| Insurance & underwriting | Core + Credentials + Federation + Capability + Telemetry |
| AI labs & agent platforms | Core + Capability + Attestation + Signals + Recovery + Telemetry |
| Public sector & defence | Core + Federation + Attestation + Transparency + Recovery |
| Marketplaces & platforms | Core + Federation + Capability + Signals + Telemetry |

## URN format

```
kye:<class>:<trust-domain>:<subclass>:<local>
```

Examples:

```
kye:ent:acme.example:ai_agent:01JY3J1D4E5A7K3JQFK4E0Q1XZ
kye:del:acme.example:01JYDELEG0000000000000000A
kye:cap:acme.example:mcp_tool:01JYCAP00000000000000000A
kye:rec:acme.example:01JYREC00000000000000000A
kye:sig:acme.example:01JYSIGNAL00000000000000A
kye:pdc:acme.example:01JYPOLICY0000000000000A
kye:aud:acme.example:01JYAUDIT00000000000000A
kye:pb:acme.example:01JYPROOF00000000000000A
```

## Cascade revocation

Stop signals cascade atomically before the response returns. Revoking an
entity propagates to its delegations (recursively through
`parent_delegation_id`), payment authorities, access rights, capability
grants, and recovery decisions. Each propagation step emits its own
audit event with a shared `correlation_id`.

## Discovery

- Whitepaper: <https://kye-protocol.github.io/whitepaper.html>
- Legal & trademark: <https://kye-protocol.github.io/legal.html>
- API catalog: <https://kye-protocol.github.io/.well-known/api-catalog>
- MCP server card: <https://kye-protocol.github.io/.well-known/mcp/server-card.json>
- Agent skills: <https://kye-protocol.github.io/.well-known/agent-skills/index.json>
- OAuth authorisation server: <https://kye-protocol.github.io/.well-known/oauth-authorization-server>
- OAuth protected resource: <https://kye-protocol.github.io/.well-known/oauth-protected-resource>
- OpenID configuration: <https://kye-protocol.github.io/.well-known/openid-configuration>
- Sitemap: <https://kye-protocol.github.io/sitemap.xml>
- Source: <https://github.com/KYE-Protocol>

## License

Apache License 2.0. KYE™, KYE Protocol™ and Know Your Entity™ are
trademarks of the KYE Protocol™ project.
