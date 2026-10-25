# Thẻ đều, lật mượt và trả lời bằng mic —25/10/2026

## Scope / acceptance

Founder screenshots show variable-height memory cards and jitter, and request generated card art plus an optional microphone reply in Trả lời Cáo. Preserve approved word pictures and words, matching rules, session CAS/coverage and existing Speaking behavior. Mic must remain optional and user-triggered; recognizer failure must not select an answer or score a child as wrong.

## Root causes and implementation

- Memory grid rows followed content height. Images with tall intrinsic aspect ratios stretched their row. Fixed portrait3:4boxes, explicit bounded object-fit:contain, absolutely positioned faces/content and consistent check badges now keep every tile the same size. The new generated back/front artwork is decorative; exact approved vocabulary art/word still overlays the blank front. No content replacement.
- `pictureValidity` depended on the entire mutable session object, restarting the picture live query after every tap. It now depends on immutable session ID and still observes underlying content/media tables. Move previously validated/read the full round multiple times. It now checks the current question/board, including every peer revision/art, with in-transaction CAS/approval/grammar checks; future questions are validated when reached.
- Move renders its predicted pure reducer state immediately, commits through the same repository, and restores the prior state with the existing retry error on failure. No optimistic score/coverage. Both card faces stay mounted, so images do not remount on every turn. A200ms transform flip respects OS and app reduced-motion settings. No artificial delay on correct pairs; mismatch1second remains the reading pause.
- `DialogueMicrophone` is used by both reviewed library dialogues and the built-in pack. It reuses Speaking VoiceRecorder/end-of-speech/cues, WAV decode/trim/quality, Gemini model/key and6second request limit. Same user gesture/stop/hide/unmount/late-response boundaries. User can stop or cancel, and permission/service/unclear errors leave tap choices available.
- Recognition sends only WAV audio, with no question, options or correct answer, and strictly validates a bounded transcript. Unique full-choice text matching happens in client code, including exact contraction variants and preserved negation; no fuzzy/semantic selection. It displays what was heard and selects the matching choice, then the child explicitly presses Check. No pronunciation score, recorded audio persistence, transcript storage or new provider fallback.

## Verification

- `pnpm lint`, `pnpm typecheck`:PASS before browser run.
- Scoped Vitest:43/43PASS across dialogue-answer, game expansion/coverage, speaking-assessment/lifecycle/Gemini. Checks contraction/negation, ambiguous/unmatched input, no answer cue in request, quota/no retry, invalid/oversized/unclear evidence and existing Speaking cancellation/scoring.
- UI discovery:16cases across desktop/mobile. New cases exercise tall art/equal geometry, retained board DOM after flips, reduced motion, spoken negative/wrong answer without silent correction, service error/manual choice, reviewed-library mic, permission denial and cancellation with late response. Production run14/16PASS; both failures were the reduced-motion assertion expecting literal0s while the global accessibility rule intentionally uses0.01ms. All geometry/retained-node and mic behaviors passed. Corrected test asserts effective duration<1ms, no app workaround; final rerun below. Initial UI result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-rCwRaK/result.json`. Inspected desktop/mobile memory cards and mic error states in one batch.
- First production runner built successfully48.8s but detected a source fingerprint change as generated public outputs were refreshed in the workspace during the run. It stopped before UI execution. Current workspace and snapshot then matched; no app workaround or stale PASS. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-EEh5Gt/result.json`.

## Generated asset provenance

Built-in imagegen created [source PNG](../../public/illustrations/memory-card-faces.png); [runtime WebP](../../public/illustrations/memory-card-faces.webp) is59KiB, generated source2MiB. Image inspection confirmed two aligned3:4panels and an empty center for vocabulary. WebP encoding/resizing only, no raster editing outside imagegen.

Prompt:
> Use case: illustration-story. Asset type: decorative front-and-back artwork atlas for a children's English memory matching game. ONE landscape image ratio 3:2, exactly two equally sized portrait panels each ratio3:4, side by side with NO gutter. Left panel is the BACK of a game card: pastel lavender, thick rounded dark plum double border inset safely, a charming orange fox holding a tiny star centered, small scattered mint leaves and golden stars, playful flat children's book drawing, clean soft edges, not shiny plastic. Right panel is the FRONT blank card: warm cream center kept COMPLETELY EMPTY for overlaying dynamic vocabulary pictures or words; matching rounded double border in lavender/plum, very small leaves and stars confined to corners and edges, center 75 percent empty. Both cards perfectly aligned and same size, identical outline geometry, generous internal margins. Background outside rounded corners pale cream. No text, no numbers, no words, no watermarks. The two exact half images will be used with CSS background-position. Keep all objects inside their own half.

