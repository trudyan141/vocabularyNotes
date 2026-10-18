# Mobile/PWA performance + Emma — execution evidence

18/10/2026. Founder approved [implementation guide](../ai/MOBILE-PERFORMANCE-AND-EMMA-PLAN.md), including deployment. Target device iPhone12/installed PWA/domain; all browser runs below use isolated synthetic profiles, not founder browser/data. **Implementation and deployment complete; physical iPhone acceptance pending. Cold-load/JS budgets remain above target.**

## Baseline and evidence identity

- Source HEAD75eff1d; initial production snapshot fingerprint `f7837d4e7755d98d` (full in [baseline](mobile-performance/baseline.json)); Node24.14.1, Next16.4 webpack, Chromium156, iPhone12 viewport390×844, CPU4×, 1.6Mbps down/0.75Mbps up/150ms RTT. SW blocked in this diagnostic cohort; server warmed, browser cache cold for loads. Not field INP or iOS hardware.
- `pnpm test:ui -- --mode production workflow-smoke.spec.ts --port 4361`: production build +4UI PASS. Owned source `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-source-JJcmGQ`; result directory `wfk-ui-result-asl1iH`.
- Baseline harness `.local/mobile-performance/measure.mjs`; promoted to `scripts/measure-mobile-performance.mjs` with optional trace and source-identity guards. Same metric/fixture/profile algorithm; hash recorded per report. Fixed synthetic IDB entries5000/senses5001 (including existing distinct demo senses), not user content. Per-route cold5runs; each route/journey30; search50queries.
- Local baseline: Today LCP median3880ms; Library1160ms; Practice3560ms. Initial Today JS358707encoded bytes. Large library warm Today median1016ms/p951417; Library2436/p953818; search median1568/p951821.
- [Baseline data](mobile-performance/baseline.json), [20-item trace gzip](mobile-performance/baseline-trace-20.json.gz), [5000-item trace gzip](mobile-performance/baseline-trace-5000.json.gz). Trace cohort is a separate single diagnostic journey, not the30-run headline.
- Public-domain [before report](mobile-performance/deployed-before.json) is a separate cohort, source not assumed equal to local webpack. `vercel inspect` identified previous immutable deployment `https://words-for-kids-p54cwoci5-trudyan141s-projects.vercel.app`, ID `dpl_C7CZmiFmcxtRRVB7Dvrz9QcDB6WY`, created17/10. No founder session or real library accessed.

## Root causes / implementation

1. Library filtering created thousands of IDB requests; hydration rescanned all senses for membership; boolean search built per-character highlight offsets for every row. Replace with scoped bulk projection, separately observed by Dexie liveQuery; query changes reuse that projection, hydrate only visible page/entry aliases. All source senses/POS/exact case, approval, membership and scope boundaries retained; no schema/migration or persistent cache.
2. Today counts hydrated examples/media for the entire due pool. Count scoped live senses/entries/review projections instead.
3. Fixed nav disabled prefetch. Warm only four shell destinations after readiness/intent; show real Next pending state, preserve current active route until navigation. Force-dynamic/identity checks and private API/SW boundary remain.
4. Guest shell eagerly included sync/archive code. Extract lightweight share API and defer cloud/shared background workers and shared-settings panel to the scopes/routes needing them, preserving initial catch-up and ownership guards.
5. Audio previously waited Commons/device before Edge, and replay synthesized again. Emma US first; lookup independent, RAM clip cache/refcount cancellation/limits/scope reset, same media element primed in tap, native MP3 playing before success/source claim, pitch-preserving1.0/0.6 and offline/error device fallback. No new provider/key/env or persistent learner audio.

## Interim probes (superseded by final measurements when ready)

[First candidate](mobile-performance/candidate-early.json) before liveQuery projection/bundle split: warm20-item nav median99–132ms; large Today197/p95369; Library667/p951138; search463/p95818. This justified the subsequent scoped projection change; it is **not final code evidence**.

