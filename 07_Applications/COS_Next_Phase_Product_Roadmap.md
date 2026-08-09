# Creator OS Foundry — Next Phase Product Roadmap

**Document owner:** Architecture Owner and Product Owner
**Version:** 1.0
**Status:** Planning Artifact — No Decision Made
**Risk class:** Moderate
**Release status:** Not applicable — this is a planning document, not a capability release

## Purpose

This roadmap defines the next evolution of Creator OS Foundry after Documentation Center (COS-MVP-002) stabilization. It analyzes what exists today, evaluates candidate next modules against the project's own stated Capability Map, and recommends a sequence. **It does not choose a release decision, does not implement anything, and does not modify any source file.** It is a planning input for the Architecture Owner and Product Owner, not an authorization to build.

## 1. Current System Capabilities

### What exists and is actually implemented today

| Capability | State | Evidence |
| --- | --- | --- |
| System Registry (COS-MVP-001) | Implemented, released as Internal MVP | `src/services/systemRegistryService.js`, migrations `20260807021642`/`20260807032902` |
| Documentation Registry (COS-MVP-002) | Implemented, validated, Internal MVP release pending accountable-owner decision | `src/services/documentRegistryService.js`, migrations `20260807153019` through `20260807161500` |
| Governed lifecycle transitions | Implemented and live-validated (10/10 production test cases) | `creator_os_private.transition_document_lifecycle`, Phase 6.4 Validation Record |
| Workspace and membership model | Implemented, used by both MVPs | `creator_os_workspaces`, `creator_os_workspace_memberships` tables, role-based (`owner`/`administrator`/`viewer`) |
| Passwordless authentication | Implemented, config validated; capacity-constrained on Supabase's default email tier | `src/main.js` `signInWithOtp` flow, Phase 6.6 Authentication Dependency Blocker |
| Structured observability | Implemented, minimal | `src/services/observability.js` — allowlisted, sanitized event emission |
| Node runtime management | Resolved via `fnm`, environment-level | Phase 6.6 |

### What foundations are now reliable

- **The governed-mutation pattern.** Direct table writes revoked from `authenticated`; all state changes routed through a `SECURITY DEFINER` function that re-verifies provenance, authorization role, and (where applicable) evidence, with an append-only audit trail. This is proven in production for documents (P62-001, Phase 6.4) and is the template every future stateful module should reuse rather than reinvent.
- **RLS-tiered read access**, proven at three levels (active member / non-member / anonymous), each independently denying or allowing at the correct layer (grant vs. row-filter).
- **Workspace-scoped multi-tenancy** — every table built so far is `workspace_id`-scoped, and every RLS policy checks active membership, not just authentication. This generalizes directly to any new module.
- **The phase-numbered evidence discipline itself** (validation records, remediation plans, decision packages) — not a technical asset, but a working governance process now proven across two MVPs.

### What infrastructure can be reused

- **Database:** the `creator_os_workspaces`/`creator_os_workspace_memberships` schema, the `creator_os_private` schema pattern for definer-rights functions, the evidence-table pattern (`document_workflow_evidence`, `document_approval_evidence`, `document_lifecycle_events`) as a template for any future governed entity.
- **Client:** `src/config.js`'s environment-validation pattern, `src/services/observability.js` as-is for any new service, the existing Vite/vanilla-JS build with no new framework dependency required for a first slice of any new module.
- **Process:** the Phase X.Y validation-record and remediation-plan templates used throughout COS-MVP-002 Phase 6.

### Important caveat on "what's missing" — most of it is already designed, just not built

Before evaluating candidate modules, one fact materially changes the shape of this roadmap: **this repository already contains detailed architectural specifications for nearly every module below, and the live database already has skeleton tables for several of them.** Specifically:

