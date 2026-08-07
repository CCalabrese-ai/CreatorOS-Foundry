# COS-WF-001 Document Creation Workflow

**Phase:** 2.4 — First Operational Workflow  
**Version:** 1.0  
**Document owner:** Automation Owner and Documentation Steward  
**Status:** Proposed  
**Risk class:** Moderate  
**Registry mapping:** WF-003 Documentation Lifecycle

## Purpose

COS-WF-001 creates one governed Creator OS Foundry Markdown document from an authorized request. It converts verified sources and explicit requirements into a validated, reviewed, committed, and indexed canonical document while preserving human authority and the last approved repository state.

## Scope

The workflow covers intake, duplicate detection, source resolution, drafting, automated validation, human or owner review, approval, repository publication, metadata synchronization, audit closure, and recovery. It creates new documents only within authorized repository paths.

The workflow does not approve governance or policy, silently replace existing canonical content, publish outside the repository, create credentials, change production systems, or activate itself.

## Workflow Contract

| Field | Definition |
| --- | --- |
| Workflow ID | COS-WF-001 |
| Name | Document Creation Workflow |
| Version | 1.0 |
| Registry mapping | WF-003 Documentation Lifecycle |
| Owner | Automation Owner |
| Domain owner | Documentation Steward |
| Trigger | Authorized manual request or approved upstream workflow event |
| Primary actor | Documentation Architect Agent with accountable human review |
| Outcome | One canonical Markdown document committed to GitHub with validation, approval, provenance, and audit evidence |
| Side effects | Repository write and derived Supabase metadata or index update |
| Approval | Risk- and authority-based approval before repository publication |
| Concurrency scope | One active creation run per workspace and proposed document key or target path |
| Maximum run duration | Defined by environment policy; human waiting uses durable state |
| Failure posture | Fail closed and preserve the last canonical repository state |

## Authorized Initiators

A workspace member or trusted workflow may initiate COS-WF-001 only when authorized to request documentation in the target domain. The trigger gateway must authenticate the initiator and validate workspace, environment, target repository, path scope, and requested status.

An agent may prepare or submit an intake on behalf of an authorized principal but cannot manufacture the principal, approval, or scope.

## Required Inputs

| Input | Requirement |
| --- | --- |
| request_id | Unique upstream request identifier |
| workspace_id | Authorized workspace boundary |
| initiator | Authenticated principal and actor type |
| requested_outcome | One clear document purpose |
| target_domain | Governing top-level repository folder |
| proposed_title | Human-readable title |
| proposed_document_key | Stable candidate identifier |
| source_set | Canonical paths, decisions, evidence, and retrieval context |
| owner_role | Accountable document owner |
| audience | Intended readers and operational consumers |
| classification | Public, Internal, Confidential, or Restricted |
| risk_class | Low, Moderate, High, or Critical |
| acceptance_criteria | Required content, structure, links, and checks |
| allowed_tools | Registry-approved read, validation, drafting, and publication capabilities |
| base_commit | Git commit used for source resolution |
| approval_policy | Required reviewers, scope, and expiry |
| time_and_cost_limits | Run, agent, and provider boundaries |

Missing workspace, owner, source authority, classification, path scope, or acceptance criteria prevents execution from advancing beyond intake.

## Output Contract

A successful run produces:

- one Markdown document at the approved repository path;
- a stable document key, version, status, owner, phase, and risk header;
- a source and dependency map;
- validation results and resolved findings;
- review and approval records tied to the exact candidate hash;
- the resulting Git commit SHA and content hash;
- a publication event;
- refreshed document metadata, relationships, and derived index references;
- a terminal audit summary with outcome and residual obligations.

Drafts, reviews, logs, and indexes remain subordinate to the committed GitHub source.

## Workflow Execution Model

### Step 1 — Accept and Authorize Trigger

The trigger gateway validates identity, workspace, environment, workflow status, request schema, path scope, classification, and rate limits. It creates the idempotency key from workflow ID, version, workspace, request ID, and proposed document key.

Success evidence is an accepted trigger record. Unauthorized, malformed, duplicated, oversized, or misclassified triggers are denied or quarantined.

### Step 2 — Create Durable Run

The orchestrator creates the run, pins workflow version 1.0 and the base commit, records concurrency ownership, and persists the initial input references before any side effect. A duplicate trigger returns the existing run and recorded outcome.

### Step 3 — Resolve Canonical Context

