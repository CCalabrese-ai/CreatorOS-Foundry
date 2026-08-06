# Core Domain Model

**Phase:** 0.2 — System Definition  
**Version:** 1.0

## Core Concepts

| Entity | Definition |
| --- | --- |
| Workspace | Governed operating context containing people, agents, knowledge, data, and applications |
| User | Authenticated human identity |
| Role | Named set of responsibilities and permissions |
| Policy | Rule that constrains decisions or actions |
| Decision | Recorded choice with context, owner, rationale, and status |
| Document | Versioned unit of canonical knowledge |
| Agent | AI worker definition with role, instructions, tools, and controls |
| Tool | Registered callable capability or external integration |
| Credential Reference | Pointer to a protected secret; never the secret value itself |
| Workflow | Versioned orchestration of steps, rules, approvals, and failure handling |
| Task | Bounded unit of work assigned to a human, agent, or automation |
| Run | One execution instance of a workflow, task, or agent operation |
| Approval | Human authorization for a proposed consequential action |
| Artifact | Output produced by a task or run |
| Data Record | Durable operational entity governed by a schema |
| Event | Immutable record of a meaningful state change or action |
| Application | User-facing experience built on Foundry capabilities |
| Evaluation | Measured assessment of quality, safety, reliability, or performance |

## Key Relationships

- A Workspace contains Users, Roles, Documents, Agents, Tools, Workflows, and Applications.
- A User holds one or more Roles.
- Policies constrain Agents, Tools, Workflows, Applications, and data access.
- A Workflow creates Tasks and Runs.
- A Task is assigned to a User, Agent, or automation identity.
- An Agent may use only registered Tools permitted by its Role and active Policies.
- A consequential Run may require one or more Approvals.
- Runs consume Documents and Data Records, produce Artifacts, and emit Events.
- Evaluations assess Agents, Workflows, Runs, and Artifacts.
- Decisions update governance, architecture, or operating policy.

## Modeling Rules

Every durable entity must have a stable identifier, owner, lifecycle status, creation and update timestamps, and an auditable change path. Sensitive fields must carry classification and access rules. References to external systems must preserve source identity and synchronization status.
