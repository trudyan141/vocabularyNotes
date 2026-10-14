# Giữ bộ lọc ôn qua điều hướng — 14/10/2026

Acceptance: đang ôn bài/nhóm → rời sang thư viện/Hôm nay → trở lại chơi vẫn đúng filter. Speaking dùng cùng lựa chọn. Chọn bài/nhóm mới thay selection; Ôn tất cả clear bền qua reload/điều hướng. Không sửa learning data/progress; lỗi storage không clear giả; các library scopes độc lập.

Root cause: filter chỉ đọc từ URL trong Practice/Speaking. Menu link `/practice` không có query; không có selection store. Repro red đúng thao tác menu sau khi đợi library URL:2desktop/mobile FAIL, received “Tất cả bài và nhóm học”. Lần probe đầu thiếu wait route khiến click lọt DOM cũ, không dùng làm acceptance.

Fix: `src/data/local/practice-selection.ts` validate+persist filter vào metadata keyed theo scope; `PracticeSelection` boundary đọc/ghi trước mở hub/game/Speaking, restore query (due có hub=1 để không auto-start). Session URL cụ thể ưu tiên; snapshot filter khi mở session cập nhật lựa chọn. Reset await metadata write rồi clear URL, failure hiện lỗi và giữ selection. Metadata không thuộc archive/cloud sync; không thêm schema/index/dependency/route.

Validation Node24.14.1 / pnpm11.25.0, commit3853eca + dirty content fingerprint:

- `pnpm exec vitest run tests/integration/practice-selection.test.ts tests/unit/practice-filter.test.ts`:4tests PASS (persistence, owner isolation, reset, malformed/invalid selection, failed reads/writes).
- `pnpm test:ui -- --list game-scope-replay.spec.ts --grep 'selected lesson survives'`:2tests discovered. Scoped dev run navigation/speaking/new group/reset + existing group auto-review/simple hub:6tests PASS,71.1s; fingerprint880b54198575; [run1](persistent-practice-selection/run-1.json).
- Discovery and dev run `--grep 'failed scope reset|ten-word lesson' --port 4351`:4tests PASS,30.2s; fingerprint9e759a1c57b6; [run2](persistent-practice-selection/run-2.json). Regression finish/replay/reload/switch/reset, failure+retry on metadata write.
- `pnpm lint`, `pnpm typecheck`:PASS after final app/test edits. Impeccable scoped mechanical detector: `[]`, not human UX approval. Mobile reset-error screenshot inspected; mobile/desktop captures stored alongside run JSON.
- Initial `pnpm test -- <files>` passed `--` to Vitest, unexpectedly ran57files/358tests:357PASS,1FAIL in `tests/integration/deletion.test.ts` dated-set test. Fixture spreads LibraryWord into strict saveLesson input including `groupMemberships`/`lessonMemberships`; Zod rejects unknown keys before deletion. Selection code is not on that test's path; left outside this task. This is not a full-suite PASS.

No build needed for local state-only change; scoped UI used owned dev snapshots with isolated fixtures, no founder browser. No deployment, live account, physical device verification, or cross-device persistence claim. Existing working-tree changes preserved. No token metric provided; do not infer tokens from timings.

Docs/diff: `git diff --check` PASS. `pnpm docs:check` failed on3existing missing `/tmp` result links in `body-part-photo-analysis-fix.md` (9ajoJt/IVyaxC/fzbwuT); no missing link reported for this task's new evidence. Left historical evidence unchanged.