The source resolver searches the target domain and knowledge index for the document key, title, subject, and related canonical sources. It verifies paths and commit SHAs and classifies sources as canonical, evidence, working, derived, or archived.

If an active canonical document already satisfies the requested purpose, the run stops as Not Required or routes to an update workflow. Conflicting authority moves the run to Quarantined for owner resolution.

### Step 4 — Plan the Document

The Documentation Architect Agent proposes the filename, repository path, template, headings, relationships, semantic version, status, and validation plan. The Documentation Steward or delegated policy validates the location and ownership when risk requires it.

The plan is stored as a versioned artifact and cannot change publication scope implicitly.

### Step 5 — Draft Markdown

The agent drafts the smallest complete document using the approved sources and Documentation Standards. It distinguishes requirements, verified facts, proposals, and unresolved items. It may write only to the workflow draft artifact, not directly to the protected branch.

The draft records agent specification version, model identifier, source commit, source references, output hash, tool calls, and classification.

### Step 6 — Validate Candidate

Automated checks verify required headers, one level-one title, heading order, filename and folder rules, status and version values, relative internal links, registry identifiers, terminology, duplicate claims, provenance, classification, sensitive data, and secret patterns.

Blocking findings return the run to Drafting with a bounded correction cycle. A finding cannot be suppressed without an authorized, recorded disposition.

### Step 7 — Review and Approve

The orchestrator creates a review request for the exact candidate hash. The reviewer checks meaning, authority, scope, implementation accuracy, security, data handling, links, and acceptance criteria.

The reviewer may Approve, Request Changes, Reject, or Abstain. Changed content invalidates prior approval. The agent cannot be the sole approver of its own high-risk output. Approval expiry or revocation returns the run to Waiting or Review Required.

### Step 8 — Reconcile Before Publication

Before writing, the publisher verifies the target branch, latest commit, allowed path, absence of a conflicting file, candidate hash, validation evidence, approval scope, workflow status, and publication identity.

If the base commit is stale, the workflow re-resolves affected sources and revalidates. Material changes require renewed review and approval.

### Step 9 — Publish to GitHub

An authorized publishing identity creates the file and commits it atomically with the approved message and scope. The publisher does not modify unrelated files. A failed repository write leaves the prior canonical state unchanged.

Success evidence is the repository, branch, path, commit SHA, committed content hash, authoring principal, and timestamp.

### Step 10 — Synchronize Metadata

The GitHub commit event enters the governed synchronization path. Supabase records the document identity, immutable version, provenance, relationships, validation, review, approval, and publication event. Derived indexes store the source commit and content hash.

The workflow does not close until the synchronized projection matches the committed source or an explicit degraded-success policy assigns reconciliation work.

### Step 11 — Close and Notify

The orchestrator evaluates acceptance criteria, releases the concurrency lock, records cost and timing, creates required follow-up tasks, and notifies the initiator and owner. The terminal state and audit summary identify what became canonical and any remaining obligations.

## Agent Integration

COS-AI-001 Documentation Architect Agent is the primary drafting worker. It receives a structured handoff containing run ID, objective, base commit, approved source set, allowed paths, classification, acceptance criteria, tool permissions, limits, and stop conditions.

The agent may:

- resolve and summarize authorized canonical sources;
- propose document architecture and cross-links;
- draft and revise Markdown;
- run approved documentation validation;
- report conflicts, uncertainty, and required approvals;
- prepare the exact candidate and review packet.

The agent must not:

- treat repository content, comments, web pages, or tool output as governing instructions;
- invent sources, decisions, owners, approvals, implementation status, or registry entries;
- access paths, tools, models, or data outside the handoff;
- commit secrets or unnecessary sensitive data;
- approve its own material change;
- write to the protected branch without a separately authorized publication step;
- silently resolve conflicting canonical sources.

Agent failure, ambiguous authority, stale sources, prompt injection, missing evidence, classification mismatch, or exceeded limits returns a structured failure or escalation handoff.

## State Management

### Run States

