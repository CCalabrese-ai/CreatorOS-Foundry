# Non-Functional Requirements

**Phase:** 0.2 — System Definition  
**Version:** 1.0

## Security and Privacy

- Apply least privilege to every human, agent, application, and integration.
- Keep secrets outside source code and ordinary documents.
- Encrypt sensitive data in transit and at rest using platform-supported controls.
- Log privileged actions and changes to authorization.
- Require explicit approval for high-impact, destructive, public, or financial actions.
- Minimize collection and transmission of personal or confidential data.

## Reliability

- Define timeouts, retries, and failure handling for external calls.
- Make repeatable automation steps idempotent where practical.
- Preserve run state so interrupted work can be diagnosed or resumed safely.
- Prevent one failed integration from causing uncontrolled cascading failures.
- Back up critical data and document recovery procedures.

## Observability

- Assign correlation identifiers to workflows and runs.
- Record actor, action, time, target, result, and relevant policy decision.
- Surface health, failures, approval waits, latency, usage, and cost.
- Keep logs useful without exposing secrets or unnecessary sensitive content.

## Maintainability

- Use modular components with documented contracts.
- Version schemas, prompts, workflows, policies, and interfaces.
- Record material architecture decisions.
- Keep canonical documentation synchronized with implementation changes.
- Prefer reversible migrations and backward-compatible evolution.

## Performance and Cost

- Establish service expectations for interactive and background work.
- Track model, storage, integration, and compute usage.
- Select the least costly capability that meets quality and risk requirements.
- Use queues or asynchronous processing for long-running work.

## Portability and Extensibility

- Isolate third-party providers behind adapters.
- Avoid embedding provider-specific behavior in domain logic.
- Allow new agents, tools, workflows, and applications without restructuring the core.

## Quality Gates

A release is acceptable only when relevant tests pass, security and data impacts are reviewed, documentation is updated, owners are identified, and rollback or recovery steps are known.
