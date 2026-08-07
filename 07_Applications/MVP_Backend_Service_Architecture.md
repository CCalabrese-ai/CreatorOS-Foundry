# Creator OS Foundry MVP Backend Service Architecture

**Phase:** 2.7 — First Functional Prototype  
**Version:** 1.0  
**Document owner:** Application Owner, Backend Owner, and Architecture Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the trusted backend services required for the first Control Center prototype.

## Architecture

The MVP uses a backend-for-frontend that composes authorized data and calls bounded domain or workflow services. It does not expose privileged database clients to the browser or duplicate domain authority.

## Service Components

| Component | Responsibility |
| --- | --- |
| Session service | Validate identity, authentication strength, expiry, and revocation |
| Workspace service | List authorized workspaces and resolve active membership and capabilities |
| Control Center BFF | Compose UI-specific view models and enforce request contracts |
| Documentation query service | Return authorized document metadata, versions, findings, and source links |
| Workflow gateway | Start COS-WF-001 and query run and step state |
| Review and approval service | Route exact candidate reviews and record decisions |
| Command service | Enforce idempotency, expected version, receipts, and reconciliation |
| Realtime gateway | Publish authorized state-change notifications with gap recovery |
| Audit query service | Return sanitized events within workspace and classification scope |
| Telemetry service | Record protected traces, metrics, errors, cost, and correlation |
| Policy service | Evaluate resource and action authorization server-side |

## Request Path

1. Validate session and anti-forgery protections.
2. Parse typed request and reject unknown or oversized fields.
3. Resolve workspace, environment, membership, capabilities, and classification.
4. Authorize the resource and operation.
5. Execute a bounded query or command through the owning service.
6. Record correlation, policy decision, latency, and outcome.
7. Return a typed response, durable receipt, or safe error.

## Data Access

Services use least-privileged identities. Workspace-owned queries include explicit workspace filters in addition to row-level controls. Internal and audit schemas are accessed only by trusted roles. Application-facing services do not use privileged credentials to bypass broken authorization.

## MVP APIs

The service provides workspace list and selection; overview summary; work queue; document list and detail; document creation request; workflow run and step detail; review decision; audit timeline; notification acknowledgment; preference read and update; capability decision; and health endpoints.

## Command Semantics

Commands use an idempotency key scoped by principal, workspace, operation, and target. State-changing requests include expected_version when applicable. The command service records intent before side effects and returns the existing receipt on replay. Unknown downstream outcomes enter reconciliation.

## COS-WF-001 Integration

The backend validates the complete intake, authorizes the initiator and target path, creates the workflow request, and returns the run receipt. It never calls the Documentation Architect Agent directly from the browser request. Agent execution occurs inside the approved workflow and permission boundaries.

## Events and Realtime

Durable domain events drive realtime notifications. The gateway filters by identity, workspace, environment, resource, and classification. Each message includes event ID, schema version, occurred time, cursor, entity reference, and changed-state summary. Clients refresh APIs after gaps.

## Error Model

Errors use stable categories: validation_error, unauthenticated, forbidden, not_found_or_forbidden, conflict, approval_required, rate_limited, dependency_unavailable, outcome_unknown, and internal_error. Protected logs retain diagnostics using the correlation ID.

## Security

Server configuration stores secrets by protected reference. Apply secure cookies, origin and CSRF controls, rate and payload limits, destination allowlists, dependency timeouts, output encoding, Markdown sanitization, and audit. Sensitive responses use private cache controls.

## Observability

Trace requests across BFF, policy, workflow, database, GitHub, agent, and synchronization boundaries. Record API and service version, principal, workspace, operation, target reference, policy result, approval, idempotency result, latency, dependency status, response class, and cost without copying secrets or document bodies.

## Resilience

Use timeouts, circuit breakers, bulkheads, bounded safe retries, health checks, and degraded read models. A database, GitHub, agent, or realtime outage must not produce false completion. Critical read-only evidence may remain available with visible staleness when policy permits.

## Deployment

Backend artifacts are immutable and promoted through preview and staging. Environment configuration and credentials are separate. Database migrations precede code only when compatibility is verified. Canary deployment includes contract, security, load, and recovery evidence.

## Testing

Test schemas, session expiry, workspace and object authorization, RLS, cross-workspace IDs, duplicate commands, stale versions, approval changes, dependency timeouts, partial failure, unknown outcomes, event gaps, log redaction, rate limits, injection, and recovery.

## Acceptance Criteria

- Browser clients receive no privileged credentials.
- Every operation is authorized at the server and resource level.
- Services preserve workspace and environment context.
- Commands are idempotent and concurrency-safe.
- COS-WF-001 executes only through the workflow gateway.
- Errors and telemetry support safe recovery and investigation.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [Application Architecture](Application_Architecture.md)
- [Control Center API Requirements](Control_Center_API_Requirements.md)
- [Core Table Specifications](../05_Database/Supabase_Core_Table_Specifications.md)
- [COS-WF-001](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.7 MVP backend service architecture |
