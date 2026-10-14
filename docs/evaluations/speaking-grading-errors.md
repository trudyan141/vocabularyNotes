# Speaking manual failure —15/10/2026

Founder có replay nhưng không có điểm; ảnh hiện “Chưa chấm được bản thu”. Không có response/network trace của lượt đó, không tự đọc browser founder hoặc lưu lại bản thu. **Chưa xác định lỗi cụ thể của lượt founder.**

## Root cause đã chứng minh

`assessRecording` trước sửa ném generic Error(response/evidence)/SyntaxError cho response bị cắt, invalid JSON hoặc schema/reference mismatch; network/timeout cũng rơi catch chung. `WordSpeaking.assess` chỉ phân ParentAiError/unknown-target rồi gộp tất cả còn lại thành câu chung. Đây là nguyên nhân thông báo che mất lỗi, chưa phải bằng chứng mic/key hay Gemini schema của lượt founder sai.

Một request cùng prompt/model/final reference apple, WAV Samantha TTS mono16k, key hiện có: HTTP200/STOP, JSON hợp lệ,4match/noinsertions, deterministic100. Không dùng audio founder, không chứng minh giọng thật/trẻ ổn định. Request này là engineering probe thứ9 (8cũ+1follow-up), còn291 trong budget300; không thêm semantic prompt candidate hoặc auto retry. Template priorRequests đã cập nhật9; README công cụ ghi8 là checkpoint trước follow-up, không được dùng để giảm offset9.

## Fix

Typed failures tách SP-JSON/SCHEMA/INCOMPLETE/BLOCKED/RESPONSE/NETWORK/TIMEOUT/RECORDING; UI nói nguyên nhân tương ứng và cách xử lý. Invalid schema/JSON nói rõ lỗi chấm, không phải trẻ đọc sai. Lỗi luôn đưa kết quả thành unscored, không tạo điểm giả, replay vẫn có. Giữ thông báo key/quota/access riêng. Không log/save raw provider text/audio/key; diagnostic chỉ code cố định. Không relax schema, không đổi prompt/model/temperature/tokens/billing.

Regression RED trước sửa: expected code incomplete nhưng nhận generic Error(response). Sau sửa GREEN; kiểm thêm malformedJSON/schema/network/timeout và thông báo không leak raw error.

## Verification

Node24.14.1/pnpm11.25.0; commit nền e3ecf94783e496b71ac989942d99966301b6bc20, source fingerprint7223dd30348f14b4fdf06f7fa3d4bcd6b596f6f7ac159fa6ec5a4338642f2fc7.

- `pnpm test tests/unit/speaking-gemini.test.ts tests/unit/speaking-v2.test.ts tests/unit/speaking-lifecycle.test.ts`:38PASS/3files.
- `pnpm lint`, `pnpm typecheck`:PASS trên source cuối.
- Discovery trước run; `pnpm test:ui -- --mode dev speaking-assessment.spec.ts --grep 'invalid provider|grading failures' --port 4343`:4PASS mobile/desktop,29.7s, owned snapshot. [Result](speaking-assessment-v2/grading-errors-ui-result.json). Fixtures kiểm schema/cutoff/json/replay/no fake score/late response/unscored round. Không build lại vì chỉ error handling/copy, không route/config/dependency đổi.
- Đã xem [mobile](speaking-assessment-v2/mobile-grading-error.png), [desktop](speaking-assessment-v2/desktop-grading-error.png): thông báo có nguyên nhân+code đọc được, không tràn ngang.
- Preview4344 source fingerprint khớp checked source, HTTP200; đã cập nhật cùng process/origin, founder reload để lấy code mới. Không điều khiển browser thật, không push/deploy/env Vercel.

## Next action / limits

Founder reload [bản local](http://127.0.0.1:4344/practice/speaking?word=apple), thu lại và ghi mã SP-* nếu chưa có điểm. Lượt trước không thể được truy ngược chính xác từ screenshot; không claim đã sửa acoustic/model failure. [Plan evidence](speaking-assessment-v2.md), [manual checklist](speaking-assessment-v2-manual-test.md). Pilot100human/child và iPhone thật vẫn pending. Global docs check còn đúng3link artifact temp cũ ở body-part-photo-analysis-fix.md; không sửa lịch sử ngoài scope.
