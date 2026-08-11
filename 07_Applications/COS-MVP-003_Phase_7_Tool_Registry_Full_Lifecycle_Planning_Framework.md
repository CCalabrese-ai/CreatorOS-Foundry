# COS-MVP-003 Phase 7 Tool Registry Full Lifecycle Planning Framework

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Planning Framework — No Design Finalized
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning framework document, no capability exists to release

## Purpose

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md` names G08 (Tool Registry Full Lifecycle Planning Chain) as an open planning-completeness gate — the completed Tool Registry Security sub-chain (D13–D19) covers credential handling only; no planning chain exists for the Tool Registry's broader identity, registration, ownership, and lifecycle model. This document defines the planning scope, governance requirements, and design considerations for that broader capability — the questions a future planning chain must answer, not the answers themselves. **This is a planning framework document only.** It does not implement the Tool Registry, create any schema, migration, credential, or integration, select a secret-manager provider, or begin Workflow Engine, Tool Execution, or Phase 8 implementation.

## Important Distinction: Security Sub-Chain vs. Full Lifecycle

**Tool Registry Security** — already complete (`COS-MVP-003_Phase_7_Tool_Registry_Security_Design.md` through its Implementation Readiness Review) — governs credential ownership, secret lifecycle, rotation/expiration authority, emergency access, and trust classification (D13–D19, all ratified).

**This document addresses the broader Tool Registry lifecycle** — tool identity, registration, ownership, approval lifecycle, activation, suspension, revocation, retirement, and relationships with agents and workflows — none of which the Security sub-chain covers, since that sub-chain was deliberately scoped narrowly to credential handling from the start.

**This document does not replace or modify D13–D19.** Every one of those seven ratified decisions remains exactly as recorded in `COS-MVP-003_Phase_7_Decision_Ratification_Record.md` and `..._Tracker.md`. This framework extends the surrounding lifecycle model around that already-settled security core, without reopening any part of it.

## Scope Boundary Relative to G08's Own Dependency

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s own inventory states G08's dependency plainly: it requires G02 (Shared Approval/Evidence Primitive live validation) to clear **and** G04 (Tool Registry Security live validation) to clear, before the actual planning chain begins. Neither has cleared — both remain live-validation gates with zero executed evidence. This document does not treat either as satisfied. It stays deliberately above the line those dependencies protect: it does not finalize any lifecycle state, does not design any approval-gated transition against either the primitive's or the security sub-chain's specific validated mechanics, and does not define any schema. Every substantive design decision below is explicitly deferred to a future Schema Design Review and Decision Record — documents that would themselves still require G02 and G04 to clear first, consistent with the Implementation Map's own Recommended Build Order.

## Maintaining the Distinction

- **A planning framework ≠ a planning chain.** This document names the questions a future Implementation Plan, Technical Design, and Decision Record would need to answer. It is not any of those documents itself.
- **Scope definition ≠ schema design.** Section 6 names categories of future entity; it defines no field, no table, no column, no constraint.
- **Framework existence ≠ authorization to design.** This document existing does not itself clear G02 or G04, and does not authorize the actual Tool Registry full-lifecycle planning chain to begin.

## 1. Tool Registry Purpose

**Why a Tool Registry exists.** `04_Tool_Registry/Tool_Registry.md` already maintains a working registry of five tools/integrations with a defined lifecycle (`Candidate` → `Approved` → `Active` → `Restricted` → `Deprecated` → `Retired`) and four risk classes (T1–T4). Its own Purpose statement is explicit: "Registration does not grant access; every user, agent, workflow, and application must receive an explicit permission scope." The Tool Registry as a governed database capability would make that existing prose registry a queryable, enforced fact rather than a Markdown table alone.

**What problem it solves.** Per the Roadmap, the Tool Registry is a prerequisite "for safe agent tool use and for any automation that calls external services" — nothing can safely invoke an external tool if there is no governed record of which tools are approved, who owns them, and what risk class they carry.

**Why tools require governance before execution.** `Tool_Registry.md`'s own Control Rules state directly: "Tool access is deny-by-default and scoped by role, workflow, environment, and data classification. T3 and T4 actions require explicit safeguards; T4 actions require human approval unless a documented governance exception exists." A tool that could be invoked before its identity, ownership, and risk classification are governed facts would repeat the same "automation ahead of governance" risk this repository's own history (P62-001) already demonstrated the cost of.

**Relationship between the Tool Registry and Creator OS Foundry.** The Tool Registry is one of the four Phase 7 foundation capabilities named in `COS_Architecture_Implementation_Map.md`, alongside the Shared Approval/Evidence Primitive, Execution Safety Foundations, and the Agent Registry — a prerequisite layer Phase 8's Workflow Engine, Tool Execution, and Agent Execution Layer would all consume, not a Phase 8 capability itself.

**Tool Registry governs:** what tools exist, who owns them, lifecycle state, approval status, and governance metadata.

**Tool Registry does not:** execute tools, replace workflows, replace agents, or replace integrations. Each of those remains a separate, already-distinguished concept — `Tool_Registry.md`'s own Purpose statement already draws this line ("Registration does not grant access"), and this framework does not redraw it.

## 2. Relationship Between Tool Registry Security and Full Lifecycle

Explicitly distinguished, restated from the Important Distinction section above for this section's own completeness:

**Tool Registry Security (D13–D19, complete and ratified):**
- Credentials.
- Secret handling.
- Trust classification (T1–T4 rigor scaling).
- Emergency access.
- Trust boundaries.

**Full Lifecycle Registry (this document's subject, not yet planned):**
- Tool identity.
- Registration.
- Ownership.
- Approval.
- Activation.
- Retirement.

**D13–D19 remain unchanged.** This planning framework extends the surrounding lifecycle model without reopening any security decision — a future full-lifecycle Decision Record would need to reference D13–D19 as already-settled inputs (e.g., a tool's classification, per D19, determines what credential rigor applies once the tool has a credential at all), not revisit them.

## 3. Relationship to Existing Architecture

Relationships only — no implementation dependency is created by this section.

**Shared Approval/Evidence Primitive.** Future tools may require `governed_subjects` registration, the same indirection pattern every other governed entity uses, per D01's ratified design. Lifecycle decisions (e.g., `Candidate`→`Approved`) may require approval evidence recorded through the primitive's tables, the same way documents already do. Whether and how this actually happens is a future Decision Record's job, not decided here.

**Execution Safety Foundations.** Execution safety governs actions actually performed — incidents, recovery, compensation when a tool invocation goes wrong. The Tool Registry governs what tools are allowed to exist and be used in the first place, independent of whether any invocation has ever occurred. The two are complementary: a tool can be registered, approved, and fully governed by the registry without ever having been invoked, at which point Execution Safety Foundations has nothing yet to govern for it.

**Agent Registry.** Agents may request access to tools once both registries and the Agent Execution Layer exist — but tool governance remains separate from agent governance, mirroring the same separation `COS-MVP-003_Phase_7_Agent_Registry_Planning_Framework.md` already draws from the other direction. Neither registry absorbs the other.

**Workflow Engine.** Workflows may invoke tools once the Workflow Engine exists (Phase 8) — the registry controls which tools are approved and available; it does not design how a workflow step actually invokes one.

**Agent Execution Layer.** Execution depends on governed tools existing first — per the Implementation Map's own dependency graph, the Agent Execution Layer depends on the Tool Registry (among other Phase 7 prerequisites), not the reverse.

## 4. Tool Lifecycle Planning Scope

Future lifecycle stages requiring investigation, **not finalized here:**

- Candidate
- Review
- Approved
- Active
- Suspended
- Revoked
- Retired

**These are illustrative only.** They loosely follow `Tool_Registry.md`'s own existing six-state lifecycle (`Candidate` → `Approved` → `Active` → `Restricted` → `Deprecated` → `Retired`), adapted here with `Suspended`/`Revoked` as placeholder analogues for `Restricted`/`Deprecated` — this document does not assert these are the correct final names or that they map one-to-one onto the existing prose registry's own states. **Final lifecycle states require a future Schema Design Review**, informed by whatever a future Decision Record resolves about how closely the full-lifecycle model should mirror the existing `Tool_Registry.md` prose lifecycle versus diverge from it.

## 5. Governance Questions

Questions a future design must answer — none is answered here.

**Identity:**
- What uniquely identifies a tool — a stable key analogous to `tool_key` per `Schema_Specification.md`'s existing contract, or something requiring reconciliation with `Tool_Registry.md`'s own existing `TOOL-001`-style identifiers?
- How are tool versions represented — mirroring `document_versions`, or does a tool's "version" mean something different (a provider API version, a permission-scope change)?
- What metadata defines a tool — is the existing field list (`tool_key, provider, capability, risk_level, status`) complete, or does full-lifecycle governance need more?

**Ownership:**
- Who owns a tool — `Tool_Registry.md`'s own registry already assigns a specific owner per entry (Architecture Owner for GitHub, Data Owner for Supabase, etc.) — does full-lifecycle governance formalize per-tool ownership, or default to a single accountable pair?
- Who approves registration — the same per-tool owner, or a fixed pair mirroring D13's unified-ownership precedent for credentials?
- Who can suspend or retire a tool — the same authority as approval, or a stricter one, mirroring D05's precedent that revocation requires a stricter role than approval?

**Approval:**
- Which lifecycle events require approval evidence — every transition, or only specific ones?
- Which roles approve changes — does this vary by risk class (T1–T4), mirroring D19's rigor-scaling precedent for credential handling?

**Security Relationship:**
- How does full lifecycle connect to D13–D19 — does a tool's classification (D19) get assigned at registration time, or at a later lifecycle stage?
- When does classification occur — before or after `Approved` status?
- When are credentials introduced — only once a tool reaches `Active`, or earlier, during review?

**Operations:**
- Who maintains active tools — an ongoing operational role, or the same owner who approved registration?
- How are failures handled — does a tool experiencing repeated failures trigger an Execution Safety Foundations incident, a Tool Registry lifecycle transition, or both?
- How are deprecated tools removed — what happens to in-flight workflows or agent grants referencing a tool that transitions to `Retired`?

**Audit:**
- What lifecycle events require immutable evidence — every transition, matching the document/execution-safety/credential precedent already established throughout this Phase 7 effort, or a narrower set specific to tools?

## 6. Future Schema Planning Areas

Areas requiring future design — **no column, table, migration, or constraint is created by this document.**

Possible entities a future Schema Design Review would need to evaluate:
- Tools (identity and current-state record).
- Tool versions (version-specific specification and status).
- Tool ownership records (if ownership needs its own row rather than a field on the tool record — an open question, not decided here).
- Tool lifecycle records (an audit trail of transitions, mirroring `document_lifecycle_events`/`execution_lifecycle_events`, if a future design determines tools need one).
- Tool approval records (however full-lifecycle governance connects to the Shared Approval/Evidence Primitive, per Section 3 — a connection this document names as a possibility, not a design).
- Tool-agent relationships (however an agent's eventual request for tool access would be recorded, distinct from the Tool Registry Security's own credential-permission model).
- Tool-workflow relationships (however a workflow's eventual reference to an approved tool would be recorded).
- Tool execution references (however the registry would eventually reference actual invocation records, once Tool Execution exists in Phase 8).

**None of these is a commitment.** A future Schema Design Review may find some entities unnecessary, may split or merge what's listed here, or may find additional entities this framework did not anticipate.

## 7. Relationship to Phase 8

**Tool Registry lifecycle planning enables:**
- Workflow Engine planning — a workflow that invokes tools needs a governed tool registry to reference.
- Tool Execution planning — actual tool invocation needs a governed record of what's approved to invoke.
- Agent Execution planning — an agent using a tool needs both a governed agent (Agent Registry) and a governed tool (this capability) to exist first.

**This does not authorize:**
- Implementation of any kind.
- Any migration.
- Any runtime execution.
- Any production tool.
- Any credential.

## 8. Validation Considerations

Future validation categories — **no test is executed by this document:**

- Lifecycle transition validation — mirroring the transition-matrix methodology already proven for documents (Phase 6.4) and specified for incidents (Execution Safety Foundations D06), once a lifecycle model is actually designed.
- Approval enforcement validation — confirming a future tool-approval mechanism actually denies what it claims to deny.
- Ownership enforcement validation — confirming the eventual ownership model (Section 5) is actually enforced at the database level.
- Classification enforcement validation — confirming a tool's T1–T4 classification (D19) actually governs the rigor applied to it, once full-lifecycle registration and credential handling are connected.
- Relationship validation — confirming tool-agent and tool-workflow relationships (Section 6) behave as designed, once those relationships exist.
- Audit evidence validation — confirming whatever lifecycle/version records a future design creates are genuinely append-only and immutable, per this repository's consistent standard.

## 9. Ownership Considerations

Relevant future owners, identified from existing repository roles — no new authority is granted by this section:

- **Architecture Owner** — overall design coherence and this framework's own document ownership.
- **Security Owner** — connection points to D13–D19, classification timing, and approval-gated transitions.
- **Data Owner** — retention and evidence-model decisions, consistent with their role across every other Phase 7 evidence decision.
- **Automation Owner** — any future automated lifecycle enforcement, failure-handling connection to Execution Safety Foundations.
- **Domain Owner** — per `Tool_Registry.md`'s own existing per-tool ownership pattern (Architecture Owner for GitHub, Data Owner for Supabase, Media Domain Owner for WaveSpeed, Agent Owner for OpenAI Platform), the relevant domain owner for whichever specific tool is being registered.
- **Tool Owner** — the operational role already established in D14 for credential lifecycle execution; its scope relative to full-lifecycle governance is an open question (Section 10), not decided here.

**Exact accountability requires future decisions.** This section identifies who is likely to hold a stake — it does not itself assign authority or resolve any ownership question.

## 10. Open Questions

Unresolved planning questions, **not resolved by this document:**

- The tool identity model — how a full-lifecycle registry's identifier relates to `Tool_Registry.md`'s existing `TOOL-NNN` convention.
- Final lifecycle states — Section 4's list is illustrative, not final.
- The versioning approach — how tool versions are represented and what triggers a new one.
- The ownership model — per-tool named owners (matching the existing prose registry) vs. a fixed accountable pair.
- Approval boundaries — which lifecycle transitions require approval evidence, and from which role, and whether this varies by risk class.
- Relationship to agents — how an agent's request for tool access is recorded, distinct from credential-level permission.
- Relationship to workflows — how a future Workflow Engine references an approved tool.
- Relationship to credentials — precisely when in the lifecycle a tool's credential (governed by D13–D19) is introduced.
- Relationship to execution — how the registry references actual invocation records once Tool Execution exists.

## 11. Governance Boundaries

This document explicitly does **not**:
- Implement the Tool Registry.
- Create any database schema.
- Create any migration.
- Create any table.
- Create any tool.
- Create any credential.
- Select any secret-manager provider.
- Modify any D13–D19 outcome.
- Authorize Tool Execution.
- Authorize Workflow Engine implementation.
- Authorize Phase 8 implementation.
- Resolve any validation gate.
- Change COS-MVP-002's release status.

## What This Document Does Not Do

- It does not implement any code, schema, or migration.
- It does not create any database object, table, or column.
- It does not create any tool, credential, or integration.
- It does not select any secret-manager provider.
- It does not modify any application source file or configuration file.
- It does not authorize Tool Execution, Workflow Engine implementation, or any Phase 8 work.
- It does not resolve G02, G04, or any other Phase 7 gate.
- It does not modify any ratification record or any D01–D19 decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.

## References

- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G08 and its dependency on G02 and G04, restated in this document's Scope Boundary section
- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of D13–D19, unaltered by this document
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — source of the Tool Registry's dependency graph and Recommended Build Order
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — source of the Tool Registry's Phase 7 scoping and purpose framing
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md) — the existing prose registry this future capability would generalize, including its existing lifecycle and risk-class model
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md) — existing permission model referenced in Sections 1 and 3
- [Schema Specification](../05_Database/Schema_Specification.md) — existing `tools`/`tool_permissions`/`integrations`/`credential_references` field-list specification referenced in Section 6
- [COS-MVP-003 Phase 7 Agent Registry Planning Framework](COS-MVP-003_Phase_7_Agent_Registry_Planning_Framework.md) — the parallel framework for the Agent Registry, referenced in Section 3 for the agent-tool relationship
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md), [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — precedents referenced throughout (overlay-role model, revocation-authority model)
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Tool Registry full lifecycle planning framework: purpose distinguishing the registry from tool execution, workflows, and agents; an explicit distinction between the completed Tool Registry Security sub-chain (D13–D19, unchanged) and this document's broader lifecycle scope; a scope-boundary statement acknowledging G08's own dependency on both G02 and G04 (neither resolved) and confirming this document stays above the line those dependencies protect; relationships to the Shared Approval/Evidence Primitive, Execution Safety Foundations, Agent Registry, Workflow Engine, and Agent Execution Layer, described without creating implementation dependencies; seven illustrative (not final) lifecycle states; governance questions across identity/ownership/approval/security-relationship/operations/audit, none answered; future schema planning areas naming eight possible entities with no column or table defined; Phase 8 relationship clarifying what full-lifecycle planning enables without authorizing; six future validation categories, none executed; ownership considerations grounded in existing roles including `Tool_Registry.md`'s own per-tool domain-owner pattern; nine open questions, none resolved; explicit governance boundaries. No implementation performed, no schema created, no migration created, no D13–D19 or other D01–D19 outcome changed, no release status changed. |
