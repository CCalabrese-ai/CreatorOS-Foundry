# COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Plan

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Automation Owner and Architecture Owner
**Status:** Planning Artifact — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning document, no capability exists to release yet

## Purpose

This is the implementation plan for the second Phase 7 foundation identified in `COS_Architecture_Implementation_Map.md` and recommended as the next workstream in `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md`: Execution Safety Foundations. It defines the planning scope for this capability — objective, existing architecture sources, current state, scope, dependencies, sequencing, validation, security/governance, and risks — before any technical design or implementation begins. **No source file is modified, no migration is created, no SQL is written, no capability is claimed to exist, and no release status changes.** COS-MVP-002 remains Not Released; the Shared Approval/Evidence Primitive remains blocked pending accountable-owner ratification; neither is affected by this document.

## 1. Objective

### Why Execution Safety Foundations exists

Nothing in Creator OS Foundry has yet taken a real, autonomous, side-effecting action — every implemented capability to date (System Registry, Documentation Registry) is a governed CRUD-and-lifecycle system operated by a human through a UI or client call, not a system executing multi-step work on its own. Phase 8's Workflow Engine and Agent Execution Layer will change that. Before either exists, this repository needs a shared answer to a question it has so far only specified in three separate, unreconciled places: **when something goes wrong during an autonomous or semi-autonomous run, what happens?** Execution Safety Foundations is the minimum machinery required to answer that safely — an incident model, a recovery/rollback path, a compensation model, an execution audit trail distinct from ordinary observability logging, and idempotency/checkpointing so a run can be safely replayed or resumed rather than only started over or left stuck.

### What capability it enables

It is the explicit, named prerequisite the Roadmap sets before Phase 8's Agent Execution Layer may begin — not concurrently with it, not after it. It is what makes "AI does work" something an accountable owner can trust enough to allow, per the Roadmap's own framing: this capability's value is indirect but load-bearing. It also directly implements the System Charter's "Observable and reversible" governing principle ("Material actions produce logs, status, ownership, and a recovery path") for the first time against real execution, not just governed data mutation.

## 2. Existing Architecture Sources

This capability is, per the Roadmap's own reassessment (v1.2), **not greenfield design** — four existing documents already specify complementary, overlapping pieces of it, none yet reconciled into a single buildable primitive.

| Source | What it contributes | Status |
| --- | --- | --- |
| `Workflow_Design_Standards.md` | The **Recovery** contract field ("Pause, resume, replay, manual intervention, and rollback") required of every workflow; an explicit **Compensation** model ("not an assumed rollback... must state preconditions, authority, irreversible limits, and evidence"); Idempotency requirements (stable idempotency key, recorded before the side effect, replays reconcile rather than repeat); Retry Rules (only transient, classified failures are retryable; approval denial and unknown side-effect outcomes are not). | Proposed, not implemented |
| `Automation_Architecture.md` | A nine-state run model including `Compensating` and `Quarantined` (for "security or integrity risk" that "prevents further execution"); a **Control plane** logical component ("Manages deployment, pause, rollback, migration, and retirement"); an **Observability layer** that "captures... incidents"; an explicit **Failure and Recovery** section: "The last durable checkpoint is authoritative. A worker crash must not imply a step succeeded. Recovery resumes only after reconciling external side effects. Unknown outcomes are quarantined for investigation rather than retried blindly." | Proposed, not implemented |
| `Workflow_Registry.md` | **WF-010 Incident Response** — a registered (though `Proposed`, not `Active`) workflow entry: trigger "Alert or reported incident," primary actor Security Owner, outcome "Containment, evidence, recovery, and review," approval "Emergency policy," risk High. The registry's own Required Workflow Contract additionally requires every workflow to define "failure states, compensation, recovery, and manual intervention" and "pause, rollback, migration, and retirement procedures" before activation. | Registered, not active |
| `Control_Center_Specification.md` | An **Incident and Recovery Experience** section, at the user-facing layer: "the Control Center prioritizes containment, status, affected scope, owner, timeline, evidence, and approved recovery actions. Emergency controls are protected, time-bounded, and followed by review." This means Execution Safety Foundations is specified not only at the automation layer but also at the layer a human would use to act on it. | Specified, not implemented |

`05_Database/Schema_Specification.md` additionally already specifies the `incidents` table (`severity, category, detected_at, owner_id, status, resolved_at`) and the `runs`/`run_steps` tables (`run_type, definition_id, initiated_by, started_at, completed_at, outcome` / `run_id, sequence_number, operation, started_at, completed_at, outcome`) — schema-level building blocks for an execution audit trail, not yet implemented.

