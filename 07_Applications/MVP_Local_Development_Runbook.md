# Creator OS Foundry MVP Local Development Runbook

**Phase:** 3.1 — MVP Development Environment  
**Version:** 1.0  
**Document owner:** Development Environment Owner and Operations Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This runbook defines routine local startup, verification, troubleshooting, reset, and shutdown for MVP development.

## Start-of-Day Procedure

1. Confirm the repository and intended branch.
2. Review local changes before pulling or switching work.
3. Verify the pinned Node.js, pnpm, and Supabase CLI versions.
4. Install from the lockfile only when dependencies changed.
5. Start the container runtime.
6. Start the local Supabase services.
7. Apply or reset migrations when the schema changed.
8. Regenerate database types when migrations changed.
9. Start the application development server.
10. Open the local environment and confirm the non-production banner.
11. Run the targeted smoke and authorization checks.

## Normal Development Loop

- change the smallest bounded unit;
- run formatter, lint, and type checks for affected code;
- run focused unit and component tests;
- run contract tests when schemas change;
- verify the affected flow in the browser;
- add or update negative, accessibility, and recovery coverage;
- review the diff for secrets, generated noise, and unrelated edits;
- update canonical documentation when behavior or contracts change.

## Local URLs and Ports

Exact URLs and ports come from the local CLI and repository configuration. Documentation must not assume defaults when overrides are supported. The runbook records conflicts by service name rather than encouraging arbitrary changes that drift from shared configuration.

## Database Tasks

A clean reset destroys only the local disposable database, reapplies committed migrations, and loads approved development seeds. Before running it, confirm the CLI is targeting local resources and not a linked remote project.

Schema changes are created through the approved migration command, reviewed, reset-tested, and accompanied by regenerated types. Dashboard changes are not durable until captured in a migration.

## Test Commands

Repository scripts provide stable entry points for format check, lint, type check, unit tests, contract tests, database tests, end-to-end tests, accessibility tests, and production build. Developers use repository scripts rather than memorizing underlying tool flags. Tool-specific options are discovered with current help.

## Common Problems

### Dependency Installation Changes the Lockfile

Stop and determine whether the pinned runtime or package manager differs. Do not commit an unexplained lockfile rewrite.

### Local Supabase Does Not Start

Confirm the container runtime, resource availability, CLI version, ports, and service logs. Fix the first failing dependency. Avoid repeated destructive resets without reading the failure.

### Migration Reset Fails

Identify the first failed migration and exact database error. Correct an unpublished migration locally or add a new forward migration if the change is shared. Do not weaken constraints or RLS merely to make reset pass.

### Authentication Loop

Confirm application and Supabase URLs, cookie settings, local time, publishable key, and server-side auth configuration. Clear only the local application session after preserving relevant error evidence.

### Stale Generated Types

Reset or migrate the local schema, regenerate types from that schema, and review the diff. Do not hand-edit generated database types.

### Cross-Workspace Test Fails

Treat unexpected access as a blocking security issue. Stop feature work, preserve evidence, inspect policy and server authorization, and rerun the entire affected matrix after correction.

### End-to-End Test Is Flaky

Capture trace and timing evidence, find the uncontrolled dependency or state, and repair the test or product. Do not normalize repeated retries as success.

## Safe Reset

A local reset is allowed only after confirming the target is local and disposable. Preserve any needed non-seed test artifacts by governed export. Remote linked reset, production mutation, broad deletion, and credential rotation are outside this runbook.

## Shutdown

Stop the application gracefully, stop or preserve local Supabase containers according to the approved workflow, close tunnels or temporary services, and confirm no secret-bearing debug logs or processes remain. Do not commit local environment files.

## Incident and Escalation

Secret exposure, cross-workspace access, accidental remote mutation, destructive command uncertainty, or production credential use becomes an incident. Stop, preserve evidence, revoke or rotate as authorized, notify the appropriate owner, and follow Incident Response.

## Readiness Evidence

A healthy local run records version checks, dependency integrity, service health, migration state, generated type state, targeted test results, and application health without copying secrets.

## Acceptance Criteria

- Routine startup and shutdown are reproducible.
- Local resets cannot be confused with remote operations.
- Schema changes and types stay aligned.
- Common failures have safe diagnostic paths.
- Security anomalies stop development and escalate.
- Repository scripts provide stable commands.

## References

- [Development Environment Setup](MVP_Development_Environment_Setup.md)
- [Repository Development Workflow](MVP_Repository_Development_Workflow.md)
- [MVP Build Checklist](MVP_Build_Checklist.md)
- [Supabase Deployment Guide](../05_Database/Supabase_Deployment_Guide.md)
- [Incident Response](../09_Tests/Incident_Response.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.1 local development runbook |
