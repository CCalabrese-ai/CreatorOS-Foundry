# COS-MVP-002 Documentation Center Architecture

**Phase:** 6.0 — Documentation Center Planning
**Version:** 1.0
**Document owner:** Application Owner, Documentation Steward, and Data Owner
**Status:** Proposed
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release classification:** Planning only — Not Implemented

## Purpose

This document defines the proposed architecture for the Documentation Center. It converts the product specification into bounded frontend, backend, data, integration, security, and data-flow responsibilities without creating application code or infrastructure.

## Architectural Principles

- GitHub Markdown at an approved repository path and commit SHA remains the canonical document content and version history.
- Supabase stores workspace-scoped identity, metadata, lifecycle, workflow, provenance, audit, synchronization, and rebuildable discovery data.
- The System Registry remains authoritative for registered system, agent, tool, workflow, and application identities.
- Every write crosses a server-side authorization, validation, concurrency, and audit boundary.
- The UI reports only verified durable outcomes and exposes degraded or unknown state honestly.
- Derived summaries, search records, and embeddings never become canonical and must be rebuildable.

## System Context

| Component | Responsibility | Authority boundary |
| --- | --- | --- |
| Documentation Center frontend | Authorized discovery, detail, intake, review, approval, version, and archive experiences | No privileged credentials or direct canonical writes |
| Documentation service | Authorization, validation, lifecycle transitions, query shaping, idempotency, and orchestration | Enforces product and governance contracts |
| Supabase | Auth, workspace access, governed metadata, workflow state, audit, and derived discovery | Does not silently replace canonical Markdown |
| GitHub adapter | Reads exact commits and submits approved changes through bounded paths | Publication requires approved identity and immutable evidence |
| System Registry service | Resolves canonical external entity IDs and display metadata | Documentation Center stores references, not duplicate registry records |
| Documentation Architect Agent | Assists with bounded drafting, validation, and handoffs | Cannot approve, publish, lower classification, or grant access |

## Frontend Requirements

The frontend must provide:

- a document library with authorized search, filters, sorting, pagination, freshness, and lifecycle indicators;
- a document detail view with safe Markdown rendering, metadata, owner, classification, provenance, relationships, version timeline, validation, and publication evidence;
- a creation intake that captures the COS-WF-001 contract and retains recoverable input;
- review and approval views bound to an immutable candidate hash and version;
- version comparison, supersession, archival, and restoration confirmation experiences;
- explicit loading, empty, partial, stale, denied, degraded, quarantined, unavailable, conflict, unknown, error, and success states;
- keyboard-complete operation, logical focus management, programmatic labels, live status announcements, non-color status cues, and responsive table alternatives.

The browser must use an authenticated user session and public client configuration only. It must not contain a Supabase service-role key, GitHub write credential, webhook secret, or unrestricted repository token.

## Backend Requirements

The backend service layer must:

1. Resolve the authenticated identity, active workspace, membership, and required capability for every request.
2. Scope all queries by workspace before applying document-specific authorization.
3. Validate request schemas, identifiers, classifications, path allowlists, sizes, and content types.
4. Enforce lifecycle transition rules and bind reviews and approvals to exact immutable candidates.
5. Use optimistic concurrency against the observed document version or source commit.
6. Require stable idempotency keys for side-effecting operations.
7. Orchestrate GitHub publication and Supabase synchronization without reporting success before verification.
8. Emit structured, sanitized audit and observability events with correlation IDs.
9. Return stable error categories and safe recovery guidance without exposing restricted data.
10. Provide reconciliation for missed events, uncertain publication outcomes, and projection drift.

Privileged repository and database operations must run only in approved server-side adapters with the minimum required permissions.

## Supabase Integration Requirements

- Authentication must establish identity; current active workspace membership must establish authorization.
- Every tenant-owned table must include `workspace_id`, enforce RLS, and use explicit workspace and capability predicates.
- `authenticated` role membership alone is not sufficient authorization.
- Browser-facing tables, views, functions, storage objects, counts, search, and relationship queries must all preserve the same authorization boundary.
- User-editable authentication metadata must not grant roles or release authority.
- Update operations require both visibility of the current row and validation of the resulting row.
- Exposed schemas and table grants must be explicit; new tables must not be assumed available through the Data API.
- Privileged functions belong outside exposed schemas where practical and must use explicit grants and a controlled search path.
- Migrations must be ordered, additive where possible, reviewable, reproducible, and validated with positive and negative tests.
- Realtime, Storage, Edge Functions, and database webhooks may be used only when their authorization, replay, failure, and observability contracts are documented.

