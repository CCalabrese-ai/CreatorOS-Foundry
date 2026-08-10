# COS-MVP-003 Phase 7 Tool Registry Security Design

**Phase:** 7 — Foundation
**Version:** 1.0
**Document owner:** Security Owner and Data Owner
**Status:** Security Design — No Implementation Started
**Risk class:** High
**Capability ID:** COS-MVP-003
**Release status:** Not applicable — design document, no capability exists to release yet

## Purpose

`COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md` identified the Tool Registry's credential storage/rotation security design as a workstream that can proceed independently of both blocked Phase 7 primitives (the Shared Approval/Evidence Primitive and Execution Safety Foundations). This document defines that security architecture — credential handling and tool trust boundaries — ahead of any Tool Registry implementation. **It is a design artifact only.** No credential is created, no secret is stored, no migration is created, no SQL is written, no application source or database file is modified, no capability is claimed to exist, and no release status changes. Every recommendation below is labeled as a recommendation, not a decision, following the same discipline every prior Phase 7 design document in this chain has held to.

## Maintaining the Distinction

- **Design ≠ implementation.** Nothing described below exists in `src/`, `supabase/migrations/`, or any secret manager. This document describes what a future build must satisfy.
- **Recommendation ≠ approval.** Every non-trivial choice below is presented as options with a labeled recommendation, not a ratified decision — this document introduces no Decision Record and ratifies nothing itself.
- **Security model ≠ credential deployment.** This document defines the architecture that would govern credentials once the Tool Registry is implemented. It does not create, provision, store, or reference any actual secret value, test or otherwise.

## 1. Objective

To define the security architecture the Tool Registry's credential handling and tool trust boundaries must satisfy before any registry implementation begins — closing the specific gap named in every prior Phase 7 planning document that has touched the Tool Registry: "credential handling requires deliberate security design... this repo has never yet implemented secret storage/rotation." This document also corrects the framing of that gap: as Section 2 establishes, this is **not** a from-scratch design problem — `08_Security/Secrets_Management.md` already specifies a complete secrets-management standard, this repository has simply never applied it to a concrete consumer, since no capability that needs a secret has been built yet. The Tool Registry, once implemented, is that first concrete consumer. This document's job is to apply the existing standard to the Tool Registry's specific `credential_references` entity and tool-trust model, not to invent a new one.

## 2. Security Principles

Grounded directly in named sources, not newly asserted:

- **Deny-by-default, scoped access.** `Tool_Registry.md`'s own Control Rules: "Tool access is deny-by-default and scoped by role, workflow, environment, and data classification." This document does not weaken or reinterpret that rule.
- **Secrets are referenced, never committed.** `Tool_Registry.md`: "Secrets must be referenced, never committed." `Secrets_Management.md`'s Core Requirements state this more fully: repository files, documentation, prompts, model memory, chat, tickets, logs, analytics, and ordinary database fields must not contain secret values — applications receive secrets at runtime through protected references only.
- **Least privilege by design, not retrofit.** `System_Charter.md`'s Governing Principle 3: "Every user, agent, tool, and automation receives only the access required for its purpose." `System_Charter.md`'s Principle 6, "Secure by design": "Secrets, private data, and external writes are controlled at system boundaries" — this document treats the boundary between the Tool Registry's governed data (public schema) and any actual secret value (an external secret manager) as exactly such a boundary.
- **T3/T4 actions require explicit safeguards; T4 requires human approval.** `Tool_Registry.md`'s Risk Classes and Control Rules, unchanged and restated, not reinterpreted, in Section 4 below.
- **No self-authorization for privileged access.** `Decision_Rights_and_Ownership.md`'s Decision Classes: "New external integration or privileged tool" requires Security Owner and the relevant Domain Owner — never a single, self-interested approval path.
- **Observable and reversible.** `System_Charter.md`'s Principle 5, applied to credentials specifically via `Secrets_Management.md`'s Rotation and Revocation section: every credential must have a tested revocation path, not merely a theoretical one.

