# COS-MVP-001 System Registry Viewer Build Implementation

**Phase:** 4.4 — MVP Build Execution  
**Version:** 1.0  
**Document owner:** Application Owner, Backend Owner, and Data Owner  
**Status:** Proposed  
**Risk class:** High  
**Application ID:** COS-MVP-001

## Purpose

This document defines the controlled build of the first Creator OS Foundry MVP capability: a read-only, workspace-scoped viewer for the System Registry.

## Build Outcome

An authenticated member can open the System Registry, see authorized agent, tool, workflow, application, module, and integration records, filter and inspect their provenance, and distinguish current, stale, partial, unavailable, and conflicting data. The viewer never edits canonical records.

## Scope

The build includes the protected route, registry summary and list, filters, record details, typed read service, Supabase read model, authorization, provenance, telemetry, accessible states, and release evidence. Registry mutation, bulk export, unrestricted search, production deployment, and agent execution are excluded.

## Implementation Architecture

The browser renders typed view models supplied by a backend-for-frontend service. The service validates the current session, resolves active workspace membership and capabilities, applies explicit workspace and classification predicates, and queries approved Supabase read models protected by row-level security. Canonical registry Markdown remains the governance source; synchronized rows include source path, source commit, content hash, observed time, and synchronization state.

## Frontend Build

Implement a protected System Registry route with:

- page title, workspace, environment, release, freshness, and completeness;
- type and lifecycle filters with a bounded text query;
- semantic record list showing canonical ID, name, type, status, owner, risk, and sync state;
- record detail showing approved metadata, relationships, provenance, and safe recovery guidance;
- loading, verified-empty, ready, partial, stale, denied, unavailable, conflict, and error states;
- keyboard operation, visible focus, semantic headings, live status announcements, responsive reflow, and non-color status indicators.

Changing workspace cancels active requests and clears all prior workspace data before loading the new scope.

## Backend Build

Expose a versioned read contract with list and detail operations. Inputs are allowlisted type, lifecycle, bounded query, opaque cursor, and page size. Identity, role, workspace authorization, counts, provenance, and sync status are never accepted from the browser.

Responses include contract version, workspace, records, pagination, completeness, source observations, observed_at, valid_until, allowed actions, correlation ID, and release ID. Errors use stable non-enumerating categories.

## Data and Security

Required fields are workspace_id when scoped, registry_type, canonical_id, display_name, description, owner_role, lifecycle_status, risk_class, source_path, source_commit_sha, content_hash, observed_at, sync_status, and version. Direct browser writes are denied. Anonymous access is denied. Service-role credentials never enter browser code. Authenticated responses use private cache controls. Logs omit content, tokens, secrets, and protected diagnostics.

## Build Sequence

1. Freeze view-model, query, authorization, and provenance contracts.
2. Apply and verify the approved registry read model and indexes.
3. Load deterministic synthetic seed records.
4. Implement session, membership, capability, and workspace guards.
5. Implement list and detail services with bounded queries.
6. Build route, filters, list, details, states, and accessibility behavior.
7. Add contract, RLS, integration, component, accessibility, and end-to-end tests.
8. Reconcile every displayed record to its seed and canonical source.
9. Build an immutable preview artifact and execute the release checklist.
10. Record the release decision without overstating unverified execution.

## Failure and Recovery

A failed source cannot become zero results. Partial or stale data remains visibly qualified. A provenance mismatch blocks release. Retries are limited to safe reads. Recovery restores repository-defined schema and seeds; authorization is never weakened to continue a demo.

## Observability

Record route and contract versions, workspace reference, filter class, result class, completeness, data age, latency, policy outcome, release ID, and correlation ID. Alert on cross-workspace denials, provenance conflicts, sustained stale data, and elevated failures.

## Acceptance Criteria

- Authorized users see only permitted registry records for the active workspace.
- List and detail values reconcile with deterministic seeds and canonical provenance.
- Direct writes, anonymous requests, expired memberships, and cross-workspace access fail closed.
- Every UI state is truthful, accessible, and covered by tests.
- Queries are bounded and meet the approved performance budget.
- No secret or protected content appears in responses, logs, or artifacts.
- Release evidence identifies the exact commit, schema, seed, contract, and artifact.

## References

- [MVP System Registry Implementation](MVP_System_Registry_Implementation.md)
- [MVP Control Center Build Specification](MVP_Control_Center_Build_Specification.md)
- [MVP First Backend Service Specification](MVP_First_Backend_Service_Specification.md)
- [MVP First Supabase Migration](MVP_First_Supabase_Migration.md)
- [Application Security Model](Application_Security_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 build implementation specification |
