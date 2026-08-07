-- COS-MVP-002 Phase 6.3 remediation: drop the obsolete "Workspace owners can update
-- documents" policy on public.documents.
--
-- The direct UPDATE grant on public.documents was already revoked from authenticated
-- in 20260807160058_cos_mvp_002_lifecycle_governance_v1.sql (Phase 6.2 finding P62-001
-- remediation: lifecycle mutation must go through public.transition_document_lifecycle).
-- That revoke already made this policy inert -- a grant-level revoke takes precedence
-- over a permissive USING/WITH CHECK clause -- but the policy object itself was left in
-- the schema, where it could misread as direct updates still being policy-permitted.
--
-- This migration removes the stale policy so the schema matches the governance decision
-- recorded in 07_Applications/COS-MVP-002_Phase_6.3_Release_Blocker_Remediation.md:
-- direct document mutation is restricted to preserve provenance integrity, and future
-- metadata edits must be implemented as their own governed, evidence-producing pathway,
-- not a direct table write.
--
-- This migration does not touch:
--   - "Workspace members can read documents" (select policy, unchanged)
--   - "Workspace owners can create documents" (insert policy, unchanged)
--   - the governed lifecycle functions, tables, or grants added in
--     20260807160058_cos_mvp_002_lifecycle_governance_v1.sql
-- and it does not grant UPDATE back to any role.

drop policy if exists "Workspace owners can update documents" on public.documents;

-- Defensive no-op: keeps UPDATE revoked from authenticated even if this migration is
-- ever replayed out of order relative to 20260807160058. Idempotent if already revoked.
revoke update on table public.documents from authenticated;
