# COS-MVP-002 Phase 6.5 Release Decision Review

**Phase:** 6.5 — Release Decision Review
**Version:** 1.0
**Document owner:** Release Owner and Quality Owner
**Status:** Decision Support Only — No Decision Recorded
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This document consolidates the evidence produced across Phases 6.1–6.4 into a single review artifact for the Release Owner and Quality Owner. **It is a decision-support summary, not a decision, and not an authorization to release.** It presents the current evidence, separates what is closed from what remains open, and lays out three decision options with their implications — it does not select one. No tag, release record, or release-status change is created or implied by this document.

## Completed Validation Gates

| Gate | Result | Evidence |
| --- | --- | --- |
| Migrations applied to live production database | Pass — all 10 migrations confirmed present via live `list_migrations`, including the one applied this phase | Phase 6.4, Section 1 |
| Lifecycle transition success paths | Pass — governed transitions succeed with correct role, evidence, and provenance | Phase 6.4, Tests A, E |
| Prohibited transitions denied | Pass — transitions outside the defined state graph are rejected by the live database | Phase 6.4, Test B |
| Missing evidence denied | Pass — publication without workflow/approval evidence is rejected | Phase 6.4, Test C |
| Incorrect/fabricated evidence denied | Pass — publication with non-existent or mismatched evidence is rejected | Phase 6.4, Test D |
| Authorization boundaries (actor identity) | Pass — actor/session identity mismatch is rejected | Phase 6.4, Test F |
| Authorization boundaries (workspace role) | Pass — an active member without owner/administrator role is rejected | Phase 6.4, Test G |
| RLS read-visibility (tiered) | Pass — active member sees records, non-member sees none, anonymous is denied at the grant level | Phase 6.4, Test H |
| Direct-mutation bypass denied | Pass — even the workspace owner is denied a direct `UPDATE` on `documents`; must use the governed function | Phase 6.4, Test I |
| Provenance enforcement | Pass — a fabricated provenance reference is rejected | Phase 6.4, Test J |
| Automated test suite | Pass — 78/78, re-confirmed same day as the live database changes | Phase 6.4 |
| Post-validation data integrity | Pass — zero leaked test fixtures, both touched documents confirmed at original status after rollback | Phase 6.4 |
| Security advisor scan (post-migration) | Pass, no new findings — no advisories against `documents`, `document_workflow_evidence`, `document_approval_evidence`, or `document_lifecycle_events` | Phase 6.4 |
| Keyboard navigation and focus order | Pass — confirmed via live, trusted keyboard events against the authenticated app | Phase 6.4, Section 2 |
| Detail-close focus restoration | Pass — confirmed live for the first time this phase (previously only static-asserted) | Phase 6.4, Section 2 |
| Escape-key behavior | Pass — confirmed live | Phase 6.4, Section 2 |

## Resolved Blockers

| ID | Original finding | Resolution |
| --- | --- | --- |
| **P62-001** | High-severity: a workspace Owner could move a document directly from Proposed to Published with no review, approval, version binding, or evidence — the release-critical finding across Phases 6.2 and 6.3. | **Resolved and confirmed live** in Phase 6.4. The governed transition function enforces the full state graph, evidence, and authorization requirements, and the direct-mutation bypass this finding described is confirmed denied against the live production database, including for the owner role specifically. |
| **P62-002** | Moderate: closing the Documentation detail view did not restore focus to the originating record. | **Resolved and confirmed live** in Phase 6.4. Focus restoration was previously only static-asserted in Phase 6.3; Phase 6.4 confirmed it live via a real, trusted `Escape` keydown and `document.activeElement` inspection. |

These are the only two findings from the Phase 6.2 register that have reached both "remediated" and "confirmed by executed evidence." No other finding in this capability's history has reached that bar yet.

## Remaining Open Items

| ID | Finding | Status | Severity character |
| --- | --- | --- | --- |
| **P62-003** (partial) | Full authenticated accessibility validation was requested: keyboard navigation, screen-reader semantics, zoom/reflow, narrow viewport. | Keyboard navigation, focus order, and Escape-close now have live evidence (see Resolved Blockers, P62-002). **Screen-reader spoken-output validation has never been executed in any phase** — no assistive-technology driver has been available. **Keyboard activation (Enter/Space) on document rows could not be conclusively re-verified** in Phase 6.4 — traced to a malformed key identifier in the browser-automation tool itself (confirmed via a `keydown` probe), not an application defect, but not independently re-confirmed by another method either. | Accessibility/process — not a data-integrity or authorization concern |
| **P62-004** | Local Node runtime (`20.17.0`) is below both `.nvmrc`'s pin (`24`) and Vite 7's stated minimum (`20.19+`/`22.12+`). | Documented with a concrete fix path (`brew install node@24`) in Phase 6.4; not executed. Historically classified as a build-reproducibility risk, not a release-blocking finding. | Build tooling — not a data-integrity or authorization concern |
| **P64-001** (new, found in Phase 6.4) | WCAG 1.4.10 reflow failure: at the 320px reference width, the Documentation Registry panel-heading action buttons ("Refresh", "New document") overflow the viewport instead of wrapping, measured as a genuine 55px horizontal overflow. | Open, not yet remediated. Newly discovered this phase — not previously documented in Phase 6.2 or 6.3. | Accessibility — real, reproducible defect |