- `05_Database/Schema_Specification.md` already defines full table contracts for `agents`, `agent_versions`, `tools`, `tool_permissions`, `workflows`, `workflow_versions`, `tasks`, `runs`, `run_steps`, `evaluations`, `incidents`, `integrations`, `credential_references`, `usage_records`, and `notifications` — none of which have corresponding application code or tracked migrations in this repository yet.
- `03_AI_Workforce/` already contains an agent-execution architecture (`Agent_Execution_Framework.md`, `Agent_Context_Management.md`, `Agent_Deployment_Model.md`, `Agent_Tool_Permissions.md`, `Agent_Evaluation_Framework.md`) and four fully specified agent roles (`COS-AI-001` through `COS-AI-004`) — specified, not implemented.
- `04_Tool_Registry/Tool_Registry.md` and `06_Automations/` (`Workflow_Registry.md`, `Automation_Architecture.md`, `COS-WF-001_Document_Creation_Workflow.md`) are the same: designed, not built.
- `07_Applications/Control_Center_*.md` (Specification, Dashboard Data Model, User Workspace Model, API Requirements) describes a user-facing workspace shell that has not been implemented.
- **Previously observed, not re-verified this session** (from Phase 6.4's live Supabase security-advisor scan): tables named `agents`, `decisions`, `systems`, `tools`, `versions`, and `workflows` already exist in the live production database, with RLS enabled but **no policies attached** — meaning they are provisioned but inert and inaccessible. This is a real, live fact worth confirming again before any module in this space begins, not an assumption to build on blindly.

This means the primary work ahead for most modules is **implementation against an existing design**, not fresh architecture — which materially lowers technical-complexity estimates below compared to a greenfield build, but does not eliminate the need to re-validate those designs against what's actually been learned since they were written (e.g., the governed-mutation pattern didn't exist when some of these specs were drafted, and should now be retrofitted into them).

## 2. Missing OS Capabilities — Evaluation

