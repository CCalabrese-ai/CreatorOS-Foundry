# COS-MVP-003 Phase 7 Agent Registry Planning Framework

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Planning Framework — No Design Finalized
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning framework document, no capability exists to release

## Purpose

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md` names G07 (Agent Registry Planning Chain) as an open planning-completeness gate — zero documents exist for the Agent Registry as of this writing. This document defines the planning scope, governance requirements, and design considerations for a future Agent Registry capability — the questions a future planning chain must answer, not the answers themselves. **This is a planning framework document only.** It does not design a final schema, create any migration, implement any agent, authorize any execution, or resolve Phase 8 readiness.

## Scope Boundary Relative to G07's Own Dependency

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s own inventory states G07's dependency plainly: Agent Registry planning should not *begin* until the Shared Approval/Evidence Primitive reaches implementation-ready status (ratified **and** validated) — G02, the primitive's live validation, has not yet run. This document does not treat that dependency as satisfied. It stays deliberately above the line that dependency exists to protect: it does not finalize any lifecycle state, does not design any approval-gated transition against the primitive's specific mechanics, does not define any schema, and does not resolve any open question. Every substantive design decision below is explicitly deferred to a future Schema Design Review and Decision Record — documents that would themselves still require G02 to clear first, consistent with the Implementation Map's own Recommended Build Order. This framework exists to make the scope of that future work legible now, not to begin it early.

## Maintaining the Distinction

- **A planning framework ≠ a planning chain.** This document names the questions a future Implementation Plan, Technical Design, and Decision Record would need to answer. It is not any of those documents itself.
- **Scope definition ≠ schema design.** Section 5 names categories of future entity; it defines no field, no table, no column.
- **Framework existence ≠ authorization to design.** This document existing does not itself clear G02 or authorize the actual Agent Registry planning chain to begin.

## 1. Agent Registry Purpose

**Why an Agent Registry exists.** `03_AI_Workforce/AI_Workforce_Registry.md` already maintains a working Markdown registry of eight AI worker roles, with statuses from `Proposed` to `Approved` (AWR-002 Documentation Steward is already `Approved`). `05_Database/Schema_Specification.md` already specifies `agents`/`agent_versions` table contracts. Neither has been implemented as a governed database entity — the Agent Registry is the capability that would make "which agents exist, who owns them, and what they're allowed to do" a governed, queryable fact rather than a Markdown document alone.

**What problem it solves.** Per the Roadmap's own framing, nothing else in the "Execute with AI" capability can exist safely without knowing which agents exist, who owns them, and what they're allowed to do — the registry is the "who" of AI work, a prerequisite for any future agent execution, not execution itself.

**Why agents require governance before execution.** `AI_Workforce_Registry.md`'s own rule states plainly: "Any autonomy expansion, new sensitive data access, or new external side effect requires Agent Owner and Security Owner approval." An agent that could act before its identity, ownership, and permitted scope are governed facts would be exactly the "automation ahead of governance" pattern this repository's own P62-001 finding already showed the cost of.

**Relationship between the Agent Registry and Creator OS Foundry.** The registry is one of the four Phase 7 foundation capabilities named in `COS_Architecture_Implementation_Map.md`, alongside the Shared Approval/Evidence Primitive, Execution Safety Foundations, and the Tool Registry — a prerequisite layer Phase 8's Agent Execution Layer would consume, not a Phase 8 capability itself.

**An agent is a governed entity.** Its identity, ownership, lifecycle, and approval status are registry concerns — durable facts recorded independent of whether the agent is currently running anything.

**An Agent Registry is not the Agent Execution Layer.** The two are deliberately separate capabilities, sequenced in different phases per the Roadmap:

| Registry (this document's subject, Phase 7) | Execution Layer (Phase 8, not addressed here) |
| --- | --- |
| Identity | Runtime behavior |
| Ownership | Orchestration |
| Lifecycle | Actions |
| Approval | Tool usage |
| Metadata | — |

## 2. Relationship to Existing Architecture

Relationships only — no implementation dependency is created by this section; every relationship below is descriptive of how a future design *would* need to account for these capabilities, not a commitment this document makes on that future design's behalf.

**Shared Approval/Evidence Primitive.** Future agents may require `governed_subjects` registration, the same indirection pattern every other governed entity (documents, and eventually tools, workflows) uses — per D01's ratified design. Approval evidence recorded through the primitive's `approval_workflow_evidence`/`approval_decision_evidence` tables may apply to agent lifecycle decisions (e.g., a `Proposed`→`Approved` transition), the same way it already does for documents. Whether and how this actually happens is a future Decision Record's job, not decided here.

**Execution Safety Foundations.** Execution Safety Foundations governs what happens *when* an agent runs — incidents, recovery, compensation, and checkpointing apply to any execution, agent-originated or otherwise. The Agent Registry governs *what agents exist* and their lifecycle, independent of whether they have ever executed anything. The two capabilities are complementary, not overlapping — an agent can exist, be approved, and be fully governed by the registry without ever having run, at which point Execution Safety Foundations has nothing yet to govern for it.

**Tool Registry.** Agents may consume tools once both registries and the Agent Execution Layer exist — but tool permissions remain governed separately, per `Agent_Tool_Permissions.md`'s own existing model: a registered tool is not automatically available to an agent, and access requires an explicit, separately-governed permission grant. The Agent Registry does not absorb or duplicate that permission model; it is the "who" the permission model would eventually reference.

**Workflow Engine.** Workflows may invoke agents once the Workflow Engine exists (Phase 8) — but the Agent Registry does not replace or design workflow orchestration. The registry answers "does this agent exist and is it approved"; the Workflow Engine, not this document, would answer "how does a workflow step actually invoke it."

## 3. Agent Lifecycle Planning Scope

Future lifecycle states requiring investigation, **not finalized here**:

- Candidate
- Review
- Approved
- Active
- Suspended
- Revoked
- Retired

These are illustrative examples of the kind of states a future lifecycle model might include — modeled loosely on the Tool Registry's own six-state lifecycle (`Candidate` → `Approved` → `Active` → `Restricted` → `Deprecated` → `Retired`) and `AI_Workforce_Registry.md`'s existing `Proposed`/`Approved` status vocabulary, neither of which this document treats as a final answer for agents specifically. **Final lifecycle design requires a future Schema Design Review**, informed by whatever a future Decision Record resolves about agent-specific concerns (e.g., whether "Suspended" and "Revoked" need to be distinct states, or whether Execution Safety Foundations' own incident model should inform how an agent transitions out of active status after a failure).

## 4. Governance Questions

Questions a future design must answer — none is answered here.

**Identity:**
- What uniquely identifies an agent — a stable key analogous to `document_key`/`tool_key`, or something agent-specific?
- What metadata defines an agent (name, purpose, risk level, owning role — per the existing `agents` field list in `Schema_Specification.md`) — is that list complete, or does agent-specific governance need more?

**Ownership:**
- Who owns an agent — a single named role, or a pair, per this repository's consistent "Security Owner and relevant Domain Owner" pattern?
- Who approves lifecycle changes — the same pair, or does a stricter role apply for higher-risk agents, mirroring the overlay pattern already established in D02/D07/D19?
- Who can suspend or revoke an agent — the same authority as approval, or a stricter one, mirroring D05's precedent (revocation requires a role stricter than approval)?

**Approval:**
- Which lifecycle events require approval evidence — every transition, or only specific ones (e.g., `Candidate`→`Approved`, but not `Active`→`Suspended`)?
- Which transitions require stricter roles — does `AI_Workforce_Registry.md`'s "autonomy expansion" language map onto a specific transition, or a specific field change within an existing state?

**Security:**
- What permissions can an agent have, and how does that interact with the Tool Registry's own permission model (Section 2) without duplicating it?
- How are tool relationships governed — does the registry record which tools an agent is *approved* to potentially use, distinct from the Tool Registry's own runtime permission grant?

**Audit:**
- What evidence must be retained for an agent's lifecycle history, and does the indefinite-by-default retention posture already established in D04/D10/D17 apply here too, or does agent-specific governance need its own retention decision?
- What changes require immutable records — every lifecycle transition, matching the document/execution-safety precedent, or a narrower set?

**Versioning:**
- How are agent versions represented — mirroring `document_versions`/the specified `agent_versions` table, or does an agent's "version" mean something different (e.g., a change to its underlying model or instructions, not just its registry metadata)?
- What happens when behavior changes — does a new agent version require re-approval, mirroring how a document's revision requires its own approval cycle?

## 5. Future Schema Planning Areas

Areas requiring future design — **no column, no table, and no schema decision is created by this document.**

Possible entities a future Schema Design Review would need to evaluate:
- Agents (identity and current-state record).
- Agent versions (version-specific specification and status).
- Ownership records (if ownership needs its own row rather than a field on the agent record — an open question, not decided here).
- Lifecycle records (an audit trail of transitions, mirroring `document_lifecycle_events`/`execution_lifecycle_events`, if a future design determines agents need one).
- Approval-evidence relationships (however the Agent Registry ultimately connects to the Shared Approval/Evidence Primitive, per Section 2 — a connection this document names as a possibility, not a design).
- Execution references (however the registry would eventually reference the Agent Execution Layer's own run data, once that layer exists in Phase 8).

**None of these is a commitment.** A future Schema Design Review may find some entities unnecessary, may split or merge what's listed here, or may find additional entities this framework did not anticipate.

## 6. Relationship to Phase 8

**Agent Registry planning is required before:**
- Agent Execution Layer design — per the Implementation Map's own dependency graph, the Execution Layer depends on the Agent Registry existing as a governed entity first.
- Governed agent deployment — an agent cannot be deployed under this repository's own governance model without first being a registered, approved entity.
- Agent lifecycle implementation — the lifecycle model named in Section 3 would need to exist, in some ratified form, before any code implementing lifecycle transitions could be written.

**But Agent Registry planning does not authorize:**
- Implementation of any kind.
- Runtime execution of any agent.
- Any migration.
- Any validation execution.

**This framework itself is one step further removed even than "planning."** It defines the scope a future planning chain would work within — it is not that planning chain, and its existence does not authorize that chain to begin ahead of G02's own resolution (per this document's Scope Boundary section above).

## 7. Validation Considerations

Future validation categories — **no test is executed by this document:**

- Lifecycle transition validation — mirroring the transition-matrix methodology already proven for documents (Phase 6.4) and specified for incidents (Execution Safety Foundations D06), once a lifecycle model is actually designed.
- Approval enforcement validation — confirming a future agent-approval mechanism actually denies what it claims to deny, mirroring every self-approval-denial test already established elsewhere in this Phase 7 effort.
- Ownership enforcement validation — confirming the eventual ownership model (Section 4) is actually enforced at the database level, not merely documented.
- Permission boundary validation — confirming an agent's registry-level approval does not, by itself, grant any actual tool permission, preserving the separation named in Section 2.
- Audit evidence validation — confirming whatever lifecycle/version records a future design creates are genuinely append-only and immutable, per this repository's consistent standard.

## 8. Ownership Considerations

Relevant future owners, identified from existing repository roles — no new authority is granted by this section:

- **Architecture Owner** — overall design coherence and this framework's own document ownership.
- **Automation Owner** — any future automated lifecycle enforcement or scheduling.
- **Security Owner** — approval-gated transitions, permission-boundary considerations, and any autonomy-expansion approval per `AI_Workforce_Registry.md`'s existing rule.
- **Data Owner** — retention and evidence-model decisions, consistent with their role across every other Phase 7 evidence decision.
- **Agent Owner (future role, if approved)** — `Decision_Rights_and_Ownership.md` already names Agent Owner as an existing role ("AI role definition, instructions, tool permissions, evaluations, and lifecycle"); whether and how that role's authority specifically applies to registry-level (as opposed to execution-level) decisions is a future determination, not settled here.

**The ownership model requires future accountable-owner decisions.** This section identifies who is likely to hold a stake in those decisions — it does not itself assign authority or resolve any ownership question.

## 9. Open Questions

Unresolved planning questions, **not resolved by this document:**

- The agent identity model — what uniquely and stably identifies an agent across its lifecycle.
- Final lifecycle states — Section 3's list is illustrative, not final.
- The versioning approach — how agent versions are represented and what triggers a new one.
- Approval boundaries — which lifecycle transitions require approval evidence, and from which role.
- Relationship to workflows — how a future Workflow Engine would reference or invoke a registered agent.
- Relationship to tools — how the registry's own agent-tool association (if any) relates to the Tool Registry's separate, runtime permission model.
- Execution permissions — what an agent is permitted to do once it exists, a question this document explicitly separates from the registry's own scope (Section 1) but flags as needing eventual resolution by the Agent Execution Layer's own design.

## 10. Governance Boundaries

This document explicitly does **not**:
- Implement the Agent Registry.
- Create any database schema.
- Create any migration.
- Create any table.
- Create any agent.
- Create any runtime execution.
- Authorize the Agent Execution Layer.
- Authorize Phase 8 implementation.
- Resolve any validation gate.
- Change any of the nineteen D01–D19 decision outcomes.

## What This Document Does Not Do

- It does not implement any code, schema, or migration.
- It does not create any database object, table, or column.
- It does not create or execute any agent, runtime, or execution workflow.
- It does not create any credential.
- It does not modify any application source file or configuration file.
- It does not authorize Agent Execution Layer implementation or any Phase 8 work.
- It does not resolve G02 or any other Phase 7 gate.
- It does not modify any ratification record or any D01–D19 decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.

## References

- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G07 and its dependency on G02, restated in this document's Scope Boundary section
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — source of the Agent Registry's dependency graph and Recommended Build Order
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — source of the Agent Registry's Phase 7 scoping and purpose framing
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md) — the existing Markdown registry this future capability would generalize
- [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md), [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md) — existing design sources referenced throughout Sections 2 and 4
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `agents`/`agent_versions` field-list specification referenced in Section 5
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md) — source of the Agent Owner role referenced in Section 8
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md), [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — precedents referenced throughout (overlay-role model, revocation-authority model, retention posture)
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Agent Registry planning framework: purpose distinguishing the registry from the Agent Execution Layer; an explicit scope-boundary statement acknowledging G07's own dependency on G02 (unresolved) and confirming this document stays above the line that dependency protects; relationships to the Shared Approval/Evidence Primitive, Execution Safety Foundations, Tool Registry, and Workflow Engine, described without creating implementation dependencies; seven illustrative (not final) lifecycle states; governance questions across identity/ownership/approval/security/audit/versioning, none answered; future schema planning areas naming six possible entities with no column or table defined; Phase 8 relationship clarifying what Agent Registry planning enables without authorizing; five future validation categories, none executed; ownership considerations grounded in existing roles; seven open questions, none resolved; explicit governance boundaries. No implementation performed, no schema created, no migration created, no D01–D19 outcome changed, no release status changed. |
