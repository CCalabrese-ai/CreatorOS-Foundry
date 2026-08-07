# COS-MVP-001 v1.0.0 Release Notes

**Release candidate:** COS-MVP-001 v1.0.0
**Release type:** Internal MVP Release Candidate
**Intended audience:** Caitlin Calabrese — single-owner internal use
**Application:** System Registry Viewer
**Status:** Internal MVP Released

## Feature Summary

COS-MVP-001 provides an authenticated, read-only view of the Creator OS System Registry. Authorized workspace members can inspect registered agents, tools, workflows, applications, modules, and integrations with canonical provenance.

## Completed Capabilities

- Passwordless Supabase authentication.
- Workspace-scoped membership authorization.
- Live retrieval of 12 seeded registry records.
- Registry inventory summary and responsive list view.
- Type, lifecycle-status, and canonical-identity filtering.
- Record detail view with owner, risk, lifecycle, sync status, and version.
- Canonical path, source commit, and content-hash provenance.
- Loading, empty, unauthorized, unavailable, stale, partial, conflict, and success states.
- Keyboard-accessible detail navigation and focus restoration.
- Sanitized structured client observability.

## Security Improvements

- Replaced the global authenticated-read policy with workspace membership RLS.
- Denied access for non-members, suspended members, and expired members.
- Preserved SELECT-only access for authenticated clients.
- Denied anonymous registry and workspace access.
- Removed anonymous and authenticated execution rights from the privileged RLS helper.
- Excluded tokens, email addresses, record content, and secrets from client telemetry.

## Validation Results

| Validation | Result |
| --- | --- |
| Automated tests | 10 passed, 0 failed |
| Production build | Passed with Node 24 |
| Approved authenticated member | 1 workspace and 12 records visible |
| Non-member, suspended, expired | 0 workspaces and 0 records visible |
| Filtering, details, provenance | Pass |
| Accessibility focus remediation | Pass |
| Application disable and restore | Pass |
| Supabase migration reconciliation | Pass |
| Immutable release manifest | Generated and verified |

## Known Limitations

- MVP is read-only; registry administration occurs through governed source and migration workflows.
- Launch approval and production deployment have not occurred.
- Monitoring routing, retention, and escalation ownership must be confirmed at approval.
- The initial dataset contains 12 governed records and is not a complete enterprise catalog.
- Foundation tables outside COS-MVP-001 remain intentionally closed and are not exposed by this release.
- Leaked-password protection is a project advisory; this MVP accepts passwordless authentication only.
- Internal MVP use provides no production availability, backup, recovery, support, or alert-delivery guarantee.
- Public, external, multi-owner, and production use remain outside this release classification.

## Internal MVP and Future Production Boundary

The Internal MVP requires validated functionality, security, automated tests, build, artifact integrity, and approved ownership. Those requirements pass. Production backup/PITR validation, production recovery evidence, alert-delivery destination and receipt verification, full production monitoring validation, and expanded infrastructure controls are deferred only from the Internal MVP and remain mandatory for a future production release.

## Release Decision

**Internal MVP Released.** The validated feature is released for the classified single-owner internal scope under `cos-mvp-001-v1.0.0-internal`. These notes do not constitute a production release. Deferred production recovery, alerting, monitoring, and infrastructure requirements remain mandatory.
