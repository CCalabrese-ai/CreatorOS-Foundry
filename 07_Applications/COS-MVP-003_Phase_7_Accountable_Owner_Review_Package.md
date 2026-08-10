# COS-MVP-003 Phase 7 Accountable-Owner Review Package

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner
**Status:** Review Package — No Decision Made
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — governance preparation artifact, no capability exists to release

## 1. Purpose and Scope

### Why this package exists

Three Phase 7 planning chains — the Shared Approval/Evidence Primitive, Execution Safety Foundations, and Tool Registry Security — have each independently reached a **Blocked** conclusion in their own Implementation Readiness Reviews, for the same underlying reason: their Decision Records contain recommendations, not ratified decisions. `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` already consolidated their status; this package goes one step further, consolidating all nineteen individual decisions across the three Decision Records into a single artifact an accountable owner can review and act on without needing to open and cross-reference three separate documents. It exists to reduce the friction of ratification, not to substitute for it.

### What this package does not do

**This package makes no decision, ratifies nothing, and authorizes no implementation.** It does not create a migration, write SQL, modify any source or database file, configure any security control, or change any release status. It does not create a tag or release. Every recommendation summarized below is quoted or paraphrased from its source Decision Record, not re-derived or reinterpreted — where this package's own phrasing differs from the source, the source document remains authoritative. Ratification, when it occurs, happens by an accountable owner acting on the source Decision Records themselves (or a future, separate ratification record) — not by anything stated in this package.

## 2. Phase 7 Overview

