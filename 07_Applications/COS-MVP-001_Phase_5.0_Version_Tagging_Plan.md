# COS-MVP-001 Phase 5.0 Version Tagging Plan

**Application ID:** COS-MVP-001  
**Initial release version:** 1.0.0  
**Planned tag:** `cos-mvp-001-v1.0.0`  
**Status:** Tag Prepared — Creation Prohibited Until Approval

## Versioning Approach

COS-MVP-001 uses Semantic Versioning:

- **MAJOR** changes when compatibility, authorization boundaries, or supported operating contracts break.
- **MINOR** changes when backward-compatible capabilities are added.
- **PATCH** changes when backward-compatible defects, documentation, or security issues are corrected without changing the supported contract.

Pre-release candidates may use identifiers such as `1.1.0-rc.1`. Build metadata may identify a pipeline run but must not replace the immutable Git commit or artifact digest.

## Tag Convention

Application tags use `cos-mvp-001-vMAJOR.MINOR.PATCH`. The first official tag is planned as:

`cos-mvp-001-v1.0.0`

The tag must be annotated and should be signed using the organization's approved signing method. Its annotation must include the application ID, version, release approval record, build digest prefix, migration versions, and Release Owner identity.

## Tag Target Rule

The tag targets the approved Phase 5.0 package commit, not an earlier implementation commit. The Release Owner must verify that the package references the immutable Phase 4.9 build and that Phase 5.0 introduced governance documentation only.

## Pre-Tag Gates

1. All six owner approvals are explicitly recorded.
2. Launch checklist contains no blocking unchecked item.
3. Candidate source and build digests match the release package.
4. Applied migration versions match the manifest.
5. Production deployment target and rollback authority are named.
6. Release Owner records the final go decision.

## Tagging Procedure

1. Fetch the protected `main` branch and verify the approved commit SHA.
2. Verify no unreviewed commit follows the approved package commit.
3. Create the annotated, signed `cos-mvp-001-v1.0.0` tag.
4. Push the single verified tag to the canonical GitHub repository.
5. Confirm the remote tag resolves to the approved commit.
6. Attach or link the release notes, package manifest, approval record, and immutable manifest.
7. Record tag creator, UTC time, target SHA, and signature verification in the release approval record.

## Current Decision

**Do not create the tag.** Owner approvals are not yet recorded. Tag preparation does not constitute release, deployment, or approval.
