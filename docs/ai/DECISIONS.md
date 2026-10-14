# Quyết định và giả định

## ADR-084 —12/10/2026: Ba nguồn hình và Google copy fallback

Founder báo OpenMoji/Commons trả hình sai cho “rulers”, yêu cầu bỏ hai nguồn và dùng Google. Sau khi biết Google trong app cần dịch vụ/API, founder chốt giữ mở link và tự copy nếu phải trả phí. Tìm mới chỉ Noto/Twemoji/Fluent; không Google API, scraping hay env Vercel mới. Shared picture picker cho thủ công/worksheet/prepare/edit; từ mới tự preview hình đầu có sẵn, không auto-save. Staged media ghi trong lesson transaction, giữ exact-sense identities/CAS/retry và ảnh đã có khi thêm trùng. Legacy media/import và metadata nguồn/giấy phép giữ. [Spec](../14-media-and-concurrency.md), [evidence](../evaluations/three-picture-sources.md).


12/10 — Tìm hình nhận ảnh riêng theo yêu cầu founder: shared WordPictureSearch có vùng kéo thả focus được, Ctrl+V/⌘V scoped vào từ đang dùng, nút Dán ảnh cho mobile và chọn file. Một ảnh JPEG/PNG/WebP dưới4MB theo upload media hiện có (server12MP, resize512, EXIFstrip/JPEG/receipt giữ). Paste chữ/URL giữ mặc định; không lấy URL ảnh để tự fetch. Clipboard không hỗ trợ/bị từ chối có recovery chọn file; multi-file/format/size sai không upload; lock chống nhận2lượt, abort khi unmount. Reuse upload ký và sense/revision/CAS, editor stage đến Save chung, Prepare lưu hình theo hành vi cũ; không AI/không đổi quota/provider/SQL/env.


12/10 — Bổ sung hình không lặp headword: founder báo are/they xuất hiện nhiều lần tại `/library/prepare`. Áp dụng projection headword + caseMode hiện có trước pagination12, sau filter approved/missing/skipped/lesson. Mỗi từ một dòng; nghĩa/POS khác nhau giữ nguyên và chọn bằng Nghĩa cần hình. Search/save/skip gắn đúng sense/revision; không bulk-copy ảnh vào nghĩa khác, không gộp/xóa dữ liệu học.


12/10 — Notifications bổ sung theo founder: mỗi item có nút thùng rác riêng (48px), không nằm trong link detail. Bấm xóa chỉ dismiss phiên bản thông báo theo scope/signature bằng IndexedDB metadata, không xóa bài/nháp/queue và không tự chọn Không sao chép. Badge/list cập nhật, popup vẫn mở; bền reload, cùng lỗi retry không hiện lại, draft/công việc mới có thể báo mới. Lỗi lưu dismiss hiện ngay action, không ẩn item/claim success.


## ADR-081 —12/10/2026: Chuông thông báo chung trên header

Founder yêu cầu bỏ lời nhắc sao chép khỏi đầu Today, gom thông báo vào một feature Notifications. Header có chuông, badge số chưa đọc và rung hữu hạn khi tập thông báo chưa đọc thay đổi; tôn trọng OS/app reduced motion. Bấm chuông lần hai, Escape hoặc bên ngoài đóng popup. Chọn thông báo mở `/notifications/[id]` với nội dung và action đúng loại.

Steering tiếp theo cùng lượt: nhắc “Bạn còn một bài đang chuẩn bị” cũng chuyển khỏi Today vào notification, detail có Tiếp tục nháp ảnh mở đúng draft; không auto-upload/AI. Draft notification dùng mọi scope guest/demo/account, receipt theo scope + draft id, sửa cùng draft không re-alert; bỏ/xong draft tự hết, draft mới unread.

Thông báo hiện tại: nháp ảnh đang chuẩn bị, sao chép thư viện guest sau đăng nhập và đồng bộ cần xử lý (mạng/lượt gửi/trùng/xung đột). Không tạo feed giả hoặc gửi lesson khi mở/đọc. Danh sách chưa đánh dấu đọc; mở detail lưu read receipt bằng IndexedDB metadata theo account scope + nội dung thông báo. Không đưa receipt vào backup/cloud. Guest-copy choice cũ vẫn được tôn trọng; Không sao chép chỉ lưu lựa chọn theo owner, giữ nguyên dữ liệu gốc. Xem trước không kết thúc lời nhắc; chỉ xác nhận copy thành công hoặc decline mới kết thúc. Sync phục hồi tự hết thông báo, retry cùng lỗi không re-alert; công việc/nội dung khác có thể báo mới. Detail tái dùng transfer preview/backup/confirm và sync conflict choices; lỗi submit giữ ngay action, không chuyển feedback form vào inbox.

Giữ Theme C, Nunito, mascot, nav và account isolation. Unknown notification route trả404; thông báo đã xử lý/khác scope có empty state. Không thêm SQL/provider/env/dependency hay sửa bài founder. [Bằng chứng](../evaluations/notifications.md).


## ADR-080 —12/10/2026: Phân tích ảnh có chia lượt và tiếp tục từ nháp

Founder yêu cầu chẩn đoán ảnh 2/curl, sửa lỗi và tối ưu context/chia calls để lấy đủ nội dung; chỉ thêm skill GitHub khi cần. Replay request gốc trả STOP, 2.387 input/2.488 output, 12 từ/1 ngữ pháp hợp lệ. Không suy context overflow từ độ dài base64 hoặc thông báo lỗi mạng. Chưa có response lỗi gốc nên chưa xác nhận nguyên nhân lần đầu.

Giữ fast path một call. MAX_TOKENS, confirmed input-context error và invalid JSON/DTO/evidence chuyển sang compact vision + enrichment tuần tự: 4 từ/lượt, đoạn ≤1.400 ký tự. Tái dùng vocabulary đã hợp lệ; sửa learning bằng text, không đọc lại ảnh. Content repair tối đa một lượt/batch rồi chia nhỏ; không retry mạng/quota/key/refusal/timeout hoặc xoay key/model. Web Lock giữ toàn chuỗi; mỗi request tối đa 60s/500KB, toàn UI 5 phút, 40 recovery calls/run. Caps 50 từ/20 learning/10.000 ký tự giữ nguyên; nguồn vượt cap phải báo cắt ảnh, không bỏ âm thầm hoặc báo success. Các remainingPassages phải là đoạn nguyên văn và được đưa vào hàng đợi.

Checkpoint chứa các chunk đã validate trong IndexedDB, giữ scope/CAS; không chứa credential/base64/thoughts. Image SHA-256 + mode/model ràng buộc resume; crop/model/mode thay đổi đọc lại, user edit hủy checkpoint. Reload/cancel/error giữ phần đã xong; Continue chỉ gọi phần còn thiếu. Review/save vẫn là explicit approval. Lỗi content/output/context/quota/timeout có copy riêng tại nút; bỏ duplicate alert và chờ AI xong mới tìm hình.

Ngữ pháp a/an/They are dùng named forms nhỏ: primary a + an/plural variants trong một unit; code gắn exact source evidence, công thức/conditions và project provenance. Ví dụ/IPA AI giữ unverified/null nếu không chắc. Supersede deadline 90s/no-retry lịch sử chỉ cho bounded content recovery; không thay quyền quota/billing. Skills worksheet/bilingual/delivery + UI/UX Pro Max/React sẵn có đã đủ, không thêm upstream mới.

[Verification](../evaluations/worksheet-recovery.md). Live smoke một ảnh do founder cung cấp, không general OCR benchmark/eligibility/free-quota guarantee. Chưa deploy; không main/Vercel env/cloud writes/founder browser.


## ADR-076 — Một lần lưu từ, phản hồi tại nút và điều hướng liên tục

Founder12/10 yêu cầu: trash đầu detail/edit; animation hết lượt quay về bước1; lưu lựa chọn bất kỳ vào nhóm; edit chỉ1submit, bỏ checkbox/text review lặp; API submit có pending/success/fail tại nút, lỗi đỏ bên trên và tại input; xóa bộ nhưng giữ nội dung; footer mọi trang không che content; empty state có hình dễ thương và bổ sung skill mobile từ GitHub.

