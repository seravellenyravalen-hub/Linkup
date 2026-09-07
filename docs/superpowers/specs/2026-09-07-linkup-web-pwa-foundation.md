# LinkUp Web + PWA Foundation

## Goal
Create LinkUp's official HTTPS web home as an installable PWA, with a premium original visual system, release/update center, contact/report flow, and a clean foundation for a future AI-operated publishing layer.

## Architecture
The web client is a standalone Vite + React application under `apps/web`. It uses the existing LinkUp API for authenticated/report operations and a service worker for web asset updates. Contact reports are persisted in PostgreSQL and can notify the configured admin inbox through a server-side email provider; secrets never ship to the browser.

## Release model
A release manifest is the source of truth for current web/native versions and release notes. Web releases use service-worker update detection. Native update prompts point users to a trusted installation/update mechanism and never attempt silent APK replacement. A later AI release agent can update release metadata and publish announcements after deployment checks.

## Contact/report model
Users submit name, email, category, subject, message, and optional authenticated user ID. The API stores the report and sends a notification to `CONTACT_ADMIN_EMAIL`, configured in the backend environment. The initial admin destination is the owner's supplied address, but the address is represented through an environment variable rather than frontend code.

## Success criteria
- HTTPS-ready responsive web application with install prompt.
- Custom LinkUp branding and original interface graphics.
- Contact/report form with clear success/error states.
- API route for storing reports and notifying the configured admin inbox.
- Release/update surface ready for future AI automation.
- No private secrets embedded in source.
