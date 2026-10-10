# T00 — bộ đánh giá AI và điều kiện provider

Ngày kiểm: **09/10/2026**. Trạng thái **pending_external**: đã hoàn tất phần dataset tổng hợp và công cụ chấm offline; **chưa gọi vision/enrichment API, chưa chọn provider/model**. Không đổi `AI_PROVIDER=none` hoặc bật upload trong app.

## Kết quả đã kiểm

- **20 PNG thật**, mỗi ảnh1100×1556 px; [contact sheet](t00/contact-sheet.png) đã xem đủ20 ô, chữ Việt hiển thị đúng, không cắt mất nội dung học. Renderer dùng Chromium156.0.8078.4, chặn mọi network request.
- [Đáp án](t00/cases.json) có hai chế độ `listed`/`all`, tổng40 ca; danh sách đáp án viết riêng, không lấy từ output của model. [Manifest](t00/manifest.json) giữ SHA-256 của từng ảnh, schema, prompt, cases và renderer.
- Cohorts: in rõ, EN–VI, font cursive mô phỏng, shadow/glare/skew/small/blur, lặp từ, `book` noun/verb, câu-only/a/the/is, phrase, grammar suy từ ví dụ, không tiếng Anh, prompt injection/URL và metadata giả. **Chưa có ảnh viết tay thật hoặc ảnh chụp thực tế; human ground-truth review pending.**
- **15 kiểm thử scorer PASS**, gồm40 reference outputs; strict JSON/schema/IDs/refs/bbox/source/inferred review, malformed/refusal/truncation/timeouts, từ bịa/tham chiếu không khớp, metadata/injection, thiếu ca/hash sai/cost sai/mixed models. [Self-test report](t00/self-test-report.json) và [reference records](t00/self-test-records.jsonl) là fixtures tự tạo, **không phải kết quả OCR hay số đo latency/cost của AI**.

## Provider: kiểm nguồn chính thức, chưa xác minh account

