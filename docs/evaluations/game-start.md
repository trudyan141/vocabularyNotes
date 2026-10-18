# Chơi & học — giảm thời gian chuẩn bị game

Founder reports3–4s from choosing a game to entering the round on iPhone12/installed PWA. Scope: investigate actual preparation path, fix it, preserve game selection/progress/media safety, verify and deploy for retest. Existing uncommitted Emma WebKit fix preserved; branch `codex/game-start-performance`, HEAD557228b plus authored diff. No founder browser/account control.

## Baseline and cause

[Baseline raw](game-start/before.json), [single diagnostic trace](game-start/before-trace.json.gz), [repeatable harness](game-start/measure.mjs). Production webpack app snapshot `wfk-ui-source-npx809` matches the preceding verified release's app files; game source hashes in JSON. Node24.14.1, Chromium156 iPhone12viewport emulation, CPU4×, down200000B/s/up93750B/s/150msRTT. SW blocked; three independent contexts/first launches for each mode at20/5000entries, synthetic local data, fixture auth/MP3, no real learner data. Server warm/browser cache new per launch. Two-frame painted `.game-session` after actual ready-image checks; not physical iOS or field INP. Current field/RUM not available; earlier PSI quota failure does not supply field evidence.

| Mode |20entries median (range) ms|5000entries median (range) ms|
|---|---:|---:|
| Thẻ ôn |910 (892–911)|1016 (997–1079)|
| Gõ cả từ |913 (912–918)|1039 (1028–1040)|
| Nhìn hình chọn từ |1941 (1911–2424)|2445 (2437–2538)|
| Nghe từ chọn hình |1934 (1920–2405)|1992 (1986–2000)|

No runtime errors in baseline. RSC requests occur during session start, although `PracticeRepository.start` already creates/saves the complete session locally. The fixed-nav prefetch can contribute other RSC requests too; direct regression gates requests containing `session`, rather than treating every RSC request as session navigation.

1. `router.replace('/practice?...session=...')` sent a server route request just to select IndexedDB state. `PracticeSelection` gated/remounted its child on **every query-string change**, discarding the prepared state/player/image-decoder cache. Reopening fetched `sessions()` and searched all saved rounds instead of this ID. The network round trip + remount/revalidation are observed in trace/probe, not merely inferred from a spinner.
2. Picture start decoded **all** eligible library artwork in two-image batches before selecting up to10targets. Then remount decoded the active snapshot again. Both measured picture modes created29Image decoder probes per first launch despite only10questions; the no-picture modes need no such preparation.
3. `resumableSessions()` validated/loaded pictures before filtering out unstarted/completed rounds. Baseline deterministic integration probe found18decodes for a one-word picture round (only3needed), and15unrelated image checks while listing no resume cards. Both new regression tests failed before the fix.

An [interim measurement](game-start/interim-after.json) after the route/image fix showed small-library flashcards281ms but5000-entry flashcards still1031ms. IDB instrumentation identified three full index reads plus hydration of5000words and building/shuffling unused choices for typing/flashcard questions. This prompted a second measured change: reuse one scoped index, draw from all explicit source groups before hydration, load at most16words per candidate batch until ten valid targets exist, and omit unused multi-choice generation outside picture games. No source prefix limit or semantic merge; approved primary aliases kept. Additional batches are allowed when candidates are ineligible.

## Fix and safeguards

