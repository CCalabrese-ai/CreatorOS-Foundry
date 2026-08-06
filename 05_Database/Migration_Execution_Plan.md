# Creator OS Foundry Migration Execution Plan

**Phase:** 2.1 — Supabase Core Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the executable plan for creating, validating, ordering, deploying, and recovering the initial Creator OS Foundry Supabase migrations.

## Preparation

Confirm the installed CLI version and discover migration commands with help. Establish the approved schema baseline, project targets, owners, naming conventions, test database, and release evidence location.

## Migration Creation

Migration files must be created through the Supabase CLI with a short descriptive name. Each migration has one coherent purpose, explicit dependencies, reviewed SQL, and no secret or environment-specific values.

## Planned Sequence

1. Create internal, audit, and reporting schemas.
2. Enable reviewed extensions.
3. Create shared timestamp, versioning, and safe helper functions.
4. Create workspaces and identity linkage.
5. Create roles, memberships, policies, decisions, and approvals.
6. Create documentation, agent, tool, and workflow registries and versions.
7. Create tasks, runs, steps, artifacts, evaluations, and incidents.
8. Create integrations, credential references, usage, and notifications.
9. Create append-oriented audit events and protections.
10. Add constraints, uniqueness, foreign keys, and indexes.
11. Enable RLS and create per-operation policies.
12. Apply explicit object and schema grants.
13. Add approved views, storage policies, and scheduled capabilities.
14. Add required reference data through the seed path.

## Local Validation

For every migration or coherent series:

- rebuild a clean local database;
- upgrade a representative previous state;
- inspect migration history and schema diff;
- run constraints, RLS, cross-workspace, grants, functions, and storage tests;
- run database security and performance advisors;
- inspect locks, table rewrites, query plans, and transaction behavior;
- verify seed compatibility;
- exercise rollback, forward-fix, or restore procedure.

## Shared-Environment Execution

Preview validates clean rebuild and integration. Staging validates upgrade, application compatibility, performance, backup, and recovery. Production execution occurs only from the approved commit with explicit target and named authorization.

## RLS and Grants Gate

Any migration creating an exposed table must enable RLS and define required policies before granting API access. Update behavior includes a visible-row path plus using and with-check constraints. Target roles alone do not establish row ownership.

## Views and Functions Gate

Application-facing views use security-invoker behavior when supported. Privileged functions reside outside exposed schemas, set a safe search path, perform internal authorization, receive explicit execute grants, and require Security approval.

## Backfills

Backfills are separate, bounded, checkpointed, observable, pausable, and safe under concurrent writes. They record expected scope, progress, failures, and reconciliation. A schema migration should not hide an unbounded transformation.

## Recovery Classification

| Class | Required plan |
| --- | --- |
| Reversible | Tested compensating or reverse migration |
| Forward-fix | Prepared corrective migration |
| Restore-required | Backup restore and replay procedure |
| Irreversible | Explicit acceptance before execution |

## Completion Evidence

Record migration filenames, hashes, order, local reset result, upgrade result, schema comparison, RLS tests, advisor results, performance findings, staging deployment, recovery exercise, production approval, and final verification.

## Acceptance Criteria

- Migration order matches dependency order.
- Clean build and supported upgrade both pass.
- Exposed relations have grants and RLS before application access.
- Backfills and destructive changes are bounded and recoverable.
- Shared environments match repository history.
- Production execution has complete evidence and approvals.

## References

- [Migration Standards](Migration_Standards.md)
- [Schema Specification](Schema_Specification.md)
- [Database Security Model](Database_Security_Model.md)
- [Deployment Guide](Supabase_Deployment_Guide.md)
- [Supabase Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.1 migration execution plan |
