# Creator OS Foundry MVP Document Registry Implementation

**Phase:** 4.2 — MVP Core Build Specification  
**Version:** 1.0  
**Document owner:** Documentation Steward, Data Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the MVP Document Registry that exposes authorized, provenance-rich metadata for canonical GitHub Markdown and its governed lifecycle.

## Authority Model

GitHub Markdown at a repository path and commit SHA is canonical content. Supabase stores stable document identity, observed versions, ownership, classification, lifecycle, relationships, review and validation state, synchronization evidence, and rebuildable discovery records. It cannot silently supersede GitHub content.

## Registry Record

| Field group | Required fields |
| --- | --- |
| Identity | document_id, workspace_id, document_key, title |
| Canonical source | repository, branch policy, repository_path, commit_sha, content_hash |
| Governance | owner_role, status, semantic_version, classification, risk_class |
| Lifecycle | created_at, updated_at, effective_at, review_due_at, supersedes |
| Quality | validation_state, blocking_findings, review_state, approval_state |
| Knowledge | domains, relationships, source count, index state |
| Synchronization | observed_at, checkpoint, sync_status, conflict_state |
| Concurrency | row version and current canonical version reference |

Document content is fetched only when authorized and necessary.

## Ingestion

1. Receive or schedule an approved repository commit.
2. Deduplicate the provider event and validate repository, branch, and path scope.
3. Read Markdown as untrusted content.
4. Parse required headers and calculate the normalized content hash.
5. Validate stable key, owner, status, version, classification, links, and secret findings.
6. Create one immutable document version for a new commit and content hash.
7. Update the current pointer only when lifecycle and validation rules permit.
8. Extract typed relationships and source metadata.
9. Update rebuildable search records.
10. Record publication, synchronization, audit, and checkpoint evidence.

The same event or commit replay must not create duplicate versions.

## Query and Search

The service supports authorized list, detail, exact key lookup, owner, status, domain, classification, risk, review state, finding state, freshness, and relationship filters. Search returns only authorized names, snippets, counts, and facets. Results state source commit, observed time, completeness, and index freshness.

## Document Detail

Detail shows canonical path, commit SHA, content hash, semantic version, owner, status, classification, relationships, sources, validation, review, approval, publication, synchronization, and audit references. GitHub links appear only when the user can access the source and the destination is allowlisted.

## Lifecycle and Concurrency

Create, update, review, approve, publish, deprecate, retire, and restore transitions follow the Documentation Engine. Review binds the exact content hash. The current pointer uses optimistic concurrency. A changed canonical file invalidates stale review and approval attempts.

## Authorization and RLS

Every tenant record carries workspace_id and uses RLS plus explicit server query scope. Content, source links, relationships, counts, search, findings, reviews, and audit evidence are authorized separately. Service-role access remains confined to approved server ingestion and reconciliation adapters.

## Synchronization Conflict

A GitHub commit with a valid document version but failed metadata synchronization produces a degraded state while preserving canonical evidence. Hash mismatch, path reuse, duplicate key, missing source, or divergent current pointers create a conflict record. The UI must not invent a successful sync.

## Failure and Recovery

Invalid documents enter quarantine without replacing the last valid registry version. A failed event may be retried safely through the ingestion ledger. Operators may replay from a known checkpoint or rebuild all derived records from GitHub. Unknown publication outcome is reconciled against repository evidence before another write.

## Testing

Test new, updated, moved, deprecated, retired, duplicate, replayed, malformed, oversized, secret-like, malicious Markdown, broken links, changed hashes, stale reviews, source denial, partial sync, checkpoint gaps, rebuild, search leakage, cross-workspace access, RLS, and GitHub timeout.

## Acceptance Criteria

- Every document record traces to canonical GitHub evidence.
- One commit and content hash create at most one document version.
- Review and approval bind the exact candidate.
- Invalid or conflicted content cannot replace the last valid registry state.
- Lists, search, content, counts, and source links preserve authorization.
- Derived discovery records can be rebuilt from GitHub.
- The Control Center distinguishes published, synchronizing, degraded, quarantined, failed, and unknown outcomes.

## References

- [Documentation Data Model](../02_Documentation_Engine/Documentation_Data_Model.md)
- [Documentation Engine Implementation Plan](../02_Documentation_Engine/Documentation_Engine_Implementation_Plan.md)
- [GitHub-Supabase Synchronization](../02_Documentation_Engine/GitHub_Supabase_Synchronization.md)
- [MVP Documentation Module Component Specification](MVP_Documentation_Module_Component_Specification.md)
- [MVP First Feature Implementation](MVP_First_Feature_Implementation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.2 Document Registry implementation |
