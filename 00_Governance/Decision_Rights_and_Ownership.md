# Decision Rights and Ownership

**Phase:** 0.2 — System Definition  
**Version:** 1.0

## Purpose

This document defines who may propose, approve, implement, and review changes to Creator OS Foundry.

## Core Roles

| Role | Primary accountability |
| --- | --- |
| Founder / System Owner | Vision, priorities, risk acceptance, funding, and final approval |
| Architecture Owner | System boundaries, design decisions, interfaces, and technical coherence |
| Domain Owner | Requirements, policies, and quality for a functional area |
| Security Owner | Security controls, access policy, incident readiness, and exceptions |
| Data Owner | Data definitions, retention, quality, privacy, and authorized use |
| Automation Owner | Workflow behavior, triggers, failure handling, and operational monitoring |
| Agent Owner | AI role definition, instructions, tool permissions, evaluations, and lifecycle |
| Contributor | Scoped implementation, documentation, testing, and review |

A single person may hold multiple roles during the Foundry's early stages, but each accountability must remain explicit.

## Decision Classes

| Decision | Approval required |
| --- | --- |
| Vision, system scope, or governance policy | System Owner |
| Architecture or cross-domain interface | Architecture Owner; System Owner for material tradeoffs |
| New external integration or privileged tool | Security Owner and relevant Domain Owner |
| Data classification, retention, or destructive migration | Data Owner and Security Owner |
| Production automation with external side effects | Automation Owner and relevant Domain Owner |
| Agent permission or autonomy expansion | Agent Owner and Security Owner |
| Routine documentation or low-risk implementation | Relevant owner or delegated reviewer |
| Security exception or accepted residual risk | System Owner and Security Owner |

## Change Process

1. Record the proposal and its intended outcome.
2. Identify affected domains, data, integrations, and risks.
3. Obtain approval from the required owners.
4. Implement with tests and updated documentation.
5. Verify acceptance criteria and operational readiness.
6. Record the decision, commit, and follow-up obligations.

## Escalation

Conflicts unresolved by domain owners escalate to the Architecture Owner. Decisions involving material business, privacy, financial, legal, or security risk escalate to the System Owner. Emergency actions may prioritize containment, but must be documented and reviewed afterward.
