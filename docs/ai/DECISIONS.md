# Quyết định và giả định

## ADR-029 — Founder sửa setup, deploy, tra từ tự điền và BYOK trực tiếp

Status **confirmed by user; implemented**,10/10/2026. Founder trực tiếp yêu cầu setup rõ từng biến/nơi lấy, tự deploy Vercel, autocomplete từ điển thật có sửa chính tả và tự điền/hình. Sau đó yêu cầu bỏ OCR thiết bị, cho key AI riêng trong khu cha mẹ/localStorage và không qua cloud server. Yêu cầu này supersede phần key browser forbidden ở ADR015/019 và local OCR ADR026/028; không supersede bảo vệ quyền cloud, parent review hoặc Gemini restriction.

OpenAI Responses trực tiếp browser, default gpt-4.1-mini configurable, session key/localStorage opt-in/delete, không IndexedDB/archive/sync/log/server; consent mỗi lần reopen, crop thông tin riêng, store:false không ZDR, fixed endpoint/no tools/strict DTO/evidence consistency/timeout90s/cancel/no auto retry/Web Locks một tab. Account budget do provider quản lý, không claim shared global app limiter. API CORS OPTIONS thật; chưa inference thật/key/cost/quality benchmark. Server AI_PROVIDER vẫn none; gateway/quota/idempotency roadmap chưa triển khai.

Datamuse350ms suggestions + Wiktionary gloss/POS Vietnamese senses/IPA/native examples + Tatoeba sourced bilingual corpus suggestions; fallback EN-only rõ thiếu VI. Cancel/version guard/cache/in-flight cap4/bounded700KB/8s. Các nghĩa vẫn riêng; không tự sửa từ hoặc auto save. Catalog ưu tiên rồi174 OpenMoji17 SVG unmodified/CCBYSA4/author/source, safe IDs/no model HTML or image URL. Parent chọn/kiểm hình trước child ready; credit lưu source và reachable trong chi tiết/offline.

Vercel words-for-kids nối native Git repo/main, production env3 đã cấu hình, deploy được user trực tiếp cho phép trong lượt này. Setup viết lại đầy đủ local/AI BYOK/Supabase/Google/Vercel/troubleshooting. R01–03/R07–11/R24–25, T01/T05–07/T13–16; [evidence](../evaluations/parent-dictionary-byok-deploy.md). Milestones cũ không được dùng để khẳng định T00/live AI/cloud/phone/human đã đạt.

**Quyết định hiện hành:** ADR-014/015 bên dưới supersede ADR-001/008/013 về audience/visual và provider default. Tên mới Words for Kids, trẻ 5–8 trước; Theme C tạm chốt, không chờ approval theme nữa. Các đoạn cũ giữ nguyên lịch sử.

## ADR-001 — web/PWA và đối tượng

Status **confirmed** bởi người dùng 09/10/2026. Web/PWA trước; phục vụ mọi người học tiếng Anh muốn tìm lại từ đã học. Child-friendly là opt-in. Ảnh A4 từ trường là use case ban đầu, không giới hạn loại người dùng.

## ADR-002 — local-first và cloud theo Google account

Status **proposed implementation** cho yêu cầu confirmed. IndexedDB/Dexie giữ guest library; localStorage chỉ preferences. Cloud scope cũng đọc local và sync Supabase khi logged in. Google login và consent merge guest tách riêng. Lý do: trải nghiệm không đăng nhập đơn giản, reload/offline, không mất dữ liệu khi chuyển mode.

## ADR-003 — relational cloud và unique lexeme/senses

Status **proposed**. Supabase Postgres + Google Auth, private storage/RLS. Một canonical entry có nhiều senses/POS; normalize v1 có version; AI không quyết định unique key. Ưu tiên quan hệ và transaction hơn việc cùng hệ sinh thái Google. Firebase là alternative được cân nhắc, không dùng đồng thời.

## ADR-004 — provider API và review

Status **proposed, benchmark pending**. OpenAI Responses là ứng viên default qua adapter; model ID chưa chốt, cần T00. Gemini có nguồn skill chính thức để so nếu cần. Extraction và enrichment tách contract; user review trước save; không gửi full thư viện sang AI.

## ADR-005 — game/notes là phần P1

