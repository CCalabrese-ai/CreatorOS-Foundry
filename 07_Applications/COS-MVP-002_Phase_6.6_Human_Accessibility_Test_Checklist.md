# COS-MVP-002 Phase 6.6 Human Accessibility Test Checklist

**Phase:** 6.6 — Remediation (Human Accessibility Validation)
**Version:** 1.0
**Document owner:** Quality Owner
**Status:** Checklist — No Testing Executed
**Risk class:** Moderate
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This is an execution checklist for a human tester to close the accessibility validation gaps identified in `COS-MVP-002_Phase_6.6_P62-003_Accessibility_Validation_Report.md`: keyboard activation, screen-reader spoken output, and dialog behavior — none of which could be conclusively validated by automated tooling in this environment. **This document contains no release recommendation.** It is a test plan only; results should be recorded against it, then fed back into a validation record before any release decision is revisited.

## Before You Start

- Run `npm run dev` and confirm the server is up at `http://localhost:5173`.
- Have a real, approved email address ready to receive the passwordless sign-in link (required for Sections 3 and 4).
- For Section 2, enable VoiceOver (Cmd+F5) and take a moment to confirm you can hear it before starting the checklist.
- Use a physical keyboard for all keyboard tests — do not use any browser automation or remote-control tool, since the point of this pass is to test what automated tooling in this project could not.

---

## 1. Physical Keyboard Enter/Space Activation

Automated testing in this environment could not conclusively verify this (Phase 6.6 report: synthetic Enter/Space key events did not trigger native button activation, isolated as a tooling limitation, not a confirmed app defect). This section exists to resolve that open question either way.

| # | Action | Expected Result | Pass/Fail Criteria | Evidence to Capture |
|---|---|---|---|---|
| 1.1 | Tab to the "Documentation" / "Systems" nav toggle, press **Enter** | The other tab becomes active (text color changes to the highlighted/active state) | Pass: active tab visibly switches. Fail: no visible change. | Screenshot before and after; note which key was pressed |
| 1.2 | Tab to the same toggle, press **Space** | Same as 1.1 | Same as 1.1 | Screenshot before and after |
| 1.3 | Sign in, tab to a document row in the Documentation Registry list, press **Enter** | The document detail panel opens | Pass: detail panel visibly opens with the correct record's data. Fail: nothing happens. | Screenshot before and after |
| 1.4 | Tab to a document row, press **Space** | Same as 1.3 | Same as 1.3 | Screenshot before and after |
| 1.5 | With the detail panel open, tab to the close (`×`) button, press **Enter** | Panel closes | Pass: panel closes. Fail: no change. | Screenshot before and after |
| 1.6 | Repeat 1.5 with **Space** | Same as 1.5 | Same as 1.5 | Screenshot before and after |
| 1.7 | Tab to "Refresh", "New document", and the filter "Apply" buttons individually; press **Enter** on each | Each performs its labeled action (reload, opens the create form, applies filters) | Pass: each control responds correctly to Enter. Fail: any control does not respond. | One screenshot per control, before/after |

**If any test fails:** note the exact control, browser, and OS version. This would be the first confirmed real defect in this area across all prior phases — treat it as a new, independent finding, not a confirmation of the automation tool's earlier result (a human failing this too would mean something different than the tool failing it).

---

## 2. VoiceOver Spoken Output Validation

No phase of this capability's validation history has included a genuine screen-reader pass. This is the single largest accessibility gap remaining.

