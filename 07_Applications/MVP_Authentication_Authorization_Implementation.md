# Creator OS Foundry MVP Authentication and Authorization Implementation

**Phase:** 3.3 — MVP Technical Implementation Plan  
**Version:** 1.0  
**Document owner:** Security Owner, Backend Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the implementation of identity, session, workspace membership, resource authorization, row-level enforcement, and privileged access for the MVP.

## Security Outcome

Every protected request will use a validated identity, current session conditions, explicit workspace and environment scope, and server-enforced permission for the exact resource and operation. UI visibility and database roles are supporting controls, not authorization decisions by themselves.

## Trust Boundaries

The browser may hold only approved session cookies and publishable configuration. The Next.js server validates identity, resolves current memberships, evaluates application policy, and invokes least-privileged services. Supabase Auth establishes identity; application services and RLS enforce resource authorization. Administrative credentials stay in protected server or operations contexts.

## Authentication Implementation

1. Configure approved Supabase Auth methods, redirect destinations, origin allowlists, email delivery, and rate limits per environment.
2. Implement current cookie-based SSR clients and authorization-code with Proof Key for Code Exchange where the selected flow requires it.
3. Apply secure, HTTP-only where supported, SameSite, path, domain, and expiry settings appropriate to each cookie.
4. Refresh tokens only through the approved server integration and propagate required no-store response headers.
5. Validate identity server-side using the current Supabase-recommended claims or user validation method; do not trust an unverified session object.
6. Handle sign-in, callback, refresh, sign-out, expiry, revocation, disabled user, and zero-workspace states.
7. Rotate or revoke sessions before destructive account changes where immediate invalidation is required.
8. Record sanitized authentication events without tokens, codes, credentials, or personal content.

## Authorization Model

Authorization input includes authenticated principal, current membership, workspace, environment, operation, resource type and ID, ownership or assignment, classification, risk, lifecycle state, approval, and authentication strength. The policy service returns allow or deny plus a safe capability summary and audit reference.

Roles provide a starting set of capabilities; resource, state, and approval conditions narrow them. User-editable profile metadata must never grant permission. Authorization claims stored in protected application metadata require a refresh strategy because token claims can become stale.

## Enforcement Layers

| Layer | Control |
| --- | --- |
| Route | Require validated identity and correct workspace context |
| BFF | Authorize every query, count, search, and command |
| Domain service | Enforce invariants, ownership, assignment, state, and approval |
| Database | Apply least privilege, explicit workspace predicates, and RLS |
| Realtime | Filter subscriptions and payloads by current authorization |
| UI | Present server-returned capabilities and consequences |
| Audit | Record decision context and result without sensitive payloads |

No single layer substitutes for the others.

## Workspace Selection and Switching

The server returns only current authorized workspaces. Selecting a workspace establishes a bounded server context rather than accepting a client role claim. Switching aborts requests, clears caches and drafts, closes subscriptions, invalidates module state, reloads capabilities, and prevents back-navigation from revealing prior data.

## Resource and Command Authorization

The server loads or safely resolves the target before policy evaluation. Denied and nonexistent resources use a non-enumerating response when required. Commands require current state, expected version, idempotency, and approval evidence. High-risk controls may require stronger authentication, separate reviewer capability, or time-bounded elevation.

## RLS and Database Access

Every exposed tenant table enables RLS and uses operation-specific policies. Policies combine identity with current workspace membership and resource conditions; using the authenticated database role alone is insufficient. UPDATE includes both USING and WITH CHECK. Views and functions are reviewed for bypass behavior, explicit grants, schema exposure, and search path.

## Session and Revocation Controls

Sensitive operations may require fresh identity confirmation and session-state validation. Membership removal, suspension, credential compromise, or user disablement must stop new authorization promptly and terminate or contain active work as defined by policy. Short-lived access tokens, refresh handling, and server checks reduce stale authority.

## Testing

Test sign-in, callback, refresh, expiry, sign-out, revocation, disabled identity, zero or multiple workspaces, membership change, stale claims, cross-workspace IDs, aggregate and search leakage, unauthorized commands, stale versions, approval expiry, CSRF, open redirects, cookie caching, RLS, realtime, privileged key exposure, and audit redaction.

## Operational Controls

Monitor authentication failure and abuse rates, refresh failures, denied operations, policy latency, RLS denials, session anomalies, membership changes, privileged access, and emergency elevation. Alerts use protected correlation and link to incident procedures.

## Acceptance Criteria

- Protected routes and APIs validate identity with the current supported server method.
- Resource and command permissions are evaluated server-side for every request.
- Workspace switching cannot expose prior scoped state.
- Exposed database objects have tested grants and RLS.
- User-controlled metadata cannot grant authorization.
- Session expiry, revocation, membership changes, and approval expiry fail closed.
- Cross-site, enumeration, cross-workspace, and stale-claim tests pass.

## References

- [Application Security Model](Application_Security_Model.md)
- [MVP Supabase Integration Implementation](MVP_Supabase_Integration_Implementation.md)
- [Control Center User Workspace Model](Control_Center_User_Workspace_Model.md)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Server-Side Rendering](https://supabase.com/docs/guides/auth/server-side)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.3 authentication and authorization implementation |
