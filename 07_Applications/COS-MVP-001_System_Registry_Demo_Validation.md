# COS-MVP-001 System Registry Demo Validation

**Phase:** 4.5 — MVP System Registry Implementation  
**Version:** 1.0  
**Document owner:** Quality Owner, Product Owner, and Release Owner  
**Status:** Proposed  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Validation ID:** COS-MVP-001-DEMO-v1

## Purpose

This document defines the repeatable demonstration and evidence required to validate the implemented System Registry Viewer.

## Validation Outcome

The demo proves that an immutable candidate can authenticate a synthetic user, authorize one workspace, show registry records derived from deterministic Supabase seeds and canonical provenance, reject unauthorized access, represent failure truthfully, and recover without weakening security.

## Environment and Identity

Use an approved local or isolated preview environment with synthetic fixtures only. Record repository commit, artifact digest, runtime and package versions, migration set, generated database type digest, seed digest, parser version, source checkpoint, contract versions, browser, environment, and release ID.

Demo identities include an authorized viewer, a second-workspace member, an expired member, and a user with no workspace. Never display tokens, service keys, connection strings, internal findings, private logs, or production data.

## Preconditions

- The repository is clean at the candidate commit.
- Dependencies install from the committed lockfile.
- Supabase starts and resets from repository configuration.
- Migrations, explicit grants, RLS, views, and seeds pass verification.
- Generated types have no unexplained difference.
- Static, database, unit, contract, component, integration, accessibility, security, resilience, and end-to-end tests pass.
- The candidate artifact is immutable and matches the recorded digest.
- The rollback or disablement path is rehearsed.
- All demo data is synthetic and approved.

## Demo Script

1. Show candidate identity, environment label, migration set, seed identity, contract versions, and current source checkpoint without exposing secrets.
2. Start from a clean reset and confirm expected seed digest.
3. Sign in as the authorized synthetic viewer.
4. Select the permitted workspace and open System Registry.
5. Confirm summary counts reconcile with the authorized manifest.
6. Filter each supported registry type and lifecycle state.
7. Open one agent, tool, workflow, application, module, and integration record.
8. Verify owner, risk, lifecycle, version, relationships, source path, commit, hash, freshness, and sync state.
9. Exercise stable pagination and return to a prior result without duplication.
10. Switch to the second authorized workspace and verify prior data clears before reload.
11. Sign in with the expired or unauthorized identity and verify non-enumerating denial.
12. Attempt a cross-workspace record identifier and verify no existence, count, or source detail leaks.
13. Activate the stale fixture and verify the observed and expired times are visible.
14. Activate partial and unavailable source fixtures and verify they do not appear as empty success.
15. Activate the provenance-conflict fixture and verify the ready state is blocked.
16. Attempt a direct browser write and verify it is denied.
17. Restore the valid fixture, refresh, and verify current complete data returns.
18. Sign out and confirm protected caches and visible records clear.
19. Present safe test, telemetry, accessibility, and provenance evidence.
20. Record the acceptance decision, defects, limitations, owners, and next action.

## Expected Results

| Check | Expected result |
| --- | --- |
| Authorized entry | Only the permitted workspace and records appear |
| Counts and filters | Values reconcile with the authorized seed manifest |
| Detail and relationships | Only authorized targets and fields appear |
| Provenance | Path, commit, and hash match the approved checkpoint |
| Pagination | Stable order with no duplicate or missing record |
| Workspace switch | Prior scoped records and caches clear |
| Unauthorized identity | Non-enumerating denial |
| Cross-workspace ID | No protected existence or metadata disclosed |
| Stale source | Visible stale state with observation and expiry |
| Partial source | Available records plus incomplete state |
| Unavailable source | Unavailable, never verified empty |
| Provenance conflict | Conflict state blocks trusted ready display |
| Direct write | Denied by grants, API, and RLS boundary |
| Sign-out | Session and protected client state clear |
| Accessibility | Keyboard, focus, semantics, announcements, and reflow pass |

## Evidence Package

The validation record includes exact source commit, artifact digest, migration and seed identities, generated-type digest, parser and source checkpoint, contract versions, browser and viewport matrix, test report, query and policy evidence, sanitized screenshots, safe correlation references, defects, known limitations, rollback result, approvers, and decision.

## Stop Conditions

Stop immediately for an unexpected production target, secret or privileged key on screen, cross-workspace disclosure, bypassed RLS, false empty or healthy state, provenance mismatch, untraceable artifact, failed blocking test, inaccessible keyboard path, or uncontrolled external side effect. Preserve safe evidence and follow incident handling.

## Recovery

Restore repository-defined configuration, rerun the clean reset and seeds, rebuild the immutable candidate, or replay the approved source checkpoint. Do not broaden grants, remove RLS, use production credentials, modify test results, or manually patch data to continue.

## Acceptance Decision

The result is accepted only when every required expected result passes, no critical or high defect remains, evidence is complete and traceable, limitations are accurate, cleanup succeeds, and Product, Application, Data, Security, Quality, and Release Owners record approval. Otherwise the result remains not accepted.

## Acceptance Criteria

- The demo runs from documented steps without an undisclosed manual action.
- Authorized records, counts, relationships, and provenance reconcile exactly.
- Unauthorized, expired, cross-workspace, and direct-write cases fail closed.
- Stale, partial, unavailable, and conflict states remain truthful.
- The primary path is accessible and usable at approved viewports.
- Evidence ties the result to the exact commit, schema, seed, source, contract, and artifact.
- Cleanup and rollback complete without production data or weakened controls.
- Required owners record an explicit evidence-backed decision.

## References

- [Phase 4.4 Execution Checklist](COS-MVP-001_System_Registry_Viewer_Execution_Checklist.md)
- [Phase 4.4 First Release Record](COS-MVP-001_System_Registry_Viewer_First_Release_Record.md)
- [System Registry Database Implementation](COS-MVP-001_System_Registry_Database_Implementation.md)
- [System Registry Frontend Implementation](COS-MVP-001_System_Registry_Frontend_Implementation.md)
- [System Registry Backend Implementation](COS-MVP-001_System_Registry_Backend_Implementation.md)
- [System Registry Integration Requirements](COS-MVP-001_System_Registry_Integration_Requirements.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 demo validation runbook |
