# COS-MVP-003 Phase 7.1 Approval Primitive Decision Record

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.0
**Document owner:** Architecture Owner, Data Owner, and Security Owner
**Status:** Decisions Recorded — Pending Accountable-Owner Ratification
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — decision record, no capability exists to release yet

## Purpose

This record resolves the five open architectural decisions the Phase 7.1 Technical Design left to future owner approval: governed subject acceptance, approval role model, expiry/revalidation behavior, evidence retention strategy, and revocation authority model. Each is resolved with a recommendation and stated rationale — **this document proposes a decision for ratification, it does not itself constitute final authorization to implement.** No migration is created, no application source file is modified, and no release status changes. Everything here remains subject to the accountable owners named above actually reviewing and accepting it.

## Decision 1: Governed Subject Acceptance

**Decision name:** Whether to accept the `governed_subjects` indirection table as the subject reference model for the Shared Approval/Evidence Primitive.

**Options considered:**
- **A.** Accept the `governed_subjects` registry table as designed in the Technical Design — every governed entity registers into one table; evidence tables carry a single real foreign key to it.
- **B.** Reject it in favor of typed nullable foreign keys (one column per subject type) directly on the evidence tables.
- **C.** Reject it in favor of pure polymorphic `subject_type`/`subject_id` columns with no registry table and no enforced referential integrity.

**Recommended decision:** **Option A — accept the `governed_subjects` registry as designed.**

**Rationale:** The System Charter's "Composable before bespoke" and "Secure by design" principles both favor a single, reusable mechanism with real database-enforced guarantees over either a rigid per-type schema (Option B, which fights the primitive's own stated goal of being usable by *any future* governed entity) or a guarantee-free polymorphic reference (Option C, which trades away exactly the kind of DB-enforced integrity this project has consistently preferred over app-level checks). The existing document pattern already demonstrates the value of a real foreign key at the evidence layer; Option A is the only path that keeps that property while remaining genuinely extensible.

**Implementation impact:** Every future governed-entity creation path (Agent Registry, Tool Registry, and eventually Workflow Registry) must insert into `governed_subjects` in the same transaction as its own row creation — this becomes a documented, mandatory contract for any new registry built on top of this primitive, not an optional convenience.

**Risks/tradeoffs:** If a subject type's creation path fails to insert into `governed_subjects` (an implementation bug, not a design flaw), that subject becomes unable to receive evidence at all — this is a fail-*safe* direction (no orphaned or unverifiable evidence can be written) but should be explicitly tested per subject type as part of that subject type's own validation, not assumed correct by analogy to documents.

## Decision 2: Approval Role Model

**Decision name:** Whether subject-type-specific stricter approval-role requirements are enforced as an overlay in each subject's own governed-mutation function, or via a shared, configurable role-requirement table consulted by the primitive itself.

**Options considered:**
- **A.** Overlay model — the shared primitive enforces only the baseline (active workspace `owner`/`administrator`); each subject-specific function may impose additional, stricter role requirements in its own logic.
- **B.** Configurable role-requirement table — a generalized policy table (keyed by subject type and/or action) that the shared primitive consults dynamically at approval time.

**Recommended decision:** **Option A — the overlay model.**

**Rationale:** `00_Governance/Decision_Rights_and_Ownership.md`'s own Decision Classes table already shows role requirements varying by decision *type* in ways that are domain-specific, not uniformly derivable from a lookup ("New external integration or privileged tool" requires Security Owner and the relevant Domain Owner; "Data classification, retention, or destructive migration" requires Data Owner and Security Owner — different combinations for different domains). Expressing this as a generic, dynamically-consulted policy table would make that table itself a new governed entity requiring its own approval-to-change process — meta-governance complexity that Option A avoids entirely by keeping each domain's role logic where the domain's own accountable owner can review and own it directly, exactly matching how `transition_document_lifecycle` already embeds its own role check rather than looking one up.

**Implementation impact:** Each new subject type's `SECURITY DEFINER` function embeds its own role check, always including the shared baseline (`owner`/`administrator`) and optionally a named stricter role — for example, the Tool Registry's T3/T4 actions requiring the Security Owner specifically, per `Agent_Tool_Permissions.md`.

