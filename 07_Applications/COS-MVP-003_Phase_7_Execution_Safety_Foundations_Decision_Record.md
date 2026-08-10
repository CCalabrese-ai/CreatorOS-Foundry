# COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Automation Owner, Architecture Owner, and Security Owner
**Status:** Decisions Recorded — Pending Accountable-Owner Ratification
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — decision record, no capability exists to release yet

## Purpose

This record captures the accountable-owner decisions the `COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md` left open, so that Execution Safety Foundations can proceed toward a Schema Design Review and Migration Design Plan once ratified. Each decision below carries a recommendation and stated rationale — **this document proposes decisions for ratification, it does not itself constitute authorization to implement.** No SQL is written, no migration is created, no application source or database file is modified, and no release status changes. Everything here remains subject to the named accountable owners actually reviewing and accepting it, exactly as the Phase 7.1 Decision Record for the Shared Approval/Evidence Primitive remains pending ratification as of this writing.

## Maintaining the Distinction

Three different kinds of statement appear in this document and must not be read interchangeably:

- **Architectural constraints** — non-negotiable rules already established by the Technical Design or by prior ratified precedent (e.g., the Phase 7.1 Architectural Constraints), restated here only where they bound a decision's option space. This document does not create new constraints and does not treat any constraint as open for ratification.
- **Recommendations** — this document's own proposed answer to each decision, always labeled as a recommendation, never presented as settled.
- **Accountable-owner decisions** — the actual determination, which only occurs when the named owner(s) below ratify a recommendation (as-is or amended) or select a different option. None have been ratified as of this document's creation.

## Decision 1: Incident Lifecycle Model

**Decision name:** Whether to adopt the seven-state incident lifecycle recommended in the Technical Design, or a narrower model.

**Problem/question:** `Schema_Specification.md`'s existing `incidents` contract (`severity, category, detected_at, owner_id, status, resolved_at`) does not itself define what values `status` may take. WF-010's own outcome description ("Containment, evidence, recovery, and review") implies more structure than a bare open/resolved flag, but nothing ratifies a specific state list.

**Options considered:**
- **A.** Minimal two-state model: `open` / `resolved`.
- **B.** Seven-state model: `detected` → `triaged` → `containing` → `contained` → `recovering` → `resolved` → `reviewed` (terminal), with a `reopened` transition back to `triaged`.

**Recommendation: Option B**, as proposed in the Technical Design Section 3.

**Rationale:** WF-010's outcome already names four distinct phases of work; collapsing them into two states would discard information the registry entry itself specifies and would leave `Control_Center_Specification.md`'s Incident and Recovery Experience (which must show a "timeline") with nothing to render one from.

**Impact:** the incident governed-mutation function must enforce this specific transition graph; the eventual Schema Design Review's field list for `incidents` should include whatever transition-tracking the ratified model requires (a status column is not sufficient on its own if timeline visibility is required, per Control Center needs).

**Risks:** a seven-state model requires more validation coverage (transition-matrix testing, per the Phase 6.4 standard) than a two-state one — an accepted cost, not a defect, but one the eventual validation plan must budget for.