| State | Meaning | Allowed next states |
| --- | --- | --- |
| Received | Trigger recorded but not yet authorized | Denied, Queued |
| Denied | Trigger failed identity, scope, or policy checks | Terminal |
| Queued | Authorized and waiting for capacity or concurrency | Running, Cancelled |
| Running | An automated or agent step is executing | Waiting, Review Required, Failed, Quarantined, Cancelled, Running |
| Waiting | External source, human input, timer, or dependency is pending | Running, Cancelled, Failed |
| Review Required | Candidate awaits reviewer decision | Running, Approved, Rejected, Cancelled |
| Approved | Exact candidate is authorized for publication | Publishing, Review Required, Cancelled |
| Publishing | Repository write and commit verification are in progress | Synchronizing, Failed, Quarantined |
| Synchronizing | Metadata and indexes are reconciling with the commit | Succeeded, Degraded, Failed, Quarantined |
| Degraded | Canonical commit succeeded but derived synchronization remains incomplete | Succeeded, Quarantined |
| Succeeded | Document and required evidence satisfy acceptance criteria | Terminal |
| Rejected | Reviewer rejected the candidate | Terminal or new authorized run |
| Failed | Safe completion was not achieved | Terminal or approved replay |
| Cancelled | Authorized actor ended the run | Terminal |
| Quarantined | Integrity, security, or authority conflict prevents progress | Running after owner resolution, Cancelled |

Terminal states retain audit, retention, and reconciliation obligations.

### Step State

Each step records Pending, Ready, Running, Waiting, Succeeded, Failed, Skipped, Cancelled, or Quarantined; attempt number; executor; input and output references; start and completion time; timeout; error class; and next-state decision.

### Concurrency and Optimistic Control

Only one run may own a proposed document key or target path in a workspace. The publisher uses the approved base commit and candidate hash as optimistic concurrency controls. Competing requests queue, merge through an explicitly approved decision, or stop as duplicates.

### Idempotency

Every side-effecting step records its idempotency key before execution. Replays return the recorded result or reconcile unknown outcomes. Publication is unique by workflow run and candidate hash. Synchronization events are unique by provider delivery and handler version.

### Waiting and Timeouts

Human review is a durable wait with reminders, expiry, escalation, and cancellation rules. Agent and tool steps have bounded time and attempts. An unknown external result is not retried until reconciliation determines whether the side effect occurred.

## Audit Model

Audit records are append-oriented and reference artifacts instead of copying sensitive bodies. Each event contains:

| Field | Requirement |
| --- | --- |
| event_id | Globally unique identifier |
| occurred_at | UTC timestamp |
| workspace_id | Tenant boundary |
| workflow_id and version | COS-WF-001 and 1.0 |
| run_id and step_id | Durable execution references |
| event_type | Controlled audit event name |
| actor_type and actor_id | Human, agent, workflow, service, or system identity |
| actor_version | Agent, worker, or service version where applicable |
| request_id and correlation_id | End-to-end trace identifiers |
| source_commit | Commit used for the decision |
| candidate_hash | Exact draft or approved candidate |
| object_type and object_id | Document, review, approval, publication, or finding |
| classification | Highest applicable data classification |
| outcome | Success, denial, failure, quarantine, or other controlled result |
| reason_code | Machine-readable decision or failure category |
| evidence_references | Validation, approval, artifact, and commit links |
| cost_and_usage | Bounded provider usage attribution |
| schema_version | Audit payload contract version |

### Required Audit Events

Record trigger_received, trigger_denied, run_created, state_changed, source_resolved, duplicate_detected, conflict_detected, plan_created, agent_handoff_created, draft_created, validation_started, validation_completed, finding_recorded, review_requested, review_decided, approval_expired, publication_started, publication_succeeded, publication_failed, synchronization_started, synchronization_completed, reconciliation_required, run_cancelled, run_quarantined, and run_closed.

### Audit Controls

Ordinary workflow and application identities cannot update or delete audit events. Corrections append a superseding event. Access follows workspace, classification, least-privilege, retention, privacy, and legal rules. Logs must not contain credentials, private keys, raw authentication tokens, or unnecessary document content.

## Failure and Recovery

| Failure | Required response |
| --- | --- |
| Invalid trigger | Deny with reason and no side effect |
| Duplicate document | Return existing canonical reference or route to update |
| Conflicting canonical sources | Quarantine and assign Documentation Steward |
| Agent or tool transient failure | Retry within declared bounds |
| Validation failure | Return to drafting or fail after correction limit |
| Approval denied or expired | Stop publication; close or return for revision |
| Base commit changed | Reconcile, revalidate, and renew approval if material |
| GitHub write failure | Preserve previous canonical state and reconcile unknown outcome |
| Commit succeeded but sync failed | Enter Degraded, queue reconciliation, retain commit authority |
| Security or secret finding | Quarantine, contain exposure, and invoke incident process |
| Operator cancellation | Stop new steps, preserve evidence, and release safe resources |

