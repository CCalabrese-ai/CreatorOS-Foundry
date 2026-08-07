# Creator OS Foundry Agent Execution Framework

**Phase:** 2.5 — Agent Execution Layer  
**Version:** 1.0  
**Document owner:** Agent Owner and Architecture Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the runtime framework that turns approved AI worker specifications into bounded, observable, recoverable agent executions.

## Scope

The framework covers admission, identity, task contracts, planning, model invocation, tool use, handoffs, approvals, durable state, output validation, audit, failure handling, and termination. It does not grant an agent authority beyond its registry entry, deployed version, workflow, or task.

## Core Principles

- Every execution is bound to an approved agent ID and immutable version.
- A task has one bounded objective, named owner, environment, workspace, and acceptance criteria.
- Permissions are deny-by-default and evaluated at every tool boundary.
- Retrieved content and model output are untrusted until validated.
- Durable workflow state, not model memory, governs progress and authorization.
- Consequential actions require the applicable human or system approval.
- Time, iterations, tokens, tool calls, cost, and concurrency are bounded.
- Operators can pause, cancel, quarantine, replay, and investigate executions.
- Agents cannot approve their own permissions, evaluations, or production activation.

## Runtime Components

| Component | Responsibility |
| --- | --- |
| Admission controller | Validates agent version, task authority, environment, risk, classification, and limits |
| Task contract store | Persists objective, sources, constraints, approvals, allowed tools, and acceptance criteria |
| Context assembler | Builds the minimum authorized prompt and source package |
| Model gateway | Applies approved provider, model, parameters, rate, budget, and retention settings |
| Tool broker | Authorizes and mediates every tool call |
| Execution controller | Manages turns, steps, checkpoints, stop conditions, and retries |
| Handoff service | Transfers bounded work using structured contracts |
| Approval service | Records exact decision, scope, approver, conditions, and expiry |
| Artifact service | Stores outputs, hashes, provenance, classification, and retention |
| Evaluation service | Runs pre-deployment and runtime quality and security checks |
| Audit and telemetry | Records decisions, tool activity, cost, latency, failures, and outcomes |
| Control plane | Deploys, pauses, rolls back, migrates, and retires agent versions |

## Execution Contract

Each run must include run_id, agent_id, agent_version, registry_mapping, owner, initiator, workspace_id, environment, objective, input schema, output schema, source references, classification, allowed tools and operations, approval policy, time and cost limits, stop conditions, acceptance criteria, and workflow reference.

Missing or conflicting authority blocks admission.

## Execution Sequence

1. Authenticate the initiator and resolve the approved agent version.
2. Validate task scope, classification, environment, risk, tool permissions, and approvals.
3. Create the durable run and idempotency record before any side effect.
4. Assemble minimum context from approved sources with provenance and freshness.
5. Invoke the approved model through the gateway.
6. Validate each proposed tool call through the broker.
7. Persist step outcome, artifacts, usage, findings, and next-state decision.
8. Pause for required human input, approval, or external event.
9. Validate final output against task and agent contracts.
10. Close with outcome, evidence, cost, residual risk, and follow-up obligations.

## Run States

Queued, Running, Waiting, Paused, Review Required, Succeeded, Failed, Cancelled, and Quarantined are durable states. An unknown external side effect moves the run to Waiting or Quarantined until reconciliation. Terminal state does not erase audit or retention obligations.

## Planning and Autonomy

Planning may decompose the objective into bounded steps, but it cannot expand scope, tools, data, environments, or side effects. Delegation requires an approved recipient and structured handoff. The controller enforces maximum depth, fan-out, iterations, runtime, cost, and concurrent work.

## Output Validation

Outputs must satisfy schema, provenance, classification, policy, security, factual, and task-specific checks. Generated code, database changes, security controls, financial actions, public content, and identity changes require deterministic tests and accountable review before execution.

## Failure and Recovery

Transient model and tool failures may retry within declared bounds. Authorization, policy, validation, approval denial, prompt injection, classification mismatch, and unknown side effects are not blind-retry conditions. Checkpoints allow safe resumption. Replays use idempotency records. Unsafe or ambiguous runs quarantine and notify the accountable owner.

## Observability

Record agent and model versions, workflow, task and step IDs, source references, prompt and output hashes where permitted, tool decisions, approvals, usage, cost, latency, retries, findings, state changes, and final disposition. Telemetry must minimize content and exclude secrets.

## Acceptance Criteria

- Only approved agent versions can start.
- Every execution has a complete task and permission contract.
- Tool, context, approval, and cost boundaries are enforced.
- State survives restarts and durable waits.
- Failures preserve authoritative external state.
- Outputs are validated before consequential use.
- Audit evidence reconstructs all material decisions.

## References

- [AI Workforce Registry](AI_Workforce_Registry.md)
- [Agent Tool Permissions](Agent_Tool_Permissions.md)
- [Agent Context Management](Agent_Context_Management.md)
- [Agent Evaluation Framework](Agent_Evaluation_Framework.md)
- [Agent Deployment Model](Agent_Deployment_Model.md)
- [AI Security Guidelines](../08_Security/AI_Security_Guidelines.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.5 agent execution framework |
