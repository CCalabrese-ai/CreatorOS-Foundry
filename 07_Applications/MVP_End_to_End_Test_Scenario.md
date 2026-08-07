# Creator OS Foundry MVP End-to-End Test Scenario

**Phase:** 4.2 — MVP Core Build Specification  
**Version:** 1.0  
**Document owner:** Quality Owner, Application Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High  
**Scenario ID:** E2E-MVP-001

## Purpose

This document defines the primary end-to-end scenario that proves the MVP core build from secure entry through canonical document publication and registry reconciliation.

## Scenario Outcome

One authorized Documentation Steward submits one document request in an isolated staging workspace, completes the governed review, and verifies matching GitHub and Supabase evidence. The same scenario proves denial, duplicate prevention, dependency failure, and recovery.

## Environment and Evidence

Run against the approved staging candidate using the immutable release artifact, current migrations, sanitized deterministic fixtures, a bounded test repository path, registered COS-WF-001 and agent versions, test-only integration credentials, monitoring, and cleanup ownership.

Record release ID, source SHA, artifact digest, migration range, configuration-schema version, contract versions, fixture version, workflow and agent versions, browser, start and end time, receipts, correlation IDs, GitHub commit, content hash, synchronization checkpoint, and result. Record no secret values.

## Actors

| Actor | Capability |
| --- | --- |
| Documentation Steward | View documents and start COS-WF-001 |
| Reviewer | Review the exact candidate |
| Read-only Observer | View authorized final evidence |
| Unauthorized user | No membership in the target workspace |
| Operator | Inspect health, audit, and reconciliation |

Use separate test identities; one actor does not approve its own high-risk work.

## Preconditions

- Required readiness gates for the candidate are green.
- Staging Auth, database, workflow, agent, GitHub, realtime, and telemetry dependencies report current health.
- Synthetic workspace, membership, canonical fixtures, and denial records exist.
- The intended document key and target path are unused.
- Cleanup and rollback procedures are ready.
- Time, quota, cost, and external-write limits are configured.

## Primary Scenario

1. Sign in as the Documentation Steward and verify identity, environment, and allowed workspace.
2. Select the staging workspace and confirm no data from the prior scope remains.
3. Open Overview and verify freshness, completeness, registry summary, document summary, active work, and dependency health.
4. Open System Registry and verify the approved workflow, Documentation Architect Agent, GitHub tool, Supabase tool, owners, versions, status, risk, and canonical provenance.
5. Open Document Registry and verify authorized list, filters, source evidence, and no inaccessible records or counts.
6. Start Create Document and enter the deterministic intake fixture.
7. Review confirmation for workspace, environment, target path, classification, risk, approval, side effect, and recovery.
8. Submit once and capture the durable command and workflow receipt.
9. Repeat the identical submission and verify the same receipt and one workflow run.
10. Follow run and step state through validation and review required.
11. Sign in as the assigned Reviewer and open the exact candidate evidence.
12. Attempt a stale or altered candidate decision and verify rejection.
13. Approve the unchanged candidate with required rationale.
14. Follow publication and synchronization to a durable terminal state.
15. Verify GitHub path, commit SHA, and content hash.
16. Verify the Document Registry version contains the same SHA and hash.
17. Verify System Registry, workflow run, audit timeline, health, and notifications reconcile.
18. Sign in as the Read-only Observer and verify permitted evidence with no mutation controls.
19. Sign in as the unauthorized user and verify non-enumerating denial for workspace, document, run, search, counts, realtime, and source link.
20. Execute approved cleanup or retain the fixture according to the test record.

## Failure and Recovery Variants

### GitHub Outcome Unknown

Introduce a controlled timeout after dispatch. Verify the run enters outcome unknown, the UI prevents retry, the operator reconciles repository evidence, and exactly one commit is recorded.

### Supabase Synchronization Failure

Allow publication, then interrupt synchronization. Verify GitHub remains canonical, the UI shows degraded rather than failed publication, retry uses the ingestion ledger, and the registry converges to the same SHA and hash.

### Realtime Gap

Disconnect the client, advance the run, reconnect, detect the gap, refresh authoritative APIs, and show the durable current state without duplicate events.

### Authorization Change

Remove the user's membership during the run. New reads and commands fail closed, subscriptions stop, cached content clears, and authorized workflow containment continues according to policy.

### Invalid Generated Content

Inject a secret-like or malicious Markdown fixture. Validation blocks publication, places the candidate in quarantine, preserves evidence, and renders findings safely.

## Assertions

- One intake creates one command, one workflow run, and at most one publication effect.
- Every service preserves identity, workspace, environment, contract version, and correlation.
- Review binds the exact candidate hash and expires or invalidates safely.
- GitHub and Document Registry evidence reconcile.
- System Registry records preserve canonical provenance and do not grant permission.
- Unauthorized users learn no protected names, counts, snippets, events, or source locations.
- Unknown, degraded, failed, and quarantined states remain distinct.
- Audit evidence reconstructs the outcome without exposing secrets.

## Accessibility and Performance

Run the primary path by keyboard and with the approved screen-reader checks. Validate focus, labels, announcements, error association, status semantics, reduced motion, and responsive reflow. Measure authenticated load, registry queries, command acceptance, status refresh, and terminal reconciliation against approved budgets.

## Exit Criteria

The scenario passes only when all primary assertions and mandatory variants pass, no blocking security or data finding remains, evidence is tied to the candidate versions, cleanup is complete, and Product, Security, Data, Automation, Documentation, Quality, and Release Owners accept the result.

## References

- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [MVP Launch Readiness Criteria](MVP_Launch_Readiness_Criteria.md)
- [MVP First Feature Implementation](MVP_First_Feature_Implementation.md)
- [MVP System Registry Implementation](MVP_System_Registry_Implementation.md)
- [MVP Document Registry Implementation](MVP_Document_Registry_Implementation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial E2E-MVP-001 Phase 4.2 scenario |
