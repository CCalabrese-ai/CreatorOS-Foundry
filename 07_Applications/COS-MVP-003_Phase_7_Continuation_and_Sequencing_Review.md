# COS-MVP-003 Phase 7 Continuation and Sequencing Review

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Sequencing Review — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — sequencing review, no capability exists to release

## Purpose

Both Phase 7 planning chains completed so far — the Shared Approval/Evidence Primitive and Execution Safety Foundations — are now fully documented and both independently concluded **Blocked pending decisions** by their own Implementation Readiness Reviews. This document determines the safest next Phase 7 workstream given that state. **This is a sequencing review only.** It implements nothing, creates no migration, writes no SQL, modifies no source or database file, and changes no release status. It does not select or authorize any workstream — it recommends one for the accountable owners' consideration, consistent with every prior sequencing document in this chain (`COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md`).

## 1. Current Phase 7 State

Of Phase 7's four capabilities (per `COS_Architecture_Implementation_Map.md`):

- **Shared Approval/Evidence Primitive** — six-document planning chain complete, Implementation Readiness Review concluded **Blocked pending decisions** (zero of five Decision Record decisions ratified).
- **Execution Safety Foundations** — seven-document planning chain complete (six planning documents plus its own Implementation Readiness Review), which concluded **Blocked pending decisions**, with two distinct blockers: zero of seven Decision Record decisions ratified, and the integration-adapter reconciliation-contract feasibility question technically unverified.
- **Agent Registry** — no planning chain started. Schema specified (`agents`, `agent_versions`), eight roles defined in `AI_Workforce_Registry.md`, four fully specified agent roles. A live `agents` table exists in production with RLS enabled but no policies attached — provisioned, not implemented, not re-confirmed live as of this review.
- **Tool Registry** — no planning chain started. Schema specified (`tools`, `tool_permissions`, `integrations`, `credential_references`). Credential storage/rotation has never been designed anywhere in this repository.

**No Phase 7 capability has begun implementation.** Two of four have completed planning chains, both independently blocked; two of four have no planning chain at all.

## 2. Remaining Phase 7 Capabilities

### Agent Registry

A governed catalog of AI agent roles (identity, risk level, status, versioned specifications). Its own design source, `AI_Workforce_Registry.md`, states explicitly: "Any autonomy expansion, new sensitive data access, or new external side effect requires Agent Owner and Security Owner approval," and its Proposed→Approved→Active lifecycle is itself an approval-gated transition. No Phase 7.1-equivalent planning chain (Implementation Plan through Readiness Review) has been started for it.

### Tool Registry

A governed catalog of approved external tools/integrations, their risk classification, and permission scopes. `Tool_Registry.md` requires explicit human approval for T3/T4 risk-class actions — another approval-gated lifecycle. Additionally requires a credential storage/rotation design this repository has never needed before, a genuinely new security concern independent of any lifecycle-approval question. No planning chain has been started for it.

## 3. Dependency Analysis

**What requires the Shared Approval/Evidence Primitive:**
- The Agent Registry's Proposed→Approved→Active lifecycle transitions, and its "cannot approve its own permissions, evaluations, or production activation" rule — both need a governed approval mechanism to exist before they can be designed against something concrete rather than assumed.
- The Tool Registry's T3/T4 approval-gated actions — the same structural need.
- Per `COS_Architecture_Implementation_Map.md`'s Recommended Build Order, this dependency is why the primitive was sequenced first among Phase 7's four capabilities in the first place: "building the registries before this primitive exists risks each inventing its own one-off approval mechanism."

**What requires Execution Safety Foundations:**
- Nothing within Phase 7 itself. Per the Implementation Map's dependency graph, Execution Safety Foundations has no downstream Phase 7 consumer — its consumers (Workflow Engine, Agent Execution Layer) are both Phase 8. Neither the Agent Registry nor the Tool Registry's own design sources name any dependency on execution-safety machinery; a registry's governed lifecycle transition is a single-record state change, not a multi-step execution run of the kind Execution Safety Foundations governs.

**What can proceed independently of both:**
- **Tool Registry's credential storage/rotation design specifically** — named in the Roadmap and Implementation Map as "a genuinely new security concern... since nothing built so far has needed one yet," structurally separate from the Tool Registry's approval-gated lifecycle logic. A credential-storage security design does not require the Shared Approval/Evidence Primitive to exist; it requires only the existing workspace/membership model and a Security Owner-led review, both already available.
- **Live-state reconciliation of the already-provisioned-but-unpoliced `agents`/`tools`/`workflows` tables** — an evidence-gathering and verification task, not new architecture. The Roadmap has twice flagged this as needing re-confirmation ("previously observed, not re-verified this session") without ever being acted on. This requires no design decision and no dependency on either blocked primitive — only a direct check against the live database.
- **Continued extension of `src/services/observability.js`** into any new service, per the Roadmap's "Ongoing, starting in Phase 7" recommendation — independent of every other item in this section.

## 4. Parallelization Opportunities