## 3. Current State

### Existing designs

All four sources in Section 2 are complete at their own scope and status (`Proposed`, `Baseline`, or specified-in-passing for the Control Center). None contradicts another on substance — the same concepts (recovery, compensation, quarantine, incident response) recur across all four with consistent framing, though never in one reconciled document. This mirrors exactly the situation the Shared Approval/Evidence Primitive found itself in before its own Phase 7.1 planning chain reconciled three independently-specified "Approval service" concepts into one.

### Partially implemented capabilities

None. Unlike the Shared Approval/Evidence Primitive — which had a fully implemented, live-validated document-specific instance to generalize from (Phase 6.4) — Execution Safety Foundations has **no implemented instance anywhere in this repository** to generalize from. Nothing built so far (System Registry, Documentation Registry) has needed a recovery, compensation, or incident model, because neither performs multi-step, retryable, side-effecting execution; both are direct governed mutations of a single record. This is a materially different starting position from Phase 7.1 and is treated as a first-class planning input, not an oversight, in Section 5 and Section 9.

### Missing implementation work

Everything: no incident table exists in application code or migrations (only in `Schema_Specification.md`'s prose contract), no compensation logic exists anywhere, no idempotency-key mechanism exists anywhere, no `runs`/`run_steps` table exists in application code or migrations, and no Control Center UI exists to surface any of it. The entire scope named in Section 4 below is unbuilt.

## 4. Scope Definition

Stated as scope to be planned and reviewed in a subsequent Technical Design, not executed by this document.

### Incident model

A generalization of `WF-010`'s registered-but-inactive contract and the `incidents` table's existing field list (`severity, category, detected_at, owner_id, status, resolved_at`) into an actual governed entity: how an incident is opened (automatically, from a `Quarantined` run or a detected anomaly, or manually, by an operator), how it is triaged and owned, and how it is closed — mirroring the governed-mutation, lifecycle-status discipline already proven for documents rather than inventing a new pattern.

### Recovery/rollback

The `Automation_Architecture.md` Failure and Recovery principles ("last durable checkpoint is authoritative," "recovery resumes only after reconciling external side effects") translated into a concrete recovery procedure: what a checkpoint records, how a run resumes from one, and how "reconciling external side effects" is actually verified rather than assumed, before a `Quarantined` or `Failed` run may be recovered.

### Compensation concepts

`Workflow_Design_Standards.md`'s Compensation model made concrete: compensation as its own explicit, evidenced action (not an assumed inverse of the original step) with stated preconditions, an authority requirement, named irreversible limits (some actions cannot be compensated and must be quarantined instead), and its own evidence trail — distinct from, but structurally similar to, the approval-evidence pattern the Shared Approval/Evidence Primitive already generalizes.

### Execution audit trail

Distinct from `src/services/observability.js`'s existing structured, allowlisted event logging — this is the durable, queryable record of what a run actually did (per-step outcomes, checkpoints, compensation actions taken), generalizing the `runs`/`run_steps` schema contract already specified, in the same spirit as `document_lifecycle_events` for documents: append-only, non-editable, the authoritative history of what happened.

### Checkpoints/idempotency

The one piece of this scope with **no existing design to generalize from** — `Workflow_Design_Standards.md` specifies an idempotency-key *requirement* ("stable idempotency key derived from the workflow, version, workspace, trigger, and governed resource... recorded before performing the side effect") but not a checkpointing mechanism for safe mid-run resumption. This is new design work, not reconciliation of existing sources, and should be scoped and reviewed with that distinction explicit in the eventual Technical Design.

## 5. Dependencies

### What this depends on

Per `COS_Architecture_Implementation_Map.md`'s dependency graph: **only Layer 0** — the existing, implemented workspace/membership model and the `creator_os_private`/RLS/governed-mutation schema patterns already proven for documents. It does **not** depend on the Shared Approval/Evidence Primitive, the Agent Registry, or the Tool Registry — this is the specific finding `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md` Section 5 relied on to recommend this workstream while the approval primitive remains blocked. It also does not depend on any implemented predecessor within its own domain (unlike Phase 7.1, which had one) — see Section 3's "Partially implemented capabilities" finding.

### What depends on this

Per the Roadmap's own sequencing: Phase 8's **Agent Execution Layer**, which requires a demonstrated (not merely designed) recovery path before autonomous agent actions are considered safe to begin, and the **Workflow Engine**, whose own recovery portion (per the Roadmap) "now has a foundation to build on rather than starting blank" once this exists. Both are Phase 8 items and are not started or affected by this planning document.

## 6. Implementation Sequence

Planning-level steps only — no implementation is performed by naming this sequence.

1. **Technical Design** — reconcile the four sources in Section 2 into one coherent design, following the same discipline Phase 7.1's Technical Design applied to its three independently-specified "Approval service" concepts: resolve overlaps (e.g., `Automation_Architecture.md`'s Control plane vs. `Workflow_Registry.md`'s pause/rollback contract fields) rather than building a fifth parallel version of the same idea.
2. **Decision Record** — resolve whatever open design questions the Technical Design surfaces (by analogy with Phase 7.1: likely candidates include checkpoint granularity, quarantine escalation authority, and compensation-authority role requirements) with recommendations for accountable-owner ratification.
3. **Implementation Specification** — translate the ratified design into a concrete conceptual specification, mirroring the Phase 7.1 Implementation Specification's shape.
4. **Schema Design Review** — table names and field lists in prose form, generalizing the already-specified `incidents`, `runs`, and `run_steps` contracts, following `Schema_Specification.md`'s own no-SQL convention.
5. **Migration Design Plan** — sequencing, boundaries, compatibility strategy, and validation gates, additive-only, mirroring the Phase 7.1 Migration Design Plan's structure.
6. **Implementation Readiness Review** — a cross-artifact synthesis identical in method to the Phase 7.1 Readiness Review, checked against this plan's own Section 7 validation strategy before any migration is authorized.

This sequence deliberately mirrors the Phase 7.1 chain exactly — not because the two capabilities are identical, but because that chain is this repository's only proven method for taking a governed capability from open design questions to a readiness determination without gaps, per the Phase 7.1 Readiness Review's own finding of zero cross-document architectural inconsistency.

## 7. Validation Strategy

Consistent with the Phase 6.4 evidentiary standard, restated here as what a future validation record for this capability would need to demonstrate — not evidence that exists today:

- **A live-executed recovery demonstration**, not merely a designed one — the Roadmap's own Phase 8 exit criterion requires "a demonstrated recovery path exercised at least once, not merely designed" before the Agent Execution Layer is considered safe to begin. This plan treats that bar as the standard this capability must eventually clear, not something Phase 8 alone is responsible for proving.
- **A live-executed compensation test** for at least one representative, non-trivial action, confirming compensation preconditions and authority checks are enforced, not merely documented.
- **A live-executed quarantine test** proving an unknown-outcome run is quarantined rather than retried or silently marked successful, per `Automation_Architecture.md`'s Failure and Recovery principle.
- **A live-executed idempotency test** proving a replayed trigger with the same idempotency key does not duplicate a side effect.
- **RLS and governance tests** for the incident and execution-audit tables, mirroring the exact three-tier methodology (active member / non-member / anonymous) already proven for documents in Phase 6.4.

## 8. Security/Governance Considerations

- **Fail closed, not open.** `Automation_Architecture.md`'s own architectural principle — "High-impact, public, destructive, financial, identity, or sensitive actions fail closed without required approval" — applies directly to recovery and compensation actions, which are themselves high-impact by nature.
- **Emergency authority is still governed authority.** `Workflow_Registry.md`'s WF-010 approval model is "Emergency policy," and `Control_Center_Specification.md` requires emergency controls to be "protected, time-bounded, and followed by review" — an incident-response fast path is not an ungoverned one, and this plan's eventual Decision Record must resolve who holds that authority using the same role-based (not person-based) model established in the Phase 7.1 Decision Record's revocation-authority decision.
- **Governed mutations, not direct writes.** Every state change to an incident, run, or execution-audit record must route through a `SECURITY DEFINER` function following the proven `transition_document_lifecycle` pattern — no direct table write grant to any application role, matching the standard every Phase 7.1 document already committed to.
- **Evidence immutability.** The execution audit trail is append-only, matching `document_lifecycle_events`'s convention and the Architectural Constraint the Phase 7.1 Technical Design already recorded as non-negotiable for evidence generally.
- **Relationship to the Shared Approval/Evidence Primitive.** Some Execution Safety Foundations actions (e.g., approving a compensation action, or escalating a quarantined run) are themselves approval-gated. This plan does not assume the shared primitive's specific, unratified shape — per the risk named in `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md` Section 8, any future Technical Design for this capability should reference the approval primitive only as a named future dependency for its own approval-gated steps, not design against decisions that have not yet been ratified.

## 9. Risks

### Design risks

- **Reconciling four sources incompletely.** As with Phase 7.1's three unreconciled "Approval service" specifications, a careless reconciliation could satisfy one source's letter while contradicting another's (e.g., `Automation_Architecture.md`'s "last durable checkpoint is authoritative" vs. an under-specified checkpoint granularity in the new checkpointing design). Requires the same explicit reconciliation discipline Phase 7.1 applied.
- **No existing implemented instance to validate against.** Unlike Phase 7.1, this capability has no live-validated predecessor (Section 3). Every claim in its eventual Technical Design will be a first-of-its-kind design for this repository, not a generalization of proven behavior — this raises the bar for the validation strategy in Section 7 rather than lowering it.
- **Checkpointing/idempotency is genuinely new design**, not reconciliation — treating it as if it were already specified elsewhere (by analogy with how the other four scope items are largely reconciliation work) would understate the design effort actually required.

