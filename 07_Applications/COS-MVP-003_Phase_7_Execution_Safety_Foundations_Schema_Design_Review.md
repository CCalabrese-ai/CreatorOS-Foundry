# COS-MVP-003 Phase 7 Execution Safety Foundations Schema Design Review

**Phase:** 7 — Foundation
**Version:** 1.1
**Document owner:** Data Owner and Architecture Owner
**Status:** Schema Design Review — No Migration Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — design review document, no capability exists to release yet

## Purpose

This document defines and presents proposed database schema requirements for Execution Safety Foundations for review, ahead of any migration planning. It follows `05_Database/Schema_Specification.md`'s own convention for describing a schema without SQL — entity names and required domain fields in prose, not `CREATE TABLE` statements or column types — the same convention the Phase 7.1 Schema Design Review used. **No SQL is written, no migration is created, no application or database file is modified, no table is claimed to exist, and no release status changes.** This is a proposal for review; every field list below is presented for the accountable owners to accept, amend, or reject before any migration is authored.

**Alignment note (v1.1):** this document was originally written while the compensation-evidence storage question (Decision Record Decision 3) remained explicitly deferred. That question has since been resolved — dedicated `compensation_evidence` storage, Approved with Conditions, per `COS-MVP-003_Phase_7_Decision_Ratification_Record.md` and `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`. This revision updates every location in this document that assumed the storage question was still open, to reflect that resolution. **It does not reopen, re-decide, or alter the D08 outcome itself, any other Phase 7 decision, or any ratification record — it brings this document's own content into alignment with a decision already made elsewhere.**

## Maintaining the Distinction

- **Designed ≠ implemented.** Nothing named below exists in `supabase/migrations/` or the live database. This document proposes what a future migration would create.
- **Schema design ≠ migration.** This is entity/field-list detail work, not sequencing, DDL, or a migration plan — that is the next document in the Implementation Plan's Section 6 sequence, not this one.
- **Recommendation ≠ approval.** Every field list, relationship, and lifecycle requirement below is a recommendation for review. `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md` remains "Decisions Recorded — Pending Accountable-Owner Ratification," and this document's use of those decisions as design inputs does not change that status.

## 1. Objectives

- Translate the Implementation Specification's conceptual components into concrete, named entities and field lists precise enough for a future migration to be written from, without this document writing that migration.
- Every field list traces to a specific requirement already established in the Technical Design, the Decision Record, or the Implementation Specification — this document does not introduce new architectural decisions, only schema-level detail.
- Where a genuinely new schema-level question arises in the course of this detail work, it is recorded in Section 11, not resolved silently by whichever field list was easiest to write — mirroring exactly how the Phase 7.1 Schema Design Review handled its own Section 9.

## 2. Existing Architecture Sources

| Source | What it contributes | Status |
| --- | --- | --- |
| `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md` | The five core-architecture components (incident model, execution audit trail, recovery/rollback, compensation, checkpoint/idempotency), the run-lifecycle transition graph, and the recommended incident lifecycle this document's entities generalize. | Design document, no implementation |
| `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md` | Seven decisions (incident lifecycle, recovery authority, compensation authority, checkpoint/idempotency responsibility, audit trail ownership, primitive relationship, emergency authority) this document's field lists must satisfy. | Pending accountable-owner ratification |
| `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Specification.md` | The service/component responsibilities and data model requirements this document makes concrete. | Specification document, no implementation |
| `Workflow_Design_Standards.md` | The idempotency-key formula, Compensation model requirements, and Recovery contract field this document's checkpoint/recovery entities implement. | Proposed, not implemented |
| `Automation_Architecture.md` | The nine-state run model, Failure and Recovery principles, and Observability/Cost alerting requirements. | Proposed, not implemented |
| `Workflow_Registry.md` | WF-010 Incident Response's outcome description ("Containment, evidence, recovery, and review"), the basis for the incident entity's field list. | Registered, not active |
| `Control_Center_Specification.md` | The Incident and Recovery Experience's requirement for timeline, owner, and evidence visibility — a constraint on what the incident entity must be able to answer, not a schema itself. | Specified, not implemented |

## 3. Proposed Entities

Five entities, generalizing the five capability components from the Implementation Specification, following `Schema_Specification.md`'s field-list convention.

### Incident model

**Purpose:** the governed record of an incident from detection through review, implementing Decision Record Decision 1's recommended seven-state lifecycle.

