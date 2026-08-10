# COS-MVP-003 Phase 7 Execution Safety Foundations — Technical Design

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Automation Owner and Architecture Owner
**Status:** Technical Design — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — design document, no capability exists to release yet

## Purpose

This is the technical design for Execution Safety Foundations, following `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Plan.md`'s scope definition and six-step planning sequence. It reconciles the four existing architecture sources named in that plan into one coherent design, proposes concrete architecture for each of the five scope dimensions, and records genuinely open questions for accountable-owner decision rather than resolving them here. **No SQL is written, no migration is created, no source or database file is modified, no capability is claimed to exist, and no release status changes.** Every recommendation below is labeled as a recommendation, not a decision — mirroring exactly how the Phase 7.1 Technical Design treated its own open questions. COS-MVP-002 remains Not Released; the Shared Approval/Evidence Primitive remains blocked pending accountable-owner ratification; neither is affected by this document.

## 1. Objective

### What Execution Safety Foundations provides

A shared, governed answer — usable by the Workflow Engine and Agent Execution Layer in Phase 8, and by any future execution surface — to four questions this repository has so far only answered separately and incompletely: how is a problem detected and tracked (incident model); how is what actually happened during a run recorded durably (execution audit trail); how does a run resume or roll back after a failure (recovery); and how is an already-completed action safely undone or contained when a straightforward rollback isn't possible (compensation). It also provides the one piece with no existing design anywhere in this repository: how a run avoids repeating or losing a side effect when interrupted or retried (checkpoint/idempotency). This capability produces no user-visible feature by itself — its value, per the Roadmap, is "indirect but load-bearing": it is what makes autonomous execution something an accountable owner can trust enough to allow.

## 2. Existing Architecture Reconciliation

### Existing designed concepts (specified, not built)

- **Recovery contract field** (`Workflow_Design_Standards.md`): every workflow must define "Pause, resume, replay, manual intervention, and rollback."
- **Compensation model** (`Workflow_Design_Standards.md`): "Compensation is an explicit workflow, not an assumed rollback. It must state preconditions, authority, irreversible limits, and evidence."
- **Idempotency requirement** (`Workflow_Design_Standards.md`): "Use a stable idempotency key derived from the workflow, version, workspace, trigger, and governed resource. Record the key before performing the side effect. Replays return the recorded outcome or reconcile state instead of repeating the action."
- **Nine-state run model with `Compensating` and `Quarantined`** (`Automation_Architecture.md`): the full state vocabulary (`Queued`, `Running`, `Waiting`, `Paused`, `Succeeded`, `Failed`, `Compensating`, `Cancelled`, `Quarantined`).
- **Control plane component** (`Automation_Architecture.md`): "Manages deployment, pause, rollback, migration, and retirement."
- **Failure and Recovery principles** (`Automation_Architecture.md`): "The last durable checkpoint is authoritative. A worker crash must not imply a step succeeded. Recovery resumes only after reconciling external side effects. Unknown outcomes are quarantined for investigation rather than retried blindly."
- **WF-010 Incident Response** (`Workflow_Registry.md`): registered entry — trigger "Alert or reported incident," actor Security Owner, outcome "Containment, evidence, recovery, and review," approval "Emergency policy," risk High, status `Proposed`.
- **Incident and Recovery Experience** (`Control_Center_Specification.md`): a user-facing requirement that operators see "containment, status, affected scope, owner, timeline, evidence, and approved recovery actions," with emergency controls "protected, time-bounded, and followed by review."
- **`incidents`, `runs`, `run_steps` table contracts** (`Schema_Specification.md`): field lists specified, no migration or application code exists.

### Existing partial capabilities

None found. As the Implementation Plan's Section 3 already established, no implemented capability in this repository (System Registry, Documentation Registry) performs multi-step, retryable, side-effecting execution — both are single-record governed mutations. There is no partially-built recovery, compensation, incident, or checkpoint mechanism anywhere in `src/` or `supabase/migrations/` to reconcile against. This is confirmed again here, not assumed from the Implementation Plan alone, because a Technical Design should not silently inherit a prior document's factual claim about implementation state without restating it against the same standard.

### Missing foundation work

