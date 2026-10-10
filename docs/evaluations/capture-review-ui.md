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

Deployment/CI bản này chờ quan sát sau push; quyền deploy đã có trong session. Next: founder mở lại nháp hosted, nhập Gemini key ngay tại màn nếu chưa có, kiểm ảnh rồi phân tích/duyệt; không gửi key qua chat.