Status **scope preserved from user request**. P1 có G01–G04 và 3 notes templates. Các task phát triển tuần tự không có nghĩa bỏ nửa scope. Media curated theo sense; thiếu ảnh thì mode không đủ điều kiện thay vì quiz sai. Animation declarative/static fallback, không code AI tạo.

## ADR-006 — skills và durable context

Status **implemented for planning bundle, updated 09/10/2026**. 12 skill upstream pin commit, 3 skills riêng; `.agents/skills` làm nguồn duy nhất. Ledger trong `docs/ai/` là nơi trạng thái thực, tránh hooks planning tạo ledger cạnh tranh. Ban đầu không đổi global config; ngoại lệ user-requested InspoMCP được ghi ADR-010. Không lifecycle hooks. Các skill không mở rộng quyền tự động.

## ADR-007 — simple SRS v1

Status **proposed**. Rating reducer versioned trong 08; game attempts không tự tạo review rating. Chọn thuật toán minh bạch dễ kiểm trước; FSRS cân nhắc P2. Không gọi số điểm game là chứng nhận thành thạo.

## ADR-008 — simple UX cho mọi người học

Status **user goal confirmed; interaction choices proposed**, 09/10/2026. User yêu cầu đẹp/dễ đến mức trẻ nhìn biết dùng, đủ skills UX/UI/motion/performance, có founder plan tiếng Việt một file. Chọn nav 3 mục, guest Bắt đầu, CTA theo state, advanced controls mở khi cần, child-friendly 2 rating trước mắt (Again/Good, chi tiết còn Hard/Easy). T18 prototype trước T02; QA25 ≥5 người lớn + ≥5 trẻ, ≥4/5 mỗi nhóm/từng task không trợ giúp. Spec 00/01/03/04/08/13 và founder; prototype/human test chưa làm.

## ADR-009 — performance phải đo

Status **proposed targets**, 09/10/2026. N09/QA26/27 có production baseline, resource budgets, device traces, field CWV p75 riêng lab. Skill installation không là evidence speed/UI. T02 baseline, T14 regression, T15 human pilot; chưa score/measured improvement. Spec 10/13, founder mục 10–11.

## ADR-010 — InspoMCP và reference design

Status **installation verified; design adoption proposed**, 09/10/2026. User trực tiếp yêu cầu install npx InspoMCP. Cài target Codex bản 0.1.16; HTTP installer fail do local CLI không nhận --url, chuyển stdio và pin args. Config backup, initialize/tools/list 15 tools verified. Đã gọi hosted read-only research và xem captures Headspace/Duolingo/Daybridge/Bear. Chỉ adopt những visual/CTA/content organization phù hợp, không copy brand hoặc claim source learning UX/performance verified. Không PWA runtime dependency; discovery phiên desktop sau reload và Antigravity chưa kiểm. Evidence design/inspo-research + inspo-references.json.

## ADR-011 — founder đọc một tài liệu

Status **implemented for planning**, 09/10/2026. KE-HOACH-FOUNDER.md tiếng Việt độc lập, có product/flows/screens/design/motion/performance/skills/roadmap/status. AI specs và docs/ai giữ chi tiết/ledger; cập nhật founder khi milestone hoặc quyết định thay đổi, không tạo nhiều bản tiến độ cạnh tranh. Chưa implementation.

## ADR-012 — graph đủ 16 màn và nhận xét một concept trước

Status **sequence confirmed by user; theme proposed**, 09/10/2026. Người dùng yêu cầu graph flow riêng từng màn, chi tiết màn hình trong một founder plan, và đúng một ảnh UI trước để nhận xét theme rồi mới sinh toàn bộ. Hoàn tất graph/spec S01–S16 trong mục 4 KE-HOACH-FOUNDER; tạo S03 có thư viện và 8 từ cần ôn bằng imagegen. Không thêm 16 menu, không tự gọi ảnh tĩnh là clickable prototype hoặc evidence usability/performance. Theme A chưa approved; manifest/prompt/image là context bàn giao, 15 ảnh chờ feedback. T18 in_progress, chưa done; T02 vẫn phụ thuộc acceptance clickable của T18.

Các quyết định interaction và rule IDs đã đối chiếu registry product-design:

