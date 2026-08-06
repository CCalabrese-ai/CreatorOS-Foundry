# AI Workforce Registry

**Phase:** 0.3 — Core Registries  
**Version:** 1.0  
**Registry owner:** Agent Owner  
**Status:** Baseline

## Purpose

This registry is the canonical inventory of AI worker roles approved or proposed for Creator OS Foundry. An entry describes a role, not a model instance. Runtime credentials, secrets, and private instructions must not be stored here.

## Status Values

- **Proposed** — defined for review; may not execute production work.
- **Approved** — role and boundaries are approved for implementation.
- **Active** — implemented, evaluated, and available in an approved environment.
- **Paused** — temporarily unavailable while preserving its definition.
- **Retired** — no longer available for new work.

## Risk Levels

- **Low** — read-only or draft-only work.
- **Moderate** — internal writes or bounded automation.
- **High** — public, destructive, privileged, financial, or sensitive-data actions.

## Registry

| ID | AI worker | Mission | Primary outputs | Allowed capability classes | Approval boundary | Risk | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AWR-001 | Orchestrator | Translate approved goals into coordinated tasks and handoffs | Plans, assignments, status summaries | Knowledge retrieval, task coordination | Human approval before expanding scope or external side effects | Moderate | Proposed |
| AWR-002 | Documentation Steward | Create and maintain canonical system knowledge | Markdown documents, indexes, change proposals | Repository read/write, documentation validation | Owner review for governance or architecture baselines | Moderate | Approved |
| AWR-003 | Research Analyst | Gather source-backed external and internal evidence | Research briefs, source maps, recommendations | Read-only search and approved knowledge sources | Human review before decisions or publication | Low | Proposed |
| AWR-004 | Content Strategist | Plan and draft brand-aligned content | Briefs, calendars, copy drafts | Knowledge retrieval, drafting tools | Human approval before publication | Moderate | Proposed |
| AWR-005 | Media Producer | Generate image, video, and audio assets | Media drafts, prompts, production metadata | Approved media-generation tools | Human approval before paid generation or publication | Moderate | Proposed |
| AWR-006 | Analytics Analyst | Analyze product, audience, and business performance | KPI reports, diagnostics, forecasts | Approved analytics and data-query tools | Human review for material business decisions | Moderate | Proposed |
| AWR-007 | Revenue Operator | Support offers, funnels, launches, and monetization workflows | Offer plans, launch checklists, revenue insights | CRM, commerce, analytics, and documentation tools | Explicit approval for customer contact or financial actions | High | Proposed |
| AWR-008 | Security and Quality Reviewer | Evaluate controls, risks, tests, and release readiness | Findings, test reports, release recommendations | Read-only inspection and approved test tools | Cannot approve its own implementation changes | Moderate | Proposed |

## Required Definition for Activation

Before an AI worker becomes Active, its implementation must define:

- accountable owner and business purpose;
- system instructions and prohibited behavior;
- allowed tools, data classes, and environments;
- required approvals and escalation rules;
- input and output contracts;
- memory and retention behavior;
- evaluations, acceptance thresholds, and monitoring;
- version, change history, pause procedure, and retirement procedure.

## Registry Rules

Agent permissions are deny-by-default. A role may use only tools separately approved in the Tool Registry. Any autonomy expansion, new sensitive data access, or new external side effect requires Agent Owner and Security Owner approval.
