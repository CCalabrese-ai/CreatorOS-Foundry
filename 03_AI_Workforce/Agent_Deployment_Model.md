# Creator OS Foundry Agent Deployment Model

**Phase:** 2.5 — Agent Execution Layer  
**Version:** 1.0  
**Document owner:** Agent Owner, Operations Owner, and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how approved agent versions move from development to controlled production operation and how they are paused, rolled back, migrated, and retired.

## Deployment Unit

An agent release is an immutable manifest containing agent ID and version, registry mapping, owner, risk, system instructions hash, model and provider configuration, tool grants, context policy, memory policy, workflow compatibility, input and output schemas, limits, evaluation evidence, observability configuration, and artifact checksums.

Secrets and environment identifiers are injected by protected configuration and never stored in the manifest.

## Environments

| Environment | Purpose | Data and side effects |
| --- | --- | --- |
| Development | Authoring and local evaluation | Synthetic data; no production effects |
| Preview | Change-specific integration | Synthetic fixtures and isolated tools |
| Staging | Production-equivalent acceptance | Approved sanitized data and sandbox or isolated effects |
| Production canary | Limited real traffic and scope | Narrowly approved data, tools, users, and budgets |
| Production | Approved operational service | Full approved scope with monitoring and incident controls |

Versions are promoted; they are not rebuilt differently per environment.

## Release Flow

1. Freeze the candidate manifest and dependencies.
2. Verify registry, owner, risk, tool, context, and workflow compatibility.
3. Run required evaluation and security suites.
4. Review findings, residual risk, cost, monitoring, and recovery.
5. Obtain Agent, Security, Domain, and Release approvals required by risk.
6. Deploy to staging and complete operational acceptance.
7. Release to a production canary with explicit traffic, task, and budget limits.
8. Compare quality, safety, latency, cost, and error signals with baselines.
9. Promote, hold, roll back, or quarantine.
10. Record final release evidence and review date.

## Deployment Strategies

Low-risk draft agents may use controlled direct promotion after full staging evidence. Moderate-risk agents use canary or percentage rollout. High-risk agents require a narrow allowlist, human approval gates, enhanced telemetry, and progressive expansion. Shadow evaluation may compare outputs without permitting side effects.

## Compatibility

The deployment controller checks agent-to-workflow, tool-schema, context-policy, memory-schema, output-schema, and evaluation compatibility. Running tasks stay pinned to their original version unless a reviewed migration exists. New versions cannot interpret old durable state by assumption.

## Production Controls

Every active version has concurrency, rate, token, tool-call, duration, cost, data-volume, and delegation limits; circuit breakers; health checks; dashboards; alerts; on-call ownership; and a kill switch. Permissions are re-evaluated before each tool call.

## Canary Decision

Promotion requires no blocking security or authorization findings, task quality above the approved threshold, cost and latency within budget, reliable tool and handoff behavior, and complete audit telemetry. Small sample size and low event frequency are reported as uncertainty, not treated as proof.

## Pause and Rollback

Authorized owners may pause a version immediately for safety, cost, provider, or quality concerns. Pausing stops new runs and prevents new tool calls where policy requires; active work moves to safe waiting, cancellation, or quarantine. Rollback routes new work to the last approved compatible version. It does not erase outputs or reverse external side effects automatically.

## Recovery and Migration

State migration is explicit, versioned, tested, reversible where feasible, and limited to compatible runs. Unknown external outcomes are reconciled before replay. Memory and context migrations preserve classification, provenance, retention, and deletion controls.

## Provider and Model Changes

A provider or model change is a deployment change even when the agent ID is unchanged. Review data handling, retention, region, model behavior, tool calling, limits, pricing, availability, and evaluation variance. Material changes require a new agent version or approved configuration revision with full traceability.

## Monitoring

Track admission denials, success and failure, escalation, human correction, tool denials, approval expiry, policy violations, injection findings, workspace-isolation events, latency, tokens, cost, retries, cancellations, quarantines, and evaluation drift by exact version.

## Incident Response

Security, privacy, authorization, uncontrolled spend, repeated false completion, or unsafe side-effect incidents may trigger automatic circuit breakers and immediate pause. Preserve evidence, restrict access, rotate credentials if exposed, reconcile external state, notify owners, and add regression coverage before reactivation.

## Retirement

Retirement stops new runs, resolves active work, revokes grants and credentials, archives the manifest and evidence, migrates approved memory or state, removes routing, updates the registry, and defines retention and deletion. Retired versions cannot be silently reactivated.

## Acceptance Criteria

- Release artifacts are immutable and reproducible.
- Environment promotion preserves the approved version.
- Canary scope and budgets are enforced.
- Running tasks remain version-pinned.
- Pause, rollback, reconciliation, and kill-switch controls are tested.
- Provider changes trigger appropriate review.
- Retirement revokes access and preserves required evidence.

## References

- [Release Management](../09_Tests/Release_Management.md)
- [Incident Response](../09_Tests/Incident_Response.md)
- [Agent Execution Framework](Agent_Execution_Framework.md)
- [Agent Evaluation Framework](Agent_Evaluation_Framework.md)
- [Agent Tool Permissions](Agent_Tool_Permissions.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.5 agent deployment model |
