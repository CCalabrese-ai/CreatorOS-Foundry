# COS-MVP-002 Phase 6.6 Remediation Plan

**Phase:** 6.6 — Remediation Planning
**Version:** 1.0
**Document owner:** Quality Owner and Application Owner
**Status:** Plan Only — No Remediation Executed
**Risk class:** Moderate
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

Per the Phase 6.5 Release Decision Review, "Remediation Before Internal Release" was selected as the path forward. This document plans the remediation of the three open, non-governance findings carried from Phase 6.4/6.5 — **P62-003** (accessibility validation gaps), **P62-004** (Node runtime alignment), and **P64-001** (WCAG 1.4.10 reflow). It is planning only: no source file has been modified, no dependency installed, no test added or changed, no commit created, and no release-status or tag action taken. Each section below was grounded in direct inspection of the current repository state, not assumption.

## P64-001 — WCAG 1.4.10 Reflow Failure at 320px

### Issue Summary

At the WCAG 1.4.10 reference width (320 CSS px), the Documentation Registry panel heading's action buttons ("Refresh", "New document") overflow the viewport by a measured 55px instead of wrapping, clipping "New document" past the visible edge. Confirmed live in Phase 6.4 via `document.documentElement.scrollWidth` (375) vs. `clientWidth` (320) and a screenshot showing the clipped button. At 375×812 the same defect is present but negligible (2px).

### Root Cause Hypothesis

Confirmed directly in [`src/styles.css`](../src/styles.css), not inferred: the rule

```css
.panel-heading{display:flex;justify-content:space-between;align-items:center;padding:1.5rem;border-bottom:1px solid #29483f}
```

sets `display:flex` with no `flex-wrap`, so its children — the heading text and the `.actions` button group — are forced onto one row regardless of available width. The two existing responsive breakpoints (`@media(max-width:900px)` and `@media(max-width:520px)`) rewrite `.hero-row`, `.auth-card`, `.registry-shell`, `.summary`, `.filters`, `.search`, and `.record` — but neither breakpoint touches `.panel-heading` or `.actions` at all. Every other major layout container in this file has narrow-width handling; this one was simply missed. This is a straightforward, high-confidence root cause, not a hypothesis requiring further investigation.

### Proposed Remediation

Add `flex-wrap: wrap` to `.panel-heading`, and give the heading text a `flex-basis` (e.g. `flex: 1 1 auto; min-width: 0`) so it can shrink or drop to its own line before `.actions` is forced to overflow, matching the wrapping pattern already used for `.filters` at the 520px breakpoint. This can likely be a small, targeted rule addition inside the existing `@media(max-width:520px)` block (or a new, narrower breakpoint if 520px is confirmed too wide once tested) rather than a structural rewrite — the layout intent (heading left, actions right) is correct down to ~520px; only the sub-360px case needs a wrap fallback.

### Files Likely Affected

- `src/styles.css` — the only file expected to require a change; this is a pure CSS layout defect, not a markup or JS defect.

### Validation Method

Re-run the exact Phase 6.4 measurement: resize to 320×700, read `document.documentElement.scrollWidth` vs `clientWidth` via the browser tool (expect equal, or within a few px of legitimate scrollbar width), and take a screenshot to visually confirm "New document" is no longer clipped. Re-check at 375×812 and at the existing 900px/520px breakpoints to confirm no regression to the layouts already handled there.

### Acceptance Criteria

- `scrollWidth` does not exceed `clientWidth` by more than a nominal few pixels at 320px width.
- Both "Refresh" and "New document" are fully visible and tappable at 320px width, either side-by-side or wrapped.
- No visual regression at the 900px and 520px breakpoints already covered by existing CSS.
- The existing `test/documentationRegistryAccessibility.test.js` continues to pass unmodified (it does not currently assert on this CSS, so it should be unaffected either way — confirming this is itself part of acceptance).

### Rollback Considerations

Low risk: an isolated, additive CSS rule change with no JS or markup dependency. Revert is a single-file, single-rule `git revert` or manual removal of the added declaration. No data, migration, or state is involved.

## P62-004 — Node Runtime Alignment

### Issue Summary

The active local Node version (`20.17.0`, resolving from `/opt/miniconda3/bin/node`) is below `.nvmrc`'s pin (`24`) and below `package.json`'s stated `engines.node` minimum (`>=20.19.0`), and below Vite 7.3.6's own stated minimum (`20.19+` or `22.12+`). Vite prints a non-fatal warning on every `npm run dev` start; the app currently still runs.

