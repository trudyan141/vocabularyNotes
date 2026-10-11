# Quyết định và giả định

## ADR-031 — Upload kéo thả, trạng thái hành động và ảnh đối chiếu

Confirmed by user, 10/10/2026. Founder yêu cầu sửa nút phân tích/lưu bị khóa sau tick, hiển thị ảnh để đối chiếu AI và làm lại UI chụp/upload với drag-drop. S04 có vùng thả một ảnh, nút chọn ảnh tiếng Việt/bàn phím và camera riêng; cùng intake/validation/local draft, không tự gửi AI. S06/S07 dùng route extract: ảnh prepared chính xác sticky cạnh kết quả desktop, thumbnail sticky trên mobile và mở blob ảnh lớn. Nêu rõ thiếu key/consent/privacy hoặc chưa có từ/chưa đủ nghĩa/chưa duyệt; key/model cấu hình tại chỗ, không rời nháp, lưu key mở nút khi đủ xác nhận. Giữ session/localStorage opt-in, quota, privacy/parent review và model ADR030. Không gọi kiểm UI/response fixture là real AI accuracy. [Evidence](../evaluations/capture-review-ui.md).

## ADR-030 — Gemini free-tier BYOK và chọn nhiều model theo yêu cầu mới nhất

Status **confirmed by user; implemented**,10/10/2026. Founder bác OpenAI default/billing, trực tiếp yêu cầu Gemini API và nhiều model như3.5FlashLite. Supersede lựa chọn OpenAI runtime ADR029, không thay directbrowser/session/localStorage opt-in/key-delete/no server or backup/parent review. Không tự coi user request là Google cho phép child API Client; current terms under18/consumer restrictions vẫn ghi rõ, T00 eligibility/account/retention/live benchmark pending.

Default gemini-3.5-flash-lite; dropdown3.1flashlite/3.6flash/3.8flash + custom Gemini ID. Officialpricing/modeldocs10/10 xác nhận bốn preset có free tier; quota theo project, paidproject có phí. Không tự fallback/retry/modelchange/billing. Standard/authkeys từ AIStudio nhận qua headerx-goog-api-key, fixedGooglehost/modelIDregex khôngURLkey; cấu hìnhOpenAIcũ bị bỏqua, không truyềnsecret providerkhác.

