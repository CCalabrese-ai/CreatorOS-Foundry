# COS-MVP-003 Phase 7 Gate Resolution Plan

**Phase:** 7 — Foundation
**Version:** 1.1
**Document owner:** Architecture Owner
**Status:** Gate Resolution Plan — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — sequencing artifact, no capability exists to release

## 1. Purpose

`COS-MVP-003_Phase_8_Transition_Readiness_Review.md` found every substantive Phase 8 capability Blocked, tracing each block back to a specific, named Phase 7 gate. This document organizes those gates into a single, dependency-aware plan for resolving them — not by choosing an order or making any policy call, but by making the actual dependency structure explicit enough that whoever does the sequencing (an accountable-owner decision this document does not make) can do so with the full picture in view. **This is a governance and sequencing artifact only.** It ratifies no decision, makes no policy decision, authorizes no implementation, creates no migration, writes no SQL, modifies no source or database file, and changes no release status.

**Alignment note (v1.1):** this document was originally written while all nineteen Phase 7 decisions were unratified. They have since been resolved (`COS-MVP-003_Phase_7_Decision_Ratification_Record.md`, `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`): sixteen Approved as recommended, D07 Approved with two conditions (the reconciliation-contract feasibility gate remains explicitly unresolved as one of those conditions), and D08's storage half — originally deferred — subsequently resolved as Approved with Conditions (dedicated `compensation_evidence` storage). This revision updates every location that assumed decisions were still pending or that D08's storage remained open. **It does not ratify, re-ratify, or reinterpret any decision, and does not touch any ratification record — it aligns this plan's own language with decisions already made elsewhere.** The remaining, still-genuinely-open gates — D07's technical feasibility, all live-executed validation, the secret-manager/provider decision, and the unplanned Agent Registry / Tool Registry full-lifecycle chains — are unchanged by this alignment and remain exactly as open as before.

## Maintaining the Distinction

- **Planning ≠ implementation.** This plan organizes what must happen before implementation can safely begin. It does not perform any of it.
- **Recommendation ≠ approval.** Every gate below traces to a recommendation already recorded in a source Decision Record. None is ratified by appearing in this plan.
- **Readiness ≠ authorization.** Describing a gate's unlock condition is not the same as clearing it, and clearing every gate would still require a separate, explicit authorization to implement — this plan does not supply that authorization.
- **Dependency ≠ automatic decision.** Where this plan identifies that one gate depends on another, that means the dependent gate cannot be *resolved* until the other is — it does not mean resolving the first automatically resolves the second, or that any particular resolution is implied.

## 2. Current Gate Inventory

Three distinct categories of gate, not to be conflated with each other — a capability can clear one category and remain blocked by another.

### Decision ratification gates — resolved

Nineteen decisions across three Decision Records, tracked individually as D01–D19 in `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`. **All nineteen are now resolved:** sixteen Approved as recommended, D07 Approved with two conditions, D08's storage half Approved with Conditions (dedicated `compensation_evidence` storage). This category no longer functions as a blocking gate — it is retained here for structural completeness and because D07's conditions and D08's conditions carry forward into the Validation and Dependency categories below, not because ratification itself remains outstanding.

### Validation gates

Distinct from ratification, and not satisfied by it — **ratification of D01–D19 does not clear any item below; every one remains fully unresolved:**
- **Shared Approval/Evidence Primitive:** its own Migration Design Plan Section 7 requires live-executed evidence — RLS/security tests, lifecycle transition tests, self-approval prevention tests, evidence-integrity tests, and a document-compatibility regression test — before migration execution. D01–D05 are now ratified, which satisfies that specific precondition, but none of the live-executed evidence itself has been produced.
- **Execution Safety Foundations:** its own Implementation Specification Section 8 requires live-executed quarantine, reconciliation, compensation, idempotency, self-compensation-denial, RLS, and demonstrated end-to-end recovery tests — none executed. The compensation test's target is now known (`compensation_evidence`, per D08's resolution), but the test itself has not run, and the reconciliation test remains additionally gated on D07's own unresolved technical-feasibility condition (see Dependency gates, below).
- **Tool Registry Security:** Decision Record Decision 17 (Audit Evidence Requirements) itself establishes that live-executed rotation, revocation, emergency-pause, expiration, and self-approval-denial tests are required before credential handling is considered validated — none executed.

### Dependency gates

