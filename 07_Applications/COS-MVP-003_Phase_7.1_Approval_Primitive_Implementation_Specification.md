# COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.0
**Document owner:** Architecture Owner and Data Owner
**Status:** Implementation Specification — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — specification document, no capability exists to release yet

## Purpose

This specification translates the approved design direction from `COS-MVP-003_Phase_7_Implementation_Plan.md`, `..._Technical_Design.md` (including its Architectural Constraints), and `..._Decision_Record.md` into a concrete implementation specification — precise enough to build from, but stopping short of the build itself. **No migration is created, no SQL is written, no application source file is modified, and no release status changes.** This is the last planning artifact before implementation; it does not itself authorize implementation to begin, and it inherits the Decision Record's own status — the five decisions it builds on remain "pending accountable-owner ratification," not finalized by this document.

## 1. Implementation Objectives

Deliver a working, live-validated Shared Approval/Evidence Primitive that:

- Generalizes the proven `document_workflow_evidence`/`document_approval_evidence`/`document_lifecycle_events` pattern to any governed subject, via the `governed_subjects` registry (Decision 1).
- Enforces every Architectural Constraint from the Technical Design as a database-level guarantee, not an application-level convention: no self-approval, evidence immutability, governed subject ownership resolution, mandatory version context, explicit human authority boundaries.
- Implements the seven-state lifecycle model and its transition graph exactly as specified.
- Does so **without altering the behavior, data, or availability of the existing, already-shipped document approval pattern** — the new primitive is additive, not a replacement, for the duration of this phase.
- Produces its own live-executed validation record, matching the Phase 6.4 evidentiary standard, before it is considered complete or before any Phase 7 consumer (Agent Registry, Tool Registry) begins relying on it.

## 2. Database Implementation Plan

Described conceptually — no SQL, no `CREATE TABLE` statements, no migration content.

### Required entities/concepts

- **`governed_subjects` (registry)** — one row per governed entity (document, and later agent, tool, workflow, ...), carrying at minimum the subject's identity, its type, and its workspace. This is the single indirection point Decision 1 established; every other entity below references it rather than referencing individual subject tables directly.
- **Workflow evidence (generalized)** — the generalized form of `document_workflow_evidence`: binds a governed process's state to an exact subject and version, recording who initiated and (if applicable) who completed it.
- **Approval evidence (generalized)** — the generalized form of `document_approval_evidence`: binds an explicit approve/reject/abstain decision to a specific workflow-evidence record, subject, and version, with a required, non-trivial acceptance statement.
- **Lifecycle events (generalized, append-only)** — the generalized form of `document_lifecycle_events`: one row per state transition (per the seven-state graph), referencing the workflow evidence, approval evidence (where applicable), and the actor and reason.
- **A small function family** — the generalized equivalent of `transition_document_lifecycle`: the only path by which any of the above tables may be written, `SECURITY DEFINER`, in the `creator_os_private` schema pattern already established.

### Relationships

`governed_subjects` is the root every other entity references. Workflow evidence references a `governed_subjects` row (and, per Decision 3 in the Technical Design, an opaque `subject_version_id` whose meaning it does not need to understand). Approval evidence references a specific workflow-evidence record and repeats the subject/version binding for its own integrity check. Lifecycle events reference whichever of the above produced the transition, plus the actor and reason — mirroring the existing document pattern's shape exactly, generalized only in what it points to.

### Lifecycle storage requirements

A state field (or equivalent) on the subject's own evidence trail reflecting one of the seven states from the Technical Design, plus the append-only lifecycle-events table as the authoritative history of how a subject's evidence reached that state. The two system-driven transitions (`→ expired`, version-change-triggered `→ superseded`) need a defined evaluation point — this specification recommends **lazy evaluation** (checked at the moment of the next read or write attempt against a given evidence record, not a scheduled background job), consistent with "Workflow execution" and any scheduling/automation runtime being explicitly out of scope for this phase.

### Version/evidence relationships

Per Decision Record Decision 1 and the Technical Design's Section 3 recommendation: the bound version is an opaque identifier at the shared-primitive level. The shared tables do not validate what a "version" means for a given subject type — that validation is the responsibility of each subject-specific governed-mutation function, exactly as `transition_document_lifecycle` already validates `document_version_id` against `documents.current_version_id` itself, without any generalized table needing to understand documents specifically.

### Governed subject model implementation considerations

