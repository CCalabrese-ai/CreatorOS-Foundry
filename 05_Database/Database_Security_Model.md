# Creator OS Foundry Database Security Model

**Phase:** 1.2 — Database Implementation Layer  
**Version:** 1.0  
**Document owner:** Security Owner and Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines authentication, authorization, row-level security, credential, audit, and data-protection controls for the Creator OS Foundry Supabase implementation.

## Security Objectives

- Prevent access across workspaces.
- Enforce least privilege for humans, agents, workflows, and services.
- Separate public-client capability from trusted server authority.
- Protect Confidential and Restricted data throughout its lifecycle.
- Preserve reliable evidence of consequential actions.
- Fail closed when identity, policy context, or ownership is missing.

## Identity and Authorization

Supabase Auth provides identity and session claims; it does not replace application authorization. Authorization decisions must use trusted database records or protected app metadata. User-editable user metadata must never grant roles or permissions. Policies must account for token freshness when app metadata changes.

## Role Model

| Database role | Intended use | Restrictions |
| --- | --- | --- |
| anon | Unauthenticated public access explicitly approved by policy | No implicit data access |
| authenticated | Signed-in users, including identities requiring additional qualification | Must satisfy ownership or membership predicates |
| service_role | Trusted server administration and maintenance | Never exposed to browsers or untrusted agents |
| postgres or owner roles | Controlled administration and migration | No routine application use |
| dedicated service roles | Narrow machine workloads when supported | Least privilege, rotation, audit |

Possession of authenticated alone is not authorization to a workspace or row.

## Row-Level Security Requirements

- Enable RLS on every table in an exposed schema.
- Define policies per operation and target role with explicit workspace and subject predicates.
- Select policies govern row visibility.
- Insert policies use with check to validate all ownership and workspace fields.
- Update requires both a select path and update policies with using and with check.
- Delete requires a narrow policy plus approval controls for consequential records.
- Policy helpers must be stable, tested, indexed, and located in a protected schema.
- Missing policy context must deny access.
- Bypass-RLS roles are prohibited from untrusted request paths.

A typical ownership predicate compares the current authenticated user identifier with a protected membership or owner record and includes workspace_id. Policies must not rely on auth.role() or on a target role alone.

## Object Grants and Data API

RLS controls rows only after a role can reach the schema and object. Grants must be explicit and minimal. When a schema is exposed through the Data API, only approved schemas, tables, views, functions, and operations may be granted to anon or authenticated. Revoking a grant is part of disabling access.

## Views and Privileged Functions

Application-facing views must use security-invoker behavior when supported. Otherwise they remain unexposed with explicit revocations. Security-definer functions are exceptional because they can bypass RLS. Any approved exception must:

1. reside outside exposed schemas;
2. set a fixed safe search_path;
3. validate auth.uid() and workspace authority internally;
4. receive explicit execute grants;
5. avoid dynamic SQL unless separately reviewed;
6. emit an audit event for consequential action;
7. pass database security advisors and dedicated tests.

## Secrets and Keys

- Frontends may use publishable keys and must rely on RLS.
- Secret keys and service-role credentials remain only in trusted server environments.
- Credential tables store references, never secret material.
- Rotate credentials after suspected exposure and according to the approved schedule.
- Logs, fixtures, migrations, documentation, and error messages must not contain secrets.
- Separate credentials by environment and workload.

## Data Classification and Protection

| Classification | Minimum control |
| --- | --- |
| Public | Approved release and integrity protection |
| Internal | Authenticated workspace access |
| Confidential | Need-to-know policy, encryption in transit and at rest, limited export |
| Restricted | Explicit approval, protected processing boundary, enhanced audit and retention |

Derived data inherits the highest source classification unless an approved declassification decision exists.

## Storage Security

Buckets must be private by default. Object paths must include a stable workspace boundary where tenant access is required. Storage policies must govern select, insert, update, and delete independently. Upsert requires insert, select, and update permissions. Signed URLs must be short-lived and issued only after authorization.

## Audit and Monitoring

Record authentication anomalies, policy changes, privileged actions, membership changes, exports, destructive actions, secret rotation, migration execution, and incident activity. Alerts must cover repeated denials, unusual service-role use, cross-workspace query patterns, bulk export, and audit-write failure.

## Testing Requirements

For every protected table, test allowed and denied select, insert, update, and delete paths. Include cross-workspace access, absent membership, expired membership, anonymous user behavior, stale claims, ownership reassignment, and service-boundary misuse. Tests must run with application-equivalent roles rather than database-owner privileges.

## Incident Response

Suspected unauthorized access requires immediate containment, evidence preservation, session and credential review, impact assessment, notification according to policy, remediation, and regression tests. Deleting a user alone does not invalidate active access tokens; revoke or terminate sessions as required.

## Acceptance Criteria

- RLS and object grants cover every exposed relation.
- Cross-workspace negative tests pass.
- Public clients cannot obtain privileged credentials.
- Views and functions preserve caller authorization.
- Secrets, audit events, storage, and incident paths have named controls.
- Security and Data Owners approve the model before production use.

## References

- [Supabase Architecture](Supabase_Architecture.md)
- [Schema Specification](Schema_Specification.md)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Securing the Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase Auth Security](https://supabase.com/docs/guides/auth/security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 1.2 database security model |
