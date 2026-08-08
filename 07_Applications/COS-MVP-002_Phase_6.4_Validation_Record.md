# COS-MVP-002 Phase 6.4 Validation Record

**Phase:** 6.4 — Documentation Registry Validation Execution
**Version:** 2.0
**Document owner:** Release Owner, Data Owner, and Quality Owner
**Status:** Database Governance Validated Live — Accessibility Partially Validated — Not Released
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release status:** Not Released
**Source state:** Executed against `main` at commit `55d5faf` (published Phase 6.3 remediation), local working tree on `phase-5-release`, live database `ygcldesxjwotrjarvvoh` ("Creator OS Project")

## Purpose

This is the authoritative Phase 6.4 validation-execution record for the Documentation Registry lifecycle-governance remediation. It records what was actually executed with observable evidence, what could not be executed and exactly why, and a Go/No-Go/Conditional recommendation. Consistent with this project's standard (see Phase 6.2 and 6.3), nothing here is recorded as validated without direct evidence, and no gap is smoothed over to make the outcome look more complete than it is.

**Revision note (v2.0):** version 1.0 of this record, written earlier in this phase, stated that live database validation was entirely blocked — that was accurate at the time it was written, based on every CLI/API/dashboard access path available in the working environment failing. Partway through the phase, a Supabase Management API connector (`mcp__5fcff269...`, project-scoped) became available and was used directly to complete the database validation this record originally reported as impossible. Section 1 below is rewritten accordingly, with the actual method used stated precisely — this record does not adopt any unverified claim about *how* that access was independently established (e.g. a specific local CLI/dashboard login flow); it reports only what was directly observed and executed through the tool that was actually used, including independently confirming it targets the correct live project before relying on it.

## Scope Requested vs. Scope Achievable

Four validation areas were requested: (1) live Supabase migration application and database behavior, (2) authenticated browser accessibility validation, (3) Node runtime alignment, (4) this record.

| Area | Requested | Achieved |
| --- | --- | --- |
| Apply migrations | Yes | **Yes — all 10 migrations confirmed applied live, including one previously missing** |
| Live DB behavior (transitions, evidence, auth, provenance, RLS) | Yes | **Yes — 10 live test cases executed directly against the production database, all non-destructive** |
| Browser accessibility | Yes | **Partially — keyboard navigation, focus order, focus restoration, and Escape behavior genuinely tested live; keyboard *activation* and screen-reader speech output were not (unchanged from v1.0, see Section 2)** |
| Node runtime alignment | Resolve or document | **Documented, not resolved (unchanged from v1.0, see Section 3)** |

## 1. Supabase Migration Application and Live Database Validation

**Result: Executed live against the production database, with direct evidence for every requested category. All test mutations were performed inside `BEGIN`/`ROLLBACK` blocks and independently confirmed to leave zero residue.**

### CLI authentication limitation (environment constraint, documented as requested)

The `supabase` CLI was not usable in this environment: it is not installed globally, and invoking it via `npx supabase projects list` returns `LegacyPlatformAuthRequiredError` — the CLI's own login/link flow requires an access token or `supabase login` session that was not obtainable through this environment's non-interactive shell. This is recorded as an environment constraint, not a database-access blocker: it explains why `supabase db push` specifically could not be used, not that live database access was unavailable by every route. No token was requested or supplied to work around it.

### Actual method used

A Supabase Management API connector became available as an MCP tool mid-phase (tools prefixed `mcp__5fcff269-5401-45d0-a821-c06fc1a6cb14__...`, providing `execute_sql`, `apply_migration`, `list_migrations`, `list_projects`, `get_advisors`, etc.). Before relying on it, its target was independently verified rather than assumed:

- `list_projects` returned exactly one project: `ygcldesxjwotrjarvvoh`, name "Creator OS Project", region `us-east-2`, status `ACTIVE_HEALTHY` — matching the project referenced throughout this repository's Supabase documentation and this record's own `.env.local` inspection in v1.0.

This is the mechanism actually used for everything in this section. It is a live Management-API path against the real production database — functionally equivalent in effect to CLI or dashboard access, since it reaches the same database — but it is reported here precisely as what it is, not conflated with any other access path.

