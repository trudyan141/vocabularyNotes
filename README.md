# Words for Kids

Web/PWA học tiếng Anh cho trẻ 5–8 tuổi, phụ huynh chuẩn bị và duyệt bài. Có nhập tay/autocomplete/tra từ, chụp ảnh/AI với key riêng, nghĩa song ngữ, IPA/gợi ý đọc, ví dụ, ghi chú, bộ thẻ/SRS, bốn game, backup và offline. Google/cloud/tìm hình có license là lựa chọn cấu hình riêng; AI đọc ảnh gọi trực tiếp OpenAI bằng key phụ huynh; key không qua app server.

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
- [Evidence local](docs/evaluations/completion-local.md), [cloud local](docs/evaluations/cloud-local.md): phân biệt API/SQL thật với identity/network fixture và phần live chưa kiểm.
- [Docs](docs/README.md), [AGENTS.md](AGENTS.md), [START-HERE](docs/ai/START-HERE.md): đặc tả, ledger và cách tiếp tục.

```sh
pnpm check
pnpm test:e2e
pnpm test:sql
pnpm docs:check
```

SQL/E2E cloud cần PostgreSQL; chi tiết setup ở hướng dẫn. `vercel.json`, env example, Supabase config/migrations và GitHub CI đã chuẩn bị; chưa deploy hoặc chạy GitHub CI. Camera/voice/PWA thiết bị thật, provider/Google/Supabase hosted và human pilot vẫn cần nghiệm thu.
