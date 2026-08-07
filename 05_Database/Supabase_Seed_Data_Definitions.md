# Creator OS Foundry Supabase Seed Data Definitions

**Phase:** 2.3 — Supabase Core Schema Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Security Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines deterministic seed data for local and controlled non-production environments. Seeds establish required reference values and representative test states without copying production users, secrets, personal data, or customer content.

## Seed Classes

| Class | Purpose | Production eligibility |
| --- | --- | --- |
| Required reference | Controlled statuses, relationship types, risk levels, and system capabilities required by constraints | Allowed through reviewed migration or controlled bootstrap |
| Environment bootstrap | Default development workspace, roles, and feature configuration | Development and approved staging only |
| Test fixture | Representative users, documents, workflows, runs, incidents, and validation outcomes | Local and ephemeral test environments only |
| Demo content | Human-readable walkthrough data | Explicit demo environments only |
| Production data | Real users, content, credentials, transactions, or exports | Prohibited in seed files |

## Required Reference Definitions

Initial controlled values include:

- document statuses: Draft, Proposed, Baseline, Approved, Active, Deprecated, Retired;
- lifecycle states: pending, in_progress, waiting, succeeded, failed, cancelled, quarantined;
- decisions: approved, changes_requested, rejected, abstained;
- risk levels: low, moderate, high, critical;
- classifications: public, internal, confidential, restricted;
- relationship types: governs, implements, depends_on, references, supersedes, validates, derived_from, owned_by;
- actor types: human, agent, workflow, service, system;
- incident severities: SEV-1, SEV-2, SEV-3, SEV-4;
- environments: local, development, preview, staging, production.

Values use stable keys independent of display labels. Changes require migration review because application and policy behavior may depend on them.

## Bootstrap Definitions

A local bootstrap may create one deterministic development workspace, standard role keys, non-sensitive policy references, sample tool and agent registry entries, and an initial documentation workflow definition. IDs must be stable UUID fixtures or resolved by natural keys. Bootstrap records must be visibly non-production and safe to recreate.

No seed may contain sign-in passwords, API keys, service-role keys, webhook secrets, private repository tokens, production URLs, billing identifiers, or copied authentication rows.

## Fixture Scenarios

The test seed set should cover:

- two isolated workspaces;
- members with viewer, author, reviewer, and administrator roles;
- an inactive membership;
- documents in Draft, Approved, Deprecated, and Retired states;
- immutable versions with distinct commit SHAs and content hashes;
- one passing and one blocking validation run;
- review approval and requested-change outcomes;
- duplicate-event and out-of-order synchronization cases;
- active, failed, retried, and quarantined workflow runs;
- an open incident and a resolved incident;
- public, internal, confidential, and restricted classifications.

Fixtures must use synthetic identities and clearly fictional data.

## File Organization

Use a small root seed file with ordered includes only when supported by the pinned Supabase configuration. Group seed files by reference, bootstrap, and test fixtures. The repository configuration defines the executed order. Seed SQL must be readable, schema-qualified, deterministic, and safe on a clean reset.

## Idempotency

Reference and bootstrap inserts use stable keys with explicit conflict behavior. Fixture cleanup is limited to controlled local or ephemeral environments. Seed execution must not depend on wall-clock values, external services, or random generation unless a fixed seed produces reproducible results.

## Auth Fixtures

Login-capable users should be created through approved local test utilities or Auth administration flows. Direct inserts into Supabase-managed auth tables are avoided unless current official guidance and the pinned local environment explicitly support the fixture method. Authorization data belongs in protected application records or app metadata, not user-editable metadata.

## Validation

Seed validation confirms:

- every required controlled value exists exactly once;
- foreign keys and check constraints pass;
- fixture counts match the manifest;
- workspace isolation tests have both allowed and denied cases;
- no secret-like or production-like values are present;
- repeated clean resets produce identical logical data;
- production deployment paths do not include test or demo seeds.

## Environment Rules

Local resets may load all approved fixtures. Preview and staging load required reference data plus an explicitly selected synthetic fixture set. Production receives only required controlled reference data through the reviewed deployment path. The production command must not include general seed execution.

## Failure and Recovery

A seed failure blocks environment readiness. Correct the seed locally and repeat a clean reset. Shared reference values already applied are corrected by migration rather than editing an applied migration. Accidental non-production fixture deployment to production is treated as an incident: stop automation, preserve evidence, assess exposure, remove data through an approved migration or cleanup workflow, and validate audit and backups.

## Acceptance Criteria

- Seeds are deterministic and safe to commit.
- Production data and credentials are absent.
- Required reference values support schema constraints.
- Fixtures exercise positive and negative authorization paths.
- A clean reset reproduces the same logical state.
- Production paths cannot accidentally apply test fixtures.

## References

- [Initial Seed Data Strategy](Initial_Seed_Data_Strategy.md)
- [Core Migration Definitions](Supabase_Core_Migration_Definitions.md)
- [Core Table Specifications](Supabase_Core_Table_Specifications.md)
- [Supabase Seeding](https://supabase.com/docs/guides/local-development/seeding-your-database)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.3 seed data definitions |
