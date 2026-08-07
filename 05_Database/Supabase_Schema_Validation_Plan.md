# Creator OS Foundry Supabase Schema Validation Plan

**Phase:** 2.3 — Supabase Core Schema Implementation  
**Version:** 1.0  
**Document owner:** QA Owner, Data Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This plan defines the evidence required to accept the Creator OS Foundry core Supabase schema in local, staging, and production environments.

## Validation Objectives

Validation must prove reproducible migration order, correct table contracts, constraint integrity, workspace isolation, least privilege, seed safety, query performance, operational observability, and recoverability. Passing functional tests without security and recovery evidence is insufficient.

## Test Layers

| Layer | Required evidence |
| --- | --- |
| Static review | SQL linting, schema qualification, migration ordering, prohibited-pattern scan |
| Clean build | Fresh local reset applies all migrations and approved seeds |
| Upgrade | Representative prior schema upgrades to the target state |
| Contract | Tables, columns, types, defaults, constraints, indexes, comments, and grants match specification |
| Referential | Foreign-key, uniqueness, check, and delete-behavior tests |
| RLS | Allowed and denied operations for anon, authenticated roles, workspace members, non-members, and trusted services |
| Workflow | Documentation, approval, run, audit, and synchronization invariants |
| Seed | Counts, stable keys, determinism, environment eligibility, and secret scan |
| Performance | Representative query plans, policy predicates, indexes, locks, and migration duration |
| Security | Database advisors, privileged-function review, exposed-schema review, secret and PII scan |
| Recovery | Interrupted migration, forward-fix, restore exercise, replay, and reconciliation |
| Observability | Migration logs, audit events, alerts, and operator queries |

## Clean-Build Procedure

1. Confirm the pinned CLI and local runtime versions using current command help.
2. Start from an empty local database.
3. Apply all migrations in repository order.
4. Execute the approved local seed set.
5. Run schema-contract and RLS tests.
6. Generate the schema inventory and compare it with the expected manifest.
7. Repeat the reset and compare logical object and reference-data checksums.

The procedure is successful only when both runs produce the same schema and controlled data state.

## RLS Test Matrix

For every exposed table, test select, insert, update, and delete separately as applicable. Cases include unauthenticated access, authenticated non-member, member of another workspace, expired member, authorized reader, author, reviewer, workspace administrator, and trusted service. Update tests must verify both row visibility and post-update ownership checks. Attempts to change workspace_id or owner fields must fail.

## Contract Assertions

Assertions verify primary and foreign keys, not-null columns, defaults, check constraints, unique identities, cascade restrictions, RLS enablement, policy target roles, object grants, index presence, security-invoker views, protected schemas, and append-only audit behavior. The test suite must fail if a new exposed table lacks an explicit contract.

## Migration Safety Tests

Measure lock acquisition and duration on representative volumes. Simulate application traffic during additive migrations. Validate expand-and-contract steps, bounded backfills, checkpoints, cancellation, and retry. Destructive migration tests require backup and restore evidence plus explicit approval.

## Seed Validation

Scan seed files for credentials, tokens, private keys, real-looking personal data, production hosts, and unrestricted auth metadata. Verify stable keys and explicit conflict handling. Prove that the production deployment path excludes test and demo fixtures.

## Performance Validation

Use representative workspace filters and common lookup paths. Review query plans for membership authorization, document version lookup, open workflow runs, audit event retrieval, and unresolved conflicts. Policy columns and foreign keys must be indexed where justified. Establish initial latency and row-volume baselines without claiming production capacity before load evidence exists.

## Acceptance Gates

- Gate A: clean reset and deterministic replay pass.
- Gate B: schema contract and referential tests pass.
- Gate C: all unauthorized RLS cases fail closed.
- Gate D: required authorized operations succeed.
- Gate E: seed, secret, and classification scans pass.
- Gate F: advisors and privileged-code review have no unresolved blocking findings.
- Gate G: migration timing, lock, recovery, and backup evidence are accepted.
- Gate H: Data, Security, QA, and Release Owners approve promotion.

## Production Verification

After deployment, verify migration history, critical object existence, RLS status, grants, reference-data counts, application health, error rate, database resource signals, and a bounded set of read-only smoke checks. Do not run destructive tests or insert general fixtures in production. Record the commit, migration versions, environment, operator, timestamps, and evidence links.

## Failure Handling

A blocking failure stops promotion. Preserve logs and the last known-good state, classify the failure, and choose forward-fix, rollback, or restore according to the approved migration plan. Never weaken RLS or grant privileged access merely to make a test pass. Re-run the full affected gate after correction.

## Acceptance Criteria

- Validation covers clean build and supported upgrade paths.
- Every exposed table has positive and negative authorization evidence.
- Seeds are deterministic and environment-safe.
- Performance and locking risks are measured.
- Recovery is exercised, not assumed.
- Production verification is read-only, bounded, and auditable.

## References

- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [QA Framework](../09_Tests/QA_Framework.md)
- [Migration Standards](Migration_Standards.md)
- [Database Security Model](Database_Security_Model.md)
- [Supabase Database Testing](https://supabase.com/docs/guides/database/testing)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.3 schema validation plan |