- The two items identified above as independent — Tool Registry credential-storage design and live-table reconciliation — can proceed in parallel with each other and in parallel with waiting for either blocked primitive's ratification, without creating any rework risk, since neither touches approval-gated lifecycle logic.
- **Full planning chains for the Agent Registry or Tool Registry cannot safely proceed in parallel with the Shared Approval/Evidence Primitive's ratification wait**, because both registries' lifecycle-transition design would need to reference the primitive's specific shape (which roles approve, what expiry/revocation model applies) — exactly the coupling risk `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md` Section 8 already named for this same pairing.
- Execution Safety Foundations' own two blockers (ratification, adapter-feasibility verification) can be pursued in parallel with each other — one is a human governance action, the other is a technical verification task, and neither depends on the other completing first.

## 5. Risks of Proceeding Too Early

- **Starting a full Agent Registry or Tool Registry planning chain now:** both would need to design their approval-gated lifecycle transitions against a primitive whose shape is only a recommendation, not yet ratified. If ratification changes any of the primitive's five decisions, that design work would need rework — the same risk already identified and avoided once already in this Phase 7 sequence (by choosing Execution Safety Foundations over the registries as the prior workstream).
- **Treating "both primitives blocked" as license to start the registries anyway, on the theory that planning documents alone carry no real cost:** understates the cost. The Phase 7.1 and Execution Safety Foundations chains both took multiple documents' worth of careful reconciliation to reach internal consistency — redoing that work for two registries because an unratified assumption changed would be a real, not hypothetical, cost.
- **Starting the credential-storage design for the Tool Registry as if it were the whole Tool Registry:** would risk conflating a genuinely independent sub-scope with the registry's full, still-coupled lifecycle design — the credential work should be explicitly scoped as its own narrow workstream, not a backdoor into starting the full registry chain.
- **Treating the live-table reconciliation task as low-priority busywork:** the Roadmap has flagged this exact gap twice without action; deferring it further risks discovering, mid-implementation of some future capability, that the live `agents`/`tools`/`workflows` tables' actual state differs from what every planning document has assumed.

## 6. Recommended Next Workstream

**No full registry planning chain should begin yet.** Recommended instead, as two narrow, independent, parallelizable workstreams:

1. **Tool Registry credential storage/rotation security design** — scoped narrowly to the credential-handling question alone, led by the Security Owner, explicitly not extended into the Tool Registry's approval-gated lifecycle design (which remains coupled to the still-blocked Shared Approval/Evidence Primitive).
2. **Live-state reconciliation of the `agents`/`tools`/`workflows` tables** — a verification task confirming current RLS/policy state against what every planning document to date has assumed, closing a gap the Roadmap has flagged twice without resolution.

Both are available now, carry no coupling risk to either blocked primitive, and produce evidence useful to whichever registry planning chain eventually starts once ratification occurs. This recommendation does not select between them as to which happens first — both can proceed in parallel per Section 4.

## 7. Explicitly Preserved

- **Phase 7 → Phase 8 → Phase 9 sequencing.** Unchanged. This review operates entirely within Phase 7's own four capabilities and does not alter the roadmap's cross-phase order.
- **Creator-agnostic Foundry scope.** Nothing in this review names, references, or designs against any specific deployment, creator, or external project. Every capability discussed serves any future consumer of Creator OS Foundry generically, consistent with `COS_Foundry_Current_State_Handoff.md`'s Foundry vs. Alpha/Camille Reign boundary.
- **Governance boundaries.** This document recommends; it does not decide. Neither blocked primitive's ratification status is altered, assumed resolved, or treated as settled by this review. COS-MVP-002 remains **Not Released**, unaffected by anything in this document.

## What This Document Does Not Do

- It does not implement any code, schema, or migration.
- It does not modify any source or database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not change the Phase 7 → Phase 8 → Phase 9 sequencing established by `COS_Next_Phase_Product_Roadmap.md`.
- It does not authorize any workstream to begin.
- It does not resolve, ratify, or assume the outcome of any pending decision in either the Shared Approval/Evidence Primitive's or Execution Safety Foundations' Decision Records.

## References

- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Readiness Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Readiness_Review.md) — Blocked pending decisions finding for the Shared Approval/Evidence Primitive
- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Readiness Review](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Readiness_Review.md) — Blocked pending decisions finding for Execution Safety Foundations
- [COS-MVP-003 Phase 7 Next Workstream Recommendation](COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md) — the prior sequencing decision this review continues from
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — dependency graph and build order this review's Section 3 relies on
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — Phase 7 → Phase 8 → Phase 9 sequencing, preserved unchanged; source of the live-table reconciliation gap named in Section 3
- [COS Foundry Current State Handoff](COS_Foundry_Current_State_Handoff.md) — Foundry vs. Alpha/Camille Reign boundary preserved in Section 7
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md), [Tool Registry](../04_Tool_Registry/Tool_Registry.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7 continuation and sequencing review: current-state summary of all four Phase 7 capabilities (two blocked planning chains complete, two not yet started); Agent Registry and Tool Registry capability review; dependency analysis distinguishing what requires the Shared Approval/Evidence Primitive, what requires Execution Safety Foundations (nothing, within Phase 7), and what can proceed independently (Tool Registry credential-storage design, live-table reconciliation, observability extension); parallelization opportunities and constraints; four named risks of proceeding too early; a recommendation for two narrow, independent workstreams rather than a full registry planning chain; explicit preservation of Phase 7→8→9 sequencing, creator-agnostic scope, and governance boundaries. No implementation performed, no decision made, no release status changed. |
