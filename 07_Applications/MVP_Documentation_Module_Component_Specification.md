# Creator OS Foundry MVP Documentation Module Component Specification

**Phase:** 3.2 — MVP Application Component Specifications  
**Version:** 1.0  
**Document owner:** Documentation Steward and Application Owner  
**Status:** Proposed  
**Risk class:** Moderate

## Purpose

This document specifies the MVP components used to discover, inspect, request, review, and verify governed Creator OS Foundry documentation.

## Scope

The module covers document list and detail views, filters, metadata and source evidence, the COS-WF-001 request form, validation findings, candidate review, and canonical publication confirmation. Direct file editing and unrestricted repository browsing are out of scope.

## Component Inventory

| Component | Responsibility | Key data | Primary action |
| --- | --- | --- | --- |
| Document List | Display authorized canonical records | Key, title, status, owner, version, classification, freshness | Open detail |
| Document Filters | Narrow visible records | Status, owner, domain, risk, review state | Apply or clear |
| Document Detail | Present metadata and publication evidence | Source path, SHA, hash, relationships, reviews | Open source |
| Creation Request Form | Capture the COS-WF-001 intake contract | Purpose, owner, domain, path, sources, criteria | Validate request |
| Request Review | Show bounded consequences before submission | Workspace, path, risk, approvals, side effects | Confirm or revise |
| Validation Findings | Explain machine and human checks | Severity, rule, evidence, owner, disposition | Navigate or resolve |
| Candidate Review | Bind a decision to an exact candidate | Candidate hash, diff, sources, findings | Approve, revise, reject, abstain |
| Publication Receipt | Verify durable canonical outcome | Commit SHA, content hash, sync state | Open canonical source |

## Data Contracts

Document summaries must include stable document ID and key, workspace, title, owner, status, semantic version, classification, risk class, source path, current commit SHA, content hash, review date, and freshness. Detail responses may include sanitized content only when the user is authorized. Lists and counts must exclude inaccessible records server-side.

## Creation Workflow

The form collects the complete COS-WF-001 intake contract and performs usability validation before submission. The server revalidates schema, ownership, target path, classification, authorization, duplication, and approval requirements. Submission uses an idempotency key and returns the existing receipt when replayed.

## Review and Version Binding

A review decision must name the candidate version and content hash, reviewer capability, rationale, decision time, and expiry. If content changes, the prior review becomes stale and the component requires a new decision. The interface must separate automated findings from accountable human approval.

## States

List and detail components support loading, ready, empty, partial, stale, denied, unavailable, and error. Creation supports draft, invalid, ready, confirming, submitted, duplicate, and failed. Publication supports pending, committed, synchronizing, succeeded, degraded, quarantined, failed, and outcome unknown.

## Security and Privacy

Render document content and diffs as untrusted. Sanitize Markdown, constrain external links, and never inject generated HTML. Classification controls content visibility, source links, search fields, and analytics. Secret-like values detected in requests or candidates block publication and enter the documented security process.

## Accessibility and Responsive Behavior

Forms associate instructions and errors with fields, preserve user input after recoverable errors, and move focus to actionable findings. Tables have accessible alternatives on small screens. Diffs, statuses, and severity use text in addition to color.

## Failure and Recovery

GitHub, database, validation, agent, or synchronization failure must remain visible by dependency and last durable state. An unknown publication outcome permits reconciliation but not blind retry. Users receive a correlation ID, accountable owner, and safe next action.

## Testing Requirements

Test authorized and denied lists, cross-workspace identifiers, filters, pagination, stale versions, duplicate requests, malicious Markdown, oversized inputs, findings, changed candidates, approval expiry, GitHub failure, synchronization degradation, keyboard navigation, and screen-reader announcements.

## Acceptance Criteria

- Authorized users can find and inspect canonical document evidence.
- One valid intake produces one COS-WF-001 receipt.
- Review decisions bind the exact candidate version.
- Publication success links to a verified path and commit SHA.
- Failure and degraded synchronization are truthful and recoverable.
- Content rendering and search preserve classification and workspace boundaries.

## References

- [MVP Application Specification](MVP_Application_Specification.md)
- [MVP First User Flows](MVP_First_User_Flows.md)
- [Documentation Engine Architecture](../02_Documentation_Engine/Documentation_Engine_Architecture.md)
- [Document Workflows](../02_Documentation_Engine/Documentation_Engine_Document_Workflows.md)
- [COS-WF-001](../06_Automations/COS-WF-001_Document_Creation_Workflow.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.2 Documentation module component specification |