WordEditor là một form, một thao tác Save = duyệt phiên bản chỉnh sửa. Không tạo proposal rồi yêu cầu approve lần hai. Hình trong editor được chuẩn bị và chỉ lưu cùng Save; các đường bổ sung hình khác vẫn lưu trực tiếp. updateWord dùng transaction chung + root revision/supplemental row versions: word/examples/media/content cùng thành công hoặc cùng rollback. Crypto trong saveMedia dùng Dexie.waitFor khi có transaction cha; không cho mất atomicity. Image-only edit không bắt nhập ngữ pháp hay câu mới; optional section chỉ validate khi có nội dung. Giữ exact sentence IPA/hints/provenance/grammarVariants; câu đổi xóa IPA/hint cũ. Form supplemental xóa trắng chỉ xóa row riêng đó, giữ các row nguồn khác. Không áp dụng gộp AI hoặc bỏ ownership/CAS.

Legacy grammar grouping phải giữ title/key của representative gốc, không dùng title trình bày mới làm ref persistence. Lưu riêng1grammar, thêm riêng1word vào group hoạt động; không bắt chọn hết. Exact duplicate skip/no-op/name reporting ADR075 giữ nguyên.

SubmitButton là chuẩn cho thao tác gửi/lưu chủ động: pending chặn double tap; success xanh + icon/check và lời đúng hành động; failure đỏ + lỗi dễ hiểu ngay trên nút. Input changed resets feedback; validation field-level mở/focus đúng section. Không dùng toast hoặc lộ raw provider/secret. Background sync/file picker và game answer feedback giữ semantics riêng. Profile setPreferences trả kết quả persistence để không báo success khi lỗi đã bị catch.

Trash detail/edit là icon accessible ở toolbar; bộ theo ngày có trash trong tile. Xóa lesson chỉ tombstone container+links, không tombstone words/examples/learning rows. MainNavigation chung trên learning/detail/edit/capture/session/Welcome/404/error; mobile bottom safe-area inset và sticky-save offset, desktop side nav. Không còn game-specific hide nav. Animation dừng ở cuối lượt rồi reset step0, giữ pause/manual/reduced-motion.

Empty UI dùng mascot gốc thật, heading/CTA rõ; picture preparation phân biệt chưa có từ và không còn thiếu hình, clamp trang khi kết quả giảm. Ưu tiên hình2D dễ thương, dùng asset gốc có sẵn hoặc generate riêng khi cần; vẫn giữ license/attribution và không chạy hình/code do model trả về tùy ý. mobile-responsive cài repo-local MIT/pin/source/checksum; skill không thay bằng chứng UX và không mở quyền browser/global/hooks.

Phạm vi bàn giao local theo chỉ dẫn hiện tại; không deploy/SQL/Git push/Vercel env/founder browser/account/AI thật. [Bằng chứng](../evaluations/edit-save-navigation.md). ADR049/050 và steering trực tiếp mới nhất tiếp tục chi phối từng thao tác; quyền của skill/credential không phải quyền production.

## ADR-075 — Grammar unit đầy đủ, hướng dẫn động và báo trùng chính xác

Founder12/10 yêu cầu card/icon filter; delete icon-only; grammar màu/animation/detail; cùng câu hỏi/Yes/No là1construction, generation không tách3items; save mixed selection bỏ mục trùng nhưng thêm mục mới và báo tên trùng. Search/filter vẫn inline, toolbar không ghép destructive label cạnh title dài.

Known construction be-it-yes-no regrouped deterministically by actual examples; declared grammarFamily supports reviewed future units, không fuzzy merge unrelated content. Legacy rows không sửa/xóa tự động, list/detail groups while preserving every example/IPA/analysis/evidence. Future worksheet prompt + normalizer ONE primary question with grammarVariants for related answers; source sentences remain separate. Optional structured schema fields survive archive/cloud, no SQL migration. Practice expands unit forms as questions, respects version/scope/approval.

GrammarSteps present on every grammar detail, including generic saved content: colored role chips/formula→example, short supplied VI explanations, exact example IPA/audio, finite timer animation play/pause/replay/manual steps and reduced-motion static. No AI-generated code/color HTML executed. Error/correction separated by tinted blocks. This supersedes the prior plain-text-only detail render; future UI refactors must keep the guide integration.

saveStudyGroup exact word+POS+sense/ref dedup, reports actual added count + duplicate names. Repeated membership/name = unchanged, no new version or false success. Rename/removal remain legitimate updates. Mixed70old/30new fixture shows30added/70duplicates;100repeat0added/no-op. No forced whole-batch failure from duplicates. Conflict/unavailable reference still rejects atomically to avoid data loss.


## ADR-074 — Ôn theo nhóm, Xếp câu và media có nguồn

Founder yêu cầu trực tiếp12/10. Today chia Ôn bài (đến hạn toàn thư viện gồm mọi nhóm / chọn nhóm) và Thêm từ (gõ / ảnh). Group review route chọn group rồi flashcard/group grammar nếu chỉ có grammar. Xếp câu dùng short approved example của grammar/pattern đã lưu, ghép token theo đúng câu, hints/audio/feedback/formula, không generate khi chơi; snapshot/version/CAS, idempotent attempt và pause/resume, game không tạo SRS rating. Backup/cloud JSON giữ optional grammar snapshot, SQL0008 chỉ thêm mode grammar vào check constraint.

Dictionary giữ English-only Wiktionary POS/definition khi thiếu VI,404 không coi là503; browser Gemini tự bổ sung2examples/VI và infer POS/sense khi nguồn không có hoặc lỗi. Không endpoint/key/env mới cho AI.

Search Commons cũ đã có giấy phép nhưng trả historical cartoons sai ngữ cảnh. Ưu tiên minh họa OpenMoji đúng chủ đề trước, trusted fixed-host SVG→JPEG; Commons lọc title/description phản ánh subject, bỏ political/engraving. Không khẳng định semantic quality chỉ vì HTTP200/license. Source metadata/receipt/hash giữ. User có thể tìm ngoài (Google link theo click) và chọn file ảnh đã mua/được phép, ghi source URL; User supplied không được gắn giả CC/license verified. Chỉ attribution/capture nguồn không cấp quyền sử dụng. Không tự tải ảnh bất kỳ URL hay bật paid image API. Upload normalized≤512px/500KB/EXIF strip/same-origin/quota/signature/ownership; cloud provider phân biệtcommons/openmoji/user-upload. Explicit complete-word approval rebinds same owned ready image; không tự revive revoked asset.

Recent sessions thẻ có hình/mode/date/result; grammar tile full-row. Theo incumbent Theme C, không redesign brand hoặc thêm consent gate. [Evidence](../evaluations/review-grammar-and-dictionary.md).


## ADR-072 — SQL hosted và media dùng được

Founder yêu cầu agent chạy0007, cung cấp Management token local; supersede chọn founder chạy SQL trước đó. Apply đúng file0007, verify preference RPC/trigger; không env Vercel/main/browser thật. Tài khoản thử riêng/2headless contexts kiểm automatic add/edit/delete/profile/group và cleanup. Profile không cho lưu trước account repository ready. Media không đòi env mới khi có private Supabase server key: derive domain-separated receipt HMAC, kiểm lại license/bytes/owner/version. Commons search/import bật từ thao tác tìm hình, không dùng Gemini image grounding tính phí. Bỏ prepared-picture selector; missing list có tên và tìm/dùng hình riêng. Metadata/attribution/backup/sync giữ; picture-only edit giữ approval của grammar linked.

## ADR-073 — Chọn từ, hai ví dụ và ba tab/detail pages

Steering mới nhất supersede đề xuất gộp Câu/Ngữ pháp trước đó: Từ/Câu/Ngữ pháp ba tab bằng nhau, không tab Mẫu câu; pattern-only rows đi vào grammar, không chuyển/xóa dữ liệu. Compact card chỉ structure/example, click mở /library/sentences/[itemId] hoặc /library/grammar/[itemId]; filter Tất cả/Chưa có hình inline. Chọn remote suggestion cập nhật input ngay; generation/abort bỏ phản hồi cũ. Gemini trả2distinctexamples/VI và whole-exact-sentence IPA/hint (null nếu không chắc), tự điền form không optional accordion. Không checkbox trước Lưu từ/View library. Không thêm consent/technical copy. Scoped evidence ở simple-lessons-and-live-cloud.md.


