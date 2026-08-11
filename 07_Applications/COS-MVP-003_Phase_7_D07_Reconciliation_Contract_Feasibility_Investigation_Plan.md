# COS-MVP-003 Phase 7 D07 Reconciliation-Contract Feasibility Investigation Plan

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Automation Owner and Security Owner
**Status:** Investigation Plan — D07 Not Resolved
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — investigation planning document, no capability exists to release

## Purpose

D07 (Recovery and Rollback Authority Model) was Approved with Conditions, one of which is that "reconciliation-contract feasibility remains an independent implementation validation gate" and that "no recovery implementation proceeds without confirmed reconciliation outcomes." This document defines the investigation method, evidence requirements, and decision criteria for resolving that specific gate (`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G01). **This is a planning and investigation document only.** It does not resolve D07, does not approve any implementation, does not select an adapter architecture, does not create fallback behavior, and does not authorize recovery implementation. It defines *how* the question would be investigated and *what evidence* would answer it — it does not itself produce that evidence.

## Maintaining the Distinction

- **Defining an investigation ≠ conducting one.** Every phase in Section 5 is described, not executed.
- **A methodology ≠ a finding.** This document contains no conclusion about any adapter's feasibility.
- **Planning ≠ authorization.** Nothing here authorizes recovery implementation, adapter code, migrations, or releases.

## 1. D07 Gate Definition

**Original decision intent.** D07's recommendation was that resumption of a `Quarantined` or `Failed` run requires the reconciliation contract to resolve to a definite outcome — never `unknown` treated as a green light — plus a role stricter than baseline for T3/T4 or sensitive-data runs. The Decision Record's own rationale: `Automation_Architecture.md`'s fail-closed principle ("High-impact... actions fail closed without required approval") applied to recovery means a run must never resume by silent default, and a human should not even be *offered* the choice to resume based on incomplete evidence.

**Why the gate exists.** The reconciliation contract's authority half was ratified — that part of D07 is settled. But the contract's *mechanism* — a three-outcome check (`confirmed-succeeded`/`confirmed-failed`/`unknown`) against a real integration adapter — has never been tested against any actual adapter. Ratifying the policy that governs how the mechanism must be used does not establish that the mechanism itself is buildable. This gap is exactly what D07's two conditions preserve as unresolved.

**Why normal retry behavior is insufficient.** `Automation_Architecture.md`'s Failure and Recovery principle states directly: "A worker crash must not imply a step succeeded." An ordinary retry — simply re-attempting the operation — risks duplicating an action that actually completed before the interruption (e.g., re-sending a publish, re-triggering a side effect). Recovery specifically requires knowing what already happened before deciding what to do next, which is a fundamentally different operation than retrying blindly.

**Why false "confirmed-succeeded" results are unacceptable.** A reconciliation check that incorrectly reports success when the original action actually failed is the single worst-case outcome this gate exists to prevent — it would mask exactly the class of problem the entire Execution Safety Foundations capability was designed to catch, and it could cause a run to be treated as recoverable when it silently isn't. **This is stated as the critical failure condition for this investigation, not merely one risk among several.**

**`unknown` is an acceptable outcome.** The contract's own design already anticipates that certainty is not always achievable — `unknown` is a legitimate, honest result, not evidence the contract has failed. A `Quarantined` run that reconciles to `unknown` correctly remains `Quarantined`, requiring manual resolution rather than automated recovery. This distinction — `unknown` is acceptable, false `confirmed-succeeded` is not — governs every success criterion in Section 4.

## 2. Investigation Scope

Candidate adapters, in priority order, drawn from `04_Tool_Registry/Tool_Registry.md`'s existing registry — no adapter outside this registry is considered, and none is assumed capable before investigation:

1. **GitHub (TOOL-001)** — currently the only `Active` tool in the registry (T3, Architecture Owner), and the most representative real external integration this repository already depends on.
2. **Supabase (TOOL-003)** — the highest risk classification in the registry (T4, Data Owner), and the platform Creator OS Foundry itself runs on, making its feasibility finding the highest-value single data point.
3. **OpenAI Platform (TOOL-002)** — T3, `Candidate` status, Agent Owner.
4. **WaveSpeed (TOOL-004)** — T3, `Candidate` status, Media Domain Owner.

`TOOL-005` (Local Development Runtime) is excluded from this investigation's scope — its side effects are local file changes and execution, not the kind of externally-verifiable mutation this gate concerns.

**For each adapter, the investigation must determine, not assume:**
- API capabilities relevant to confirming a prior operation's outcome.
- Status-lookup capabilities distinct from the adapter's normal mutating call surface.
- Idempotency support already built into the provider's own API (some providers accept idempotency keys directly; this changes what reconciliation even needs to check).
- Event or log availability that could independently confirm a side effect occurred.
- Ability to reconstruct side-effect state through indirect means, if no direct status endpoint exists (e.g., checking whether an expected resource now exists).
- Limitations — rate limits, permission scopes, or provider-specific behavior that could affect the reliability of any reconciliation check.

**No capability is assumed present for any adapter before this investigation examines it directly.**

## 3. Investigation Questions

For each adapter in Section 2, this investigation must answer:

1. Does the provider expose a separate operation/status endpoint, distinct from the mutating call itself?
2. Can the adapter determine whether the original mutation succeeded after an interrupted request — through that endpoint, or by any other means?
3. Can the adapter reliably distinguish `confirmed-succeeded` from `confirmed-failed` from `unknown`, or does its API only support a subset of these three outcomes?
4. Is the result deterministic — does the same underlying state always produce the same reconciliation answer, or can the same check return different answers on repeated calls?
5. Are there scenarios where the adapter could incorrectly report success — the critical failure condition named in Section 1 — and if so, what are they specifically?
6. Does feasibility vary by operation type within the same adapter (e.g., a GitHub push vs. a GitHub issue comment may have different reconciliation properties)?
7. Does the adapter require provider-specific reconciliation logic, or can a single, generic reconciliation pattern apply across all four candidate adapters?

**None of these seven questions is answered by this document.** They are the fixed question set a future investigation must work through per adapter.

## 4. Evidence Standard

**Required evidence categories:**
- **Provider documentation review** — the official API documentation for each candidate adapter, examined specifically for status-check, idempotency-key, or audit-log capabilities.
- **API capability analysis** — a structured answer to each of Section 3's seven questions, per adapter, grounded in the documentation review (or, where documentation is ambiguous, in direct API exploration).
- **Test methodology** — a defined procedure for deliberately interrupting a real (test-scoped) call and invoking the candidate reconciliation check, to be executed once a live/staging environment and adapter access are available (per `COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G05) — described here, not run.
- **Expected reconciliation outcomes** — for each test scenario designed under the methodology above, a stated expected outcome, so results can be compared against a prediction rather than evaluated after the fact with no baseline.
- **Ground-truth verification method** — an independent way to confirm what actually happened to the interrupted operation (e.g., checking the provider's own dashboard, a separate audit log, or a second API call unrelated to the reconciliation check itself), so the reconciliation check's answer can be verified against something other than itself.

**Success criteria — a reconciliation contract is feasible for a given adapter when:**
- The adapter can reliably determine outcomes for the operation types this repository actually uses it for.
- `confirmed-succeeded` results have independent verification — confirmed against ground truth, not merely returned by the check itself.
- `confirmed-failed` results have independent verification, same standard.
- `unknown` is returned specifically when certainty is genuinely impossible — not used as a default when the check simply wasn't implemented carefully.
- **False `confirmed-succeeded` does not occur, under any tested scenario.** This is a hard requirement, not a rate to be minimized — a single confirmed false positive is sufficient to fail this criterion for that adapter, per Section 1's framing of this as the critical failure condition.

## 5. Investigation Methodology

Described, not executed. No phase below is performed by this document.

**Phase 1 — Documentation/API capability review.** For each candidate adapter, review official API documentation against Section 3's seven questions, producing a structured capability summary per adapter.

**Phase 2 — Adapter capability assessment.** Synthesize Phase 1's findings into a preliminary feasibility judgment per adapter (Section 6's three possible outcomes), identifying which questions Phase 1's documentation review could answer conclusively and which require direct API exploration or live testing to resolve.

