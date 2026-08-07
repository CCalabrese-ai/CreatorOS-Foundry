# Creator OS Foundry MVP Supabase Integration Implementation

**Phase:** 3.3 — MVP Technical Implementation Plan  
**Version:** 1.0  
**Document owner:** Data Owner, Backend Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how the MVP application integrates with Supabase for PostgreSQL, authentication, row-level security, realtime notification, local development, migrations, seeds, and generated types.

## Integration Outcome

The application will use isolated Supabase environments, repository-managed migrations and deterministic seeds, current server-side authentication clients, least-privileged access, explicit Data API exposure, tested row-level security, and durable server APIs as the authority for operational state.

## Environment Mapping

| Application environment | Supabase target | Data rule |
| --- | --- | --- |
| Local | Local CLI stack | Deterministic synthetic fixtures |
| Preview | Isolated branch or preview project | Synthetic or approved fixtures |
| Staging | Dedicated staging project | Sanitized production-like fixtures |
| Production | Dedicated production project | Approved operational data only |

Projects, credentials, storage, redirect URLs, secrets, and database instances are not shared across these boundaries.

## Repository Integration

The repository contains pinned CLI and client dependencies, supabase/config.toml, ordered migrations, approved seed entry points, generated database types, validation scripts, and environment examples without secret values. CLI commands and flags must be confirmed from the pinned version's help before automation is finalized.

## Implementation Sequence

1. Pin Supabase CLI, supabase-js, and the current approved server-rendering package; commit the lockfile.
2. Initialize local configuration and document required environment variables.
3. Apply the existing core migration plan to a clean local database.
4. Enable row-level security on every exposed table before API grants.
5. Create operation-specific policies using workspace membership, resource, and lifecycle predicates.
6. Grant anon or authenticated Data API access only to intentionally exposed objects.
7. Protect private schemas, views, functions, audit data, and server-only operations.
8. Create browser and server clients with separate safe configuration boundaries.
9. Generate TypeScript database types from the migration-built schema.
10. Implement typed data adapters and transaction or RPC boundaries for invariant-heavy commands.
11. Configure only the required realtime publications and authorize every channel or row.
12. Validate migrations, seeds, grants, policies, query plans, realtime gaps, backup dependencies, and recovery.
13. promote the same approved migrations and application commit through preview and staging.
14. Run security and performance advisors and obtain release approval before production.

## Client Boundaries

Browser clients receive the project URL and publishable key only. They may perform narrowly approved RLS-protected reads or subscriptions. The backend creates server clients for authenticated user context and separate privileged clients only inside approved server-only adapters. Secret and service-role keys never enter browser variables, source maps, logs, or analytics.

For cookie-based server rendering, use the current supported Supabase SSR client pattern. Protected routes validate identity with a revalidated server method rather than trusting an unverified session object. Session-refresh responses are private and must not be shared through static regeneration or intermediary caches.

## Row-Level Security and Grants

Authentication alone is not authorization. Policies combine the authenticated identity with workspace membership, operation, row ownership or assignment, environment, classification, and lifecycle state. UPDATE policies include both visibility and resulting-row checks. Views use invoker behavior where supported or remain unavailable to public roles. Privileged functions are placed in a private schema, use the narrowest execution model, and have explicit execute grants.

Data API exposure and RLS are separate controls. New tables are inaccessible until explicit grants are approved when the project configuration requires them; an API grant never substitutes for RLS.

## Migrations and Seeds

Schema changes begin locally, are represented by forward-only migration files, and rebuild cleanly from zero. Applied history is not edited. Seed data contains only allowlisted reference values and synthetic fixtures, is repeatable, and uses stable identifiers. Production customer data is never committed or seeded.

## Realtime

Realtime improves awareness but does not establish completion. Subscriptions are bound to identity, workspace, environment, and resource. Clients track cursors or versions, detect disconnects and gaps, then refresh authoritative APIs. Events contain minimal change metadata rather than protected document or prompt content.

## Verification

Automated evidence covers clean reset, migration order, schema diff, constraints, indexes, positive and negative RLS cases, cross-workspace access, anonymous access, expired membership, app metadata freshness, view and function privileges, generated type drift, seed determinism, realtime authorization, query plans, and rollback or forward-fix rehearsal.

## Failure and Recovery

A database or Auth outage produces explicit unavailable or unknown states. Type drift blocks the build. Migration failure stops promotion. RLS or grant failures block release. Realtime failure falls back to bounded polling. Direct dashboard changes are treated as drift and must be reconciled through reviewed migration history.

## Acceptance Criteria

- Every environment rebuilds from repository configuration, migrations, and approved seeds.
- Browser bundles contain no privileged credential.
- Exposed tables have explicit grants and tested RLS policies.
- Workspace and resource isolation passes positive and negative tests.
- Generated types match the deployed schema.
- Realtime gaps reconcile with durable API state.
- Staging proves migration, recovery, security, and application integration before production.

## References

- [Supabase Core Implementation Plan](../05_Database/Supabase_Core_Implementation_Plan.md)
- [Supabase Environment Strategy](../05_Database/Supabase_Environment_Strategy.md)
- [Supabase Migration Definitions](../05_Database/Supabase_Migration_Definitions.md)
- [MVP Backend Implementation Plan](MVP_Backend_Implementation_Plan.md)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.3 Supabase integration implementation |