Distinct from both of the above: capabilities that cannot even begin their *own* planning because a prerequisite capability has not reached a resolved state.
- **D07's technical-feasibility question** (integration-adapter reconciliation-contract support) — **still fully unresolved.** This is explicitly preserved as one of D07's two approval conditions, not cleared by ratification: not blocked on another capability's decisions, but on an external technical fact (real adapter behavior) this repository's planning documents cannot resolve on their own.
- **The Agent Registry and Tool Registry's full lifecycle** still have no planning chain at all. Per `COS_Architecture_Implementation_Map.md`'s own Recommended Build Order, they cannot safely *begin* planning until the Shared Approval/Evidence Primitive reaches implementation-ready status — D01–D05 are now ratified, but the primitive's own live-executed validation suite has not run, so "implementation-ready" (ratified **and** validated) is not yet met. This remains a dependency gate on an entire capability's readiness, narrowed from "ratification pending" to "validation pending."
- **Phase 8's own capabilities** (Workflow Engine, Agent Execution Layer) are dependency-gated on all of the above simultaneously, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s findings — unchanged by this alignment.

## 3. Decision Clustering

The nineteen decisions grouped by their source capability, restated from `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md` for this plan's own self-sufficiency:

**Shared Approval/Evidence Primitive (D01–D05):** Governed Subject Acceptance, Approval Role Model, Expiry/Revalidation Behavior, Evidence Retention Strategy, Revocation Authority Model. All five are foundational to the primitive's basic shape — no partial-ratification path was identified in the source Decision Record that would let some but not all five resolve independently and still leave the primitive buildable, since the primitive's schema (per its own Schema Design Review) assumes all five are settled.

**Execution Safety Foundations (D06–D12):** Incident Lifecycle Model, Recovery and Rollback Authority Model, Compensation Model and Evidence Handling (authority and storage both now resolved — authority Approved, storage Approved with Conditions as dedicated `compensation_evidence` storage), Checkpoint/Idempotency Responsibility Model, Execution Audit Trail Ownership, Relationship with Shared Approval/Evidence Primitive, Emergency Authority Boundaries. All seven are now ratified; D07 carries two conditions, one of which (reconciliation-contract feasibility) remains a live, unresolved technical gate distinct from ratification. D08's storage half was, historically, the one decision in this cluster with a dependency on the Shared Approval/Evidence Primitive cluster (Section 4) — that dependency is now satisfied.

**Tool Registry Security (D13–D19):** Credential Ownership Model, Secret Lifecycle Responsibility, Rotation and Expiration Authority, Emergency Access Model, Audit Evidence Requirements, Relationship to Shared Approval/Evidence Primitive, Tool Trust Classification Authority. All seven have no dependency on the Shared Approval/Evidence Primitive cluster for their own ratification (D18 itself is the decision confirming this), though D16 has an internal dependency on D12 (Section 4).

## 4. Cross-Capability Dependencies

