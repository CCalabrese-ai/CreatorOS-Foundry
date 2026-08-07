# Creator OS Foundry MVP Application Scaffold Specification

**Phase:** 4.1 — MVP Application Skeleton  
**Version:** 1.0  
**Document owner:** Application Owner and Architecture Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the executable scaffold that begins construction of the Creator OS Foundry Control Center MVP.

## Scaffold Outcome

The scaffold must produce a reproducible Next.js and TypeScript application with governed repository boundaries, a trusted backend-for-frontend, Supabase local integration, accessible UI foundations, typed contracts, safe configuration, automated checks, and a deployable non-production health surface.

The scaffold is not complete merely because a framework starter runs.

## Required Repository Boundaries

| Path | Initial responsibility |
| --- | --- |
| apps/control-center | Application routes, server and client components, backend-for-frontend, route tests |
| packages/ui | Tokens and accessible shared primitives |
| packages/contracts | Request, response, error, event, receipt, and validation schemas |
| packages/config | Shared format, lint, type, test, and build configuration |
| supabase | Local configuration, migrations, seeds, and generated schema types |
| tests/contracts | Cross-boundary schema and compatibility tests |
| tests/integration | Auth, database, service, adapter, and workflow integration |
| tests/e2e | Secure entry, workspace isolation, first feature, accessibility, and recovery |
| scripts | Stable reviewed automation entry points |

Canonical documentation remains in the numbered folders.

## Scaffold Capabilities

The initial application includes:

- root layout and route ownership;
- public sign-in and callback boundary;
- protected application shell;
- workspace selection and environment indicator;
- Overview, Documentation, Automation, AI Workforce, and System Health route placeholders with truthful unavailable states;
- backend health and readiness endpoints;
- typed configuration validation;
- browser and server Supabase client boundaries;
- request correlation and safe structured telemetry;
- global loading, denied, not-found-or-forbidden, unavailable, and error states;
- accessible tokens, focus, status, button, link, form, table, dialog, and alert primitives;
- format, lint, type, unit, component, contract, secret, database, end-to-end, and production-build scripts.

## Technical Constraints

The implementation follows ADR-MVP-001: TypeScript, the approved Node.js and pnpm versions, Next.js App Router, React, Supabase, Vitest and Testing Library, and Playwright. Exact versions are pinned in repository metadata and the lockfile.

Server-only modules and secrets cannot enter client import graphs. Authenticated routes are dynamic and private. Generated content is untrusted. Operational mutations are never represented as successful until backed by durable service evidence.

## Initialization Sequence

1. Confirm the source commit, approved structure, runtime pins, and clean working state.
2. Add workspace and package metadata with frozen installation support.
3. Scaffold the Control Center inside apps/control-center without replacing numbered documentation.
4. Configure TypeScript strictness, import aliases, server-only boundaries, format, lint, and test tools.
5. Add packages only when required by the first vertical slice.
6. Add typed configuration parsing and safe public/server separation.
7. Initialize local Supabase through the pinned CLI and add generated-type ownership.
8. Add root layout, shell, environment indicator, global states, and health routes.
9. Add contract fixtures and synthetic local identities and workspaces.
10. Add protected continuous integration stages and preview build.
11. Run a clean install, local database reset, generated-type check, test portfolio, and production build.
12. Record scaffold evidence and unresolved decisions.

## Configuration Contract

The scaffold validates application origin, environment label, release SHA, Supabase URL and publishable key, server-only credential references, allowed origins and redirects, telemetry mode, feature flags, and test endpoints. Example files describe names only. Browser-prefixed values are treated as public.

## Security Baseline

Apply secure session and cache behavior, origin and cross-site request controls, content security policy, input and output safety, payload limits, dependency and secret scanning, least privilege, explicit RLS and grants for exposed data, safe errors, and protected telemetry. User-controlled metadata cannot grant authorization.

## Quality Baseline

Every required script runs locally and in continuous integration. A clean scaffold includes positive and negative authorization fixtures, accessibility checks, an end-to-end shell smoke test, and a production build. Flaky required checks are failures.

## Acceptance Criteria

- A clean clone installs from the lockfile and builds with pinned tools.
- Local Supabase rebuilds from repository configuration, migrations, and synthetic seeds.
- The protected shell loads only after validated identity and workspace context.
- Route placeholders disclose unavailable capability without simulating success.
- Browser bundles contain no server-only values.
- Required checks pass and produce traceable evidence.
- A preview artifact is tied to one source commit and safe configuration schema.

## References

- [MVP Repository Structure](MVP_Repository_Structure.md)
- [MVP Build Execution Plan](MVP_Build_Execution_Plan.md)
- [MVP Technology Stack Decision Record](MVP_Technology_Stack_Decision_Record.md)
- [MVP Authentication and Authorization Implementation](MVP_Authentication_Authorization_Implementation.md)
- [Documentation Standards](../00_Governance/Documentation_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.1 application scaffold specification |
