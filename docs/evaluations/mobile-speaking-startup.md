# Speaking mobile, âm báo mic và mở app — 12/10/2026

Founder đồng ý dùng Gemini chấm bản thu, yêu cầu bỏ tải355MB và bỏ popup xác nhận gửi giọng. Bản sửa local: bấm **Nói** mở mic trực tiếp, nghe âm báo bắt đầu, tự kết thúc khi nói xong, nghe âm báo kết thúc rồi tự chấm. Không còn Đồng ý/Để sau hoặc Hỏi lại trong Cài đặt. Kết quả vẫn nằm ngay trong chi tiết từ: phần trăm, nhóm chữ có màu, nhận xét và bảng sửa âm khi chạm từ; game Nói cùng Cáo vẫn ở Chơi & học.

## Nguyên nhân và cách sửa

Ảnh Safari báo trang liên tục gặp sự cố là lỗi tiến trình trang; chưa có log iPhone để khẳng định nguyên nhân cuối cùng. Engine cũ nạp Wav2Vec2/ONNX nặng khi chấm. Một lần inference cold trên Chromium macOS arm64 với clip public `cat`, lấy RSS renderer mỗi100ms, đạt **1484MiB peak**, giữ1470MiB. Thử tắt memory arena/pattern và đóng Worker giúp retained còn391MiB nhưng peak vẫn **1525MiB**. Đây là phép đo local một clip, không phải RAM iPhone hay phép đo engine Gemini hiện hành. [JSON gốc](mobile-speaking-startup-2026-10-12/memory.json) lưu cả thử nghiệm không cải thiện peak; script thử nghiệm tạm không được đưa vào app.

Theo hướng founder đã đồng ý, bỏ hẳn Worker/model/runtime/dependency Transformers và bước prepare-speaking. Chấm bằng một request Gemini Flash-Lite, WAV mono16kHz tối đa10giây/320044bytes. Response giới hạn50KB, kiểm index, đủ âm thuộc nguyên một variant tham chiếu, phần trăm0–100 và lời plain text; lỗi/quota không tạo điểm giả hoặc tự retry/chuyển dịch vụ. Dùng key hiện có; founder xác nhận Free Tier/no billing. Không thử bằng key thật hoặc thay cấu hình/billing.

Cache model cũ tự được xóa theo prefix riêng khi mở app và khi SW mới activate; giữ cache công khai khác và bài học. Không còn nút tải/xóa bộ nhận âm hay lựa chọn inference local. Các source CTC/manifest cũ chỉ là lịch sử nghiên cứu, không runtime import/build dependency.

Âm báo là hai nốt Web Audio ngắn, đi lên trước khi MediaRecorder bắt đầu và đi xuống sau khi bản thu đóng/tracks dừng; không nằm trong audio chấm. Unlock AudioContext ngay trong thao tác bấm, không phát khi vào trang hoặc tab ẩn. Hủy/late permission/rời màn dừng tracks và abort; audio/kết quả chỉ giữ RAM.

HTML loading/DB/Today có SVG Cáo inline, nền sáng và “Đang tải…” không phụ thuộc tải ảnh/hydration. Thêm36 startup PNG theo kích thước/hướng iPhone/iPad cho Home Screen; generate khi build, không precache toàn bộ. Trong fixture auth chậm3giây, Cáo hiện trong1000ms sau document commit rồi nhường cho bài học. Chưa đo thời gian native mở từ share/Home Screen, không bảo đảm HTML đổi được màn OS trước khi document xuất hiện. [Ảnh launch iPhone](mobile-speaking-startup-2026-10-12/ios-launch.png).

## Phạm vi kiểm Gọn và kết quả

Kiểm đúng adapter audio, lifecycle/cues, cache cleanup, automatic endpoint, kết quả inline/sheet/game, lỗi mic/quota, loading và startup metadata. Playwright profile riêng, bài mẫu, audio oscillator tổng hợp, key giả và response fixture; không browser/tài khoản founder. `serviceWorkers: 'block'` giữ interception fixture trên WebKit.

| Lệnh | Kết quả |
|---|---|
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm exec vitest run tests/unit/speaking-gemini.test.ts tests/unit/speaking-lifecycle.test.ts tests/unit/speaking-assessment.test.ts tests/unit/speaking-graphemes.test.ts tests/unit/end-of-speech.test.ts` |20/20 PASS,5files |
| `pnpm build` | PASS bản cuối, dependency/PWA/startup thay đổi |
| `pnpm exec playwright test --config=playwright.speaking.config.ts -g 'Microphone\|Speech ends\|Fox loading\|Quota failure'` |12/12 PASS,42.6s: desktop1280, mobile360 Chromium và390 WebKit |
| `pnpm exec eslint playwright.speaking.config.ts --max-warnings=0`, `node --check scripts/prepare-startup.mjs`, `node --check scripts/sw.template.js` | PASS |
| `python3 scripts/validate_docs.py`, `git diff --check` | PASS;576local links, planning validation riêng |

Unit kiểm request bounded/no identity/no tools/no retry; quota/key/schema/oversized/truncation/variant và null score; trim silence/cues/track cleanup. Browser kiểm không popup/tải pack, Worker constructor bị cấm nhưng vẫn chấm được, điểm88% fixture và a/pp/le, sheet/replay,5từ finite game, mic denied, quota một request/lượt, cache công khai giữ lại, startup PNG1179×2556 và không overflow.

Run đầu8pass/4fail: Today loading mất quá sớm và WebKit route chưa intercept Google. Đã sửa Today loading guard/SVG dimensions và block SW ở config local; run cuối12pass. Trong run đầu, hai request WebKit dùng **key giả/audio tổng hợp** tới Google nhận400; không dùng key thật/AI generation. Không gọi run đầu hoàn toàn offline. Run cuối quota fixture xác nhận đúng số request intercept, kết quả88% lấy từ fixture, không phải đánh giá giọng thật.

Ảnh bản cuối: [mobile word](mobile-speaking-startup-2026-10-12/mobile-inline-word.png), [WebKit bảng âm](mobile-speaking-startup-2026-10-12/webkit-phonemes.png), [desktop word](mobile-speaking-startup-2026-10-12/desktop-inline-word.png), [mobile loading](mobile-speaking-startup-2026-10-12/mobile-fox-loading.png), [desktop loading](mobile-speaking-startup-2026-10-12/desktop-fox-loading.png).

Chưa kiểm iPhone thật, native launch, accuracy với giọng trẻ, âm báo nghe thực tế hoặc Gemini key thật/quota/account. Không claim ELSA parity, production crash đã hết hay SLA1s mọi máy. Không thay SQL/auth/real account, commit/push/deploy/env; founder sở hữu xuất bản theo ADR049.

Skills dùng: vocabulary-delivery giữ task/state; performance điều tra RAM/loading; ui-animation/interface-sfx cho cue; impeccable scoped cho loading/luồng Speaking. Nguồn primary: [Gemini audio](https://ai.google.dev/gemini-api/docs/audio), [inlineData](https://ai.google.dev/api/generate-content), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [Apple startup](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [ONNX large models](https://onnxruntime.ai/docs/tutorials/web/large-models.html). Tài liệu API không chứng minh chất lượng chấm phoneme ngang ELSA.