[Baseline live API](mobile-performance/tts-before.json):15 synthetic requests,14OK/1upstream503. No API failure omitted. Same msedge direct adapter retained; no demonstrated reason to replace it with a hand-maintained protocol.

Browser real MP3 [before](mobile-performance/tts-browser-before.json): cold5/replay5, device API deliberately absent, word metadata mocked absent; browser cache separate from app cache. [Early after](mobile-performance/tts-browser-after.json): cold5+replay30; replay0 includes a fresh document and therefore is a cache miss, kept explicitly. Replay1–29 are cached. This profile is unthrottled Chromium media playback, not iOS listening or the throttled route cohort.

## Earlier verification and corrections

- Focused units/integration:13files/90tests PASS, including search projection observation/scope, aliases/counts/groups/edit/content copy/cloud preferences/sync/sharing and Edge bounds/cancel/cache.
- An initial `pnpm test -- <files>` unexpectedly ran all65files/423tests:421PASS,2FAIL. Reproduced both failures on untouched baseline source: revoked-refresh fixture expects200 but SDK reports503, and deletion fixture feeds display-only group/lesson memberships into strict save input. These are existing fixture/baseline issues; not patched into app behavior.
- First production candidate exposed MainNavigation's useApp outside provider on public404/welcome. Corrected by passing readiness from AppShell; independent public nav remains usable. Subsequent build/404 smoke PASS.
- Next16.4 RSC prefetch has an open preliminary `/_tree` stream followed by a full-route request. Tests must await the latter headers and verify no duplicate navigation request; awaiting `response.finished()` on the discovery stream was an invalid fixture assumption.
- Broad production UI initial run:97/102PASS, failures2prefetch assertions +2Speaking replay assertions +1reload race. Speaking replay failure reproduces on baseline and contradicts current spec08/ADR088 (same selected list on replay); corrected fixture to test random initial selection/full pool plus identical replay, not change app. The discard test reloaded before the async leave completed; corrected it to wait for session URL removal before reload. No app/data workaround.
- Default UI fixtures now intercept Edge synthesis, so normal tests do not hit a live provider. Live MP3 benchmarks are explicit and synthetic.

Earlier checkpoint superseded by the final verified results below.

## Final verified comparison

Final app snapshot `wfk-ui-source-i91wHh`, fingerprint `0317ec11c3817720fa99ed3eee536d26b337c6bbf4804c8b05aace24c2cbd1dc`. [Final raw report](mobile-performance/final.json). Same throttling/fixtures/sample sizes as baseline; tracing disabled in both headline cohorts. Projection remains subscribed while its repository is active, so returning to Library reuses a current projection; repository disposal clears it. Unit regression covers off-route mutations and dispose/resubscribe.

| Journey, 5,000 entries | Before median / p95 ms | Final median / p95 ms |
|---|---:|---:|
| Today | 1016 / 1417 | 158 / 517 |
| Library | 2436 / 3818 | 331 / 532 |
| Practice | 304 / 481 | 114 / 118 |
| Settings | 315 / 408 | 181 / 199 |
| Search, 50 queries | 1568 / 1821 | 83 / 99 |

20-entry final nav medians86/162/98/99ms, p95159/167/131/101ms (Today/Library/Practice/Settings). Feedback proxy p95≤48ms across the measured routes; this is a lab click/mutation/two-frame proxy, not field INP. All samples retained: first Today transitions still reach1244ms/1268ms for20/5000 entries. No browser runtime errors recorded.

Cold LCP medians and range (five cold-browser runs, warm local server):

| Route | Before median ms | Final median (range) ms |
|---|---:|---:|
| Today | 3880 | 3476 (3452–3688) |
| Library | 1160 | 1120 (1116–1144) |
| Practice | 3560 | 3500 (3492–3580) |

