# Creator OS Foundry Migration Standards

**Phase:** 1.2 — Database Implementation Layer  
**Version:** 1.0  
**Document owner:** Data Owner and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how Creator OS Foundry database changes are proposed, generated, reviewed, tested, deployed, verified, recovered, and retired.

## Scope

These standards apply to schemas, tables, columns, constraints, indexes, views, functions, triggers, policies, grants, extensions, seed structures, and data transformations in every Supabase environment.

## Core Rules

- Every persistent database change must be represented by a committed migration.
- Create migration files with the installed Supabase CLI rather than inventing timestamps or filenames.
- Discover CLI syntax with help and pin the CLI version used by automation.
- Migrations are immutable after reaching a shared environment. Corrections use a new migration.
- Each migration must be deterministic, ordered, reviewable, and safe to rerun only where explicitly designed.
- Schema changes and application changes must be backward-compatible during rolling deployment.
- Destructive or irreversible operations require explicit approval, backup evidence, and a recovery plan.
- Production changes must not be authored directly in the dashboard SQL editor.
- Secrets and environment-specific identifiers must not appear in migrations.

## Migration Contents

A migration must have one coherent purpose and include, as applicable:

- schema and object creation;
- constraints and supporting indexes;
- explicit grants and revocations;
- RLS enablement and policies;
- comments for non-obvious security or lifecycle behavior;
- bounded data backfill or a reference to a separately controlled job;
- compatibility and cleanup steps;
- verification queries that do not expose sensitive data.

## Standard Workflow

1. Confirm the approved requirement, owner, risk, affected data, and rollback approach.
2. Check the installed Supabase CLI version and command help.
3. Create a named migration through the CLI.
4. Implement the smallest coherent change.
5. Apply it to a clean local database and to a representative existing schema.
6. Run schema, RLS, integration, performance, and security-advisor checks.
7. Review generated diff, locks, query plans, grants, policies, and data impact.
8. Deploy to preview or staging and verify application compatibility.
9. Obtain Data, Security, and Release approvals required by risk.
10. Apply to production through controlled automation.
11. Run post-deployment verification and record the result.
12. Schedule separately approved cleanup after the compatibility window.

## Naming and Organization

Migration names use a short verb and domain object, such as add_workspace_status or create_audit_events. Avoid issue numbers without meaning. Keep seed data separate from reference data required for constraints. Test fixtures must never enter production migrations.

## Compatibility Patterns

Use expand-and-contract for changes that could break running clients:

1. expand by adding nullable or compatible structures;
2. deploy code that writes both forms or tolerates both;
3. backfill in bounded batches with checkpoints;
4. validate completeness and performance;
5. switch reads to the new form;
6. stop legacy writes;
7. contract in a later approved migration.

Renames should use compatibility views or additive columns when zero-downtime operation is required.

## Transaction and Lock Safety

Prefer transactional data definition when supported. Large indexes should use an approved low-lock strategy. Adding a required column to a populated table must separate addition, backfill, validation, and enforcement when necessary. Review table rewrites, long-running locks, trigger cost, and policy-plan impact before production.

## Data Backfills

Backfills must be idempotent or checkpointed, bounded by batch size, observable, pausable, and safe under concurrent writes. Record expected row count, progress, errors, and reconciliation. Restricted data must not be exported for transformation without separate approval.

## RLS and Grant Changes

A migration creating an exposed table must enable RLS and define required policies before granting access. Test policies using anon and authenticated-equivalent sessions. Update policies require visibility plus using and with check behavior. Any privileged function must receive an explicit security review.

## Rollback and Recovery

Every migration requires a classified recovery strategy:

| Class | Strategy |
| --- | --- |
| Reversible | Tested down migration or compensating migration |
| Forward-fix | New migration restores safe behavior without reverting data |
| Restore-required | Approved backup restore and replay plan |
| Irreversible | Explicit owner acceptance and retained evidence before execution |

Rollback must account for application version compatibility and data written after deployment. Never execute an untested reverse migration in production.

## CI and Release Gates

The pipeline must rebuild from an empty database, apply all migrations, compare expected schema state, run tests, scan for unsafe grants and missing RLS, and verify migration order. Production release must require a clean migration list, successful staging evidence, backup readiness, monitoring, and named approvers.

## Emergency Changes

An emergency migration requires incident linkage, smallest viable scope, Security or Data approval appropriate to impact, immediate verification, and a follow-up review. The emergency path does not permit untracked dashboard changes or secret exposure.

## Acceptance Criteria

- A fresh database reaches the expected state from migrations alone.
- An existing supported database upgrades without loss or unauthorized access.
- Security advisors and RLS tests have no unresolved high-severity findings.
- Lock, performance, backup, rollback, and application compatibility are reviewed.
- Production execution and verification are auditable.
- Migration history matches the repository.

## References

- [Schema Specification](Schema_Specification.md)
- [Database Security Model](Database_Security_Model.md)
- [Supabase Local Development and Migrations](https://supabase.com/docs/guides/local-development/overview)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [PostgreSQL Transactional DDL](https://www.postgresql.org/docs/current/ddl.html)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.2 migration standards |
