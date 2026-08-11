# COS-MVP-003 Phase 7 Validation Environment Readiness Requirements

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Architecture Owner and Data Owner
**Status:** Readiness Requirements — Environment Not Provisioned
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning and readiness requirements document, no capability exists to release

## Purpose

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md` names G05 (Live/Staging Validation Environment) as the widest-reaching prerequisite in the entire remaining-gates inventory — every live-executed validation requirement across all three Phase 7 chains depends on it. This document defines the minimum environment capabilities, access requirements, safety controls, and readiness criteria that must exist before any Phase 7 validation activity may begin. **This is a planning and readiness requirements document only.** It creates no infrastructure, provisions no environment, creates no cloud resource or database, runs no migration, executes no validation test, creates no credential, configures no secret manager, selects no vendor or provider, and authorizes no implementation or production change.

## Maintaining the Distinction

- **Defining requirements ≠ meeting them.** Every capability, access category, and safety control below is a requirement to be satisfied later, not a confirmation that it currently is.
- **A readiness checklist ≠ a completed checklist.** Section 6's checklist items are stated as open boxes throughout this document — none is marked complete, because none has been verified.
- **Environment readiness ≠ implementation authorization.** Even a fully-ready environment, once it exists, would not itself authorize any migration, credential provisioning, or Phase 8 work — that remains a separate, explicit decision this document does not make or anticipate making on anyone's behalf.

## 1. Environment Gate Definition

**Why a live/staging validation environment is required.** Every validation requirement named across the three Phase 7 chains — the Shared Approval/Evidence Primitive's Migration Design Plan §7, Execution Safety Foundations' Implementation Specification §8, and Tool Registry Security's Decision Record D17 — calls for *live-executed* evidence, not source review. None of that evidence can be produced without an actual database to migrate against, actual roles to assume, and actual transactions to roll back. A design document, however carefully reasoned, is not itself evidence that a schema behaves correctly under real RLS enforcement or that a governed function actually denies what it claims to deny.

**Why design review alone is insufficient.** This is not a new standard invented for this document — it is the same standard COS-MVP-002 was held to throughout Phase 6, and the same standard every Phase 7 Decision Record and Migration Design Plan has explicitly committed to since. `COS-MVP-003_Phase_7_Status_and_Governance_Snapshot.md`'s own Architectural Principles restate it plainly: "No module is treated as working because its code looks correct." Design review confirms internal consistency; it cannot confirm that a live Postgres instance, under actual role-assumption and actual RLS policies, produces the access pattern the design specifies.

**Relationship to Phase 6.4 validation methodology.** `COS-MVP-002_Phase_6.4_Validation_Record.md` is this repository's own proven reference: `SET LOCAL ROLE` and `SET LOCAL request.jwt.claims` were used to genuinely assume the Postgres roles and JWT identity RLS policies actually check against — not superuser or bypass access — and every mutating test ran inside an explicit transaction ended with `ROLLBACK`, with a final query confirming zero leaked fixtures. Every environment capability named in Section 3 below exists specifically to reproduce that same methodology for the three Phase 7 chains, not to invent a new one.

**Why validation evidence requires real execution conditions.** RLS denial, self-approval prevention, and evidence-integrity guarantees are properties of how Postgres actually enforces policies against actually-assumed roles — they cannot be verified by reading the policy definitions alone, the same way a lock's strength cannot be verified by reading its spec sheet without ever turning a key in it.

**A validation environment is a prerequisite for evidence generation. Environment readiness does not authorize implementation.** These are two separate facts. Once an environment meets every requirement in this document, that fact alone still does not authorize any migration to be applied to it, any credential to be provisioned within it, or any Phase 8 work to proceed — those remain separate, explicit decisions, consistent with how every other gate in this Phase 7 effort has been treated.

## 2. Validation Chains Requiring Environment Access

Mapped from each chain's own source documents — nothing below is executed by this document, only defined as a future need.

### 1. Shared Approval/Evidence Primitive

- Database schema deployment — `governed_subjects` and the three generalized evidence tables must actually exist before anything else in this list is possible.
- RLS testing — active member / non-member / anonymous denial and allow tests, per the Migration Design Plan's own methodology.
- Lifecycle transition testing — every edge of the seven-state transition graph, positive and negative cases.
- Self-approval prevention testing — requester and approver identity must differ, verified for at least two subject types.
- Evidence-integrity testing — version-binding enforcement and orphan-prevention checks.
- Compatibility regression testing — confirming the new schema behaves identically to the existing, live-validated document tables for a document-equivalent case.
- Security advisor checks — a live `get_advisors(type: "security")` scan confirming no new findings against any existing table, mirroring the exact check already performed in Phase 6.4.

### 2. Execution Safety Foundations

- `runs`/`run_steps`/`incidents` testing — these tables do not exist yet; their first live creation is itself part of what this environment must support.
- Quarantine testing — confirming an interrupted run with an unknown side effect lands in `Quarantined`, never auto-resolved.
- Idempotency testing — confirming a replayed trigger with an identical key does not duplicate a side effect.
- Compensation testing — targeting the now-resolved `compensation_evidence` table, confirming authority denial and success paths.
- Recovery testing — confirming role-checked, evidence-gated resumption from `Quarantined`/`Failed`.
- Reconciliation testing dependencies — the reconciliation-specific and end-to-end recovery tests additionally depend on G01 (D07's feasibility investigation) resolving first; this environment document does not resolve that dependency, only notes it exists.

### 3. Tool Registry Security

- Credential lifecycle testing — the `credential_references`/`integrations`/`tools` schema does not exist yet, and its lifecycle-testing requirement is unreachable without both this environment and a selected secret manager (G06).
- Rotation testing — overlap-window, new-credential verification, old-credential revocation.
- Revocation testing — immediate denial on the next call after revocation.
- Emergency-pause testing — `is_emergency` marker and mandatory review-due timestamp correctly recorded.
- Expiration testing — hard denial past `rotation_due_at`, no grace period.
- Secret-manager integration testing — confirming the environment can safely interact with whichever provider G06 eventually selects, without any risk to real production secrets.

**None of the above is executed by this document.** This section defines what each chain's own already-specified validation plan needs from an environment — it does not perform any of that validation.

## 3. Required Environment Capabilities

**Database:**
- A Postgres/Supabase-compatible environment, consistent with this repository's existing platform.
- Migration execution capability — the ability to apply the (not-yet-written) migrations for all three chains.
- Rollback capability — the ability to reverse a migration cleanly, consistent with every Migration Design Plan's own additive-only, clean-drop rollback strategy.
- Transaction isolation — the ability to run a test inside an explicit transaction and end it with `ROLLBACK`, per the Phase 6.4 methodology.
- Test data cleanup capability — the ability to confirm, after a validation run, that zero fixtures were left behind.

**Security testing:**
- Ability to test roles — genuine role assumption, not superuser or bypass access.
- `SET LOCAL ROLE` capability, specifically, matching Phase 6.4's own proven method.
- Request-claim simulation — `SET LOCAL request.jwt.claims`, so RLS policies checking JWT identity can be exercised as an actual authenticated session would trigger them.
- RLS verification capability — the ability to confirm a policy actually denies or allows as designed, not merely that it exists.
- Security advisor access — the ability to run `get_advisors(type: "security")` or an equivalent live scan.

**Observability:**
- Logs sufficient to reconstruct what a validation run actually did.
- Timestamps on every recorded event, for sequencing and audit purposes.
- Evidence capture — a durable way to record test results as the actual evidence artifacts these Migration Design Plans and Decision Records require, not merely a pass/fail note.
- Test artifact retention — evidence must persist long enough to support the Implementation Readiness Review process this repository has used throughout Phase 7.

**Isolation:**
- Separate from production — this environment must not be the live production database backing any already-shipped capability (System Registry, Documentation Registry).
- Synthetic test data only — no real user, workspace, or business data.
- No production credentials — under any circumstance, consistent with `Secrets_Management.md`'s own standard.
- Controlled access — limited to whoever is actually conducting validation, not broadly available.

## 4. Access Requirements

Categories only — no access is granted or requested by this document.

**Database:**
- Migration permissions — the ability to apply and roll back schema changes in the validation environment specifically.
- Administrative testing permissions — sufficient privilege to assume test roles and inspect RLS behavior.
- Rollback permissions — the ability to reverse changes without requiring a separate escalation each time.

**Security:**
- Secret manager administration — once G06 selects a provider, whoever conducts Tool Registry Security validation will need administrative access to that provider's test/staging tier specifically.
- Test credential management — the ability to provision and destroy test-scoped credentials safely.
- Audit visibility — the ability to review the secret manager's own access logs, for cross-verification against this repository's own evidence tables.

**Adapter testing** (per `COS-MVP-003_Phase_7_D07_Reconciliation_Contract_Feasibility_Investigation_Plan.md`'s candidate list):
- GitHub test access — sufficient to exercise interrupted-call reconciliation scenarios without affecting any real repository content.
- Supabase test access — for the same purpose, against the platform this repository already runs on.
- OpenAI Platform test access — if and when that adapter's feasibility investigation proceeds.
- WaveSpeed test access, if applicable — same condition.

**Access requirements do not grant implementation authorization.** They define what a future validation operator would eventually need — naming these categories now does not request, grant, or provision any of them.

## 5. Safety Requirements

Mandatory safeguards for any future validation activity, none of which is itself performed by this document:

- No production secrets, under any circumstance.
- No production data — synthetic fixtures only.
- No production credentials — a test credential must never be, or be mistaken for, a real one, per the safeguard already named in D17.
- Synthetic fixtures for every test scenario — workspace, membership, subject, and evidence rows created specifically for testing, not repurposed real data.
- Reversible testing wherever possible — every mutating test should run inside a transaction that can be rolled back.
- Transaction rollback where possible — the default posture for any test that can be structured this way, matching Phase 6.4's own proven approach.
- Isolated test identities — synthetic user/role identities distinct from any real account.
- Evidence capture for every validation run — a test that produces no durable record of its outcome does not satisfy any Decision Record's live-execution requirement, regardless of whether it "worked."

## 6. Environment Readiness Checklist

A readiness checklist only. **No item below is marked complete — none has been verified as of this document.**

**Environment:**
- [ ] Staging/test environment exists
- [ ] Database access verified
- [ ] Rollback capability verified
- [ ] Required roles available
- [ ] Test identities created
- [ ] Synthetic fixtures prepared
- [ ] Logging available
- [ ] Evidence storage available

**Security:**
- [ ] Secret manager selected (dependent on G06 — cannot be checked until that gate resolves)
- [ ] Test credentials provisioned safely
- [ ] Credential access boundaries verified

**Validation:**
- [ ] Validation owners assigned
- [ ] Test plans approved
- [ ] Evidence format defined

## 7. Dependency Mapping

- **G05 (this document's subject) is a broad prerequisite** for G02 (Shared Approval/Evidence Primitive validation), G03 (Execution Safety Foundations validation), and G04 (Tool Registry Security validation) — none of the three can execute its live-testing plan without an environment meeting Section 3's capabilities.
- **G05 does not affect G01 (D07 feasibility investigation)** — that investigation's Phases 1–2 (documentation/API capability review) require adapter/API access, not a database environment; only Phase 3 (controlled validation design execution) would eventually need G05, and even then only for the reconciliation-specific portion of G03.
- **G05 does not affect G06 (secret-manager/provider decision)** — that is a policy decision requiring no environment to make, though G04's *execution* needs both G05 and G06 satisfied together.
- **G05 does not resolve D07, does not resolve G06, and does not resolve any validation outcome.** An available environment makes validation *possible*; it does not itself constitute, predict, or guarantee any test's result.

## 8. Ownership and Governance

- **Architecture Owner** — accountable for the environment's overall readiness and its alignment with this repository's existing schema/security patterns.
- **Security Owner** — accountable for the security-testing and safety-requirement categories (Sections 3, 5), and for secret-manager administrative access once G06 resolves.
- **Data Owner** — accountable for database-capability requirements (Section 3) and evidence-retention practices (Section 6).
- **Automation Owner** — accountable for observability and evidence-capture tooling, consistent with their existing role across Execution Safety Foundations and Tool Registry Security.
- **Tool Owner**, where applicable — accountable for adapter-test-access provisioning once G01's investigation reaches its controlled-validation-design phase.

**Environment readiness requires accountable ownership.** No item in Section 6's checklist should be marked complete without a named accountable owner confirming it, consistent with the evidentiary discipline this repository has held to throughout Phase 7.

**Environment creation requires separate authorization.** This document defines what "ready" means. It does not request, initiate, or authorize the creation of any environment meeting that definition — that remains a distinct, future, explicit decision.

## 9. Governance Boundaries

This document explicitly does **not**:
- Create any environment.
- Provision any infrastructure.
- Select any provider.
- Create any credential.
- Run any migration.
- Execute any test.
- Resolve D07.
- Resolve G06.
- Authorize any implementation.
- Authorize any production change.
- Begin any Phase 8 implementation work.

## What This Document Does Not Do

- It does not create, provision, or configure any environment, infrastructure, or cloud resource.
- It does not create any database, run any migration, or write any SQL.
- It does not execute any validation test or produce any test evidence.
- It does not create any credential or configure any secret manager.
- It does not select any vendor or provider.
- It does not modify any application source file or configuration file.
- It does not modify any ratification record or any D01–D19 decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not authorize any production change or begin Phase 8 implementation.

## References

- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G05 and its relationship to G01–G04, G06
- [COS-MVP-003 Phase 7 D07 Reconciliation Contract Feasibility Investigation Plan](COS-MVP-003_Phase_7_D07_Reconciliation_Contract_Feasibility_Investigation_Plan.md) — source of the G01 dependency boundary in Section 7
- [COS-MVP-003 Phase 7 Secret Manager Provider Decision Framework](COS-MVP-003_Phase_7_Secret_Manager_Provider_Decision_Framework.md) — source of the G06 dependency boundary in Sections 4 and 7
- [COS-MVP-002 Phase 6.4 Validation Record](COS-MVP-002_Phase_6.4_Validation_Record.md) — the proven methodology this document's Section 3 capabilities are modeled on
- [COS-MVP-003 Phase 7.1 Approval Primitive Migration Design Plan](COS-MVP-003_Phase_7.1_Approval_Primitive_Migration_Design_Plan.md), [COS-MVP-003 Phase 7 Execution Safety Foundations Implementation Specification](COS-MVP-003_Phase_7_Execution_Safety_Foundations_Implementation_Specification.md), [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of the per-chain validation requirements mapped in Section 2
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial validation environment readiness requirements: gate definition grounding the requirement in Phase 6.4's proven methodology and distinguishing environment readiness from implementation authorization; validation chains mapped per chain (Shared Approval/Evidence Primitive, Execution Safety Foundations, Tool Registry Security) without executing any of them; required environment capabilities across database, security-testing, observability, and isolation categories; access requirement categories across database, security, and adapter testing, explicitly not granting any access; mandatory safety requirements; an unchecked environment readiness checklist across environment/security/validation categories; a dependency map clarifying G05's broad reach and its explicit non-effect on G01 and G06; ownership grounded in existing repository roles; explicit governance boundaries. No environment created, no infrastructure provisioned, no provider selected, no credential created, no implementation performed, no release status changed. |