**Phase 3 — Controlled validation design.** For any adapter where Phase 2 could not reach a conclusive judgment from documentation alone, design the specific test scenarios the methodology in Section 4 calls for — deliberate interruption, reconciliation check invocation, ground-truth comparison — ready to execute once `COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G05 (live/staging environment) clears.

**Phase 4 — Decision recommendation.** Synthesize Phases 1–3 into a recommendation for each adapter (Outcome A, B, or C per Section 6), and an overall recommendation for how D07's reconciliation-contract requirement should be finalized — presented as a recommendation for accountable-owner review, not a self-executed resolution of D07.

**None of these four phases is executed by this document.** This section defines what each phase would consist of; conducting them is future work.

## 6. Possible Outcomes

Three possible findings this investigation could reach, per adapter:

**Outcome A — Fully feasible.** The adapter supports the reconciliation contract as originally specified: reliable `confirmed-succeeded`/`confirmed-failed` determination with independent verification, `unknown` reserved for genuine ambiguity, and no observed false-positive risk.

**Outcome B — Conditionally feasible.** The adapter can support the contract, but only under specific, documented constraints — for example, only for certain operation types, only within a bounded time window after the original call, or only with additional provider-specific logic beyond a generic check.

**Outcome C — Not feasible.** The adapter cannot reliably determine reconciliation outcomes for some or all relevant operations. **This is not a failure of the investigation.** A conclusive "this adapter cannot support it" finding is valid, evidence-based output. For any adapter reaching Outcome C, the implication is that D07's recovery design requires a documented, explicit fallback path for that adapter class — most plausibly, mandatory manual reconciliation rather than automated resumption — a design decision for a future document, not resolved here.

## 7. Impact on Downstream Capabilities

**Execution Safety Foundations recovery.** D07's reconciliation-contract feasibility gates specifically the reconciliation and end-to-end recovery tests within Execution Safety Foundations' own live-validation suite (`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G03) — it does **not** gate the quarantine, idempotency, self-compensation-denial, or RLS tests within that same suite, which have no dependency on this gate.

