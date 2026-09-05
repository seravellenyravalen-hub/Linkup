# LinkUp 1.0 Product & Architecture Specification

## Product goal
LinkUp is a real, production-quality, mobile-first messaging platform for Android and iOS, built to begin with reliable 1:1 messaging and grow cleanly into a broader social platform.

## Core principles
- Real product, not a demo or simulated backend.
- Fast, reliable, secure, accessible, global-ready, and scalable.
- PostgreSQL is the authoritative persistent source of truth.
- Server-authoritative authorization and realtime behavior.
- Preserve accounts, conversations, settings, and data across safe updates.
- Original LinkUp visual identity and custom iconography; do not present generic existing icon glyphs as the brand/UI identity.
- GameVisionAndroid is unrelated and must never be modified by LinkUp work.

## Client and backend
- Mobile: React Native + Expo + TypeScript.
- Backend: NestJS + TypeScript modular monolith.
- API: versioned REST under `/api/v1`.
- Realtime: WebSockets.
- Database: Neon PostgreSQL.
- Backend hosting: Railway.
- Source control: GitHub.
- Push: Expo Notifications using APNs/FCM.
- Media: object-storage abstraction.
- Monitoring/analytics: PostHog and infrastructure monitoring where appropriate; never collect private message content merely for analytics.

## Authentication and identity
Email/password authentication initially, secure password hashing, email verification, password reset, recovery codes, optional 2FA foundation, secure server-side sessions with short-lived credentials and refresh/session rotation, logout, device/session management, suspicious-login alerts, and reliable session restoration after updates.

Every account has a globally unique, case-insensitive public `@username`. Display names are non-unique. Email addresses remain private and are never exposed through public search. Search supports exact username and display name.

## Navigation
Primary tabs: Chats, Search, Notifications, Me. Authentication/onboarding is separate. Navigation is feature-based so future Groups, Stories, Videos, Calls, and Social modules can be added without restructuring the foundation.

## Messaging V1
V1 supports 1:1 conversations with text, images, short videos, voice messages, and files/documents. Messaging includes replies, original LinkUp reactions, delete for me, delete for everyone, message search, typing indicators, presence, last seen, read receipts, delivery states, failed-message retry, and conversation pin/mute/archive/mark-unread/unread counts/recent previews.

Message lifecycle: sending -> sent -> delivered -> read. Client-generated idempotency IDs prevent duplicates during retries. Server assigns authoritative message IDs. Realtime events include `message.created`, `message.delivered`, `message.read`, `message.deleted`, `typing.started`, `typing.stopped`, `presence.changed`, and `sync.required`.

## Data model foundation
Core relational models: users, profiles, sessions, devices, conversations, conversation_members, messages, message_status, blocks, reports, notifications, settings, and security/audit events. Message records support future message types. Database changes use versioned migrations.

## Realtime and offline behavior
Clients send through the backend; backend validates and authorizes, persists, then publishes authoritative realtime events. Offline recipients synchronize later. The mobile app uses a local cache/database and outgoing queue with retry, reconnect/sync, duplicate prevention, and graceful degradation during server unavailability. Cached recent chats/messages render immediately while PostgreSQL remains authoritative.

Presence and typing are realtime and privacy-aware. Durable last-seen timestamps are stored in PostgreSQL. Behavior must remain correct across backgrounding, network changes, disconnect/reconnect, and multiple devices.

## Security and privacy
V1 is secure server-side messaging and is explicitly NOT true end-to-end encryption. Do not claim E2EE. Use TLS in transit, strict authorization, conversation membership validation, secure sessions, rate limiting, abuse protection, secure media access, security event logging, and device/session controls.

Privacy controls cover online status, last seen, typing indicators, read receipts, blocking, muting, app lock, and device/session management. Blocking is enforced server-side across devices. Reporting is separate and stores reason/description for moderation review. Basic automated abuse detection, spam protection, rate limits, suspicious-login detection, and audited security events form the moderation foundation.

## Notifications
Backend decides when push is needed. Avoid push when the user is actively viewing the relevant conversation and realtime delivery is sufficient. Device tokens are stored securely. Respect mute/block/preferences. Support intelligent grouping, original LinkUp sound/haptic identity, user sound/vibration controls, system silent settings, and accessibility alternatives.

## Media
Use an object-storage abstraction for profile pictures and message media. PostgreSQL stores metadata/references, not raw media. The abstraction must support future image/video/audio/file/story/creator-media expansion.

## Original product experience
LinkUp uses an original logo/brand mark derived from the concept of connection without simply reproducing two chain links. The UI uses a custom icon family, custom buttons/controls, message bubbles, loading states, transitions, empty states, and reaction interface. Support light, dark, and system appearance, custom sounds/haptics, reduced motion, and accessibility labels. Do not copy another app pixel-for-pixel.

## Onboarding
Launch -> LinkUp brand animation -> Welcome -> Create account / Sign in -> email verification -> username -> profile setup -> privacy choices -> Chats. Keep onboarding short and premium while supporting reliable session restoration.

## Admin and support
Separate protected admin system with RBAC, strong authentication, least privilege, audited actions, user management, reports, moderation, security events, system health, feature flags, support, version information, and audit logs. Admin access does not automatically grant unrestricted access to private conversations.

In-app Help & Support covers technical problems, account/security issues, abuse reports, FAQ/help, support tracking, optional screenshots, and device/app version diagnostics.

## Accessibility and global readiness
Support dynamic text sizing, screen readers, labels for custom icons, adequate touch targets, contrast, reduced motion, haptic control, non-gesture alternatives, localization, RTL, Unicode, time zones, localized date/time/number formatting, and future international phone numbers. Privacy/legal behavior should be region-aware.

## Performance and observability
Optimize startup, cached-chat rendering, WebSocket efficiency, background synchronization, image/media handling, database indexes, connection pooling, rate limiting, and graceful degradation. Monitor backend errors, API failures, WebSocket failures, message delivery failures, push failures, database health, slow requests, app crashes, authentication failures, sync failures, deployment health, and security events.

## Release strategy
Use semantic versioning: 1.0.0 -> 1.1.0 -> 1.2.0 -> 2.0.0. Use GitHub version control, tags/releases, automated tests, database migrations, backward-compatible API evolution where possible, staged deployment, rollback capability, and version compatibility checks. The app can show New version available, Version, What’s new, and Update. Normal updates must not lose accounts, conversations, or settings.

## Future modules
Groups, communities, channels, stories, following, voice/video calls, social feed, short videos, creators, live, discovery, recommendations, monetization, and advanced AI are future modules, not V1 placeholders. The architecture must allow them to be added cleanly later.

## AI foundation
AI is a future shared platform capability for smart message assistance, translation, summaries, transcription, smart search, spam/abuse detection, discovery, creator tools, and accessibility. Privacy boundaries must prevent silent unrelated processing of private conversations.

## V1 acceptance criteria
A real install can register/login/verify, create a username/profile, search users, start a 1:1 chat, send/receive messages in realtime, exchange supported media/voice/files, observe delivery/read states, receive notifications, operate offline and recover, use multiple devices, search messages, block/report, configure privacy, manage sessions, recover an account, and update safely without data loss.
