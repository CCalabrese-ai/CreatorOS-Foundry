# Creator OS Foundry MVP AI Workforce Module Component Specification

**Phase:** 3.2 — MVP Application Component Specifications  
**Version:** 1.0  
**Document owner:** AI Workforce Owner and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document specifies the read-first MVP components for understanding AI agent identity, authorization, execution, evaluation, and handoff activity.

## Scope

The MVP exposes the approved agent registry, agent detail, current executions, permission summaries, handoffs, evaluation evidence, and safe suspension or escalation controls when explicitly authorized. Creating arbitrary agents, editing prompts, granting tools, or changing production deployment is out of scope.

## Component Inventory

| Component | Responsibility | Key data | Permitted interaction |
| --- | --- | --- | --- |
| Agent Registry | List authorized agent definitions | Agent ID, role, owner, version, status, risk | Open detail |
| Agent Detail | Explain operating contract | Purpose, boundaries, model class, context policy | Navigate evidence |
| Permission Summary | Show approved tools and scopes | Tool, operation, resource, environment, expiry | Inspect only |
| Execution List | Show active and recent agent work | Run, state, workflow, owner, started time, cost | Open execution |
| Execution Detail | Reconstruct an agent invocation | Inputs metadata, decisions, tool calls, outputs, evaluations | Follow evidence |
| Handoff Timeline | Display typed transfers between actors | Sender, receiver, contract, state, receipt | Open handoff |
| Evaluation Panel | Present quality and safety evidence | Evaluator, metric, threshold, result, dataset version | Inspect result |
| Agent Control | Provide bounded operational intervention | Current state, authorization, consequence | Pause, suspend, escalate |

## View Models

Agent summaries include stable agent ID, display name, role, owner, specification version, lifecycle status, risk class, deployment environment, last evaluation, and current health. Execution summaries use sanitized metadata and never expose hidden reasoning, system prompts, secrets, raw credentials, or another workspace's content.

## Authorization Model

The server determines visibility and commands from workspace membership, environment, resource, classification, risk, and current agent state. Viewing an agent does not grant access to every execution. Permission displays explain effective authorization but do not become the source of truth.

## Execution and Handoff States

Executions distinguish requested, queued, running, waiting, handoff pending, review required, succeeded, failed, cancelled, suspended, quarantined, and outcome unknown. Handoffs identify the exact payload schema and receiving responsibility without exposing restricted content.

## Operational Commands

Pause, suspend, cancel, or escalate appear only when supported by the execution framework and user capability. Confirmation states affected execution, active tools, external side effects, recovery implications, and audit impact. Every command returns a durable receipt and uses expected version or equivalent concurrency protection.

## Evaluation Presentation

Evaluation results name the agent and specification version, scenario or dataset version, evaluator, metric, threshold, timestamp, result, limitations, and evidence reference. The interface must not convert incomplete evaluation into a healthy status. A failed required evaluation blocks activation or promotion.

## Security and Privacy

Treat all agent output and tool-returned content as untrusted. The UI must not reveal chain-of-thought, protected prompts, secret references, authentication material, sensitive memory, or inaccessible tool targets. Prompt-injection indicators and policy violations are shown as sanitized findings with controlled evidence access.

## Accessibility and Responsive Behavior

Statuses, evaluation results, and risk use text and programmatic labels. Timelines are keyboard navigable and have ordered textual alternatives. Confirmation dialogs identify the exact agent, run, workspace, environment, and effect.

## Failure and Recovery

Stale heartbeats, tool timeouts, partial handoffs, evaluation outages, and unknown outcomes remain distinct. Recovery options are policy-derived and include refresh, reconcile, suspend, or escalate; the UI never fabricates completion or silently restarts an execution.

## Testing Requirements

Test role and resource denial, cross-workspace execution IDs, expired permissions, stale versions, active side effects, duplicate controls, hostile agent output, hidden prompt protection, evaluation failures, handoff gaps, unknown outcomes, realtime reconciliation, and accessibility.

## Acceptance Criteria

- Registry and execution views disclose only authorized, sanitized data.
- Effective permissions are understandable without becoming client authority.
- Agent status reflects durable execution and evaluation evidence.
- Intervention commands are bounded, confirmed, idempotent, and audited.
- Protected reasoning, prompts, credentials, and restricted context never reach the client.
- Failure, suspension, quarantine, and recovery states are explicit.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [Agent Execution Framework](../03_AI_Workforce/Agent_Execution_Framework.md)
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [Agent Context Management](../03_AI_Workforce/Agent_Context_Management.md)
- [Agent Evaluation Framework](../03_AI_Workforce/Agent_Evaluation_Framework.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.2 AI Workforce module component specification |