- Nav 3 khu vực, capture/editor/learning dùng back/pause thay đổi tab âm thầm: `rule/navigation-vs-action`, `rule/preserve-user-input`.
- Primary CTA theo empty/populated/revealed state; controls nâng cao mở thêm: `rule/one-primary-action`, `rule/inline-before-modal`.
- Mỗi graph bao phủ trạng thái thiếu dữ liệu, hủy, lỗi và retry thích hợp; empty search khác thư viện rỗng: `rule/cover-reachable-states`, `rule/empty-state-action`, `rule/error-states-recovery`.
- Camera xin quyền khi người học chọn chụp và hiểu mục đích; denied có tải ảnh: `rule/permission-benefit-first`.
- Duyệt trước save, lỗi giữ nháp; local saved/cloud pending/cloud synced ghi đúng trạng thái: `rule/preserve-user-input`, `rule/success-state-specific`.
- Merge preview/account scope, không xóa guest tự động; thao tác xóa ở S16 xác nhận đúng phạm vi: `rule/destructive-proportional`, `rule/undo-only-when-honest`.

Đây là quyết định ở mức thiết kế/spec, chưa kiểm bằng thao tác thật trên app. Shape/spec theo product-design; mỹ thuật theo frontend-design; raster theo imagegen. Tài liệu ảnh dùng fixture liên tục: apple có từ trước, bài School objects mới, pencil mới/book đã có.

## ADR-013 — loại theme A và dựng S03 Theme B

Status **A rejected by founder; B proposed**, 09/10/2026. Founder trực tiếp nhận xét màu xanh dương xấu/tầm thường và UI chưa xứng với tham khảo Inspo/skills. Không tiếp tục nhân rộng A. Dựng mới một S03 bằng imagegen thay vì chỉ đổi màu A: giấy sáng, review vàng bơ, CTA tím mận, capture lilac riêng, lesson covers mint/peach hai cột, typography-led recent word, icon Luyện tập là flashcards. Palette/visual B chỉ là đề xuất, chưa approved.

Đọc lại DESIGN.md Headspace/Daybridge qua hosted InspoMCP live=false; xem Headspace mobile và Daybridge desktop captures bằng browser. Adapt friendly illustration, dark ink/yellow surface và selective pastel/spacing; không copy brand/font/landing layout. Query ui-ux-pro-max trả landing/testimonials, indigo và font kids không fit mọi tuổi; một retry domain style cho Claymorphism/Soft UI, đã đánh giá nhưng không áp dụng cả bộ. Art direction tự chọn theo frontend-design và sản phẩm, không coi database recommendation là authority.

Ảnh B còn shading giấy/số 8 lớn hơn dự kiến, ghi rõ trong founder và 04. Không tuyên bố design đã tốt/UX đã pass; cần feedback rồi mới sinh 15 màn khác. A/prompt/hashes giữ trong rejectedConcepts của manifest để không mất lý do thay đổi. 16 graph/route/requirements giữ nguyên. T18 vẫn in_progress, chưa clickable. Rule IDs ADR-012 vẫn áp dụng về action/state; thay đổi này chủ yếu là visual direction.

## ADR-014 — Words for Kids, child-first và Theme C tạm chốt

Status **confirmed by user**, 09/10/2026. Người dùng đổi tên app thành Words for Kids, mọi planning tập trung trẻ 5–8 tuổi cho con trước; phụ huynh chuẩn bị/duyệt bài, người lớn mở rộng sau. VI/Beginner/child-friendly on; icon/voice cues cho non-reader, parent context cho capture/edit/key/cloud/delete. Tạm chốt ảnh S03 Theme C original coral fox/berry; một-image gate satisfied, 15 ảnh chưa sinh và T18 chưa clickable. Giữ original prompts/PNG/hashes tên cũ như archival, code/next mockups tên mới. Không đổi checkout path hoặc upstream skill content chỉ để rebrand. 00–14/founder/AGENTS/custom skills/manifest/STATE/START updated; R19/R24/R25, T00/T02/T05/T07/T18.

## ADR-015 — Licensed search-first media, templates và bounded concurrency

Status **accepted for planning; runtime unimplemented**, 09/10/2026. Catalog cartoon approved trước, thiếu thì query theo sense→source-open metadata→license/source/semantic gates→rank đúng nghĩa trước cute→parent shortlist→permitted import/cache/credit→approved+ready game. Không Google scrape/top-hit hoặc arbitrary URL fetch. Animation AI-proposed declarative templates CSS/Motion/SVG, no generated executable code/video P1. PNG moves/reveals whole image; part animation needs layers/sprite. Enrich/search independent after reviewed sense; sentence template waits validation. AI1/principal/batch20, search2/import2 initial targets, shared provider limiter/cache/dedup/429/cancel/version guard; no multi-key quota evasion.

