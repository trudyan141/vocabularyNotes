# API và vận hành

## Quyết định hiện hành 10/10/2026 — ADR-030

Founder đã yêu cầu **Gemini thay OpenAI** trong BYOK, ưu tiên model free tier và đổi nhiều model. Browser gọi trực tiếp Google streamGenerateContent?alt=sse bằng header x-goog-api-key, ảnh inline JPEG, systemInstruction coi ảnh là data, structured responseMimeType + responseJsonSchema; parse STOP/non-thought/strict DTO/evidence, max50/90s/500KB/cancel/no retry/Web Locks. Không key/ảnh đi qua app server, không key trong URL/IDB/backup/sync/env. Session mặc định/localStorage opt-in/delete giữ theo ADR029. Cấu hình cũ OpenAI bỏ qua, không gửi key cũ sang Google. Bốn model3.5FlashLite(default)/3.1FlashLite/3.6Flash/3.8Flash và custom Gemini ID; không tự fallback model hoặc bật billing. AI_PROVIDER server vẫn none (gateway planned).

Google pricing/model/API docs kiểm10/10 xác nhận free tier có quota cho bốn lựa chọn; project paid có thể tính phí. Current API terms vẫn hạn chế under18-directed/likely-access clients; latest user request xác nhận code/config Gemini, không thành xác nhận Google eligibility. T00 account/retention/live benchmark còn pending, free tier dữ liệu có thể dùng cải thiện sản phẩm. CORS OPTIONS thật200, chưa key/inference/quality/quota thật. Không mang store:false/ZDR OpenAI sang Gemini.

Datamuse350ms/Wiktionary bilingual gloss/POS/IPA/Tatoeba sourced examples tự điền; catalog21→174licensed OpenMoji, parent sense/image review, thiếu dữ liệu báo rõ. Live handsom→handsome/đẹp trai đã kiểm. Native Vercel Git pushmain đã deploy READY app; Supabase optional/live pending. [Setup](../SETUP-PROJECT.md), [evidence](evaluations/parent-dictionary-byok-deploy.md). OCR/key/provider/OpenAI gateway mô tả cũ bên dưới là lịch sử/roadmap nếu xung đột ADR030.

## Runtime và setup hiện hành — 10/10/2026

[Setup](../SETUP-PROJECT.md) là hướng dẫn env/install/run/Google/Supabase/Vercel; config repo đã chuẩn bị, chưa deploy. Runtime paths hiện `/api/auth/*`, `/api/cloud/{library,sync,sources,account}`, `/api/media/{search,import}`; bảng `/api/v1` dưới là contract đích, không claim tất cả endpoint đã có. Sources nhận JPEG≤3MB, consent/ownership/idempotent bytes ID, private no-store proxy, strip metadata; account DELETE recent sign-in≤10min +phrase/freeze/cleanup/cascade/retry. Media shared quota0006 thật local; AI quota/ledger/TTL/guest capability T05 chưa có runtime do T00 dependency. Cloud/Commons network fixtures khác hosted integration. Per-field sense merge trở lại pending, notes keep-both không đổi immutable review history. [Milestone](evaluations/completion-local.md).


## Endpoint lookup cũ — trước ADR-029 (giữ lịch sử)

`GET /api/dictionary?word=...`: parent click explicit; autocomplete local không gửi từng keystroke. Validate English query, fixed dictionaryapi.dev host, redirect rejected, process concurrency2, timeout5s, response≤500KB, bounded20definitions. Returned meanings/IPA chưa parent/source verified; VI phụ huynh bổ sung. Lỗi giữ input và fallback nhập tay/catalog. Endpoint không có AI key; limit process chưa là shared distributed quota T05, lookup provider live chưa xác minh ổn định. AI_PROVIDER=none.

`pnpm check` lint/types/unit/build; `pnpm test:e2e` production4320demo/4322guest; `pnpm test:sql` cần PostgreSQL15 binary, isolated temp Unixsocket54379, listen_addresses rỗng, trap cleanup không dùng DB sẵn có. Migrations schema/storage/canonical trongsupabase/migrations chưa deploy. Auth/Storage bootstrap fixture không kiểmGoogleOAuth/API. Local production`pnpm start --port4317`, health liveness không provider readiness. OCR/public original art precache licenses đi kèm; no provider photo upload. [Evidence](evaluations/local-end-to-end.md).


