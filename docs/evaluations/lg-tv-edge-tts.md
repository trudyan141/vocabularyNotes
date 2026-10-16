# LG TV — Edge TTS fallback,16/10/2026

Direct task: founder reports browser speech unavailable on LG TV; requests free Edge TTS with a natural multilingual female voice. Scope: audio playback fallback only, no speaking assessment/provider change or data migration. Initial working tree clean; base commit4543f92. Physical LG reproduction unavailable; reproduce absent/empty/error/silent speech with isolated Playwright fixtures.

## Root cause and change

AudioControl returned a device-unavailable/no-English-voice message without another audio path. Also guards using `in window` could call an undefined implementation. Regression initially failed2desktop/mobile cases before the client fix. Added server-generated MP3 from fixed `en-US-EmmaMultilingualNeural`, npm `msedge-tts@2.1.0` MIT ([upstream](https://github.com/Migushthe2nd/MsEdgeTTS)); published dist used, preinstall disabled locally in pnpm-workspace (script only enforces pnpm). No Python runtime/API key/env or paid fallback.

Existing Commons→device path remains. Missing API/constructor/English voice, synthesis error or no speech start4s uses Edge online. Empty voices still wait3s for asynchronous loading. MP3 rate1.0/0.6 preserves pitch; source credit distinguishes Edge/device/Commons including Speaking's shared source display. Stop/mute/hide/text change/unmount aborts client and revokes blobs; generation prevents late playback. Network/service failure reports retry status. Server accepts same-origin text-only≤600chars, XML escapes user content, limits4inflight/process,12s overall deadline/5s connect/8s idle,1MB MP3. Private/no-store, no text/audio files/persistent store/logging. Concurrency is per instance, not a distributed service quota.

## Verification

- Live provider engineering probe using Node24.14.1, fixed Emma voice, `Hello! Xin chào.`:12240bytes MP3 returned. This confirms one live synthesis; no human listening, language-quality or device acceptance claim.
- `pnpm exec vitest run tests/unit/edge-tts.test.ts tests/unit/audio-voices.test.ts tests/unit/word-audio.test.ts`:15passed. Covers route origin/payload, XML escaping/fixed voice, bytes/empty output, cancellation/concurrency cleanup and existing voice/sample behavior.
- `pnpm lint`, `pnpm typecheck`:PASS.
- `pnpm test:ui -- --list pronunciation-audio.spec.ts`:14cases desktop/mobile discovered. Production run rebuilt successfully; first run exposed hidden-summary selector in new test (trace showed actual playback completed), fixed fixture scope to the shared hero source (WordSpeaking renders it outside individual controls). Existing duration-ratio assertion also saw scheduling noise (normal2.366s vs slow1.687s); no app rate change from that result.
- Final `pnpm test:ui -- --mode production pronunciation-audio.spec.ts --port 4345`: buildPASS88.3s,13/14UI PASS43.3s, including all10new Edge cases and3existing cases. One unchanged desktop recording-duration-ratio assertion failed under concurrent scheduling; same source/snapshot isolated rerun `--grep 'word and Fox' --project desktop-chromium --port 4346`:1/1PASS10.3s. No app/test duration threshold changed. Unique14cases verified across these runs; not a single all-green full-spec run.
- Final source: commit4543f92 +fingerprint3749e9b10b1c (full value in runner manifests). Production snapshot `wfk-ui-source-lNLDNj`; results `wfk-ui-result-l3xitI/result.json` and isolated `wfk-ui-result-NqelTa/result.json` in host temp directory. Screenshot review: Edge source/normal+slow buttons visible desktop/mobile; fixture focus skip-link is not physical TV evidence.
- Real same-origin POST against that final production server:200, `audio/mpeg`,private/no-store,nosniff;12240bytes, `file` identifies MPEG layerIII48kbps24kHzmono. This verifies server bundling fix through the actual route.
- `git diff --check`:PASS. Docs validator reports only3old missing temp-artifact links in body-part-photo-analysis-fix.md; no new missing docs links.
- Accidental `pnpm test -- ...` invoked the full suite because this script's separator did not filter:421passed/2failed423total. Failures outside the edited scope were auth-session revoked-refresh status503vs200 and deletion fixture schema unexpected groupMemberships/lessonMemberships. Scoped command above uses `pnpm exec vitest run` explicitly; no unrelated auth/data edits.

Production integration probe first returned503 despite raw Node synthesis succeeding. Read-only inspector on the compiled route exposed `TypeError: b.mask is not a function` in bundled ws/bufferutil resolution. Added `serverExternalPackages: ["msedge-tts"]` to preserve Node optional dependency resolution. Final live endpoint succeeded as recorded above. No snapshot/app patched to bypass this failure.

## Limits

No deployment, no founder browser controlled, no Vercel env added. Physical LG remote/tap/autoplay/MP3 and actual listening remain manual acceptance. Edge is online and unofficial Read Aloud access; no quota/availability/free-service guarantee, child eligibility claim or automatic paid fallback. Synthetic fixtures are not physical TV evidence.
