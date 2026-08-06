# Creator OS Foundry UI Standards

**Phase:** 1.6 — Application Layer Architecture  
**Version:** 1.0  
**Document owner:** Application Owner and Design Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines consistent, accessible, trustworthy user-interface standards for Creator OS Foundry applications.

## Experience Principles

- Lead with the user's current outcome and next safe action.
- Present authoritative status, owner, freshness, and environment.
- Use plain language and progressive disclosure.
- Keep consequential actions deliberate and reviewable.
- Make loading, empty, partial, denied, stale, failed, and recovered states explicit.
- Preserve keyboard, screen-reader, zoom, contrast, and reduced-motion access.
- Do not use color, animation, icons, or position as the only source of meaning.
- Minimize interruption and preserve user input during recoverable failures.
- Never use deceptive urgency, hidden costs, or ambiguous consent.

## Layout

Applications use a consistent shell with primary navigation, workspace and environment context, page title, status, main task area, and contextual actions. Dense operational information should use tables or structured lists with accessible responsive alternatives.

## Navigation

Routes must be stable, meaningful, and deep-linkable when access permits. Back and forward behavior must preserve user expectations. Unsaved changes require a clear warning. Breadcrumbs are used when hierarchy is not otherwise obvious.

## Components

Shared components must define semantics, accessible names, states, validation, keyboard behavior, responsive behavior, and test coverage. Prefer native elements when they meet the requirement. Custom controls must reproduce required accessibility behavior.

## Forms

- Every field has a persistent label and clear purpose.
- Required and optional status is explicit.
- Validation occurs without erasing user input.
- Errors identify the field, cause, and corrective action.
- Sensitive fields avoid unsafe defaults, autocomplete, logging, and display.
- Submission prevents accidental duplication and shows durable outcome status.
- Long operations transition to a trackable workflow or task.

## Tables and Data Views

Tables provide headers, sort state, filter state, pagination or virtualization, empty state, freshness, and accessible row actions. Filters must not conceal that results are partial. Exports disclose scope, classification, and side effects before creation.

## Feedback and Status

Use consistent patterns for success, warning, error, denial, waiting, and unknown outcomes. Toasts are supplementary and never the only record of a consequential result. Persistent status includes the affected object and recovery action.

## Confirmation

Confirmations are proportional to risk. High-impact actions identify the exact target, workspace, environment, external destination, data, cost, reversibility, and approval state. Confirmation wording states the action directly.

## Accessibility

Target WCAG 2.2 AA for supported application experiences. Critical workflows must be operable by keyboard, expose logical focus order, provide visible focus, announce dynamic status, support text resize, maintain contrast, and honor reduced motion. Accessibility findings participate in release gates.

## Responsive Design

Critical status and approvals remain visible at small widths. Touch targets are appropriately sized and spaced. Responsive layouts must not silently remove functionality; if a task is unsuitable for a device, explain the limitation and provide a safe alternative.

## Content and Terminology

Use canonical domain terms and sentence case. Buttons begin with a verb. Avoid unexplained acronyms, promotional wording, and blame-oriented errors. Dates, times, currency, numbers, and units include locale and timezone context where relevant.

## Privacy and Analytics

Collect only approved interaction telemetry. Do not record field values, documents, secrets, personal data, or sensitive URLs by default. Consent and notice follow applicable policy.

## Performance

Set measurable budgets for initial load, interaction latency, visual stability, and long-task feedback. Performance improvements must not weaken authorization, validation, accessibility, or data integrity.

## Acceptance Criteria

- Core components have accessible semantics and keyboard behavior.
- All system states and consequential outcomes are visible.
- Forms preserve input and prevent duplicate submission.
- Responsive layouts preserve critical context and controls.
- Terminology matches canonical sources.
- UI tests cover accessibility, error, denial, and recovery paths.

## References

- [Application Architecture](Application_Architecture.md)
- [Control Center Specification](Control_Center_Specification.md)
- [Module Architecture](Module_Architecture.md)
- [Application Security Model](Application_Security_Model.md)
- [Documentation Standards](../00_Governance/Documentation_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.6 UI standard |
