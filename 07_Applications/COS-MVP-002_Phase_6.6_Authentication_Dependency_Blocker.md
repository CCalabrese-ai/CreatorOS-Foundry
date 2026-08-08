# COS-MVP-002 Phase 6.6 Authentication Dependency Blocker

**Phase:** 6.6 — Remediation (Human Accessibility Validation)
**Version:** 2.0
**Document owner:** Quality Owner and Data Owner
**Status:** Internal Auth Configuration Validated — Email Delivery Capacity Pending
**Risk class:** Moderate
**Capability ID:** COS-MVP-002
**Release status:** Not Released (unchanged)

## Purpose

This note records a blocker discovered while beginning execution of the Phase 6.6 Human Accessibility Test Checklist: the app's passwordless sign-in cannot currently send email to any address, which blocks every checklist item that requires an authenticated session. This is a blocker record, not a validation result, and not a release decision. **No application code was changed in the original investigation or in this update.** The configuration correction described in the new section below was performed manually in the Supabase Dashboard by the operator — it is not a code change and nothing in this repository was modified to produce it.

**Revision note (v2.0):** the original investigation (Section "Error" through "Required Resolution Path" below) is preserved unchanged as the historical record of the initial finding. A new section, "COS-MVP-002 Phase 6.6 Authentication Configuration Validation," documents a subsequent Site URL / redirect URL correction and re-verification. Per this document's ongoing evidentiary standard, that section distinguishes explicitly between what was independently re-tested and confirmed in this session versus what is reported as having been changed in the Supabase Dashboard, which was not directly viewed in this session (no dashboard or Management API access was available here, consistent with every prior phase).

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

## COS-MVP-002 Phase 6.6 Authentication Configuration Validation

### 1. Supabase Auth configuration investigation — completed

The findings in the original section above are reconfirmed, not superseded: the app uses the correct Supabase project (`ygcldesxjwotrjarvvoh`), the magic-link request reaches Supabase successfully, and the originally reproduced failure was `HTTP 429 over_email_send_rate_limit` — an outbound email-sending capacity limitation from Supabase's default email provider, not an application defect. The magic-link email template itself was confirmed by the operator to exist and be correctly configured in the Supabase Dashboard; this specific point (template content/configuration) was not independently viewed in this session, since it requires dashboard access this session does not have.

### 2. Additional configuration issue discovered and corrected

**Reported by the operator, corrected manually in the Supabase Dashboard — not a code change, and not directly viewed by this session:**

- **Before:** Site URL was `http://localhost:3000`; no redirect URLs were configured.
- **Mismatch:** the Creator OS dev server runs on `http://localhost:5173`, and the app calls `signInWithOtp` with `emailRedirectTo: window.location.origin` (`src/main.js`) — meaning the redirect target it actually sends is whatever origin the page is currently loaded from, `http://localhost:5173` in this environment. Against a Site URL of `:3000` with no additional redirect URLs allowlisted, this would be a genuine mismatch.
- **Correction applied (per operator report):** Site URL changed to `http://localhost:5173`; redirect URL `http://localhost:5173/*` added.

**Independently re-tested in this session, to corroborate rather than simply accept this report:** with a preview server running at `http://localhost:5173`, a direct call to the same `/auth/v1/otp` endpoint the app uses — same project URL, same publishable key, same payload shape, with `emailRedirectTo` set to the live `http://localhost:5173` origin — returned:

```json
HTTP 200
{}
```

a clean success response, with the `:5173` redirect target accepted rather than rejected. The very next attempt (both a repeat direct call and a real submission through the app's own sign-in form) immediately returned `429 over_email_send_rate_limit` again. This pattern — one accepted send, then an immediate rate-limit block — is consistent with the redirect-URL correction being in effect (a still-misconfigured Site URL would be expected to reject the `:5173` redirect outright, not accept it and then separately rate-limit) and is independent evidence, not just a restated claim. It does not, by itself, constitute direct visual confirmation of the Dashboard's Site URL field — that was not viewed in this session.

### 3. Classification update

**Previous classification:** Authentication blocked.

**Updated classification:** Internal authentication configuration validated. Remaining dependency: production email delivery provider configuration.

**Internal MVP testing can proceed once email-sending capacity is available or the rate limit resets.** The configuration-level obstacle (Site URL / redirect URL mismatch) that would have blocked authentication even with sufficient email capacity is reported corrected and is independently corroborated, not merely asserted. The sole remaining obstacle to resuming the Human Accessibility Test Checklist's authenticated sections is Supabase's default email-sending rate capacity, exactly as classified in the original investigation above — this has not changed.

**Production readiness is a separate, later concern, out of scope for Internal MVP testing, and requires, at minimum:**
- a final product identity/domain decision
- a verified sending domain
- a production SMTP provider configuration (for example, Resend) — not attempted, configured, or recommended as complete in this document

## What This Document Does Not Do

- It does not modify any application code, configuration, or environment file — including in this update. The Site URL / redirect URL correction described above was performed manually in the Supabase Dashboard by the operator, outside this repository.
- It does not change COS-MVP-002's release status, which remains **Not Released**.
- It does not make or imply a release recommendation, a Go decision, or release approval of any kind.
- It does not create or reference any tag or release.
- It does not make any production-readiness claim — production email delivery remains unconfigured and is explicitly out of scope here.
- It does not resolve the remaining email-capacity dependency — it records what was validated and what still blocks full authenticated testing.

## References

- [Phase 6.6 Human Accessibility Test Checklist](COS-MVP-002_Phase_6.6_Human_Accessibility_Test_Checklist.md) — the checklist this blocker interrupts
- [Phase 6.6 P62-003 Accessibility Validation Report](COS-MVP-002_Phase_6.6_P62-003_Accessibility_Validation_Report.md)

## Change History

| Version | Change |
| --- | --- |
| 1.0 | Initial blocker record: `over_email_send_rate_limit` (HTTP 429) reproduced directly against the live Supabase endpoint with two independent email addresses, classified as a project-side email-capacity limitation rather than an application defect, scoped impact on the accessibility checklist, and required resolution path documented |
| 2.0 | Added "Authentication Configuration Validation" section: documented an operator-reported Site URL/redirect URL correction (`localhost:3000` → `localhost:5173`, redirect URL added), independently corroborated via a fresh direct API call that succeeded with the `:5173` redirect target before immediately hitting the rate limit again on the next attempt. Updated classification to distinguish "internal auth configuration validated" from the still-open "production email delivery provider configuration" dependency. No code, configuration, or environment file changed. |
