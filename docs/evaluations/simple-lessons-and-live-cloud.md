# Bài học gọn, hình dùng được và đồng bộ hosted — 12/10/2026

Theo yêu cầu trực tiếp ADR072/073. Không push main, không thêm Vercel env, không mở browser thật của founder. Giữ thay đổi có sẵn. CLI deploy được founder cho phép trong ADR071.

## UI và dữ liệu

- Chọn suggestion remote cập nhật input ngay trước lookup. Abort/generation bỏ kết quả cũ; Gemini tự điền hai ví dụ khác nhau, VI và IPA/hint của cả câu, null nếu không chắc. Không optional accordion, không checkbox/Xem thư viện trước lưu. Key dùng cấu hình browser sẵn có.
- Từ/Câu/Ngữ pháp ba tab đều nhau ở library/group. Mẫu câu đi trong grammar, không thêm tab hay chuyển/xóa dữ liệu. Compact structure/example rows mở hai route detail riêng. Filter Tất cả/Chưa có hình inline; pagination12content/page, groups6lessons/page giữ.
- WordDetail vẫn giữ ví dụ bổ sung, bỏ pattern/grammar. Bỏ prepared-image selector; missing words có tên/nghĩa và tìm/dùng hình riêng. Commons nguồn/license kiểm lúc search và import; resizeJPEG512/500KB, signed receipt, owner/version CAS. Dùng private Supabase server key derive HMAC theo domain riêng nếu thiếu media signing key, không đưa private key ra browser.
- Picture-only update giữ revision của linked approved grammar. Profile input/save disabled tới khi account repository ready để không mất preference queue khi vừa mở trang.

## Kiểm chứng

- `pnpm lint`: PASS. `pnpm typecheck`: PASS. `pnpm build`: PASS, có route sentences/grammar detail mới.
- `pnpm exec vitest run tests/unit/word-examples.test.ts tests/integration/media.test.ts tests/integration/learning.test.ts tests/integration/cloud-preferences.test.ts tests/integration/cloud-sync.test.ts`:40PASS. Có reject incomplete/wrong-word AI JSON, media receipt forgery/private-key fallback, linked grammar revision, scoped/approval data và cloud queue.
- `pnpm exec playwright test --config=playwright.compact.config.ts tests/e2e/simple-lessons.spec.ts`:6PASS, mobile360/desktop1280: manual save, grammar detail, remote spelling/two examples/inline filter, picture failure→retry→save/reload. `cloud-refresh.spec.ts`:2PASS cùng build, mock two-device add/edit/profile/group/delete.
- Initial UI run đã gọi Gemini thật hai lần với từ mẫu nut vì glob chặn mạng không bao phủ URL; kết quả thay ví dụ fixture khiến assert fail. Đã đổi sang regex chặn mọi HTTPS và tắt key ở fixture; Gemini test riêng chỉ dùng key giả/response giả. Rerun6PASS. Không dùng dữ liệu tài khoản founder. Không coi lần gọi này là benchmark chất lượng/IPA.
- Lỗi test khác: filter là radio, không button; mobile phải chờ approve điều hướng xong trước goto. Đã sửa locator/wait và rerun.
- Visual inspection: [mobile detail](simple-lessons-2026-10-12/mobile-detail.png), [desktop detail](simple-lessons-2026-10-12/desktop-detail.png), không popup/overflow.

## Hosted thực tế

`node scripts/apply-realtime.mjs --apply` đã apply đúng `supabase/migrations/202610110007_realtime.sql` qua Management API. PASS preference RPC/notification trigger verified, PostgREST reload. SUPABASE_ACCESS_TOKEN chỉ `.env.local`; không env Vercel. Checkpoints chờ founder chạy SQL cũ đã supersede.

`node scripts/verify-hosted-sync.mjs`: hai isolated headless contexts với cùng disposable Supabase user, auth cookie riêng. Hosted automatic add2368ms/edit/profile/group add/group delete/word delete và delete test account PASS. Phiên đầu đợi profile account ready để chẩn đoán race; code đã sửa profile readiness, lượt cuối kiểm không đợi text này. Chỉ data thử, không đọc/ghi lesson founder; cleanup đúng ID vừa tạo. Password session kiểm cloud ownership, không chứng minh Google OAuth redirect hay iPhone hardware.

POST hosted `/api/media/search` thật cho SISTER/BROTHER:200/5candidates mỗi từ. `/api/media/import` mỗi từ:200, JPEG87633/53660bytes, receipt true. Không lưu vào tài khoản founder. Gemini image Google grounding không phải Free Tier theo [Google pricing](https://ai.google.dev/gemini-api/docs/pricing); hiện dùng Commons có attribution/license thay vì bật dịch vụ trả phí.

Deploy cuối: https://words-for-kids-8chnjsqiq-trudyan141s-projects.vercel.app; alias https://words-for-kids.vercel.app. Inspect https://vercel.com/trudyan141s-projects/words-for-kids/C574Tv2XLKCvGvBzLiP5PZaaVqPe. Deploy cuối READY/aliased thành công. Hosted verification sau deploy PASS: automatic add2162ms/edit/profile/group add/group delete/word delete/cleanup. Lượt cuối bỏ readiness text wait: fill/click ngay khi input enabled, profile POST200 và phiên kia nhận đúng. Hai ca route sentence/grammar chạy bổ sung mobile/desktop PASS; kiểm3tab không overflow. Screenshots tabs ở simple-lessons-2026-10-12/mobile-tabs.png và desktop-tabs.png. Docs check PASS621local links; git diff --check PASS.