Everything named in Section 3 below. Additionally, and specific to this design pass: no document in this repository's four source specifications defines *how* a checkpoint is structured, *how* "reconciling external side effects" is actually verified (as opposed to asserted as a principle), or *how* an idempotency key's uniqueness is enforced. These three items are treated as new design surface in Section 3, not reconciliation of an existing answer.

## 3. Core Architecture

Each subsection below states the design, options considered where more than one reasonable approach exists, and a labeled recommendation. No option is silently chosen — every recommendation is explicitly marked as a recommendation pending accountable-owner review, consistent with how the Phase 7.1 Technical Design treated its own decisions.

### Incident model

**Design:** an `incidents` entity generalizing the existing `Schema_Specification.md` contract (`severity, category, detected_at, owner_id, status, resolved_at`), openable from two paths per WF-010's own trigger definition ("Alert or reported incident"): automatically, when a run transitions to `Quarantined` or an observability alert threshold fires, or manually, by an operator. Every incident references the run(s) or resource(s) it concerns.

**Options considered for incident lifecycle:**
- **A.** A minimal two-state model (`open`/`resolved`), matching only what the existing field list (`status`, `resolved_at`) strictly requires.
- **B.** A richer lifecycle matching WF-010's own outcome description — "Containment, evidence, recovery, and review" — as four distinct, ordered states plus detection and closure: `detected` → `triaged` → `containing` → `contained` → `recovering` → `resolved` → `reviewed` (terminal).

**Recommendation: B.** WF-010 already describes four distinct phases of work (containment, evidence, recovery, review) as its outcome — collapsing them into a two-state model would discard information the registry entry itself already specifies, and would give the Control Center's Incident and Recovery Experience (which needs to show "timeline" per its own acceptance criteria) nothing to render a timeline from. This is a recommendation, not a decision — the accountable owner (Security Owner, per WF-010's named actor) should ratify the specific state list before it is treated as final.

### Execution audit trail

**Design:** two tables, mirroring the document pattern's proven split between mutable current-state and append-only history rather than inventing a new shape: a `runs` table (generalizing the existing contract: `run_type, definition_id, initiated_by, started_at, completed_at, outcome`, plus a mutable `current_state` column holding one of the nine `Automation_Architecture.md` states) and a `run_steps` table (`run_id, sequence_number, operation, started_at, completed_at, outcome`) for per-step detail. A third, strictly append-only table — **not currently named in `Schema_Specification.md`** — records every state transition the `runs`/`run_steps` rows undergo, mirroring `document_lifecycle_events` exactly: this is the actual "execution audit trail" distinct from ordinary observability.

**Recommendation:** name this third table explicitly (a working name, not a final one) as `execution_lifecycle_events`, written only by the same governed-mutation function that transitions a run or step's state — no application role ever writes it directly, matching the append-only convention already proven for documents and recommended for the Shared Approval/Evidence Primitive's own event table. This is presented as a recommendation for the eventual Schema Design Review to formalize, not a schema this document creates.

### Recovery/rollback model

**Design:** recovery is only permitted from the "last durable checkpoint," per `Automation_Architecture.md`'s own principle, and only after a reconciliation step confirms the status of any external side effect the interrupted run may have already caused — a worker crash must not be treated as either success or failure without checking. A `Quarantined` run requires this reconciliation evidence to exist, and requires a specific role's decision to unquarantine (see Section 5), before it may resume; it is never auto-resumed.

**Options considered for what "reconciling external side effects" means concretely:**
- **A.** A generic requirement satisfied by whatever the specific integration adapter reports — no shared verification contract.
- **B.** A shared reconciliation contract: every integration adapter must expose a status-check operation (distinct from its normal call surface) that the recovery path invokes before resuming, returning one of `confirmed-succeeded`, `confirmed-failed`, or `unknown`; `unknown` forces continued quarantine rather than a guess.

**Recommendation: B.** `Automation_Architecture.md`'s own Trust and Security Boundaries principle already requires "External systems are unreliable and must be isolated behind governed integration adapters" — Option B extends that existing adapter boundary with one additional required operation rather than inventing a new integration concept, and directly implements "recovery resumes only after reconciling external side effects" as something enforceable rather than aspirational.

### Compensation model