### Sequencing risks

- **Building this after, rather than before, Phase 8's Agent Execution Layer** — named explicitly as a risk in `COS_Architecture_Implementation_Map.md` Section 4: "real agent actions with no incident model, no recovery path, and no demonstrated compensation... a direct repeat of the shape of the original P62-001 finding." This plan exists specifically to keep that from happening.
- **Designing this capability as if the Shared Approval/Evidence Primitive's unratified decisions were already settled** — would create the same rework risk named for the Agent and Tool Registries in `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md` Section 8, applied to this capability's own approval-gated steps.

### Governance risks

- **Treating "emergency" as "ungoverned."** WF-010's own status is `Proposed`, not `Active` — an incident-response path that bypasses the same evidence and authority discipline the rest of this repository requires would be a regression, not an acceleration.

## 10. Explicit Out of Scope

- **Implementation of any kind** — no table, function, policy, or service module is created by this document.
- **A Technical Design** — reconciling the four sources into one coherent design is named as the first step in Section 6, not performed here.
- **Resolving any open design question** — this plan does not choose between design options; that is the Technical Design and Decision Record's job.
- **The Agent Execution Layer or Workflow Engine themselves** — both are Phase 8 scope and consume this capability once built; this plan does not design either.
- **The Control Center's actual Incident and Recovery Experience UI** — specified in `Control_Center_Specification.md` but explicitly a Phase 9 (User-Facing Intelligence Layer) concern per the Implementation Map; this plan addresses the underlying data/service layer only.
- **Any change to the Shared Approval/Evidence Primitive's status** — it remains blocked pending accountable-owner ratification, unaffected by this document.

