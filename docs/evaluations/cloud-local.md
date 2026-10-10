# Cloud local và phản hồi IPA — 10/10/2026

Founder chưa có Supabase; phạm vi là hoàn thiện code và kiểm local, không provision/deploy. Đây là evidence triển khai, không thay kế hoạch founder hoặc ledger.

## Phần đã triển khai

- Toàn catalog21 có IPA headword đối chiếu nguồn. Bank `/bæŋk/` có Cambridge source; detail chọn nghĩa ngân hàng/bờ sông bằng các ví dụ riêng. Backfill phần IPA null theo đúng headword giữ nghĩa và IPA đã sửa. Danh sách nguồn mới tại [pronunciation-sources.json](local-end-to-end/pronunciation-sources.json).
- Supabase SSR0.12.7/supabase-js2.117.3 pinned, server PKCE/cookie HttpOnly/getUser, fixed callback, same-origin POST và no-store. Không token/key trong localStorage/IndexedDB/backup. Account chưa cấu hình vẫn học local.
- Account cache đúng owner/library; mở cloud chủ động. Guest transfer có preview/count, backup bài/lịch sử không ảnh nháp, xác nhận, atomic snapshot guard; giữ guest gốc và notes riêng. Login không tự chuyển guest/upload ảnh.
- Migration0004 thêm typed content và client payload, change ledger/cursor, library lock/CAS, batch100/2MB, operation hash/receipt và server review-event reducer. Game attempts không đổi lịch ôn.
- Sync hàng chờ durable/retry cùng operation; pull trước push, conflict lưu hai bản và parent choice, tombstone không đè local edit. Exact unpublished canonical/sense identities remap FK trong transaction; khác nội dung giữ local để chọn; không sửa IDs đã được cloud chấp nhận. Logout gửi thông báo sang các tab; session kiểm lại khi quay lại.

## Kiểm chứng và giới hạn

`pnpm check` PASS: lint, typecheck,78 unit/integration, production build. Bảy cloud integration cases dùng IndexedDB thật về logic (fake-indexeddb transport fixtures trong Node): lost response/retry, hai cache/CAS/choice, account change, tombstone, exact ID reconciliation, transfer giữ nguồn/retry, stale-source rollback. Các cases này không là server RLS evidence.

`pnpm test:sql` PASS: PostgreSQL15 cluster tạm, Unix socket, owner roles thật; migrations0001–0004, ownership/unique/FK/private storage, receipt/hash/retry/CAS/atomic batch và foreign library rejected. Auth/storage metadata là fixtures; không sửa database của người dùng.

Browser integration `tests/e2e/cloud.spec.ts`: identity Google giả lập có nhãn, PKCE challenge/verifier và JWT signature trong test service; SDK/App API chạy thật. HTTP bridge thực thi PostgreSQL RLS/RPC thật. Kiểm guest save → login → preview → backup/confirm → sync → reload → flashcard review/server state → browser cache thứ hai → tài khoản B không thấy A và foreign pull403. Không có auth bypass trong production routes. Harness chỉ `--test`, bind loopback, temp database tự dọn.

Trước sửa test chờ rating commit, full browser run100 PASS/1 FAIL vì test điều hướng ngay khi bấm Nhớ rồi; sửa chờ màn hoàn thành, cloud targeted1/1 PASS. **Full suite trên build cuối101/101 PASS** desktop1280/mobile360/demo-disabled/cloud integration. `pnpm docs:check` PASS163 local links/17 skills/25 requirements/19 tasks/16 screens/23 JSON; JSON schema validation không chạy trong lệnh này. Sau restart4317, kiểm trực tiếp dữ liệu browser đang dùng: bank-river hiện `/bæŋk/`, hai link nghĩa và vẫn giữ bản nghĩa bờ sông founder đã sửa.

Chưa kiểm Google OAuth hoặc Supabase GoTrue/PostgREST/Storage thật. Tải ảnh cloud, xóa tài khoản, giữ cả hai note khi conflict cùng ID, các ca alias đã accepted/merge nâng cao, offline cold-boot account identity và nguồn ảnh ngoài còn mở. Không gửi ảnh/secret/provider, không claim toàn bộ app hoặc cloud đã nghiệm thu.