### Root Cause Hypothesis

Not a defect in this repository — the repository's own version pins (`.nvmrc`, `package.json engines`) are internally consistent and correct. The gap is purely environmental: the shell's active Node comes from a Conda installation (`/opt/miniconda3/bin/node`) that predates or is unrelated to this project, and no Node version manager (`nvm`, `fnm`, `asdf`) is present to make the shell honor `.nvmrc` automatically. This is a local-environment configuration gap, not something fixable by editing repository files.

### Proposed Remediation

Two options, not mutually exclusive:

1. **Install a compliant Node version via Homebrew** (`brew install node@24`, confirmed available in this environment — `/opt/homebrew/bin/brew`, v6.0.15) and ensure it takes PATH precedence over the Conda-provided `node` for this project's shell context, or
2. **Adopt a Node version manager** (e.g. `nvm` or `fnm`) so `.nvmrc` is honored automatically per-directory, which is the more durable fix and avoids relying on manual PATH ordering.

Given `.nvmrc` already correctly pins `24`, this is fundamentally an environment-setup task, not a code change — no repository file is expected to need modification for this item specifically, unless the team decides to also lower `engines.node` to something more permissive (not recommended, since it would just mask the same problem for the next contributor rather than fix it).

### Files Likely Affected

- None expected in the repository itself. If a version-manager adoption decision is made, `README.md` or a setup doc (e.g. `07_Applications/MVP_Development_Environment_Setup.md`) may warrant a note — that would be a documentation-only follow-up, not part of this fix's critical path.

### Validation Method

After installing/switching Node: run `node --version` and confirm it reports `20.19+` or `22.12+`; run `npm run dev` and confirm the Vite version-warning no longer appears in output; run the full suite (`npm test`, currently 78/78) and `npm run build` to confirm no regression from the runtime change itself.

### Acceptance Criteria

- `node --version` reports a version satisfying both `.nvmrc` (`24`) and `package.json`'s `>=20.19.0` engine constraint.
- `npm run dev` starts with no Node-version warning in its output.
- `node --test` (78 tests as of Phase 6.4) and `npm run build` both continue to pass with no regressions attributable to the runtime change.

### Rollback Considerations

Very low risk: installing an additional Node version via Homebrew does not remove or affect the existing Conda-provided Node, and can be uninstalled independently (`brew uninstall node@24`) without side effects elsewhere. If a version manager is adopted instead, that is a larger, more durable environment change and would warrant its own short rollback note at the time it's actually done — deferred here since it is not the primary proposed path.

## P62-003 — Remaining Accessibility Validation Gaps

