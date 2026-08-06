# Creator OS Foundry Database Model

**Phase:** 0.3 — Core Registries  
**Version:** 1.0  
**Model owner:** Data Owner  
**Status:** Conceptual baseline

## Purpose

This document defines the initial logical data model for Creator OS Foundry. It is implementation-neutral: physical Postgres schemas, migrations, indexes, and row-level security policies will be specified separately.

## Modeling Standards

Every mutable record must include a stable identifier, workspace identifier, owner or accountable actor, lifecycle status, creation timestamp, update timestamp, and version or concurrency control. Material changes must emit an auditable event.

Use UUID-compatible identifiers. Store timestamps in UTC. Use explicit foreign keys and controlled enumerations. Secrets and raw credentials are never ordinary database fields.

## Core Entity Groups

### Identity and Governance

| Entity | Purpose |
| --- | --- |
| workspaces | Top-level governed operating contexts |
| users | Authenticated human identities |
| roles | Named responsibilities and permission bundles |
| memberships | User-to-workspace role assignments |
| policies | Versioned rules constraining data and actions |
| decisions | Approved choices, rationale, owners, and status |
| approvals | Human authorization for consequential actions |

### Knowledge and Registries

| Entity | Purpose |
| --- | --- |
| documents | Canonical knowledge records and repository references |
| document_versions | Version history and provenance |
| agents | AI worker registry records |
| agent_versions | Instructions, capability scopes, and evaluation versions |
| tools | Tool registry records |
| tool_permissions | Role, agent, workflow, and environment grants |
| workflows | Workflow registry records |
| workflow_versions | Versioned orchestration definitions |

### Execution and Outputs

| Entity | Purpose |
| --- | --- |
| tasks | Bounded units of assigned work |
| runs | Executions of agents, workflows, or tasks |
| run_steps | Ordered execution steps and outcomes |
| artifacts | Files, reports, media, or structured outputs |
| events | Append-oriented audit and domain events |
| evaluations | Quality, safety, reliability, and performance results |
| incidents | Operational or security incident records |

### Integrations and Operations

| Entity | Purpose |
| --- | --- |
| integrations | Configured instances of registered tools |
| credential_references | Pointers to protected secret storage |
| usage_records | Model, API, compute, and storage consumption |
| notifications | Operational alerts and approval requests |

## Key Relationships

A workspace contains all governed entities. Memberships connect users to roles. Policies constrain agents, tools, workflows, and data access. Workflows create tasks and runs. Runs contain run steps, consume documents and data, produce artifacts, request approvals, generate usage records, and emit events. Evaluations assess agents, workflow versions, runs, and artifacts.

## Data Classification

- **Public** — approved for public release.
- **Internal** — normal non-public operating data.
- **Confidential** — business-sensitive or personally identifying data.
- **Restricted** — secrets, regulated data, privileged security data, or high-impact records.

Classification propagates to derived artifacts unless an approved declassification decision exists.

## Lifecycle and Retention

Records use explicit lifecycle states rather than silent deletion. Destructive deletion requires authorization, dependency checks, an audit event, and a documented retention rule. Event and approval history should be append-oriented and protected from ordinary mutation.
