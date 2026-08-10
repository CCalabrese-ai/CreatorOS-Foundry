# COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Specification

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Automation Owner and Architecture Owner
**Status:** Implementation Specification — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — specification document, no capability exists to release yet

## Purpose

This document translates the ratified-as-recommended decisions in `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md` and the architecture in `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md` into a concrete implementation blueprint — what would be built, in what order, and against what evidence — following the same shape the Phase 7.1 Implementation Specification used to translate its own Technical Design and Decision Record. **It is a specification for future implementation work, not the implementation itself.** No SQL is written, no migration is created, no application source or database file is modified, no capability is claimed to exist, and no release status changes. Every requirement below traces to a specific prior document; this specification does not introduce new architectural decisions of its own.

## Maintaining the Distinction

- **Designed ≠ implemented.** Everything in this specification describes what a future build would need to satisfy. Nothing described here exists in `src/`, `supabase/migrations/`, or the live database as of this document.
- **Recommendation ≠ approval.** Every decision this specification builds on carries the Decision Record's own status: "Decisions Recorded — Pending Accountable-Owner Ratification." This specification does not change that status and does not treat any recommendation as ratified merely because it is used as a planning input here.
- **Specification ≠ execution.** This document describes requirements a build must meet. It does not itself satisfy any of them.

## 1. Objective

