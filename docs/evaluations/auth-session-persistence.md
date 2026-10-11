# Kiểm chứng giữ phiên đăng nhập — 11/10/2026

Founder hỏi đăng nhập rồi mở lại có còn phiên và yêu cầu thêm nếu chưa có. Kiểm code xác nhận tính năng đã có; không thêm một kho session khác, không đổi auth runtime hoặc thời hạn trên Supabase.

## Hành vi hiện tại

`src/server/cloud/auth.ts` dùng createServerClient của @supabase/ssr0.12.7 với cookies Next: HttpOnly, SameSite=Lax, Secure trên HTTPS, Path=/. SDK persistSession=true và ghi cookie persistent (DEFAULT_COOKIE_OPTIONS maxAge400ngày trong bản SDK đã cài). Đây là tuổi cookie tối đa, **không phải** cam kết phiên đăng nhập có hiệu lực400ngày. Thời hạn/thụ hồi/rotation của phiên còn do Supabase và chính sách trình duyệt quyết định.

Server authenticated() dùng getUser() để kiểm tài khoản; SDK tự dùng refresh token khi access token hết hạn và ghi cookie mới vào response. Client mới/request sau chỉ cần cookie jar, không cần biến trong bộ nhớ của trang trước. /api/auth/status trả profile tối thiểu với private/no-store; ProfileLink kiểm khi app mount. Provider khôi phục thư viện tài khoản đã chọn qua API, không tin cached owner để cấp quyền. Logout local xóa cookie; request cross-origin bị chặn. Phiên bị thu hồi cần login lại. Network failure không tự xóa cookie; khi kết nối trở lại getUser kiểm tiếp. Offline fallback vẫn chỉ mở guest/sample theo boundary hiện hành.

## Kiểm thử local cô lập

Thêm tests/integration/auth-session.test.ts: dùng SDK Supabase đã cài và auth/status/logout routes thật, cookie jar giả giống Next cookies; env/fetch là fixture, không gọi Supabase/Google thật và không đọc .env/credential/tài khoản founder.

Năm ca: ghi cookie persistent HttpOnly rồi tạo client mới nhận đúng user; access token expired được refresh/rotate cookie và client tiếp theo dùng cookie mới không refresh lặp; refresh bị thu hồi clear cookie/trả signed out; lỗi mạng tạm thời giữ cookie và khôi phục khi reconnect; logout clear cookie và cross-origin logout bị từ chối. Test đầu ban đầu lỗi JWT fixture signature không đúng base64url, đã sửa fixture/rerun; không lỗi auth runtime.

- `pnpm exec vitest run tests/integration/auth-session.test.ts`: **5/5 PASS**,243ms final.
- `pnpm exec eslint tests/integration/auth-session.test.ts --max-warnings=0`: PASS.
- `pnpm typecheck`: PASS.
- `git diff --check`: PASS.

Không đổi UI/route/API/dependency/PWA runtime nên không build lại hoặc chạy browser/full suite/SQL. Chưa kiểm login/session Google/Supabase production hay đóng/mở Safari điện thoại thật. Không thay cấu hình thời hạn phiên/tài khoản/server, không commit/push/deploy. Kết luận phạm vi local: persistence/refresh có sẵn và hành vi SDK/router đã được kiểm chứng; credential runtime vẫn chịu thời hạn/thụ hồi/chính sách cookie thực.
