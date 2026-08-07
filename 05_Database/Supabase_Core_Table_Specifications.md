# Creator OS Foundry Supabase Core Table Specifications

**Phase:** 2.3 — Supabase Core Schema Implementation  
**Version:** 1.0  
**Document owner:** Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the first implementation-ready table contracts for the Creator OS Foundry Supabase database. It refines the architectural schema into required columns, constraints, relationships, indexes, and access expectations.

## Global Column Contract

Every workspace-owned mutable table must include id UUID primary key, workspace_id UUID not null, status text not null, created_at timestamptz not null, updated_at timestamptz not null, created_by UUID, updated_by UUID, and version integer not null. Append-only tables use occurred_at or created_at and do not require mutable update fields.

Controlled values use governed lookup tables or check constraints. JSONB is permitted only for bounded versioned extensions. Foreign keys use RESTRICT unless a strictly dependent child has approved cascade behavior.

## Identity and Governance Tables

| Table | Required domain columns | Key constraints and indexes |
| --- | --- | --- |
| workspaces | name, slug, classification, settings_version | unique slug; status and classification checks |
| profiles | user_id, display_name | unique user_id referencing auth.users; status index |
| roles | workspace_id, role_key, name, permissions_version | unique workspace_id plus role_key |
| memberships | workspace_id, user_id, role_id, valid_from, valid_until | unique active membership rule; indexes on user_id and workspace_id |
| policies | policy_key, semantic_version, scope, body_reference, effective_at | unique policy_key plus version |
| decisions | decision_key, title, rationale, owner_id, decided_at | unique decision_key; owner and status indexes |
| approvals | subject_type, subject_id, approver_id, decision, reason, expires_at | subject lookup and approver indexes |

## Documentation Tables

| Table | Required domain columns | Key constraints and indexes |
| --- | --- | --- |
| documents | document_key, title, repository_path, owner_role, classification | unique workspace_id plus document_key; unique active repository path |
| document_versions | document_id, semantic_version, commit_sha, content_hash, observed_at, approved_at | unique document_id plus commit_sha; document and status index |
| document_sources | document_version_id, source_type, source_locator, retrieved_at, trust_state | version and source-type indexes |
| document_relationships | source_document_id, target_document_id, relationship_type, effective_at | no self-link; unique typed relationship |
| review_requests | document_version_id, reviewer_role, risk_class, due_at | document, status, and due-date indexes |
| reviews | review_request_id, reviewer_id, decision, comments_reference, decided_at | one terminal decision per assigned reviewer |
| validation_runs | document_version_id, ruleset_version, started_at, completed_at, outcome | document and completion indexes |
| validation_findings | validation_run_id, rule_id, severity, location_reference, disposition | run and blocking-severity indexes |
| publication_events | document_version_id, event_type, actor_id, commit_sha, occurred_at | append-only; commit and document indexes |
| sync_events | provider_event_id, handler_version, event_type, commit_sha, attempts | unique delivery plus handler; status and received-time indexes |
| sync_checkpoints | repository_id, branch, last_commit_sha, processed_at | unique workspace, repository, branch |
| sync_conflicts | document_id, canonical_hash, projected_hash, severity, resolution_status | open-conflict partial index |
| knowledge_index_entries | document_version_id, title_terms, summary, generated_at | unique version; search index as approved |
| embedding_refs | document_version_id, chunk_key, model_id, content_hash, storage_reference | unique version plus chunk plus model |

## Registry and Execution Tables

| Table | Required domain columns | Key constraints and indexes |
| --- | --- | --- |
| agents | agent_key, name, owner_id, risk_level | unique workspace plus agent_key |
| agent_versions | agent_id, semantic_version, specification_path, capability_hash | unique agent plus version |
| tools | tool_key, provider, capability, risk_level | unique workspace plus tool_key |
| tool_permissions | tool_id, principal_type, principal_id, environment, permission_scope | unique active permission boundary |
| workflows | workflow_key, owner_id, risk_level | unique workspace plus workflow_key |
| workflow_versions | workflow_id, semantic_version, definition_reference | unique workflow plus version |
| tasks | task_key, assignee_type, assignee_id, priority, due_at | unique workspace plus task_key |
| runs | run_type, definition_id, initiated_by, idempotency_key, started_at, completed_at, outcome | unique workspace plus idempotency_key |
| run_steps | run_id, sequence_number, operation, started_at, completed_at, outcome | unique run plus sequence number |

## Operations and Audit Tables

Artifacts store artifact_key, storage_reference, media_type, classification, and content_hash. Integrations store tool_id, environment, configuration_reference, and status. Credential references store only secret-provider identifiers and rotation metadata, never secret values. Evaluations store subject reference, evaluator, rubric version, score, and outcome. Incidents store severity, category, detection, owner, resolution, and status. Usage records store provider, service, quantity, unit, cost amount, currency, and occurred_at.

audit.events is append-only and includes event_id, workspace_id, event_type, aggregate_type, aggregate_id, actor_type, actor_id, request_id, occurred_at, schema_version, classification, and bounded payload. Ordinary application roles cannot update or delete it.

## Referential and Delete Behavior

Workspace deletion is a governed lifecycle operation, not an application cascade. User deletion must preserve decisions, approvals, incidents, costs, and audit evidence through approved pseudonymization. Document version and publication history is retained when a document retires. Strictly dependent validation findings may cascade with a discarded, non-published validation run only if retention policy permits.

## Access Model

Application-facing tables use RLS with workspace membership and role predicates. Inserts validate workspace ownership. Updates require both visibility and post-update checks. Consequential deletes require narrow policies or trusted workflows. Internal and audit schemas are not exposed through the Data API. Reporting views use security-invoker behavior and explicit grants.

## Index Strategy

Index foreign keys and recurring workspace filters. Add composite indexes matching common predicates such as workspace_id plus status, document_id plus observed_at, and run_id plus sequence_number. Partial indexes may support active memberships, open conflicts, and unresolved incidents. Every index requires a named query or constraint rationale and must be validated against representative query plans.

## Acceptance Criteria

- Every Phase 2.3 entity has a stable primary key and explicit ownership.
- Unique constraints prevent duplicate identities and idempotency records.
- Foreign keys and delete behaviors preserve governed history.
- RLS and grants match workspace and role boundaries.
- Indexes support documented access paths.
- Audit and credential records cannot expose secret material.

## References

- [Schema Specification](Schema_Specification.md)
- [Documentation Data Model](../02_Documentation_Engine/Documentation_Data_Model.md)
- [Database Security Model](Database_Security_Model.md)
- [Core Migration Definitions](Supabase_Core_Migration_Definitions.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.3 core table specifications |