To provide a build-ready blueprint for Execution Safety Foundations sufficiently concrete that a future Schema Design Review and Migration Design Plan (the two remaining planning documents in the sequence the Implementation Plan's Section 6 established) can proceed directly from it, exactly as the Phase 7.1 Implementation Specification enabled its own Schema Design Review. This specification does not itself perform that translation into schema or migration form — it is the last conceptual document before that translation begins.

## 2. Implementation Boundaries

**In scope for this specification:** the conceptual shape of every component named in Section 3, its data model requirements (Section 4), the service responsibilities that would operate on it (Section 5), and the evidence a future implementation must produce to be considered validated (Section 8).

**Out of scope for this specification** (see Section 12 for the full list): any SQL, any migration file, any client or service source code, the Workflow Engine or Agent Execution Layer that would consume this capability, and resolution of any item the Decision Record left open (Section 8 of that document) or explicitly deferred (Decision 3's storage question, gated on the Shared Approval/Evidence Primitive's own ratification).

## 3. Capability Components

### Incident handling

Implements Decision Record Decision 1 (recommended seven-state lifecycle: `detected` → `triaged` → `containing` → `contained` → `recovering` → `resolved` → `reviewed`, with a `reopened` transition back to `triaged`). An incident may be opened automatically — when a run enters `Quarantined` (Technical Design Section 4) or an observability alert threshold fires — or manually, by an operator, per WF-010's own trigger definition ("Alert or reported incident"). Every incident must reference the run(s) or resource(s) it concerns and carry an owner, consistent with the existing `incidents` contract (`severity, category, detected_at, owner_id, status, resolved_at`).

### Recovery/rollback

Implements Decision Record Decision 2. A `Quarantined` or `Failed` run may transition toward resumption only after the reconciliation contract (Technical Design Section 3: `confirmed-succeeded` / `confirmed-failed` / `unknown`, `unknown` blocking) returns a definite outcome, and only with an explicit, role-checked decision from the Automation Owner baseline, with Security Owner authority additionally required for runs touching T3/T4-classified tools or sensitive data. The last durable checkpoint (Section 3's Checkpoint/idempotency component) is the authoritative resumption point — never an assumed position.

### Compensation handling

Implements Decision Record Decision 3's authority conclusion (Option B: same overlay-role model as recovery, plus mandatory System Owner sign-off for actions within `Workflow_Design_Standards.md`'s "irreversible limits" category) while explicitly **not** implementing its storage conclusion, which remains deferred pending the Shared Approval/Evidence Primitive's ratification (Decision Record Decision 6). A compensation action requires: a stated precondition (verified before the action proceeds), an authority check as above, and its own evidence record — in a location this specification does not fix, consistent with the deferral.

### Execution audit trail

Implements Decision Record Decision 5. A strictly append-only record of every state transition across runs, run steps, and incidents, written only by the same governed-mutation function that performs the transition itself — no separate write path, no application-role direct write grant, mirroring `document_lifecycle_events` exactly. Retention is indefinite by default (Decision 5), with any shorter retention requiring its own future Data Owner/Security Owner-approved exception.

### Checkpoints/idempotency

Implements Decision Record Decision 4 (Option C, hybrid): a default idempotency key automatically derived from the standard tuple (workflow, version, workspace, trigger, governed resource) per `Workflow_Design_Standards.md`'s own formula, with an explicit override path for steps whose actual uniqueness requirement is finer-grained than that tuple captures. A checkpoint is a mutable pointer, held on the run record, to the last successfully completed and durably recorded step — updated only as part of the same governed transition that completes that step, never independently.

## 4. Data Model Requirements (No SQL)

Stated as required domain concepts and relationships, in the same prose form `Schema_Specification.md` and the Phase 7.1 Schema Design Review already use — not as table definitions, and not created by this document.

- **`incidents`** — required domain fields: an identifier, `severity`, `category`, `detected_at`, `owner_id`, `status` (per the seven-state model), `resolved_at`, and a reference to the run(s)/resource(s) the incident concerns. Workspace-scoped, consistent with every governed table in this repository.
- **`runs`** — required domain fields: an identifier, `run_type`, `definition_id`, `initiated_by`, `started_at`, `completed_at`, `outcome`, a mutable `current_state` (one of the nine `Automation_Architecture.md` states), and a checkpoint reference (the last successfully completed step). Workspace-scoped.
- **`run_steps`** — required domain fields: an identifier, `run_id`, `sequence_number`, `operation`, `started_at`, `completed_at`, `outcome`, and an idempotency-key value (default-derived or explicitly overridden, per Section 3's Checkpoints/idempotency component). Workspace-scoped, referencing `runs`.
- **Execution audit trail entity** (working name `execution_lifecycle_events`, per the Technical Design) — required domain fields: an identifier, a reference to the run/step/incident the event concerns, `from_state`, `to_state`, an actor reference (nullable for system-driven transitions), a reason, and `occurred_at`. Append-only; no update or delete path for any application role.
- **Compensation evidence entity** — required domain fields are not specified here, consistent with Decision Record Decision 3's deferred storage question; whichever storage option is eventually ratified will determine whether this is a dedicated table or an entry in the Shared Approval/Evidence Primitive's own tables once that primitive exists.
- **Ownership/workspace boundaries** — every entity above is `workspace_id`-scoped, following the convention already proven for documents and recommended for the Shared Approval/Evidence Primitive; no cross-workspace reference is structurally possible as specified.

## 5. Service/Component Responsibilities

- **Incident-transition function** — the sole path for any `incidents.status` change, re-verifying actor role and the specific transition's legality against the seven-state graph before writing, and writing exactly one execution-audit-trail row in the same operation, mirroring `transition_document_lifecycle`'s own discipline.
- **Run-transition function** — the sole path for any `runs.current_state` change, enforcing the transition graph specified in the Technical Design Section 4, updating the checkpoint reference when a step completes, and writing exactly one execution-audit-trail row per transition.
- **Recovery-authorization function** — implements Decision Record Decision 2: checks the reconciliation-contract result and the actor's role before permitting a `Quarantined`/`Failed` → `Running`/`Compensating` transition; this may be the same function as the run-transition function or a function it calls, a detail left to the eventual Schema Design Review, not fixed here.
- **Compensation-authorization function** — implements Decision Record Decision 3's authority conclusion; writes to whichever evidence location the deferred storage decision eventually resolves to.
- **Idempotency-key resolution component** — implements Decision Record Decision 4: derives the default key or accepts an explicit override, and enforces uniqueness before a side effect proceeds, consistent with `Workflow_Design_Standards.md`'s "record the key before performing the side effect" requirement.
- **Integration adapter reconciliation operation** — a required addition to every integration adapter (per `Automation_Architecture.md`'s existing adapter boundary), returning `confirmed-succeeded` / `confirmed-failed` / `unknown` for a given prior call, consumed by the recovery-authorization function.

Every function above follows the `SECURITY DEFINER`-in-`creator_os_private`-with-thin-`public`-wrapper pattern already proven for documents — no application role receives a direct write grant on any table named in Section 4.

## 6. Security Implementation Requirements

- **Fail-closed by default** on every recovery and compensation transition — no default-allow path, per the Technical Design Section 6 and `Automation_Architecture.md`'s own principle.
- **Role checks re-verified at the point of transition**, not inferred from a prior successful step — directly implementing `Workflow_Design_Standards.md`'s Step Design rule: "A step must not infer authorization from successful execution of a previous step."
- **No self-compensation or self-unquarantine** — the identity or process whose action caused a `Failed`/`Quarantined` state must not be the sole authority moving the run out of that state, per the Technical Design Section 6's extension of the Phase 7.1 self-approval constraint.
- **RLS, three-tier, workspace-scoped** — active member (read, row-filtered) / non-member (denied via row filter) / anonymous (denied at the grant layer) applied identically to every table in Section 4, matching the Phase 6.4-proven pattern.
- **Emergency-action marking** — per Decision Record Decision 7, any emergency-path recovery or compensation action must carry an `is_emergency` marker and a mandatory follow-up review record, in addition to (not instead of) its ordinary role check and evidence requirement. The specific expiry/re-review duration remains an open policy decision (Decision Record Section 8) and is not fixed by this specification.
- **Least privilege on every new table** — revoke-all-first, `SELECT` broadly granted subject to RLS, `INSERT`/`UPDATE` reachable only through the governed function family named in Section 5.

## 7. Evidence and Observability Requirements

- Every state transition across `incidents`, `runs`, and `run_steps` must produce exactly one execution-audit-trail row, in the same operation, with no path that allows a transition to occur silently.
- The execution audit trail is distinct from, and does not replace, `src/services/observability.js`'s existing allowlisted event emission — both are required, serving different purposes (durable governed evidence vs. operational visibility), per the Technical Design Section 7.
- Cost, approval-expiry, and compensation-failure alerting (named in `Automation_Architecture.md`'s Observability and Cost section) must be supportable by the evidence this specification defines, though the alerting mechanics themselves belong to the Observability layer component and are out of scope here (Section 12).
- No `UPDATE`/`DELETE` grant to any application role on the execution-audit-trail entity, under any circumstance, matching the evidence-immutability standard already established for documents and recommended for the Shared Approval/Evidence Primitive.

## 8. Validation Strategy

Restated from the Technical Design Section 9 as concrete acceptance evidence a future implementation must produce — none of which exists yet:

- A live-executed quarantine test: an interrupted run with an unknown external side effect lands in `Quarantined`, never auto-resolved.
- A live-executed reconciliation test against a real integration adapter, exercising all three reconciliation-contract outcomes.
- A live-executed compensation test: denied without the required authority, succeeds only with it, records evidence.
- A live-executed idempotency test: a replayed trigger with an identical key does not duplicate the side effect.
- A live-executed self-compensation/self-unquarantine denial test, mirroring the Phase 7.1 self-approval denial methodology.
- RLS tests at all three tiers for every table in Section 4.
- A demonstrated (not merely designed) end-to-end recovery, per the Roadmap's own Phase 8 exit criterion.
- Zero residual test fixtures left behind, mirroring the Phase 6.4 standard.

## 9. Implementation Sequence

Planning-level only — this specification does not perform any of these steps:

1. Schema Design Review — table names and field lists in prose form, generalizing Section 4 above, following `Schema_Specification.md`'s own no-SQL convention.
2. Migration Design Plan — sequencing, boundaries, compatibility strategy, and validation gates, additive-only.
3. Implementation Readiness Review — cross-artifact synthesis identical in method to the Phase 7.1 Readiness Review, checked against this specification's Section 8 before any migration is authorized.
4. Migration execution and implementation — gated on accountable-owner ratification of the Decision Record and on the Readiness Review's own conclusion, neither of which has occurred as of this document.

## 10. Rollback/Recovery Strategy

At the planning level only, consistent with how the Phase 7.1 Migration Design Plan treated the same question: because every object described in Section 4 would be newly created (nothing existing is altered by this specification, since nothing execution-related exists yet to alter), rollback of any future implementation would be a clean drop of the new tables and functions, with zero risk to any already-shipped capability (System Registry, Documentation Registry), since neither depends on anything described here. This specification does not itself require a rollback plan, since it performs no implementation — this section describes what a future migration's own rollback strategy should state, not a rollback this document executes.

## 11. Dependencies

- **What this depends on:** only the existing, implemented workspace/membership model and the `creator_os_private`/RLS/governed-mutation schema patterns already proven for documents (Layer 0, per the Implementation Map) — restated from the Implementation Plan Section 5 and confirmed unchanged by this specification.
- **What depends on this:** Phase 8's Workflow Engine and Agent Execution Layer, per the Roadmap's own sequencing — neither is designed or affected by this document.
- **Relationship to the Shared Approval/Evidence Primitive:** bounded exactly as Decision Record Decision 6 established — no hard dependency for the capability as a whole; two specific items (compensation-evidence storage, and any future `governed_subjects` registration for incidents) remain gated on that primitive's own ratification, unaffected by this specification.
- **Relationship to the Agent Registry and Tool Registry:** no direct dependency in either direction, per the Technical Design Section 8 — the relationship is downstream, through the eventual Phase 8 Agent Execution Layer, not through anything specified here.

## 12. Explicit Out of Scope

- **Any SQL, migration, or schema implementation.** Section 4's data model requirements are prose, not DDL, and are not created by this document.
- **Any application source file or service module.** Section 5's responsibilities describe what future functions would need to do, not code that exists.
- **The Observability layer's alerting mechanics** — named as a requirement in Section 7 but not designed here.
- **The Control Center's Incident and Recovery Experience UI** — a Phase 9 concern per the Implementation Map.
- **The Workflow Engine or Agent Execution Layer** — Phase 8 scope, consumers of this capability, not specified here.
- **Any change to the Shared Approval/Evidence Primitive's status or design** — remains pending accountable-owner ratification, referenced here only as a named dependency for two specific deferred items.
- **Resolution of any Decision Record open item** — Section 8 of that document (six items) and Decision 3's deferred storage question remain unresolved; this specification builds around them, it does not resolve them.
- **Authorization of implementation** — this document is a blueprint for a future build, not an instruction to begin one.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file or database file.
- It does not claim any part of Execution Safety Foundations is implemented.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not ratify any decision in `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md` — that record's status remains "Decisions Recorded — Pending Accountable-Owner Ratification," unchanged by this specification's use of its recommendations as planning inputs.
- It does not authorize implementation to begin.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Plan](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Plan.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Technical Design](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — the authoritative source for ratification status referenced throughout this specification
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md) — including WF-010 Incident Response
- [Control Center Specification](Control_Center_Specification.md)
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `incidents`, `runs`, `run_steps` contracts Section 4 generalizes from
- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Specification.md) — the precedent this document's shape follows
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 8 follows

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial implementation specification for Execution Safety Foundations: objective, implementation boundaries, five capability components (incident handling, recovery/rollback, compensation handling, execution audit trail, checkpoints/idempotency) each tracing to a specific Decision Record decision, data model requirements in prose (no SQL) for five entities including an explicitly under-specified compensation-evidence entity pending the deferred storage decision, service/component responsibilities, security implementation requirements, evidence/observability requirements, an eight-item validation strategy, a four-step implementation sequence, a planning-level rollback strategy, dependency analysis bounding the Shared Approval/Evidence Primitive relationship per Decision Record Decision 6, and explicit out-of-scope boundaries. No implementation performed, no decision ratified, no release status changed. |
