# Creator OS Foundry Control Center API Requirements

**Phase:** 2.6 — Control Center Implementation Architecture  
**Version:** 1.0  
**Document owner:** Application Owner, Architecture Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the API contracts required by the Control Center for safe queries, commands, approvals, workflow operations, search, realtime updates, and operational evidence.

## API Principles

- APIs expose governed domain and workflow contracts, not raw privileged database access.
- Every request binds identity, workspace, environment, operation, resource, and correlation.
- Schemas are typed, versioned, additive where possible, and reject unknown unsafe input.
- Lists, counts, search, and errors preserve object-level authorization.
- Mutations use idempotency and optimistic concurrency.
- Accepted requests do not imply completed work.
- Errors are minimal to clients and diagnosable through protected correlation.
- Secrets and sensitive data never appear in URLs.

## Request Envelope

| Field | Requirement |
| --- | --- |
| api_version | Requested contract version |
| request_id | Unique client request identifier |
| correlation_id | End-to-end operational trace |
| workspace_id | Explicit tenant boundary |
| environment | Explicit operating target |
| operation | Stable query or command name |
| resource_type and resource_id | Target when applicable |
| idempotency_key | Required for mutations |
| expected_version | Optimistic concurrency token for state changes |
| approval_reference | Required at gated boundaries |
| client_version | Application release identifier |
| locale and timezone | Presentation context only |

Identity and authentication strength come from the trusted session, not user-supplied identity fields.

## Core Query APIs

The first version must support workspace summary; dashboard health; work queue; workflow definitions, runs, and steps; agent registry, versions, evaluations, permissions, and runs; tools and integrations; canonical documents and findings; incidents and audit summaries; releases and gates; usage and cost; notifications; settings; capability decisions; and authorized search.

Responses include source version, observed time, freshness, completeness, classification, and pagination where applicable.

## Command APIs

Commands request workflow start, approval decision, review response, assignment change, workflow pause, resume, cancel, or reconcile, agent pause, release action, incident containment, notification acknowledgment, and settings update. High-impact commands route through approved workflows rather than executing broad mutations inline.

## Command Receipt

A mutation returns a durable receipt containing command ID, workflow or operation reference, accepted time, current state, target, idempotency key, correlation ID, expected completion, approval state, status URL or route, and evidence reference. Completion arrives through polling, authorized realtime, or refresh from durable state.

## Authorization

The backend authorizes each query and command using authenticated identity, workspace membership, role, assignment or ownership, environment, resource, classification, risk, and approval. The Data API or database role alone does not establish application permission.

## Validation

Validate content type, body size, schema, strings, identifiers, enumerations, dates, pagination, filters, file metadata, destinations, and command-specific invariants. Reject extra privileged fields. Normalize before policy and idempotency evaluation.

## Pagination, Filtering, and Search

Use stable cursor pagination for changing operational lists. Filters use allowlisted fields and operators. Sorting has deterministic tie-breakers. Search is authorization-aware and cannot reveal inaccessible names, snippets, counts, or facets. Exports require separate scope, limits, classification, and audit.

## Concurrency and Idempotency

Mutation idempotency is scoped by workspace, operation, target, and authenticated principal. Repeated requests return the recorded receipt. expected_version or equivalent prevents stale changes. Unknown downstream outcomes enter reconciliation instead of blind retry.

## Errors

| Category | Client behavior |
| --- | --- |
| validation_error | Correct input; no side effect |
| unauthenticated | Reauthenticate |
| forbidden | Explain insufficient authority without leaking resource existence |
| conflict | Refresh current version and reconsider action |
| approval_required | Open exact approval flow |
| rate_limited | Respect retry time |
| dependency_unavailable | Preserve request state and offer safe retry |
| outcome_unknown | Show reconciliation state; do not duplicate |
| internal_error | Show correlation ID and safe fallback |

## Realtime Requirements

Subscriptions are authenticated and scoped to workspace, environment, resource, and classification. Events have stable IDs, schema versions, timestamps, cursor or sequence, and entity references. Clients detect gaps and refresh authoritative APIs. Revoked memberships terminate subscriptions.

## Performance and Limits

Define latency objectives by query class, maximum page and payload sizes, timeout, concurrency, rate, export, file, and cost limits. Dashboard composition should avoid unbounded fan-out. Slow or partial sources return explicit completeness rather than false success.

## Security

Use secure transport, protected sessions, CSRF controls where applicable, restrictive cross-origin policy, safe caching, destination allowlists, webhook verification, output encoding, file scanning, and abuse controls. Server credentials remain outside clients. Sensitive responses must not be cached publicly or recorded in analytics.

## Observability and Audit

Record request and correlation IDs, actor, workspace, environment, operation, resource reference, API version, client version, policy decision, approval, latency, response class, idempotency outcome, downstream workflow, and cost. Redact secrets and minimize payload content.

## Versioning

Additive response fields are backward compatible. Breaking request, response, error, auth, or semantic changes require a new API version and migration window. Deprecation includes consumer inventory, telemetry, notice, replacement, and removal date.

## Testing

Test contract conformance, invalid and oversized input, auth expiry, every role and object boundary, cross-workspace IDs, search leakage, stale versions, duplicate and concurrent mutations, approval expiry, rate limits, dependency outage, unknown outcomes, event gaps, cache safety, injection, file handling, API version migration, and audit completeness.

## Acceptance Criteria

- APIs expose bounded contracts rather than privileged internals.
- Queries and counts respect object authorization.
- Mutations are idempotent and concurrency-safe.
- Durable receipts separate acceptance from completion.
- Realtime delivery reconciles with authoritative queries.
- Errors support recovery without leaking sensitive state.
- Security, performance, and audit requirements are testable.

## References

- [Application Architecture](Application_Architecture.md)
- [Application Security Model](Application_Security_Model.md)
- [Dashboard Data Model](Control_Center_Dashboard_Data_Model.md)
- [User Workspace Model](Control_Center_User_Workspace_Model.md)
- [Workflow Design Standards](../06_Automations/Workflow_Design_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.6 Control Center API requirements |