**Owner approval requirement:** Security Owner (WF-010's named actor), with Automation Owner concurrence on how it integrates with the run lifecycle.

## Decision 2: Recovery and Rollback Authority Model

**Decision name:** Who may authorize a `Quarantined` or `Failed` run to resume, and what evidence standard must exist first.

**Problem/question:** `Automation_Architecture.md` establishes the principle ("recovery resumes only after reconciling external side effects") but not who is authorized to make that determination, nor what specifically counts as "reconciled."

**Options considered:**
- **A.** Any active workspace `owner`/`administrator` may authorize resumption once *any* reconciliation evidence exists, regardless of content.
- **B.** Resumption requires (i) the Section 3 reconciliation contract to return `confirmed-succeeded` or `confirmed-failed` (not `unknown`) for every side effect the run may have caused, and (ii) an explicit decision from a role stricter than the run-level baseline — recommended as the Automation Owner, with Security Owner authority specifically required if the run touched a T3/T4-classified tool or sensitive data.

**Recommendation: Option B.**

**Rationale:** Option A would let a routine role clear a quarantine on the strength of incomplete evidence, directly contradicting `Automation_Architecture.md`'s own fail-closed principle ("High-impact... actions fail closed without required approval") applied to recovery specifically, as the Technical Design's Section 6 already argues. Requiring the reconciliation contract to resolve to a definite outcome — not `unknown` — before any human decision is even offered prevents a well-intentioned but under-informed approval.

**Impact:** the recovery-authorization function must check both the reconciliation-contract result and the actor's role before permitting a `Quarantined`/`Failed` → `Running`/`Compensating` transition; integration adapters must actually implement the reconciliation-contract operation (Technical Design Section 3) for this to be enforceable, not just asserted.

**Risks:** if an integration adapter cannot support the reconciliation contract (a real possibility not yet verified against `Integration_Standards.md`), no run touching that integration could ever be recovered under this model — an acceptable fail-closed outcome, but one that should be verified against real adapters before this decision is treated as final, not assumed safe in the abstract.

**Owner approval requirement:** Automation Owner (baseline authority) and Security Owner (T3/T4 or sensitive-data overlay), consistent with the role-overlay pattern already ratified-as-recommended in the Phase 7.1 Decision Record's Decision 2.

## Decision 3: Compensation Model and Evidence Handling

**Decision name:** Where compensation authorization and evidence are recorded, and what authority is required to invoke compensation.

**Problem/question:** the Technical Design explicitly declined to choose between a dedicated compensation-evidence table and reuse of the Shared Approval/Evidence Primitive, since the primitive's shape is itself unratified. This decision also needs an authority tier, independent of storage location.

**Options considered (storage):**
- **A.** A dedicated `compensation_evidence` table, independent of any other evidence pattern.
- **B.** Reuse the Shared Approval/Evidence Primitive's tables once ratified, treating compensation authorization as one more subject type.

**Options considered (authority):**
- **A.** Same baseline role as ordinary recovery authorization (Decision 2).
- **B.** A stricter role, reflecting that compensation acts on an already-completed, potentially externally-visible action — recommended as matching Decision 2's Security Owner overlay for T3/T4 or sensitive-data cases, plus a mandatory System Owner sign-off specifically when the action falls within `Workflow_Design_Standards.md`'s "irreversible limits" category.

**Recommendation: storage — deferred, not decided (see Section 8); authority — Option B.**

**Rationale (authority):** `Workflow_Design_Standards.md` states "Financial, public, destructive, and customer-facing compensation requires the same or stronger controls as the original action" — Option A would only match the original action's controls, not exceed them where warranted; Option B directly implements "stronger controls" for the highest-risk category rather than leaving it as an unenforced aspiration.

**Rationale (storage — why deferred rather than recommended):** choosing Option B now would couple this design to five specific Shared Approval/Evidence Primitive decisions that remain unratified and could still change; choosing Option A now risks building a table that gets superseded once the primitive is ratified, duplicating work. This is a case where the honest answer is that neither option should be selected yet, not that a recommendation is being withheld arbitrarily.

**Impact:** the compensation-authorization function's role-check logic can be built now under either storage option, since the role logic does not depend on where the resulting evidence row lives; only the evidence table's own DDL depends on the storage decision.

**Risks:** deferring the storage decision indefinitely risks the same rework this record is trying to avoid, if compensation implementation work begins before it is resolved — this decision should be revisited no later than when the Shared Approval/Evidence Primitive's own ratification status changes, whichever direction that goes.

**Owner approval requirement:** Automation Owner and Security Owner for authority (Option B); Architecture Owner and Data Owner jointly, alongside whichever owners eventually ratify the Shared Approval/Evidence Primitive, for the storage question once it is no longer deferred.

## Decision 4: Checkpoint/Idempotency Responsibility Model

**Decision name:** Who is responsible for defining and supplying idempotency keys and checkpoint granularity — the shared Execution Safety Foundations primitive, or each individual workflow step.

**Problem/question:** `Workflow_Design_Standards.md` requires an idempotency key "derived from the workflow, version, workspace, trigger, and governed resource" but does not say whether the shared primitive derives this automatically or whether each step's own implementation must supply it.

**Options considered:**
- **A.** Fully centralized — the shared primitive derives the idempotency key automatically from run/step metadata already available to it (workflow, version, workspace, trigger, governed resource), with no per-step implementation burden.
- **B.** Fully delegated — each step's own implementation is responsible for constructing and supplying its idempotency key, with the shared primitive only enforcing uniqueness once supplied.
- **C.** Hybrid — the primitive derives a default key automatically from the standard tuple (satisfying the common case with zero per-step burden), but a step may override or extend it when its own governed resource requires finer-grained uniqueness than the default tuple captures.

**Recommendation: Option C.**

**Rationale:** Option A cannot account for steps whose actual side-effect uniqueness depends on data the standard tuple doesn't capture (e.g., a specific external record ID within a single governed resource); Option B reintroduces exactly the per-implementation inconsistency risk `Workflow_Design_Standards.md`'s own prescriptive key formula exists to prevent. Option C matches the checkpoint-granularity recommendation already made in the Technical Design (step-level baseline, with specific steps able to opt into more granularity later) — the same reasoning applies to idempotency-key derivation.

**Impact:** the shared primitive must expose both an automatic default-key derivation and an explicit override path; `Workflow_Design_Standards.md`'s Step Design contract fields ("named executor, allowed tools, data scope") should be extended, when this is eventually specified further, to note whether a step uses the default key or a custom one.

**Risks:** an override path that is too permissive could let a step accidentally weaken uniqueness guarantees by supplying a key that collides across otherwise-distinct runs — the eventual Schema Design Review should specify the override's own validation, not merely its existence.

**Owner approval requirement:** Automation Owner.

## Decision 5: Execution Audit Trail Ownership

**Decision name:** Who may write to the execution audit trail, and who owns its retention policy.

**Problem/question:** the Technical Design proposed `execution_lifecycle_events` as append-only, written only by governed functions — but ownership of the *retention* question (how long records persist) was explicitly left unaddressed, unlike the Shared Approval/Evidence Primitive, whose Decision Record already resolved an analogous question for its own evidence tables.

**Options considered (write ownership):**
- **A.** Only the same governed-mutation function that transitions a run/step/incident state may write a corresponding event row — no application role, service, or direct client call has any other path.
- **B.** A separate, dedicated "audit writer" service role with broader write access, decoupled from the transition functions themselves.

**Options considered (retention ownership):**
- **A.** Indefinite by default, exceptions require separate approval — mirroring the Phase 7.1 Decision Record's Decision 4 precedent exactly.
- **B.** A shorter, execution-specific default retention, distinct from the document/approval precedent, on the reasoning that execution volume may be materially higher than approval volume.

**Recommendation: write ownership — Option A; retention ownership — Option A.**

**Rationale (write ownership):** Option B would introduce a second, parallel write path with its own privilege surface — directly contrary to the least-privilege and governed-mutation principles this entire repository has held since Phase 6.3, and unnecessary, since the governed transition functions already have everything needed to write their own event row in the same operation.

**Rationale (retention ownership):** `05_Database/Schema_Specification.md`'s `audit.events` table already establishes the precedent this repository defaults to for audit-class data — no purge policy, indefinite retention as the norm. Option B's higher-volume argument is plausible but speculative at this stage (no execution has ever run in this repository, so actual volume is unknown) — choosing a shorter default now would be a policy change made on a guess rather than evidence, contrary to "Evidence over intuition."

**Impact:** no separate audit-writer role is created; retention policy exceptions, if ever needed once real volume is observed, require their own System Owner/Security Owner-approved decision, mirroring the Phase 7.1 precedent exactly rather than inventing a new retention-exception process.

**Risks:** if execution volume does turn out to be materially higher than document/approval volume, indefinite retention could become a real storage-cost concern sooner than for other evidence classes — an accepted, explicitly named risk, to be revisited with actual data once available, not resolved preemptively here.

**Owner approval requirement:** Data Owner (retention) and Automation Owner (write-path architecture), with System Owner and Security Owner as the approval path for any future retention exception.

## Decision 6: Relationship with the Shared Approval/Evidence Primitive

**Decision name:** Whether Execution Safety Foundations should be built with a hard dependency on the Shared Approval/Evidence Primitive, or proceed independently with integration deferred.

**Problem/question:** two design points (Decision 3's compensation-evidence storage, and whether incidents register into `governed_subjects`) both touch the primitive, which remains blocked pending its own ratification. This decision determines whether Execution Safety Foundations implementation should wait for that ratification or proceed on a track that integrates later.

**Options considered:**
- **A.** Block Execution Safety Foundations' own progress on the Shared Approval/Evidence Primitive's ratification — treat it as a hard prerequisite.
- **B.** Proceed independently, per the dependency analysis already established in the Implementation Plan (Section 5) and Implementation Map (no schema-level dependency exists) — leaving only the two specifically-identified integration points (Decisions 3 and 8) deferred, not the whole capability.

**Recommendation: Option B.**

**Rationale:** this is not a new decision so much as a formal ratification of the finding already established in `COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md` (Execution Safety Foundations was recommended as the next workstream specifically *because* it has no dependency on the blocked primitive) and echoed throughout the Technical Design. Option A would contradict that already-documented rationale without new evidence to justify reversing it.

**Impact:** Execution Safety Foundations' Schema Design Review and Migration Design Plan may proceed once Decisions 1–5 and 7 of this record are ratified, independent of the Shared Approval/Evidence Primitive's own ratification timeline. Decisions 3's storage question and any `governed_subjects` registration for incidents remain gated on the primitive specifically, not on this capability as a whole.

**Risks:** if the Shared Approval/Evidence Primitive's eventual ratified shape differs materially from its current recommended shape, the two deferred integration points may need rework when they are finally resolved — an accepted, bounded risk (two specific decisions, not the whole capability) rather than a reason to block everything.

**Owner approval requirement:** Architecture Owner.

## Decision 7: Emergency Authority Boundaries

**Decision name:** How WF-010's "Emergency policy" approval model is bounded in practice — role, time limit, and review requirement.

**Problem/question:** `Control_Center_Specification.md` requires emergency controls to be "protected, time-bounded, and followed by review," and WF-010 names Security Owner as the actor with "Emergency policy" as its approval model — but no document specifies what role check, what time bound, or what review process actually applies.

**Options considered:**
- **A.** An emergency action requires no role check beyond active workspace membership, on the reasoning that emergencies demand speed over process.
- **B.** An emergency action requires the same role check as its non-emergency equivalent (Security Owner, per WF-010, with System Owner fallback per the Phase 7.1 precedent), carries a mandatory expiry/re-review deadline, and produces its own evidence record distinct from a routine decision — exactly as recommended in the Technical Design Section 6, restated here for ratification.

**Recommendation: Option B**, with the specific expiry/re-review duration itself left as an open policy decision (Section 8) rather than fixed by this record.

**Rationale:** Option A would create an ungoverned fast path in a system whose every other component enforces role-checked, evidenced decisions — directly contradicting the "Emergency policy" language, which names a policy, not an absence of one. `Control_Center_Specification.md`'s own requirement that emergency controls be "protected" forecloses Option A on its face.

**Impact:** emergency unquarantine/compensation actions (Decisions 2 and 3) must carry an additional `is_emergency` marker and a mandatory follow-up review record, distinct from — not replacing — the role check and evidence requirement already established in those decisions.

**Risks:** if the expiry/re-review duration (deferred to Section 8) is set too short, legitimate emergency responses could lapse mid-containment; too long, and "time-bounded" becomes nominal rather than real — this tradeoff is exactly why the specific duration is deferred to explicit policy input rather than guessed here.

**Owner approval requirement:** Security Owner, with System Owner concurrence on the fallback and escalation model.

## 8. Open Policy Decisions

Unlike Decisions 1–7, the items below are **not given a recommendation** in this document — they require policy input (compliance posture, expected execution volume, integration-adapter capability) this record is not positioned to supply, mirroring how the Phase 7.1 Decision Record's own Decision 4 treated retention as requiring evidence not yet available:

- **Compensation evidence storage location** (Decision 3) — explicitly deferred pending the Shared Approval/Evidence Primitive's own ratification, per Decision 6.
- **Emergency action expiry/re-review duration** (Decision 7) — a specific time bound is required by `Control_Center_Specification.md` but not set here.
- **Whether incidents register into `governed_subjects`** — depends on both Decision 6's outcome and a not-yet-made decision about which incident actions, if any, need to be approval-gated through the shared primitive once it exists.
- **Execution audit trail retention exception process specifics** — Decision 5 sets indefinite-by-default with exceptions requiring separate approval, mirroring the Phase 7.1 precedent, but the actual exception-request process itself (who initiates it, what evidence it requires) is not designed here.
- **Sub-step checkpoint opt-in criteria** — the Technical Design and Decision 4 both leave step-level checkpointing as the baseline with sub-step opt-in "left open for a specific step to opt into later if evidence shows it's needed"; no criteria for what constitutes sufficient evidence has been defined.
- **Integration adapter reconciliation-contract feasibility** — Decision 2's recovery model assumes every integration adapter can support a three-outcome reconciliation check; this has not been verified against `Integration_Standards.md` or any real adapter and remains an open technical-feasibility question, not merely a policy one.

## Explicitly Out of Scope

- **Resolution of any Section 8 item** — recorded as genuinely open, not decided.
- **The Shared Approval/Evidence Primitive's own five decisions** — those remain the Phase 7.1 Decision Record's scope, unaffected and unresolved by this document.
- **Any Schema Design Review or Migration Design Plan content** — this record only ratifies-as-recommended the decisions those future documents would build from; it does not itself specify table names, fields, or migration sequencing.
- **The Agent Registry, Tool Registry, or Workflow Engine** — none is designed, decided, or affected by this record.

## What This Document Does Not Do

- **No implementation started.** No table, function, policy, or service module is created by this document.
- **No migration authorized.** No SQL exists anywhere in this document; no migration file is created or implied to be ready for creation.
- **No release implications.** COS-MVP-002 remains **Not Released**; COS-MVP-003 has no release status, as no capability exists yet to release. This document does not authorize implementation to begin — these are recommendations pending accountable-owner ratification, per the Status field above, exactly as the Phase 7.1 Decision Record remains pending as of this writing.
- It does not create or reference any tag or release.
- It does not modify any application source file or database file.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Plan](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Plan.md)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Technical Design](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md) — origin of every decision resolved or deferred here
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — the precedent this record's role-based, System-Owner-fallback, and retention reasoning reuses; its own ratification status referenced in Decision 6
- [COS-MVP-003 Phase 7_Next_Workstream_Recommendation](COS-MVP-003_Phase_7_Next_Workstream_Recommendation.md) — origin of the no-dependency finding Decision 6 formalizes
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md) — including WF-010 Incident Response
- [Control Center Specification](Control_Center_Specification.md)
- [Schema Specification](../05_Database/Schema_Specification.md) — including `audit.events`, the retention precedent Decision 5 cites
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial decision record for Execution Safety Foundations: seven decisions (incident lifecycle model, recovery/rollback authority, compensation model and evidence handling, checkpoint/idempotency responsibility, execution audit trail ownership, relationship with the Shared Approval/Evidence Primitive, emergency authority boundaries), each with options considered, a recommendation (or an explicit no-recommendation-yet where storage depends on the still-blocked primitive), rationale, impact, risks, and named owner approval requirement; a consolidated Open Policy Decisions section listing six items not given any recommendation; explicit out-of-scope boundaries. Pending accountable-owner ratification; no implementation performed, no migration authorized, no release status changed. |
