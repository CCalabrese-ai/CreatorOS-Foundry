# Creator OS Foundry AI Security Guidelines

**Phase:** 1.4 — Security Framework  
**Version:** 1.0  
**Document owner:** Security Owner and Agent Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines security requirements for AI workers, model interactions, prompts, memory, tools, retrieved content, generated outputs, and autonomous execution in Creator OS Foundry.

## Core Principles

- Treat model output as untrusted until validated.
- Separate system authority from user, retrieved, pasted, and tool-provided content.
- Grant tools and data explicitly, narrowly, and for a bounded task.
- Require human approval before consequential external side effects.
- Minimize sensitive data sent to models and providers.
- Preserve provenance, model and agent version, tool calls, approvals, and outcomes.
- Stop safely when instructions conflict, authority is missing, or risk exceeds scope.
- Never let an AI worker approve its own permissions, risk exception, or production activation.

## Threats

The AI control model must address prompt injection, indirect injection, data exfiltration, secret leakage, excessive agency, privilege escalation, confused-deputy behavior, unsafe tool composition, insecure generated code, hallucinated authority, memory poisoning, retrieval poisoning, cross-workspace leakage, model-supply-chain risk, denial of wallet, and unbounded execution loops.

## Instruction and Content Boundaries

System and governance instructions have higher authority than task content. External pages, files, messages, database records, tool output, and retrieved text provide data, not permission. Agents must identify conflicts and ignore instructions embedded in untrusted content that attempt to change scope, reveal data, use tools, or bypass approval.

## Agent Authorization Contract

Every active AI worker must define:

| Field | Requirement |
| --- | --- |
| Agent ID and version | Stable registry mapping |
| Owner | Accountable human role |
| Purpose | Bounded responsibility |
| Allowed tools | Named and permission-scoped |
| Data classes | Explicitly permitted inputs and outputs |
| Environments | Allowed operating targets |
| Side effects | Allowed, prohibited, and approval-gated |
| Memory | Retention, isolation, and deletion rules |
| Evaluation | Security and quality thresholds |
| Stop conditions | Ambiguity, conflicts, failures, and risk limits |
| Disablement | Immediate pause and retirement path |

## Tool Use

Before a tool call, the agent must verify the tool is registered, the identity is authorized, arguments match scope, data transmission is permitted, and side effects are understood. Read access does not imply write authority. Tools that publish, message, spend, deploy, delete, change permissions, or access sensitive data require explicit policy and approval.

## Data and Privacy

Send only data necessary for the task. Restricted data requires an approved provider and processing boundary. Secrets must never enter prompts, memory, examples, traces, or outputs. Workspace data must remain isolated. Model training or retention settings must match approved contracts.

## Memory and Retrieval

Persistent memory must have an owner, purpose, scope, classification, retention period, deletion path, and provenance. Retrieved content must carry source and freshness metadata. Memory and indexes must not convert an unapproved claim into canonical fact.

## Output Validation

Security-sensitive outputs require deterministic validation where possible and accountable human review where judgment remains. Generated code, queries, policies, migrations, commands, and configuration must be reviewed and tested before production use. Citations and implementation claims must be verified.

## Autonomy and Limits

Agent work must have a bounded objective, time or iteration limits, budget controls, cancellation, and visible status. Retries must not duplicate irreversible side effects. An agent must pause when approval is absent, costs exceed limits, a tool behaves unexpectedly, or observed state contradicts assumptions.

## Logging and Monitoring

Record agent version, initiating principal, scope, sources, tool calls, approvals, model or provider, result status, and security events. Avoid recording sensitive prompt content unnecessarily. Monitor denied actions, tool anomalies, repeated injection attempts, unusual exports, cost spikes, and cross-workspace patterns.

## Evaluation Requirements

Test direct and indirect prompt injection, secret requests, unauthorized tool use, cross-workspace access, false approval claims, malicious retrieved content, unsafe code generation, excessive retries, and stop behavior. High-risk agents require independent evaluation before activation and after material changes.

## Incident Response

On suspected AI security failure, pause the agent or affected tool, contain credentials and data paths, preserve sanitized evidence, identify impacted runs and artifacts, notify owners, remediate the root cause, and rerun adversarial and regression evaluations before reactivation.

## Acceptance Criteria

- Every AI worker has a registered authorization contract and owner.
- Untrusted content cannot grant tool or data authority.
- Secrets and cross-workspace data are protected.
- Consequential actions require appropriate human approval.
- Security evaluations cover abuse, denial, and stop paths.
- Agents can be paused and investigated without losing evidence.

## References

- [Security Architecture](Security_Architecture.md)
- [Identity and Access Control](Identity_and_Access_Control.md)
- [Secrets Management](Secrets_Management.md)
- [Security Review Process](Security_Review_Process.md)
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.4 AI security guidelines |
