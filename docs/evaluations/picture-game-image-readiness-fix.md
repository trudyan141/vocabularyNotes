# Picture games: actual image readiness — 12/10/2026

Status: implemented_local, scoped verified. Direct founder report: sister/brother entered picture-to-word despite missing/default artwork. Initial working tree clean; no founder browser, hosted learning data, deployment or environment changes.

## Root cause and acceptance

`safeArt` checked an allowed catalog identifier, not whether its bytes loaded or decoded. Online OpenMoji metadata therefore admitted unavailable images. A second renderer bug passed an empty headword into `approvedMedia`, so valid imported images failed ownership/content validation and displayed default artwork.

Both picture-to-word and word-to-picture now decode real images before selecting targets/distractors, with two concurrent loads and an eight-second timeout per image. Missing, failed, empty or undecodable images are excluded; other pictured words fill the normal selection. Fewer than three eligible choices retains the existing recovery message. Resume and answer mutations verify image readiness outside database transactions, then retain metadata/revision/CAS checks inside. Per-repository decoded results avoid repeated downloads within a session; each new start retries availability. Render errors stop active picture games without adding a wrong attempt. Imported art uses the actual headword while image alt remains empty. Offline picture games also validate images before start/resume/mutations and stop on rendering failure. Text-based modes continue to allow words without images.

## Verification

- Failing regression first: `pnpm test tests/integration/learning.test.ts -t 'checks actual image'` failed because sister/brother were selected despite a failed image loader.
- `pnpm test tests/integration/learning.test.ts tests/unit/load-picture.test.ts`: **26 PASS**. Includes both picture modes, sister/brother replacement, selected missing word recovery, stale imported art, broken resume refusing attempts, text-only eligibility, decoder failure/empty/timeout.
- `pnpm lint`, `pnpm typecheck`: **PASS**. Scoped ESLint rerun after the test selector corrections also passed.
- Discovery selected **12** cases on desktop1280/mobile360, then `pnpm test:ui -- --mode production ready-picture-games.spec.ts learning.spec.ts --grep 'picture games|removing a distractor|broken image|offline games and paused|offline illustrated chooser'`: **12 PASS**, build **PASS**. Covers 404 and HTML instead of SVG, mid-session image failure, valid imported JPEG rendering in both games, distractor removal, offline gameplay/resume. Chromium is isolated automation, not the founder browser or a physical phone.
- Final runner source: commit `283ddb3`, fingerprint `3851c4964cfc`; result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-WW6T6K/result.json`; build37.2s, browser24.6s. Node24.14.1/pnpm11.25.0.

## Reruns and limits

Initial HTTP fault injection was intercepted by PWA precache: fixture correction blocks service workers only in ready-picture tests. Expanded checks exposed two stale selectors (resume button and upload input); selectors were corrected, app behavior already present. A dev runner attempt hit a Next dev fixture lock and executed no browser cases; final production run passed all selected cases. No app patch for that environment failure. Generated legacy screenshot writes were restored to their original checked-in bytes.

No live remote media/provider availability, physical device or deployment verification is claimed. Token usage unavailable. No broad release suite run; verification scoped to image games, local data and offline behavior.
