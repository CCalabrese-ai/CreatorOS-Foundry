# Creator OS Foundry MVP Development Environment Setup

**Phase:** 3.1 — MVP Development Environment  
**Version:** 1.0  
**Document owner:** Application Owner and Development Environment Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the reproducible developer workstation and local service setup for the Creator OS Foundry MVP.

## Supported Environment

Development is supported on current managed macOS, Windows with WSL, and Linux environments that satisfy the pinned runtime and container requirements. The repository configuration is authoritative for exact tool versions. Contributors must not silently substitute newer global versions.

## Required Tools

| Tool | Purpose | Control |
| --- | --- | --- |
| Git | Source history and branch workflow | Current supported release |
| Node.js 24.x | Application and tooling runtime | Pinned through repository version configuration |
| pnpm | Package installation and scripts | Exact version pinned through package manager metadata |
| Docker-compatible runtime | Local Supabase services | Approved current version |
| Supabase CLI | Local database, auth, migrations, seeds, and types | Pinned; discover syntax with help |
| VS Code or compatible editor | TypeScript, Markdown, lint, test, and debug workflow | Workspace settings are recommended |
| Modern browsers | Accessibility and cross-browser verification | Supported versions from application policy |

Exact versions are selected and recorded when the implementation scaffold is created. Lockfiles are committed.

## Repository Layout

The implementation should use a bounded structure:

- apps/control-center for the Next.js application and backend-for-frontend;
- packages/ui for accessible shared components and design tokens;
- packages/contracts for API, event, workflow, and validation schemas;
- packages/config for shared lint, type, and test configuration;
- supabase for configuration, migrations, seed definitions, and local functions;
- tests for cross-package integration, accessibility, and end-to-end scenarios;
- docs or existing numbered folders for canonical implementation documentation.

A simpler structure may be used initially if it preserves these ownership boundaries.

## Initial Setup

1. Clone the approved repository and confirm the intended branch and commit.
2. Install the pinned Node.js version using the team's approved version manager.
3. enable the pinned package manager and verify its version.
4. Install dependencies from the committed lockfile without updating it.
5. Copy the committed example environment file to a local ignored environment file.
6. Start the local container runtime.
7. Initialize or start the local Supabase stack using the pinned CLI.
8. Reset the local database to apply migrations and development seeds.
9. Generate database types from the local schema.
10. Run formatting, lint, type, unit, contract, and build checks.
11. Start the application and verify the local health page.
12. Run the MVP smoke flow with synthetic fixtures.

## Environment Configuration

The repository commits example variable names and descriptions, never secrets. Local values are stored in ignored files or an approved secret manager. Separate prefixes distinguish browser-safe publishable configuration from server-only values.

Required configuration classes include application origin, environment label, Supabase URL, publishable key, server secret references where approved, GitHub integration references, telemetry mode, feature flags, and test endpoints.

Only intentionally public values may use browser-exposed naming. Service-role and secret keys are server-only.

## Supabase Local Environment

The local stack uses repository migrations and deterministic non-production seeds. Direct changes in Studio are temporary unless captured through the approved migration workflow. Reset reproduces the schema from committed migrations. Current CLI command syntax must be confirmed with help before use.

The development environment must account for Supabase platform changes, including explicit Data API grants where configured, RLS on exposed tables, and current restrictions on managed schemas.

## Editor Configuration

Recommended workspace settings use the repository TypeScript version, format on explicit action or save according to team policy, lint integration, accessible color and focus tooling, and visible test results. Extensions are recommendations, not hidden build dependencies.

## Verification

A setup is ready when:

- pinned runtime and package-manager versions match;
- dependency installation leaves the lockfile unchanged;
- local Supabase services are healthy;
- migrations and seeds replay successfully;
- generated types match the schema;
- lint, type, unit, contract, and build checks pass;
- the app loads with the local environment label;
- the primary synthetic user flow succeeds;
- no secret or production identifier is present.

## Troubleshooting

Version mismatch requires installing the pinned version, not editing the pin casually. Failed local database reset is diagnosed at the first failing migration. Port conflicts use documented overrides. Container failures are resolved before repeated resets. Schema drift is captured and reviewed rather than accepted manually. Credentials suspected of exposure are rotated through the approved incident path.

## Acceptance Criteria

- A new contributor can reproduce the environment from repository sources.
- Global tools cannot silently change the build.
- Local data is synthetic and disposable.
- Secrets remain outside source control and browser bundles.
- Schema, generated types, application, and tests agree.
- Reset and recovery steps are documented and safe for local use.

## References

- [MVP Technology Stack Decision Record](MVP_Technology_Stack_Decision_Record.md)
- [Repository Development Workflow](MVP_Repository_Development_Workflow.md)
- [Local Development Runbook](MVP_Local_Development_Runbook.md)
- [Supabase Environment Strategy](../05_Database/Supabase_Environment_Strategy.md)
- [Supabase Local Development](https://supabase.com/docs/guides/cli)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.1 development environment setup |
