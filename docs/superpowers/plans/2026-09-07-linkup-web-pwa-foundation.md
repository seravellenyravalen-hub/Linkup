# LinkUp Public Website + PWA Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the official LinkUp public website as a premium product showcase and installation gateway, with a coherent product vision that will later describe the main LinkUp app.

**Architecture:** A Vite + React single-page public product site with hash-based product sections, a PWA install shell, static legal/search assets, and a Firebase Hosting build target. The website presents the planned LinkUp ecosystem without pretending future native-app features are already available.

**Tech Stack:** React, TypeScript, Vite, Web App Manifest, Service Worker, Firebase Hosting.

**Spec:** `docs/superpowers/specs/2026-09-07-linkup-web-pwa-hosting-design.md`

## Global Constraints

- Use only original LinkUp branding/assets; do not copy WhatsApp or TikTok artwork, logos, or UI.
- The website is the public acquisition/showcase layer; the full native LinkUp app is a later phase.
- Keep future capabilities clearly labeled as planned/visionary until implemented.
- Keep secrets out of the web client.
- Web installation must use standard browser/PWA mechanisms.
- Preserve the existing email-verification and contact API integration.
- Official target URL is `https://linkup.web.app/` once the Firebase Hosting site is created and deployed.

---

### Task 1: Premium LinkUp product website

**Files:**
- Modify: `apps/web/src/App.tsx`
- Modify: `apps/web/src/styles.css`
- Modify: `apps/web/index.html`
- Modify: `apps/web/public/manifest.webmanifest`

- [x] Create a product-led homepage with premium LinkUp branding and install CTA.
- [x] Add product sections for Features, Messaging, Calling, Groups, Status, Discover, AI, Security and Download.
- [x] Add original CSS product previews for chat, moments and discovery rather than third-party imagery.
- [x] Keep the website distinct from WhatsApp while matching the completeness expected from a mature communication-product website.

### Task 2: Search and public-information foundation

**Files:**
- Modify: `apps/web/public/robots.txt`
- Modify: `apps/web/public/sitemap.xml`
- Modify: `apps/web/public/privacy.html`
- Modify: `apps/web/public/terms.html`

- [x] Point crawlers to the official LinkUp sitemap.
- [x] Replace placeholder sitemap URL with `https://linkup.web.app/`.
- [x] Polish public privacy and terms pages without claiming unimplemented production practices.
- [x] Add canonical/Open Graph/Twitter metadata to the homepage.

### Task 3: Automated web verification

**Files:**
- Create: `.github/workflows/web-check.yml`

- [x] Add a GitHub Actions web build check for the feature branch.
- [x] Build the web app with Node 22 and verify the generated manifest, service worker, robots and sitemap artifacts.
- [ ] Confirm the GitHub Actions run succeeds after the workflow is triggered.
- [ ] Perform browser-level visual verification after a deployable preview is available.

### Task 4: Firebase production delivery

**Files:**
- Existing: `firebase.json`, `.firebaserc.example`

- [ ] Connect the repository to the user's Firebase project/site.
- [ ] Build `apps/web` and deploy the generated `apps/web/dist` through Firebase Hosting.
- [ ] Verify `https://linkup.web.app/` loads over HTTPS.
- [ ] Verify installation prompt/manifest/service worker in supported browsers.

### Task 5: Final verification

- [ ] Run the web build successfully.
- [ ] Inspect the final rendered site on mobile and desktop.
- [ ] Verify navigation, install CTA, legal pages, sitemap, robots and update flow.
- [ ] Confirm no unrelated native-app code was changed by this website phase.
- [ ] Only report production completion after deployment evidence is available.
