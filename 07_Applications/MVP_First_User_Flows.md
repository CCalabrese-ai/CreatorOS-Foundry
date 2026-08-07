# Creator OS Foundry MVP First User Flows

**Phase:** 2.7 — First Functional Prototype  
**Version:** 1.0  
**Document owner:** Product Owner, Design Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the first end-to-end user flows that the MVP must support and test.

## Flow Principles

Every flow preserves identity, workspace, environment, status, freshness, ownership, approval, and recovery context. The interface never presents request acceptance as durable completion and never hides a denied or unknown result.

## UF-001 Sign In and Enter Workspace

**Actor:** Authorized user  
**Outcome:** User reaches the Overview in one verified workspace and environment.

1. User signs in through the approved identity provider.
2. Server validates session and returns authorized workspaces.
3. User selects a workspace and permitted environment.
4. Server resolves membership and capabilities.
5. Application clears prior scoped data and loads Overview.
6. Shell persistently displays workspace, environment, identity, and freshness.

Denied, suspended, expired, or zero-workspace users receive a safe explanation and no protected data.

## UF-002 Review Overview

**Actor:** Operator or Documentation Steward  
**Outcome:** User understands current documentation work and system health.

1. Overview loads workspace summary, pending work, active document runs, recent documents, and dependency health.
2. Each panel shows freshness and completeness.
3. User opens a work item, run, document, or health detail.
4. Partial or stale sources remain visibly marked.

A source outage cannot appear as an empty healthy state.

## UF-003 Create Document Request

**Actor:** Documentation Steward  
**Outcome:** One authorized COS-WF-001 run is accepted.

1. User selects Create document.
2. Form requests title, purpose, target domain, document key, owner, audience, classification, risk, sources, and acceptance criteria.
3. Client validates usability; server validates schema and authority.
4. Confirmation shows workspace, environment, path, side effect, approval, and expected duration.
5. User submits with an idempotency key.
6. Server returns a durable workflow receipt.
7. Application opens the run detail.

Duplicate submission returns the same receipt. Existing canonical content offers the existing document or an update route.

## UF-004 Follow Workflow Run

**Actor:** Initiator or authorized observer  
**Outcome:** User can understand progress and the next required action.

1. Run page shows workflow and version, current state, steps, owner, timestamps, findings, approvals, cost, and correlation.
2. Realtime events update awareness.
3. Gaps or reconnects trigger authoritative refresh.
4. Waiting and failure states identify owner and next action.
5. Success links to the committed path and SHA.

The page distinguishes degraded synchronization from failed publication.

## UF-005 Review Candidate

**Actor:** Assigned Reviewer  
**Outcome:** Reviewer records a decision for the exact candidate.

1. Work Queue shows the assigned review with risk, due time, and source.
2. Reviewer opens candidate metadata, diff or artifact, sources, validation findings, and consequences.
3. Reviewer chooses Approve, Request Changes, Reject, or Abstain and supplies required rationale.
4. Server verifies assignment, capability, candidate hash, and approval expiry.
5. Durable receipt and updated run state appear.

If the candidate changed, the interface invalidates the stale decision attempt.

## UF-006 Inspect Canonical Document

**Actor:** Authorized workspace user  
**Outcome:** User verifies the resulting canonical source.

1. Documentation list shows title, key, owner, status, version, classification, freshness, and findings.
2. User filters within authorized fields.
3. User opens the document detail.
4. Detail shows source path, commit SHA, content hash, relationships, review, and publication evidence.
5. User may open the canonical GitHub source when authorized.

Search and counts do not reveal inaccessible documents.

## UF-007 Recover From Failure

**Actor:** Operator  
**Outcome:** User safely handles a failed, quarantined, or unknown run.

1. Run page shows failure class, last durable step, affected side effect, owner, and correlation.
2. Available actions are server-authorized: refresh, reconcile, cancel, or escalate.
3. Confirmation explains consequences.
4. Command returns a durable receipt.
5. UI follows the recovery action to completion.

Unknown publication outcome prohibits blind retry.

## UF-008 Switch Workspace

**Actor:** User with multiple memberships  
**Outcome:** Application moves cleanly to another workspace.

1. User opens workspace switcher.
2. Server returns current authorized choices.
3. User selects another workspace and environment.
4. Pending requests, caches, subscriptions, drafts, and search state from the prior workspace are cleared.
5. Capabilities and Overview load for the new context.

## Accessibility and Responsive Behavior

All flows work by keyboard and screen reader. Dynamic state updates are announced. Focus moves predictably. Small screens preserve workspace, environment, status, approval, and recovery information.

## Acceptance Criteria

- Each flow has positive, denied, error, stale, and recovery coverage.
- Workspace switching cannot leak prior data.
- Document submission is idempotent.
- Review binds the exact candidate.
- Success links to durable evidence.
- Unknown outcomes remain visible and non-duplicative.
- Core flows pass accessibility acceptance.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP Frontend Architecture](MVP_Frontend_Architecture.md)
- [MVP Backend Service Architecture](MVP_Backend_Service_Architecture.md)
- [UI Standards](UI_Standards.md)
- [User Workspace Model](Control_Center_User_Workspace_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.7 MVP first user flows |
