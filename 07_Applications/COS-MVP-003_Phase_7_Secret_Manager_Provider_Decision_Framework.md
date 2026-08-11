# COS-MVP-003 Phase 7 Secret Manager / Provider Decision Framework

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Security Owner and Data Owner
**Status:** Decision Framework — No Provider Selected
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — planning and evaluation document, no capability exists to release

## Purpose

`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md` names G06 (Secret Manager / Provider Decision) as an open, independent closure gate — a policy decision the Tool Registry Security Decision Record left unresolved, and a prerequisite for that chain's own live-executed validation (D17). This document defines the criteria, evaluation process, ownership, and required decision-record contents for making that selection — it does not make the selection itself. **This is a planning and evaluation document only.** It selects no provider, implements no secret storage, creates no credential, integration, migration, or database object, and does not begin Tool Registry or Phase 8 implementation of any kind.

## Maintaining the Distinction

- **Defining a framework ≠ using it.** This document specifies how a provider would be evaluated and chosen. It does not evaluate or choose one.
- **Provider selection ≠ implementation authorization.** Naming a provider, once that happens, settles *where* credentials will live — it does not itself authorize building the integration, provisioning any real credential, or beginning any migration.
- **Criteria ≠ ranking.** Every evaluation category below is stated without weighting any specific provider against it — no candidate is scored, ranked, or recommended anywhere in this document.

## 1. Gate Definition

**Why a secret manager is required.** `08_Security/Secrets_Management.md` already establishes, as an existing repository-wide standard, that "repository files, documentation, prompts, model memory, chat, tickets, logs, analytics, and ordinary database fields must not contain secret values" and that secrets must be "store[d] only in an approved secret manager or platform-protected secret facility." `COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md`'s Decision 1 and Decision 2 (credential ownership, secret lifecycle responsibility) both assume such a facility exists — neither decision names which one, because that question was explicitly left open as a separate policy matter, not because the requirement for one is in doubt.

**Why Tool Registry Security cannot validate credential lifecycle without one.** Decision 17 (Audit Evidence Requirements) requires live-executed rotation, revocation, emergency-pause, and expiration tests against a *real* test-scoped credential in a *real* secret manager — per that decision's own reasoning, design review alone is insufficient, matching the evidentiary standard applied throughout this Phase 7 effort. There is no way to exercise a rotation-overlap window, a revocation's immediate effect, or an expiration's hard cutoff without an actual secret manager to rotate, revoke, or expire something in. This is not a hypothetical dependency — it is the literal object the tests in D17 operate on.

**Relationship between provider selection and D13–D19.** D13 (Credential Ownership Model) and D14 (Secret Lifecycle Responsibility) define *who* is accountable for credential decisions and *how* responsibility splits between policy-setting and operational execution — both are provider-agnostic and remain fully settled regardless of which provider is eventually chosen. D15 (Rotation and Expiration Authority) and D17 (Audit Evidence Requirements) define *behavioral requirements* a provider must be capable of supporting (overlap-window rotation, hard expiration, live-testable rotation/revocation) — these decisions constrain the *evaluation criteria* in Section 2 below, without naming or favoring any specific provider. D19 (Tool Trust Classification Authority) determines how rigor scales by risk class once a provider exists, but does not depend on which provider is chosen.

**Provider selection is a prerequisite for validation planning. Provider selection is not implementation authorization.** These are two separate, sequential facts, not one collapsed into the other. Once a provider is selected, the *next* step — actually provisioning a test credential and exercising D17's live suite — remains a distinct, later action requiring its own readiness (a live/staging environment, per `COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G05) and, per this repository's consistent practice throughout Phase 7, its own explicit go-ahead.

## 2. Evaluation Criteria

Categories a future evaluation must assess. No provider is scored against any category below — this section defines what must be asked, not what the answer is.

**Security:**
- Encryption capabilities (at rest and in transit).
- Access controls — whether the provider supports scoping retrieval to named runtime identities, per `Secrets_Management.md`'s "Grant retrieval only to named runtime identities."
- Audit logging — whether every access, rotation, and revocation event is independently logged by the provider itself, not only by this repository's own evidence tables.
- Rotation support — whether the provider supports an overlap window (old and new credential both valid briefly) as `Secrets_Management.md`'s Rotation and Revocation section requires.
- Secret versioning — whether prior versions remain distinguishable for audit purposes without being retrievable as live secrets.
- Least-privilege support — whether the provider's own permission model can express per-consumer, per-environment scoping distinct from a single all-or-nothing access grant.

