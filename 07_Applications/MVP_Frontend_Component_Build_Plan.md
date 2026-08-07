# Creator OS Foundry MVP Frontend Component Build Plan

**Phase:** 4.1 — MVP Application Skeleton  
**Version:** 1.0  
**Document owner:** Frontend Owner, Design Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This plan defines the order and evidence for constructing the first frontend components of the Control Center MVP.

## Build Strategy

Build semantic and accessible primitives first, assemble the workspace-safe shell second, implement read-only module views third, and add the document-creation command only after typed server contracts and authorization are proven.

## Component Layers

| Layer | Initial components | Exit evidence |
| --- | --- | --- |
| Tokens | Color, type, spacing, motion, elevation, status | Contrast and reduced-motion review |
| Primitives | Button, link, input, select, textarea, checkbox, alert, badge | Keyboard and screen-reader component tests |
| Structures | Page header, stack, grid, panel, table, detail list, timeline | Responsive and reflow tests |
| Feedback | Skeleton, empty, partial, stale, denied, unavailable, error | State semantics verified |
| Commands | Confirmation dialog, submit state, durable receipt, recovery panel | Duplicate and unknown-outcome tests |
| Shell | Navigation, identity, workspace switcher, environment, notifications | Scope-isolation acceptance |
| Modules | Overview, Documentation, Automation, AI Workforce, System Health | Authorized view-model contracts pass |

## Construction Sequence

1. Implement design tokens and semantic status language.
2. Build interactive primitives with focus, labels, error association, disabled and pending behavior.
3. Build safe layout and data-display structures with small-screen alternatives.
4. Implement global loading, empty, partial, stale, denied, unavailable, and error components.
5. Implement the shell with server-returned navigation capabilities.
6. Add workspace switching that aborts requests, clears caches and drafts, and closes subscriptions.
7. Add typed query and command clients with workspace-aware keys and safe error mapping.
8. Implement Overview using authorized synthetic view models.
9. Implement Documentation list and detail, including canonical path, version, SHA, hash, owner, status, classification, and freshness.
10. Implement COS-WF-001 intake, validation summary, consequence confirmation, receipt, and run navigation.
11. Implement run, review, publication evidence, and recovery components.
12. Add Automation, AI Workforce, and System Health investigative views required by the first feature.
13. Complete content-safety, accessibility, responsive, performance, and browser tests.

## State Requirements

Every asynchronous component supports loading, ready, empty, partial, stale, denied, unavailable, and unexpected-error states as applicable. Commands additionally support draft, invalid, confirming, submitting, accepted, duplicate, waiting, succeeded, failed, quarantined, degraded, and outcome unknown.

An empty panel must never represent a failed source.

## Data Boundaries

Components receive versioned display-safe view models. They do not infer authorization from role names or decode policy from client claims. Cache keys include identity or session scope, workspace, environment, resource, filters, cursor, and contract version. Realtime events prompt authoritative refresh.

## Accessibility

All primary flows work by keyboard and screen reader. Focus moves predictably after navigation, validation, dialogs, workspace changes, and results. Dynamic status uses appropriate announcements without repeated noise. Tables have labeled record alternatives on small screens. Meaning never relies on color, position, motion, or icon alone.

## Content and Security

Markdown and agent output use an allowlisted renderer with raw HTML disabled by default. External links and images are constrained. Server-only configuration, hidden prompts, protected audit details, and inaccessible counts cannot reach component props.

## Testing

Vitest and Testing Library cover behavior, states, keyboard use, accessible names, validation, and safe output. Playwright covers secure entry, workspace switching, primary document flow, denial, stale candidate, dependency outage, realtime gaps, responsive layouts, and accessibility.

## Delivery Units

Each component change includes the component, typed contract or props, all supported states, tests, usage example, accessibility notes, telemetry, and affected documentation. Shared extraction requires demonstrated consumers.

## Acceptance Criteria

- Foundation components meet the established UI and accessibility standards.
- The shell preserves identity, workspace, environment, status, and recovery context.
- Workspace switching cannot retain or display prior scoped state.
- Documentation and first-feature components consume only authorized view models.
- Commands follow durable receipts and do not use optimistic completion.
- Critical component and end-to-end suites pass across supported viewports and browsers.

## References

- [MVP Frontend Implementation Plan](MVP_Frontend_Implementation_Plan.md)
- [MVP Control Center Component Specification](MVP_Control_Center_Component_Specification.md)
- [MVP Documentation Module Component Specification](MVP_Documentation_Module_Component_Specification.md)
- [MVP First User Flows](MVP_First_User_Flows.md)
- [UI Standards](UI_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 4.1 frontend component build plan |
