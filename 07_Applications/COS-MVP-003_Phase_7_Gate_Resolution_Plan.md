# COS-MVP-003 Phase 7 Gate Resolution Plan

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Gate Resolution Plan — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — sequencing artifact, no capability exists to release

## 1. Purpose

`COS-MVP-003_Phase_8_Transition_Readiness_Review.md` found every substantive Phase 8 capability Blocked, tracing each block back to a specific, named Phase 7 gate. This document organizes those gates into a single, dependency-aware plan for resolving them — not by choosing an order or making any policy call, but by making the actual dependency structure explicit enough that whoever does the sequencing (an accountable-owner decision this document does not make) can do so with the full picture in view. **This is a governance and sequencing artifact only.** It ratifies no decision, makes no policy decision, authorizes no implementation, creates no migration, writes no SQL, modifies no source or database file, and changes no release status.

## Maintaining the Distinction

- **Planning ≠ implementation.** This plan organizes what must happen before implementation can safely begin. It does not perform any of it.
- **Recommendation ≠ approval.** Every gate below traces to a recommendation already recorded in a source Decision Record. None is ratified by appearing in this plan.
- **Readiness ≠ authorization.** Describing a gate's unlock condition is not the same as clearing it, and clearing every gate would still require a separate, explicit authorization to implement — this plan does not supply that authorization.
- **Dependency ≠ automatic decision.** Where this plan identifies that one gate depends on another, that means the dependent gate cannot be *resolved* until the other is — it does not mean resolving the first automatically resolves the second, or that any particular resolution is implied.

## 2. Current Gate Inventory

Three distinct categories of gate, not to be conflated with each other — a capability can clear one category and remain blocked by another.

### Decision ratification gates

Nineteen decisions across three Decision Records, tracked individually as D01–D19 in `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`, every one currently **Pending Ratification**. This is a governance gate: it requires an accountable-owner action, not a technical one.

### Validation gates

Distinct from ratification, and not satisfied by it:
- **Shared Approval/Evidence Primitive:** its own Migration Design Plan Section 7 requires live-executed evidence — RLS/security tests, lifecycle transition tests, self-approval prevention tests, evidence-integrity tests, and a document-compatibility regression test — before migration execution, in addition to D01–D05's ratification.
- **Execution Safety Foundations:** its own Implementation Specification Section 8 requires live-executed quarantine, reconciliation, compensation, idempotency, self-compensation-denial, RLS, and demonstrated end-to-end recovery tests — none executed.
- **Tool Registry Security:** Decision Record Decision 17 (Audit Evidence Requirements) itself establishes that live-executed rotation, revocation, emergency-pause, expiration, and self-approval-denial tests are required before credential handling is considered validated — none executed.

### Dependency gates

Distinct from both of the above: capabilities that cannot even begin their *own* planning because a prerequisite capability has not reached a resolved state.
- **Execution Safety Foundations' technical-feasibility question** (integration-adapter reconciliation-contract support) is a dependency gate of a different kind — not blocked on another capability's decisions, but on an external technical fact (real adapter behavior) this repository's planning documents cannot resolve on their own.
- **The Agent Registry and Tool Registry's full lifecycle** have no planning chain at all, and per `COS_Architecture_Implementation_Map.md`'s own Recommended Build Order, cannot safely *begin* planning until the Shared Approval/Evidence Primitive reaches a resolved state (D01–D05 ratified and validated) — this is a dependency gate on an entire capability's readiness, not on a single decision.
- **Phase 8's own capabilities** (Workflow Engine, Agent Execution Layer) are dependency-gated on all of the above simultaneously, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s findings.

## 3. Decision Clustering

The nineteen decisions grouped by their source capability, restated from `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md` for this plan's own self-sufficiency:

**Shared Approval/Evidence Primitive (D01–D05):** Governed Subject Acceptance, Approval Role Model, Expiry/Revalidation Behavior, Evidence Retention Strategy, Revocation Authority Model. All five are foundational to the primitive's basic shape — no partial-ratification path was identified in the source Decision Record that would let some but not all five resolve independently and still leave the primitive buildable, since the primitive's schema (per its own Schema Design Review) assumes all five are settled.

**Execution Safety Foundations (D06–D12):** Incident Lifecycle Model, Recovery and Rollback Authority Model, Compensation Model and Evidence Handling (authority half only — the storage half is a separate, explicitly deferred sub-question), Checkpoint/Idempotency Responsibility Model, Execution Audit Trail Ownership, Relationship with Shared Approval/Evidence Primitive, Emergency Authority Boundaries. Six of seven (D06, D07, D09, D10, D11, D12) have no dependency on the Shared Approval/Evidence Primitive cluster. D08's storage half is the one exception (Section 4).

