# Creator OS Foundry MVP Technology Stack Decision Record

**Phase:** 3.1 — MVP Development Environment  
**Version:** 1.0  
**Document owner:** Architecture Owner and Application Owner  
**Status:** Proposed  
**Risk class:** High  
**Decision ID:** ADR-MVP-001

## Decision

The MVP will use a TypeScript-first web stack built on Next.js App Router and React, with Node.js 24.x and pnpm for the application toolchain, Supabase for PostgreSQL, Auth, Realtime, local development, migrations, and generated database types, Vitest and Testing Library for fast automated tests, and Playwright for cross-browser end-to-end and accessibility flows.

Exact dependency versions are pinned when implementation begins and are not implied by this architectural decision.

## Context

The MVP needs one repository, server-rendered and interactive operational views, a trusted backend-for-frontend, strong TypeScript contracts, secure session handling, workspace-aware data access, local database reproducibility, rapid automated testing, and a controlled path from preview to staging.

## Selected Stack

| Layer | Selection | Rationale |
| --- | --- | --- |
| Language | TypeScript | Shared types across UI, route handlers, contracts, tests, and generated database interfaces |
| Runtime | Node.js 24.x | Supported modern runtime line compatible with current application and test tooling |
| Package manager | pnpm | Deterministic lockfile, workspace support, and efficient dependency management |
| Web framework | Next.js App Router | Integrated routing, server and client components, route handlers, build pipeline, and TypeScript support |
| UI | React with accessible internal component system | Composable interaction model without outsourcing domain behavior |
| Styling | CSS Modules, design tokens, and modern CSS | Low runtime cost, explicit scope, and portable accessible design primitives |
| Validation | Versioned TypeScript schemas with a small approved runtime validator | One contract across client, server, workflow, and tests |
| Data and identity | Supabase PostgreSQL, Auth, and RLS | Aligns with existing database architecture and workspace controls |
| Local backend | Supabase CLI and containerized local stack | Reproducible migrations, seeds, auth, and generated types |
| Realtime | Supabase Realtime for authorized state notification | Awareness layer with authoritative API reconciliation |
| Unit and component tests | Vitest and Testing Library | Fast TypeScript-focused feedback and behavior-oriented component tests |
| End-to-end tests | Playwright Test | Cross-browser flows, isolation, tracing, and CI execution |
| API style | Typed Next.js route handlers and server modules | Bounded backend-for-frontend without a separate premature service fleet |
| Observability | Vendor-neutral structured telemetry and correlation | Avoids provider lock-in while preserving operational contracts |
| CI | GitHub Actions or approved equivalent | Repository-native checks and protected delivery workflow |

## Alternatives Considered

### Separate SPA and API Service

A React single-page application plus separate API service offers independent scaling but increases deployment, authentication, contract, and local-development complexity before the MVP proves need. Reconsider when independent runtime or scaling requirements become material.

### Vite SPA

Vite provides a fast client build but would require a separate trusted backend and additional routing and session architecture. It remains a viable future choice if server-rendered application needs disappear.

### Full Supabase Client From Browser

Direct browser use is appropriate only for narrowly approved RLS-protected operations. It is rejected as the primary architecture because the MVP requires policy-aware composition, command receipts, GitHub and agent orchestration, sanitized audit data, and server-only integrations.

### GraphQL First

A GraphQL layer is deferred. Typed bounded REST-style route contracts are sufficient for the first user loop and reduce schema, authorization, and operational surface.

### Third-Party UI Framework

A large component framework is deferred until accessibility, bundle, styling, licensing, and customization requirements are assessed. The MVP starts with a small internal accessible component set.

## Consequences

The team must understand server and client component boundaries, cookie and cache safety, Next.js route semantics, Supabase SSR behavior, RLS, and migrations. The repository carries a Node toolchain, local containers, browser test binaries, and generated database types.

The integrated stack speeds the first vertical slice but must not allow framework convenience to blur domain, authorization, or module boundaries.

## Security Conditions

- Privileged Supabase and GitHub credentials remain server-only.
- New exposed tables require explicit grants and RLS policies.
- Session-bearing responses must not be cached across users.
- Browser-safe environment variables are reviewed as public.
- Dependencies are pinned, scanned, and upgraded through change review.
- Generated content and Markdown are treated as untrusted.
- Route handlers reauthorize every resource and command.

## Decision Validation

Before Baseline or Approved status, create a thin proof that signs in locally, selects a workspace, loads one RLS-protected view, invokes one idempotent BFF command, returns a durable receipt, and passes Vitest and Playwright checks.

## Review Triggers

Reconsider this decision for unsupported runtime changes, material Next.js or Supabase breaking changes, independent service scaling, non-web clients, edge-runtime constraints, data residency, provider exit, unacceptable build performance, or sustained team productivity problems.

## Acceptance Criteria

- The stack supports the MVP vertical slice without bypassing architecture.
- Local and CI environments are reproducible.
- Security and workspace controls are testable.
- Tool versions and lockfile are pinned.
- Alternatives and future review triggers are explicit.
- A thin proof validates the riskiest integration boundaries.

## References

- [MVP Frontend Architecture](MVP_Frontend_Architecture.md)
- [MVP Backend Service Architecture](MVP_Backend_Service_Architecture.md)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Local Development](https://supabase.com/docs/guides/cli)
- [Supabase Server-Side Auth](https://supabase.com/docs/guides/auth/server-side)
- [Playwright Test](https://playwright.dev/docs/intro)
- [Vitest Guide](https://vitest.dev/guide/)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial ADR-MVP-001 technology stack decision |
