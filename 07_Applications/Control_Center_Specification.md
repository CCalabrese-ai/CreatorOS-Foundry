# Creator OS Foundry Control Center Specification

**Phase:** 1.6 — Application Layer Architecture  
**Version:** 1.0  
**Document owner:** Application Owner and System Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

The Control Center is the primary governed operations interface for Creator OS Foundry. It gives authorized operators a truthful view of system state and a safe place to review, approve, pause, recover, and investigate work.

## Users and Roles

| Role | Primary use |
| --- | --- |
| System Owner | Portfolio status, risk acceptance, cross-domain decisions |
| Domain Owner | Domain health, approvals, releases, and exceptions |
| Operator | Run monitoring, intervention, recovery, and routine administration |
| Security Owner | Access, incidents, findings, secrets metadata, and audit |
| Quality or Release Owner | Test evidence, readiness, activation, and rollback |
| Reviewer | Bounded approval or review queue |
| Read-only observer | Authorized status and evidence without mutation |

Visibility and actions are determined server-side by workspace, environment, role, resource, and risk.

## Information Architecture

### Overview

Shows workspace health, active incidents, pending approvals, failed or stuck workflows, security alerts, release readiness, provider degradation, usage, and cost.

### Work Queue

Shows assigned tasks, handoffs, approvals, reviews, deadlines, blockers, and escalation. Filters must preserve authoritative counts and disclose incomplete data.

### Workflow Operations

Shows runs, steps, versions, inputs metadata, approvals, artifacts, retries, costs, and errors. Authorized operators may pause, resume, cancel, reconcile, or start approved recovery.

### Registries

Provides governed views of agents, tools, workflows, integrations, applications, owners, permissions, risk, and lifecycle status.

### Knowledge and Documentation

Surfaces canonical documents, versions, owners, status, freshness, broken links, drift findings, and review dates.

### Security and Audit

Shows security findings, access reviews, incidents, exceptions, privileged events, and sanitized audit trails.

### Settings

Contains workspace, notification, integration, retention, and application configuration permitted to the current role.

## Global Navigation

Navigation includes workspace switcher, environment indicator, search, notifications, approval inbox, help, current identity, and security status. Production and non-production contexts must be visually unmistakable.

## Command Model

Every command must state:

- action and target;
- current and resulting state;
- affected workspace and environment;
- data and external side effects;
- required approval and authorization;
- cost or quota impact when relevant;
- reversibility and recovery path;
- success evidence and expected duration.

Destructive or irreversible commands require explicit confirmation and must not use ambiguous labels.

## Status and Truthfulness

The Control Center distinguishes requested, queued, running, waiting, approved, succeeded, failed, cancelled, compensated, and unknown outcomes. A notification or accepted request is not proof of completion.

## Real-Time Updates

Live updates may improve awareness but must reconnect safely, detect missed events, and reconcile with durable state. Users can see freshness and manually refresh. Realtime delivery is never the sole record of an operation.

## Search and Filtering

Search respects authorization and never reveals inaccessible object names or counts. Results show type, owner, status, workspace, environment, version, and freshness. Filters remain shareable only when URLs contain no secrets or sensitive values.

## Approvals

Approval views present the complete bounded request, evidence, risks, side effects, cost, expiry, and alternatives. Approvers can approve, deny, request changes, or escalate. The interface records the decision and prevents approval after material request changes.

## Incident and Recovery Experience

During incidents, the Control Center prioritizes containment, status, affected scope, owner, timeline, evidence, and approved recovery actions. Emergency controls are protected, time-bounded, and followed by review.

## Accessibility and Responsiveness

All critical operations are keyboard accessible, screen-reader labeled, contrast compliant, and usable without color alone. Dense operational views adapt to smaller screens without hiding status or approvals.

## Acceptance Criteria

- Roles see only authorized data and actions.
- Overview reflects durable, fresh system state.
- Approval and command experiences disclose full consequences.
- Operators can investigate and recover workflows safely.
- Search, notifications, and realtime updates preserve authorization.
- Critical paths meet UI, security, accessibility, and test standards.

## References

- [Application Architecture](Application_Architecture.md)
- [Module Architecture](Module_Architecture.md)
- [UI Standards](UI_Standards.md)
- [Application Security Model](Application_Security_Model.md)
- [Automation Architecture](../06_Automations/Automation_Architecture.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.6 Control Center specification |