**Workflow Engine.** Per the Roadmap, the Workflow Engine consumes Execution Safety Foundations "for run recovery" specifically — this investigation's outcome affects the Workflow Engine's recovery-handling design once that engine is eventually planned, but does not affect its approval-gate or orchestration design, neither of which depends on reconciliation feasibility.

**Agent Execution Layer.** Same relationship, one layer further downstream — the Agent Execution Layer is built on Execution Safety Foundations' recovery model per the Implementation Map's own dependency graph, so an Outcome C finding for a given adapter would mean any agent action routed through that adapter inherits the same manual-reconciliation fallback, once the Agent Execution Layer itself is eventually designed.

**What D07 does not block.** This gate does not block all Execution Safety planning, and does not block all Workflow planning. It specifically affects the subset of capability that depends on automated reconciliation after an interruption — a narrower scope than "recovery in general," which also includes the quarantine, checkpoint, and compensation mechanisms this gate does not touch.

## 8. Governance Boundaries

This document explicitly does **not**:
- Resolve D07 — the gate remains exactly as open as it was before this document, for every one of the four candidate adapters.
- Approve recovery implementation.
- Create any adapter implementation or adapter code.
- Select any secret manager or provider (a separate, unrelated gate — `COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G06).
- Authorize any migration.
- Authorize any release.
- Begin any Phase 8 implementation work.

## What This Document Does Not Do

- It does not implement any code, adapter, schema, or migration.
- It does not modify any application source file, database file, or configuration file.
- It does not run any live validation or produce any test evidence.
- It does not resolve D07 or select an outcome (Section 6) for any adapter.
- It does not modify any ratification record or decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not begin Phase 8 implementation work.

## References

- [COS-MVP-003 Phase 7 Execution Safety Foundations Decision Record](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Decision_Record.md) — source of D07's conditions this plan investigates
- [COS-MVP-003 Phase 7 Decision Ratification Record](COS-MVP-003_Phase_7_Decision_Ratification_Record.md), [COS-MVP-003 Phase 7 Decision Ratification Tracker](COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md) — authoritative source for D07's Approved-with-Conditions status
- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G01 (this gate) and G05 (the environment prerequisite for Phase 3's live testing)
- [COS-MVP-003 Phase 7 Execution Safety Foundations Technical Design](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Technical_Design.md) — source of the reconciliation-contract concept itself (Section 3)
- [Automation Architecture](../06_Automations/Automation_Architecture.md) — source of the fail-closed and Failure-and-Recovery principles this gate implements
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md) — source of the four candidate adapters and their risk classifications
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial D07 reconciliation-contract feasibility investigation plan: gate definition restating D07's intent and the critical false-positive-success failure condition, with `unknown` explicitly preserved as an acceptable outcome; investigation scope naming four candidate adapters in priority order (GitHub, Supabase, OpenAI Platform, WaveSpeed) with required capability areas per adapter, none assumed present; seven fixed investigation questions per adapter; an evidence standard defining required evidence categories and five success criteria, including a zero-tolerance false-positive requirement; a four-phase methodology (documentation review, capability assessment, controlled validation design, decision recommendation) described but not executed; three possible outcomes (fully feasible, conditionally feasible, not feasible) with Outcome C explicitly framed as valid evidence, not investigation failure; downstream impact analysis on Execution Safety Foundations recovery, the Workflow Engine, and the Agent Execution Layer, clarifying the gate's narrow scope; explicit governance boundaries. D07 not resolved, no implementation performed, no adapter code created, no release status changed. |