**Design:** compensation is its own explicit, evidenced action — never an inferred inverse of the original step — per `Workflow_Design_Standards.md`'s own definition. A compensation action states its precondition (what must be true about the original action's state before compensation is attempted), the authority required to invoke it, and whether the original action falls within an "irreversible limit" that makes compensation impossible (in which case the run remains `Quarantined` for human resolution instead).

**Options considered for where compensation evidence is recorded:**
- **A.** A dedicated `compensation_evidence` table, independent of any other evidence pattern in this repository.
- **B.** Reuse the Shared Approval/Evidence Primitive's evidence tables once ratified, treating a compensation authorization as one more subject type the primitive governs.

**Recommendation: neither is selected here.** Per the Implementation Plan's Section 8, this design does not build against the Shared Approval/Evidence Primitive's specific, unratified shape. Option B is the more architecturally consistent long-term answer — consistent with "Composable before bespoke" — but adopting it now would couple this design to five decisions that could still change. This is recorded as an **open decision in Section 10**, not resolved by this document, and Option A remains available as a fallback if the primitive's ratification is delayed materially past this capability's own planning timeline.

### Checkpoint/idempotency model

**Design:** the one dimension with no existing design to generalize from, per the Implementation Plan's own finding. Proposed as two related but distinct mechanisms:

1. **Idempotency key** — a stable value derived exactly as `Workflow_Design_Standards.md` specifies ("workflow, version, workspace, trigger, and governed resource"), recorded on the relevant `run_steps` row *before* the side effect is attempted, with a uniqueness constraint scoped to that same tuple. A replay matching an existing key returns the recorded outcome rather than repeating the side effect — this is a direct, mechanical implementation of the existing prose requirement, not new policy.
2. **Checkpoint** — a mutable pointer (on the `runs` row) to the last successfully completed and durably recorded `run_steps` row, updated only as part of the same governed transition that completes a step. Recovery resumes execution from the state referenced by this pointer, never from an assumed position.

**Options considered for checkpoint granularity:**
- **A.** Step-level only — a checkpoint exists only at step boundaries; a step that fails partway through is retried from its own beginning.
- **B.** Sub-step checkpointing — steps may declare internal checkpoints for expensive or multi-part operations.

**Recommendation: A, as the baseline, with B left open for a specific step to opt into later if evidence shows it's needed.** `Workflow_Design_Standards.md`'s own Step Design section already requires "one clear responsibility" per step and does not describe sub-step state — introducing sub-step checkpointing now would be new scope beyond what any existing source specifies. This is a recommendation, not a foreclosed decision — Section 10 records it as open.

## 4. Lifecycle and State Management

**Run lifecycle:** the nine states already specified in `Automation_Architecture.md` are adopted unchanged — this design does not redefine them. The transition graph (not previously stated explicitly as a graph in the source document, only as a state list) is proposed here as a **recommendation**, following the same practice the Phase 7.1 Technical Design used to make an implicit graph explicit:

```
Queued      → Running                 (capacity/time available)
Running     → Waiting                 (external event, timer, handoff, or approval pending)
Running     → Paused                  (operator or policy suspension)
Running     → Succeeded               (acceptance criteria satisfied)
Running     → Failed                  (ended without satisfying criteria; retry-safe or terminal)
Running     → Quarantined             (unknown outcome after worker crash or unreconciled side effect)
Waiting     → Running                 (event/timer/handoff/approval resolved)
Waiting     → Cancelled               (authorized actor ends the run)
Paused      → Running                 (operator resumes)
Paused      → Cancelled               (authorized actor ends the run)
Failed      → Compensating            (approved reversal or corrective steps begin)
Failed      → Quarantined             (outcome unknown, cannot safely retry or compensate)
Quarantined → Compensating            (reconciliation confirms compensable state; authorized decision made)
Quarantined → Running                 (reconciliation confirms safe resumption; authorized decision made)
Compensating→ Succeeded               (compensation completed; original failure contained)
Compensating→ Quarantined             (compensation itself fails or hits an irreversible limit)
```

`Succeeded` and `Cancelled` are terminal. `Quarantined` is not automatically terminal but requires an authorized, evidenced decision (Section 5) to leave.

