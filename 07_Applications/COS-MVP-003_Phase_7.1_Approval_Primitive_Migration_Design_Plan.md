# COS-MVP-003 Phase 7.1 Approval Primitive Migration Design Plan

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.0
**Document owner:** Data Owner and Architecture Owner
**Status:** Migration Design Plan — No Migration Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning document, no capability exists to release yet

## Purpose

This document translates the reviewed Schema Design Review into a migration *planning* artifact — the order of operations, boundaries, compatibility strategy, and gates a future migration would need to satisfy. **It is a plan, not a migration.** No SQL is written, no migration file is created, no database file is modified, and no implementation is claimed to exist. It inherits the same pending status as every document beneath it: the Decision Record's five decisions remain "pending accountable-owner ratification," and nothing here changes that.

## 1. Migration Objectives

**What capability this migration enables:** the physical existence of the Shared Approval/Evidence Primitive's schema — the `governed_subjects` registry and the three generalized evidence tables, their security model, and their governed-mutation function family — so that the Agent Registry and Tool Registry (the next Phase 7 work items, per the roadmap's dependency graph) have a governed approval mechanism to build against, rather than needing to invent their own.

**What existing behavior must remain unchanged:** every aspect of the document approval/lifecycle pattern — `document_workflow_evidence`, `document_approval_evidence`, `document_lifecycle_events`, `transition_document_lifecycle`, and their existing grants and RLS policies — must remain byte-for-byte as they are today, live-validated in Phase 6.4, unaltered by anything in this plan.

## 2. Migration Boundaries

**Included:**
- The `governed_subjects` registry table, its RLS policies, and its grants.
- The three generalized evidence tables (`approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`) from the Schema Design Review, their RLS policies, and their grants.
- The shared `SECURITY DEFINER` function family (request-approval, decide-approval, and the system-driven expiry/supersession checks), following the `creator_os_private` + thin `public` wrapper pattern already established.
- Supporting indexes for the query patterns the document pattern already demonstrates are needed (workspace/subject lookups, actor lookups, chronological ordering).

**Explicitly excluded:**
- Any `ALTER` of any existing document-specific table, function, policy, or grant.
- Any Agent Registry or Tool Registry table — those are separate Phase 7 work items that would *consume* this primitive once it exists, not part of building the primitive itself.
- Any client-facing application or service-layer code — this plan concerns database schema only.
- Migrating any existing document data onto the new generalized tables.
- Resolving the `approvals`-table reconciliation question (Section 4) — this migration neither adopts, replaces, nor renames anything to match the pre-existing `Schema_Specification.md` entry; that question stays open regardless of whether this migration proceeds.

## 3. Proposed Migration Sequence

Order of operations only — no SQL.

