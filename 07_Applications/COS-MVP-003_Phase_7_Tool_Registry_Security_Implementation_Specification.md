# COS-MVP-003 Phase 7 Tool Registry Security Implementation Specification

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Security Owner and Data Owner
**Status:** Implementation Specification — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — specification document, no capability exists to release yet

## Purpose

This document translates the ratified-as-recommended decisions in `COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md` and the architecture in `COS-MVP-003_Phase_7_Tool_Registry_Security_Design.md` into a concrete implementation blueprint for Tool Registry security — what would be built, by whom, in what order, and against what evidence — before any security implementation occurs. **It is a specification for future implementation work, not the implementation itself.** No credential is created, no secret is created, no secret manager is configured, no permission is modified, no migration is created, no SQL is written, no application source or database file is modified, no capability is claimed to exist, and no deployment or release status changes.

## Maintaining the Distinction

- **Specification ≠ implementation.** Everything below describes what a future build would need to satisfy. Nothing described here exists in `src/`, `supabase/migrations/`, any secret manager, or any live permission grant.
- **Recommendation ≠ approval.** Every requirement in this specification traces to a decision in the Decision Record that carries that record's own status: "Decisions Recorded — Pending Accountable-Owner Ratification." This specification does not change that status by using those decisions as planning inputs.
- **Security design ≠ deployment.** This document specifies what a security implementation must do. It does not deploy, configure, activate, or provision anything.

## 1. Objective

To provide a build-ready blueprint for Tool Registry security sufficiently concrete that a future Tool Registry Schema Design Review and Migration Design Plan can incorporate its credential-handling requirements directly, the same way the Execution Safety Foundations Implementation Specification enabled its own Schema Design Review. This specification does not perform that schema translation itself — it is the conceptual bridge between the ratified-as-recommended Decision Record and whatever schema/migration work eventually follows, scoped narrowly to security architecture, not the Tool Registry's full lifecycle design.

## 2. Implementation Boundaries

**In scope:** the six security components named in Section 3, the ownership and service responsibilities that operate on them (Sections 4–5), the security and evidence requirements a future implementation must satisfy (Sections 6–7), and the validation a future implementation must pass (Section 8).

**Out of scope** (see Section 12 for the full list): any actual credential, secret, or secret-manager configuration; the Tool Registry's own approval-gated lifecycle transitions (`Candidate` → `Approved` → `Active`, per `Tool_Registry.md`), which remain gated on the still-blocked Shared Approval/Evidence Primitive per Decision Record Decision 6; any SQL, migration, or source file; and any deployment or release action.

## 3. Security Components

### Credential reference handling

Implements Decision Record Decisions 1 and 2. Only a reference (`credential_references.secret_identifier`, `secret_provider`) is ever stored in Tool Registry tables — never a value, per `Secrets_Management.md`'s explicit prohibition. Every credential reference traces to a specific `integrations` row (`tool_id, environment, configuration_reference, status`), and every reference's ownership follows Decision 1's unified "Security Owner and relevant Domain Owner" pair — no separate credential-specific approval path exists alongside the tool's own `Candidate` → `Approved` gate.

### Secret lifecycle management

Implements Decision Record Decision 2's stage split: Security Owner owns creation and storage *policy*; the named Tool Owner (per `Agent_Tool_Permissions.md`'s existing role) owns operational execution of rotation scheduling within that policy. The full `Secrets_Management.md` Provisioning Process (approve → generate → store → grant → configure → test → record) is the only path by which a credential reference may come to exist — no shortcut or ad hoc provisioning path is specified or permitted.

### Rotation requirements

Implements Decision Record Decision 3: hard expiration at `rotation_due_at`, no grace period. Rotation itself follows `Secrets_Management.md`'s existing five-part requirement (on schedule, before expiry, after personnel/ownership changes, after provider risk changes, immediately after suspected exposure) with a supported overlap window, verified new credential, revoked old credential, and confirmed no dependent consumer remains — restated, not modified, from the existing standard.

### Revocation requirements

