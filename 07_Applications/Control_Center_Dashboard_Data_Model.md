# Creator OS Foundry Control Center Dashboard Data Model

**Phase:** 2.6 — Control Center Implementation Architecture  
**Version:** 1.0  
**Document owner:** Application Owner and Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the governed data model used to compose Control Center dashboards without creating a competing source of truth.

## Authority Model

Dashboard data is a read model derived from authoritative domain records. It must preserve source identifiers, version, workspace, environment, classification, freshness, and authorization. Client caches and realtime events are temporary projections and cannot override durable state.

## Dashboard Entities

| Entity | Purpose | Primary source |
| --- | --- | --- |
| workspace_summary | Workspace identity, status, risk, configuration version | workspaces and memberships |
| health_signal | Normalized service, module, workflow, or integration health | operational telemetry and incidents |
| work_item | Assigned task, handoff, review, approval, or escalation | tasks, approvals, review requests, handoffs |
| workflow_run_summary | Run state, version, owner, progress, cost, and failure | runs and run_steps |
| agent_run_summary | Agent version, task, tool use, limits, and outcome | agent execution records |
| approval_summary | Exact subject, approver role, expiry, evidence, and decision | approvals and reviews |
| incident_summary | Severity, scope, owner, timeline, status, and recovery | incidents |
| release_summary | Candidate, gates, environment, approvals, and deployment state | release records |
| usage_summary | Provider, service, quantity, cost, budget, and period | usage_records |
| registry_summary | Agent, tool, workflow, integration, or application status | canonical registries and synchronized metadata |
| document_summary | Document key, status, owner, version, freshness, and findings | documentation metadata |
| audit_summary | Sanitized consequential events and correlations | audit.events |
| notification_summary | Recipient, priority, status, source, and action | notifications |

## Common Fields

Every dashboard record must include stable ID, entity type, workspace ID, environment, owner, status, classification, source version or commit where relevant, updated_at, observed_at, freshness status, authorization scope, and navigation reference. Counts must carry the filter, cutoff time, and completeness state used to calculate them.

## Health Model

| Status | Meaning |
| --- | --- |
| Healthy | Required signals are current and within accepted thresholds |
| Degraded | Service operates with reduced quality or incomplete dependency |
| At Risk | Threshold or deadline indicates likely failure |
| Unavailable | Required capability cannot serve the request |
| Unknown | Evidence is missing, stale, conflicting, or inaccessible |

Unknown is never silently converted to Healthy. Overall health uses an explicit aggregation rule and retains contributing signals.

## Work Queue Model

A work item includes type, subject reference, title, assigned principal or role, priority, risk, due time, created time, waiting reason, required action, approval boundary, and source route. Items may be grouped but not merged when their authority or decision differs.

## Aggregation Rules

Aggregations are calculated server-side inside the user's authorized scope. Cross-workspace totals require explicit authority. A count cannot reveal inaccessible entities. Partial, delayed, sampled, or failed source queries must mark the result incomplete rather than returning a misleading zero.

## Freshness

Freshness states are Live, Current, Stale, Rebuilding, and Unknown. Each view defines its service-level freshness target. Realtime messages trigger refresh or local reconciliation but are not the sole source. The dashboard exposes last successful refresh and affected sources.

## Time and Currency

Timestamps are stored in UTC and rendered in the user's locale with timezone visible when decisions depend on time. Financial summaries use exact numeric values, ISO currency codes, source period, and conversion policy. Converted totals show rate source and time.

## Classification and Redaction

The highest source classification governs the read model. Backend composition removes unauthorized fields before delivery. Redacted records must not leak meaning through titles, counts, identifiers, errors, search suggestions, or telemetry.

## Caching

Cache keys include identity, workspace, environment, roles or capability version, classification scope, API version, query, and locale where material. Private responses use safe cache controls. Permission or membership changes invalidate affected caches. Client persistence of sensitive data requires explicit review.

## Realtime Events

Events include event ID, type, schema version, workspace, environment, entity reference, occurred_at, sequence or cursor, classification, and changed-field summary. Consumers detect gaps and perform authoritative refresh. Events never contain secrets.

## Empty, Partial, and Error States

An empty result states whether no records exist or the user lacks permission to know. Partial results identify unavailable sources and their last success. Errors use stable codes and correlation IDs without sensitive diagnostics.

## Retention

Dashboard read models follow source retention and deletion. Derived cache, search, and analytics records must expire or delete when the source requires it. Historical operational trends use approved aggregated data and cannot preserve deleted sensitive content accidentally.

## Acceptance Criteria

- Every displayed fact maps to an authoritative source.
- Counts and aggregations remain authorization-safe.
- Freshness, completeness, and unknown state are visible.
- Workspace and environment boundaries are preserved.
- Realtime gaps reconcile with durable records.
- Caches cannot survive permission or deletion changes incorrectly.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [Core Table Specifications](../05_Database/Supabase_Core_Table_Specifications.md)
- [Application Security Model](Application_Security_Model.md)
- [API Requirements](Control_Center_API_Requirements.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.6 dashboard data model |
