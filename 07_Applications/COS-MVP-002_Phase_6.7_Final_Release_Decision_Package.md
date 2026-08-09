# COS-MVP-002 Phase 6.7 Final Release Decision Package

**Phase:** 6.7 — Final Release Decision Preparation
**Version:** 1.0
**Document owner:** Release Owner and Quality Owner
**Status:** Decision Package — Recommendation Only, No Authorization
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This package consolidates the authoritative evidence from Phases 6.4, 6.5, and 6.6 into a single Internal MVP release decision package for the Release Owner and Quality Owner. **It contains a recommendation, not an authorization.** Nothing in this document creates a tag, creates a GitHub release, or changes COS-MVP-002's release status — those actions remain reserved for the accountable owners, performed separately, after this package is reviewed and a decision is explicitly recorded.

## Release Scope

**In scope for this decision:** COS-MVP-002, the Documentation Registry capability — its lifecycle-governance database layer (tables, RLS policies, the governed transition function), its client application (document/system registry views, authentication, document detail dialogs), and the accessibility and runtime remediations completed in Phase 6.6, as an **Internal MVP** release (internal testers only, not a public production release).

**Out of scope for this decision:** production-grade infrastructure (backup/recovery, monitoring, capacity, retention, incident response, environment separation, key rotation, expanded authorization, production email delivery) — carried forward as deferred production requirements, consistent with how COS-MVP-001 was scoped at its own internal release.

## Evidence Summary

| Source | What it established |
| --- | --- |
| Phase 6.2 Validation Record | Original No-Go: identified P62-001 (governance bypass), P62-002 (focus restoration), P62-003 (accessibility validation gaps), P62-004 (Node runtime), P64 items not yet discovered |
| Phase 6.3 Release Blocker Remediation | Implemented the governed lifecycle transition function, evidence tables, RLS, and removed the stale direct-update policy — not yet validated live |
| Phase 6.4 Validation Record | **Closed P62-001 with 10/10 live test cases against the production database** — valid/invalid transitions, missing/incorrect evidence, actor/role authorization boundaries, three-tier RLS behavior, and critically, the direct-`UPDATE`-bypass-by-owner exploit confirmed denied. Also confirmed P62-002 live for the first time, and confirmed keyboard navigation/focus order live. Found P64-001 (new). Recommended Conditional, not Go. |
| Phase 6.5 Release Decision Review | Formalized three options; "Remediation Before Internal Release" selected |
| Phase 6.6 (Remediation Plan → Final Evidence Reconciliation) | Fixed and verified P64-001; resolved P62-004 (with a stated shell-context caveat, now further corroborated — see Residual Risks below); found and partially resolved the authentication dependency (config cause fixed and corroborated, capacity cause still open); advanced P62-003 with live keyboard-nav evidence but left two sub-items (real keyboard-hardware activation, screen-reader spoken output) and one new observation (non-modal dialog) genuinely unverified |
| This session (Phase 6.7 preparation) | Re-confirmed via the canonical `npm test` / `npm run build` commands: 79/79 tests passing, clean production build, no version warnings. An exploratory `node --test test/` invocation (not the canonical command) threw a module-resolution error under Node 24 — traced to how that ad hoc invocation was parsed, not to any product or test defect; the canonical `npm test` command, matching `package.json` exactly, passed cleanly both before and after. Recorded here so this artifact isn't mistaken for a regression by a future reader. |

## Findings Classification

