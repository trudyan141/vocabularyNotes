# Emma playback on mobile — reopened bug, 18/10/2026

Founder iPhone12 installed PWA: WordDetail/apple → Nghe stays “Đang tải giọng Emma…” then after~20s reports retry. This reopens device acceptance from the performance task. Baseline source commit557228b; clean working tree, separate branch `codex/fix-emma-mobile-playback`. No founder browser/account control.

## Reproduction and root cause

Backend POST `/api/audio/tts` already generates a short MP3; browser must receive the MP3 bytes to play it. No voice/model pack is downloaded. Public endpoint probe returned200/audio in1.216s. The UI text incorrectly described this as loading a voice.

Installed the missing Playwright WebKit runtime for this Safari-specific reproduction (no plugin/global runtime change). WebKit27.2, isolated iPhone12 viewport, same authored baseline app with synthetic local demo and a fixture audio response:

- [Native WebKit events](emma-mobile-playback/before-webkit.json): the one-sample silent WAV used to prime the media element emits `MEDIA_ERR_DECODE` (code3). Its `play()` promise remains pending. No real blob source reaches the player even though API returned audio.
- AudioControl explicitly `await primed` **after** receiving the backend clip; that wait blocks changing source to the actual audio until the16s guard fails. Chromium accepted that WAV; previous Chromium-only smoke missed this native WebKit failure.
- [Failing production UI run](emma-mobile-playback/before-ui.json):3/3WebKit cases fail, including native playback and injected nonsettling prime. Snapshot `wfk-ui-source-9C861R`, fingerprint `fdb64515cff3…`, production build passed. This is a real baseline engine failure as well as a deterministic injected regression; it does not assert remote control of physical iPhone.
- Complete40ms PCM silent WAV tested separately in WebKit and decoded/played successfully. Silent priming is a gesture helper, not learner audio or a prerequisite result.

## Scoped fix and acceptance

Replace the one-sample primer with a valid40ms clip and stop awaiting its promise. Real backend audio proceeds independently; pause/reassign the same player. Retain stop/hide/mic/unmount/abort/URL cleanup and bounded RAM cache. A valid synchronous cache lookup lets replay or an autoplay-denied retry call `play()` within the new tap, instead of losing that gesture through another promise. Source still only appears after actual audio `playing`; distinguish “Đang chuẩn bị âm thanh…” from “Đang bắt đầu phát…”, with bounded retry if actual playback never starts.

Regression cases: native media playback; permanently pending prime while backend succeeds; one autoplay-denied result followed by synchronous gesture-bound cached retry; normal/slow pitch/rate and one synthesis across replay; leave route. Extend scoped pronunciation projects to mobile WebKit so the supported engine is exercised, alongside Chromium. No voice/provider/protocol/account/data/env change.

First candidate checks exposed a separate cleanup race: revoking a blocked player's URL while its error callbacks remained attached could replace the manual-retry message with generic failure. Release now detaches player callbacks and ignores promise failures from an already released player. The request/cache design is unchanged.

Candidate WebKit fixtures also exposed service-worker request routing bypass: playback succeeded but mocked request counters stayed0. Audio fixture specs now explicitly block service workers for deterministic network stubs; hosted smoke enables SW separately. A constructor-stack guard checks cached retry has no asynchronous boundary before `play()`.

Verification/deployment results appended after checks. Physical iPhone acceptance remains founder-operated.

## Final verification

- `pnpm exec vitest run tests/unit/edge-audio-client.test.ts tests/unit/edge-tts.test.ts`:11/11PASS, including synchronous scope/TTL/reset cache access, real request cancellation, limits and server origin/XML guards.
- `pnpm lint`, `pnpm typecheck`:PASS; production snapshot build PASS. Node24.14.1/pnpm11.25.0.
- `pnpm test:ui -- --mode production emma-mobile.spec.ts pronunciation-audio.spec.ts --port 4381`: discovery33cases, **33/33PASS** (11desktop Chromium,11mobile Chromium,11mobile WebKit). [Final runner](emma-mobile-playback/final-ui.json), [browser log](emma-mobile-playback/final-ui.log). Source fingerprint `93a69b903a6b…`, snapshot `wfk-ui-source-npx809`; no zero/stale tests. Baseline3/3WebKit failures became native/pending-prime/blocked-retry passes. Tests prove actual media `playing` and duration/rate, not only fetch or mocked `play()` resolution.
- [Mobile WebKit screenshot](emma-mobile-playback/mobile-webkit.png) and desktop capture saved; inspected mobile control/source state. No visual redesign. Full suite/performance/AI assessment/hosted cloud tests were not rerun for this player-only fix.
- `.github/workflows/ci.yml` now installs WebKit alongside Chromium, matching the new audio projects. README records local install command. CI configuration inspected; remote CI itself not run. Service workers blocked only in fixture audio specs; live hosted smoke enables registration/control.

