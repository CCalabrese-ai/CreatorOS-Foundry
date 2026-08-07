# Creator OS Foundry GitHub-Supabase Synchronization

**Phase:** 2.2 — Documentation Engine Implementation  
**Version:** 1.0  
**Document owner:** Documentation Steward, Data Owner, and Automation Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines safe synchronization between canonical GitHub Markdown and the Supabase documentation control plane.

## Authority Boundary

GitHub is authoritative for document content and version history. Supabase is authoritative for its own workflow, review, audit, synchronization, and derived discovery records. Supabase content projections must store the GitHub path, commit SHA, and content hash and must never silently overwrite canonical Markdown.

A request initiated from Supabase may create a proposed GitHub change through an authorized workflow. It does not become canonical until the change is approved and committed.

## Synchronization Topology

The primary content flow is GitHub to Supabase:

1. A tracked-branch event identifies a commit.
2. The intake service authenticates the event and stores an idempotent event record.
3. A worker retrieves the exact commit and changed paths.
4. Eligible Markdown is parsed, normalized, hashed, and validated.
5. Metadata, immutable version records, relationships, and derived-index jobs are committed transactionally.
6. The checkpoint advances only after successful processing.
7. Scheduled reconciliation verifies the checkpoint against GitHub.

The controlled reverse flow is Supabase to a proposed GitHub change:

1. An authorized workflow creates a change request against a known base commit.
2. Validation and review run before repository mutation.
3. A publishing identity writes only to allowed paths.
4. The resulting GitHub event returns through the primary flow.
5. The workflow closes only when the committed SHA and hash match the approved candidate.

## Event Intake

GitHub webhook deliveries must be verified using the configured secret before parsing or enqueueing. Record the delivery identifier, event type, repository, branch, commit, received time, verification result, and handler version. Reject unsupported repositories, branches, event types, and oversized payloads. Payload text is untrusted data and cannot modify system instructions.

## Idempotency and Ordering

The unique event key combines the provider delivery ID and handler version. Document versions are unique by document and commit SHA. Workers may process events more than once without duplicating state. Out-of-order commits trigger ancestry or reconciliation checks; they must not move a checkpoint backward or replace a newer projection.

## Supabase Processing

Use a durable database-backed queue or equivalent controlled mechanism for asynchronous work. Edge Functions may receive events and perform bounded orchestration, while database transactions protect state changes. Database Webhooks may emit downstream signals for internal record changes, but loops between GitHub intake and database callbacks must be prevented with event origin and correlation identifiers.

## Security Controls

- Keep GitHub webhook secrets, installation credentials, and Supabase secret or service-role keys in protected server-side configuration.
- Never expose privileged credentials to browsers.
- Enable row-level security on exposed tables and enforce workspace and role predicates.
- Restrict privileged functions to non-exposed schemas, use explicit grants, and prefer invoker rights.
- Validate repository, organization, branch, path, content type, size, and classification.
- Store audit metadata without copying sensitive document bodies into logs.
- Rotate credentials and replay missed events through reconciliation.

## Conflict Rules

| Condition | Action |
| --- | --- |
| Supabase hash differs from the same GitHub commit | Mark projection corrupt and rebuild it |
| Proposed change base SHA is stale | Stop, rebase, revalidate, and repeat approval if meaning changed |
| Two documents claim canonical authority | Open a governance conflict and suppress automatic synthesis |
| Unsupported or restricted content enters the pipeline | Quarantine and notify the accountable owner |
| A newer commit arrives during processing | Complete safely or abandon the stale projection, then process the newer commit |
| GitHub is unavailable | Retain queued work and keep the last verified projection |

## Reconciliation

A scheduled job compares the tracked GitHub branch with the last checkpoint and enumerates missed commits and eligible paths. It verifies current document keys, paths, versions, statuses, hashes, and retirement markers. Reconciliation creates normal idempotent events rather than editing projections directly. A full rebuild may clear derived indexes but must preserve workflow and audit history.

## Failure and Recovery

Transient network and rate-limit failures use bounded backoff with jitter. Authentication, schema, validation, or authority failures do not retry blindly. Repeated failures enter quarantine with the event, reason, attempts, and recovery owner. Operators may replay from a known commit after correcting the cause. Checkpoints advance monotonically only after durable success.

## Observability

Monitor webhook authentication failures, event lag, queue depth, processing duration, retry counts, quarantined events, checkpoint age, reconciliation drift, hash mismatches, index freshness, and reverse-flow publication failures. Alerts must identify the repository, commit, document key, and run without exposing secret values or unnecessary content.

## Verification Scenarios

- Deliver the same webhook repeatedly and confirm one logical result.
- Deliver commits out of order and confirm the newest valid projection wins.
- Interrupt processing before checkpoint update and confirm safe replay.
- Change a projection manually and confirm reconciliation detects and repairs drift.
- Attempt cross-workspace reads and unauthorized writes and confirm denial.
- Rotate the webhook secret and recover events missed during the transition.
- Rebuild all derived indexes from GitHub and compare hashes and counts.

## Acceptance Criteria

- Canonical authority cannot be transferred away from GitHub by synchronization.
- Every projection identifies its source commit and content hash.
- Duplicate, delayed, and out-of-order events are safe.
- Secrets remain server-side and workspace isolation is verified.
- Conflicts block unsafe promotion and have an accountable resolution path.
- Reconciliation can recover missed events and rebuild derived data.

## References

- [Documentation Data Model](Documentation_Data_Model.md)
- [Document Workflows](Document_Workflows.md)
- [Supabase Core Implementation Plan](../05_Database/Supabase_Core_Implementation_Plan.md)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [GitHub Webhook Security](https://docs.github.com/en/webhooks/using-webhooks/validating-webhook-deliveries)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.2 GitHub-Supabase synchronization specification |
