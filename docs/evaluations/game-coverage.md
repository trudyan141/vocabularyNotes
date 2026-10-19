# 19/10 — Các lượt10câu đi hết bộ trước khi lặp

Founder chọn hướng2 trong [plan](../ai/GAME-COVERAGE-PLAN.md), giữ selection phạm vi ôn đã có; ADR100. Không thêm màn chọn phạm vi, không đổi Theme/Nunito/nav, không subagent/main push/new Vercel env/founder browser. Bootstrap diff là ba tài liệu plan từ lượt trước; diff đã staged trong lúc task chạy được giữ nguyên.

## Hành vi đã triển khai

- Mỗi library +mode +filter bài/nhóm/set/từ/due/weak +direction có một chu kỳ pool snapshot ổn định, random một lần. Mỗi lượt≤10câu; bộ47mục là10/10/10/10/7. Không bù lượt cuối bằng mục cũ, không tự reset khi hết bộ hoặc qua ngày.
- Mở game ưu tiên resume cùng lượt đã reserve. Kết quả có **Tiếp từ mới**, hoặc **Làm các từ đã bỏ qua**, hoặc **Bắt đầu vòng mới** khi hết phần còn hợp lệ. Replay/retry giữ behavior hiện hành nhưng không liên kết coverage để tránh cộng đôi.
- Progress cả bộ, hôm nay và lần chơi gần nhất hiện trong game/kết quả/resume card. Chu kỳ giữa hai lượt cũng có nút Tiếp tục trên hub đúng selection; không tạo heading rỗng khi progress đã hiện trong card dở. Group/lesson tên lấy từ scope hiện hành.
- Đúng/sai đều tính một lần đã làm; chỉ Next/rating lưu thành công mới tăng coverage. Skip hoãn về cuối; Check giữ feedback khi reload, chưa cộng coverage trước Next. Reveal/hint không cộng. Snapshot answer lưu answeredAt/day/timezone, ngày không là khóa của chu kỳ.
- Xóa lượt giữ answered prefix qua tombstone, nhả phần chưa làm. Dữ liệu thay đổi/xóa/bỏ duyệt/revision stale được thống kê không khả dụng riêng, giữ phần đã làm; không tuyên bố đã chơi những mục đó. Từ thêm sau thuộc vòng sau. Ảnh chỉ tạm tải lỗi vẫn chờ retry, không tự đánh dấu đã làm.
- Toàn bộ8mode trong PracticeRepository dùng cơ chế này; grammar tính từng form/câu. Speaking giữ luồng5từ riêng và chưa nhận bảo đảm coverage. Flashcard rating vẫn đổi SRS như trước; các game khác không đổi lịch ôn.

## Dữ liệu / offline / cloud

`practiceCycles` IndexedDBv6 và Postgres `practice_cycles` giữ pool nhẹ immutable, chỉ đồng bộ khi tạo; session giữ snapshot tối đa10câu với cycleId/cycleKey. Coverage là projection union các answer không skip của những session liên kết, gồm cả tombstone, nên không ghi lại pool hàng nghìn mục mỗi câu. Pool word không hydrate toàn bộ example/membership: đọc identities/eligibility, hydrate theo batch cho lượt nhỏ. Ảnh vẫn tải/decode có giới hạn trước khi dùng.

Tạo session dùng transaction/CAS, tái kiểm revision/media/grammar. Hai tab cùng máy dùng chung reservation hoặc nhận conflict/retry; không cấp hai lượt trùng vì double start. Lưu lỗi không tăng counter. Account sync/transfer/reconcile/archive và shared projection hỗ trợ cycles; guest chỉ local. Content-only copy không mang progress. Backup cũ thiếu practiceCycles vẫn parse, restore đổi scope và giữ luật nội dung cần duyệt lại. Không dựng chu kỳ mới từ lịch sử random cũ.

Offline fallback dùng cùng thuật toán coverage (module generated từ TypeScript), đọc selection đã lưu, kiểm pool/group/set trước mở; scope không mở được báo kết nối lại thay vì đổi toàn kho. App và fallback cùng resume/checkpoint trong một DB. Chu kỳ cần local schema đã được app cập nhật một lần; không native upgrade DB tự phát từ fallback. Account/shared offline permissions vẫn giữ baseline.

SQL0013 additive: RLS owner/library, lifecycle guards, immutable cycle, source ownership/grammar refs, session item links, cursor changes; shared recipients chỉ ghi learning, không sửa content. Pool lịch sử có thể sync sau một edit/delete nên tạo cycle kiểm ownership, còn active question kiểm approval/revision riêng. Giữ constraints của practice_sessions/review_events/game_attempts/review_states.

Giới hạn nhiều máy: thiết bị tiếp tục sau sync nhìn thấy cùng cycle; hai máy offline đồng thời chưa thể hứa không trùng. Cơ chế conflict hiện hành giữ local/pending và remote; chưa thêm server claim/lease hoặc tự merge kết quả mâu thuẫn trên cùng câu. Không gọi mock transport là hosted websocket/device evidence.

## Lỗi mobile phát hiện khi kiểm UI

