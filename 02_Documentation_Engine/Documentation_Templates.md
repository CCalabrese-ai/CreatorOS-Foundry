# Creator OS Foundry Documentation Templates

**Phase:** 1.3 — Documentation Engine Build  
**Version:** 1.0  
**Document owner:** Documentation Steward  
**Status:** Proposed  
**Risk class:** Low

## Purpose

This document defines reusable Markdown templates for canonical Creator OS Foundry documentation. Templates provide a reliable starting structure; authors must remove irrelevant sections and complete all required fields.

## General Template Rules

- Use one level-one title.
- Include Phase, Version, Document owner, and Status.
- Use only allowed status values.
- Add risk class, effective date, review date, or stable identifier when useful.
- Replace every placeholder before review.
- Remove guidance comments and unused sections.
- Use relative links for repository references.
- Do not include secrets, unnecessary personal information, or unverified claims.
- Examples must be sanitized and clearly labeled.

## Canonical Specification Template

    # [Document Title]

    **Phase:** [Phase]
    **Version:** [Semantic version]
    **Document owner:** [Accountable role]
    **Status:** [Allowed status]
    **Risk class:** [Low, Moderate, High, or Critical]

    ## Purpose

    [What this document governs and why it exists.]

    ## Scope

    [Included and excluded subjects.]

    ## Definitions

    [Only terms needed to interpret requirements.]

    ## Requirements

    [Testable statements using must, should, and may.]

    ## Roles and Responsibilities

    [Named accountable roles.]

    ## Operating Model

    [Ordered process or lifecycle.]

    ## Interfaces and Dependencies

    [Canonical sources, systems, and consumers.]

    ## Controls and Approval Boundaries

    [Permissions, reviews, and prohibited actions.]

    ## Failure and Recovery

    [Safe failure state and restoration path.]

    ## Acceptance Criteria

    [Evidence required for approval or operation.]

    ## References

    [Relative canonical links and authoritative external sources.]

    ## Change History

    | Version | Change |
    | --- | --- |
    | 1.0 | Initial version |

## Registry Entry Template

| Field | Required content |
| --- | --- |
| Stable ID | Permanent domain-prefixed identifier |
| Name | Clear human-readable name |
| Purpose | One bounded responsibility |
| Owner | Accountable role |
| Status | Controlled lifecycle state |
| Version | Current approved semantic version |
| Risk | Explicit risk class |
| Permissions | Least-privileged capability scope |
| Data classes | Permitted classifications |
| Dependencies | Stable identifiers or canonical links |
| Activation requirements | Reviews, tests, configuration, and approvals |
| Retirement plan | Disablement, migration, retention, and archive steps |

## Decision Record Template

    # [Decision ID] [Decision Title]

    **Status:** [Proposed, Approved, Deprecated, or Retired]
    **Decision owner:** [Role]
    **Date:** [YYYY-MM-DD]

    ## Context
    [Problem, constraints, and evidence.]

    ## Decision
    [Chosen outcome stated directly.]

    ## Options Considered
    [Viable alternatives and tradeoffs.]

    ## Consequences
    [Benefits, costs, risks, and follow-up.]

    ## Approval
    [Approvers and conditions.]

    ## References
    [Canonical links.]

## Runbook Template

A runbook must state trigger, owner, prerequisites, permissions, inputs, ordered steps, verification, rollback or recovery, escalation, audit evidence, and last exercise date. Destructive or public actions require explicit approval points before execution.

## Review Checklist Template

- Header fields are complete and valid.
- Purpose, scope, owner, audience, and authority are clear.
- Terminology matches canonical sources.
- Requirements are testable.
- Links and stable identifiers resolve.
- Security, privacy, data, cost, and external effects are addressed.
- Secrets and unnecessary sensitive data are absent.
- Status and version changes are justified.
- Superseded content and downstream references are handled.
- Acceptance evidence is recorded.

## Template Governance

The Documentation Steward owns templates. Domain owners approve specialized additions in their areas. A template change must not silently change policy or lower review requirements. Template versions should be cited when automated generation depends on exact structure.

## Acceptance Criteria

- Templates satisfy required documentation headers.
- Placeholders cannot be mistaken for approved content.
- Common document types have a usable starting structure.
- Review and risk requirements remain explicit.
- Generated documents remain understandable without private context.

## References

- [Documentation Standards](../00_Governance/Documentation_Standards.md)
- [Documentation Lifecycle Management](Documentation_Lifecycle_Management.md)
- [Documentation QA Standards](Documentation_QA_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.3 template library |
