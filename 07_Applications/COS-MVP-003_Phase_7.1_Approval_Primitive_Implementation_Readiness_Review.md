# COS-MVP-003 Phase 7.1 Approval Primitive Implementation Readiness Review

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.0
**Document owner:** Architecture Owner, Data Owner, and Security Owner
**Status:** Readiness Assessment — No Implementation Authorized
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — readiness assessment, no capability exists to release yet

## Purpose

This document is not itself referenced as a source below — it is the review being produced. It exists to answer one question: **is Phase 7.1 ready to move from planning into implementation?** It does so by evaluating the six completed Phase 7.1 artifacts against each other for completeness, consistency, and outstanding dependencies, and by checking their own stated gates against current evidence. **This is a readiness assessment only.** It creates no migration, writes no SQL, modifies no database or source file, claims no implementation exists, and authorizes nothing. Its conclusion is a recommendation for the accountable owners, not a decision.

## 1. Objective

### Why this review exists

Six planning documents have now been produced for the Shared Approval/Evidence Primitive — an Implementation Plan, a Technical Design, a Decision Record, an Implementation Specification, a Schema Design Review, and a Migration Design Plan. Each was scoped narrowly and reviewed individually. None of them, individually or in sequence, was tasked with answering the cross-cutting question that determines whether implementation can actually begin: do these six documents, taken together, constitute a coherent, gap-free basis for writing code and migrations, and have the specific gates each of them names as prerequisites actually been satisfied? This review exists to answer that question directly, rather than leaving it to be inferred from the mere existence of six completed documents.

### What implementation readiness means

Implementation readiness in this repository is not "a design exists." Per the standard this repository has followed since Phase 6.4, readiness requires: (1) every architectural decision the design depends on has been explicitly ratified by its accountable owner, not merely recommended; (2) the schema, security, and lifecycle models are internally consistent across all six documents with no unresolved contradiction; (3) the validation and rollback strategy is concrete enough to execute, not merely described in principle; and (4) every gate each prior document itself named as a precondition for proceeding has actual evidence of being met, not just a plan for how it would be met. A capability is not implementation-ready because it is well documented — it is implementation-ready when these four conditions are demonstrably true.

## 2. Artifact Review

### COS-MVP-003 Phase 7 Implementation Plan

**Purpose:** scopes the objective (generalize the proven document evidence pattern into a subject-agnostic primitive), reconciles three independently-specified "approval service" concepts into one, and names dependencies, risks, and out-of-scope boundaries.

**Completeness:** complete for its stated scope — objective, architecture sources, proposed scope across five dimensions, dependencies, validation strategy, risks, and explicit exclusions are all present.

**Unresolved dependencies:** this document's own "Open Design Decisions" section (v1.1) named four questions — subject reference model, approval scope model, evidence retention strategy, expiry/revalidation behavior — and deliberately did not answer them. All four were subsequently addressed by the Technical Design and/or Decision Record (see below), so this artifact's own open items are resolved *downstream*, not within itself. That is the intended shape of a plan document and is not a gap.

### COS-MVP-003 Phase 7.1 Technical Design

**Purpose:** resolves the four open design decisions with documented tradeoffs and recommendations, and adds the security model, seven-state lifecycle model, and validation strategy the plan scoped but did not design.

**Completeness:** complete. Four data-model decisions each carry options considered, a recommendation, and stated risks. Five Architectural Constraints (v1.1) are recorded as non-negotiable regardless of how any open decision resolves — this is a meaningful strength, since it means the design's safety properties do not depend on unresolved questions being answered any particular way.

**Unresolved dependencies:** this document's own "Open Decisions Requiring Future Owner Approval" (Section 7) lists five items, all of which map directly onto the Decision Record's five decisions. They are resolved (as recommendations) in the Decision Record, not within this document — again the intended shape, not a gap.

### COS-MVP-003 Phase 7.1 Approval Primitive Decision Record

**Purpose:** resolves the five decisions the Technical Design left open, each with a recommendation and rationale.

**Completeness:** complete — all five decisions (governed subject acceptance, approval role model, expiry/revalidation, evidence retention, revocation authority) carry options considered, a recommended decision, rationale, implementation impact, and risks/tradeoffs.

