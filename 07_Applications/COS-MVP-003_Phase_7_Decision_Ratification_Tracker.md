# COS-MVP-003 Phase 7 Decision Ratification Tracker

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Governance Tracking Artifact — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — tracking artifact, no capability exists to release

## 1. Purpose

Phase 7 has produced three Decision Records containing nineteen individual decisions, all currently unratified. `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` consolidated those decisions into a single reviewable set; this tracker exists to record their status **as it changes over time**, going forward — a living document, distinct from the Review Package's one-time snapshot. **This is a governance tracking artifact only.** It makes no decision, ratifies nothing, changes no recommendation, and authorizes no implementation, migration, credential, or release action. Every entry in the consolidated table (Section 3) reflects status as read from its source Decision Record at the time this tracker is created or updated — the source Decision Record remains authoritative if any discrepancy ever arises between it and this tracker.

## 2. Decision Status Definitions

Five statuses, used consistently across every decision in this tracker:

- **Pending Ratification** — the decision has a recorded recommendation but no accountable-owner action has been taken on it. This is the default and starting status for every decision in this tracker.
- **Approved** — the accountable owner(s) named for the decision have reviewed and accepted the recommendation exactly as recorded in the source Decision Record, with no modification.
- **Approved with Conditions** — the accountable owner(s) have accepted the decision's direction but attached a specific, named condition, amendment, or constraint not present in the original recommendation. The condition must be recorded in the Ratification History (Section 4) verbatim, not paraphrased.
- **Rejected** — the accountable owner(s) have declined the recommended option. A rejected decision requires a new decision-making pass (a revised Decision Record entry or a superseding document) before the affected capability can proceed past this decision.
- **Deferred** — the accountable owner(s) have explicitly declined to decide at this time, distinct from simply not yet having reviewed it (which remains "Pending Ratification"). A deferred decision should record a reason and, where known, a condition or timeframe for revisiting it.

**A decision moves between these statuses only through an explicit, recorded accountable-owner action** — never by the passage of time, by this tracker's own update, or by another decision's ratification.

## 3. Consolidated Decision Table

All nineteen Phase 7 decisions, sourced from the three Decision Records via `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md`. **Every status below is Pending Ratification as of this tracker's creation** — no decision has been acted on yet.

