# COS-MVP-003 Phase 7.1 Approval Primitive Schema Design Review

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.1
**Document owner:** Data Owner and Architecture Owner
**Status:** Schema Design Review — No Migration Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — design review document, no capability exists to release yet

## Purpose

This document defines and presents the proposed database schema for the Shared Approval/Evidence Primitive for review, ahead of any migration work. It follows `05_Database/Schema_Specification.md`'s own convention for describing a schema without SQL — table names and required domain fields, in prose and tables, not `CREATE TABLE` statements or column types. **No SQL is written, no migration is created, no application or database file is modified, and no release status changes.** This is a proposal for review; the naming, field lists, and design choices below are presented for the accountable owners to accept, amend, or reject before any migration is authored.

## 1. Schema Design Objectives

- Translate the Implementation Specification's conceptual entities into concrete, named tables and field lists precise enough for someone to write the actual migration from, without this document writing that migration itself.
- Every field list traces to a specific requirement already established in the Technical Design, the Decision Record, or the Implementation Specification — this document does not introduce new architectural decisions, only schema-level detail.
- Where a genuinely new schema-level question arises in the course of this detail work (as opposed to a question already answered by a prior document), it is recorded in Section 9, not resolved silently by whichever field list was easiest to write.

## 2. Proposed Entities

Four tables, generalizing the four proven document-pattern entities exactly, following `Schema_Specification.md`'s field-list convention.

### `governed_subjects`

**Purpose:** the single registry every governed entity (document, and later agent, tool, workflow) registers into — the indirection point that gives the evidence tables real foreign-key integrity without needing a column per subject type (Decision Record, Decision 1).

**Required domain fields:** `subject_id`, `subject_type`, `workspace_id`, `registered_at`.

**Key relationships:** referenced by all three tables below; itself has no dependency on any of them. Each row corresponds to exactly one row in some subject-specific table (a document, an agent, ...) — this table does not duplicate that data, only registers its existence, type, and workspace.

**Ownership/workspace boundaries:** `workspace_id` is captured at registration time from the subject's own already-established workspace (every subject-creation path already knows its workspace before this registry entry is written) and becomes the single source every downstream RLS policy reads from, rather than requiring a join to N different subject-specific tables.

### `approval_workflow_evidence`

**Purpose:** the generalized form of `document_workflow_evidence` — binds a governed process's state (started, review complete, approved, published, failed, cancelled) to an exact subject and version.

