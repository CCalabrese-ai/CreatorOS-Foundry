# COS-MVP-001 System Registry Frontend Implementation

**Phase:** 4.5 — MVP System Registry Implementation  
**Version:** 1.0  
**Document owner:** Frontend Owner, Design Owner, and Accessibility Owner  
**Status:** Proposed  
**Risk class:** Moderate  
**Application ID:** COS-MVP-001  
**Implementation ID:** COS-MVP-001-FE-v1

## Purpose

This document defines the frontend implementation for the read-only System Registry Viewer.

## User Outcome

An authenticated user can understand registry coverage, filter authorized records, inspect a record and its relationships, verify provenance and freshness, and recover from partial or unavailable data without mistaking missing information for a verified zero result.

## Route and Component Structure

The protected route is owned by the Control Center shell and uses the active workspace context. The implementation contains:

- SystemRegistryPage for orchestration and page status;
- RegistrySummary for authorized counts and completeness;
- RegistryFilters for type, lifecycle, risk, and bounded text query;
- RegistryRecordList and RegistryRecordRow for semantic results;
- RegistryRecordDetail for approved metadata and relationships;
- ProvenancePanel for source path, commit, hash, observation, and sync state;
- RegistryStateNotice for empty, partial, stale, unavailable, conflict, and denied states;
- PaginationControls using opaque cursors;
- RegistryErrorBoundary for safe unexpected failures.

Components consume typed view models and do not infer permissions, lifecycle, provenance, or counts from hidden data.

## Route Behavior

The route loads only after server-validated identity, active workspace resolution, and capability discovery. Initial loading preserves the page heading. URL parameters are limited to allowlisted filters and a cursor. Invalid parameters are normalized or produce a safe validation state. Workspace switching cancels requests, clears scoped state and cached records, closes subscriptions, and reloads capabilities before data.

## View Model

RegistryListViewModelV1 includes contract_version, workspace, environment, release_id, query, records, page_info, authorized_summary, completeness, source_observations, allowed_actions, observed_at, valid_until, notices, and correlation_id.

RegistryDetailViewModelV1 includes the authorized record, safe relationships, provenance, lifecycle, freshness, synchronization state, allowed_actions, and correlation_id. The frontend never receives service keys, raw policy data, internal findings, or inaccessible targets.

## Interaction Model

Filters submit a bounded request and update the URL without storing protected data. Results keep a stable sort. Selecting a record opens a route-addressable detail view or panel with predictable focus. Closing details restores focus to the triggering row. Refresh revalidates current data with a visible state and cannot generate a request storm.

No create, edit, delete, activate, execute, or permission-granting control is present in v1. Unavailable future actions are not represented as functional.

## Required States

- Loading: semantic placeholders and current context.
- Ready: current complete data.
- Verified empty: authorized query completed with zero rows.
- Partial: usable results with named unavailable source classes.
- Stale: prior results with observation and expiry.
- Unavailable: no safe result, dependency and next action identified.
- Conflict: provenance mismatch blocks normal trust.
- Denied: non-enumerating access outcome.
- Error: safe message and correlation reference.
- Refreshing: prior data marked as being revalidated.

## Accessibility

Use one level-one heading, landmark regions, native controls, meaningful names, visible focus, logical tab order, status text independent of color, polite result announcements, and a semantic list or table with proper headers. Filters must be keyboard operable. Detail focus must be trapped only when implemented as a modal and restored on close. At 200 percent zoom and approved small widths, context, freshness, urgent state, filters, and primary record identity remain usable.

## Security and Privacy

The frontend uses the approved publishable key or backend session boundary and never a secret or service-role key. Authenticated responses are private. Client persistence is limited to safe presentation preferences; record payloads are cleared on sign-out and workspace change. Error messages, telemetry, and rendered source links cannot disclose unauthorized record existence.

## Performance

List requests are debounced only where approved, cancellable, cursor based, and capped. The first useful state should render within the approved budget using skeletons that do not imply data. Large relationships are paginated or summarized. Prefetching occurs only after authorization and never crosses workspace cache keys.

## Frontend Verification

Component tests cover every state, filter, pagination boundary, long value, empty set, relationship list, safe source link, and focus transition. Integration tests cover session expiry, workspace switch, stale data, partial source, conflict, denial, and recovery. Automated and manual accessibility checks cover the full primary path.

## Acceptance Criteria

- The route renders only for an authorized active workspace context.
- All displayed fields originate from the typed backend contract.
- Filters, pagination, details, refresh, and workspace switching behave deterministically.
- Prior workspace data cannot remain visible or cached after a switch or sign-out.
- Empty, partial, stale, unavailable, conflict, denied, and error states are distinct and truthful.
- The primary path is keyboard operable and meets approved accessibility checks.
- No mutation or execution capability is implied.
- No privileged configuration or protected diagnostic reaches the browser.

## References

- [Phase 4.4 Build Implementation](COS-MVP-001_System_Registry_Viewer_Build_Implementation.md)
- [MVP Control Center Component Specification](MVP_Control_Center_Component_Specification.md)
- [UI Standards](UI_Standards.md)
- [System Registry Backend Implementation](COS-MVP-001_System_Registry_Backend_Implementation.md)
- [System Registry Demo Validation](COS-MVP-001_System_Registry_Demo_Validation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 frontend implementation specification |