**Unresolved dependencies:** this is the one place in the chain where completeness of the *document* and readiness of the *decision* diverge. The document is complete; the decisions it records are not ratified. Its own Status field states this plainly: **"Decisions Recorded — Pending Accountable-Owner Ratification."** This is the central fact this readiness review turns on (see Section 3).

### COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification

**Purpose:** translates the Technical Design and Decision Record into a concrete conceptual specification of what would be built.

**Completeness:** complete for its stated scope, and reviewed for wording accuracy in a prior turn with no substantive change required.

**Unresolved dependencies:** inherits the Decision Record's ratification gap; introduces no new open questions of its own.

### COS-MVP-003 Phase 7.1 Approval Primitive Schema Design Review

**Purpose:** translates the Implementation Specification into concrete table names and field lists (prose form, per `Schema_Specification.md`'s own no-SQL convention), ahead of any migration.

**Completeness:** complete — four entities (`governed_subjects`, `approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`) each with purpose, required domain fields, key relationships, and ownership/workspace boundaries; a governed subject model; lifecycle storage; evidence storage; security/RLS design; migration strategy; validation gates.

**Unresolved dependencies:** this document surfaced four *new* open questions not present in any earlier artifact (Section 9): the `approvals`-table reconciliation question (evolve/replace/keep-separate), whether `authority_role_at_decision` should be captured, whether `action_boundary`/`conditions` should be structured or plain text, and whether a purge-readiness marker column should be added now. None is resolved as of this review. The reconciliation question specifically does not block the four new tables (per the Migration Design Plan's Section 4), but the other three are genuine open schema-detail questions with no resolution recorded anywhere in the chain.

### COS-MVP-003 Phase 7.1 Approval Primitive Migration Design Plan

**Purpose:** sequences the reviewed schema into a migration-planning artifact — order of operations, boundaries, compatibility strategy, and validation gates.

**Completeness:** complete — objectives, boundaries (included/excluded), a four-step migration sequence, the carried-forward reconciliation question, document-compatibility strategy, security migration considerations, validation gates, rollback strategy, and a consolidated list of every open decision across the whole chain (its own Section 9).

**Unresolved dependencies:** this document's Section 7 ("Validation Gates Before Implementation Approval") is the most direct statement of what remains outstanding, and it names the Decision Record's pending ratification as the first gate, unresolved.

## 3. Decision Readiness

**Ratified:** none of the five Phase 7.1 decisions in the Decision Record have been ratified by their accountable owners as of this review. The Decision Record's own Status field — the authoritative source, not this review's paraphrase of it — reads: **"Decisions Recorded — Pending Accountable-Owner Ratification."**

**Pending (all five, recommended but not decided):**
1. Governed subject acceptance — recommended: accept the `governed_subjects` registry (Option A).
2. Approval role model — recommended: overlay model, not a configurable table (Option A).
3. Expiry/revalidation behavior — recommended: subject-type-configurable, no silent renewal (Option C).
4. Evidence retention strategy — recommended: indefinite by default, exceptions require separate approval (Option C).
5. Revocation authority model — recommended: stricter role than original approval, Security Owner with System Owner fallback (Option B).

**Additionally pending, surfaced later in the chain and not yet resolved anywhere:**
- The `approvals`-table reconciliation question (evolve / replace / remain separate).
- Whether `authority_role_at_decision` is captured.
- Structured vs. plain-text `action_boundary`/`conditions`.
- Whether a purge-readiness marker column is added now or deferred.

**Can implementation proceed safely on the current evidence?** No. Every one of the six artifacts that names a precondition for implementation cites the same unmet gate: accountable-owner ratification of the Decision Record. This is not a matter of documentation quality — the documents are complete — it is that the specific act of ratification, which only an accountable human owner can perform, has not occurred. Proceeding to implementation before ratification would mean building against recommendations that could still be amended or rejected, risking rework and, more importantly, building without the explicit approval this repository's own governance model requires for high-risk-class work.

## 4. Architecture Readiness

- **`governed_subjects` approach.** Internally consistent across all six documents: the Technical Design recommends it (Decision 1 of Section 3), the Decision Record recommends ratifying it (Decision 1), and the Schema Design Review specifies its concrete field list (`subject_id`, `subject_type`, `workspace_id`, `registered_at`) consistently with both. No contradiction found. Architecturally sound as designed; adoption itself is one of the five pending ratifications.
- **Approval model.** Consistent: version-level scope is mandatory (Technical Design Decision, "Approval scope model," Option B), with `action_boundary`/`conditions` as optional overlay metadata (Option C elements layered on, not replacing, B) — carried through unchanged into the Schema Design Review's `approval_decision_evidence` field list. The overlay role model (Decision Record Decision 2) is consistent with this and with the existing document pattern's own embedded-role-check convention.
- **Evidence model.** Consistent: the three-table shape (`approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`) generalizes the proven document pattern exactly, with typed columns preferred over JSONB throughout — no document in the chain proposes JSONB, and the rationale (avoiding re-implementing `CHECK`-constrained guarantees via trigger-based validation) is stated once (Technical Design) and never contradicted later.
- **Lifecycle model.** Consistent: the seven-state model and its transition graph (Technical Design Section 5) is carried unchanged into the Schema Design Review Section 4 and the Migration Design Plan Section 2/7, with no divergent restatement anywhere.
- **Security model.** Consistent: three-tier RLS, revoke-first grants, `SECURITY DEFINER`-in-`creator_os_private`-with-thin-wrapper pattern, and no separate elevated service role (the lazy-evaluation finding) are stated once and referenced, not re-derived differently, in every subsequent document.
- **Document compatibility.** Consistent and conservative across all six documents: no existing document-specific table, function, policy, or grant is ever proposed for alteration; every new object is additive; compatibility is to be *proven* via a live regression test, not assumed. This is the clearest area of the whole chain — stated identically in the Technical Design, Schema Design Review Section 7, and Migration Design Plan Sections 2 and 5.

**Finding:** no architectural inconsistency, contradiction, or drift was found across the six documents. The architecture, as designed, is coherent. Readiness is blocked by ratification status (Section 3), not by any defect in the design itself.

## 5. Migration Readiness

- **Migration plan completeness.** The Migration Design Plan's four-step sequence (new structures → security model → validation → compatibility checks) is complete at the planning level named in its own scope. It does not, and by its own design should not yet, contain SQL or a migration file.
- **Rollback approach.** Stated at the planning level only: because every object is additive, rollback is a clean drop of the four new tables/functions/policies with — per the plan's own reasoning — zero risk to any shipped capability, since no consumer yet exists to depend on the new schema. This is a sound rollback *strategy*; it is not yet a rollback *script*, and the plan does not claim it is.
- **Validation requirements.** Fully enumerated (Migration Design Plan Section 7): Decision Record ratification, Schema Design Review Section 8 gates, the full validation plan from the Implementation Specification executed live, the document-compatibility regression test executed live, and zero residual test fixtures. **None of these five items has evidence of being satisfied as of this review** — this is a plan for what validation will require, not evidence that validation has occurred.
- **Compatibility safeguards.** Concrete and specific: a live regression test proving the new schema behaves identically to the existing, untouched document tables for a document-equivalent case; a live security-advisor scan confirming no new findings against any existing document table; explicit confirmation that no existing grant, policy, or function was altered. These are well-specified test requirements, not yet executed evidence.

**Finding:** the migration *plan* is complete and sound. Migration *readiness* — meaning gates actually satisfied — is not present. This distinction matters and should not be collapsed in any future summary of this review.

## 6. Security Readiness

- **RLS requirements.** Fully specified: the same three-tier model (active member / non-member / anonymous) proven in Phase 6.4 for documents, applied identically to all four new tables. No new RLS pattern is introduced; the existing proven pattern is reused, consistent with "Composable before bespoke."
- **Ownership boundaries.** Fully specified: every row's `workspace_id` resolves through `governed_subjects` at write time, denormalized onto each evidence table and validated against the referenced subject's actual workspace — no evidence row can exist without a workspace-bound subject, and no cross-workspace evidence write is structurally possible as designed.
- **Self-approval prevention.** Fully specified and treated with the most rigor of any single requirement in the chain: enforced as a database-level check inside the decision-writing function (approver identity ≠ requester identity), explicitly required to be proven via a live, dedicated denial test for at least two subject types before the migration's validation is considered complete (Migration Design Plan Section 6), and named as one of five non-negotiable Architectural Constraints (Technical Design) that hold regardless of how any open decision resolves.
- **Least privilege.** Fully specified: revoke-all-first on every new table, `SELECT` broadly granted subject to RLS, `INSERT` only reachable through the governed function family, mutation logic confined to `creator_os_private` and unreachable directly by any application role — mirroring the existing, proven document convention exactly. The Schema Design Review's finding that no separate elevated service role is needed for system-driven transitions (because lazy evaluation runs inside the same definer-rights function an authenticated call already invokes) is a genuine simplification, stated once and not contradicted elsewhere.

**Finding:** the security design is thorough, internally consistent, and in every dimension either directly reuses or is a disciplined generalization of what Phase 6.4 already proved in production. No security gap was found in the design itself. As with Sections 4 and 5, the open item is ratification and live validation, not design adequacy.

## 7. Open Blockers

**Blocking (must be resolved before implementation may begin):**
- Accountable-owner ratification of all five Decision Record decisions. This is the single blocker every other document in the chain converges on, and no document in the chain claims implementation may proceed without it.

**Non-blocking (do not block the migration scoped in the current Migration Design Plan, per that plan's own Section 4, but must be resolved before any work touching the `approvals` entry itself):**
- The `approvals`-table reconciliation question (evolve / replace / remain separate).

**Future decisions (not yet raised to blocking status by any document, and not required before the currently-scoped four-table migration, but unresolved and should not be silently defaulted when they do come up):**
- Whether `authority_role_at_decision` is captured on approval/revocation records.
- Whether `action_boundary`/`conditions` are structured or plain-text fields.
- Whether a purge-readiness marker column is added now or only if a retention exception is ever approved.

## 8. Recommended Next Step

**Recommendation: Blocked pending decisions.**

The architecture, schema, security model, and migration plan are all internally consistent and, on the evidence reviewed, well-formed — this is not a case of "requires additional design work." The blocker is singular and specific: the Decision Record's five decisions remain unratified. Until the accountable owners (Architecture Owner, Data Owner, and Security Owner, per the Decision Record's own ownership line, with Security Owner and System Owner specifically implicated in Decision 5) ratify or amend those five decisions, no migration should be written and no implementation should begin — consistent with every prior document's own stated gates, not a new requirement introduced by this review.

This recommendation is offered for the accountable owners' consideration. **It is not, and does not constitute, an authorization to proceed.**

## 9. Explicit Exclusions

- No implementation has been started by this document or any document in the Phase 7.1 chain.
- No migration has been executed; no SQL exists anywhere in this chain.
- No release decision is made or implied by this document. COS-MVP-002 remains **Not Released**; COS-MVP-003 has no release status, as no capability exists yet to release.
- No production-readiness claim is made. This review assesses planning-artifact readiness for implementation to *begin*, not readiness for any capability to run in production — that determination would require its own, later evidence chain, mirroring COS-MVP-002's Phase 6.4 → 6.7 sequence.
- No tag or release is created or referenced by this document.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md)
- [COS-MVP-003 Phase 7.1 Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Decision Record](COS-MVP-003_Phase_7.1_Approval_Primitive_Decision_Record.md) — the authoritative source for ratification status referenced throughout Section 3
- [COS-MVP-003 Phase 7.1 Approval Primitive Implementation Specification](COS-MVP-003_Phase_7.1_Approval_Primitive_Implementation_Specification.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Schema Design Review](COS-MVP-003_Phase_7.1_Approval_Primitive_Schema_Design_Review.md)
- [COS-MVP-003 Phase 7.1 Approval Primitive Migration Design Plan](COS-MVP-003_Phase_7.1_Approval_Primitive_Migration_Design_Plan.md) — the authoritative source for validation-gate status referenced throughout Sections 5 and 7
- [COS Foundry Current State Handoff](COS_Foundry_Current_State_Handoff.md)
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard this review's definition of "readiness" (Section 1) is drawn from

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial implementation readiness review for Phase 7.1: objective and definition of implementation readiness; artifact-by-artifact review of all six completed Phase 7.1 documents (purpose, completeness, unresolved dependencies); decision readiness assessment confirming zero of five Decision Record decisions ratified; architecture, migration, and security readiness assessments finding the design internally consistent with no defect, only unmet ratification/validation gates; open blockers classified as blocking/non-blocking/future; a "Blocked pending decisions" recommendation offered for accountable-owner consideration, not self-authorized. No implementation started, no migration executed, no release decision made. |
