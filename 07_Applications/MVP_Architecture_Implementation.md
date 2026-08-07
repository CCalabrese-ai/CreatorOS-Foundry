# Creator OS Foundry MVP Architecture Implementation

**Phase:** 4.2 — MVP Core Build Specification  
**Version:** 1.0  
**Document owner:** Architecture Owner and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the implementable runtime architecture for the Creator OS Foundry MVP core build.

## Implementation Outcome

The core build consists of a Next.js Control Center, a trusted backend-for-frontend, versioned shared contracts, Supabase data and identity services, registered workflow and agent execution boundaries, a bounded GitHub integration, and protected telemetry. It proves one governed document-creation loop without introducing a general-purpose platform.

## Runtime Components

| Component | Responsibility | Authority |
| --- | --- | --- |
| Browser application | Accessible presentation and bounded interaction | No final policy or workflow authority |
| Next.js server | Session validation, routing, BFF, composition, safe caching | Request boundary |
| Policy service | Resource and operation authorization | Application authorization |
| Supabase Auth | Identity and session primitives | Authentication |
| Supabase Postgres | Governed metadata, state, receipts, audit, registries | Durable operational data |
| Workflow gateway | Start and query registered workflows | Workflow boundary |
| Agent execution layer | Execute approved agent versions and tool grants | Agent runtime |
| GitHub adapter | Read and write approved repository paths | Canonical document publication |
| Realtime gateway | Notify authorized clients of durable changes | Awareness only |
| Observability layer | Correlation, metrics, logs, traces, alerts | Operational evidence |

## Deployment Topology

Local, preview, staging, and production use isolated configuration, data, credentials, and service targets. The same immutable application artifact promotes forward. Supabase migrations promote in approved order. Browser clients receive only publishable configuration; privileged integrations remain server-side.

## Request Flow

1. Establish a correlation identifier and validate transport limits.
2. Validate the current identity and session.
3. Resolve workspace, environment, membership, and capability context.
4. Parse a versioned request contract.
5. Resolve the target without leaking inaccessible existence.
6. Authorize the exact resource and operation.
7. Execute through the owning query, command, workflow, or adapter service.
8. Record policy, state transition, dependency, and outcome evidence.
9. Return a typed view model, safe error, or durable receipt.
10. Reconcile client awareness with authoritative state.

## Module Boundaries

Control Center, Documentation, AI Workforce, Automation, and System Health own their routes and view-model adapters. Shared UI and contracts remain dependency-safe. Modules never import another module's private implementation, query privileged tables directly, or call agents and tools outside registered service boundaries.

## Data Architecture

GitHub Markdown is canonical document content. Supabase stores document identity, versions, provenance, lifecycle, registry records, workflow state, receipts, reviews, synchronization, health, and audit. Derived search or summary data is rebuildable.

Every workspace-owned row carries explicit workspace scope. Exposed data uses approved grants and row-level security. Application queries retain explicit workspace predicates as defense in depth.

## Command and Event Architecture

Commands are idempotent and version-aware. Intent is durable before external side effects. Accepted does not mean completed. Events name schema version, entity, prior and resulting state, occurrence time, correlation, and sanitized evidence reference. Realtime messages trigger refresh and do not replace the audit log.

## Security Architecture

Apply least privilege, server-side authorization, secure session and cache behavior, cross-site request controls, schema and payload validation, constrained destinations, content sanitization, secret isolation, dependency pinning, safe errors, audit, and rate limits. User-controlled metadata cannot grant permission.

## Failure and Recovery

Dependency failures produce explicit degraded, unavailable, or outcome-unknown states. External timeouts after dispatch enter reconciliation rather than blind retry. Realtime gaps trigger authoritative refresh. Module error boundaries preserve safe navigation and scope.

## Implementation Sequence

1. Establish repository, build, configuration, and contract foundations.
2. Initialize Supabase, identity, workspace isolation, migrations, types, and RLS.
3. Implement the protected shell and authorized read services.
4. Implement System and Document Registry read models.
5. Implement the command ledger and COS-WF-001 gateway.
6. Add review, publication, synchronization, audit, and health evidence.
7. Add realtime notification and reconciliation.
8. Complete security, accessibility, resilience, performance, and end-to-end evidence.
9. Promote the immutable candidate through staging readiness gates.

## Acceptance Criteria

- Runtime components and authority boundaries match approved architecture.
- Browser code contains no privileged credential or final authorization logic.
- Every request preserves identity, workspace, environment, version, and correlation.
- System and Document Registry data reconcile with canonical sources.
- Commands, workflows, agents, and GitHub effects use registered boundaries.
- Failures and unknown outcomes remain explicit and recoverable.
- The primary feature passes the complete staging acceptance scenario.

## References

- [Application Architecture](Application_Architecture.md)
- [MVP Application Scaffold Specification](MVP_Application_Scaffold_Specification.md)
- [MVP Backend Service Build Plan](MVP_Backend_Service_Build_Plan.md)
- [MVP Supabase Project Initialization](MVP_Supabase_Project_Initialization.md)
- [MVP Launch Readiness Criteria](MVP_Launch_Readiness_Criteria.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.2 MVP architecture implementation |