### Migration application

`list_migrations` was called before any change, showing 9 migrations already applied — including, unexpectedly, two of the three Phase 6.3 migrations (`cos_mvp_002_lifecycle_governance_v1` and `cos_mvp_002_lifecycle_evidence_indexes_v1`) that v1.0 of this record had stated were unapplied. That statement was correct given what was verifiable at the time it was written; it is superseded by this direct evidence. The third migration, `cos_mvp_002_remove_stale_document_update_policy_v1`, was confirmed genuinely missing, and was applied directly via `apply_migration`. `list_migrations` was re-run afterward and now shows all 10 migrations, including the newly applied one (`20260808012630_cos_mvp_002_remove_stale_document_update_policy_v1`).

`get_advisors(type: "security")` was run as an independent automated cross-check after applying: it returned no findings for `documents`, `document_workflow_evidence`, `document_approval_evidence`, or `document_lifecycle_events` — the only findings were pre-existing, unrelated to COS-MVP-002 (`RLS Enabled No Policy` on `agents`/`decisions`/`systems`/`tools`/`versions`/`workflows`, and `Leaked Password Protection Disabled`, both inherited from COS-MVP-001/core-foundation scope).

### Live test matrix

Ten test cases were executed directly against `transition_document_lifecycle` and the underlying tables, using `SET LOCAL ROLE` and `SET LOCAL request.jwt.claims` to genuinely assume the Postgres roles and JWT identity the RLS policies and function actually check against (not superuser/bypass access). Every mutating test ran inside an explicit transaction ended with `ROLLBACK`; a final query confirmed zero leaked fixtures (test users, memberships, evidence rows) and both touched documents at their original, untouched status.

| # | Category requested | Test | Result |
| --- | --- | --- | --- |
| A | Lifecycle transition success path | `proposed → in_review` as the workspace owner, with verified provenance | **Pass** — status updated to `in_review` inside the transaction; confirmed reverted to `proposed` after rollback |
| B | Prohibited transitions denied | `proposed → published` (skipping review/approval) | **Pass — denied**: `Lifecycle transition from proposed to published is not allowed` |
| C | Missing evidence denied | `approved → published` with no workflow/approval evidence supplied | **Pass — denied**: `Publication requires workflow and approval evidence` |
| D | Incorrect evidence denied | `approved → published` with fabricated, non-existent evidence UUIDs | **Pass — denied**: `Approved COS-WF-001 workflow evidence for the current version is required` |
| E | Lifecycle transition success path (full contract) | `approved → published` with real, correctly-matched workflow + approval evidence rows (approved decision, matching version, matching content hash) inserted in the same transaction | **Pass** — status updated to `published`; confirms the complete positive publication contract, not just the negative paths |
| F | Authorization boundary | Actor identity mismatch — `p_actor_user_id` differs from the session's actual authenticated `auth.uid()` | **Pass — denied**: `42501: Lifecycle actor does not match the authenticated identity` |
| G | Authorization boundary | A real, active workspace member with `viewer` role (not owner/administrator) attempting a transition | **Pass — denied**: `42501: Active workspace lifecycle authority is required` |
| H | RLS behavior | Read visibility compared across three real identities: active `viewer` member, authenticated non-member (no membership row), and `anon` | **Pass**: viewer → 3 documents visible; non-member → 0 rows (RLS filter); anon → `permission denied for table documents` (no grant at all) — three distinct, correctly layered enforcement outcomes |
| I | RLS behavior (the critical P62-001 confirmation) | The workspace **owner** attempting a direct `UPDATE public.documents SET status = 'published' ...`, bypassing the governed function entirely | **Pass — denied**: `42501: permission denied for table documents` — live proof that the original P62-001 exploit (an owner directly overwriting status) is closed, and that today's stale-policy-removal migration is genuinely effective |
| J | Provenance enforcement | Transition attempted with a fabricated, non-existent `provenance_id` | **Pass — denied**: `Verified provenance for the current version is required` |

