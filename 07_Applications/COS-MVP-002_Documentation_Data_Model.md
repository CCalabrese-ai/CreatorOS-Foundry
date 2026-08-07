# COS-MVP-002 Documentation Data Model

**Phase:** 6.0 — Documentation Center Planning
**Version:** 1.0
**Document owner:** Data Owner and Documentation Steward
**Status:** Proposed
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release classification:** Planning only — Not Implemented

## Purpose

This document defines the logical data model required by the Documentation Center. It refines the existing Documentation Engine model for COS-MVP-002 without creating physical tables, migrations, seed records, or runtime configuration.

## Authority and Modeling Rules

- GitHub Markdown identified by repository, path, and commit SHA is canonical content.
- Supabase records governed identity, lifecycle, ownership, workflow, provenance, audit, and rebuildable discovery projections.
- All tenant-owned entities carry an immutable workspace boundary.
- Version records, approval decisions, publication evidence, and audit events are append-only.
- System, agent, workflow, tool, and application relationships reference System Registry identities rather than duplicating those entities.
- Derived indexes and summaries retain source version and hash and can be rebuilt.

## Logical Entities

Physical names and column types will be finalized through reviewed implementation migrations.

| Entity | Purpose | Required logical fields |
| --- | --- | --- |
| Document | Stable governed document identity | id, workspace_id, document_key, title, document_type, domain, classification, lifecycle_state, current_version_id, owner_assignment_id |
| Document Version | Immutable candidate or observed canonical revision | id, document_id, semantic_version, source_repository, source_path, source_commit_sha, content_hash, candidate_hash, created_by, created_at, publication_state |
| Owner Assignment | Time-bounded accountable ownership | id, document_id, owner_identity_id, owner_role, authority_scope, effective_at, ended_at |
| Document Relationship | Typed link to a document or registered entity | id, workspace_id, source_document_id, target_kind, target_key, relationship_type, observed_target_version, effective_at, ended_at |
| Source Record | Provenance for claims or imported input | id, document_version_id, source_type, source_locator, source_hash, trust_state, retrieved_at |
| Review Request | Assignment to assess an exact candidate | id, document_version_id, reviewer_identity_id, reviewer_role, ruleset_version, due_at, status |
| Review Decision | Attributable review disposition | id, review_request_id, candidate_hash, decision, rationale_ref, decided_at |
| Approval Decision | Explicit authority decision on an exact candidate | id, document_version_id, approver_identity_id, authority_scope, candidate_hash, decision, acceptance_statement_ref, decided_at |
| Validation Run | Reproducible automated or human check set | id, document_version_id, ruleset_version, run_type, status, started_at, completed_at, evidence_ref |
| Validation Finding | Individual validation outcome | id, validation_run_id, rule_id, severity, location_ref, status, owner_identity_id |
| Workflow Run | State and evidence for a governed process | id, workspace_id, workflow_key, document_id, initiator_id, state, base_version_id, idempotency_key, correlation_id |
| Publication Event | Canonical publication, supersession, or retirement evidence | id, document_version_id, event_type, actor_identity_id, source_commit_sha, content_hash, occurred_at |
| Synchronization Event | Idempotent GitHub-Supabase processing ledger | id, workspace_id, provider_event_id, handler_version, source_commit_sha, status, attempt_count, occurred_at |
| Synchronization Conflict | Drift or authority mismatch requiring resolution | id, document_id, expected_hash, observed_hash, conflict_type, severity, status, owner_identity_id |
| Audit Event | Append-only security and governance evidence | id, workspace_id, actor_identity_id, action, resource_kind, resource_id, result, correlation_id, occurred_at |
| Discovery Projection | Rebuildable authorized search/index record | document_version_id, source_commit_sha, content_hash, searchable_metadata, generated_at, projection_version |

## Document Metadata

Each stable document identity requires:

- a unique `document_key` within its workspace;
- title, summary, document type, domain, tags, and intended audience;
- classification, risk class, lifecycle state, owner role, and review date;
- current canonical repository, path, branch policy, semantic version, commit SHA, and content hash;
- created, updated, effective, deprecated, retired, and last-verified timestamps when applicable;
- source, relationship, validation, review, approval, publication, and synchronization summaries derived from their evidence records.

Metadata changes that affect authority, classification, ownership, or lifecycle require the same approval rigor as content changes.

## Ownership Model

Ownership is an explicit, time-bounded assignment to a human identity and an authority role. The Internal MVP may assign one human to multiple roles, but each assignment must remain independently recorded. Agents and service identities may perform delegated work but cannot be the accountable Product, Data, Security, Quality, Application, Documentation, or Release authority.

Historical owner assignments remain queryable. An owner change must not rewrite the actor recorded on earlier reviews, approvals, publications, or audit events.

## Versioning Model