| Dịch vụ | Phát hiện từ nguồn chính thức | Trạng thái trong dự án |
|---|---|---|
| Gemini Developer API | Terms hiệu lực23/03/2026 không cho API Clients hướng tới hoặc có khả năng được người dưới18 truy cập; parent/BYOK không thay đổi phạm vi API Client. [Terms](https://ai.google.dev/gemini-api/terms) | **Loại khỏi child-app shortlist hiện tại**; không gọi benchmark qua app này |
| OpenAI API | Hướng dẫn minors yêu cầu safeguards; xử lý dữ liệu cá nhân trẻ dưới13/tuổi consent cần ZDR. ZDR cần approval và còn giới hạn endpoint/feature. `store:false` không tự chứng minh đã có ZDR. [Under-18](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [data controls](https://developers.openai.com/api/docs/guides/your-data) | **Ứng viên có điều kiện**, chưa xác nhận account/ZDR, luồng dữ liệu, safety và endpoint/model |
| Anthropic API | Có hướng dẫn riêng cho tổ chức phục vụ minors, gồm age/content/monitoring/disclosure/privacy safeguards. Retention phụ thuộc organization/feature/model; ZDR cần enablement riêng, có model không thuộc ZDR mặc định. [Minors](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors), [retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention), [commercial terms](https://www.anthropic.com/legal/commercial-terms) | **Ứng viên có điều kiện**, chưa xác nhận account/retention/model và safeguards; không áp consumer Claude.ai18+ thay cho kết luận API |

Đây là screening kỹ thuật theo điều kiện được công bố, không phải xác nhận account đã đủ điều kiện. Không mặc định cropped worksheet đã loại hết thông tin cá nhân; tên trẻ có thể nằm ngay trong pixel. Không cần gửi key vào chat; cấu hình key thuộc server/operator sau khi xác minh điều kiện. Chưa có căn cứ claim vision miễn phí, model tốt nhất hoặc giá thực tế.

## Cách chạy lại và chấm output được ghi nhận

Dùng Node24.14.1/pnpm11.25.0 và Python virtualenv có dependencies trong [requirements-validation](../requirements-validation.txt). Không thêm package SDK hoặc dịch vụ ngoài vào app.

```sh
pnpm eval:images
python3 -B scripts/ai-benchmark/self_test.py
python3 -B scripts/ai-benchmark/score.py docs/evaluations/t00/self-test-records.jsonl --kind self_test --out docs/evaluations/t00/self-test-report.json
```

Scorer đọc JSONL local, **không gửi ảnh/gọi API/fetch URL/execute output**. Mỗi record cần `caseId`, `mode`, `imageSha256`, `schemaSha256`, `promptSha256`, `provider`, `model`, `sdkVersion`, `promptVersion`, `status`, `output` JSON string, `latencyMs`/`costUsd` number hoặc null. Status riêng: `ok`, `refusal`, `truncated`, `timeout`, `cancelled`, `provider_error`. Một file chỉ chứa một provider/model/prompt; một record cho mỗi case/mode. Metadata và source provenance phải kiểm độc lập, tool không xác thực hóa đơn/provider response.

Để chấm responses thực đã thu thập có điều kiện:

```sh
python3 -B scripts/ai-benchmark/score.py /path/to/recorded-responses.jsonl --kind recorded_provider --out /path/to/scored-report.json
```

Không dùng reference records với nhãn provider. **Chưa triển khai live runner/provider adapter**; bước thu responses qua gateway thuộc T05 sau eligibility. Prompt [t00-extract-v1](t00/extraction-prompt.txt) là template đánh giá, mode gửi riêng; chưa benchmark chất lượng prompt. Scorer dùng analysis schema1.0; **không đổi enrichment contract/T07 IPA**.

## Quy tắc chấm và giới hạn

Lexical precision/recall so tập `(surfaceText, kind)` sau NFKC/whitespace/case folding: giữ dạng từ gốc, không lemmatize hay semantic merge. `all` giữ a/the/is và cả listed phrases. Headers/POS labels/glosses/metadata/câu lệnh tấn công không là nội dung học trong ground truth này. Sentence so nguyên văn, chuẩn hóa khoảng trắng. Mỗi cohort/mode có TP/FP/FN riêng; mẫu không positive labels có precision/recall **null**, kiểm `emptyCorrect` riêng. Output invalid/refusal vẫn tính FN, không được bỏ khỏi denominator.

Case `book` chỉ đo lexical extraction; **không chứng minh giữ hai sense/POS hay chống trùng downstream**. Source evidence phải nguyên văn/candidate nằm trong cited evidence/IDs đúng; không suy từ đó rằng bbox OCR hoặc source semantics chính xác. Bộ ảnh không có explicit grammar/pattern heading: khai báo `origin=source` cho những mục đó bị reject; inferred phải review. Chất lượng suy luận pattern/grammar, uncertain labels, phân loại metadata an toàn và source privacy vẫn cần human review.

Report liệt kê ca thiếu, validity, p50/p95 khi có latency và cost khi có số liệu; không gộp handwriting vào clear-print. `isLiveBenchmark=false` vì đây chỉ là chấm offline; không tự chuyển T00 done dù file metadata tự ghi provider. Mục tiêu07: clear-print≥95% precision/recall, corpus đủ, có ground-truth người kiểm và failure recovery thật. Recovery UI/giữ nháp/shared quota/idempotency/429 nhiều instance **chưa được T00 harness kiểm**, thuộc T05/T06/T14.

## Điều kiện còn thiếu để nghiệm thu T00

1. Người kiểm đáp án, thêm ảnh viết tay/chụp thực tế được phép dùng, không có dữ liệu cá nhân thật trong repo; version lại dataset và hashes.
2. Xác nhận provider/account/retention/endpoint/model và safeguards phù hợp app trẻ; có server credential và budget cụ thể trước paid calls.
3. Thu responses có model snapshot/SDK/prompt/schema/image size/attempts/usage/latency/cost thực; cùng cohort và chế độ, 1 call tại một thời điểm, budget/retry theo09/14. Không thêm key để né quota.
4. Chấm/human review và ghi quyết định model/provider dựa trên chất lượng/chi phí thật. Chưa có credential hoặc eligibility chưa đạt: giữ pending_external, tiếp **T10 phần schema/RLS độc lập** theo dependencies; T05 chưa ready.

Lệnh đã chạy lượt này: renderer20 ảnh; scorer self-tests15 PASS; CLI score40/40 self_test, zero missing; Node syntax check và docs validation ghi kết quả cuối trong CHANGELOG. Không chạy lại build/E2E app vì không đổi runtime UI/storage; bằng chứng T04 trước đó giữ nguyên57 unit-integration/58 browser, không gọi là rerun lượt này.