**Risks/tradeoffs:** Overlay logic implemented independently per subject type risks inconsistency or drift if not carefully reviewed — mitigated by requiring the same live-executed, role-denial test evidence (per the Technical Design's Section 6) for every subject type's overlay, not just the baseline check, before that subject type's approval path is considered validated.

## Decision 3: Expiry/Revalidation Behavior

**Decision name:** Whether approvals expire, and if so, under what model.

**Options considered:**
- **A.** No expiry anywhere — approvals stand indefinitely once recorded, mirroring the document pattern exactly.
- **B.** Universal fixed expiry applied uniformly to every subject type.
- **C.** Subject-type-configurable expiry — `expires_at` remains nullable at the shared-primitive level; each subject type's own service decides whether and how to populate it.

**Recommended decision:** **Option C — subject-type-configurable expiry, defaulting to no expiry unless a subject type opts in.**

**Rationale:** `Agent_Execution_Framework.md`'s Approval service and `Agent_Tool_Permissions.md`'s `approval_policy` both explicitly require an expiry concept ("conditions, and expiry"), while the document pattern has shipped and been live-validated without one — forcing Option B's uniform expiry onto documents would be an unrequested, unproven behavior change to an already-shipped capability, violating "Evidence before execution" (there is no evidence expiry is needed there). Option A would under-serve the agent/tool cases that explicitly specified it. Revalidation after expiry follows the Technical Design's lifecycle graph exactly: an expired approval moves to the terminal `expired` state and requires a fresh `requested` record — no silent auto-renewal, consistent with "Human approval boundaries" (a lapsed authorization should not silently persist).

**Implementation impact:** `expires_at` stays nullable on the shared evidence schema. Each subject type's own governance documentation (e.g., an eventual Tool Registry service spec) must state its expiry policy explicitly, rather than leaving it to be inferred from the shared primitive's defaults.

**Risks/tradeoffs:** Non-uniform expiry across subject types could surprise an operator expecting consistent behavior everywhere — mitigated by requiring each subject type to document its own policy explicitly rather than relying on an assumed system-wide default.

## Decision 4: Evidence Retention Strategy

**Decision name:** How long approval/evidence and event rows are retained.

**Options considered:**
- **A.** Uniform, time-bounded retention applied to all evidence/event rows regardless of subject type.
- **B.** Subject-type-specific retention, decided independently by each domain owner.
- **C.** Indefinite retention as the default/floor for all evidence, with shorter retention only as an explicitly approved, documented exception per subject type.

**Recommended decision:** **Option C — indefinite retention by default; shorter retention only as an explicit, separately-approved exception.**

**Rationale:** `05_Database/Schema_Specification.md`'s own `audit.events` table is already specified with no purge policy and an explicit rule that "ordinary application roles must not update or delete audit events" — this project already treats audit-class evidence as permanent by design, and approval/evidence records are exactly that class of data. The System Charter's "Observable and reversible" and "Evidence over intuition" principles both argue against losing governance history. Choosing a specific purge timeline now would require compliance or storage-cost input this document is not positioned to supply; per `Decision_Rights_and_Ownership.md`'s Decision Classes ("Security exception or accepted residual risk: System Owner and Security Owner"), a shorter retention policy for a specific subject type is exactly that kind of exception and should be its own explicitly-approved decision, not a default behavior baked into the shared primitive now.

**Implementation impact:** No automatic purge mechanism is built as part of Phase 7.1. If a future subject type needs shorter retention for a genuine compliance reason, that requires its own decision record and explicit System Owner/Security Owner sign-off — this record does not pre-authorize one.

**Risks/tradeoffs:** Unbounded storage growth over time with no purge mechanism — an accepted, explicitly deferred risk at current scale, tied to the roadmap's already-deferred production-readiness gate for "capacity and performance validation," not a Phase 7 concern.

## Decision 5: Revocation Authority Model

**Decision name:** Who may revoke a previously `approved` decision.

**Options considered:**
- **A.** The same baseline role that can approve (`owner`/`administrator`) may also revoke.
- **B.** A stricter role than the original approval is required to revoke (e.g., Security Owner, or System Owner for material risk).
- **C.** Only the specific individual who originally approved may revoke their own decision.

**Recommended decision:** **Option B — revocation requires a stricter role than the original approval, not merely the same one.**

**Rationale:** Revocation is not a routine approval action — it declares that a previously-approved decision, potentially already acted upon, must now be treated as invalid, which is materially closer to `Decision_Rights_and_Ownership.md`'s "Security exception or accepted residual risk" decision class (System Owner and Security Owner) than to a routine `owner`/`administrator` approval. Option A would let the same role that granted something revoke it just as casually, with no added scrutiny for what is a higher-stakes action. Option C is rejected because this project's governance model is consistently role-based rather than person-based (e.g., "cannot approve its own implementation changes" language throughout is phrased as a role constraint, not an individual one) — tying revocation to one specific person creates a single point of failure if that person is unavailable, has left, or is themselves the reason revocation is needed.

**Implementation impact:** The revocation path in the shared primitive checks for a role stricter than the baseline approval role — recommended as the Security Owner, with the System Owner as an explicit fallback per `Decision_Rights_and_Ownership.md`'s escalation model, so revocation is never structurally impossible for a workspace lacking an active Security Owner.

**Risks/tradeoffs:** If neither a Security Owner nor a System Owner is active for a given workspace, revocation could become blocked — mitigated by the explicit System Owner fallback, but this should be verified as part of validation, not assumed.

## What This Document Does Not Do

- It does not create any database migration.
- It does not modify any application source file.
- It does not implement any code.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not itself authorize implementation — these are recommendations pending accountable-owner ratification, per the Status field above.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md) — origin of these five open questions
- [COS-MVP-003 Phase 7.1 Technical Design](COS-MVP-003_Phase_7.1_Shared_Approval_Evidence_Primitive_Technical_Design.md) — the design these decisions complete, including its Section 7 (Open Decisions) and Architectural Constraints
- [System Charter](../00_Governance/System_Charter.md)
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md)
- [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md), [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Schema Specification](../05_Database/Schema_Specification.md)
- [COS-MVP-002 Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md) — origin of the proven document approval/lifecycle pattern

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial decision record resolving all five Phase 7.1 open decisions: governed subject acceptance (accept `governed_subjects` registry), approval role model (overlay, not configurable table), expiry/revalidation (subject-type-configurable, no silent renewal), evidence retention (indefinite default, exceptions require separate approval), and revocation authority (stricter role than original approval, with System Owner fallback). Each with options considered, rationale, implementation impact, and risks/tradeoffs. Pending accountable-owner ratification; no implementation performed. |