All ten tests passed against their expected outcome. Test G required creating temporary `viewer`-role and non-member fixtures (real `auth.users` rows plus one real `creator_os_workspace_memberships` row) inside the same rolled-back transaction — a genuine active membership was needed because Postgres role/claim spoofing alone doesn't exist as a real "insufficient role" without a corresponding real row for the function's own membership query to find and reject.

### Post-test integrity check

```
leaked_test_users: 0
leaked_memberships: 0
leaked_workflow_evidence: 0
leaked_approval_evidence: 0
doc2_status: approved   (unchanged from before testing)
doc3_status: proposed   (unchanged from before testing)
```

Nothing from this validation pass persists in the live database beyond the one legitimate migration application (the stale-policy drop, which was the intended, real, permanent change).

This closes the database-validation gap that Phase 6.2 (Required Next Actions 1–4) and Phase 6.3 (Validation Requirements 1–4, 9) left open, and directly supersedes the "genuinely untestable" conclusion in v1.0 of this record.

## 2. Authenticated Browser Accessibility Validation

**Result: Genuinely executed where a live authenticated session and trusted browser events made it possible. Two items could not be executed, for stated reasons.**

A dev server was already running (`npm run dev`, port 5173) and the open browser tab held a live, already-authenticated Supabase session (visible via a working "Sign out" control and three real document records loaded from the live database) — this session was not created by this validation pass; it pre-existed in the browser context. All evidence below is from real interaction with this live session, not simulated.

### Keyboard navigation and focus order — Pass

Tab order was walked one keypress at a time, reading `document.activeElement` after each real, trusted `Tab` keydown (not inferred from DOM order):

1. Skip-to-registry link
2. "Documentation" view tab
3. "Systems" view tab
4. "Sign out"
5. "Refresh"
6. "New document"
7. Category filter (select)
8. Lifecycle filter (select)
9. Search field
10. "Apply" (filter submit)
11. First document row (`data-document-id="10000000-0000-4000-8000-000000000001"`)

Order matches visual/reading order at every step. Every focused element in the sample carried a visible focus outline (`outlineStyle: "solid"`, confirmed via computed style, not assumed).

### Detail close focus restoration (P62-002) — Pass, confirmed live

This is the first live-runtime confirmation of the P62-002 fix (previously validated only by static code assertion in Phase 6.3). The document detail panel was opened via a real mouse click on the first document row, then closed via a real, trusted `Escape` keydown (`isTrusted: true`, confirmed by an injected `keydown` probe). After close:

- `document.querySelector('[data-action="close-detail"]')` returned null (panel genuinely closed).
- `document.activeElement` was the same `<button>` with `data-document-id="10000000-0000-4000-8000-000000000001"` that originally opened the panel.

Focus restoration to the originating record is confirmed working, not merely present in source.

### Escape-key behavior — Pass

The same trusted `Escape` keydown above closed the open detail panel, matching the documented behavior (`document.addEventListener('keydown', event => { if (event.key === 'Escape' ...) closeDetail(); })`).

### Keyboard activation of document rows (Enter / Space) — Not conclusively tested; tooling limitation identified, not an app defect

