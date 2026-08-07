# Creator OS Foundry MVP System Health Module Component Specification

**Phase:** 3.2 — MVP Application Component Specifications  
**Version:** 1.0  
**Document owner:** Operations Owner, Security Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document specifies the MVP components that present system availability, dependency condition, data freshness, incidents, and safe operational diagnostics.

## Scope

The module covers an overall health summary, dependency cards, service-level indicators, active incidents, recent failures, freshness and synchronization condition, and authorized diagnostic detail. It does not expose secrets, raw infrastructure consoles, unrestricted logs, or direct production administration.

## Component Inventory

| Component | Responsibility | Key data | Primary action |
| --- | --- | --- | --- |
| Health Summary | State overall workspace and environment condition | Status, observed time, coverage, active incidents | Refresh or inspect |
| Dependency Grid | Show bounded provider and service health | Database, auth, GitHub, agent runtime, workflow, realtime | Open dependency |
| Service Indicator | Compare a signal with an approved objective | Metric, window, target, actual, confidence | Inspect history |
| Freshness Panel | Identify stale, delayed, or incomplete sources | Source, last success, lag, expected interval | Refresh |
| Incident Banner | Keep active impact visible | Incident ID, severity, scope, owner, status | Open incident |
| Incident Detail | Present containment and recovery evidence | Timeline, affected services, actions, communications | Escalate if authorized |
| Failure Summary | Group actionable recent failures | Category, owner, count, oldest, trend | Open filtered runs |
| Diagnostic Detail | Provide sanitized evidence | Correlation, check result, dependency status | Copy safe reference |

## Health Semantics

Overall health uses explicit states: healthy, degraded, impaired, unavailable, maintenance, unknown, and stale. Unknown and stale are never converted to healthy. Aggregation follows documented precedence and shows coverage so one missing dependency cannot disappear inside a favorable summary.

## Data Contracts

Each observation includes stable check ID, workspace and environment, component, state, observed time, valid-until time, source, coverage, latency or metric when approved, and correlation reference. Incident summaries include severity, impact, owner, opened time, current status, affected components, and next update.

## Authorization

Users see health only for authorized workspaces and environments. Detailed diagnostics, security findings, sensitive dependency names, and incident actions require separate capabilities. Public or broadly visible status must use an intentionally reduced contract.

## Refresh and Realtime

The module performs an authoritative initial query and periodic bounded refresh. Realtime events may prompt refresh but do not replace durable observations. The UI displays the last successful observation and detects event gaps, clock skew, expired data, and partial sources.

## Incident Experience

An active incident remains visible across relevant routes. Detail prioritizes impact, current containment, owner, timeline, next update, and permitted recovery links. Acknowledge, escalate, or resolve commands require current-state validation and durable receipts; the MVP may keep these actions read-only if operational services are not implemented.

## Security and Privacy

Health endpoints reveal no credentials, connection strings, internal stack traces, customer content, database queries, prompt content, or cross-workspace identifiers. Error categories and correlation IDs replace raw exceptions. Rate limits and anti-enumeration controls apply to health detail.

## Accessibility and Responsive Behavior

Health is communicated with text, icons, and accessible labels, never color alone. Live changes are announced politely. Charts, if used, provide tabular alternatives. On small screens, overall state, impact, freshness, incident owner, and next action precede supporting metrics.

## Failure and Recovery

When the health service fails, the module states that system health is unknown and retains clearly expired last-known observations only when policy permits. A manual refresh is bounded and cannot create a request storm. Diagnostic links preserve scope and contain no secrets.

## Telemetry

Record health-view latency, data age, missing-source count, refresh result, incident navigation, and authorized command outcome. Avoid recording raw diagnostics or user-visible incident content in analytics.

## Testing Requirements

Test stale and missing observations, conflicting dependency states, active incidents, unauthorized detail, rate limiting, realtime gaps, last-known data, clock skew, health-service outage, safe errors, keyboard navigation, screen readers, reduced motion, and responsive ordering.

## Acceptance Criteria

- Overall health truthfully reflects dependency state, coverage, and freshness.
- Unknown, stale, degraded, and unavailable remain distinguishable.
- Incident impact, owner, status, and next update are visible.
- Detailed diagnostics respect role, workspace, environment, and classification.
- Health-service failure does not present a false healthy state.
- Core views and actions meet accessibility, security, and recovery standards.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP Backend Service Architecture](MVP_Backend_Service_Architecture.md)
- [Incident Response](../09_Tests/Incident_Response.md)
- [Application Security Model](Application_Security_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.2 System Health module component specification |
