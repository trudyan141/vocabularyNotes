# Capture/upload và đối chiếu ảnh — 10/10/2026

Hai steering founder: nút bị khóa dù tick, không có ảnh so AI; UI upload/camera xấu, cần drag-drop. ADR031, giữ Theme C/ba nav/Gemini trực tiếp theo ADR030.

## Sửa

- Trạng thái screenshot production không nhận config key và không có candidates. Tick consent/approval chưa đủ; màn nay giải thích từng điều kiện cạnh CTA. Thêm/sửa key ngay tại màn, không mất nháp hay các checkbox; lưu key phát event mở action khi đủ consent/privacy. Save yêu cầu selected/đủ nghĩa/approval, nêu lỗi thiếu dữ liệu. Không gọi AI vì chỉ tick hoặc lưu key.
- Ảnh **prepared thực sự gửi API**, local Blob URL được cleanup; reuse preview camera/crop, mở ảnh lớn để đọc chữ. Sticky cạnh form trên desktop; mobile giữ preview phía trên khi sửa.
- Upload dùng vùng drag-drop/drag state/một ảnh, nút tiếng Việt và hỗ trợ Enter, native input hidden. Camera riêng. Mọi file qua cùng bounded validation/normalize/draft; nhiều ảnh bị từ chối rõ, không âm thầm lấy file đầu. Bỏ banner cũ dịch vụ chưa kết nối. Metadata/crop/retry/camera tracks/local storage giữ nguyên.

## Kiểm

Full docs validator PASS203 local links/17skills351resources/25requirements19tasks16screens/27JSON; owned whitespace PASS.

`pnpm check` PASS104 unit/13files/lint/TypeScript/build. `pnpm test:e2e` **117/117 PASS**, desktop/mobile/cloud fixture/demo-off. Tests mới kiểm thiếu key dù đủ tick, inline session key không localStorage, không gửi trước click, source image decode/review/reload; drop nhiều ảnh reject, một ảnh tạo nháp, drag state và Enter mở picker cùng intake. Regression đầu có assertion còn nhãn link/banner cũ và locator alert trùng Next announcer; đã sửa theo hành vi hiện hành, không bỏ kiểm gate/intake. File input dùng hidden để tránh duplicate accessibility controls.

CUA kiểm desktop1280×900 và mobile360×800, không tràn; khi focus nghĩa vẫn thấy ảnh. Proof dùng **worksheet tổng hợp và nhập tay**, không phải kết quả Gemini thật, không publish ảnh riêng của founder. [Upload desktop](founder-fixes/photo-upload-desktop.jpg), [upload mobile](founder-fixes/photo-upload-mobile.jpg), [đối chiếu desktop](founder-fixes/photo-compare-desktop.jpg), [đối chiếu mobile](founder-fixes/photo-compare-mobile.jpg). Không có key thật/call trả phí/AI accuracy/camera thiết bị thật. Launcher Impeccable thiếu execute permission, dùng source screen/theme/craft-floor/clarify/layout và bounded browser check; không sửa quyền global/cài plugin.

Code `c74a2e2` đã native Git deploy production READY (`dpl_FyKAszjMsBXCMsWYTAtuCjnXEM8K`), alias [Words for Kids](https://words-for-kids.vercel.app/capture). [CI38028605020](https://github.com/trudyan141/vocabularyNotes/actions/runs/38028605020) SUCCESS: check104,117 browser,SQL/docs đều pass. Browser hosted xác nhận dropzone/nút chọn tiếng Việt/camera; nháp founder ở extract render đúng prepared ảnh1920×1080, không gửi AI hay đọc/publish key/ảnh riêng. Follow-up này chỉ ghi evidence/docs, không đổi runtime đã kiểm. Next: founder mở lại nháp hosted, nhập Gemini key ngay tại màn nếu chưa có, kiểm ảnh rồi phân tích/duyệt; không gửi key qua chat.

## Streaming follow-up — ADR-032

Founder requested visible progress and progressive words10/10/2026. Gemini endpoint now streamGenerateContent?alt=sse; direct-header key unchanged. Status stages follow actual request events, elapsed seconds and indeterminate berry activity bar; Stop and90s bound. Read-only provisional words appear when complete JSON/schema/evidence is available, never persisted or approved. Final STOP/whole schema/evidence required to replace review draft. Error/cancel/key change clears pending UI and keeps prior draft. The old UI could show “AI đang phân tích…” after400; corrected. REST responseFormat.text.mimeType requires enum APPLICATION_JSON (not the MIME string used by older/Interactions examples); fixed against [official TextResponseFormat](https://ai.google.dev/api/generate-content?hl=en#TextResponseFormat).

Transport tests use owned SSE fixtures, split UTF-8/CRLF/thought exclusion, partial completion, cancellation/refusal/truncation/500KB bound. Browser fixtures check elapsed/provisional words/disabled save/final review/draft preservation and clearing failure; no real API key or provider inference. Screenshots ai-stream-desktop-chromium.png and ai-stream-mobile-chromium.png show synthetic worksheet and fixture pear (deliberately not OCR correctness evidence). Initial browser run117pass/2fail: fixture raced new request after cancel; corrected fixture synchronization before full rerun. Final pnpm check PASS109 unit/13files/lint/types/build; full pnpm test:e2e PASS119/119 (1.5min); full docs validator PASS203links/17skills351resources/25requirements19tasks16screens/27JSON. Streaming CORS preflight OPTIONS thật200/allow-origin hostedURL/headers content-type,x-goog-api-key; không inference.
