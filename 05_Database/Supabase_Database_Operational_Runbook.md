# Creator OS Foundry Supabase Database Operational Runbook

**Phase:** 2.3 — Supabase Core Schema Implementation  
**Version:** 1.0  
**Document owner:** Operations Owner, Data Owner, and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This runbook defines how authorized operators prepare, deploy, verify, monitor, recover, and reconcile the Creator OS Foundry core Supabase schema.

## Operating Boundaries

Only approved automation or named operators may deploy migrations. Production dashboard editing is not a normal change path. Operators must discover current CLI syntax with help, verify the linked project before remote commands, and never place credentials or project secrets in logs or documentation.

## Pre-Deployment Checklist

- Confirm the approved commit, migration list, owners, risk class, and maintenance window.
- Verify local, staging, and target migration histories.
- Confirm database backup or point-in-time recovery readiness appropriate to risk.
- Review locks, estimated duration, backfills, compatibility, and recovery class.
- Confirm application versions tolerate the expanded schema.
- Confirm RLS, grants, advisors, schema-contract, and integration tests passed in staging.
- Verify environment identifiers and credentials through protected configuration.
- Announce the change and establish the incident and rollback contacts.

## Deployment Procedure

1. Authenticate through the approved operator identity.
2. Verify the intended Supabase project and environment.
3. Fetch the approved repository commit.
4. Compare local and remote migration history.
5. Preview pending migrations using current CLI capabilities.
6. Confirm the pending set exactly matches the approved release.
7. Apply migrations through controlled automation.
8. Capture start, completion, migration versions, operator, and outcome.
9. Run bounded post-deployment verification.
10. Complete the release record and handoff to monitoring.

General seeds are never applied to production. Required reference data is delivered only by the reviewed migration or production-safe bootstrap defined for the release.

## Post-Deployment Verification

Verify:

- expected migrations are recorded once and in order;
- required schemas, tables, constraints, indexes, and comments exist;
- RLS is enabled on every exposed table;
- grants match the approved manifest;
- controlled reference counts and keys match expectations;
- read-only smoke queries succeed for authorized paths and fail for unauthorized paths;
- application health, database errors, latency, connections, storage, and replication signals remain within baseline;
- audit events and deployment evidence are complete.

## Routine Operations

| Frequency | Operation |
| --- | --- |
| Continuous | Monitor errors, connections, latency, resource saturation, auth failures, and failed workflows |
| Daily | Review failed jobs, quarantined sync events, unresolved incidents, and backup status |
| Weekly | Review slow queries, index usage, advisor findings, storage growth, and stale access |
| Monthly | Reconcile migration history, grants, RLS inventory, retention jobs, and credential rotation dates |
| Quarterly | Perform restore exercise, access review, incident drill, and capacity assessment |
| Before release | Run staging reset, upgrade, RLS, performance, and recovery gates |

## Common Failure Responses

### Migration Fails Before Completion

Stop further deployment. Preserve the exact error and migration state. Determine whether the transaction rolled back fully. Do not edit an applied shared migration. Use the approved forward-fix or restore path and repeat verification.

### Migration History Drift

Pause releases. Compare repository and remote history. Determine whether drift came from dashboard changes, missing commits, or history damage. Capture legitimate remote changes into a reviewed migration where appropriate. History repair requires Data and Release approval and retained evidence.

### RLS or Grant Regression

Treat unexpected cross-workspace or privileged access as a security incident. Disable the affected application path if necessary, preserve evidence, apply the reviewed least-privilege correction, rotate exposed credentials when indicated, and run the complete authorization matrix.

### Performance Regression

Identify the migration and query plan change, protect availability, and apply a reviewed index, policy, query, or workload correction. Avoid emergency indexes or grants without recording ownership, lock risk, and follow-up validation.

### Seed Contamination

Stop seed automation, identify affected environments and records, and preserve audit evidence. Production contamination requires incident handling and an approved cleanup migration or data workflow. Do not use broad deletion without exact target validation and backup consideration.

### Provider or Network Interruption

Keep the last verified application state, stop repeated unsafe retries, and confirm whether migration transactions completed. Reconcile migration history and schema state before resuming.

## Recovery Decision

| Condition | Response |
| --- | --- |
| Safe compensating change exists | Deploy reviewed forward-fix |
| Transaction rolled back with no external dependency change | Correct locally and redeploy |
| Data was transformed but remains recoverable | Pause writes, reconcile, and run approved repair |
| Irreversible corruption or destructive loss occurred | Execute approved restore and replay plan |
| Security boundary is uncertain | Fail closed, restrict access, and invoke incident response |

## Backup and Restore Exercise

At the approved interval, restore a backup into an isolated environment, apply missing migrations, validate row counts and critical hashes, test RLS and application reads, record recovery time and recovery point, and destroy the isolated environment through the approved process. A configured backup without a completed restore test is not sufficient recovery evidence.

## Escalation

Data Owner leads schema and data-integrity decisions. Security Owner leads access-control or data-exposure incidents. Release Owner controls deployment continuation. Operations Owner coordinates communications, evidence, and service recovery. Material production incidents follow the repository Incident Response standard.

## Evidence Record

Record release ID, repository commit, migration versions, target project reference by protected identifier, operator, approvers, timestamps, preview output, validation summary, backup evidence, post-deployment checks, incidents, recovery actions, and final disposition. Do not copy secret values or sensitive row content.

## Acceptance Criteria

- Operators can deploy the exact approved migration set.
- Production seed boundaries are explicit.
- Verification covers history, objects, RLS, grants, reference data, and health.
- Drift and partial failure stop unsafe continuation.
- Recovery responsibilities and decision paths are clear.
- Restore capability is periodically demonstrated.
- Every production change has complete, secret-free evidence.

## References

- [Supabase Deployment Guide](Supabase_Deployment_Guide.md)
- [Migration Execution Plan](Migration_Execution_Plan.md)
- [Schema Validation Plan](Supabase_Schema_Validation_Plan.md)
- [Incident Response](../09_Tests/Incident_Response.md)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.3 database operational runbook |
