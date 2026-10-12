# Nhiều ảnh → một bài chung — 12/10/2026

Founder đính chính luồng nhiều ảnh: preview toàn bộ ảnh ở trên, nút Phân tích ở cuối danh sách; đọc từ của tất cả ảnh trước, sau đó bổ sung nghĩa và ngữ pháp, duyệt một danh sách và lưu một bài. Luồng này supersede phần review/save riêng từng ảnh trong search-and-batch và continuous-paste-and-chunked-photos.

## Hành vi

- CaptureBatch giữ thêm/dán/chỉnh/xóa ảnh, tối đa 10 ảnh, không có nút Duyệt kết quả từng ảnh. Editor của ảnh trong batch giữ crop rồi về batch.
- Compact vision đọc tuần tự tất cả ảnh trước bất kỳ request tra nghĩa nào. Raw words xuất hiện trong cùng danh sách; chưa hoàn tất toàn đợt thì chưa được lưu.
- Gom headword bằng NFKC/case/space xác định trước tra nghĩa, gửi ngữ cảnh từ mọi ảnh cho từ đó. Meaning/POS thật khác vẫn giữ thành các candidates riêng; exact word/POS/sense dedup dùng quy tắc repository hiện có.
- Chia tra nghĩa tối đa 4 từ/lượt, grammar theo đoạn tối đa 1.400 ký tự. Không gửi toàn bộ ảnh để nhận một JSON 10k. Budget output từng request: compact 6k, words 4k, grammar 7k (template 4k); request 60s, per-recovery 40 calls, toàn đợt UI 30 phút và có Dừng. SSE không vượt giới hạn output; MAX_TOKENS/invalid content vẫn repair/split theo adapter cũ.
- Grammar nguồn giống hệt chỉ xử lý một lần; kết quả grammar gộp theo declared family hoặc formula/pattern xác định, các form khác nhau giữ trong một unit. Câu nguồn riêng giữ riêng; không dùng AI fuzzy merge hoặc sửa nội dung đã lưu. Quá 8 variants/unit báo source-limit.
- Các giới hạn nguồn mỗi ảnh 50 raw words/10k ký tự/20 learning giữ nguyên; bị truncated thì chặn hoàn tất/lưu, báo chỉnh/cắt ảnh. Toàn đợt tối đa 500 raw headwords, 100k source text và 200 learning trước gộp; repository cho lưu tới 200 learning trong cùng transaction. Không tự cắt lấy 20 mục đầu.
- Một nháp `ocr:batch:<id>` giữ source checkpoints, meaning chunks và grammar chunks. Ghi/CAS xong từng chunk trước khi đi tiếp; reload không tự gọi AI, Continue bỏ qua phần đã hoàn tất. Không lưu key hoặc base64 vào checkpoint.
- Snapshot gồm thứ tự/source IDs/revisions, mode/model; ảnh thêm/xóa/crop làm checkpoint cũ không hợp lệ và khóa Save cho tới phân tích lại. SaveLesson kiểm snapshot trong cùng transaction lưu lesson/words/learning, rollback nếu source đổi. Receipt giữ idempotency cho double submit.
- Một lần Duyệt và lưu tạo một lesson `ocr-batch:<id>` rồi mở library. Trở về batch đã lưu có link Xem bài đã lưu. Per-photo drafts/lessons cũ không bị tự gộp hoặc xóa. Source IDs được giữ trong provenance của words; ảnh gốc vẫn nháp local, không claim ảnh đã đồng bộ cloud.

## Kiểm tra

Phạm vi: parser/recovery/chống mất dữ liệu/save atomic liên quan, browser mobile 360px và desktop 1280px cô lập. Không full suite hoặc browser founder.

- `pnpm test tests/unit/worksheet-multi.test.ts tests/unit/worksheet-recovery.test.ts tests/integration/worksheet-batch.test.ts tests/integration/learning.test.ts`: **61 PASS**; coverage scan-before-enrich, 70 words, contexts/senses, quota/stop/resume/source-limit, grammar dedup, stale snapshot rollback/idempotent save và 25 learning trong một lesson.
- `pnpm exec playwright test --config playwright.search-batch.config.ts tests/e2e/search-batch.spec.ts --grep 'all photos|quota during|stop during|paste repeatedly|Paste another'`: **10 PASS**. Có assert vị trí nút sau ảnh cuối, request order scan→scan→meaning→grammar, không per-photo review, reload, chỉ một image lesson, paste3ảnh/text paste.
- Final regression cho shared ExtractForm: one-photo analyse/dedup/save và truncation/quota/reload, cùng common-save rerun. **4 unique cases PASS** (mobile/desktop one-photo save và recovery); cùng common-save rerun2cases PASS. Một assertion cũ đếm2wordcards đã được đổi về1headwordcard và kiểm backup giữ cả2nghĩa, đúng library grouping trước đó.
- Sau build cuối: `pnpm exec playwright test --config playwright.search-batch.config.ts --grep 'all photos|quota during|editor tap analyses once'`: **6 PASS**, xác nhận merged-save/reload/quota và single-save trên đúng build cuối. Tổng cộng14caUI unique, các rerun không đếm thêm.
- Lint/typecheck và production build PASS; build cuối sau sửa checkpoint persistence phát hiện bởi browser và lint ref effect. `docs:check` PASS780links/15skills/317resources/48JSON; `git diff --check` PASS.
- [Mobile](merged-photos-2026-10-12/mobile-chromium.png), [desktop](merged-photos-2026-10-12/desktop-chromium.png).

UI/provider tests dùng phản hồi Gemini mock có nhãn fixture, không chứng minh OCR chính xác trên ảnh thật. Chưa live Gemini, clipboard điện thoại thật, hosted sync, SQL hoặc deploy trong lượt này. Không sửa tài khoản/dữ liệu founder, main, Vercel env hoặc browser thật.