**Tool Registry Security (D13–D19):** Credential Ownership Model, Secret Lifecycle Responsibility, Rotation and Expiration Authority, Emergency Access Model, Audit Evidence Requirements, Relationship to Shared Approval/Evidence Primitive, Tool Trust Classification Authority. All seven have no dependency on the Shared Approval/Evidence Primitive cluster for their own ratification (D18 itself is the decision confirming this), though D16 has an internal dependency on D12 (Section 4).

## 4. Cross-Capability Dependencies

Restated from `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 4 and `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md` Section 5, organized here specifically for gate-resolution sequencing:

- **D08 (storage half) depends on D01–D05.** The Execution Safety Foundations Decision Record explicitly declined to choose between a dedicated compensation-evidence table and reuse of the Shared Approval/Evidence Primitive, because the primitive's ratified shape isn't known yet. This is the one place in the entire nineteen-decision set where a decision literally cannot be resolved independently of another cluster.
- **D12 → D16 (linked, not blocking).** Tool Registry Security's emergency-access model explicitly extends Execution Safety Foundations' emergency-authority precedent. D16 *can* be ratified independently of D12 — but if D12 is later ratified with a materially different shape, D16 would need to be revisited to stay consistent. This is a consistency dependency, not a sequencing blocker.
- **D04, D10, D17 (shared retention posture, not blocking).** All three independently reach "indefinite retention by default" using the same underlying precedent. No formal dependency exists, but resolving them with inconsistent postures would be worth noticing.
- **D13 → D19 (internal, not blocking).** D19's authority conclusion restates D13's; its rigor-scaling conclusion is independent of D13.
- **Everything else is independently resolvable.** Of the nineteen decisions, only D08's storage half has an actual sequencing dependency on another cluster. This is a materially smaller cross-cluster coupling than the total decision count might suggest.

## 5. Unlock Conditions

For each blocked capability, what must be true before it may proceed — stated as conditions, not authorizations.

**Shared Approval/Evidence Primitive → implementation-ready:** D01–D05 ratified (any status other than Pending Ratification for all five, though "ratified as recommended" is the path every downstream document assumed when reasoning about consistency) **and** the Migration Design Plan's live-executed validation suite completed **and** confirmed passing.

**Execution Safety Foundations → implementation-ready:** D06, D07, D09, D10, D11, D12 ratified; D08's authority half ratified independently of its storage half, which remains explicitly deferred; the integration-adapter reconciliation-contract feasibility question resolved with actual evidence against a real adapter; the Implementation Specification's live-executed validation suite completed and passing.

**Tool Registry Security → implementation-ready:** D13–D19 ratified; the live-executed validation suite (rotation, revocation, emergency-pause, expiration, self-approval-denial, RLS) completed and passing; a secret-manager/provider selected (an unresolved policy question named in the Decision Record, not itself one of the nineteen tracked decisions, but a prerequisite to actual credential provisioning).

**Agent Registry → planning-ready (not yet implementation-ready, since no planning chain exists):** the Shared Approval/Evidence Primitive reaches implementation-ready status above — per the Implementation Map's own Recommended Build Order, beginning Agent Registry planning before this risks the same "bespoke approval mechanism" rework already avoided once in this Phase 7 effort.

**Tool Registry (full lifecycle) → planning-ready:** same condition as the Agent Registry — the Shared Approval/Evidence Primitive implementation-ready, plus the completed Tool Registry Security sub-chain reaching its own implementation-ready status above, since the full lifecycle's credential handling would build on that sub-chain's design.

**Phase 8 (Workflow Engine, Agent Execution Layer) → planning-ready:** per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s own findings, all of the above — every Phase 7 capability at implementation-ready status, plus (for the Agent Execution Layer specifically) the Agent Registry and Tool Registry's own planning chains completed, not merely started.

## 6. Independent Work That Can Safely Continue

Work that requires no decision ratification and no dependency-gate resolution to proceed right now:

- **Execution Safety Foundations' integration-adapter reconciliation-contract feasibility testing** — a technical question, answerable by testing a real adapter, independent of whether D06–D12 have been ratified. This is the one validation gate in the entire inventory that does not wait on any decision at all.
- **Extending `src/services/observability.js`** into new services, per the Roadmap's own "ongoing, starting in Phase 7" recommendation — no Phase 7 decision or dependency gate touches this.
- **Documentation-only review of `COS-WF-001`'s existing specification**, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md` Section 5 — a comprehension exercise, not a design commitment, and therefore not gated on anything in this inventory.
- **Further live-database verification**, if and when a session with actual database access becomes available — closing the `systems`/`versions` origin gap named in `COS-MVP-003_Phase_7_Live_State_Reconciliation_Report.md` requires no ratification, only tool access this session did not have.

