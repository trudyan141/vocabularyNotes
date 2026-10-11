# Offline thân thiện cho bé — 11/10/2026

Founder yêu cầu sửa màn offline đơn điệu, nút không màu, thiếu minh họa và nhiều chữ/link. ADR055 giữ Theme C và dữ liệu offline, thay cách trình bày bằng Nunito, Cáo, nền vàng, nút mở bài mint/lilac, nút chính berry, năm trò chơi có hình và thư viện thẻ từ có minh họa.

## Phạm vi

Sửa `public/offline.html`, `offline.css`, DOM trình bày trong `offline.js`/`offline-games.js`; build sinh hash mới trong `sw.js`. Các hình Cáo/sách/cặp/táo/mèo/bút/vở đã thuộc public shell được precache; không thêm ảnh/font/provider/dependency mới. Chọn rõ thư viện khách hoặc bài mẫu; dữ liệu tài khoản không mở khi mất mạng. Artwork của từ vẫn approved/versioned; thiếu ảnh trong danh sách có placeholder sách và nhãn Chưa có hình. Không sửa schema, nội dung người dùng hay cách tính/lưu SRS. Giữ provenance/credit và IPA đúng toàn câu dưới English, trước VI.

Màn học/game: nút chính/phụ có màu rõ, tiến độ, feedback, ba lựa chọn ngang bằng nhau tại360px. Tạm dừng/tiếp tục/reload còn hoạt động. Chuyển màn đưa focus về heading và scroll đầu màn; input/keyboard/focus-visible/reduced-motion được giữ. Empty/search/lỗi mở thư viện và thiếu dữ liệu có cách tiếp tục. Copy trạng thái lưu kỹ thuật lặp lại được bỏ khỏi chơi mặc định, lỗi lưu thực vẫn báo. Test thêm từ offline dùng `/profile` để đổi thư viện theo ADR054.

## Kiểm gọn và kết quả

Node24.14.1/pnpm11.25.0. Browser Playwright mới, fixture riêng, app local4320 với APP_DEMO_MODE=true/AI_PROVIDER=none; không founder browser/account/real AI. Chọn phạm vi vì thay PWA/offline UI và cần giữ save/reload/dedup/resume hoạt động; không full suite/SQL/cloud.

- `pnpm lint`: PASS.
- `pnpm exec eslint public/offline.js public/offline-games.js --max-warnings=0`: PASS; sau sửa cuối thêm `tests/e2e/learning.spec.ts`, PASS.
- `pnpm typecheck`: PASS trước và sau sửa cuối.
- `pnpm build`: PASS; build cuối sau một batch sửa màu/fallback/focus sinh public-shell hash đúng bản giao.
- `pnpm exec playwright test --config=playwright.ui.config.ts tests/e2e/learning.spec.ts --grep 'offline (reload|games|fallback|parent entry|library|illustrated|missing)'`: **14/14 PASS,14.9s**. Bảy ca mỗi desktop1280/mobile360: chọn scope/review-save, resume/game/reload, thêm từ/chống trùng/reconnect, manual form không OCR, ôn đến hạn, hình/nút/3 lựa chọn/no overflow, missing library/empty/search/recovery.
- Xác nhận bản cuối `pnpm exec playwright test --config=playwright.ui.config.ts tests/e2e/learning.spec.ts --grep 'offline (reload|library|illustrated|missing)'`: **8/8 PASS,9.4s**. Không tính thành22 ca riêng biệt: tổng14 ca,8 ca rerun.
- `git diff --check`: PASS.

Ngắt mạng bằng context.setOffline(true) rồi navigation fallback qua service worker, kiểm Cáo và hình từ naturalWidth>0, làm rõ không chỉ render ảnh khi còn mạng. Keyboard focus link/heading và bố cục không overflow đã kiểm. Mười view chooser/library/card/game/empty mobile/desktop đã xem; batch xác nhận cuối xem lại chooser/library. Ảnh trong [thư mục](offline-child-ui-screens/), chooser thể hiện trạng thái focus-visible của nút reconnect.

## Giới hạn

Chưa physical-phone/human usability hoặc giọng đọc offline từng máy. Ảnh nguồn mở không nằm trong catalog precache vẫn cần từng asset đã được tải trước; placeholder danh sách xử lý ảnh chưa tải. Không chạy full suite, SQL, live AI, cloud, production hoặc CI. Không commit/push/deploy; founder tiếp tục xem local diff và tự publish theo ADR049. Ledger human/device gates chưa thay đổi.
