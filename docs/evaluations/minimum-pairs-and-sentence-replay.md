# Tối thiểu hai cặp và nghe lại câu nói —25/10/2026

## Evidence / root causes

Founder screenshot: memory tail with1pair; dialogue error had no recorded-audio replay. Reproduced deterministic board failures for pools2/4/7/10/11: pool2rejected and every larger tail could become1. Existing round sliced10then grouped3+3+3+1. New grouping2–3pairs and9instead of10when11remain prevents new singleton tails.

Dialogue already used audio-only sentence transcription, not Speaking's per-word phoneme observation. However it inherited the word recorder's550ms pause/2.5s start wait/10s cap and6s provider deadline; all assessment errors shared one generic message. A direct known synthetic sample “Yes, it is.” returned the complete sentence in5963ms, almost at that6s deadline. This supports a timeout hypothesis; no founder recording was available to prove the exact error in their screenshot.

## Implemented

- New pair boards always2–3pairs, including two-word pools. Partition4as2+2,7as3+2+2,10as3+3+2+2; when11remain choose9then2. Existing active singleton drafts are reopened under a fresh URL, preserving answered-prefix coverage/history. If exactly one target remains due to legacy/skips/content loss, add one approved, current, distinct companion from already-done items of the same cycle; keep the existing key so whole-set coverage never inflates. If no eligible companion exists, show the two-picture requirement instead of one pair. Legacy replay regroups or adds a same-scope companion; historical snapshots remain unchanged. No new JSON fields/SQL/schema.
- Sentence-only recorder profile:1400ms pauses,6000ms initial wait,15s nominal capture cap. Word Speaking profile stays unchanged. Existing decode/quality bounds apply;20s/640044-byte WAV guard tolerates container/timer overhead, no silent truncation. WAV trim accepts an explicit bound; its default word bound remains10s.
- Sentence ASR deadline15s, output budget1024tokens; same Gemini model/key/audio-only input, never sends question/options/correct answer. Strict transcript/full-choice matching preserves negation and contractions. No automatic retries/provider fallback.
- Replay button retains the latest clip in RAM: raw capture even if processing/quality fails; on successful preparation, replay uses exactly the WAV sent. Explicit Retry recognition reuses that prepared WAV, without another recording. Clear timeout/network/service/processing/permission messages; service errors do not assert a child's answer is wrong. Current selected answer still requires Check.
- New recording replaces/releases the previous clip; hide stops playback/capture/request, question/scope/unmount cancels late callbacks and revokes URL. No audio/transcript in IDB/cloud/backup.

## Local verification

- `pnpm lint`, `pnpm typecheck`, scoped Vitest7files54/54PASS. New regressions: pools2/4/7/10/11fully exhaust coverage with no singleton; old singleton draft upgrades with9/10→10/10coverage and backup validity; legacy replay preserves history; sentence pauses/start/cap; original word recorder/quality/scoring/cancellation retained.
- Separate bounded live probe through the actual `recognizeDialogue` function: synthetic macOS Samantha utterance “There are two apples on the table.” returned “there are two apples on the table” in2112ms. One known example verifies full-sentence input/response, not child recognition accuracy or latency guarantee. `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-dialogue-sentence-55xU8R/result.json`. Earlier baseline sample `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-dialogue-probe-TvcHRg/before.json`. Initial Vitest probe used the test-injected canary key and got access rejection; fixed the probe's environment loading, not app logic. Task-only live test source removed after execution; no live provider test in normal suite. No founder audio/profile used or key logged.
- Browser discovery8cases desktop/mobile: matching/memory coverage/resume, recorded WAV replay byte equality and play/stop, service failure/manual retry with identical bytes, library dialogue, mic denial/cancel with late result, old singleton URL upgrade. Production scoped8/8PASS, build30.5s/browser29.5s, source8f70821 +9819c573446a; `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-PbsRxY/result.json`. Final layout adds a2x2grid for two pairs (six-card board remains3x2); scoped legacy-board confirmation below.
- Existing unrelated package/lock upgrade to Next16.4.3was already dirty at task start and preserved; no dependency added by this fix.

## Limits / rollout

Physical child voice and phone playback/mic still require human use. No inference that founder spoke incorrectly. Mock UI evidence is distinct from the known synthetic live probe. No new SQL/env/main push. Final build/deploy/hosted smoke below.


Final2x2layout confirmation:2/2desktop/mobile dev UI PASS, prepare6s/browser23.2s; source8f70821 +09c8e6e77e4c, `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-WW1Jz1/result.json`. Actual old9/10singleton reopens as a four-card rectangle with9/10progress and stable reload URL. Visual batch inspected this mobile board and desktop replay/recognized-sentence controls. Final lint/typecheck/diff PASS.


## Hosted rollout

`vercel deploy --prod --yes` PASS, final Next16.4.3production build/typecheck PASS. [Deploymentgp5rblxli](https://words-for-kids-gp5rblxli-trudyan141s-projects.vercel.app) aliased [production](https://words-for-kids.vercel.app/practice). No SQL/env changes/main push.

Hosted isolated guest/sample-library smoke4/4PASS1280/360: saved memory board sizes[3,3,2,2]; sentence reply selection, replay byte equality with sent WAV and real HTMLAudio play/stop. Audio input generated in disposable browser, provider mocked here; separate known-sentence live probe above. Artifacts `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-min-pairs-replay-d9PU6v/result.json`. No founder browser/account/data touched.
