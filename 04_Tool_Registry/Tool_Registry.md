# Tool Registry

**Phase:** 0.3 — Core Registries  
**Version:** 1.0  
**Registry owner:** Security Owner and relevant Domain Owner  
**Status:** Baseline

## Purpose

This registry records tools and external integrations that Creator OS Foundry may use. Registration does not grant access; every user, agent, workflow, and application must receive an explicit permission scope.

## Lifecycle

- **Candidate** — under evaluation; no production dependency.
- **Approved** — security, ownership, and operating requirements accepted.
- **Active** — configured and available in an approved environment.
- **Restricted** — available only for named use cases or operators.
- **Deprecated** — migration is required.
- **Retired** — disabled and prohibited for new work.

## Risk Classes

| Class | Meaning |
| --- | --- |
| T1 | Read-only, public, or draft-local capability |
| T2 | Internal write capability with bounded impact |
| T3 | External side effects, sensitive data, privileged access, or meaningful spend |
| T4 | Destructive, public, financial, identity, or security-critical capability |

## Registry

| ID | Tool / integration | Purpose | Data direction | Side effects | Risk | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TOOL-001 | GitHub | Source control, issues, reviews, and release history | Bidirectional | Repository writes and publication | T3 | Architecture Owner | Active |
| TOOL-002 | OpenAI Platform | Language, reasoning, embeddings, and agent capabilities | Bidirectional | Model usage cost and generated outputs | T3 | Agent Owner | Candidate |
| TOOL-003 | Supabase | Postgres database, authentication, storage, vectors, and realtime services | Bidirectional | Durable data and identity changes | T4 | Data Owner | Candidate |
| TOOL-004 | WaveSpeed | Image, video, audio, and other media generation | Bidirectional | Media generation cost and stored assets | T3 | Media Domain Owner | Candidate |
| TOOL-005 | Local Development Runtime | Editing, validation, tests, and artifact preparation | Local | Local file changes and execution | T2 | Architecture Owner | Approved |

## Required Registration Fields

Every new entry or supporting specification must identify:

- business purpose and accountable owner;
- provider and service endpoints;
- authentication method and secret reference;
- environments and permission scopes;
- data classifications sent and received;
- possible external, public, destructive, or financial side effects;
- rate limits, quotas, cost controls, and service expectations;
- logging, audit, retention, and privacy requirements;
- timeout, retry, idempotency, and failure behavior;
- disablement, credential rotation, migration, and retirement procedures.

## Control Rules

Secrets must be referenced, never committed. Tool access is deny-by-default and scoped by role, workflow, environment, and data classification. T3 and T4 actions require explicit safeguards; T4 actions require human approval unless a documented governance exception exists.
