# Creator OS Foundry Documentation QA Standards

**Phase:** 1.3 — Documentation Engine Build  
**Version:** 1.0  
**Document owner:** Documentation Steward and Quality Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document defines the quality gates and evidence required before Creator OS Foundry documentation is approved, published, or treated as operationally reliable.

## Quality Dimensions

| Dimension | Required outcome |
| --- | --- |
| Accuracy | Claims match canonical sources and verified implementation |
| Authority | Owner, status, version, and approval scope are explicit |
| Completeness | Required decisions, controls, interfaces, and failure behavior are present |
| Consistency | Terminology, identifiers, states, and cross-document rules agree |
| Clarity | Intended readers can act without private context |
| Traceability | Sources, decisions, commits, and dependencies are identifiable |
| Security and privacy | Secrets and unnecessary sensitive data are absent |
| Maintainability | Structure, links, ownership, and review triggers support future change |
| Accessibility | Meaning does not depend solely on images, color, or unexplained jargon |

## Automated Checks

The validation pipeline should check:

- exactly one level-one heading;
- required header fields and allowed status values;
- ordered heading levels;
- valid internal relative links and anchors;
- duplicate stable identifiers;
- unresolved placeholders and template instructions;
- invalid or inconsistent terminology;
- likely secrets, credentials, tokens, private keys, and sensitive example data;
- malformed Markdown tables and fenced blocks;
- missing alt text for meaningful images;
- references to retired or missing canonical documents;
- stale review dates and inconsistent versions.

Automated checks report evidence; they do not approve meaning or authority.

## Human Review

### Content Review

The accountable owner verifies purpose, scope, accuracy, completeness, audience fit, and acceptance criteria.

### Domain Review

Architecture, Security, Data, Tool, Agent, Workflow, Application, or Release Owners review requirements within their decision rights.

### Editorial Review

The Documentation Steward verifies structure, plain language, terminology, links, status, version, and lifecycle handling.

### Independent Review

High-risk changes require a reviewer other than the author. Critical changes require the full approval path defined by governance.

## Severity Model

| Severity | Meaning | Publication rule |
| --- | --- | --- |
| Critical | Could cause unauthorized, destructive, legal, security, or public harm | Block |
| High | Materially wrong authority, control, data, or operating instruction | Block |
| Moderate | Ambiguous, incomplete, inconsistent, or materially hard to maintain | Resolve or explicitly accept |
| Low | Editorial or cosmetic defect without changed meaning | May defer with owner |
| Informational | Improvement opportunity | Track as appropriate |

## Review Procedure

1. Confirm the document type, owner, risk, status, version, audience, and acceptance criteria.
2. Compare the change with canonical dependencies and implementation evidence.
3. Run automated validation and record results.
4. Perform content, domain, editorial, and required independent reviews.
5. Classify findings and assign owners.
6. Correct blocking findings and rerun affected checks.
7. Record approval, conditions, accepted residual risk, and commit.
8. Verify the published document and refreshed indexes.

## Specialized Test Cases

Documentation governing execution must test normal, denied, failure, recovery, rollback, and escalation paths. Procedures should be exercised in a safe environment. Agent and workflow documentation must verify tool, data, approval, and stop boundaries. Database and security documentation must verify least privilege and negative-access cases.

## Drift QA

Compare documentation with implementations, registry status, policy versions, tool capabilities, workflow behavior, and test evidence. Drift detection must never auto-approve rewritten canonical content. A material mismatch blocks release when the documentation is required to operate or recover the affected change.

## Publication Gate

A document may be published at its target status only when:

- required automated checks pass;
- blocking findings are closed;
- accountable owners approve;
- acceptance evidence is retained;
- security and sensitive-data review is complete;
- dependent documents and indexes are updated;
- rollback or recovery is known for consequential instructions.

## Failure and Recovery

If a quality check fails after publication, classify impact, notify the owner, correct or deprecate the affected content, and identify downstream consumers. Critical misinformation requires immediate warning or withdrawal while the last safe version is restored.

## Metrics

Track first-pass acceptance, review time, reopened findings, broken-link rate, stale-document rate, drift time-to-resolution, incident-related documentation gaps, and percentage of active documents with current owners and review dates. Metrics guide improvement and must not incentivize superficial approvals.

## Acceptance Criteria

- Automated and human responsibilities are distinct.
- Severity and publication rules are explicit.
- High-risk work receives independent review.
- Negative, failure, and recovery paths are tested where relevant.
- Published defects have a containment and correction process.
- QA evidence is traceable to the reviewed commit.

## References

- [Documentation Standards](../00_Governance/Documentation_Standards.md)
- [Documentation Lifecycle Management](Documentation_Lifecycle_Management.md)
- [Documentation Templates](Documentation_Templates.md)
- [Knowledge Management](Knowledge_Management.md)
- [Master Operating Manual](../00_Governance/Creator_OS_Master_Operating_Manual.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.3 documentation QA standard |
