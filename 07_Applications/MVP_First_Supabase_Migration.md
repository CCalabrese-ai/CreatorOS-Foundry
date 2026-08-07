# Creator OS Foundry MVP First Supabase Migration

**Phase:** 4.3 — MVP Implementation Sprint Planning  
**Version:** 1.0  
**Document owner:** Data Owner and Security Owner  
**Status:** Proposed  
**Risk class:** High  
**Migration ID:** MIG-MVP-001

## Purpose

This document specifies the first local Supabase migration required for Sprint 001. The executable migration file must be created through the pinned Supabase CLI after review; this document does not invent its timestamped filename.

## Migration Outcome

MIG-MVP-001 creates the minimum identity-linked, workspace-scoped schema needed to authenticate a synthetic user, authorize workspace access, and return a truthful Overview.

## Scope

### Creates

- controlled helper schemas and types only when approved;
- profiles linked one-to-one with auth.users;
- workspaces;
- roles;
- memberships;
- documents with metadata only;
- workflow_runs with summary state only;
- system_registry_records as a normalized read model;
- health_observations;
- updated-at or validation helpers only when safely required;
- constraints, indexes, grants, RLS policies, and comments;
- deterministic seed contract references.

### Defers

Document versions, sources, reviews, approvals, commands, workflow steps, audit events, synchronization ledgers, agent runs, tool permissions, notifications, and full registry relationships remain in later migrations unless a foreign-key dependency requires an approved minimal placeholder.

## Global Columns

Workspace-owned mutable tables use UUID primary keys, workspace_id where applicable, controlled status, created_at, updated_at, created_by, updated_by, and integer version. Append-oriented health observations use observed_at and valid_until. Timestamps are UTC. Foreign keys default to RESTRICT. JSONB is prohibited unless the bounded schema and version are approved.

## Table Contracts

| Table | Required domain columns | Required constraints and indexes |
| --- | --- | --- |
| profiles | user_id, display_name, status | unique user_id to auth.users |
| workspaces | name, slug, classification, status, settings_version | unique slug; status and classification checks |
| roles | workspace_id, role_key, name, permissions_version, status | unique workspace_id plus role_key |
| memberships | workspace_id, user_id, role_id, valid_from, valid_until, status | unique active assignment rule; user and workspace indexes |
| documents | workspace_id, document_key, title, repository_path, owner_role, classification, status, version | unique workspace plus key; active path uniqueness; overview indexes |
| workflow_runs | workspace_id, workflow_key, workflow_version, state, owner_reference, started_at, completed_at, version | workspace and state/time indexes |
| system_registry_records | workspace_id nullable by authority, registry_type, canonical_id, display_name, owner_role, lifecycle_status, risk_class, source_commit_sha, content_hash, observed_at, sync_status, version | unique source and canonical ID; type/status indexes |
| health_observations | workspace_id, component_key, state, observed_at, valid_until, source, correlation_reference | component/time index; validity check |

## Row-Level Security

Enable RLS on every table exposed through the Data API before granting access. Policies are operation-specific:

- profiles: a user may read the permitted safe profile view for self;
- workspaces: active members may read their authorized workspaces;
- roles: members may read safe roles only within their workspace;
- memberships: users may read their own active membership; privileged membership administration is deferred;
- documents, workflow_runs, system_registry_records, and health_observations: active members may read authorized rows in their workspace subject to classification and resource policy;
- direct browser writes are denied in Sprint 001.

Policies use explicit authenticated-role targets plus identity and workspace predicates. Authentication alone never grants all rows. UPDATE policies, when later introduced, require both visibility and resulting-row checks.

## Grants and Exposure

Data API exposure and RLS are separate decisions. Grant authenticated SELECT only to the intentionally exposed objects required by the first application path. Grant anon no application-table access. Internal ingestion, helper, audit, and privileged functions remain in private schemas and have explicit execution rules.

Views use invoker behavior where supported or remain unexposed. Security-definer functions are not introduced unless separately justified and reviewed.

## Seed Contract

Seeds create deterministic synthetic identities through the approved local Auth process, two workspaces, roles, one active and one denied or expired membership case, representative document summaries, workflow states, registry records, and fresh, stale, degraded, and unknown health observations. Seeds contain no production or personal data.

## Migration Procedure

1. Confirm the pinned CLI version and inspect current migration help.
2. Create the migration through the CLI with a descriptive name.
3. Implement structures in dependency order inside one reviewed transaction where supported.
4. Add constraints and indexes before policies depend on them.
5. Enable RLS, add policies, then apply explicit grants.
6. Reset a clean local database and load deterministic seeds.
7. Generate TypeScript database types from the rebuilt schema.
8. Run schema, constraint, RLS, cross-workspace, grant, query-plan, advisor, and drift checks.
9. Review SQL and generated type diffs.
10. Commit the migration, seeds, types, tests, and this evidence together during implementation.

## Rollback and Forward Fix

Before the migration is shared, local corrections may replace the draft migration through the approved workflow. After sharing or application, migration history is immutable. Corrections use a new forward migration. Production rollback is not part of Sprint 001; preview and staging rehearsals must establish compatibility before later promotion.

## Acceptance Criteria

- A clean local reset applies MIG-MVP-001 and deterministic seeds.
- Generated types match the migration-built schema.
- Authorized users can read only permitted workspace Overview data.
- Cross-workspace, expired-membership, anonymous, and direct-write tests fail closed.
- All exposed objects have explicit grants and tested RLS.
- Required indexes support representative Overview queries.
- Security and performance advisors have no unresolved blocking finding.
- No secret, production data, or privileged browser access is introduced.

## References

- [Supabase Core Table Specifications](../05_Database/Supabase_Core_Table_Specifications.md)
- [MVP Supabase Project Initialization](MVP_Supabase_Project_Initialization.md)
- [MVP Supabase Integration Implementation](MVP_Supabase_Integration_Implementation.md)
- [MVP First Backend Service Specification](MVP_First_Backend_Service_Specification.md)
- [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial MIG-MVP-001 specification |
