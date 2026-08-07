# Creator OS Foundry MVP Launch Readiness Criteria

**Phase:** 3.4 — MVP Environment Initialization  
**Version:** 1.0  
**Document owner:** Release Owner and Project Operations Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the evidence and accountable approvals required to launch the Creator OS Foundry MVP into a controlled pilot.

## Launch Decision

Launch is a risk decision based on verified evidence, not a percentage-complete report. All P0 capabilities and mandatory P1 operational safeguards must pass. A failed mandatory security, data-isolation, recovery, accessibility, or rollback criterion blocks launch and cannot be waived by feature priority alone.

## Readiness Gates

| Gate | Required evidence | Accountable approver |
| --- | --- | --- |
| Scope and product | Approved primary outcome, P0/P1 set, exclusions, known limitations | Product Owner |
| Architecture | Implemented boundaries match decisions and contracts | Architecture Owner |
| Repository and build | Reproducible clean build, immutable artifact, manifest | Application and Release Owners |
| Identity and authorization | Session, revocation, workspace, resource, command, and denial tests | Security Owner |
| Data and Supabase | Migration, seed, grants, RLS, type, backup, and recovery evidence | Data Owner |
| Workflow | COS-WF-001 happy, duplicate, review, failure, and reconciliation paths | Automation Owner |
| AI Workforce | Registered agent version, permissions, handoffs, evaluation, suspension | AI Workforce Owner |
| Documentation | Canonical source, metadata, validation, GitHub commit, and sync evidence | Documentation Steward |
| Quality | Required automated portfolio and defect disposition | Quality Owner |
| Accessibility and UX | Keyboard, screen reader, contrast, responsive, and error recovery | Design and Quality Owners |
| Security and privacy | Threat review, secret scan, dependency review, content safety, audit | Security Owner |
| Operations | Health, telemetry, alerts, runbooks, incident, support, cost, and ownership | Operations Owner |
| Release and rollback | Staging rehearsal, migration order, rollback, communications | Release Owner |

## Mandatory Functional Evidence

An authorized user must sign in, select an allowed workspace, view truthful overview state, find a canonical document, submit one valid COS-WF-001 request, receive a durable receipt, follow the run, complete an exact-candidate review, and verify GitHub commit and synchronization evidence.

The same acceptance suite must demonstrate duplicate submission, denied workspace access, stale candidate, expired approval, dependency outage, realtime gap, failed publication, degraded synchronization, and outcome-unknown recovery.

## Security and Data Criteria

- No privileged key or secret exists in source, browser artifacts, URLs, analytics, logs, or test evidence.
- Authentication is validated server-side and sensitive session responses are not shared through caches.
- Queries, counts, search, commands, and realtime preserve workspace and resource authorization.
- Exposed tables use explicit approved grants and tested row-level security.
- User-controlled metadata cannot grant authorization.
- Cross-workspace and enumeration tests fail closed.
- Generated or repository content is sanitized and external destinations are constrained.
- High and critical findings are resolved or formally contained under approved policy.

## Reliability and Recovery Criteria

Dependency timeouts, partial failure, event gaps, stale data, and unknown outcomes remain truthful. Reconciliation does not duplicate external effects. Backup and recovery dependencies are verified. Rollback restores the prior compatible artifact within the approved recovery objective, or a tested forward-fix path exists for irreversible migrations.

## Performance and Accessibility Criteria

Approved budgets cover initial authenticated load, core route transitions, API latency, command acceptance, bundle size, and essential browser support. Critical flows meet WCAG 2.2 AA targets, work by keyboard and screen reader, preserve focus, announce status, support reduced motion, and remain usable at approved responsive sizes.

## Operational Readiness

Named owners and escalation paths exist for application, database, Auth, workflow, agent runtime, GitHub integration, security, release, and support. Dashboards disclose coverage and freshness. Alerts are actionable. Incident, rollback, credential rotation, dependency outage, and data-recovery runbooks are rehearsed.

## Launch Conditions

The pilot uses an allowlisted user group, explicit workspace scope, approved environment, feature flags with rollback defaults, increased monitoring, support coverage, and a defined observation window. Production data and permissions remain limited to the pilot purpose.

## No-Go Conditions

Launch stops for any of the following:

- unresolved critical or high-impact security exposure;
- failed cross-workspace, RLS, session, or authorization test;
- unverified migration, backup, recovery, or rollback;
- duplicate external side effect under replay;
- false-success or false-healthy state;
- missing audit evidence for consequential commands;
- broken primary keyboard or screen-reader flow;
- secrets in artifacts or logs;
- unknown release provenance or unapproved configuration drift;
- missing accountable incident owner.

## Decision Record

The launch record identifies release and artifact digest, source SHA, migration range, configuration-schema version, test evidence, open risks and owners, approved limitations, pilot scope, monitoring window, rollback target, approver decisions, decision time, and next review. It contains no protected values.

## Post-Launch Validation

Immediately verify sign-in, workspace isolation, overview freshness, COS-WF-001 receipt, run progression, GitHub publication evidence, synchronization, health, alerts, logs, and audit. If a no-go condition appears, contain or roll back through the incident process.

## Acceptance Criteria

- Every readiness gate has current evidence and named approval.
- The primary flow and required denial and recovery cases pass in staging.
- No no-go condition remains open.
- The release, configuration, migration, and artifact identities reconcile.
- Pilot users, workspace, monitoring, support, rollback, and review window are explicit.
- Post-launch checks and stop authority are assigned.

## References

- [MVP Feature Prioritization](MVP_Feature_Prioritization.md)
- [MVP Build Execution Plan](MVP_Build_Execution_Plan.md)
- [MVP Build Checklist](MVP_Build_Checklist.md)
- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [Release Management](../09_Tests/Release_Management.md)
- [Incident Response](../09_Tests/Incident_Response.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.4 MVP launch readiness criteria |
