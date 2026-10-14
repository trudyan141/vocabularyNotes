# Chia sẻ thư viện A/B — triển khai và manual test

15/10/2026. Founder đã giao làm toàn bộ để manual test. Bản online: [Words for Kids](https://words-for-kids.vercel.app/settings). Không push main, không thêm env Vercel, không mở browser thật founder; dữ liệu mẫu riêng đã dọn sau mỗi hosted run.

A: email Google đã đăng ký app nhận lời mời trong chuông, nhận quyền chỉ học tới khi thu hồi. B: QR/link hoặc mã10chữ-số, không cần login; xem trước chưa consume; nhận một lần cho một trình duyệt, phiên72giờ cố định. Optional email nhận notification riêng từng mã. Mã chưa nhận hết hạn15phút. Kho riêng người nhận giữ tách biệt.

Từ/ngữ pháp approved đã commit cloud tự cập nhật khi máy nhận foreground kiểm watermark15s, focus/reconnect; snapshot đầy đủ chia trang100rows/1.8MB, apply transaction. Học ghi sessions/events/SRS của source library, không tạo nhiều bé hoặc reset learning. Nội dung read-only tại UI/repository/API/SQL. Raw ảnh/nháp/evidence/keys/preferences không share. Pending kết quả giữ trên máy, renew cùng kho giữ operation IDs; xung đột có giữ riêng/tải về, không overwrite tiến độ mới.

## Kiểm đã hoàn tất

- `node scripts/test-sharing-sql.mjs`: PostgreSQL15 cô lập, migrations0011/0012, đúng recipient/owner/anon, inbox, one-use/concurrent two-device claim, receipt/CAS, source progress+SRS, private canary exclusion, grammar forms,115+records/page continuation, quota failed guesses, expiry/revoke, account/library cleanup PASS.
- `node scripts/apply-library-sharing.mjs`: hosted migrations0011/0012 applied, private grants và legacy learning constraint fingerprint giữ nguyên; hosted fixture cùng ma trận trong transaction rollback PASS. Không fake Google OAuth; fixture Auth identity đúng schema.
- `pnpm exec vitest run tests/unit/library-sharing-route.test.ts tests/integration/library-sharing.test.ts tests/integration/cloud-sync.test.ts tests/integration/grammar-practice.test.ts tests/integration/local-repository.test.ts tests/unit/cloud-preferences-route.test.ts tests/unit/cloud-realtime-auth.test.ts tests/integration/practice-selection.test.ts`:51tests/8files PASS. Lost response stable packet, B cookies independent, origin/auth/body boundaries, read-only/trusted hydration, source updates/renew pending và regressions local save/practice/cloud.
- `pnpm test:ui -- --mode production library-sharing.spec.ts notifications.spec.ts --port 4351`: discovery16, build29.4s, browser16.1s,16PASS desktop1280/mobile360. [Runner artifact](library-sharing/production-ui-result.json), source7673714 +8070a090a2bb fingerprint ở thời điểm run. Fixture UI không chứng minh OAuth/cloud; source tiếp theo chỉ thêm test/docs và hide một lesson-edit affordance, kiểm cuối ghi dưới.
- `pnpm lint`, `pnpm typecheck`, `git diff --check`: PASS. Impeccable detector hai surfaces không findings; không gọi detector là human UX pass. Screenshot owner/read-only desktop/mobile trong evaluation.
- Deployment source ee96ccf98517755b01fb2f6883377612f0b17c9c1f2646bc261af98a042a0bce, production build PASS, [immutable deployment](https://words-for-kids-cq8dj2wy3-trudyan141s-projects.vercel.app), [inspect](https://vercel.com/trudyan141s-projects/words-for-kids/KTgCzRNJ5trbw7yCYfY4wJwnpNoy).

## Founder manual test

1. Refresh bản online. Máy mày chọn **Kho của tôi**, vào **Cài đặt → Chia sẻ thư viện**. A nhập Google email của vợ đã từng login app; bấm gửi. Email chưa đăng ký có lỗi riêng.
2. Máy vợ login Google riêng, mở chuông → lời mời → **Nhận và mở thư viện**. Xem kho mày, chỉ học; **Chọn thư viện → Kho của tôi** quay lại kho riêng, không trộn bài/tiến độ.
3. Máy mày tạo B để trống email. Máy khác không login mở **Cài đặt → Nhập mã kết nối**, gõ10ký tự hoặc quét QR. Kiểm mã → đặt tên máy → kết nối. Preview không dùng mã; máy thứ hai dùng cùng mã bị báo đã dùng.
4. Thêm từ/ngữ pháp mới trên máy mày và đợi đồng bộ; máy nhận đang mở có mạng tự thấy trong khoảng vòng kiểm15giây, không cần share lại. Học một thẻ trên máy nhận, kiểm lịch sử/tiến độ ở kho mày.
5. B thử đóng/mở cùng browser, QR camera thật và TV gõ mã. Phiên3ngày; mã chưa ghép15phút. Thu hồi A/ngắt B từ máy mày: request tiếp theo không mở/học tiếp; progress đã gửi giữ nguyên.
6. Optional B email: vợ mở notification xem/copy QR/mã sang TV; chỉ **Kết nối** trên TV consume mã. Notification trên điện thoại chưa dùng mã.
7. Mất mạng giữa lượt: kết quả giữ trên máy. Khi nối lại thử cập nhật. Nếu hết phiên, nhập mã mới của cùng kho để gửi pending; khác kho không trộn kết quả. Xung đột có giữ riêng/tải về.

## Giới hạn chứng minh

Cần founder test real Google OAuth, physical camera/TV remote input, cookie/PWA persistence và cảm nhận UI. Bản đầu cần mạng khi mở lại shared library; đang mở có thể học khi mất mạng trong lease, pending được giữ. Thu hồi không thể xóa nội dung người nhận đã xem/download. Shared watermark dùng snapshot khi đổi, không claim dedicated realtime/delta hoặc instant updates. T10/T11 toàn release chưa đóng.

Docs validator có3link tmp lịch sử thiếu trong body-part-photo-analysis-fix; không sửa artifact lịch sử để báo green.

Kiểm bổ sung chuyển kho phản hồi trễ:8productionUI PASS, gồm test giữ request shared-context rồi chọn kho riêng, sau đó trả response cũ; selection không được khôi phục. [Runner kết quả](library-sharing/switch-race-production-result.json),9e7abfeea92b, build30.3s/browser9.3s. Integration cancellation và chưa prepare pending khi renew PASS. Hide thêm lesson-edit button ở shared scope. Hosted test trước đó cần chờ nút chọn kho hoàn tất trước full navigation; fixture đã sửa await đúng thao tác.

SQL/hosted fixture ban đầu gặp alias PL/pgSQL trùng tên biến và assertion đếm cả dữ liệu ngoài fixture; sửa source/fixture đúng boundary rồi PASS. Auth fixture Google identity timestamps null khiến GoTrue không load/delete được; đã bổ sung timestamps cho đúng2accounts task tạo, xóa thành công và sửa generator. Không thay Auth rows của founder. Hosted checks không giả lập real Google login; dùng password-session sample +Google identity fixture để kiểm registered UID.

Final production deployment: source0ba3de77898a24300368b4c79d98037f3920337330e4ae6c674850964cbe4643, [immutable bản cuối](https://words-for-kids-lbsm3eosg-trudyan141s-projects.vercel.app), [inspect bản cuối](https://vercel.com/trudyan141s-projects/words-for-kids/BPjichPQsxtg4vyyh5zfUhGFNXEV). Build/typecheck production PASS, alias online updated. Deploy dùng snapshot loại trừ env/operator scripts/tests/docs; không upload local credentials.

Final real hosted headless run `node scripts/verify-hosted-sharing.mjs`: **PASS all flows** on final alias: A registered-email invite/inbox/accept, signed-out B manual code and independent HttpOnly lease, automatic new source word+grammar on A/B, original source review_events/review_states (recipient own events0), B notification QR handoff without consuming on phone, second signed-out device, reopen, read-only deep link, own pear library restored separate from source apple/banana, End B, revoke A/B. Two task-created accounts and all their source/share data deleted successfully. [Hosted own-library screenshot](library-sharing/hosted-own-library.png). Synthetic identity/password fixtures verify runtime, not actual Google OAuth UI.

15/10 founder follow-up: large shared status is now only in Settings, header Link icon opens it; Settings grouped and due count clarified. [Current follow-up evidence](review-count-and-settings.md). Existing screenshots/earlier tests show the original panel placement, not current UI.
