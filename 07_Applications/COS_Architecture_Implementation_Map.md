# Creator OS Architecture Implementation Map

**Document owner:** Architecture Owner
**Version:** 1.0
**Status:** Planning Artifact — No Decision Made
**Risk class:** Moderate
**Release status:** Not applicable — this is a planning document, not a capability release

## Purpose

This document bridges `COS_Next_Phase_Product_Roadmap.md`'s architecture-level sequencing (Phase 7 → Phase 8 → Phase 9) and the implementation work that would eventually realize it. For each capability the roadmap names, it maps exactly what design already exists, what's actually built versus only specified, what implementation work remains, what it depends on, what validating it would require, and which phase it belongs to — preserving the roadmap's sequencing and this project's governance principles rather than re-deriving them. **It does not implement anything, does not modify any source or database file, and does not change any release status.**

## 1. Capability-by-Capability Map

### Agent Registry

- **Existing design sources:** `03_AI_Workforce/AI_Workforce_Registry.md` (a working Markdown registry, 8 roles already defined with statuses from Proposed to Approved — AWR-002 Documentation Steward is already `Approved`); `COS-AI-001` through `COS-AI-004` (four fully specified agent roles); `05_Database/Schema_Specification.md` (`agents`, `agent_versions` table contracts).
- **Current implementation status:** **Designed only**, with one caveat: a live `agents` table already exists in production (per Phase 6.4's Supabase advisor scan) with RLS enabled but no policies — provisioned, not implemented, and not yet re-confirmed live as of this document.
- **Required implementation work:** a governed registry service and RLS policies following the exact pattern proven for documents; migration of the Markdown registry's 8 role definitions into governed rows; reconciliation of the live-but-unpoliced `agents` table with whatever this work actually creates.
- **Dependencies:** Workspace/membership model (implemented). The Shared Approval/Evidence Primitive (see below) — `AI_Workforce_Registry.md`'s own rule that "Any autonomy expansion, new sensitive data access, or new external side effect requires Agent Owner and Security Owner approval" means the registry's own Proposed→Approved→Active lifecycle needs a governed approval mechanism, not just a status column.
- **Validation requirements:** live-executed tests against the production database matching the Phase 6.4 standard — valid/invalid lifecycle transitions, RLS-tiered read access, and specifically a denial test proving an agent cannot self-approve its own activation (a rule `AI_Workforce_Registry.md` states explicitly).
- **Recommended phase:** **Phase 7**, per the roadmap.

### Tool Registry

- **Existing design sources:** `04_Tool_Registry/Tool_Registry.md` (lifecycle: Candidate → Approved → Active → Restricted → Deprecated → Retired; four risk classes T1–T4, with T3/T4 requiring explicit safeguards and human approval); `05_Database/Schema_Specification.md` (`tools`, `tool_permissions`, `integrations`, `credential_references`).
- **Current implementation status:** **Designed only.** Same live-but-unpoliced `tools` table caveat as above.
- **Required implementation work:** registry service and RLS following the proven pattern, plus — genuinely new, not a reuse of an existing pattern — real credential storage and rotation design, since nothing built so far in this repository has needed to store a secret.
- **Dependencies:** Workspace/membership model (implemented). The Shared Approval/Evidence Primitive, for the same reason as the Agent Registry — T3/T4 tool approval is already a named requirement in the design, not something to invent later.
- **Validation requirements:** live tests for lifecycle transitions and RLS, plus a dedicated security review of the credential-storage design before any real secret is stored — this is the one capability in Phase 7 that needs a review step beyond the standard evidence pattern.
- **Recommended phase:** **Phase 7**, per the roadmap, in parallel with the Agent Registry.

### Workflow Registry

- **Existing design sources:** `06_Automations/Workflow_Registry.md` (two entries already registered: `COS-WF-001` Document Creation Workflow, and `WF-010` Incident Response, both `Proposed`); `Workflow_Design_Standards.md`; `Automation_Architecture.md` (full logical-component architecture, `Proposed` status); `05_Database/Schema_Specification.md` (`workflows`, `workflow_versions`, `tasks`, `runs`, `run_steps`).
- **Current implementation status:** **Designed only.** This is the most thoroughly specified of the unbuilt capabilities — `Automation_Architecture.md` alone defines eleven logical components (trigger gateway, orchestrator, execution workers, state store, approval service, integration adapters, event bus, artifact store, observability layer, control plane) and a full nine-state run model. Live-but-unpoliced `workflows` table caveat applies here too.
- **Required implementation work:** substantial — this is the Workflow Engine the roadmap schedules in Phase 8. Start from `COS-WF-001` as a concrete first workflow before generalizing, per the roadmap's own recommendation.
- **Dependencies:** Tool Registry and the Shared Approval/Evidence Primitive (both Phase 7, for external-call and approval/handoff steps), Execution Safety Foundations (Phase 7, for the recovery/compensation model `Workflow_Design_Standards.md` already requires).
- **Validation requirements:** live-executed tests for at least one real workflow, covering the full state model (`Queued`→`Running`→`Waiting`/`Paused`→`Succeeded`/`Failed`/`Compensating`/`Cancelled`/`Quarantined`), an approval gate exercised through the shared primitive, and — per `Automation_Architecture.md`'s own acceptance criteria — a demonstrated recovery from an interrupted run, not just a designed one.
- **Recommended phase:** **Phase 8**, per the roadmap (Automation systems, below, fold into this same phase and work).

### Shared Approval/Evidence Primitive

- **Existing design sources:** the implemented, live-validated document pattern (`document_workflow_evidence`, `document_approval_evidence`, `document_lifecycle_events`); `03_AI_Workforce/Agent_Execution_Framework.md`'s "Approval service" component; `06_Automations/Automation_Architecture.md`'s own, independently named "Approval service" logical component ("Records approver identity, decision, scope, expiry, and conditions"); `05_Database/Schema_Specification.md`'s `approvals` table.
- **Current implementation status:** **Partially implemented.** The document-specific instance of this pattern is fully built and live-validated in production (Phase 6.4, 10/10 test cases). The generalized, cross-entity version is not built — but notably, it is independently specified in *three separate places* (documents, Agent Execution Framework, Automation Architecture) that all converge on the same concept without having been reconciled yet.
- **Required implementation work:** abstract the existing tables/function so `subject_type`/`subject_id` can reference a document, workflow, or agent identically; reconcile the three independently-specified "approval service" concepts into one implementation rather than building a fourth.
- **Dependencies:** the existing document evidence tables and `transition_document_lifecycle` pattern (implemented, proven).
- **Validation requirements:** live tests proving the generalized primitive behaves identically to the proven document-specific instance for the document case (regression), plus new tests for a workflow-subject and an agent-subject approval, each independently.
- **Recommended phase:** **Phase 7.** Given both the Agent Registry and Tool Registry's own lifecycle transitions reference approval requirements already in their design docs, this is a strong candidate to build *first* within Phase 7 — see Recommended Build Order below.

### Execution Safety Foundations

- **Existing design sources:** `06_Automations/Workflow_Design_Standards.md` (explicit Recovery requirement: "Pause, resume, replay, manual intervention, and rollback"; a full Compensation model with preconditions, authority, irreversible limits, and evidence); `Automation_Architecture.md` (Control plane component, Observability layer capturing incidents, a full Failure and Recovery section, and a `Quarantined` run state for unsafe/unknown outcomes); `Workflow_Registry.md`'s `WF-010` Incident Response workflow; `07_Applications/Control_Center_Specification.md`'s own "Incident and Recovery Experience" section — meaning this capability is specified at the automation layer *and* the user-facing layer already; `05_Database/Schema_Specification.md`'s `incidents` table.
- **Current implementation status:** **Designed only**, and more thoroughly designed than any other unbuilt capability in this map — four separate documents already describe complementary pieces of it. Nothing has been reconciled into a buildable, shared primitive yet.
- **Required implementation work:** generalize and implement the already-designed recovery, compensation, and incident-response patterns as a shared Creator OS primitive; add idempotency and checkpointing for safe replay and resumable execution — the one genuinely new piece not already covered by existing specifications.
- **Dependencies:** none beyond the existing schema and design patterns; does not depend on the Agent or Tool Registry, which is why it belongs alongside them in Phase 7, not after.
- **Validation requirements:** a live-executed demonstration of at least one full recovery cycle (interrupt a run, confirm quarantine or safe compensation, confirm recovery) — per the roadmap's own Phase 8 exit criteria, a *demonstrated*, not merely designed, recovery path is required before Agent Execution Layer work is considered safe to begin.
- **Recommended phase:** **Phase 7**, explicitly before Phase 8's Agent Execution Layer.

### Knowledge/Memory Foundations

- **Existing design sources:** for the document-knowledge half — the fully implemented Documentation Registry (COS-MVP-002) itself. For the agent-memory half — none. No architecture document in this repository addresses agent-scoped, relevance-ranked memory.
- **Current implementation status:** **Partially implemented.** The document-knowledge half is live, validated, and already delivering value. The agent-memory half does not exist as a design, not just as code.
- **Required implementation work:** none for the document half beyond ongoing refinement. For agent memory: this needs a design phase before an implementation phase — likely involving embeddings/vector search, which nothing in this stack currently has.
- **Dependencies:** Documentation Registry (implemented) for the knowledge half. Agent Execution Layer (Phase 8) as the actual consumer that should inform the agent-memory design, per the roadmap's own reasoning that building memory before there are agents to use it would be premature.
- **Validation requirements:** for agent memory specifically, this cannot be scoped precisely until the design exists — validation requirements should be defined alongside that design, not assumed now.
- **Recommended phase:** document-knowledge refinement is ongoing, no new phase. Agent memory: **Phase 9**, per the roadmap.

### Workspace Concepts

- **Existing design sources:** `05_Database/Schema_Specification.md` (`workspaces`, `profiles`, `roles`, `memberships`); `07_Applications/Control_Center_User_Workspace_Model.md` (a full UI-facing workspace model: core model, entities, roles, workspace selection, environment model, capability resolution, membership lifecycle, delegation/acting roles, preferences, workspace search, session/cache safety, audit, and its own Failure and Recovery and Testing sections); `Control_Center_Specification.md` (the broader shell this model serves).
- **Current implementation status:** **Partially implemented.** The data-layer concept (`creator_os_workspaces`, `creator_os_workspace_memberships`) is fully implemented, live, and proven across both MVPs. The richer UI-facing model in `Control_Center_User_Workspace_Model.md` — capability resolution, delegation/acting roles, workspace search — is designed only and not reflected in the current minimal client.
- **Required implementation work:** the User Workspace System (Control Center) itself — the UI/aggregation layer described in Section 2 below.
- **Dependencies:** the existing data-layer workspace model (implemented) and, for genuine value, more than one registry worth unifying.
- **Validation requirements:** per `Control_Center_User_Workspace_Model.md`'s own Testing and Acceptance Criteria sections once implementation begins — this document already defines its own bar, not something this map needs to invent.
- **Recommended phase:** the data layer is already done. The UI shell: **Phase 9**, per the roadmap.

### Automation Systems

- **Existing design sources:** `06_Automations/Automation_Architecture.md` (the full architecture, `Proposed` status); `Workflow_Design_Standards.md`; `Integration_Standards.md`; `Automation_Testing_Framework.md`; `Agent_Handoff_Standards.md`.
- **Current implementation status:** **Designed only.** Nothing in this space is implemented.
- **Required implementation work:** as the roadmap already concluded, this should not be built as a separate module — it is the execution/trigger subsystem underneath the Workflow Registry/Engine above, and duplicating that design would violate the roadmap's own "Composable before bespoke" principle.
- **Dependencies:** Workflow Registry/Engine.
- **Validation requirements:** covered by the Workflow Registry's validation requirements above — this is not a separately validated capability.
- **Recommended phase:** **Phase 8**, folded into the Workflow Registry/Engine work, per the roadmap.

## 2. Architecture Dependencies Graph

Presented as layers — everything in a layer depends only on capabilities in the layers above it, never below or sideways within the same layer unless stated:

```
Layer 0 — Already Implemented (COS-MVP-001 / COS-MVP-002)
├── Workspace / Membership data model
├── Governed-mutation pattern (transition_document_lifecycle)
├── RLS-tiered access pattern
├── Observability service (observability.js)
└── Document-knowledge (Documentation Registry)

Layer 1 — Phase 7 (Foundation)
├── Shared Approval/Evidence Primitive ── depends on Layer 0 (document evidence pattern)
├── Execution Safety Foundations ────────  depends on Layer 0 (schema patterns only)
├── Agent Registry ──────────────────────  depends on Layer 0 + Shared Approval Primitive
└── Tool Registry ───────────────────────  depends on Layer 0 + Shared Approval Primitive

Layer 2 — Phase 8 (Core OS Capabilities)
├── Workflow Registry / Engine ──────────  depends on Tool Registry, Shared Approval Primitive,
│                                          Execution Safety Foundations (all Layer 1)
├── Automation Systems ──────────────────  folded into Workflow Registry/Engine, same dependencies
└── Agent Execution Layer ───────────────  depends on Agent Registry, Tool Registry, Shared Approval
                                           Primitive, Execution Safety Foundations (Layer 1) and
                                           Workflow Registry/Engine (Layer 2)

Layer 3 — Phase 9 (User-Facing Intelligence Layer)
├── User Workspace System (Control Center) ── depends on however many Layer 1/2 registries exist
├── Agent Memory ───────────────────────────  depends on Agent Execution Layer (Layer 2)
└── Content Operating System ───────────────  deferred; scoping pass depends on User Workspace
                                              System + Knowledge/Memory, not sequenced into a phase
```

## 3. Recommended Build Order

Within Phase 7, order matters even though the roadmap treats these as parallel-eligible:

1. **Shared Approval/Evidence Primitive first.** Both the Agent Registry and Tool Registry's own lifecycle transitions (Proposed→Approved→Active) already reference approval requirements in their existing design docs — building the registries before this primitive exists risks each inventing its own one-off approval mechanism, exactly the "bespoke" outcome the roadmap's "Composable before bespoke" principle exists to prevent.
2. **Execution Safety Foundations, in parallel with step 1** — no dependency on the registries, so no reason to sequence it after them.
3. **Agent Registry and Tool Registry, in parallel with each other**, once step 1 exists to consume — each also independently gated on Workspace/membership (already implemented).

Within Phase 8:

4. **Workflow Registry/Engine**, starting from `COS-WF-001`, once all of Phase 7 is validated.
5. **Agent Execution Layer**, only after the Workflow Engine can represent multi-step, approval-gated work — this is the roadmap's existing gate, unchanged here.

Within Phase 9: User Workspace System, then Agent Memory (which needs real execution history to be meaningful), with the Content OS scoping pass informed by both.

## 4. Risks of Implementing Out of Order

- **Agent or Tool Registry before the Shared Approval Primitive:** each builds its own bespoke approval mechanism for lifecycle activation, which then has to be migrated onto the shared primitive later — duplicated work, and a direct violation of "Composable before bespoke."
- **Agent Execution Layer before Execution Safety Foundations:** real agent actions with no incident model, no recovery path, and no demonstrated compensation — a direct repeat of the shape of the original P62-001 finding (automation ahead of governance), and a violation of the System Charter's "Observable and reversible" principle. `Automation_Architecture.md`'s own architectural principles state failure and recovery must exist before automation runs, not after.
- **Workflow Engine before Tool Registry:** workflow steps that call external tools would have no governed credential or permission boundary — exactly the ungoverned external-call risk `Automation_Architecture.md`'s "Trust and Security Boundaries" section warns against.
- **User Workspace System before more than one Layer 1/2 registry exists:** a dashboard unifying nothing yet — already identified as a risk in the roadmap itself, restated here because it remains true after this more detailed mapping.
- **Content Operating System sequenced into any phase without its scoping pass:** planning against an undefined target, and risks silently deciding the separate-module-vs-evolution-of-User-Workspace-System question by default rather than by explicit choice, exactly what the roadmap's Section 2 already flags as unresolved.

## What This Document Preserves

- **Creator OS final vision** — unchanged; every capability here traces to the System Charter and Capability Map, not to new scope invented in this document.
- **Phase 7 → Phase 8 → Phase 9 sequencing** — unchanged from the roadmap; this document maps implementation detail onto that sequence, it does not renegotiate it.
- **Governance principles** — every capability's validation requirements reference the Phase 6.4 evidence standard and the governed-mutation pattern; nothing here proposes a lighter bar.

## What This Document Does Not Do

- It does not implement any code, schema, or migration.
- It does not modify any source or database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not authorize work to begin on any phase.

## References

- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — the architecture this document maps to implementation
- [System Charter](../00_Governance/System_Charter.md)
- [Capability Map](../01_Architecture/Capability_Map.md)
- [Schema Specification](../05_Database/Schema_Specification.md)
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md), [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md), [Agent Evaluation Framework](../03_AI_Workforce/Agent_Evaluation_Framework.md), [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md), [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md), [Automation Architecture](../06_Automations/Automation_Architecture.md), [COS-WF-001 Document Creation Workflow](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)
- [Control Center Specification](Control_Center_Specification.md), [Control Center User Workspace Model](Control_Center_User_Workspace_Model.md)
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard every validation requirement above references

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial implementation map: eight capabilities mapped against existing design sources, implementation status, required work, dependencies, validation requirements, and phase; a layered dependency graph; a recommended build order within Phase 7 and Phase 8; and five concrete out-of-order implementation risks. No decision made, no implementation performed. |