## Limits

No live Gemini recognition accuracy, real child voice, physical phone smoothness or pronunciation-quality claim from mock tests. Mic transcripts stay in component RAM only. Existing standalone offline shell still lacks expansion game renderers. Hosted rollout verified below. No SQL/schema changes for this follow-up.


## Final local evidence

- App source unchanged after productionUI14/16PASS; two memory assertions subsequently corrected for browser subpixel geometry (difference0.00003px; enforce<0.1px rather than exact floating equality) and global reduced-motion0.01ms. No app/CSS workaround. Final memory desktop/mobile dev2/2PASS, including uniform tall art, retained DOM and reduced motion; prepare6.6s/browser22.4s. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-Y20XdX/result.json`, source8f70821 +9372093179c1.16unique cases verified:14production +2finaldev. Production snapshot build36.3s/browser47.1s with14passing and2fixture-only failures: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-pulrks/result.json`.
- Image review batch: desktop/mobile final card fronts and dialogue error state inspected; generated art fits, word and image cards equal. Confirmation of closed-card/tall-art screenshot exposed an implicit grid-track overflow: the tall image could grow past the front despite fixed card bounds. Fixed content grid with minmax(0,1fr), explicit min-size0 and overflow containment; added image-height-within-content assertion, selecting an actual picture card rather than random first side. This is an app edge-case fix, not merely a fixture correction. Final scoped result below.


Final containment regression:2/2desktop/mobile PASS, `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-ooEcxH/result.json`, source8f70821 +e6e0a3cdf23f, prepare7.3s/browser24.3s. Asserts an actual picture card with tall intrinsic art stays inside its content box, all card bounds stay stable within0.1px, board DOM persists and reduced motion is effective. No further visual redesign after the bounded inspection pass. Common positive contractions (it's/it is, I'm/I am) added to the same exact matcher;3dialogue unit cases rerun PASS. Final lint/typecheck/diff/smoke-script syntax PASS. No SQL changes.


## Hosted rollout25/10

`vercel deploy --prod --yes` PASS: [deployment djev7p0i5](https://words-for-kids-djev7p0i5-trudyan141s-projects.vercel.app), aliased [production](https://words-for-kids.vercel.app/practice). Vercel final build/typecheckPASS. No SQL/env changes or main push.

`node scripts/verify-hosted-game-expansion.mjs`:10/10PASS, disposable1280/360headless guest contexts: game menu/new memory atlasHTTP200, three built-in grammar games/correct feedback/Next/Back/no overflow, mic button/permission-denied manual fallback, active service worker. Artifact `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-hosted-games-OQ46RF/result.json`. Hosted smoke deliberately denies mic and fixture-blocks audio; live ASR quality and physical-phone smoothness remain human acceptance. No founder browser/profile/account or live Gemini speech request used.


## Follow-up — Nối đôi dùng cùng card

Founder yêu cầu áp dụng card mới cho Nối đôi. Reuse cùng atlas mặt trước, vùng contain và matched badge; hai cột dùng chung geometry3:4, max-width360px, giữ outline khi chọn/keyboard focus và tap rules. Không tạo ảnh mới hay đổi data/game logic. `pnpm lint`, `pnpm typecheck`, diff checkPASS. Discovery2cases; scoped pair+memory devUI2/2PASS desktop/mobile (prepare9s/browser42.1s), source8f70821 +24acac01c690, `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-VLKOzh/result.json`. Screenshots of both pair boards inspected together; frames/contain/matched badges confirmed. Deploy result below.


Pair-card rollout: `vercel deploy --prod --yes` PASS, build26s, [deployment18a6oz9pz](https://words-for-kids-18a6oz9pz-trudyan141s-projects.vercel.app) aliased production. Hosted isolated sample-library headless checks PASS1280/360:6illustrated fronts, equal card heights, selection outline/one correct match/no horizontal overflow. Artifacts `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-hosted-pair-cards-sgWf3k/result.json`. Audio mocked, no founder account/browser/data. No SQL/env/main push.
