# COS-MVP-002 Phase 6.3 Release Blocker Remediation

**Phase:** 6.3 — Release Blocker Remediation
**Version:** 1.0
**Document owner:** Release Owner, Data Owner, and Quality Owner
**Status:** Remediation Prepared — Not Validated — Not Released
**Risk class:** High
**Capability ID:** COS-MVP-002
**Release status:** Not Released
**Source state:** Uncommitted working-tree changes on local branch `phase-5-release`, staged on top of commit `0a65719` ("Validate COS-MVP-002 Documentation Registry v1.0")
**Last updated:** Added removal of the stale `"Workspace owners can update documents"` RLS policy (see Remediation Implemented and Lifecycle Governance Design Decision below). Still uncommitted.

## Purpose

This record captures the Phase 6.3 remediation prepared against the Phase 6.2 No-Go decision. It documents what was implemented, the governance and security reasoning behind the implementation, and — consistent with this project's evidence standard — what remains unvalidated. A remediation is not recorded as verified without observable, executed evidence. No commit, tag, or release-state change is authorized by this record.

## Phase Objective

Close the release-blocking findings from `COS-MVP-002_Phase_6.2_Validation_Record.md` — specifically the lifecycle-authorization gap (P62-001) and the accessibility focus-restoration defect (P62-002) — with a governed, auditable mechanism, then identify precisely what validation work remains before Phase 6.2's Required Next Actions can be considered satisfied.

## Original Phase 6.2 Blockers

| ID | Severity | Finding | Release effect |
| --- | --- | --- | --- |
| P62-001 | High | `documents.status` constraint validated values but did not enforce the permitted lifecycle transition graph; a workspace Owner could move a document directly from Proposed to Published with no review, approval, version binding, or publication evidence. | Blocking |
| P62-002 | Moderate | Closing the Documentation detail view did not restore focus to the record that opened it. | Blocking for accessibility approval |
| P62-003 | Moderate | Authenticated keyboard, screen-reader speech, and responsive zoom/reflow validation had not been executed against a running candidate. | Blocking for full accessibility approval |
| P62-004 | Moderate | The repository default Node runtime (20.17.0) remained below the pinned Vite minimum, although the approved workspace Node 24 build passed. | Build reproducibility risk |
| P62-005 | High | Production backup/recovery, monitoring/alert receipt, capacity, retention, incident response, and expanded infrastructure controls remained deferred. | Blocking only for future Production release — explicitly out of scope for Internal MVP per the Phase 6.2 record |

## Remediation Implemented

| Blocker | Remediation | Location |
| --- | --- | --- |
| P62-001 | New governed lifecycle tables (`document_workflow_evidence`, `document_approval_evidence`, `document_lifecycle_events`) and a `SECURITY DEFINER` function `transition_document_lifecycle` enforcing a fixed transition graph, verified-provenance binding to the exact current version, and — for publication specifically — mandatory approved COS-WF-001 workflow evidence and explicit approval evidence matched to the current content hash. Direct `UPDATE` on `public.documents` is revoked from `authenticated`; all status changes must go through the function. | `supabase/migrations/20260807160058_cos_mvp_002_lifecycle_governance_v1.sql` |
| P62-001 (supporting) | Query-path index for evidence lookups by document version. | `supabase/migrations/20260807160225_cos_mvp_002_lifecycle_evidence_indexes_v1.sql` |
| P62-001 (client) | `transition()` method added to the document registry service, wrapping the RPC with fail-closed pre-flight validation (required fields, allowed target state, minimum audit-reason length, and mandatory evidence identifiers before publication is attempted). | `src/services/documentRegistryService.js` |
| P62-002 | `detailOriginId` tracked when a document or system record is opened; `closeDetail()` now restores keyboard focus to the originating row after the detail panel closes. | `src/main.js` |
| P62-001, P62-002 (tests) | Unit coverage for the governed transition method and the focus-restoration code path. See Validation Requirements below for what this coverage does and does not prove. | `test/documentRegistryService.test.js`, `test/documentationRegistryAccessibility.test.js` |
| Stale policy cleanup | Dropped the obsolete `"Workspace owners can update documents"` policy on `public.documents` and re-asserted (defensively, idempotently) that `UPDATE` remains revoked from `authenticated`. Closes the open cleanup item this record originally flagged. Does not touch the read (`"Workspace members can read documents"`) or create (`"Workspace owners can create documents"`) policies, and does not grant `UPDATE` back to any role. | `supabase/migrations/20260807161500_cos_mvp_002_remove_stale_document_update_policy_v1.sql` |
| Stale policy cleanup (tests) | Added a guard test asserting the document registry service exposes only `list`, `detail`, `create`, and `transition` — no direct mutation method — plus a regression test confirming read, create, and governed transition all still function. | `test/documentRegistryService.test.js` |

