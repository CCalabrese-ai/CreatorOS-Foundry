# Creator OS Foundry MVP Feature Prioritization

**Phase:** 3.3 — MVP Technical Implementation Plan  
**Version:** 1.0  
**Document owner:** Product Owner, Project Operations Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the delivery order and decision rules for the Creator OS Foundry MVP so implementation proves the governed document-creation loop before expanding product breadth.

## Prioritization Method

A feature is prioritized by its contribution to the primary user outcome, risk reduction, dependency unlock, governance necessity, testability, operational support, and delivery effort. Security, workspace isolation, durable state, accessibility, and recovery are release requirements rather than optional value scores.

## Primary Outcome

An authorized Documentation Steward signs in, selects a workspace, understands current state, submits one valid COS-WF-001 request, follows validation and review, and verifies the committed canonical document or a truthful recoverable failure.

## Priority Levels

| Level | Meaning | Release treatment |
| --- | --- | --- |
| P0 | Required to demonstrate the primary governed loop safely | Must pass before MVP acceptance |
| P1 | Required for usable pilot operation and bounded recovery | Complete before controlled pilot |
| P2 | Valuable after primary-loop evidence is stable | Deliver behind a flag or defer |
| Later | Outside MVP or unsupported by current architecture | Record in roadmap only |

## P0 — Foundation and Primary Loop

- Reproducible project scaffold, pinned dependencies, protected configuration, CI, and preview deployment.
- Supabase migrations, synthetic seeds, generated types, explicit grants, RLS, and cross-workspace tests.
- Sign-in, session refresh, sign-out, workspace selection, environment indicator, and capability loading.
- Application shell, error boundaries, accessibility foundations, safe telemetry, and route ownership.
- Overview with truthful documentation work and dependency health summaries.
- Documentation list and detail with canonical path, version, hash, commit SHA, owner, status, and freshness.
- COS-WF-001 intake, validation, consequence confirmation, idempotent submission, and durable receipt.
- Workflow run and step detail with authoritative refresh and sanitized audit timeline.
- Candidate review bound to exact content hash and approval expiry.
- Publication result with GitHub commit evidence and synchronization status.
- Safe denied, stale, dependency unavailable, degraded, failed, quarantined, and outcome-unknown states.

## P1 — Pilot Operability

- Work Queue for assigned reviews and approvals.
- Authorized refresh, reconcile, cancel, and escalation actions.
- Realtime awareness with cursor or version gap detection and API reconciliation.
- AI Workforce registry and execution detail required to investigate COS-WF-001.
- Automation registry and recovery panel for the supported workflow.
- System Health dependency detail, active incidents, freshness, and failure summaries.
- Notification acknowledgment and safe deep links.
- Responsive status views, complete screen-reader flow, performance budgets, monitoring, alerting, runbooks, rollback, and incident ownership.

## P2 — Controlled Enhancements

- Saved safe filters and personal display preferences.
- Additional authorized search and cross-module navigation.
- Expanded evaluation presentation and non-critical trend views.
- Additional health history and service-level visualization.
- Operator efficiency features supported by measured pilot friction.
- A second registered workflow only after COS-WF-001 reliability and governance evidence are accepted.

## Later or Explicitly Out of Scope

- Visual workflow builder.
- Arbitrary agent, prompt, or tool-permission editing.
- Direct database, secret, credential, or infrastructure administration.
- Generalized analytics, billing, revenue, media, or marketplace modules.
- Public publication, unrestricted repository browsing, and cross-workspace search.
- Native mobile clients, offline mutation, and broad third-party integration management.

## Dependency Order

1. Repository and test foundation.
2. Schema, fixtures, grants, and RLS.
3. Authentication, workspace context, and policy service.
4. Typed BFF queries and application shell.
5. Read-only Documentation, Automation, AI Workforce, and Health views.
6. Command ledger and COS-WF-001 start.
7. Run detail, review, publication evidence, and audit.
8. Recovery, realtime, operational hardening, and pilot release.

A later step cannot bypass an incomplete security or data dependency.

## Delivery Slices

| Slice | Demonstrated value | Exit evidence |
| --- | --- | --- |
| S1 Foundation | Application builds and connects to isolated local services | Reproducible build and clean database reset |
| S2 Secure entry | Authorized user enters one isolated workspace | Session and cross-workspace suites pass |
| S3 Read truth | User sees documents, work, runs, agents, and health | Data reconciles with authoritative fixtures |
| S4 Governed command | One request produces one durable workflow run | Replay and receipt evidence pass |
| S5 Accountable review | Exact candidate receives a valid decision | Version and expiry tests pass |
| S6 Durable result | User verifies commit and synchronization outcome | GitHub and database evidence reconcile |
| S7 Recovery and pilot | Supported failures are safe and diagnosable | Resilience, accessibility, security, and acceptance gates pass |

## Change Control

A proposed priority change states affected outcome, dependency, risk, scope, cost, owner, test impact, and displaced work. Product Owner approves value tradeoffs; Architecture, Security, Data, Quality, and Operations Owners retain veto authority over their mandatory gates. Priority labels do not authorize implementation outside approved boundaries.

## MVP Definition of Done

The MVP is complete when the P0 set and required P1 operational safeguards demonstrate the primary outcome in staging, all mandatory quality gates pass, known limitations and deferred items are explicit, rollback and incident procedures are usable, and accountable owners approve the evidence.

## Acceptance Criteria

- Every feature maps to the primary outcome or an explicit operational safeguard.
- P0 work contains all security, data isolation, accessibility, audit, and recovery requirements.
- Dependencies and delivery slices prevent premature command implementation.
- Deferred items cannot appear as functional or authorized.
- Priority changes are reviewed with displaced work and risk visible.
- MVP acceptance uses evidence, not percentage-complete reporting.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP Prototype Development Plan](MVP_Prototype_Development_Plan.md)
- [MVP Build Checklist](MVP_Build_Checklist.md)
- [MVP Frontend Implementation Plan](MVP_Frontend_Implementation_Plan.md)
- [MVP Backend Implementation Plan](MVP_Backend_Implementation_Plan.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.3 MVP feature prioritization |
