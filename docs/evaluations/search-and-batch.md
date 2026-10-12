# Thư viện tìm từ và nhận dạng nhiều ảnh — 12/10/2026

## Phạm vi và kết quả

Tìm “are” không còn lấy từ chỉ vì example/definition/title có are hoặc headword có “care/share”. Mỗi canonical headword/caseMode một hàng, nhiều nghĩa/POS có link riêng, không đổi hoặc xóa user data. Prefix hỗ trợ nhập dở, có dấu/không dấu/hoa thường khớp tương đương; phần khớp được tô và gạch chân trên từ/nghĩa gốc. Các consumer khác của repository.search và deck picker giữ broad-search contract.

Chọn/kéo thả tối đa10ảnh tạo đợt local; từng ảnh qua cùng10MB/20MP/header/normalizeJPEG/EXIF strip, không auto-upload. Màn batch cho preview/chỉnh ảnh/crop/thêm/xóa. Phân tích tuần tự qua adapter hiện có, mỗi request60s/ảnh5min và recovery/WebLock như ADR080. Dừng/lỗi dừng đợt ngay; những ảnh đã xong/validated checkpoints giữ trong IndexedDB. Reload không gửi AI. Continue bỏ qua ảnh complete/saved. Duyệt/lưu riêng mỗiảnh; same word/POS/sense qua2ảnh giữ1sense và2lesson links.

Capture button/file input chờ local repository ready để không nuốt lựa chọn lúc hydration. Source snapshot/learningDraft CAS ngăn ghi đè chỉnh sửa tab khác. Crop mới đánh dấu kết quả cần phân tích lại, không tự xóa review cũ. Xóa draft chỉ dọn đúng pixels/review draft, không xóa lesson/word đã lưu.

## Kiểm tra

- `pnpm exec vitest run tests/unit/library-search.test.ts tests/integration/library-search.test.ts tests/integration/worksheet-batch.test.ts tests/integration/capture-repository.test.ts tests/integration/local-repository.test.ts`:35PASS. Token boundaries/highlight VI offsets, grouping/paging/scope/caseMode, batch partial intake/bounds/sequential quota/resume/cancel/CAS/crop/delete và existing capture/repository regressions.
- `pnpm lint`:PASS; `pnpm typecheck`:PASS; `pnpm build`:PASS, gồm route `/capture/batch/[batchId]`. Một final build sau sửa; earlier build bị chặn bởi media fixture type error baseVersion:null trong công việc khác ở workspace, fixture đó đã được chỉnh0 trước final build. Supplemental `vitest run tests/integration/media.test.ts`:11PASS; không sửa source media trong lượt này.
- `pnpm exec playwright test --config playwright.search-batch.config.ts tests/e2e/search-batch.spec.ts tests/e2e/capture.spec.ts --grep "word list groups|select two photos|quota failure midway|stop during the second|invalid photo reports|drop zone accepts|pasting an image opens"`:14/14PASS (14.6s), mobile360/desktop1280 Chromium cô lập. Bao gồm headword/senses/highlight/no results; multi intake/crop/analyse/reload/review/save same-word across2images; quota and cancellation at photo2/resume only pending; invalidfile retain valid/remove; drop/keyboard/paste regressions. AI/provider responses và account status đều mock, không live inference.
- Impeccable detector scoped4UI files:`[]`; không coi đó là human UX pass.
- `pnpm docs:check`:PASS729local links/15skills317resources/48JSON (parse/integrity, không schema-validation). `git diff --check`:PASS. Mọi lệnh pnpm chạy với Node24.14.1 từ PATH local, không đổi global/runtime.

Screenshot-only confirmation:2/2happy-path reruns PASS sau đưa scroll vềtop trước chụp full-page (tránh fixed skip-link ngoài viewport lọt vào ảnh); không đổi code UI sau finalbuild.

Các rerun trước phát hiện hydration chưa sẵn sàng, đã khóa intake tới repo ready; fixture sense identity và empty-state text locator/keyboard-ready expectations đã sửa, không thay product data để làm test pass.

## Ảnh kiểm mobile/desktop

[Mobile search](search-and-batch-2026-10-12/mobile-chromium-search.png), [desktop search](search-and-batch-2026-10-12/desktop-chromium-search.png), [mobile batch](search-and-batch-2026-10-12/mobile-chromium-batch.png), [desktop batch](search-and-batch-2026-10-12/desktop-chromium-batch.png). Đã xem ảnh:query highlight rõ, batch thumbnails/actions cùng Theme C; không horizontal overflow ở360/1280.

## Giới hạn

Chưa deploy; không push/main/env/SQL/founder browser/tài khoản founder/key thật. Multiple-photo OCR quality, quota tài khoản thật, phone hardware/human UX chưa kiểm. Record batch/review/image drafts giữ local theo scope, không cloud/backup; words/lessons đã duyệt dùng persistence/cloud/backup hiện có. Paste/camera từngảnh hiện giữ luồng cũ; multiple selection/drop là luồng đợt mới. Các checkpoint nguồn/skill cũ giữ lịch sử, không tăng ledger task acceptance đã chờ external.
