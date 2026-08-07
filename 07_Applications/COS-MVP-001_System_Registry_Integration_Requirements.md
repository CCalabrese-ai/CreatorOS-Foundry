# COS-MVP-001 System Registry Integration Requirements

**Phase:** 4.5 — MVP System Registry Implementation  
**Version:** 1.0  
**Document owner:** Architecture Owner, Integration Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Requirements ID:** COS-MVP-001-INT-v1

## Purpose

This document defines the contracts and controls connecting canonical GitHub registry sources, synchronization, Supabase, the backend service, the Control Center frontend, and release evidence.

## Integration Map

| Boundary | Producer | Consumer | Required contract |
| --- | --- | --- | --- |
| Canonical Markdown | Domain registry owners | Registry synchronizer | Stable IDs, headers, tables, lifecycle, owner, risk |
| Source checkpoint | GitHub repository | Synchronizer | Repository, path, commit SHA, content hash |
| Normalized read model | Synchronizer | Supabase | Validated record, relationship, provenance, sync event |
| Protected data service | Supabase | Backend | RLS-safe typed projections and explicit grants |
| View-model API | Backend | Frontend | Versioned list, detail, health, errors, freshness |
| Operational evidence | All components | Quality and Release Owners | Correlation, release, migration, seed, test, artifact identity |

## Canonical Source Requirements

The AI Workforce Registry, Tool Registry, Workflow Registry, application specifications, module specifications, and approved integration metadata remain authoritative. Synchronization selects an immutable commit, parses only supported structures, validates required fields, calculates hashes, and records the checkpoint. Chat content, working drafts, and unapproved generated text are not sources.

## Synchronization Requirements

The synchronization operation must be idempotent for a source commit and parser version. It validates stable identifiers, versions, controlled status, ownership, risk, paths, and relationships before publication. Invalid records enter quarantine. A partial run cannot overwrite the last valid complete view. Deletion requires canonical retirement evidence. Rebuild from an approved commit must reproduce the same normalized digest.

## Supabase Requirements

Migrations define all schema, policies, grants, indexes, and views. Newly created Data API objects receive explicit grants; availability is never assumed from defaults. Every exposed table has RLS, and exposed views use security-invoker behavior where supported. Anonymous registry access and client writes are denied. Internal sync and finding objects remain outside exposed schemas or fully revoked.

## Backend Integration Requirements

The backend validates current identity and membership before using workspace or record inputs. It queries only approved projections, uses explicit field lists, enforces cursor and page limits, and returns versioned contracts. It communicates completeness, observed time, validity, synchronization state, release identity, and safe correlation.

## Frontend Integration Requirements

The frontend trusts only server-provided allowed actions, counts, provenance, and state. Cache keys include workspace and authorization context. Workspace changes and sign-out purge scoped data. The browser holds only publishable configuration and never service-role, secret, repository, or direct database credentials.

## Contract Versioning

Backward-compatible additions increment a minor contract version. Breaking field, meaning, authorization, pagination, or error changes require a new major version and coordinated rollout. Producers publish before consumers switch. The previous compatible path remains available only for the approved transition window.

## Security and Privacy

All boundaries use least privilege, authenticated transport, environment-specific configuration, secret references, log redaction, and non-production fixtures. Source links are authorized separately from record metadata. Integration health cannot reveal provider credentials, private repository URLs, inaccessible names, or internal findings.

## Reliability and Idempotency

Synchronization uses a unique run identity, source checkpoint, parser version, and idempotency key. Requests use timeouts and bounded retries only when safe. Consumers distinguish unavailable from empty. Replay, duplicate delivery, out-of-order checkpoint, stale data, partial sources, and dependency failure are tested.

## Observability

Correlation spans synchronization, database write, backend read, frontend load, and demo evidence without exposing secrets or content. Record service and contract versions, source checkpoint, sync result, completeness, latency, policy outcome, release ID, and environment. Alerts cover failed or delayed synchronization, hash conflicts, checkpoint gaps, cross-workspace denials, and sustained service errors.

## Environments and Promotion

Local and preview use deterministic synthetic data. Environment targets are independently confirmed before any migration, seed, or sync. Artifacts, migrations, contracts, and parser versions promote immutably. Production integration is outside Phase 4.5 and requires a separate approved release decision.

## Integration Validation

Validate parser fixtures, source hashes, idempotent replay, relationship reconciliation, explicit grants, RLS, backend contracts, frontend state mapping, cache isolation, correlation, dependency failure, recovery, and end-to-end provenance. Evidence identifies every component version and environment.

## Acceptance Criteria

- Each boundary has a named producer, consumer, versioned contract, owner, and failure behavior.
- A registry row and relationship trace end to end to one approved source commit.
- Synchronization is idempotent and partial failure preserves the last valid view.
- Supabase grants, RLS, and view behavior are explicit and tested.
- Backend and frontend contracts preserve authorization, freshness, and completeness.
- Secrets and protected source details do not cross into the browser or evidence.
- Replay, failure, recovery, and version-compatibility tests pass.
- Production integration remains blocked until separately approved.

## References

- [System Registry Database Implementation](COS-MVP-001_System_Registry_Database_Implementation.md)
- [System Registry Backend Implementation](COS-MVP-001_System_Registry_Backend_Implementation.md)
- [System Registry Frontend Implementation](COS-MVP-001_System_Registry_Frontend_Implementation.md)
- [GitHub Supabase Synchronization](../02_Documentation_Engine/GitHub_Supabase_Synchronization.md)
- [Integration Standards](../06_Automations/Integration_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial COS-MVP-001 integration requirements |
