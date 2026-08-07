# Creator OS Foundry MVP Build Checklist

**Phase:** 3.1 — MVP Development Environment  
**Version:** 1.0  
**Document owner:** Project Operations Owner and Quality Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This checklist defines the evidence required to declare the MVP development foundation ready for feature implementation.

## Decision and Scope

- [ ] MVP scope and first user loop are approved.
- [ ] ADR-MVP-001 is reviewed by Architecture, Application, Security, Data, and Quality owners.
- [ ] Out-of-scope capabilities are recorded.
- [ ] Owners and escalation paths are assigned.
- [ ] Exact runtime, package-manager, framework, CLI, and test versions are pinned.

## Repository Foundation

- [ ] Application, shared package, Supabase, test, and documentation boundaries are created.
- [ ] Package metadata and lockfile are committed.
- [ ] Node and package-manager version pins are committed.
- [ ] Example environment configuration contains names and descriptions only.
- [ ] Local secret and environment files are ignored.
- [ ] Editor settings and recommended extensions do not become hidden dependencies.
- [ ] Ownership and contribution guidance are documented.

## Application Scaffold

- [ ] Next.js App Router and TypeScript scaffold builds successfully.
- [ ] Application shell, route boundaries, and global error handling exist.
- [ ] Design tokens and initial accessible components exist.
- [ ] Environment and workspace context are visible.
- [ ] Server and client component boundaries are reviewed.
- [ ] Browser bundles contain no server-only configuration.

## Backend and Data

- [ ] Backend-for-frontend boundary is established.
- [ ] Supabase local stack starts from repository configuration.
- [ ] Migrations replay from a clean database.
- [ ] Development seeds are synthetic and deterministic.
- [ ] Generated database types match the local schema.
- [ ] RLS and explicit grants exist for exposed tables.
- [ ] Server-side auth and cookie cache behavior are tested.
- [ ] No privileged key is reachable from the browser.

## Contracts

- [ ] API request, response, error, event, workflow receipt, and audit schemas are versioned.
- [ ] Runtime validation rejects unknown privileged fields.
- [ ] Idempotency and expected-version contracts are defined.
- [ ] Workspace, environment, classification, and correlation fields are preserved.
- [ ] Generated types and handwritten contracts have clear ownership.

## Quality Tooling

- [ ] Formatting, lint, and type checks run locally and in CI.
- [ ] Vitest unit and component suites run.
- [ ] Testing Library conventions are documented.
- [ ] Playwright runs the supported browser matrix.
- [ ] Contract, database, RLS, accessibility, security, and build checks have stable scripts.
- [ ] Test fixtures are synthetic, versioned, and isolated.
- [ ] Required check failures block merge.

## Security

- [ ] Secret scanning and dependency scanning are enabled.
- [ ] Content security, secure sessions, output encoding, input validation, and safe caching are planned.
- [ ] Cross-workspace and object-level authorization tests exist.
- [ ] Supabase changelog breaking changes relevant to the stack are reviewed.
- [ ] Managed Supabase schemas are not customized improperly.
- [ ] Logs, analytics, traces, URLs, and test artifacts exclude secrets.
- [ ] Incident contacts and credential response are defined.

## Developer Experience

- [ ] A new contributor completes setup from the documentation.
- [ ] Start, test, reset, troubleshoot, and shutdown procedures are verified.
- [ ] Dependency installation leaves the lockfile unchanged.
- [ ] Common failure messages point to corrective action.
- [ ] Repository scripts hide unstable low-level command details.
- [ ] Local and preview environments are unmistakably non-production.

## Delivery and Operations

- [ ] Preview build is reproducible from the committed lockfile.
- [ ] Environment configuration is validated at startup.
- [ ] Health, structured logs, correlation, and basic metrics exist.
- [ ] Feature flags have owners and expiry.
- [ ] Rollback and disablement paths are documented.
- [ ] Staging and production credentials remain separate.
- [ ] Known limitations and follow-up decisions are recorded.

## Foundation Acceptance

The development foundation is ready only when all blocking items are complete, evidence is linked to the exact commit, no Critical or High findings remain open, and the Application, Architecture, Security, Data, Quality, and Release owners accept the handoff.

## References

- [Development Environment Setup](MVP_Development_Environment_Setup.md)
- [MVP Technology Stack Decision Record](MVP_Technology_Stack_Decision_Record.md)
- [Repository Development Workflow](MVP_Repository_Development_Workflow.md)
- [Local Development Runbook](MVP_Local_Development_Runbook.md)
- [MVP Prototype Development Plan](MVP_Prototype_Development_Plan.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.1 MVP build checklist |
