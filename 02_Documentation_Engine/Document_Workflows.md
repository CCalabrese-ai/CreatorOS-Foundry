# Creator OS Foundry Document Workflows

**Phase:** 2.2 — Documentation Engine Implementation  
**Version:** 1.0  
**Document owner:** Documentation Steward and Automation Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines executable workflows for creating, changing, validating, approving, publishing, deprecating, and recovering Creator OS Foundry documentation.

## Workflow Contract

Every workflow run must record a run ID, workspace, initiator, document key, source commit, requested outcome, risk class, current state, idempotency key, timestamps, evidence, approvals, and final disposition. Automated transitions must be deterministic and must fail closed when required evidence or authority is missing.

## Lifecycle States

Draft and Proposed are non-authoritative. Baseline, Approved, and Active can govern according to their approved scope. Deprecated content remains valid only during transition. Retired content must not direct new work.

Permitted transitions are:

- Draft to Proposed after author validation.
- Proposed to Baseline, Approved, or Draft after review.
- Baseline to Approved or Active after required authority approval.
- Approved to Active when activation conditions are met.
- Any governing state to Deprecated with a replacement or transition plan.
- Deprecated to Retired after consumers and inbound references are addressed.
- Rejected or failed work returns to Draft or closes without changing the canonical version.

## Create Document Workflow

1. Capture purpose, owner, scope, audience, phase, risk, sources, and acceptance criteria.
2. Search for an existing canonical document and stable key.
3. Select the approved template and repository location.
4. Draft the smallest coherent document with required metadata.
5. Validate structure, links, terminology, provenance, classification, and secrets handling.
6. Route findings to the author and required reviewers.
7. Obtain approval appropriate to authority and risk.
8. Publish through an authorized repository commit.
9. Record the version, commit SHA, content hash, and publication event.
10. Refresh relationships and derived indexes.

## Update Document Workflow

1. Resolve the current canonical path and commit.
2. Compare the request with dependent documents and implementation evidence.
3. Lock the workflow to the observed source commit.
4. Create a proposed patch and identify semantic version impact.
5. Run validation and impact analysis.
6. Route material changes to accountable domain owners.
7. Reject or rebase the patch if the canonical source changed.
8. Publish the approved patch and refresh downstream metadata.

## Review and Approval Workflow

Review requests identify the exact document version, reviewer role, decision deadline, risk, and required checks. A reviewer may approve, request changes, reject, or abstain. Authors and agents cannot approve their own high-risk changes. Approval is invalid if blocking validation findings remain, the source SHA changed, or the approver lacks authority.

## Publication Workflow

Publication accepts only an approved immutable candidate. It verifies the target branch, base commit, path scope, approvals, and validation evidence; applies the change atomically; and records the resulting commit. If the repository write fails, the workflow records failure and leaves the prior canonical version unchanged.

## Deprecation and Retirement Workflow

1. Identify the replacement, affected consumers, owner, and transition date.
2. Mark the current document Deprecated and add the replacement link.
3. Update inbound references and derived search priority.
4. verify no active workflow depends solely on the deprecated source.
5. Mark Retired and move to the archive only when governance permits.
6. Preserve history and remove or demote derived artifacts.

## Drift and Conflict Workflow

Drift may be triggered by an unprocessed commit, content-hash mismatch, broken link, stale review date, implementation change, or conflicting canonical claim. The workflow records evidence, severity, affected consumers, and owner. Blocking conflicts quarantine the affected synchronization item and prevent publication or index promotion until resolved.

## Agent Handoffs

A handoff contains the run ID, requested outcome, source set, current commit, allowed paths, constraints, findings, open decisions, required approval, and next-owner role. Receiving agents must validate the handoff before acting. Natural-language summaries alone are insufficient for authority or state transitions.

## Retry and Idempotency

Each side-effecting step uses a stable idempotency key derived from workflow, document key, source commit, and action. Transient failures use bounded exponential backoff. Repeated or non-transient failures enter quarantine. Replay must not create duplicate versions, approvals, or publication events.

## Observability

Track throughput, queue age, review time, rejection rate, validation failures, publication latency, stale runs, retry counts, conflicts, and index freshness. Logs contain stable identifiers and error categories, not document bodies or secrets. Every terminal state must be explainable from audit events.

## Controls

- Repository writes, approvals, status elevation, and retirement require explicit authority.
- External sources and model output remain untrusted until validated.
- Restricted documents must not be sent to unapproved models, tools, or indexes.
- A workflow cannot lower classification or bypass required review automatically.
- Human emergency intervention must be logged and followed by reconciliation.

## Acceptance Criteria

- Valid and invalid transitions are mechanically testable.
- Every published version has source, validation, review, approval, and commit evidence.
- Replays are idempotent.
- Failed publication preserves the previous approved source.
- Handoffs are structured and attributable.
- Drift and conflict findings produce owner-assigned remediation.

## References

- [Documentation Lifecycle Management](Documentation_Lifecycle_Management.md)
- [Documentation QA Standards](Documentation_QA_Standards.md)
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [Documentation Data Model](Documentation_Data_Model.md)
- [GitHub-Supabase Synchronization](GitHub_Supabase_Synchronization.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.2 document workflows |
