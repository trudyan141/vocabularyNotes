# Dán ảnh liên tiếp và chia lượt nhận dạng — 12/10/2026

## Sửa theo phản hồi thật

Ảnh founder gửi ở trang chỉnh ảnh cho thấy lỗi: listener dán chỉ có ở /capture, nên ảnh thứ hai không được nhận. Đã thêm listener ảnh và nút **Dán thêm ảnh / Chọn thêm ảnh** ngay editor. App lưu tên bài, crop, rotation và metadata của ảnh đầu rồi gắn ảnh vào cùng batch bằng CAS; từng ảnh mới vẫn có source riêng. Từ batch tiếp tục dán ảnh thứ ba bằng Ctrl+V/⌘V hoặc nút. Dán chữ không bị chặn. Lỗi ảnh, đầy đợt, lưu hoặc xung đột được báo rõ; thêm ảnh không tự gọi AI.

## Gemini xử lý thế nào

Không gửi cả đợt vào một request. Mỗi ảnh có một chuỗi request riêng, chạy tuần tự. Batch mới chia lượt ngay từ đầu, không chờ lượt đầy đủ 10k token thất bại:

1. Vision đọc chữ gốc và danh sách từ gọn: tối đa 6.000 output token. Chỉ lượt này gửi ảnh.
2. Lấy nghĩa, ví dụ và IPA theo tối đa 4 từ/request: 4.000 output token; chỉ gửi từ cùng ngữ cảnh ngắn.
3. Ngữ pháp theo đoạn ≤1.400 ký tự, ≤3 mục/request: 7.000 output token; template a/an/plural dùng 4.000. Phần chưa xử lý phải được đưa vào hàng đợi.
4. Chỉ phần hoàn chỉnh, đã validate mới lưu checkpoint IndexedDB/CAS. MAX_TOKENS hoặc nội dung không hợp lệ được sửa một lần rồi chia đôi phần lỗi. Quota, lỗi mạng hoặc hủy sẽ dừng và giữ dữ liệu; Continue chạy tiếp phần chưa xong.

Transport đã dùng SSE. Streaming là nhận response từng phần, không vượt output budget; partial JSON không được lưu thành nội dung học. Các request độc lập có budget riêng, không cộng output cả đợt vào một giới hạn 10k. Nguồn: [Google GenerateContent](https://ai.google.dev/api/generate-content), [structured streaming](https://ai.google.dev/gemini-api/docs/generate-content/structured-output).

Không đảm bảo AI đọc đúng và đủ mọi chữ. Vẫn giữ các giới hạn mỗi ảnh: 50 từ, 20 mục learning, 10.000 ký tự nguồn, 40 recovery calls/run, 60 giây/request và 5 phút/ảnh. Khi đọc nguồn bị cắt hoặc quá context, app yêu cầu chia/cắt ảnh nhỏ hơn, không báo thành công đầy đủ. Single-photo path chưa vào batch vẫn giữ fast path 10k + fallback; dán thêm ảnh chuyển sang batch chia lượt.

## Kiểm tra

- `pnpm exec vitest run tests/unit/worksheet-recovery.test.ts tests/unit/byok.test.ts tests/integration/worksheet-batch.test.ts tests/integration/capture-repository.test.ts`: **63 PASS**. Có kiểm chia lượt từ vision 6k, không gọi full 10k, word batches ≤4, text-only enrichment; attachBatch/CAS giữ pixels, title, rotation, tags và scope. Các ca recovery, quota, cancel, source caps và capture cũ cũng qua.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: **PASS**, Node 24.14.1. Final build sau code cuối. Typecheck ban đầu gặp import ArrowRight thiếu ở Today trong công việc đang diễn ra khác; import đã có trước final check, lượt này không sửa Today.
- `pnpm exec playwright test --config playwright.search-batch.config.ts tests/e2e/search-batch.spec.ts tests/e2e/capture.spec.ts --grep 'paste repeatedly|Paste another photo button|select two photos|quota failure midway|stop during the second|pasting an image opens'`: **12/12 PASS**, 15,8 giây. Mobile 360 và desktop 1280 Chromium cô lập: keyboard paste 3 ảnh, paste button editor/batch, text paste, giữ title/rotation, chunked analyse/review/save/reload, quota/cancel/resume và single paste regression. Phản hồi provider và clipboard API được giả lập; không dùng key thật.
- `pnpm docs:check`: **PASS 752 local links / 15 skills / 317 resources / 48 JSON**; JSON parse, không schema validation. `git diff --check`: **PASS**.

## Giới hạn bàn giao

Local, chưa deploy. Không push main, thêm env, sửa SQL/cloud hay dùng tài khoản/browser thật của founder. Quyền clipboard thật trên Safari/iPhone/Android chưa kiểm trên thiết bị vật lý. Không dùng các fixture trên để khẳng định OCR quality, human UX hoặc quota tài khoản thật. Mọi thay đổi sẵn có ở workspace được giữ nguyên.