Phase 6.4 closed part of this finding live (keyboard navigation, focus order, Escape-close, and — as its own resolved finding — P62-002's focus restoration). Two sub-items remain open and are planned separately below, since they have different causes and different fixes.

### P62-003a — Keyboard Activation (Enter/Space) Not Conclusively Re-Verified

**Issue summary:** In Phase 6.4, synthetic `Return`/`Space` keydown events dispatched by the browser-automation tool reached the correct focused `<button>` element as trusted events, but did not trigger the button's click handler. A `keydown` probe showed the synthetic event's `event.key` was an empty string rather than `"Enter"`; a real mouse click on the identical element worked immediately. This isolates the cause to the automation tool's synthetic key dispatch, not the application — but it means this item is genuinely unverified by any method yet, not merely "probably fine."

**Root cause hypothesis:** Application-side, no defect hypothesized — the document-row control (`<button class="record document-record" data-document-id="...">` in [`src/main.js`](../src/main.js), wired via a plain `addEventListener('click', ...)`, see line ~170) is a native `<button>` element, which activates on Enter/Space via browser-level default action independent of any JavaScript. There is no custom `keydown` handler intercepting or suppressing this on the button itself. The gap is in the *validation tooling* (this environment's browser-automation key dispatch), not in `src/main.js`.

**Proposed remediation:** Not a code change — a validation-method change. Re-verify Enter/Space activation using either (a) real hardware/a human tester, or (b) a different automation driver whose synthetic `keydown` correctly sets `event.key`. If re-verification surfaces a genuine defect (unexpected given the native-button analysis above), only then would a code fix be scoped.

**Files likely affected:** None, pending re-verification. If a genuine defect is found, `src/main.js` (the document-row button markup/handler) would be the only plausible location.

**Validation method:** Attach the same `keydown` probe used in Phase 6.4 (`window.addEventListener('keydown', e => ..., true)`) while testing with the alternate driver/hardware; confirm `event.key === 'Enter'` (or `' '`) is correctly reported and that the detail panel opens.

**Acceptance criteria:** Enter and Space each independently confirmed to open the document detail panel when a document row is focused, via a method that correctly reports `event.key`, with the resulting panel showing correct, live data (mirroring the mouse-click control test from Phase 6.4).

**Rollback considerations:** None — this is a validation activity with no code change, unless a real defect is found, in which case rollback considerations would be scoped alongside that fix.

### P62-003b — Screen-Reader Spoken-Output Validation Never Executed

**Issue summary:** No phase of this capability's validation history (6.2, 6.3, 6.4) has executed genuine assistive-technology (VoiceOver, NVDA, JAWS) validation. Structural/semantic correctness has been confirmed via accessibility-tree inspection (landmarks, labels, `role="dialog"`, `aria-live` regions — see `test/documentationRegistryAccessibility.test.js`), but actual spoken output, announcement timing, and reading order as a screen reader would present them have never been observed.

**Root cause hypothesis:** Not a defect — an environment/tooling gap. No assistive-technology driver has been available in any validation environment used so far. This is an untested-not-broken situation: the existing structural evidence is a reasonable proxy but is not equivalent to the real thing.

**Proposed remediation:** Execute a genuine screen-reader pass against the authenticated app using a real assistive technology — VoiceOver is likely the most readily available option (built into macOS, and this environment has already been shown to be macOS-based in prior phases) — covering at minimum: page landmark announcement on load, form label announcement for the Category/Lifecycle/Search controls, live-region announcement of "N document records loaded" and loading/error states, and dialog announcement + reading order when a document detail panel opens.

**Files likely affected:** None anticipated unless the screen-reader pass surfaces a genuine semantic defect not already caught by the structural tests — in which case `src/main.js` (markup/ARIA attributes) would be the most likely location, per the pattern of every other accessibility fix in this capability's history (P62-002 was a `src/main.js` change).

**Validation method:** Manual, human-observed or recorded VoiceOver (or equivalent) session against the running dev server, authenticated, covering the checklist above. This is not automatable with the tools available in this environment — it requires a human or a dedicated assistive-technology testing tool that hasn't been available to any phase so far.

**Acceptance criteria:** A recorded or witnessed screen-reader pass confirming: correct landmark/region announcement, correct label announcement for all interactive controls, correct live-region announcement of load/loading/error/empty states, and correct dialog announcement and focus handling when the document detail panel opens and closes.

**Rollback considerations:** None for the validation activity itself. Any resulting code fix would carry the same low-risk profile as prior accessibility fixes in this capability (P62-002 was a small, additive, easily revertible change) — scoped at the time, if needed.

## Cross-Cutting Notes

- None of the three findings in this plan involve data integrity, authorization, or governance — consistent with how Phase 6.5 classified them, and consistent with why they were separated from the (already resolved) P62-001/P62-002 governance findings.
- P64-001 and P62-004 have clear, low-risk, well-scoped remediation paths. P62-003's two sub-items are primarily validation-execution gaps rather than known code defects — the more significant open question for both is *access to the right testing method*, not *what to change in the code*.
- This plan does not commit to a schedule or owner assignment for execution — that remains a Phase 6.6 execution decision, outside the scope of this planning document.

## What This Document Does Not Do

- It does not modify any source, configuration, or test file.
- It does not install or change any dependency, runtime, or tool.
- It does not create a commit, tag, or release.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not itself constitute remediation — it is the plan that would precede it.

## References

- [Phase 6.5 Release Decision Review](COS-MVP-002_Phase_6.5_Release_Decision_Review.md) — source of the "Remediation Before Internal Release" decision this plan responds to
- [Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — origin of the P64-001 finding and the P62-003 live-vs-unverified split
- [Phase 6.2 Validation Record](COS-MVP-002_Phase_6.2_Validation_Record.md) — origin of P62-003 and P62-004

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.6 Remediation Plan: issue summaries, root-cause hypotheses (CSS root cause for P64-001 confirmed directly against source, not inferred), proposed remediation, affected files, validation methods, acceptance criteria, and rollback considerations for P62-003, P62-004, and P64-001 |
