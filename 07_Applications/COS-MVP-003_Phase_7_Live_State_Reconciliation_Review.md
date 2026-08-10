# COS-MVP-003 Phase 7 Live-State Reconciliation Review

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner and Data Owner
**Status:** Evidence-Gathering Plan — No Verification Executed
**Risk class:** Moderate
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning artifact, no capability exists to release

## Purpose

`COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md` identified live-state reconciliation of the already-provisioned `agents`/`tools`/`workflows` tables as a safe workstream that can proceed independently of both blocked Phase 7 primitives. This document defines that reconciliation's evidence-gathering plan and current-state verification requirements. **It is a review/planning artifact only.** It does not query, modify, or verify anything against the live database itself — it defines what verification is needed and how it should be conducted, for a future session with live database access to execute. No migration is created, no SQL is written, no source file is modified, no capability is claimed to exist, and no release status changes.

## Maintaining the Distinction

- **Evidence before execution.** This document names what evidence would resolve each open question — it does not supply that evidence itself. Every claim below traces to a specific, previously-recorded observation, dated and sourced, not a fresh live check performed now.
- **Documented ≠ implemented.** A field list in `Schema_Specification.md` is a specification, not a table. This document treats the two as categorically different throughout.
- **Provisioned ≠ operational.** A table that exists in the live database with RLS enabled but no policies attached is neither absent nor usable — it occupies a third state this document treats as distinct from both, per Section 5's classification framework.

## 1. Objective

### Why live-state reconciliation is needed

Every Phase 7 planning document produced so far — the Roadmap, the Implementation Map, both completed planning chains — has repeated the same caveat without ever resolving it: six tables (`agents`, `decisions`, `systems`, `tools`, `versions`, `workflows`) were observed to already exist in the live production database, with RLS enabled but no policies attached, per a live `get_advisors(type: "security")` scan run during Phase 6.4's COS-MVP-002 validation. That observation is now over a full planning cycle old and has been carried forward as "previously observed, not re-verified" in every document that has cited it since, including this repository's own Roadmap (Section 1) and Implementation Map (Section 1, per-capability entries). A capability cannot be planned safely against an assumption about live state that has never been re-checked — this reconciliation exists to close that gap before it becomes load-bearing for an actual implementation decision, consistent with the "Evidence before execution" principle every other Phase 7 document in this chain has held to.

## 2. Known Documented State

Stated exactly as previously recorded, with its source and date of observation — not re-verified here.

### Agents tables

- `Schema_Specification.md` specifies `agents` and `agent_versions` table contracts (full field lists) — a specification, never migrated into application code or `supabase/migrations/`.
- A table named `agents` was independently observed to already exist in the live production database as of the Phase 6.4 validation session (`COS-MVP-002_Phase_6.4_Validation_Record.md`), with **RLS Enabled No Policy** — a live security-advisor finding, not a design claim.

### Tools tables

- `Schema_Specification.md` specifies `tools`, `tool_permissions`, `integrations`, and `credential_references` table contracts — specifications only.
- A table named `tools` was independently observed live, in the same Phase 6.4 scan, with the same **RLS Enabled No Policy** finding.

### Workflows tables

- `Schema_Specification.md` specifies `workflows`, `workflow_versions`, `tasks`, `runs`, `run_steps` contracts — specifications only.
- A table named `workflows` was independently observed live, in the same scan, with the same finding.
- The same scan additionally observed **`decisions`, `systems`, and `versions`** with the identical finding — three tables not named in the Phase 7 planning chains at all, and not accounted for by any capability's own schema specification reviewed so far. Their origin and purpose are not established by any document this review could locate.

### RLS/security status

The exact, verbatim finding, as recorded in `COS-MVP-002_Phase_6.4_Validation_Record.md`: **"RLS Enabled No Policy" on `agents`/`decisions`/`systems`/`tools`/`versions`/`workflows`**, alongside a separate, unrelated finding — **"Leaked Password Protection Disabled"** — both explicitly noted at the time as "pre-existing, unrelated to COS-MVP-002... inherited from COS-MVP-001/core-foundation scope." Neither finding has been remediated or re-scanned as of this review; both are carried forward here exactly as last observed, not updated.

### Implementation vs. provisioning distinction

"RLS Enabled No Policy" is a specific, meaningful state: RLS is turned on for the table (meaning the default-deny posture applies), but no policy has been written granting any access path — the practical effect, per Postgres RLS semantics, is that the table is **provisioned but inert and inaccessible** to any role subject to RLS, not usable in either direction. This is categorically different from "implemented" (a table with working policies, grants, and a governed-mutation function, like `documents`) and categorically different from "does not exist" (a specification with no live table at all, like `incidents`/`run_steps` as of this review). This three-way distinction is the basis for Section 5's classification framework.