Restated from `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 4 and `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md` Section 5, organized here specifically for gate-resolution sequencing:

- **D08 (storage half) depended on D01–D05 — now resolved.** The Execution Safety Foundations Decision Record originally declined to choose between a dedicated compensation-evidence table and reuse of the Shared Approval/Evidence Primitive, pending the primitive's ratified shape. D01–D05 were subsequently ratified, and D08's storage half was reassessed and resolved: dedicated `compensation_evidence` storage, Approved with Conditions (governance-convention compliance; a future migration to the primitive remains possible). This was the one place in the entire nineteen-decision set where a decision literally could not be resolved independently of another cluster — it no longer requires further action.
- **D12 → D16 (linked, not blocking).** Tool Registry Security's emergency-access model explicitly extends Execution Safety Foundations' emergency-authority precedent. D16 *can* be ratified independently of D12 — but if D12 is later ratified with a materially different shape, D16 would need to be revisited to stay consistent. This is a consistency dependency, not a sequencing blocker.
- **D04, D10, D17 (shared retention posture, not blocking).** All three independently reach "indefinite retention by default" using the same underlying precedent. No formal dependency exists, but resolving them with inconsistent postures would be worth noticing.
- **D13 → D19 (internal, not blocking).** D19's authority conclusion restates D13's; its rigor-scaling conclusion is independent of D13.
- **Everything else was independently resolvable, and is now resolved.** Of the nineteen decisions, D08's storage half was the only one with an actual sequencing dependency on another cluster — a materially smaller cross-cluster coupling than the total decision count suggested, and now fully closed.

## 5. Unlock Conditions

For each blocked capability, what must be true before it may proceed — stated as conditions, not authorizations.

**Shared Approval/Evidence Primitive → implementation-ready:** D01–D05 ratified — **now satisfied** (all five Approved as recommended) — **and** the Migration Design Plan's live-executed validation suite completed **and** confirmed passing — **still outstanding.**

**Execution Safety Foundations → implementation-ready:** D06, D09, D10, D11, D12 ratified — **now satisfied**; D07 ratified with two conditions — **now satisfied for ratification, but its reconciliation-contract feasibility condition remains a live, unresolved technical gate**; D08's authority half ratified and storage half now resolved (dedicated `compensation_evidence` storage) — **now satisfied**; the integration-adapter reconciliation-contract feasibility question resolved with actual evidence against a real adapter — **still outstanding, the same item as D07's condition**; the Implementation Specification's live-executed validation suite completed and passing — **still outstanding.**

**Tool Registry Security → implementation-ready:** D13–D19 ratified — **now satisfied**; the live-executed validation suite (rotation, revocation, emergency-pause, expiration, self-approval-denial, RLS) completed and passing — **still outstanding**; a secret-manager/provider selected (an unresolved policy question named in the Decision Record, not itself one of the nineteen tracked decisions, but a prerequisite to actual credential provisioning) — **still outstanding.**

**Agent Registry → planning-ready (not yet implementation-ready, since no planning chain exists):** the Shared Approval/Evidence Primitive reaches implementation-ready status above — per the Implementation Map's own Recommended Build Order, beginning Agent Registry planning before this risks the same "bespoke approval mechanism" rework already avoided once in this Phase 7 effort.

**Tool Registry (full lifecycle) → planning-ready:** same condition as the Agent Registry — the Shared Approval/Evidence Primitive implementation-ready, plus the completed Tool Registry Security sub-chain reaching its own implementation-ready status above, since the full lifecycle's credential handling would build on that sub-chain's design.

**Phase 8 (Workflow Engine, Agent Execution Layer) → planning-ready:** per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s own findings, all of the above — every Phase 7 capability at implementation-ready status, plus (for the Agent Execution Layer specifically) the Agent Registry and Tool Registry's own planning chains completed, not merely started.

## 6. Independent Work That Can Safely Continue

Work that requires no decision ratification and no dependency-gate resolution to proceed right now:

- **Execution Safety Foundations' integration-adapter reconciliation-contract feasibility testing** — a technical question, answerable by testing a real adapter, independent of whether D06–D12 have been ratified. This is the one validation gate in the entire inventory that does not wait on any decision at all.
- **Extending `src/services/observability.js`** into new services, per the Roadmap's own "ongoing, starting in Phase 7" recommendation — no Phase 7 decision or dependency gate touches this.
- **Documentation-only review of `COS-WF-001`'s existing specification**, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md` Section 5 — a comprehension exercise, not a design commitment, and therefore not gated on anything in this inventory.
- **Further live-database verification**, if and when a session with actual database access becomes available — closing the `systems`/`versions` origin gap named in `COS-MVP-003_Phase_7_Live_State_Reconciliation_Report.md` requires no ratification, only tool access this session did not have.

**What is not independent, even though it might appear so:** preparing test fixtures or a validation environment for Tool Registry Security's live-executed suite (Section 2) still requires care. D13–D19 are now ratified, which was the original condition named here, so the suite may now be meaningfully scoped and prepared — but it still cannot be *executed* until a secret-manager/provider is selected and a live/staging environment is available, per Section 5's still-outstanding items.

## 7. Risks of Delayed Resolution