Gemini Developer API child-directed/likely-under18 restriction checked official terms: currently not eligible, parent key not bypass. No provider selected; before benchmark check age/data/account/cost; no auto paid. BYOK conditional server identity+secret store, never browser persistence. Search does not remove vision/enrichment spend or eligibility. node GitHub skill installed pinned via git helper after Python TLS CA failure, root MIT retained; synthetic demo/probe evidence only, no runtime speed guarantee. Spec14, R25/QA28–29, T05/T07/T08/T12/T14; founder15 self-contained.

## ADR-016 — Minh họa nhận ra ngay và UI gọn theo phản hồi founder

Status **confirmed by user; implemented in T18 artifacts**, 09/10/2026. Đồ vật/fruit/food không có mặt/mắt/miệng/tay chân; cute bằng màu/nét, silhouette và bộ phận đúng. Mascot/người/con vật riêng. Bag rõ quai/ngăn/zip; network image ưu tiên đúng sense→recognizable→clean illustration→cohesion, không ép style kawaii độc quyền; đồng bộ frame/scale/background. Ba đáp án bằng nhau cùng hàng >=360, dưới đó ba hàng đều, không 2+1. Disabled không làm nhạt ảnh; feedback/results gọn, màu + icon + label. Diagnostics inspect=1, không trong product default. Specs 04/08/14/founder/AGENTS/bilingual skill updated; 9 raster revisions + SVG prototype. R19/R24/R25, T02/T07/T12/T18, QA25/28.

## ADR-017 — Impeccable project-local và T18 hoàn tất artifacts

Status **requested by user; installed and applied**, 09/10/2026. pbakaus/impeccable pin d631a8827f99414d2b6daba4ef08b7f8701751d7, skill 4.5.2/Apache-2.0/NOTICE. Helper download vào .agents/skills; total 17/351 resources; no hooks/global settings. Launcher context chạy một lần, engine 0.1.14 qua SHA sidecar/cache tạm. Thiếu PRODUCT/DESIGN riêng không block scoped fixes; ledger/doc sources giữ nguyên. Áp distill/layout/colorize/typeset + craft-floor; detector một cream-palette warning giữ theo brief. Formal critique dual-agent/overlay không invoked.

T18 core 5 + support clickable, 16 PNGs + 9 refinements + gallery/prompts/hashes, self-review/screenshots/kịch bản QA25 đã có. Nunito VI self-host WOFF2 101.028 bytes. Browser 360/1440 tests ở SELF-REVIEW; T18 done không đồng nghĩa T01–T14/camera/AI/cloud/SRS/human QA25/performance production pass. Next T01 + T00 prepared harness; live provider vẫn conditional. Founder/status/START/TASKS/catalog/lock updated.

## ADR-018 — scaffold T01, versions và ranh giới demo

Status **implemented and locally verified**, 09/10/2026. Giữ Next App Router/TS/Tailwind/shadcn theo 05; pin Node24.14.1/pnpm11.25.0/Next16.4.0/React19.3.0/TS6.0.3/Tailwind4.3.3 và lint/test toolchain trong package/lock. Latest TS7/ESLint10 không khớp peer của lint plugins, nên chọn bộ peer-compatible TS6/ESLint9; ESLint9 deprecated, cần kiểm nâng cấp ở quality gate. Serwist9.5.13 chỉ kiểm docs/peer metadata, chưa SW integration (T13).

Scaffold dùng trang mẫu Theme C/Nunito/SVG kế thừa T18, không port toàn flow hoặc persist sessionStorage vào thư viện. APP_DEMO_MODE explicit true/false được đọc runtime; false không có fixture. AI_PROVIDER chỉ none đến khi provider đủ điều kiện được chọn ở T00/T05. Env module server-only; guard secret namespace/errors không giá trị; health chỉ liveness, không integration readiness. CI configured, chưa remote run/deploy. Native unrs postinstall fallback deny theo project, không allow tất cả scripts hoặc đổi global config. Next agentRules=false ngăn dev tự sửa AGENTS; bỏ đúng managed block Next sinh, giữ source instructions.