Implements Decision Record Decision 4: Security Owner, Agent Owner, Tool Owner, or an authorized incident workflow (per `Agent_Tool_Permissions.md`'s existing authority list) may revoke a credential or pause a tool immediately. Every such action — emergency or routine — must produce an evidence record (Section 7); emergency-path actions additionally carry an `is_emergency` marker and a mandatory review-due timestamp, per Decision 4's extension of the Execution Safety Foundations emergency-authority precedent. Active runs must re-evaluate permissions before their next call, per `Agent_Tool_Permissions.md`'s existing Tool Broker Checks — no in-flight operation continues on a revoked credential.

### Trust classification

Implements Decision Record Decision 7: T1–T4 classification authority is "Security Owner and relevant Domain Owner" jointly, unified with Decision 1's ownership model — no separate classification-specific authority. Credential-handling rigor scales formally by class: T1/T2 tools follow the baseline lifecycle (Sections above, applied without elevation); T3 tools require the full `Secrets_Management.md` standard applied without exception; T4 tools additionally require the enhanced, live-tested evidentiary rigor named in Decision 5, applied at maximum strictness.

### Permission boundaries

Reuses `Agent_Tool_Permissions.md`'s existing Permission Model unchanged — authorization is the intersection of approved agent version, active Tool Registry entry, workflow/step, task-specific allowed operations, workspace/resource scope, environment, data classification, authenticated runtime identity, required approval, and time/rate/cost limits. If any dimension is missing or incompatible, access is denied. This specification introduces no new permission dimension; it confirms the existing model's `credential_reference` field is satisfied by the entities named above.

## 4. Ownership Responsibilities

Directly from the Decision Record, restated for implementation clarity:

| Responsibility | Owner | Source decision |
| --- | --- | --- |
| Tool + credential registration approval | Security Owner and relevant Domain Owner (jointly) | Decision 1 |
| Credential creation/storage policy | Security Owner | Decision 2 |
| Rotation scheduling execution | Tool Owner (within Security Owner's policy) | Decision 2 |
| Rotation/expiration enforcement policy | Security Owner | Decision 3 |
| Emergency revocation/pause | Security Owner, Agent Owner, Tool Owner, or authorized incident workflow | Decision 4 |
| Mandatory emergency-action review | Security Owner (with Agent Owner/Automation Owner concurrence) | Decision 4 |
| Validation-evidence sign-off | Security Owner and Data Owner | Decision 5 |
| T1–T4 classification | Security Owner and relevant Domain Owner (jointly) | Decision 7 |
| Security exception / accepted residual risk | System Owner and Security Owner | `Decision_Rights_and_Ownership.md`, unmodified |

All of the above remain **recommendations** until the Decision Record's own ratification occurs — this table restates the recommended assignment for implementation clarity, it does not itself ratify anything.

## 5. Service/Component Responsibilities

- **Credential-reference registration function** — the sole governed path for writing a `credential_references` row, enforcing that only a reference (never a value) is accepted as input, and that the referenced `integrations`/`tools` row has already passed its `Candidate` → `Approved` approval gate (Section 3) before a credential reference may be attached to it.
- **Rotation-policy function** — enforces `rotation_due_at` hard-expiration (Decision 3) at the point any tool call attempts to use a credential reference; denies use past the due date rather than allowing a grace period.
- **Revocation/emergency-pause function** — implements Decision 4: verifies the actor holds one of the four named authorities, writes the `is_emergency` marker and review-due timestamp when applicable, and propagates the revocation so active runs re-evaluate before their next call, per the existing Tool Broker Checks.
- **Classification function** — implements Decision 7: enforces the joint Security Owner/Domain Owner approval requirement at classification or reclassification time, and surfaces the resulting T1–T4 class to every downstream rigor-scaling decision (Section 3, Trust classification).
- **Tool Broker** — not newly designed here; this specification confirms the credential-reference, rotation, and revocation mechanisms above integrate with `Agent_Tool_Permissions.md`'s already-specified Tool Broker Checks rather than requiring a separate authorization path.

Every function above follows the `SECURITY DEFINER`-in-`creator_os_private`-with-thin-`public`-wrapper pattern already proven for documents and applied throughout this Phase 7 chain — no application role receives a direct write grant on `credential_references`, `integrations`, or `tools`.

## 6. Security Requirements

- **Reference-only storage, absolute.** No implementation path may write an actual secret value into any table, log, or governed record — this is the single non-negotiable requirement this entire specification exists to protect, restated from `Secrets_Management.md` without modification.
- **Fail-closed on expiration and revocation.** No default-allow path when a credential is past due or revoked, per Decision 3 and Decision 4.
- **No self-approval on classification or credential registration.** The identity proposing a tool's registration or classification must not be the sole approver — the joint Security Owner/Domain Owner requirement (Decisions 1, 7) is itself a structural safeguard against this, not merely a courtesy.
- **Least privilege on every new table and function.** Revoke-all-first, `SELECT` broadly granted subject to RLS, `INSERT`/`UPDATE` reachable only through the governed function family in Section 5.
- **Argument and destination validation**, per `Agent_Tool_Permissions.md`'s existing requirement — allowed domains, repository owners, branches, filesystem roots, database projects, schemas, and spend thresholds enforced at the broker level, not assumed from tool schema alone.
- **No raw credential ever reaches an agent prompt, memory, or output** — restated from `Secrets_Management.md`'s AI and Automation Controls section, unmodified.

## 7. Audit and Evidence Requirements

- **Secret inventory metadata**, per `Secrets_Management.md`: Secret ID, Owner, Purpose, Provider, Environment, Consumers, Privilege, Created/rotated timestamps, Expiry/rotation-due date, Revocation path, Data classification — never the secret value.
- **Tool call audit**, per `Agent_Tool_Permissions.md`'s existing Audit section: grant decision, agent/tool versions, operation, normalized arguments hash, destination, identity reference, approval reference, timestamp, latency, outcome, error class, cost, correlation IDs — secrets redacted, sensitive arguments minimized.
- **Every credential lifecycle event** (creation, rotation, revocation, emergency pause, classification/reclassification) **writes exactly one evidence row**, in the same operation that produces it — no event may occur silently, mirroring the append-only evidence pattern established throughout this Phase 7 chain.
- **No `UPDATE`/`DELETE` grant** to any application role on any credential-lifecycle evidence table, under any circumstance — matching the evidence-immutability standard already established for documents and recommended for the Shared Approval/Evidence Primitive and Execution Safety Foundations.

## 8. Validation Strategy

Implements Decision Record Decision 5's live-executed evidentiary standard — none of the following exists as evidence yet:

- A live-executed rotation test against a real test-environment credential and secret manager, confirming the overlap window, new-credential verification, old-credential revocation, and dependent-consumer confirmation all function as specified.
- A live-executed revocation test confirming an active run re-evaluates permissions before its next call and is denied use of the revoked credential.
- A live-executed emergency-pause test confirming the `is_emergency` marker and review-due timestamp are correctly recorded and that a mandatory review actually occurs within the bounded window.
- A live-executed expiration test confirming a credential past `rotation_due_at` is denied for new use with no grace period.
- A live-executed self-approval-denial test for classification and registration, confirming the joint-approval requirement cannot be satisfied by a single identity.
- RLS tests at all three tiers (active member / non-member / anonymous) for `credential_references`, `integrations`, and every credential-lifecycle evidence table.
- Zero residual test credentials or fixtures left behind, mirroring the Phase 6.4 "confirm zero leaked fixtures" standard — with the additional confirmation that no test credential was ever a real production secret, per the risk named in the Decision Record's Decision 5.

## 9. Implementation Sequence

Planning-level only — this specification performs none of these steps:

1. Tool Registry Schema Design Review — table names and field lists in prose form, incorporating this specification's credential-handling requirements into the existing `tools`/`tool_permissions`/`integrations`/`credential_references` field lists already present in `Schema_Specification.md`.
2. Tool Registry Migration Design Plan — sequencing, boundaries, compatibility strategy, and validation gates, additive-only, following the same pattern as the Shared Approval/Evidence Primitive's and Execution Safety Foundations' own Migration Design Plans.
3. Secret manager selection and configuration design — resolving the open provider-selection question named in the Decision Record's Unresolved Policy Questions, as its own scoped decision, before any real credential is provisioned.
4. Implementation Readiness Review — cross-artifact synthesis checked against this specification's Section 8, before any migration or credential provisioning is authorized.
5. Migration execution, credential provisioning, and implementation — gated on accountable-owner ratification of the Decision Record, resolution of the secret-manager selection, and the Readiness Review's own conclusion — none of which has occurred as of this document.

## 10. Rollback/Recovery Considerations

At the planning level only. Because `credential_references`, `integrations`, and their supporting evidence tables would all be newly created (no execution-related or tool-related table currently exists in application code, per `COS-MVP-003_Phase_7_Live_State_Reconciliation_Report.md`'s confirmation that `tools` remains provisioned-only, not implemented), a future migration's rollback would be a clean drop with zero risk to any already-shipped capability. **Credential-specific rollback consideration, distinct from schema rollback:** if a credential was provisioned in a test or staging environment during validation (Section 8) and a rollback is needed, the credential itself must be revoked through the normal `Secrets_Management.md` revocation process — dropping a database table does not revoke a live secret, and this specification does not treat schema rollback as a substitute for actual credential revocation.

## 11. Dependencies

- **Shared Approval/Evidence Primitive.** No dependency for the security components in Section 3 (credential reference handling, secret lifecycle, rotation, revocation, trust classification, permission boundaries), per Decision Record Decision 6. The Tool Registry's own `Candidate` → `Approved` → `Active` lifecycle transitions and T4 human-approval flow do depend on it, and remain out of this specification's scope (Section 12).
- **Tool Registry lifecycle.** This specification's credential-handling requirements are designed to attach to the Tool Registry's own lifecycle once it is designed (Section 9, Step 1) — but this specification does not itself design that lifecycle, consistent with the narrow scoping every document in this security-focused sub-chain has held to.
- **Agent Registry.** No direct dependency in either direction. An agent's eventual tool use (once both the Agent Registry and Tool Registry exist) would consume the permission boundaries in Section 3 via `Agent_Tool_Permissions.md`'s existing model, but neither registry's own schema depends on the other's.
- **Execution Safety Foundations.** No schema-level dependency, but a direct precedent relationship: Decision Record Decision 4's emergency-access model explicitly extends Execution Safety Foundations' own emergency-authority pattern (Decision 7) rather than inventing a separate one — this specification's emergency-pause function (Section 5) should be implemented consistent with whatever Execution Safety Foundations' own emergency-action mechanics eventually specify in schema form, once both are implemented, to avoid two divergent "emergency" implementations in the same repository.

## 12. Explicit Out of Scope

- **Any actual credential, secret, or secret-manager configuration** — none is created, referenced, or illustrated anywhere in this document.
- **Any permission modification** — no live permission grant is created or altered.
- **Any SQL, migration, or schema implementation.**
- **Any application source file or database file.**
- **The Tool Registry's approval-gated lifecycle transitions** — gated on the Shared Approval/Evidence Primitive per Section 11, not specified here.
- **The Tool Registry's full Implementation Plan, Technical Design, or Schema Design Review** — this document is a security-specific input to that future chain.
- **The Agent Registry or Workflow Engine** — referenced only for their relationship to this specification (Section 11), not designed here.
- **Deployment or release authorization** — this document is a blueprint for a future build, not an instruction to begin one, and does not change any release status.
- **Resolution of any unresolved policy question** named in the Decision Record — this specification builds around them, it does not resolve them.

## What This Document Does Not Do

- It does not create any credential, secret, or secret-manager configuration.
- It does not modify any permission.
- It does not write any SQL or create any migration.
- It does not modify any application source file or database file.
- It does not claim any part of Tool Registry security is implemented.
- It does not authorize deployment.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not ratify any decision in `COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md` — that record's status remains "Decisions Recorded — Pending Accountable-Owner Ratification," unchanged by this specification's use of its recommendations as planning inputs.

## References

- [COS-MVP-003 Phase 7 Tool Registry Security Design](COS-MVP-003_Phase_7_Tool_Registry_Security_Design.md)
- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — the authoritative source for ratification status referenced throughout this specification
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [System Charter](../00_Governance/System_Charter.md)
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — the emergency-authority precedent Section 3 and Section 11 reference
- [COS-MVP-003 Phase 7 Live State Reconciliation Report](COS-MVP-003_Phase_7_Live_State_Reconciliation_Report.md) — confirms `tools` remains provisioned-only, the basis for Section 10's rollback analysis
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 8 follows

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial implementation specification for Tool Registry security: objective, implementation boundaries, six security components (credential reference handling, secret lifecycle management, rotation, revocation, trust classification, permission boundaries) each tracing to a specific Decision Record decision, an ownership responsibility table, service/component responsibilities, security requirements, audit/evidence requirements, a seven-item validation strategy, a five-step implementation sequence, credential-specific rollback/recovery considerations distinct from schema rollback, dependency analysis across the Shared Approval/Evidence Primitive/Tool Registry lifecycle/Agent Registry/Execution Safety Foundations, and explicit out-of-scope boundaries. No credential created, no secret created, no permission modified, no implementation performed, no decision ratified, no release status changed. |