**Required domain fields:** `incident_id`, `workspace_id`, `severity`, `category`, `status` (one of `detected`, `triaged`, `containing`, `contained`, `recovering`, `resolved`, `reviewed`), `owner_id`, `detected_at`, `resolved_at`, `reviewed_at`, `subject_reference` (the run(s) or resource(s) the incident concerns), `is_emergency` (per Decision Record Decision 7).

**Key relationships:** references the run(s) it concerns; referenced by the execution audit trail for its own transition history.

**Ownership/workspace boundaries:** `workspace_id` captured at creation from the referenced run's or resource's own workspace, the same convention every governed table in this repository already uses.

### Execution audit events

**Purpose:** the generalized, append-only record of every state transition across runs, run steps, and incidents — the actual "execution audit trail" distinct from ordinary observability, implementing Decision Record Decision 5.

**Required domain fields:** `event_id`, `workspace_id`, `subject_reference` (the run, run step, or incident the event concerns), `from_state`, `to_state`, `actor_user_id` (nullable — null for system-driven transitions such as automatic `Quarantined` entry), `reason`, `occurred_at`.

**Key relationships:** references whichever of `runs`, `run_steps`, or `incidents` produced the transition; written only by the governed transition function responsible for that entity, in the same operation.

**Ownership/workspace boundaries:** same workspace-scoping convention; append-only, per Section 6.

### Checkpoints/idempotency records

**Purpose:** implements Decision Record Decision 4's hybrid model — a default-derived idempotency key with an explicit override path, and a checkpoint pointer marking the last successfully completed step.

**Design question this entity raises:** whether checkpoint/idempotency data is carried as fields directly on `runs`/`run_steps` (Option A) or as a separate, dedicated entity decoupled from those tables (Option B).

- **Option A — embedded fields.** `runs` carries a `checkpoint_run_step_id` (the last successfully completed step). `run_steps` carries an `idempotency_key` (default-derived or overridden, per Decision 4) with a uniqueness constraint scoped to the standard tuple (workflow, version, workspace, trigger, governed resource) or its override.
- **Option B — dedicated entity.** A separate `idempotency_records` entity: `record_id`, `workspace_id`, `idempotency_key`, `run_step_id`, `recorded_at`, decoupled from `run_steps` itself, enabling a lookup by key alone before a `run_steps` row may even exist for a retried trigger.

**Recommendation: Option A** as the primary mechanism, since it requires no additional join for the common case and keeps the checkpoint/idempotency data co-located with the record it describes, consistent with how `document_approval_evidence` carries its own `candidate_content_hash` directly rather than via a separate lookup table. **Option B is presented as an open question, not foreclosed** — a retried trigger that arrives before any `run_steps` row exists for it (a genuine edge case the Technical Design did not explicitly address) may require exactly the kind of key-first lookup Option B provides. Recorded as an open schema decision in Section 11, not resolved here.

**Ownership/workspace boundaries:** whichever option is chosen, `workspace_id` scoping applies identically.

### Recovery actions

**Purpose:** the governed record of a recovery-authorization decision, implementing Decision Record Decision 2 — every attempt to move a `Quarantined` or `Failed` run toward resumption, whether approved or denied, is evidenced here.

**Required domain fields:** `recovery_action_id`, `workspace_id`, `run_id`, `actor_user_id`, `decision` (`approved`/`denied`), `reconciliation_outcome` (the reconciliation-contract result — `confirmed-succeeded`, `confirmed-failed`, or `unknown` — that was in effect at decision time, per the Technical Design Section 3), `is_emergency`, `review_due_at` (nullable, populated only for emergency-path decisions per Decision Record Decision 7), `reason`, `decided_at`.

**Key relationships:** references the `run` being recovered; referenced by the execution audit trail for the resulting state transition, if the decision is `approved`.

**Ownership/workspace boundaries:** `workspace_id` denormalized from the referenced run, matching the document pattern's convention.

### Compensation evidence

**Purpose:** the governed record of a compensation action and its authorization, implementing Decision Record Decision 3's authority conclusion.

**Design status: resolved.** Decision Record Decision 3 originally declined to choose between a dedicated compensation-evidence table and reuse of the Shared Approval/Evidence Primitive's own tables, pending that primitive's ratification. Following ratification of D01–D05 (`COS-MVP-003_Phase_7_Decision_Ratification_Record.md`), the storage question was reassessed and resolved: **dedicated `compensation_evidence` storage**, not reuse of the primitive's tables. The reassessment found direct reuse an imperfect fit — `approval_decision_evidence`'s `subject_version_id` binding assumes a versioning concept that does not map cleanly onto a run, and compensation's actual data needs have no equivalent typed columns in the primitive's ratified schema, whose own Technical Design explicitly rejected JSONB-style generic fields in favor of typed columns. A dedicated table avoids extending the already-ratified primitive and avoids weakening its typed-column discipline, consistent with this repository's existing precedent of domain-specific evidence tables (the document pattern, `audit.events`) rather than one universal table. This resolution is recorded, with its two conditions, in the Phase 7 Decision Ratification Record and Tracker; it is restated here as a design input, not re-decided by this document.

