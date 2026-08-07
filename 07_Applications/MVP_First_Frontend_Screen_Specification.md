# Creator OS Foundry MVP First Frontend Screen Specification

**Phase:** 4.3 — MVP Implementation Sprint Planning  
**Version:** 1.0  
**Document owner:** Frontend Owner, Design Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate  
**Screen ID:** CC-SCR-001

## Purpose

This document specifies the first implemented frontend screen: the workspace-scoped Control Center Overview.

## User Outcome

An authenticated user can confirm identity, workspace, environment, freshness, current documentation activity, workflow activity, registry coverage, and dependency health, then navigate to clearly identified available or unavailable modules.

## Route and Access

The protected Overview route loads only after server-validated identity and authorized workspace selection. A user with no active membership receives a safe zero-workspace state. A user cannot select or infer an inaccessible workspace through a URL, cached response, count, or error.

## Screen Regions

| Region | Required content | Primary action |
| --- | --- | --- |
| Application header | Product, release, identity, environment | Sign out |
| Workspace context | Current workspace, classification, switcher | Select allowed workspace |
| Navigation | Capability-filtered module destinations | Navigate |
| Page heading | Overview title, purpose, observed time | Refresh |
| Work summary | Pending reviews and actionable work | Open unavailable placeholder or supported detail |
| Document summary | Total authorized documents, recent documents, validation condition | Open Documentation |
| Workflow summary | Active, waiting, failed and unknown runs | Open Automation |
| Registry summary | Authorized agent, tool and workflow coverage | Open System Registry |
| Health summary | Database, Auth, application and source freshness | Open System Health |
| Status and recovery | Partial, stale, unavailable, correlation and safe next action | Retry or refresh |

## View-Model Contract

The screen consumes OverviewViewModelV1 containing contract_version, workspace, environment, release, observed_at, valid_until, completeness, sources, allowed_actions, work_summary, document_summary, workflow_summary, registry_summary, health_summary, notices, and correlation_id.

Every summary includes state, count only when authorized, freshness, source status, and destination capability. The frontend must not derive counts or permissions from hidden records.

## States

- Loading uses semantic skeletons and preserves the page heading.
- Ready displays current complete data.
- Empty states identify a verified zero result.
- Partial states identify missing sources and unaffected data.
- Stale states show last observation and expired validity.
- Denied uses non-enumerating safe language.
- Unavailable identifies the failed dependency and owner class.
- Unexpected error preserves shell navigation and provides correlation.
- Refreshing keeps the prior view visibly marked as being revalidated.

## Interaction Rules

Workspace switching cancels requests, clears scoped cache and route state, closes subscriptions, then loads capabilities and Overview for the new workspace. Refresh is bounded and cannot create a request storm. Navigation to unbuilt modules shows an explicit roadmap or unavailable state, never mock data.

## Accessibility

The screen has one level-one heading, landmark regions, a keyboard-operable workspace selector, logical focus order, visible focus, text equivalents for status, polite live announcements, and meaningful link names. Summary cards form a semantic list. On small screens, workspace, environment, overall health, freshness, and urgent work appear first.

## Security and Privacy

No secret, raw token, private error, protected diagnostic, inaccessible identifier, or cross-workspace count reaches the screen. Authenticated responses are private. Client persistence stores only approved preferences and safe identifiers. Environment and classification are visible without exposing internal configuration.

## Telemetry

Record screen and contract version, workspace reference, environment, load result, source completeness, data age, refresh, navigation, performance, and correlation. Do not record document titles, user-entered content, credentials, or inaccessible names.

## Testing

Component tests cover every state, keyboard interaction, accessible names, focus, announcements, responsive reflow, long labels, zero and high counts, and safe errors. Integration and end-to-end tests cover session expiry, zero workspace, cross-workspace IDs, partial source, stale data, dependency outage, refresh, cache clearing, and sign-out.

## Acceptance Criteria

- The screen renders only after validated identity and workspace authorization.
- Displayed counts and summaries reconcile with the Overview service fixture.
- Workspace switching cannot retain prior data.
- All states are semantically distinct and accessible.
- Missing or failed sources cannot appear as empty or healthy.
- Core content remains usable on approved small and desktop viewports.
- The screen exposes no server-only configuration or protected diagnostics.

## References

- [MVP Control Center Build Specification](MVP_Control_Center_Build_Specification.md)
- [MVP Control Center Component Specification](MVP_Control_Center_Component_Specification.md)
- [Control Center Dashboard Data Model](Control_Center_Dashboard_Data_Model.md)
- [MVP Frontend Component Build Plan](MVP_Frontend_Component_Build_Plan.md)
- [UI Standards](UI_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial CC-SCR-001 Overview specification |
