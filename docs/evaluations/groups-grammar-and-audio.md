# Nhóm có ngữ pháp/mục ngày và sửa TTS lần đầu — 11/10/2026

Local isolated fixtures only, ADR049/050. Speaking mới chỉ là [draft cho AI](../15-speaking-practice.md) và [founder review](../KE-HOACH-FOUNDER.md#speaking-review), chưa có runtime/mic/chấm điểm/API thật.

## Behavior

- Tạo/sửa nhóm có Từ/Câu/Ngữ pháp/Bài-ngày, nút Chọn tất cả từ/câu/ngữ pháp áp dụng toàn bộ kết quả lọc trên mọi trang và giữ lựa chọn ngoài lọc. Có phân trang12 và chọn từng loại/trang như trước.
- Nội dung được gom thành các mục theo ngày, tên và loại nguồn gốc bằng shared lessonTitle/date presenter. Duplicate-only addition không tạo mục rỗng; một member chỉ ở một mục trong nhóm, không lặp ở ngày khác. Giữ snapshot tên/ngày sau khi lưu; bộ nguồn/từ/lịch ôn không bị viết lại.
- Chống trùng xác định: word canonical/case/POS/sense; câu normalized English+VI; grammar title/formula/conditions/analysis/error/correction. Khác nghĩa, giải thích hoặc bản dịch giữ riêng. Không AI fuzzy merge.
- `decks.group.grammar` và `sets` là optional/backwards compatible; legacy groups tổng hợp mục ngày khi đọc và lưu khi save. CAS/scope/approval còn nguyên. `senseIds` gồm grammar parent để ownership hiện hữu vẫn kiểm. Không table/SQL migration.
- Backup/cloud DTO giữ membership; guest transfer/reconcile remap cả grammar parent và source lesson, không làm mất các supplemental rows cùng sense. Restored content vẫn pending approval. Group chỉ có grammar đọc được, không khởi động word practice trống.

## Nguyên nhân và sửa âm thanh

`AudioControl` và `offline.js` trước đây gọi `getVoices()` một lần, báo thiếu giọng ngay khi array rỗng. Browser có thể tải danh sách sau đó và phát `voiceschanged`; lần bấm thứ hai mới tìm thấy voice. [MDN getVoices](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices), [MDN voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event).

Prewarm danh sách khi mount, lần tap chọn voice có sẵn đồng bộ; nếu chưa có thì lần tap đó chờ event và bounded polling100ms tối đa3s rồi đọc, không cần tap thứ hai. Có “Đang chuẩn bị giọng đọc…”, Dừng hủy request. Aborted generations không phát sau rời màn/hide/scope change. US English ưu tiên; bare en hợp lệ; utterance dùng đúng voice.lang, slow còn0.7/normal0.9. Offline dùng cùng helper sinh từ TypeScript, chỉ nhận localService English. Game/back/close/pagehide hủy pending audio. Module mới nằm trong public PWA shell/hash.

Không thể hứa mọi thiết bị phát được khi không có API/voice, muted OS hoặc browser hạn chế gesture; thiếu giọng/lỗi engine có recovery, không đoán voice Việt thành English. Chưa xác minh hardware iPhone/Android hoặc nghe âm thanh thật.

## Kiểm tra và phạm vi

Lý do: thay membership/dedup/transfer/backup cần data-loss tests; thay offline module cần build/cache smoke; kiểm một vài luồng chính mobile360×800 và desktop1280×1000, không full suite/SQL.

- `pnpm exec vitest run tests/unit/audio-voices.test.ts tests/integration/groups.test.ts tests/integration/cloud-sync.test.ts tests/integration/deletion.test.ts tests/integration/learning.test.ts`: **46/46 PASS**. Voice empty→ready/eventless readiness/local-only/cancel/timeout; grammar exact dedup/stale/scope/CAS/dated partition/duplicate-only/archive/cloud/remap and existing affected behaviors.
- Scoped ESLint affected14 TS/TSX files: PASS. Final helper-only rerun6/6 PASS; Public offline JS syntax checks PASS. `pnpm typecheck`: PASS; final `pnpm build`: PASS, local Node24.14.1/pnpm11.25.0.
- Browser command: `pnpm exec playwright test --config playwright.ui.config.ts tests/e2e/groups.spec.ts tests/e2e/learning.spec.ts --grep 'one selection|audio first tap|groups preserve|select all spans|offline illustrated chooser'` — **10 distinct cases PASS across scoped runs**: 8 cases after mobile wrap fix, 2 audio cases after waiting for actual route completion; final confirmation **4/4 PASS in12.0s** for new all-types/date/grammar and audio online/offline on both viewports. No full suite.

Initial browser run caught group selection summary nowrap overflowing mobile layout viewport and interfering with click coordinates; fixed wrap and four editor tabs. Audio test initially used a nonexistent Back label, corrected to existing Từ của con. New fixture only tests engine invocation, not audible device audio. Unit rejection assertion continuation was adjusted to avoid Vitest thenable retaining aborted Dexie transaction zone; production transaction behavior unchanged.

No real AI, founder browser/account, microphone recording, SQL migration, CI, push or deploy. Human/physical-device/multi-device acceptance remains open.


### Final UI evidence

Four group views captured at scroll origin with transitions completed, inspected for labels/wrapping/source names/date/selected grammar state. Reader tabs share one row with three columns; editor uses four. Original screenshots from unrelated offline UI kept unchanged.

- [Mobile selection](group-grammar-screens/mobile-chromium-select.png), [mobile source-dated grammar](group-grammar-screens/mobile-chromium-dates.png).
- [Desktop selection](group-grammar-screens/desktop-chromium-select.png), [desktop source-dated grammar](group-grammar-screens/desktop-chromium-dates.png).

`python3 scripts/validate_docs.py` PASS; `git diff --check` clean. Earlier builds followed by necessary lint/layout repair; final production build compiled the final runtime once after those repairs. No further runtime changes after final four-case confirmation.
