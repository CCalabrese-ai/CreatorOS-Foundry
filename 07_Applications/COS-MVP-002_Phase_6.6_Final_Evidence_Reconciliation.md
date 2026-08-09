# COS-MVP-002 Phase 6.6 Final Evidence Reconciliation

**Phase:** 6.6 — Remediation
**Version:** 1.0
**Document owner:** Quality Owner and Release Owner
**Status:** Evidence Record Only — No Release Decision
**Risk class:** Moderate
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This is the consolidated, authoritative record of everything produced during COS-MVP-002 Phase 6.6: what was fixed, what was validated, what remains open, and precisely where the evidence stops. It supersedes no prior record — it draws all of them together in one place. **This document does not declare Go, does not assess release readiness, does not change COS-MVP-002's release status, and does not create a tag.** No application source file was modified to produce this record.

## Executive Summary

Phase 6.6 addressed three findings carried forward from Phase 6.5's "Remediation Before Internal Release" decision: P64-001 (a WCAG reflow defect), P62-004 (Node runtime misalignment), and P62-003 (accessibility validation gaps — keyboard, screen reader, dialog behavior). Two of these are now closed with direct, executed evidence: P64-001 is fixed and verified at four viewport widths; P62-004 is resolved via a version-manager workflow, proven with a genuine override test, with one shell-context caveat stated plainly below rather than glossed over. P62-003 remains partially open — its keyboard-navigation and structural-accessibility portions have strong live evidence, but its two hardest sub-items (real keyboard-hardware activation and genuine screen-reader spoken output) have never been closed in any phase, including this one, because the tools available in this environment cannot reliably execute them. A fourth, unplanned finding emerged mid-phase: passwordless authentication was failing project-wide. Investigation traced this to two independent causes — a Supabase email-capacity rate limit (still open) and a Site URL/redirect-URL mismatch (corrected, independently corroborated). No code change was required or made for the authentication finding; the fix was a Supabase Dashboard configuration change performed by the operator, outside this repository.

## Findings Status Table