- **Ratification backlog — resolved, superseded by a validation backlog.** The nineteen-decision ratification backlog originally named here (per `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` Section 6 and `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 7) has cleared. The equivalent risk now sits one layer downstream: a live-executed validation backlog spanning all three chains, none of which has run.
- **Stale recommendations — narrowed.** This risk applied to all nineteen decisions while unratified; it now applies only to whatever remains genuinely open — D07's technical-feasibility question and the secret-manager/provider decision — since every ratified decision is no longer at risk of staleness in the same sense (it has been acted on, not merely recommended).
- **Phase 8 opportunity cost — partially relieved.** Ratification no longer blocks Phase 8 planning readiness by itself, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s own findings — but live validation, D07's feasibility question, and the unplanned Agent Registry / Tool Registry chains still do, so the opportunity cost persists, just for a narrower set of reasons.
- **Loss of context.** The rationale behind each recommendation (documented in its source Decision Record) is freshest now, immediately after being written. A long delay risks the accountable owners reviewing decisions without the same context this Phase 7 effort had when producing them — mitigated by the Decision Records' own thoroughness, but not eliminated by it.
- **Independent-work drift.** If the items in Section 6 proceed for a long period without any gate resolution happening in parallel, the gap between "what's ready" and "what's still blocked" could widen in a way that makes eventual reconciliation harder — not a reason to halt Section 6's work, but a reason not to treat it as a substitute for gate resolution.

## 8. Recommended Sequencing Considerations

Considerations only — this plan does not choose or authorize an order for whatever remains open, mirroring the same restraint `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 8 already exercised. **All nineteen decisions are now ratified; the considerations below apply to the gates that remain — D07's technical feasibility, live-executed validation across all three chains, the secret-manager/provider decision, and the two unplanned registry chains — not to any further ratification sequencing, which is no longer needed.**

- Resolving D07's reconciliation-contract feasibility question first would close the one remaining item that gates both Execution Safety Foundations' own validation suite and, transitively, the Workflow Engine and Agent Execution Layer's recovery mechanisms — and it requires no live database environment, only adapter access, so it can proceed independently of everything else in this list.
- Selecting a secret-manager/provider for Tool Registry Security can proceed in parallel with the above, since it depends on neither a database environment nor D07's resolution.
- Once a live/staging environment becomes available, the Shared Approval/Evidence Primitive's validation suite is the most schema-ready of the three chains and could proceed first; Execution Safety Foundations' compensation test can now target the resolved `compensation_evidence` table; Tool Registry Security's suite remains gated on the provider decision above regardless of environment availability.
- Beginning Agent Registry or Tool Registry full-lifecycle planning remains contingent on the Shared Approval/Evidence Primitive reaching implementation-ready status (ratified **and** validated) — ratification alone, now complete, was never presented as sufficient on its own for this specific unlock condition (Section 5).

Any of these, another approach entirely, or addressing the remaining gates in whatever order the accountable owners find most convenient, are equally available — this plan expresses no preference among them.

## 9. Explicit Out of Scope

- **Ratification of any decision** — every decision named in this plan remains exactly as `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md` states.
- **Any policy decision** — this plan organizes existing recommendations; it does not make or amend any of them.
- **Any implementation, migration, or SQL.**
- **Any credential, secret, or secret-manager configuration.**
- **Any change to COS-MVP-002's release status**, which remains **Not Released**.
- **Any tag or release.**
- **Choosing or authorizing a ratification order** — Section 8 presents considerations only.
- **Redefinition of any Phase 7 or Phase 8 architecture** — this plan is a sequencing organization of existing, already-completed decisions, not a redesign of any of them.

## What This Document Does Not Do

- It does not ratify any decision.
- It does not make any policy decision.
- It does not authorize any implementation.
- It does not create any database migration or write any SQL.
- It does not modify any application source file or database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not prescribe a ratification order — Section 8 presents considerations only.

## References

- [COS-MVP-003 Phase 7 Status and Governance Snapshot](COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md)
- [COS-MVP-003 Phase 7 Accountable Owner Review Package](COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md) — source of the cross-capability dependency analysis restated in Section 4
- [COS-MVP-003 Phase 7 Decision Ratification Record](COS-MVP-003_Phase_7_Decision_Ratification_Record.md), [COS-MVP-003 Phase 7 Decision Ratification Tracker](COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md) — the authoritative, current source for every decision's status, including D07's conditions and D08's resolved storage decision, reflected throughout this v1.1 alignment
- [COS-MVP-003 Phase 7 Completion and Transition Record](COS-MVP-003_Phase_7_Completion_and_Transition_Record.md)
- [COS-MVP-003 Phase 8 Transition Readiness Review](COS-MVP-003_Phase_8_Transition_Readiness_Review.md) — source of the Phase 8 dependency findings this plan's unlock conditions (Section 5) build on
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md), [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md), [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md)
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — the Recommended Build Order this plan's Section 5 references

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7 gate resolution plan: purpose; a three-category gate inventory (decision ratification, validation, dependency); the nineteen decisions clustered by source capability; cross-capability dependency analysis finding only one true sequencing dependency (D08's storage half on D01–D05) among the nineteen; unlock conditions stated per blocked capability from the Shared Approval/Evidence Primitive through Phase 8 itself; independent work identified that requires no gate resolution (adapter-feasibility testing, observability extension, COS-WF-001 documentation review, live-database verification); five named risks of delayed resolution; sequencing considerations offered without choosing or authorizing an order; explicit out-of-scope boundaries. No decision ratified, no policy decision made, no implementation performed, no release status changed. |
| 1.1 | Documentation alignment pass reflecting that all nineteen Phase 7 decisions are now ratified: updated the Decision ratification gates category (no longer blocking), the Validation and Dependency gate categories (explicitly preserving D07's reconciliation-contract feasibility condition and all live-executed validation as fully unresolved despite ratification), Decision Clustering's Execution Safety Foundations entry, Cross-Capability Dependencies' D08 entry (marked resolved), Unlock Conditions (per-item ratified/outstanding status), Independent Work's Tool Registry Security note, Risks (narrowed from a ratification backlog to a validation backlog), and Recommended Sequencing Considerations (re-scoped from ratification order to remaining-gate order). No ratification record, decision outcome, or COS-MVP-002 status was modified — this document's own content was aligned with decisions already made elsewhere. No implementation performed, no SQL written, no migration created, no release status changed. |