Probe headless Pixel7/360 trên production snapshot ghi nhận pointerdown ở nút Kiểm tra, nhưng pointerup rơi vào ảnh: CSS `.practice-question:has(#practice-answer:focus)` bỏ `display:none` ngay khi input blur, đẩy nút giữa pointerdown/up. Sửa thành state `is-typing` giữ hình ẩn đến câu tiếp theo, tránh submit/hint/skip dịch chuyển. Không sửa dữ liệu để che lỗi.

Các lần kiểm đầu có fixture đọc session cũ trước khi UI chuyển lượt, locator alert đụng Next route announcer, và reload trước feedback lưu thành công. Test đã chờ đúng progress/feedback và scope alert vào main. Một probe có chờ button Kiểm tra enabled khi input còn rỗng là sai fixture, đã bỏ. Dev HMR không dùng làm evidence production cuối. Các lần failed/stale không tính pass.

## Verification

Runtime Node24.14.1/pnpm11.25.0; base commit2737fca +dirty content fingerprint trong runner, không dùng SHA đơn lẻ.

- **101 scoped logic/integration tests PASS**:70 từ practice-coverage/learning/grammar-practice/cloud-sync/library-sharing/word-aggregate/library-sharing-route/offline-game-syntax;31 từ content-copy/groups/missing-letters-game. Bao gồm47/1/9/10/11pool, wrong/skip/replay/deletion, concurrent starts, due/filter/direction, full pool501, grammar forms, legacy archive/restore, same cycle sau second-device fixture sync và guest transfer lặp. Không chạy full release suite.
- `pnpm lint`, `pnpm typecheck`: **PASS** sau sửa mobile.
- `node scripts/test-sharing-sql.mjs`: **PASS** PostgreSQL15 cô lập, migration0013, owner/shared coverage/RLS/immutability/item-link/day projection cùng sharing/lifecycle regression; data mẫu rollback/dọn đúng namespace.
- `pnpm test:ui -- --mode production practice-coverage.spec.ts game-start.spec.ts game-scope-replay.spec.ts ready-picture-games.spec.ts --port 4369`: **build PASS34.9s +45/45productionUI PASS66.7s**, desktop/mobile Chromium và WebKit game-start regression. [Runner](game-coverage/final-ui.json), [log](game-coverage/final-ui.log). Source fingerprint `ccf001bf90c8…`, owned snapshot `wfk-ui-source-R9PR2F`.
- UI mới:47từ qua hai lượt rồi dừng23/47, checked feedback reload, hub/reload/resume24/47; save failure giữ input/progress và retry;11từ thành10+1, explicit new cycle; offline fallback/app giữ scope/checkpoint. Regression: exact replay/due/group/grammar, tên/set/history/deletion/error, picture choices/approved imports/revocation/broken image, start không server navigation. Screenshot inspection theo một batch desktop+mobile: main/error không tràn ngang; không claim human UX hoặc điện thoại thật.
- [Mobile resume](game-coverage/mobile-coverage-hub.png), [desktop result](game-coverage/desktop-coverage-result.png), [mobile error/retry](game-coverage/mobile-coverage-save-error.png).
- Hosted SQL: management API rollback migration+fixture PASS trước apply; **0013 applied**, fixture namespace d1/d2/e1 rollback và cleanup confirmed; legacy constraint digest unchanged. Không log token hay đưa token local lên Vercel.
- `git diff --check` và cached diff check PASS. Docs validator còn đúng3link temp hết hạn trong `body-part-photo-analysis-fix.md` đã có trước task; không sửa lịch sử đó.

## Deployment / external acceptance

Frontend đã deploy **READY** trên [domain](https://words-for-kids.vercel.app), [immutable release](https://words-for-kids-l0wnhk80a-trudyan141s-projects.vercel.app); [deployment](game-coverage/deployment.json).546app/build files đã đối chiếu với snapshot và1file cấu hình vercel.json hiện có; public/sw.js là output generated đã build lại. Hosted guest smoke **2/2PASS**, Chromium desktop +WebKit iPhone12viewport, dữ liệu guest trong browser context mới:10+1target khác nhau, checked reload,11/11 và explicit new cycle;0page errors. [Kết quả](game-coverage/hosted.json), [WebKit](game-coverage/hosted-mobile-webkit.png). SWcontroller=false ở cả hai mẫu, không dùng làm evidence installedPWA/SW-controlled. Probe đầu dùng fixture giả định IDapple của demo, trong guest ID khác làm fixture clone searchIndex thiếu key; sửa fixture resolve actual sense ID, không đổi app để che lỗi. Contexts đã đóng, không tạo account/cloud learner data. Staging chỉ allowlisted app/build sources từ snapshot đã test; không env/git/docs/tests/account dumps. [Manifest](game-coverage/deploy-manifest.json). Không build/push main hoặc đổi Vercel env.

Physical iPhone/PWA, human child UX và hai máy offline đồng thời vẫn là giới hạn chưa nghiệm thu. Âm thanh/AI trong UI tests được chặn/fixture; task này không chứng minh chất lượng provider hoặc acoustic assessment. Không đo lại throttled5000/mobile latency nên không gán benchmark cũ cho feature mới.
