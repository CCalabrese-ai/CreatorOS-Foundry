# Creator OS Foundry Supabase Environment Strategy

**Phase:** 2.1 — Supabase Core Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines isolated Supabase environments, their data rules, access, configuration, lifecycle, and promotion boundaries.

## Environment Model

| Environment | Purpose | Data | Access | Lifecycle |
| --- | --- | --- | --- | --- |
| Local | Developer migration and feature work | Synthetic | Individual developer | Rebuildable |
| Preview | Branch and integration validation | Synthetic or approved fixtures | Scoped project team | Ephemeral |
| Staging | Release and recovery rehearsal | Sanitized production-like | Named operators and reviewers | Persistent |
| Production | Live governed operation | Approved operational data | Least-privileged production roles | Persistent |

No environment shares credentials, database instances, storage buckets, service-role secrets, or unrestricted backups with another environment.

## Configuration Contract

Configuration identifies environment name, project reference, API URL, public client key reference, server secret reference, database connection reference, redirect URLs, allowed origins, exposed schemas, feature flags, observability destinations, budgets, and retention. Secrets are injected at runtime.

## Local Environment

The local environment must start from repository configuration, migrations, and permitted seeds. Developers verify CLI version and commands through help. Local resets are expected and must not depend on manual dashboard state.

## Preview Environments

Preview environments map to a branch or change request and use automated creation when supported. They enforce production-equivalent schema and RLS, but never receive production secrets or raw production data. Expiry and cleanup are automatic or owner-assigned.

## Staging Environment

Staging mirrors production architecture, access patterns, configuration classes, and monitoring closely enough to validate releases. Any production-derived data is sanitized through an approved process, with reidentification risk reviewed.

## Production Environment

Production access is tightly limited, multi-factor protected where supported, logged, and reviewed. Direct interactive changes are exceptional. Backup, point-in-time recovery, incident response, budgets, and on-call ownership are active before launch.

## Promotion

Code and migrations promote forward; databases and credentials do not. A release uses the same approved commit across staging and production with environment-specific protected configuration. Evidence follows the release, not copied secrets or data.

## Data Movement

- Production data does not move down by default.
- Synthetic fixtures are preferred.
- Sanitization removes or irreversibly transforms personal, confidential, and restricted values.
- Exports require owner approval, classification, encrypted transport, retention, and deletion evidence.
- Seed data moves upward only when allowlisted as non-sensitive reference data.

## Access and Credentials

Each environment has dedicated human, service, CI, integration, and break-glass access. Public clients receive only publishable credentials. Service-role and administrative credentials remain in trusted execution environments.

## Drift Control

Shared environments are compared against repository migration history and expected configuration. Untracked changes create an incident or remediation task. Drift is not normalized by editing history silently.

## Acceptance Criteria

- Projects, credentials, data, storage, and configuration are isolated.
- Promotion uses one approved commit with protected environment configuration.
- Production-derived data is prohibited or sanitized with approval.
- Preview environments expire and staging remains production-like.
- Drift, access, backup, and cost are monitored.
- Environment ownership and recovery are explicit.

## References

- [Supabase Architecture](Supabase_Architecture.md)
- [Core Implementation Plan](Supabase_Core_Implementation_Plan.md)
- [Deployment Guide](Supabase_Deployment_Guide.md)
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Supabase Managing Environments](https://supabase.com/docs/guides/deployment/managing-environments)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.1 environment strategy |