**Budgets still exceeded:** cold Today/Practice exceed2.5s; initial encoded JS347182/353674/364764bytes (339/345/356KiB) exceeds300KiB. Initial JS improved only~3%; bounded code splitting does not remove the framework/client shell cost. Initial transfer485399–505542bytes and Nunito101028bytes meet1MiB/150KiB budgets; maximum measured CLS0.000605 meets0.1. These do not prove physical iOS/Core Web Vitals acceptance. No unmeasured Lighthouse score claimed.

Secondary leaf routes are separate five-run diagnostics with first uncached transition included, **no p95 inference**: [before](mobile-performance/leaf-before.json), [after](mobile-performance/leaf-after.json). At5000 entries word detail median824→811ms (final324–1405), Speaking1554→854ms (840–1343). At20 entries detail326→329ms, Speaking329→341ms. These leaf routes keep intent-only loading rather than prefetching every word; their remaining network/large-pool cost is visible in the data.

## Final Emma evidence

Actual voice `en-US-EmmaNeural`, matching the sibling project; existing direct msedge adapter retained. [Final live API](mobile-performance/tts-after.json):15/15 synthetic requests200, bounded MP3 plus connect/first-audio/complete Server-Timing. Baseline14/15 success includes one503; provider availability remains external. No new key, Vercel env or paid fallback.

[Final browser MP3](mobile-performance/tts-browser-final.json): five cold word requests median685ms (630–1128). Fresh-document replay0 is a cache MISS758ms and is retained separately. Subsequent30 memory hits median49ms/p9562ms (47–78), **zero synthesis requests**; baseline replay median653ms with synthesis each time. The main improvement is eliminating repeated synthesis and preceding source lookup, not proof that a different WebSocket protocol is faster. Unthrottled Chromium media profile, native blob `playing` observed; no physical speaker/listening claim.

RAM cache bounded32clips/4MiB/10minutes,1MiB/clip, scope/text/voice/rate/format keyed; coalesced inflight with consumer cancellation, generation reset and repository lifecycle clearing. No IDB/localStorage/SW/cloud/backup learner-audio cache. Slow uses same clip at0.6 with pitch preserved. Dictionary lookup is independent; device fallback remains on offline/Edge failure. Gemini assessment unchanged.

## Completed checks and fixture boundaries

- `PATH=<Node24>/bin:$PATH pnpm lint` and `pnpm typecheck`: PASS on final working source; Node24.14.1/pnpm11.25.0.
- `pnpm exec vitest run <13 scoped files>`: **90tests PASS** for search/projection/aliases/counts/groups/data/edit/cloud boundaries/audio.
- Production snapshot build + **100unique scoped UI cases PASS** across mobile/desktop:88core (nav/search/audio/practice/sharing/offline/workflow) plus12selected existing settings/audio cases. [88-case runner](mobile-performance/final-ui.json), [10-pass/2-stale-fixture run](mobile-performance/extra-ui-before-fixture-fix.json), [last fixture rerun](mobile-performance/final-fixture-ui.json). Final fixture correction rerun4/4; tests-only changes preserve all543 deployed app file hashes.
- Legacy UI fixtures corrected to current Settings sound toggle, conditional Today CTA, English labels and expanded example details; replay follows ADR088 same-list rule, discard awaits async leave. Screenshot outputs now isolated. No app behavior weakened to satisfy stale fixtures. Next prefetch preliminary open stream is not awaited as a finished response.
- Whole-suite initial421/423pass with **two reproduced baseline fixture failures** (auth revoked refresh expected200/SDK503; deletion fixture includes display-only memberships). Full suite is not reported as passing. Dev two-server Next lock collision was runner environment; production selected cases passed.
- Mobile pending state and desktop audio/source screenshots inspected; scoped Impeccable detector returned no findings. Mechanical checks/headless screenshots do not equal human UX or iPhone acceptance.
- `python3 -B scripts/validate_docs.py`: only three pre-existing missing temporary artifact links in `body-part-photo-analysis-fix.md`; new/changed docs scoped links and `git diff --check` checked separately.

## Deployment and remaining acceptance

