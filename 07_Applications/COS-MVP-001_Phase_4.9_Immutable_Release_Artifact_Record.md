# COS-MVP-001 Phase 4.9 Immutable Release Artifact Record

**Phase:** 4.9 — Production Readiness Completion  
**Version:** 1.0  
**Document owner:** Release Owner and Application Owner  
**Status:** Candidate Artifact Generated  
**Risk class:** High  
**Application ID:** COS-MVP-001  
**Release status:** Not Released

## Artifact Contract

The release manifest records SHA-256 digests for every approved implementation input and each generated production asset. It also records the aggregate source digest, aggregate build digest, source baseline commit, migration version, semantic version, and required runtime.

The committed manifest is `07_Applications/release/COS-MVP-001-v1.0.0-manifest.json`. It is generated only after a clean production build and can be recreated with `npm run release:manifest` under the declared Node runtime.

## Runtime and Build

| Item | Value |
| --- | --- |
| Release ID | `COS-MVP-001-v1.0.0` |
| Minimum Node | `20.19.0` |
| Validated Node | `24` |
| Runtime declaration | `.nvmrc` and `package.json` engines |
| Dependency lock | `package-lock.json` |
| Migration versions | `20260807032902`, `20260807033758` |
| Automated tests | 10 passed |
| Production build | Passed |

## Verification Procedure

1. Check out the recorded source candidate.
2. Activate Node 24 and install from the lockfile.
3. Run `npm test` and the production build.
4. Run `npm run release:manifest`.
5. Compare every per-file digest and the aggregate build digest.
6. Reject promotion on any mismatch.

## Decision

The immutable candidate-artifact technical gate **passes**. The artifact is a release candidate, not proof of final human approval or production deployment.

## References

- `07_Applications/release/COS-MVP-001-v1.0.0-manifest.json`
- `07_Applications/scripts/create-release-manifest.mjs`
- `package-lock.json`