| ID | Finding | Classification | Basis |
| --- | --- | --- | --- |
| **P62-001** | Governed lifecycle transitions, evidence enforcement, authorization boundaries, RLS, direct-mutation bypass | **Resolved** | Phase 6.4: 10/10 live tests against production, including the specific exploit this finding originally described, confirmed denied even for the workspace owner |
| **P62-002** | Detail-close focus restoration | **Resolved** | Phase 6.4: live-confirmed via trusted `Escape` keydown and `document.activeElement` inspection |
| **P64-001** | WCAG 1.4.10 reflow at 320px | **Resolved** | Phase 6.6: fixed, measured before/after at four widths, regression test added, no breakpoint regression |
| **P62-004** | Node runtime below `.nvmrc`/Vite minimum | **Resolved** | Phase 6.6: `fnm` configured, `.nvmrc` auto-switch proven with a genuine override test; this session's own tooling now resolves Node 24 automatically in at least one additional shell context beyond what Phase 6.6 confirmed — see Residual Risks |
| **Auth — Site URL / redirect URL mismatch** | Config cause of the authentication failure | **Resolved** | Operator-corrected in the Supabase Dashboard, independently corroborated via a live API call that accepted the `:5173` redirect and returned a clean `200` |
| **Auth — email-sending capacity** | Supabase default email rate limit | **Accepted internal-MVP limitation** | Confirmed still active as of the most recent test (one send succeeds, the next is immediately rate-limited). This is a Supabase account/plan-level throttle, not a defect in COS-MVP-002's code or configuration — the request itself is correctly formed and correctly configured. It constrains how many testers can sign in per unit time until addressed, but does not indicate broken or insecure authentication logic. Documented resolution path (wait for reset, or configure custom SMTP) already exists. |
| **P62-003a** | Keyboard activation (Enter/Space) on native buttons | **Accepted internal-MVP limitation** | Investigated twice (Phase 6.4, Phase 6.6), same result: isolated as an automation-tooling limitation, not a confirmed application defect — native, unmodified `<button>` elements with no intercepting handlers; a real mouse click always works. Genuinely unverified by real hardware, but nothing in the source code explains a defect. Tracked for closure via the Human Accessibility Test Checklist, Section 1. |
| **P62-003b** | Keyboard navigation, focus order, visible focus | **Resolved** | Live-verified twice (Phase 6.4 authenticated, Phase 6.6 unauthenticated), both via trusted events and computed-style checks |
| **P62-003c** | Dialog focus enter/exit, Escape, restoration | **Resolved, evidence aging** | Live-verified in Phase 6.4 with real trusted events; not re-executed in Phase 6.6 (no authenticated session available that pass). Classified resolved because the evidence is real and was never contradicted, not merely assumed — reconfirmation is recommended, not required, to sustain this classification. |
| **P62-003d** | Screen-reader spoken output | **Accepted internal-MVP limitation** | Never executed in any phase — no assistive-technology driver has been available to any automated validation pass. Structural/ARIA correctness is confirmed as a proxy, explicitly not equivalent to verified spoken output. Tracked via the checklist, Section 2. |
| **P62-003e** | Non-modal dialog behavior (`aria-modal="false"`, no focus trap) | **Accepted internal-MVP limitation** | New observation, not asserted as a defect — `aria-modal="false"` is an explicit, deliberate value. Requires a human judgment call, tracked via the checklist, Section 4. |
| **P62-005** | Production backup, monitoring, capacity, retention, incident response, environment separation, key rotation, expanded authorization, project-wide security advisories | **Deferred production requirement** | Explicitly out of scope for Internal MVP since Phase 6.2, consistent with how COS-MVP-001 was scoped |
| **Production email delivery (SMTP, sending domain, product identity/domain decision)** | Durable, reliable authenticated access at production scale | **Deferred production requirement** | Explicitly named as such in the Phase 6.6 authentication evidence record; not attempted or recommended as complete here |

## Resolved Blockers

The one finding that carried true release-blocking severity across this capability's entire history — **P62-001**, the governance/authorization bypass — is resolved with comprehensive, directly-executed live evidence against the production database. This is the central fact this recommendation rests on. Alongside it, P62-002, P64-001, P62-004, and the authentication configuration defect are all resolved with equivalent rigor: not asserted, executed and observed.

## Accepted Limitations (Internal MVP)

Four items are classified as accepted limitations for an *internal* release, each because it is either (a) a validation-access gap with no corresponding known code defect, or (b) an external capacity constraint unrelated to code correctness — not because it was overlooked or minimized:

1. Enter/Space keyboard activation — genuinely unverified, isolated to tooling, not code
2. Screen-reader spoken output — never executed, no environment capability to do so exists yet
3. Non-modal dialog behavior — a pending human judgment call, not a known defect
4. Authentication email-sending capacity — an external Supabase-plan throttle, correctly configured otherwise

Accepting these for an *internal* release is consistent with this project's own established pattern (COS-MVP-001's internal release carried forward equivalent accessibility and infrastructure gaps under the same reasoning). None of the four involve data integrity, authorization, or governance.

## Deferred Production Gates

Unchanged from every prior phase's classification: production backup/recovery with exercised restoration, production monitoring with verified alert receipt, capacity and performance validation, retention enforcement, incident response, environment separation, key rotation, an expanded authorization model, the pre-existing project-wide Supabase advisories (`agents`/`decisions`/`systems`/`tools`/`versions`/`workflows` RLS-no-policy, leaked-password-protection), and now also: a final product identity/domain decision, a verified sending domain, and production SMTP provider configuration. None of these are addressed by this package, and none should be inferred as addressed.

## Residual Risks

