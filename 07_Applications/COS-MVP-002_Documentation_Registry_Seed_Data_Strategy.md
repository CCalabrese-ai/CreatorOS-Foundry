# COS-MVP-002 Documentation Registry Seed Data Strategy

**Phase:** 6.1 — Documentation Center Implementation Foundation
**Version:** 1.0
**Document owner:** Documentation Steward and Data Owner
**Status:** Active
**Risk class:** Moderate

## Purpose

This document defines the initial Documentation Registry seed and the rules for adding future seed records. Seeds establish demonstrable metadata, lifecycle, ownership, provenance, versions, and System Registry relationships without copying canonical document bodies into Supabase.

## Initial Records

| Document ID | Canonical document | Lifecycle | Owner role | System reference |
| --- | --- | --- | --- | --- |
| COS-DOC-001 | Creator OS Foundry Documentation Standards | Published | Documentation Steward | COS-WF-001 |
| COS-DOC-002 | Documentation Engine Architecture | Approved | Documentation Steward | COS-AI-001 |
| COS-DOC-003 | COS-MVP-002 Documentation Center Product Specification | Proposed | Product Owner | COS-MVP-001 |

The seed deliberately demonstrates three lifecycle states. Each record uses semantic version `1.0.0`, a canonical repository-relative Markdown path, the exact source commit used during seeding, a SHA-256 content hash, the active workspace, one primary human owner assignment, one verified GitHub provenance record, and one typed System Registry relationship.

## Seed Rules

- Use stable document IDs and deterministic fixture UUIDs only for approved foundational seed records.
- Calculate hashes from canonical file bytes and record an authoritative commit available in GitHub.
- Never seed document bodies, credentials, tokens, production approvals, inferred owner identities, or sensitive examples.
- Resolve human owner assignments from an active workspace Owner only for this single-owner Internal MVP. Future multi-owner seeds require explicit identity mapping.
- Resolve system references by stable canonical ID; never duplicate System Registry names or authority.
- Use conflict-safe writes and integrity assertions so replay does not create duplicate identities, versions, provenance, owners, or relationships.
- Treat lifecycle values as evidence, not a shortcut around review or approval.

## Environment Strategy

The Internal MVP project receives the three approved foundational records through migrations so the running feature has traceable baseline data. Local and test environments may use additional clearly labeled fixtures. Production-class environments must load only approved canonical records through a reviewed ingestion or migration process.

## Validation

Seed validation must confirm record counts, current-version pointers, matching commit and content hashes, one active primary owner, verified provenance, valid System Registry foreign keys, workspace consistency, and idempotent replay behavior. An incomplete seed blocks feature validation and requires a forward migration; it must not be hidden as an empty state.

## Future Production Gates

Before production seeding, define data ownership separation, retention, backup and restoration, environment promotion, secrets scanning, source reconciliation, monitoring, alerting, and approval evidence. Internal MVP seed success does not satisfy those gates.

## References

- [Migration Specification](../05_Database/COS-MVP-002_Documentation_Registry_Migration_Specification.md)
- [Documentation Data Model](COS-MVP-002_Documentation_Data_Model.md)
- [System Registry Data Seed Plan](COS-MVP-001_System_Registry_Viewer_Data_Seed_Plan.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.1 seed strategy and baseline records |
