/* Decision flow scenarios for the live walkthrough. */
export const FLOW_SCENARIOS = {
  allow: {
    decision: "allow_with_constraints",
    reasons: ["delegation_active", "scope_match", "actor_active"],
    obligations: ["audit.emit"],
    heroSteps: [1, 2, 3, 4],
    steps: [
      "Calling app calls <code>POST /v1/runtime/authorize</code> with actor + delegation_id + action.",
      "PEP forwards to ePDP. Action <code>document.render</code> is in the cached allowlist.",
      "ePDP returns <code>allow_with_constraints</code> from the signed bundle.",
      "PEP returns the decision. App emits <code>POST /v1/runtime/events</code>.",
      "Audit chain appends a hash-linked event. Signal bus has nothing to fan out.",
    ],
  },
  approval: {
    decision: "require_approval",
    reasons: ["high_risk_action_requires_delegation_or_approval"],
    obligations: ["approval.required", "audit.emit"],
    heroSteps: [1, 2, 3, 4],
    steps: [
      "Calling app calls <code>/v1/runtime/authorize</code> for action <code>payment.approve</code>.",
      "ePDP defers — high-risk actions are not cacheable.",
      "Central PDP sees no covering delegation; returns <code>require_approval</code>.",
      "An <code>Approval</code> record is created with a <code>required_by</code> deadline.",
      "App holds the request until <code>POST /v1/approvals/{id}/approve</code> arrives.",
    ],
  },
  "deny-stop": {
    decision: "deny",
    reasons: ["actor_stop_signal:entity.stop"],
    obligations: [],
    heroSteps: [1, 5],
    steps: [
      "Earlier: a stop signal targeted the actor (<code>entity.stop</code>).",
      "Calling app calls <code>/v1/runtime/authorize</code>.",
      "PDP looks up active stop signals — finds one.",
      "Decision is <code>deny</code> with reason <code>actor_stop_signal:entity.stop</code>.",
      "Cascade has already suspended the actor’s delegations and access rights.",
    ],
  },
  "deny-revoke": {
    decision: "deny",
    reasons: ["delegation_status_revoked"],
    obligations: [],
    heroSteps: [1, 2, 5],
    steps: [
      "Delegation was revoked at <code>POST /v1/delegations/{id}/revoke</code>.",
      "Bus emitted <code>delegation.revoked</code> targeting the actor.",
      "Calling app retries <code>/v1/runtime/authorize</code>.",
      "PDP sees delegation status = <code>revoked</code>; returns <code>deny</code>.",
      "Child delegations (via <code>parent_delegation_id</code>) were also revoked.",
    ],
  },
};
