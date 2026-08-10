# COS-MVP-003 Phase 7 Tool Registry Security Decision Record

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Security Owner and Data Owner
**Status:** Decisions Recorded — Pending Accountable-Owner Ratification
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — decision record, no capability exists to release yet

## Purpose

This record captures the security decisions `COS-MVP-003_Phase_7_Tool_Registry_Security_Design.md` left open for accountable-owner review, so that Tool Registry security implementation has a ratified basis to build from once it begins. Each decision below carries a recommendation and stated rationale — **this document proposes decisions for ratification, it does not itself constitute authorization to implement.** No credential is created, no secret is created or modified in any storage system, no migration is created, no SQL is written, and no application source or database file is modified. Everything here remains subject to the named accountable owners actually reviewing and accepting it, exactly as every other Decision Record in this Phase 7 chain remains pending as of this writing.

## Maintaining the Distinction

- **Recommendation ≠ approval.** Every decision below is a proposal. None is ratified by virtue of appearing in this document.
- **Security design ≠ deployment.** This record resolves policy questions the Security Design left open. It does not deploy, configure, or activate any security control.
- **Decision record ≠ authorization.** Ratification of these decisions, when it occurs, authorizes the *next* planning step (a Tool Registry Schema Design Review and Implementation Specification informed by this record) — it does not itself authorize implementation, migration, or credential provisioning.

## Decision 1: Credential Ownership Model

**Decision name:** Whether credential ownership follows the Tool Registry's general ownership model unchanged, or requires a Tool-Registry-specific variant.

**Question/problem:** `Decision_Rights_and_Ownership.md` already assigns "New external integration or privileged tool" approval to "Security Owner and relevant Domain Owner." `Tool_Registry.md` names the registry's own owner as "Security Owner and relevant Domain Owner" identically. The Security Design (Section 7) applied this unchanged to credentials, but never asked whether credential ownership specifically — as opposed to tool registration generally — needed a narrower or different accountable owner given its higher sensitivity.

**Options considered:**
- **A.** Credential ownership follows the same "Security Owner and relevant Domain Owner" pair as tool registration generally — no separate credential-specific ownership role.
- **B.** Credential ownership is narrower than tool registration: Security Owner alone, without the Domain Owner, on the reasoning that credential handling is a security-specific concern the Domain Owner may not have standing expertise in.
- **C.** Credential ownership is broader: Security Owner, Domain Owner, and Data Owner jointly, since `Secrets_Management.md` names Security Owner as document owner but credential metadata (the inventory, per that document's own field list) is also durable governed data Data Owner would ordinarily be accountable for.

**Recommended decision:** **Option A — no separate credential-specific ownership model.**

**Rationale:** Introducing a narrower or broader ownership pair for credentials specifically would create two different ownership models for the same registry entry (the tool itself vs. its credential), risking exactly the kind of split accountability `Decision_Rights_and_Ownership.md`'s single-role-per-decision-class structure exists to prevent. `Secrets_Management.md` already names Security Owner as document owner for the general secrets standard; applying "Security Owner and relevant Domain Owner" (Option A) keeps a single accountable pair for the whole tool-plus-credential unit, consistent with how this repository has treated ownership everywhere else in this Phase 7 chain (role-based, not fragmented across sub-concerns).

**Impact:** the Tool Registry's own `Candidate` → `Approved` transition (which already requires this ownership pair per the Security Design's Section 3) is the single approval gate credential provisioning also passes through — no separate credential-approval step is introduced.

**Risks/tradeoffs:** a Domain Owner without security expertise co-approving a credential decision could rubber-stamp a security concern they are not positioned to evaluate — mitigated by the existing requirement that Security Owner is *always* a co-approver, never bypassed, so the security-competent role is never absent from the decision.

**Owner approval requirement:** Security Owner and Data Owner, per this document's own ownership line.

## Decision 2: Secret Lifecycle Responsibility

**Decision name:** Whether one accountable role owns a credential's entire lifecycle, or responsibility is split by stage.

