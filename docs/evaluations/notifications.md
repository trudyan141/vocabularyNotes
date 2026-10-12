# Notifications —12/10/2026

Founder yêu cầu chuyển lời nhắc sao chép ở đầu Today vào chuông thông báo chung. Giữ Theme C, Nunito, mascot và4nav hiện có. Skills: vocabulary-delivery, UI/UX Pro Max (notification/keyboard query), Impeccable scoped distill/craft floor, motion-design và React guidance; không thêm skill/dependency.

## Behavior

- Header48px bell + berry unread count. Rung650ms hữu hạn khi unread signature đổi; OS/app reduced motion tắt rung/popup animation. Chuông chờ thư viện sẵn sàng.
- Popup neo chuông, giới hạn chiều rộng/chiều cao viewport, Close/Escape/outside/toggle lần2, keyboard/focus Radix Popover. Danh sách không tự đánh dấu đọc.
- Chọn notification mở route detail, lưu read receipt IndexedDB theo scope/signature, bền reload. Lỗi read/decline không claim success; account switch không hiển thị projection scope cũ.
- Photo-draft reminder cũng chuyển khỏi Today, dùng guest/demo/account; detail resume đúng editor, read bền reload, edit cùng draft không re-alert, bỏ draft tự hết.
- Device-copy detail hiển thị count và preview/backup/confirm hiện có, decline giữ nguyên source. Mở detail/preview không tự copy. Legacy decision vẫn giữ; copy thành công ghi copied. Tái dùng compact TransferTools tránh lặp heading/copy.
- Sync detail dùng actual CloudTools/reconcile. Cùng lỗi retry không re-alert; thay pending work/conflict có thể unread lại; saved tự hết notice. Lỗi submit giữ đỏ ngay nút.
- Empty/resolved có Cáo; unknown id404. Không banner trong main, không thêm nav.

## Verification scope/results

Chỉ kiểm notification state/isolation/persistence, photo-draft resume/deletion và các transfer/sync invariant bị chạm; UI hai viewport1280×1000/360×800 trong browser Playwright riêng. APIs account/cloud mocked bằng fixture, không tài khoản founder/real browser/provider.

- `pnpm exec vitest run tests/integration/notifications.test.ts tests/integration/cloud-sync.test.ts`:13PASS. Có read/reopen, account isolation, source preservation/no automatic copy, legacy choices/deleted source, same retry vs new pending work, sync recovery, transfer exact merge/CAS.
- `pnpm lint`, `pnpm typecheck`, final `pnpm build`: PASS.
- `pnpm exec playwright test --config playwright.notifications.config.ts`: 8PASS trên phiên bản cuối (4behavior ×2viewports). Lượt đầu4PASS/2FAIL do bấm chuông trước scope initialization; sửa disable khi query chưa ready. Lượt2 phát hiện id lạ render404 nhưng HTTP200 do streaming route; chuyển3notification ids sang route xác định để unknown dùng HTTP404 thật, rerun scoped cases. Test nháp thêm ảnh chờ input ready, scope đúng tabpanel và xác nhận xóa2lần theo flow thật; cuối8PASS.
- `pnpm docs:check`: PASS743links/15skills/317resources; `git diff --check`: PASS.
- Impeccable detector: `[]`; không suy detector=human UX pass.

Screenshots: [mobile popup](notifications-mobile-chromium.png), [desktop popup](notifications-desktop-chromium.png), [mobile detail](notification-detail-mobile-chromium.png), [desktop detail](notification-detail-desktop-chromium.png).

Chưa deploy/hosted integration/physical-phone or child test. Nháp ảnh kiểm bằng canvas PNG thật qua normalization/IndexedDB/editor; không AI. Không SQL, Vercel env, push main hoặc nội dung học thật. Không claim đã copy founder library.

## Follow-up — thùng rác từng thông báo

Founder yêu cầu nút xóa riêng mỗi item để popup gọn. Thùng rác48px độc lập link detail; xóa không đóng popup/mở detail, focus quay về Close. Dismiss receipt scope/signature bền reload; không xóa source/pending work/copy decision. New signature được báo lại. Lỗi dismiss không ẩn item, đỏ tại nút. Popup đã có chiều cao giới hạn/cuộn.

Scope:6notification data tests (bao gồm persistence/source/isolation/new work/failed dismissal); browser chỉ deletion và bell toggle/detail liên quan trên desktop/mobile. `pnpm exec vitest run tests/integration/notifications.test.ts`:6PASS. `pnpm exec playwright test --config playwright.notifications.config.ts --grep 'trash dismisses|bell toggles'`:4PASS. Lint/typecheck/final build PASS (first build bị test typing `autoOpen` sai, đã bỏ và rerun PASS). Chưa deploy/hosted/physical phone.
