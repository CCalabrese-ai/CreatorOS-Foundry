# Creator OS Foundry Automation Testing Framework

**Phase:** 1.5 — Automation Engine Foundation  
**Version:** 1.0  
**Document owner:** Quality Owner and Automation Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the test strategy and release evidence required for Creator OS Foundry workflows, handoffs, integration adapters, and automation operations.

## Test Principles

- Test contracts, state transitions, and side effects—not only code paths.
- Use production-equivalent identities and permissions without production secrets or data.
- Verify allowed and denied behavior.
- Make tests deterministic where possible and isolate provider uncertainty.
- Exercise failure, timeout, retry, cancellation, compensation, and recovery.
- Prevent test runs from creating unintended public, financial, destructive, or customer-facing effects.
- Retain evidence tied to workflow and implementation versions.

## Test Layers

| Layer | Purpose |
| --- | --- |
| Contract | Validate input, output, event, handoff, and adapter schemas |
| Unit | Verify pure decisions, transformations, and error classification |
| Component | Test workers, state transitions, policies, and adapters in isolation |
| Integration | Verify approved sandbox or provider behavior |
| Workflow | Exercise complete paths across steps and durable state |
| Security | Test authorization, injection, secrets, isolation, and abuse cases |
| Resilience | Test timeout, retry, backpressure, outage, replay, and recovery |
| Performance | Verify latency, throughput, concurrency, and resource limits |
| Cost | Confirm quotas, attribution, alerts, and budget stops |
| Acceptance | Demonstrate the registered outcome and operational readiness |

## Required Scenarios

Every workflow must test:

- valid trigger and valid completion;
- invalid, unauthorized, duplicate, and replayed triggers;
- missing, malformed, oversized, and misclassified inputs;
- approval granted, denied, expired, revoked, and unavailable;
- each external dependency timing out or returning classified errors;
- retries reaching success and exhaustion;
- worker crash before and after a side effect;
- unknown external outcome and reconciliation;
- cancellation in queued, running, and waiting states;
- compensation success and failure;
- cross-workspace and cross-environment denial;
- secret redaction and restricted-data handling;
- pause, resume, rollback, migration, and retirement behavior.

## Test Environments and Data

Local and preview tests use synthetic fixtures. Staging may use sanitized production-like data with approval. Tests must use separate provider accounts, credentials, queues, buckets, endpoints, and cost limits. Production tests are narrow, non-destructive, monitored, and explicitly approved.

## Mocks and Provider Tests

Mocks must reproduce documented contracts and failure classes but cannot replace provider integration tests. Record mock assumptions. Provider tests use sandbox modes when available, controlled fixtures, and cleanup verification.

## Idempotency and Side-Effect Testing

Send the same trigger and step request repeatedly and concurrently. Verify one governed effect, stable recorded outcome, and correct reconciliation. For irreversible actions, use provider sandbox or a non-operational test double.

## Agent and Handoff Testing

Test malicious context, false approval claims, conflicting instructions, missing sources, excessive delegation, unauthorized tools, cross-workspace data, and stop conditions. Verify that recipients reject incomplete handoffs and return structured reasons.

## Security Testing

Test least privilege, role boundaries, webhook signatures, replay defense, request destinations, injection, secret scanning, log redaction, data minimization, and privileged action approvals. High-risk workflows require independent security review.

## Resilience and Recovery Testing

Inject queue delay, provider outage, network loss, duplicate delivery, corrupted payload, partial completion, stale approval, and control-plane interruption. Verify checkpoints, alerts, operator visibility, safe pause, and recovery without duplicate effects.

## Release Gates

A workflow version may become Active only when:

- all required test layers pass;
- blocking findings are closed;
- coverage includes denied and failure paths;
- staging evidence matches the candidate version;
- observability and alerts are verified;
- rollback, pause, compensation, and recovery are exercised;
- cost and capacity remain within limits;
- accountable Security, Quality, Domain, and Release Owners approve.

## Evidence

Test evidence records workflow version, implementation commit, environment, fixture version, identities, time, results, failures, approvals, and artifact references. Evidence must exclude secrets and unnecessary sensitive data.

## Continuous Testing

Run contract and component tests on every relevant change. Run integration, security, and end-to-end suites before activation and on material provider or architecture change. Scheduled synthetic checks monitor active critical paths without causing harmful effects.

## Failure and Recovery

A flaky or inconclusive blocking test is not a pass. Quarantine the test and affected release separately, identify ownership, and restore trustworthy coverage before activation. Failed production checks trigger containment according to impact.

## Acceptance Criteria

- Each registered workflow maps to required test evidence.
- Allowed, denied, failure, and recovery paths are covered.
- Idempotency and duplicate-delivery behavior are demonstrated.
- Tests do not expose secrets or create uncontrolled side effects.
- Evidence is versioned and reviewable.
- Release gates fail closed when required proof is missing.

## References

- [Automation Architecture](Automation_Architecture.md)
- [Workflow Design Standards](Workflow_Design_Standards.md)
- [Agent Handoff Standards](Agent_Handoff_Standards.md)
- [Integration Standards](Integration_Standards.md)
- [Documentation QA Standards](../02_Documentation_Engine/Documentation_QA_Standards.md)
- [AI Security Guidelines](../08_Security/AI_Security_Guidelines.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.5 automation testing framework |
