# COS-MVP-003 Phase 7 Execution Safety Foundations Migration Design Plan

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Data Owner and Architecture Owner
**Status:** Migration Design Plan — No Migration Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning document, no capability exists to release yet

## Purpose

This document translates the reviewed Schema Design Review into a migration *planning* artifact for Execution Safety Foundations — the order of operations, boundaries, compatibility strategy, and gates a future migration would need to satisfy. **It is a plan, not a migration.** No SQL is written, no migration file is created, no database file is modified, and no implementation is claimed to exist. It is the sixth and final document in the planning sequence the Implementation Plan's Section 6 established (Implementation Plan → Technical Design → Decision Record → Implementation Specification → Schema Design Review → Migration Design Plan), mirroring the identical six-document chain already completed for the Shared Approval/Evidence Primitive.

## Maintaining the Distinction

- **Planning ≠ execution.** Every step named in Section 4 describes what a future migration would do. This document performs none of them.
- **Design ≠ implementation.** Sections 5–8 describe requirements a future migration must satisfy. Nothing described exists in `supabase/migrations/` or the live database.
- **Recommendation ≠ authorization.** Nothing in this document authorizes migration execution. Section 9's validation gates, not this document's existence, determine when execution may begin — and none of those gates is satisfied as of this writing.

## 1. Objective

**What capability this migration enables:** the physical existence of Execution Safety Foundations' schema — the `incidents`, execution-audit-events, checkpoints/idempotency, and `recovery_actions` entities (and, contingently, a compensation entity — see Section 5), their security model, and their governed-mutation function family — so that the Workflow Engine and Agent Execution Layer (Phase 8) have a governed incident, recovery, and audit mechanism to build against, rather than needing to invent their own, mirroring exactly the rationale the Shared Approval/Evidence Primitive's own Migration Design Plan stated for its consumers.

**What existing behavior must remain unchanged:** nothing currently implemented performs execution of the kind this schema governs (Section 3 of the Technical Design and Schema Design Review both confirm this independently) — so, unlike the Shared Approval/Evidence Primitive's migration, there is no existing execution-specific behavior this migration must preserve compatibility with. What *must* remain unchanged is every already-shipped capability outside this scope entirely: System Registry, Documentation Registry, and the document-specific evidence pattern, none of which this migration touches in any way.

## 2. Migration Boundaries

