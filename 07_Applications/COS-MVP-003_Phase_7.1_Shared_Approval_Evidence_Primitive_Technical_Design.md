# COS-MVP-003 Phase 7.1 Shared Approval/Evidence Primitive — Technical Design

**Phase:** 7.1 — Shared Approval/Evidence Primitive
**Version:** 1.1
**Document owner:** Architecture Owner and Data Owner
**Status:** Technical Design — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — design document, no capability exists to release yet

## Purpose

This is the technical design for the Shared Approval/Evidence Primitive named in `COS-MVP-003_Phase_7_Implementation_Plan.md`. It resolves the "Open Design Decisions" that plan deliberately left open — with documented tradeoffs and a recommendation for each, not a default chosen by omission — and adds the security and lifecycle models the plan scoped but did not design. **No migration is created, no application source file is modified, and no release status changes.** This document is a design for review and approval, not a work order.

## 1. Design Goals

### What problem this primitive solves

Today, "who approved what, against which version, with what evidence" is answered exactly once in this codebase — for documents, via `document_workflow_evidence`, `document_approval_evidence`, and `document_lifecycle_events` — and answered *twice more, differently, only on paper* — in `Agent_Execution_Framework.md`'s specified "Approval service" and `Automation_Architecture.md`'s independently specified "Approval service." Left alone, the Agent Registry and Tool Registry (Phase 7) and the Workflow Registry/Engine and Agent Execution Layer (Phase 8) would each either reinvent this mechanism from scratch or copy the document tables without generalizing them — producing three or more parallel, subtly inconsistent approval systems in one codebase. This primitive exists to make that not happen.

### How it consolidates existing patterns

The design below is not a new invention layered on top of the three existing sources — it is a reconciliation of them, evaluated field by field in Section 2, with every design decision in Section 3 tracing back to a specific requirement one of those three sources already states.

## 2. Existing Architecture Inputs

| Source | What it contributes | Status |
| --- | --- | --- |
| `document_approval_evidence` (+ `document_workflow_evidence`) | The only implemented, live-validated instance of this pattern. Binds an approver decision to an exact document version and `content_hash`, requires a non-trivial `acceptance_statement`, and is written only through `creator_os_private.transition_document_lifecycle`. | Implemented, Phase 6.4-validated |
| `document_lifecycle_events` | The append-only audit trail every transition writes to, regardless of outcome — the record this design's evidence-integrity requirement is measured against. | Implemented, Phase 6.4-validated |
| `Agent Execution Framework` Approval service | Specifies "Records exact decision, scope, approver, conditions, and expiry" and the rule "Agents cannot approve their own permissions, evaluations, or production activation." Introduces **scope**, **conditions**, and **expiry** as concepts the document pattern does not have. | Designed only |
| Automation governance/compensation patterns | `Automation_Architecture.md`'s own "Approval service" component (near-identical to the above); `Workflow_Design_Standards.md`'s Compensation model (preconditions, authority, irreversible limits, evidence) for *undoing* an approved action — a related but distinct concept from approving one. | Designed only |

## 3. Data Model Design Decisions

Each decision below states the options considered, the tradeoffs, and a recommendation — not a default chosen by not deciding.

### Subject reference model

**Options:**

- **A — Polymorphic `subject_type`/`subject_id`.** Matches `05_Database/Schema_Specification.md`'s `approvals` table directly. New subject types never require a migration to the evidence tables themselves. Cost: no real foreign-key referential integrity — an invalid `subject_id` for a given `subject_type` can only be caught by application logic or a trigger, not the database's own constraint system.
- **B — Typed nullable foreign keys** (one column per subject type: `document_id`, `agent_id`, `tool_id`, ...), with a `CHECK` constraint enforcing exactly one is non-null. Full referential integrity via real FKs. Cost: every new subject type requires an `ALTER TABLE` migration to the evidence tables, and the "exactly one non-null" constraint grows more complex with each addition — directly working against this primitive's stated purpose of being usable by *any future* governed entity.
- **C — Subject registry indirection.** A lightweight `governed_subjects` table that every governed entity (document, agent, tool, workflow, and whatever comes after) inserts exactly one row into at creation time (`subject_id`, `subject_type`, `workspace_id`). Evidence tables carry a single real FK to *this* table, not to each entity table individually. New subject types require zero migration to the evidence tables — only a new row-insertion path in that subject type's own creation logic (already required regardless, since every governed entity already writes to its own table at creation).

