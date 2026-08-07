# COS-MVP-002 Phase 6.2 Validation Scenarios

**Phase:** 6.2 — Documentation Registry Validation
**Version:** 1.0
**Document owner:** Quality Owner, Security Owner, and Application Owner
**Status:** Executed
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release status:** Not Released

## Purpose

This document defines and records the Phase 6.2 functional, security, resilience, and accessibility scenarios for the Documentation Registry candidate at commit `18a2bcd131c74841fb4d12aa7b344254d030c3bf`.

## Test Environment

| Item | Value |
| --- | --- |
| Supabase project | Creator OS Project (`ygcldesxjwotrjarvvoh`) |
| Workspace | Creator OS Foundry |
| Candidate | Phase 6.1 commit `18a2bcd131c74841fb4d12aa7b344254d030c3bf` |
| Database migrations | `20260807153019`, `20260807153118`, `20260807153232` |
| Execution date | 2026-08-07 UTC |
| Mutation safety | Validation writes executed inside transactions and rolled back |

## Functional Scenarios

| ID | Scenario | Expected result | Executed evidence | Result |
| --- | --- | --- | --- | --- |
| DOC-VAL-001 | Create document | Owner creates one identity, initial version, primary ownership, verified provenance, and System Registry relationship atomically | Authenticated owner invoked the creation function in a rollback transaction; database assertions found one of every required record | Pass |
| DOC-VAL-002 | Retrieve documents | Active member retrieves only workspace-authorized records | Approved owner identity saw 3; a valid authenticated non-member identity saw 0 | Pass |
| DOC-VAL-003 | Filter by category | Governance filter returns only governance documents | Live query returned 1 | Pass |
| DOC-VAL-004 | Filter by lifecycle | Proposed filter returns only Proposed documents | Live query returned 1 | Pass |
| DOC-VAL-005 | Search | Documentation query searches title, ID, and summary within the authorized workspace | Live query returned the 3 expected records; service tests verify escaping and bounding | Pass |
| DOC-VAL-006 | Detail view data | Detail response includes versions, owners, provenance, and System Registry relationships | Service integration test passed; live integrity query confirmed one of each for every seed | Pass |
| DOC-VAL-007 | Valid lifecycle update | Authorized owner can move Proposed to In Review | Live RLS-governed update returned `in_review` and was rolled back | Pass |
| DOC-VAL-008 | Invalid lifecycle value | Unsupported status is rejected | `released` was rejected by `documents_status_check` | Pass |
| DOC-VAL-009 | Invalid lifecycle sequence | Direct Proposed to Published must be denied without governed transition evidence | Live RLS-governed update was accepted and rolled back | **Fail** |
| DOC-VAL-010 | Ownership | Each seed has one active primary human owner | Live integrity query returned one owner per seed | Pass |
| DOC-VAL-011 | Provenance | Current version commit and hash match verified source evidence | All 3 seeds returned matching commit/hash and one provenance record | Pass |
| DOC-VAL-012 | Version relationship | A new version may point to a parent and superseded version of the same document | Validation-only `1.1.0` version passed both relationship assertions and was rolled back | Pass |

## Security Scenarios

| ID | Scenario | Executed evidence | Result |
| --- | --- | --- | --- |
| SEC-VAL-001 | Anonymous document read | `anon` role received PostgreSQL `42501 permission denied` | Pass |
| SEC-VAL-002 | Authenticated member read | Active Owner saw exactly 3 workspace records | Pass |
| SEC-VAL-003 | Authenticated non-member read | Authenticated identity without membership saw 0 records | Pass |
| SEC-VAL-004 | RLS enabled | All five documentation tables report RLS enabled | Pass |
| SEC-VAL-005 | Explicit grants | Anonymous select false; authenticated select true on all five tables | Pass |
| SEC-VAL-006 | Mutation authorization | Insert and update policies require active Owner or Administrator membership | Pass by policy inspection and owner transaction |
| SEC-VAL-007 | Creation privilege | Function uses invoker rights, denies anonymous execution, and permits authenticated execution subject to RLS | Pass |
| SEC-VAL-008 | Delete boundary | Authenticated users have no delete grant | Pass |
| SEC-VAL-009 | Supabase advisor | No advisor finding targets the five Documentation Registry tables or creation function | Pass |

