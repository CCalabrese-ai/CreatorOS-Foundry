# Creator OS Foundry MVP Repository Structure

**Phase:** 3.4 — MVP Environment Initialization  
**Version:** 1.0  
**Document owner:** Application Owner and Architecture Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the target repository structure for implementing and operating the Creator OS Foundry MVP without weakening the established numbered documentation domains.

## Structural Principles

- Canonical governance and architecture remain in the numbered top-level folders.
- Executable code is separated from documentation, generated artifacts, and local state.
- Application, shared UI, contracts, configuration, database, and tests have explicit owners.
- Server-only code and configuration cannot be imported into browser bundles.
- Generated files are identifiable, reproducible, and reviewed with their source changes.
- Every directory exists for a current responsibility; speculative placeholders are avoided.

## Target Layout

| Path | Responsibility |
| --- | --- |
| apps/control-center | Next.js Control Center routes, server components, client components, and backend-for-frontend |
| packages/ui | Accessible shared components, tokens, layout primitives, and presentation tests |
| packages/contracts | Versioned API, event, workflow, receipt, error, and validation schemas |
| packages/config | Shared lint, type, formatting, test, and build configuration |
| packages/observability | Safe telemetry interfaces and correlation helpers when shared code is justified |
| supabase | Local configuration, migrations, approved seeds, functions, and generated schema evidence |
| tests/contracts | Cross-package and provider contract suites |
| tests/integration | Service, database, Auth, workflow, and adapter tests |
| tests/e2e | Playwright user flows, accessibility, denial, resilience, and recovery |
| scripts | Reviewed repository automation invoked through stable package scripts |
| 00_Governance–09_Tests | Canonical operating, architecture, implementation, security, and quality documents |
| 99_Archive | Retired material retained for history |

## Application Boundaries

Within apps/control-center, route modules align to Control Center, Documentation, AI Workforce, Automation, and System Health. Each module owns route composition, view-model adapters, component composition, and module tests. Shared primitives move to packages only after two or more bounded consumers prove the shared contract.

Server modules own session validation, policy calls, provider adapters, and secrets. Client modules own interaction and transient presentation state. Import rules and build checks must prevent server modules from entering client graphs.

## Contract Ownership

Contracts are authoritative at service boundaries and include explicit versions. Handwritten domain schemas live in packages/contracts. Database types are generated from the migration-built Supabase schema and are never manually edited. Generated files identify their source and generation command.

Breaking contracts require a new version, consumer inventory, migration plan, compatibility window where needed, and removal approval.

## Supabase Structure

The supabase directory contains config.toml, CLI-created migration files, approved seed entry points, and functions only when required. Migration history is forward-only after sharing. Local state, credentials, dumps, raw production data, and temporary Studio changes are excluded.

## Test Placement

Unit and component tests remain near owned code when that improves maintenance. Cross-boundary tests live in the tests directories. Fixtures are synthetic, classified, deterministic, and separated from production data. Snapshots cannot replace semantic assertions for authorization, accessibility, or workflow state.

## Configuration and Metadata

The repository commits runtime and package-manager pins, package metadata, lockfiles, workspace configuration, example environment names, editor recommendations, ownership, ignore rules, and continuous integration definitions. It never commits secret values or machine-specific paths.

## Ownership and Review

CODEOWNERS or an equivalent mechanism assigns Application, Security, Data, Quality, and Documentation reviewers to their boundaries. High-risk changes require independent review. Folder ownership guides review but does not override governance approval.

## Initialization Sequence

1. Preserve current numbered documentation folders and repository history.
2. Add the approved workspace manifest and runtime pins.
3. Create the application and package boundaries required by the first delivery slice.
4. Initialize Supabase through the pinned CLI and repository configuration.
5. Add test, script, ownership, ignore, and continuous integration boundaries.
6. Add import-boundary and secret-scanning checks.
7. Verify a clean clone installs, resets local services, generates types, tests, and builds.
8. Record deviations and obtain Architecture Owner approval.

## Acceptance Criteria

- The structure supports the Phase 3.3 frontend, backend, Supabase, access-control, and priority plans.
- Canonical documentation remains in its governed numbered domains.
- Browser, server, contract, data, test, and generated-code boundaries are enforceable.
- A clean clone does not depend on uncommitted files or manual dashboard state.
- Ownership and review rules cover every implementation boundary.
- No secrets, local state, raw production data, or unexplained generated artifacts are committed.

## References

- [MVP Development Environment Setup](MVP_Development_Environment_Setup.md)
- [MVP Technology Stack Decision Record](MVP_Technology_Stack_Decision_Record.md)
- [MVP Frontend Implementation Plan](MVP_Frontend_Implementation_Plan.md)
- [MVP Backend Implementation Plan](MVP_Backend_Implementation_Plan.md)
- [Documentation Standards](../00_Governance/Documentation_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.4 MVP repository structure |