**Completed workstreams** (per `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` Section 2, restated here for this package's own self-sufficiency):

- **Shared Approval/Evidence Primitive** — 7 planning documents complete. Generalizes the proven document-evidence pattern into a subject-agnostic capability.
- **Execution Safety Foundations** — 7 planning documents complete. Defines incident, recovery/rollback, compensation, audit-trail, and checkpoint/idempotency models.
- **Tool Registry Security** — 4 planning documents complete. Applies the pre-existing `Secrets_Management.md` and `Agent_Tool_Permissions.md` standards to the Tool Registry's credential-handling surface.

**Current status:** all three chains independently concluded **Blocked** (the Shared Approval/Evidence Primitive: "Blocked pending decisions"; Execution Safety Foundations and Tool Registry Security: "Blocked"). No Phase 7 capability has begun implementation.

**Blockers:**
- All three chains: their own Decision Record's decisions remain unratified (19 decisions total, zero ratified).
- Execution Safety Foundations additionally: an unverified technical-feasibility gate (integration-adapter reconciliation-contract support) that ratification alone does not resolve.
- Tool Registry Security additionally: zero live-executed validation evidence exists for any credential-handling claim.

## 3. Decision Inventory

Nineteen decisions, consolidated from the three source Decision Records. **Current status is "Pending Ratification" for all nineteen** — no exceptions. Decision-owner attribution for the Shared Approval/Evidence Primitive's five decisions is inferred from each decision's own stated rationale, since that Decision Record (the first written in this chain) did not include an explicit "Owner approval requirement" field the way the two later Decision Records did — this inconsistency in documentation format is itself noted honestly here rather than glossed over, and should not be read as this package assigning new authority beyond what each source decision's rationale already implies.

| # | Decision | Capability | Recommendation summary | Decision owner | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Governed Subject Acceptance | Shared Approval/Evidence Primitive | Accept the `governed_subjects` registry table as designed | Architecture Owner *(inferred — not explicit in source)* | Pending Ratification |
| 2 | Approval Role Model | Shared Approval/Evidence Primitive | Overlay model — each subject type embeds its own stricter role check; no shared configurable policy table | Architecture Owner *(inferred)* | Pending Ratification |
| 3 | Expiry/Revalidation Behavior | Shared Approval/Evidence Primitive | Subject-type-configurable `expires_at`, nullable; no silent auto-renewal | Architecture Owner *(inferred)* | Pending Ratification |
| 4 | Evidence Retention Strategy | Shared Approval/Evidence Primitive | Indefinite retention by default; shorter retention only as an explicit, separately-approved exception | Data Owner, Security Owner *(inferred from cited Decision Class)* | Pending Ratification |
| 5 | Revocation Authority Model | Shared Approval/Evidence Primitive | Revocation requires a role stricter than original approval — recommended Security Owner, with System Owner fallback | Security Owner, System Owner (fallback) *(inferred)* | Pending Ratification |
| 6 | Incident Lifecycle Model | Execution Safety Foundations | Seven-state model (`detected`→`triaged`→`containing`→`contained`→`recovering`→`resolved`→`reviewed`, with `reopened`) | Security Owner (WF-010 actor), Automation Owner concurrence | Pending Ratification |
| 7 | Recovery and Rollback Authority Model | Execution Safety Foundations | Reconciliation contract must resolve to a definite outcome; role check stricter than baseline for T3/T4 or sensitive-data runs | Automation Owner (baseline), Security Owner (overlay) | Pending Ratification |
| 8 | Compensation Model and Evidence Handling | Execution Safety Foundations | Authority: stricter-role overlay plus System Owner sign-off for irreversible-limit cases. Storage: explicitly deferred, no recommendation given | Automation Owner, Security Owner (authority); Architecture Owner, Data Owner (storage, deferred) | Pending Ratification (authority); Deferred (storage) |
| 9 | Checkpoint/Idempotency Responsibility Model | Execution Safety Foundations | Hybrid (Option C) — default-derived idempotency key with explicit override path | Automation Owner | Pending Ratification |
| 10 | Execution Audit Trail Ownership | Execution Safety Foundations | Governed-write-only (no separate audit-writer role); indefinite retention by default | Data Owner (retention), Automation Owner (write-path) | Pending Ratification |
| 11 | Relationship with Shared Approval/Evidence Primitive | Execution Safety Foundations | No hard dependency for the capability as a whole; two specific integration points remain gated on that primitive's own ratification | Architecture Owner | Pending Ratification |
| 12 | Emergency Authority Boundaries | Execution Safety Foundations | Role-checked, time-bounded, mandatory-review emergency model (Option B); specific duration left to policy | Security Owner, System Owner concurrence | Pending Ratification |
| 13 | Credential Ownership Model | Tool Registry Security | Unified ownership — no separate credential-specific role beyond the existing "Security Owner and relevant Domain Owner" pair | Security Owner, Data Owner | Pending Ratification |
| 14 | Secret Lifecycle Responsibility | Tool Registry Security | Split by stage — Security Owner owns policy; Tool Owner owns operational rotation execution within that policy | Security Owner, Automation Owner (input) | Pending Ratification |
| 15 | Rotation and Expiration Authority | Tool Registry Security | Hard expiration at `rotation_due_at`, no grace period | Security Owner | Pending Ratification |
| 16 | Emergency Access Model | Tool Registry Security | Existing authority list, extended with the Execution Safety Foundations time-bound/review obligation | Security Owner, Agent Owner, Automation Owner concurrence | Pending Ratification |
| 17 | Audit Evidence Requirements | Tool Registry Security | Live-executed validation required; design review alone is insufficient | Security Owner, Data Owner | Pending Ratification |
| 18 | Relationship to Shared Approval/Evidence Primitive | Tool Registry Security | No dependency for credential-handling security components; dependency confirmed only for the Tool Registry's own future lifecycle transitions | Architecture Owner | Pending Ratification |
| 19 | Tool Trust Classification Authority | Tool Registry Security | Unified ownership (as Decision 13); credential-handling rigor scales formally by T1–T4 class | Security Owner, relevant Domain Owner | Pending Ratification |

## 4. Cross-Capability Dependencies

**Where decisions interact:**
- **Decisions 11 and 18 are structurally identical in shape**, both concluding "no hard dependency on the Shared Approval/Evidence Primitive for this capability's core scope, but specific integration points remain gated on it." Ratifying one does not ratify the other — each requires its own Architecture Owner sign-off, even though the reasoning is parallel.
- **Decision 12 (Execution Safety Foundations emergency authority) and Decision 16 (Tool Registry Security emergency access) are directly linked**, not merely similar: Decision 16's own recommendation explicitly extends Decision 12's precedent rather than inventing a separate emergency model. If Decision 12 is ratified with a materially different shape than currently recommended (Option B), Decision 16 would need to be revisited to remain consistent with it — this is a real sequencing dependency, not just a stylistic echo.
- **Decision 8's storage half (Execution Safety Foundations compensation-evidence storage) is gated on Decisions 1–5** (the Shared Approval/Evidence Primitive's own ratification) **being resolved first**, per that primitive's Decision Record's own Decision 6 reasoning. This is the one place in the inventory where a decision cannot be ratified independently of another chain's decisions — every other cross-capability relationship in this table is a "no dependency, confirmed" finding, not a blocking one.
- **Decisions 4, 10, and 17 (evidence/audit retention across all three chains) each independently reach the same indefinite-retention-by-default posture**, citing the same `audit.events` precedent from `Schema_Specification.md`. They are not literally the same decision, but ratifying one with a different retention posture than the others would introduce an inconsistency across otherwise-parallel evidence models — worth the accountable owner's attention as a set, even though each requires its own sign-off.