Media API P1 theo 14: `POST /media/search` nhận reviewed sense/query, trả metadata shortlist với license/credit và requestId; `POST /media/import` nhận candidate ID của adapter + parent authorization, validate nguồn/quyền/type rồi trả asset status; `GET /media/:requestId` khôi phục status TTL trong đúng principal. Không nhận arbitrary remote URL; không gửi worksheet hoặc query private sang search engine. Parent action phải kiểm server auth/capability, không dựa chỉ parent gate. Public catalog đọc được, library media private tách scope. P1 AI/provider chưa cấu hình trả lỗi có đường nhập tay, không tự bật provider trả phí.

## API contract P1

Tất cả endpoint trả `{requestId, data}` hoặc `{requestId, error:{code,message,retryable,fieldErrors}}`. Không trả stack trace/key/provider raw payload. DTO camelCase; SQL snake_case. API version `/api/v1`.

| Endpoint | Auth / input | Kết quả và ràng buộc |
|---|---|---|
| `POST /guest-session` | Same-origin + anti-abuse | Capability cookie HttpOnly/Secure/SameSite; metadata tối thiểu; không tạo cloud library |
| `POST /analysis` | Account session hoặc guest capability; multipart image, consentVersion, extractionMode; Idempotency-Key | 200 schema analysis; 202 nếu request cùng ID còn chạy, kèm poll URL; server validate payload hash |
| `GET /analysis/:requestId` | Cùng account hoặc guest capability đã tạo request | pending/completed/failed; kết quả TTL 15 phút; owner mismatch 404; hết TTL 410 |
| `POST /enrichment` | Như analysis; reviewed candidates ≤20, level, context text, key | Schema enrichment; không ghi library; giới hạn output |
| `GET /auth/callback` | OAuth PKCE/session flow | Chỉ redirect path allowlisted; auth success chưa merge guest |
| `POST /sync/push` | Authenticated; ops ≤100, scope, cursor | Applied receipts/mappings/conflicts, server sequence; transaction theo aggregate |
| `GET /sync/pull?cursor=...` | Authenticated; libraryId | Changes+tombstones+cursor; cursor cũ quá retention → full-reconcile required |
| `POST /transfers/preview` | Authenticated; guest snapshot summary và keys | Counts/conflicts/map proposal; giới hạn dữ liệu, không gửi ảnh gốc |
| `POST /transfers/:id/batches` | Authenticated, fixed target owner; batch ordinal/hash | Transaction batch + durable receipt; same key different hash → 409 |
| `POST /transfers/:id/verify` | Authenticated; expected counts/checksum | Verified map/outcome; không xóa guest source |
| `POST /media/upload-intent` | Authenticated và option giữ nguồn | Private path và upload capability scoped, size/type limit |
| `DELETE /library` / `DELETE /account` | Authenticated + explicit confirmation intent | Deletion job receipt; rows/assets/session cleanup, trạng thái có thể kiểm tra |

Các path bảng trên tương đối với `/api/v1`. Guest save/search/backup/flashcard/game dùng IndexedDB, không gọi cloud CRUD. Cloud sync endpoint áp dụng session user và RLS; không chấp nhận ownerId do browser gửi là nguồn quyền.

HTTP: 400 input/schema, 401 expired auth, 403 permission, 409 version/hash conflict, 413 file too large, 415 unsupported image, 422 unprocessable/refusal, 429 quota (Retry-After), 502 provider error, 504 timeout. Không biến các lỗi này thành `200 []`.

## Request idempotency và timeout

Server dùng private Postgres request ledger có atomic unique `(principal, operation, idempotencyKey)`, payloadHash, leaseUntil, status, resultRef, errorCode. Concurrent duplicate trả pending hoặc cached result, không tạo provider call mới. Lease timeout → đánh dấu outcome unknown nếu chưa xác định provider call đã hoàn thành; không tự retry mù để né trùng chi phí.