**Incident lifecycle:** the seven-state model recommended in Section 3 (`detected` → `triaged` → `containing` → `contained` → `recovering` → `resolved` → `reviewed`), presented as linear for the common case; a `reopened` transition back to `triaged` from `resolved` is recommended for cases where a closed incident recurs, mirroring the general principle that nothing in this repository's governance model treats "closed" as permanently immune to reopening (e.g., documents can be revised after publication).

**Compensation as a sub-lifecycle of the run graph**, not an independent lifecycle — it exists only as the `Compensating` state entered from `Failed` or `Quarantined`, consistent with `Automation_Architecture.md` treating it as one of the nine run states rather than a separate entity.

## 5. Ownership and Authority Model

- **Automation Owner** owns the overall design and the Control plane function family (deployment, pause, migration, retirement per `Automation_Architecture.md`'s Control plane component), mirroring `Workflow_Design_Standards.md`'s own Approval Boundaries: "The Workflow Owner approves routine design."
- **Security Owner** owns incident response per WF-010's own actor assignment, and is the recommended authority for unquarantining a run — quarantine exists specifically because "security or integrity risk prevents further execution" (`Automation_Architecture.md`), so lifting it should require the same accountable role, not a lower one.
- **System Owner** is the recommended escalation/fallback authority for compensation and unquarantine decisions when no Security Owner is active for a workspace, mirroring the exact fallback pattern the Phase 7.1 Decision Record already established for revocation authority (Decision 5) — this design deliberately reuses that precedent rather than inventing a new one.
- **Role-based, not person-based**, throughout — consistent with the Phase 7.1 Decision Record's explicit rejection of person-based authority ("a single point of failure if that person is unavailable, has left, or is themselves the reason revocation is needed") and with `Workflow_Design_Standards.md`'s own Approval Boundaries, which name roles, not individuals.
- **Emergency authority remains accountable authority.** WF-010's approval model is "Emergency policy," not "no policy" — an emergency path authorizes faster action by a named role, it does not remove the role requirement or the after-the-fact review `Control_Center_Specification.md` requires ("followed by review").

All of the above are **recommendations** for the eventual Decision Record to ratify, not decisions made by this document.

## 6. Security Model

- **Fail-closed behavior.** Directly inherited, not reinterpreted, from `Automation_Architecture.md`'s architectural principle: "High-impact, public, destructive, financial, identity, or sensitive actions fail closed without required approval." Applied here specifically to recovery (a run does not resume by default) and compensation (a compensation action does not execute by default) — both require an explicit, role-checked decision, never a timeout-based default-allow.
- **Emergency authority boundaries.** Per `Control_Center_Specification.md`: emergency controls must be "protected, time-bounded, and followed by review." Recommended concretely as: an emergency action (e.g., a fast-path unquarantine under WF-010) requires the same role check as its non-emergency equivalent, carries a mandatory expiry/re-review deadline, and produces its own evidence record distinct from a routine decision, so that "emergency" is auditable as a category, not just a label.
- **Least privilege.** The same `SECURITY DEFINER`-in-`creator_os_private`-with-thin-`public`-wrapper pattern proven for documents and recommended for the Shared Approval/Evidence Primitive applies here without modification: no application role receives a direct write grant on `incidents`, `runs`, `run_steps`, or the execution-audit-trail table; all mutation flows through governed functions that re-verify role, workspace, and (where applicable) evidence at the moment of the change.
- **No self-compensation or self-unquarantine.** Recommended as a direct extension of the Phase 7.1 Architectural Constraint on self-approval: the identity or process that caused a run to enter `Failed` or `Quarantined` should not be the sole authority that moves it out of that state, mirroring "no self-approval" for the same underlying reason — an actor should not be able to unilaterally clear evidence of its own failure.

## 7. Evidence and Observability Model

- **Distinct from `src/services/observability.js`.** The existing service provides allowlisted, sanitized event emission for operational visibility — useful, but not durable, queryable, governed evidence. The execution audit trail proposed in Section 3 is a separate, append-only, governed table set, mirroring the distinction the Shared Approval/Evidence Primitive design already draws between ordinary logging and evidence-grade records.
- **Append-only, non-editable.** No `UPDATE`/`DELETE` grant to any application role on `execution_lifecycle_events` or the incident record's own event history, matching the Architectural Constraint on evidence immutability already recorded for the Shared Approval/Evidence Primitive.
- **Every state transition writes exactly one event row**, in the same operation that produces it — no transition may leave the audit trail silent about how it happened, mirroring the identical requirement already established for `approval_lifecycle_events`.
- **Cost and alerting** (per `Automation_Architecture.md`'s Observability and Cost section: "cost spikes, approval expiry, and compensation failure" as named alert conditions) are noted here as a requirement this evidence model must support, not designed in this document — alerting mechanics belong to the Observability layer component, out of this document's scope per Section 11.

## 8. Dependencies

- **Shared Approval/Evidence Primitive.** Not a build dependency for the core Execution Safety Foundations schema (Section 3's incident, audit-trail, recovery, and checkpoint models do not require it to exist). It **is** a design dependency for two specific decisions this document deliberately leaves open rather than resolves: (1) whether compensation authorization is recorded via the shared primitive or a dedicated table (Section 3, Compensation model), and (2) whether incidents themselves should register as a `governed_subjects` entry once that registry exists, for consistency with however future approval-gated incident actions are eventually authorized. Both are recorded in Section 10.
- **Agent Registry.** No direct dependency in either direction at the schema level. Relationship is downstream: once the Agent Execution Layer (Phase 8) exists and consumes both the Agent Registry and this capability, an agent's failed or quarantined action becomes visible through the same incident/recovery model designed here — but nothing in the Agent Registry's own design (per `AI_Workforce_Registry.md`) requires Execution Safety Foundations to exist first, or vice versa.
- **Tool Registry.** Same relationship as the Agent Registry — no direct schema dependency, but a tool invocation gone wrong (a T3/T4 action with an unknown outcome, for example) is exactly the kind of event this capability's incident/quarantine model exists to handle once the Tool Registry and Workflow Engine both exist.
- **Workflow Engine (Phase 8).** The direct, primary consumer. Per the Roadmap, the Workflow Engine's own recovery portion "now has a foundation to build on rather than starting blank" because of this capability — the `runs`/`run_steps`/incident/checkpoint model designed here is what the Workflow Engine's orchestrator (per `Automation_Architecture.md`'s own Logical Components table) would read from and write to for every run it manages.

## 9. Validation Strategy

Consistent with the Phase 6.4 evidentiary standard and the Implementation Plan's own Section 7 — restated here at the design level, not yet executed:

- **A live-executed quarantine test**: an interrupted run with an unknown external side effect must land in `Quarantined`, never auto-resolved as `Succeeded` or `Failed`.
- **A live-executed reconciliation test**: the Section 3 recovery model's `confirmed-succeeded`/`confirmed-failed`/`unknown` contract must be exercised against a real integration adapter, not merely asserted.
- **A live-executed compensation test**: a compensation action must be denied without the required authority (Section 5) and must succeed only with it, recording its own evidence.
- **A live-executed idempotency test**: a replayed trigger with an identical idempotency key must not duplicate the underlying side effect.
- **A live-executed self-compensation/self-unquarantine denial test**, mirroring the Phase 7.1 self-approval denial test methodology exactly.
- **RLS tests** for `incidents`, `runs`, `run_steps`, and `execution_lifecycle_events` at all three tiers (active member / non-member / anonymous), matching the Phase 6.4 methodology.
- **A demonstrated (not merely designed) end-to-end recovery**, per the Roadmap's own Phase 8 exit criterion — this is the bar the Implementation Readiness Review for this capability will eventually need to confirm has been met with live evidence, exactly as the Phase 7.1 Readiness Review checked against its own Migration Design Plan's gates.

## 10. Open Decisions

These are not resolved by this document and require explicit accountable-owner review before a Decision Record or Schema Design Review treats any of them as settled:

- **Incident lifecycle state list** (Section 3) — the seven-state model is a recommendation; the Security Owner, as WF-010's named actor, should confirm or amend it.
- **Reconciliation contract for external side effects** (Section 3, Recovery/rollback) — Option B's three-outcome (`confirmed-succeeded`/`confirmed-failed`/`unknown`) contract is a recommendation; whether every integration adapter can realistically support it needs review against `Integration_Standards.md` and real adapter constraints, not assumed from this design alone.
- **Compensation evidence storage** (Section 3, Compensation model) — dedicated table vs. reuse of the Shared Approval/Evidence Primitive once ratified; explicitly deferred, not chosen.
- **Whether incidents register into `governed_subjects`** (Section 8) — depends on both the primitive's ratification and a decision about incident-specific approval-gated actions this document does not yet name.
- **Checkpoint granularity** (Section 3, Checkpoint/idempotency model) — step-level (recommended baseline) vs. sub-step checkpointing; left open for specific high-cost steps to justify later with evidence.
- **Unquarantine and compensation authority specifics** (Section 5) — Security Owner as primary with System Owner fallback is a recommendation modeled directly on the Phase 7.1 precedent, not an independently ratified decision for this capability.
- **Retention policy for the execution audit trail** — not addressed in this document; the Phase 7.1 Decision Record's own resolution (indefinite by default, exceptions require separate approval) is a plausible precedent but is not assumed to apply here without its own explicit decision.
- **Emergency-action expiry/re-review timeframe** (Section 6) — "time-bounded" is required by `Control_Center_Specification.md`; the specific duration is not set by this document.

## 11. Explicit Out of Scope

- **Any SQL, migration, or schema implementation** — Section 3's table names and shapes are proposals for a future Schema Design Review, not created here.
- **Any application source file or service module.**
- **The Observability layer's alerting mechanics** (cost spikes, approval expiry, compensation failure alerts) — named as a requirement in Section 7 but not designed here; belongs to `Automation_Architecture.md`'s own Observability layer component.
- **The Control Center's Incident and Recovery Experience UI** — a Phase 9 concern per the Implementation Map; this design addresses the underlying data/service layer only.
- **The Workflow Engine or Agent Execution Layer themselves** — both Phase 8 scope, consumers of this capability, not designed here.
- **Any change to the Shared Approval/Evidence Primitive's status or design** — it remains blocked pending accountable-owner ratification, referenced here only as a named future dependency for two specific open decisions (Section 10), never assumed resolved.
- **Resolution of any item listed in Section 10** — recorded for future decision, not decided by this document.

## What This Document Does Not Do

- It does not write any SQL or create any migration.
- It does not modify any application source file or database file.
- It does not claim any part of Execution Safety Foundations is implemented.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not change the Phase 7 → Phase 8 → Phase 9 sequencing established by `COS_Next_Phase_Product_Roadmap.md`.
- It does not resolve any of the open decisions in Section 10 — every recommendation in this document is labeled as a recommendation, not a ratified decision.
- It does not authorize implementation to begin.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Plan](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Plan.md) — the plan this design fulfills
- [COS-MVP-003 Phase 7.1 Shared Approval Evidence Primitive Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md) — the precedent for role-based (not person-based) authority and the self-approval-denial pattern this design extends
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — the revocation-authority fallback precedent Section 5 reuses; ratification status referenced in Section 8
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md)
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — Phase 7 → Phase 8 → Phase 9 sequencing, preserved unchanged
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md) — including WF-010 Incident Response
- [Control Center Specification](Control_Center_Specification.md) — Incident and Recovery Experience section
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `incidents`, `runs`, `run_steps` contracts
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 9 follows

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial technical design for Execution Safety Foundations: objective; reconciliation of four existing architecture sources into designed-concepts/partial-capabilities/missing-work categories; core architecture across five dimensions (incident model, execution audit trail, recovery/rollback, compensation, checkpoint/idempotency) each with options considered and a labeled recommendation; a run-lifecycle transition graph made explicit from the existing nine-state list, plus a recommended seven-state incident lifecycle; an ownership/authority model reusing the Phase 7.1 role-based, System-Owner-fallback precedent; a security model covering fail-closed behavior, emergency authority boundaries, least privilege, and no-self-compensation; an evidence/observability model distinct from existing minimal logging; a dependency analysis clarifying no hard build dependency on the blocked Shared Approval/Evidence Primitive; a validation strategy anchored to the Phase 6.4 standard; eight explicitly unresolved open decisions; and explicit out-of-scope boundaries. No implementation performed, no decision ratified, no release status changed. |