**Required domain fields:** `id`, `workspace_id`, `subject_id` (references `governed_subjects`), `subject_version_id` (opaque, per the Technical Design's Decision 4), `workflow_key`, `workflow_state`, `initiated_by`, `completed_by`, `evidence_ref`, `started_at`, `completed_at`, `created_at`.

**Key relationships:** references `governed_subjects`; referenced by `approval_decision_evidence` and `approval_lifecycle_events`.

**Ownership/workspace boundaries:** `workspace_id` denormalized directly onto this table (not derived only via a join to `governed_subjects`), matching the existing document pattern's convention exactly, validated at write time to match the referenced subject's actual workspace.

### `approval_decision_evidence`

**Purpose:** the generalized form of `document_approval_evidence` — binds an explicit approve/reject/abstain decision to a specific workflow-evidence record, subject, and version.

**Required domain fields:** `id`, `workspace_id`, `subject_id`, `subject_version_id`, `workflow_evidence_id`, `approver_user_id`, `authority_scope`, `decision`, `acceptance_statement`, `candidate_version_reference` (the generalized equivalent of the document pattern's `candidate_content_hash` — an opaque value the subject-specific function compares against the subject's own current state), `expires_at` (nullable, per Decision Record Decision 3), `action_boundary` (nullable), `conditions` (nullable), `decided_at`, `created_at`.

**Key relationships:** references `governed_subjects` and `approval_workflow_evidence`; referenced by `approval_lifecycle_events`.

**Ownership/workspace boundaries:** same denormalized `workspace_id` convention as above.

### `approval_lifecycle_events`

**Purpose:** the generalized, append-only form of `document_lifecycle_events` — one row per state transition, the authoritative history of how a subject's approval evidence reached its current state.

**Required domain fields:** `id`, `workspace_id`, `subject_id`, `subject_version_id`, `from_state`, `to_state`, `actor_user_id` (nullable — null for system-driven transitions), `workflow_evidence_id`, `approval_decision_evidence_id` (nullable — only populated for transitions a decision produced), `reason`, `occurred_at`.

**Key relationships:** references `governed_subjects`, `approval_workflow_evidence`, and `approval_decision_evidence`.

**Ownership/workspace boundaries:** same denormalized `workspace_id` convention; append-only, per Section 5.

**Deliberately excluded field:** a generalized `provenance_id`, present on `document_lifecycle_events` today. Per the Implementation Specification, provenance verification is explicitly out of this primitive's scope and remains subject-specific — carrying a generalized provenance reference here would contradict that boundary, so it is not included.

## 3. Governed Subject Model

- **How subjects are represented:** exactly one `governed_subjects` row per governed entity, keyed by `subject_id` with a `subject_type` discriminator and its `workspace_id`. No other table in this schema needs to know the internal structure of a document, an agent, or a tool — only that a row exists for it here.
- **How subject ownership is resolved:** every write to any of the three evidence tables validates its `subject_id` resolves to a `governed_subjects` row, and reads `workspace_id` from that row (or from the denormalized copy, kept consistent with it) rather than from the subject's own table — this is what gives RLS a single, uniform check across every future subject type.
- **How subject-specific validation integrates:** each subject type retains its own public-facing `SECURITY DEFINER` entry point (mirroring `transition_document_lifecycle` today), which performs whatever validation is specific to that subject — version currency, provenance, subject-specific role overlays — and only then delegates to the shared primitive's internal write logic for the evidence/lifecycle mechanics. The shared primitive never needs to know what makes an agent version or a tool permission valid; it only needs the subject-specific function to have already confirmed it.

## 4. Approval Lifecycle Storage

- **States:** the seven states from the Technical Design — `requested`, `pending`, `approved`, `rejected`, `expired`, `revoked`, `superseded` — carried as the current state on the relevant evidence record, not redefined here.
- **Transitions:** the same transition graph the Technical Design specifies, unchanged: `requested → pending` (system) or `→ superseded`; `pending → approved`/`rejected`/`expired` (system)/`superseded`; `approved → revoked` or `→ superseded`. `rejected`, `expired`, `revoked`, and `superseded` remain terminal.
- **Lifecycle event tracking:** every transition, without exception, writes exactly one `approval_lifecycle_events` row in the same operation that produced it — no transition is permitted to leave the evidence trail silent about how it happened.
- **Version binding:** `subject_version_id` is required (`NOT NULL`, per the Architectural Constraint on mandatory version context) on both `approval_workflow_evidence` and `approval_decision_evidence` — no evidence record of either kind may exist without one.

## 5. Evidence Storage Model

- **Immutable evidence records:** no application role receives `UPDATE` or `DELETE` on any of the three evidence/event tables — the only mutation path is the subject-specific `SECURITY DEFINER` function chain, and even that path only ever inserts new rows, mirroring the document pattern's grant structure exactly.
- **Approval decision evidence:** `approval_decision_evidence` is the record of an actual human (or explicitly authorized) decision — it is deliberately distinct from `approval_workflow_evidence` (which tracks process state, not a decision) so that "a workflow reached the review-complete state" and "a specific person approved it" remain separately auditable facts, matching the document pattern's existing separation.
- **Relationship to subjects and lifecycle events:** every evidence row traces back to exactly one `governed_subjects` row, and every state change traces forward to exactly one `approval_lifecycle_events` row — the three tables together form one continuous, append-only chain from "a subject exists" to "here is everything that ever happened to its approval state," for any subject type.

## 6. Security/RLS Design

- **Workspace isolation:** the proven three-tier model applies to all four tables — active workspace member (read, via row filter), non-member (denied via row filter), anonymous (denied at the grant layer entirely, no `SELECT` grant).
- **Requester/approver separation:** enforced inside the shared decision-writing function: the `approver_user_id` being recorded must not equal the `initiated_by`/requesting identity on the associated `approval_workflow_evidence` row — a database-level check, not an application-level convention, per the Architectural Constraint on self-approval.
- **Revocation authority boundaries:** the revocation path (an `approved → revoked` transition) requires a role check strictly separate from and stricter than the baseline approval role, per Decision Record Decision 5 — implemented as a distinct check inside whichever function handles that specific transition, not reachable via the same code path as an ordinary approval decision.
- **Service-role considerations:** because the recommended lazy-evaluation approach for `expired`/`superseded` transitions (Implementation Specification, Section 2) evaluates inside the same `SECURITY DEFINER` function any authenticated user already calls to read or write an evidence record, **no separate elevated service role is required** for system-driven transitions — the function's own definer privilege covers writing the system-driven transition at the moment it's detected, without needing a scheduled job running under broader credentials. This is a design simplification worth stating explicitly, not an assumption to leave implicit.

## 7. Migration Strategy

- **Additive approach:** every object in this schema is new — no `ALTER` of any existing document-specific table, function, policy, or grant. The document pattern's tables remain byte-for-byte as they are today.
- **Compatibility with existing document approval behavior:** the document pattern is not migrated onto this schema as part of this phase. Compatibility is proven via the regression test already specified in the Implementation Specification (Section 5) — confirming the *new* schema, exercised for a document-equivalent case, behaves identically to the *existing* document tables, without touching the existing tables to do so.
- **Rollback considerations:** because every change is additive, rollback is a clean drop of the four new tables and their associated functions/policies, with zero risk to any already-shipped capability. Migrations should still be authored as small, independently revertible units, consistent with how COS-MVP-002's own migrations were structured.

## 8. Validation Requirements Before Migration Approval

Gates that must be satisfied before any migration based on this schema is written, distinct from the post-implementation validation plan already specified:

- Explicit accountable-owner review and acceptance of this schema design specifically — not inferred from acceptance of the earlier, more conceptual Implementation Specification.
- Confirmation that every field list above satisfies each Architectural Constraint from the Technical Design (self-approval prevention, evidence immutability, governed subject ownership resolution, mandatory version context, explicit human authority boundaries) — a checklist review, not assumed from this document's own claims.
- Confirmation that the proposed table names (`governed_subjects`, `approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`) do not collide with any existing or separately-planned object — see Section 9's naming question below, which must be resolved first.
- Confirmation that the five decisions in the Decision Record have actually been ratified by their accountable owners — that document's own status remains "Pending Accountable-Owner Ratification" as of this writing, and migration should not begin while that remains true.

## 9. Open Schema Decisions Requiring Review

These are new questions this schema-level detail work surfaced, not previously addressed by any prior Phase 7.1 document:

- **Reconciliation/consolidation of the existing `approvals` table with this primitive.** `Schema_Specification.md` already specifies a planned `approvals` table (`subject_type, subject_id, approver_id, decision, reason, expires_at`) under "Identity and Governance," covering similar ground to this proposal's `approval_decision_evidence` without being identically named or shaped. The unresolved question is not merely a naming choice — it is whether the existing `approvals` table should **evolve into** this shared primitive (its planned shape absorbed into `approval_decision_evidence` as this design matures), be **replaced through a future migration** (the existing specification retired in favor of this one, with an explicit transition path), or **remain a separate, domain-specific implementation** that this primitive does not attempt to consolidate at all. Each has different implications for how much of `Schema_Specification.md` this work is actually allowed to supersede, and none is selected here — this needs an explicit reconciliation decision from the accountable owners, not a silent pick made by whichever document was written more recently.
- **`authority_role_at_decision`.** Whether `approval_decision_evidence` (and the revocation transition specifically) should record which qualifying role the actor held *at the moment* of their decision, beyond just their `user_id` — valuable for audit clarity if a person's role changes later, but not yet proposed as a field above and not decided by any prior document.
- **Structured vs. flexible `action_boundary`/`conditions` fields.** The Technical Design rejected JSONB broadly for evidence storage in favor of typed columns; whether these two specific, narrower, optional metadata fields warrant their own typed sub-structure or can remain simple text fields is not yet decided.
- **A purge-readiness marker.** Decision Record Decision 4 sets indefinite retention as the default with exceptions requiring separate approval — whether the schema should include a nullable marker column now (unused until an exception is ever approved) to avoid a later schema change, or add one only if and when an exception is actually approved, is not yet decided.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file.
- It does not modify any database file.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not itself approve this schema for migration — Section 8's gates, including the Decision Record's still-pending ratification, remain outstanding.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md)
- [COS-MVP-003 Phase 7.1 Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Specification.md)
- [Schema Specification](../05_Database/Schema_Specification.md) — the pre-existing `approvals` table entry this document's Section 9 flags for reconciliation
- [COS-MVP-002 Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md) — origin of the proven schema this design generalizes

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial schema design review: four proposed entities (`governed_subjects`, `approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`) with purpose/relationships/ownership boundaries, the governed subject model, lifecycle storage, evidence storage model, security/RLS design (including a service-role simplification from lazy evaluation), migration strategy, pre-migration validation gates, and four open schema decisions including a naming reconciliation question against the pre-existing `Schema_Specification.md` `approvals` table. No SQL written, no migration created. |
| 1.1 | Refined the `approvals`-table open decision in Section 9 to frame it explicitly as a reconciliation/consolidation decision — evolve the existing table into this primitive, replace it via a future migration, or keep it as a separate domain-specific implementation — without selecting an option. No other section modified, no SQL or migration created. |