**Included:**
- The `incidents` entity, its RLS policies, and its grants, implementing the seven-state lifecycle from Decision Record Decision 1.
- The execution-audit-events entity (working name `execution_lifecycle_events`), its RLS policies, and its grants.
- The checkpoint/idempotency mechanism, in whichever form Section 5 below determines is ready for migration (embedded fields on `runs`/`run_steps`, per the Schema Design Review's Option A recommendation).
- The `runs` and `run_steps` entities themselves — already specified in `Schema_Specification.md`'s prose contract but never migrated into application code; this migration is their first physical creation, not an alteration of an existing table.
- The `recovery_actions` entity, its RLS policies, and its grants, implementing Decision Record Decision 2.
- The shared `SECURITY DEFINER` function family (incident transition, run transition, recovery authorization, idempotency-key resolution), following the `creator_os_private` + thin `public` wrapper pattern already established for documents and recommended for the Shared Approval/Evidence Primitive.
- Supporting indexes for the query patterns the document pattern and the Shared Approval/Evidence Primitive's own Migration Design Plan already demonstrate are needed (workspace/subject lookups, actor lookups, chronological ordering).

**Explicitly excluded:**
- **The compensation-records entity**, per the Schema Design Review's own provisional framing — its storage location (dedicated table vs. Shared Approval/Evidence Primitive reuse) remains an open decision (Decision Record Decision 3, Schema Design Review Section 11), and this migration does not create it in either form. Compensation *authority logic* (the role-overlay check) may still be scoped for a future migration once the storage question resolves, but no compensation table is created here.
- Any `ALTER` of any existing document-specific table, function, policy, or grant — none is touched, mirroring the additive-only convention already proven for the Shared Approval/Evidence Primitive.
- Any Agent Registry, Tool Registry, or Workflow Engine table — all are separate Phase 7/8 work items that would *consume* this schema once it exists, not part of building it.
- Any client-facing application or service-layer code — this plan concerns database schema only.
- Resolving the checkpoint/idempotency Option A/B question (Schema Design Review Section 11) beyond adopting Option A as the migration's working basis — Option B remains available as a future addition if the edge case it addresses proves necessary, without requiring this migration to be redone.
- Resolving the `governed_subjects` registration question for execution-safety subjects (Schema Design Review Section 4) — this migration does not register any entity into `governed_subjects`, and does not need that question resolved to proceed, mirroring exactly how the Shared Approval/Evidence Primitive's own migration plan treated its unrelated `approvals`-table reconciliation question as non-blocking.

## 3. Additive-Only Strategy

Every object named in Section 2's "Included" list is new. Unlike the Shared Approval/Evidence Primitive's migration — which had to state explicitly that it would not alter the existing, live-validated document tables — this migration has an even simpler compatibility position: **no execution-related table has ever been created in this repository's migrations**, so there is no existing execution behavior of any kind to preserve. The `incidents`/`runs`/`run_steps` field lists in `Schema_Specification.md` are prose specifications, not implemented tables; this migration would be their first physical creation, not a change to something already running. This makes the additive-only strategy here strictly simpler to reason about than the Shared Approval/Evidence Primitive's own case, though no less binding — every future entity added to this schema (should it grow, e.g., a compensation table once its storage question resolves) must itself remain additive relative to whatever this migration creates.

## 4. Proposed Migration Sequence

Order of operations only — no SQL.

1. **New structures, in dependency order.** `incidents` and `runs` first, since `run_steps` depends on `runs` and `recovery_actions` depends on `runs`. Then `run_steps`. Then `recovery_actions`. Then the execution-audit-events entity last, since it references all of the above (whichever of `incidents`, `runs`, or `run_steps` produced a given transition).
2. **Security model.** Revoke-all-first on every new table (matching the document and Shared Approval/Evidence Primitive convention exactly), then grant only what's needed (`SELECT`, and `INSERT`/`UPDATE` solely for the governed function family, never for application roles directly), then apply the three-tier RLS policies, then implement the `SECURITY DEFINER` function family in `creator_os_private` with thin `SECURITY INVOKER` wrappers in `public`.
3. **Validation.** Apply the migration to a live or staging environment and execute the validation plan already specified in the Implementation Specification (Section 8) and the pre-migration gates in the Schema Design Review (Section 10) — live-executed evidence, not source review, per the Phase 6.4 standard.
4. **Integration adapter extension.** Add the reconciliation-contract operation (Technical Design Section 3, Decision Record Decision 2) to existing integration adapter patterns — this is the one step in this sequence that touches something outside the new tables themselves, and should be scoped and reviewed as its own sub-step given the open feasibility question recorded in Decision Record Section 8.
5. **Compatibility checks.** Confirm no existing grant, policy, or function outside this migration's scope was altered; confirm a live security-advisor scan (mirroring Phase 6.4's methodology) shows no new findings against any existing table, including the already-shipped document and (if by then implemented) approval-primitive tables.

## 5. Entity Introduction Considerations

- **`incidents` and `runs` should be introduced together**, since neither is independently useful without the other — an incident with no run to reference has nothing to describe, per Section 4's Relationships and Ownership discussion in the Schema Design Review.
- **`run_steps` and the checkpoint mechanism are introduced in the same step**, since the Schema Design Review's Option A recommendation embeds the checkpoint pointer and idempotency key directly on `runs`/`run_steps` rather than in a separate entity — introducing them separately would create a window where `runs` exists without any way to record step-level progress.
- **`recovery_actions` is introduced after `runs` exists**, since every recovery-action row must reference a run, and cannot be meaningfully tested without one.
- **The execution-audit-events entity is introduced last**, consuming all other entities' transitions — this mirrors the Shared Approval/Evidence Primitive's own sequencing rationale (`governed_subjects` first, evidence tables after) in principle, though the specific dependency shape here is different since there is no single registry-style anchor table in this schema the way `governed_subjects` serves the approval primitive.
- **The compensation entity is deliberately not sequenced at all** in this plan, consistent with Section 2's exclusion — if a future migration adds it, that migration's own sequencing would need to determine where it fits relative to `recovery_actions`, not something this plan pre-empts.