- Every future subject-creation path (Agent Registry, Tool Registry, and beyond) must insert into `governed_subjects` in the *same transaction* as its own row creation — a mandatory contract, not an optional convenience, per Decision 1.
- The workspace scoping already used throughout this project should be inherited onto the `governed_subjects` row at insertion time from the subject's own workspace, so it becomes the single source RLS on the generalized evidence tables reads from, rather than requiring a join out to N different subject tables.
- **Provenance verification is explicitly out of this primitive's scope.** The document pattern separately verifies `document_provenance` (a git-commit-based trust model specific to documents) before allowing a transition — this is a document-specific concept, not a generalizable one, since agents and tools have no equivalent "commit SHA." Each subject type's own governed-mutation function remains responsible for whatever provenance or source-of-truth verification makes sense for it, entirely separately from this shared primitive, exactly as it already is for documents today.
- **Migrating existing document evidence onto the generalized tables is explicitly not part of this phase's database work.** The existing document-specific tables and function are left untouched; the generalized tables are additive. Whether documents are ever migrated onto the shared primitive is a separate, later decision — not an automatic consequence of building it.

## 3. Security Implementation Plan

- **Workspace isolation.** The proven three-tier RLS model (active member / non-member / anonymous) applies to every new table, with workspace scope resolved through `governed_subjects` rather than duplicated per table.
- **Ownership enforcement.** No evidence or event row may exist without resolving to exactly one workspace via `governed_subjects`, per the Architectural Constraint on governed subject ownership resolution — enforced as a `NOT NULL` foreign-key relationship, not an application-level check.
- **Requester/approver separation.** Enforced inside the shared decision-recording function itself: the identity recorded as deciding must not equal the identity recorded as requesting, for the same evidence record — a database-level check, not merely an application-level convention, per the Architectural Constraint on self-approval.
- **RLS requirements.** No application role ever receives a direct `INSERT`, `UPDATE`, or `DELETE` grant on any of the new tables — all writes happen exclusively through the `SECURITY DEFINER` function family, mirroring the document pattern's grant structure exactly (revoke first, grant only what's needed, write path is the function alone).
- **Permission boundaries.** Baseline: active workspace `owner`/`administrator` may request or decide, per Decision Record Decision 2's overlay model. Subject-specific functions may add stricter role requirements on top (e.g., Security Owner for certain Tool Registry actions) without the shared primitive needing to encode subject-specific role names itself. Revocation specifically requires a stricter role than the original approval, per Decision Record Decision 5, with the System Owner role as an explicit fallback so revocation is never structurally blocked.

## 4. Service/API Layer Requirements

Described as flows, not as code — the actual client-service module (mirroring the existing `documentRegistryService.js` pattern: validated input, RPC-only mutation, no direct table access) is implementation work, not specified line-by-line here.

### Approval request flow

A subject-specific service (not yet built — Agent Registry, Tool Registry) calls a shared "request approval" entry point, supplying the subject reference, the version being requested, and any subject-specific scope/conditions metadata (per Decision Record Decision 3's expiry model, optionally including a requested expiry). The entry point validates the subject resolves via `governed_subjects`, creates the evidence record in `requested` state, and — if basic validation passes (subject exists, version reference is well-formed) — the record system-transitions to `pending` immediately, per the Technical Design's lifecycle graph.

### Approval decision flow

An eligible approver (meeting the baseline role, and any subject-specific stricter overlay role) calls a shared "decide" entry point against a `pending` record, supplying their decision and a required, non-trivial reason. The entry point re-verifies the approver's identity against the authenticated session, checks the approver is not the original requester, checks the applicable role requirement, and writes the approval-evidence row before transitioning the record to `approved` or `rejected`.

### Evidence recording flow

Every successful transition — system-driven or human-decided — writes exactly one append-only lifecycle-event row, referencing whichever evidence record produced it, the actor (a real identity for human-decided transitions, a system marker for automatic ones like expiry), and the reason. No transition is permitted to occur without a corresponding event row in the same operation.

### Lifecycle transition handling

A single governed function (or a small, tightly-scoped function family, following the same pattern as `transition_document_lifecycle`) is the only legal path to changing an evidence record's state, validating every transition against the Technical Design's explicit graph before allowing it — an illegal transition (e.g., attempting to move a `rejected` record to `approved`) must fail closed, not silently no-op.

## 5. Validation Plan

Following the Phase 6.4 evidentiary standard — live-executed evidence against a real database, not source-code review — for every item below.

- **Migration validation:** confirm the new schema applies cleanly with no ordering or dependency failures, and that grants/RLS/constraints exist exactly as specified, once migrations are actually written (a later phase, not this document).
- **RLS/security tests:** three-tier read tests (member/non-member/anonymous) for every new table; a direct-write-bypass-attempt test proving no application role can mutate any new table outside the governed function, mirroring Phase 6.4's Test I exactly.
- **Lifecycle tests:** every edge in the seven-state transition graph tested positive at least once; a representative sample of illegal transitions tested negative; the two system-driven transitions (`expired`, version-triggered `superseded`) tested specifically as automatic.
- **Self-approval prevention tests:** a dedicated, live-executed denial test for at least two different subject types once they exist, proving the requester/approver separation holds generally, not only for the first consumer it was built against.
- **Evidence integrity tests:** version-binding enforcement (a stale-version approval is rejected or auto-superseded), orphan prevention (no evidence record can reference a non-existent or cross-workspace `governed_subjects` row), and a regression test proving the generalized primitive's behavior for the document case is unchanged from COS-MVP-002's already-shipped, Phase 6.4-validated behavior.

## 6. Rollback and Recovery Considerations

### Migration rollback approach

Every migration in this work should be purely additive — new tables, new functions, new policies — with no `ALTER` of any existing document-specific table or function. This means rollback, if ever needed, is a clean drop of the new objects with zero risk to the already-shipped document capability, rather than a reversal of a destructive change. Each migration should remain small and independently revertible, consistent with how COS-MVP-002's own migrations were structured and committed one governed change at a time.

### Handling partial implementation

Implementation should proceed in small, independently validated slices — mirroring this project's own established discipline throughout COS-MVP-002 Phase 6 — rather than as one large, all-or-nothing change. No slice should be considered "done" or built upon until its own validation evidence exists; a partially-implemented primitive (e.g., tables exist but the governed function's self-approval check is unverified) must not be treated as available for a Phase 7 consumer to start integrating against.

