# Creator OS Foundry MVP Application Specification

**Phase:** 2.7 — First Functional Prototype  
**Version:** 1.0  
**Document owner:** Product Owner and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the first functional Creator OS Foundry prototype: a narrow Control Center application that lets an authorized user enter a workspace, understand current work, inspect documentation operations, start COS-WF-001, and follow the run to a durable outcome.

## Product Outcome

The MVP proves that the governed architecture can support one coherent user loop:

1. authenticate;
2. select an authorized workspace and environment;
3. view truthful operational status;
4. submit a bounded document-creation request;
5. inspect validation and review state;
6. observe the committed result or actionable failure.

## Target Users

The first users are the Documentation Steward, Operator, Reviewer, and Read-only Observer. System, Security, and Release Owners may inspect evidence but receive only the controls needed for the prototype.

## In Scope

- secure session establishment;
- authorized workspace and environment selection;
- application shell and navigation;
- Overview dashboard with work, workflow, documentation, and health summaries;
- Work Queue for assigned reviews and approvals;
- Documentation list and detail views;
- COS-WF-001 request form;
- workflow run and step detail;
- validation findings and review decision;
- durable command receipts and status refresh;
- sanitized audit timeline;
- responsive, keyboard-accessible core flows;
- local, preview, and staging deployment.

## Out of Scope

- generalized workflow builder;
- direct database administration;
- credential creation or rotation;
- broad agent or tool permission editing;
- production release controls;
- billing and purchasing;
- public content publication;
- unrestricted search across workspaces;
- destructive data operations;
- complete analytics, media, revenue, or integration modules.

Out-of-scope routes may appear as clearly unavailable roadmap items but cannot imply working capability.

## MVP Modules

| Module | MVP capability |
| --- | --- |
| Shell | Session, workspace switcher, environment indicator, navigation, errors |
| Overview | Current workspace, pending work, active document runs, recent documents, dependency health |
| Work Queue | Assigned validation reviews and approval decisions |
| Documentation | List, filter, inspect canonical metadata, open GitHub source |
| Create Document | Submit the COS-WF-001 intake contract |
| Workflow Run | View states, steps, findings, approvals, receipt, and result |
| Audit | Sanitized events for the selected run |
| Settings | Personal display and notification preferences only |

## Functional Requirements

- The server returns only authorized workspaces, objects, counts, and commands.
- Workspace switching clears prior scoped data.
- The Overview states freshness and partial-source conditions.
- Document creation validates required owner, domain, classification, sources, and acceptance criteria.
- Duplicate submissions return the existing receipt.
- The UI distinguishes accepted, queued, running, waiting, review required, approved, publishing, synchronizing, succeeded, degraded, failed, cancelled, and quarantined.
- Review decisions bind the exact candidate version.
- Success links to the committed GitHub document and SHA.
- Failure states show owner, reason category, safe next step, and correlation ID.

## Non-Functional Requirements

The prototype targets WCAG 2.2 AA for supported flows, responsive layouts from small laptop to desktop with usable mobile status views, explicit performance budgets, secure sessions, least privilege, idempotent mutations, protected telemetry, and recoverable dependency failures.

## Data and Privacy

Use synthetic fixtures outside approved staging data. Secrets and raw credentials never enter clients, URLs, analytics, or logs. Client persistence is limited to safe preferences and short-lived session mechanisms. Document content is fetched only when authorized and necessary.

## Success Measures

- A first-time authorized user completes the primary flow without operator assistance.
- Every displayed object has correct workspace, state, owner, and freshness.
- Duplicate submission creates one governed workflow effect.
- Cross-workspace and unauthorized access tests fail closed.
- Core flows pass keyboard and screen-reader acceptance.
- A failed dependency produces a truthful recoverable state.
- The run detail reconstructs the operational outcome from durable evidence.

## Acceptance Criteria

- Product scope is limited to the documented loop.
- All MVP modules have explicit owners and contracts.
- Server authorization protects queries, counts, and commands.
- COS-WF-001 is usable end to end in staging.
- Accessibility, security, contract, resilience, and acceptance tests pass.
- Deployment, monitoring, rollback, and known limitations are documented.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [Control Center Implementation Plan](Control_Center_Implementation_Plan.md)
- [MVP Frontend Architecture](MVP_Frontend_Architecture.md)
- [MVP Backend Service Architecture](MVP_Backend_Service_Architecture.md)
- [MVP First User Flows](MVP_First_User_Flows.md)
- [MVP Prototype Development Plan](MVP_Prototype_Development_Plan.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.7 MVP application specification |
