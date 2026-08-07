# COS-MVP-001 System Registry Viewer Testing Plan

**Phase:** 4.4 — MVP Build Execution  
**Version:** 1.0  
**Document owner:** Quality Owner, Security Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High  
**Test plan ID:** COS-MVP-001-TEST-v1

## Purpose

This plan defines the evidence required to accept the first System Registry Viewer build.

## Quality Strategy

Testing follows the data from deterministic seed to protected read model, backend contract, frontend state, and user outcome. Authorization and provenance failures are release blockers. Results must identify source commit, schema and seed versions, contract version, artifact identity, environment, and execution time.

## Test Layers

- Static checks: formatting, lint, type safety, dependency and secret scanning.
- Unit tests: filters, state normalization, freshness, pagination, capability mapping, and safe errors.
- Database tests: constraints, indexes, grants, RLS policies, and representative query plans.
- Contract tests: list, detail, pagination, errors, completeness, provenance, and compatibility.
- Component tests: filters, record list, detail panel, all view states, long values, and responsive behavior.
- Integration tests: Auth, membership resolution, Supabase reads, source health, and telemetry correlation.
- End-to-end tests: secure entry, navigation, filtering, record inspection, workspace switch, denial, and recovery.
- Accessibility tests: keyboard path, focus order, landmarks, names, announcements, reflow, and contrast.
- Resilience and performance tests: timeouts, stale data, partial sources, bounded retry, page limits, and latency budgets.

## Core Scenario Matrix

| Scenario | Expected result |
| --- | --- |
| Authorized active member | Only allowed records render |
| No membership | Non-enumerating denied or zero-workspace state |
| Expired membership | Access fails closed |
| Cross-workspace identifier | No record existence or count leaks |
| Ready source | Complete, current results |
| Verified zero records | Explicit empty state |
| Partial source | Available rows plus visible partial state |
| Stale observation | Last observation and expiry shown |
| Source unavailable | Unavailable, never empty success |
| Provenance conflict | Conflict state and release blocker |
| Unsupported filter | Safe validation error |
| Pagination boundary | Stable order without duplicate or missing records |
| Direct browser write | Denied |
| Workspace switch | Prior data and cache clear before reload |

## Security Testing

Test anonymous, disabled, expired, suspended, forged workspace, stale claim, direct-table write, filter injection, oversized query, inaccessible detail ID, cache reuse, and log-redaction cases. Confirm explicit grants and RLS independently. No test passes by using service credentials in the browser.

## Accessibility Testing

Complete the primary path using a keyboard only. Verify one level-one heading, meaningful regions, visible focus, accessible filter names, semantic record lists, focus restoration after details close, polite result announcements, status text independent of color, 200 percent zoom, and approved narrow viewport reflow.

## Data and Provenance Reconciliation

For every seeded canonical ID, compare displayed type, name, lifecycle, owner, risk, source commit, hash, and sync state with the expected manifest. Counts must reconcile after authorization and filters. A mismatched or missing provenance field blocks acceptance.

## Performance and Reliability

Measure cold and warm list loads, detail retrieval, filter changes, and workspace switching against approved budgets. Confirm page-size caps, indexed query plans, bounded timeouts, safe retry limits, no request storms, and graceful partial results during one-source failure.

## Evidence Record

Store machine-readable and human-readable results with exact commit, artifact digest, migration set, generated-type digest, seed digest, contract version, browser matrix, failed-test details, known limitations, owner, and approval decision. Screenshots must contain only synthetic data.

## Exit Criteria

- Required static, unit, database, contract, component, integration, accessibility, end-to-end, resilience, and security suites pass.
- No open critical or high-severity defect remains.
- RLS, grant, cross-workspace, and direct-write tests fail closed as expected.
- Provenance and authorized counts reconcile exactly.
- Accessibility checks have no blocking issue.
- Performance budgets and stable pagination pass.
- Evidence is tied to an immutable candidate artifact and reviewed by required owners.

## References

- [System Registry Viewer Build Implementation](COS-MVP-001_System_Registry_Viewer_Build_Implementation.md)
- [System Registry Viewer Data Seed Plan](COS-MVP-001_System_Registry_Viewer_Data_Seed_Plan.md)
- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [Quality Assurance Framework](../09_Tests/Quality_Assurance_Framework.md)
- [MVP End-to-End Test Scenario](MVP_End_to_End_Test_Scenario.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 testing plan |