P1 request đầu thực hiện trong API handler với timeout ≤45 giây. Receipt status và transient encrypted result store dùng chung nhiều instance. Request đang chạy có thể poll; nếu instance chết, UI hiển thị interrupted/unknown và người dùng có thể retry bằng request mới với thông báo quota/cost policy. Không hứa exactly-once provider execution khi provider không hỗ trợ idempotency và mạng đứt.

Local draft lưu requestId và trạng thái; refresh lấy result còn TTL. Sau TTL, nội dung review đã nhận nằm local; request chưa nhận result có thể cần phân tích lại. Cancellation cố gắng abort upstream, không đảm bảo undo chi phí đã phát sinh.

## Quota và abuse control

Mặc định đề xuất cấu hình guest 5 ảnh/ngày/browser, authenticated 30 ảnh/ngày/account; đây là giới hạn sản phẩm thử nghiệm, không phải bảo đảm tài khoản dùng thật. Client quota chỉ để UX; server reserve/check atomic trước provider call, giới hạn AI concurrency 1/principal và 20 enriched items/request; search metadata 2, asset import 2/principal, thêm shared provider/project limiter và byte/spend cap theo 14. Đây là khởi điểm benchmark; không dùng Promise.all toàn thư viện hoặc nhiều key để vượt quota. Session cookie reset được nên cần rate limit IP hashed/rotating + global budget; challenge khi bất thường. Không cho guest upload thoải mái chỉ dựa vào UUID từ client.

Daily global AI spend cap và provider timeout/circuit breaker. Giá lấy từ official pricing khi triển khai; log usage tokens/images, model ID và provider cost estimate được version. Công thức dự toán `requests × cost per request + enriched items × cost per item + storage/egress + hosting`; đo p50/p95, không ghi một giá fixed chưa có benchmark.

## Retention đề xuất

| Dữ liệu | Guest | Account |
|---|---|---|
| Thư viện từ/câu/notes/reviews | IndexedDB trên máy | Postgres cloud + cache local theo scope |
| Ảnh gửi AI | Memory trong request; không log ảnh; không persist ở app server | Như guest, chỉ giữ cloud nguồn nếu bật option |
| Result phân tích/enrich tạm | Mã hóa, private, TTL 15 phút để khôi phục | Như guest |
| Request ledger metadata | TTL 24 giờ; không text/ảnh | TTL 24 giờ; usage aggregate có thể 30 ngày |
| Draft trên máy | Đến khi save/delete; nhắc dọn sau 7 ngày | Cùng quy tắc local |
| Tombstones sync | Không cloud | 90 ngày, sau đó bắt full reconcile thiết bị cũ |

Lựa chọn `Dùng trên máy` không gửi thư viện lên cloud; gửi ảnh AI có bước consent riêng. Xóa transient result được thực thi bằng TTL và job cleanup, test được. Provider retention là policy ngoài app phải xác minh, không suy từ TTL app.

## Cấu hình cần chuẩn bị tại T01/T05/T10

```dotenv
NEXT_PUBLIC_APP_URL=
APP_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
# Server only; chỉ dùng cho việc quản trị có checks nếu cần:
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
AI_PROVIDER=none
AI_VISION_MODEL=
AI_ENRICH_MODEL=
AI_CONCURRENCY_PER_PRINCIPAL=1
MEDIA_SEARCH_CONCURRENCY_PER_PRINCIPAL=2
MEDIA_IMPORT_CONCURRENCY_PER_PRINCIPAL=2
# Shared provider/model limiter values resolved from eligible provider quota at T00/T05:
AI_PROVIDER_RPM_LIMIT=
AI_PROVIDER_TPM_LIMIT=
MEDIA_PROVIDER_REQUEST_LIMIT=
GUEST_SESSION_SIGNING_SECRET=
TRANSIENT_RESULT_ENCRYPTION_KEY=
AI_GUEST_DAILY_LIMIT=5
AI_ACCOUNT_DAILY_LIMIT=30
AI_GLOBAL_DAILY_BUDGET=
```