## ADR-070 — Game/Today/group UI gọn và bài phân trang

Confirmed12/10 theo yêu cầu: bỏ sound toggle, game luôn có tiếng; options select dưới accordion. Today không tìm/preview từ. Nhóm header gọn + xóa ở đầu,6bài/page riêng12items/page; filtered local snapshot không re-read mỗi query. Xóa bộ ở detail. Dữ liệu tài khoản vẫn cloud auto push/pull, IndexedDB chỉ cache; paging không đồng nghĩa mỗi trang gọi cloud. [Evidence](../evaluations/compact-games-and-groups.md).

## ADR-071 — Founder sửa lại giới hạn quyền

Founder12/10 bác diễn giải rộng ADR049: chỉ không push main, không thêm env Vercel, không tự mở browser thật founder. Agent được sửa code/DB/deploy để hoàn tất bug được giao. Supersede ADR049/publish restrictions cũ; không tự suy cấm database từ chữ local. Khi cần management credential vẫn phải cung cấp kết nối, không đánh đồng thiếu credential với cấm quyền. Founder chọn tự chạy migration0007; agent verify/prepares/deploys qua CLI. AGENTS đã cập nhật.


## ADR-069 — Card ôn bài, bổ sung chỉ ảnh, lưu nhóm gọn

Confirmed12/10/2026 theo yêu cầu trực tiếp. Ôn đến hạn card có hình/count; Nói cùng Cáo tile đứng cùng các game. Bổ sung hình không thêm mẫu câu/ngữ pháp, hiện từ thiếu và chọn hình sẵn. Sửa từ ưu tiên catalog không phụ thuộc cấu hình Commons. Chuẩn hóa POS/số nhiều được biết; unknown vẫn không đoán. Save nhóm thành công ẩn save và footer lặp; chỉnh tiếp cho phép lưu lại. Giữ CAS/dedup/provenance/license/scope. [Evidence](../evaluations/review-pictures-and-group-save.md).


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

**Historical/superseded by direct founder steering12/10:** current [AGENTS](../../AGENTS.md) has only three operation limits (no push main, no new Vercel env, no founder real browser). Database/deploy needed by the assigned task are authorized within data scope; do not reapply ADR049's old approval gate. ADR083 changes agent workflow, not those current permissions.

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


## ADR-066 — Gemini audio replaces the local pack; direct Speak, cues and Fox startup (12/10/2026)

Founder explicitly agrees to send recordings to Gemini Free Tier using the existing key, then asks to remove the355MB download entirely. Latest screenshot rejects an extra AI consent popup, reminding the agent not to add unsolicited rules/copy. Remove that dialog and Hỏi lại setting: tapping Nói requests browser mic permission directly, cues the capture, and automatically assesses at utterance end. Browser's native microphone permission still applies. No extra application consent gate or scoring/prototype disclaimer. Keep useful result detail sheet, meaning/IPA/examples and finite Speaking game; prior score-label rejection remains.

Current scorer is fixed Gemini3.5 Flash-Lite generateContent with bounded mono16k WAV≤10seconds and one request per tap. Validate plain JSON/complete known reference variant/index/score/phones; unclear has null score. No tools/Files API, retry, model/provider or paid fallback. Founder confirms Free Tier/no billing; no account billing inspection or live-key tests. Audio/results stay in memory; body excludes identity/library. Supersedes ADR058–065 local-only/no audio upload/download-pack decisions and text-only AI coaching restriction; preserves account/sync decisions and ADR049/050 permissions.

Remove Worker/prepare/dependencies/public runtime and download/delete UI. Delete only retired model-cache prefix on app entry and SW activation. Isolated old renderer peak≈1484MiB, optimization trial≈1525MiB despite reduced retained memory; suggests a memory-risk cause but is not an iPhone crash proof. Capture begins after ascending cue, finalizes/stops tracks before descending cue; contexts/tracks/requests cleaned up, no cues on load/hidden. Inline original Fox loading plus36Apple startup PNGs address document loading and Home Screen launch respectively; native share/in-app pre-document delay still requires physical testing.

20scoped unit tests and12Chromium/WebKit browser cases PASS, lint/types/build PASS; no real founder account/mic/key, live AI generation, SQL/remote writes or deployment. [Current spec](../15-speaking-practice.md), [evidence](../evaluations/mobile-speaking-startup.md). No new cost, calibration or physical-device claim based on fixtures.


## ADR-067 — Direct image analysis, one approval, automatic duplicates and key-only settings (12/10/2026)

Founder rejects AI on/off explanation, Google upload disclosure, advanced/test controls, capture consent/manual-transcription/save-draft controls, duplicate action and final checked checkbox. Implement one Cài đặt key AI button opening password input/Lưu key. Keep existing model choice in persisted configuration without exposing model picker; no test API calls. Existing remembered credentials remain remembered, fresh overrides remain session-only; clearing input and saving disables credentials durably using existing boundary. Do not silently add private key persistence or change shared public default permissions.

Editor Phân tích ảnh persists edited pixels then marks an explicit one-shot analysis action. Review consumes that action before provider request, displays progress/result directly; reload/restored draft never auto sends. No consent/private-image checkboxes. Existing read limits, image preprocessing, schema/evidence, cancellation, no retries and key/scope/CAS guards stay. Clicking Duyệt và lưu approves selected complete candidates and patterns atomically; no second approval checkbox. Exact word/POS/sense repeats automatically collapse, only actual duplicate names are displayed; existing library identities are linked without overwriting user edits, distinct POS/senses remain. Manual recovery behind Sửa chữ đọc được remains. Remove explicit save-draft UI/status only; autosave and recovery protect data.

Founder also requests removal of the whole Speaking settings block; direct Nói→assessment already authorized by ADR066. No new UI notice/gate. Supersedes prior consent/checked/advanced UI requirements only in this capture/extract/key/Speaking scope, not unrelated destructive/auth/media boundaries. Founder explicitly authorizes launcher executable bit in this repo; chmod u+x only, existing engine context/detect, no global writes/download/install/publishing. [Evidence](../evaluations/simple-photo-review.md).


## ADR-068 — One backup section, compact photo cards/review and latest lesson (12/10/2026)

Founder accepts consolidation of the duplicate backup UI and requests an illustrated photo-add card matching Type new word, closed per-word image/name accordions, one latest lesson and title editing inside dated set detail. Settings now has one full archive export and one restore entry accepting either full archive or historic text backups. Retain checksums/limits, full restore only into empty library, legacy merge/no overwrite and review pending records; never remove user-data compatibility to simplify UI.

Today has two same-system feature cards, recent lesson limited to one nonempty active set sorted by learning day then updatedAt; no inline rename. All sets remain accessible. Review words start closed, summary image/name; individual selection/edit/attribution inside. Move title/day editor to filtered-library dated-detail disclosure, preserve CAS/scope/words/schedules, remove inline editors from Today/list. [Evidence](../evaluations/compact-home-and-review.md). No schema/cloud/AI/key/deploy changes; ADR049/050 apply.


## ADR-077 —12/10/2026: Chọn nhóm, nhận diện bài ảnh và bỏ bổ sung hình

Steering trực tiếp từ founder với4ảnh: Select all trong group là toggle cho cả3loại và từng tab/kết quả lọc, giữ lựa chọn ngoài lọc. Thẻ chọn bài có hình, tên, ngày học + giờ/phút/giây tạo bài, số từ/câu/ngữ pháp và vài từ mẫu như thẻ bài trong nhóm. Bài ảnh mới không dùng tên file/ngày làm default: lấy tối đa4từ distinct đã duyệt khi lưu; giữ tên tự nhập và tên legacy nguyên vẹn. Ngày học vẫn là calendar date; giờ tạo dùng createdAt sẵn có, không đổi schema/dữ liệu lịch sử.

Kết quả lưu nhóm tách phần mint xanh các mục thêm thật và phần lilac mục trùng, cả2details đóng mặc định; no-op không báo đã thêm. Data result trả addedItems theo membership delta, giữ deterministic dedup/CAS/no-op. Word editor luôn hiển thị hình hiện tại/hình staged phía trên Đổi hình;1Save chung vẫn giữ.