For each candidate module: purpose, user value, technical complexity (relative to what's already designed, not from scratch), dependencies, and a recommended phase (Phase 7, 8, or 9 — see Section 3).

### AI Agent Registry

- **Purpose:** a governed catalog of AI agent roles (identity, risk level, status, versioned specifications) — the "who" of AI work.
- **User value:** indirect but foundational — nothing else in the "Execute with AI" capability can exist safely without knowing which agents exist, who owns them, and what they're allowed to do.
- **Technical complexity:** Low-to-moderate. Schema already fully specified (`agents`, `agent_versions`). Four agent specs already written. Primary work is implementing the registry service and UI following the exact pattern already proven for documents, plus reconciling with the already-provisioned (but unpoliced) live `agents` table.
- **Dependencies:** Workspace/membership model (exists). The governed-mutation pattern (exists, proven).
- **Recommended phase:** **Phase 7 (Foundation).**

### Tool Registry

- **Purpose:** a governed catalog of approved external tools/integrations, their risk classification, and permission scopes.
- **User value:** indirect — a prerequisite for safe agent tool use and for any automation that calls external services.
- **Technical complexity:** Low-to-moderate. Schema specified (`tools`, `tool_permissions`, `integrations`, `credential_references`). Credential handling requires deliberate security design (this repo has never yet implemented secret storage/rotation — a genuinely new concern, not just a reuse of existing patterns).
- **Dependencies:** Workspace/membership model (exists). Security review for credential storage (new).
- **Recommended phase:** **Phase 7 (Foundation),** in parallel with the Agent Registry — they share almost no technical risk with each other but both gate the Agent Execution Layer.

### Agent Execution Layer

- **Purpose:** actually running AI agents against real tasks — context assembly, tool invocation, approval gates at consequential decisions, and evaluation.
- **User value:** high and direct — this is where "AI does work" becomes real rather than documented.
- **Technical complexity:** High. This is qualitatively different from anything built so far — it involves live model invocation, tool-call orchestration, and real-time approval gating, not just CRUD over governed records. The existing `Agent_Execution_Framework.md` and `Agent_Evaluation_Framework.md` provide a starting design, but this is the module most likely to reveal gaps in that design once implementation starts.
- **Dependencies:** AI Agent Registry, Tool Registry, and — critically — a Workflow Engine capable of representing multi-step agent work with approval checkpoints.
- **Recommended phase:** **Phase 8 (Core OS Capabilities).** Should not start before both registries exist and are governed.

### Workflow Engine

- **Purpose:** define, version, and execute multi-step processes — human, agent, or automation-driven — with dependencies, approvals, and handoffs.
- **User value:** high — this is the connective tissue that makes "Plan and Coordinate" real, and what turns isolated registries into an actual operating system.
- **Technical complexity:** High. Schema specified (`workflows`, `workflow_versions`, `tasks`, `runs`, `run_steps`), and one concrete workflow is already specified (`COS-WF-001_Document_Creation_Workflow.md`) as a worked example, which meaningfully de-risks the first implementation slice. The general execution engine (retries, idempotency, timeouts, recovery — per the Capability Map's "Automate Operations" section) is still a substantial, novel build.
- **Dependencies:** Tool Registry (for any step that calls external services); benefits from, but does not strictly require, the Agent Registry if the first version only orchestrates human/automation steps.
- **Recommended phase:** **Phase 8 (Core OS Capabilities),** starting with the already-specified COS-WF-001 as its first real workflow before generalizing.

### Automation Layer

- **Purpose:** the scheduling/triggering runtime underneath the Workflow Engine — scheduled, event-driven, and human-triggered execution.
- **User value:** moderate directly, high indirectly — it's what makes workflows actually run without a human clicking "start" every time.
- **Technical complexity:** Moderate, but overlaps substantially with the Workflow Engine's `runs`/`run_steps` execution model. Treating this as a fully separate module risks duplicate design; recommend scoping it as the Workflow Engine's execution/trigger subsystem rather than an independent module.
- **Dependencies:** Workflow Engine.
- **Recommended phase:** **Phase 8, as part of the Workflow Engine work**, not a separate phase.

### Knowledge / Memory System

- **Purpose:** durable, retrievable context — both the versioned-document knowledge base (already partially built via COS-MVP-002) and, distinctly, agent-facing memory (what an agent remembers across runs).
- **User value:** high for the document-retrieval half (already delivering value today); the agent-memory half is currently undesigned in this repository and has no user-facing value until the Agent Execution Layer exists to consume it.
- **Technical complexity:** The document half is largely **already built** (COS-MVP-002). The agent-memory half is a genuinely new, undesigned problem — no schema, no architecture doc addresses it yet. This should not be scoped as "extend the Documentation Registry"; it is a different retrieval and freshness problem (relevance-ranked, agent-scoped, likely requiring embeddings/vector search, none of which this stack currently has).
- **Dependencies:** Documentation Registry (exists) for the knowledge half. Agent Execution Layer (Phase 8) as the actual consumer for the memory half — building agent memory before there are agents to use it would be premature.
- **Recommended phase:** Document-retrieval refinements can continue incrementally now (not a new phase). Agent memory: **Phase 9 (User-Facing Intelligence Layer)**, once the Agent Execution Layer exists and reveals what it actually needs.

### Content Operating System

- **Purpose:** as named, the least defined of all candidates in this repository — no existing architecture doc addresses a "content operating system" distinct from Documentation Registry and the not-yet-built creator-facing applications implied by `Control_Center_*` specs.
- **User value:** unknown until scoped — this needs a product-definition pass before a technical evaluation is meaningful.
- **Technical complexity:** Unassessable at this time given the lack of a design to evaluate against.
- **Dependencies:** Likely the User Workspace System and Knowledge System, but this is speculative without a scoping exercise.
- **Recommended phase:** **Not sequenced.** Recommend a dedicated scoping/definition pass (product discovery, not implementation) before this enters any phase plan — including it in Phase 8 or 9 without that pass would be planning against an undefined target.

### User Workspace System

- **Purpose:** the shell/UI layer where a creator actually experiences Creator OS — dashboards, navigation across modules, workspace-level settings.
- **User value:** high — every other module's value is bottlenecked by whether a user can actually reach it coherently.
- **Technical complexity:** Moderate. `Control_Center_Specification.md`, `Control_Center_Dashboard_Data_Model.md`, and `Control_Center_User_Workspace_Model.md` already provide a design. The underlying `creator_os_workspaces`/`creator_os_workspace_memberships` data model is already implemented and proven across two MVPs — this module is primarily a UI/aggregation build on existing data, not new core infrastructure.
- **Dependencies:** Whatever modules exist to aggregate at the time it's built — its value compounds with each additional module, so it benefits from not being first, but also shouldn't wait until everything else is done.
- **Recommended phase:** **Phase 9 (User-Facing Intelligence Layer)** — after there's more than one registry worth unifying into a dashboard, but before the system becomes so large that retrofitting a shell is painful.

### Analytics / Observability

- **Purpose:** system-wide visibility into usage, cost, failures, and agent/workflow performance.
- **User value:** indirect for end users, high for operators and for any future cost-sensitive AI usage.
- **Technical complexity:** Low to start — `src/services/observability.js` already exists as a working, minimal pattern (allowlisted, sanitized event emission), and `usage_records`/`incidents` tables are already schema-specified. Meaningful complexity only arrives when this needs to aggregate across multiple modules (agents, workflows, tools) that don't exist yet.
- **Dependencies:** Grows in value with each additional module; the foundational piece (the observability service pattern) already exists and should simply be extended, not rebuilt, as each new module ships.
- **Recommended phase:** **Ongoing, starting in Phase 7** — extend the existing `observability.js` pattern into every new module as it's built, rather than treating this as a discrete, deferred phase.

## 3. Recommended Sequencing — Next Three Milestones

### Phase 7 — Foundation

**Focus:** the two registries everything else depends on, plus extending observability as a standing practice.

- AI Agent Registry (schema exists, specs exist — implement)
- Tool Registry (schema exists — implement, plus new credential-security design)
- Extend `observability.js` into both new services from day one
- Reconcile the already-provisioned-but-unpoliced live `agents`/`tools`/`workflows` tables with whatever this phase actually builds — confirm live state before assuming it, per this roadmap's own evidentiary standard

**Exit criteria (illustrative, not binding):** both registries governed with the proven lifecycle-transition pattern, RLS-tiered access proven for each, live-validated with the same rigor Phase 6.4 applied to documents.

### Phase 8 — Core OS Capabilities

**Focus:** making the registries do something — real execution.

- Workflow Engine, starting from the already-specified COS-WF-001 as its first real, concrete workflow before generalizing
- Automation Layer, scoped as part of the Workflow Engine's execution/trigger subsystem, not a separate build
- Agent Execution Layer, gated on both registries from Phase 7 and the Workflow Engine's approval-checkpoint model

**Exit criteria (illustrative):** at least one real workflow executing end-to-end with an approval gate; at least one agent executing a real, evaluated task through the governed pattern.

### Phase 9 — User-Facing Intelligence Layer

**Focus:** making the system usable and getting smarter with what it now knows.

- User Workspace System (Control Center), unifying Documentation, System, Agent, and Tool registries into one coherent shell
- Agent Memory (the undesigned half of the Knowledge/Memory System), now that there are real agents and real execution history to draw on
- A scoped definition pass for "Content Operating System" — not implementation — informed by what Phases 7–8 actually revealed about user needs

**Exit criteria (illustrative):** a single workspace shell surfacing all prior modules; at least one agent demonstrably using retrieved memory from a prior run.

## 4. Governance Requirements for Every Future Module

Every module above, when it moves from this roadmap into an actual build, must carry the same governance discipline COS-MVP-002 established — not a lighter version of it:

- **Ownership:** an explicit accountable owner (per `00_Governance/Decision_Rights_and_Ownership.md`'s role model) named before implementation begins, not after.
- **Versioning:** semantic versioning for the module's specification and its data (mirroring `document_versions`/the proposed `agent_versions`/`workflow_versions` pattern) — every governed entity should be able to answer "which version of this was active when."
- **Evidence trail:** a Phase X.Y validation record produced with the same rigor as Phase 6.4's — live-executed evidence, not assumed-correct code, before any release decision.
- **Lifecycle management:** every governed entity should have an explicit status/lifecycle model and, where mutation matters, a governed-transition function following the proven `transition_document_lifecycle` pattern — not direct table writes.
- **Security considerations:** RLS from the start, workspace-scoped by default, and — new for Phase 7's Tool Registry specifically — a real credential-storage and rotation design, since nothing built so far has needed one yet.

## Architectural Principles Carried Forward

These are the design principles every future Creator OS phase must preserve, distilled from what COS-MVP-001 and COS-MVP-002 actually proved in practice, not from aspiration:

- **Evidence before execution.** No module is treated as working because its code looks correct — it is treated as working when live, executed evidence says so (the Phase 6.4 standard: 10/10 tests run directly against production, not assumed from source review). This applies to every future registry, workflow, and agent exactly as it applied to documents.
- **Governed mutations.** No future table gets a direct `UPDATE`/`INSERT`/`DELETE` grant to application roles as its primary write path. State changes route through a `SECURITY DEFINER` function that re-verifies authorization, provenance, and evidence at the moment of the change — the pattern proven by `transition_document_lifecycle`, not a convenience to relax for the next module.
- **Registry before automation.** Nothing gets automated, scheduled, or agent-driven before the thing it operates on is a governed registry first. The Workflow Engine and Agent Execution Layer are sequenced in Phase 8, strictly after the Agent and Tool Registries in Phase 7, for exactly this reason — automation over ungoverned state is how the original P62-001 finding happened.
- **Human approval boundaries.** Consequential actions — publication, agent execution at meaningful risk levels, tool invocation with side effects — keep an explicit human or governed-evidence checkpoint, not a fully autonomous path, until a specific module earns removing one with its own evidence trail.
- **Version everything.** Every governed entity — documents, agents, workflows, tools — must be able to answer "which version of this was active when," mirroring `document_versions` and the already-specified `agent_versions`/`workflow_versions` tables. A registry without versioning is not a registry, it's a mutable list.
- **Security before scale.** RLS, workspace scoping, and (where relevant) credential handling are designed before a module's first line of business logic, not retrofitted after it works. The Tool Registry's credential-storage design in Phase 7 is the first real test of this principle beyond what's already been proven for read/write access control.
- **Build primitives before applications.** Registries and governed primitives (Phase 7) come before the systems that consume them (Phase 8) come before the user-facing shell that unifies them (Phase 9). The Control Center is sequenced last deliberately — a dashboard unifying nothing yet would be premature, exactly as this roadmap's Section 3 already sequences it.

## What This Roadmap Does Not Do

- It does not select a release decision for any module.
- It does not implement any code, schema, or migration.
- It does not authorize work to begin on any phase.
- It does not change COS-MVP-002's release status or touch any COS-MVP-002 governance artifact.

## References

- [Capability Map](../01_Architecture/Capability_Map.md) — the governing full-system capability model this roadmap sequences against
- [Schema Specification](../05_Database/Schema_Specification.md) — existing designed schema for agents, tools, workflows, and execution
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md), [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md), [COS-WF-001 Document Creation Workflow](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)
- [Control Center Specification](Control_Center_Specification.md), [Control Center User Workspace Model](Control_Center_User_Workspace_Model.md)
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard every future module's validation should match

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial roadmap: current-capability inventory, nine candidate modules evaluated against existing designs and live infrastructure, three-phase sequencing (Foundation / Core OS Capabilities / User-Facing Intelligence Layer), governance requirements for future modules. No decision made, no implementation performed. |
