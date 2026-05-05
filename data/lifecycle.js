/* Mirror of public lifecycle transitions. */
export const LIFECYCLE_TRANSITIONS = {
  discovered: ["registered", "tombstoned"],
  registered: ["pending_verification", "verified", "active", "suspended", "stopped", "tombstoned"],
  pending_verification: ["verified", "active", "under_review", "suspended", "stopped", "tombstoned"],
  verified: ["active", "limited", "under_review", "approval_required", "suspended", "stopped", "quarantined", "tombstoned"],
  active: ["limited", "under_review", "approval_required", "suspended", "stopped", "quarantined", "revoked", "transferred", "archived", "tombstoned"],
  limited: ["active", "suspended", "stopped", "tombstoned"],
  under_review: ["active", "limited", "suspended", "revoked", "tombstoned"],
  approval_required: ["active", "limited", "suspended", "revoked", "tombstoned"],
  suspended: ["active", "stopped", "revoked", "archived", "tombstoned"],
  stopped: ["revoked", "archived", "tombstoned"],
  quarantined: ["active", "stopped", "revoked", "tombstoned"],
  revoked: ["archived", "tombstoned"],
  transferred: ["archived", "tombstoned"],
  archived: ["tombstoned"],
  tombstoned: [],
};
