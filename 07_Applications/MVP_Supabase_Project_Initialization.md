# Creator OS Foundry MVP Supabase Project Initialization

**Phase:** 4.1 — MVP Application Skeleton  
**Version:** 1.0  
**Document owner:** Data Owner, Security Owner, and Backend Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the controlled initialization of Supabase for local MVP construction and the later creation of isolated preview, staging, and production projects.

## Authorization Boundary

This document specifies the procedure and evidence. It does not authorize creating billable remote projects, production credentials, customer data, or live integrations without the required owner approvals.

## Initialization Outcomes

- a pinned Supabase CLI and client dependency set;
- repository-owned local configuration;
- clean migration and seed replay;
- generated TypeScript database types;
- current server-rendering Auth integration;
- explicit Data API exposure;
- tested row-level security;
- dedicated environment mapping;
- advisor, recovery, and drift evidence.

## Local Initialization Sequence

1. Confirm the pinned CLI version and discover current commands and flags through help.
2. Initialize the repository supabase directory without replacing existing migration history.
3. Review config.toml, ignore rules, ports, Auth origins, redirect URLs, and local email capture.
4. Create new migration files only through the pinned CLI workflow.
5. Implement foundational schemas, workspaces, profiles, roles, memberships, registries, documents, workflow runs, steps, reviews, commands, audit events, health observations, and supporting constraints in approved dependency order.
6. Enable RLS on every exposed table before granting API access.
7. Create operation-specific policies for identity, current workspace membership, resource, classification, assignment, state, and approval.
8. Explicitly grant anon or authenticated Data API access only to intended objects when required by project settings.
9. Protect private schemas, audit data, views, functions, and service-only operations.
10. Add deterministic reference seeds and synthetic local identities, memberships, documents, runs, and denial cases.
11. Reset the local database from zero and verify migration order and seed determinism.
12. Generate database types from the rebuilt schema and review the diff.
13. Run positive and negative RLS, grant, view, function, realtime, performance, and advisor checks.
14. Connect the application with publishable browser configuration and approved server-only references.
15. Record local initialization evidence without secret values.

## Auth Initialization

Configure approved local Auth methods, redirect destinations, cookie-based server-rendering clients, token refresh handling, and server identity validation using the current supported Supabase pattern. The browser receives only the project URL and publishable key. User-controlled metadata cannot grant permissions.

Session expiry, refresh, sign-out, membership removal, stale claims, disabled users, and zero-workspace cases require tests.

## RLS and Database Controls

Authentication does not equal authorization. Policies must combine identity with resource-level predicates. UPDATE policies include visibility and resulting-row checks. Views use invoker behavior where supported or are unavailable to public roles. Privileged functions remain in private schemas with explicit execution grants and reviewed search paths.

Service-role or secret keys never enter browser configuration, source maps, logs, analytics, or general application modules.

## Realtime Initialization

Publish only the tables and events required by the first feature. Realtime is an awareness channel, not the audit record or completion authority. Subscriptions are scoped and tested; reconnect and gap handling refresh durable APIs.

## Remote Environment Sequence

Preview, staging, and production use separate projects, credentials, data, storage, Auth redirects, and monitoring. Provisioning follows approved provider, region, plan, budget, recovery, and access decisions. Migrations and immutable application releases promote forward; secrets and database instances do not.

## Verification Matrix

| Area | Required evidence |
| --- | --- |
| Rebuild | Clean reset applies all migrations and approved seeds |
| Isolation | Cross-workspace and cross-role positive and negative tests |
| Exposure | Data API grants match the approved object inventory |
| RLS | Every exposed operation has tested policy behavior |
| Types | Generated types match the deployed migration state |
| Auth | Session, refresh, revocation, redirect, and cache behavior |
| Realtime | Authorized events, gap detection, and reconciliation |
| Security | Advisor results, secret scan, view and function review |
| Performance | Index support and representative query plans |
| Recovery | Backup dependency, failed migration, and forward-fix rehearsal |
| Drift | Shared environment matches repository history and configuration |

## Failure and Recovery

Migration, seed, type, RLS, grant, Auth, or advisor failure blocks application promotion. Direct dashboard changes are drift until captured in reviewed repository history. A failed shared migration uses the deployment runbook; applied history is never silently edited.

## Acceptance Criteria

- Local Supabase starts and rebuilds entirely from repository state.
- Synthetic identities and workspaces prove allowed and denied access.
- Exposed objects have explicit approved grants and RLS.
- Generated types match the migration-built schema.
- Browser code contains no privileged key.
- Auth and realtime behavior reconcile with authoritative server and database state.
- Remote project creation remains behind explicit environment and owner approval.
- Initialization evidence is complete and contains no secrets.

## References

- [MVP Supabase Integration Implementation](MVP_Supabase_Integration_Implementation.md)
- [Supabase Core Implementation Plan](../05_Database/Supabase_Core_Implementation_Plan.md)
- [Supabase Environment Strategy](../05_Database/Supabase_Environment_Strategy.md)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.1 Supabase project initialization |