| ID | Capability | Decision | Recommendation | Owner | Status | Dependencies | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D01 | Shared Approval/Evidence Primitive | Governed Subject Acceptance | Accept `governed_subjects` registry as designed | Architecture Owner *(inferred)* | Pending Ratification | None | Unblocks D02–D05 conceptually; foundational to the whole primitive |
| D02 | Shared Approval/Evidence Primitive | Approval Role Model | Overlay model, no shared configurable table | Architecture Owner *(inferred)* | Pending Ratification | D01 | Determines every future subject type's role-check implementation pattern |
| D03 | Shared Approval/Evidence Primitive | Expiry/Revalidation Behavior | Subject-type-configurable `expires_at`, no silent renewal | Architecture Owner *(inferred)* | Pending Ratification | D01 | Determines whether documents' current no-expiry behavior is preserved unchanged |
| D04 | Shared Approval/Evidence Primitive | Evidence Retention Strategy | Indefinite by default; exceptions require separate approval | Data Owner, Security Owner *(inferred)* | Pending Ratification | None | Sets the retention precedent D10 and D17 each independently reach the same conclusion on |
| D05 | Shared Approval/Evidence Primitive | Revocation Authority Model | Stricter role than approval; Security Owner, System Owner fallback | Security Owner, System Owner (fallback) *(inferred)* | Pending Ratification | None | Precedent basis for D12 |
| D06 | Execution Safety Foundations | Incident Lifecycle Model | Seven-state model with `reopened` transition | Security Owner, Automation Owner (concurrence) | Pending Ratification | None | Determines `incidents` table's status field domain |
| D07 | Execution Safety Foundations | Recovery and Rollback Authority Model | Reconciliation contract must resolve definitely; stricter role for T3/T4 | Automation Owner, Security Owner (overlay) | Pending Ratification | None | Also gated on a separate technical-feasibility question (adapter reconciliation-contract support), not resolved by ratification alone |
| D08 | Execution Safety Foundations | Compensation Model and Evidence Handling | Authority: overlay + System Owner sign-off. Storage: deferred | Automation Owner, Security Owner (authority); Architecture Owner, Data Owner (storage) | Pending Ratification (authority); Deferred (storage) | Storage half depends on D01–D05 | Authority half can ratify independently; storage half cannot proceed until the primitive's shape is settled |
| D09 | Execution Safety Foundations | Checkpoint/Idempotency Responsibility Model | Hybrid (Option C) — default key with override | Automation Owner | Pending Ratification | None | No known cross-decision dependency |
| D10 | Execution Safety Foundations | Execution Audit Trail Ownership | Governed-write-only; indefinite retention by default | Data Owner, Automation Owner | Pending Ratification | None | Shares a retention posture with D04 and D17 — see Section 5 |
| D11 | Execution Safety Foundations | Relationship with Shared Approval/Evidence Primitive | No hard dependency for the capability as a whole | Architecture Owner | Pending Ratification | None (this decision itself formalizes independence from D01–D05) | Confirms Execution Safety Foundations' own planning chain did not need to wait on D01–D05 |
| D12 | Execution Safety Foundations | Emergency Authority Boundaries | Role-checked, time-bounded, mandatory-review model (Option B) | Security Owner, System Owner (concurrence) | Pending Ratification | None | Directly linked to D16 — see Section 5 |
| D13 | Tool Registry Security | Credential Ownership Model | Unified ownership, no separate credential-specific role | Security Owner, Data Owner | Pending Ratification | None | Basis for D19's unified classification-authority conclusion |
| D14 | Tool Registry Security | Secret Lifecycle Responsibility | Split by stage — Security Owner (policy), Tool Owner (execution) | Security Owner, Automation Owner (input) | Pending Ratification | None | Establishes "Tool Owner" as an operational role for future reference |
| D15 | Tool Registry Security | Rotation and Expiration Authority | Hard expiration at `rotation_due_at`, no grace period | Security Owner | Pending Ratification | None | Direct implementation requirement on the future Tool Broker |
| D16 | Tool Registry Security | Emergency Access Model | Existing authority list, extended with D12's time-bound/review model | Security Owner, Agent Owner, Automation Owner (concurrence) | Pending Ratification | D12 (directly extends its precedent) | If D12 changes materially, D16 needs revisiting — see Section 5 |
| D17 | Tool Registry Security | Audit Evidence Requirements | Live-executed validation required, design review insufficient | Security Owner, Data Owner | Pending Ratification | None | Shares a retention posture with D04 and D10 — see Section 5 |
| D18 | Tool Registry Security | Relationship to Shared Approval/Evidence Primitive | No dependency for credential-handling components | Architecture Owner | Pending Ratification | None (formalizes independence from D01–D05, parallel in structure to D11) | Confirms Tool Registry Security's own planning chain did not need to wait on D01–D05 |
| D19 | Tool Registry Security | Tool Trust Classification Authority | Unified ownership (as D13); rigor scales by T1–T4 class | Security Owner, relevant Domain Owner | Pending Ratification | D13 | Determines whether every future tool registration must record a formal risk class before credential handling begins |

## 4. Ratification History

No entries. Every decision in Section 3 remains at its default status (Pending Ratification) as of this tracker's creation. When any decision's status changes, this section must record: the decision ID, the date, the new status, the accountable owner(s) who acted, and — for Approved with Conditions, Rejected, or Deferred — the specific condition, reason, or revisit criteria in the owner's own words, not paraphrased. This section is append-only in spirit: a decision's status may change again later, but the prior entry should remain in this history, not be overwritten, so the tracker itself preserves an audit trail of how each decision reached its current state.

*(Table intentionally empty pending the first ratification action.)*

## 5. Dependency Impact Tracking

Cross-decision relationships that a status change in one decision could affect, carried forward from `COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md` Section 4 and restated here in a form this tracker can check against as statuses actually change:

