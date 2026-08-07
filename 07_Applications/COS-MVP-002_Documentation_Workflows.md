# COS-MVP-002 Documentation Workflows

**Phase:** 6.0 — Documentation Center Planning
**Version:** 1.0
**Document owner:** Documentation Steward and Automation Owner
**Status:** Proposed
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release classification:** Planning only — Not Implemented

## Purpose

This document defines the planned creation, review, approval, versioning, and archival workflows for the Documentation Center. The workflows extend COS-WF-001 and the Documentation Engine operating model. They do not create executable automation in Phase 6.0.

## Common Workflow Contract

Every run must record a run ID, workflow key and version, workspace, initiator, document key, requested outcome, source and base commit, observed version, classification, risk, idempotency key, correlation ID, current state, timestamps, evidence, assignments, decisions, side effects, and final disposition.

All transitions must be authorized, deterministic, idempotent, and auditable. A workflow must fail closed when evidence, authority, source integrity, or workspace scope is missing. Agent output is a proposal or finding, never approval.

## Roles and Approval Boundaries

| Role | Responsibility | Prohibited action |
| --- | --- | --- |
| Requester or Author | Supplies intent, sources, draft, and acceptance criteria | Cannot infer another role's decision |
| Documentation Architect Agent | Assists with templates, structure, links, metadata, and validation | Cannot grant access, approve, publish, or lower classification |
| Documentation Steward | Owns standards, routing, lifecycle quality, and canonical placement | Cannot bypass required domain authority |
| Domain Reviewer | Assesses accuracy and impact for an exact candidate | Cannot approve a changed candidate using stale review |
| Accountable Approver | Records explicit authority decision and acceptance statement | Cannot delegate approval to an agent implicitly |
| Publisher | Executes the approved bounded repository change | Cannot alter approved content during publication |
| Data and Security Owners | Review data, authorization, classification, and security impact | Cannot treat an Internal MVP exception as production approval |

The Internal MVP may assign multiple human roles to one authorized owner, but each authority decision remains explicit, attributable, timestamped, and independently recorded.

## Document Creation Workflow

1. Capture purpose, user need, owner role, audience, domain, classification, risk, target repository path, sources, relationships, and acceptance criteria.
2. Search authorized document identities and canonical paths for duplicates or an existing document to update.
3. Resolve referenced systems, agents, workflows, tools, and applications against the System Registry.
4. Assign a stable document key and approved template; agents may assist within the bounded context.
5. Create an immutable draft candidate against a known base commit.
6. Validate required metadata, structure, terminology, links, relationships, classification, sensitive-data handling, and content limits.
7. Route blocking findings to the author and record non-blocking findings with owners.
8. Move the valid candidate to review without changing canonical GitHub content.
9. After required approval, invoke the publication and synchronization portion of COS-WF-001.
10. Close only when the resulting GitHub commit, content hash, Supabase projection, and publication receipt agree.

Expected failures include duplicate keys, occupied paths, unresolved relationships, stale base commits, secret findings, unauthorized classification, invalid Markdown, and unavailable dependencies. These failures preserve the last verified canonical state.

## Review Workflow

1. Create a review request naming the exact document version, candidate hash, risk, required reviewer role, ruleset, scope, and due date.
2. Present the candidate, source evidence, validation findings, relationships, classification, and change impact through an authorized view.
3. Allow the reviewer to record `Approve Review`, `Request Changes`, `Reject`, or `Abstain`, with an attributable rationale reference.
4. Verify reviewer capability and candidate hash at decision time.
5. Mark the decision stale if the candidate, source set, classification, or material impact changes.
6. Route requested changes to a new candidate version; never edit the reviewed version in place.
7. Advance only when all blocking reviews and findings have valid dispositions.

Automated quality checks may recommend a disposition but cannot satisfy a required human review.

## Approval Workflow