Bổ sung hình có nút Không bổ sung cho từng từ, lưu preference IndexedDB metadata riêng theo scope trên thiết bị và lọc trước phân trang. Không đổi word/content/revision/approval/SRS, vẫn đổi hình qua word editor. Preference này hiện không đi qua backup/cloud; không claim đồng bộ thiết bị. Layout card gọn, rõ word/VI, mascot gốc và actions không tràn ngang.

[Evidence](../evaluations/group-picker-and-pictures.md). Local only; không deploy/SQL/env/main/founder browser/AI thật.


## ADR-078 — Mobile app UX skill selection, not responsive-only (12/10/2026)

Founder rejects the2-star responsive skill and requires reputable/popular, widely adopted sources for real mobile UI/UX. Retire mobile-responsive package and active routing, preserve ADR076 historical evidence. Reuse pinned UI/UX Pro Max as primary mobile design skill, Impeccable for visual polish: hierarchy/navigation/touch feedback/forms/safe areas/states/motion, applied to existing Next.js PWA/Theme C. Expo official native skills and popular community mobile-design collection reviewed but not installed: stack fit and instructions matter alongside popularity. No duplicate install or runtime migration.

Before accepting skills verify source/maintainer, dated public stars/forks/activity, license, actual contents and scope/stack. Do not claim stars measure active users or skill installation is UX validation. Details and scoped checks: [mobile UX research/routing](../skills/MOBILE-UX.md). No app, cloud, browser, hook/global, AI or deployment actions in this task.

12/10 ADR077 steering bổ sung: picker mới nhất lên đầu cho word/sentence/grammar/lesson bằng createdAt, không tên/learnedOn/updatedAt. Giữ grouping ngày; thứ tự ngày theo bài tạo mới nhất, trong ngày giảm dần. Dedup representative/ref không đổi; projection only. [Evidence](../evaluations/group-picker-and-pictures.md).

### ADR078 — kết quả rà soát toàn bộ skill12/10/2026

Áp dụng policy nguồn nổi tiếng/nhiều sao/uy tín cho mọi skill upstream mới. Public REST audit10repo, đọc pinned SKILL/frontmatter và references/license theo scope: mblode chỉ144sao/13forks nên gỡ cả product-design và ui-animation; mobile-responsive đã gỡ. Giữ12upstream từ nguồn vendor/maintainer rõ và cộng đồng lớn cùng3custom đúng yêu cầu riêng. Không tự đặt ngưỡng sao thành yêu cầu founder hoặc coi stars là active users. Interaction chuyển UI/UX Pro Max + Impeccable shape/operate; motion chuyển LottieFiles + Impeccable animate. Không cài trùng, không đổi UI/runtime; các quyết định sản phẩm/rule IDs/evidence cũ giữ lịch sử. Inventory, source catalog, routing04/13/START-HERE và founder plan đã đồng bộ. [Bằng chứng nguồn và quyết định từng skill](../skills/MOBILE-UX.md).


## ADR-079 —12/10/2026: Chỉ Từ và Ngữ pháp, ví dụ nằm trong bài

Founder trực tiếp yêu cầu bỏ tab/list/luồng thêm Câu độc lập khỏi mọi page; Words và Grammar chia đều2tab. Ví dụ câu trong từ và ngữ pháp vẫn lưu/xem/IPA/audio bình thường. Supersede phần3tabs và add standalone sentences ởADR056/057/072/073/077; không thay các yêu cầu về ví dụ/whole-sentenceIPA/source-evidence/backup/cloud.

Library và group detail/list bỏ sentence mode/count/action; group editor chỉ words/grammar/lessons, select-all chỉ2loại. UI save lesson/day truyền includeSentences=false, không tạo refs câu độc lập từ bài; vẫn thêm word và grammar đúng số. Legacy sentence refs giữ nguyên senseId/key khi sửa group; không xóa/rewrite data ngoài yêu cầu. Storage examples/learning/source sentences/cloud/backup giữ nguyên. Query mode=sentences trở về words; bookmark /library/sentences/id mở word chứa ví dụ, không render sentence detail riêng. Review demo bỏ sentence tab, Photo review/Today dùng copy2loại. Grammar Xếp câu vẫn giữ vì là game luyện ngữ pháp, không standalone sentence library.

[Verification](../evaluations/two-learning-types.md). Local only/chưa deploy.

## 12/10/2026 — Tìm từ đúng mục và nhận dạng nhiều ảnh theo yêu cầu founder

Founder báo từ lặp, query “are” trả nhiều mục không liên quan và yêu cầu tô nổi text đang tìm; muốn thêm nhiều ảnh một lần. Library UI search được giới hạn vào tên từ/cụm từ và nghĩa Việt, khớp từ đầu token với prefix cho nhập dở; không dùng examples/definitionEn/lesson title để tạo kết quả từ. Query có dấu/không dấu và hoa/thường cùng khớp, highlight giữ đúng text gốc. Generic search/deck picker vẫn giữ contract cũ. Read projection nhóm theo canonical headword + caseMode, mỗi tên một hàng, các nghĩa/POS/IDs có link riêng; không dùng AI semantic merge, không rewrite user data hoặc SRS. Group/filter trước pagination, chỉ hydrate examples/media cho page hiện tại.

Multiple upload/drop tới10ảnh/đợt (bounded memory/quota), giữ10MB/20MP/header validation/normalizeJPEG/strip metadata cho mỗiảnh. Từng ảnh có capture draft/source/prepared/transform riêng và batchId/order optional trên record hiện có, không schema/SQL migration/cloud upload. Invalid file báo filename và giữ các ảnh hợp lệ; không bỏ cả đợt hoặc âm thầm bỏ ảnh. Batch preview có edit/crop/add/delete, một action phân tích pending photos tuần tự. Dùng Gemini adapter/recovery/WebLock hiện có, không rotate key/model, stop-on-quota/error/cancel;60s/request và5min/photo giữ. CAS bảo vệ capture version và learningDraft version, progress checkpoints được lưu vào local drafts; quota/hủy không làm mất ảnh đã xong. Reload chỉ khôi phục UI, không tự gửi AI; Continue bỏ qua completed/saved photos. Crop thay đổi làm kết quả cũ pending nhưng không xóa trước kết quả người dùng; metadata edit không tự làm mất review. Lưu vẫn review/approve riêng ảnh→existing deterministic saveLesson, cùng từ cùngsense chỉ tăng source link, không tạo từlặp. Xóa capture draft xóa đúng pixels/review draft của ảnh đó, không xóa bài/từ đã lưu.

Giữ tất cả thay đổi pre-existing ADR079/080 và media work khác trong workspace. Không quyền founder-browser/env/main mới, không gọi AI thật/deploy/cloud/SQL trong lượt này. [Verification](../evaluations/search-and-batch.md).

## ADR-081 —12/10/2026: Game hình dùng ảnh hợp lệ và tìm nhiều nguồn free

Founder trực tiếp yêu cầu picture-word/word-picture chỉ chơi word có hình và mở thêm nguồn free, tham khảo app tiếng Anh. Validate resolved art của targets+distractors, including owned media approval/revision; revalidate session trước mutations/resume/liveUI. Không hình vẫn dùng game chữ/flashcard, không ghi điểm từ stale images.

Search dùng catalog trước rồi Commons; thêm3pinnedsourceSVGcatalogs GoogleNoto2D Apache2, Twemoji graphicsCCBY4, MicrosoftFluentFlatMIT. License đúng image-directory khác font/code. User chọn hình; boundedfetch/signednormalizedJPEG/scope/CAS/provenance/backup/cloud giữ. Tìm thêm trên mạng mở Commons dù đã có candidatecatalog. Openclipart/Openverse là link tìm thủ công+revieworiginallicense/upload, không APIimport thiếu verification. Không chỉ cho dùng ảnh free: purchased/user-ownedupload vẫn có. Duolingo originalart/Quizletgallery+historicalFlickr/BritishCouncilcopyright nghiên cứu primary, không lấy ảnh của họ làm freeasset. [Evidence](../evaluations/free-picture-sources-and-games.md).