1. **New structures.** `governed_subjects` first, since every other table depends on it. Then `approval_workflow_evidence`, `approval_decision_evidence`, and `approval_lifecycle_events`, in that order, matching their dependency chain from the Schema Design Review.
2. **Security model.** Revoke-all-first on every new table (matching the document pattern's convention exactly), then grant only what's needed (`SELECT`, and `INSERT` solely for the governed function family, never for application roles directly), then apply the three-tier RLS policies, then implement the `SECURITY DEFINER` function family in `creator_os_private` with thin `SECURITY INVOKER` wrappers in `public`.
3. **Validation.** Apply the migration to a live or staging environment and execute the validation plan already specified in the Implementation Specification (Section 5) and the pre-migration gates in the Schema Design Review (Section 8) — live-executed evidence, not source review, per the Phase 6.4 standard.
4. **Compatibility checks.** Execute the regression test proving the document-equivalent case behaves identically through the new schema to how it behaves today; confirm no existing grant, policy, or function was altered; confirm a live security-advisor scan (mirroring Phase 6.4's methodology) shows no new findings against any existing document table.

## 4. Existing Approvals Table Reconciliation

Carried forward from the Schema Design Review's Section 9, unresolved here as there — this plan does not select an option:

- **Evolve** the existing `Schema_Specification.md` `approvals` table into this shared primitive.
- **Replace** it through a future migration, retiring the existing specification in favor of this one.
- **Retain** it as a separate, domain-specific implementation this primitive does not attempt to consolidate.

**This migration plan does not require that question to be resolved before the four tables in Section 2 are built.** None of the three options is foreclosed by building `governed_subjects` and the three generalized evidence tables now — "evolve" and "retain separate" are both compatible with proceeding, and "replace" would apply to a distinct, future migration event regardless of when this one happens. The question **does** need resolution before any work that would touch the `approvals` entry in `Schema_Specification.md` itself, which is explicitly out of this migration's boundaries per Section 2.

## 5. Document Approval Compatibility Strategy

Identical in substance to the Schema Design Review's Section 7, restated at the migration-planning level: every new object is additive. No existing document table, function, policy, or grant is touched. Compatibility is demonstrated, not assumed — via a live regression test confirming the new schema, exercised for a document-equivalent case, produces identical results to the existing, untouched document tables. Documents continue running on their own proven implementation indefinitely; migrating them onto the shared primitive remains a separate, later decision this plan does not make or imply.

## 6. Security Migration Considerations

- **RLS.** The three-tier model (active member / non-member / anonymous) applied identically across all four new tables, matching the Phase 6.4-proven pattern.
- **Permissions.** Revoke-first on every new table; grant only `SELECT` broadly to `authenticated` (subject to RLS) and `INSERT` only insofar as it flows through the governed function family — no application role receives a direct write grant on any new table, matching the document pattern exactly.
- **Ownership boundaries.** Every row's `workspace_id` resolves through (and is validated against) `governed_subjects` at write time — no evidence row can exist without a workspace-bound subject.
- **Least privilege.** The actual mutation logic lives in `creator_os_private`, unreachable by any application role directly; only the thin `public` wrapper functions are callable, mirroring the existing convention. Per the Schema Design Review's finding, no separate elevated service role is required for system-driven transitions — the lazy-evaluation approach means those transitions execute inside the same definer-rights function an ordinary authenticated call already invokes.
- **Self-approval prevention.** Enforced inside the decide-approval function itself as a database-level check (approver identity ≠ requester identity for the same record) — not an application-level convention, and specifically required to be proven via a live, dedicated denial test before this migration's validation is considered complete.

## 7. Validation Gates Before Implementation Approval

Required evidence before migration execution is authorized — not before this planning document is accepted:

- All five Decision Record decisions explicitly ratified by their accountable owners (Security Owner, Data Owner, Architecture Owner as applicable) — the Decision Record's own status remains "Pending Accountable-Owner Ratification" as of this writing, and that must change before migration execution, not merely before this plan.
- The Schema Design Review's Section 8 gates satisfied: field lists checked against every Architectural Constraint, no naming collision left unresolved for anything this migration actually touches (the `approvals`-table question specifically does *not* block this migration per Section 4 above, but any *other* naming conflict would).
- The full validation plan from the Implementation Specification executed live, with evidence — RLS/security tests, lifecycle transition tests (every edge of the seven-state graph), self-approval prevention tests for at least two subject types once they exist, and evidence-integrity tests.
- The document-compatibility regression test executed live and passing, per Section 5.
- Zero residual test data or fixtures left behind from validation execution — mirroring the "confirm zero leaked fixtures" standard Phase 6.4 already established for this exact class of work.

## 8. Rollback Strategy

Planning-level only — no SQL, no specific migration-file rollback script.

Because every object in this migration is additive (Section 2), rollback is structurally simple: dropping the four new tables and their associated functions and policies removes the entire change with zero risk to any existing, already-shipped capability, since nothing existing was ever altered. Risk is further bounded by the fact that no consumer (Agent Registry, Tool Registry) exists yet to depend on this schema at the time it would first be applied — rollback before any such consumer is built carries no downstream breakage risk. The only rollback-relevant residue to manage is validation-test data itself, which should be produced inside rolled-back transactions during testing wherever possible, consistent with Phase 6.4's own methodology, so that a rollback (if ever needed) has nothing real to clean up.

## 9. Open Decisions Requiring Owner Approval

Consolidated from every prior Phase 7.1 document, not newly introduced here:

- The five Decision Record decisions (governed subject acceptance, approval role model, expiry/revalidation behavior, evidence retention strategy, revocation authority model) — recommended, not yet ratified.
- The `approvals`-table reconciliation question (Section 4 above) — does not block this migration, but remains unresolved and will need an answer before any related future work.
- Whether `authority_role_at_decision` should be captured on approval/revocation records (Schema Design Review, Section 9).
- Whether `action_boundary`/`conditions` should be structured or simple text fields (Schema Design Review, Section 9).
- Whether a purge-readiness marker column should be included now or added only if a retention exception is ever approved (Schema Design Review, Section 9).

## 10. Explicit Exclusions

- **No SQL** appears anywhere in this document.
- **No migration file** is created by this document.
- **No implementation claims** are made — every capability described is prospective, gated on the validation evidence named in Section 7, not asserted to exist.
- **No release authorization** — this document does not authorize migration execution, does not authorize implementation, and does not change any release status. COS-MVP-002 remains **Not Released**, and this document has no bearing on that decision either way.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file.
- It does not modify any database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not itself authorize migration execution — Section 7's gates, including the Decision Record's still-pending ratification, remain outstanding.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md)
- [COS-MVP-003 Phase 7.1 Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Specification.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Schema Design Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Schema_Design_Review.md) — the schema this plan sequences into a migration
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 7 references

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial migration design plan: objectives, boundaries (included/excluded), a four-step migration sequence (new structures, security model, validation, compatibility checks), the carried-forward `approvals`-table reconciliation question left unresolved, a document-compatibility strategy, security migration considerations, validation gates before implementation approval, a planning-level rollback strategy, consolidated open decisions, and explicit exclusions. No SQL, no migration, no implementation. |