1. Assemble an immutable approval packet containing the candidate hash, source commit, validation evidence, review decisions, known limitations, release classification, and requested authority scope.
2. Verify the human approver's active workspace membership and recorded authority.
3. Require an explicit decision of `Approved`, `Rejected`, or `Abstained`, plus timestamp and acceptance statement or rationale.
4. Recheck that no blocking finding is open and that the candidate still matches the packet.
5. Record the append-only approval decision.
6. Permit publication only for an approved candidate through the bounded publisher.
7. Invalidate publication authority if content or materially relevant evidence changes before publication.

Approvals cannot be inferred from identity, ownership, conversation history, silence, agent output, a successful test, or prior approval of another version.

## Versioning Workflow

1. Resolve the current canonical version, source commit, semantic version, owner, lifecycle, and dependent relationships.
2. Classify the change as major, minor, or patch according to the Documentation Standards.
3. Create a new immutable candidate with a link to the base and, when applicable, a supersedes relationship.
4. Run validation and impact analysis; route review and approval based on changed authority, data, security, and consumers.
5. Reject or rebase when the canonical source changes during the workflow.
6. Publish the approved candidate to GitHub and verify the resulting commit and content hash.
7. Synchronize the new version, update the current pointer transactionally, and retain all earlier versions.
8. Notify or flag affected relationships and derived indexes for refresh.

A repeated request with the same document, base, candidate hash, and action must return the existing logical receipt.

## Archival Workflow

1. Identify the archival reason, owner, retention requirement, replacement, affected consumers, and restoration conditions.
2. Verify that no active workflow or governing reference depends solely on the candidate for archival.
3. Use deprecation and supersession before retirement when a transition is required.
4. Obtain explicit documentation and domain authority for the exact version and archival scope.
5. Publish lifecycle and replacement metadata to GitHub without deleting canonical history.
6. Mark the Supabase identity Archived only after canonical synchronization confirms the change.
7. Exclude or demote the record in active discovery while preserving authorized historical access and audit evidence.
8. Delete or rebuild derived artifacts according to classification and retention policy.
9. Restore only through an explicit workflow that creates a new candidate and new evidence.

Archival is not hard deletion. Privacy- or security-driven erasure follows a separately approved procedure across canonical and derived stores.

## Handoffs and Agent Integration

Each handoff must contain the run ID, expected outcome, candidate version and hash, base commit, sources, relationships, allowed paths, allowed tools, classification, findings, open decisions, next accountable role, and expiry. The receiver validates the handoff before acting. The Documentation Architect Agent operates with minimum required context and cannot access restricted content or tools without an explicit policy grant.

## Failure, Retry, and Reconciliation

- Transient failures use bounded retry with jitter and stable idempotency keys.
- Authorization, validation, classification, schema, integrity, and approval failures do not retry blindly.
- Unknown GitHub publication outcomes enter reconciliation before another write.
- Repeated failures enter quarantine with evidence, attempts, owner, and safe recovery action.
- A failed synchronization keeps the canonical GitHub commit authoritative and marks the projection degraded until reconciliation.
- Recovery never rewrites prior decisions or audit events.

## Workflow Acceptance Criteria

- Creation detects duplicates, validates metadata and relationships, and produces one receipt per logical request.
- Reviews and approvals bind the exact immutable candidate and become stale after material change.
- Agents cannot approve, publish, expand tool permission, or change classification autonomously.
- Versioning preserves immutable source evidence and safe optimistic concurrency.
- Archival preserves history, replacement evidence, retention, and an explicit restoration path.
- Failed, replayed, delayed, and uncertain steps do not duplicate versions or report false success.
- Every terminal state is attributable and explainable from audit evidence.

## Deferred Production Gates

Production operation requires exercised recovery for workflow and repository failures, production queue and alert monitoring, verified alert delivery, capacity and latency objectives, duty ownership, incident escalation, retention enforcement, and controlled emergency access. These requirements remain future production gates.

## References

- [COS-WF-001 Document Creation Workflow](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)
- [Document Workflows](../02_Documentation_Engine/Document_Workflows.md)
- [Documentation Architect Agent Integration](../02_Documentation_Engine/Documentation_Architect_Agent_Integration.md)
- [COS-MVP-002 Data Model](COS-MVP-002_Documentation_Data_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.0 Documentation Center workflows |
