# Creator OS Foundry MVP Environment Configuration Management

**Phase:** 3.4 — MVP Environment Initialization  
**Version:** 1.0  
**Document owner:** Security Owner, Operations Owner, and Application Owner  
**Status:** Proposed  
**Risk class:** High

## Purpose

This document defines how MVP configuration is declared, validated, stored, promoted, rotated, observed, and recovered across local, preview, staging, and production environments.

## Configuration Principles

- Configuration is explicit, typed, validated at startup, and owned.
- Secret values are referenced and injected, never committed.
- Browser-public and server-only values use separate allowlisted contracts.
- Environments share configuration shape but never credentials or data stores.
- The same immutable application build is promoted with environment-specific protected values.
- Missing, malformed, unexpected, or unsafe configuration fails before traffic.
- Configuration changes are reviewed and audited like code.

## Configuration Classes

| Class | Examples | Exposure | Owner |
| --- | --- | --- | --- |
| Public application | Environment label, safe origin, public feature presentation | Browser only when explicitly approved | Application Owner |
| Publishable service | Supabase URL and publishable key | Browser and server | Data and Security Owners |
| Server secret | Supabase secret or service role, GitHub credential, signing material | Protected server runtime only | Security Owner |
| Domain policy | Limits, workflow IDs, approval thresholds, classifications | Server configuration or governed data | Domain Owner |
| Operational | Logging level, telemetry destination, health thresholds | Protected runtime | Operations Owner |
| Build | Runtime mode, release SHA, contract version | Build metadata without secrets | Release Owner |
| Test | Local endpoints, synthetic identities, deterministic flags | Local or isolated CI | Quality Owner |

## Environment Matrix

Local uses ignored developer values and synthetic data. Preview uses short-lived credentials and isolated services. Staging uses dedicated protected values and production-like controls with sanitized fixtures. Production uses dedicated least-privileged credentials, strict origin and redirect allowlists, monitoring, rotation, and break-glass procedures.

No secret, database, storage bucket, OAuth redirect set, or unrestricted backup is shared between environments.

## Source and Storage

The repository commits a configuration schema, example names and descriptions, safe defaults where appropriate, and validation tests. Secret managers or approved platform stores hold protected values. Local ignored files may hold development-only values. Chat, issue comments, client analytics, URLs, source maps, and build logs are prohibited secret stores.

## Naming and Validation

Each variable has a stable name, type, required environments, owner, classification, default rule, rotation rule, and consumer. Browser-exposed prefixes are treated as a public disclosure boundary. The build scans browser artifacts for server-only names and secret-like values.

Startup validation rejects missing required variables, unknown privileged variables, invalid URLs, unsafe origins, production values in non-production, local endpoints in production, and mismatched environment labels.

## Change Workflow

1. Identify the affected consumers, environments, risk, and rollback.
2. Update the configuration schema and example documentation before values.
3. Review public exposure, secret classification, and provider requirements.
4. Provision or rotate values through the approved protected channel.
5. Test locally or in preview with synthetic data.
6. Deploy the same immutable build to staging with staging values.
7. Validate startup, Auth redirects, database target, integrations, and telemetry.
8. Approve and apply production values through separation of duties.
9. Verify health and record the configuration version without recording values.
10. Revoke superseded credentials and close the change.

## Supabase Controls

Each environment uses its own project URL, publishable key, server secret reference, database connection reference, Auth redirect allowlist, and exposed-schema policy. Browser clients never receive secret or service-role keys. Current Supabase client, CLI, Data API, and Auth behavior must be reviewed during dependency or platform upgrades.

## Feature Flags

Flags have a stable key, owner, purpose, default by environment, audience, activation and rollback criteria, telemetry, and expiry date. Flags cannot bypass authorization, migrations, security review, or release gates. Unknown flags fail to their safe default.

## Rotation and Revocation

Secrets have accountable owners, documented consumers, rotation triggers, overlap rules, verification, and emergency revocation. Compromise triggers incident response. Rotation is tested in staging and must not require rebuilding the application unless the build contract explicitly permits it.

## Failure and Recovery

Invalid configuration blocks startup or marks a dependency unavailable; it must not produce a healthy empty state. Configuration rollback restores the last approved version while compromised credentials remain revoked. If the target environment is ambiguous, deployment stops.

## Acceptance Criteria

- Every configuration field is typed, classified, owned, and validated.
- Browser artifacts contain only allowlisted public configuration.
- Environments use distinct services, data, and credentials.
- Secret changes occur through protected channels with rotation and audit.
- One immutable build can be promoted across environments.
- Misconfiguration fails safely and appears in health and release evidence.
- Flags cannot bypass policy or remain indefinitely without review.

## References

- [MVP Development Environment Setup](MVP_Development_Environment_Setup.md)
- [MVP Supabase Integration Implementation](MVP_Supabase_Integration_Implementation.md)
- [Supabase Environment Strategy](../05_Database/Supabase_Environment_Strategy.md)
- [Secrets Management](../08_Security/Secrets_Management.md)
- [Application Security Model](Application_Security_Model.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial Phase 3.4 MVP environment configuration management |