| # | Action | Expected Result | Pass/Fail Criteria | Evidence to Capture |
|---|---|---|---|---|
| 2.1 | Load the page fresh with VoiceOver on; let it announce the page | VoiceOver announces the page title and lands on/near the skip link or main landmark | Pass: coherent, sensible announcement of page identity. Fail: silence, garbled output, or landing somewhere disorienting. | Written transcript of what was announced (screen recording preferred if available) |
| 2.2 | Navigate to the "Skip to registry" link and activate it | Focus moves to the main registry region; VoiceOver announces the jump | Pass: focus visibly and audibly moves past the header/nav. Fail: no movement or no announcement. | Transcript |
| 2.3 | Navigate through the sign-in form (email field, submit button) | VoiceOver announces "Email address, edit text" and "Send secure link, button" (or equivalent) | Pass: both name and role are announced correctly. Fail: missing name, wrong role, or silence. | Transcript |
| 2.4 | After signing in, navigate to the Category and Lifecycle filter selects | VoiceOver announces each select's label ("Category", "Lifecycle") and current value | Pass: label and value both announced. Fail: either is missing. | Transcript |
| 2.5 | Trigger a registry reload (Refresh) and listen for the status update | VoiceOver announces the record-count/status change (e.g. "3 document records loaded") without requiring the user to manually navigate to it | Pass: announcement occurs automatically (confirms `aria-live="polite"` is actually functioning in VoiceOver, not just present in markup). Fail: no announcement, or user must hunt for it. | Transcript, timestamp relative to the Refresh action |
| 2.6 | Open a document's detail panel | VoiceOver announces entry into a dialog, speaks its name (the document title) and, ideally, its description | Pass: dialog role, name, and description are all announced. Fail: any is missing, or VoiceOver does not indicate a dialog context at all. | Transcript |
| 2.7 | While the detail panel is open, continue navigating with VoiceOver past its last element | See "Dialog Behavior" Section 4 below — record what VoiceOver does (stays confined vs. moves into background content) as part of that evaluation, not as a pass/fail here | N/A — informational, feeds Section 4 | Transcript, cross-reference to Section 4 result |
| 2.8 | Close the detail panel via the close button, using VoiceOver navigation (not just Escape) | VoiceOver announces the panel closing and where focus lands | Pass: coherent announcement, focus lands somewhere sensible (ideally the originating record, matching Phase 6.4's proven behavior). Fail: silence or focus lands somewhere confusing/untraceable. | Transcript |
| 2.9 | Trigger a failure state if possible (e.g., disconnect network briefly and refresh, or attempt an invalid create-document submission) | VoiceOver interrupts with the error/alert content (`role="alert"` is assertive, should interrupt rather than wait) | Pass: error is announced promptly, distinctly from routine status updates. Fail: silent, delayed, or indistinguishable from a routine update. | Transcript |

**Recording method:** a written transcript of what VoiceOver actually said, in order, is the minimum acceptable evidence. A screen recording with audio is strongly preferred where feasible, since it captures timing and tone that a transcript alone can miss.

---

## 3. Authenticated Documentation Registry Session

This section exists to re-confirm, with a fresh live session, behavior that automated testing in Phase 6.6 could not access (no session was available) and that Phase 6.4's evidence is now several phases old.

| # | Action | Expected Result | Pass/Fail Criteria | Evidence to Capture |
|---|---|---|---|---|
| 3.1 | Enter a real email address and request a sign-in link | Status message updates to "Check your email for the secure sign-in link" | Pass: message appears, correct email received shortly after. Fail: no message, or no email arrives. | Screenshot of status message |
| 3.2 | Click the emailed sign-in link | Redirected back to the app, now authenticated (Sign out control visible, real document records loaded) | Pass: session established, real Supabase data visible. Fail: error, or still shows the sign-in screen. | Screenshot of the authenticated Documentation Registry view |
| 3.3 | Apply each filter (Category, Lifecycle, Search) individually and in combination | Record list updates to match the filter(s); record count in the status line matches what's shown | Pass: filtered results are accurate. Fail: stale, incorrect, or unresponsive results. | Screenshot per filter combination tested |
| 3.4 | Click "Refresh" | Record list reloads; loading state is visible if there's any delay | Pass: list refreshes without error. Fail: error state, stale data, or no visible feedback. | Screenshot |
| 3.5 | Click "New document", fill the form with valid data, submit | New draft record appears in the list after creation | Pass: record created and visible. Fail: submission fails, or succeeds but doesn't appear. | Screenshot of the form and the resulting list |
| 3.6 | Click "Sign out" | Returns to the unauthenticated sign-in screen | Pass: session ends cleanly. Fail: error, or session persists. | Screenshot |

---

## 4. Dialog / Detail Panel Behavior Evaluation

Phase 6.6's source review found the detail panel uses `role="dialog" aria-modal="false"` with no keyboard focus trap — meaning a keyboard/screen-reader user can tab past it into the background page while it's open. This was surfaced as an observation, not a defect — this section is where a human judges whether that's actually a good or confusing experience.

| # | Action | Expected Result | Pass/Fail Criteria | Evidence to Capture |
|---|---|---|---|---|
| 4.1 | Open a document detail panel, then keep pressing Tab past its last focusable element (the close button) | Note exactly where focus goes next | N/A — descriptive, not pass/fail on its own; feeds 4.2 | Written note of what element receives focus next, and a screenshot |
| 4.2 | Judge the result of 4.1: does focus moving into the background page (while the panel visually remains open) feel disorienting or incorrect, or does it feel like a reasonable non-modal side-panel pattern? | A clear tester judgment, not just a description | Pass: tester judges the behavior as acceptable/intentional-feeling. Fail: tester judges it as confusing or broken-feeling, especially for a screen-reader user who may not realize the dialog is still open. | Written judgment with reasoning |
| 4.3 | With VoiceOver on, repeat 4.1–4.2 specifically listening for whether VoiceOver gives any indication the dialog is still open once focus has left it | Ideally, VoiceOver should not silently abandon dialog context without some cue | Pass: reasonable cue exists (even if imperfect). Fail: no cue at all — user could easily forget the panel is still open. | Transcript |
| 4.4 | Open the detail panel, press Escape | Panel closes | Pass: closes. Fail: does not close. | Screenshot before/after |
| 4.5 | Open the detail panel from a specific document row, close it (via Escape or close button), confirm keyboard focus visibly returns to that same row | Focus visibly lands back on the originating row (re-confirms Phase 6.4's finding with a fresh session) | Pass: focus demonstrably on the same row (e.g., visible focus outline on it). Fail: focus lost (e.g., reset to page top or body). | Screenshot showing focus outline on the originating row |
| 4.6 | Repeat 4.5 for at least two different rows (not just the first one in the list) | Same as 4.5, for each | Same as 4.5 | Screenshot per row tested |

---

## Reporting Results

Record results directly against this checklist (pass/fail per numbered item, plus the requested evidence) and compile them into a follow-up validation record — do not fold pass/fail conclusions into this document itself. This checklist does not recommend a release decision; that remains a separate step for the Release Owner and Quality Owner once results are in.

## References

- [Phase 6.6 P62-003 Accessibility Validation Report](COS-MVP-002_Phase_6.6_P62-003_Accessibility_Validation_Report.md) — origin of the gaps this checklist is designed to close
- [Phase 6.6 Remediation Plan](COS-MVP-002_Phase_6.6_Remediation_Plan.md)
- [Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — prior live dialog/focus evidence this checklist re-confirms

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.6 Human Accessibility Test Checklist: four sections (keyboard activation, VoiceOver, authenticated session, dialog behavior evaluation), each with action/expected result/pass-fail criteria/evidence to capture, no release recommendation included |
