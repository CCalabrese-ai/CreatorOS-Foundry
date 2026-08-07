# Creator OS Foundry MVP Development Workspace Setup

**Phase:** 3.4 — MVP Environment Initialization  
**Version:** 1.0  
**Document owner:** Development Environment Owner and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the controlled process for initializing a developer workspace from a clean checkout and proving that it matches the repository baseline.

## Preconditions

The contributor must have authorized repository access, a managed supported workstation, Git, the repository-pinned Node.js runtime and pnpm release, a compatible container runtime, the pinned Supabase CLI, supported browsers, and access to approved local-only configuration values.

The repository and installed tool help are authoritative for exact versions and command syntax.

## Workspace Setup Procedure

1. Clone the existing CreatorOS-Foundry repository through the approved authenticated method.
2. Confirm repository identity, intended base branch, current commit, and working-tree state.
3. Review the README, governance standards, development setup, local runbook, and contribution rules.
4. Install the pinned Node.js version and enable the exact package-manager version.
5. Install dependencies from the committed lockfile without updating it.
6. Copy the committed example configuration to an ignored local file.
7. Obtain required local secret values through the approved channel; never copy production secrets.
8. Start the container runtime and the local Supabase stack.
9. Reset the local database from committed migrations and approved synthetic seeds.
10. Generate database types from the local migration-built schema.
11. Run formatting, lint, type, unit, contract, database, and production-build checks.
12. Start the Control Center and confirm the local environment banner and health route.
13. Run the secure-entry and primary-flow smoke tests.
14. Record any approved platform deviation before feature work begins.

## Editor Workspace

The repository may provide editor settings, formatting defaults, recommended extensions, debugging profiles, and task shortcuts. These improve consistency but must not become undocumented dependencies. A contributor may use another compatible editor if repository scripts and evidence remain identical.

The editor must exclude local secrets, generated caches, dependencies, test artifacts, and local database state from search, source control, and sharing where appropriate.

## Local Services

Local services include the application, Supabase database and Auth, approved email-capture service, and only those additional dependencies required by the current delivery slice. Ports and URLs come from repository configuration and CLI output. Developers must not silently change shared defaults to solve conflicts.

## Synthetic Identity and Data

Local accounts, memberships, workspaces, documents, runs, reviews, and incidents are deterministic synthetic fixtures. Role and cross-workspace matrices include permitted and denied cases. Fixtures contain no copied customer, employee, repository credential, or production incident data.

## Verification Record

A successful initialization records tool versions, commit SHA, lockfile state, migration state, generated-type status, test results, build result, local health, and known deviations. The record may be local or attached to the approved work item and contains no secrets.

## Troubleshooting Boundaries

Dependency drift requires reconciling the pinned runtime and package manager before altering the lockfile. A local database failure is diagnosed from the first failing migration or service rather than repeated destructive resets. Authorization-test failure blocks feature work and follows the security process.

A destructive reset is permitted only for the confirmed local disposable environment. Remote links and production targets must be visibly absent or disabled before reset commands.

## Daily Revalidation

At the start of a work session, confirm branch and local changes, synchronize safely, verify tool pins after configuration updates, start local services, apply current migrations, regenerate types when required, run targeted smoke checks, and ensure the environment indicator still states local.

## Acceptance Criteria

- A new authorized contributor can initialize the workspace from documented inputs.
- Dependency installation preserves the committed lockfile.
- The local database rebuilds from migrations and synthetic seeds.
- Generated types match the rebuilt schema.
- Required checks and the production build pass.
- The local application displays correct environment and workspace context.
- No production secret, data, or remote destructive target is required.

## References

- [MVP Development Environment Setup](MVP_Development_Environment_Setup.md)
- [MVP Local Development Runbook](MVP_Local_Development_Runbook.md)
- [MVP Repository Structure](MVP_Repository_Structure.md)
- [Supabase Environment Strategy](../05_Database/Supabase_Environment_Strategy.md)
- [Development Standards](../09_Tests/Development_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.4 MVP development workspace setup |
