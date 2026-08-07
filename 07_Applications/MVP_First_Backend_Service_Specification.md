# Creator OS Foundry MVP First Backend Service Specification

**Phase:** 4.3 — MVP Implementation Sprint Planning  
**Version:** 1.0  
**Document owner:** Backend Owner, Security Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High  
**Service ID:** CC-SVC-001

## Purpose

This document specifies the first backend service: the authorized workspace Overview query service.

## Service Outcome

CC-SVC-001 validates identity, resolves one authorized workspace and environment, composes truthful summary data from approved Supabase read models, and returns OverviewViewModelV1 with freshness, completeness, capabilities, and safe errors.

## Interface

The service exposes one versioned read operation through the Control Center backend-for-frontend. The route uses a stable workspace identifier in the authorized request context and accepts only allowlisted optional presentation parameters. Identity, roles, permissions, source completeness, and counts are never accepted from the browser.

## Request Context

| Field | Source | Requirement |
| --- | --- | --- |
| request_id | Client or server generated | Unique per attempt |
| correlation_id | Trusted request boundary | End-to-end trace |
| principal | Validated server session | Required |
| workspace_id | Route or selected context | Must be authorized |
| environment | Server configuration | Must match deployment |
| api_version | Request contract | Supported version |
| locale and timezone | Presentation request | Never authorization input |
| release_id | Server build | Response evidence |

## Response Contract

OverviewViewModelV1 contains workspace identity and safe label, environment, release ID, observed_at, valid_until, completeness, source observations, allowed navigation actions, work summary, document summary, workflow summary, registry summary, health summary, notices, and correlation ID.

Each summary states value, state, source, observed time, and freshness. A failed source yields partial or unavailable, not zero.

## Processing Sequence

1. Establish correlation and enforce method, origin, rate, and request limits.
2. Validate the current identity using the approved server Auth method.
3. Resolve active membership for the requested workspace.
4. Resolve current capabilities from protected role and policy data.
5. Authorize Overview and each included summary class.
6. Run bounded workspace-scoped queries with explicit predicates.
7. Apply per-source timeouts and collect completeness.
8. Normalize statuses, timestamps, and safe notices.
9. Record latency, policy result, source state, and response class.
10. Return the typed private response with safe cache controls.

## Data Sources

The first service reads workspaces, memberships, roles, documents, workflow_runs or approved equivalent, system registry records, and health observations. It selects only fields necessary for the Overview. It does not read document bodies, prompts, secrets, credential references, or raw audit payloads.

## Authorization

Authentication alone is insufficient. The service requires an active workspace membership and resource-level permission. Counts and source links are authorized separately. Cross-workspace IDs and inaccessible objects return a non-enumerating response. User-editable metadata is not an authorization source.

## Freshness and Partial Results

Every source has an observed time and validity window. The service calculates completeness from returned authorized sources. One dependency failure may produce a partial response only when remaining data is safe and useful. The overall state cannot be healthy when required sources are unknown or stale.

## Performance and Resilience

Queries are bounded, indexed, paginated where applicable, and executed with timeouts. Independent summaries may run concurrently after authorization. Retry only safe transient reads with a strict budget. Circuit breaking and source-level degradation prevent cascading failure. The service never falls back to unscoped data.

## Errors

Use stable categories: unauthenticated, not_found_or_forbidden, validation_error, rate_limited, dependency_unavailable, stale_data, and internal_error. Client errors contain safe next steps and correlation; protected logs hold diagnostics without content or secrets.

## Telemetry

Record service and contract version, principal reference, workspace reference, policy result, source states, latency, result class, release, and correlation. Hash or minimize identifiers according to policy. Do not log tokens, SQL, document content, or private diagnostic payloads.

## Testing

Test valid membership, no membership, expired membership, suspended workspace, cross-workspace ID, stale claims, authorized and unauthorized counts, empty and partial data, dependency timeout, query error, health disagreement, rate limit, cache isolation, log redaction, performance budget, and schema compatibility.

## Acceptance Criteria

- Only validated, active members receive an Overview for a workspace.
- All queries contain explicit workspace scope and operate under tested RLS.
- Counts and source details exclude unauthorized records.
- Freshness and completeness reflect every required source truthfully.
- Partial and unavailable states do not become empty success.
- Errors are non-enumerating and diagnosable through correlation.
- Contract, integration, RLS, resilience, and load tests pass.

## References

- [MVP Backend Service Build Plan](MVP_Backend_Service_Build_Plan.md)
- [Control Center API Requirements](Control_Center_API_Requirements.md)
- [Control Center Dashboard Data Model](Control_Center_Dashboard_Data_Model.md)
- [MVP Authentication and Authorization Implementation](MVP_Authentication_Authorization_Implementation.md)
- [MVP First Frontend Screen Specification](MVP_First_Frontend_Screen_Specification.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial CC-SVC-001 Overview service specification |
