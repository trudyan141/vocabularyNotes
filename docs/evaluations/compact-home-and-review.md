# Today, accordion duyệt từ và sao lưu —12/10/2026,ADR068

Founder yêu cầu gộp backup trùng chức năng, card Thêm bài cùng hệ Gõ từ mới, form từng từ đóng sẵn, Today chỉ bài gần nhất và edit tên trong chi tiết bộ theo ngày. Implement local theo incumbent ThemeC, không thêm dependency/schema/AI calls.

Settings chỉ Sao lưu và khôi phục, hai nút Tải bản sao / Khôi phục bản sao. Export full archive; restore nhận cả words-for-kids.archive.v1 và words-for-kids.text.v1 cũ qua parser/importer hiện có. Giữ checksum/limits, archive cần thư viện trống, text merge preserves existing, pending words có link edit để duyệt. Không xóa khả năng dùng file backup cũ. Copy lỗi không hướng dẫn nút đã bỏ.

Today hai FeatureAction cards72px cùng layout; chỉ một set có từ approved, sort learnedOn rồi updatedAt, không rename inline. All sets vẫn có link. Title/day editing ở Chi tiết bộ theo ngày trong filtered library; giữ scope/version/CAS, không đổi words/SRS. Lesson list không icon rename hoặc inline editor. Review mỗi candidate details đóng mặc định, summary hình64px+tên+toggle; chỉ form chọn/sửa/credit bung riêng. Different senses giữ riêng, không chỉ vì cùng spelling mà gộp dữ liệu.

## Kiểm tra Gọn

- `pnpm lint`, `pnpm typecheck`, `pnpm build`: PASS bản cuối.
- `pnpm exec vitest run tests/integration/learning.test.ts -t 'archive|backup|lesson|dated|edit.*set'`:6PASS/13out-of-scope skip; archive/text restoration/lesson/IPA boundaries.
- `pnpm exec playwright test --config=playwright.compact.config.ts -g 'home has|one backup|editor tap'`:6PASS11.7s desktop1280/mobile360. Home latest+illustratedcard, editing detail/save/reload, single full export+invalid restore without data loss, collapsed candidates open/close and dedup/distinct sense save checked. No full suite/cloudSQL.
- Initial run2PASS/4FAIL do locator button vs ActionLink link và nested summary strict match; sửa test selectors, không app workaround; confirmation6PASS.
- Impeccable detect once changed four components: `[]`; narrow refine/distill/craft-floor, vocabulary-delivery. Không coi detector là human UX acceptance.

Ảnh: [mobile home](compact-home-2026-10-12/mobile-home.png), [mobile closed review](compact-home-2026-10-12/mobile-review.png), [desktop home](compact-home-2026-10-12/desktop-home.png), [mobile backup](compact-home-2026-10-12/mobile-backup.png). Mobile full-page capture có fixed nav overlay và focused skip link từ thao tác keyboard fixture; đó là trạng thái focus trong screenshot, không nội dung mới/default banner. Views inspected với screenshot và assertions cho cả hai feature cards.

Tests dùng profile/data mẫu, fake key/provider route, không account/browser/AI thật/phone hoặc publish. Existing uncommitted ADR066/067 changes retained; no remote/env/commit/push/deploy. Old LibraryTools source còn compatibility/history nhưng không còn render Settings. Source docs/ledger/founder updated, SQL0007 pending unchanged.