Evidence: evaluations/t01-scaffold.md; frozen install/peer check/dev smoke/lint/typecheck/14 unit/build/7 E2E PASS. T01 done; T02/T03 ready; 2 done/3 ready/14 planned. UI brand/scope/parent flow và P1 requirements giữ nguyên. Affected 05/09/11, AGENTS/README/founder/ledger; T02 tiếp tục đối chiếu 03/04/13, chưa claim human/performance pass.

## Quy trình cập nhật quyết định

Ghi ID, status (confirmed/proposed/accepted/superseded), ngày, vấn đề, lựa chọn, lý do, tác động R/T và tài liệu phải cập nhật. Nếu thay lựa chọn kỹ thuật thuần túy trong scope, tự thực hiện rồi ghi rationale. Chỉ hỏi khi cần preference/credential/phạm vi chưa có; không hỏi lại yêu cầu đã xác nhận.


## ADR-019 — T02 UI preview và ranh giới persistence

Status **implemented/locally verified for UI**, 09/10/2026. Port đúng Theme C/T18 thành shell React/S03/S07/S09; detail/review không bottom nav. AppProvider memory riêng từng React tree giữ fixture/draft/edit/receipt qua route, reload đặt lại với label; không gọi đây là guest repository. T03 Dexie/canonical/unique constraints và T06 source transactions vẫn cần triển khai. localStorage whitelist chỉ locale/childFriendly/level/reduceMotion/sound; không content/secret. VI/EN UI và standard/child typography hoạt động; level preference chưa phân lesson eligibility. Capture/Practice destination nêu rõ chưa kết nối và có bước thử content, không làm giả OCR/SRS/cloud.

Server đọc APP_DEMO_MODE và chỉ truyền boolean; demo off là empty. Parent gate giữ destination/cancel focus nhưng không security/auth. shadcn13 source files thêm từ registry chính thức, deps unchanged. Input boundary dùng semantic #9D869F (3,16:1 với background), focus opaqueberry3 px thay translucent-only cue; không đổi Theme C. Search/audio/preferences có hydration readiness guard; speech cancel/token/event phối hợp nhiều nút và navigation, mock interruption verified, voice thật pending.

QA26 khởi đầu bằng 20-entry UI fixture, production source/build hash, 5 cold runs/route, 4G1,6/0,75Mbps/150ms + CPU4× trên Chromium emulation; physical Android/iPhone/field INP/5.000 search còn pending. Không sửa target để báo pass hoặc dùng lab thành field. QA27 flip/game/notes theo các task sau. Lệnh/screenshot/raw profile trong evaluations/t02-ui-shell.md/ux-performance.md. T02 done UI scope; T03 next.


## ADR-020 — IPA và gợi ý cách đọc bằng chữ Việt

Status **confirmed by founder; documented, implementation planned**, 09/10/2026. Founder làm rõ phiên âm mong muốn là IPA như `nut /nʌt/`, đồng thời chấp nhận gợi ý cách đọc gần đúng bằng chữ Việt. Dưới từ/cụm từ và từng câu ví dụ/câu học: IPA trước, gợi ý chữ Việt kế tiếp, nghĩa/bản dịch riêng. IPA có kiểm xác minh/nguồn; UK/US khi có, thống nhất accent với audio. Gợi ý chữ Việt nhãn gần đúng, phụ huynh duyệt, không được dùng thay IPA/audio hay làm đáp án chấm. Thiếu dữ liệu có trạng thái chưa đầy đủ; sửa text/accent cần kiểm lại, không đè user edit.

Affected R07/R08, S09/S10 và phần nội dung được reveal/hint ở S12/S13; T03 dự trù storage, T07 UI/content/audio/versioned contract, T09/T12 giữ quy tắc không lộ đáp án, T11 roundtrip; QA11/16/21. Sources 01/03/06/07/08/10/11/contracts README/founder/STATE/TASKS/START updated. Runtime, DB và contract v1.0 chưa mở rộng; T07 vẫn planned, 3 done/2 ready/14 planned. Không cập nhật mockup lịch sử thành bằng chứng tính năng.


## ADR-021 — Thêm từ trực tiếp, tra và autocomplete