**Question/problem:** the Security Design's Section 3 (Credential Lifecycle Model) describes five stages — creation, storage, rotation, revocation, expiration — without assigning a single owner to the lifecycle as a whole versus per-stage owners, and left the specific secret-manager provider selection as an open item (Security Design Section 10).

**Options considered:**
- **A.** A single accountable role (Security Owner) owns the entire lifecycle end-to-end, from provisioning through eventual retirement.
- **B.** Responsibility splits by stage: Security Owner owns creation and storage policy; the relevant Tool Owner (per `Agent_Tool_Permissions.md`'s revocation-authority list, which already names "Tool Owner" as a role distinct from Security Owner) owns day-to-day rotation scheduling and operational monitoring within Security Owner's policy.

**Recommended decision:** **Option B — split by stage, within Security Owner's overall policy authority.**

**Rationale:** `Secrets_Management.md`'s own Provisioning Process already separates a policy/approval step (Step 1: "Approve purpose, owner, consumers, environment, and least privilege") from an operational step (Steps 2–7: generate, store, grant, configure, test, record) — Option B mirrors that existing separation rather than inventing a new one. `Agent_Tool_Permissions.md` already names "Tool Owner" as a distinct accountable role in its Revocation and Emergency Pause section, giving Option B's operational owner a basis already established elsewhere in this repository, not a new role invented for this decision alone.

**Impact:** each `credential_references` row's operational rotation scheduling (per `rotation_due_at`) becomes the named Tool Owner's responsibility to execute against Security Owner's approved policy, not Security Owner's own day-to-day task — a workload distinction, not a reduction in Security Owner's ultimate accountability, which remains intact per Decision 1.

**Risks/tradeoffs:** a Tool Owner executing rotation without sufficient security awareness could rotate incorrectly (e.g., without the overlap window `Secrets_Management.md` requires) — mitigated by requiring Security Owner's policy to specify the exact rotation procedure the Tool Owner executes, not leaving procedure design to the Tool Owner.

**Owner approval requirement:** Security Owner, with Automation Owner input on how rotation scheduling integrates with any future automated tooling.

## Decision 3: Rotation and Expiration Authority

**Decision name:** Whether a credential past its `rotation_due_at` is treated as hard-expired (no auto-renewal) or supports a grace period.

**Question/problem:** the Security Design's Section 3 (Expiration) recommended a non-auto-renewal posture, explicitly by analogy to the Shared Approval/Evidence Primitive's own no-silent-renewal precedent, but left it as an unratified recommendation (Security Design Section 10).

**Options considered:**
- **A.** Hard expiration — a credential past `rotation_due_at` is immediately treated as expired for new use; no grace period.
- **B.** Bounded grace period — a credential past `rotation_due_at` remains usable for a short, explicitly bounded window (e.g., to avoid an unplanned outage), after which it hard-expires.
- **C.** No enforced expiration behavior at the credential level — `rotation_due_at` is advisory only, with enforcement left entirely to operational process.

**Recommended decision:** **Option A — hard expiration, no grace period.**

**Rationale:** `Agent_Tool_Permissions.md`'s broader principle — "a lapsed authorization should not silently persist" — already establishes the posture this decision applies to credentials specifically. Option B's grace period, however well-intentioned for continuity, is exactly the kind of silent persistence that principle exists to prevent; if continuity is a genuine operational concern, the correct mitigation is proactive rotation scheduling before the due date (Decision 2's Tool Owner responsibility), not a permitted lapse after it. Option C is rejected outright — `Secrets_Management.md`'s own Secret Inventory names "Expiry or rotation due" as an "Enforced lifecycle date," not an advisory one.

**Impact:** any tool call attempting to use a credential past its `rotation_due_at` must fail closed, consistent with `Automation_Architecture.md`'s fail-closed principle already applied throughout this Phase 7 chain — this is a hard requirement on the eventual Tool Broker implementation (`Agent_Tool_Permissions.md`'s existing Tool Broker Checks), not a new mechanism.

**Risks/tradeoffs:** hard expiration with no grace period could cause an unplanned service interruption if rotation is not completed proactively — an accepted risk, since the alternative (silent persistence past a known-stale credential) is judged worse per the rationale above; mitigated operationally by Decision 2's proactive rotation-scheduling responsibility.

**Owner approval requirement:** Security Owner.

## Decision 4: Emergency Access Model

**Decision name:** Who may revoke a credential or pause a tool immediately, and what bounds apply to that emergency action.

**Question/problem:** `Agent_Tool_Permissions.md`'s existing Revocation and Emergency Pause section already names "Security Owner, Agent Owner, Tool Owner, or authorized incident workflow" as able to revoke or pause immediately — but does not specify whether this emergency path carries the same time-bound/mandatory-review obligation `Control_Center_Specification.md` and the Execution Safety Foundations Decision Record (Decision 7) already established for emergency actions elsewhere in this repository.

**Options considered:**
- **A.** Emergency credential revocation/pause carries no additional obligation beyond the existing `Agent_Tool_Permissions.md` authority list — any of the four named roles may act, full stop.
- **B.** Emergency credential revocation/pause requires the same time-bound, mandatory-follow-up-review obligation already established for Execution Safety Foundations' emergency actions (Decision Record Decision 7) — the action itself may proceed immediately, but must carry a marker and a required review within a bounded window.

**Recommended decision:** **Option B**, extending the precedent already ratified-as-recommended for Execution Safety Foundations rather than treating tool/credential emergencies as a separate category.

**Rationale:** `Control_Center_Specification.md`'s Incident and Recovery Experience already requires emergency controls to be "protected, time-bounded, and followed by review" as a repository-wide standard, not one scoped only to execution runs. Applying Option A alone would create an inconsistency — the exact same word "emergency" meaning "immediate and reviewed" in one part of this repository's governance model and "immediate and unreviewed" in another — which this document treats as an avoidable inconsistency, not an acceptable one.

**Impact:** an emergency credential revocation or tool pause must produce its own evidence record (Decision 5) carrying an `is_emergency` marker and a review-due timestamp, mirroring the Execution Safety Foundations pattern exactly rather than inventing a parallel one.

**Risks/tradeoffs:** if neither a Security Owner, Agent Owner, nor Tool Owner is active for a given tool at the moment an emergency arises, action could be blocked — `Agent_Tool_Permissions.md`'s existing "authorized incident workflow" option already provides a fallback path distinct from any single named role, mitigating this.

**Owner approval requirement:** Security Owner, with Agent Owner and Automation Owner concurrence given their own named roles in the existing authority list.

## Decision 5: Audit Evidence Requirements

**Decision name:** What evidence must exist, and be live-tested, before Tool Registry credential handling is considered validated.

**Question/problem:** `Secrets_Management.md`'s Acceptance Criteria already states "Rotation and revocation are tested" as a general standard; this decision determines whether that testing must be *live-executed* (per the Phase 6.4 evidentiary standard this entire Phase 7 chain has followed) before any Tool Registry credential goes into use, or whether design-level review is sufficient.

**Options considered:**
- **A.** Design-level review is sufficient — a reviewed, ratified design (this record) plus a reviewed implementation is treated as adequate evidence.
- **B.** Live-executed evidence is required, mirroring the Phase 6.4 standard exactly: rotation, revocation, and emergency-pause paths must each be exercised against a real (test-environment) credential and secret manager, with results recorded, before any credential handling is considered validated for production use.

**Recommended decision:** **Option B.**

**Rationale:** every other capability in this Phase 7 chain — the Shared Approval/Evidence Primitive, Execution Safety Foundations — has held to the Phase 6.4 standard of live-executed evidence over design review alone, specifically because "no module is treated as working because its code looks correct" (a principle stated explicitly in this repository's own Architectural Principles). Credential handling is not a lower-stakes capability than either of those; if anything, `Tool_Registry.md`'s T3/T4 classification of the tools most likely to need real credentials (GitHub, Supabase, OpenAI Platform) argues for equal or greater rigor, not less.

**Impact:** the eventual Tool Registry Implementation Specification and validation plan must include live rotation, revocation, and emergency-pause tests as acceptance gates, not merely named requirements — mirroring the validation-strategy pattern already established in every other Phase 7 planning chain.

**Risks/tradeoffs:** live testing against even a test-environment secret manager carries its own handling risk if not scoped carefully (e.g., ensuring test credentials are never real production secrets) — this is a testing-design concern for the eventual Implementation Specification to address, not a reason to weaken this decision to Option A.

**Owner approval requirement:** Security Owner and Data Owner, consistent with the Phase 6.4 standard's own precedent (Data Owner co-signed the equivalent evidentiary bar for the Shared Approval/Evidence Primitive's Decision 4).

## Decision 6: Relationship to the Shared Approval/Evidence Primitive

**Decision name:** Whether Tool Registry security implementation should wait for the Shared Approval/Evidence Primitive's ratification, or proceed on the bounded independence the Security Design already established.

**Question/problem:** the Security Design's Section 6 found that credential lifecycle, tool trust classification, and permission boundaries do not require the still-blocked primitive, while the Tool Registry's own approval-gated lifecycle transitions (and T4 action approval) do. This decision formalizes that finding as a ratifiable decision, the same way Execution Safety Foundations' Decision 6 formalized an analogous finding for that capability.

**Options considered:**
- **A.** Treat the Shared Approval/Evidence Primitive as a hard prerequisite for all Tool Registry security work, including credential handling.
- **B.** Proceed with credential-handling security design and eventual implementation independently, per the Security Design's own bounded finding — leaving only the Tool Registry's approval-gated lifecycle transitions (and T4 human-approval flow) gated on the primitive.

**Recommended decision:** **Option B.**

**Rationale:** identical in structure to Execution Safety Foundations' own Decision 6 — this is a formal ratification of an already-documented, evidence-based finding (Security Design Section 6), not a new architectural choice. Option A would contradict that finding without new evidence to justify reversing it, and would needlessly block credential-handling work that has no actual technical or policy dependency on the primitive.

**Impact:** Decisions 1–5, 7 of this record may be acted on once ratified, independent of the Shared Approval/Evidence Primitive's own ratification timeline. The Tool Registry's `Candidate` → `Approved` → `Active` lifecycle transitions themselves, and T4 human-approval flow, remain gated on that primitive, unaffected by this decision.

**Risks/tradeoffs:** if the Shared Approval/Evidence Primitive's eventual ratified shape differs materially from its current recommended shape, only the Tool Registry's lifecycle-transition design (not its credential-handling design) would need rework — a bounded, already-anticipated risk, not a reason to delay credential work.

**Owner approval requirement:** Architecture Owner.

## Decision 7: Tool Trust Classification Authority

**Decision name:** Who may assign or reclassify a tool's T1–T4 risk class, and whether credential-handling rigor formally scales with that classification.

**Question/problem:** the Security Design's Section 4 recommended that credential-handling rigor scale by risk class (T1/T2 baseline, T3 full standard, T4 enhanced evidentiary rigor) but left both the scaling policy and the classification authority itself unratified (Security Design Section 10).

**Options considered:**
- **A.** Classification authority follows the existing `Decision_Rights_and_Ownership.md` rule for "New external integration or privileged tool" — Security Owner and relevant Domain Owner jointly, with no separate classification-specific authority.
- **B.** Classification authority is Security Owner alone, on the reasoning that risk classification is a security judgment a Domain Owner should not need to co-sign.
- **C.** Credential-handling rigor scales formally with T1–T4 classification, per the Security Design's Section 4 recommendation.
- **D.** Credential-handling rigor applies uniformly (the full `Secrets_Management.md` standard) regardless of classification, treating risk-scaling as an unnecessary complication.

**Recommended decision:** **Option A for authority; Option C for rigor scaling.**

**Rationale (authority):** identical reasoning to Decision 1 — a separate, narrower classification authority (Option B) would fragment accountability that `Decision_Rights_and_Ownership.md` already assigns jointly, and this repository has consistently avoided introducing parallel authority structures for sub-decisions of an already-governed decision class.

**Rationale (rigor scaling):** Option C directly reflects `Tool_Registry.md`'s own Control Rules ("T3 and T4 actions require explicit safeguards; T4 actions require human approval unless a documented governance exception exists") — the registry's own source document already treats risk class as rigor-determining, so extending that same logic to credential handling (Option C) is consistent with, not an addition to, existing policy. Option D would apply T4-level rigor to a T1 tool with no sensitive credential at all, an unjustified cost with no corresponding source-document basis.

**Impact:** every future tool registration must record its T1–T4 classification at approval time (already required by `Tool_Registry.md`'s Required Registration Fields), and the eventual Tool Registry Implementation Specification must map each class to a specific, named set of credential-handling requirements (T1/T2 baseline, T3 full standard, T4 enhanced evidentiary rigor per Decision 5's live-testing requirement applied at maximum strictness) — not merely reference the classes descriptively.

**Risks/tradeoffs:** a tool misclassified at a lower risk tier than its actual credential sensitivity warrants would receive insufficient rigor — mitigated by the existing joint Security Owner/Domain Owner approval requirement (Decision 1, restated here), which already requires the security-competent role's sign-off on every classification.

**Owner approval requirement:** Security Owner and relevant Domain Owner, per `Decision_Rights_and_Ownership.md`.

## Unresolved Policy Questions

Carried forward, unresolved, from the Security Design's own Section 10 and not re-litigated with a recommendation here, since no new evidence has emerged since that document to inform them:

- **Specific secret manager/provider selection** — `Secrets_Management.md` names "an approved secret manager or platform-protected secret facility" generically; no provider is selected by this record.
- **Whether T4 governance exceptions require a Tool-Registry-specific variant of the general "Security exception" decision class**, or the general rule (System Owner and Security Owner) applies unmodified — assumed consistent with the general rule but not independently ratified here.
- **How this record's decisions interact with the Tool Registry's full future Implementation Plan, Technical Design, and Schema Design Review** — this record resolves security-specific questions only; the Tool Registry's broader design (lifecycle transitions, schema, migration) remains entirely unstarted and out of this record's scope.

## Explicit Out of Scope

- **No credential, secret, or secret-manager configuration is created, modified, or referenced** by this document in any form.
- **No SQL, migration, or schema implementation.**
- **No application source file or database file.**
- **The Tool Registry's approval-gated lifecycle transitions** — gated on the Shared Approval/Evidence Primitive per Decision 6, not resolved here.
- **The Shared Approval/Evidence Primitive's or Execution Safety Foundations' own decisions** — both remain exactly as their own Decision Records state, unaffected by this document.
- **Any Schema Design Review, Implementation Specification, or Migration Design Plan content for the Tool Registry** — this record is a security-policy input to those future documents, not a substitute for any of them.

## No Implementation Started

No table, function, credential, secret, secret-manager configuration, or service module is created by this document. Every decision above is a recommendation pending ratification by its named accountable owner(s); this document's Status field — "Decisions Recorded — Pending Accountable-Owner Ratification" — is the authoritative statement of that fact and is not superseded by anything else in this document.

## What This Document Does Not Do

- It does not create any credential, secret, or secret-manager configuration.
- It does not create any database migration or write any SQL.
- It does not modify any application source file or database file.
- It does not implement any code.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not itself authorize implementation — these are recommendations pending accountable-owner ratification, per the Status field above.

## References

- [COS-MVP-003 Phase 7 Tool Registry Security Design](COS-MVP-003_Phase_7_Tool_Registry_Security_Design.md) — origin of every decision resolved here
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [System Charter](../00_Governance/System_Charter.md)
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — the emergency-authority and role-based-ownership precedent this record reuses in Decisions 4 and 7
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Decision 5 applies

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial decision record for Tool Registry security: seven decisions (credential ownership model, secret lifecycle responsibility, rotation and expiration authority, emergency access model, audit evidence requirements, relationship to the Shared Approval/Evidence Primitive, tool trust classification authority), each with options considered, a recommendation, rationale, impact, risks, and named owner approval requirement; three carried-forward unresolved policy questions; explicit out-of-scope boundaries; confirmation no implementation has started. Pending accountable-owner ratification; no credential created, no secret modified, no implementation performed, no release status changed. |