None of the three open items involve data integrity, authorization, or governance — the categories this capability's release-blocking history (P62-001) was actually about. All three are accessibility- or tooling-scoped.

## Accessibility Findings Summary

| Area | Result |
| --- | --- |
| Keyboard navigation and focus order | Pass — live-confirmed |
| Detail-close focus restoration | Pass — live-confirmed (this phase) |
| Escape-key behavior | Pass — live-confirmed |
| Keyboard activation (Enter/Space) | Inconclusive — tooling limitation identified, not re-verified by another method |
| Screen-reader semantics (structural) | Pass — correct landmarks, labels, `role="dialog"`, `aria-live` regions confirmed via direct accessibility-tree inspection |
| Screen-reader spoken output | **Not executed in any phase** — no assistive-technology tool has been available to any validation pass to date |
| Zoom / reflow (WCAG 1.4.10, 320px) | **Fail** — P64-001, panel-heading buttons overflow the viewport |
| Narrow viewport (375×812) | Pass, with the same reflow caveat present at narrower widths |

## Infrastructure Items Deferred to Production

These remain explicitly out of scope for an Internal MVP decision, per the standing classification carried forward from Phase 6.2 (**P62-005**, High severity, "blocking only for future Production release"):

- Production backup and point-in-time recovery, with an exercised restoration
- Production monitoring with a verified, received alert (not just log visibility)
- Capacity and performance validation under production-representative load
- Data retention policy enforcement
- Incident response procedure
- Environment separation (staging vs. production)
- Key/credential rotation
- Expanded authorization model beyond the current owner/administrator/viewer roles
- Any applicable project-wide Supabase security configuration not specific to COS-MVP-002 (e.g., the pre-existing `agents`/`decisions`/`systems`/`tools`/`versions`/`workflows` RLS-no-policy advisories, and leaked-password-protection, both confirmed still present and unrelated to this capability)

None of these have been addressed by Phases 6.1–6.5 and none are claimed to be. They should not be read as blocking an Internal MVP decision, consistent with how COS-MVP-001 treated the equivalent items at its own internal release.

## Recommended Decision Options

The following three options are presented for the Release Owner and Quality Owner. This document does not select one.

### Option 1 — Conditional Internal MVP Release

Release COS-MVP-002 internally now, on the basis that the release-critical governance blocker (P62-001) is closed with live, executed evidence, and that all three remaining open items are accessibility/tooling-scoped rather than data-integrity or authorization concerns — mirroring the standard this project already applied to COS-MVP-001, where non-blocking items were carried forward rather than gating an internal release.

*Would require, at minimum:* explicit accountable-owner sign-off acknowledging P62-003 (partial), P62-004, and P64-001 as known, tracked, non-blocking gaps, each with an owner and target phase for closure — not silently dropped.

### Option 2 — Remediation Before Internal Release

Treat P64-001 (a real, reproducible WCAG failure) and/or P62-003's unexecuted screen-reader validation as release-blocking, and require their resolution before any Internal MVP decision — holding this capability to the same accessibility bar it was held to for the P62-002 finding, rather than treating reflow and screen-reader validation as lower priority.

*Would require, at minimum:* a Phase 6.6 remediation pass fixing the reflow defect and executing genuine assistive-technology validation, followed by a re-validation record before this decision is revisited.

### Option 3 — Defer Release Decision

Take no release-status action at this time. Continue closing the remaining open items (P64-001 fix, screen-reader validation, keyboard-activation re-verification, Node alignment) without committing to a release timeline, and revisit this decision once more of the register is closed or the Owners determine the current state is sufficient.

*Would require, at minimum:* no action — this is the default if no explicit decision is recorded.

## What This Document Does Not Do

- It does not create a tag, release record, or production release record.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not select among the three options above — that selection is reserved for the Release Owner and Quality Owner.
- It does not close P62-003, P62-004, or P64-001 — those remain open regardless of which option is chosen, unless separately remediated.

## References

- [Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md)
- [Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md)
- [Phase 6.2 Validation Record](COS-MVP-002_Phase_6.2_Validation_Record.md)
- [COS-MVP-001 Phase 5.1 Final Release Decision Record](COS-MVP-001_Phase_5.1_Final_Release_Decision_Record.md) — precedent for internal-vs-production release scoping

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.5 Release Decision Review: consolidated Phase 6.1–6.4 evidence into a decision-support summary with three presented options, no decision recorded |
