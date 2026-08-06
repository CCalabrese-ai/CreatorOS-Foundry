# Creator OS Foundry Supabase Deployment Guide

**Phase:** 2.1 — Supabase Core Implementation  
**Version:** 1.0  
**Document owner:** Release Owner and Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the controlled deployment path for Supabase database changes from a verified repository state into preview, staging, and production.

## Preconditions

Before deployment, confirm the target environment, project reference, approved commit, migration list, CLI version, credentials, backup readiness, expected changes, application compatibility, monitoring, approvers, and recovery strategy. Commands must be confirmed using the installed Supabase CLI help.

## Deployment Rules

- Shared environments change only through committed migrations and approved configuration.
- Production SQL is not authored directly in the dashboard.
- Each deployment targets one explicit project and environment.
- Secret values remain in protected runtime configuration.
- The deployment identity has only required administrative scope.
- Migrations reaching a shared environment are immutable.
- A successful command is not proof of a successful release.

## Preview Deployment

1. Create or select the approved preview environment.
2. Apply all repository migrations from a clean baseline.
3. Load reference seeds and synthetic fixtures allowed for preview.
4. Run schema, contract, RLS, integration, and smoke tests.
5. Compare actual and expected migration history.
6. Destroy or expire the environment according to retention rules.

## Staging Deployment

1. Confirm staging configuration and sanitized data policy.
2. Capture current migration state and backup evidence.
3. Apply the release candidate migration set.
4. Run post-migration verification and security advisors.
5. Exercise application-equivalent identities and cross-workspace denial.
6. Run performance, integration, workflow, backup, and recovery checks.
7. Record the candidate commit, evidence, findings, and approvals.

## Production Deployment

1. Freeze the approved candidate and communication window.
2. Verify current production migration history and health.
3. Confirm backup or point-in-time recovery readiness.
4. Confirm monitoring, on-call ownership, and rollback or forward-fix criteria.
5. Apply migrations through the authorized pipeline.
6. Run non-destructive schema, grant, RLS, data, and application smoke checks.
7. Monitor locks, errors, latency, connections, storage, auth, and cost.
8. Reconcile expected row counts and domain events where applicable.
9. Complete the stabilization window or invoke recovery.
10. Record the deployment result and remaining obligations.

## Configuration Deployment

Supabase project configuration, Auth providers, redirect URLs, exposed schemas, storage, functions, secrets, network restrictions, and service settings require versioned documentation and environment-specific review. Repository-safe configuration contains references, never secret values.

## Rollback and Recovery

Each release classifies migrations as reversible, forward-fix, restore-required, or irreversible. Rollback considers data written after deployment and application compatibility. Unknown state stops further rollout until reconciled.

## Emergency Deployment

Emergency containment uses the smallest effective change, an incident ID, available owner approval, immediate verification, preserved evidence, and mandatory follow-up review. It does not permit untracked permanent changes.

## Deployment Record

Record environment, project identifier, commit, CLI version, migrations, start and finish, executor, approvers, backup reference, checks, findings, outcome, rollback actions, and monitoring window without recording secrets.

## Acceptance Criteria

- Every deployment maps to an approved repository commit.
- Preview and staging evidence precede production.
- Migration history and schema state are verified.
- RLS, grants, credentials, and exposed schemas are checked.
- Recovery readiness and ownership are confirmed.
- Deployment evidence supports audit and incident response.

## References

- [Core Implementation Plan](Supabase_Core_Implementation_Plan.md)
- [Environment Strategy](Supabase_Environment_Strategy.md)
- [Migration Execution Plan](Migration_Execution_Plan.md)
- [Migration Standards](Migration_Standards.md)
- [Release Management](../09_Tests/Release_Management.md)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development/overview)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.1 deployment guide |
