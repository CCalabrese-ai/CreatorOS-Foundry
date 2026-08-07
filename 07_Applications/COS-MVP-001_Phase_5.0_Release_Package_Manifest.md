# COS-MVP-001 Phase 5.0 Release Package Manifest

**Package version:** 1.0  
**Release candidate:** COS-MVP-001 v1.0.0  
**Status:** Prepared — Not Released  
**Package owner:** Release Owner

## Build Identity

| Field | Value |
| --- | --- |
| Release ID | `COS-MVP-001-v1.0.0` |
| Semantic version | `1.0.0` |
| Source baseline | `d01a4a3cfac759b3e2f3b7799b345f8585a9c900` |
| Phase 4.9 source commit | `e017b0c3475576a7a6d6326187b295c105c60990` |
| Source digest | `a59629d69b4fe560b5dd8bc7f3a527fe38a146a5acea52696e5d43e6a32bb5af` |
| Build digest | `e908cb1cabe704ef0d77e732b59a957f6d4f20a1758231054d0e86120f84acb7` |
| Validated runtime | Node 24 |
| Minimum runtime | Node 20.19.0 |

The Phase 5.0 governance commit is packaging-only. It does not modify application source, generated assets, or the recorded Phase 4.9 build digest.

## Applied Migration Versions

| Version | Name | Purpose |
| --- | --- | --- |
| `20260806191113` | `cos_core_foundation_v1` | Creator OS database foundation |
| `20260807021642` | `cos_mvp_001_system_registry_functional_slice_v1` | System Registry table, seed, and read boundary |
| `20260807032902` | `cos_mvp_001_production_readiness_v1` | Workspace and membership authorization |
| `20260807033758` | `restrict_rls_auto_enable_execution_v1` | Privileged helper execution hardening |

## Immutable Artifact References

- Machine-readable manifest: `07_Applications/release/COS-MVP-001-v1.0.0-manifest.json`
- Manifest generator: `07_Applications/scripts/create-release-manifest.mjs`
- Dependency lock: `package-lock.json`
- Runtime declaration: `.nvmrc` and `package.json`
- Production migrations: `supabase/migrations/`

## Test Results

- Automated service tests: 10 passed, 0 failed.
- Production bundle: passed under Node 24.
- Workspace authorization matrix: active member pass; non-member, suspended, and expired denial pass.
- Authenticated browser validation: one workspace, 12 records, filters, details, provenance, focus management, and responsive presentation pass.
- Rollback validation: application disable and identical-candidate restoration pass.

## Validation Evidence

- `COS-MVP-001_Phase_4.7_Release_Validation.md`
- `COS-MVP-001_Phase_4.8_Denial_Testing.md`
- `COS-MVP-001_Phase_4.8_Resilience_Testing.md`
- `COS-MVP-001_Phase_4.8_Rollback_Verification.md`
- `COS-MVP-001_Phase_4.9_Workspace_Authorization_Validation.md`
- `COS-MVP-001_Phase_4.9_Observability_and_Degraded_State_Validation.md`
- `COS-MVP-001_Phase_4.9_Accessibility_Remediation.md`
- `COS-MVP-001_Phase_4.9_Immutable_Release_Artifact_Record.md`

## Integrity Rule

Any source, dependency, migration, configuration, or generated-asset change invalidates this package until tests, build, browser validation, manifest generation, and required approvals are repeated.