## Relationship to COS-MVP-001 System Registry

The Documentation Center consumes the existing System Registry through a read-only service contract. A document relationship stores the external entity type, stable registry key, and optional observed registry version. Display names and current status are resolved from the registry rather than copied as authority.

Supported relationship types initially include `governs`, `documents`, `implements`, `depends_on`, `references`, `validates`, `supersedes`, `owned_by`, and `operated_by`. Broken, unauthorized, or retired references remain visible only to authorized users as unresolved relationship states; they must not be silently deleted or relabeled.

COS-MVP-002 must not modify System Registry records, reuse its tables as a document store, or infer access to documentation from the visibility of a related registry entry.

## Security Considerations

- Enforce least privilege and workspace isolation at the UI, service, database, search, storage, and audit layers.
- Sanitize Markdown, block unsafe HTML and URLs, and treat repository content, imported sources, webhooks, and model output as untrusted.
- Apply classification before fetching content, generating snippets, calling agents, indexing, logging, or returning relationship details.
- Keep secrets in approved server-side configuration and redact secret-like values from errors and telemetry.
- Verify GitHub webhook signatures, repository identity, branch, path, event type, and payload limits.
- Agents may prepare candidates and findings but cannot grant access, approve their own work, or publish without an authorized workflow.
- Record security-relevant denials, policy failures, classification changes, and privileged actions without recording sensitive document bodies.

## Data Flow

### Read and discovery flow

1. The user authenticates and selects an authorized workspace.
2. The frontend sends a bounded list, search, or detail request.
3. The service verifies membership and capability, then applies workspace and document policy.
4. Supabase returns only authorized metadata, facets, relationships, and provenance.
5. When content is required, the service resolves the exact approved GitHub commit and verifies its hash.
6. The service safely transforms authorized content and returns freshness and source evidence.
7. The frontend renders the verified result or a truthful restricted, stale, degraded, or unavailable state.

### Change and publication flow

1. An authorized user submits a validated request with an idempotency key and observed base version.
2. The service records the workflow and produces or receives an immutable candidate.
3. Automated checks and assigned human review create evidence bound to the candidate hash.
4. An authorized human records an explicit approval; changed content invalidates stale decisions.
5. The GitHub adapter publishes through the approved repository path and records the resulting commit.
6. The primary GitHub-to-Supabase synchronization flow verifies the commit, hash, metadata, and relationships.
7. The service marks the workflow complete only when canonical and projection evidence agree.
8. Failures retain the last verified state and enter retry, reconciliation, conflict, or quarantine handling as appropriate.

## Failure and Recovery

GitHub unavailability must not erase the last verified projection. Supabase unavailability must not transfer authority away from GitHub. Unknown publication outcomes require reconciliation before retry. Hash mismatch, duplicate key, unauthorized relationship, stale base commit, or invalid lifecycle transition must fail closed and create owner-routed evidence. Derived indexes may be rebuilt; workflow, approval, publication, and audit evidence must be preserved according to retention policy.

## Architecture Acceptance Criteria

- Every interface has a named authority, authorization, input, output, failure, and audit contract.
- Canonical content cannot be changed by a browser or Supabase projection alone.
- The System Registry relationship is read-only, stable-ID based, and non-duplicative.
- Workspace isolation applies equally to records, content, search, counts, relationships, and evidence.
- Publication success requires matching GitHub and synchronization evidence.
- The architecture supports deterministic denial, stale candidate, replay, drift, and recovery tests.
- No implementation or infrastructure change is implied by approval of this planning document.

## Deferred Production Gates

Before production classification, the implementation must prove backup and point-in-time recovery, exercised recovery and rollback, production alert delivery and receipt, full monitoring and observability, performance and capacity, incident response, retention enforcement, privileged access review, key rotation, and expanded infrastructure controls. These gates remain separate from Internal MVP acceptance.

## References

- [COS-MVP-002 Product Specification](COS-MVP-002_Documentation_Center_Product_Specification.md)
- [Documentation Engine Architecture](../02_Documentation_Engine/Documentation_Engine_Architecture.md)
- [GitHub-Supabase Synchronization](../02_Documentation_Engine/GitHub_Supabase_Synchronization.md)
- [MVP System Registry Implementation](MVP_System_Registry_Implementation.md)
- [Application Security Model](Application_Security_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.0 Documentation Center architecture |
