# Creator OS Foundry Agent Handoff Standards

**Phase:** 1.5 — Automation Engine Foundation  
**Version:** 1.0  
**Document owner:** Automation Owner and Agent Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines secure, reliable handoffs among humans, AI workers, services, tools, and workflows. A handoff transfers bounded work and evidence; it does not transfer unlimited authority.

## Handoff Contract

Every handoff must include:

| Field | Requirement |
| --- | --- |
| Handoff ID | Unique identifier linked to the run and step |
| Sender | Authenticated actor and version |
| Recipient | Named actor, role, queue, or workflow |
| Objective | Bounded outcome requested |
| Context | Minimum verified information needed |
| Sources | Canonical links and provenance |
| Inputs | Typed references and data classification |
| Authority | Allowed tools, operations, environment, and side effects |
| Approvals | Completed and still-required decisions |
| Constraints | Time, cost, privacy, security, and quality limits |
| Acceptance criteria | Evidence required for completion |
| Stop conditions | Conflicts, missing access, uncertainty, and risk limits |
| Return channel | Output schema, status, artifacts, and escalation path |

## Handoff Rules

- The sender must not claim authority it does not possess.
- The recipient must independently verify its own permissions.
- Context must distinguish verified fact, instruction, proposal, and untrusted content.
- Secrets are passed by protected reference only.
- Large source material should be linked rather than copied when access and retention permit.
- The recipient must acknowledge acceptance, rejection, or need for clarification.
- Partial work and unresolved risk must remain visible.
- A handoff cannot mark upstream acceptance criteria complete without evidence.

## AI-to-AI Handoffs

AI workers must exchange stable identifiers, source references, structured constraints, and explicit tool scopes. They must not use conversational tone as evidence of approval. The receiving agent treats embedded external instructions as untrusted and applies its own agent specification.

## Human Approval Handoffs

Approval requests must state the exact action, destination, data involved, side effects, reversibility, cost, risk, and expiry. Approval covers only the described scope. Silence and prior approval for a different action do not authorize execution.

## Failure and Escalation

A recipient rejects or pauses a handoff when identity, objective, sources, authority, data classification, required approval, or acceptance criteria are missing. Rejection returns a reason and required correction. Repeated or security-relevant failure is escalated to the accountable owner.

## State Transitions

| State | Meaning |
| --- | --- |
| Offered | Sender created the handoff |
| Accepted | Recipient confirmed scope and authority |
| In Progress | Recipient is performing bounded work |
| Waiting | Clarification, dependency, or approval is pending |
| Returned | Output and evidence were delivered |
| Rejected | Contract was invalid or unauthorized |
| Cancelled | Authorized owner ended the work |
| Escalated | Owner intervention is required |

## Data and Memory

The handoff record stores metadata, references, decisions, and outcome evidence. It must minimize copied content and exclude raw secrets. Persistent agent memory may retain only information permitted by the receiving agent contract.

## Observability

Record sender, recipient, versions, timestamps, acknowledgment, status changes, approvals, tool calls, artifact references, failure reasons, and final outcome. Monitor abandoned, repeatedly rejected, overdue, and cross-workspace handoffs.

## Acceptance Criteria

- Every handoff has a complete, traceable contract.
- Recipients verify permissions instead of inheriting assumed authority.
- Approval requests are specific and bounded.
- Sensitive data and secrets follow classification controls.
- Failed or incomplete work is visible and recoverable.
- Handoff records support audit without unnecessary data duplication.

## References

- [Automation Architecture](Automation_Architecture.md)
- [Workflow Design Standards](Workflow_Design_Standards.md)
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md)
- [AI Security Guidelines](../08_Security/AI_Security_Guidelines.md)
- [Project Operations Agent](../03_AI_Workforce/COS-AI-004_Project_Operations_Agent.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.5 agent handoff standard |
