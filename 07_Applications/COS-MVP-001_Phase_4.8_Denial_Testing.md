# COS-MVP-001 Phase 4.8 Denial Testing

**Phase:** 4.8 — Release Readiness Validation  
**Version:** 1.0  
**Document owner:** Security Owner and Quality Owner  
**Status:** Executed — Conditional  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Release status:** Not Released

## Purpose

This record defines and captures the negative-access tests executed against the System Registry. A denial test passes only when the request is rejected and no durable state changes.

## Environment

| Item | Value |
| --- | --- |
| Supabase project | Creator OS Project (`ygcldesxjwotrjarvvoh`) |
| Migration | `20260807021642_cos_mvp_001_system_registry_functional_slice_v1` |
| Table | `public.system_registry_records` |
| Seed baseline | 12 approved records |
| Execution time | 2026-08-07 UTC |

## Executed Tests

| ID | Scenario | Expected | Evidence | Result |
| --- | --- | --- | --- | --- |
| DEN-001 | Anonymous REST read | Reject request | Publishable-key GET returned HTTP 401 | Pass |
| DEN-002 | Anonymous REST insert | Reject request | Publishable-key POST returned HTTP 401 | Pass |
| DEN-003 | Denied-write persistence | No inserted row | Follow-up SQL found zero `COS-DENIAL-TEST` rows | Pass |
| DEN-004 | Anonymous table privilege | No SELECT | Live privilege inspection returned `anon_select=false` | Pass |
| DEN-005 | Authenticated read privilege | SELECT only | Live inspection returned `authenticated_select=true` | Pass |
| DEN-006 | Authenticated write privileges | No INSERT, UPDATE, or DELETE | All three live privilege checks returned false | Pass |
| DEN-007 | Row-level security | Enabled with least policy count | `relrowsecurity=true`; one authenticated read policy | Pass |
| DEN-008 | Cross-workspace access | Deny foreign workspace | No workspace or membership dimension exists in the current schema | Blocked |
| DEN-009 | Missing or expired membership | Deny access | No membership lifecycle is implemented in the current schema | Blocked |

## Findings

The implemented global authenticated-read boundary denies anonymous reads and all client writes as intended. However, it cannot enforce tenant isolation because records and policies have no workspace or membership attributes. DEN-008 and DEN-009 are therefore not passes; they expose a release-readiness gap that must be resolved before a multi-workspace release.

## Exit Decision

**Conditional only.** The implemented denial boundary passes, but the complete authorization model is not yet testable. Security approval remains pending and the release remains **Not Released**.

## Required Actions

1. Define the workspace, membership, role, and membership-expiration model.
2. Add least-privilege RLS policies for workspace-scoped reads.
3. Add authenticated direct-write tests with a non-privileged identity.
4. Execute cross-workspace, missing-membership, and expired-membership cases before approval.

## References

- `05_Database/migrations/20260807021642_cos_mvp_001_system_registry_functional_slice_v1.sql`
- `08_Security/Identity_and_Access_Control.md`
- `07_Applications/COS-MVP-001_Phase_4.8_Release_Readiness_Validation.md`