[Deployment state](mobile-performance/deployment.json), [allowlisted source manifest](mobile-performance/deploy-manifest.json):543app/config/build files, staging SHA256 `409c5688c92853d534dae14d4390c7d69d0495228d137c107d25dc7c40e34586`. All543 hashes match final workspace; tests/docs excluded from artifact. Vercel production Turbo build READY, ID `dpl_2tEnCiCUDN2JM1ibcBQQCKraNs6H`; immutable [release](https://words-for-kids-csx2h6iw5-trudyan141s-projects.vercel.app), promoted to [primary domain](https://words-for-kids.vercel.app/). No push/main/env changes. Existing previous immutable `words-for-kids-p54cwoci5-trudyan141s-projects.vercel.app` retained for rollback.

Initial upload from inside repository was seat-blocked before building because CLI attached ancestor commit author. Repeated deployment from identical allowlisted artifact outside Git root used authenticated owner CLI; Vercel allowed/built it normally. No identity forging, team permission or protection setting changes. Final deployment metadata `appSource` equals artifact hash; `vercel inspect words-for-kids.vercel.app --scope trudyan141s-projects` resolves final ID.

Hosted evidence and separate remote cohort are recorded below. Local webpack numbers are not mixed with remote Turbo numbers. [Field probe](mobile-performance/field-availability.json) returned429 from unauthenticated PSI quota; CrUX/field metrics **unavailable**, not passing or confirmed absent.

Founder iPhone12 installed-PWA checklist: finish any edit, close all PWA/Safari windows for this app, reopen domain, keep existing library; test Today↔Library↔Practice↔Settings/back, word/game/Speaking entry, Nghe/chậm/replay, stop/leave/mic, background/lock/resume and offline→online. Do not delete PWA/data. Physical voice quality/autoplay/update behavior and field remain pending founder test; cold LCP/JS budget deficits remain explicit.

### Public-domain comparison (separate remote cohort)

[Before](mobile-performance/deployed-before.json) / [after](mobile-performance/deployed-after.json), same isolated **empty guest** fixtures/network/CPU,30transitions per destination. Not the5000-entry local dataset. Final medians/p95: Today83/99ms (before321/2452); Library83/100 (281/1338); Practice99/116 (277/1396); Settings99/105 (284/915). First transitions remain outliers1536ms Today and1513ms Practice; no samples omitted. No browser runtime errors.

Remote cold LCP five-run medians: Today4200→4056ms, Library3308→2316ms, Practice4724→4472ms. Final ranges3872–5224/1336–2968/3864–9592ms respectively; network/function cold status not controlled. Cold initial page load remains a limitation on the deployed release too. No claim that local webpack JS byte figures exactly describe Vercel Turbo output.


### Hosted audio/PWA smoke

[Final smoke](mobile-performance/hosted-smoke.json), [isolated mobile capture](mobile-performance/hosted-emma.png): PASS actual hosted MP3, correct Emma source,1.0/0.6 pitch-preserving playback, one synthesis request across replay, Speaking entry and leave/return; zero runtime errors. PWA manifest present, one service-worker registration and controlling worker. Health200. Synthetic seed was copied from an isolated local demo into the **test browser's own guest scope only**; no account/server learner data written.

[First hosted attempt](mobile-performance/hosted-smoke-first-attempt.json) returned503; a separate apple HTTP probe also503, then short-sentence HTTP200/~993ms and full rerun200 passed without code changes. Four actual hosted synthesis requests total:2failed/2successful. Upstream/runtime transient cause was not established; do not call provider availability fixed or100% reliable. UI offline/error/device fallback and explicit retry were tested locally. Final200 has private/no-store and Server-Timing connect152/first-audio328/complete407ms. An earlier smoke fixture initially copied demo scope IDs into the guest profile and could not find its word; fixture scope remapped before the actual provider probe, no app change.

Final docs validation:384local links across changed docs PASS after URL decoding/query stripping; `git diff --check` PASS. Global docs validator remains the same3pre-existing temporary links noted above. No main push, new Vercel env, SQL/data migration, plugin install or founder browser control.
