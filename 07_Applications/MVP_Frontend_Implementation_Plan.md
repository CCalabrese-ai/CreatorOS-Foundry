# Creator OS Foundry MVP Frontend Implementation Plan

**Phase:** 3.3 — MVP Technical Implementation Plan  
**Version:** 1.0  
**Document owner:** Frontend Owner and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This plan converts the approved MVP frontend architecture and component specifications into an ordered, testable implementation program.

## Outcome

The frontend will deliver an accessible, workspace-safe Control Center that renders authorized server view models, submits bounded commands, follows durable receipts, and remains truthful during loading, partial data, dependency failure, and unknown outcomes.

## Implementation Principles

- Treat the browser as untrusted and keep policy decisions server-side.
- Implement contract types and fixtures before feature views.
- Build read paths before state-changing commands.
- Scope caches, subscriptions, drafts, and routes by identity, workspace, and environment.
- Use durable API state as authority; realtime events trigger reconciliation.
- Ship complete state handling and accessibility with each component.
- Keep generated content and Markdown isolated and sanitized.

## Work Packages

| Order | Work package | Primary deliverables | Exit evidence |
| --- | --- | --- | --- |
| 1 | Application foundation | Next.js App Router scaffold, TypeScript, shared configuration, route ownership | Reproducible build and route smoke test |
| 2 | UI foundations | Design tokens, typography, layout, focus, status, forms, tables, dialogs | Component and accessibility checks |
| 3 | Session shell | Session bootstrap, workspace switcher, environment indicator, navigation | Scope-isolation tests pass |
| 4 | Data clients | Typed query and command clients, error mapping, cache keys, cancellation | Contract and stale-data tests pass |
| 5 | Read modules | Overview, Documentation, AI Workforce, Automation, System Health | Authorized ready, empty, partial, denied, and failure states pass |
| 6 | Document workflow | COS-WF-001 intake, confirmation, receipt, run and review views | End-to-end happy and duplicate paths pass |
| 7 | Realtime and recovery | Scoped events, cursor gaps, refresh, reconcile, safe retries | Disconnect and unknown-outcome tests pass |
| 8 | Hardening | Performance, responsive behavior, content safety, telemetry | Quality gates and staging acceptance pass |

## Route and Component Structure

Routes are organized by stable module boundaries. Server components obtain session-aware view models where appropriate. Client components are used only for interaction, transient UI state, subscriptions, and browser APIs. Shared components live in the approved UI package; domain behavior remains inside its module.

Every route defines loading, empty, partial, stale, denied, not-found-or-forbidden, dependency unavailable, and unexpected-error behavior. Route transitions preserve no data across a workspace change.

## State and Data Access

Query keys include user or session scope, workspace, environment, resource, filters, cursor, and contract version. Abort obsolete requests during navigation or scope change. Never seed a newly selected workspace from another workspace's cache.

Mutations send an idempotency key and expected version when required. Optimistic updates are allowed only for reversible local preferences; operational commands follow the returned receipt. Realtime messages invalidate or refresh authoritative queries.

## Component Delivery Rules

Each Phase 3.2 component is delivered with typed props, semantic markup, responsive behavior, keyboard operation, screen-reader labels, loading and failure states, telemetry events, unit or component tests, and Storybook or equivalent examples only if the chosen tooling is approved.

## Content Safety

Render Markdown through an allowlisted parser and sanitizer. Disable raw HTML by default. Constrain links and images, encode text in all other surfaces, apply content security policy, and test script, URL, and prompt-injection payloads.

## Testing

Use static analysis and type checks for every change; Vitest and Testing Library for units and components; Playwright for authenticated workspace, primary flow, denial, recovery, accessibility, and supported-browser coverage. Mock Service Worker or an approved equivalent may provide typed fixtures, but staging acceptance must use real service contracts.

## Observability

Emit structured route, component, request, command, freshness, and error events with release and contract versions, workspace reference, environment, duration, result class, and correlation ID. Do not record secrets, protected content, free-text prompts, or inaccessible names.

## Delivery Gates

- Foundation: build, lint, types, test harness, route errors, and preview work.
- Read-only: all modules reconcile against authorized service fixtures.
- Command: COS-WF-001 returns one durable receipt under replay.
- Recovery: realtime gaps, outages, stale state, and unknown outcomes remain safe.
- Release: accessibility, security, performance, resilience, and acceptance evidence approved.

## Acceptance Criteria

- The application shell and five MVP modules implement their Phase 3.2 contracts.
- Workspace switching clears scoped cache, subscriptions, drafts, and pending requests.
- Every visible state is truthful and every command follows durable evidence.
- Critical flows meet keyboard, screen-reader, responsive, and content-safety standards.
- Automated checks run locally and in the protected delivery pipeline.
- Staging demonstrates the complete document-creation vertical slice.

## References

- [MVP Frontend Architecture](MVP_Frontend_Architecture.md)
- [MVP Control Center Component Specification](MVP_Control_Center_Component_Specification.md)
- [MVP Documentation Module Component Specification](MVP_Documentation_Module_Component_Specification.md)
- [MVP Development Environment Setup](MVP_Development_Environment_Setup.md)
- [UI Standards](UI_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.3 frontend implementation plan |
