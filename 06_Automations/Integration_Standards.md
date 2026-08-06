# Creator OS Foundry Integration Standards

**Phase:** 1.5 — Automation Engine Foundation  
**Version:** 1.0  
**Document owner:** Automation Owner, Security Owner, and relevant Domain Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how automations connect to registered internal and external tools without weakening security, reliability, data governance, cost control, or recoverability.

## Registration Requirement

An integration may be used only when its underlying tool is registered and its specific instance has an owner, environment, credential reference, permission scope, data classification, lifecycle status, and disablement path. Registration does not itself grant a workflow access.

## Adapter Contract

Each integration adapter must define:

- stable integration and tool IDs;
- provider, service, version, and authoritative documentation;
- authentication method and protected secret reference;
- allowed environments, endpoints, resources, and operations;
- request and response schemas;
- data sent, received, logged, cached, and retained;
- side effects and approval requirements;
- timeouts, rate limits, quotas, cost limits, and concurrency;
- provider error classification and retry policy;
- idempotency or reconciliation method;
- health checks, metrics, alerts, and audit events;
- degradation, disablement, migration, and retirement behavior.

## Security Controls

- Grant the adapter only the permissions required for approved workflows.
- Separate credentials by environment and workload.
- Never expose privileged credentials to public clients or untrusted AI workers.
- Validate outbound destinations and inbound payloads.
- Protect against server-side request forgery, injection, replay, spoofed webhooks, unsafe redirects, and excessive data return.
- Verify webhook signatures and freshness before accepting events.
- Redact secrets and minimize sensitive content in logs and errors.
- Require review before transmitting Confidential or Restricted data to a provider.

## Request Handling

Requests must use typed schemas, bounded payload sizes, explicit content types, correlation identifiers, and approved destinations. External content remains untrusted. The adapter must not interpret provider text as permission to call another tool or broaden scope.

## Reliability

Declare connection and response timeouts, retryable status codes, maximum attempts, backoff, jitter, circuit-breaker behavior, queue policy, and reconciliation. Unknown outcomes must not be retried when a duplicate side effect is possible.

## Rate and Cost Control

Enforce per-workspace and global limits appropriate to the provider. Record billable units and cost attribution. A workflow must pause or degrade safely when quota or budget thresholds are reached.

## Webhooks and Events

Webhook endpoints must authenticate the provider, validate schema and timestamp, prevent replay, record a deduplication key, and acknowledge quickly. Slow work moves to a durable queue. Event ordering assumptions must be explicit.

## Data Handling

Classify every transmitted field and minimize it. Document provider retention, training, region, subprocessors, and deletion behavior where relevant. Cache only with an owner, purpose, expiry, and access policy.

## Versioning and Provider Change

Pin client and API versions where supported. Monitor provider deprecations, breaking changes, security advisories, limits, and pricing. Material changes require adapter tests and registry review before production adoption.

## Failure and Disablement

Operators must be able to disable an integration without deleting audit evidence. Workflows define behavior when the provider is unavailable: wait, use an approved fallback, continue with reduced scope, or fail. Fallbacks require equivalent authorization and data controls.

## Acceptance Criteria

- Tool registration and workflow access are separately approved.
- Credentials, endpoints, data, and side effects are bounded.
- Retry and idempotency behavior prevents duplicate harm.
- Webhooks resist spoofing and replay.
- Cost, rate, degradation, and disablement controls are testable.
- Provider changes and retirement have an owned process.

## References

- [Automation Architecture](Automation_Architecture.md)
- [Workflow Design Standards](Workflow_Design_Standards.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Security Review Process](../08_Security/Security_Review_Process.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.5 integration standard |