Pressing `Return` and `Space` (via the browser-automation tool's synthetic key dispatch) while a document-row `<button>` was focused did **not** open the detail panel. This was investigated rather than accepted at face value, because native `<button>` elements activate on Enter/Space via browser-level default action independent of application JavaScript — a real defect here would be unusual and worth escalating.

A `keydown` probe was attached to confirm what was actually happening:

- The synthetic `Escape` keydown used moments earlier was `isTrusted: true` and worked correctly (see above).
- The synthetic `Return` keydown was also `isTrusted: true` and reached the correct focused `<button>` target — but its `event.key` value was an **empty string**, not `"Enter"`.
- A direct, real mouse click on the identical button worked immediately and opened the detail panel correctly, with the live Supabase-backed detail data loading as expected.

This isolates the cause to a malformed key identifier in this automation tool's synthetic key dispatch for `Return`/`Space`, not to the application. It is recorded as **not conclusively tested** rather than passed, because a tooling artifact is not the same as a confirmed-working keyboard interaction. **Recommended remediation:** re-verify Enter/Space activation on the document-row buttons using real hardware or a different automation driver before treating this as closed.

### Screen reader semantics — Partial (structural only)

The accessibility tree was inspected directly (not the visual DOM) and shows correct landmark and semantic structure: `banner`, `navigation "MVP capabilities"`, `main`, `complementary "Documentation summary"`, `contentinfo`, a working skip link, labeled form controls (`Category`, `Lifecycle`, `Search`), `role="dialog"` with `aria-labelledby`/`aria-describedby` on the detail panel, and `role="status"`/`aria-live="polite"` regions for load state and form status messages.

This confirms the semantic *structure* a screen reader would consume is correct. It does **not** confirm actual spoken output, reading order as announced by an assistive technology, or behavior with a real screen reader (VoiceOver, NVDA, JAWS) — no such tool is available in this environment to drive and capture. This remains the same gap Phase 6.2 recorded as P62-003 (item 2 of that finding); it is not resolved by this phase.

### Zoom / reflow behavior — Fail at the WCAG 1.4.10 reference width

Tested at the WCAG Success Criterion 1.4.10 reflow reference width (320 CSS px, equivalent to 400% zoom on a 1280px viewport):

- `document.documentElement.scrollWidth` = 375, `clientWidth` = 320 — a genuine 55px horizontal overflow, not a rounding artifact.
- Screenshot evidence shows the cause directly: in the Documentation Registry panel heading, the "Refresh" and "New document" buttons sit in a row (`.panel-heading .actions`) that does not wrap at this width; "New document" is clipped and extends past the viewport edge.

At 375×812 (a standard mobile viewport, not the 320px reflow reference), the same overflow was negligible (2px) and the page was otherwise fully usable in a single responsive column. **This is a new, previously undocumented finding** — it was not raised in Phase 6.2 or 6.3, which focused on the detail-panel focus defect (P62-002) rather than reflow. It is a genuine WCAG 1.4.10 failure and should be tracked as its own finding, not folded into P62-003.

### Narrow viewport behavior — Pass, with the same reflow caveat

At 375×812, the layout is single-column, legible, and functional — header, tabs, summary panel, and registry panel all render correctly with no loss of content or functionality. The 320px-width overflow above would presumably also affect any viewport at or below that width; it was not re-tested at additional widths given the cause is already isolated.

## 3. Node Runtime Alignment (P62-004) — Documented, Not Resolved

The environment's active Node is `20.17.0` (resolved from `/opt/miniconda3/bin/node`), below both the project's `.nvmrc` pin (`24`) and `package.json`'s stated engine minimum (`>=20.19.0`) and Vite 7's own minimum (`20.19+` or `22.12+`). Vite prints this as a non-fatal warning on every dev-server start; the app still runs.

No Node version manager (`nvm`, `fnm`, `asdf`) is present to switch versions, and no compatible Node binary is already installed elsewhere on the system. Homebrew **is** available (`/opt/homebrew/bin/brew`, v6.0.15) and could install a matching Node version (e.g. `brew install node@24`, matching `.nvmrc`). This was **not** performed as part of this validation pass — installing a new toolchain version system-wide is a real, environment-affecting change, and doing it silently as a side effect of a validation task did not seem like the right call to make unilaterally. It is documented here as a concrete, ready-to-execute fix, pending an explicit decision to proceed.

**Decision recorded:** unresolved. Recommended path: `brew install node@24`, then confirm via `.nvmrc` that the dev shell picks it up (or configure a version manager), then re-run the full test suite and dev-server start to confirm the warning clears.

## Consolidated Findings Register

| ID | Severity | Finding | Status this phase |
| --- | --- | --- | --- |
| P62-001 (live enforcement) | High | Lifecycle transition graph, evidence requirements, and authorization boundaries were completely unverified against a live database. | **Resolved and confirmed live** — 10/10 test cases passed live in Section 1, including the specific direct-`UPDATE`-bypass exploit this finding originally described |
| P62-002 | Moderate | Detail-close focus restoration. | **Resolved and confirmed live** (previously only static-asserted) |
| P62-003 | Moderate | Authenticated keyboard, screen-reader, zoom/reflow, narrow-viewport validation not executed. | **Partially resolved**: keyboard navigation, focus order, and Escape-close now have live evidence. Screen-reader spoken-output validation remains unexecuted. Keyboard *activation* (Enter/Space) is inconclusive due to a tooling limitation, not re-validated. |
| P62-004 | Moderate | Node runtime below Vite's minimum. | **Documented with a concrete fix path; not executed** |
| P64-001 (new) | Moderate | WCAG 1.4.10 reflow failure at 320px width — panel-heading action buttons overflow instead of wrapping. | **New finding, open** |
| P62-005 | High | Production backup/recovery/monitoring/capacity/retention controls deferred. | Correctly out of scope for Internal MVP, unchanged |

## Release Readiness Decision

**Conditional — recommend Release Owner/Quality Owner review, not an unconditional Go.** The release-critical item from Phase 6.2 and 6.3 — live verification that the governed lifecycle transition function actually enforces what its source code claims, including that the original P62-001 direct-mutation exploit is closed — is now **resolved with direct, executed evidence** (Section 1, 10/10 tests passed against the live production database). This is the single most severe blocker this capability has carried across three validation phases, and it is closed.

What remains open is real but of a different character: screen-reader spoken-output validation has never been executed in any phase (P62-003, partial); keyboard activation via Enter/Space could not be conclusively re-verified due to an identified automation-tooling limitation, not an app defect; a new WCAG 1.4.10 reflow defect was found (P64-001); and the Node runtime misalignment remains undecided (P62-004, historically classified as a build-reproducibility risk rather than a release blocker, not a security or data-integrity concern). None of the open items involve data integrity, authorization, or governance — the categories this capability's release-blocking history has actually been about.

This record does not declare Go, mark COS-MVP-002 released, or authorize a tag — those decisions belong to the Release Owner and Quality Owner per this project's ownership model, and the remaining accessibility items are real enough that they deserve an explicit decision, not a silent pass. But the database-governance blocker that justified two consecutive No-Go decisions is closed, and that should be represented accurately rather than folded into an undifferentiated "still not ready."

No tag, official release record, production release record, or released-state update is authorized by this record.

## Required Next Actions

1. ~~Apply pending migrations and execute live-database validation~~ — **Done this phase**, see Section 1.
2. Fix the P64-001 reflow defect: make `.panel-heading .actions` wrap (or otherwise stay within viewport) at narrow widths, then re-verify at 320px.
3. Re-attempt keyboard activation (Enter/Space) of document-row buttons using real hardware or a different automation driver, to close the gap this phase's tooling could not.
4. Execute genuine screen-reader spoken-output validation (VoiceOver, NVDA, or JAWS) against the authenticated app.
5. Decide on and execute the Node runtime fix (`brew install node@24` or equivalent), then re-run the full suite and dev build to confirm the version warning clears.
6. Re-run the full automated test suite and production build to confirm no regressions from the newly applied migration.
7. Release Owner and Quality Owner to review this record and make an explicit Go/No-Go/Conditional-Go decision now that the database-governance blocker is closed.

## References

- [Phase 6.3 Release Blocker Remediation](COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md)
- [Phase 6.2 Validation Record](COS-MVP-002_Phase_6.2_Validation_Record.md)
- [Phase 6.2 Validation Scenarios](COS-MVP-002_Phase_6.2_Validation_Scenarios.md)
- [AI Collaboration Handoff Context](../00_Governance/AI_Collaboration_Handoff_Context.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.4 validation-execution record: live browser accessibility evidence, database-access blocker confirmation, Node runtime decision, and No-Go determination |
| 2.0 | Superseded the database-access blocker: a Supabase Management API connector became available mid-phase, independently verified against the correct project, and used to apply the one remaining migration and execute a 10-test live validation matrix (transitions, evidence, authorization, provenance, RLS) directly against production, all non-destructive and confirmed leak-free. Findings register, release decision, and next actions updated accordingly; CLI authentication limitation documented as an environment constraint per explicit instruction. |
