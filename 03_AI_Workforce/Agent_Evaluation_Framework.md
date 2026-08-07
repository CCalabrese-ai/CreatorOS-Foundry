# Creator OS Foundry Agent Evaluation Framework

**Phase:** 2.5 — Agent Execution Layer  
**Version:** 1.0  
**Document owner:** Quality Owner, Agent Owner, and Security Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the evidence required to approve, deploy, monitor, and change Creator OS Foundry AI agents.

## Evaluation Principles

- Evaluate the exact agent, model, prompt, tool, permission, context, and workflow version.
- Test allowed, denied, adversarial, failure, and recovery behavior.
- Measure task quality and safety separately.
- Use representative synthetic or approved sanitized data.
- Require independent review for high-risk agents.
- Production incidents and drift feed regression suites.
- A passing average cannot hide a critical control failure.

## Evaluation Dimensions

| Dimension | Required outcome |
| --- | --- |
| Task correctness | Output satisfies objective and domain criteria |
| Grounding | Claims trace to approved sources and uncertainty is visible |
| Instruction adherence | System, governance, agent, and task boundaries are followed |
| Tool behavior | Calls are necessary, scoped, authorized, and correctly interpreted |
| Security | Injection, exfiltration, escalation, and confused-deputy attacks fail |
| Privacy | Data is minimized, isolated, retained, and deleted correctly |
| Reliability | Timeouts, retries, handoffs, cancellation, and recovery are safe |
| Human oversight | Approval and escalation occur at the correct boundary |
| Efficiency | Latency, tokens, tool calls, and spend remain within budgets |
| Operability | Logs, metrics, alerts, pause, rollback, and investigation work |
| Fairness and harm | Relevant harmful bias and user-impact risks are assessed |
| Maintainability | Results are reproducible and tied to versioned fixtures and rubrics |

## Evaluation Levels

Unit evaluations test deterministic decisions, schemas, parsers, and policy logic. Scenario evaluations test complete agent tasks. Tool evaluations verify argument and permission behavior. Workflow evaluations test handoffs and state transitions. Adversarial evaluations test malicious or conflicting input. Staging evaluations use production-equivalent configuration without production secrets. Limited production monitoring validates real behavior within approved safeguards.

## Test Case Contract

Each case records test ID, risk, objective, agent and model versions, workflow, initial state, inputs, sources, classification, allowed tools, expected decisions, prohibited actions, rubric, thresholds, evaluator, fixtures, and retained evidence.

## Required Scenario Families

- normal successful tasks for each advertised capability;
- insufficient, stale, contradictory, and unavailable sources;
- ambiguous authority and missing approval;
- prompt and indirect injection;
- requests for secrets, sensitive data, or cross-workspace content;
- unauthorized tools, resources, arguments, destinations, and environments;
- excessive delegation, looping, token use, or spend;
- tool timeout, partial failure, duplicate effect, and unknown outcome;
- memory poisoning, stale cache, retrieval poisoning, and deletion;
- cancellation, pause, restart, model outage, and provider change;
- false completion, fabricated evidence, and concealed uncertainty.

## Scoring and Gates

Rubrics use clear pass criteria and severity-ranked findings. Critical safety, authorization, secret, workspace-isolation, destructive, financial, or approval failures are blocking regardless of aggregate score. Quality thresholds are agent-specific and approved before evaluation begins.

## Evaluators

Deterministic checks run automatically. Model-based graders may assist but must be versioned, calibrated, and checked against human review. Domain Owners judge specialized correctness. Security Owner judges security gates. Agent Owner accepts residual operational risk. No agent is the sole evaluator of its own production activation.

## Regression and Variance

Run critical scenarios repeatedly to identify nondeterminism. Report distributions, worst cases, and failure clusters, not only averages. The regression suite includes all previous blocking findings and material production incidents.

## Runtime Evaluation

Monitor refusal and escalation quality, unsupported claims, tool denial, approval bypass attempts, abnormal cost, repeated retries, user corrections, reopened findings, and drift by model or prompt version. Sampled review follows classification and privacy rules.

## Change Triggers

Reevaluation is required for material changes to model or provider, system prompt, tools, grants, data classes, context sources, memory, workflow, approval, autonomy limits, output contract, deployment environment, or risk class.

## Evidence and Retention

Retain evaluation configuration, fixture version, hashes, results, findings, approvals, exceptions, cost, and timestamps. Minimize sensitive inputs and store protected artifacts by reference. Accepted risk has an owner, expiry, compensating control, and review date.

## Acceptance Criteria

- Every active capability has positive and negative coverage.
- Critical control failures block activation.
- Results identify exact runtime versions.
- Variance and worst-case behavior are visible.
- Independent reviewers approve high-risk deployments.
- Runtime drift and incidents update regression coverage.

## References

- [QA Framework](../09_Tests/QA_Framework.md)
- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [AI Security Guidelines](../08_Security/AI_Security_Guidelines.md)
- [Agent Execution Framework](Agent_Execution_Framework.md)
- [Agent Deployment Model](Agent_Deployment_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.5 agent evaluation framework |
