# Speaking trong chi tiết từ, game và đồng bộ tự động — 12/10/2026

Code local trên diff từ `058c0c7`, không push/deploy/env/hosted SQL, không gọi AI thật hay đọc/ghi tài khoản founder. Kiểm thử dùng browser profile riêng, guest/account fixture và clip công khai đã có tại máy.

## Thay đổi theo yêu cầu

- Chi tiết từ có Nghe/Nói/icon replay/Nghe chậm, giữ IPA/nghĩa/ví dụ và nghe IPA cả câu hiện có. Nói xong tự dừng, đánh giá, tô từng nhóm chữ và hiện phần trăm. Không có nhãn “điểm tham khảo”, native audio controls, CTA dừng/chấm hay đoạn copy thử nghiệm.
- Chạm từ mở bottom sheet: từ màu/%, nghe mẫu/giọng mình, đọc gần đúng và bảng Âm mẫu/Máy nghe được, hướng dẫn môi/lưỡi/hơi bằng tiếng Việt. `apple` phủ a/pp/le, không bỏ e hoặc bịa âm /e/.
- Nói cùng Cáo là ô game trong Chơi & học → `/practice/speaking`, tối đa5 từ đã duyệt, tiến độ/Tiếp theo/Bỏ qua/Hoàn thành/Chơi lại; vòng mới chuyển qua các từ tiếp theo. Không thay SRS hoặc lưu audio.
- Bộ377MB tải/xóa tại Cài đặt, Cache Storage riêng cho browser/domain/device; link chỉ khi chưa tải. Không có/xóa pack vẫn nghe/thu/replay được, nhận xét cần tải lại. AI coaching bật tại Cài đặt, tự gọi bounded target/evidence sau đánh giá, không audio upload/paid fallback; dùng hướng dẫn local khi lỗi/quota.
- Đăng nhập luôn account, không giữ mutable guest mode hay fallback guest khi cloud/auth lỗi. Durable outbox + after-commit150ms + private Realtime/cursor catch-up, sparse60s safety poll. Tên/avatar/các preference hiển thị có queue owner-scoped và RPC merge patch. Auth shared request, lỗi auth upstream không bị nhận nhầm là signed-out.
- Guest IndexedDB giữ nguyên, hỏi sao chép một lần mỗi owner. Decline/reload không đưa guest lên cloud; logout vẫn mở thư viện guest đã chọn. Transfer giữ preview/backup/CAS/dedup và bản gốc. Key/mic/capture drafts không cloud hóa.
- Public Welcome/404 tách khỏi AppProvider/thư viện/auth; bỏ root force-dynamic, giữ dynamic cho learning layout. HTTP307 sớm từ `/`, stable Image Cáo không remount; Realtime SDK chỉ account, không quét các bảng trong liveQuery để dò mỗi thay đổi, không rebuild search khi pull không đổi nội dung.

## Kiểm chứng

Lệnh dùng Node24.14.1/pnpm11.25.0, PATH theo `.nvmrc`.

