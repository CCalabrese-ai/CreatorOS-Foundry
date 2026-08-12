# COS-MVP-003 Phase 7 Secret Manager / Provider Decision Record

**Phase:** 7 — Foundation
**Version:** 1.1
**Document owner:** Security Owner and Architecture Owner
**Status:** Decision Recorded — Approved with Conditions (Supabase Vault); Implementation Not Authorized
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — governance decision-support document, no capability exists to release

## Final Decision Outcome

**Outcome:** APPROVE WITH CONDITIONS
**Selected provider direction:** Supabase Vault
**Conditions (recorded verbatim):**
1. Confirm availability and compatibility in the target Supabase environment.
2. Confirm rotation, revocation, expiration, and emergency workflows satisfy D17 validation requirements.
3. Confirm operational burden is acceptable compared with AWS Secrets Manager alternative.

**Implementation: Not authorized.** This decision names a provider direction — it does not configure Supabase Vault, create any credential, or create any infrastructure.

**Validation: Required before production-ready credential handling.** All three conditions above must be confirmed, and D17's own live-executed validation suite must be completed and passing, before Tool Registry Security credential handling is considered validated. This decision does not itself satisfy any part of that requirement.

This outcome supersedes Section 6's recommendation only insofar as it converts that recommendation into a ratified direction — every unresolved fact Section 6 originally flagged (Vault extension enablement/plan-tier compatibility, and the custom-build cost relative to AWS Secrets Manager) is preserved below as an explicit condition, not resolved by this outcome.

## Purpose

`COS-MVP-003_Phase_7_Secret_Manager_Provider_Decision_Framework.md` defined the evaluation criteria, candidate scope, and decision process for G06 (Secret Manager / Provider Decision). This document applies that framework to realistic candidates and produces a recommendation for accountable-owner review. **This is a governance decision-support document only. It does not self-ratify the decision.** It selects no provider on the accountable owner's behalf, provisions no secret manager, creates no credential, migrates no secret, and does not authorize implementation, migration, Tool Registry Security validation, or Phase 8 work. Every claim about a candidate's general product capabilities is stated as general, publicly-documented product knowledge, not verified against this repository's actual infrastructure — every fact this document cannot verify from repository sources or live access is explicitly flagged as requiring external verification, not guessed.

## Maintaining the Distinction

- **Recommendation ≠ approval.** Section 6's recommendation was exactly that — a recommendation. It became the decision recorded in the Final Decision Outcome above only once the accountable owner explicitly selected Approve with Conditions in Section 9 — the recommendation did not self-execute.
- **Evaluation ≠ configuration.** Comparing candidates' capabilities does not configure, provision, or connect to any of them.
- **A clearly-reasoned recommendation ≠ a confident guess about this repository's specific infrastructure.** Where this document cannot verify a fact about Creator OS Foundry's actual environment (e.g., current Supabase plan tier, existing cloud-vendor relationships), it says so plainly rather than assuming favorably or unfavorably.

## 1. Decision Statement

**The decision, in plain English:** which secret-manager/provider should Creator OS Foundry use for Tool Registry Security credential storage and lifecycle validation?

**This decision covers:**
- Credential storage provider.
- Secret lifecycle support (creation, rotation, revocation, expiration).
- Validation suitability — specifically, whether the provider can support D17's live-executed test requirements.
- Environment separation (test/staging vs. production).
- Auditability.

**This decision does not:**
- Authorize implementation.
- Create any credential.
- Configure any provider.
- Migrate any secret.

## 2. Decision Requirements

Grouped into the six categories `COS-MVP-003_Phase_7_Secret_Manager_Provider_Decision_Framework.md` already established. Every requirement below traces to a specific repository source — none is invented for this document.

**1. Security** (`08_Security/Secrets_Management.md`): encryption at rest and in transit; access scoped to named runtime identities ("Grant retrieval only to named runtime identities"); audit logging of every access/rotation/revocation event; rotation support with an overlap window; secret versioning; least-privilege access model, not an all-or-nothing grant.

