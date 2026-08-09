# COS-MVP-003 Phase 7 Next Workstream Recommendation

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Sequencing Recommendation — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — sequencing recommendation, no capability exists to release

## Purpose

The Phase 7.1 Implementation Readiness Review concluded that the Shared Approval/Evidence Primitive is **Blocked pending decisions** — its design is complete and internally consistent, but none of its five Decision Record decisions has been ratified. That leaves an open question this document exists to answer: **given that blocker, what should Phase 7 planning work on next?** This is a sequencing recommendation only. **It does not implement anything, creates no migration or source file, and changes no release status.** It does not alter the Phase 7 → Phase 8 → Phase 9 sequencing established by the roadmap — it operates entirely inside Phase 7, recommending an order among Phase 7's own four capabilities.

## 1. Current Phase 7 Status

Phase 7 (Foundation) consists of four capabilities, per `COS_Architecture_Implementation_Map.md`: the Shared Approval/Evidence Primitive, Execution Safety Foundations, the Agent Registry, and the Tool Registry. As of this review:

- **Shared Approval/Evidence Primitive:** fully designed across six planning documents (Implementation Plan through Migration Design Plan), assessed by the Implementation Readiness Review as architecturally sound but **blocked** — zero of five required decisions ratified.
- **Execution Safety Foundations:** designed across four pre-existing documents outside this planning chain (`Workflow_Design_Standards.md`, `Automation_Architecture.md`, `Workflow_Registry.md`'s WF-010, `Control_Center_Specification.md`'s incident/recovery section) but **not yet reconciled into a Phase 7.1-equivalent planning chain** — no Implementation Plan, Technical Design, Decision Record, or Schema Design Review exists for it yet.
- **Agent Registry:** schema specified (`agents`, `agent_versions`), eight roles defined in `AI_Workforce_Registry.md`, four fully specified agent roles — no Phase 7.1-equivalent planning chain started.
- **Tool Registry:** schema specified (`tools`, `tool_permissions`, `integrations`, `credential_references`) — no planning chain started, and credential storage/rotation has never been designed anywhere in this repository.

No Phase 7 capability has begun implementation. The Shared Approval/Evidence Primitive is the only one with a completed planning chain; it is also the only one currently blocked.

## 2. Completed Work

- Six Phase 7.1 planning documents for the Shared Approval/Evidence Primitive (Implementation Plan, Technical Design, Decision Record, Implementation Specification, Schema Design Review, Migration Design Plan).
- One Implementation Readiness Review synthesizing those six and concluding "Blocked pending decisions."
- The Creator OS Architecture Implementation Map and Next Phase Product Roadmap, which establish the dependency graph and recommended build order this document reasons from rather than re-deriving.

## 3. Blocked Work

