# Creator OS Foundry Agent Tool Permissions

**Phase:** 2.5 — Agent Execution Layer  
**Version:** 1.0  
**Document owner:** Agent Owner and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how AI workers receive, use, and lose tool permissions. A registered tool is not automatically available to an agent; access requires an explicit versioned permission grant.

## Permission Model

Authorization is the intersection of:

- approved agent version;
- active Tool Registry entry;
- workflow and step;
- task-specific allowed operations;
- workspace and resource scope;
- environment;
- data classification;
- authenticated runtime identity;
- required approval;
- time, rate, and cost limits.

If any dimension is missing or incompatible, access is denied.

## Permission Grant Schema

| Field | Requirement |
| --- | --- |
| grant_id | Stable unique identifier |
| agent_id and version | Exact permitted agent implementation |
| tool_id | Active Tool Registry identifier |
| operations | Explicit read, create, update, delete, publish, execute, or administer actions |
| resources | Repository, project, schema, path, record, or endpoint scope |
| workspace_id | Tenant boundary |
| environments | Allowed local, preview, staging, or production targets |
| data_classes | Allowed input and output classifications |
| side_effect_class | Read-only, internal write, external, financial, destructive, identity, or privileged |
| approval_policy | Approver, action boundary, conditions, and expiry |
| credential_reference | Protected runtime identity reference |
| limits | Rate, concurrency, data volume, spend, and duration |
| validity | Effective, expiry, revocation, and review timestamps |
| owner | Accountable role |
| evidence | Security, evaluation, and activation references |

## Tool Broker Checks

Before every call, the broker verifies the run, agent version, grant status, workflow step, operation, resource, arguments, destination, workspace, environment, classification, approval, credential, limits, and current Tool Registry state. Successful authentication does not replace authorization.

## Capability Classes

| Class | Examples | Default control |
| --- | --- | --- |
| Read | Search, inspect, query bounded metadata | Explicit source and classification scope |
| Draft | Create local or workflow artifacts | No canonical or external publication |
| Internal write | Repository branch or database record update | Path or row scope, validation, idempotency |
| External effect | Send, publish, deploy, or call provider mutation | Exact approval and reconciliation |
| Financial | Purchase, paid generation, refund, billing change | Human approval and budget control |
| Destructive | Delete, revoke, overwrite, reset, or rotate | Strong confirmation, target resolution, recovery |
| Identity and privileged | Role, policy, secret, production administration | Human approval, short-lived access, enhanced audit |

## Credential Controls

Agents never receive raw long-lived credentials in prompts, memory, or outputs. The broker injects a protected identity only at the trusted call boundary. Credentials are separated by environment and workload, rotated, revocable, and audited. Service-role or owner credentials are prohibited from untrusted client paths.

## Argument and Destination Validation

Tool schemas are necessary but not sufficient. The broker enforces allowed domains, repository owners, branches, filesystem roots, database projects, schemas, table operations, messaging recipients, and spend thresholds. Redirects and dynamically supplied destinations require policy validation.

## Approval Boundaries

Approvals bind the exact action, arguments or bounded parameter set, resource, environment, data, cost, agent version, and expiry. Content changes after approval invalidate it when meaning or risk changes. An agent cannot create, satisfy, or reinterpret its own approval.

## Revocation and Emergency Pause

Security Owner, Agent Owner, Tool Owner, or authorized incident workflow may revoke a grant or pause a tool immediately. Active runs re-evaluate permissions before the next call. Unknown external outcomes are reconciled before retry or compensation.

## Audit

Record grant decision, agent and tool versions, operation, normalized arguments hash, destination, identity reference, approval reference, timestamp, latency, outcome, error class, cost, and correlation IDs. Redact secrets and minimize sensitive arguments.

## Testing

Test allowed and denied operations, cross-workspace and cross-environment access, classification boundaries, stale and revoked grants, expired approvals, argument tampering, redirect behavior, cost limits, concurrency, prompt injection, confused-deputy cases, duplicate calls, and unknown outcomes.

## Acceptance Criteria

- Every tool call maps to an active explicit grant.
- Arguments and destinations remain inside scope.
- Secrets stay outside prompts and agent memory.
- High-impact actions require exact approval.
- Revocation takes effect before subsequent calls.
- Audit records support investigation without exposing credentials.

## References

- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [AI Workforce Registry](AI_Workforce_Registry.md)
- [Agent Execution Framework](Agent_Execution_Framework.md)
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Integration Standards](../06_Automations/Integration_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.5 agent tool-permission model |