## What This Document Does Not Do

- It does not modify any application source file.
- It does not create any database migration or write any SQL.
- It does not claim any part of Execution Safety Foundations is implemented.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not change the Phase 7 → Phase 8 → Phase 9 sequencing established by `COS_Next_Phase_Product_Roadmap.md`.
- It does not authorize implementation to begin — it is a planning scope definition, not a work order.

## References

- [COS-MVP-003 Phase 7 Next Workstream Recommendation](COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md) — the recommendation this plan acts on
- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Readiness Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Readiness_Review.md) — the blocker finding and planning-chain method this document follows
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — dependency graph and build order this plan's Section 5 relies on
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — Phase 7 → Phase 8 → Phase 9 sequencing, preserved unchanged
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md) — including WF-010 Incident Response
- [Control Center Specification](Control_Center_Specification.md) — Incident and Recovery Experience section
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `incidents`, `runs`, `run_steps` contracts this plan's Section 4 generalizes from
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 7 follows

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7 implementation plan for Execution Safety Foundations: objective, four existing architecture sources reconciled at a scope level (Workflow Design Standards, Automation Architecture, Workflow Registry, Control Center Specification), current-state assessment distinguishing existing designs from the absence of any partially-implemented instance, scope definition across five dimensions (incident model, recovery/rollback, compensation, execution audit trail, checkpoints/idempotency — the last flagged as genuinely new design), dependencies (Layer-0-only, no dependency on the blocked approval primitive), a six-step planning sequence mirroring the proven Phase 7.1 chain, a validation strategy anchored to the Roadmap's own Phase 8 exit criteria, security/governance considerations including fail-closed and governed-emergency-authority principles, design/sequencing/governance risks, and explicit out-of-scope boundaries. No implementation performed, no design decision made, no release status changed. |
