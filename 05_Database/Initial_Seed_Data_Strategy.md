# Creator OS Foundry Initial Seed Data Strategy

**Phase:** 2.1 — Supabase Core Implementation  
**Version:** 1.0  
**Document owner:** Data Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines safe, deterministic seed data for local development, preview validation, staging rehearsal, and the minimal production reference baseline.

## Seed Classes

| Class | Purpose | Production |
| --- | --- | --- |
| Required reference | Controlled statuses, types, categories, and system identifiers | Allowed with approval |
| Bootstrap governance | Minimal initial owner, workspace, and policy references | Separate protected bootstrap |
| Development fixture | Synthetic users, workspaces, runs, and artifacts | Prohibited |
| Test fixture | Scenario-specific deterministic records | Prohibited |
| Demo data | Sanitized illustrative experience | Only in approved demo environment |

## Core Rules

- Seed files contain no secrets, raw credentials, personal data, or production exports.
- Required reference seeds are deterministic and idempotent.
- Stable identifiers are explicit when other records depend on them.
- Environment guards prevent development fixtures from running in production.
- Seeds do not grant broad permissions or bypass RLS.
- Auth users are created through supported test or bootstrap paths, not by unsafe direct assumptions.
- Test fixtures remain separate from production reference data.

## Initial Reference Scope

Candidate reference data includes lifecycle statuses, risk classes, data classifications, actor types, run states, approval decisions, incident severities, artifact classifications, and stable system-role keys. The Data and Domain Owners approve the final allowlist.

## Bootstrap Strategy

The first production workspace and owner require a documented, authenticated bootstrap procedure. It must verify identity, create the minimum membership, record the decision and audit event, and disable any temporary bootstrap capability immediately afterward.

## Development Fixtures

Synthetic fixtures should cover multiple workspaces, owners, roles, documents, agents, tools, workflows, runs, failures, approvals, incidents, and usage records. Names and values must be unmistakably fictional.

## Idempotency and Updates

Seeds use stable keys with upsert or conditional insertion only when updating is safe and intentional. Removing or renaming reference values requires a migration and consumer analysis, not silent seed deletion.

## Validation

- Run seeds after a clean local reset.
- Run them twice and confirm stable results.
- Verify foreign keys, uniqueness, checks, and expected counts.
- Test authorized and denied access with application-equivalent roles.
- Scan for secrets and realistic personal data.
- Confirm production execution selects only allowlisted reference seeds.
- Confirm development cleanup does not affect canonical reference data.

## Ownership and Versioning

Each seed set has an owner, purpose, target environments, version, dependencies, expected record counts, and change history. Seed changes follow review and migration compatibility rules.

## Failure and Recovery

A failed seed run stops before dependent tests. Partial writes are transactional where practical or reconciled through stable keys. Production seed failure follows the deployment recovery plan and must not be retried blindly.

## Acceptance Criteria

- Required reference and synthetic fixture data are separated.
- Seed execution is deterministic and idempotent.
- Production guards and allowlists are tested.
- No secrets, personal data, or unauthorized grants are present.
- Bootstrap ownership is secure and auditable.
- Clean rebuilds produce the expected baseline.

## References

- [Core Implementation Plan](Supabase_Core_Implementation_Plan.md)
- [Migration Execution Plan](Migration_Execution_Plan.md)
- [Environment Strategy](Supabase_Environment_Strategy.md)
- [Supabase Database Seeding](https://supabase.com/docs/guides/local-development/seeding-your-database)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.1 seed-data strategy |
