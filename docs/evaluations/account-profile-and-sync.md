# Parent account and sync clarity — 10/10/2026

Founder supplied a signed-in Google screenshot with an unclear transfer failure and asks for name/email/avatar plus understandable data/sync management. The screenshot establishes reported Google sign-in at capture time, not a successful upload. Agent IAB session is signed out; no founder credentials, Google sign-in or transfer confirmation were performed.

## Implementation

- Server-authenticated current-user profile: bounded display name/email and allowlisted HTTPS Google avatar, no metadata/token/identity payload dump. Avatar failure/missing photo falls back to an initial or user icon; display metadata never authorizes access.
- Separate device-only and account storage locations, real saved word/set counts, current learning source and named actions. Account overview is an explicit read-only status query; routine background session checks do not request counts. Owner/library filters and existing RLS remain. No new profile table or schema/RLS changes.
- Sign out/change account preserves device lessons; the next OAuth request asks Google to choose an account. Source photos and deletion options are progressively disclosed. Opening account lessons loads its scoped cache before switching.
- Preview/confirmation remain separate before transferring device lessons. Original device library and pre-transfer backup preserved, no automatic guest/photo upload. Stages show library check, account read and comparison. HTTP status and allowlisted cause are visible in error details: schema missing/not ready, permission, expired session, conflict, network and timeout; no raw database/secret message.
- Sync shows pending send, conflicts and last successful timestamp, preserved after failure. Counts refresh after explicit synchronization. Authentication and storage readiness are separate states; an unknown sign-in request is not labeled signed out.

[Supabase Google sign-in](https://supabase.com/docs/guides/auth/social-login/auth-google), [PostgREST errors](https://docs.postgrest.org/en/latest/references/errors.html) informed safe profile and schema-code mapping. These sources do not establish this founder's live failure cause.

## Validation / continuation

Current check: pnpm check PASS132 tests17files/lint/typecheck/build; final lint/typecheck PASS; full pnpm test:e2e PASS153/153 (2.0min), including PostgreSQL-backed real-route PKCE/transfer/sync/owner isolation and six desktop/mobile profile/error/avatar checks. Full docs validator PASS225links/17skills351resources/25requirements19tasks16screens/27JSON. Reviewed responsive synthetic screenshots account-desktop-chromium.png and account-mobile-chromium.png. Earlier browser attempts were discarded: an overlapping build invalidated served chunks; new alert assertions matched the hidden Next route announcer; stale old-copy assertions were loaded before their update. Final run used the completed build and stable tests, with all153 passing. Physical-device/human acceptance and actual founder Google session/transfer failure remain unverified; optional browser clarification requested while independent implementation proceeds.

Do not add .env.example (pre-existing user modification) or eng.traineddata (unrelated untracked file). No global auth/provider settings changed. Source4ba88ad native Git production deployment READY dpl_4Pkgq3eQuSyLVLEVK45jHQxNGUPq, stable https://words-for-kids.vercel.app/account. Hosted agent IAB signed-out UI verified: enabled Google sign-in, device13words/1set retained, correct local learning source and account storage prompt. Screenshot /tmp/wfk-account-live.jpg is local-only; committed profile screenshots use labeled synthetic test data. RemoteCI38050668437 pnpm check SUCCESS; remaining stages in progress at checkpoint. Founder signed-in request remains unverified unless the intended browser/session is supplied.


Latest continuation ADR040/041: founder Chrome session now accessible. Real schema absence identified and repaired with0001–0006 atomic setup;24forcedRLS tables and authenticated13word preview verified. Google marks/back icons and shared Theme C refinements supersede these earlier screenshots; current implementation/evidence at [UI and hosted repair](ui-and-hosted-cloud-fixes.md). Founder original library remains on device until its explicit transfer confirmation.
