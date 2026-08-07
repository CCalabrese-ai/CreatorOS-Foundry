# COS-MVP-001 Phase 4.9 Observability and Degraded-State Validation

**Phase:** 4.9 — Production Readiness Completion  
**Version:** 1.0  
**Document owner:** Application Owner and Quality Owner  
**Status:** Technical Gate Passed  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Release status:** Not Released

## Degraded-State Contract

| State | Trigger | User behavior | Data behavior |
| --- | --- | --- | --- |
| Unauthorized | No active workspace membership | Explicit access message | No registry query is issued |
| Unavailable | Workspace or registry dependency error | Error message and Retry action | Records fail closed |
| Empty | Verified zero-row result | Empty-result message | No records are invented |
| Stale | Stale sync flag or observation older than 24 hours | Warning with canonical-source guidance | Verified records remain visible |
| Partial | Any partial sync flag | Partial-data warning | Verified records remain visible |
| Conflict | Conflict or quarantined flag | Operator-review warning | Verified records remain visible |
| Success | Current verified records | Loaded count | Scoped records render normally |

Automated tests exercise every state, workspace query bounding, empty results, dependency failure, filtering, and state visibility. Ten tests pass.

## Observability Contract

The client emits allowlisted structured events for workspace resolution, load start, success, degradation, and failure. Fields are restricted to workspace ID, request ID, record count, duration, and state. Emails, tokens, filter text, record content, and provenance content are excluded.

Supabase API logs provide independent request, route, response-code, timestamp, and user-agent evidence. Database security and performance advisors were executed after migration.

## Alert Requirements

- Alert on sustained registry failure or elevated non-2xx API responses.
- Alert on conflict or quarantined states.
- Review authorization denials for unusual volume without recording secrets.
- Retain request IDs so client events can be reconciled with platform logs.
- Never send access tokens, magic links, email addresses, or registry descriptions to telemetry.

## Advisor Results

No warning applies to the new workspace, membership, or registry authorization controls. The pre-existing public SECURITY DEFINER execution warning was remediated. Remaining INFO notices concern intentionally closed foundation tables and unused early-stage indexes. Leaked-password protection remains a project-level advisory; COS-MVP-001 uses passwordless sign-in and does not accept passwords.

## Decision

The degraded-state and implementation observability technical gate **passes**. Production alert routing and retention ownership must be confirmed by the Release Owner before promotion.

## References

- `src/services/observability.js`
- `src/services/systemRegistryService.js`
- `test/systemRegistryService.test.js`
- [Supabase database linter](https://supabase.com/docs/guides/database/database-linter)