## 3. Credential Lifecycle Model

Every stage below applies `Secrets_Management.md`'s existing, general standard to the Tool Registry's specific `credential_references` entity (per `Schema_Specification.md`: `integration_id, secret_provider, secret_identifier, rotation_due_at`) and `integrations` entity (`tool_id, environment, configuration_reference, status`). No new secrets-handling policy is invented here; this section is an application, not a redesign.

### Creation

A credential is provisioned only through `Secrets_Management.md`'s existing Provisioning Process (approve purpose/owner/consumers/environment/least-privilege, generate through an approved provider, store directly in protected secret storage, grant retrieval only to named runtime identities). The Tool Registry's own contribution is the *approval gate* preceding provisioning: per `Decision_Rights_and_Ownership.md`, a new external integration or privileged tool requires Security Owner and the relevant Domain Owner sign-off before Step 1 of the provisioning process may begin — the Tool Registry's `Candidate` → `Approved` lifecycle transition (Section 4) is where that gate lives, not a separate approval invented for credentials specifically.

### Storage

Only a **reference** is ever stored in the Tool Registry's own tables (`credential_references.secret_identifier`, `secret_provider`) — never a value, per `Secrets_Management.md`'s explicit prohibition ("ordinary database fields must not contain secret values") and `Tool_Registry.md`'s own rule. The actual secret lives exclusively in an approved secret manager, external to this repository's own database, consistent with `System_Charter.md`'s "Secrets... are controlled at system boundaries."

### Rotation

Per `Secrets_Management.md`'s Rotation and Revocation section, applied here: rotation occurs on schedule (`credential_references.rotation_due_at`, already specified), before expiry, after personnel/ownership changes, after provider risk changes, and immediately after suspected exposure. Rotation must support an overlap window where continuity requires it, verify the new credential, revoke the old one, and confirm no consumer still depends on it — this document does not relax any of these five requirements for the Tool Registry's specific case.

### Revocation

Per `Agent_Tool_Permissions.md`'s Revocation and Emergency Pause section (written for agent-held grants, applying identically here to tool-level credentials): Security Owner, Agent Owner, Tool Owner, or an authorized incident workflow may revoke a credential or pause a tool immediately, and active runs must re-evaluate permissions before their next call — no in-flight operation continues on a revoked credential past its next authorization check.

### Expiration

