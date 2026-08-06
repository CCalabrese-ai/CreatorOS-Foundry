# Creator OS Foundry Supabase Architecture

**Phase:** 1.2 — Database Implementation Layer  
**Version:** 1.0  
**Document owner:** Data Owner and Architecture Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the proposed Supabase implementation architecture for Creator OS Foundry. It translates the conceptual [Database Model](Database_Model.md) into a governed PostgreSQL platform without changing the approved domain model.

## Scope

The architecture covers Supabase Postgres, Auth, Data API, Storage, Realtime, Edge Functions, operational environments, observability, backup, and recovery. It does not provision a Supabase project or authorize production data.

## Architecture Principles

- PostgreSQL is the system of record for governed operational data.
- Each record is isolated by workspace and protected with least privilege.
- Supabase Auth establishes identity; database policy establishes authorization.
- Public clients use publishable credentials only. Secret and service-role credentials remain server-side.
- Every table in an exposed schema must have row-level security (RLS) enabled and explicit policies.
- Protected operations use trusted server boundaries and auditable approvals.
- Database changes move through reviewed, repeatable migrations.
- Provider-specific features must be isolated behind documented interfaces where portability matters.

## Environment Model

| Environment | Purpose | Data rule | Change rule |
| --- | --- | --- | --- |
| Local | Development and migration testing | Synthetic or sanitized | Developer-controlled |
| Preview | Branch and integration validation | Synthetic or approved fixtures | Automated from reviewed branch |
| Staging | Release verification | Sanitized production-like | Release approval required |
| Production | Live governed operation | Classified operational data | Approved migration only |

Projects must not share credentials or production data across environments. Configuration must identify the target project explicitly.

## Logical Components

| Component | Responsibility |
| --- | --- |
| Postgres | Canonical relational records, constraints, functions, events, and audit data |
| Auth | Human and machine identity lifecycle and session issuance |
| Data API | Controlled REST and GraphQL access to approved exposed schemas |
| Storage | Governed binary artifacts with bucket and object policies |
| Realtime | Approved change subscriptions; not a substitute for durable workflow state |
| Edge Functions | Trusted integration and orchestration boundary when database-only logic is insufficient |
| Cron and Queues | Scheduled and asynchronous work with idempotency and observability |
| Vault or external secret manager | Protected secret storage referenced by identifier only |

## Schema Boundaries

- Exposed application relations may reside in public only when Data API access is required.
- Internal functions, lookup data, privileged helpers, and audit implementation should reside in non-exposed schemas.
- Auth-owned objects remain in auth and must not be modified outside supported extension points.
- Storage metadata remains platform-managed; access is governed through storage policies.
- Extensions require documented purpose, owner, version, security review, and removal path.

## Request and Trust Flow

1. A client authenticates through Supabase Auth and receives a short-lived token.
2. The client uses a publishable key and token to reach an approved API surface.
3. Postgres grants schema and object access, then RLS evaluates the actor, workspace, operation, and row.
4. Sensitive or privileged actions cross a trusted server or Edge Function boundary.
5. The operation records actor, workspace, request correlation, outcome, and material domain events.
6. Derived artifacts inherit the highest applicable source classification.

## Availability, Backup, and Recovery

Production must define recovery point and recovery time objectives before launch. Backups and point-in-time recovery are configured according to the approved service tier. Recovery exercises must verify restoration, RLS, application compatibility, and audit continuity. Realtime delivery and asynchronous jobs must tolerate retries and replay without duplicate side effects.

## Observability

Monitor database health, slow queries, connection saturation, failed jobs, storage growth, RLS denials, authentication anomalies, migration status, and cost. Logs must minimize sensitive values and use correlation identifiers.

## Controls and Approval Boundaries

Architecture Owner approval is required for component or trust-boundary changes. Data Owner approval is required for schemas, retention, classification, and destructive migration. Security Owner approval is required for Auth, RLS, exposed schemas, privileged functions, secrets, and external access. Production activation requires Release Owner approval.

## Failure and Recovery

On suspected cross-workspace access, credential exposure, migration failure, or data corruption, pause affected writes, preserve evidence, invoke incident response, and restore only from an approved recovery point. Never bypass RLS or expose a service-role credential to recover service.

## Acceptance Criteria

- Environment and trust boundaries are explicit.
- Every exposed table is covered by RLS and object grants.
- Public and privileged credentials are separated.
- Recovery, observability, and audit responsibilities are assigned.
- Schema and migration specifications can implement this architecture without contradiction.

## References

- [Database Model](Database_Model.md)
- [Database Security Model](Database_Security_Model.md)
- [Migration Standards](Migration_Standards.md)
- [Supabase Database Overview](https://supabase.com/docs/guides/database/overview)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.2 Supabase architecture |