- A document has one stable identity and many immutable versions.
- Semantic versions express governed meaning; Git commit SHA and content hash provide immutable source evidence.
- A candidate version is not canonical until an authorized publication event confirms its GitHub commit and hash.
- Reviews and approvals bind `document_version_id` and `candidate_hash` and become stale if content changes.
- The current version pointer changes only after permitted lifecycle, validation, approval, publication, and synchronization conditions pass.
- Supersession links the replacement version or document explicitly; it never overwrites history.
- Repeated processing of the same document, commit, content hash, and handler version must produce one logical result.

## Lifecycle States

| State | Meaning | Permitted next states |
| --- | --- | --- |
| Draft | Work in progress with no governing authority | Proposed, Archived |
| Proposed | Candidate ready for formal validation and review | Draft, In Review, Rejected |
| In Review | Exact candidate is under assigned review | Changes Requested, Approved, Rejected |
| Changes Requested | Candidate requires revision | Draft, Proposed |
| Approved | Exact candidate has required explicit approval | Published, Superseded, Archived |
| Published | Canonical GitHub publication and synchronized evidence agree | Proposed, Superseded, Deprecated |
| Superseded | A newer approved version or replacement governs | Archived |
| Deprecated | Valid only during an approved transition | Published, Retired |
| Retired | Must not govern new work | Archived, Proposed through an explicit restoration process |
| Archived | Retained for history and excluded from active discovery | Proposed through an explicit restoration process |
| Rejected | Candidate closed without authority | Draft, Archived |
| Quarantined | Security, integrity, or synchronization concern blocks promotion | Prior safe state after resolution and revalidation |

Transitions must be mechanically enforced. A failed workflow records its terminal result without inventing a document lifecycle transition.

## Provenance Tracking

Every canonical or candidate version must identify:

- originating repository, branch policy, path, base commit, resulting commit when published, and normalized content hash;
- creator or initiating identity, workflow run, creation time, and tool or agent assistance used;
- sources with locator, retrieval time, hash when available, and trust state;
- validation ruleset and evidence, human review, approval authority, and publication receipt;
- synchronization handler version, observed time, checkpoint, conflict state, and last verification time.

Generated content must identify the responsible agent, model or tool reference where approved, source set, and human decision boundary. Provenance metadata cannot substitute for authorization.

## Relationships to Registered Entities

`target_kind` initially permits `document`, `system`, `agent`, `workflow`, `tool`, and `application`. A relationship to a non-document target stores the stable System Registry key and may store an observed registry version for change detection. It must not copy the target's authoritative ownership, status, or configuration.

Relationship resolution must preserve workspace authorization. An authorized document does not grant access to a restricted target, and an authorized registry entry does not grant access to restricted document content.

## Integrity and Security Constraints

- Stable document keys are unique within a workspace.
- Active canonical paths are unique within the governed repository scope.
- Version observations are unique by document, source commit, and content hash.
- Provider events and idempotency keys are unique within their bounded workflow scope.
- A published version requires matching GitHub commit, hash, approval, and synchronization evidence.
- A blocking finding prevents approval or current-version promotion.
- Cross-workspace relationships, ownership assignments, and workflow actions are prohibited.
- Hard deletion requires an approved privacy, retention, or security process and must address derived stores.
- Classification propagates to versions, sources, findings, snippets, projections, embeddings, exports, and logs.

## Retention and Derived Data

Document identity, versions, approvals, publications, and audit events follow the approved retention schedule. Archival changes discoverability, not historical integrity. Search projections, snippets, summaries, and embeddings are derived and may be deleted and rebuilt from authorized canonical sources. Restricted content may not enter a derived store until classification-specific processing is approved.

## Data Model Acceptance Criteria

- The logical model represents identity, metadata, ownership, immutable versions, lifecycle, provenance, workflows, and audit evidence.
- Relationships to systems, agents, workflows, tools, applications, and documents use stable governed identifiers.
- Published authority can be proven from GitHub commit and matching hash evidence.
- Stale decisions, duplicate events, cross-workspace references, and invalid transitions are mechanically detectable.
- Archival and supersession preserve history and do not rely on destructive deletion.
- The model can be implemented with RLS and explicit Data API exposure without privileged browser access.

## Deferred Production Gates

Production implementation must add verified retention enforcement, backup and point-in-time recovery, exercised restoration, volume and performance evidence, production monitoring and alert receipt, privacy deletion orchestration, key rotation, and operational ownership. These requirements remain planned future gates.

## References

- [Documentation Data Model](../02_Documentation_Engine/Documentation_Data_Model.md)
- [Database Schema Specification](../05_Database/Schema_Specification.md)
- [COS-MVP-002 Architecture](COS-MVP-002_Documentation_Center_Architecture.md)
- [MVP Document Registry Implementation](MVP_Document_Registry_Implementation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.0 logical data model |