Status **confirmed by founder; documented, implementation planned**, 09/10/2026. Founder yêu cầu ngoài chụp ảnh phải gõ từ mới để tra/thêm, có autocomplete từ liên quan. S03/S09 Thêm từ qua parent gate → gõ EN → chọn gợi ý hoặc tra nguyên input → xem nguồn nghĩa/POS/phát âm/ví dụ → chọn sense, sửa/duyệt → dedup/transaction save. Không auto lưu hoặc sửa input theo từ gần giống. Loading/empty/offline/quota/error giữ input, retry/nhập thủ công/lưu chưa đầy đủ; không claim tra live từ mock.

Nguồn tra chưa chọn; ưu tiên dữ liệu được phép sử dụng, API key server-only, autocomplete debounce/cache/bounded/version guard, không AI call mỗi phím. Chọn từ đã có mở/link mục hiện có, nghĩa/POS mới giữ riêng, parent approval theo version. Affected R11, F07, S03/S09, T03/T07 và QA08/09/10/11. Updated 01/02/03/06/07/10/11/founder/STATE/TASKS/START; không đổi số screen/nav/task hay status 3 done/2 ready/14 planned. Editor T02 memory hiện tại không chứng minh lookup/autocomplete/persistence.


## ADR-022 — T03 scoped IndexedDB và snapshot đã duyệt

Status **implemented/locally verified**, 09/10/2026. Dexie4.4.6/hooks4.4.0 exact, fake-indexeddb6.2.5 test-only, peer check clean. Logical schema v1→v2 additive, guest/demo UUID scope trong IndexedDB metadata; demo seed một lần, không trộn guest. Compound primary/unique theo scope cho entries/senses/lesson links/receipts, exact POS+label sense identity; không semantic merge. Read transactions/live-query results có scope tag, writes atomic/hash receipts, retry/2-tab recheck. Metadata/library scope index là phần điều phối; domain stores luôn leading scope.

Search dùng derived normalized terms trong scope, B-tree scope/ordinal + substring scan, materialize page50/overview20/Today4. Không inverted index ở T03 vì lab5.000/50 mixed input CPU4× p95≈166 ms đạt target200; tiếp tục đo trước khi tăng complexity. IndexedDB không bảo đảm dữ liệu sống qua eviction/xóa trình duyệt; backup/cloud là T11. Cold LCP/CLS/bundle build T03 chưa rebaseline đầy đủ, T02 giữ lịch sử; phone/field/human pending.

Đổi chữ EN trong editor lưu pendingEdit versioned và giữ snapshot approved/examples/phát âm đang học. T07 review toàn proposal mới commit canonical/content; không thay bản bé học bằng proposal hoặc tự approve mục vốn pending. Sửa nghĩa cùng EN qua parent editor optimistic version; stale/collision giữ input. Notes/events có storage primitives/immutable idempotent event, chưa notes UX/SRS; cloud outbox chỉ seam, chưa auth/sync. IPA/readingHintVi storage fields dự trù, v1.0 enrichment parser/UI/lookup/autocomplete T07 chưa mở rộng.

Evidence evaluations/t03-local-repository.md: check49 unit-integration/build, E2E42 native Chromium production, frozen install/peers, search5.000 p95≈166/max184 CPU4×, raw source/build/hash/trace integrity. R04/R06/R11, QA01/02/08/09/10 lab; T03 done/T04+T10 ready, 4 done/3 ready/12 planned. Sources 03/05/06/10/11/13/founder/README/STATE/START/TASKS updated; no provider/cloud/SQL/secret/deploy/commit/push.


## ADR-023 — T04 local capture, prepared pixels và device gate

Status **implemented/locally verified, physical QA07 pending**, 09/10/2026. Giữ product flow S04/S05/Theme C, không thêm nav hoặc provider. Một ảnh JPEG/PNG/WebP≤10 MB/20MP theo founder; header/dimensions trước decode, EXIF from-image baked vào JPEG .9 strip metadata, resize cạnh≤2200. Chỉ giữ normalized source+prepared đúng preview, không raw/name/GPS. Crop controls %/rotate90/reset/zoom, metadata tùy chọn. Canvas main-thread render vì six synthetic CPU4× lab runs269–335ms, observed longtask≤60ms; native decode async; chưa đủ evidence thay worker/device budget, đo lại điện thoại thật.