| ID | Finding | Status | Evidence basis |
| --- | --- | --- | --- |
| **P64-001** | WCAG 1.4.10 reflow failure at 320px (panel-heading action buttons overflow instead of wrapping) | **Resolved, fully verified** | Live DOM measurement and screenshot at 320px (55px overflow → 0), 375px (2px → 0), and no regression at 520px/900px; regression test added; root cause confirmed directly in source (missing `flex-wrap`, a breakpoint gap present for `.panel-heading` but not its sibling containers) |
| **P62-004** | Node runtime (`20.17.0`) below `.nvmrc` (`24`) and Vite's stated minimum | **Resolved, verified with one stated caveat** | `fnm` installed and configured via an additive `~/.zshrc` hook (Conda untouched); `.nvmrc` auto-switch proven with a genuine override test (temporarily set default to 22, confirmed `cd` into the repo still forced 24); `npm test` (79/79) and `npm run build` both clean, no version warning, in an interactive shell. **Caveat:** a plain non-interactive shell invocation does not source `~/.zshrc` and therefore still resolves Node to Conda's `20.17.0` — this reflects how that specific invocation mode works, not a failure of the fix; it is not the mode a real terminal session uses. |
| **P62-003a — Keyboard activation (Enter/Space)** | Native `<button>` Enter/Space activation on document rows and toggles | **Open — tooling limitation, not a confirmed app defect, genuinely unverified either way** | Tested twice (Phase 6.4, Phase 6.6), same result both times: synthetic keydown events reach the target as trusted but do not trigger native default-action, even after correcting `event.key` to report `"Enter"` correctly; a real mouse click on the identical element works immediately in every case. Needs real hardware or a different automation driver — planned in the Human Accessibility Test Checklist, Section 1. |
| **P62-003b — Keyboard navigation, focus order, visible focus** | Tab order and focus-visible styling across the app | **Resolved, live-verified twice** | Trusted `Tab` keydown sequence walked and read via `document.activeElement`, confirmed matching visual/DOM order, with visible focus outlines confirmed via computed style — done once on an authenticated session (Phase 6.4) and once on the unauthenticated screen (Phase 6.6) |
| **P62-003c — Dialog focus enter/exit, Escape, focus restoration** | Detail panel keyboard behavior | **Live-verified, but evidence is now aging** | Confirmed live in Phase 6.4 with real trusted events and a `keydown` probe; not re-executed in Phase 6.6 because no authenticated session was available during that pass. Planned re-confirmation in the Human Accessibility Test Checklist, Section 4. |
| **P62-003d — Screen-reader spoken output** | Actual VoiceOver/NVDA/JAWS announcement behavior | **Never executed, in any phase** | No assistive-technology driver is available in this environment (no audio capture; VoiceOver's caption panel would require manual System Settings configuration plus a live screen-control grant). Structural/ARIA-tree inspection was used as a documented proxy, not a substitute — landmarks, heading hierarchy, button names, and labels all confirmed correct via that proxy, but actual spoken output remains unverified. Planned in the checklist, Section 2. |
| **P62-003e — Non-modal dialog behavior (`aria-modal="false"`, no focus trap)** | Whether the detail panel's non-modal design is a good or confusing experience | **New observation, not yet evaluated** | Surfaced via source inspection in Phase 6.6, not previously documented in Phase 6.2 or 6.3. Not asserted as a defect. Requires a human judgment call — planned in the checklist, Section 4, items 4.1–4.3. |
| **Authentication dependency** | Passwordless sign-in failing project-wide (`over_email_send_rate_limit`, HTTP 429) | **Partially resolved** | Configuration cause (Site URL/redirect-URL mismatch) corrected and independently corroborated; capacity cause (email rate limit) confirmed still active as of the most recent test — one send succeeds, the next attempt is immediately rate-limited again |

## Evidence Captured

- Live before/after DOM measurements and screenshots for the P64-001 fix at four distinct viewport widths (320px, 375px, 520px, 900px).
- A genuine, non-coincidental proof of the `.nvmrc` auto-switch mechanism for P62-004 (temporarily overriding the global default and confirming the repo directory still forced the pinned version).
- Two independent live keyboard-navigation passes (Phase 6.4 authenticated, Phase 6.6 unauthenticated), both confirming correct Tab order and visible focus indicators via computed style, not visual assumption.
- A precisely isolated diagnostic for the Enter/Space activation gap: a `keydown` probe showing synthetic events reach the correct target as trusted events but do not trigger native activation, cross-checked against a real mouse-click control that works every time — ruling out an application-side cause without asserting a tooling cause is proven beyond doubt either.
- Structural/ARIA accessibility evidence: landmarks, heading hierarchy, button accessible names, and form/control label association — confirmed both live (unauthenticated screen) and via direct source inspection (authenticated-only dialog and live-region markup).
- Live confirmation (Phase 6.4) that Escape closes the detail panel and that focus is restored to the exact originating record afterward — the first live-runtime confirmation of the P62-002 fix, previously only static-asserted.
- A direct, independent reproduction of the original authentication failure (`429 over_email_send_rate_limit`), including a second, unrelated email address that produced the identical result — ruling out a per-recipient cause.
- A direct, independent corroboration of the Site URL/redirect-URL correction: a clean `200` success from the real Supabase endpoint using the app's actual `http://localhost:5173` origin as the redirect target, immediately followed by a `429` on the very next attempt — a pattern consistent with the redirect fix being real, not merely asserted.
- A full automated regression baseline maintained throughout: 79/79 tests passing, clean production build, at every checkpoint in this phase.

## Evidence Still Outstanding

- Real-hardware or alternate-tooling confirmation of Enter/Space keyboard activation (P62-003a) — the single largest unresolved question mark, since the current evidence rules out an obvious application cause but does not prove one doesn't exist.
- Genuine screen-reader spoken-output validation (P62-003d) — has never existed for this capability in any phase to date.
- A human judgment on the non-modal dialog's behavior (P62-003e).
- A fresh, current-phase live re-confirmation of dialog open/close/focus-restoration with an authenticated session (P62-003c) — Phase 6.4's evidence is real but now two phases old.
- Confirmation that email-sending capacity is *reliable*, not just *possible* — the current rate limit allows roughly one send before blocking again, which is not yet sufficient to complete a full, uninterrupted authenticated test session.
- Direct visual confirmation of the Supabase Dashboard's Site URL/redirect-URL field values — the current evidence is strong behavioral corroboration via the API, not a screenshot of the settings screen itself.

## Confirmed Code Changes Made

| Change | Files | Verification |
| --- | --- | --- |
| Added `flex-wrap` to `.panel-heading` (P64-001 fix) | `src/styles.css` | Live measurement before/after, no regression at existing breakpoints |
| Added a regression test for the above | `test/documentationRegistryAccessibility.test.js` | Included in the 79/79 passing suite |

**No other application source file was changed anywhere in Phase 6.6.** The Node runtime fix (P62-004) and the Supabase Site URL/redirect-URL correction were both environment/dashboard configuration changes, entirely outside this repository — neither touched any tracked file.

## Confirmed Items Requiring No Code Changes

- **P62-003a (keyboard activation):** the target elements are plain, unmodified native `<button>` elements with standard `click` listeners and no intercepting `keydown` handler — nothing in the source code explains the observed gap; the automation tooling does. No code change is indicated unless real-hardware testing (still outstanding) finds an actual defect.
- **P62-003b, P62-003c (keyboard nav, dialog focus/Escape/restoration):** already correct, confirmed live — no change needed.
- **P62-003d (screen-reader output):** the structural/ARIA foundation needed for correct screen-reader behavior is already present and confirmed via source inspection; whether it produces correct *spoken* output is a validation-access question, not a known code gap.
- **P62-003e (non-modal dialog):** `aria-modal="false"` is an explicit, deliberate attribute value, not a default or an omission — this reads as an intentional design choice for a non-blocking side panel. No change is indicated unless the pending human evaluation concludes otherwise.
- **Authentication dependency:** the app's sign-in request was independently reproduced outside the app's own code with an identical result — confirming the request is correctly formed (correct endpoint, key, payload shape). The failure and its resolution were both entirely on the Supabase configuration side.

## Environment Caveats

- **Shell-context dependency for the P62-004 fix:** the `fnm`/`.nvmrc` auto-switch is confirmed working in a genuine interactive shell (`zsh -ic`), matching how a real terminal session behaves, but a plain non-interactive shell invocation (as used internally by some tooling in this environment) does not source `~/.zshrc` and will still resolve to Conda's Node. This is a property of that invocation mode, not a defect in the fix itself, but it means "resolved" should be read with this qualifier rather than as an unconditional statement.
- **No Supabase Management API or Dashboard access was available in this environment for most of Phase 6.6.** The Site URL/redirect-URL correction was performed by the operator directly in the Supabase Dashboard; this session corroborated its effect through API behavior but did not view the Dashboard itself.
- **No dedicated screen-reader driver, audio-capture tool, or real-hardware keyboard input path is available in this environment.** These are the root cause of every remaining P62-003 gap — they are validation-access limitations, not indications that the application is broken.

## Authentication Testing Limitations

- No authenticated browser session persisted across this phase's separate work sessions; each fresh validation pass had to either inherit a pre-existing session (as happened once, fortuitously, in Phase 6.4) or work entirely on the unauthenticated screen.
- No email inbox access exists in this environment — magic-link sign-in could only be tested by inspecting the raw API response, not by completing a full, real end-to-end sign-in via an actual received email and clicked link.
- The current email-sending rate limit means even a successful configuration only allows roughly one send before blocking again, which constrains how much authenticated testing can be attempted in a single sitting until sending capacity is addressed further.

## Accessibility Validation Limitations

- Two of five P62-003 sub-items (keyboard activation, screen-reader output) have never been closed with genuine evidence in any phase of this capability's history, including this one — both are blocked by the same category of problem: the tools available in this environment cannot faithfully reproduce real human input/output modalities (physical key events with correct browser-level default-action handling; audible screen-reader speech).
- The structural/ARIA-tree inspection method used throughout this phase is a documented, reasonable proxy for screen-reader correctness, but it is explicitly not equivalent to hearing the actual output — this distinction has been maintained consistently rather than allowed to blur into an implicit compliance claim.
- The Human Accessibility Test Checklist exists specifically to close these two gaps, along with the non-modal-dialog judgment call and the aging dialog-behavior evidence, using a real tester with real hardware and real VoiceOver — none of which is available to automated tooling in this environment.

## What This Document Does Not Do

- It does not declare Go, No-Go, or Conditional Go.
- It does not assess or state whether COS-MVP-002 is ready for release, internal or otherwise.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not modify any application source file.

## References

- [Phase 6.6 Remediation Plan](COS-MVP-002_Phase_6.6_Remediation_Plan.md)
- [Phase 6.6 P62-003 Accessibility Validation Report](COS-MVP-002_Phase_6.6_P62-003_Accessibility_Validation_Report.md)
- [Phase 6.6 Human Accessibility Test Checklist](COS-MVP-002_Phase_6.6_Human_Accessibility_Test_Checklist.md)
- [Phase 6.6 Authentication Dependency Blocker (v2.0)](COS-MVP-002_Phase_6.6_Authentication_Dependency_Blocker.md)
- [Phase 6.6 Evidence Reconciliation Checkpoint](COS-MVP-002_Phase_6.6_Evidence_Reconciliation_Checkpoint.md)
- [Phase 6.5 Release Decision Review](COS-MVP-002_Phase_6.5_Release_Decision_Review.md) — source of the "Remediation Before Internal Release" decision this phase responds to

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.6 Final Evidence Reconciliation: consolidated findings status table (P64-001, P62-004, five P62-003 sub-items, authentication dependency), evidence captured/outstanding, confirmed code changes and confirmed no-code-change items, environment/authentication/accessibility limitations stated explicitly, no release recommendation made |