- **The Shared Approval/Evidence Primitive itself** — blocked on accountable-owner ratification of its five Decision Record decisions (Architecture Owner, Data Owner, Security Owner, per the Decision Record's ownership line). No migration should be written and no implementation should begin until that ratification occurs, per the Readiness Review's own conclusion.
- **Transitively, the Agent Registry and Tool Registry's approval-gated lifecycle transitions** — both registries' own design sources (`AI_Workforce_Registry.md`, `Tool_Registry.md`) already reference approval requirements for their Proposed→Approved→Active and T3/T4 lifecycle steps respectively. Building those lifecycle transitions against an unratified, potentially-still-changing approval primitive risks the exact rework the Implementation Map's build order was designed to prevent.

## 4. Remaining Phase 7 Capabilities

Beyond the blocked Shared Approval/Evidence Primitive:

- **Execution Safety Foundations** — incident model, recovery/rollback path, execution audit trail, and idempotency/checkpointing, generalizing already-designed patterns from `06_Automations/`.
- **Agent Registry** — governed catalog of AI agent roles with lifecycle management.
- **Tool Registry** — governed catalog of approved tools/integrations with risk classification and (new) credential handling.

## 5. Dependency Analysis

Per `COS_Architecture_Implementation_Map.md` Section 2 (Architecture Dependencies Graph) and Section 3 (Recommended Build Order):

- **Execution Safety Foundations depends only on Layer 0** — the already-implemented workspace/membership model and schema patterns. It has **no dependency on the Shared Approval/Evidence Primitive, the Agent Registry, or the Tool Registry.** The Roadmap states this explicitly: "Does not depend on the Agent Registry or Tool Registry, which is why it can and should land alongside them rather than after."
- **Agent Registry depends on Layer 0 + the Shared Approval/Evidence Primitive** — its Proposed→Approved→Active lifecycle and its "cannot approve its own permissions, evaluations, or production activation" rule (`AI_Workforce_Registry.md`) require a governed approval mechanism to exist first.
- **Tool Registry depends on Layer 0 + the Shared Approval/Evidence Primitive** — its T3/T4 risk-class actions require explicit human approval (`Tool_Registry.md`), the same structural need as the Agent Registry.
- **The Implementation Map's own Recommended Build Order (Section 3)** places the Shared Approval/Evidence Primitive first specifically so the two registries consume it rather than each inventing a bespoke mechanism, and places Execution Safety Foundations "in parallel with step 1 — no dependency on the registries, so no reason to sequence it after them."

**Conclusion of the dependency analysis:** of the three remaining, not-yet-planned Phase 7 capabilities, Execution Safety Foundations is the only one with zero dependency on the currently-blocked primitive. The Agent Registry and Tool Registry are both structurally gated on it.

## 6. Recommended Next Workstream

**Begin a Phase 7.1-equivalent planning chain for Execution Safety Foundations** — an Implementation Plan as the first document, following the same pattern already proven for the Shared Approval/Evidence Primitive (Implementation Plan → Technical Design → Decision Record → Implementation Specification → Schema Design Review → Migration Design Plan → Readiness Review).

This is a planning recommendation, not an instruction to begin — it identifies what Phase 7 planning work is *available* to proceed given the current blocker, for the accountable owners to direct.

## 7. Why It Should Occur Next

- **It is the only remaining Phase 7 capability with no dependency on the blocked primitive.** Starting here keeps Phase 7 planning moving without building on an unratified foundation, and without pre-empting the ratification decision by designing against an assumption of how it resolves.
- **It is already the second item in the Implementation Map's own Recommended Build Order**, explicitly sequenced "in parallel with step 1," not after it — this recommendation follows an already-established plan rather than introducing a new one.
- **It is substantially de-risked relative to a greenfield design.** Per the Roadmap's own reassessment (v1.2), Execution Safety Foundations is "not greenfield design" — `Workflow_Design_Standards.md`'s Recovery and Compensation model, `Automation_Architecture.md`'s Control plane and Observability layer, `Workflow_Registry.md`'s WF-010 Incident Response, and the already-specified `incidents` table together cover most of what a Phase 7.1-equivalent planning chain would need to reconcile — the primary planning work is generalization and reconciliation of existing designs, not invention from nothing, mirroring exactly how Phase 7.1 itself was scoped.
- **It is a genuine prerequisite for Phase 8, independent of the approval primitive's outcome.** The Roadmap requires Execution Safety Foundations to exist "before Phase 8's Agent Execution Layer begins, not concurrently with it and not after" — advancing its planning now keeps that Phase 8 gate from becoming the next bottleneck once the approval primitive is eventually ratified.

## 8. Risks of Sequencing Incorrectly

- **Starting the Agent Registry or Tool Registry planning chain now, instead:** both would need to design their lifecycle-transition approval steps against a primitive whose shape (governed-subjects model, role-overlay pattern, expiry behavior, revocation authority) is only a recommendation, not yet ratified. If ratification changes any of the five decisions, that design work would need rework — the specific outcome the Implementation Map's build order exists to prevent.
- **Treating "blocked" as "stalled" and pausing all Phase 7 planning until ratification:** would leave Execution Safety Foundations' own planning chain unstarted for no dependency-driven reason, delaying a genuine Phase 8 prerequisite without cause.
- **Starting Execution Safety Foundations planning but implicitly assuming it will consume the unratified approval primitive's specific shape:** would reintroduce the same coupling risk from a different direction. Execution Safety Foundations' own planning chain should reference the approval primitive only as a named future dependency for its own approval-gated steps (e.g., an incident-response escalation that itself requires approval), not design against its unratified specifics.
- **Skipping straight to a Migration Design Plan for Execution Safety Foundations without the full Implementation Plan → Technical Design → Decision Record chain first:** would abandon the evidentiary discipline that produced a coherent, cross-checked result for the Shared Approval/Evidence Primitive (per the Implementation Readiness Review's Section 4 finding of zero architectural inconsistency across all six of its documents).

## 9. What Remains Dependent on Phase 7.1 Approval Decisions

Regardless of which workstream is pursued next, the following remain gated on the Decision Record's five decisions being ratified, and no future planning or implementation work should treat them as resolved until that ratification is confirmed directly against the Decision Record's own Status field:

- Any migration or implementation of the Shared Approval/Evidence Primitive itself.
- The Agent Registry's approval-gated lifecycle transitions (Proposed→Approved→Active).
- The Tool Registry's T3/T4 approval-gated actions.
- Any future Workflow Registry/Engine or Agent Execution Layer work (Phase 8) that consumes the shared primitive for approval/handoff steps — these are transitively, not directly, gated, since they also wait on Phase 7's registries and Execution Safety Foundations.
- The `approvals`-table reconciliation question and the three other schema-level open questions (`authority_role_at_decision`, structured vs. flexible `action_boundary`/`conditions`, purge-readiness marker) — these depend on the primitive's core decisions being settled first, since they are refinements of a design that itself has not been ratified.

## What This Document Does Not Do

- It does not implement any code, schema, or migration.
- It does not modify any source or database file.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not change the Phase 7 → Phase 8 → Phase 9 sequencing established by `COS_Next_Phase_Product_Roadmap.md` — it recommends an order within Phase 7 only, consistent with the Implementation Map's own existing build order.
- It does not authorize any workstream to begin — it is a recommendation for the accountable owners, not a work order.
- It does not resolve, ratify, or assume the outcome of any pending Phase 7.1 decision.

## References

- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Readiness Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Readiness_Review.md) — the blocker finding this recommendation responds to
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — the authoritative source for ratification status referenced in Section 9
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — the dependency graph and recommended build order this document reasons from (Sections 2–3)
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — Phase 7 → Phase 8 → Phase 9 sequencing, preserved unchanged
- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md)
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md), [Automation Architecture](../06_Automations/Automation_Architecture.md), [Workflow Registry](../06_Automations/Workflow_Registry.md) — existing design sources for Execution Safety Foundations
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md), [Tool Registry](../04_Tool_Registry/Tool_Registry.md) — existing design sources for the two registries, both gated on the approval primitive

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7 next-workstream recommendation: current status across all four Phase 7 capabilities, completed and blocked work, dependency analysis showing Execution Safety Foundations as the only remaining capability with no dependency on the blocked Shared Approval/Evidence Primitive, a recommendation to begin its planning chain next, supporting rationale, four named sequencing risks, and an explicit list of everything that remains dependent on Phase 7.1 ratification regardless of which workstream proceeds. No implementation performed, no sequencing changed, no release status changed. |