## 6. Security/RLS Migration Considerations

- **RLS.** The three-tier model (active member / non-member / anonymous) applied identically across all new tables, matching the Phase 6.4-proven pattern and the Shared Approval/Evidence Primitive's own migration plan.
- **Permissions.** Revoke-first on every new table; grant only `SELECT` broadly to `authenticated` (subject to RLS) and `INSERT`/`UPDATE` only insofar as they flow through the governed function family — no application role receives a direct write grant on any new table.
- **Ownership boundaries.** Every row's `workspace_id` resolves through (and is validated against) the referenced run or incident at write time, per the Schema Design Review's Section 4 — no evidence row can exist without a workspace-bound anchor.
- **Least privilege.** The actual mutation logic lives in `creator_os_private`, unreachable by any application role directly; only the thin `public` wrapper functions are callable, mirroring the existing convention.
- **No self-compensation or self-unquarantine.** Enforced inside the recovery-authorization function itself as a database-level check (actor identity on a `recovery_actions` row ≠ the identity whose action caused the run's `Failed`/`Quarantined` state) — specifically required to be proven via a live, dedicated denial test before this migration's validation is considered complete, per the Implementation Specification's Section 8.
- **Emergency-path fields do not weaken any check.** `is_emergency` and `review_due_at` are additive obligations, not a bypass — the security model must enforce the same role check on an emergency-path decision as an ordinary one, per Decision Record Decision 7, and the migration's own validation should include a test confirming an emergency marker does not relax the role check.

## 7. Compatibility Strategy

Simpler than the Shared Approval/Evidence Primitive's own compatibility strategy, because there is no existing execution-specific behavior to be compatible *with* — restated explicitly rather than assumed, per Section 1 and Section 3 above. Compatibility here means: every object in Section 2's "Included" list is additive relative to the *rest* of the repository (documents, System Registry, and — if by then implemented — the approval primitive), none of which this migration alters in any way. This is demonstrated via the same live security-advisor scan and grant/policy diff already named in Section 4, Step 5, not assumed from the migration's design alone.

## 8. Rollback Strategy

Planning-level only — no SQL, no specific migration-file rollback script.

Because every object in this migration is additive (Section 3) and no consumer (Workflow Engine, Agent Execution Layer) exists yet to depend on this schema at the time it would first be applied, rollback is structurally simple: dropping the new tables and their associated functions and policies removes the entire change with zero risk to any existing, already-shipped capability. This is an even lower-risk rollback position than the Shared Approval/Evidence Primitive's own migration, which at least had to consider (and rule out) any interaction with the live document tables — this migration has no analogous consideration, since nothing existing references anything it creates. The only rollback-relevant residue to manage is validation-test data itself, which should be produced inside rolled-back transactions during testing wherever possible, consistent with Phase 6.4's own methodology.

## 9. Validation Gates

Required evidence before migration execution is authorized — not before this planning document is accepted:

- All seven Decision Record decisions explicitly ratified by their accountable owners (Automation Owner, Security Owner, Data Owner, Architecture Owner, System Owner as applicable per each decision's named owner) — the Decision Record's own status remains "Pending Accountable-Owner Ratification" as of this writing, and that must change before migration execution, not merely before this plan.
- The Schema Design Review's Section 10 gates satisfied: field lists checked against every requirement named in the Technical Design and Decision Record, no naming collision left unresolved for anything this migration actually touches.
- The full validation plan from the Implementation Specification executed live, with evidence — quarantine, reconciliation, compensation-authority, idempotency, self-compensation-denial, RLS, and demonstrated end-to-end recovery tests.
- The integration-adapter reconciliation-contract feasibility question (Decision Record Section 8) resolved with actual evidence against a real adapter, not assumed — this is a technical-feasibility gate specific to this migration, with no equivalent in the Shared Approval/Evidence Primitive's own plan.
- Zero residual test data or fixtures left behind from validation execution — mirroring the "confirm zero leaked fixtures" standard Phase 6.4 established.

## 10. Relationship to Other Capabilities

- **Shared Approval/Evidence Primitive.** No migration-level dependency — this migration does not require the primitive's own migration to have occurred first, per Decision Record Decision 6 and the Schema Design Review's Section 8. If the primitive is ratified and migrated before this one, no rework of this migration is required, since nothing here references its tables; if the compensation-storage decision (Decision Record Decision 3) is later resolved in favor of reusing the primitive, that would be its own, separate, future migration, not a revision of this one.
- **Agent Registry.** No migration-level dependency in either direction — this migration creates no table the Agent Registry's own eventual migration would need to alter, and vice versa.
- **Tool Registry.** Same relationship as the Agent Registry — no migration-level dependency.
- **Workflow Engine.** The direct, primary future consumer, per Section 1 — its own eventual migration would reference `runs`/`run_steps` as an existing dependency, not create them itself. This migration is what makes that possible, but the Workflow Engine's migration is separate, future work this plan does not schedule or design.

## 11. Open Migration Decisions

Consolidated from every prior Execution Safety Foundations document, not newly introduced here:

- The seven Decision Record decisions — recommended, not yet ratified.
- The checkpoint/idempotency Option A/B question (Schema Design Review Section 11) — this migration proceeds on Option A as its working basis, per Section 2's exclusions, but the question itself remains open for a possible future addition.
- The compensation-evidence storage question (Decision Record Decision 3) — explicitly excluded from this migration's scope entirely, per Section 2, pending the Shared Approval/Evidence Primitive's own ratification.
- Whether `authority_role_at_decision` should be captured on `recovery_actions` (Schema Design Review Section 11).
- Whether execution-safety subjects should eventually register into `governed_subjects` (Schema Design Review Section 4/11) — not required for this migration, per Section 2.
- A purge-readiness marker column (Schema Design Review Section 11) — not included in this migration's field lists as scoped in Section 2 above; would require its own revision if a retention exception is ever approved.
- The integration-adapter reconciliation-contract feasibility question (Section 9) — the one open item in this list that is a technical-feasibility question rather than a policy decision, and is treated as a hard validation gate rather than a deferred design question for exactly that reason.

## 12. Explicit Out of Scope

- **No SQL** appears anywhere in this document.
- **No migration file** is created by this document.
- **No implementation claims** are made — every capability described is prospective, gated on the validation evidence named in Section 9, not asserted to exist.
- **No compensation entity** is designed, sequenced, or created — explicitly excluded per Section 2.
- **No release authorization** — this document does not authorize migration execution, does not authorize implementation, and does not change any release status. COS-MVP-002 remains **Not Released**, and this document has no bearing on that decision either way.
- **No change to the Phase 7 → Phase 8 → Phase 9 sequencing** established by `COS_Next_Phase_Product_Roadmap.md` — this plan operates entirely within Phase 7's own already-established scope.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file.
- It does not modify any database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not itself authorize migration execution — Section 9's gates, including the Decision Record's still-pending ratification and the integration-adapter feasibility question, remain outstanding.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Plan](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Plan.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Technical Design](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — the authoritative source for ratification status referenced throughout Section 9
- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Specification](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Specification.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Schema Design Review](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Schema_Design_Review.md) — the schema this plan sequences into a migration
- [COS-MVP-003 Phase 7.1 Approval Primitive Migration Design Plan](COS-MVP-003_Phase_7.1_Approval_Primitive_Migration_Design_Plan.md) — the precedent this document's shape and sequencing method follow
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md)
- [Control Center Specification](Control_Center_Specification.md)
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 9 references

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial migration design plan for Execution Safety Foundations: objectives, boundaries (included/excluded, explicitly excluding the provisional compensation entity), an additive-only strategy noting this migration has no existing execution behavior to preserve compatibility with, a five-step migration sequence (new structures, security model, validation, integration adapter extension, compatibility checks), entity introduction considerations, security/RLS migration considerations, a compatibility strategy, a planning-level rollback strategy, validation gates including a technical-feasibility gate for integration-adapter reconciliation, relationship to the Shared Approval/Evidence Primitive/Agent Registry/Tool Registry/Workflow Engine (no migration-level dependency on any), consolidated open migration decisions, and explicit exclusions. No SQL, no migration, no implementation. |