REST generateContent systemInstruction/inlineJPEG/responseFormattextschema; bounded500KB parseSTOP/nonthought/safety/refusal/truncation/malformed/evidence; no tools, max50/90s/cancel/WebLocks. Chưa realkey/inference, CORSOPTIONS200 verified, tests fixture labeled. HistoricalOpenAI drafts giữ sourceprovider theo model ID, không đổi provenance. Source02/05/07/09/14/AGENTS/founder/setup/state/task/changelog updated. [Evidence](../evaluations/parent-dictionary-byok-deploy.md); [Google pricing](https://ai.google.dev/gemini-api/docs/pricing), [model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [terms](https://ai.google.dev/gemini-api/terms).

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

## ADR-032 — Tiến độ thật và streaming khi phân tích ảnh

10/10/2026 founder muốn thanh tiến độ/kết quả hiện từ từ vì dòng chờ không cho biết bao giờ xong. Dùng Gemini SSE trực tiếp cùng key/model/request bounded hiện hành. UI có bước thực tế, elapsed, indeterminate progress,90s limit và Dừng; không bịa phần trăm/ETA. Preview chỉ complete JSON text/word có schema/evidence, React plain text, ghi bản tạm. Partial không vào IndexedDB/archive/child library; final STOP/schema/evidence mới thay draft để parent review. Cancel/error/timeout/key change xóa pending UI, giữ draft cũ; sửa bug progress cũ treo khi API đã lỗi. Mock streaming chứng minh transport/UI, không live AI accuracy.

## ADR-033 — Lỗi Gemini cụ thể, không mất chẩn đoán

10/10/2026 founder tiếp tục bị Google từ chối request, yêu cầu test/fix hoặc lỗi rõ ràng. HTTP400 trước đây gom thành configuration và bỏ message/field violations, nên không kết luận được nguyên nhân thật. Giữ HTTP/status/model, message/reason/field violations bounded đã redact actualkey/querykey/token/largeblob/projectnumber; plain text trong UI, không console/IDB/backup/cloud và không full provider payload/metadata. FAILED_PRECONDITION tách khỏi INVALID_ARGUMENT; non-JSON lỗi vẫn giữ HTTP. Giữ draft/source/cancel/strictfinalreview. Founder cho phép thử request hiện hành để chẩn đoán; không suy một request thành benchmark OCR/account eligibility.

Follow-up ADR033: một live POST trên ảnh/model/key đang chọn trả HTTP400 INVALID_ARGUMENT, message “Request contains an invalid argument.”, không field/reason khác. Không kết luận key sai. Đổi generationConfig sang stable responseMimeType/responseJsonSchema + tối giản provider string constraints; local DTO/evidence/limits giữ nguyên. Thêm metadata GET key/model15s không gửi ảnh/inference, không fallback model/billing. Before/after inference result sẽ ghi evidence; không claim nguyên nhân riêng responseFormat khi Google không chỉ ra field.

ADR033 isolation follow-up: metadata accepted key/model, compatible image request still returned400/no fields. Add an explicit minimal text-only inference control in parent settings; distinguish metadata access from actual generateContent access. One click/one bounded call15s/64output tokens, no image/schema/system instruction, no automatic retry/model or billing changes, diagnostics redacted and generated control output discarded. Does not bypass parent review or modify drafts.

ADR033 next isolation: actual minimal text generateContent on837c50f succeeds with the same key/model. Metadata success plus text inference success narrows400 to the worksheet request. Use JSON mode/explicit schema in prompt instead of backend responseJsonSchema compilation; strict local DTO/evidence/STOP/size validation unchanged, no auto retry. Before/after photo test follows; do not claim schema compiler proven until it succeeds.

ADR033 outcome: after JSON mode change, same photo/key/model streamed and completed13words with strict validation. This is evidence the structured worksheet request configuration caused the observed400; exact rejected schema field remains unknown. Keep JSON mode plus explicit prompt schema/local strict validation; no automatic retries/fallback.

## ADR-034 — Automatic licensed pictures and prepared question grammar

10/10/2026. Founder explicitly asks app to find/attach pictures and remove credit clutter. Fix nested links causing huge rows, retain source/license in collapsed image detail and backup. Catalog177 plus pinned OpenMoji1493 indexed online assets, bounded same-origin download without key or paid search; parent reviews sense suitability. Unknown meanings can fail honestly with retry. Intelligent cognitive adjective uses symbolic brain, not image-game eligibility. Add complete project-authored What is it?/It’s a/an… and Is it…?/Yes, it is./No, it isn’t. Templates are additions, not source transcription; review/atomic receipt/CAS persist into library modes. Existing libraries have parent completion action; do not overwrite parent meanings/art/extras. [Evidence](../evaluations/library-media-and-date-sets.md).

## ADR-035 — Manage saved word sets by local learning date

10/10/2026 latest founder request: each captured/imported image remains a separate lesson with title/date; typed words share a daily manual lesson. Upload default title comes from filename; local current date, editable before/after save. All sets grouped by learnedOn, date/title/word search, new versus repeat sense counts, title/date CAS and dedicated practice filter. Existing lesson links are exposed, not merged/lost; archive keeps original links and dates. Moving a daily set does not append later words to the wrong date. Parent governance remains in preparation UI; no fourth nav. [Evidence](../evaluations/library-media-and-date-sets.md).

## ADR-036 — Submit completes duplicate, picture and source-pattern handling

10/10/2026 founder clarifies that each future submit must perform the full workflow without editing code to supplement data. Exact canonical word + POS + sense identity remains authoritative; repeated imports link into the new dated set without duplicating or overwriting parent wording. Review exposes existing-sense badges and an optional remove-duplicates action that preserves the first selected row; distinct meanings/POS remain separate. Reviewed re-import may fill missing public art and rebase prior approved grammar, without changing meanings/examples.

Photo review automatically resolves bundled illustrations, then sequential licensed online lookup/download for missing selected items, up to50 per batch/90s total/10s request; explicit Stop/retry and text-only save on failure. Images and grammar are reviewed before the atomic lesson/receipt save. Source What is it?/It is/It’s/Is it a/an… excerpts are retained verbatim from reviewed transcript; Vietnamese translation/explanation and additional templates are explicitly labeled project additions. Known singular countable noun templates only, no arbitrary grammar claims. Three-step question/answer/contraction illustration has keyboard controls, replay and reduced-motion/static content. Existing old13-word library was completed once through parent UI; future photo submissions use this integrated path.

Also fix imported word detail/edit/notes: observed Vercel RSC route parameter encoded ':' as '%3A', while IndexedDB stores the original ID. Decode the path segment exactly once at route boundary, preserving literal percent sequences. Evidence includes real missing teacher detail before fix, regression tests and live verification after deployment. [Evidence](../evaluations/library-media-and-date-sets.md).


## ADR-037 — Reach due cards and report request work visibly

10/10/2026 founder asks for an entry next to Today’s due count and progress/errors for server API operations. Same scoped deterministic due selector for count/start, direct capped flashcard entry, URL session resumption, honest empty/error recovery and explicit offline scope selection. Navigation never records memory ratings. When due words exist, the due entry is primary and generic play secondary.

Request feedback is adjacent to its action and accessible: operation/stage/elapsed, determinate completed-item count only when total is known; indeterminate otherwise. Sequential picture preparation ≤50/90s,10s per item, partial successes retained; absent matches distinguished from HTTP/network/timeout errors and explicit Stop. Retry only remaining words, no provider/key rotation. Saving and error feedback remain beside approval. [Evidence](../evaluations/today-feedback-and-seo.md).

## ADR-038 — Public discovery and private brand-only sharing

10/10/2026 founder requests favicon, metadata/social thumbnail and SEO. Reuse original fox and Theme C; deterministic local asset generation, ICO/PNG/Apple/PWA sizes and1200×630 brand preview. Next metadata with absolute canonical/public URL, title/description/icons/OG/Twitter and minimal WebSite JSON-LD. Only public welcome enters sitemap/indexing; lesson, capture, settings/account and study screens remain noindex, preview deploys disallow. No private library contents in SSR metadata or thumbnails, no invented reviews/ratings/ranking claims. Existing skills and official Next docs suffice; no plugin/skill installed. [Evidence](../evaluations/today-feedback-and-seo.md).


10/10/2026 ADR035 refinement per founder: make saved-set title/date editing reachable inside the selected card and from Today recent lessons, reusing existing versioned lesson update. Preserve IDs, words, sources and review schedule; do not require a new import to rename.


## ADR-039 — Parent identity and storage are separate visible states

10/10/2026 founder asks to see Google name/email/avatar and understand synchronization. Extend existing authenticated status with sanitized display-only metadata and opt-in read-only overview; preserve RLS/owner filters and cheap background session checks. Show device-only and account counts/current source, explicit preview/confirmation and sync timestamps/errors. Store no new profile table/token. Login success does not imply library readiness or completed upload. Unknown auth state is distinct from signed out. Source03/09 and account evidence updated; live founder cause still requires the correct authenticated session.


## ADR-040 — Founder-authorized shared Gemini browser default

10/10/2026 latest direct request explicitly supplies a Gemini key and authorizes everyone to use it. Treat that specific key as public browser configuration, present by default without writing it to localStorage; do not reproduce its value in documentation. This is a scoped exception to ADR030's parent-provided-key-only default. Operator/service-role keys remain server-only. A remembered private parent key takes precedence; session overrides, model selection, per-image consent, bounded single browser request, no automatic retry/rotation/billing and strict parent review remain. Delete removes the private override and persists an AI-off flag, so reload cannot silently reactivate the public default. A named restore action reinstates the shared key/model. Shared quota is stated honestly; no guaranteed free, eligibility or benchmark claim. No private key in IndexedDB/cloud/archives/server/URL.

## ADR-041 — Google recognition, Theme C action hierarchy and hosted storage setup

10/10/2026 screenshots show signed-in Google but schema-not-ready and weak control hierarchy. Add the original four-colour Google G on both the sign-in action and connected account state. All back controls have a visible ArrowLeft with their text, using shared Back where possible. Refine existing Theme C at the shared primitive level: berry primary, lavender secondary, white outlined controls, meaningful iconography, soft button depth, white library/lesson cards, responsive label wrapping, 48px targets and reduced-motion/static states. Account storage colours distinguish device (lavender) from account (mint), with one transfer CTA and compact refresh/back actions. No new nav or replacement visual identity.

Observed founder project had no public libraries/entry_senses tables. Applied existing migrations0001–0006 atomically via its authenticated SQL Editor with a guard against rerunning on initialized storage, and refreshed PostgREST schema. This fixes infrastructure rather than masking its error. Keep preview/confirmation before device-to-account upload and source-photo opt-in. Manual SQL Editor setup does not populate CLI migration history; reconcile before future db push. [Evidence](../evaluations/ui-and-hosted-cloud-fixes.md).

## ADR-042 — Parent simplicity and child play, unlimited deck membership

11/10/2026, latest founder steering supersedes500-members limit: remove UI/schema cap, retain unique approved same-scope senses, paged12 selection/search and short10-question sessions. Shared-ready AI defaults need no configuration; private key/model and diagnostics only in advanced disclosure. Preserve consent/data-use details without default technical wall of text. Theme C child play uses real existing licensed recognizable art, separate original fox, compact mode prompts, equal-row answers, finite response motion and original Web Audio cues unlocked by gesture, mute persistence/cleanup/static reduced-motion fallback. No background/autoplay sound, provider requests or SRS claims from scores. Whole UI responsive/state visual audit and evidence is required; physical-phone and human aesthetic/usability acceptance remain separate. Source03/04 and evaluation govern the implementation, not installation of more skills.


## ADR-043 — Stronger project-wide actions and recognizable feature entries (11/10/2026)

Founder rejects plain outlined buttons and explicitly requests app-primary submit buttons plus a more expressive treatment for whole-function entry points. Keep Theme C/brand/fonts/data semantics. Refine the shared Button with solid berry primary, lavender secondary, berry-text soft outlined action, quiet ghost/link, separate destructive and Google; add feature and segment variants. Primary submit/save/approve/continue uses berry. Feature entry content reuses existing catalog pencil/book illustration plus action title, a short factual explanation and arrow, retaining ParentGate at the caller. Add word gets primary Plus; Filter remains quieter. Content/practice segments separate selection from committing actions. Use finite press/hover feedback, min48px targets, wrapping/focus/disabled/loading and static reduced-motion; no auto sound or network behavior. Supersedes the plain white control treatment inADR041 within this scope. No key, data, quota or cloud changes. AffectedT02/T09/T18,S03/S07 and shared controls. Validation and hosted evidence: [button hierarchy](../evaluations/button-hierarchy.md).

## ADR-044 — Readable dated lessons, topic groups and illustrated welcome (11/10/2026)

Founder rejects the remaining UUID/text-heavy dated-set screen, asks for words/sentences groups such as Family/Primary English, individual or whole lesson/day additions with duplicate removal, and a brighter animated home. Preserve Theme C, three main navs and approved same-scope content.

Date manager gets licensed member previews, short copy, calendar dates, one berry Learn action, quiet View/edit/group actions and12-set paging; detailed new/review explanation stays in disclosure. Automatic UUID/typed-date titles get display-only localized fallbacks on date manager/Today/filtered Library/editor; Save remains explicit and versioned. No silent rename or migration of founder content.

Groups reuse the existing versioned `decks` scoped store/cloud entity with optional `group={wordIds,sentences:[{senseId,key}]}`; `senseIds` is the unique union of every word/sentence parent for existing owner/library validation. Ordinary decks still require words; groups may be empty or sentence-only. No new IndexedDB/SQL stores or migration. Add individual approved items, one lesson or every lesson on a date; atomic CAS deduplicates exact word identity (case mode/spelling/POS/sense) and sentence EN+VI NFKC/case/whitespace identity, preserving accents, punctuation and different translations. No AI semantic merging. Group names reject exact normalized duplicates. Word/sentence/lesson pickers and reading lists use12-item paging, selections persist across filters/pages, Save reports added/skipped counts. ParentGate guards create/edit entries; reading uses current approved content, unavailable/deleted/changed members are flagged. Explicit Save can remove members; no source/SRS deletion. Group word practice uses only wordIds; sentence members have reading/audio/context. Full archive, guest transfer and identity reconciliation preserve/remap all refs through existing cloud conflict/owner boundaries. Hosted group sync is not inferred from local fixtures.

Welcome uses existing fox/catalog apple/book/cat, warm yellow illustration stage/mint learning strip, prominent berry Start and compact parent link. Finite700ms fox greeting once per tab session, optional replay by button; OS reduced motion is static, no autoplay sound. No provider/personal-data mutation this turn. AffectedT09/T12/T14/T18 and S01/S03/S09/S10/S11. [Evidence](../evaluations/groups-and-lesson-ui.md).

## ADR-045 — Plain product language and all-page selection (11/10/2026)

Founder rejects technical storage/configuration text in normal UI and requests Select all for pickers spanning10pages. Remove global storage footer; retain explicit sample label. Replace implementation/provider diagnostics with understandable result/recovery copy across parents/children/offline. Preserve consent, meaningful costs, deletion consequences, sources and optional parent-owned credential controls; no raw provider codes/fields/messages in UI, superseding ADR033/039’s diagnostic display. Internal safe classification and transport tests remain. Source rule04 and AGENTS, screens03.

All-page selection covers every approved scoped result matching the current search, unions previous selections without clearing other results. Group unselect-results affects current mode/filter only; page selection remains. Bulk deck IDs bypass display hydration cap, no arbitrary member cap. Explicit Save retains atomic validation/dedup/CAS. AffectedT02/T09/T14/T18; [evidence](../evaluations/plain-language-and-select-all.md).

## ADR-046 — Settings and direct self-managed use (11/10/2026)

Founder continuation adds supplied author Ly Kien Trung and contact trudyan141@gmail.com in a localized About section at the end of Settings; email opens a mailto link.

Founder explicitly replaces Parents with Settings and removes meaningless parent warnings across the project. Everyone navigates directly to add/edit/prepare/groups/decks/notes and settings; family decides who prepares and who plays. Replaced ParentGate dialog with shared styled real links, gear Settings entry, neutral VI/EN/metadata/offline copy. Preserve actual content review/approved revisions, photo consent, irreversible deletion confirmation, auth/library ownership and conflict checks. No fake gate/PIN/age gate added.

This supersedes parent-only UI rules in older ADR/specs/skills, including044/045; child-friendly design/brand/assets and provider eligibility constraints remain. Source03/04/02/AGENTS; current TASKS/STATE govern evidence. [Evidence](../evaluations/plain-language-and-select-all.md) covers045+046.

## ADR-047 — Full English example IPA (11/10/2026)

Founder asks IPA beneath each illustrative English sentence and a durable generation rule. Use one shared whole-sentence component on detail, second examples, sentence lists/groups, approved content/patterns and revealed flashcards. Stored exact-text/current-version IPA wins. Future Gemini worksheet examples require `exampleIpa` for every clause; null when uncertain, unverified, editable before approval; legacy responses remain accepted. The enrichment contract already carries per-example pronunciation arrays: prompts must ask for entire exact English text. Editing English clears its old IPA, including the second example. Optional content/example fields remain backward-compatible through local/archive/cloud JSON.

Existing examples get bounded batched same-origin server conversion from licensed CMUdict, no provider/key call, no public caching, no client lexicon bundle.74 prepared phrase guides also work offline. These are broad US **Reading guide / Tham khảo**, not verified sentence stress/connected speech or a dictionary citation for the whole sentence. Unknown words/numbers/ambiguous heteronyms return no guide; keep audio/text and allow manual IPA. No silent founder content rewrite. Full stored/generated IPA remains available offline; other legacy sentences need the app endpoint. Package ISC and original CMU license preserved in public/licenses/cmudict.txt. Evidence: [IPA and paste](../evaluations/sentence-ipa-and-image-paste.md).

## ADR-048 — Clipboard image intake (11/10/2026)

Founder requests copy/paste image and immediate display in Capture. Page-scoped native paste event accepts one image File, supports Ctrl+V/Command+V without reading clipboard permissions, names it Pasted photo/Ảnh đã dán, shares existing normalization/metadata removal/limits/atomic draft storage and opens edit preview. Text paste unchanged; invalid/multiple images show short recovery messages; busy lock rejects parallel intake, early repository initialization retains one pending paste. Reload keeps the draft. No image transmitted to AI or saved to the learning library by pasting. Camera/drop/file picker unchanged. Evidence above.

## ADR-049 — Founder owns browser, GitHub and Vercel actions (11/10/2026)

Founder explicitly withdraws automatic permission for native-browser manipulation, pushing main/GitHub and Vercel environment changes. Default is local source/docs and isolated fixture tests only; no native founder browser/account/real data operations, commits to main, remote writes/push/merge, deployments or hosting/environment changes without explicit approval for that concrete action. Past deployment/browser approvals superseded. Prepare reviewable local work before asking, name action/target and auto-deploy consequences; credentials, setup instructions and skills are not authorization. Local read-only Git status/diff remains allowed.

## ADR-050 — Scoped lightweight testing (11/10/2026, explicitly chosen)

Founder selects Gọn: lint/typecheck and tests meaningful to the changed feature; UI only a few relevant mobile/desktop states in isolated local fixture browser. Full suite at major handoff/release, not every small change. Build for dependency/routes/PWA/config or needed preview once at final source; don't repeatedly install/browser-install/build/full-audit. Keep data-loss/security tests relevant to changed boundaries; no live integration without049 authorization. Report scope/reason/command/result/limits, rerun failures and affected tests only unless new evidence justifies broader testing. This replaces literal every-turn full check/E2E interpretations in AGENTS and older ledgers. Source10/AGENTS/setup.

## ADR-051 — Two photo intake tabs (11/10/2026, confirmed by user)

Founder requests compact upload/camera UI. S04 defaults to Chọn ảnh / Upload photo; Chụp ảnh / Camera is a second equal tab. Only the selected panel renders. Existing picker/drop/paste validation and immediate draft preview remain shared; pasted images switch to upload and stop any camera. Selecting the camera tab does not request permission: only Mở camera does. Switching away invalidates pending acquisition and stops tracks; return requires reopening. Existing drafts remain outside both panels, without auto-AI requests. Radix tab keyboard semantics and Theme C berry/mint/lavender styling retained. Scoped local fixture checks follow ADR050, publication remains founder-owned under ADR049. [Evidence](../evaluations/capture-tabs.md).

## ADR-052 — Remove confusing welcome/footer/word metadata presentation (11/10/2026, user confirmed)

Founder removes the whole lower Welcome explanation, redundant Settings entry and three-method strip, then explicitly removes the global Bài mẫu footer and Nguồn và ghi chú disclosure. Welcome keeps mascot/recognizable learning art, short VI/EN copy and Start, with viewport-aware spacing. Header Settings remains the single settings entry. Removing footer does not change demo data/scope or erase sample provenance. Word detail no longer renders source/evidence/IPA source links/saved note section; storage/edit/archive/sync contracts remain intact. Required illustration attribution/license remains separate. This supersedes previous mandatory default metadata/footer presentation in ADR045/044/T02/T07; it does not authorize data deletion. [Evidence](../evaluations/welcome-footer-and-404.md).

## ADR-053 — Friendly illustrated 404 (11/10/2026, user requested generation)

Founder asks for mascot doing something and a beautiful404 screen. Built-in imagegen creates a new fox holding a map using existing original fox reference; transparent, optimized local WebP, original mascot unchanged. Accessible HTML404/friendly VI/EN message/berry Home CTA, yellow scene, responsive one/two-column layout. Unknown route still returnsHTTP404 and Home goes through existing root routing; no silent redirects. Local asset generation is authorized by this explicit request, not a founder browser/hosting/account action. Approval restrictions ADR049 still apply. [Evidence](../evaluations/welcome-footer-and-404.md).

## ADR-054 — Profile/avatar navigation, mobile clipboard, scoped deletion and worksheet grammar (11/10/2026, user requested)

Founder asks for five concrete changes from screenshots: avatar/profile/sign-in replaces header Settings, account/current-library controls move into Profile and Settings becomes fourth main navigation item; remove Google data/terms disclosure; fix mobile copied-image intake; expose deletion for words/groups/decks/date sets/sentences; infer grammar from sentence worksheets including “Who are they? / They are a family.”. Supersedes prior three-nav/header Settings presentation and the mandatory Google disclosure, preserves action-specific upload consent, review, scope/auth/CAS, source/license data and ADR049/050 permissions.

Local name/avatar preferences with safe Google fallback do not change Google account metadata or cloud profile. Clipboard.read is user-gesture-only with explicit text/link/unsupported/denied/multi-image recovery and shared bounded image normalization/preview. Deletion is scoped/versioned soft deletion, confirmation retains reviewed version; histories/backup/cloud tombstones remain. Set deletion keeps shared words and unrelated sets; section deletion preserves unrelated fields. Gemini learning DTO/prompt validates literal transcript evidence and supplementary complete grammar, allows full-sentence IPA or null, persists drafts/approved lesson content/archive. A deterministic family teaching fallback uses literal reviewed dialogue, never manufactures OCR. Provider schema pruning now preserves a data field named pattern while stripping regex keywords. No new SDK/model/provider request, SQL migration, real AI/account/browser action or publication. [Evidence](../evaluations/profile-avatar-mobile-paste-delete-grammar.md).


## ADR-055 — Illustrated child-friendly offline UI (11/10/2026, user requested)

Founder rejects the plain text/link-heavy offline fallback and asks for colorful buttons, mascot/art and friendly typography. Keep Theme C and existing local Nunito/catalog assets, reshape chooser/library/card/game/error/empty states. Explicit guest/sample choice and account-offline restrictions remain; no auto scope selection. Words use approved artwork where available with labelled neutral fallback, game choices retain three equal columns at360px. Whole-sentence IPA, review/CAS/dedup/resume/SRS and attribution persist. Local assets already in service-worker public shell, version hash rotates with source updates; no new provider/network/dependency. Focus/scroll reset on screen changes, normal keyboard focus and reduced-motion behavior. This supersedes the sparse offline presentation, not its data/auth boundary. [Evidence](../evaluations/offline-child-ui.md).


## ADR-056 — Grammar, global selection and source-dated group items (11/10/2026, user requested)

Founder extends groups to approved grammar, asks one selection across words/sentences/grammar, source date/name items matching photo imports and deterministic whole-group dedup. Optional grammar/sets metadata extends deck JSON with exact partition validation, no new SQL table. Save CAS/approval/scope preserved; different meanings/teaching explanations retained. Reading legacy groups synthesizes source sets; saves persist snapshot labels/dates. Transfer/reconcile/archive carry grammar/date refs; multiple supplemental rows per sense survive. Word practice remains restricted to group.wordIds. Supersedes ADR044 word/sentence-only group presentation/data. [Evidence](../evaluations/groups-grammar-and-audio.md).

## ADR-057 — Wait for device voice readiness on first tap (11/10/2026, user bug report)

The empty initial getVoices list must not be interpreted immediately as no installed English voice. Existing online/offline TTS prewarms enumeration and same-tap waits for voiceschanged/bounded polling up to3s, supports English/bare en with US preference and actual voice language; offline still localService only. Stop, hide, route/scope/unmount cancel pending reading. Real unavailable voice/engine errors retain recovery, no universal hardware success promise. Shared TS readiness helper compiles into offline public module/cache shell. No provider/key/network TTS or new dependency. [Evidence](../evaluations/groups-grammar-and-audio.md).

11/10 Speaking request: founder explicitly asks AI docs and readable plan for review **before implementation**. [Draft15](../15-speaking-practice.md) researches Gemini audio and open-source phonetic engines, records proposed scoring/VI feedback/colors/game/tasks and unresolved eligibility/calibration. Technical engine/provider/score thresholds/storage remain proposals; no Speaking runtime/model/skill install or live API tests authorized by this draft alone. Next founder review of [plan17](../KE-HOACH-FOUNDER.md#speaking-review).


## ADR-058 — Speaking: zero added cost and one readable plan (11/10/2026, direct steering)

Founder rejects the option-heavy technical plan, asks agent to select technologies, then explicitly requires100% free/no incurred charges. This supersedes the Speaking draft's self-hosted scoring/Gemini-only/engine-comparison alternatives. Hard boundary: no paid scoring API, rented inference server, billing/quota purchases or paid fallback; unavailable free resources must produce recovery, not charges. Existing app/account billing has not been inspected or changed.

Agent selects browser-local Wav2Vec2 ONNX q8 via Transformers.js/ONNX Runtime Web, local phone alignment/calibration and fixed Vietnamese advice templates. Public model-file download/cache is separate from hosted inference; no child audio upload. The selected file is around318MB, so user-triggered download/Wi-Fi guidance and feasibility-first device/memory/latency validation are required. Model output is phonetic labels, not a validated child pronunciation score. Thresholds/calibration/accepted pronunciations and supported devices remain unverified. No guarantee of ELSA-equivalent accuracy.

This records the confirmed cost constraint and agent's single proposed implementation path, **not approval to start Speaking implementation**: founder's earlier docs-before-review request still applies. SP1 after review is a local feasibility spike; no dependency/model/skill install, mic, live API or deployment in this documentation task. [Readable plan17](../KE-HOACH-FOUNDER.md#speaking-review), [technical spec15](../15-speaking-practice.md).

## ADR-059 — Speaking continuation and measured English model baseline (11/10/2026)

After ADR058's revised0đ/single-stack plan, founder explicitly says **“tiếp tục”**. This clears review-before-local-implementation for SP1 and subsequent independent code/fixture work in the reviewed scope. ADR049 still controls real browser/account/mic/data/provider API/publishing actions; no reuse of deployment permissions or billing changes.

Pin Transformers.js3.8.1 and use actual Worker CPU/WASM logits/CTC decode in an opt-in isolated CLI. espeak318MB model fails several short synthetic words; a separate full-precision Node CPU control still produces the same wrong `cat` sequence. Agent selects **robg/speako-phoneme-recognizer**, an Apache-2.0 English-TIMIT Wav2Vec2 ONNX export, revision `ad0f63cd58fc1bb1e9c261a3b4135997a31c2e58`, q8 355.216.594bytes, SHA/blank ID41 pinned in source. This is an evidence-based baseline update within the already selected browser-local architecture; not a new founder technology choice or proven child accuracy. Runtime overhead≈22MB; no application background model download/paid fallback.

Public CC-BY-SA3.0 unchanged Dvortygirl recordings show `cat/book/cup` expected phone sequences; apple/reduced-vowel handling and synthetic failures remain. Preserve all reports; CTC timing/posteriors are approximate acoustic evidence, not pronunciation probabilities/scores. **SP1 in_progress** until browser cache/download/cancel/memory/device envelope work; no mic/app score/colors/game yet, no scoring quality gate marked passed. No AI HTTP inference or audio upload, only permitted public file downloads and loopback browser GETs. [Evidence](../evaluations/speaking-local-feasibility.md).


## ADR-060 — Every concrete example has its own IPA row and listen control (11/10/2026)

Founder repeats ADR047/048 and points out missing sentence playback on the flashcard. Shared SentencePronunciation now renders exact-text whole-sentence audio beside IPA, before translation, across detail/additional/library/groups/prepare/review/grammar steps/practice; offline equivalents include sentence listening. Missing/unknown IPA remains explicit, never guessed or substituted with headword IPA; audio remains available independently. Grammar formulas stay formulas; concrete examples have their own reading controls. Generated worksheet additionally requests optional commonErrorIpa/correctionIpa, validated and stored with matching text; editing clears corresponding IPA, backup preserves it and grammar section deletion clears it. No automatic user-data migration or verified flag. Same-origin pronunciation lookup uses actual request Host to handle Next's localhost normalization, while foreign/cross-site requests remain blocked. [Local evidence](../evaluations/sentence-ipa-and-listening.md).

## ADR-061 — Optional Gemini Free Tier Vietnamese coaching from local evidence (11/10/2026)

Founder prefers personalized AI Vietnamese advice and directly confirms the chosen key/project is Free Tier with no billing. Local recognition/alignment/quality/calibration remain the chosen engine; only optional advice may use Gemini after an explicit gesture. Send target plus bounded per-word/phone diagnostic evidence; no child audio/name/library. AI cannot override scores/colors, invent missing evidence or pronounce uncertain results certain. Structured plain-text coaching with schema/index/error validation; bounded single request, cancel/timeout and fixed VI fallback for disabled/offline/quota/errors, no paid service, auto retry or key rotation. User confirmation is not a client-verifiable permanent billing guarantee; provider eligibility for child-facing use remains unresolved, and no live provider calls/account changes were made. This is updated SP2 design, not implemented mic/scoring/coaching UI. Model assets planned in separately deletable browser CacheStorage; missing/deleted model disables local assessment but preserves supported sample/record/replay. [Founder plan17](../KE-HOACH-FOUNDER.md#speaking-review), [AI spec15](../15-speaking-practice.md).


## ADR-062 — Speaking app flow and explicit account library recovery (11/10/2026)

Founder explicitly authorizes browser tests for these bugs, then asks to fix them and implement Speaking. Read-only founder desktop browser shows13 device-only words/1set and0 cloud words/0sets while signed in; no real transfer/account mutation. Local isolated fixtures cover implementation; authorization does not extend to GitHub/Vercel publishing or live AI calls.

Fresh signed-in device with no library choice opens owner-checked account library; explicit local choices remain available. Profile makes device-only status/preview-transfer reachable, account copy and focus refresh corrected. No automatic silent upload, destructive merge or change to persistent auth cookies. Photo candidates normalize deterministic POS aliases and select repeated spelling once by default; exact identity dedup at intake/save, distinct senses retained for explicit review. Existing group primary **Thêm từ, câu, ngữ pháp** opens full live picker, retaining prior members and dated metadata.

Speaking now has `/speaking` navigation, approved-library words/saved examples, gesture mic10s cap, mono16kHz finite WAV replay, cancel/cleanup, explicit≈377MB download and model-only delete. Versioned CacheStorage holds ONNX in bounded16MiB chunks with incremental SHA256/size/complete checks; single giant cache write and JS copies failed in actual Chromium and were replaced. WASM/CTC recognition stays local; CMUdict US references and deterministic alignment produce explicitly tentative per-word colors, quality abstention and VI advice. Optional bounded Gemini coaching uses existing key selection and gesture, target+phone evidence only, no audio upload or paid fallback. Model requires reliable local reference; full offline app/target lookup is not claimed. No numerical pronunciation score or validated child accuracy, physical-mobile memory/calibration or production readiness claim. This supersedes earlier statements that mic/coaching UI were not implemented; calibration gates remain open. [Evidence](../evaluations/speaking-app-and-library-fixes.md), [spec15](../15-speaking-practice.md).


## ADR-063 — Report first; signed-in mutations always account, automatic device convergence (11/10/2026)

Founder asks source/performance skill investigation and a readable report before implementation. Additional steering requires all signed-in add/edit/delete to persist in that user's database and other devices to update automatically without buttons; only unauthenticated data stays device-local, optional guest-copy question on login. This supersedes ADR062's preservation of an explicit mutable guest choice while signed in. Guest-copy consent is independent of routing new signed-in mutations to account; rejecting copy must not keep new work guest. No silent transfer/deletion of existing real lessons.

Current source still allows prior guest preference after login, resets cloud preference to guest on request failure, and background sync3s debounce/30s polling. These are diagnosed, **not fixed** in this report turn. Proposed implementation: explicit auth/scope state, account-scoped offline pending writes/ACK, shared auth check, private Supabase Realtime version notifications + existing authorized cursor pull, incremental outbox/index updates and profile count refresh. Existing HttpOnly/owner/RLS boundaries retained; no service-role/refresh/private AI key in browser. Immediate cross-device convergence target2s after server ACK proposed, not guaranteed through offline/quotas or measured achieved. Founder said localStorage for guests; actual lesson storage is IndexedDB and keeping it is recommended in report, not a confirmed migration to localStorage. No account/database/env/live AI/push/deploy changes. [Report](../BAO-CAO-PERFORMANCE-VA-DONG-BO.md).


## ADR-064 — Account luôn tự đồng bộ; WordDetail luyện nói và game riêng

Confirmed by founder11–12/10/2026 (“Sửa theo plan”, later image steering). Signed-in mutations always account, automatic send/receive; cloud/auth failures cannot become writable guest. Preserve guest source/selection and ask copy once per owner, independent of new account writes. Private Realtime notification only version; authorized cursor pull/outbox/CAS/receipts remain authority. Preference whitelist/atomic RPC and memory-only access-token bridge, no refresh token/client secrets; no real hosted/environment changes authorized. Public Welcome/404 lightweight/static, learning layout owns AppProvider/auth/library/background. Supersedes report-only ADR063 and ADR062's retained local switching. SQL0007 is reviewable local migration; initdb platform blocked, SQL verification and hosted apply pending.

Speaking per-word embeds in existing WordDetail with IPA/definitions/examples intact. Nói cùng Cáo is a finite game tile in Chơi & học, not a standalone single-word screen. Model controls only Settings, missing-pack link only; automatic endpoint/results, icon playback. Letter-to-phone groups preserve all letters (`apple`: a/pp/le) and detail bottom sheet compares reference/recognized phone with VI articulation. No ELSA paid API/branding or new paid service. [Evidence](../evaluations/speaking-refresh-and-automatic-sync.md).

## ADR-065 — Hiện phần trăm, bỏ nhãn agent tự thêm

Founder directly requests visible 0–100% and explicitly rejects agent-proposed “điểm tham khảo” label and prototype/technical copy. Implement percent only; no new approval or no-score gate imposed by agent. Existing speech-quality/unsupported checks can return no result, not fabricated0 or100. Formula:1 per matched phone,0,5 for allowed near substitutions,0 for other/missing; max(expected,heard) denominator, rounded percent; confidence does not become score. Same assessment drives spelling colors/table. This supersedes previous documents withholding numeric display until calibration. Calibration/child/physical-phone/ELSA parity are still **unverified facts**, documented in engineering evidence, not used to add rejected UI labels or claim performance that has not been measured. AI text coaching cannot change colors/points. No mock result substituted into production engine.