**Operational:**
- Reliability and availability — the provider's own uptime and failure characteristics, since a secret-manager outage would block every tool call depending on it.
- Recovery process — how the provider's own backup/recovery works, distinct from this repository's own recovery model (Execution Safety Foundations), per `Secrets_Management.md`'s Backup and Recovery section requiring "stricter access than ordinary service secrets" for recovery credentials specifically.
- Administration model — who administers the provider itself, and how that interacts with the Security Owner/Tool Owner split already established in D14.
- Maintenance burden — ongoing operational cost of running or subscribing to the provider.

**Integration:**
- API availability — whether the provider exposes a programmatic interface Creator OS Foundry's governed functions could call, consistent with the `SECURITY DEFINER`/thin-wrapper pattern already established elsewhere.
- Automation support — whether rotation and expiration enforcement (D15) can be automated against the provider's own API, or require manual intervention.
- Compatibility with future Tool Registry workflows — whether the provider's model fits the `credential_references`/`integrations` schema already specified in `Schema_Specification.md`.
- Support for test environments — whether the provider can be used safely for D17's live validation without any risk of touching real production secrets.

**Governance:**
- Ownership model — how cleanly the provider's own administrative roles map onto D13's unified "Security Owner and relevant Domain Owner" ownership.
- Approval requirements — whether provisioning a new secret in this provider requires its own gate compatible with `Decision_Rights_and_Ownership.md`'s existing decision classes.
- Audit evidence availability — whether the provider's own logs can serve as, or supplement, the evidence D17 requires.
- Compliance considerations — any regulatory or contractual constraint relevant to where secrets may be stored.

**Developer/Platform:**
- Usability — how straightforward the provider is for the Tool Owner role (D14) to operate day-to-day.
- Environment separation — whether the provider cleanly separates local, preview, staging, and production secrets, per `Secrets_Management.md`'s "Separate secrets by environment, provider, workload, and privilege level."
- Local development considerations — how a developer's local environment would reference secrets without ever holding a copy.
- CI/CD compatibility — whether the provider integrates with whatever automation eventually consumes it, without requiring secrets to pass through intermediate systems.

## 3. Candidate Evaluation Scope

Categories of candidate a future evaluation may consider — named as categories, not specific products, and not recommended or selected here:

- **Platform-native secret management** — a facility provided by the same platform this repository's data layer already runs on.
- **Cloud secret managers** — a managed secret-storage service from a major cloud provider, independent of this repository's existing data platform.
- **Dedicated third-party secret managers** — a standalone product whose sole purpose is secret storage and lifecycle management, independent of any other platform relationship.
- **Self-managed solutions** — an internally operated secret-storage system, not outsourced to any external provider.

**No candidate within any category is named, evaluated, ranked, or recommended by this document.** This section exists solely to bound what a future evaluation should consider, so that evaluation does not silently narrow its own scope by only considering one category by default.

## 4. Decision Ownership

Grounded directly in existing repository governance, not newly invented:

- **Security Owner** — per `COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md`'s Decision 1 (Credential Ownership Model) and `08_Security/Secrets_Management.md`'s own document ownership, the primary accountable role for this decision.
- **Data Owner** — co-owner per this document's own header and consistent with Data Owner's role in every other evidence-retention and data-governance decision throughout this Phase 7 effort (D04, D10, D17).
- **Architecture Owner** — input required given the provider's integration surface with the Tool Registry's own schema and governed-function pattern (Section 2, Integration criteria).
- **Relevant Tool/Automation ownership input** — per D14's own split, the Automation Owner (co-owner of secret lifecycle responsibility) and whichever future Tool Owner role exists should have input on operational usability, since they would administer the chosen provider day-to-day.

**The final provider decision requires accountable-owner approval.** Consistent with `Decision_Rights_and_Ownership.md`'s "New external integration or privileged tool" decision class (Security Owner and relevant Domain Owner) and this Phase 7 effort's own consistent practice, no provider becomes the repository's chosen secret manager until an accountable owner explicitly ratifies it — this framework does not pre-authorize any outcome.

## 5. Required Decision Record Contents

A future provider decision record — not this document — must contain:

- **Selected provider** — the specific product or facility chosen.
- **Rejected alternatives** — the other candidates evaluated and why each was not selected, so the decision is auditable, not merely asserted.
- **Security rationale** — how the selected provider satisfies Section 2's Security criteria specifically.
- **Operational rationale** — how it satisfies the Operational criteria.
- **Integration rationale** — how it satisfies the Integration criteria, including explicit confirmation it can support D17's live-testing requirement safely.
- **Ownership model** — how the selected provider's own administrative roles map onto D13's and D14's already-ratified ownership structure.
- **Migration considerations** — whether adopting this provider has any bearing on other Phase 7 or future capabilities' schema (e.g., whether `credential_references.secret_provider` needs a specific enumerated value for it).
- **Validation impact** — what specifically becomes possible once this provider is chosen (Section 6 below), stated concretely for the selected provider, not generically.