## Deployment

[Allowlisted manifest](emma-mobile-playback/deploy-manifest.json):543app/config/build files; artifact SHA256 `d1978596ac5f7eb776177deabbec0815283e2842360dac0f52f51da2a88974ed`, excluding env/credentials/git/tests/docs. Authenticated existing CLI deployed the identical verified snapshot artifact outside Git root; production Turbo build READY, promoted to [primary domain](https://words-for-kids.vercel.app/). Immutable [release](https://words-for-kids-nmhk0tpxr-trudyan141s-projects.vercel.app), ID `dpl_9zDjuLfScb1YzikKRtD5yzdvvxEf`. Previous immutable `words-for-kids-csx2h6iw5-trudyan141s-projects.vercel.app` remains available for rollback. No main push, new env, data migration, account or founder browser access.

[Deployment state](emma-mobile-playback/deployment.json) confirms READY/PROMOTED and `appSource` matches artifact hash; all543file hashes match current app source. README/CI-only additions are outside the deployed app artifact and do not change runtime source.

[Final hosted WebKit smoke](emma-mobile-playback/hosted-webkit.json), [capture](emma-mobile-playback/hosted-webkit.png): **PASS with service-worker controller active before playback**, actual public-domain MP3→native playing, Emma source,1.0/0.6 pitch preserved, one synthesis across replay, leave/return, no runtime errors. Backend timings connect245/first-audio329/complete608ms. Synthetic library exists only in the isolated guest browser's IDB; no real learner/account writes. Earlier fresh-context [smoke](emma-mobile-playback/hosted-webkit-first.json) also passed with SW registered but not yet controlling; final run waits for SW ready/control.

A separate [controlled hosted attempt](emma-mobile-playback/hosted-webkit-controlled-first-error.json) returned503 before the final200 rerun; failure retained. Microsoft availability remains external/intermittent, and device/error/manual-retry handling remains bounded. No claim this player fix removes upstream failures. The final run supported one explicit retry in the harness, but succeeded on its first request; app does not auto-loop synthesis.

Final lint/types/unit/UI/build/diff checks passed as above. Global docs validator still reports only3pre-existing missing `/tmp` artifact links in `body-part-photo-analysis-fix.md`; 194changed-doc local links PASS, and `git diff --check` PASS. No remote CI/full release suite or physical iPhone/human audible quality claim. Physical iPhone acceptance remains founder-operated: close app windows/reopen installed PWA without deleting data, WordDetail/apple → Nghe, chậm/replay, stop/leave. If OS denies autoplay, one explicit tap retries cached audio; no voice pack/model download.


## 19/10 follow-up — quiet playback status

Founder requested removing the transient “Đang bắt đầu phát…” line because it shifts the controls. Removed transient preparing/device-preparing/starting text; button already shows Stop while pending/playing. Actual errors, manual retry and real fallback information remain. No player/cache/backend change. [Scoped production UI](emma-mobile-playback/quiet-status-ui.json):3native playback/slow/replay cases across desktop Chromium/mobile Chromium/WebKit PASS; lint/typecheck/build/diff PASS. No new literal-copy test. [Allowlisted artifact](emma-mobile-playback/quiet-status-manifest.json) SHA256 `ec0348bf17fd8c57d9ead746d028b51aebe51bbb39a6ffde959434539d59cdbd`;543app file hashes match tested workspace. Production Turbo build READY and CLI promotion succeeded: immutable `words-for-kids-k66covqx4-trudyan141s-projects.vercel.app`, deployment `dpl_DXbUAwNXPzGVc2VXbN23CDEqs5hy`, primary domain updated. No env/main/data changes; physical PWA retest pending.
