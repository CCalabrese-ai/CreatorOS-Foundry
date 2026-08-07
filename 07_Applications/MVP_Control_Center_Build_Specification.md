# Creator OS Foundry MVP Control Center Build Specification

**Phase:** 4.2 — MVP Core Build Specification  
**Version:** 1.0  
**Document owner:** Application Owner, Frontend Owner, and Backend Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document specifies the first buildable Control Center release and the evidence required for each route and shared capability.

## Build Outcome

An authorized user can enter one workspace, understand system and document state, inspect the registries, start COS-WF-001, follow the run, complete an assigned review, and verify publication or recover safely.

## Route Inventory

| Route area | Initial capability | Mutation boundary |
| --- | --- | --- |
| Sign in and callback | Establish validated session | Auth service only |
| Workspace entry | Select an authorized workspace and environment | Scope selection |
| Overview | Work, runs, documents, registry and health summaries | Read-only |
| System Registry | Agent, tool, workflow, application and integration records | Read-only |
| Documentation | Document list, detail, version and source evidence | Read-only |
| Create Document | Validated COS-WF-001 intake and confirmation | Idempotent workflow command |
| Workflow Run | State, steps, findings, review, audit, publication | Approved review and recovery commands |
| System Health | Dependency status, freshness, incidents, failures | Read-only for MVP |
| Settings | Safe personal display preferences | Reversible preference update |

## Shared Shell

The shell displays identity, workspace, environment, release, navigation, notification summary, freshness, and security status. Navigation is built from server-returned capabilities. Workspace switching aborts requests, clears caches, drafts and subscriptions, then reloads capabilities before rendering scoped content.

## View-Model Contract

Every view model carries contract version, workspace, environment, observed time, freshness, completeness, classification where relevant, source version, allowed actions, and correlation. The server omits inaccessible objects and counts. The client does not infer permission from roles.

## Component Requirements

Use the approved tokens and primitives for status, forms, tables, details, timelines, alerts, confirmations, receipts, and recovery. Each route handles loading, ready, empty, partial, stale, denied, unavailable, and unexpected error. Commands add validating, confirming, submitting, accepted, duplicate, waiting, succeeded, failed, quarantined, degraded, and outcome unknown.

## Data and Cache Rules

Authenticated operational responses are private and non-shared. Cache keys include session scope, workspace, environment, resource, filters, cursor, and contract version. Realtime events invalidate or refresh authoritative queries. Back navigation cannot expose prior-workspace state.

## Commands

The Control Center submits only versioned commands supported by server-returned capabilities. Each confirmation identifies target, workspace, environment, side effects, approval, cost or quota impact, reversibility, and recovery. Each accepted command returns a durable receipt and status route.

## Accessibility and Responsive Design

Primary paths meet WCAG 2.2 AA targets. Keyboard and screen-reader users can sign in, choose workspace, browse registries, create a document request, follow status, review a candidate, and understand errors. Small screens preserve scope, status, ownership, approval, and recovery before secondary detail.

## Security and Content Safety

Render Markdown and agent output as untrusted with raw HTML disabled by default. Constrain external links, apply content security policy, validate all inputs server-side, protect against cross-site request abuse, and exclude secrets, hidden prompts, private logs, and inaccessible identifiers.

## Telemetry

Record release and contract versions, route, action, workspace reference, result class, freshness, latency, receipt, and correlation. Do not record document bodies, prompts, credentials, sensitive audit payloads, or user-entered source text.

## Build Gates

- Shell gate: session, workspace, environment, navigation, states, and accessibility pass.
- Registry gate: System Registry reconciles with canonical sources and denies cross-workspace access.
- Documentation gate: Document Registry reconciles GitHub and Supabase evidence.
- Command gate: replay returns one receipt and one workflow run.
- Review gate: decisions bind the exact candidate and expiry.
- Recovery gate: dependency failure and unknown outcome do not duplicate effects.
- Release gate: security, accessibility, performance, telemetry, rollback, and end-to-end evidence pass.

## Acceptance Criteria

- Every route implements its authorized contract and complete state model.
- The shell never mixes identities, workspaces, environments, or cached data.
- Registries show canonical provenance and freshness.
- COS-WF-001 follows durable command and workflow evidence.
- Core flows pass keyboard, screen-reader, responsive, denial, and recovery tests.
- Failures never appear as empty success or healthy state.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [Control Center Module Specifications](Control_Center_Module_Specifications.md)
- [MVP Control Center Component Specification](MVP_Control_Center_Component_Specification.md)
- [MVP Frontend Component Build Plan](MVP_Frontend_Component_Build_Plan.md)
- [MVP First Feature Implementation](MVP_First_Feature_Implementation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.2 Control Center build specification |
