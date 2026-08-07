# Creator OS Foundry Supabase Core Migration Definitions

**Phase:** 2.3 — Supabase Core Schema Implementation  
**Version:** 1.0  
**Document owner:** Data Owner and Release Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines the ordered migration units that create the Creator OS Foundry core Supabase schema. It translates the approved schema and security specifications into reviewable implementation boundaries without embedding environment-specific values or production data.

## Migration Authority

Committed migration files are the only approved source for persistent database changes. Migration filenames must be created with the installed Supabase CLI. The sequence below defines logical names and dependencies; implementers must not invent timestamps manually.

## Migration Sequence

| Order | Logical migration name | Primary objects | Required outcome |
| --- | --- | --- | --- |
| 001 | establish_core_schemas | internal, audit, reporting schemas; required extensions | Protected schema boundaries exist with explicit grants |
| 002 | create_workspace_identity | workspaces, profiles, roles, memberships | Workspace ownership and membership model is constrained and indexed |
| 003 | create_governance_records | policies, decisions, approvals | Governed decisions and approvals are traceable |
| 004 | create_documentation_core | documents, document_versions, document_sources, document_relationships | Canonical GitHub document metadata and provenance are modeled |
| 005 | create_workforce_registry | agents, agent_versions, tools, tool_permissions | AI and tool authorization records exist |
| 006 | create_workflow_execution | workflows, workflow_versions, tasks, runs, run_steps | Durable orchestration state and idempotent run identifiers exist |
| 007 | create_artifacts_integrations | artifacts, integrations, credential_references | Artifacts and protected credential references are separated |
| 008 | create_quality_operations | evaluations, incidents, usage_records, notifications | Quality, incidents, cost, and operational signals are modeled |
| 009 | create_audit_events | audit.events and append-only controls | Consequential actions produce protected evidence |
| 010 | enable_core_rls | RLS, grants, policies, protected policy helpers | Exposed tables deny access unless workspace authorization passes |
| 011 | create_core_indexes | foreign-key, workspace, status, lookup, and event indexes | Expected access paths avoid unbounded scans |
| 012 | seed_controlled_reference_data | approved statuses, relationship types, risk levels, system roles | Deterministic reference values are available |
| 013 | create_reporting_interfaces | approved security-invoker views | Read models preserve underlying authorization |
| 014 | add_schema_comments | object and security-intent comments | Operators can inspect ownership and intent |
| 015 | establish_verification_contract | validation functions or test support objects where approved | Automated tests can verify invariants without privileged shortcuts |

## Migration Requirements

Each migration must have one coherent purpose and include, as applicable:

- explicit schema-qualified object names;
- UUID identifiers and UTC timestamptz fields;
- named primary, foreign-key, unique, and check constraints;
- documented delete behavior;
- required indexes created with the table or in the index migration;
- explicit grants and revocations;
- RLS enablement before application access is granted;
- object comments for non-obvious authority or retention behavior;
- verification queries that return counts or booleans without exposing sensitive rows;
- a recovery classification of reversible, forward-fix, restore-required, or irreversible.

## Dependency Rules

Identity and workspace tables precede all workspace-owned objects. Governance records precede approval references. Documentation identities precede versions and relationships. Registry identities precede tool permissions and workflow definitions. Audit objects must exist before consequential automation is activated. Reporting views follow final table and policy definitions.

## Transaction and Lock Strategy

Use transactions for compatible data definition. Operations that cannot safely run in a transaction must be isolated and documented. Large-table constraints, required columns, and indexes use expand-and-contract patterns when existing data is present. Production migrations must state expected locks, duration, row volume, and cancellation behavior.

## RLS and Grants

Every table in an exposed schema must enable row-level security before grants are applied. Policies must specify the target role and include workspace, membership, ownership, or assignment predicates. Update paths require row visibility plus USING and WITH CHECK controls. The authenticated role alone is not authorization. Privileged helpers belong in a non-exposed schema and require explicit review and grants.

## Idempotency

Migrations are applied once and remain immutable after a shared environment accepts them. IF NOT EXISTS may be used only when it cannot conceal drift. Seed inserts must use stable natural keys and deterministic conflict handling. A failed migration is corrected locally before publication or repaired through a new forward migration after shared deployment.

## Recovery Classification

| Change type | Default recovery |
| --- | --- |
| New nullable table or column | Reversible or compensating migration |
| Policy or grant change | Forward-fix with emergency access validation |
| Data backfill | Checkpointed forward-fix |
| Destructive column or table removal | Expand-and-contract plus backup; restore-required if executed |
| Audit-history mutation | Prohibited except approved privacy or legal workflow |
| Extension change | Environment-specific review and forward-fix |

## Review Evidence

Reviewers inspect generated SQL, schema qualification, dependency order, constraints, RLS, grants, function security, query plans, lock risk, seed safety, rollback strategy, and validation results. Security and Data Owners approve all exposed tables and privileged database code. Release Owner approves production execution.

## Acceptance Criteria

- A clean database applies every migration in order.
- Existing supported schemas upgrade without destructive surprise.
- Exposed tables have tested RLS before application grants.
- Migration history is deterministic across environments.
- No migration contains secrets, production identifiers, or user data.
- Recovery and verification steps exist for every migration unit.

## References

- [Migration Standards](Migration_Standards.md)
- [Migration Execution Plan](Migration_Execution_Plan.md)
- [Schema Specification](Schema_Specification.md)
- [Database Security Model](Database_Security_Model.md)
- [Supabase Local Development](https://supabase.com/docs/guides/local-development)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 2.3 core migration definitions |
