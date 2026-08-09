# COS-MVP-003 Phase 7 Implementation Plan

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.1
**Document owner:** Architecture Owner and Data Owner
**Status:** Planning Artifact — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning document, no capability exists to release yet

## Purpose

This is the implementation plan for the first Phase 7 foundation named in `COS_Next_Phase_Product_Roadmap.md` and `COS_Architecture_Implementation_Map.md`: the Shared Approval/Evidence Primitive. It turns that architecture-level entry into an implementation-level plan — scope, dependencies, validation strategy, and risks — without performing any of the work it describes. **No source file is modified, no migration is created, no release status changes, and no tag or release is created by this document.** COS-MVP-002 remains Not Released, and nothing here depends on or affects that decision.

## 1. Objective

Generalize the governed-mutation and evidence pattern already implemented and live-validated for documents (COS-MVP-002, Phase 6.4) into a reusable, subject-agnostic capability: one governed way to record "who approved what, against which version, with what evidence," usable by any future governed entity — starting with, but not limited to, the Agent Registry and Tool Registry the roadmap schedules immediately after this primitive in Phase 7.

This is explicitly a **consolidation** objective, not a new-invention objective. Three independent designs already converge on this same concept without having been reconciled:

1. The implemented, live document pattern (`document_workflow_evidence`, `document_approval_evidence`, `document_lifecycle_events`, and `creator_os_private.transition_document_lifecycle`).
2. `03_AI_Workforce/Agent_Execution_Framework.md`'s specified "Approval service" component ("Records exact decision, scope, approver, conditions, and expiry").
3. `06_Automations/Automation_Architecture.md`'s independently specified "Approval service" logical component, with near-identical wording.

Phase 7.1's job is to reconcile these three into one implementation, not to add a fourth.

## 2. Existing Architecture Sources

### `document_approval_evidence` pattern (implemented, live-validated)

The proven reference implementation. Exact structure, from `supabase/migrations/20260807160058_cos_mvp_002_lifecycle_governance_v1.sql`:

- `document_workflow_evidence` — binds a workflow (`COS-WF-001`) run's state (`started`/`review_complete`/`approved`/`published`/`failed`/`cancelled`) to an exact document version, with `initiated_by`, `completed_by`, and an `evidence_ref`.
- `document_approval_evidence` — binds an explicit approver decision (`approved`/`rejected`/`abstained`) to a specific workflow-evidence record, document version, and `candidate_content_hash`, with a required `acceptance_statement`.
- `document_lifecycle_events` — an append-only audit trail of every transition, referencing the workflow evidence, approval evidence, and `document_provenance` used to authorize it.
- `creator_os_private.transition_document_lifecycle` — the `SECURITY DEFINER` function that is the only path to mutating `documents.status`, re-verifying actor identity, workspace role, provenance, the transition-graph legality, and (for publication specifically) both evidence records, before writing anything.

This is the pattern to generalize, not to re-derive.

### Agent Execution Framework Approval service

`03_AI_Workforce/Agent_Execution_Framework.md` specifies an "Approval service" as one of its logical components, responsible for recording "exact decision, scope, approver, conditions, and expiry," and states as an architectural principle that "Agents cannot approve their own permissions, evaluations, or production activation" and "Consequential actions require the applicable human or system approval." This is currently a specification with no implementation — Phase 7.1 is where it would first become real, as a consumer of the shared primitive rather than a bespoke build.

### Automation governance concepts

`06_Automations/Automation_Architecture.md` independently names its own "Approval service" logical component with near-identical responsibility, and `Workflow_Design_Standards.md` requires an explicit Compensation model with "preconditions, authority, irreversible limits, and evidence" for any workflow reversal — a related but distinct governance concept (approval gates a forward action; compensation governs undoing one). `05_Database/Schema_Specification.md`'s `approvals` table (`subject_type, subject_id, approver_id, decision, reason, expires_at`) and `03_AI_Workforce/Agent_Tool_Permissions.md`'s `approval_policy` concept ("Approver, action boundary, conditions, and expiry") both describe the same subject-agnostic shape this primitive needs to implement.

## 3. Proposed Implementation Scope

Stated as scope to be planned and reviewed, not executed by this document.

### Database requirements

- Generalize `document_workflow_evidence` → a `workflow_evidence` table (or equivalent) where `document_id` becomes a polymorphic `subject_type`/`subject_id` pair (or a set of nullable typed foreign keys, to be decided during design review — this plan does not prescribe which), consistent with the `approvals` table shape already in `Schema_Specification.md`.
- Generalize `document_approval_evidence` → `approval_evidence`, same subject-agnostic approach, preserving the existing requirement that approval bind to an exact version and `content_hash`.
- Generalize `document_lifecycle_events` → a shared append-only evidence/audit table, or confirm per-subject-type event tables remain preferable — an explicit design decision to make, not assume.
- The existing document-specific tables and `transition_document_lifecycle` function are not to be dropped or altered as part of this scope — regression safety for the already-shipped COS-MVP-002 capability takes priority over eager cleanup. Migration path (document tables → shared tables, or document tables as a thin view over shared ones) is a design decision for the actual implementation phase, not this plan.

