# COS-MVP-002 Documentation Registry Migration Specification

**Phase:** 6.1 — Documentation Center Implementation Foundation
**Version:** 1.0
**Document owner:** Data Owner and Application Owner
**Status:** Active
**Risk class:** High

## Purpose

This specification records the implemented database foundation for the COS-MVP-002 Documentation Registry. It extends the pre-existing empty `public.documents` foundation table and does not create a competing document identity table.

## Implemented Migrations

| Migration | Purpose |
| --- | --- |
| `20260807153019_cos_mvp_002_documentation_registry_foundation_v1.sql` | Document identity fields, versions, ownership, provenance, System Registry references, lifecycle constraints, grants, RLS, transaction-safe creation function, and initial seed |
| `20260807153118_cos_mvp_002_documentation_registry_indexes_v1.sql` | Covering indexes for foreign keys and expected workspace, lifecycle, ownership, provenance, and relationship access paths |
| `20260807153232_cos_mvp_002_documentation_seed_integrity_v1.sql` | Idempotent repair and assertion of initial version and provenance evidence |

The connected Supabase project migration ledger contains the same versions and names.

## Data Structures

| Structure | Authority and use |
| --- | --- |
| `documents` | Stable workspace-scoped identity and current metadata pointer; canonical prose remains in GitHub |
| `document_versions` | Immutable version evidence, source commit, hash, and parent or supersedes relationships |
| `document_ownerships` | Time-bounded human ownership and authority scope |
| `document_provenance` | Source locator, commit, hash, trust state, and observation evidence |
| `document_system_references` | Typed relationship to an authoritative `system_registry_records` identity |

## Lifecycle and Integrity

The allowed states are Draft, Proposed, In Review, Changes Requested, Approved, Published, Superseded, Deprecated, Retired, Archived, Rejected, and Quarantined, stored in lowercase machine form. Stable keys use `COS-DOC-NNN`; versions use semantic `x.y.z`; Git commit and SHA-256 formats are constrained.

A document current-version pointer must identify an immutable version of the same document. Reviews and approvals are not implemented in this slice and remain governed future work. Hard delete is not granted to authenticated users.

## Authorization Model

- Anonymous roles receive no table or creation-function access.
- Active workspace members may read documents and related evidence within their workspace.
- Only active workspace Owners or Administrators may create or update document identities or add version, ownership, provenance, and relationship evidence.
- `create_document_registry_entry` is `SECURITY INVOKER`; it executes the identity, initial version, ownership, provenance, relationship, and current-pointer writes in one transaction under RLS.
- The frontend uses a publishable key and never receives a service-role credential.
- Explicit grants control Data API reachability independently of RLS row authorization.

## Recovery

The migrations are additive. If application activation must be rolled back, disable the Documentation navigation and revoke authenticated execution on the creation function while retaining data for investigation. Destructive rollback requires a separately approved retention and recovery decision. Forward fixes are preferred after a migration reaches the authoritative project ledger.

## Validation

Live validation confirmed five RLS-enabled documentation tables, two policies on each evidence table, three policies on `documents`, no anonymous select access, authenticated select access, and an invoker-rights creation function unavailable to anonymous callers. The three seed identities each have one current version, one primary owner, one verified provenance record, and one System Registry relationship with matching commit and content hashes.

## Future Production Gates

Production release still requires backup and point-in-time recovery evidence, exercised restoration, monitoring and verified alert delivery, capacity validation, retention enforcement, incident response, privileged-access review, and resolution of applicable project-wide security advisories.

## References

- [COS-MVP-002 Documentation Data Model](../07_Applications/COS-MVP-002_Documentation_Data_Model.md)
- [Migration Standards](Migration_Standards.md)
- [Database Security Model](Database_Security_Model.md)
- [Supabase API Security](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.1 migration specification and implementation record |
