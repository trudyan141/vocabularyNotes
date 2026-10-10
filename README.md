# Words for Kids

**Quyền hiện hành11/10 (ADR049):** các bước browser/GitHub/Vercel/environment/deploy bên dưới là hướng dẫn **founder thực hiện**. Agent không tự làm; cần founder cho phép hành động cụ thể trước, kể cả push main sẽ tự deploy. Quyền triển khai/browser cũ đã được rút lại. Kiểm thử dùng mức **Gọn** theo [quy tắc QA](docs/10-quality-and-acceptance.md): lint/typecheck + test liên quan, vài trạng thái UI mobile/desktop local; bộ lệnh full dành mốc lớn.

Người dùng tự thêm, sửa bài và học; nút **Cài đặt** mở trực tiếp. Không có hộp thoại vai trò bố mẹ. Gia đình tự quyết định ai chuẩn bị bài và ai chơi. Chọn tất cả trong nhóm/bộ thẻ lấy toàn bộ kết quả tìm kiếm ở mọi trang; vẫn cần bấm Lưu. Xem [quy tắc UI và kiểm thử](docs/evaluations/plain-language-and-select-all.md).

Web/PWA học tiếng Anh cho trẻ 5–8 tuổi, phụ huynh chuẩn bị và duyệt bài. Có nhập tay/autocomplete/tra từ, chụp ảnh/AI với key riêng, nghĩa song ngữ, IPA/gợi ý đọc, ví dụ, ghi chú, nhóm từ/câu theo chủ đề, bộ thẻ/SRS, bốn game, backup và offline. Google/cloud/tìm hình có license là lựa chọn cấu hình riêng; AI đọc ảnh gọi trực tiếp Google Gemini bằng key phụ huynh; key không qua app server.

Trong app, mở **Thư viện → Nhóm học → Tạo nhóm** để gom từ và câu đã duyệt. Chọn từng mục, một bài hoặc cả ngày; khi lưu, app tự bỏ mục trùng và báo số lượng. Danh sách có tìm kiếm và phân trang 12 mục, giữ lựa chọn giữa các trang. Nhóm có từ có thể mở vào học trực tiếp. [Giao diện và kiểm chứng](docs/evaluations/groups-and-lesson-ui.md).

## Chạy nhanh

Node 24.14.1 và pnpm 11.25.0:

```sh
nvm use
npx --yes pnpm@11.25.0 install --frozen-lockfile
cp .env.example .env.local
npx --yes pnpm@11.25.0 dev --port 4317
```

Mở [app local](http://127.0.0.1:4317/today). Không cần key để học local. Demo/guest/account tách thư viện; giữ cùng hostname trình duyệt.

- [SETUP-PROJECT.md](SETUP-PROJECT.md): giới thiệu, install/run, từng biến môi trường và nơi lấy, Supabase/Google, Vercel, tests và xử lý lỗi.
- [Plan founder và tiến độ](docs/KE-HOACH-FOUNDER.md): phạm vi, tình hình và phần chưa nghiệm thu.
- [Evidence hiện hành](docs/evaluations/parent-dictionary-byok-deploy.md), [cloud local](docs/evaluations/cloud-local.md): phân biệt API/SQL thật với identity/network fixture và phần live chưa kiểm.
- [Docs](docs/README.md), [AGENTS.md](AGENTS.md), [START-HERE](docs/ai/START-HERE.md): đặc tả, ledger và cách tiếp tục.

```sh
pnpm check
pnpm test:e2e
pnpm test:sql
pnpm docs:check
```

SQL/E2E cloud cần PostgreSQL; chi tiết setup ở hướng dẫn. `vercel.json`, env example, Supabase config/migrations và GitHub CI đã chuẩn bị; đã deploy tự động Vercel qua push main; CI remote ghi trong evidence. Camera/voice/PWA thiết bị thật, provider/Google/Supabase hosted và human pilot vẫn cần nghiệm thu.

[Mở app hosted](https://words-for-kids.vercel.app), [gắn Gemini key/chọn model](https://words-for-kids.vercel.app/settings#parent-ai).
