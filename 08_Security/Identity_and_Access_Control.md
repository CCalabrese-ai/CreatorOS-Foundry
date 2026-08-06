# Creator OS Foundry Identity and Access Control

**Phase:** 1.4 — Security Framework  
**Version:** 1.0  
**Document owner:** Security Owner and System Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines identity, authentication, authorization, approval, session, and access-review requirements for humans, AI workers, services, tools, and workflows.

## Identity Types

| Identity | Required properties |
| --- | --- |
| Human | Unique account, accountable person, verified authentication factors |
| AI worker | Stable agent ID, owner, version, capability scope, risk class |
| Service | Non-human principal, workload owner, environment, narrow permissions |
| Tool integration | Registered tool ID, integration owner, scoped credential reference |
| Workflow | Stable version, initiating principal, approved tools and data boundaries |
| Break-glass | Named emergency purpose, time limit, enhanced monitoring and review |

Shared human accounts are prohibited. Every non-human identity must map to an accountable owner.

## Authentication Requirements

- Privileged and production access must use multi-factor authentication where supported.
- Sessions must be short enough for risk and revocable.
- Reauthentication is required for high-impact actions when practical.
- Passwords, tokens, keys, and recovery codes must follow the Secrets Management standard.
- Authentication failure must not reveal sensitive account state.
- Dormant, departed, compromised, or retired identities must be disabled promptly.
- Federation and social identity providers require documented trust and recovery rules.

## Authorization Model

Authorization combines role-based access control with workspace, environment, resource ownership, data classification, and action risk. A role name alone is not sufficient when the action affects a specific tenant, record, tool, or environment.

Permissions must state:

- principal and accountable owner;
- allowed resources and operations;
- workspace and environment;
- permitted data classifications;
- tool and external side-effect boundaries;
- approval requirements;
- start, expiry, and review dates;
- revocation and emergency-disable path.

## Least Privilege

Grant the smallest permission set for the shortest practical period. Separate read, create, update, approve, deploy, export, delete, administer, and credential-management capabilities. Administrative access must not be used for routine work.

## Approval and Separation of Duties

The initiator, approver, and executor should be separate for critical actions. An AI worker may prepare or execute a pre-approved action but may not approve its own access, change its own policies, or accept residual risk. Break-glass access requires after-action review.

## Session Security

Sessions must be bound to the expected identity and environment, protected in transit, rotated according to provider guidance, and invalidated after compromise or material privilege change where supported. Sensitive operations must not rely only on stale token claims.

## Access Lifecycle

1. Request a bounded business purpose and owner.
2. Verify identity and required training or agreements.
3. Assess resource, data, environment, and action risk.
4. Obtain required owners and Security approval.
5. Provision through an auditable path.
6. Verify effective permissions with allowed and denied tests.
7. Monitor use and review on schedule.
8. Revoke on expiry, role change, inactivity, incident, or retirement.
9. Preserve required access history.

## Access Review

Review privileged, production, cross-workspace, export, secret, financial, and public-publishing access more frequently than ordinary internal access. Reviews must identify unused access, privilege accumulation, orphaned principals, conflicting duties, stale service accounts, and expired exceptions.

## Emergency Access

Break-glass access must be disabled by default, strongly authenticated, time-limited, narrowly scoped, logged in detail, and reviewed immediately after use. It may not become a permanent workaround.

## Failure and Recovery

If identity or authority cannot be verified, deny the action. On suspected compromise, revoke sessions and credentials, contain affected resources, preserve evidence, identify unauthorized actions, restore intended permissions, and test negative access paths.

## Acceptance Criteria

- Every principal has a unique identity and accountable owner.
- Permissions include workspace, environment, data, operation, and expiry boundaries.
- Critical actions enforce approval and separation of duties.
- Access provisioning and revocation are auditable.
- Allowed and denied tests demonstrate effective authorization.
- Emergency access is bounded and reviewed.

## References

- [Security Architecture](Security_Architecture.md)
- [Secrets Management](Secrets_Management.md)
- [Security Review Process](Security_Review_Process.md)
- [AI Workforce Registry](../03_AI_Workforce/AI_Workforce_Registry.md)
- [Tool Registry](../04_Tool_Registry/Tool_Registry.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.4 identity and access standard |