**Conditions attached to this resolution (binding, not optional):**
1. This entity must follow the exact governance/security conventions already established for every other table in this schema: revoke-first grants, three-tier RLS, `SECURITY DEFINER` implementation in `creator_os_private`, a thin `public` wrapper, and no direct application-role writes.
2. A future migration or consolidation into the Shared Approval/Evidence Primitive remains possible if that primitive is later extended with the structured fields compensation evidence requires — this dedicated table is not represented as a permanent, unrevisitable choice.

**Required domain fields:** `compensation_evidence_id`, `workspace_id`, `run_id`, `actor_user_id`, `precondition_verified` (boolean, recording that the stated precondition was checked, per `Workflow_Design_Standards.md`), `is_irreversible_limit` (boolean, per the same source's "irreversible limits" category), `authority_role_at_decision`, `system_owner_signoff_id` (nullable — populated only when `is_irreversible_limit` is true, per Decision Record Decision 3's authority conclusion), `is_emergency`, `decided_at`, `reason`.

**Key relationships:** references the `run` being compensated.

## 4. Relationships and Ownership

- Every entity in Section 3 is `workspace_id`-scoped, with no cross-workspace reference structurally possible, matching the convention already proven for documents.
- `runs`/`run_steps` (already specified in `Schema_Specification.md`, generalized further by the Technical Design's Section 3) are the anchor every other entity in this document references — incidents, recovery actions, and compensation evidence all trace back to a specific run.
- The execution audit events entity references whichever entity produced the transition (`runs`, `run_steps`, or `incidents`) through a single `subject_reference`, deliberately mirroring the Shared Approval/Evidence Primitive's own `governed_subjects` indirection pattern in spirit — though, per Decision Record Decision 6, this document does **not** propose registering these subjects into `governed_subjects` itself, since that registry does not yet exist in ratified form. If the Shared Approval/Evidence Primitive is eventually ratified and implemented, a future schema revision could evaluate whether execution-safety subjects should register there too — not decided here.

## 5. Lifecycle/State Requirements

- **Run lifecycle:** the nine states already specified in `Automation_Architecture.md`, with the explicit transition graph the Technical Design Section 4 made concrete, carried unchanged into this schema's `runs.current_state` field (Section 3, Checkpoints/idempotency records — recommendation A, embedded).
- **Incident lifecycle:** the seven-state model from Decision Record Decision 1, carried as `incidents.status`, with the `reopened` transition explicitly permitted back to `triaged` from `resolved`.
- **Recovery actions and compensation evidence are not themselves stateful entities** — each row is a point-in-time decision record (approved/denied, or executed), not a multi-state lifecycle of its own, distinguishing them from `incidents` and `runs`. This mirrors how `document_approval_evidence` records a decision without itself having a lifecycle separate from the document it concerns.
- **Every lifecycle transition, without exception, writes exactly one execution-audit-event row** in the same operation that produced it — no transition may leave the audit trail silent about how it happened, matching the Implementation Specification's Section 7 requirement.

## 6. Evidence and Immutability Requirements

- **No application role receives `UPDATE` or `DELETE`** on execution audit events, recovery actions, or compensation evidence — the only mutation path is the governed function chain named in the Implementation Specification's Section 5, and even that path only ever inserts new rows.
- **`incidents` and `runs` are the two entities in this schema that are legitimately mutable** (their `status`/`current_state` fields change over time) — but only through their respective governed-transition functions, never a direct application-role write, and every such mutation must produce a corresponding audit-event row per Section 5.
- **Retention:** indefinite by default, per Decision Record Decision 5, mirroring the `audit.events` precedent already established in `Schema_Specification.md` and the Phase 7.1 Decision Record's own retention decision. Any shorter retention requires its own future Data Owner/Security Owner-approved exception — not proposed by this document.

## 7. Security/RLS Considerations

- **Three-tier RLS, applied identically across all entities in Section 3:** active workspace member (read, row-filtered), non-member (denied via row filter), anonymous (denied at the grant layer, no `SELECT` grant at all) — the exact pattern proven live for documents in Phase 6.4.
- **No self-compensation or self-unquarantine**, enforced at the database level inside the recovery-authorization and compensation-authorization functions: the actor recorded on a `recovery_actions` or `compensation_evidence` row must not be the same identity whose action caused the run's `Failed`/`Quarantined` state, per the Technical Design Section 6's extension of the Phase 7.1 self-approval constraint.
- **Role-overlay enforcement at the function level, not a configurable table** — consistent with the same overlay-model precedent the Phase 7.1 Decision Record established for approvals: the recovery-authorization function embeds its own baseline-plus-Security-Owner-overlay check (Decision Record Decision 2) rather than consulting a generic policy table.
- **Emergency-path fields (`is_emergency`, `review_due_at`)** do not relax any role check — they add an additional, mandatory follow-up obligation on top of the ordinary role check, per Decision Record Decision 7. No entity in this schema treats "emergency" as a lower-scrutiny path.

## 8. Relationship to Other Capabilities

- **Shared Approval/Evidence Primitive.** Bounded exactly as Decision Record Decision 6 established: no schema-level dependency for any of the five entities in Section 3, including compensation evidence — its storage decision (dedicated table, not primitive reuse) is now resolved, per the D08 ratification, so no entity in this schema depends on the primitive's tables. No entity proposed here registers into `governed_subjects`.
- **Agent Registry.** No schema-level relationship proposed in this document. Per the Technical Design Section 8, the relationship is downstream: once the Agent Execution Layer (Phase 8) exists, an agent's failed action would populate `runs`/`incidents` the same way any other execution would, but nothing in this schema references the Agent Registry's own tables directly.
- **Tool Registry.** Same relationship as the Agent Registry — no direct schema reference. A T3/T4 tool action gone wrong would surface through the same `runs`/`incidents`/`recovery_actions` schema, not through a Tool-Registry-specific table.
- **Workflow Engine.** The direct, primary future consumer — per the Roadmap, the Workflow Engine's orchestrator would read and write `runs`/`run_steps` for every run it manages. This document proposes the schema that consumer would use; it does not design the Workflow Engine itself.

## 9. Migration Considerations

Planning-level only — no SQL, no migration file.

- **Additive approach.** Every entity in Section 3 is new. No existing table — including the `incidents`, `runs`, `run_steps` field lists already present in `Schema_Specification.md`'s prose contract — has ever been migrated into application code, so there is no existing execution-related table for this schema to alter.
- **No impact on already-shipped capabilities.** System Registry and Documentation Registry's tables, functions, policies, and grants are untouched by anything in this document — no capability shipped so far performs multi-step execution, so nothing here has an existing behavior to preserve compatibility with, unlike the Shared Approval/Evidence Primitive's own document-compatibility requirement.
- **Rollback would be a clean drop.** Because every object is additive and no consumer (Workflow Engine, Agent Execution Layer) exists yet to depend on this schema, a future migration's rollback carries zero risk to any shipped capability — consistent with how the Phase 7.1 Migration Design Plan treated the same question.

## 10. Validation Requirements

Restated from the Implementation Specification Section 8, at the schema-design level — gates a future Migration Design Plan and Implementation Readiness Review would need to satisfy, not evidence that exists today:

- Confirmation that every field list above satisfies each requirement named in the Technical Design's Sections 3–7 and the Decision Record's seven decisions — a checklist review, not assumed from this document's own claims.
- Confirmation that the proposed entity names (`incidents`, `execution_lifecycle_events` or equivalent, `recovery_actions`, and `compensation_evidence`) do not collide with any existing or separately-planned object, including the already-specified `incidents`/`runs`/`run_steps` entries in `Schema_Specification.md` itself, which this document generalizes rather than duplicates.
- Confirmation that the Decision Record's seven decisions have been ratified by their accountable owners — that record's own status remains "Pending Accountable-Owner Ratification" as of this writing, and migration planning should not proceed to a Migration Design Plan while that remains true, mirroring the identical gate the Phase 7.1 Migration Design Plan's own Section 7 established.
- Live-executed evidence, once implementation begins, for every item named in the Implementation Specification's Section 8 (quarantine, reconciliation, compensation, idempotency, self-compensation-denial, RLS, and end-to-end recovery tests).

## 11. Open Schema Decisions

These are new questions this schema-level detail work surfaced, or explicit carry-forwards from prior documents. One item previously listed here — compensation storage — has since been resolved and is recorded below for traceability rather than silently removed; the remainder are not resolved by this document:

- **Resolved since this document was first written: compensation evidence storage.** Previously listed here as "dedicated entity vs. Shared Approval/Evidence Primitive reuse, gated on that primitive's own ratification." Now resolved — dedicated `compensation_evidence` storage, per the D08 ratification recorded in `COS-MVP-003_Phase_7_Decision_Ratification_Record.md` and `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`. See Section 3's Compensation evidence entity for the resolution and its two conditions.
- **Checkpoints/idempotency: embedded fields (Option A, recommended) vs. a dedicated `idempotency_records` entity (Option B)** — Section 3 flags a genuine edge case (a retried trigger arriving before any corresponding `run_steps` row exists) that Option A alone may not cleanly handle; not resolved by this document.
- **Whether `authority_role_at_decision` should be captured on `recovery_actions` as well as `compensation_evidence`** — this field is now settled as part of `compensation_evidence`'s resolved field list (Section 3). Whether `recovery_actions` needs the same field remains open and is not decided here.
- **Whether execution-safety subjects (runs, incidents) should eventually register into `governed_subjects`** — noted in Section 4 as a question for a future schema revision once the Shared Approval/Evidence Primitive is ratified and implemented, not decided now.
- **A purge-readiness marker column** — mirroring the identical open question the Phase 7.1 Schema Design Review recorded for its own evidence tables (Decision Record Decision 4's indefinite-by-default retention, exceptions requiring separate approval); whether this schema's entities should include a nullable marker now or add one only if an exception is ever approved is not decided here.
- **Naming finality.** `execution_lifecycle_events` and `recovery_actions` are working names carried from the Technical Design and this document respectively, not confirmed as final by any accountable-owner review.

## 12. Explicit Out of Scope

- **Any SQL or migration file.** Nothing in Section 3 is created by this document.
- **Any application source file or database file.**
- **Resolution of any Section 11 item**, or any Decision Record item still open per that record's own Section 8.
- **The Workflow Engine, Agent Execution Layer, Agent Registry, or Tool Registry** — referenced only for their relationship to this schema (Section 8), not designed here.
- **The Control Center's Incident and Recovery Experience UI** — a Phase 9 concern per the Implementation Map; this review addresses the underlying data layer only.
- **Approval of this schema for migration** — Section 10's gates, including the Decision Record's still-pending ratification, remain outstanding.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file or database file.
- It does not claim any table, function, or policy named in this document exists.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not ratify any decision in `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md` — that record's status remains "Decisions Recorded — Pending Accountable-Owner Ratification."
- It does not authorize implementation or migration to begin.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Technical Design](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — the authoritative source for ratification status referenced throughout this review
- [COS-MVP-003 Phase 7 Decision Ratification Record](COS-MVP-003_Phase_7_Decision_Ratification_Record.md), [COS-MVP-003 Phase 7 Decision Ratification Tracker](COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md) — the authoritative source for D08's resolved compensation-evidence storage decision this v1.1 alignment reflects
- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Specification](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Specification.md)
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md) — including WF-010 Incident Response
- [Control Center Specification](Control_Center_Specification.md)
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `incidents`, `runs`, `run_steps` contracts this review generalizes
- [COS-MVP-003 Phase 7.1 Approval Primitive Schema Design Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Schema_Design_Review.md) — the precedent this document's shape and open-question framing follow

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial schema design review for Execution Safety Foundations: objectives, seven existing architecture sources, five proposed entities (incident model, execution audit events, checkpoints/idempotency records with an Option A/B design question, recovery actions, and a provisional compensation-records entity contingent on the deferred storage decision), relationships and ownership, lifecycle/state requirements, evidence/immutability requirements, security/RLS considerations, relationship to the Shared Approval/Evidence Primitive/Agent Registry/Tool Registry/Workflow Engine, migration considerations, validation requirements, six open schema decisions, and explicit out-of-scope boundaries. No SQL written, no migration created, no decision ratified. |
| 1.1 | Documentation alignment pass reflecting the resolved D08 compensation-evidence storage decision (dedicated table, Approved with Conditions): renamed the entity from the provisional "Compensation records" to "Compensation evidence" throughout, replaced its provisional framing with the resolved decision and its two binding conditions, updated its field list to drop "if a dedicated entity is chosen" hedging, updated Sections 4/6/7/8/10 references from `compensation_records`/provisional language to `compensation_evidence`/resolved language, and moved the storage question in Section 11 from an open item to a resolved-item note with a pointer to the Ratification Record and Tracker. No other Phase 7 decision, ratification record, or D01–D19 outcome was altered. No SQL written, no migration created, no implementation performed, no release status changed. |
