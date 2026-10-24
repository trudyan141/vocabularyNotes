# Game touch slots and picture audio — 24/10/2026

Founder request: return a selected letter by tapping its slot without opening the mobile keyboard; show a speaker and IPA on picture-to-word, automatically read each new target and allow replay.

## Implementation

- MissingLettersQuestion uses button slots and unique tile IDs. First empty slot receives a tile; tapping a filled slot returns that exact tile. Selected tiles cannot be reused; empty slots cannot submit. Busy/check boundaries remain; checked answers reveal the complete word. Keyboard Enter/Space follows native button semantics.
- Offline shell mirrors button slots, tile ownership, return and completeness gating; picture-to-word also gains manual listening and saved exact/version-matched IPA.
- Picture-to-word reuses AudioControl autoPlay and WordPronunciation (saved IPA/version validation and existing fallback/missing states). Each mounted question reads its own target, stops when leaving/changing question, respects sound preference, and supports replay/error recovery.
- No content, scoring, snapshots, SRS, auth, cloud or schema changes.

## Verification

Source commit: `914ec7a08df6e9d1807206356d7c0163664c7c91` plus dirty fingerprint in runner results. Runtime Node24.14.1, pnpm11.25.0.

- `pnpm lint`, `pnpm typecheck`: PASS. Impeccable mechanical detector: no findings; not a human UX pass.
- `pnpm exec vitest run tests/unit/missing-letters.test.ts tests/integration/missing-letters-game.test.ts tests/unit/offline-game-syntax.test.ts`: 9/9 PASS.
- Production build PASS in owned snapshot; production scoped UI run: 10/12 PASS, two failures at outdated replay fixture (completed coverage cycle cannot start again without explicit replay/new cycle). Actual select/return/wrong-answer/reload portions reached and passed before the fixture failure. Fixture changed to explicit Chơi lại.
- Production picture audio: 4/4 desktop/mobile cases PASS, covering automatic reading on first/next question, replay, mute and IPA. Provider/device voice mocked, not real playback evidence.
- Final production UI verification: **14/14 PASS**, desktop/mobile Chromium; build52.8s, browser32.2s runner /29.1s Playwright. Covers tile return, no text input, native keyboard button activation, correct/wrong checks, reload, replay, two/three slots, offline parity, legacy text-game correction, picture autoplay/replay/next/mute/IPA. Final app source unchanged from prior successful build; fixture corrected for replay.
- Corrected-fixture dev run: 8/10 PASS; two desktop failures during reload/navigation with dev full-refresh messages. Mobile return/replay and offline cases passed.
- `python3 scripts/validate_docs.py`: blocked by three pre-existing missing temporary result links in body-part-photo-analysis-fix.md; changed-file diff checks PASS.

## Failed probes / limits

Initial dev run: 6/12 PASS; online missing-letter cases failed before opening the game. Production main flows passed after narrowing Math.random control to game interaction; exact dev/HMR initiating cause unconfirmed. Later dev verification is recorded separately.

An incorrectly forwarded `pnpm test -- ...` invocation ran all 450 tests (447 PASS, 3 failures outside this diff: auth-session revoked response503/200, deletion fixture includes membership keys, capture fixture expects DB version5 while current6). Scoped direct Vitest invocation above passed; unrelated fixtures were not modified.

No deployment, real device keyboard, native iOS/PWA autoplay, live voice quality or founder UX acceptance claimed. Offline fallback adds saved IPA/manual listening; its autoplay policy is unchanged.

Runner artifacts (local temporary directories):

- Initial dev: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-LJOw3v/result.json` (fingerprint8419c0f4fa71).
- First production: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-kfy6k6/result.json` (fingerprint38484e6c233c).
- Corrected-fixture dev: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-8Ymw03/result.json` (fingerprint6c75cbd7cb53).
- Final production: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-Qcei0R/result.json` (same final fingerprint).

WF3: initial direct task, no subagents. Token usage unavailable. Discovery/build/browser durations are captured by result.json; no token/cost estimate inferred. Two UI reruns followed concrete fixture/dev failures; no application fix was introduced for the test environment.
