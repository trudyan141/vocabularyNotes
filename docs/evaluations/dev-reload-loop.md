# Dev /today reload loop —16/10/2026

Direct report: `http://127.0.0.1:4317/today` repeatedly reloads after the Edge TTS task. Base commit5123ebc, initially clean tree. A supplied3001URL was corrected by founder; that other repository was inspected read-only, no edits.

## Investigation / current conclusion

Isolated headless Chrome against the exact4317server reproduced68main-frame navigations in15s with no source edits. WebSocket showed repeated Turbopack `type:restart` for the dev entry chunk `_1anvha4rlo79g._.js`, successive HMR versions, zero reported compile/React errors. This is dev bundler/HMR restart behavior, not an audio request or app `location.reload` loop. The earlier Edge tests ran Webpack; they did not verify the default Turbopack dev command.

The initial switch to Webpack was only a workaround and did not establish why the old process entered that state. Founder requested investigation and retention of Turbopack. That switch is now reverted: `pnpm dev` again uses default Turbopack, and the actual4317server was restarted through that restored command. Keep `serverExternalPackages` for Edge synthesis.

Controlled comparisons using Next16.4.0 and unchanged current application/config:

- Fresh isolated source/dependency installation +Turbo:1document,0restart,0JSerror/12s.
- Exact4317root +original710MBTurbopack disk cache retained, only process restarted:1document,0restart,0JSerror/12s. No cache deletion or disablement.
- Exact4317via restored `pnpm dev --port 4317`:same1/0/0result.
- Real EdgeTTS endpoint under Turbopack after dependency probe:HTTP200,11232byte MPEG layerIII48kbps24kHzmono for synthetic `Hello world.`. The current TTS integration works with Turbo.
- TrueTurbopack desktop/mobile smoke:4/4PASS24.3s using the existing workflow-smoke spec against the isolated4350server. Temporary config `/tmp/wfk-turbo-playwright.config.mjs`, result artifacts `/tmp/wfk-turbo-regression-results`; explicit Turbo launcher, not the Webpack scoped runner.
- Controlled source hot update and concurrent `next typegen` on the isolated server:each remained1document throughout a settled8sobservation,0restart/0JSerrors. Source probe was restored after observation.
- Controlled real removal/reinstallation of `msedge-tts@2.1.0` while the isolated Turbo server remained open:both operations succeeded using offline store/no lifecycle scripts, each1document before/after settled8s,0restart/0JSerrors. Initial remove attempt used unsupported flags and was discarded; the corrected env-configured remove/add pair above actually ran. No root dependency or lockfile changed.

These observations narrow the failure to the previous live dev/HMR state; they do not prove disk-cache corruption or incompatibility of Edge TTS with Turbopack. The exact initiating operation that made the old session loop is not yet reproduced. Restarting, while preserving source and cache, resolves it; no justification to switch bundlers, delete cache/data or upgrade Next from this evidence.

The ordinary runner uses a node_modules symlink in its snapshots; Turbo rejects that symlink crossing the filesystem root. The diagnostic snapshot therefore received real dependencies from the existing offline pnpm store (522reused,0download). An initial offline install exited nonzero only for blocked preinstall scripts; published runtime modules were present. No scripts/plugins/global packages were approved. This is an isolated test-fixture issue, not the reported reload loop.

No founder browser controlled or learner storage reset. Dev server is left running on the same URL with Turbopack.

`predev` also regenerated the tracked offline missing-letter artifact from the already-correct source (2–3blanks) and its SW content hash. These stale generated artifacts were already inconsistent at baseline; no game algorithm change in this fix. First concurrent runner attempt stopped on source-fingerprint mismatch as expected, rerun after generation settled. No runner checks bypassed.

Regression: workflow-smoke now observes `/today` after network settles and asserts no additional document navigation for8s and no page errors, desktop/mobile. Smoke cases run in order within each project so cold compilation of a different route cannot invalidate a page being observed. Initial assertion counting all startup navigations failed1desktop due concurrent cold route compilation; fixed test isolation/measurement rather than weakening the idle assertion.

## Verification

- Exact4317final isolated headless probe: initialDocuments1/finalDocuments1 over12s after network idle,0page errors. Fresh browser context only, no learner data accessed or cleared.
- `pnpm lint`, `pnpm typecheck`:PASS; final test-only ESLint also PASS. Generated offline script/SW syntax and `git diff --check` PASS.
- `pnpm exec vitest run tests/unit/edge-tts.test.ts tests/unit/missing-letters.test.ts`:8PASS.
- Final `pnpm test:ui -- workflow-smoke.spec.ts --port 4347`:4/4PASS desktop/mobile,30.9s. Result `wfk-ui-result-JXuWJw/result.json` in host temp directory.
- Final `pnpm test:ui -- --mode production workflow-smoke.spec.ts --port 4348`:buildPASS35.7s +4/4PASS desktop/mobile11.6s. Result `wfk-ui-result-izAZx5/result.json`; both final runs base5123ebc +fingerprintd2e1f55bcf5d (full fingerprint in manifests).
- No deploy, dependency/version/env change or physical-TV claim. Current local dev is stable on Turbopack; the precise initiating trigger remains unconfirmed, and real TV acceptance of Edge audio remains separate.

Next action: founder reopen the existing4317todayURL and continue normal use.