### Service layer requirements

- A subject-agnostic approval/evidence client-service module, mirroring the existing `documentRegistryService.js` pattern (validated input, RPC-only mutation, no direct table writes).
- Any existing or future registry service (Agent Registry, Tool Registry, and eventually Workflow Registry) consumes this module rather than reimplementing evidence recording.

### Security/RLS requirements

- RLS from the start, workspace-scoped, mirroring the three-tier read model already proven for documents (active member / non-member / anonymous).
- The generalized mutation path must preserve every guarantee the current `transition_document_lifecycle` proves: actor-identity match to the authenticated session, active workspace owner/administrator role required, no self-approval (an agent, tool, or workflow subject cannot satisfy its own approval requirement — directly required by `Agent_Execution_Framework.md`), and no direct table write path for any application role.
- Because this primitive will be consumed by not-yet-built subjects (agents, tools), its authorization checks must be subject-type-aware from the start — a bug here would silently under-govern every future consumer, not just this one.

### Versioning requirements

- Every approval/evidence record must bind to an exact subject version, not just a subject identity — the same discipline already proven for documents (`candidate_content_hash` matched against the document's live `content_hash` at approval time), generalized to whatever versioning scheme the eventual subject (agent, tool, workflow) uses.

### Evidence requirements

- Preserve the append-only, non-editable, non-deletable audit trail property already proven for `document_lifecycle_events` — no `UPDATE`/`DELETE` grant to any application role, ever.
- Preserve the requirement that a reason/acceptance statement of meaningful length is required, not optional, for any transition or approval — already enforced for documents and should not be relaxed in generalization.

## 4. Dependencies

### What this unlocks

- **Agent Registry (Phase 7)** — its Proposed→Approved→Active lifecycle, and its explicit "cannot approve its own permissions, evaluations, or production activation" rule, needs a governed approval mechanism to exist before its own lifecycle transitions can be implemented correctly.
- **Tool Registry (Phase 7)** — its T3/T4 risk-class actions, which `Tool_Registry.md` already states require explicit human approval, have the same need.
- **Workflow Registry/Engine and Agent Execution Layer (Phase 8)** — both are specified to consume an approval service; this primitive is what lets them do so without each building their own.

### What depends on it

Per `COS_Architecture_Implementation_Map.md`'s dependency graph: Agent Registry, Tool Registry (both Phase 7), and transitively, Workflow Registry/Engine and Agent Execution Layer (Phase 8). Nothing in Phase 9 depends on this directly, only transitively through Phase 8.

### What it depends on

Only what already exists and is proven: the workspace/membership model, the `document_approval_evidence` pattern itself, and the `creator_os_private` schema pattern for `SECURITY DEFINER` functions. No new external dependency.

## 5. Validation Strategy

Consistent with the Phase 6.4 evidentiary standard — live-executed evidence, not source review, before this primitive is considered validated:

### Tests

- A regression test proving the generalized primitive produces identical behavior to the current document-specific implementation for the document case — this must not silently change COS-MVP-002's already-shipped behavior.
- New live tests for a workflow-subject and an agent-subject approval, each independently, covering: valid approval, missing evidence, incorrect/fabricated evidence, and self-approval denial specifically (the one new authorization rule this generalization introduces beyond what documents needed).

### Governance checks

- Confirm the reconciliation actually resolves all three source specifications (document pattern, Agent Execution Framework's Approval service, Automation Architecture's Approval service) into one implementation, not a fourth parallel one — a design review checkpoint, not an automated test.
- Explicit accountable-owner sign-off that the generalized primitive is what `Agent_Execution_Framework.md` and `Automation_Architecture.md` meant by "Approval service," not a reinterpretation.

### Security checks

- Live-executed RLS denial tests at all three tiers (active member, non-member, anonymous) for the new tables, mirroring Phase 6.4's methodology exactly.
- A specific, live-executed denial test proving a subject cannot self-approve — this is a new rule relative to the document case (documents don't "approve themselves"; agents and tools, as autonomous actors, plausibly could without this explicit check) and deserves its own dedicated test, not incidental coverage.

## 6. Risks

### Implementation risks

- **Over-generalizing before there's a second real consumer.** Building an abstraction against only one proven use case (documents) and a description of two more (agents, tools) that don't exist yet risks guessing wrong about the right shape. Mitigate by keeping the document case's exact behavior as a hard regression bar, and treating the Agent Registry's first real use as the point the abstraction gets validated, not assumed correct.
- **Silent divergence between the three source specifications.** If reconciliation isn't done carefully, the implementation could satisfy the letter of one spec while quietly contradicting another (e.g., expiry handling differs between `Agent_Tool_Permissions.md`'s `approval_policy` and the document pattern's lack of an expiry concept at all). This needs an explicit reconciliation decision, not an implicit one.

### Migration risks

- **Regression to the already-shipped COS-MVP-002 capability.** Any change to or replacement of `document_workflow_evidence`/`document_approval_evidence`/`document_lifecycle_events` risks breaking a capability that has already passed Phase 6.4's live validation. This is why the scope above explicitly does not assume dropping or altering the existing tables — that decision needs its own review, separate from building the new shared primitive.
- **No rollback path has been designed yet for a schema generalization of this kind** — this plan does not assume Execution Safety Foundations (the sibling Phase 7 primitive) is complete before this work starts, but a migration this consequential should not proceed without at least a manual rollback plan, even before the generalized recovery primitive exists.

### Permission risks

- **Under-governing a future consumer by building authorization logic only against the document case.** The self-approval denial rule specifically does not exist in the document pattern today (a document doesn't approve itself) and must be added deliberately for agent/tool subjects — a real, non-hypothetical gap if this generalization is done by mechanically copying the document pattern rather than reasoning about what each new subject type actually needs.
- **RLS policy drift** between the existing document tables and any new shared tables if both are kept — two similar-but-not-identical governance surfaces existing side by side, as happened briefly with the stale document-update policy in COS-MVP-002 Phase 6.3, is a known failure mode in this exact codebase and should be watched for explicitly here.

## 7. Explicitly Out of Scope

The following are named in the roadmap and implementation map as later work and are **not** part of Phase 7.1:

- **Agent Runtime** — actually executing an agent against a real task. Phase 7.1 only builds the approval/evidence mechanism an eventual Agent Execution Layer (Phase 8) would consume; it does not build, invoke, or test any agent execution.
- **Workflow execution** — the Workflow Registry/Engine's actual orchestration, state machine, and run execution (Phase 8). Phase 7.1 does not implement any workflow-running capability.
- **Tool execution** — actually invoking an external tool or integration. Phase 7.1 does not build tool-calling, credential use, or integration-adapter capability.
- **User-facing applications** — any UI surface (Control Center, dashboards, or any client-visible approval interface). Phase 7.1 is a database/service-layer primitive only; how it's eventually surfaced to a human approver is Phase 9 scope.

## Open Design Decisions

These are unresolved architectural questions that implementation must answer — recorded here so they are decided deliberately during implementation, not defaulted into by whichever approach is easiest to code first. This section intentionally does not select an answer for any of them.

- **Subject reference model.** Should a generalized evidence record reference its subject (document, agent, tool, workflow) through a polymorphic `subject_type`/`subject_id` pair, as `05_Database/Schema_Specification.md`'s `approvals` table already models, or through a set of nullable typed foreign keys, one per subject type? Each has different tradeoffs for referential integrity, query simplicity, and how cleanly new subject types can be added later without a migration.
- **Approval scope model.** What exactly does a single approval authorize — one field, one version, one lifecycle transition, or a bundle of related changes? The document pattern binds approval to an exact version and content hash; `Agent_Tool_Permissions.md`'s `approval_policy` additionally scopes by "action boundary" and "conditions." Whether the generalized primitive needs a richer scope model than the document case required, or whether the document case's model is already sufficient, is not yet decided.
- **Evidence retention strategy.** How long does approval/evidence data live, under what retention policy, and does that differ by subject type (a document's publication history may warrant different retention than an agent's permission-grant history)? The document pattern has not needed to answer this yet because COS-MVP-002 has not run long enough to force the question; generalizing to new subject types is an opportunity to decide it deliberately rather than inherit an unexamined default.
- **Approval expiry/revalidation behavior.** The document pattern has no expiry concept — an approval, once recorded, stands. `05_Database/Schema_Specification.md`'s `approvals` table includes `expires_at`, and `Agent_Tool_Permissions.md`'s `approval_policy` includes "conditions, and expiry" explicitly. Whether the generalized primitive needs expiring approvals (and, if so, what revalidation looks like when one expires mid-use) is unresolved and may differ meaningfully by subject type — an agent's permission grant plausibly *should* expire in a way a document's publication approval does not.

## What This Document Does Not Do

- It does not modify any application source file.
- It does not create any database migration.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not authorize implementation to begin — it is a plan for review, not a work order.

## References

- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md)
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md)
- [COS-MVP-002 Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md) — origin of the proven document evidence pattern this primitive generalizes
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard this plan's validation strategy follows
- [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md), [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md), [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Schema Specification](../05_Database/Schema_Specification.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7.1 implementation plan for the Shared Approval/Evidence Primitive: objective, three reconciled architecture sources, implementation scope across database/service/security/versioning/evidence dimensions, dependencies (what it unlocks and what it depends on), a validation strategy following the Phase 6.4 standard, implementation/migration/permission risks, and explicit out-of-scope boundaries (Agent Runtime, Workflow execution, Tool execution, user-facing applications). No implementation performed. |
| 1.1 | Added "Open Design Decisions" section recording four unresolved architectural questions (subject reference model, approval scope model, evidence retention strategy, approval expiry/revalidation behavior) without selecting an answer for any of them. No existing section modified, no scope change. |
