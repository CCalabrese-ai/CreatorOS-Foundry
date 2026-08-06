# Creator OS Foundry Documentation Lifecycle Management

**Phase:** 1.3 — Documentation Engine Build  
**Version:** 1.0  
**Document owner:** Documentation Steward  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines how Creator OS Foundry documentation moves from request to retirement while preserving authority, accuracy, traceability, and recoverability.

## Lifecycle States

| State | Meaning | May govern work |
| --- | --- | --- |
| Draft | Incomplete authoring work | No |
| Proposed | Complete enough for formal review | No |
| Baseline | Accepted reference foundation | Yes |
| Approved | Formally authorized specification or decision | Yes |
| Active | Currently operated and maintained | Yes |
| Deprecated | Valid only during a documented transition | Limited |
| Retired | Historical and non-governing | No |

State changes require the accountable owner and any risk-based reviewers defined by governance.

## Intake Requirements

Every documentation request must identify:

- desired outcome and reason for change;
- accountable owner;
- affected paths, identifiers, and audiences;
- canonical sources and implementation evidence;
- security, privacy, data, cost, and external dependencies;
- target status and version impact;
- acceptance criteria and required reviewers.

Requests lacking authority or source evidence remain Draft.

## Standard Lifecycle

### 1. Discover

Inspect the current canonical document, repository history, linked decisions, registries, implementation, and known consumers. Record conflicts and missing sources.

### 2. Classify

Determine document type, authority level, data classification, risk, owner, reviewers, target audience, status, and semantic version impact.

### 3. Draft

Use the approved template and terminology. Separate verified fact, governing requirement, proposal, example, and unresolved question. Change the smallest coherent set of files.

### 4. Validate

Run structural, metadata, link, terminology, reference, security, duplication, and consistency checks. High-risk documents also receive domain-specific validation.

### 5. Review

The owner reviews purpose, accuracy, scope, and acceptance criteria. Governance, Architecture, Security, Data, or Release Owners review changes within their authority. Authors must not be sole approvers of high-risk changes.

### 6. Approve

Record the decision, status, version, approvers, effective date when relevant, and unresolved conditions. Approval applies only to the reviewed content and commit.

### 7. Publish

Commit the approved Markdown through the authorized repository workflow. Update indexes, cross-links, release notes, and dependent references in the same coherent change when practical.

### 8. Operate

Monitor usage, feedback, validation results, implementation drift, source changes, and scheduled review dates. Open follow-up work when the canonical state no longer matches reality.

### 9. Deprecate and Retire

Identify the replacement, transition period, effective date, inbound links, downstream consumers, retention need, and archive location. Retired documents must clearly state that they no longer govern work.

## Versioning Rules

- Major versions change authority, scope, meaning, or operating contract.
- Minor versions add backward-compatible requirements or material clarification.
- Patch versions correct errors without changing intent.
- Status changes and versions must not be inferred solely from a commit message.
- Repository history is the detailed audit trail; the document header states the operating version.

## Review Cadence

| Document type | Minimum trigger |
| --- | --- |
| Governance and security | Scheduled review and every material policy change |
| Architecture and data | Every material implementation or boundary change |
| Registries | Every lifecycle, owner, risk, or permission change |
| Runbooks and procedures | After incidents, tooling changes, and scheduled exercises |
| Reference guidance | When upstream sources change or validation detects drift |

## Change Control

Routine spelling and formatting fixes may use delegated review when meaning is unchanged. Changes to policy, permissions, architecture, data handling, risk, public commitments, destructive procedures, or production operations require the relevant accountable owners.

## Failure and Recovery

If review rejects a change, sources conflict, validation fails, or publication is incomplete, the document remains at its last approved version. Preserve the draft and findings, correct the issue, and restart at the appropriate lifecycle step. Do not relabel failed work as approved.

## Acceptance Criteria

- Every canonical document has an owner, status, version, and purpose.
- Lifecycle transitions are authorized and traceable.
- Reviews match risk and subject ownership.
- Deprecation updates inbound references and names a replacement.
- Published content can be recovered from repository history.
- Drift and scheduled-review obligations are visible.

## References

- [Documentation Standards](../00_Governance/Documentation_Standards.md)
- [Documentation Engine Architecture](Documentation_Engine_Architecture.md)
- [Documentation QA Standards](Documentation_QA_Standards.md)
- [Master Operating Manual](../00_Governance/Creator_OS_Master_Operating_Manual.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.3 lifecycle management standard |