### Preserving existing document approval behavior

The existing document-specific tables, function, RLS policies, and grants are not modified, touched, or deprecated as part of this work. The generalized primitive is proven correct *relative to* the document case via the regression test in Section 5, but the document case continues running on its own proven implementation throughout this phase. Migrating documents onto the shared primitive, if ever desired, is explicitly a separate future decision — not a default or implied outcome of Phase 7.1.

## 7. Implementation Sequence

Ordered steps, first migration through validation — a sequence for a future implementation phase to follow, not steps taken by this document:

1. Design and create the `governed_subjects` registry table, its RLS policies, and grants (additive only).
2. Design and create the generalized workflow-evidence, approval-evidence, and lifecycle-events tables, referencing `governed_subjects` (additive only, existing document tables untouched).
3. Implement the shared `SECURITY DEFINER` function family: request-approval, decide-approval, and the system-driven expiry/supersession checks, embedding every Architectural Constraint (self-approval denial, mandatory version context, subject ownership resolution) as enforced logic, not documentation.
4. Implement and apply RLS policies for the new tables, matching the three-tier model.
5. Execute the regression test proving parity with the existing, unmodified document behavior.
6. Execute the new lifecycle, self-approval, RLS, and evidence-integrity tests from Section 5, live, against a real database.
7. Produce a Phase 7.1 Validation Record from this executed evidence, following the Phase 6.4 record's structure, with an explicit Go/No-Go/Conditional statement for this primitive specifically — not a release decision for any larger capability.
8. Only after that validation record exists does Agent Registry or Tool Registry implementation work begin consuming this primitive — explicitly a later, separate phase of work, not part of this sequence.

## 8. Explicitly Out of Scope

Repeated from the Phase 7 Implementation Plan, unchanged, plus one addition specific to this specification:

- **Agent Runtime** — actually executing an agent against a real task. This specification only builds the approval/evidence mechanism a future Agent Execution Layer would consume.
- **Workflow Execution** — the Workflow Registry/Engine's orchestration, state machine, and run execution. Not implemented here.
- **Tool Execution** — actually invoking an external tool or integration. Not implemented here.
- **User-facing UI** — any client-visible approval interface. This is a database/service-layer specification only.
- **Migrating existing document evidence onto the generalized tables** — the document pattern remains on its own proven implementation for the duration of this phase, per Section 2 and Section 6 above.

## What This Document Does Not Do

- It does not create any database migration or write any SQL.
- It does not modify any application source file.
- It does not modify any database file.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not authorize implementation to begin — it specifies what implementation would look like, pending the same accountable-owner ratification the Decision Record itself is still pending.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md)
- [COS-MVP-003 Phase 7.1 Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md) — Architectural Constraints and lifecycle graph this specification implements
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — the five decisions this specification builds on
- [COS-MVP-002 Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md) — origin of the proven pattern being generalized
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 5 follows

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial implementation specification: objectives, database implementation plan (entities, relationships, lifecycle storage, version/evidence relationships, governed-subject considerations, explicit provenance and document-migration scope clarifications), security implementation plan, service/API flows, a five-part validation plan, rollback/recovery considerations, an eight-step implementation sequence, and explicit out-of-scope boundaries. No implementation performed. |
