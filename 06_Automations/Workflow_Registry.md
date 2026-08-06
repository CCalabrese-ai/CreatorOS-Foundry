# Workflow Registry

**Phase:** 0.3 — Core Registries  
**Version:** 1.0  
**Registry owner:** Automation Owner  
**Status:** Baseline

## Purpose

This registry is the canonical inventory of repeatable Creator OS Foundry workflows. An entry describes an approved workflow contract; executable automation definitions and credentials live in controlled implementation files and services.

## Lifecycle

- **Proposed** — drafted for review.
- **Approved** — contract accepted for implementation.
- **Active** — implemented, tested, monitored, and enabled.
- **Paused** — temporarily disabled.
- **Deprecated** — supported only during migration.
- **Retired** — disabled and unavailable for new runs.

## Registry

| ID | Workflow | Trigger | Primary actor | Outcome | External side effects | Approval | Risk | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| WF-001 | Governance Change | Approved proposal | System Owner | Versioned policy or governance update | Repository write | Required | Moderate | Approved |
| WF-002 | Architecture Decision | Material design proposal | Architecture Owner | Reviewed architecture decision record | Repository write | Required | Moderate | Proposed |
| WF-003 | Documentation Lifecycle | New or changed system knowledge | Documentation Steward | Validated, linked, versioned documentation | Repository write | Conditional | Low | Proposed |
| WF-004 | AI Worker Onboarding | Approved role proposal | Agent Owner | Evaluated agent version with scoped permissions | Configuration changes | Required | High | Proposed |
| WF-005 | Tool Onboarding | Integration request | Security and Domain Owners | Registered, assessed, and scoped tool | Credential and configuration changes | Required | High | Proposed |
| WF-006 | Content Production | Approved content brief | Content Strategist | Draft content and supporting artifacts | Optional media generation | Before publication | Moderate | Proposed |
| WF-007 | Media Production | Approved asset request | Media Producer | Generated and reviewed media artifact | Provider spend and stored media | Before paid run or publication | High | Proposed |
| WF-008 | Analytics Reporting | Schedule or operator request | Analytics Analyst | Source-backed KPI report | Data queries | Conditional for sensitive data | Moderate | Proposed |
| WF-009 | Release Readiness | Release candidate | Security and Quality Reviewer | Test evidence and go/no-go recommendation | None | Owner release approval | Moderate | Proposed |
| WF-010 | Incident Response | Alert or reported incident | Security Owner | Containment, evidence, recovery, and review | May disable services or credentials | Emergency policy | High | Proposed |

## Required Workflow Contract

Before activation, each workflow must define:

- owner, purpose, scope, and version;
- authorized triggers and initiating identities;
- required inputs, validation, and data classifications;
- ordered steps, assigned actors, and tool permissions;
- approval gates and escalation paths;
- outputs, artifacts, events, and notification rules;
- timeouts, retries, idempotency keys, and concurrency behavior;
- failure states, compensation, recovery, and manual intervention;
- observability, cost controls, tests, and acceptance criteria;
- pause, rollback, migration, and retirement procedures.

## Execution Rules

Every run receives a unique identifier and records its workflow version. High-risk steps must fail closed when approval or authorization is missing. Retries may not duplicate public, financial, destructive, or customer-facing effects. A workflow cannot grant itself additional permissions.