Local schema v3 additive thêm `captureDrafts` typed, dùng localMedia blobs compound scope/id, review drafts T03 và content cũ giữ nguyên. Blob+metadata create/update/delete atomic, optimistic version chống tab cũ overwrite/delete; autosave500ms/manual/back/SPA flush, failure giữ memory và không báo saved trước commit. Nháp reminder7ngày/xóa xác nhận, parent gate resume Today, scope tag chống lộ nháp. Draft/consent không outbox/network job dù account abstraction; flag `image-upload-v1` không cấp quyền cho provider chưa chọn, T05 phải validate consent/policy hiện hành và server limits.

Camera hỏi quyền sau click, track stop khi capture/switch/cancel/hidden/leave; generation guard dừng late result sau hủy. Bundled Chromium156 GUM fake-device probe trả NotSupportedError; test mock acquisition bằng native canvas MediaStream/video/tracks. Không coi đó là native OS permission/hardware smoke. `pnpm check`57 + E2E58 PASS, v1/v2→v3 lossless/quota/stale/EXIF/limits, 4 screenshots reviewed. QA07 acceptance 11 còn smoke iPhone/Android thật: **T04 pending_external**, ledger4 done/2 ready/1 pending_external/12 planned. Evidence evaluations/t04-capture.md; next T00 độc lập ready. T05/T06/T07/cloud/PWA/SRS/human chưa có, no deploy/commit/push.

## ADR-024 — T00 offline evaluation và conditional eligibility

Status **prepared/verified offline, live pending**,09/10/2026. Theo07/10/11, bổ sung20 raster synthetic worksheets/40 listed-all answers, version/hash của dataset/images/prompt/schema/renderer và Python/jsonschema offline scorer. Không thêm SDK/key/live adapter vào app hoặc đổi analysis/enrichment contract. Corpus do agent tạo/xem; handwriting font mô phỏng, human GT/ảnh thật pending.14 scorer tests/reference CLI PASS không thành OCR accuracy; lexical set score không thay sense/dedup/human grammar QA. Invalid outputs vẫn tính FN, empty recall null, missing runs/mixed models/hash mismatch không được che.

Current official screening: Gemini Developer terms excluded cho child API Client; parent/BYOK không bypass. OpenAI minors/ZDR và Anthropic API minors/retention có điều kiện; chưa account/endpoint/model/safeguards evidence, nên chưa chọn dịch vụ/model hoặc bật provider. Không mặc định store:false là ZDR hoặc consumer Claude.ai là API terms. Sources/report tại evaluations/ai-benchmark.md. T00 pending_external, T04 device gate pending; ledger4 done/1 ready(T10)/2 pending_external/12 planned. T05 dependency chưa đạt; next T10 schema/RLS độc lập. Latest IPA/readingHintVi/manual lookup/autocomplete T07 giữ nguyên.

## ADR-025 — founder yêu cầu bản test liên tục đến hết

09/10/2026, user trực tiếp yêu cầu làm liên tục tới bản dùng được để test một lần, thay cách bàn giao từng task. Ưu tiên end-to-end local: nhập/tra/autocomplete → parent review/lưu → detail/IPA/reading hints → notes → ôn/game → backup/offline. Được làm phần độc lập của downstream dù provider/cloud integration chưa đạt, không đánh dấu dependency/live QA đã pass. Các trạng thái thật vẫn giữ: AI không có provider đủ điều kiện/credential; Google/cloud chưa cấu hình; physical/human test cần người/thiết bị. Không tự paid/deploy hoặc yêu cầu user test từng chặng. Tiếp tục cho tới khi mọi phần local có thể kiểm được đã nối và kiểm; mọi external blocker có fallback và được tổng hợp một lần.

## ADR-026 — bản local liền mạch, OCR và offline fallback

Implemented/locally verified10/10/2026 theo founder continuous delivery. Kéo OCR localT16 lên dùng Tesseract7 pinned assets same-origin/ownedWorker/60sabort; không remote photo, không gọi đó là AI benchmark T00. Catalog21 có bilingual prepared nội dung để autocomplete liên quan và fallback; lookuponline chỉexplicit parent, failure giữinput. IPA chỉ child show sau source verified; import/manual đổiIPA không kế thừa verified. Reading hints gần đúng vàspeechEnglishoriginal.

