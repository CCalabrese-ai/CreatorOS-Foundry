# Creator OS Foundry MVP Frontend Architecture

**Phase:** 2.7 — First Functional Prototype  
**Version:** 1.0  
**Document owner:** Application Owner and Frontend Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the frontend architecture for the first Creator OS Foundry Control Center prototype.

## Architectural Boundaries

The browser is untrusted. It renders authorized view models and submits typed requests, but it does not enforce final authorization, hold privileged credentials, decide workflow state, or treat optimistic UI as durable success.

## Frontend Layers

| Layer | Responsibility |
| --- | --- |
| Application shell | Session state, workspace and environment context, navigation, global status, error boundaries |
| Route modules | Overview, Work Queue, Documentation, Create Document, Workflow Run, Audit, Settings |
| Presentation components | Accessible layout, forms, tables, statuses, dialogs, timelines, and feedback |
| View-model adapters | Convert API contracts into display-safe states |
| Query client | Fetching, cancellation, cache keys, freshness, pagination, and reconciliation |
| Command client | Typed mutations, idempotency keys, expected versions, receipts, and status tracking |
| Realtime adapter | Scoped events, reconnect, gap detection, and authoritative refresh |
| Telemetry adapter | Performance, errors, accessibility, and user-outcome signals with redaction |
| Configuration | Publishable environment settings and feature flags |

## Route Model

Routes include the active workspace and environment context and stable resource IDs. MVP routes cover overview, queue, documents, new document request, workflow run, audit timeline, and preferences. Credentials, source text, approval tokens, and sensitive filters are prohibited in URLs.

## State Management

Local state is limited to form input, view preferences, transient disclosure, and navigation. Server state uses a query cache keyed by identity, workspace, environment, capability version, API version, query, and resource. Durable workflow state is never reconstructed from local component state.

Required view states are Initial, Loading, Empty, Partial, Stale, Ready, Denied, Error, Recovering, and Unknown Outcome.

## Data Fetching

Queries use typed schemas, abort on route or workspace change, define freshness targets, and expose last successful observation. Partial-source responses retain completeness metadata. Retries apply only to safe transient reads and never turn authorization denial into repeated traffic.

## Commands

Each mutation generates or receives an idempotency key and expected version. The UI presents action, target, workspace, environment, side effects, approval, and expected duration. Submission returns a durable receipt. The interface follows the receipt until authoritative completion and does not use a toast as the only record.

## Realtime

Realtime events prompt bounded cache updates or refetch. Events include cursor or sequence and source version. On reconnect or gap detection, the client discards uncertain projections and refreshes authoritative APIs. Membership revocation closes subscriptions and clears scoped caches.

## Components

Shared components include workspace switcher, environment banner, page status, health badge, work item list, document table, validated form controls, command confirmation, workflow state timeline, finding list, approval panel, audit timeline, error recovery panel, and correlation reference.

Each component defines accessible semantics, keyboard behavior, responsive behavior, loading and error states, and tests.

## Forms

The document request form preserves input through recoverable errors, labels required and optional fields, validates locally for usability and on the server for authority, supports source references, and prevents accidental duplicate submission. Sensitive autocomplete and analytics capture are disabled.

## Security

Use protected sessions, safe output encoding, approved Markdown rendering, restrictive content security policy, dependency pinning, secret scanning, safe cache headers, and minimal browser storage. User, repository, model, tool, and document content is treated as untrusted.

## Accessibility

Core flows meet WCAG 2.2 AA. Dynamic workflow changes are announced without stealing focus. Tables provide responsive alternatives. Dialog focus is trapped and restored. Status never depends on color alone. Reduced motion is honored.

## Performance

Set budgets for initial load, route transition, input response, dashboard refresh, and long-operation feedback. Split routes by module, minimize dependencies, paginate lists, and virtualize only when accessibility remains sound. Performance work cannot weaken validation or authorization.

## Testing

Use unit tests for view models and pure state decisions, component tests for semantics and interaction, contract tests against API schemas, integration tests for cache and realtime behavior, end-to-end tests for primary flows, accessibility automation plus manual checks, security tests, and responsive visual review.

## Failure and Recovery

A route failure remains inside its module. Expired sessions route to safe reauthentication. Workspace mismatch cancels pending requests and clears state. Unknown command outcomes show the receipt and reconciliation action. Client cache corruption is recoverable by discard and refetch.

## Acceptance Criteria

- Frontend boundaries do not assume server authority.
- Routes and caches remain workspace- and environment-safe.
- Commands produce durable receipts.
- Realtime gaps reconcile correctly.
- Core components are accessible and responsive.
- Failure isolation preserves navigation and recovery.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [UI Standards](UI_Standards.md)
- [Application Security Model](Application_Security_Model.md)
- [Control Center API Requirements](Control_Center_API_Requirements.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.7 MVP frontend architecture |
