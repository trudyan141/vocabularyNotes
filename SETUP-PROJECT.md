# Cài và cấu hình Words for Kids

Cập nhật 10/10/2026. App chạy được **không cần Supabase hoặc API key** để thêm từ, tra từ điển, học và lưu bài trên trình duyệt. Muốn AI đọc ảnh thì thêm key trong app ở mục 3. Muốn đăng nhập Google/đồng bộ thì làm thêm mục 4–5.

## 1. Chạy trên máy

Cần Node **24.14.1** và pnpm **11.25.0**. Mở Terminal ngay trong thư mục repo. Nếu đã cài nvm:

```sh
nvm install
nvm use
npx --yes pnpm@11.25.0 install --frozen-lockfile
cp .env.example .env.local
npx --yes pnpm@11.25.0 dev --port 4317
```

Nếu đã có `.env.local`, giữ file đó và sửa các dòng cần thiết; không chạy `cp` đè lên. Nếu chưa có nvm, cài [Node 24](https://nodejs.org/en/download) rồi chạy từ dòng `npx`.

Mở [http://127.0.0.1:4317/today](http://127.0.0.1:4317/today). Dùng cùng địa chỉ mỗi lần: `localhost` và `127.0.0.1` có thư viện khác nhau. Dữ liệu bài học nằm trong IndexedDB của trình duyệt. Xuất backup trước khi xóa dữ liệu trang.

`.env.local` tối thiểu — copy nguyên ba dòng này:

```dotenv
NEXT_PUBLIC_APP_URL=http://127.0.0.1:4317
APP_DEMO_MODE=false
AI_PROVIDER=none
```

- `NEXT_PUBLIC_APP_URL`: địa chỉ app, **tự điền**, không lấy API key ở đâu. Không thêm `/today` hoặc dấu `/` cuối. Local dùng giá trị trên; Vercel dùng domain HTTPS của app.
- `APP_DEMO_MODE`: `false` mở thư viện riêng trống; `true` mở bài mẫu riêng để thử. Cài đặt cho chuyển qua lại và giữ dữ liệu hai bên.
- `AI_PROVIDER`: giữ `none`. Đây là gateway của **server**, chưa bật. AI riêng của bố mẹ hoạt động trực tiếp từ trình duyệt ở mục 3, độc lập biến này.

Sau khi sửa env phải dừng server (`Ctrl+C`) rồi chạy lại. Production local: `pnpm build`, rồi `pnpm start --port 4317`.

## 2. Vercel tự deploy

Project **words-for-kids** đã được tạo trong team `trudyan141s-projects` và nối với [repo GitHub](https://github.com/trudyan141/vocabularyNotes). Push nhánh `main` sẽ tạo production deployment; branch/PR tạo preview. [Mở dashboard project](https://vercel.com/trudyan141s-projects/words-for-kids).

Vào **Settings → Environment Variables**, chọn Production, thêm từng dòng nếu chưa có:

| Name | Value | Lấy ở đâu |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://words-for-kids.vercel.app` | Domain ở Vercel → Settings → Domains. Nếu alias thực tế khác, dùng đúng alias đó. |
| `APP_DEMO_MODE` | `false` | Gõ trực tiếp; muốn bài mẫu ở preview thì dùng `true`. |
| `AI_PROVIDER` | `none` | Gõ trực tiếp; key AI phụ huynh không điền vào Vercel. |

Ba giá trị production trên đã được thêm. Không cần secret Vercel/GitHub Actions để native Git deployment chạy. `vercel.json` có framework Next.js, Node 24.x theo `package.json`, lệnh pnpm cố định và region Singapore. Build Next có API/auth, không static export.

Khi thay env, chọn deployment → **Redeploy** để build dùng giá trị mới. Vercel không tự chạy migration Supabase. Lần đầu muốn tạo project khác: Vercel → Add New → Project → Import repo → root `.` → Next.js → Node 24.x → nhập ba dòng → Deploy. Hướng dẫn chính thức: [Git integration](https://vercel.com/docs/git), [environment variables](https://vercel.com/docs/environment-variables).

## 3. AI phân tích ảnh bằng key riêng của bố mẹ

Không còn OCR/Tesseract chạy trên điện thoại. AI cần mạng; khi offline vẫn thêm/sửa từ và học dữ liệu đã lưu.

1. Mở [OpenAI Platform → API keys](https://platform.openai.com/api-keys). Dùng tài khoản API của bố mẹ, chọn project, **Create new secret key**, copy key bắt đầu `sk-`. Không dùng Google key hoặc key ChatGPT. API tính phí riêng; kiểm **Billing** và **Usage** của project. Gói ChatGPT không tự cấp quota API.
2. Trong Words for Kids: **Phụ huynh → Cài đặt → AI riêng của phụ huynh**. Dán vào **OpenAI API key**. **Model đọc ảnh** mặc định `gpt-4.1-mini`; có thể đổi sang model vision được tài khoản cho phép.
3. Nếu muốn nhớ qua lần mở sau, chọn **Nhớ key trên trình duyệt này (localStorage)** rồi **Lưu cấu hình AI**. Nếu không chọn, key chỉ nằm trong phiên trang đang mở; reload cần nhập lại. Key không ghi vào IndexedDB, bài học, backup, cloud sync, env hay server app. localStorage không mã hóa; người dùng chung trình duyệt hoặc mã chạy trên trang có thể đọc key. Nút **Xóa key khỏi máy này** xóa cả key lưu và key trong phiên.
4. **Thêm bài → Chọn/chụp ảnh → Cắt/xoay**. Cắt bỏ tên, khuôn mặt và thông tin riêng của trẻ. Bấm **Phân tích ảnh bằng AI** để mở màn phân tích.
5. Chọn **Cách tách từ**: từ/cụm được liệt kê/nhấn mạnh hoặc tất cả từ trong đoạn. Xác nhận ảnh chỉ có nội dung học và đồng ý gửi OpenAI; sau đó bấm **Phân tích ảnh bằng AI**. Không gửi khi chỉ mở nháp hoặc tick checkbox.
6. Bố mẹ sửa chữ nếu AI đọc sai, kiểm nghĩa/ví dụ, chọn từ cần lưu, tick **Tôi đã kiểm…** rồi **Duyệt và lưu các từ đã chọn**. Chữ trích từ ảnh được lưu làm bằng chứng; nghĩa/ví dụ AI bổ sung có nhãn nguồn riêng. Mỗi lượt tối đa 50 từ, timeout 90 giây, không tự retry. **Dừng** giữ nháp; hủy không đảm bảo hoàn lại phí provider.

Ảnh đã xử lý gửi **trực tiếp từ trình duyệt → `api.openai.com`** bằng Authorization header; không proxy qua app. Request có `store:false`; điều này **không đồng nghĩa Zero Data Retention**. Nếu cần xử lý dữ liệu riêng của trẻ dưới 13 tuổi, phải thiết lập ZDR được OpenAI chấp thuận trước; luồng hiện tại yêu cầu ảnh chỉ có nội dung học đã cắt thông tin riêng. [OpenAI under-18 guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance), [data controls](https://developers.openai.com/api/docs/guides/your-data). Gemini không được tích hợp trong child app này.

API key thật/live AI accuracy chưa được thử; tests dùng response fixture có nhãn, không gọi API trả phí. CORS của endpoint đã kiểm bằng OPTIONS thật. Thiếu key/billing/quyền model báo ngay trong luồng và giữ nháp.

## 4. Google và đồng bộ cloud — chỉ làm nếu cần

Bỏ qua toàn bộ mục này nếu chỉ học/lưu trên thiết bị. Cloud không bắt buộc để tra từ điển hay dùng AI riêng.

1. Mở [Supabase Dashboard](https://supabase.com/dashboard) → **New project**. Đặt tên Words for Kids, tạo database password riêng và lưu trong password manager; chọn Singapore nếu có. Chờ project Ready.
2. Trong project → **Connect** hoặc **Settings → Data API**, copy **Project URL** dạng `https://PROJECT_REF.supabase.co`.
3. **Settings → API Keys** → copy **Publishable key** dạng `sb_publishable_...`. Đây không phải database password hoặc Google Client ID.
4. **API Keys → Secret keys → Create secret key**, tạo key chỉ server dạng `sb_secret_...`. Key này phục vụ xóa account/dọn storage. Nếu project cũ chỉ có Legacy API keys, dùng `service_role` thay thế; không cần cả hai.
5. Dán vào `.env.local` khi chạy local, hoặc **Vercel → Settings → Environment Variables → Production** khi dùng hosted. Không dán secret key vào khu API key của phụ huynh.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_THAY_BANG_KEY_THAT
SUPABASE_SECRET_KEY=sb_secret_THAY_BANG_KEY_THAT
```

Các đoạn `THAY_BANG_KEY_THAT` là placeholder, phải thay bằng key project của bạn. Secret key không được thêm prefix `NEXT_PUBLIC_`; không commit `.env.local`. Để `SUPABASE_SERVICE_ROLE_KEY` trống nếu đã dùng secret mới.

6. **SQL Editor → New query**: chạy lần lượt nội dung các file trong `supabase/migrations/`, từ **0001 tới 0006**. Không chạy `tests/sql/bootstrap.sql`; nó chỉ dành cho tests. Không tắt RLS.
7. Sau migration, kiểm Table Editor có `libraries`, `lessons`, `entry_senses`; Storage có bucket **private** `learning-sources`. Chưa có hàng dữ liệu trước lần đồng bộ đầu là bình thường.

Nếu quản lý migration bằng CLI thay SQL Editor, repo đã có config; dùng `npx supabase login`, `npx supabase link --project-ref PROJECT_REF`, `npx supabase db push --dry-run`, rồi `npx supabase db push`. Ref nằm trong URL Dashboard `/project/PROJECT_REF`; CLI sẽ hỏi database password. Không chạy lại trên database đã migrate bằng SQL Editor khi chưa reconcile history. [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys), [migrations](https://supabase.com/docs/guides/deployment/database-migrations).

## 5. Bật đăng nhập Google

1. Mở [Google Cloud Console](https://console.cloud.google.com/) → tạo/chọn project → **Google Auth Platform**.
2. **Branding**: Words for Kids + email hỗ trợ. **Audience**: External; nếu Testing, thêm Gmail của bố mẹ vào **Test users**. Scopes: `openid`, email, profile.
3. **Clients → Create client → Web application**. Authorized JavaScript origins: domain app, ví dụ `https://words-for-kids.vercel.app`.
4. Authorized redirect URI trong **Google**: `https://PROJECT_REF.supabase.co/auth/v1/callback`. Copy đúng từ Supabase Google provider; đây là callback Supabase.
5. Copy **Client ID** và **Client Secret** của Google → **Supabase → Authentication → Sign In / Providers → Google** → Enable → dán hai giá trị → Save. Hai giá trị này **không** đưa vào env Next hoặc Vercel.
6. **Supabase → Authentication → URL Configuration**: Site URL = domain app. Redirect URLs thêm `https://words-for-kids.vercel.app/auth/callback` và `http://127.0.0.1:4317/auth/callback` nếu test local. Đây là callback app, khác bước 4. Google có thể yêu cầu `localhost` khi test local; nếu đổi, đổi cả URL mở app, APP_URL và allowlists cho đồng nhất.
7. Restart local hoặc Redeploy Vercel; mở **Tài khoản phụ huynh → Google**. Mở thư viện cloud để dùng cloud; muốn chuyển guest thì xem trước, tải backup và xác nhận. Guest gốc vẫn giữ. Ảnh worksheet chỉ tải lên storage nếu chọn riêng và đồng ý.

`redirect_uri_mismatch`: kiểm riêng hai callback ở bước 4/6. `access_denied`: kiểm Test users. Hosted Google/Supabase chưa nghiệm thu vì chưa có project cloud. [Hướng dẫn Google của Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google).

## 6. Từ điển và hình minh họa

Gõ từng chữ trong **Thêm từ cho con**: app chờ 350 ms rồi gửi phần từ đang gõ để lấy gợi ý chính tả Datamuse, hỗ trợ gõ thiếu/sai. Chọn từ → tải nghĩa Anh–Việt theo đúng translation gloss/POS của Wiktionary, IPA, ví dụ song ngữ Wiktionary/Tatoeba; hình được ghép từ catalog và 174 vector OpenMoji có license. `handsom` → `handsome` tự điền “đẹp trai”. Không cần API key. Nghĩa khác/POS khác giữ riêng để bố mẹ chọn; ví dụ từ kho câu cần kiểm có đúng nghĩa. Nếu nguồn thiếu tiếng Việt/ví dụ/hình, app báo rõ và cho sửa/chọn hình; không giả vờ mọi từ đều có dữ liệu đầy đủ. Các ô câu thứ hai/cách đọc câu là tùy chọn, mở khi cần.

Hình catalog/OpenMoji lưu cùng từ sau phụ huynh duyệt; có credit CC BY-SA 4.0. Không tải hình Internet mỗi lần gõ. Tìm thêm hình Commons có license ở **Sửa từ** là tùy chọn cần Google/cloud + migration 0006:

```dotenv
MEDIA_COMMONS_ENABLED=true
MEDIA_IMPORT_SIGNING_SECRET=THAY_BANG_CHUOI_NGAU_NHIEN_IT_NHAT_32_KY_TU
```

Tạo chuỗi bằng lệnh `node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))"`; copy output vào env local/Vercel, không commit. Giữ cùng secret giữa các lần deploy. Đây là secret ký nội bộ, Commons không cần API key. Quota shared DB đã có; không tăng bằng nhiều key. Ba biến `MEDIA_SEARCH_CONCURRENCY_PER_PRINCIPAL=2`, `MEDIA_IMPORT_CONCURRENCY_PER_PRINCIPAL=2`, `MEDIA_PROVIDER_REQUEST_LIMIT` không cần thêm nếu dùng mặc định.

Nguồn: [Datamuse](https://www.datamuse.com/api/), [Wiktionary](https://en.wiktionary.org/), [Tatoeba API](https://api.tatoeba.org/), [OpenMoji/license](https://github.com/hfg-gmuend/openmoji). Datamuse đã thông báo yêu cầu key từ 2027; bản hiện tại dùng API không key theo chính sách 10/10/2026.

## 7. Kiểm và xử lý lỗi

```sh
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:sql
pnpm docs:check
```

`check` chạy lint, typecheck, unit/integration và build. E2E dùng production servers tạm 4320/4322/4328 và fixture identity; không gọi Google/OpenAI thật. SQL tests cần PostgreSQL 15+ (`initdb`, `pg_ctl`, `psql`); Mac có thể dùng Homebrew postgresql@15. Nếu khác path: `TASK_PG_BIN=/duong-dan/postgresql/bin pnpm test:sql`.

| Lỗi | Làm gì |
|---|---|
| Không chạy app | Node 24/pnpm 11.25.0, install frozen, kiểm port 4317 |
| Nhập key AI rồi vẫn lỗi | Key OpenAI API, Billing/Usage, quyền model; key ChatGPT/Google không dùng được |
| AI 401/429 | 401: sửa/đổi key. 429: kiểm billing/quota, đợi rồi thử lại; app không tự gọi lặp |
| Từ điển tạm lỗi | Giữ phần nhập, thử lại; gợi ý catalog dùng offline |
| Thư viện mất sau đổi URL | Mở đúng origin/profile/scope cũ; đừng xóa dữ liệu trước backup |
| Google chưa cấu hình | Kiểm URL + publishable key, provider bật, hai callback; rebuild |
| Commons chưa cấu hình | Flag + signing secret + Google + migration 0006 |
| Offline không phân tích ảnh | AI cần mạng; học/thêm/sửa từ đã lưu vẫn dùng được |
| Bản app cũ sau update | Đóng tab cũ, mở lại online để service worker cập nhật |

[Plan founder](docs/KE-HOACH-FOUNDER.md) và [evidence](docs/evaluations/parent-dictionary-byok-deploy.md) ghi phần đã kiểm và phần còn cần API key/điện thoại/người dùng thật.
