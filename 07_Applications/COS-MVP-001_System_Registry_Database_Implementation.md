# COS-MVP-001 System Registry Database Implementation

**Phase:** 4.5 — MVP System Registry Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Security Owner  
**Status:** Proposed  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Implementation ID:** COS-MVP-001-DB-v1

## Purpose

This document defines the database implementation required to operate the read-only MVP System Registry Viewer in Supabase.

## Implementation Outcome

The database provides an authorized, provenance-preserving read model for AI agents, tools, workflows, applications, modules, and integrations. Every visible row remains traceable to a canonical repository source. Registry reads are workspace scoped, deterministic, explicitly exposed, and protected by row-level security (RLS).

## Schema Components

| Object | Purpose | Exposure |
| --- | --- | --- |
| system_registry_records | Normalized registry identity and lifecycle metadata | Authenticated read only |
| system_registry_relationships | Typed links between canonical records | Authenticated read only |
| registry_source_snapshots | Source commit, path, hash, and observation state | Restricted read |
| registry_sync_runs | Append-oriented synchronization evidence | Backend only |
| registry_sync_findings | Quarantine, conflict, and validation findings | Backend and approved operators |
| registry_record_list_v1 | Stable list projection | Authenticated through approved API |
| registry_record_detail_v1 | Authorized detail and provenance projection | Authenticated through approved API |

## Record Contract

A registry record must include id, workspace_id when scoped, registry_type, canonical_id, display_name, description, semantic_version, owner_role, lifecycle_status, risk_class, classification, canonical_path, source_commit_sha, content_hash, observed_at, valid_until, sync_status, created_at, updated_at, and integer row_version.

Unique constraints prevent duplicate canonical IDs within their authority scope. Check constraints enforce supported types, lifecycle values, risk classes, hash format, timestamp validity, and non-empty source identity. Foreign keys use restrictive deletion unless an approved lifecycle rule requires otherwise.

## Relationship Contract

Relationships use source_record_id, relationship_type, target_record_id, observed_at, source_snapshot_id, and status. Supported types are controlled and include uses, implements, invokes, depends_on, governed_by, owned_by, supersedes, and produces. A record cannot relate to itself unless a separately approved relationship type permits it.

## Migration Plan

1. Inspect the pinned Supabase CLI with the applicable help commands.
2. Create the migration using the CLI; do not invent its timestamped filename.
3. Add types, tables, constraints, indexes, comments, and timestamps in dependency order.
4. Enable RLS before granting Data API access.
5. Create operation-specific policies and security-invoker views.
6. Add explicit grants for only the roles and operations required.
7. Add deterministic Phase 4.4 seeds and expected-result manifest.
8. Rebuild a clean local database, regenerate types, and run schema tests.
9. Run security and performance advisors and resolve blocking findings.
10. Review migration, seed, generated-type, and evidence diffs together.

## Data API, Grants, and RLS

Data API exposure and RLS are separate controls. The migration must explicitly grant only SELECT on approved projections or tables to authenticated. Anonymous access receives no registry privileges. Internal synchronization objects remain in an unexposed schema or have all public and client-role access revoked.

Every exposed table has RLS enabled. SELECT policies require an active membership, authorized workspace, permitted classification, and approved capability. Authentication alone is insufficient. Policies target roles with the TO clause and never use user-editable metadata for authorization.

Views exposed to authenticated users must use security_invoker on supported Postgres versions so underlying RLS remains effective. Any incompatible view remains unexposed and is queried only by the protected backend. SECURITY DEFINER is prohibited unless separately justified, placed outside exposed schemas, locked down, and reviewed.

## Query and Index Strategy

List queries use stable ordering by registry_type, canonical_id, and id, with an opaque cursor. Indexes cover workspace_id, registry_type, lifecycle_status, canonical_id, observed_at, and the stable cursor order. Detail lookup uses authorized scope plus canonical ID. Search is bounded and cannot return unauthorized names, counts, or facets.

## Synchronization and Provenance

Synchronization upserts by canonical authority and ID, records the selected source commit, calculates a content hash, validates controlled fields, reconciles relationships, and appends run evidence. Invalid input enters quarantine and cannot replace the last valid record. Deletion from a source does not delete a record unless canonical lifecycle evidence authorizes retirement.

## Failure and Recovery

A migration failure stops deployment. A synchronization failure preserves the last valid view and marks freshness or completeness accurately. Shared migration history is immutable; corrections use forward migrations. Recovery may replay an approved source commit or rebuild the read model from canonical Markdown.

## Verification

Required checks cover clean reset, migration order, generated types, constraints, RLS, grants, view behavior, anonymous denial, expired membership, cross-workspace isolation, direct-write denial, deterministic seed counts, provenance reconciliation, query plans, advisors, replay, and full rebuild.

## Acceptance Criteria

- A clean local reset creates the complete schema and deterministic seed state.
- Every exposed object has explicit least-privilege grants and tested RLS.
- Authorized reads return only permitted workspace and classification data.
- Anonymous, expired, suspended, cross-workspace, and write attempts fail closed.
- Views preserve underlying RLS and no privileged credential reaches a client.
- Displayed records reconcile to source path, commit, and content hash.
- Query plans and advisors have no unresolved blocking finding.
- Migration, seed, generated types, and evidence are tied to one source commit.

## References

- [Phase 4.4 Build Implementation](COS-MVP-001_System_Registry_Viewer_Build_Implementation.md)
- [Phase 4.4 Data Seed Plan](COS-MVP-001_System_Registry_Viewer_Data_Seed_Plan.md)
- [Supabase Core Schema Migrations](../05_Database/Supabase_Core_Schema_Migrations.md)
- [Database Security Model](../05_Database/Database_Security_Model.md)
- [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 database implementation specification |