**Sequencing considerations:**
- Decisions 1–5 (Shared Approval/Evidence Primitive) have the widest downstream reach: Decision 8's storage half, and any future Agent Registry/Tool Registry lifecycle work, both wait on them. Ratifying this set first would unblock the most additional work per the dependency map in `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` Section 5.
- Decisions 6, 7, 9, 10 (Execution Safety Foundations, excluding 8, 11, 12) and Decisions 13, 14, 15, 17, 19 (Tool Registry Security, excluding 16, 18) have no cross-chain dependency at all and could be ratified in any order relative to the Shared Approval/Evidence Primitive's own set.
- This package does not recommend an order — see Section 8.

**Risks of inconsistent ratification:**
- Ratifying Decision 12 with a different emergency model than currently recommended, after Decision 16 has already been ratified as currently written, would leave Tool Registry Security's emergency model referencing a superseded precedent.
- Ratifying only some of the three chains' retention-related decisions (4, 10, 17) with the indefinite-by-default posture and changing others would produce inconsistent evidence-retention behavior across capabilities that this repository's own governance history (the `audit.events` precedent) treats as a single class of concern.

## 5. Ratification Questions

For each decision category, what the accountable owner must explicitly decide — not what this package recommends:

**Governed subject / evidence model questions (Decisions 1–5):** Is the `governed_subjects` indirection pattern accepted as the subject-reference model for all future governed entities? Should approval role requirements be enforced per-subject-type (overlay) or via a shared configurable table? Should approvals expire, and if so, does that vary by subject type? Is indefinite evidence retention acceptable as a default, or does a shorter retention period need to be set now? Who specifically holds revocation authority when no Security Owner is active?

**Incident, recovery, and compensation questions (Decisions 6–12):** Is the seven-state incident model accepted, or does it need to be simpler or richer? Is the reconciliation-contract requirement for recovery authorization technically achievable — and separately, is the recommended role-overlay model for authorizing recovery acceptable? Where should compensation evidence live once the Shared Approval/Evidence Primitive's own shape is settled? Is the hybrid checkpoint/idempotency model (default-plus-override) acceptable, or should idempotency-key derivation be fully centralized or fully delegated instead? Does the audit trail's indefinite retention default hold for execution data specifically, given potentially higher volume than document/approval evidence? Does Execution Safety Foundations' independence from the Shared Approval/Evidence Primitive hold as currently reasoned? What specific time bound applies to emergency actions?

**Tool Registry security questions (Decisions 13–19):** Is unified ownership (no separate credential-specific role) acceptable, or does credential handling warrant its own narrower or broader ownership pair? Should credential lifecycle responsibility split by stage (policy vs. execution), and is "Tool Owner" the correct operational role? Is hard expiration with no grace period acceptable, given the operational-continuity tradeoff named in that decision's own risk section? Does the emergency access model correctly extend the Execution Safety Foundations precedent, or should tool/credential emergencies be treated as their own category? Is live-executed validation evidence genuinely required before any credential handling is considered validated, or is design review sufficient for this specific capability? Does Tool Registry Security's independence from the Shared Approval/Evidence Primitive hold? Should credential-handling rigor formally scale by T1–T4 classification?

## 6. Impact Summary

**Impact of approving (ratifying as currently recommended):**
- Unblocks the Schema Design Review / Migration Design Plan steps already scoped for each chain, without requiring any redesign — every recommendation in this inventory was produced with the explicit goal of being implementable as-is if ratified unchanged.
- Does **not** itself unblock Execution Safety Foundations' technical-feasibility gate or Tool Registry Security's validation-evidence gate — both require separate action (adapter testing, live test execution) beyond ratification alone.
- Does **not** immediately unblock the Agent Registry or full Tool Registry lifecycle planning, both of which additionally require the Shared Approval/Evidence Primitive's ratification specifically (Decisions 1–5), not merely "a" ratification from any chain.

**Impact of delaying:**
- No implementation work of any kind can begin for any of the three chains while their own decisions remain unratified — delay here is delay to the entire Phase 7 foundation layer, not merely paperwork.
- The longer ratification is delayed, the more this package's own recommendations risk becoming stale relative to any change in this repository's broader architecture or governance model in the interim (see Section 7, Stale recommendation risk).
- Delay carries no risk of *incorrect* implementation, since nothing has been built — the cost of delay here is opportunity cost (Phase 8 cannot begin), not correction cost.

