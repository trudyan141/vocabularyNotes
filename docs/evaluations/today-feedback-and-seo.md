# Today review entry, request feedback and public SEO

10/10/2026, founder steering. Related T09/T14/T18, ADR-037/038.

## Behavior

- Today exposes `Ôn N từ hôm nay` beside the scoped approved due count. It opens due flashcards directly, capped at10 with a visible remaining-words explanation. The generic play action becomes secondary when words are due.
- One shared due selector serves Today and Practice. New approved words are due; future states, foreign scopes and unapproved senses are excluded; deleted review states do not suppress a live word. No rating/event is written by navigation. A session ID in the URL resumes the same version on reload. Empty/stale sessions expose recovery rather than a blank page.
- Offline fallback exposes the same due action after explicit local scope selection, retains the10-card cap and existing rating rules.
- Shared accessible request feedback displays the current action, elapsed seconds and a native progress bar. Batch preparation counts completed words, not guessed time percentages. Search/download phases, successes, missing matches, HTTP errors and per-word timeout are visible beside the action. One sequential batch ≤50 words/90s, each word ≤10s, Stop/retry keeps successes; retry fetches only remaining words. Local approval/save feedback sits beside its button. Dictionary/auto-photo pictures, Gemini checks, account/media/cloud/transfer operations have waiting feedback; existing result/error/recovery paths remain.
- Brand favicon ICO16/32/48, PNG16/32/48, Apple180, existing PWA192/512, original fox SVG. Deterministic `scripts/prepare-brand.mjs` produces assets during the existing PWA prebuild. Social preview1200×630 uses the original fox and brand copy, no lesson/key/private data.
- Metadata API: description, app/title template, OG/Twitter large image, absolute production URLs, locale, icons and WebSite JSON-LD. Welcome has canonical `/welcome` and indexing; private app pages remain noindex. robots excludes private routes/API; sitemap lists only public welcome. Preview deploys disallow indexing. No fabricated ratings, structured lesson data or SEO rank promises. [Next.js metadata reference](https://nextjs.org/docs/app/getting-started/metadata-and-og-images).

## Validation

Current check: pnpm check128 tests/16files, lint/typecheck/build PASS. Full147/147 desktop/mobile/cloud-fixture/offline browser tests PASS after updating the old welcome title assertion; full docs validator223 local links/17skills351resources/25requirements19tasks16screens/27JSON PASS. Production and remote CI pending. Do not treat fixture requests as live provider/account acceptance.

Initial regression run137 passed/6 failed: fixed unstable locale callback cancelling an in-flight review open; adjusted assertions to wait for saved question positions, scope alerts to main and select only the new lesson for missing-image fixtures. A successful earlier unit edit intentionally preserved approval, so the pending-sense fixture now explicitly seeds unapproved input. Brand image visual inspection found black contain padding; transparent padding corrected and sampled in an asset test.

No additional inference, account deletion or real child review ratings used for testing. Physical-device/human acceptance and search/social crawler cache refresh remain external.
