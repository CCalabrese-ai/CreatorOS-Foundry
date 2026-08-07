# Creator OS Foundry MVP Control Center Component Specification

**Phase:** 3.2 — MVP Application Component Specifications  
**Version:** 1.0  
**Document owner:** Application Owner and Frontend Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document specifies the shared Control Center components that frame every MVP module and present authorized operational state consistently.

## Scope

The component set includes the application shell, workspace and environment controls, global navigation, status and freshness indicators, command confirmation, notification and work summaries, error boundaries, and durable receipt feedback.

## Component Inventory

| Component | Responsibility | Primary inputs | Output or action |
| --- | --- | --- | --- |
| Application Shell | Persistent identity, scope, navigation, and recovery frame | Session, capabilities, workspace, environment | Authorized route outlet |
| Workspace Switcher | Select an authorized workspace | Workspace summaries, current selection | Scope-change request |
| Environment Indicator | Make runtime context unmistakable | Environment and release metadata | Display only |
| Global Navigation | Expose permitted MVP modules | Capability-filtered destinations | Route transition |
| Status Summary | Show current work and dependency condition | Authorized aggregate view model | Detail navigation |
| Freshness Indicator | Disclose observation time and partial data | Observed time, source health | Refresh request |
| Command Confirmation | Explain a state-changing request | Target, impact, approval, reversibility | Confirm or cancel |
| Command Receipt | Track accepted work to a durable result | Receipt ID, state, correlation ID | Run navigation |
| Global Error Boundary | Preserve safe navigation after failure | Safe error contract | Retry, refresh, or escalation |
| Notification Center | Show authorized actionable events | Scoped notification summaries | Acknowledge or navigate |

## State Model

Components must distinguish loading, ready, empty, partial, stale, denied, unavailable, and unexpected-error states. Command components additionally distinguish validating, awaiting confirmation, submitting, accepted, outcome unknown, succeeded, and failed. Empty data must never represent an unavailable source.

## Interaction Requirements

Workspace switching must cancel scoped requests, clear caches and drafts, close subscriptions, reset module filters, then load new capabilities. Navigation must hide unavailable destinations without implying that hidden resources exist. A command confirmation must state workspace, environment, target, side effects, approval boundary, cost or quota impact when relevant, and recovery path.

## Data and API Contracts

The shell consumes server-produced session, workspace, capability, notification, and health view models. It must not calculate authorization from client roles. Cache keys include identity, workspace, environment, resource, filters, and contract version. Commands carry an idempotency key and receive a durable receipt.

## Security and Privacy

No privileged credential, raw policy detail, inaccessible object count, or sensitive audit payload may reach these components. Scope changes fail closed. URLs and client persistence may contain only approved non-secret identifiers. All server-returned Markdown or generated text is rendered as untrusted content.

## Accessibility and Responsive Behavior

All controls are keyboard operable, visibly focused, screen-reader named, and usable without color alone. Context changes and command results use appropriate announcements. Small screens preserve identity, workspace, environment, current status, and recovery actions before secondary detail.

## Failure and Recovery

A failed scope switch restores a safe previous context or signs the user out; it must not leave mixed-workspace state. Realtime gaps trigger authoritative refresh. Unknown command outcomes prohibit automatic resubmission and direct the user to reconciliation through the receipt.

## Telemetry

Record component and contract version, route, workspace reference, environment, action, result class, latency, freshness, and correlation ID. Do not record secrets, document bodies, free-text prompts, or inaccessible resource names.

## Acceptance Criteria

- The shell exposes only server-authorized modules and actions.
- Workspace switching removes prior scoped state before loading the next workspace.
- Environment, freshness, partial state, and command outcome remain explicit.
- Every state-changing action produces or follows a durable receipt.
- Critical components pass keyboard, screen-reader, responsive, denied-state, and failure-recovery tests.
- Telemetry is useful for diagnosis without capturing protected content.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP Frontend Architecture](MVP_Frontend_Architecture.md)
- [MVP First User Flows](MVP_First_User_Flows.md)
- [UI Standards](UI_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.2 Control Center component specification |
