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

Ba giá trị production trên đã được thêm. Push `main` đã tạo deployment production READY tự động, gồm bản Gemini `f460e1f`; [mở app](https://words-for-kids.vercel.app). Không cần secret Vercel/GitHub Actions để native Git deployment chạy. `vercel.json` có framework Next.js, Node 24.x theo `package.json`, lệnh pnpm cố định và region Singapore. Build Next có API/auth, không static export.

Khi thay env, chọn deployment → **Redeploy** để build dùng giá trị mới. Vercel không tự chạy migration Supabase. Lần đầu muốn tạo project khác: Vercel → Add New → Project → Import repo → root `.` → Next.js → Node 24.x → nhập ba dòng → Deploy. Hướng dẫn chính thức: [Git integration](https://vercel.com/docs/git), [environment variables](https://vercel.com/docs/environment-variables).

## 3. AI phân tích ảnh bằng Gemini key riêng của bố mẹ

Không còn OCR/Tesseract chạy trên điện thoại. AI cần mạng; offline vẫn thêm/sửa từ và học bài đã lưu. Theo yêu cầu mới nhất, Gemini thay OpenAI hoàn toàn trong cấu hình và API đọc ảnh.

1. Mở [Google AI Studio → API keys](https://aistudio.google.com/api-keys), đăng nhập tài khoản của bố mẹ. Chọn **Create API key**, chọn/tạo project, copy key. Nếu chưa thấy project: **Dashboard → Projects → Import projects**, chọn project rồi quay lại **API keys**. Key mới ở AI Studio là authorization key; app nhận cả key standard và auth từ Google, không bắt buộc mọi key có cùng prefix. Không dùng key OpenAI.
2. Trong **Projects/API keys**, kiểm project ở **Free Tier**. Không bật billing nếu muốn chỉ dùng quota miễn phí. Nếu project đã nối billing, cùng model có thể tính phí; app không thể kiểm billing từ chuỗi key. Xem **Usage/Rate limits** khi hết quota. Free tier có hạn mức theo project, không miễn phí vô hạn và không nhân quota bằng nhiều key.
3. Trong Words for Kids: **Phụ huynh → Cài đặt → AI riêng của phụ huynh**. Dán vào **Gemini API key**. Chọn **Model đọc ảnh**; mặc định **Gemini 3.5 Flash-Lite** (`gemini-3.5-flash-lite`).

| Lựa chọn | Model ID | Dùng khi nào |
|---|---|---|
| Gemini 3.5 Flash-Lite — mặc định | `gemini-3.5-flash-lite` | Đọc worksheet, ưu tiên nhanh và quota miễn phí |
| Gemini 3.1 Flash-Lite | `gemini-3.1-flash-lite` | Lựa chọn Flash-Lite khác khi project cấp quyền |
| Gemini 3.6 Flash | `gemini-3.6-flash` | So chất lượng nếu project có quota |
| Gemini 3.8 Flash | `gemini-3.8-flash` | Model Flash mới hơn khi cần |
| Nhập model Gemini khác | Model ID bắt đầu `gemini-` trong AI Studio | Phải hỗ trợ ảnh + structured output; quota/pricing tự kiểm |

Bốn model chuẩn có free tier theo [bảng giá Google kiểm ngày 10/10/2026](https://ai.google.dev/gemini-api/docs/pricing). Đây là free tier của **API project**, khác quyền model trong ứng dụng Gemini hoặc Google AI subscription. App gọi đúng model đã chọn, không tự chuyển model khi quota/404 và không tự bật billing.

4. Chọn **Nhớ key trên trình duyệt này (localStorage)** nếu muốn dùng qua lần mở sau; rồi **Lưu cấu hình AI**. Nếu không chọn, key chỉ ở phiên trang đang mở. Không ghi vào IndexedDB, bài học, backup, cloud sync, env hoặc server app. localStorage không mã hóa; người dùng chung trình duyệt hoặc mã chạy trên trang có thể đọc key. **Xóa key khỏi máy này** xóa cả phiên và localStorage. Key OpenAI cũ được bỏ qua, không tự gửi sang Google; lưu Gemini sẽ thay cấu hình cũ.
5. **Thêm bài → Chọn/chụp ảnh → Cắt/xoay**. Cắt bỏ tên, khuôn mặt và thông tin riêng của trẻ. **Phân tích ảnh bằng AI** mở màn nhận dạng.
6. Chọn **Cách tách từ** (listed/all), xác nhận ảnh chỉ có nội dung học và đồng ý gửi Google; bấm **Phân tích ảnh bằng AI**. Không gửi khi chỉ mở nháp hoặc tick checkbox. Ảnh gửi trực tiếp browser → `generativelanguage.googleapis.com`, key trong header `x-goog-api-key`, không ở URL hoặc proxy server.
7. Kiểm/sửa chữ, nghĩa và ví dụ; chọn từ cần lưu; tick **Tôi đã kiểm…** và **Duyệt và lưu các từ đã chọn**. Evidence từ ảnh tách khỏi nghĩa/ví dụ AI bổ sung. Tối đa 50 từ, timeout90s; **Dừng** giữ nháp, không tự retry. Quota429/không có model404 có hướng sửa ngay tại màn này.

**Điều kiện và dữ liệu:** [Gemini API terms](https://ai.google.dev/gemini-api/terms) hiện hạn chế API Clients hướng tới hoặc có thể được người dưới18 truy cập; key phụ huynh không miễn điều kiện đó. Code Gemini được thêm theo yêu cầu trực tiếp của founder; chưa phải xác nhận Google chấp thuận phát hành child app. T00 eligibility/account/live benchmark vẫn pending. Free tier có thể dùng nội dung gửi và response để cải thiện sản phẩm; không gửi thông tin riêng. Không mang `store:false`/ZDR của OpenAI sang Gemini hoặc quảng cáo không lưu dữ liệu. [Hướng dẫn key](https://ai.google.dev/gemini-api/docs/api-key), [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

**Kiểm tra trước khi gửi ảnh:** bấm **Kiểm tra key và model (không gửi ảnh)** trong phần AI. App chỉ gọi metadata Google, không phân tích ảnh. Thành công xác nhận key/model được Google chấp nhận, không bảo đảm quota còn hay ảnh đọc được. Lỗi hiện HTTP/status/message/field đã ẩn key.

CORS OPTIONS thật200 cho originproduction, POST và `x-goog-api-key` đã kiểm. Chưa gọi inference bằng key thật hoặc dùng quota tài khoản; tests dùng fixture có nhãn, không claim accuracy/cost/free quota của project cụ thể.

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

`check` chạy lint, typecheck, unit/integration và build. E2E dùng production servers tạm 4320/4322/4328 và fixture identity; không gọi AI hoặc Google OAuth thật. SQL tests cần PostgreSQL 15+ (`initdb`, `pg_ctl`, `psql`); Mac có thể dùng Homebrew postgresql@15. Nếu khác path: `TASK_PG_BIN=/duong-dan/postgresql/bin pnpm test:sql`.

| Lỗi | Làm gì |
|---|---|
| Không chạy app | Node 24/pnpm 11.25.0, install frozen, kiểm port 4317 |
| Nhập key AI rồi vẫn lỗi | Key từ Google AI Studio, project/quota, model hỗ trợ ảnh; key OpenAI không dùng được |
| Google từ chối request | Xem **Chi tiết lỗi từ Google**: HTTP/status/model/message và field. 400 INVALID_ARGUMENT là request không hợp lệ, không tự kết luận key sai; FAILED_PRECONDITION: project/region/free tier. 401/key invalid: sửa key. 403: quyền hoặc giới hạn referrer. 404: model. 429: quota. Dùng nút kiểm tra key/model; app không retry/đổi model tự động |
| Từ điển tạm lỗi | Giữ phần nhập, thử lại; gợi ý catalog dùng offline |
| Thư viện mất sau đổi URL | Mở đúng origin/profile/scope cũ; đừng xóa dữ liệu trước backup |
| Google chưa cấu hình | Kiểm URL + publishable key, provider bật, hai callback; rebuild |
| Commons chưa cấu hình | Flag + signing secret + Google + migration 0006 |
| Offline không phân tích ảnh | AI cần mạng; học/thêm/sửa từ đã lưu vẫn dùng được |
| Bản app cũ sau update | Đóng tab cũ, mở lại online để service worker cập nhật |

[Plan founder](docs/KE-HOACH-FOUNDER.md) và [evidence](docs/evaluations/parent-dictionary-byok-deploy.md) ghi phần đã kiểm và phần còn cần API key/điện thoại/người dùng thật.