P62-003, P62-004, and P62-005 are **not addressed** by this remediation. P62-005 remains correctly out of scope per the Phase 6.2 record. P62-003 and P62-004 remain open blockers for accessibility and build-reproducibility approval respectively.

## Lifecycle Governance Design Decision

**Direct document mutation is restricted to preserve provenance integrity. Future metadata edits must use governed pathways.**

Rationale:

- A document's `status` is not an independent field — it is a claim about review, approval, and publication history that other systems (and humans) rely on for trust. Allowing direct `UPDATE` access made that claim falsifiable by any workspace Owner or Administrator with a single write, with no requirement that a review, an approval, or even the correct document *version* was involved.
- The remediation collapses all lifecycle mutation to one audited entry point (`transition_document_lifecycle`) that: (1) re-verifies provenance against the exact current version and content hash before allowing any transition, (2) enforces a fixed, explicit state graph rather than accepting arbitrary status values, and (3) requires bound, version-matched evidence records — not just a boolean flag — before a document can reach `published`.
- This is deliberately broader than the two named findings: revoking `UPDATE` on `documents` blocks *all* direct field mutation, not only status changes. No other code path in this service performs a direct `documents` update (confirmed by inspection — `list`, `detail`, and `create` are the only other methods, none of which mutate an existing row), so nothing currently breaks. But this means **any future feature that edits document metadata (title, summary, category, owner, security level, etc.) must be built as its own governed, evidence-producing pathway** — a dedicated function or RPC with its own authorization and audit trail — rather than a direct table write. This constraint is intentional and should be treated as a standing design rule for this table, not a temporary side effect of the P62-001 fix.
- The pre-existing RLS policy `"Workspace owners can update documents"` was **intentionally removed**, not merely left inert. It was already unreachable once `UPDATE` was revoked from `authenticated` — a grant-level revoke takes precedence over a permissive `USING`/`WITH CHECK` clause — but leaving the policy object in the schema was itself a governance risk: a future migration, review, or automated tool inspecting `pg_policies` could see an active-looking `UPDATE` policy on `documents` and reasonably conclude direct mutation was still sanctioned. Removing the object, not just the grant, makes the schema state match the governance decision instead of merely making the decision unreachable in practice. **This is a deliberate confirmation of the governance decision, not an accidental side effect**: lifecycle state, and document mutation generally, must occur only through `public.transition_document_lifecycle`; there is intentionally no direct write path left for any future feature to rediscover.

## Database Security Decisions

- **`SECURITY DEFINER` isolation:** the actual transition logic lives in `creator_os_private.transition_document_lifecycle`, a function in a schema with `usage` revoked from `public`/`anon`/`authenticated`. It is reachable only through a thin `SECURITY INVOKER` wrapper, `public.transition_document_lifecycle`, granted to `authenticated` only. This mirrors the existing `creator_os_private` pattern already used elsewhere in the schema and avoids exposing definer-rights execution directly to client roles.
- **Actor identity is re-checked server-side.** The function raises `42501` if the authenticated JWT's `auth.uid()` does not match the caller-supplied `p_actor_user_id`, so a client cannot attribute a lifecycle event to a different user than the one actually authenticated.
- **Authorization is scoped to active workspace ownership/administration.** The function requires an active membership row with `membership_role in ('owner','administrator')` for the document's workspace before any transition is permitted, independent of whatever RLS allows for read access.
- **Provenance is re-verified per transition**, not assumed from a prior check — the function requires a `document_provenance` row in `trust_state = 'verified'` matching the *current* version's content hash and source commit SHA.
- **Publication has a stricter, doubly-bound evidence requirement:** both an approved COS-WF-001 workflow-evidence row and an approval-evidence row must exist, tied to the same document, the same current version, and — for approval evidence — the same content hash. A workflow evidence record from a superseded version cannot be reused to approve a new one.
- **Append-only audit trail:** `document_lifecycle_events` grants `SELECT` only to `authenticated`; there is no `INSERT` grant, so the only way a row can be created is via the security-definer function. Events cannot be edited or deleted by any authenticated role at the grant layer.
- **Evidence tables are readable workspace-wide but writable only by owners/administrators**, consistent with the existing authorization model used for other Documentation Registry tables in the Phase 6.1 foundation migration.

## Validation Requirements

The following must be executed before this remediation can be considered validated, consistent with the Phase 6.2 record's Required Next Actions:

