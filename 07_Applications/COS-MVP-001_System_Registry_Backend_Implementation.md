# COS-MVP-001 System Registry Backend Implementation

**Phase:** 4.5 — MVP System Registry Implementation  
**Version:** 1.0  
**Document owner:** Backend Owner, Security Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Implementation ID:** COS-MVP-001-BE-v1

## Purpose

This document defines the protected backend implementation that serves System Registry list and detail view models.

## Service Outcome

The service validates the current user, resolves one active workspace and its capabilities, applies resource authorization before query execution, returns bounded registry data with provenance and freshness, and records safe operational evidence.

## Service Boundary

The browser calls a versioned backend-for-frontend interface. The backend may use the signed-in user's Supabase context so RLS remains active, or a separately approved server path that repeats resource authorization and is covered by equivalent tests. Privileged database credentials must not be used as a shortcut for authorization.

## Operations

### List Registry Records

Accepts registry type, lifecycle, risk, bounded text query, opaque cursor, and page size. Returns authorized records, stable page information, permitted summary counts, completeness, source observations, freshness, allowed actions, release identity, and correlation.

### Get Registry Record Detail

Accepts a canonical record identifier within the already authorized workspace context. Returns the approved record, visible relationships, provenance, lifecycle, synchronization state, freshness, and safe source navigation. Inaccessible and nonexistent records share a non-enumerating outcome.

### Get Registry Health

Returns safe aggregate synchronization state and freshness only after authorization. Internal stack traces, quarantine payloads, repository credentials, and privileged diagnostic details remain protected.

## Processing Sequence

1. Establish request and correlation identifiers.
2. Enforce method, origin, body, query, page-size, and rate limits.
3. Validate the current server-side session.
4. Resolve active membership for the requested workspace.
5. resolve current capabilities from protected role data.
6. Authorize the operation, record classes, counts, relationships, and source links.
7. Normalize and validate allowlisted inputs.
8. Query bounded, indexed, workspace-scoped projections.
9. Calculate completeness and freshness from source observations.
10. Map results to a versioned view model.
11. Record policy outcome, latency, result class, source state, and release.
12. Return a private response with safe cache controls.

## Authorization Rules

Authentication alone never grants registry access. An active membership and registry.read capability are required. Classification rules may further restrict rows, relationships, counts, and source paths. User-editable metadata and stale client claims are not authorization sources. Workspace and record identifiers from the browser are treated as untrusted.

Viewing a tool or agent entry does not grant tool use, execution, or secret access. Direct writes are denied in Phase 4.5.

## Contracts and Errors

Contracts are explicitly versioned and validated at the service boundary. Error categories are unauthenticated, not_found_or_forbidden, validation_error, rate_limited, dependency_unavailable, stale_data, provenance_conflict, and internal_error. Safe responses contain a correlation reference and recovery guidance without revealing protected existence or configuration.

A source failure does not become an empty list. The service marks partial or unavailable and reports observed and valid times. A provenance conflict blocks a normal ready state.

## Data Access

Select explicit fields; never use unrestricted wildcard projections in protected services. Queries include authorized workspace and classification predicates even when RLS provides defense in depth. Cursor order is stable. Timeouts, row limits, relationship limits, and bounded retries prevent resource exhaustion.

Exposed security-invoker views or approved tables require explicit SELECT grants plus RLS. Internal sync and finding data are never queried from the browser.

## Caching

Cache keys include principal authorization context, workspace, contract version, filters, cursor, and source checkpoint. Authenticated responses are private. Cache entries expire no later than data validity and are purged on sign-out, membership change, policy change, workspace switch, source conflict, or release change.

## Telemetry

Record operation, contract version, policy decision, workspace reference, record class, result class, completeness, data age, latency, release ID, and correlation ID. Minimize or hash identifiers according to policy. Never log tokens, registry descriptions, private source paths, query text containing user input, secrets, SQL, or internal finding payloads.

## Resilience and Recovery

Independent sources may be composed after authorization. Retries apply only to safe transient reads with strict budgets. Circuit breaking prevents cascading dependency failure. Recovery restores the last valid synchronized checkpoint or replays an approved commit; the backend does not bypass RLS or broaden grants to recover.

## Backend Verification

Test valid and invalid sessions, active and expired memberships, suspended workspaces, capability changes, classification restrictions, cross-workspace IDs, inaccessible details, counts and facets, oversized queries, pagination stability, timeouts, stale and partial sources, provenance conflict, log redaction, cache isolation, response privacy, and contract compatibility.

## Acceptance Criteria

- Every operation validates current identity, workspace membership, capability, and resource scope.
- List, detail, relationships, counts, and source links preserve authorization.
- All queries are bounded, indexed, explicitly scoped, and mapped to typed contracts.
- Inaccessible and nonexistent records cannot be distinguished.
- Partial, stale, unavailable, and conflict states remain truthful.
- Cache and telemetry cannot leak cross-workspace or protected data.
- Direct writes and privileged browser access are impossible.
- Contract, RLS, integration, security, resilience, and performance tests pass.

## References

- [System Registry Database Implementation](COS-MVP-001_System_Registry_Database_Implementation.md)
- [System Registry Frontend Implementation](COS-MVP-001_System_Registry_Frontend_Implementation.md)
- [Control Center API Requirements](Control_Center_API_Requirements.md)
- [Application Security Model](Application_Security_Model.md)
- [Phase 4.4 Testing Plan](COS-MVP-001_System_Registry_Viewer_Testing_Plan.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 backend implementation specification |
