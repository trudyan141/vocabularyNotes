# Phạm vi game, chơi lại và Nghe & hiểu ngữ pháp — 14/10/2026

Direct founder request / T12 / ADR088. Working tree ban đầu sạch; không subagent, không browser thật founder, không deploy/push/env Vercel. Nội dung học/account rows hiện có giữ nguyên.

## Kết quả

- Đang ôn luôn hiện bài/ngày/tên nhóm/bộ thẻ/từ hoặc tất cả; due/weak có nhãn. URL giữ selection; mỗi session có optional filter. Tên đọc live theo scope, lượt cũ thiếu filter báo rõ không đoán scope.
- Về chọn trò chơi / Chọn trò chơi khác giữ phạm vi; Ôn tất cả xóa mọi selection/flags/direction, không xóa history/content. Chọn bài mới hoặc nhóm mới bỏ selection bài/nhóm/từ trước.
- Chơi lại copy đúng questions của lượt vừa chơi (kể cả 10 từ vừa được rating và không còn due), shuffle thứ tự, reset progress và tạo session/question IDs mới. Kiểm tất cả approval/revision/grammar/media trước add atomic; stale thất bại tại kết quả, không truncate hoặc đổi pool âm thầm. Word SRS chỉ đổi khi rating flashcard.
- `grammar-card`: một construction vẫn học được; English/whole sentence IPA/Nghe → mở bản dịch/conditions/analysis Việt đã lưu → GrammarSteps Play/Pause/Next/Replay, static reduced motion. Reveal trước tự chọn Con hiểu rồi/Cần xem lại. Self assessment không chấm kiến thức khách quan, không reviewEvents/SRS và không biến supporting word thành weak spelling word. Thiếu giải thích không sinh AI/IPA giả. Xếp câu giữ là thử thách riêng.
- Nhóm chỉ grammar vẫn xuất hiện trong picker. Speaking dùng cùng selection/eligibility và replay đúng queue; audio/mic không tự chạy. Offline fallback không cố resume grammar bằng luật spelling.
- Archive/cloud validator bảo toàn scope/grammar explanations/understood; reject grammar-card thiếu grammar snapshot/rating. SQL0010 mở rộng mode check, không đổi rows/RLS/owner keys.

## Root cause và probes

Phạm vi trước đây chỉ ở disclosure/local React state, session không lưu filter; automatic start bỏ lesson/word và URL chỉ dùng cho due/group. Kết quả thiếu replay. Source/behavior tests mới ban đầu fail do thiếu replay/mode. UI bắt thêm race setSession trước router.replace: reload tức thì mở URL lượt cũ. Màn mới hiện sau canonical session URL; thoát chờ hub URL trước khi test reload.

## Verification thật

Runtime Node24.14.1/pnpm11.25.0. Prefix PATH đúng Node dùng cho các lệnh pnpm.

- `pnpm lint`, `pnpm typecheck`: PASS.
- `pnpm test tests/integration/grammar-practice.test.ts tests/integration/learning.test.ts tests/integration/missing-letters-game.test.ts tests/unit/practice-filter.test.ts tests/integration/cloud-sync.test.ts tests/unit/offline-game-syntax.test.ts`: **46/46 PASS**. Covers exact replay/CAS/stale media, due words, snapshots/restore, self assessment once/no SRS/no weak word contamination, cloud contracts and offline syntax.
- `pnpm test:ui -- --list game-scope-replay.spec.ts`: **10 discovered**, nonzero cases.
- `pnpm test:ui -- game-scope-replay.spec.ts --port 4357`: **10/10 dev UI PASS** (5 behaviors × mobile/desktop). Setup5.8s/browser43.8s. Ten-word completion→replay→reload→game switch→reset; group auto review→hub reload→Speaking; grammar one construction/exact fixture speech/VI/reduced motion/replay; stale/empty grammar group; option reset clears all filters. [Screenshots](game-scope-and-grammar-cards/mobile-grammar-study.png).
- `pnpm test:ui -- --mode production game-scope-replay.spec.ts compact-games-groups.spec.ts --grep 'ten-word|group auto|grammar cards|grammar-only|Today has no word search' --port 4357`: **build PASS28.3s**, mixed UI **7/10**, overall FAIL. Two old compact smoke cases fail before game at outdated Today selector “Gõ từ mới”; mobile group test reloaded before hub URL completed. Corrected new group fixture to wait hub+canonical URL and reran final scoped10/10; did not patch unrelated Today selector/app. Production snapshot bytes still equal all14 changed app/SQL/script files; only tests/docs changed afterward. Do not claim full production UI PASS.
- `node scripts/apply-grammar-cards.mjs`: **SQL0010 hosted applied+constraint verified**, rollback temp fixture retains7 old modes, accepts grammar-card, rejects unknown mode, retains8 fixture rows. No learning data insertion/deletion or RLS change.
- Impeccable mechanical detector: `[]`, visual inspection mobile+desktop bounded; not human UX acceptance.
- `git diff --check`: PASS. `pnpm docs:check`: FAIL on three pre-existing expired temp-result links in `docs/evaluations/body-part-photo-analysis-fix.md` (9ajoJt/IVyaxC/fzbwuT); no errors reported for changed docs. Left unrelated history untouched.

First broadened unit invocation failed because newly placed cloud-contract import initialized Dexie before fake-indexeddb; moved fixture bootstrap before imports, all46 passed. Dev UI first run5failures: URL race and alert locator included Next route announcer; corrected app sequencing and scoped assertion to main. Production mobile group failure was test navigation synchronization, confirmed final dev UI. No stale snapshot/collision patched app.

## Source/evidence/limits

Commit `3853eca8567f83b4c65d55c977705dccc7266f83` + final UI fingerprint `0212782049bdbc1c9e43956139e9daca0b8524d1f744a0231e09a6731babba86` (dirty workspace). Final dev runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-eFDfFI/result.json`; production runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-q116UY/result.json`, fingerprint `f21cda770b1c0da2be067f700dc5a35e57e34b44b9c55d7f3890997ea1ee2123`. Owned snapshots/logs/traces remain for diagnosis; screenshot copies in sibling directory. Actual token totals unavailable; no inferred token saving or live quality claim.

UI fixture speech confirms text dispatch, not physical-device voice. No live microphone/provider/child comprehension benchmark or real-account end-to-end sync verification for this feature. Hosted check/migration success is not cloud session round-trip evidence. Grammar cards are online/PWA app behavior; standalone offline fallback keeps supported word games, excludes unsupported grammar resumes. UI not deployed. One next action: refresh local and try a real 10-word lesson through completion/replay/back/reset.