Project-wide security advisories for unused legacy foundation tables and leaked-password protection remain outside this slice and are retained as future production-readiness work.

## Resilience Scenarios

| ID | Scenario | Evidence | Result |
| --- | --- | --- | --- |
| RES-VAL-001 | Empty result | Service returns an empty collection and UI derives a specific Empty state | Pass |
| RES-VAL-002 | Invalid record input | Invalid ID, path, commit, hash, version, and lifecycle are rejected before RPC | Pass |
| RES-VAL-003 | Database constraint failure | Unsupported lifecycle value is rejected without persisting a change | Pass |
| RES-VAL-004 | Unavailable data | Dependency error fails closed and UI derives Unavailable, not Empty or Success | Pass |
| RES-VAL-005 | Partial or stale data | Partial and stale synchronization state produces a warning while verified records remain renderable | Pass |
| RES-VAL-006 | Conflict or quarantine | Conflict and quarantined state produces a review warning | Pass |
| RES-VAL-007 | User recovery | Refresh and retry controls invoke a new bounded load; prior failure is cleared only when the retry succeeds | Pass by service-state and source-path inspection |
| RES-VAL-008 | Transaction recovery | Creation assertions ran inside a transaction and rollback left the baseline at 3 records | Pass |
| RES-VAL-009 | Governed lifecycle recovery | Invalid sequence prevention should preserve the prior state | **Fail — sequence is not enforced** |

## Accessibility Scenarios

| ID | Scenario | Evidence | Result |
| --- | --- | --- | --- |
| A11Y-VAL-001 | Bypass navigation | Skip link targets the named main region | Pass |
| A11Y-VAL-002 | Semantic hierarchy | One page H1; named capability navigation, summary, and registry regions | Pass |
| A11Y-VAL-003 | Form labels | Filters and creation controls have visible programmatic labels | Pass |
| A11Y-VAL-004 | Status announcements | Registry, detail-loading, creation, and error messages expose status or alert semantics | Pass |
| A11Y-VAL-005 | Keyboard controls | Interactive records and actions use native buttons and forms; Escape closes detail | Pass by structural automation |
| A11Y-VAL-006 | Detail-open focus | Opening details moves focus to the named close control | Pass by structural automation |
| A11Y-VAL-007 | Detail-close focus | Closing detail should return focus to the originating record | **Fail — current close path does not restore origin focus** |
| A11Y-VAL-008 | Authenticated keyboard walkthrough | Full Tab, Enter, Escape, and focus-order run in the authenticated deployed UI | Pending |
| A11Y-VAL-009 | Screen-reader speech | Spoken announcements and relationships tested with an assistive technology | Pending |
| A11Y-VAL-010 | Responsive zoom/reflow | Authenticated narrow viewport and 200%/400% zoom matrix | Pending |

The five new accessibility structure tests pass, but they do not replace an authenticated assistive-technology session.

## Automated and Build Results

- Automated tests: **26 passed, 0 failed**.
- Documentation Registry tests: input validation, creation, retrieval, filtering, detail evidence, state derivation, denial behavior, and failure behavior passed.
- Accessibility structure tests: **5 passed, 0 failed**.
- Production build: **passed** with the approved Node 24.14.0 runtime; 72 modules transformed.
- Repository patch validation: required before commit.

## Exit Criteria

Functional validation is conditional because lifecycle sequences are not enforced. Accessibility validation is conditional because close-focus restoration fails and authenticated keyboard, speech, and viewport runs remain pending. No release tag or released-state record is authorized.

## References

- [Phase 6.2 Validation Record](COS-MVP-002_Phase_6.2_Validation_Record.md)
- [Phase 6.1 Implementation Evidence](COS-MVP-002_Phase_6.1_Implementation_Evidence.md)
- [Documentation Workflows](COS-MVP-002_Documentation_Workflows.md)
- [Documentation Standards](../00_Governance/Documentation_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.2 scenarios and executed results |