1. **Live database execution** of the migration against the actual Supabase project, confirming the function, tables, indexes, grants, and policies are created exactly as written (no syntax, dependency, or ordering failures).
2. **Exhaustive transition-graph denial testing** executed against the live RPC (not mocks) — every disallowed `(from, to)` pair from the state graph must be confirmed rejected by the database itself, not only by the JavaScript unit tests added in this phase.
3. **Live authorization denial testing** — confirm a non-owner/non-administrator member is rejected, confirm an actor-identity mismatch is rejected, and confirm an unverified or mismatched provenance record is rejected, all against the running database.
4. **Live publication-evidence testing** — confirm that publishing without evidence, with evidence from the wrong version, or with evidence whose content hash does not match the current document is rejected by the database, not only by the client's pre-flight check.
5. **Regression of the full existing automated suite** plus the new tests, and a production build, per the Phase 6.2 evidence table.
6. **Accessibility remediation validation (P62-002)** — authenticated runtime confirmation that focus actually returns to the originating row after close, ideally with a browser-driven or assistive-technology check, not only the static code-pattern assertions added in this phase.
7. **P62-003 and P62-004 remain unaddressed** and must be separately planned; they are not in scope for this remediation and should not be treated as closed.
8. ~~RLS policy cleanup decision~~ — **Resolved as a decision.** The `"Workspace owners can update documents"` policy is dropped in `20260807161500_cos_mvp_002_remove_stale_document_update_policy_v1.sql`. The decision itself does not require live validation to be a decision, but the migration's *execution* does — see item 9.
9. **Live verification of the policy-removal migration** — none of the following has been executed against a live database, because no local database tooling (`supabase`, `psql`, `docker`) is available in this environment. This is a genuine gap, not a formality:
   - Confirm the migration applies cleanly and `"Workspace owners can update documents"` no longer appears in `pg_policies` for `public.documents`.
   - Confirm an authenticated non-owner and an authenticated owner both still receive `42501`/permission-denied on any direct `UPDATE` attempt against `public.documents` (i.e., removing the policy did not somehow widen access — it should not, since the policy was already the only thing that could have permitted an update, and the grant is independently revoked, but this must be observed, not assumed).
   - Confirm `public.transition_document_lifecycle` still succeeds for a valid actor/transition/evidence combination after the policy drop (proves lifecycle governance was not accidentally impacted by touching `documents`' policy set).
   - Confirm `"Workspace members can read documents"` and `"Workspace owners can create documents"` are unchanged and read/create behavior for members and non-members is identical to Phase 6.2 evidence.
   - Confirm workspace membership/role authorization (owner, administrator, plain member, non-member) behaves identically to Phase 6.2 evidence for both read and the governed transition RPC.

No item above has been executed as part of this phase. This document records preparation, design rationale, and one resolved governance decision. It does not record executed verification.

## Acceptance Criteria

Phase 6.3 may be considered complete, and a Go/No-Go release decision may be sought, only when all of the following hold:

- [ ] Migrations applied successfully to the live Supabase project with no manual intervention required.
- [ ] Every edge in the transition graph (draft, proposed, in_review, changes_requested, approved, published, superseded, deprecated, retired, archived, rejected, quarantined) has at least one executed live-database test confirming it is allowed, and at least one confirming a disallowed transition from the same state is rejected.
- [ ] Publication is confirmed blocked without evidence, with mismatched-version evidence, and with mismatched content-hash evidence, via live RPC calls.
- [ ] Actor-identity mismatch, inactive/insufficient workspace role, and unverified provenance are each confirmed rejected via live RPC calls.
- [ ] Focus restoration on detail close is confirmed by an executed runtime check, not only static assertion.
- [ ] The full automated test suite (existing baseline plus new tests) passes, and a production build succeeds.
- [x] A decision is recorded on the stale `"Workspace owners can update documents"` policy — **removed**, per `20260807161500_cos_mvp_002_remove_stale_document_update_policy_v1.sql`. Live application and post-drop behavioral verification (item 9 above) remain outstanding.
- [ ] P62-003 and P62-004 are either resolved or explicitly re-scoped with owner sign-off as separate, tracked work.
- [ ] A Phase 6.3 Validation Record (parallel in structure to `COS-MVP-002_Phase_6.2_Validation_Record.md`) is produced from executed evidence before any release decision is made.

Until every item above is satisfied, this remains **Not Released**, and no tag, release record, or released-state change is authorized.

## References

- [Phase 6.2 Validation Record](COS-MVP-002_Phase_6.2_Validation_Record.md)
- [Phase 6.2 Validation Scenarios](COS-MVP-002_Phase_6.2_Validation_Scenarios.md)
- [Phase 6.1 Implementation Evidence](COS-MVP-002_Phase_6.1_Implementation_Evidence.md)
- [Documentation Workflows](COS-MVP-002_Documentation_Workflows.md)
- [Migration Specification](../05_Database/COS-MVP-002_Documentation_Registry_Migration_Specification.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 6.3 remediation record: implemented changes, design rationale, and outstanding validation requirements captured prior to commit |
| 1.1 | Recorded removal of the stale `"Workspace owners can update documents"` policy as an intentional governance confirmation, added the corresponding migration and tests to Remediation Implemented, resolved Validation Requirements item 8 as a decision while adding item 9 for its outstanding live verification, and updated Acceptance Criteria accordingly |
