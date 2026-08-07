# Creator OS Foundry Control Center User Workspace Model

**Phase:** 2.6 — Control Center Implementation Architecture  
**Version:** 1.0  
**Document owner:** Application Owner, Security Owner, and Data Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how authenticated users enter, select, and operate within Creator OS Foundry workspaces without crossing tenant, environment, role, or classification boundaries.

## Core Model

A user identity is not itself workspace authorization. Access is derived from an active membership, role, resource-level permissions, environment eligibility, classification scope, and any required step-up authentication. Every request resolves one explicit workspace and environment.

## Entities

| Entity | Purpose |
| --- | --- |
| user_profile | Application-facing identity linked to the approved authentication subject |
| workspace | Tenant and governance boundary |
| membership | Time-bounded relationship between user and workspace |
| role | Named permission set within one workspace |
| capability | Server-calculated operation over a resource class |
| assignment | Task, approval, review, incident, or owner responsibility |
| preference | Non-authoritative personal display and notification settings |
| workspace_session | Current workspace, environment, capability version, and session evidence |
| access_review | Periodic owner validation of membership and privilege |
| delegation | Explicit, time-bounded transfer of a permitted responsibility |

## Roles

System Owner, Domain Owner, Operator, Security Owner, Quality or Release Owner, Reviewer, and Read-only Observer are application roles. Implementations use stable role keys and explicit permissions. A role label alone does not authorize a row or command.

## Workspace Selection

At sign-in, the application lists only authorized workspaces. Selection creates or updates a workspace session after server verification. The global shell shows the workspace and environment persistently. Switching clears workspace-scoped caches, subscriptions, drafts, search state, and sensitive local data before loading the new scope.

## Environment Model

Local, preview, staging, and production are distinct operating targets. Production access may require stronger role, multi-factor or step-up authentication, managed device, network, or approval controls. Environment is included in every capability and command decision.

## Capability Resolution

The trusted service evaluates identity, active membership, role permissions, resource ownership or assignment, environment, operation, classification, risk, and policy version. The response contains short-lived capabilities or decision results, not a broad permanent privilege claim.

Client route guards and hidden controls improve usability but cannot authorize requests.

## Membership Lifecycle

| State | Meaning |
| --- | --- |
| Invited | Invitation issued but not accepted |
| Active | Current authorized workspace relationship |
| Suspended | Temporarily denied |
| Expired | Validity ended |
| Revoked | Access withdrawn |
| Pending Review | Continued access awaits owner decision |

Changes invalidate sessions, capabilities, caches, and realtime subscriptions as required. Deleting an identity does not erase approvals, incidents, or audit evidence.

## Delegation and Acting Roles

Delegation names delegator, delegate, workspace, responsibilities, allowed actions, start, expiry, reason, and approval. It cannot grant permissions the delegator does not hold or bypass separation of duties. The UI always shows when a user is acting under delegation.

## Preferences

Users may store theme, density, locale, timezone, saved filters, default landing module, and notification choices. Preferences never control authorization, classification, retention, or approval. Saved filters cannot expose inaccessible identifiers.

## Workspace Search

Search is scoped server-side to the active workspace and environment. Suggestions, counts, facets, recent items, and errors must not leak unauthorized resources. Cross-workspace search is a separately approved capability with explicit visual context.

## Session and Cache Safety

Workspace session records include identity, workspace, environment, capability version, issued time, expiry, and authentication strength. Sensitive state is not stored in insecure browser storage. Cache keys include identity, workspace, environment, and capability version. Sign-out, membership change, or workspace switch clears affected data.

## Audit

Record sign-in, workspace selection and switch, environment change, membership and role changes, delegation, privileged capability decisions, access review, session revocation, and denied cross-workspace requests. Logs use stable identifiers and exclude secrets.

## Failure and Recovery

If membership or capability services are unavailable, the application fails closed for mutations and may show clearly stale read-only information only when policy permits. Conflicting workspace context cancels the request. Session recovery revalidates identity and capabilities before restoring state.

## Testing

Test users with zero, one, and multiple workspaces; suspended and expired membership; role change during session; workspace switching; cross-workspace object IDs; environment escalation; delegation expiry; classification denial; cache and subscription isolation; search leakage; sign-out; and session revocation.

## Acceptance Criteria

- Every request has one verified workspace and environment.
- Membership and role changes invalidate access promptly.
- Workspace switching clears scoped data.
- Search and counts reveal only authorized resources.
- Delegation is bounded, visible, and auditable.
- Preferences cannot change authority.
- Failures deny unsafe mutations.

## References

- [Control Center Specification](Control_Center_Specification.md)
- [Application Security Model](Application_Security_Model.md)
- [Identity and Access Control](../08_Security/Identity_and_Access_Control.md)
- [Core Table Specifications](../05_Database/Supabase_Core_Table_Specifications.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.6 user workspace model |