**Recommendation: C.** It is the only option that gets both real FK-enforced integrity (matching this project's consistent preference for DB-enforced constraints over app-level checks) and the open-ended extensibility the primitive's own objective requires, without a migration on every new subject type. The cost — every subject-creation path must also write to `governed_subjects` — is a small, explicit discipline addition, not a structural compromise, and it has a second benefit: `workspace_id` becomes available on the registry row directly, simplifying RLS on the evidence tables (no join out to N different entity tables to determine workspace scope).

### Approval scope model

**Options:**

- **A — Field-level scope.** Approval covers a single attribute change. Too granular for anything proven so far; no existing pattern operates this way.
- **B — Version-level scope**, matching the proven document pattern exactly: approval binds to an exact subject version and content/state hash.
- **C — Action-boundary scope**, matching `Agent_Tool_Permissions.md`'s `approval_policy` ("Approver, action boundary, conditions, and expiry") — approval covers a declared action with conditions, not necessarily tied to a version at all.

**Recommendation: B as the mandatory baseline, with C layered on top as optional metadata.** Every evidence record binds to an exact subject version, non-negotiably — this is the proven, load-bearing guarantee from the document pattern and should not be weakened for any subject type. Additionally, evidence records carry nullable `action_boundary` and `conditions` fields, populated when a subject type needs them (a tool T3/T4 grant plausibly needs both a version binding *and* a declared action boundary) and left null when it doesn't (a document publication needs only the version binding, exactly as today). This is a synthesis, not a compromise between B and C — it makes B mandatory and C optional, rather than picking one and discarding the other's requirement.

### Evidence relationship model

**Options:**

- **A — Preserve the exact three-table shape**, generalized: a `workflow_evidence` table, an `approval_evidence` table referencing it, and an append-only `lifecycle_events` table referencing both plus provenance. Lowest risk, easiest to regression-test against the proven document case, but the most tables and the least flexible to new evidence shapes.
- **B — Collapse to two tables** (evidence + events).
- **C — Collapse to one flexible table** with a type discriminator and a JSONB payload for type-specific fields.

**Recommendation: A.** This project has not used JSONB anywhere in its governed-mutation pattern, and for good reason — the document pattern's strength comes from typed, `CHECK`-constrained columns (e.g., `candidate_content_hash text not null check (candidate_content_hash ~ '^[0-9a-f]{64}$')`), which JSONB would weaken or require re-implementing via trigger-based JSON-schema validation, adding complexity to recover a guarantee the current design already gets for free. Preserve the three-table shape, generalized via the Section 3 subject-registry FK rather than a document-specific one.

### Lifecycle/version tracking

**Options:**

- **A — Reuse each subject's own version identifier directly**, requiring the evidence tables to understand and reference each subject type's specific version table.
- **B — A universal version abstraction**, a second generalized table paralleling `governed_subjects` for versions.
- **C — An opaque version reference.** Evidence records carry a `subject_version_id` (raw UUID), and it is the *consuming* subject-specific service's responsibility to validate that the ID belongs to the subject and matches its current state at write time — mirroring exactly how `transition_document_lifecycle` already validates `p.document_version_id=v_document.current_version_id` itself, rather than asking a shared table to understand what a "document version" means.

**Recommendation: C.** The shared primitive does not need to understand what a version *means* for any given subject type — only that one was bound at the moment of approval. Validating that the bound version is current is each subject type's own governed-mutation function's job, exactly as it already is for documents. This keeps the primitive genuinely subject-agnostic rather than accumulating subject-specific knowledge over time.

## 4. Security Model

- **Ownership boundaries.** Every `governed_subjects`, evidence, and event row is `workspace_id`-scoped, inherited from the subject's own workspace at registry-insertion time — no row exists without a workspace owner.
- **Workspace isolation.** The proven three-tier RLS model applies unchanged: active workspace member (read), non-member (denied via row filter), anonymous (denied at the grant layer, no `SELECT` grant at all) — exactly as validated live for documents in Phase 6.4.
- **Who can request approval.** Only the subject's own governed-mutation function (a `SECURITY DEFINER` function in `creator_os_private`, one per subject type, mirroring `transition_document_lifecycle`) may write a `requested`/`pending` evidence row — no application role ever gets a direct `INSERT` grant on the evidence tables, matching the governed-mutation principle exactly. The requesting identity must match the authenticated session's `auth.uid()`, exactly as documents already require.
- **Who can approve.** Baseline: an active workspace member with `owner` or `administrator` role, matching the proven document requirement. This is a floor, not a ceiling — a subject-specific service (e.g., Tool Registry for T3/T4 actions) may impose a **stricter, additional** role requirement (e.g., requiring the Security Owner specifically, per `AI_Workforce_Registry.md`'s "Agent Owner and Security Owner" approval rule) as an overlay check in its *own* function, without the shared primitive needing to know about every subject type's specific role vocabulary.
- **Prevention of self-approval.** Enforced at the database level, inside the shared approval-writing function, not merely in application code: the approving identity (`auth.uid()` at time of decision) must not equal the requesting identity recorded on the same evidence record. This directly implements `Agent_Tool_Permissions.md`'s rule, "An agent cannot create, satisfy, or reinterpret its own approval," generalized to every subject type, not just agents.

## 5. Lifecycle Model

Seven states, richer than the document pattern's implicit two-outcome model (`approved`/`rejected`) — this is new design, not a direct reuse, and is presented as an explicit transition graph for the same reason `transition_document_lifecycle` uses one: an unstated graph is how P62-001 happened.

| State | Meaning | Entered from |
| --- | --- | --- |
| `requested` | A subject's governed-mutation function has created the record; not yet validated as well-formed. | (initial) |
| `pending` | Passed basic validation (subject exists, version reference resolvable, scope well-formed); visible to an eligible approver, awaiting decision. | `requested` (automatic, system) |
| `approved` | An eligible, non-requester approver recorded a positive decision. | `pending` |
| `rejected` | An eligible approver recorded a negative decision. | `pending` |
| `expired` | `expires_at` passed while still `requested` or `pending`, with no decision recorded. | `requested`, `pending` (automatic, system, time-based) |
| `revoked` | An accountable owner invalidated a previously `approved` decision after the fact (new information, policy change). | `approved` (human-initiated, distinct role from original approver optional — see Open Decisions) |
| `superseded` | A newer request for the same subject and scope arrived, or the subject's bound version changed, making this record no longer current. | `requested`, `pending`, `approved` |

**Transition graph:**

```
requested → pending      (system: passes basic validation)
requested → superseded   (a newer request for the same subject/scope supersedes it first)
pending   → approved     (eligible non-requester approver, positive decision)
pending   → rejected     (eligible approver, negative decision)
pending   → expired      (system: expires_at reached with no decision)
pending   → superseded   (newer request, or subject version changed underneath it)
approved  → revoked      (accountable owner, post-hoc invalidation)
approved  → superseded   (subject's version changed, approval's version binding is now stale)
```

`rejected`, `expired`, `revoked`, and `superseded` are terminal — no further transitions. A new decision requires a fresh `requested` record, matching the append-only philosophy already proven for documents: nothing is ever reopened or reused.

## 6. Validation Strategy

Following the Phase 6.4 evidentiary standard throughout — live-executed evidence, not source review.

### Security tests

- Three-tier RLS denial/allow tests (active member, non-member, anonymous) for `governed_subjects` and the evidence/event tables, mirroring the exact Phase 6.4 methodology.
- Self-approval denial: a live test proving an identity cannot approve its own `requested`/`pending` record, for at least two different subject types (not just the one the primitive was first built against).
- Baseline-role denial: an active member without `owner`/`administrator` cannot approve, mirroring the proven document test.
- A subject-specific stricter-overlay test (e.g., a Tool Registry T4 action denied to an `administrator` who is not also the designated Security Owner) — proving the "floor, not ceiling" design in Section 4 actually composes correctly, not just in theory.

### Governance tests

- Evidence-before-decision: a decision cannot be recorded referencing evidence that doesn't exist, isn't `approved`-eligible, or doesn't match the subject's current version — mirroring the document pattern's exact checks.
- Append-only immutability: no `UPDATE`/`DELETE` grant exists on any evidence or event table for any application role — a grant-level test, not just a behavioral one.
- Cross-reconciliation: a test confirming the generalized primitive's behavior for the document subject type is unchanged from the current, already-shipped COS-MVP-002 behavior — a hard regression bar, not a nice-to-have.

### Lifecycle transition tests

- Every edge in the Section 5 transition graph tested positive (the transition succeeds under valid conditions) at least once.
- A representative sample of illegal transitions tested negative (e.g., `rejected → approved`, `expired → pending`) — mirroring the Phase 6.4 transition-matrix approach used for documents, not necessarily exhaustive on day one but covering every state's "obviously wrong" neighbors.
- The two system-driven transitions (`→ expired`, version-change-triggered `→ superseded`) specifically tested as automatic, not requiring a human action to fire correctly.

### Evidence integrity tests

- Version-binding enforcement: an approval bound to a stale version (subject has since changed) is rejected or auto-superseded, not silently accepted.
- Orphan prevention: no evidence record can reference a `governed_subjects` row that doesn't exist or belongs to a different workspace — proving the Section 3 subject-registry FK actually delivers the referential integrity it was chosen for.

## 7. Open Decisions Requiring Future Owner Approval

These are not resolved by this document and require explicit accountable-owner sign-off before implementation proceeds on them:

- Whether subject-type-specific stricter role requirements (e.g., Security Owner for T4 tool actions) are enforced as an overlay in each subject's own function (this design's recommendation), or whether the shared primitive should instead carry a configurable role-requirement table — a real architectural choice with different maintenance tradeoffs, not yet decided by anyone with the authority to decide it.
- Default `expires_at` duration, and whether it should differ by subject type (the document pattern has no expiry today; introducing one is new policy, not a technical detail).
- Whether `revoked` requires a *different, stricter* role than the original `approved` decision (e.g., only a Security Owner may revoke, regardless of who approved) — this design leaves the role for revocation unspecified pending that decision.
- Retention period for terminal-state evidence and event rows, and whether it differs by subject type — named as an open question in the Phase 7 Implementation Plan and not resolved here either.
- Whether the `governed_subjects` indirection table (Section 3's recommendation) is accepted as designed, given it requires every future subject type's creation path to adopt a new discipline (the double-write) that does not exist today.

## Architectural Constraints

These are non-negotiable rules that hold regardless of how the open decisions in Section 7 are eventually resolved, which specific role names are chosen, or which policy values (expiry durations, retention periods) are set. They constrain every future implementation choice; no implementation decision may violate them.

- **No self-approval.** The identity recorded as approving a decision must never equal the identity recorded as requesting it, for the same evidence record — under any subject type, any role configuration, and any future policy value. This is a structural rule enforced at the point of decision, not a configurable option.
- **Evidence immutability.** Once written, an evidence or event row is never updated or deleted by any application role, regardless of what retention period is eventually chosen for it. Retention policy may govern when a row is eventually purged by a privileged, audited process — it may never govern whether an application role can alter or erase one.
- **Governed subject ownership resolution.** No approval, decision, or evidence record may be written until the subject it concerns resolves to exactly one workspace through a single, authoritative registration path. Ambiguous, missing, or multiply-resolved ownership is a hard failure at write time, never a default-allow or a best-effort guess.
- **Mandatory version context.** No approval may be recorded without a bound, concrete version reference for its subject, regardless of what "version" means for that subject type or how loosely or tightly that reference is validated. A version-less approval is not a permitted state under any implementation of this primitive.
- **Explicit human authority boundaries.** A required approval may only be satisfied by an identity distinct from, and independently authorized relative to, the process or subject requesting it — no subject, service account, or automated process may stand in for the human or explicitly delegated authority a consequential decision requires, regardless of how that authority is configured.

## Preserved Standards

- **COS-MVP-002 governance standards** — every mechanism in this design (governed-mutation-only writes, RLS-from-the-start, append-only evidence, no self-satisfaction of one's own approval) is a direct generalization of what Phase 6.4 already proved, not a relaxed version of it.
- **Evidence before execution** — nothing in this design is treated as correct because it looks correct; Section 6 requires live-executed evidence for every claim, matching how COS-MVP-002 was actually validated.
- **Human approval boundaries** — the lifecycle model in Section 5 exists specifically to keep a human (or a specifically authorized system-driven transition) at every consequential state change; no state reaches `approved` without a role-checked, non-self-approving decision.
- **Version everything** — the Section 3 recommendation for lifecycle/version tracking makes exact-version binding a mandatory, non-optional part of every approval, for every subject type.

## What This Document Does Not Do

- It does not create any database migration.
- It does not modify any application source file.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not authorize implementation to begin — the Open Decisions in Section 7 must be resolved by their accountable owners first.

## References

- [COS-MVP-003 Phase 7 Implementation Plan](COS-MVP-003_Phase_7_Implementation_Plan.md) — the plan this design fulfills, including the "Open Design Decisions" this document resolves
- [COS-MVP-002 Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md) — origin of the proven document evidence pattern
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the evidentiary standard Section 6 follows
- [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md), [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md), [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Schema Specification](../05_Database/Schema_Specification.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial technical design for the Shared Approval/Evidence Primitive: design goals, four architecture inputs reconciled, four data-model decisions each evaluated with options/tradeoffs/recommendation, a security model (ownership, isolation, requester/approver rules, self-approval prevention), a seven-state lifecycle model with explicit transition graph, a validation strategy across security/governance/lifecycle/integrity dimensions, and five open decisions requiring future owner approval. No implementation performed. |
| 1.1 | Added "Architectural Constraints" section recording five non-negotiable rules (no self-approval, evidence immutability, governed subject ownership resolution, mandatory version context, explicit human authority boundaries) that hold regardless of how open decisions are resolved or which policy values are chosen. No existing recommendation or open decision modified, no migration created, no policy value chosen. |
