# Creator OS Foundry MVP Backend Service Build Plan

**Phase:** 4.1 — MVP Application Skeleton  
**Version:** 1.0  
**Document owner:** Backend Owner, Architecture Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This plan defines the construction order for the trusted services supporting the MVP application shell and first document-creation feature.

## Build Strategy

Establish request context, contracts, policy, and observability before domain queries. Prove read-only workspace and documentation access before commands. Add COS-WF-001 only after the command ledger, idempotency, and durable receipt contracts pass.

## Initial Services

| Service | First deliverable | Exit evidence |
| --- | --- | --- |
| Configuration | Typed startup validation and safe public/server split | Invalid configuration fails startup |
| Telemetry | Correlation, structured logs, safe errors, health | No protected payloads recorded |
| Session | Server-validated identity, expiry, sign-out, revocation conditions | Auth matrix passes |
| Workspace | Authorized memberships, selection, environment, capabilities | Cross-workspace suite passes |
| Policy | Resource and operation decisions with audit reference | Positive and negative policy tests |
| Control Center BFF | Versioned shell and module view models | Contract tests pass |
| Documentation query | Authorized list and detail with publication evidence | Counts and objects reconcile |
| Command ledger | Idempotency, expected version, receipt, status | Replay returns one effect |
| Workflow gateway | Start and query COS-WF-001 | Registered workflow integration passes |
| Review | Exact-candidate decisions and expiry | Stale candidate fails closed |
| Audit query | Sanitized scoped timeline | Sensitive-field tests pass |
| Health | Truthful dependency observations and freshness | Outage cannot appear healthy |

## Request Foundation

Each request establishes correlation, validates content type and payload limits, validates the session, resolves workspace and environment, parses a versioned schema, loads the target safely, evaluates authorization, executes through the owning service, records decision and outcome evidence, and returns a typed response.

Identity, role, workspace membership, and approval cannot be supplied authoritatively by the browser.

## Construction Sequence

1. Add versioned request, response, error, event, receipt, and health contracts.
2. Add configuration validation, correlation, redaction, safe errors, readiness, and liveness.
3. Implement current server-side Supabase Auth validation and private session caching rules.
4. Implement workspace membership and capability queries with explicit workspace predicates.
5. Implement the policy service and non-enumerating denied behavior.
6. Implement the shell, Overview, Documentation, AI Workforce, Automation, and Health query adapters.
7. Add stable pagination, classification, observed time, freshness, completeness, and partial-source metadata.
8. Implement the command ledger and atomic intent record.
9. Integrate COS-WF-001 through the workflow gateway; never call an agent directly from the request route.
10. Implement run status, review, audit, GitHub publication evidence, and synchronization queries.
11. Add authorized realtime notifications backed by durable event versions.
12. Implement timeouts, bounded safe retries, circuit breaking, outcome-unknown state, and reconciliation.
13. Complete adapter contracts, authorization, RLS, concurrency, load, failure, and recovery testing.

## Data Access

Application services use least-privileged database identities. Every tenant query includes explicit workspace scope even when RLS also applies. Aggregates and search authorize before returning counts or facets. Privileged access is isolated to reviewed server adapters and never used to make broken user authorization appear to work.

## Command Semantics

Normalize and authorize the command before storing intent. Idempotency is scoped by principal, workspace, operation, and target. Expected versions prevent stale mutation. Record intent before external effects. A provider timeout after dispatch produces outcome unknown and a reconciliation task, never an automatic blind retry.

## Provider Adapters

Supabase, GitHub, workflow, agent, and notification adapters validate external payloads, use allowlisted destinations, explicit timeouts, least privilege, stable internal error categories, and contract tests. Provider-specific behavior does not leak into UI contracts.

## Security and Operations

Apply origin and cross-site request protections, secure cookies, request and rate limits, schema validation, safe output, content sanitization, protected secrets, dependency pinning, and audit. Record versions, workspace reference, operation, policy result, latency, dependency state, receipt, and correlation without content bodies or credentials.

## Acceptance Criteria

- The request foundation validates identity, workspace, schema, resource, and operation in order.
- Read services return only authorized objects, counts, and sanitized evidence.
- The first workflow request creates one command and one run under replay.
- Unknown external outcomes enter reconciliation.
- Provider and database outages remain explicit and recoverable.
- Contract, authorization, RLS, security, load, and resilience tests pass.
- Health and audit evidence allow operators to investigate without exposing secrets.

## References

- [MVP Backend Implementation Plan](MVP_Backend_Implementation_Plan.md)
- [Control Center API Requirements](Control_Center_API_Requirements.md)
- [MVP Authentication and Authorization Implementation](MVP_Authentication_Authorization_Implementation.md)
- [MVP Automation Module Component Specification](MVP_Automation_Module_Component_Specification.md)
- [COS-WF-001](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.1 backend service build plan |