**What is not independent, even though it might appear so:** preparing test fixtures or a validation environment for Tool Registry Security's live-executed suite (Section 2) requires care — the suite itself cannot be executed meaningfully before D13–D19 are ratified, since the validation is meant to confirm a *ratified* design behaves correctly, not merely that some design does.

## 7. Risks of Delayed Resolution

- **Ratification backlog compounding.** Already named in `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` Section 6 and `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 7 — restated here because gate resolution is precisely the activity that backlog blocks. Continued delay does not shrink the backlog; only ratification does.
- **Stale recommendations.** Every recommendation in the nineteen-decision inventory reflects this repository's architecture and governance state at the time it was written. Extended delay increases the chance that some other part of the repository changes in the interim in a way that makes a recommendation's assumptions outdated before it is even reviewed.
- **Phase 8 opportunity cost.** Every day the nineteen decisions remain unratified is a day Phase 8 cannot begin planning, per `COS-MVP-003_Phase_8_Transition_Readiness_Review.md`'s own finding that every substantive Phase 8 capability is Blocked on these same gates.
- **Loss of context.** The rationale behind each recommendation (documented in its source Decision Record) is freshest now, immediately after being written. A long delay risks the accountable owners reviewing decisions without the same context this Phase 7 effort had when producing them — mitigated by the Decision Records' own thoroughness, but not eliminated by it.
- **Independent-work drift.** If the items in Section 6 proceed for a long period without any gate resolution happening in parallel, the gap between "what's ready" and "what's still blocked" could widen in a way that makes eventual reconciliation harder — not a reason to halt Section 6's work, but a reason not to treat it as a substitute for gate resolution.

## 8. Recommended Sequencing Considerations

Considerations only — this plan does not choose or authorize a ratification order, mirroring the same restraint `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 8 already exercised:

- Resolving D01–D05 first would unblock the widest set of downstream items — D08's storage half, and the planning-readiness condition for both the Agent Registry and the Tool Registry's full lifecycle — per Section 5's unlock conditions.
- The two clusters with no cross-cluster dependency at all (Execution Safety Foundations' D06/D07/D09/D10/D11/D12, and Tool Registry Security's D13–D19) could proceed on entirely independent timelines from each other and from D01–D05, if unblocking the widest set of downstream work is not the priority.
- Resolving Execution Safety Foundations' adapter-feasibility question in parallel with any ratification track — since it requires no ratification to proceed at all — would avoid it becoming a second, later-discovered blocker after ratification is otherwise complete.
- Reviewing D12 and D16 together, given their direct linkage (Section 4), would reduce the risk of needing to revisit D16 after the fact.

Any of these, another approach entirely, or resolving all nineteen decisions in whatever order the accountable owners find most convenient, are equally available — this plan expresses no preference among them.

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
- [COS-MVP-003 Phase 7 Decision Ratification Tracker](COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md) — the authoritative, current source for every decision's status
- [COS-MVP-003 Phase 7 Completion and Transition Record](COS-MVP-003_Phase_7_Completion_and_Transition_Record.md)
- [COS-MVP-003 Phase 8 Transition Readiness Review](COS-MVP-003_Phase_8_Transition_Readiness_Review.md) — source of the Phase 8 dependency findings this plan's unlock conditions (Section 5) build on
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md), [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md), [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md)
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — the Recommended Build Order this plan's Section 5 references

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 7 gate resolution plan: purpose; a three-category gate inventory (decision ratification, validation, dependency); the nineteen decisions clustered by source capability; cross-capability dependency analysis finding only one true sequencing dependency (D08's storage half on D01–D05) among the nineteen; unlock conditions stated per blocked capability from the Shared Approval/Evidence Primitive through Phase 8 itself; independent work identified that requires no gate resolution (adapter-feasibility testing, observability extension, COS-WF-001 documentation review, live-database verification); five named risks of delayed resolution; sequencing considerations offered without choosing or authorizing an order; explicit out-of-scope boundaries. No decision ratified, no policy decision made, no implementation performed, no release status changed. |