## 6. Validation Impact

**How provider choice affects Tool Registry Security validation (D17):**
- **Rotation testing** — requires a provider supporting an overlap window; the specific mechanics of that window (how it's configured, verified, and closed) depend entirely on which provider is chosen.
- **Revocation testing** — requires confirming a revoked credential is immediately unusable at the provider level, not merely marked revoked in this repository's own tables.
- **Emergency-pause testing** — requires confirming the provider can support an immediate, exceptional revocation path consistent with D16's emergency-access model.
- **Expiration testing** — requires confirming the provider enforces (or can be made to enforce, via this repository's own governed functions) D15's hard-expiration, no-grace-period posture.
- **Test credential management** — requires the provider to support genuinely test-scoped credentials that can never be mistaken for or accidentally become real production secrets, per D17's own stated safeguard.

**No validation can begin until, in order:**
1. A provider is selected (this framework's own eventual output — not produced by this document).
2. A live/staging environment is available (`COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s G05).
3. Test credentials are provisioned safely within the selected provider, following `Secrets_Management.md`'s existing Provisioning Process.

**All three are independent prerequisites — none substitutes for another.** A provider decision without an environment cannot be validated; an environment without a provider decision has nothing to validate against; either without safely-provisioned test credentials risks exactly the exposure `Secrets_Management.md` exists to prevent.

## 7. Alternatives and Tradeoffs

Tradeoff categories only — no recommendation is made for any candidate category named in Section 3.

**Platform-native:**
- *Pros:* closer ecosystem integration with this repository's existing data platform; potentially fewer new operational relationships to manage; may already be within an existing access/authentication boundary.
- *Tradeoffs:* possible coupling between secret-storage and data-platform lifecycle decisions that would otherwise be independent; migrating away later, if ever needed, may be harder than with a standalone provider.

**Third-party (dedicated secret manager):**
- *Pros:* specialized capabilities purpose-built for secret lifecycle management, potentially exceeding what a platform-native facility offers on rotation, versioning, or audit granularity.
- *Tradeoffs:* an additional external dependency and vendor relationship; potential additional cost; another system's own reliability and security posture becomes load-bearing for this repository's credential handling.

**Self-managed:**
- *Pros:* maximum control over exact behavior, data residency, and integration specifics; no reliance on any third party's own roadmap or pricing changes.
- *Tradeoffs:* full operational responsibility shifts to this repository's own team — the "maintenance burden" and "administration model" criteria in Section 2 carry the most weight here, since there is no vendor absorbing that responsibility.

## 8. Governance Boundaries

This document explicitly does **not**:
- Select a secret manager or provider — G06 remains exactly as open as it was before this document.
- Create any credential.
- Authorize Tool Registry implementation of any kind.
- Authorize any migration.
- Authorize any validation execution.
- Resolve any other Tool Registry Security gate.
- Begin any Phase 8 implementation work.

## What This Document Does Not Do

- It does not select, name, rank, or recommend any secret-manager provider.
- It does not implement any secret storage, credential, or integration.
- It does not create any database migration or write any SQL.
- It does not modify any application source file or configuration file.
- It does not begin any Tool Registry or Phase 8 implementation.
- It does not modify any ratification record or any D01–D19 decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.

## References

- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of D13–D19, and the origin of this open provider-selection question
- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G06, the gate this framework defines the process for
- [Secrets Management](../08_Security/Secrets_Management.md) — the existing repository-wide standard this framework's evaluation criteria are grounded in
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md) — the ownership model Section 4 is grounded in
- [Schema Specification](../05_Database/Schema_Specification.md) — `credential_references`/`integrations` contracts referenced in Section 5's migration-considerations requirement
- [COS-MVP-003 Phase 7 Decision Ratification Record](COS-MVP-003_Phase_7_Decision_Ratification_Record.md), [COS-MVP-003 Phase 7 Decision Ratification Tracker](COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md) — authoritative source for D13–D19's ratified status
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial secret manager / provider decision framework: gate definition explaining why a provider is required, why Tool Registry Security validation cannot proceed without one, and the relationship to D13–D19 (provider-agnostic ownership/lifecycle decisions vs. provider-dependent behavioral requirements); five evaluation-criteria categories (security, operational, integration, governance, developer/platform) with no provider scored against any of them; four candidate evaluation-scope categories (platform-native, cloud, third-party, self-managed) with none named, ranked, or recommended; decision ownership grounded in existing repository roles; required future decision-record contents; validation impact across D17's five test types with a three-item ordered prerequisite list; tradeoff categories for each candidate scope with no recommendation; explicit governance boundaries. No provider selected, no credential created, no implementation performed, no release status changed. |