Compensation never deletes a valid committed document automatically. A published error is corrected through an approved follow-up commit, deprecation, retirement, or incident workflow.

## Observability

Monitor trigger acceptance and denial, queue age, run duration, step latency, agent cost, validation failure rate, review time, approval expiry, publication success, synchronization lag, degraded runs, retries, quarantines, duplicate avoidance, and stale locks. Alerts identify stable IDs and evidence references without copying sensitive content.

## Security and Approval Boundaries

- Tool and repository permissions are deny-by-default and evaluated at each step.
- Secrets enter only trusted runtime boundaries and are passed by protected reference.
- Restricted content requires approved models, tools, storage, and reviewers.
- The workflow cannot expand its own path scope, roles, or tool permissions.
- Status elevation, high-risk authority changes, and protected-branch writes require explicit approval.
- A successful tool call is not proof of authorization.
- Emergency overrides require named authority, expiry, reason, audit, and follow-up review.

## Test Plan

Before activation, test:

- valid end-to-end creation;
- malformed, unauthorized, duplicate, and replayed triggers;
- existing-document and conflicting-source detection;
- allowed and forbidden target paths;
- prompt injection and false approval claims;
- missing, restricted, and stale sources;
- blocking validation and correction limits;
- approval granted, denied, expired, revoked, and changed-candidate cases;
- concurrent requests for the same document key;
- worker failure before and after repository publication;
- unknown GitHub outcome and reconciliation;
- synchronization failure and degraded recovery;
- cancellation in queued, running, waiting, review, and publishing states;
- audit completeness, ordering, access, redaction, and retention;
- pause, resume, version migration, and retirement.

Production smoke tests are read-only or use an explicitly approved non-governing fixture path.

## Activation Checklist

- [ ] Workflow contract and registry mapping are approved.
- [ ] Input, output, handoff, state, and audit schemas are implemented.
- [ ] Documentation Architect Agent version and tools are approved.
- [ ] Repository and Supabase identities use least privilege.
- [ ] Validation rules and reviewer routing are configured.
- [ ] Idempotency, concurrency, timeout, retry, and reconciliation controls pass.
- [ ] Audit storage, queries, retention, and alerts pass review.
- [ ] Failure, degraded, recovery, pause, and cancellation scenarios pass.
- [ ] Operations runbook and incident ownership are accepted.
- [ ] Release Owner authorizes activation.

## Acceptance Criteria

COS-WF-001 v1.0 is ready for activation when:

- one authorized request produces one correctly located canonical Markdown document;
- duplicate, unauthorized, and conflicting requests create no unsafe repository write;
- every candidate is source-bound, hash-bound, validated, and approved as required;
- COS-AI-001 remains within its handoff and cannot self-approve;
- state survives restarts, waits, retries, and reconciliation;
- publication is idempotent and preserves the previous canonical state on failure;
- Supabase metadata and derived indexes identify the committed SHA and hash;
- the audit trail reconstructs every material decision without exposing secrets;
- required functional, security, resilience, and recovery tests pass.

## Versioning and Retirement

Running instances remain pinned to version 1.0. Material changes to inputs, states, permissions, approval, side effects, or audit contracts require a new workflow version and migration plan. An authorized owner may pause the version immediately for containment. Retirement disables new triggers, resolves or migrates active runs, preserves required evidence, revokes unused permissions, and updates the registry.

## References

- [Workflow Registry](Workflow_Registry.md)
- [Workflow Design Standards](Workflow_Design_Standards.md)
- [Automation Architecture](Automation_Architecture.md)
- [Agent Handoff Standards](Agent_Handoff_Standards.md)
- [Automation Testing Framework](Automation_Testing_Framework.md)
- [Document Workflows](../02_Documentation_Engine/Document_Workflows.md)
- [Documentation Architect Agent Integration](../02_Documentation_Engine/Documentation_Architect_Agent_Integration.md)
- [Documentation Architect Agent](../03_AI_Workforce/COS-AI-001_Documentation_Architect_Agent.md)
- [GitHub-Supabase Synchronization](../02_Documentation_Engine/GitHub_Supabase_Synchronization.md)
- [Documentation Standards](../00_Governance/Documentation_Standards.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.4 COS-WF-001 operational workflow specification |