- Same-route `session` URL state now uses Next-supported native history, preserving `useSearchParams`, reload/back/forward. New rounds render from their already persisted `Session`; resume/reload loads and revalidates **that scoped ID** only. Session URL/share/replay IDs remain durable; no data migration or auth change. [Next native history documentation](https://nextjs.org/docs/app/getting-started/linking-and-navigating).
- Selection gate identity follows repository/path/actual filter, not incidental session/hub/mode parameters. Lesson/group/reset persistence remains asynchronous and errors visible; no false success.
- Picture target draw still starts from the full eligible source/meaning pool, not a prefix. Decode batches only for this round's targets, preferring already decoded distractors **within the same lesson/group priority**. Fill from other eligible words only when necessary; continue beyond failed candidates. Concurrency remains2; every persisted target/choice is decoded ready and approved with current media/sense revision. No default/missing image substituted or question limit reduced.
- Resume cards filter out unstarted/completed rows before hydration and image validation. Completed history API and CAS/approval/revision/media checks for answering/replay are retained. Broken or revoked artwork still closes picture play; unstarted-discard behavior retained.

## Verification checkpoints

Initial candidate35/39UI PASS. Four failures reproduced on the unchanged baseline app: [baseline fixture output](game-start/baseline-fixture.log). They were two stale assertions in each viewport: missing-picture recovery text expected an older string, and an image-revocation fixture tried to click a history card after reload had already restored the active session. Fixture now checks the current recovery message and restored game directly; no app/data workaround.

## Final checks

`pnpm exec vitest run tests/integration/practice-start.test.ts tests/integration/learning.test.ts tests/integration/grammar-practice.test.ts tests/integration/missing-letters-game.test.ts tests/integration/practice-selection.test.ts tests/integration/library-search.test.ts tests/unit/load-picture.test.ts`: **54tests/7files PASS**. Includes capped hydration/full-pool draw, alias/source boundaries, approval/revision, SRS/history/replay, ready-media invalidation, scope persistence and decode failures.

`pnpm test:ui -- --mode production game-start.spec.ts game-scope-replay.spec.ts ready-picture-games.spec.ts --port 4385`: **39unique production UI cases PASS**, including six word modes with blocked session RSC requests, persisted URL/reload/back, old-round replay/due/group/grammar modes, media import/revocation/broken downloads, mobile+desktop Chromium and a mobile WebKit launch/reload/back regression. [Final runner](game-start/final-ui.json), [log](game-start/final-ui.log); source fingerprint `49b555ea0ee4…`, snapshot `wfk-ui-source-xfDxDJ`. Lint/typecheck and final production snapshot build PASS. Prior successful39-case run was re-run because the measured large-library preparation hotspot required a further authored code change; not counted as78unique cases.

Mobile/desktop game captures inspected; ready picture and three answer controls retained. No visual redesign, AI calls, database migration or real learner edits. Remote CI/full suite/field data/physical iPhone were not claimed.

Final comparable measurement/deployment/hosted evidence follows. No claim all broader cold-load/initial-JS budgets or physical iPhone gates are passed.

## Final comparable lab result

[Final raw data](game-start/after.json), [final diagnostic trace](game-start/after-trace.json.gz), final production snapshot `wfk-ui-source-xfDxDJ`; same harness,3independent first-launch contexts per cell, CPU/network/cache/data conditions as baseline. These are small-sample **median/range**, not p95 or iPhone field claims.

| Mode |20entries before→after median ms|Final range ms|5000entries before→after median ms|Final range ms|
|---|---:|---:|---:|---:|
| Thẻ ôn |910→265|240–312|1016→321|304–363|
| Gõ cả từ |913→220|209–228|1039→361|277–388|
| Nhìn hình chọn từ |1941→1438|1418–1448|2445→1436|1429–1471|
| Nghe từ chọn hình |1934→1398|1388–1419|1992→1443|1428–1449|

No runtime errors. Photo decode probes29→10; same-route session RSC count0 confirmed by blocked-request regression. Other fixed-shell nav prefetch requests still appear in some measurement samples and are not session navigation. Non-picture read batches≤16 verified, versus whole pool before. Final source/candidate identity is in runner+manifest; earlier intermediate39-case result and intermediate latency report are explicitly superseded.

Cold first-use picture games still take~1.4s in this slow-network/no-SW-cache profile because ten actual images must finish decoding, bounded to2inflight; that cost is retained rather than marking unready images ready or reducing questions. Missing/slow external artwork may take its existing bounded8s decoder timeout and scan replacement candidates. Very large picture-only libraries still read their eligible word metadata; all-media5000, huge saved-history, physical iPhone, field and initial app cold LCP/JS budgets are not proved by this dataset. This task measures **game entry after the hub is loaded**, not cold opening the web app.

## Deployed source

[Deployment state](game-start/deployment.json), [manifest](game-start/deploy-manifest.json):543allowlisted app/build files, SHA256 `6359cf2f9cf9a6bbc5e4514ed21b0247d3277c06c0852e45e71a62c0fcc12a14`, no env/credentials/git/tests/docs uploaded. All543hashes match final workspace. Vercel Turbo build READY/PROMOTED, ID `dpl_CVvy4feHvnrejf3gRsLYALwUAYQr`; immutable [release](https://words-for-kids-msh3wiqb8-trudyan141s-projects.vercel.app), [primary domain](https://words-for-kids.vercel.app/). Existing Emma WebKit fix remains included. No push/main/env/SQL changes; previous immutable `words-for-kids-nmhk0tpxr-trudyan141s-projects.vercel.app` retained for rollback.

Hosted smoke and founder checklist follow. Global docs check still reports only3pre-existing missing temporary artifacts in `body-part-photo-analysis-fix.md`; changed docs links/diff checked separately. No full-suite or remoteCI success inferred from scoped checks.


## Hosted PWA smoke and handoff

[Hosted actual-domain results](game-start/hosted.json): **16/16PASS**,8modes on each of Chromium and WebKit, SW controller active before each round. Synthetic20-word guest library plus a stored grammar fixture only in each isolated browser's IndexedDB; no account/cloud learner writes. Browser sound off to avoid unrelated provider synthesis; this smoke verifies game entry rather than audio quality. Each session URL persisted; missing-letters reload restored the same ID; leave returned to hub; zero session-RSC requests and zero runtime errors.

Unthrottled/cache-warm one-sample-per-mode smoke values: Chromium72–141ms, WebKit70–152ms. These are **separate remote smoke observations**, not mixed with the three-run throttled/no-SW-cache local benchmark, not a p95/SLA or physical iPhone measurement. Cold entry into the whole web app was outside this measurement. [WebKit capture](game-start/hosted-webkit.png), [Chromium capture](game-start/hosted-chromium.png).

Final source is unchanged from tested snapshot/deploy manifest. Lint/types/build,54logic and39UI PASS; 407changed-doc local links and `git diff --check` PASS. Global docs validator has the same3historical `/tmp` link failures noted above. No broad tests/SQL/CI/provider benchmark were implied.

Founder next: finish any unsaved edits, close/reopen installed PWA without deleting app/data, enter Chơi & học and choose Thẻ ôn, both picture games, typing/missing letters and grammar; try same lesson/group, leave/resume, reload and play again. Actual iPhone12 experience remains founder acceptance; report a still-slow specific mode/library size if observed. Existing SRS/content/scope and Emma behavior remain unchanged by this task.
