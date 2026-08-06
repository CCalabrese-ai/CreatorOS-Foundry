# Creator OS Foundry Knowledge Management

**Phase:** 1.3 — Documentation Engine Build  
**Version:** 1.0  
**Document owner:** Documentation Steward and Data Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines how Creator OS Foundry captures, organizes, retrieves, relates, validates, and retires knowledge while preserving canonical authority and provenance.

## Knowledge Classes

| Class | Description | Authority |
| --- | --- | --- |
| Canonical | Approved policies, specifications, registries, decisions, and procedures | Governs according to status |
| Evidence | Source code, tests, logs, research, and operational observations | Supports claims; does not govern by itself |
| Working | Drafts, notes, plans, and unresolved questions | Non-authoritative |
| Derived | Indexes, summaries, embeddings, search results, and generated views | Rebuildable and subordinate |
| Archived | Retired or superseded historical material | Non-governing |

## Core Requirements

- Each canonical subject must have one designated source of truth.
- Canonical documents must identify owner, status, version, and repository path.
- Claims must link to authoritative sources or state their uncertainty.
- Working and derived knowledge must never be presented as approved fact.
- Relationships use stable identifiers or relative canonical links.
- Derived indexes must be rebuildable and must preserve source commit and content hash.
- Data classification propagates to excerpts, summaries, embeddings, and artifacts.
- Access to knowledge follows least privilege and workspace boundaries.

## Taxonomy and Metadata

Knowledge metadata should include document identifier, title, subject domains, owner, status, semantic version, phase, classification, audience, source path, source commit, effective date, review date, related identifiers, replacement path, and content hash. Metadata stored outside Markdown must remain synchronized with the canonical header.

## Relationship Types

| Relationship | Meaning |
| --- | --- |
| governs | Establishes authority over another item |
| implements | Realizes an approved specification |
| depends_on | Requires another source or capability |
| references | Provides non-governing context |
| supersedes | Replaces prior canonical content |
| validates | Supplies acceptance evidence |
| derived_from | Identifies the source of generated knowledge |
| owned_by | Maps the subject to an accountable role |

## Capture Process

1. Identify the knowledge class and accountable owner.
2. Preserve the original source, date, and retrieval context where permitted.
3. Separate external content from governing instructions.
4. Extract candidate facts, decisions, actions, and relationships.
5. Resolve each candidate against existing canonical sources.
6. Draft or update the smallest appropriate document.
7. Validate, review, approve, publish, and index through the lifecycle.

## Retrieval and Search

Search results must prioritize approved and active canonical sources, then baseline sources, then evidence and working material. Results should show title, owner, status, version, source path, and freshness. Semantic retrieval may improve discovery but may not conceal conflicting sources or replace exact identifier and link lookup.

## Conflict Resolution

When two canonical sources conflict, apply the authority hierarchy in the Master Operating Manual, identify the accountable owners, and open a resolution decision. Until resolved, present the conflict explicitly and do not synthesize an unsupported compromise.

## Freshness and Drift

Freshness is event-driven and scheduled. Review is triggered by implementation changes, upstream source changes, incidents, expired review dates, broken links, renamed identifiers, registry lifecycle changes, or user-reported errors. Drift findings must identify evidence, affected consumers, severity, owner, and remediation status.

## Sensitive Knowledge

Secrets, credentials, authentication codes, private keys, raw Restricted data, and unnecessary personal information must not enter documentation, indexes, embeddings, prompts, or logs. Sanitization must preserve meaning while removing sensitive values. Deletion and retention requests must propagate to derived stores when required.

## Archive and Forgetting

Retirement preserves useful history without leaving obsolete instructions in active search results. Archive records must identify prior status, replacement, retirement date, and owner. Derived indexes must remove or clearly demote retired content. Legal, privacy, security, and retention requirements govern permanent deletion.

## Acceptance Criteria

- Canonical, evidence, working, derived, and archived knowledge are distinguishable.
- Every canonical item has an owner, authority, version, and source.
- Retrieval preserves provenance and status.
- Conflicts and drift produce visible owner-assigned work.
- Sensitive-data controls apply to derived knowledge.
- Indexes can be rebuilt from canonical sources.

## References

- [Documentation Engine Architecture](Documentation_Engine_Architecture.md)
- [Documentation Lifecycle Management](Documentation_Lifecycle_Management.md)
- [Documentation QA Standards](Documentation_QA_Standards.md)
- [Master Operating Manual](../00_Governance/Creator_OS_Master_Operating_Manual.md)
- [Database Model](../05_Database/Database_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.3 knowledge-management standard |
