# S04 — Hai tab thêm ảnh, 11/10/2026

Founder yêu cầu chia upload/camera thành hai tab để màn hình ngắn và ít rối. Dùng Impeccable scoped distill/craft floor, giữ Theme C hiện có; không cài plugin hoặc thay toàn bộ thiết kế.

## Kết quả

- Mặc định **Chọn ảnh**; picker, kéo thả và dán ảnh vẫn dùng cùng kiểm định và mở xem trước ngay. Nút chọn ảnh dùng berry primary.
- **Chụp ảnh** chỉ hiện camera UI nền mint. Chọn tab chưa hỏi quyền; nút Mở camera mới hỏi quyền. Bị từ chối/không hỗ trợ có chọn ảnh thay thế.
- Chuyển tab dừng track, hủy camera acquisition còn chờ; quyền đến muộn không bật lại preview. Quay lại tab phải mở camera lại. Nháp giữ ngoài cả hai tab.
- Radix tab semantics, ArrowLeft/ArrowRight và focus rõ; chỉ một tabpanel xuất hiện. Không tự gửi ảnh/AI.
- Founder yêu cầu kiểm file lớn `eng.traineddata`: file local chưa tracked, 23.466.654 bytes (~23,5 MB), là dữ liệu OCR cũ. Không có tham chiếu trong src/public/scripts/tests/package/config hiện hành; OCR thiết bị đã bỏ theo ADR030. Đã xóa theo yêu cầu và thêm `*.traineddata` vào `.gitignore`. Không thay đổi lịch sử Git/remote.

## Kiểm theo mức Gọn (ADR050)

| Lệnh / kiểm | Kết quả / lý do |
|---|---|
| `pnpm exec eslint src/components/features/capture.tsx tests/e2e/capture.spec.ts --max-warnings=0` | PASS; lint hai file thay đổi |
| `pnpm typecheck` | PASS; kiểm kiểu và route |
| `pnpm build` | PASS; build một lần để kiểm UI bằng production preview local |
| Playwright scoped capture, grep `capture tabs\|camera denied\|live browser camera\|late camera permission\|pasting an image\|corrupt pasted\|dropzone` | 12/12 PASS, 16,4 giây; keyboard/panel, permission denied/unsupported, native stream lifecycle, late permission, paste/reload/text, corrupt/multi-image |
| Playwright confirmation, grep `capture tabs\|drop zone` | 4/4 PASS, 16,5 giây; 2 tab cases xác nhận màu/focus sau transition + 2 picker/drop cases còn thiếu trong grep đầu |
| Xem 4 ảnh, viewport 360/1280 | Không tràn ngang; mỗi màn chỉ có upload hoặc camera. Snapshot đầu camera chụp lúc màu đang chuyển, đã thay bằng ảnh sau khi màu ổn định; không gọi snapshot trung gian là lỗi app |
| `git check-ignore eng.traineddata` + kiểm file không còn | PASS |

Tổng **14 ca browser riêng biệt** (7 case × desktop/mobile), tab case chạy lại một lần để xác nhận ảnh. Config tạm `/tmp/wfk-scoped-ipa.config.ts` giới hạn hai project và production fixture 127.0.0.1:4320; không mở browser/account thật của founder. Node24.14.1/pnpm11.25.0; không install, không full unit/SQL/E2E/audit toàn app vì không đổi dữ liệu/schema/provider. Camera acquisition giả lập bằng canvas, playback/track native; **chưa kiểm camera iPhone/Android thật**, không gọi AI thật.

## Ảnh đã xem

- [Chọn ảnh 360](founder-fixes/capture-tabs/upload-360.png)
- [Chụp ảnh 360](founder-fixes/capture-tabs/camera-360.png)
- [Chọn ảnh 1280](founder-fixes/capture-tabs/upload-1280.png)
- [Chụp ảnh 1280](founder-fixes/capture-tabs/camera-1280.png)

Chỉ local, chưa commit/push/deploy (ADR049). Ledger T04 vẫn pending_external vì smoke điện thoại thật chưa đạt. Thay đổi env/key có sẵn được giữ nguyên.

Steering tiếp trong cùng lượt ADR052 bỏ footer toàn app: ảnh tab ở trên là snapshot trước khi gỡ footer; xem [evidence mới](welcome-footer-and-404.md). Docs capture ban đầu357links/34JSON PASS trước khi bổ sung052/053.
