# Creator OS Foundry MVP Build Execution Plan

**Phase:** 3.4 — MVP Environment Initialization  
**Version:** 1.0  
**Document owner:** Release Owner, Quality Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This plan defines how the MVP is installed, generated, checked, built, packaged, promoted, verified, and rolled back from one traceable repository commit.

## Build Outcome

A successful build produces an immutable Control Center artifact and evidence bundle tied to the source commit, lockfile, runtime, configuration schema, migration set, generated types, contract versions, test results, dependency inventory, and release identifier.

## Build Inputs

- approved source commit and branch;
- pinned Node.js, pnpm, Supabase CLI, framework, and test versions;
- committed package metadata and lockfile;
- versioned application, API, event, workflow, and database contracts;
- reviewed migration and seed definitions;
- generated database types or their reproducible generation step;
- typed configuration schema and non-secret build values;
- synthetic test fixtures;
- approved feature-flag manifest.

No untracked local file, floating dependency, manual dashboard state, or production secret may influence compilation.

## Execution Stages

| Stage | Required action | Blocking evidence |
| --- | --- | --- |
| 1. Resolve | Verify commit, clean state, runtime pins, lockfile, and ownership | Source identity record |
| 2. Install | Perform frozen deterministic dependency installation | Lockfile unchanged |
| 3. Generate | Generate database types and approved code artifacts | Reproducible diff or no diff |
| 4. Static quality | Format check, lint, type check, import boundaries, secret scan | All required checks pass |
| 5. Fast tests | Unit, component, schema, contract, and policy tests | Deterministic results |
| 6. Data validation | Clean reset, migrations, seeds, RLS, grants, and advisors | Data evidence accepted |
| 7. Integration | BFF, Auth, workflow, GitHub adapter, realtime, and failure tests | Contract and resilience evidence |
| 8. Browser acceptance | Playwright primary, denied, accessibility, responsive, and recovery flows | Supported matrix passes |
| 9. Production build | Compile and package with safe build metadata | Immutable artifact and manifest |
| 10. Preview verification | Deploy isolated preview and run smoke and security checks | Preview receipt |
| 11. Staging promotion | Promote the same artifact and apply approved migrations | Staging gate approval |
| 12. Launch candidate | Freeze evidence, limitations, rollback, and owner approvals | Signed readiness record |

## Build Scripts

Repository package scripts provide stable entry points for every stage. Tool-specific commands are hidden behind reviewed scripts when practical, and their flags are verified against pinned tool help. Scripts must use non-interactive behavior in automation, exit nonzero on failure, and avoid printing protected values.

## Database Coordination

The build verifies migrations and types, but deployment owns applying shared-environment migrations. Application and schema compatibility must support the selected rollout order. Migration failure halts promotion. Shared applied migrations are never edited; corrections use a reviewed forward migration.

## Artifact Manifest

The manifest records release ID, source SHA, build time, runtime and package-manager versions, lockfile digest, dependency inventory reference, contract versions, migration range, generated-type digest, configuration-schema version, feature-flag manifest, test evidence references, and artifact digest. It contains no secret values.

## Caching and Reproducibility

Caches may accelerate installation and compilation only when keyed by trusted lockfile, runtime, platform, and configuration inputs. A cache hit cannot skip required validation. A clean uncached build must reproduce the artifact or an explained equivalent where timestamps or platform metadata differ.

## Failure Handling

A failed stage stops later stages and preserves safe evidence. Flaky tests are failures. Unknown artifact provenance, dependency drift, type drift, secret detection, migration error, RLS failure, or cross-workspace access blocks release. Recovery begins from a known commit and clean environment rather than editing generated output.

## Promotion and Rollback

Preview and staging receive the same immutable artifact with environment-specific protected configuration. Production promotion requires the launch-readiness criteria. Rollback restores the last approved compatible artifact; database recovery follows the migration runbook and favors forward fixes when rollback is unsafe.

## Acceptance Criteria

- Builds use only reviewed, pinned, traceable inputs.
- Frozen installation does not alter the lockfile.
- Generated types match the migration-built schema.
- All mandatory static, test, data, security, accessibility, and browser stages pass.
- The artifact and manifest are immutable and tied to one source commit.
- Preview and staging promote the same artifact.
- Failure stops promotion and preserves actionable evidence.
- Rollback compatibility is demonstrated before launch.

## References

- [MVP Repository Structure](MVP_Repository_Structure.md)
- [MVP Development Workspace Setup](MVP_Development_Workspace_Setup.md)
- [MVP Build Checklist](MVP_Build_Checklist.md)
- [MVP Feature Prioritization](MVP_Feature_Prioritization.md)
- [Release Management](../09_Tests/Release_Management.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.4 MVP build execution plan |
