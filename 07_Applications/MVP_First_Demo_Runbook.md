# Creator OS Foundry MVP First Demo Runbook

**Phase:** 4.3 — MVP Implementation Sprint Planning  
**Version:** 1.0  
**Document owner:** Product Owner, Quality Owner, and Project Operations Owner  
**Status:** Proposed  
**Risk class:** Moderate  
**Runbook ID:** DEMO-MVP-001

## Purpose

This runbook defines a repeatable Sprint 001 demonstration of the secure Control Center foundation.

## Demo Outcome

The demonstration proves that a clean, traceable build can authenticate a synthetic user, enter an authorized workspace, render the first Overview screen from the first backend service and migration, reject unauthorized access, and show truthful stale and dependency-failure states.

## Audience and Roles

The Presenter operates the demo. The Quality Owner verifies evidence. The Security or Data Owner observes authorization and migration results. The Product Owner accepts or rejects the sprint outcome. One person may hold multiple roles except where independent review is required.

## Environment

Use the approved local or isolated preview environment with synthetic fixtures. Record source SHA, release ID, runtime and package-manager versions, migration identity, generated-type digest, configuration-schema version, Overview contract version, browser, and test evidence. Never display secret values, tokens, connection strings, raw logs, or production data.

## Preconditions

- The repository working state and intended commit are confirmed.
- Dependencies install from the frozen lockfile.
- Local Supabase starts from repository configuration.
- A clean reset applies MIG-MVP-001 and approved seeds.
- Generated database types show no unexplained diff.
- Required static, unit, component, contract, RLS, integration, accessibility, end-to-end, secret, and build checks pass.
- Synthetic authorized, zero-workspace, expired-membership, and cross-workspace identities are ready.
- Health fixtures include fresh, stale, degraded, unavailable, and unknown states.
- The demo has a recovery owner and bounded timebox.

## Demonstration Script

1. Show the source commit, clean status, release identity, and environment label without exposing protected configuration.
2. Show that the application and local Supabase health checks are current.
3. Sign in as the authorized synthetic user.
4. Show the allowed workspace list and select the primary workspace.
5. Verify the shell displays identity, workspace, environment, release, and navigation.
6. Open Overview and identify observed time, validity, completeness, work, documents, workflow runs, registry coverage, and dependency health.
7. Open Documentation and System Registry placeholders or supported read views; clearly identify any unbuilt capability.
8. Switch to the second authorized workspace if provided and show that prior scoped data clears before new data loads.
9. Return to the primary workspace and trigger a bounded refresh.
10. Activate the stale-health fixture and verify the screen shows stale rather than healthy.
11. Activate the dependency-unavailable fixture and verify partial or unavailable rather than empty success.
12. Sign out and verify protected content is no longer available.
13. Attempt the protected workspace route with the unauthorized synthetic identity and verify non-enumerating denial.
14. Attempt a cross-workspace identifier and verify no name, count, or source detail leaks.
15. Restore the normal synthetic fixture and verify health returns only after current observation.
16. Present the test report, migration evidence, generated-type digest, safe telemetry correlation, known limitations, and sprint acceptance checklist.

## Expected Evidence

| Check | Expected result |
| --- | --- |
| Clean initialization | Install, reset, seed, types, tests, and build succeed |
| Authorized entry | Only allowed workspaces are listed |
| Overview contract | Values reconcile with deterministic fixtures |
| Scope switch | Prior caches and visible data clear |
| Stale source | Visible stale state and observed time |
| Failed source | Partial or unavailable, never empty healthy |
| Unauthorized identity | Non-enumerating denial |
| Cross-workspace ID | No protected resource existence disclosed |
| Sign out | Session ends and protected cache clears |
| Accessibility | Keyboard path, focus, names, and announcements pass |
| Telemetry | Correlation exists without secrets or content |

## Stop Conditions

Stop the demo for a secret or privileged key on screen, cross-workspace disclosure, false healthy or success state, untraceable build, failed migration or RLS test, unexpected remote target, production data, or an uncontrolled external side effect. Preserve safe evidence and follow incident or defect handling.

## Recovery

If a local dependency fails, record the first failure, restore from repository configuration, rerun the affected verification, and restart the demo from a defined checkpoint. Do not weaken authorization, skip failed checks, replace data manually, or use production credentials to continue.

## Acceptance Record

Record date, environment, source and artifact identity, migration and contract versions, presenter, observers, each expected result, defects and severity, limitations, cleanup, decisions, approvers, and next actions. The record contains no secret or sensitive fixture value.

## Acceptance Criteria

- The runbook executes without undocumented manual steps.
- Authorized and denied outcomes match the fixture matrix.
- Overview data, freshness, and completeness reconcile with the service and database.
- The demonstration includes at least one stale and one unavailable dependency state.
- No secret, production data, or uncontrolled side effect is shown.
- Evidence ties the result to the exact application, schema, contract, and commit versions.
- Product and required technical owners record an explicit acceptance decision.

## References

- [MVP Sprint 001 Plan](MVP_Sprint_001_Plan.md)
- [MVP First Frontend Screen Specification](MVP_First_Frontend_Screen_Specification.md)
- [MVP First Backend Service Specification](MVP_First_Backend_Service_Specification.md)
- [MVP First Supabase Migration](MVP_First_Supabase_Migration.md)
- [MVP End-to-End Test Scenario](MVP_End_to_End_Test_Scenario.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial DEMO-MVP-001 runbook |
