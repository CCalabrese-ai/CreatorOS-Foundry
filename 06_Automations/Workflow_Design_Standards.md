# Creator OS Foundry Workflow Design Standards

**Phase:** 1.5 — Automation Engine Foundation  
**Version:** 1.0  
**Document owner:** Automation Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the contract and design requirements for Creator OS Foundry workflows from proposal through activation, operation, migration, and retirement.

## Required Workflow Contract

Every workflow must define:

| Field | Requirement |
| --- | --- |
| Workflow ID | Stable registry identifier |
| Name and purpose | One bounded operational outcome |
| Owner | Accountable role |
| Version and status | Approved lifecycle state |
| Trigger | Authorized event, schedule, or manual request |
| Initiator | Allowed human, agent, service, or workflow identities |
| Inputs | Schema, source, classification, size, and validation |
| Steps | Ordered actors, tools, permissions, timeouts, and outcomes |
| Approvals | Gate location, approver, scope, expiry, and denial path |
| Outputs | Schemas, artifacts, events, notifications, and classification |
| Side effects | Public, financial, destructive, customer-facing, or identity changes |
| Reliability | Idempotency, retry, concurrency, and compensation |
| Observability | Logs, metrics, traces, audit events, cost, and alerts |
| Recovery | Pause, resume, replay, manual intervention, and rollback |
| Tests | Required suites and acceptance thresholds |
| Retirement | Disablement, migration, retention, and archive |

## Design Process

1. Define the outcome, owner, scope, exclusions, and acceptance criteria.
2. Identify trigger trust, actors, data, tools, environments, and side effects.
3. Model the happy path, denied path, failure states, timeouts, and recovery.
4. Define step contracts and durable state transitions.
5. Assign permissions and approval gates at the narrowest action boundary.
6. Specify idempotency, concurrency, rate, budget, and retry behavior.
7. Define observability and operator controls.
8. Build tests before activation.
9. Review security, data, architecture, domain, and release impact.
10. Register and activate only after evidence and approval are complete.

## Step Design

Each step must have one clear responsibility, typed inputs and outputs, named executor, allowed tools, data scope, timeout, retry policy, and success evidence. A step must not infer authorization from successful execution of a previous step.

## Idempotency

Use a stable idempotency key derived from the workflow, version, workspace, trigger, and governed resource. Record the key before performing the side effect. Replays return the recorded outcome or reconcile state instead of repeating the action.

## Retry Rules

Retry only transient, classified failures. Declare maximum attempts, backoff, jitter, total time, and retryable error codes. Validation, authorization, approval denial, insufficient funds, policy violations, and unknown side-effect outcomes are not automatically retryable.

## Timeouts and Waiting

Every step and run must have a timeout or explicit durable waiting state. Approval and human-task waits must define reminder, expiry, escalation, and cancellation behavior. A timed-out call with unknown external outcome requires reconciliation.

## Concurrency and Ordering

Declare whether runs may overlap by workspace, subject, integration, or resource. Use locking, sequencing, optimistic concurrency, or deduplication where conflicts could corrupt state or duplicate effects.

## Compensation

Compensation is an explicit workflow, not an assumed rollback. It must state preconditions, authority, irreversible limits, and evidence. Financial, public, destructive, and customer-facing compensation requires the same or stronger controls as the original action.

## Approval Boundaries

The Workflow Owner approves routine design. Security and Data Owners review sensitive data, credentials, identity, or privileged access. The System Owner approves material public, financial, destructive, contractual, or business-risk exposure. The Release Owner approves activation.

## Versioning and Change

Running instances remain pinned to their workflow version unless a reviewed migration exists. Material changes create a new version. Emergency containment may pause a version immediately, but reactivation requires verification.

## Acceptance Criteria

- The contract contains every required field.
- Steps and state transitions are deterministic or explicitly bounded.
- Unsafe retries and duplicate effects are prevented.
- Failure, timeout, denial, compensation, and cancellation paths are defined.
- Permissions and approvals match risk.
- Tests and operational evidence support activation.

## References

- [Automation Architecture](Automation_Architecture.md)
- [Workflow Registry](Workflow_Registry.md)
- [Agent Handoff Standards](Agent_Handoff_Standards.md)
- [Integration Standards](Integration_Standards.md)
- [Automation Testing Framework](Automation_Testing_Framework.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.5 workflow design standard |