12/10 ADR081 steering tiếp: founder thấy3nguồn mớiđẹp, yêu cầu ưu tiên khi search hơn2nguồn cũ. Ranking GoogleNoto→Twemoji→MicrosoftFluent→OpenMoji→Commons; không rewrite selected artwork.

## 12/10/2026 — dán tiếp từ editor và chia request cho nhiều ảnh từ đầu

Founder phát hiện paste ảnh1 chuyển editor rồi không nhận ảnh2, đồng thời hỏi chống overflow10k và lấydata dần. Supersede giới hạn paste chỉcapturepage và batch fastpath10k ởcheckpoint trước. Editor/batch dùng cùngimage-paste hook: image files được chặn default và append, text paste khôngpreventDefault. Editor persist pixel/metadata/CAS trước attachBatch optional metadata để giữ ảnhđầu cùngbatch với ảnhmới; không tạoảnhgộp hoặcghiđèsource. CtrlV/⌘V, clipboardbutton và chọnthêmfiles dùng normalizer hiệncó/10MB/20MP/stripmetadata. Batch vẫnmax10 và explicitanalyse/review/save.

Batch analyser truyền chunked=true choadapter hiệncó; từng ảnh đọccompact6k từđầu, enrichword4/lượt4k, grammar≤1400chars/3items/lượt7k. Singlephoto path vẫn10k+fallback nhưADR080. Independentrequests khôngcộng tấtcảảnh thànhmộtresponse10k. SSE transport vẫn dùng streamGenerateContent nhưngpartialJSON khôngcommit; chỉvalidatedchunkscheckpoint vàoIDB. Failedcontent repairmộtlần rồisplit4→2→1/shorterpassage, network/quota khôngretryloop.50words/20learning/10000text,40recoverycalls/run,60srequest/5minphoto giữ; source-truncated/contextlimit báoeditcrop thayvì claimfullsuccess. KhôngcamkếtOCR/providerđọcđủmọichữ, cũngkhôngclaimstreamingbỏgiới hạnoutput. Theo [Gemini API](https://ai.google.dev/api/generate-content), MAX_TOKENS nghĩađãchạmmaxOutputTokens; [structured streaming](https://ai.google.dev/gemini-api/docs/generate-content/structured-output) nhậnpartialJSON vàcần ghéplại trướcvalidate.

[Bằng chứng vàgiớihạn](../evaluations/continuous-paste-and-chunked-photos.md). Giữpre-existingnotification/media/appwork; khôngmain/env/deploy/cloud/SQL/founderbrowser/liveAI.

## 12/10/2026 — bỏ các hàng nghĩa lặp và tiếp tục tìm hình khi nguồn rỗng/lỗi

Founder muốn bỏ hai subcards noun·ông / verb·là lặp dưới word card. Library chỉ một card với word/meaning, không count2nghĩa hoặc subcards. Detail chooser collapse nhãn POS+VI giống nhau ở projection, ưu tiên ref hiện tại; sense records/English definitions/examples/provenance/sources/SRS/backup/cloud giữ nguyên. Nghĩa thật khác vẫn reachable trong detail, không semanticmerge hayxóa userdata.

Metadata tìmhình tự động theo Noto/Twemoji/Fluent/OpenMoji catalog (giữ ưu tiên founder) rồi Commons nếu catalog chưa có. Source report trongAPI phân biệt catalog/network, found/empty/error, code safe/httpStatus/query và counts. Cảempty/filtered/queryerror thửquery kếtiếp; Commons HTTP200error cũng làprovidererror, không coi làempty; khôngcache failure, emptycache30s, success5min/inflight8 giữ. Status200 empty khác503 unavailable; client đọc JSON lỗi trước status, hiển thị nguồn có lỗi, details nguồn đóng mặcđịnh vàTìmthêmmạng luônreachable kểcảzeroresults. Import thấtbại báo tênnguồn, giữhìnhhiệntại/candidates; khôngtựapprove mộtảnhthaythế. Khôngrawproviderpayload/cookie/key trongAPI/UI/docs.

They với sense đềcập pluralpeople dùng concept peopleholdinghands từcatalogpinned đãcó, vẫncho người dùngchọn/duyệt vàgiữlicense. Khônggắn nócho are hoặc nghĩa they chỉthings. Local guest replay body curl founder khôngcookie: trước200 candidates[], sau2002candidatesNoto/Twemoji+sourceattempts;2imports normalizedJPEG/license thậtPASS, khôngghi founderdata. Openclipart/Openverse vẫnmanuallinks, khôngclaim APIfallback đãtíchhợp hoặc tìmhết mọi nguồnInternet. Quota/consent/owner/receipt/SVGguards vàscope giữ; khôngSQL/newenv/deploy/main/founderbrowser. [Bằng chứng](../evaluations/simple-word-cards-and-media-fallback.md).

## ADR082 — 12/10/2026: nhiều ảnh đọc trước, duyệt và lưu một bài chung

Founder bác luồng review/save riêng từng ảnh và yêu cầu hành vi giống một ảnh: preview tất cả ảnh ở trên; nút phân tích cuối danh sách; lấy từ của tất cả ảnh rồi mới tra nghĩa, lọc trùng word và grammar toàn bộ; một danh sách duyệt và một lần submit. Supersede phần batch trong search-and-batch/continuous-paste.

Dùng cùng ExtractForm/saveLesson, thêm coordinator compact-scan-all → global headword/context dedup → bounded word enrichment → grammar/source-sentence processing → one shared review. Nghĩa/POS khác giữ, grammar chỉ gộp construction/form xác định; source sentences và evidence riêng giữ. Không auto-gộp/sửa bài đã lưu. Source/model/mode snapshot + CAS/checkpoint ghi trước request tiếp, atomic snapshot guard khi save và receipt idempotency giữ dữ liệu. 10 ảnh/50raw per-image/500raw toànđợt; source-limit chặn complete, không bỏ chữ âm thầm. Mở max200 learning cho một lesson để không cắt về20 của single image; provider requests vẫn bounded nhỏ, không một JSON tổng10k.

[Bằng chứng, lệnh và giới hạn](../evaluations/merged-photo-lesson.md). Chưa deploy/liveAI/phone/hosted sync trong lượt này.

## ADR083 — 12/10/2026: founder duyệt workflow coding AI Gọn và context theo nhu cầu

Sau audit/preview2 và thêm systematic-debugging theo yêu cầu, founder nói “ok làm đi”: triển khai WF1/WF2 của WORKFLOW-OPTIMIZATION-PLAN. START/STATE/TASKS giữ current, checkpoint archived losslessly; AGENTS/current spec/explicit steering có thẩm quyền, history lookup only. Delivery/handoff/skill lock đồng bộ. Không append feature handoff vào ba file hoặc tạo competing ledger.

Runner scoped dùng shared config, discovery nonzero, snapshot/output riêng không .env, credential fixture, commit+contentfingerprint/portownership/stale guards; dev trước, final productionbuild khi ADR050 cần. Default release inventory không bỏ spec mới, cloud/no-demo đúng fixture, live media opt-in; không giảm full CI/SQL release gates. Không tự thay product/framework/font/nav, hooks/global/providerquota hoặc refactor toànapp. WF3 đo trên task thật, WF4 chỉ khi có hotspot evidence; không hứa actualtokens/time savings từ bytes hoặc upstream stars. Quyền12/10supersede ADR049 giữ.

Nguồn có hiệu lực: [AGENTS](../../AGENTS.md), [workflow](WORKFLOW.md), [source review](../skills/WORKFLOW-SKILL-REVIEW.md); [implementation evidence](../evaluations/ai-workflow-optimization.md).


## ADR084 — 12/10/2026: ưu tiên ba bộ ảnh rồi mở rộng web và ảnh user tự gắn

Founder chốt ưu tiên Google Noto/Twemoji/Microsoft Fluent; thiếu thì tìm ảnh trên mạng, user tự gắn. Mở rộng Commons từ cartoon sang ảnh chụp đúng subject, giữ OpenMoji và hai query bounded hiện tại. Khi automatic empty/error, hiển thị ngay web search + paste/upload thay vì giấu trong disclosure. Không ràng buộc ảnh user vào catalog/license CC; lưu nguồn tùy chọn và `User supplied` trung thực. Tự động tìm trên Commons, website khác user chọn/dán/upload; không claim một API tìm toàn bộ Google/web.

MIT dự kiến áp dụng cho code; không thay giấy phép asset bên thứ ba hoặc suy miễn phí/user-action thành quyền sử dụng. Automatic provider metadata/receipt, review/common Save, ready decode game và ownership/CAS giữ. Quyết định này mở rộng style fallback trong ADR081/14, không đổi dữ liệu học hoặc provider quota. [Evidence](../evaluations/web-picture-fallback.md):23unit+integration/12productionUI/lint/types/build PASS; chưa live web/device/deploy.


ADR084 follow-up12/10: founder yêu cầu nút tìm web riêng khi ảnh catalog có kết quả nhưng không phù hợp. Shared picker luôn hiện Tìm ảnh trên web trước results, Google query theo từ hiện tại, click mở paste/upload và giữ hình/results cũ.8devUI mobile/desktop+lint/types PASS; không claim Google chính xác hơn hoặc production build/deploy cho addition này. [Evidence](../evaluations/web-picture-fallback.md).


## ADR085 — 12/10/2026: UX/UI simplification and add-only group preparation

Founder approved all four phases of [UX proposal](../DE-XUAT-UX-UI.md), then asked that bulk selection/unselection in group addition touch only new items and duplicate headwords display once. Reading/search first, collapsed library management, secondary pronunciation/example edit sections, one common Save with local feedback; ratings before long explanations; photo review summary shows meaning and explicit selection; all preview photos before analysis and one atomic review/save stay intact.

Groups: saved members are locked in the add editor. Filter/page/global operations only affect pending new members; successful save makes additions protected too. Transaction `preserveExisting` unions baseline membership before validation, preserves source assignments and CAS. Missing/deleted/unapproved retained content produces safe failure, never silently removes saved references. Headword+caseMode projections collapse displayed rows; separate senses/POS and source records remain, with explicit per-sense access. General `saveStudyGroup` callers retain replacement semantics unless opting into add-only.

Audio: remove practice's forced sound=true and literal playback enablement. Retain existing account `sound` for requested voice; separate tiny per-device game SFX preference, migration from legacy mute, retry/storage error and OS/app reduced-motion policy. No SQL/server preference change, auto audio, music, provider calls or parent gate. Motion is functional, finite; manual grammar steps stay available and timers stop under OS/app reduction. Theme C/Nunito/Cáo and four main navigation destinations retained. [Evidence](../evaluations/ux-ui-implementation.md).


## ADR086 — 13/10/2026: random toàn kho và loại trùng chỉ ở từ tổng

Founder yêu cầu game nhận đủ từ/ngữ pháp mới thêm và random mỗi lượt; bộ custom chọn từ phải lưu được; xác nhận gom31nhóm từ cùng nghĩa rồi chốt **chỉ gom kho tổng, giữ bản từ trong từng nhóm/bài**. Source senses không bị xóa/gộp, lesson/deck memberships và accepted history không đổi. Shared identity lưu dưới tag nội bộ `global-word:<opaque key>` trong metadata có sẵn; scope+lexeme+POS vẫn giữ boundary.31nhóm hiện có được founder cho phép cụ thể; nội dung mới chỉ chia sẻ aggregate khi POS và cả EN/VI trùng chính xác sau NFKC/case/space normalization. Không AI semantic merge cho nội dung khác; sửa nghĩa/POS/lexeme tách lại aggregate. Không thêm SQL schema/env.

`LibraryWord.groupMemberships` và `lessonMemberships` là projection live từ toàn bộ aliases cùng scope và memberships hiện có, có ID/tên để mở đúng nhóm/bài; không freeze tên nhóm vào backup/session. Global library/custom picker/game chỉ lấy một mục trên aggregate; group catalog/detail vẫn đọc đầy đủ source IDs, construction/examples riêng vẫn giữ. New sessions shuffle full eligible pool, max10questions/Speaking5, và picture choices shuffle; pending sessions vẫn giữ snapshot để resume. Media approval/load và grammar token/content-version bounds không bị bỏ. Tên bộ custom không bắt buộc, default “Bộ thẻ của con”; Save vẫn có pending/success/error. [Evidence](../evaluations/game-pools-and-global-words.md).


## ADR087 — 13/10/2026: game gõ 1–3 chữ thiếu cho bé

Founder thấy Gõ cả từ quá khó và yêu cầu thêm game như worksheet baby với1–3ký tự cần điền. Thêm mode `missing-letters` / Tìm ký tự thiếu riêng; giữ các game hiện có. Full approved aggregate pool, round≤10; eligible ít nhất2chữ ASCII và tổng≤80ký tự để vẫn có context nhìn thấy. Hidden positions random/unique/sorted,1–3và ít hơn số chữ; không giấu space/punctuation. Inline touch-size inputs cộng bank chứa chữ thiếu đã shuffled (có chữ lặp), gõ hoặc chạm; typing auto-next/backspace/paste, IME Enter guard. Tapping bank không tự mở bàn phím. Nghĩa và hình sẵn có; audio chỉ đọc từ gốc.

`Question.missingIndices` optional cho backward compatibility; session mode mới phải có mask hợp lệ, archive/cloud validator kiểm không giấu hết hoặc duplicate/out-of-range. Repository check nhận đúng chuỗi chữ thiếu, không chấm cả từ; durable position/snapshot/version checks và one-attempt/CAS giữ. Không rating/SRS/memory claim. Offline dùng helper transpiled chung, manifest/cache version gồm module mới. SQL0009 chỉ mở rộng check mode, giữ rows/RLS/account boundaries; đã apply/verify hosted và kiểm rollback temp fixture six old modes/new mode/invalid. UI chưa deploy. [Evidence](../evaluations/missing-letters-game.md).


## ADR088 — 14/10/2026: phạm vi game rõ ràng, replay đúng lượt, ôn ngữ pháp nhẹ

Founder yêu cầu thấy đang chơi theo bài/nhóm/tất cả, có reset về tất cả, chơi lại chính game với các từ vừa ôn và giữ phạm vi khi thoát. URL là lựa chọn hiện tại; session lưu optional filter IDs/flags, tên đọc từ dữ liệu hiện tại theo scope. Hub/session/result đều hiện phạm vi. Đổi bài hoặc nhóm bỏ lựa chọn bài/nhóm/từ trước, các flags từ đến hạn/cần luyện vẫn hiện rõ. Ôn tất cả bỏ toàn bộ filters, không xóa session/SRS/content. Hiển thị lượt sau khi URL canonical đổi xong để reload tức thì không mở nhầm lượt cũ. Replay copy chính snapshot câu hỏi, shuffle thứ tự, tạo IDs mới/reset progress; toàn bộ words/grammar/media phải còn hợp lệ. Lượt cũ thiếu filter không tự suy tên bài.

`grammar-card` bổ sung trước thử thách Xếp câu. Ôn câu đã duyệt có exact sentence IPA/audio, mở nghĩa/điều kiện/phân tích Việt và GrammarSteps finite/manual/reduced-motion; thiếu giải thích có fallback rõ thay vì AI bịa. Reveal là điều kiện trước self assessment Con hiểu rồi/Cần xem lại; CAS/one attempt và supporting-word revision vẫn giữ. GameAttempts có optional understood; weak-word filter bỏ self assessment grammar để không biến từ thành cần luyện spelling. Không review event/rating/SRS/memory claim. Archive/cloud validator bảo toàn scope/giải thích/new mode, từ chối grammar-card thiếu grammar snapshot. SQL0010 chỉ mở rộng mode constraint; hosted rollback fixture+constraint verified. Offline fallback chỉ resume modes nó hỗ trợ. Speaking dùng cùng word eligibility/filter, replay giữ queue. [Evidence](../evaluations/game-scope-and-grammar-cards.md).


## ADR089 — 14/10/2026: quản lý lượt dở, xem lại giữ tiến độ, lịch sử trong Hồ sơ

Founder phản ánh không xóa được lượt dở, Cần xem lại tăng progress và lịch sử chiếm nhiều chỗ. Mỗi lượt dở có Xóa lượt với pending/error tại dòng, tombstone theo scope/version và giữ learning data. Cần xem lại lưu checkedCorrect=false trong session, giữ position/revealed và không append gameAttempt; khi Con hiểu rồi mới append immutable attempt và tiến câu. Giữ invariant answers.length=position và không đổi archive/cloud schema. Lịch sử đã hoàn thành nằm trong details đóng mặc định ở Hồ sơ, mở lại kết quả/replay qua canonical session URL. [Evidence](../evaluations/session-controls-and-review-progress.md).


## ADR090 — 14/10/2026: xem lại chuyển câu và luyện lại, bài nhóm, lịch sử 10/trang

Founder làm rõ ý trước: Cần xem lại phải tăng tiến độ **và chuyển câu**, cuối lượt gom câu muốn xem lại để làm lại riêng. Thay phần giữ câu của ADR089; lưu immutable attempt một lần/answer rồi tiến position, retry lấy subset questionIds đánh dấu sai/tự muốn xem lại từ lượt gốc, reset IDs/state và giữ filter. Không đổi word SRS vì self assessment grammar.

Bỏ Tùy chọn chơi gây khó hiểu; chọn phạm vi qua bài/nhóm, reset Ôn tất cả. `filter.set` optional trong group URL/session giữ chính GroupSet wordIds/grammarKeys, gồm cả fallback day set, dùng chung game/Speaking. Tên đọc scoped live; mất set báo không khả dụng. Không suy group+lesson intersection bằng mọi từ của lesson vì có thể kéo mục thuộc set khác.

Ảnh bài nhóm/editor dùng artWord sở hữu media, không dùng title hay empty string và không nới approval/license/revision. Save add-only giữ members cũ ở merge riêng, xử lý và thống kê duplicate chỉ input additions/lesson/day vừa chọn. Xóa lượt nằm trong card với hai sibling controls, tránh nested button. Lịch sử Profile10/page theo IndexedDBv5 additive index scope+createdAt, default closed chỉ count; mở/page mới limit10, không giữ toàn bộ snapshots trong React. [Evidence](../evaluations/review-retry-group-lessons-and-history.md).


## ADR091 — 14/10/2026: chỉ lượt đã làm mới đang dở, tên phạm vi và chia game

Founder không muốn mở nhầm rồi thoát tạo card0/10. Snapshot tạm giữ reload trong lượt; resume chỉ khi answers/position>0 hoặc checkedAnswer đã có (giữ feedback trước Next). Reveal/hint không tính. Explicit exit dùng transaction đọc latest scope và discard chỉ snapshot chưa làm; không cleanup React unmount vì StrictMode/concurrent tab có thể làm mất lượt. Snapshot chưa làm cũ/thoát qua route khác bị ẩn khỏi resume; không tự xóa learning, events hoặc lượt thật.

Card giữ cấu trúc: game là heading, tên nhóm/bài/group-set/từ trong copy column, wrap tên dài; scoped live lookup, không tự đoán nguồn lượt cũ. Hub chia Words gồm Speaking và games từ, Grammar gồm Nghe & hiểu/Xếp câu; giữ tiles/font/nav/filter. [Evidence](../evaluations/started-rounds-and-game-sections.md).


## ADR092 — 14/10/2026: giữ lựa chọn ôn khi rời route

Founder yêu cầu quay lại Chơi & học vẫn đúng bài đang lọc; Ôn tất cả là thao tác bỏ filter. Lưu `PracticeFilter` đã validate trong IndexedDB metadata `practice-selection:v1:<scopeId>`, riêng từng library, không sync/backup hay lưu session/progress vào selection. URL filter mới và snapshot khi mở session thay lựa chọn; route hub/Speaking thiếu filter khôi phục trước render/game start, không tự mở due round khi restore. URL session cụ thể vẫn ưu tiên. Reset await ghi `{}` rồi đổi URL; lỗi storage giữ lựa chọn và cho retry, không báo thành công giả. Nội dung và lịch sử học giữ nguyên. [Evidence](../evaluations/persistent-practice-selection.md).


## ADR092 — 14/10/2026: đáp án trong bài trước, giọng đọc tự phát cho game Words

Founder yêu cầu snowy chọn cùng sunny/rainy, chỉ bổ sung từ kho khi thiếu3lựa chọn. Target pool vẫn đúng filter; distractor priority dùng bài/nhóm/group-set (không giới hạn một target hay due/weak), sau đó fallback approved/loadable distinct word/art/meaning trong kho. Không đổi user content/SRS/media boundaries.

Founder cho phép Words có nút Nghe tự đọc câu mới. AudioControl autoPlay opt-in cho word controls/Speaking game, voice preference vẫn tắt bền, route/hide/stop abort pending voice và cleanup timer; ngoài game/Grammar manual, reverse card không đọc đáp án English trước reveal. Listen button giữ replay/recovery nếu browser/voice chưa cho tự đọc. Không claim physical-device universal autoplay. Copy Settings thay câu no-autoplay cũ. [Evidence](../evaluations/started-rounds-and-game-sections.md).


## ADR093 — 14/10/2026: IPA/hint ngay dưới từ, bản thu mở và nghe chậm rõ

Founder yêu cầu IPA+cách đọc chữ Việt dưới từ trong Nói cùng Cáo, nút nghe chậm như WordDetail và tìm nguồn sound chuẩn/free, có hỏi Cambridge. Cambridge hiện yêu cầu cấp phép audio cho ứng dụng; chưa có quyền dùng miễn phí nên không scrape/hotlink bản thu Cambridge. Chọn exact US pronunciation từ Wiktionary→Commons với metadata tác giả/giấy phép mở, attribution/source visible; không xem free API hay nghe được trên web là license. Thiếu nguồn/mạng/phát lỗi giữ device voice, nhãn thật; không paid provider. Nghe1.0/chậm0.6, bản thu giữ pitch; TTS có cùng rates nhưng device timing cần kiểm riêng. IPA/hint giữ content/version, chưa có dùng nguồn/CMU tham khảo chỉ để hiển thị; không rewrite user data hay chấm pronunciation bằng bản thu này. [Spec15](../15-speaking-practice.md), [evidence](../evaluations/speaking-reading-and-open-audio.md).

ADR093 follow-up14/10: founder yêu cầu che các link nguồn khỏi màn học. Audio credit/license/source và IPA provenance giữ trong native details mặc định đóng (Nguồn phát âm/Nguồn IPA), chỉ mở khi muốn xem; không xóa attribution hay metadata.

## ADR094 — 14/10/2026: chấm phát âm v2 do client tính, tách logic và pilot chất lượng

**Accepted14/10; follow-up15/10: A implemented_local/scoped verified, B quality_pending.** Founder duyệt [plan cuối](SPEAKING-ASSESSMENT-UPGRADE-PLAN.md) và yêu cầu viết [hướng dẫn Codex](SPEAKING-ASSESSMENT-IMPLEMENTATION.md) trước khi code. Chỉ thay contract/score/coaching và quy trình kiểm chất lượng Speaking; không thay engine/provider/model/key/audio-source, không parent gate hoặc tải local355MB.

V1 có lỗi tính nhất quán đã probe: provider score100 vẫn được ưu tiên dù phones có missing. Nguyên nhân model nghe sai thành match chưa được chứng minh. V2 provider chỉ trả audibility/variant/phones/insertions; client validate strict, chuẩn hóa substitution gần/xa, tự tính `(M+0.5R)/(N+I)×100`, uncertain→null và có lỗi→tối đa99. Client chọn một mẹo VI đã rà theo loại lỗi/vị trí; bảng giữ đủ chi tiết, insertion không được che bằng toàn chữ xanh, replay đúng WAV gửi chấm. Không gộp các phoneme khác nhau để biến thành match.

Mốc A là code/UI scoped verified; mốc B là pilot100clip split theo người, nhãn hợp lệ, tối đa300request, gate định lượng tổng+tầng trẻ tại plan mục7. Thiếu dữ liệu/quota không chặn A, không được báo B pass từ fixture. Khi task triển khai được giao, live pilot có điều kiện dùng nguồn/nhãn/key được phép trong budget đã chốt; không cần xin lại các lựa chọn đã duyệt, không tự thu dữ liệu riêng tư/mua dịch vụ/thay billing. Hạ gate sau khi xem held-out, fallback ngầm hoặc chỉnh prompt vô hạn đều không thuộc plan.

ADR094 supersede phần điểm provider/advice tự sinh và giới hạn fixture-only cũ của ADR066 cho pilot có điều kiện; giữ một request tối đa/lượt, không auto retry, bounded I/O, no persistence/SRS và cancel/ownership/license boundaries. ADR093 nghe mẫu/IPA/hint/nguồn thu gọn giữ. Nếu fail nhận âm chỉ so sánh engine trên bằng chứng trước quyết định kiến trúc khác; fail quota/latency không tự kết luận engine sai. [Spec15](../15-speaking-practice.md).

Follow-up15/10: đã triển khai strict v2/client score/VI/replay và benchmark tooling; sửa CMU stress AH1/2→ʌ, AH0→ə, ER0→ɚ chỉ reference runtime.48unit+8tool+14productionUI/lint/types/build PASS.8live engineering probes gồm false match cap→cat và invalid output;2prompt candidates đã dùng, dừng tuning, không hạ gate. B cần100clip human/child có nhãn/nguồn hợp lệ; không báo chất lượng đạt. [Evidence](../evaluations/speaking-assessment-v2.md).

## ADR095 —15/10/2026: luôn có điểm cho lượt đã thu, nhận âm không đáp án và bounded latency

Founder báo SP-SCHEMA và thời gian chờ không chấp nhận, trực tiếp yêu cầu điểm kể cả0. Supersede ADR094 ở contract/runtime null/tuning restrictions; không đổi engine/model/key, no paid fallback/persistence/SRS.

V2 JSON MIME-only+provider expected/heard/status/reference exact matching dễ tự mâu thuẫn; đổi sang v3 schema-enforced heard stream. Không gửi đáp án/targetphones sang Gemini sau live control cap→cat100 khi có target; client chọn whole variant/align rồi chấm. Không loại các âm thừa; uncertain0credit, wholeunclear0. Lỗi hệ thống tạm0 kèm nhãn thật, không tạo fake diagnosis. Giữ mic cancel/no attempt và skipped riêng.

Short voice dưới180ms nhưng voicedMs>0 bị kẹt10s ở endpoint cũ. Nay voice≥100ms + silence550ms, no sustainedspeech2.5s; request6s (trước30s), reference3s, minimal thinking/compact payload, không retry tự động. Endpoint và request caps khác end-to-end latency. Pilot metrics phải không tính numeric0unclear hoặc error là acoustic coverage.

Founder-directed engineering revision dùng thêm6request (5CLI+1isolated browser), tổng15; template offset15/còn285. Không tự tuyên bố đạt100human/child hoặc Google child eligibility. [Spec15](../15-speaking-practice.md), [evidence](../evaluations/speaking-zero-and-latency.md).

## ADR096 — 15/10/2026: Share A/B, nội dung chỉ đọc và chung tiến độ thư viện

**Founder15/10 đã giao làm toàn bộ để manual test; đã triển khai.** Scope hiện hành ở [flow tiếng Việt](../CHIA-SE-THU-VIEN-FLOW-FOUNDER.md), [implementation](LIBRARY-SHARING-IMPLEMENTATION-PLAN.md), [evidence](../evaluations/library-sharing.md).

- Settings Share A cho một/nhiều email đã đăng ký app; Google xác thực nhận lời mời trong NotificationBell. B tạo QR/mã10chữ/số nhập tay cho TV/máy không camera; optional email đưa kết nối vào notification, mỗi recipient một pairing riêng. Không SMTP. Open/read/dismiss chưa nhận quyền hoặc consume mã.
- Người nhận chỉ đọc/học nội dung, không sửa/xóa/reshare; owner soạn/quản lý. Owner thêm từ/ngữ pháp đủ điều kiện rồi commit cloud, active A/B tự catch-up, không share lại. Offline nhận khi reconnect; không claim tức thì0ms hoặc app đóng vẫn sync.
- **Một Google account một own library/progress, không multi-learner/Bé An/Bé Na/picker.** A/B cùng dùng content+progress của source library. Học ghi events/SRS/sessions chung; người học thử cũng ảnh hưởng tiến độ chung. Own library recipient riêng, không auto-merge/copy/rehome learning. Bỏ learner_id/backfill/unique-change proposals cũ, giữ legacy IDs/constraints/reducer.
- Founder trả lời clarification: **bên nhận không cần đăng nhập**. B nhận mã/QR để đọc/học/ghi progress/reopen/renew, không Google/signup/email bắt buộc hoặc Auth anonymous user. Chủ share cloud vẫn cần Google xác thực; recipient không quản lý hoặc share tiếp.
- B phiên72giờ từ successful claim, ngắt sớm được; mã one-use cấp một browser-session, không giới hạn số lượt học. Renew cùng library giữ tiến độ cũ. Revoke/expiry không xóa learning đã nhận. Không claim xóa từ xa nội dung đã download/offline.

Mặc định triển khai theo lệnh làm tiếp: A-until-revoke, QR chưa nhận TTL15min, một B context/browser, verify shared online khi mở lại; foreground content/progress-watermark polling15s +focus/reconnect; HttpOnly capability/private hash/scoped RPC +short-lived encrypted B notification delivery bằng credentials publishable hiện có. Không owner JWT/service key hoặc Vercel env mới. SQL0011/0012 additive và scoped RPC đã apply/verify hosted. Client watermark15s khi foreground; watermark đổi thì tải snapshot được materialize/chia trang, chưa dùng delta stream riêng. Xung đột giữ packet/local records, có tải riêng; renew cùng source giữ operation IDs. Không thay learning partition/reducer. Variants cũ lưu trong CHANGELOG, không dùng làm current requirements.


### ADR096 follow-up15/10 — trạng thái shared ở Settings, đếm ôn không trùng

Founder manual yêu cầu bỏ panel trạng thái shared khỏi màn học; icon liên kết trên header mở `/settings#shared-library`. Panel đầy đủ chỉ ở Settings; error/pending được nhắc bằng icon, quyền server/lease/expiry guard giữ. Settings group theo mục đích, không thêm tab nav: libraries/share, display/sound, lesson tools, backup/data, about collapsed.

Review display đếm written words qua cùng canonical/case grouping của library và explicit approved aliases; nếu nhiều nghĩa thì hiển thị số nghĩa kèm số từ. `dueIds` giữ mọi source ID cho group/lesson filters; `dueSummary` chỉ projection, practice đã dùng uniqueAggregateWords. Không semantic merge, không đổi SRS/history/learning IDs hoặc xóa source duplicates.


15/10 profile follow-up: founder yêu cầu gom `/profile` giống Settings. AccountTools (cả alias`/account`) nhóm account identity/sign-in/refresh; libraries/current scope/storage +collapsed sync/transfer; collapsed personal editor; learning history; collapsed account-data management. Cloud storage error auto-opens storage detail. Signed-out/sample/owner/shared messaging giữ đúng scope; shared không hiện nút sample như own guest. Không đổi auth/cloud/data/profile persistence semantics.

### ADR096 follow-up — content-only copy, explicit founder approval15/10

Supersedes earlier no shared→own transfer restriction **only for explicit content copy**. New strict `words-for-kids.content.v1` whitelist omits learning, evidence/raw drafts, credentials, grants, inbox and transfer metadata. Normalize export scope by source library; immutable snapshot checksum/limits/FKs/media bytes validated before writes. Source lease/server access is verified for direct export/copy; owner destination UID is independently verified. Signed-out destination is own guest, never demo/source. Account target sync precedes preview; transaction uses content CAS, new IDs/version1, exact identity reuse, graph remapping, deterministic grammar/content dedup and a snapshot receipt independent of export time. Conflicting meanings keep target and skip attached notes/grammar. All content inserts and receipt commit atomically; learning tables remain untouched. Post-save cloud failure reports local saved/pending rather than failed copy. File import marks new senses/media pending review; direct explicit confirmation accepts source approved content. Original full-archive empty-library/owner guard remains.