- `pnpm lint`, `pnpm typecheck`, `pnpm build`: PASS; final build Welcome/404 static, learning/API dynamic. Có build sửa sau khi phát hiện demo fixture bị bake trước khi tách learning layout; không báo first build là UI pass.
- `pnpm exec vitest run tests/unit/cloud-preferences-route.test.ts tests/unit/speaking-assessment.test.ts tests/unit/speaking-graphemes.test.ts tests/unit/end-of-speech.test.ts tests/unit/speaking-ctc.test.ts tests/integration/cloud-preferences.test.ts tests/integration/auth-session.test.ts tests/unit/cloud-realtime-auth.test.ts tests/integration/cloud-sync.test.ts`: **44 tests/9 files PASS**. Includes alternate phones, score/missing/extra/weak audio, all spelling, endpoint/cancel, durable prefs ACK race/owner separation, origin/anonymous/strict API whitelist/unknown-field output boundaries, outbox/receipt/conflict/transfer source preservation.
- `pnpm exec playwright test --config playwright.ui.config.ts tests/e2e/speaking-refresh.spec.ts tests/e2e/scaffold.spec.ts --grep 'Speaking|Speech ends|Signed-in scope|friendly 404'`: **8 PASS**23s. Mobile360×800/desktop1280×1000, virtual mic+labelled Worker fixture for deterministic UX, automatic endpoint/88%/letters/table/replay; inline details and five-turn game finish; pack absent/error/delete; strict account failure; bilingual HTTP404.
- `pnpm exec playwright test --config playwright.ui.config.ts tests/e2e/account.spec.ts tests/e2e/cloud-refresh.spec.ts`: 8 PASS +4 test failures due setup still navigating Settings instead of Profile for the moved library switch. Fixed fixture path, reran only `--grep 'Failed cloud opening|Guest copy'`: **4 PASS**7,2s. Combined12 scoped cases PASS, including safe avatar, auth/cloud distinction, guest preservation after failure/logout, one-time decline, and two independent browser devices automatically receiving add/edit/delete/profile through **actual Supabase Realtime SDK with mock WebSocket/HTTP transport**. No manual sync buttons pressed. Changes observed in <5s fixture bound; not hosted latency/SQL proof.
- `pnpm exec playwright test --config playwright.ui.config.ts tests/e2e/learning.spec.ts --grep 'Speaking actual pinned worker'` executed in the combined Speaking/cloud run: **desktop actual Worker/ONNX PASS**18,7s; mobile heavy case intentionally skipped. Reads pre-existing verified355MB model from loopback fixture (no download from provider); public `cat.ogg` via virtual mic, cache/download/inference/automatic end/replay/delete/reload. UI-only fake Worker is not used for this case.
- **21 distinct scoped browser cases PASS** across above confirmations,1 intentional mobile heavy skip. No full E2E/CI claim. `node --check scripts/cloud-test-server.mjs`, docs/diff checks recorded at handoff.
- `sh scripts/test-realtime.sh`: **blocked before SQL runs** at local PostgreSQL15 x86_64 initdb: `could not create shared memory segment: Cannot allocate memory`, kernel SHMALL. No kernel/global config/unrelated process changed. Migration/policy/RPC/trigger SQL therefore **not verified** this checkpoint; browser mock does not establish RLS.

## Ảnh đã kiểm

[Chi tiết từ mobile](speaking-refresh-2026-10-12/mobile-inline-word.png), [desktop](speaking-refresh-2026-10-12/desktop-inline-word.png), [bảng âm mobile](speaking-refresh-2026-10-12/mobile-phonemes.png), [desktop](speaking-refresh-2026-10-12/desktop-phonemes.png), [actual Worker](speaking-refresh-2026-10-12/desktop-real-worker.png). No overflow in key mobile/desktop states. Sheet screenshot waits final opacity; no transparency workaround or extra prototype copy.

## Điều còn cần kiểm ngoài lượt local

Phần trăm dùng công thức đối chiếu âm tại [spec15](../15-speaking-practice.md): matches1, near substitution0,5, other/missing0, denominator max expected/heard; uncertain→null. Correspondence chưa phủ mọi cách viết không tách sai từng chữ. Chưa có benchmark/calibrator/giọng trẻ/điện thoại thật/peak RAM, không claim độ chính xác ngang ELSA. Nhận xét AI thật chưa gọi; chỉ adapter fixture. Raw score/clip giữ trong RAM của trang, không thêm lịch sử hoặc sửa dữ liệu phát âm đã lưu.

Hosted chưa có [migration0007](../../supabase/migrations/202610110007_realtime.sql). Cần chạy scoped SQL ở môi trường local phù hợp rồi founder apply migration/publish theo ADR049; không tuyên bố hai thiết bị thật đã đồng bộ. Realtime/quota lỗi vẫn có catch-up/poll/outbox; trạng thái foreground có mạng mới có cập nhật nhanh. Full-table bounded prepare/hash vẫn giữ để phục hồi và chống mất thay đổi, chưa được thay hoàn toàn bằng incremental outbox. [So tốc độ](performance-2026-10-12/README.md) tách kết quả từng trang, không gọi Welcome nhanh hơn là mọi trang nhanh hơn.

Nguồn: [ELSA API](https://elsaspeak.com/en/elsa-api/) cung cấp feedback phoneme/word nhưng tính phí, không dùng SDK/API đó. [Supabase private broadcasts](https://supabase.com/docs/guides/realtime/broadcast) và [authorization](https://supabase.com/docs/guides/realtime/authorization) hỗ trợ notification/private RLS; phần lấy lesson vẫn authenticated cursor API.
