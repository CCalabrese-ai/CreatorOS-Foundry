# Creator OS Foundry MVP System Registry Implementation

**Phase:** 4.2 — MVP Core Build Specification  
**Version:** 1.0  
**Document owner:** Architecture Owner, Application Owner, and Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the MVP System Registry as an authorized read model over the canonical AI Workforce, Tool, Workflow, application, module, and integration registries.

## Authority Model

The System Registry does not replace canonical domain registries. Each record preserves its canonical registry, stable ID, version, owner, lifecycle, risk, source path, source commit, content hash, observed time, and synchronization state. Supabase stores normalized records and relationships used by the application.

## Registry Types

| Type | Canonical source | MVP use |
| --- | --- | --- |
| AI worker | AI Workforce Registry and agent specifications | Identity, role, version, status, evaluation |
| Tool | Tool Registry and supporting specifications | Risk, capability, integration and permission summary |
| Workflow | Workflow Registry and workflow specifications | Trigger, actor, version, status, run navigation |
| Application | Application architecture and catalog records | Ownership, release, environment and health |
| Module | Control Center module specifications | Route, owner, contract and feature state |
| Integration | Tool instance and environment metadata | Provider, environment, scope, health and rotation status |

## Normalized Record Contract

A registry record includes registry_type, canonical_id, display_name, description, workspace_id when scoped, owner_role, semantic_version, lifecycle_status, risk_class, environment availability, classification, canonical_path, source_commit_sha, content_hash, observed_at, freshness, sync_status, and safe metadata extensions.

Relationships include uses, implements, invokes, depends_on, governed_by, owned_by, supersedes, and produces. Relationship targets use stable canonical IDs.

## Ingestion and Synchronization

1. Select an approved repository commit.
2. Parse canonical Markdown headers and registry tables.
3. Validate required IDs, controlled status, ownership, version, and risk.
4. Normalize records and calculate content hashes.
5. Upsert idempotently by canonical source and ID.
6. Reconcile relationships and detect missing or conflicting targets.
7. Record the commit checkpoint and synchronization event.
8. Mark deletions as deprecated or retired only when canonical lifecycle evidence permits.
9. Publish a sanitized registry-change event.
10. Support a full rebuild from GitHub without losing canonical authority.

## Query Service

The System Registry service provides authorized type lists, filtered records, record detail, relationships, source evidence, health, and affected workflow or execution links. Lists use stable cursor pagination and allowlisted filters. Search and aggregates are authorized before names, counts, or facets are returned.

## Authorization

Global baseline entries may be visible to authenticated users only when governance permits. Workspace instances, permissions, executions, integration health, and sensitive source detail require resource-specific authorization. Viewing a tool record does not grant use of the tool.

## Database Controls

Registry tables use stable keys, unique canonical source constraints, version fields, foreign keys, timestamps, and append-oriented synchronization events. Workspace-scoped records carry workspace_id. Exposed objects receive explicit approved grants and RLS; internal ingestion and audit tables remain private.

## Lifecycle Rules

Only canonical domain owners can approve lifecycle changes. The application may display Proposed, Approved, Active, Paused or Restricted, Deprecated, and Retired states according to registry type. A normalized record cannot become Active merely because ingestion succeeded.

## Failure and Recovery

Invalid source records enter quarantine with findings and do not overwrite the last valid view. Partial ingestion is visibly degraded. A missing source, content-hash mismatch, relationship conflict, or checkpoint gap creates a synchronization finding. Recovery replays the selected commit idempotently or rebuilds the read model.

## Testing

Test every registry type, duplicate IDs, missing owners, invalid status and risk, conflicting versions, relationship gaps, changed paths, retired records, replay, full rebuild, partial failure, content-hash drift, cross-workspace access, search leakage, RLS, and source-link authorization.

## Acceptance Criteria

- Every displayed record traces to a canonical path, commit SHA, and content hash.
- Ingestion and rebuild are idempotent.
- Domain registry ownership and lifecycle authority remain intact.
- Search, counts, relationships, and source links preserve authorization.
- Invalid or partial synchronization cannot silently replace valid registry state.
- Viewing registry data never grants execution or tool permission.
- The Control Center shows freshness and synchronization status.

## References

- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [Workflow Registry](../06_Automations/Workflow_Registry.md)
- [Control Center Module Specifications](Control_Center_Module_Specifications.md)
- [MVP Supabase Project Initialization](MVP_Supabase_Project_Initialization.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.2 System Registry implementation |