## 3. Verification Questions

What evidence would be needed to resolve each open question — none of it gathered by this document.

**What exists:**
- Does a live table named `agents`, `tools`, `workflows`, `decisions`, `systems`, and `versions` still exist in the production database, unchanged from the Phase 6.4 observation? (A re-run of `list_migrations` and a direct schema inspection, not assumed from the prior scan's age.)
- Have any of these tables been altered, dropped, or had policies added since the Phase 6.4 observation, by any process outside this planning chain?

**What is active:**
- Does any of these six tables contain any row data, or are they empty? (Row presence would indicate some process has been writing to them despite the missing RLS policies — a materially different and more urgent finding than an empty, purely provisioned table.)
- Is any application code, migration, or external process currently reading from or writing to any of these tables? (A search of `src/` and `supabase/migrations/` for references, plus a check of Supabase's own query/access logs if available.)

**What is secured:**
- Does a fresh `get_advisors(type: "security")` scan still show "RLS Enabled No Policy" on all six tables, or has that finding changed (improved or worsened) since Phase 6.4?
- Does "Leaked Password Protection Disabled" remain an open finding, and is it in scope for this reconciliation or a separate concern? (This review treats it as adjacent, not primary — see Section 8.)

**What is unused:**
- Do `decisions`, `systems`, and `versions` — the three tables with no corresponding entry in any Phase 7 capability's schema specification reviewed so far — correspond to any capability this repository has ever specified, under a different name, or are they genuinely orphaned? (A search of every `05_Database/`, `03_AI_Workforce/`, `04_Tool_Registry/`, and `06_Automations/` document for any reference to these exact names.)

## 4. Relationship to Other Capabilities

- **Agent Registry.** The live `agents` table's actual state directly affects that registry's eventual Implementation Plan — per `COS_Architecture_Implementation_Map.md`'s own entry, "reconciliation of the live-but-unpoliced `agents` table with whatever this work actually creates" is already named as required work. This reconciliation review is a prerequisite input to that future planning chain, not a replacement for it.
- **Tool Registry.** Same relationship for the live `tools` table, plus the additional question of whether any of the three unaccounted-for tables (`decisions`, `systems`, `versions`) bear on the Tool Registry's own scope — not established by this review, only flagged as a question.
- **Workflow Engine.** Same relationship for the live `workflows` table — a Phase 8 capability, but one whose eventual planning chain would inherit whatever this reconciliation establishes about the live table's current state, the same way Execution Safety Foundations' own Schema Design Review generalized the already-specified `runs`/`run_steps` contracts.
- **Shared Approval/Evidence Primitive.** No direct relationship — none of the six tables under review here is named in that primitive's own schema (`governed_subjects`, `approval_workflow_evidence`, `approval_decision_evidence`, `approval_lifecycle_events`), and this reconciliation does not depend on that primitive's ratification status, consistent with the independence finding already established in `COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md` Section 3.

## 5. Findings Classification Framework

A framework for classifying each table once verification (Section 3) is actually performed — not applied to any table by this document, since no verification has been executed:

- **Implemented** — a live table with working RLS policies, appropriate grants, and (where applicable) a governed-mutation function, demonstrably in active use by application code. Only `documents` and its supporting evidence tables currently meet this bar, per Phase 6.4's live-validated evidence; none of the six tables under review here has been shown to meet it.
- **Provisioned only** — a live table that exists in the database, with RLS enabled but no policy (the current documented state of all six tables per Section 2), inert and inaccessible, not read from or written to by any known process. This is the default classification these six tables carry until re-verified otherwise.
- **Designed only** — a capability specified in `Schema_Specification.md` or elsewhere with no corresponding live table at all. `incidents`, `run_steps`, `approval_workflow_evidence`, and every other Phase 7 entity proposed so far fall here, distinct from the six tables this review concerns, which are provisioned, not merely designed.
- **Unknown** — a table or finding this review cannot classify without the verification named in Section 3. `decisions`, `systems`, and `versions` currently fall here specifically with respect to *purpose* (their provisioning status matches "provisioned only," but their relationship to any specified capability is unknown), a distinction Section 3's last verification question exists to resolve.

## 6. Risks of Proceeding Without Verification

- **Planning a registry against a stale assumption about its own live table.** If the Agent Registry's eventual Implementation Plan assumes the live `agents` table is still empty and unpoliced without re-checking, and it has in fact accumulated data or partial policy coverage in the interim, that plan's own migration sequencing (create vs. reconcile) would be wrong from its first document.
- **Treating "provisioned but inert" as equivalent to "safe to ignore."** A table with RLS enabled but no policy is not a security risk in the ordinary sense (nothing can read or write it), but it is also not neutral — if a future migration for the Agent or Tool Registry assumes it can simply add policies to this table without confirming no other process has quietly begun depending on its current inert state, that assumption itself becomes a risk.
- **Leaving three unaccounted-for tables (`decisions`, `systems`, `versions`) permanently unexplained.** Every other table in this repository's live database traces to a specific capability's specification. Three that do not is either a naming mismatch this review's verification questions could resolve cheaply, or evidence of provisioning from a source outside this repository's own planning history — either of which is worth knowing before it surfaces as a surprise during some future migration.
- **Deferring this reconciliation indefinitely on the theory that it is low-priority.** The Roadmap has now flagged this exact gap twice (v1.1 and v1.2 change history) without it ever being acted on — a third deferral would extend a pattern this review exists specifically to break.

## 7. Recommended Next Action

**Execute the verification questions in Section 3 directly against the live database**, using the same live-query methodology already proven in Phase 6.4 (`list_migrations`, `get_advisors`, direct schema inspection with `SET LOCAL ROLE` where row-level access needs to be checked) — not a fresh design exercise, since the method is already established, only its application to these six specific tables is outstanding. The output of that verification should be a follow-up evidence record (mirroring the Phase 6.4 Validation Record's own format) that classifies each of the six tables per Section 5's framework with actual evidence, superseding this document's "not yet verified" status for each item in Section 2.

This is offered as a recommendation for the accountable owners' consideration, consistent with every other sequencing and readiness document in this Phase 7 chain — it does not authorize itself to be executed, and no live query is performed by this document.

## 8. Explicit Out of Scope

- **Any live database query, read or write** — this document defines what verification is needed; it does not perform any of it.
- **Any migration, SQL, or schema change** to any of the six tables — reconciliation may inform a future migration once the Agent Registry or Tool Registry planning chains begin, but no such migration is proposed, sequenced, or created here.
- **Remediation of "Leaked Password Protection Disabled"** — noted in Section 2 as an adjacent, separately-tracked finding from the same Phase 6.4 scan, not part of this reconciliation's scope, which concerns the six named tables' provisioning state specifically.
- **Any Agent Registry, Tool Registry, or Workflow Engine planning chain** — this document is a prerequisite input to those future chains, not a substitute for any of them.
- **Any change to the Shared Approval/Evidence Primitive's or Execution Safety Foundations' status** — both remain exactly as their own Decision Records and Readiness Reviews state, unaffected by this document.

## What This Document Does Not Do

- It does not query, read, or modify the live database in any way.
- It does not create any database migration or write any SQL.
- It does not modify any application source file.
- It does not claim any table's current state is verified — every classification in Section 2 is carried forward from a prior, dated observation, explicitly marked as not re-checked.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not authorize verification to be executed — it is a plan for that verification, not the verification itself.

## References

- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the origin of every live-state observation cited in Section 2
- [COS-MVP-003 Phase 7 Continuation and Sequencing Review](COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md) — identified this reconciliation as the safe parallel workstream this document plans
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md) — the two prior, unactioned flags of this same gap (Section 1's "important caveat," change history v1.1/v1.2)
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md) — per-capability reconciliation requirements for the Agent Registry and Tool Registry entries
- [Schema Specification](../05_Database/Schema_Specification.md) — the specification baseline Section 2 and Section 5 compare live state against

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial live-state reconciliation review: objective grounded in a gap the Roadmap has flagged twice without action; known documented state for `agents`/`tools`/`workflows` and three unaccounted-for tables (`decisions`/`systems`/`versions`), sourced exactly to the Phase 6.4 security-advisor scan with an explicit implementation-vs-provisioning distinction; verification questions across what-exists/what's-active/what's-secured/what's-unused; relationship to the Agent Registry, Tool Registry, Workflow Engine, and Shared Approval/Evidence Primitive; a four-state findings classification framework (implemented/provisioned only/designed only/unknown) not yet applied to any table; four named risks of proceeding without verification; a recommended next action to execute Section 3's questions using the proven Phase 6.4 methodology; explicit out-of-scope boundaries. No live query performed, no migration created, no release status changed. |