Publishable key được public theo thiết kế Supabase; service-role/AI key tuyệt đối không `NEXT_PUBLIC_*`. Google client secret ở Supabase provider config, không browser. Secret thực không commit; `.env.example` không chứa giá trị secret. Không mặc định cấu hình Gemini trong child app: current terms không phù hợp; provider eligible mới được ADR chọn. BYOK hiện hành dùng bộ nhớ trình duyệt hoặc localStorage opt-in theo ADR-029, không gửi server/backup; secret store server là phương án gateway tương lai, guest không phải login để học local. Parent gate không thay server auth. Local mock không cần credential nhưng có nhãn `Dữ liệu demo`.

T01 đã có `.env.example`, schema Zod và module env `server-only`; errors chỉ ghi tên biến, không giá trị. `APP_DEMO_MODE` chỉ nhận true/false; false bỏ fixture ở runtime, không bật tính năng chưa triển khai. Chỉ nhận `AI_PROVIDER=none` đến khi T00/T05 xác minh provider. Các giới hạn concurrency/quota được parse ở đây, chưa là shared limiter chạy thật. `/api/health` là liveness probe scaffold trả envelope requestId/data và no-store, không là endpoint thư viện hoặc integration readiness. Endpoints `/api/v1` ở bảng vẫn chưa triển khai.

## PWA cache và session

Cache shell/static assets theo build ID; IndexedDB chứa content. Service worker dùng network-only cho API/auth/signed URLs; không cache HTML chứa dữ liệu riêng user. Private blobs được quản lý có scope, không shared CacheStorage key chỉ theo URL. Logout xóa cloud cache scope theo lựa chọn đã giải thích; guest data riêng không bị xóa. Update SW nhắc reload nếu phiên học/draft đang mở, không force reload giữa save.

## Observability và release

Log requestId, operation, stage, latency, status, usage, scope type; không ghi ảnh/evidence/definition/answer/names. Errors có redaction và sampling. Nếu thêm analytics, không tự gửi content hoặc account email; tuân theo lựa chọn người dùng.

P1 local/dev → staging HTTPS → pilot → public. Kiểm camera trên điện thoại thật, Google authorized origins/redirect URIs, RLS bằng 2 tài khoản, storage private, migrations/backup/rollback và cost cap. Deploy provider chưa được chốt, không provision tài khoản hoặc publish trong lượt planning. Rollback app không rollback destructive DB migration mù; migration expand/contract và backup trước thay đổi lớn.

## Streaming BYOK — ADR-032

Theo yêu cầu founder10/10/2026, SSE nhận từng chunk non-thought, ghép JSON có giới hạn500KB, UTF-8 streaming/CRLF. UI hiện preparing→waiting→receiving→validating, thanh indeterminate (không giả %/ETA), elapsed giây/nút Dừng/timeout90s. Chữ hoàn chỉnh và từ có đủ schema/evidence hiện dần dưới nhãn bản tạm; không persist hoặc cho lưu trước final STOP + strict whole-result schema/evidence. Error/abort/key-change xóa active progress; nháp cũ còn nguyên. Không retry/fallback/model đổi tự động.

Nguồn: [Google streamGenerateContent](https://ai.google.dev/api/generate-content), [structured-output streaming](https://ai.google.dev/gemini-api/docs/structured-output). Streaming chỉ phản ánh dữ liệu thực nhận, không khẳng định ảnh OCR đúng hay được phép dùng provider cho child app.

### Lỗi Google cụ thể — ADR-033

Không chỉ map HTTP400 thành cấu hình: UI giữ HTTP/status/model, message/reason/fieldViolations đã redact key/token/largeblob/projectnumber, bounded/plain-text. Không full provider body/metadata/log/store. FAILED_PRECONDITION có hướng kiểm project/free-tier/region riêng; non-JSON error vẫn giữ HTTP. Nguồn [Google troubleshooting](https://ai.google.dev/gemini-api/docs/troubleshooting).

Theo live400 trên founder tab, request dùng JSON fields tương thích GenerateContent: responseMimeType=application/json + responseJsonSchema; provider schema bỏ pattern/minLength/maxLength, local validation giữ nguyên nghiêm ngặt. Không tự retry hay đổi model. Cài đặt có Kiểm tra key/model bằng một metadata GET/15s/no image/no inference, xác nhận model hỗ trợ generateContent; không khẳng định quota/vision thành công chỉ từ GET.
