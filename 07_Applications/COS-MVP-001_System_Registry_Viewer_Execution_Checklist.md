# COS-MVP-001 System Registry Viewer Data Seed Plan

**Phase:** 4.4 — MVP Build Execution  
**Version:** 1.0  
**Document owner:** Data Owner, Quality Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High  
**Seed ID:** COS-MVP-001-SEED-v1

## Purpose

This plan defines deterministic, synthetic data for implementing and validating the System Registry Viewer without production or personal data.

## Seed Principles

Seeds are repeatable, reviewable, idempotent where practical, traceable to a seed version, and safe for local or isolated preview environments. Fixed identifiers, ordered inserts, and controlled timestamps make assertions stable. Seed execution must fail if it targets an unapproved environment.

## Identity and Workspace Matrix

Create synthetic users for an authorized viewer, a second-workspace member, an expired member, a user with no workspace, and a disabled user. Create two active workspaces plus one suspended workspace. Assign least-privilege roles and memberships so positive, denied, expired, suspended, and cross-workspace paths are all testable.

## Registry Records

Seed representative active and deprecated records for each supported class:

| Type | Minimum examples | Required variation |
| --- | ---: | --- |
| AI agent | 4 | active, draft, deprecated |
| Tool | 4 | approved, restricted, retired |
| Workflow | 3 | active, paused, superseded |
| Application | 2 | proposed, active |
| Module | 4 | enabled, unavailable |
| Integration | 3 | healthy, degraded, disabled |

Each record includes canonical ID, display name, concise description, owner role, lifecycle status, risk class, classification, source path, source commit SHA, content hash, observed time, synchronization state, and version. Relationships include agent-to-tool, workflow-to-agent, application-to-module, and integration-to-tool examples.

## State Fixtures

Provide named fixtures for:

- ready and complete;
- verified empty;
- partial source coverage;
- stale observation;
- source unavailable;
- provenance conflict;
- quarantined record;
- duplicate canonical ID rejected by constraints;
- long labels and descriptions;
- first and final pagination boundaries.

Unknown or failed sources are represented explicitly and never encoded as empty success.

## Load Order

1. Verify the local or isolated preview environment guard.
2. Create Auth identities using the approved local mechanism.
3. Insert workspaces, roles, and memberships.
4. Insert registry types and controlled statuses if modeled.
5. Insert records in canonical-ID order.
6. Insert relationships after both endpoints exist.
7. Insert source observations, sync outcomes, and health fixtures.
8. calculate or load approved content hashes deterministically.
9. run constraint, count, and provenance assertions.
10. record seed version and evidence digest.

## Security Controls

No production identifiers, emails, credentials, tokens, private documents, or copied customer data are allowed. Anonymous access returns nothing. The browser may read only rows permitted by active membership and classification policy. Service-level seed privileges are confined to the seed process and are never shipped to the application.

## Validation

Validation proves stable record counts by type and workspace; unique canonical identifiers; valid relationships; fixed pagination order; lifecycle and risk constraints; content-hash format; explicit freshness; authorized visibility; cross-workspace isolation; expired and suspended denial; and cleanup safety. The expected-result manifest is versioned with the seed.

## Reset and Cleanup

The supported local reset rebuilds schema and seeds from repository configuration. Preview cleanup removes only seed-version-tagged synthetic rows after validating the target. Production cleanup is prohibited. Shared migration history is not edited to change seed behavior.

## Acceptance Criteria

- A clean reset produces the same authorized records, relationships, order, and expected digest.
- Every supported registry type and UI state has a representative fixture.
- Positive and negative membership cases are reproducible.
- Provenance values reconcile with the approved canonical-source manifest.
- RLS and service tests prove cross-workspace isolation and denied direct writes.
- No production, personal, or secret data is present.
- Reset and cleanup steps are bounded and independently reviewable.

## References

- [System Registry Viewer Build Implementation](COS-MVP-001_System_Registry_Viewer_Build_Implementation.md)
- [MVP First Supabase Migration](MVP_First_Supabase_Migration.md)
- [Supabase Seed Data Definitions](../05_Database/Supabase_Seed_Data_Definitions.md)
- [MVP System Registry Implementation](MVP_System_Registry_Implementation.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial deterministic seed plan for COS-MVP-001 |
