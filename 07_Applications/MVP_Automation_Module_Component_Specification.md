# Creator OS Foundry MVP Automation Module Component Specification

**Phase:** 3.2 — MVP Application Component Specifications  
**Version:** 1.0  
**Document owner:** Automation Owner and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document specifies the MVP components used to inspect workflows, initiate approved work, follow runs, perform reviews, and recover safely.

## Scope

The MVP centers on COS-WF-001 Document Creation Workflow while preserving contracts suitable for future registered workflows. Visual workflow authoring, arbitrary step execution, and unrestricted retry are out of scope.

## Component Inventory

| Component | Responsibility | Key data | Primary action |
| --- | --- | --- | --- |
| Workflow Registry | List activated workflows | Workflow ID, version, owner, risk, status | Open specification |
| Workflow Launcher | Collect an approved input contract | Workflow schema, workspace, environment | Validate and submit |
| Run List | Show authorized active and recent runs | Run ID, workflow, state, owner, timestamps | Open run |
| Run Header | Present durable run identity and controls | Version, state, receipt, correlation, cost | Refresh or authorized control |
| Step Timeline | Reconstruct ordered execution | Step, attempt, actor, state, timestamps | Inspect step |
| Step Detail | Explain input metadata, output, and failure | Contract versions, evidence, error category | Open evidence |
| Approval Card | Route a bounded decision | Candidate, risk, findings, expiry | Approve, revise, reject, abstain |
| Recovery Panel | Offer safe policy-approved recovery | Last durable state, side effects, options | Reconcile, cancel, escalate |
| Audit Timeline | Present sanitized immutable events | Actor, action, target, result, time | Filter or inspect |

## Execution Model

A launcher sends a versioned contract and idempotency key to the workflow gateway. The returned receipt is the UI's durable reference. Realtime events improve awareness; the run API remains authoritative. Step transitions follow the registered workflow and cannot be edited by the browser.

## State Model

Runs distinguish requested, accepted, queued, running, waiting, review required, approved, publishing, synchronizing, succeeded, degraded, failed, cancelled, compensated, quarantined, and outcome unknown. Steps additionally identify attempt and retry eligibility. State labels must map directly to registered meanings.

## Command Rules

Start, approve, cancel, reconcile, or resume commands require server authorization, expected state, version validation, and a durable receipt. Confirmation shows workflow and version, target workspace and environment, affected artifact, side effects, approval, cost or quota impact, and reversibility. Unknown external outcomes block blind retry.

## Agent Integration

Agent steps display the registered agent ID and version, handoff state, permitted tool class, evaluation result, and sanitized evidence. The Automation module never invokes an agent directly; it uses the workflow execution layer and its permission envelope.

## Audit Model

The timeline contains event ID, run and step references, workflow version, principal or agent, action, prior and resulting state, policy and approval references, result class, timestamp, correlation ID, and sanitized evidence pointer. Realtime messages are not audit records until backed by durable events.

## Security and Privacy

All run access is scoped server-side. Inputs and outputs are minimized and redacted before reaching the browser. Sensitive classifications can suppress payload previews while retaining safe metadata. External links are allowlisted. Audit export and privileged recovery are separate capabilities.

## Accessibility and Responsive Behavior

Timelines expose an ordered text representation. Dynamic status is announced without stealing focus. Tables collapse into labeled records. Buttons include the workflow or run target in accessible names, and dangerous actions cannot rely on color.

## Failure and Recovery

The UI identifies the failing dependency, last durable state, side-effect uncertainty, accountable owner, and safe next action. Reconciliation checks durable external evidence before changing state. A recovery command is itself idempotent and auditable.

## Testing Requirements

Test workflow and contract versions, invalid and oversized inputs, duplicate starts, stale commands, changed approvals, event gaps, agent failure, GitHub timeout, unknown publication, cancellation boundaries, audit redaction, cross-workspace denial, rate limits, keyboard use, and responsive layouts.

## Acceptance Criteria

- COS-WF-001 can be started once and followed to durable evidence.
- Run and step states match registered workflow semantics.
- Agent work occurs only through the execution layer.
- Approvals bind the exact candidate and expire safely.
- Recovery never duplicates an uncertain side effect.
- Audit views are complete enough to reconstruct the result without exposing secrets.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP Backend Service Architecture](MVP_Backend_Service_Architecture.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)
- [COS-WF-001](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.2 Automation module component specification |
