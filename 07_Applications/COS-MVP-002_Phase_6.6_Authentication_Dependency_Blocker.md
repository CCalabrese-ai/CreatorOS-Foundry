# COS-MVP-002 Phase 6.6 Authentication Dependency Blocker

**Phase:** 6.6 — Remediation (Human Accessibility Validation)
**Version:** 1.0
**Document owner:** Quality Owner and Data Owner
**Status:** Blocker — Validation Dependency Unavailable
**Risk class:** Moderate
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This note records a blocker discovered while beginning execution of the Phase 6.6 Human Accessibility Test Checklist: the app's passwordless sign-in cannot currently send email to any address, which blocks every checklist item that requires an authenticated session. This is a blocker record, not a fix, a validation result, or a release decision.

## Error

`over_email_send_rate_limit`, HTTP `429`, returned by the Supabase Auth endpoint (`/auth/v1/otp`) that the app's "Send secure link" flow calls.

## Reproduction Evidence

1. Submitted the real sign-in form in the running dev app (`npm run dev`, `http://localhost:5173`) with a test email address. The UI showed its generic failure message: "The sign-in link could not be sent."
2. The app deliberately does not surface the underlying Supabase error to the UI (`src/main.js`: `status.textContent = error ? 'The sign-in link could not be sent.' : ...`), so the real cause was retrieved by calling the exact same Supabase endpoint directly from the page's own JavaScript context, using the app's real project URL and publishable key, with the same payload shape the app itself sends:

   ```json
   {"code":429,"error_code":"over_email_send_rate_limit","msg":"email rate limit exceeded"}
   ```

3. Repeated the identical call with a second, completely different, never-previously-used email address. Result: **the same `429 over_email_send_rate_limit`.** This rules out a per-address cause (e.g., a specific bounced or blocked recipient) — the block applies project-wide, to any recipient.
4. Confirmed the app itself is the correct build and is pointed at the correct, expected Supabase project (`ygcldesxjwotrjarvvoh.supabase.co`, matching `.env.local` and every prior validation phase) — the failure is not caused by a misconfigured or wrong environment.

## Root Cause Classification

**Supabase project configuration / plan-capacity limitation — exhausted outbound email-sending capacity.** `over_email_send_rate_limit` is Supabase's standard error code for its default, built-in email-sending service, which carries a low rate cap by design (intended for development/testing volume, not sustained use). It is a deterministic block, not a transient glitch — it does not resolve itself on retry and will keep recurring for any recipient until either the rate window resets or the project is configured to send auth email through a custom SMTP provider instead of Supabase's default sender.

**What was not accessible during this investigation:** the Supabase project's Auth settings (Site URL, redirect-URL allowlist, email provider/SMTP configuration) could not be inspected directly — no Supabase Management API connector or dashboard session was available in this environment. This does not weaken the root-cause finding above, which was established directly from the API's own error response, not inferred from configuration inspection.

## Why This Is Not an Application Defect

- The app's sign-in request is correctly formed: correct endpoint, correct project URL, correct publishable key, correct payload shape — confirmed by independently reproducing the identical call outside the app's own code and receiving the identical result.
- The request successfully reaches the real Supabase host and receives a well-formed, valid JSON error response. There is no network failure, no CORS failure, no DNS failure, and no client-side exception — the failure is Supabase's own server-side rate-limit rejection, not a bug in how the request is constructed or sent.
- The failure is reproducible with a second, unrelated email address with an identical result, which rules out anything specific to a single recipient or to malformed input from the form.
- No source file, environment variable, or configuration value inspected during this investigation was found to be incorrect.

## Impact on Accessibility Validation Scope

Every checklist item that requires an authenticated session is currently blocked, regardless of which tester or which real email address is used, because the block is project-wide rather than per-recipient:

- **Section 3 (Authenticated Documentation Registry Session)** — entirely blocked; item 3.1 (requesting the sign-in link) is the first step and cannot succeed.
- **Section 2, items 2.4–2.9 (VoiceOver validation of authenticated content: filters, live-region announcements, dialog announcements, close/focus-restoration, error-state announcement)** — blocked, since they require signing in first.
- **Section 4 (Dialog/Detail Panel Behavior Evaluation)** — entirely blocked; all six items require an open, authenticated document detail panel.
- **Not blocked:** Section 1 (physical keyboard Enter/Space activation) and Section 2, items 2.1–2.3 (page load, skip link, sign-in form announcement) — these can proceed on the unauthenticated screen without waiting for this to resolve.

## Required Resolution Path

Resolution is outside this environment's available access and is not attempted here. It requires one of, performed by whoever holds Supabase project/dashboard access:

1. Wait for Supabase's default email rate-limit window to reset, and retry — the least-effort option, but timing is not controllable or verifiable from this environment.
2. Configure a custom SMTP provider for the project's Auth email sending (Supabase Dashboard → Authentication → Email settings), which carries a materially higher, provider-defined rate limit instead of the default built-in sender's cap.
3. Confirm, once either of the above is in place, that a real sign-in attempt succeeds end-to-end (email received, link functional) before resuming the Human Accessibility Test Checklist's authenticated sections.

## What This Document Does Not Do

- It does not modify any application code, configuration, or environment file.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not make or imply a release recommendation.
- It does not resolve the blocker — it records it for whoever holds the access needed to act on it.

## References

- [Phase 6.6 Human Accessibility Test Checklist](COS-MVP-002_Phase_6.6_Human_Accessibility_Test_Checklist.md) — the checklist this blocker interrupts
- [Phase 6.6 P62-003 Accessibility Validation Report](COS-MVP-002_Phase_6.6_P62-003_Accessibility_Validation_Report.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial blocker record: `over_email_send_rate_limit` (HTTP 429) reproduced directly against the live Supabase endpoint with two independent email addresses, classified as a project-side email-capacity limitation rather than an application defect, scoped impact on the accessibility checklist, and required resolution path documented |
