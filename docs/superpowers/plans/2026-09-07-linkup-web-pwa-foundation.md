# LinkUp Web + PWA Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first official LinkUp web/PWA client and a durable contact/report delivery foundation.

**Architecture:** Vite + React web client with a service worker and manifest. Existing Node HTTP API gains a contact module backed by PostgreSQL and a server-side email adapter using a provider API such as Resend. Release metadata is explicit and later becomes the control surface for the LinkUp AI release agent.

**Tech Stack:** React, TypeScript, Vite, Web App Manifest, Service Worker, Node HTTP, PostgreSQL, provider HTTP API.

**Spec:** `docs/superpowers/specs/2026-09-07-linkup-web-pwa-foundation.md`

## Global Constraints

- Keep secrets server-side; never put provider API keys in `apps/web`.
- Admin report destination is configured by `CONTACT_ADMIN_EMAIL`; the supplied destination is `seravellenyravalen@gmail.com`.
- Web updates must use normal PWA/service-worker mechanisms.
- Native Android updates must remain user-confirmed or store-managed.
- Preserve LinkUp's original premium visual identity; do not copy another product's UI.

---

### Task 1: Web application shell

**Files:**
- Create: `apps/web/package.json`, `apps/web/index.html`, `apps/web/tsconfig.json`, `apps/web/vite.config.ts`, `apps/web/src/main.tsx`, `apps/web/src/App.tsx`, `apps/web/src/styles.css`
- Create: `apps/web/public/manifest.webmanifest`, `apps/web/public/sw.js`, `apps/web/public/icons/linkup-mark.svg`

- [ ] Build the responsive shell with Home, Product, Updates, Contact, Help and Install navigation.
- [ ] Add the install prompt using `beforeinstallprompt` where supported and an iOS Add-to-Home-Screen explanation where it is not.
- [ ] Register the service worker and expose an update-available action.
- [ ] Verify production build with `npm run build`.
- [ ] Commit the web shell.

### Task 2: Contact/report backend

**Files:**
- Create: `database/migrations/005_contact_reports.sql`
- Create: `apps/api/src/modules/contact/contact.repository.ts`, `contact.service.ts`, `contact.controller.ts`, `contact.test.ts`, `index.ts`
- Modify: `apps/api/src/http/server.ts`

- [ ] Add durable report storage with status and timestamps.
- [ ] Validate email, subject and message lengths server-side.
- [ ] Send a server-side notification through the configured email provider with Reply-To set to the reporter's email.
- [ ] Return a stable report ID and success response.
- [ ] Add tests for validation and provider behavior.
- [ ] Commit the contact subsystem.

### Task 3: Release/update center

**Files:**
- Create: `apps/web/src/release.ts`, `apps/web/public/release.json`
- Modify: `apps/web/src/App.tsx`

- [ ] Show current release, release notes, update channel and native update guidance.
- [ ] Make the release manifest machine-readable for the future AI release agent.
- [ ] Add service-worker update detection and reload flow.
- [ ] Commit the release center.

### Task 4: Firebase Hosting readiness

**Files:**
- Create: `firebase.json`, `.firebaserc.example`, `apps/web/.env.example`
- Modify: `apps/web/package.json`

- [ ] Configure SPA fallback to `apps/web/dist` without embedding credentials.
- [ ] Document the single Firebase deployment command and required project selection.
- [ ] Verify the generated `dist` contains the manifest and service worker.
- [ ] Commit hosting configuration.

### Task 5: Verification

- [ ] Run API tests for the contact module and HTTP router.
- [ ] Run web typecheck/build.
- [ ] Inspect the Git diff for secrets and incorrect public endpoints.
- [ ] Only report completion after the verification output is available.
