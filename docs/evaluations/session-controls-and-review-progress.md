# 14/10 — Xóa lượt dở, xem lại giữ tiến độ, lịch sử trong Hồ sơ

Historical checkpoint: review behavior superseded by founder clarification in [ADR090 evidence](review-retry-group-lessons-and-history.md). Delete/history behavior extended there.

Direct founder screenshot task. Existing dirty scope/replay/grammar-card diff preserved; no subagents, founder browser, main push, new Vercel env, SQL or deployment.

## Root cause and behavior

Hub session cards had only an open action, with no delete path. Added per-row Xóa lượt, pending/error/retry, scoped version/CAS tombstone. `get`/`sessions` exclude tombstones; replay/mutation cannot revive them. Words, attempts, review events and SRS remain. Offline fallback also excludes tombstones and rejects mutation of deleted sessions.

Grammar-card answer previously appended an answer and incremented position for both choices. Cần xem lại now stores checkedCorrect=false on the same revealed session, keeps position/answers and shows saved feedback across reload. Only Con hiểu rồi advances. Immutable gameAttempts are appended once on advancement, never rewritten by repeated review choices. `answers.length=position`, archive/cloud schemas, word SRS and weak-word filtering preserved.

Completed history moved from game hub to default-closed Lịch sử buổi học in Profile; same scoped snapshots/results/replay remain accessible. Hub has a link to that history. Pending cards all have delete controls (removed five-row cutoff so old rounds are reachable).

## Verification

Runtime Node24.14.1/pnpm11.25.0. Initial regression run: 6 pass/2 expected failures (review advanced; remove missing). Root fixes then `pnpm test tests/integration/grammar-practice.test.ts tests/integration/learning.test.ts tests/integration/cloud-sync.test.ts`: 42/42 PASS. Covers repeated review/no progress, stale CAS, foreign scope, retained learning, deleted replay, archive/cloud parsing. Offline syntax test: 1/1 PASS.

`pnpm lint`, `pnpm typecheck`: PASS. Impeccable detector: [] (mechanical only).

UI discovery 12 cases, mobile360/desktop1280. First run 11/12; cold Profile navigation exceeded default assertion timeout. Fixture now explicitly awaits canonical URL and page mount. Final dev run 12/12 PASS, includes simulated IndexedDB put failure, retained card/inline error, retry deletion, reload, default-closed history and reopening results. Runner: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-pkIFAB/result.json`; source commit3853eca + fingerprint159429cef499 (full fingerprint in result). Source later changed only to widen sole pending card and guard offline tombstones; final production verification below.

No live account sync/device verification. Provider/audio fixtures do not prove physical playback or child comprehension. No deploy.

Final `pnpm test:ui -- --mode production game-scope-replay.spec.ts --grep 'grammar cards|unfinished sessions' --port 4357`: build PASS29.6s, 4/4 productionUI PASS8.7s (mobile+desktop review/reload/delete error/retry/Profile). Commit3853eca + fingerprint0a71e5c54e2b; full identity/logs at `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-BK8ya9/result.json`. Final lint/typecheck PASS, bounded screenshot inspection confirmed sole-card width and mobile wrap/no overflow. Prior stale intermediate UI snapshot not used as final evidence.

Saved screenshots: [mobile deletion/error](session-controls-and-review-progress/mobile-delete-round-error.png), [desktop deletion/error](session-controls-and-review-progress/desktop-delete-round-error.png), [mobile history](session-controls-and-review-progress/mobile-profile-learning-history.png), [desktop history](session-controls-and-review-progress/desktop-profile-learning-history.png).

`git diff --check`: PASS. `pnpm docs:check`: FAIL only on three pre-existing expired temp-result links in body-part-photo-analysis-fix.md (9ajoJt/IVyaxC/fzbwuT); changed docs had no reported errors. Actual tokens unavailable.
