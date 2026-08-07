# COS-MVP-001 System Registry Viewer Execution Checklist

**Phase:** 4.4 — MVP Build Execution  
**Version:** 1.0  
**Document owner:** Project Operations Owner and Release Owner  
**Status:** Proposed  
**Risk class:** High  
**Checklist ID:** COS-MVP-001-EXEC-v1

## Purpose

This checklist controls implementation, verification, preview, and release decision activities for COS-MVP-001.

## Scope and Readiness

- [ ] Approved build, seed, testing, and release documents are identified.
- [ ] Owners, reviewers, environment, risk, dependencies, and timebox are recorded.
- [ ] Source branch and commit are clean and traceable.
- [ ] In-scope and excluded behavior are confirmed.
- [ ] Data classification, threat considerations, and rollback path are reviewed.
- [ ] No production data or credentials are required.

## Repository and Build

- [ ] Runtime, package manager, Supabase CLI, and dependencies are pinned.
- [ ] Lockfile install, format, lint, type, unit, and build checks pass.
- [ ] Environment schema fails closed for missing or unsafe configuration.
- [ ] Client artifact scan finds no privileged key, token, or secret.
- [ ] Release and contract identifiers appear in safe diagnostics.

## Supabase and Seed

- [ ] Local or isolated preview target is confirmed before mutation.
- [ ] Clean database reset applies the approved migrations.
- [ ] Explicit Data API exposure, grants, and RLS are reviewed.
- [ ] Generated database types match the rebuilt schema.
- [ ] COS-MVP-001-SEED-v1 loads deterministically.
- [ ] Seed counts, relationships, order, hashes, and states match the manifest.
- [ ] Anonymous, expired, suspended, cross-workspace, and direct-write tests fail closed.
- [ ] Query plans and indexes meet the approved budget.

## Backend Execution

- [ ] Session validation uses the approved current server mechanism.
- [ ] Active membership and capability checks precede registry queries.
- [ ] Every query contains explicit authorized workspace and classification scope.
- [ ] List and detail contracts are versioned and bounded.
- [ ] Pagination is stable and filters are allowlisted.
- [ ] Partial, stale, unavailable, and conflict states remain truthful.
- [ ] Errors are non-enumerating and include safe correlation.
- [ ] Logs and metrics contain no secret or protected content.

## Frontend Execution

- [ ] Protected route, shell context, filters, list, and details are implemented.
- [ ] Loading, empty, ready, partial, stale, denied, unavailable, conflict, and error states render.
- [ ] Workspace switching cancels requests and clears prior scoped data.
- [ ] No hidden control suggests registry mutation.
- [ ] Keyboard, focus, landmarks, names, announcements, zoom, and responsive reflow pass.
- [ ] Authenticated responses and client caches follow privacy controls.

## Verification and Evidence

- [ ] All suites in COS-MVP-001-TEST-v1 pass.
- [ ] Displayed records and counts reconcile with authorized seed expectations.
- [ ] Provenance reconciles to source path, commit, and content hash.
- [ ] Performance and resilience thresholds pass.
- [ ] No unresolved critical or high defect remains.
- [ ] Evidence identifies commit, migration, schema types, seed, contract, artifact, and environment.
- [ ] Synthetic screenshots and demo evidence are reviewed for leakage.

## Preview and Release

- [ ] Immutable candidate artifact is built from the recorded commit.
- [ ] Preview configuration and database target are independently verified.
- [ ] Smoke, denial, stale, partial, conflict, accessibility, and recovery paths pass.
- [ ] Rollback or disablement procedure is rehearsed.
- [ ] Known limitations and residual risks are documented.
- [ ] Product, application, data, security, quality, and release owners record decisions.
- [ ] Release record is updated from Not Released only after all blocking evidence is attached.

## Stop Conditions

Stop immediately for a secret exposure, unexpected production target, cross-workspace disclosure, bypassed RLS, false healthy or empty state, provenance conflict, untraceable artifact, failed blocking test, or uncontrolled side effect. Preserve safe evidence and use the incident process. Do not weaken security or edit results to continue.

## Acceptance Criteria

- Every required item is complete or has an approved, non-blocking exception.
- Blocking security, provenance, accessibility, data, and quality gates pass.
- The candidate is reproducible from the exact repository state.
- The release decision and approvers are explicit and evidence-backed.
- Cleanup, rollback, limitations, and follow-up work are assigned.

## References

- [Build Implementation](COS-MVP-001_System_Registry_Viewer_Build_Implementation.md)
- [Data Seed Plan](COS-MVP-001_System_Registry_Viewer_Data_Seed_Plan.md)
- [Testing Plan](COS-MVP-001_System_Registry_Viewer_Testing_Plan.md)
- [First Release Record](COS-MVP-001_System_Registry_Viewer_First_Release_Record.md)
- [MVP First Demo Runbook](MVP_First_Demo_Runbook.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 execution checklist |
