# Creator OS Foundry MVP Repository Development Workflow

**Phase:** 3.1 — MVP Development Environment  
**Version:** 1.0  
**Document owner:** Development Owner and Release Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the repository workflow for implementing the MVP safely, reviewing changes, preserving migrations and contracts, and producing traceable releases.

## Branch and Change Model

Work begins from the current approved main branch. Each change uses a short-lived branch with one bounded objective. Direct production changes and unrelated refactoring are prohibited. Protected-branch rules, required review, and checks follow change risk.

## Before Coding

1. Confirm the issue or approved outcome, owner, scope, exclusions, and acceptance criteria.
2. Pull the current branch state and review affected architecture, contracts, tests, and documentation.
3. Identify security, data, migration, accessibility, API, and release impacts.
4. Decide the smallest coherent implementation and test set.
5. Confirm the pinned development environment and a clean working tree or known user changes.

## Change Categories

| Category | Required evidence |
| --- | --- |
| UI-only | Component, accessibility, responsive, and affected flow tests |
| API or contract | Schema compatibility, auth, negative, idempotency, and consumer tests |
| Database | Migration, RLS, fresh reset, upgrade, generated types, and recovery evidence |
| Workflow or agent | State, permission, approval, failure, replay, and audit tests |
| Dependency | Provenance, license, vulnerability, release notes, lockfile, and rollback review |
| Configuration | Environment matrix, secret safety, validation, and deployment evidence |
| Documentation | Structure, link, terminology, authority, and sensitive-data review |

## Commit Discipline

Commits are intentional, reviewable, and descriptive. Generated types accompany the schema version that produced them. Lockfile changes accompany an explained dependency change. Formatting-only changes do not conceal functional edits. Secrets, local environment files, test reports with sensitive data, and ungoverned generated artifacts are excluded.

## Pull Request Contract

A change request states purpose, scope, user impact, architecture and data impact, security and privacy impact, tests, screenshots or accessibility evidence when relevant, migration and rollback, known limitations, and linked documentation.

Reviewers verify both allowed and denied behavior. High-risk changes require independent domain review.

## Required Checks

Fast checks include formatting, lint, type validation, unit tests, contract tests, secret scan, and production build. Risk-triggered checks add database reset and RLS, integration, end-to-end, accessibility, security, dependency, migration, performance, and resilience suites.

A flaky required check is not a pass.

## Database Workflow

Persistent database changes use CLI-created migration files and committed seed or reference definitions. Apply to a clean local stack, test representative upgrade, run RLS and advisor checks, regenerate types, and review the diff. Shared migrations remain immutable.

## Contract Evolution

API, event, database, workflow, and component contracts prefer additive compatible changes. Breaking changes require a version, consumer inventory, migration plan, dual-support window where needed, and removal decision.

## Review and Merge

Authors self-review the final diff and evidence. Reviewers address correctness, architecture, security, data, accessibility, failure, operations, documentation, and rollback. Only approved changes with passing checks merge. The merged commit is the traceable release input.

## After Merge

Verify main checks, preview or staging deployment, migration status, application health, and telemetry. Close or update the owning work item. Record follow-up risk and remove expired flags or temporary diagnostics on schedule.

## Emergency Changes

Emergency containment may use an expedited path authorized by the incident process. Scope remains minimal, evidence is preserved, and post-incident review restores normal tests, documentation, and approvals.

## Acceptance Criteria

- Every change maps to one approved outcome.
- Branches and commits remain small and reviewable.
- Checks match the risk and affected contracts.
- Database and generated types stay synchronized.
- Secrets and local artifacts do not enter the repository.
- Merge and deployment evidence is traceable.

## References

- [Development Standards](../09_Tests/Development_Standards.md)
- [Testing Strategy](../09_Tests/Testing_Strategy.md)
- [Release Management](../09_Tests/Release_Management.md)
- [Migration Standards](../05_Database/Migration_Standards.md)
- [MVP Build Checklist](MVP_Build_Checklist.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.1 repository development workflow |