**2. Operational** (`Secrets_Management.md`'s Backup and Recovery section, and general reliability expectations already implicit throughout this repository's governance model): reliability/availability; a recovery process for the provider itself, distinct from Execution Safety Foundations' own recovery model; a clear administration model; bounded ongoing maintenance burden.

**3. Integration** (`COS-MVP-003_Phase_7_Tool_Registry_Security_Implementation_Specification.md`, `Schema_Specification.md`): a programmatic API callable from governed functions, consistent with the `SECURITY DEFINER`-in-`creator_os_private`-with-thin-`public`-wrapper pattern; automation support for rotation enforcement (D15); compatibility with the `credential_references`/`integrations` schema contract; safe support for test/staging environments.

**4. Governance** (`Decision_Rights_and_Ownership.md`, D13): an administrative model that maps cleanly onto D13's unified "Security Owner and relevant Domain Owner" ownership; compatibility with `Decision_Rights_and_Ownership.md`'s existing decision classes for any future provider-side approval gate; audit evidence usable to supplement D17's own evidence tables; no unaddressed compliance conflict.

**5. Developer/Platform** (`Secrets_Management.md`'s environment-separation requirement): usability for the Tool Owner role established in D14; clean separation of local/preview/staging/production secrets; no requirement that a developer's local environment ever hold a copy of a real secret; CI/CD compatibility.

**6. Validation suitability** (D17 directly): must support live-executed rotation testing (overlap window, new-credential verification, old-credential revocation), revocation testing (immediate denial on next call), emergency-pause testing (consistent with D16's model), expiration testing (hard cutoff per D15, no grace period), and must guarantee test-scoped credentials can never be mistaken for real production secrets.

## 3. Candidate Providers

Four realistic candidates, one per category named in the Decision Framework's Section 3. **General product capabilities below reflect publicly documented product behavior, not a verified assessment of this repository's specific deployment** — Creator-OS-Foundry-specific facts (plan tier, existing vendor relationships, actual enablement status) are flagged as unverified where this document cannot confirm them.

### A. Supabase Vault (platform-native)

- **Deployment model:** a Postgres extension (`pgsodium`-based) running inside the same Supabase project this repository already uses for its database, auth, and storage.
- **Security capabilities:** encryption at rest via `pgsodium`; secrets stored as encrypted rows, decrypted only through a controlled view/function surface.
- **Access control model:** governed by ordinary Postgres roles and RLS — the same mechanism this repository already uses for every other governed table, meaning access control could be expressed identically to the rest of this codebase.
- **Audit logging:** not a dedicated, built-in audit trail distinct from ordinary Postgres query logging — any access-specific audit record would need to be built via wrapper functions, mirroring how this repository already logs other governed events.
- **Rotation support:** no native, automatic rotation feature — rotation would need to be implemented via governed SQL functions, consistent with this repository's own pattern of building lifecycle logic in `creator_os_private`, but requiring custom implementation rather than a managed feature.
- **Secret versioning:** the underlying mechanism can support multiple secret rows per logical secret, but there is no built-in "current/previous" versioning UI or API distinct from what this repository would build itself.
- **Test/staging support:** depends entirely on whether Creator OS Foundry provisions separate Supabase projects per environment — not confirmed by any repository source.
- **API/automation support:** accessible via standard Postgres/Supabase client libraries, consistent with how every other governed function in this repository is already called.
- **Operational overhead:** low incremental overhead, since it runs inside infrastructure this repository already operates.
- **Platform coupling:** high — tightly bound to the same Supabase project as everything else. This is the candidate's central tradeoff, not a hidden cost.
- **Integration complexity:** low, given the existing `SECURITY DEFINER`/thin-wrapper pattern already proven for every other governed mutation.
- **Suitability for D17 live validation:** plausible, but rotation, versioning, and audit-logging behavior would all need to be custom-built rather than relying on native provider features — this shifts implementation effort onto this repository's own team rather than a managed service.
- **Unverified facts:** whether the Vault extension is actually enabled on Creator OS Foundry's current Supabase project and plan tier; whether the current plan tier supports it at all. **Neither is confirmed by any repository source or verifiable without live project access.**

### B. AWS Secrets Manager (major cloud-native)

- **Deployment model:** a managed AWS service, external to Supabase.
- **Security capabilities:** encryption at rest (via AWS KMS) and in transit; IAM-based access control.
- **Access control model:** fine-grained IAM policies, distinct from and external to this repository's own Postgres-role-based model — would require a mapping layer between IAM identities and this repository's own governed-function callers.
- **Audit logging:** native, via AWS CloudTrail — every access, rotation, and retrieval event logged automatically by the provider itself.
- **Rotation support:** native, automatic rotation via configurable Lambda rotation functions — a managed feature, not something this repository would need to build.
- **Secret versioning:** native, with staging labels (`AWSCURRENT`/`AWSPENDING`/`AWSPREVIOUS`) built into the service.
- **Test/staging support:** straightforward via separate secret naming or separate AWS accounts/IAM policies per environment.
- **API/automation support:** a mature, well-documented API and SDK ecosystem.
- **Operational overhead:** low once initial IAM/account setup is complete, but that setup is nontrivial if no AWS presence currently exists.
- **Platform coupling:** low to Supabase specifically, but introduces a new external vendor dependency.
- **Integration complexity:** moderate — requires building the IAM-to-governed-function identity mapping this repository doesn't currently have any analog for.
- **Suitability for D17 live validation:** strong — native rotation, versioning, and audit logging directly satisfy most of D17's requirements without custom engineering.
- **Unverified facts:** whether Creator OS Foundry has any existing AWS account or billing relationship. **No repository source confirms or denies this — this document treats it as a genuinely new dependency, not an extension of existing infrastructure.**

### C. Doppler (dedicated third-party SaaS secrets manager)

- **Deployment model:** a managed, cloud-hosted SaaS product, external to both Supabase and any cloud-infrastructure account.
- **Security capabilities:** encryption at rest and in transit; a workspace/project/environment model purpose-built for exactly the local/dev/staging/production separation `Secrets_Management.md` requires.
- **Access control model:** Doppler's own role-based access model — would need mapping onto this repository's Security Owner/Domain Owner/Tool Owner roles, an integration task rather than a native fit.
- **Audit logging:** available, though full audit-log detail is typically a paid-tier feature — plan-tier dependent.
- **Rotation support:** integration-dependent — Doppler itself stores and serves secrets but does not natively rotate third-party provider credentials; rotation logic would still need to be built against whichever underlying service (e.g., GitHub, Supabase) actually issues the credential.
- **Secret versioning:** native, with rollback support built into the product.
- **Test/staging support:** a first-class product feature — this is Doppler's own core value proposition.
- **API/automation support:** strong CLI and API, designed specifically for CI/CD integration.
- **Operational overhead:** low — a managed SaaS product requiring no infrastructure of this repository's own to operate.
- **Platform coupling:** low to Supabase, but introduces a new vendor relationship and recurring cost.
- **Integration complexity:** moderate — no existing pattern in this repository for calling an external SaaS API from a governed function; would be a new integration category.
- **Suitability for D17 live validation:** good for environment separation and versioning; weaker for the rotation-specific tests, since rotation of the underlying credential still depends on the target provider's own capabilities, not Doppler's.
- **Unverified facts:** current pricing tier requirements for the audit-logging feature D17's evidence requirements would need; whether Creator OS Foundry has any existing vendor-approval precedent for a SaaS product of this kind. **Neither confirmed by repository sources.**

### D. HashiCorp Vault (self-managed)

- **Deployment model:** self-hosted software, operated entirely by Creator OS Foundry's own infrastructure.
- **Security capabilities:** among the most capable of the four candidates — dynamic secrets, time-limited leases, fine-grained policy engine, full encryption at rest and in transit.
- **Access control model:** Vault's own policy language, highly expressive, but requiring dedicated operational expertise to configure correctly.
- **Audit logging:** native and comprehensive — a first-class Vault feature.
- **Rotation support:** native for supported secret engines, including dynamic, short-lived credential issuance.
- **Secret versioning:** native, via the KV version 2 secrets engine.
- **Test/staging support:** fully controllable, since this repository would operate the entire deployment.
- **API/automation support:** mature and extensive.
- **Operational overhead:** the highest of the four candidates — this repository has no existing infrastructure for running, patching, unsealing, or maintaining a Vault cluster, and none of that infrastructure exists today.
- **Platform coupling:** none — fully independent, at the cost of full operational responsibility.
- **Integration complexity:** high — an entirely new operational surface, not an extension of anything this repository currently runs.
- **Suitability for D17 live validation:** technically excellent, but the operational cost of standing up a test-capable Vault deployment before any validation can even begin is substantial relative to the other three candidates.
- **Unverified facts:** none specific to Creator OS Foundry — this candidate's tradeoffs are structural (operational burden) rather than dependent on unknown facts about this repository's existing environment.

## 4. Evaluation Matrix

Ratings reflect general product capability against Section 2's requirements, not a verified assessment of this repository's specific deployment. Where a rating depends on an unverified fact named in Section 3, it is marked accordingly.

| Requirement | A: Supabase Vault | B: AWS Secrets Manager | C: Doppler | D: HashiCorp Vault |
| --- | --- | --- | --- | --- |
| Encryption at rest/in transit | Strong fit | Strong fit | Strong fit | Strong fit |
| Access scoped to named identities | Strong fit (existing RLS pattern) | Strong fit (IAM) | Acceptable (Doppler's own role model) | Strong fit |
| Audit logging | Weak fit (not native — requires custom build) | Strong fit (native, CloudTrail) | Acceptable (plan-tier dependent) | Strong fit (native) |
| Rotation with overlap window | Weak fit (no native rotation) | Strong fit (native) | Weak fit (depends on underlying provider) | Strong fit (native) |
| Secret versioning | Acceptable (underlying support, no native UI) | Strong fit (native) | Strong fit (native) | Strong fit (native, KV v2) |
| Least-privilege access model | Strong fit (existing RLS) | Strong fit (IAM) | Acceptable | Strong fit |
| Reliability/availability | Unknown — requires verification (tied to current Supabase plan/SLA) | Strong fit (AWS SLA) | Acceptable (vendor SLA, plan-dependent) | Unknown — requires verification (depends entirely on this repository's own operational capability) |
| Recovery process | Unknown — requires verification | Strong fit (native AWS backup/recovery) | Acceptable | Weak fit (this repository would own recovery entirely) |
| Administration model | Strong fit (maps onto existing Postgres roles) | Acceptable (new IAM mapping required) | Acceptable (new role mapping required) | Weak fit (requires new operational expertise) |
| Maintenance burden | Strong fit (low incremental) | Acceptable (low once configured) | Strong fit (fully managed) | Weak fit (highest of all four) |
| Governed-function API integration | Strong fit (existing pattern extends directly) | Acceptable (new integration category) | Acceptable (new integration category) | Acceptable (new integration category) |
| Automation support for D15 rotation enforcement | Weak fit (custom-built) | Strong fit (native) | Weak fit (underlying-provider-dependent) | Strong fit (native) |
| Schema compatibility (`credential_references`) | Strong fit | Strong fit | Strong fit | Strong fit |
| Test/staging environment support | Unknown — requires verification (depends on Supabase project topology) | Strong fit | Strong fit (core product feature) | Strong fit (fully controllable) |
| Ownership model fit (D13) | Strong fit | Acceptable | Acceptable | Weak fit |
| Evidence for D17 (rotation/revocation/emergency-pause/expiration) | Acceptable, with custom-build cost | Strong fit | Acceptable, mixed | Strong fit, with operational-standup cost |
| Compliance/vendor-approval precedent | Strong fit (no new vendor) | Unknown — requires verification | Unknown — requires verification | Strong fit (no new vendor, but new operational surface) |

## 5. Tradeoff Analysis

**A. Supabase Vault**
- **Strongest advantage:** architectural coherence — the same Postgres-role/RLS/`SECURITY DEFINER` pattern already proven throughout this repository extends directly, with no new access-control paradigm to learn or integrate.
- **Strongest drawback:** the absence of native rotation and dedicated audit logging means D17's most demanding tests would require this repository to build the very lifecycle machinery a managed provider would otherwise supply.
- **Governance impact:** minimal — no new vendor relationship, no new decision class triggered under `Decision_Rights_and_Ownership.md`.
- **Operational burden:** low, but shifted into engineering effort (building rotation/audit logic) rather than eliminated.
- **Implementation complexity:** low for access control, moderate-to-high for lifecycle features.
- **Validation impact:** plausible but effort-intensive — D17's rotation and emergency-pause tests would be validating custom-built logic, not a managed feature.
- **Long-term architecture implications:** deepens this repository's existing Supabase coupling — consistent with its current architecture, but a real constraint if that coupling is ever revisited.

**B. AWS Secrets Manager**
- **Strongest advantage:** every D17 test category maps onto a native, managed feature — the lowest-effort path to satisfying the validation gate's own requirements.
- **Strongest drawback:** a wholly new vendor and account relationship, with no existing repository precedent to build on.
- **Governance impact:** likely triggers `Decision_Rights_and_Ownership.md`'s "New external integration or privileged tool" decision class in its own right, on top of this decision.
- **Operational burden:** low once set up, but setup itself (IAM structure, account governance) is nontrivial new work.
- **Implementation complexity:** moderate — a new identity-mapping layer between IAM and this repository's governed functions.
- **Validation impact:** strong — D17's live tests would exercise real managed features, not custom logic.
- **Long-term architecture implications:** introduces a second infrastructure provider alongside Supabase — a genuine architectural diversification, for better (redundancy, capability) or worse (more surfaces to govern).

**C. Doppler**
- **Strongest advantage:** environment separation is a first-class product feature, directly satisfying `Secrets_Management.md`'s own environment-separation requirement with minimal custom work.
- **Strongest drawback:** rotation of underlying provider credentials still depends on those providers' own capabilities — Doppler stores and serves secrets well but doesn't solve D15's rotation-enforcement requirement on its own.
- **Governance impact:** a new vendor relationship, recurring cost, and likely a new decision-class trigger.
- **Operational burden:** low — fully managed.
- **Implementation complexity:** moderate — a new external-API integration category.
- **Validation impact:** mixed — strong for versioning/environment tests, weaker for rotation-specific tests.
- **Long-term architecture implications:** a specialized dependency whose core value (multi-environment secret management) may be redundant if this repository's environment topology ends up simpler than Doppler is designed for.

**D. HashiCorp Vault**
- **Strongest advantage:** the most capable feature set of any candidate, with no ceiling on what a future, more sophisticated credential model could require.
- **Strongest drawback:** operational burden this repository has no existing capacity for — standing up, securing, and maintaining a Vault deployment is itself a significant undertaking before any credential validation could even begin.
- **Governance impact:** minimal externally (no new vendor), but significant internally (new operational ownership).
- **Operational burden:** the highest of all four candidates.
- **Implementation complexity:** the highest of all four candidates.
- **Validation impact:** strong once operational, but the path to "operational" is the longest of any candidate.
- **Long-term architecture implications:** maximum long-term flexibility, at the cost of near-term velocity — a plausible fit if Creator OS Foundry's secret-management needs grow substantially more complex than Tool Registry Security's current scope, but likely disproportionate to that scope today.

## 6. Recommended Provider

**Recommendation: Supabase Vault (Candidate A), with two specific facts requiring verification before this recommendation can be finalized.**

**Why it best matches current Creator OS Foundry architecture.** Every governed table in this repository already uses the same Postgres-role/RLS/`SECURITY DEFINER`-in-`creator_os_private` pattern Supabase Vault would extend directly — no new access-control paradigm, no new identity-mapping layer, no new vendor relationship. This is the only candidate where the integration work is genuinely incremental rather than a new category of work.

**Why it is preferred over the strongest alternative.** AWS Secrets Manager (Section 7) offers stronger native rotation and audit capabilities, but at the cost of introducing an entirely new external vendor and account relationship this repository has no existing precedent for — a materially larger governance and operational lift than extending infrastructure already in use.

**Known risks:**
- No native rotation or dedicated audit-logging feature means D17's rotation and audit-evidence tests would validate custom-built logic, not a managed capability — a real, non-trivial implementation cost this recommendation does not minimize.
- Deepens architectural coupling to Supabase specifically, a tradeoff worth the accountable owners' explicit awareness, not merely an incidental side effect.

**Unresolved facts requiring verification before implementation** (not resolved by this document):
1. **Whether the Vault extension (`pgsodium`-based) is actually enabled on Creator OS Foundry's current Supabase project, and whether the current plan tier supports it.** This document cannot verify this without live project access.
2. **Whether Supabase Vault's native audit and rotation gaps (Section 3) are acceptable to build custom, or whether that engineering cost changes the calculus toward AWS Secrets Manager.** This is a judgment call for the accountable owners, informed by engineering-capacity considerations this document is not positioned to weigh.

**This is a recommendation, not a forced conclusion.** If the accountable owners weight D17's validation-effort cost more heavily than architectural coupling, AWS Secrets Manager (Section 7) is a legitimate, well-supported alternative recommendation this document does not attempt to talk anyone out of.

## 7. Strongest Alternative

**AWS Secrets Manager (Candidate B).**

**When it would be preferable:** if the accountable owners prioritize minimizing custom engineering effort for D17's live-validation suite over architectural coupling — since AWS Secrets Manager's native rotation, versioning, and audit-logging features directly satisfy most of D17's requirements without this repository needing to build any of that logic itself.

**What tradeoff would justify choosing it instead:** accepting a new external vendor relationship and the governance overhead of establishing one (likely its own `Decision_Rights_and_Ownership.md` "New external integration" decision), in exchange for materially lower implementation effort on the rotation/audit-evidence portions of D17's test suite specifically.

**What Creator OS Foundry would gain:** managed rotation, native audit logging via CloudTrail, and a proven versioning model — capability this repository would otherwise need to build itself under Candidate A.

**What Creator OS Foundry would give up:** the architectural simplicity of staying entirely within its existing Supabase-based infrastructure, and would take on a second infrastructure provider to govern, secure, and maintain a relationship with going forward.

## 8. Accountable Ownership

Grounded directly in existing repository roles — no new role is introduced:

- **Who recommends:** this document itself, authored under Security Owner and Architecture Owner's document ownership, consistent with `COS-MVP-003_Phase_7_Secret_Manager_Provider_Decision_Framework.md`'s own Section 4.
- **Who must approve:** **Security Owner**, as the primary accountable role per `COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md`'s Decision 1 and `08_Security/Secrets_Management.md`'s own document ownership; **Architecture Owner**, for the integration-surface implications named throughout Sections 3–5; **Data Owner**, co-owner per the Decision Framework's own Section 4 and consistent with Data Owner's role in every other evidence-related decision throughout this Phase 7 effort.
- **Who would later operate the selected provider:** the **Automation Owner** (co-owner of secret lifecycle responsibility per D14) and whichever future **Tool Owner** role exists, per D14's own established split between policy-setting (Security Owner) and operational execution (Tool Owner).

**No approval is granted by this document.** The distinction between "recommends" and "must approve" is not incidental — this document performs only the former.

## 9. Decision Options

Presented for the accountable owner's explicit selection. **Selected: APPROVE WITH CONDITIONS**, per the Final Decision Outcome recorded above — the three conditions the accountable owner attached are recorded there verbatim, not the illustrative examples originally offered below, which are retained for reference only:

- **APPROVE** — accept the recommendation (Supabase Vault) as stated. *(Not selected.)*
- **APPROVE WITH CONDITIONS** — accept a candidate (Supabase Vault or another) subject to specific, named conditions. **← Selected.** Illustrative examples originally offered here, not applied automatically and not the conditions actually attached: requiring confirmation that the Vault extension is enabled before proceeding; requiring a specific custom-audit-logging design to be reviewed before D17 validation begins; requiring a documented rotation-automation design before implementation starts. The actual conditions attached appear in the Final Decision Outcome section above.
- **REJECT** — decline the recommended candidate and request an alternative evaluation, a different candidate emphasis, or additional criteria this document did not consider. *(Not selected.)*
- **DEFER** — decline to decide at this time, with a stated reason and, where known, a condition or timeframe for revisiting. *(Not selected.)*

## 10. Downstream Impact

**Now that a provider direction is selected, the following can be scoped concretely** — none is performed by this document, and none proceeds until the conditions below are satisfied:
- **G04 Tool Registry Security validation preparation** — Supabase Vault's own test/staging tier can now be identified as the target, once Condition 1 (availability/compatibility) is confirmed.
- **D17 live-executed credential testing** — a concrete target for rotation, revocation, emergency-pause, and expiration tests, once Condition 2 (workflow satisfaction) is confirmed.
- **Test credential provisioning** — a defined path for provisioning genuinely test-scoped credentials, per `Secrets_Management.md`'s existing Provisioning Process.
- **Rotation, revocation, emergency-pause, and expiration testing** — each now has a named provider to test against, but each remains blocked until this decision's own three conditions are confirmed and the live-executed tests are actually performed.

**Provider selection does not clear G04, and does not mark Tool Registry Security validation unblocked.** It removes exactly one prerequisite — the provider question — while three new, explicit verification items (this decision's own conditions) and the pre-existing G05 (live/staging environment) requirement all remain outstanding. Per `COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md`'s own dependency mapping, G04 requires both G05 and G06 — G06 is now resolved with conditions, not simply resolved, and G05 is untouched by this decision.

## 11. Implementation Preconditions

Prerequisites that remain even after this decision's approval — **none implemented by this document:**

- **This decision's own three conditions**, unresolved as of this recording:
  1. Availability and compatibility of Supabase Vault in the target Supabase environment — not yet confirmed.
  2. Whether rotation, revocation, expiration, and emergency workflows satisfy D17's validation requirements — not yet confirmed.
  3. Whether operational burden is acceptable compared with the AWS Secrets Manager alternative — not yet confirmed.
- **G05 (live/staging environment)** — per `COS-MVP-003_Phase_7_Validation_Environment_Readiness_Requirements.md`, still unavailable in this session.
- **Safe test credentials** — provisioned only after the three conditions above are confirmed and an environment exists.
- **Schema/planning dependencies** — the `credential_references`/`integrations` schema remains at the design-review stage, not yet migrated.
- **Access controls** — administrative access to Supabase Vault's own test/staging tier, not yet established.
- **Validation ownership** — a named individual or role actually executing D17's test suite, not yet assigned.
- **Evidence capture** — a durable mechanism for recording test results as actual evidence artifacts, per this repository's consistent standard, not yet built.

## 12. Governance Boundaries

This document explicitly does **not**:
- Select a provider on behalf of the accountable owner.
- Configure any secret storage.
- Create any credential.
- Authorize any migration.
- Authorize Tool Registry implementation.
- Authorize validation execution.
- Resolve G04.
- Resolve D07.
- Begin Phase 8 implementation.
- Change COS-MVP-002's release status.

## What This Document Does Not Do

- It does not select, configure, or provision any secret manager or provider.
- It does not create any credential or migrate any secret.
- It does not create any database migration or write any SQL.
- It does not modify any application source file or configuration file.
- It does not authorize Tool Registry implementation, Tool Registry Security validation, or any Phase 8 work.
- It does not resolve G04, G06, D07, or any other Phase 7 gate on its own authority.
- It does not modify any ratification record or any D01–D19 decision outcome.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.

## Ratification History

| Date | Action | Owner(s) who acted | Condition text (verbatim) |
| --- | --- | --- | --- |
| [Ratification Date — to be confirmed by accountable owner] | G06 decided: Approve with Conditions, Supabase Vault | Security Owner and Architecture Owner (per this document's ownership) | "Confirm availability and compatibility in the target Supabase environment." / "Confirm rotation, revocation, expiration, and emergency workflows satisfy D17 validation requirements." / "Confirm operational burden is acceptable compared with AWS Secrets Manager alternative." Implementation not authorized; validation required before production-ready credential handling. |

This entry is append-only in spirit, consistent with `COS-MVP-003_Phase_7_Decision_Ratification_Tracker.md`'s own convention — any future change to this outcome should be added as a new row, not by editing this one.

## References

- [COS-MVP-003 Phase 7 Secret Manager Provider Decision Framework](COS-MVP-003_Phase_7_Secret_Manager_Provider_Decision_Framework.md) — the evaluation criteria and process this record applies
- [Secrets Management](../08_Security/Secrets_Management.md) — source of every Security and Developer/Platform requirement in Section 2
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md) — source of the credential-reference and Tool Broker requirements referenced in Section 2
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md) — source of the tool-registration control rules referenced throughout
- [COS-MVP-003 Phase 7 Tool Registry Security Decision Record](COS-MVP-003_Phase_7_Tool_Registry_Security_Decision_Record.md) — source of D13–D19, unaltered by this document
- [COS-MVP-003 Phase 7 Tool Registry Security Implementation Specification](COS-MVP-003_Phase_7_Tool_Registry_Security_Implementation_Specification.md) — source of the Integration requirements in Section 2
- [COS-MVP-003 Phase 7 Validation Environment Readiness Requirements](COS-MVP-003_Phase_7_Validation_Environment_Readiness_Requirements.md) — source of the G05 dependency referenced in Sections 10–11
- [COS-MVP-003 Phase 7 Remaining Gates Closure Plan](COS-MVP-003_Phase_7_Remaining_Gates_Closure_Plan.md) — source of G04's own dependency on both G05 and G06
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md) — source of the ownership model in Section 8
- [COS-MVP-002 Internal MVP Release Decision Record](COS-MVP-002_Internal_MVP_Release_Decision_Record.md) — confirms COS-MVP-002's release status, unaffected by this document

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial secret manager / provider decision record: decision statement and scope; requirements pulled from repository sources across six categories; four realistic candidates evaluated (Supabase Vault, AWS Secrets Manager, Doppler, HashiCorp Vault) with capabilities stated as general product knowledge and Creator-OS-Foundry-specific unknowns explicitly flagged; a full evaluation matrix with "requires verification" used wherever a rating depended on an unconfirmed repository fact; a tradeoff analysis per candidate; a recommendation for Supabase Vault conditioned on two named unresolved facts, explicitly not forced; AWS Secrets Manager identified as the strongest alternative with its own tradeoff case; accountable ownership distinguishing who recommends, who approves, and who would operate; four explicit decision options (Approve/Approve with Conditions/Reject/Defer) presented without being applied; downstream impact clarifying provider selection removes one prerequisite, not all of G04; implementation preconditions still remaining after approval; explicit governance boundaries. No provider selected, no credential created, no implementation performed, no D01–D19 outcome changed, no release status changed. |
| 1.1 | Recorded the accountable-owner outcome: G06 decided as Approve with Conditions, Supabase Vault, with the three conditions preserved verbatim (environment availability/compatibility; D17 workflow satisfaction; operational burden vs. AWS Secrets Manager). Added a Final Decision Outcome section stating implementation is not authorized and validation remains required before production-ready credential handling; marked the selected option in Section 9; updated Section 10 to clarify provider selection removes only the provider prerequisite, not G04 or G05; updated Section 11 to add the three conditions as still-outstanding preconditions alongside G05; added a Ratification History table. No configuration performed, no credential created, no infrastructure created, no validation executed, no D01–D19 outcome changed, no release status changed. |