Local nativeSW hash public assets, offline library+5modes cùngIDB/SRSsource/sessionformat; khôngcacheHTML/RSC/privateAPI, khôngreloadmidwork. Parent scope switch lưu metadata, disable tronglúcDBchưaopen để tránh thao tác trước hydrate; demo/guest khôngmerge. Backupfullsnapshot chỉemptylibrary atomic restore, validatesboundedbytes/checksum/FK/canonical, resetapproval/consent/IPAtrust. Textbackupmerge là optionriêng. CloudSQL reallocalroles nhưngGoogleAuth/StorageAPIfixture chưalive. Taskstatuses khôngfullcompletion; AIgateway/enrichment/mediaexternal/cloudsync/device/human/release cònthiếu. Evidence evaluations/local-end-to-end.md.


## ADR-027 — Đủ IPA catalog, phân biệt nghĩa và kiểm cloud local

10/10/2026, founder phản hồi thiếu IPA và hỏi vì sao bank là bờ sông. Bank có hai nghĩa đã lưu riêng theo POS/sense identity; trang chi tiết bổ sung lựa chọn nghĩa theo câu, không thay nghĩa bờ sông thành ngân hàng. Toàn catalog21 có IPA headword đối chiếu nguồn; bank `/bæŋk/` từ Cambridge. Bổ sung IPA còn trống theo đúng headword, giữ nghĩa và phiên âm phụ huynh đã sửa. Phiên âm của cả câu chỉ hiện khi có dữ liệu đã xác minh; không ghép IPA từng từ rồi gọi là phiên âm câu chuẩn.

Founder chưa có Supabase, đã cho phép hoàn thiện code và kiểm local. Auth dùng Supabase SSR phía server, PKCE, cookie HttpOnly, getUser kiểm lại danh tính; login không tự gộp thư viện hoặc gửi ảnh. Mở cloud và xem trước/xác nhận chuyển guest là hai hành động rõ ràng. Chuyển tải backup bài/lịch sử không ảnh nháp, giữ nguồn guest và kiểm snapshot trước transaction.

Sync dùng typed normalized tables cùng client_payload đã kiểm strict schema; migration0004 thêm change ledger, owner/library locks, version CAS, bounded batch và idempotency receipt. Review state do server giảm các event theo thứ tự chấp nhận, game không đổi lịch ôn. Các cache gửi lại đúng operation; hai bản sửa phải chọn. Exact canonical/POS/sense identity unpublished được đổi references sang ID cloud trong transaction; khác nội dung giữ bản local để phụ huynh chọn, không gộp gần nghĩa. Không đổi ID lịch sử đã được cloud chấp nhận. Logout truyền sang tab khác và kiểm lại session khi quay lại.

Kiểm local dùng Google/Auth identity giả lập có nhãn, HTTP bridge qua SDK/API thật và PostgreSQL15 thật với RLS. Không là kiểm Google OAuth, Supabase GoTrue/PostgREST/Storage đang chạy thật. Cloud source upload/account deletion và các acceptance external còn mở; không provision/deploy hay gọi provider. Evidence tại [cloud local](../evaluations/cloud-local.md).

## ADR-028 — Hoàn thiện phần độc lập và cấu hình phát hành

10/10/2026. Founder yêu cầu code liên tục và setup/deploy Vercel sẵn để test một lần; founder chưa có Supabase, tiếp tục local, không provision/deploy. Implement private sources consent/idempotent retry, recent-auth account deletion/write freeze/storage cleanup/cascade, per-field meanings pending review/notes keep-both; approved HMAC receipt Commons adapter dùng shared SQL leases/quota thay process-only limit. Media disabled mặc định, không gọi live search là verified. Catalog21 đủ2examples, contract enrichment1.1 không tự verified, S10 bốn loại approved content. Prepared OCR native worker/cache hash offline + parent basic edit, headword/full extras/grammar/media chỉnh online; account cold boot vẫn auth-gated. Vercel/config/Supabase/CI và SETUP-PROJECT là hướng dẫn vận hành, founder plan vẫn nguồn duy nhất.

Không chọn provider thay T00, không bật AI chỉ vì env: gateway/runtime guest capability/AI ledger/TTL/spend caps chưa làm. Hosted/physical/human/field/release gates giữ pending. Lab current performance ghi cả số không đạt; không lấy baseline T02/T03 thay build hiện hành. Evidence completion-local và raw current-ui/current-search.
