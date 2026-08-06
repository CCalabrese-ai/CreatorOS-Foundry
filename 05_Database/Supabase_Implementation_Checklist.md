# Creator OS Foundry Supabase Implementation Checklist

**Phase:** 2.1 — Supabase Core Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This checklist defines the evidence required to complete the Supabase core implementation. A checked item must link to verifiable evidence; status alone is insufficient.

## Governance and Ownership

- [ ] System, Architecture, Data, Security, Quality, Release, and Operations owners are named.
- [ ] Scope, exclusions, budget, region, service tier, and recovery objectives are approved.
- [ ] Supabase tool registration and environment access are approved.
- [ ] Risks, exceptions, and decision records are linked.
- [ ] No production action is implied by documentation approval alone.

## Repository and Tooling

- [ ] Supabase CLI version is pinned and recorded.
- [ ] Current commands were verified through CLI help.
- [ ] Supabase configuration and directory structure are committed.
- [ ] Secret and local-state files are ignored.
- [ ] Dependency lockfiles are committed where applicable.
- [ ] CI uses a dedicated least-privileged identity.

## Environments

- [ ] Local, preview, staging, and production targets are explicitly mapped.
- [ ] Projects, credentials, storage, data, and budgets are isolated.
- [ ] Public and privileged keys are separated.
- [ ] Preview expiry and staging retention are configured.
- [ ] Production access, MFA, break-glass, backup, and monitoring are ready.
- [ ] Production-derived data cannot enter lower environments without approval and sanitization.

## Schema and Migrations

- [ ] Migration files were created through the installed CLI.
- [ ] Migration order matches the implementation plan.
- [ ] Schemas, tables, constraints, indexes, and comments match specifications.
- [ ] Clean local rebuild succeeds.
- [ ] Supported previous state upgrades successfully.
- [ ] Migration history and expected schema state match.
- [ ] Destructive changes have approval, backup, and recovery evidence.
- [ ] Backfills are bounded, checkpointed, observable, and pausable.

## Security

- [ ] RLS is enabled on every exposed table.
- [ ] Select, insert, update, and delete policies are explicitly tested.
- [ ] Update paths include row visibility plus using and with-check controls.
- [ ] Cross-workspace, anonymous, missing-membership, expired-membership, and stale-claim tests pass.
- [ ] Object grants and exposed schemas are least-privileged.
- [ ] Views and functions follow invoker and privileged-function rules.
- [ ] Service-role and secret keys never reach public clients.
- [ ] Storage buckets and object policies are reviewed.
- [ ] Security advisors have no unresolved blocking findings.
- [ ] Logs, migrations, fixtures, and documentation contain no secrets.

## Seed Data

- [ ] Required reference seed allowlist is approved.
- [ ] Production and development seeds are separated.
- [ ] Seeds are deterministic and idempotent.
- [ ] Stable identifiers and expected counts are documented.
- [ ] Synthetic fixtures contain no real personal or Restricted data.
- [ ] Production guards and bootstrap procedure are tested.

## Testing and Quality

- [ ] Constraint, schema, contract, and migration tests pass.
- [ ] RLS tests use application-equivalent roles.
- [ ] Integration, application, workflow, and storage tests pass.
- [ ] Performance plans cover policy predicates and core queries.
- [ ] Backup and recovery exercise succeeds.
- [ ] Failed, denied, timeout, duplicate, and recovery paths are covered.
- [ ] Evidence identifies commit, environment, versions, fixtures, and result.

## Deployment

- [ ] Preview and staging deployments completed from the candidate commit.
- [ ] Staging schema and migration history match expectations.
- [ ] Production backup or point-in-time recovery readiness is confirmed.
- [ ] Monitoring, alerts, on-call, communication, and stabilization window are assigned.
- [ ] Data, Security, Quality, Architecture, and Release approvals are recorded.
- [ ] Production target and migration list receive final verification.
- [ ] Post-deployment smoke, data, RLS, auth, and application checks are prepared.
- [ ] Rollback, forward-fix, restore, and incident triggers are documented.

## Operations and Handoff

- [ ] Database, auth, storage, migration, cost, and security monitoring are active.
- [ ] Credential rotation and access review schedules are recorded.
- [ ] Runbooks cover deployment, failure, backup, restore, incident, and provider outage.
- [ ] Known limitations and residual risks have owners and deadlines.
- [ ] Canonical documentation links to the implemented commit and evidence.
- [ ] Operations Owner accepts the handoff.

## Completion Decision

Phase 2.1 may be declared complete only when all blocking checklist items have evidence, required owners approve, production verification succeeds, and no unresolved Critical or High finding remains.

## References

- [Core Implementation Plan](Supabase_Core_Implementation_Plan.md)
- [Deployment Guide](Supabase_Deployment_Guide.md)
- [Environment Strategy](Supabase_Environment_Strategy.md)
- [Migration Execution Plan](Migration_Execution_Plan.md)
- [Initial Seed Data Strategy](Initial_Seed_Data_Strategy.md)
- [Testing Strategy](../09_Tests/Testing_Strategy.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.1 implementation checklist |