**Impact of changing a recommendation** (ratifying a decision differently than currently recommended, or selecting a different option than the one labeled "Recommended"):
- Requires revisiting whichever prior document's Section 3/4/5 architecture assumed the original recommendation — most decisions were written with an explicit "if this changes, X needs rework" note in their own Risks section, which this package does not re-derive but points to as the place each such consequence is already documented.
- Cross-capability decisions (Section 4) amplify this: changing Decision 12 after Decision 16 is ratified unchanged would require revisiting Decision 16 specifically, not just Decision 12's own downstream documents.

## 7. Risk Summary

- **Ratification backlog risk.** Nineteen decisions now await accountable-owner attention simultaneously — already named in `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md` Section 6, restated here because it is the single most load-bearing risk this review package exists to help mitigate by consolidating the decisions into one reviewable set rather than three.
- **Decision drift risk.** If chains are ratified far apart in time or in an order that leaves cross-referenced decisions (Section 4) inconsistent with each other, later ratification could either contradict an earlier one or require it to be revisited — the emergency-authority linkage (Decisions 12/16) and the compensation-storage gate (Decision 8 on Decisions 1–5) are the two concrete instances of this identified in this package.
- **Stale recommendation risk.** Every recommendation in this inventory was produced against this repository's architecture and governance state at the time each source document was written. If material time passes before ratification, or if other parts of this repository's architecture change in the interim (a new capability, an updated governance document), the accountable owner reviewing these recommendations should confirm they still reflect current context before ratifying them unchanged — this package does not itself re-verify that currency, only flags the need to.

## 8. Recommended Review Sequence

Considerations only — this package does not choose or authorize a sequence:

- Reviewing Decisions 1–5 (Shared Approval/Evidence Primitive) first would be consistent with the widest downstream unblocking effect noted in Section 4's Sequencing Considerations, since Decision 8's storage half and future registry planning both wait on this set specifically.
- Reviewing Decisions 6–12 and 13–19 as two separate, self-contained batches (since neither has an internal cross-chain dependency on the other, per Section 4) would allow either to proceed independently of when the other is reviewed.
- Reviewing Decisions 12 and 16 together, given their direct linkage (Section 4), could reduce the risk of ratifying one and later needing to revisit the other.
- Reviewing the three retention-related decisions (4, 10, 17) together could surface any desire for a consistent retention posture across all three chains before ratifying them separately.

Any of these approaches, another approach entirely, or reviewing all nineteen in the order presented in Section 3, are equally available to the accountable owners — this package expresses no preference among them.

## 9. Explicit Out of Scope

- **Any decision, ratification, or ranking of these nineteen decisions by priority** — Section 8 offers considerations, not a chosen sequence.
- **Any implementation, migration, or SQL.**
- **Any credential, secret, or secret-manager configuration.**
- **Any security control configuration.**
- **Any change to the Phase 7 → Phase 8 → Phase 9 sequencing** established by `COS_Next_Phase_Product_Roadmap.md`.
- **Any change to COS-MVP-002's release status**, which remains **Not Released**, unaffected by this package.
- **Any tag or release.**
- **Resolution of Execution Safety Foundations' technical-feasibility gate or Tool Registry Security's validation-evidence gate** — both require action beyond ratification, named in Section 6, not performed here.

## What This Document Does Not Do

- It does not make, ratify, or authorize any decision named in Section 3.
- It does not implement any code, schema, or migration.
- It does not create any credential, secret, or secret-manager configuration.
- It does not configure any security control.
- It does not modify any application source file or database file.
- It does not change COS-MVP-002's or any other capability's release status.
- It does not create or reference any tag or release.
- It does not prescribe a review or ratification order — Section 8 presents considerations only.

## References

- [COS-MVP-003 Phase 7 Status and Governance Snapshot](COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md) — the source this package's Section 2 restates and extends
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — source of Decisions 1–5
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — source of Decisions 6–12
- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of Decisions 13–19
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md) — the role model this package's decision-owner attributions are grounded in
- [System Charter](../00_Governance/System_Charter.md)
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this package

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial accountable-owner review package: purpose and scope; a Phase 7 overview restated from the Status and Governance Snapshot; a consolidated 19-decision inventory table across all three Decision Records with recommendation summaries, decision owners (five inferred and flagged as such for the Shared Approval/Evidence Primitive's decisions), and status (all Pending Ratification); cross-capability dependency analysis identifying two concrete linked-decision risks (emergency authority, compensation-storage gating) and a shared retention-posture consideration; ratification questions posed per decision category without answering them; an impact summary for approving/delaying/changing recommendations; a risk summary covering ratification backlog, decision drift, and stale-recommendation risk; recommended review sequence considerations offered without choosing one; explicit out-of-scope boundaries. No decision made, no decision ratified, no implementation performed, no release status changed. |
