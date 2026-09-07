# LinkUp Web/PWA Hosting Completion Design

## Goal
Finish the official LinkUp web/PWA foundation so it is ready to be hosted as the web client, with a reliable install experience, update lifecycle, email verification, contact/report delivery foundation, security configuration, and automated build verification.

## Architecture
The web client remains a React + Vite PWA served from Firebase Hosting. It is a separate client from the native Expo Android app, but both use the same LinkUp API and PostgreSQL backend. The web client must never contain server secrets; production API and email configuration are supplied through hosting/deployment configuration.

## Completion Scope

1. **PWA installation and metadata**
   - Keep standalone display and LinkUp branding.
   - Provide installable icon assets in standard Android/browser sizes in addition to the existing scalable mark where needed.
   - Preserve the explicit install prompt and browser fallback instructions.

2. **PWA updates/offline behavior**
   - Keep the versioned service worker and explicit update activation.
   - Prevent stale service-worker and release metadata from blocking new releases.
   - Keep network-first behavior for same-origin GET requests with cached fallback.

3. **Account verification**
   - Keep `/verify-email?token=...` as the web verification destination.
   - Ensure verification delivery is server-side and does not expose Resend credentials.
   - Provide a production-safe recovery path for delivery failures rather than claiming verification succeeded when delivery fails.

4. **Contact/report delivery**
   - Keep reports stored in PostgreSQL before external email delivery.
   - Return truthful status to the web client; a database persistence success must not be represented as an email delivery success.
   - Keep administrator email and Resend configuration server-side.

5. **Hosting/security**
   - Firebase Hosting serves `apps/web/dist`.
   - Keep HTTPS-only deployment assumptions, security response headers, SPA fallback, and no-cache handling for service-worker/release control files.
   - Keep `VITE_API_URL` as the only public web API configuration value.

6. **Automated verification**
   - Add GitHub Actions verification for the web build and API type/test checks using repository-safe configuration.
   - Do not require production secrets for CI.

7. **Documentation**
   - Document the final hosting flow, required public environment variable, API deployment dependency, and PWA installation/update behavior.
   - Do not claim Firebase, Railway, Neon, or Resend production activation until the corresponding account configuration and deployment have actually been verified.

## Non-Goals
- The native Android app is not replaced by the PWA.
- The PWA does not silently install or update the native Android application.
- No real financial custody, investment execution, or live Stripe processing is introduced.
- No server secret is placed in the web bundle.

## Success Criteria
- `npm run build` succeeds for `apps/web` in a clean environment.
- API typechecking/tests can run without production credentials.
- Firebase Hosting configuration serves the generated web build and preserves SPA routing.
- Browser installation is offered when supported and has a clear manual fallback when it is not.
- Web verification and contact flows are truthful about their backend dependency.
- The repository contains clear instructions for the final hosting sequence.