- **D01–D05 → D08 (storage half).** D08's compensation-evidence storage question cannot move past Pending/Deferred until D01–D05 reach a status that establishes the Shared Approval/Evidence Primitive's actual shape (Approved or Approved with Conditions). If D01–D05 are Rejected or remain Deferred indefinitely, D08's storage half has no primitive shape to adopt and should default toward the dedicated-table fallback named in its own source decision, per that decision's own stated fallback language — not decided by this tracker, only noted as the condition under which that fallback becomes relevant.
- **D12 → D16.** If D12 is ratified as currently recommended (Approved), D16 may also be ratified as currently recommended without further reconciliation. If D12 is ratified **with conditions**, **rejected**, or given a materially different shape, D16 must be re-reviewed before being finalized, since its own recommendation explicitly extends D12's precedent.
- **D04, D10, D17 (shared retention posture).** No formal dependency, but if any one of these three reaches a status materially different from "Approved as recommended" (indefinite-by-default retention), the other two should be re-checked for consistency — not because one decision requires another to change, but because all three currently justify the same conclusion using the same underlying precedent (`Schema_Specification.md`'s `audit.events` entry), and an inconsistent outcome across them would be worth the accountable owners' attention.
- **D13 → D19.** D19's classification-authority conclusion is explicitly "unified ownership, as D13" — if D13 changes, D19's authority half should be re-checked, though D19's separate rigor-scaling conclusion (credential rigor by T1–T4 class) does not depend on D13 and could be ratified independently of it.
- **D11 and D18 (independence findings).** Neither depends on the other, and neither is contingent on D01–D05's status — both already conclude "no dependency" as their own finding. A future change to D01–D05's ratified shape would not retroactively invalidate D11 or D18, since both already account for the primitive being unratified when reaching their independence conclusion.

## 6. Change Management Rules

- **Only an explicit, recorded accountable-owner action moves a decision's status** — this tracker itself never advances a status, infers ratification from silence, or assumes approval because a related decision was approved.
- **Every status change must be logged in Section 4** before or in the same update as the Section 3 table cell being changed — the two sections must never diverge; if Section 3 shows a status with no corresponding Section 4 entry, that is a tracker defect to be corrected, not treated as valid.
- **A status change to one decision does not automatically change any other decision's status**, even where Section 5 identifies a dependency — a dependency means "this decision should be reviewed in light of that one," not "this decision inherits that one's status."
- **This tracker does not overrule its source Decision Records.** If this tracker and a source Decision Record ever disagree on a decision's current status, the source Decision Record (or, once ratification begins, the actual ratification record it is amended to reference) is authoritative, and this tracker must be corrected to match — not the reverse.
- **New decisions may be added to Section 3** as future Phase 7 (or later) planning chains produce their own Decision Records — appended with the next sequential ID, never renumbering existing entries.
- **This tracker does not itself constitute a ratification record.** Recording "Approved" in Section 3 reflects that ratification occurred elsewhere (in a source Decision Record's own updated status, or a future dedicated ratification document); it is not the act of ratification itself.

## 7. Explicit Out of Scope

- **Any decision, ratification, rejection, or deferral** — every status in Section 3 is Pending Ratification, and this document does not change any of them.
- **Any change to a recommendation** — every recommendation summary in Section 3 is quoted or paraphrased from its source Decision Record, not revised.
- **Any implementation, migration, or SQL.**
- **Any credential, secret, or secret-manager configuration.**
- **Any change to COS-MVP-002's release status**, which remains **Not Released**, unaffected by this tracker.
- **Any tag or release.**
- **Any change to the Phase 7 → Phase 8 → Phase 9 sequencing** established by `COS_Next_Phase_Product_Roadmap.md`.

## What This Document Does Not Do

- It does not make, ratify, reject, or defer any decision.
- It does not change any recommendation from its source Decision Record.
- It does not authorize any implementation, migration, credential, or deployment.
- It does not modify any application source file or database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not itself constitute a ratification action — see Section 6's own rule on this point.

## References

- [COS-MVP-003 Phase 7 Status and Governance Snapshot](COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md)
- [COS-MVP-003 Phase 7 Accountable Owner Review Package](COS-MVP-003_Phase_7_Accountable_Owner_Review_Package.md) — the source of this tracker's decision inventory and dependency analysis
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — source of D01–D05
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — source of D06–D12
- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of D13–D19
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this tracker

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial decision ratification tracker: purpose distinguishing this living tracker from the one-time Review Package; five decision status definitions (Pending Ratification, Approved, Approved with Conditions, Rejected, Deferred); a consolidated 19-row decision table (D01–D19) with ID, capability, decision, recommendation, owner, status, dependencies, and impact for every Phase 7 decision, all currently Pending Ratification; an empty Ratification History section awaiting the first status change; dependency impact tracking covering five cross-decision relationships (D01–D05→D08, D12→D16, D04/D10/D17 shared retention posture, D13→D19, D11/D18 independence findings); six change-management rules governing how this tracker may be updated; explicit out-of-scope boundaries. No decision made, no decision ratified, no implementation performed, no release status changed. |