`credential_references.rotation_due_at` establishes an enforced lifecycle date, per `Secrets_Management.md`'s Secret Inventory field list. A credential past its rotation-due date is treated as expired for new use, consistent with `Agent_Tool_Permissions.md`'s broader principle that "a lapsed authorization should not silently persist" (the same principle already recommended for the Shared Approval/Evidence Primitive's own expiry model, Decision Record Decision 3) — this document recommends the same non-auto-renewal posture for credentials specifically, though this is a recommendation, not yet a ratified Tool Registry decision (Section 10).

## 4. Tool Trust Classification

Restated unchanged from `Tool_Registry.md`, not redesigned:

| Class | Meaning | Registration examples (per the current registry) |
| --- | --- | --- |
| T1 | Read-only, public, or draft-local capability | — |
| T2 | Internal write capability with bounded impact | TOOL-005 (Local Development Runtime, `Approved`) |
| T3 | External side effects, sensitive data, privileged access, or meaningful spend | TOOL-001 (GitHub, `Active`), TOOL-002 (OpenAI Platform, `Candidate`), TOOL-004 (WaveSpeed, `Candidate`) |
| T4 | Destructive, public, financial, identity, or security-critical capability | TOOL-003 (Supabase, `Candidate`) |

**Recommendation:** credential-handling rigor should scale with risk class, not apply uniformly. T1/T2 tools (no sensitive credential, or a low-blast-radius one) follow the baseline lifecycle in Section 3. T3 tools require the full `Secrets_Management.md` standard applied without exception. T4 tools — per `Tool_Registry.md`'s own rule, "T4 actions require human approval unless a documented governance exception exists" — additionally require the credential's provisioning, rotation, and revocation events themselves to be evidenced with the same rigor as the T4 action they enable, not merely the action. This is a recommendation for the eventual Tool Registry Decision Record to ratify, not a decision made here.

## 5. Permission Boundaries

Directly reusing `Agent_Tool_Permissions.md`'s existing Permission Model — this document does not propose a separate permission model for credentials specifically, since one already exists and already names credentials as one of its required dimensions:

- Authorization is the intersection of: approved agent version, active Tool Registry entry, workflow and step, task-specific allowed operations, workspace and resource scope, environment, data classification, authenticated runtime identity, required approval, and time/rate/cost limits. **If any dimension is missing or incompatible, access is denied** — restated verbatim because this document changes nothing about it.
- The `credential_reference` field is already named in the existing Permission Grant Schema as "Protected runtime identity reference" — this document's contribution is confirming that field's Tool-Registry-specific source (`credential_references.secret_identifier`), not redefining the schema.
- **Capability Classes** (Read, Draft, Internal write, External effect, Financial, Destructive, Identity and privileged), per `Agent_Tool_Permissions.md`, map directly onto the T1–T4 risk classes in Section 4 — this document does not introduce a second, parallel classification, it confirms the existing one already covers credential-relevant distinctions (e.g., "Identity and privileged" already specifies "Human approval, short-lived access, enhanced audit" as its default control).

## 6. Approval/Security Relationship

**What depends on the Shared Approval/Evidence Primitive:**
- The Tool Registry's own `Candidate` → `Approved` → `Active` lifecycle transitions (the governance gate named in Section 3's Creation stage) are approval-gated, and per `COS_Architecture_Implementation_Map.md`'s dependency graph, the Tool Registry as a whole depends on the Shared Approval/Evidence Primitive for exactly this reason — its own approval decisions need a governed evidence mechanism, which is currently blocked pending ratification.
- T4 action approval specifically (per `Tool_Registry.md`'s "T4 actions require human approval") would, once the Tool Registry is fully implemented, plausibly consume the shared primitive the same way any other approval-gated action would.

**What can exist independently, and is what this document actually defines:**
- The credential lifecycle model (Section 3), tool trust classification (Section 4), and permission boundaries (Section 5) described here do not require the Shared Approval/Evidence Primitive to exist — they apply `Secrets_Management.md`'s and `Agent_Tool_Permissions.md`'s already-ratified-in-spec standards, neither of which references the still-blocked primitive at all.
- This is the same independence finding `COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md` already established for this exact workstream (Section 3: "Tool Registry's credential storage/rotation design specifically... does not require the Shared Approval/Evidence Primitive to exist") — this document confirms that finding by producing the actual design and finding no hidden coupling, rather than merely asserting independence in the abstract.

## 7. Ownership Model

Directly from `Decision_Rights_and_Ownership.md` and `Tool_Registry.md`, not newly invented:

- **Tool Registry ownership:** "Security Owner and relevant Domain Owner," per `Tool_Registry.md`'s own header.
- **New external integration or privileged tool approval:** Security Owner and relevant Domain Owner, per `Decision_Rights_and_Ownership.md`'s Decision Classes.
- **Security exception or accepted residual risk** (e.g., a documented T4 governance exception per `Tool_Registry.md`'s own allowance): System Owner and Security Owner jointly.
- **Credential rotation/revocation authority:** Security Owner, Agent Owner, Tool Owner, or an authorized incident workflow, per `Agent_Tool_Permissions.md`'s Revocation and Emergency Pause section, applied here.
- **Role-based, not person-based**, consistent with the precedent already established across the Shared Approval/Evidence Primitive's Decision Record (Decision 5) and Execution Safety Foundations' Decision Record (Decision 2, 3) — this document does not deviate from that established pattern for credentials specifically.

## 8. Audit/Evidence Requirements

- **Secret inventory metadata**, per `Secrets_Management.md`: Secret ID, Owner, Purpose, Provider, Environment, Consumers, Privilege, Created/rotated timestamps, Expiry/rotation-due date, Revocation path, Data classification — "the inventory must never store the secret value," restated because it is the single most important requirement in this entire document.
- **Tool call audit**, per `Agent_Tool_Permissions.md`'s existing Audit section: grant decision, agent and tool versions, operation, normalized arguments hash, destination, identity reference, approval reference, timestamp, latency, outcome, error class, cost, and correlation IDs — "redact secrets and minimize sensitive arguments," unchanged.
- **Governed-mutation discipline applies to `credential_references` and `integrations` the same as any other table** — no direct write grant to any application role; all changes route through a `SECURITY DEFINER` function that re-verifies authorization at the moment of change, per the pattern proven for documents and recommended throughout this Phase 7 chain.
- **Rotation and revocation must themselves be evidenced**, per `Secrets_Management.md`'s Acceptance Criteria: "Rotation and revocation are tested," not merely specified.

## 9. Threat Considerations

Grounded in `Agent_Tool_Permissions.md`'s existing Testing and Argument/Destination Validation sections, applied to the credential-handling surface specifically:

- **Prompt injection / confused-deputy risk.** `Agent_Tool_Permissions.md` already names "prompt injection, confused-deputy cases" as required test scenarios — relevant here because a compromised or manipulated agent prompt attempting to exfiltrate a credential reference (not the value itself, since agents "never receive raw long-lived credentials," per `Secrets_Management.md`) is a live threat surface for any tool-calling agent, not a hypothetical one.
- **Redirect and destination tampering.** `Agent_Tool_Permissions.md`'s Argument and Destination Validation: "Redirects and dynamically supplied destinations require policy validation" — directly relevant to any credential-bearing call to an external tool, where a manipulated destination could exfiltrate data alongside an authorized credential reference.
- **Exposure response.** `Secrets_Management.md`'s Detection and Response section already defines the process (stop disclosure, revoke/rotate, preserve evidence without copying the value, identify affected systems, update dependents, test restored/denied access, document) — this document does not redesign it, only confirms the Tool Registry's `credential_references` entity must be a first-class participant in that existing process once implemented.
- **Cross-workspace and cross-environment leakage.** `Agent_Tool_Permissions.md`'s Testing section already requires testing "cross-workspace and cross-environment access" — directly applicable, since `credential_references` and `integrations` are both environment-scoped fields already in the specified schema.
- **Service-role credential misuse.** `Secrets_Management.md`: "Never expose service-role or privileged credentials to browsers, mobile clients, or untrusted AI workers" — a hard boundary this design does not soften for any tool risk class, including T1.

## 10. Open Security Decisions

Not resolved by this document, requiring accountable-owner review before a future Tool Registry Decision Record treats any of them as settled:

- **Whether credential-handling rigor formally scales by T1–T4 class** (Section 4's recommendation), or whether the full `Secrets_Management.md` standard applies uniformly regardless of risk class — this document recommends scaling but does not decide it.
- **Whether credential non-auto-renewal past `rotation_due_at`** (Section 3's Expiration recommendation) is the correct posture, or whether a grace-period/auto-renewal model is preferred for operational continuity — not decided here.
- **Which specific secret manager/provider** is approved for Tool Registry use — `Secrets_Management.md` names "an approved secret manager or platform-protected secret facility" generically; no specific provider is named or selected by this document.
- **Whether T4 governance exceptions** (per `Tool_Registry.md`'s "unless a documented governance exception exists") require the same System Owner + Security Owner joint approval named generally in `Decision_Rights_and_Ownership.md`'s "Security exception" decision class, or a Tool-Registry-specific variant — assumed consistent with the general rule in this document but not independently ratified for the Tool Registry's own governance.
- **How this design's credential-handling requirements interact with the still-blocked Shared Approval/Evidence Primitive** once that primitive is ratified and the Tool Registry's own approval-gated lifecycle can be fully designed — Section 6 establishes independence for what this document covers, but the eventual full Tool Registry design will need to reconcile both.

## 11. Explicit Out of Scope

- **Any credential creation, storage, or reference to an actual secret value** — none exists anywhere in this document, in any form, including as an illustrative example.
- **Any SQL, migration, or schema implementation** — the `credential_references`/`integrations` field lists cited here are already specified in `Schema_Specification.md`; this document does not create, alter, or migrate them.
- **Any application source file, secret manager configuration, or service module.**
- **The Tool Registry's full Implementation Plan, Technical Design, Decision Record, or Schema Design Review** — this document is a narrow security-architecture input to that future chain, not a substitute for it, consistent with the narrow scoping `COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md` Section 5 explicitly required ("explicitly not extended into the Tool Registry's approval-gated lifecycle design").
- **The Tool Registry's approval-gated lifecycle transitions themselves** — named in Section 6 as dependent on the still-blocked Shared Approval/Evidence Primitive, and not designed here.
- **Selection of a specific secret-manager provider** — named as an open decision in Section 10, not chosen here.
- **Any change to the Shared Approval/Evidence Primitive's or Execution Safety Foundations' status** — both remain exactly as their own Decision Records and Readiness Reviews state.

## What This Document Does Not Do

- It does not create, store, or reference any actual credential or secret value.
- It does not write any SQL or create any migration.
- It does not modify any application source file or database file.
- It does not claim any part of the Tool Registry is implemented.
- It does not change COS-MVP-002's or any other capability's release status, which remains **Not Released**.
- It does not create or reference any tag or release.
- It does not change the Phase 7 → Phase 8 → Phase 9 sequencing established by `COS_Next_Phase_Product_Roadmap.md`.
- It does not authorize implementation to begin — it is a design for review, not a work order.

## References

- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [Agent Tool Permissions](../03_AI_Workforce/Agent_Tool_Permissions.md)
- [System Charter](../00_Governance/System_Charter.md)
- [Decision Rights and Ownership](../00_Governance/Decision_Rights_and_Ownership.md)
- [Secrets Management](../08_Security/Secrets_Management.md) — the existing, already-specified standard this document applies to the Tool Registry rather than re-designing
- [COS Next Phase Product Roadmap](COS_Next_Phase_Product_Roadmap.md)
- [COS Architecture Implementation Map](COS_Architecture_Implementation_Map.md)
- [COS-MVP-003 Phase 7 Continuation and Sequencing Review](COS-MVP-003_Phase_7_Continuation_and_Sequencing_Review.md) — identified this workstream and its scope boundary
- [COS-MVP-003 Phase 7 Live State Reconciliation Report](COS-MVP-003_Phase_7_Live_State_Reconciliation_Report.md) — confirms the live `tools` table remains provisioned-only, consistent with this document's premise that no Tool Registry implementation exists yet
- [Schema Specification](../05_Database/Schema_Specification.md) — `tools`, `tool_permissions`, `integrations`, `credential_references` field lists this document generalizes from

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Tool Registry Security Design: objective correcting the "credential handling is a from-scratch design problem" framing (a full `Secrets_Management.md` standard already exists, unapplied to any concrete consumer); security principles grounded in named sources; a credential lifecycle model (creation, storage, rotation, revocation, expiration) applying the existing secrets standard to the Tool Registry's specific entities; tool trust classification restated from `Tool_Registry.md` with a risk-scaled rigor recommendation; permission boundaries reusing the existing Agent Tool Permissions model unchanged; an approval/security relationship distinguishing what depends on the still-blocked Shared Approval/Evidence Primitive from what does not; an ownership model sourced directly from Decision Rights and Ownership; audit/evidence requirements; five named threat considerations; five open security decisions; explicit out-of-scope boundaries. No credential created, no secret stored, no implementation performed, no decision ratified, no release status changed. |