Stated plainly rather than smoothed over:

- **P62-003a and P62-003d remain genuinely unknown, not just unfinished.** It is possible, though nothing found so far suggests it, that real keyboard hardware or a real screen reader could surface an actual defect neither automated pass could detect. The Human Accessibility Test Checklist exists specifically to close this residual uncertainty, and doing so soon after any internal release is strongly advisable, not optional busywork.
- **P62-003c's live evidence is now three phases old** (Phase 6.4) and was never re-executed in Phase 6.6 due to session/access constraints. Nothing has contradicted it, but it has also not been refreshed.
- **Authentication capacity is a real, active constraint on internal testers today**, not a theoretical future concern — internal testers attempting to sign in may be blocked by the rate limit depending on timing, independent of anything about their own account or the application's correctness.
- **Environment/tooling caveats exist around the P62-004 fix**, though this session found the fix propagating further (a plain Bash invocation resolved Node 24 via fnm's multishell path, where Phase 6.6 had found it did not) — this is a positive update, not a new risk, but the underlying fact that the fix's reach depends on shell context has not fully resolved into a single, unconditional guarantee.
- **The non-modal dialog's actual user experience is unassessed.** `aria-modal="false"` may be entirely intentional and fine, or it may prove disorienting for keyboard/screen-reader users in practice — this is unresolved either way, not resolved-in-the-app's-favor by default.

## Internal MVP Go / No-Go Recommendation

**Recommendation: Go for Internal MVP, conditional on explicit accountable-owner acknowledgment of the four accepted limitations and the residual risks above — not a self-executing authorization.**

Reasoning: the one item with genuine release-blocking severity in this capability's history (P62-001) is resolved with the most rigorous evidence this project has produced for any finding — live, executed, non-destructive tests directly against the production database, including the specific exploit scenario the original finding described. Every other open item is either resolved, or is a validation-access/external-capacity gap with no corresponding known code defect, consistent with how this project scoped COS-MVP-001's own internal release. Nothing found in Phase 6.4, 6.5, 6.6, or this preparation session constitutes a governance, data-integrity, or security concern that remains open.

**This recommendation is not authorization.** It is a professional assessment for the Release Owner and Quality Owner to accept, modify, or reject. No tag, release record, or release-status change follows from this document by itself.

## Exact Conditions Required Before Any Tag or Release-Status Change

1. The Release Owner and Quality Owner explicitly review and accept (or reject) this package's classification of each finding — silence or inaction should not be read as acceptance.
2. Explicit, recorded acknowledgment of the four accepted internal-MVP limitations (P62-003a, P62-003d, P62-003e, authentication capacity), each with an assigned owner and, ideally, a target phase for closure — not silently carried forward indefinitely.
3. Confirmation that the automated regression baseline is green at the moment of the actual release action (`npm test`, `npm run build`) — re-verified immediately before tagging, not assumed from this document's evidence, which will age between now and that moment.
4. A decision on whether to execute any part of the still-outstanding Human Accessibility Test Checklist before or after the Internal MVP tag — this package does not require it before Go, but does not recommend indefinitely deferring it either.
5. Only after 1–4: the Release Owner (not this document, not this session) creates the tag and any release record, and updates COS-MVP-002's release status.

## What This Document Does Not Do

- It does not create a tag.
- It does not create a GitHub release.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not itself constitute Release Owner or Quality Owner authorization — a recommendation is not a decision.
- It does not modify any application code, database migration, or infrastructure configuration.

## References

- [Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md)
- [Phase 6.5 Release Decision Review](COS-MVP-002_Phase_6.5_Release_Decision_Review.md)
- [Phase 6.6 Final Evidence Reconciliation](COS-MVP-002_Phase_6.6_Final_Evidence_Reconciliation.md)
- [Phase 6.6 Authentication Dependency Blocker (v2.0)](COS-MVP-002_Phase_6.6_Authentication_Dependency_Blocker.md)
- [Phase 6.6 Human Accessibility Test Checklist](COS-MVP-002_Phase_6.6_Human_Accessibility_Test_Checklist.md)
- [COS-MVP-001 Phase 5.1 Final Release Decision Record](COS-MVP-001_Phase_5.1_Final_Release_Decision_Record.md) — precedent for internal-vs-production release scoping

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.7 Final Release Decision Package: consolidated Phase 6.4–6.6 evidence, classified every open finding into resolved/accepted-limitation/deferred-production/blocker, concluded no remaining item is a release blocker, issued a Conditional Go recommendation for Internal MVP with exact preconditions, explicitly not an authorization |
