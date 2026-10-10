# Trạng thái dự án — Words for Kids

## Current steering — Child play and parent simplicity, ADR042 (11/10/2026)

Founder requests simpler AI configuration, attractive mobile practice/game feedback and no500-word deck cap. Advanced key/model hidden by default;12-word paging/search/page selection retained through save/edit, schema cap removed,10-question sessions preserved. All five mode entries have recognizable catalog art/original fox; games use picture stages/equal choices/progress/check/static feedback, finite animation and original gesture-gated SFX/mute/cleanup. Main nav hidden during play; Pause available. Full route/state audit and child/parent human acceptance remain required in03/04. [Evidence](../evaluations/child-play-and-parent-simplicity.md) has actual checks; Final check137/18files/lint/types/build, full161browser,52responsive views and docs258links PASS. NativeGit deployment pending source push; pre-existing key/env edits excluded. Next: verify the authorized hosted build, then founder/child physical-phone and human acceptance of the live play/parent flow; these gates stay open.

Cập nhật10/10/2026, Asia/Ho_Chi_Minh. Founder yêu cầu setup rõ env/nơi lấy, Vercel tự deploy, autocomplete từ điển/tự điền/hình và bỏ OCR thiết bị. Steering mới nhất yêu cầu **Gemini thay OpenAI**, nhiều model và ưu tiên quota free tier. ADR-029/030 thay quyết định cũ về key browser/OCR/provider; giữ Theme C, trẻ5–8/parent-first, ba nav và approved revision.

## Current steering — UI / shared Gemini / hosted cloud repair

Latest founder request ADR040/041: public shared Gemini default, private override/persistent AI-off/restore, Google G sign-in/connected state, back icons and shared Theme C controls/card refinement. Real Supabase initial0001–0006 migrations applied atomically on founder project:24tables/all24forcedRLS/0anon grants/private source bucket/syncRPC. Live authenticated account reads cloud and preview13device senses/0overlap; agent has not confirmed transfer or sent source photos. Check134/lint/types/build and SQL PASS; responsive38views/19screens at360/1280 no overflow/JS errors. Full157/157browser PASS; deploy verification in [evidence](../evaluations/ui-and-hosted-cloud-fixes.md). Manual SQL Editor schema has no CLI migration history: reconcile before db push. Ledger unchanged, device/human/live inference benchmark/actual transfer remain open. Next: founder confirm the intended13-word transfer through the reviewed preview; actual upload/photo-storage/deletion/device/human gates remain open.

## Current steering — Parent profile and sync clarity

Founder screenshot reports successful Google sign-in but transfer preview failure. Implemented authenticated name/email/avatar, distinct device/account data counts and scope, clear transfer/sync actions/stages and safe specific HTTP causes; last successful sync persists across failures. No automatic guest upload or new profile schema. Check132/lint/types/build PASS; full153/153 browser and full docs225links PASS; source4ba88ad production READY dpl_4Pkgq3eQuSyLVLEVK45jHQxNGUPq. Hosted signed-out account shows device13words/1set and enabled Google sign-in; remoteCI38050668437 check passed, rest pending at checkpoint. Agent IAB is signed out, so founder live failure cause unverified. Next founder verify signed-in profile and any transfer failure; evidence account-profile-and-sync.

## Rename saved word sets

Founder asks to edit a forgotten imported set name after creation. Existing ADR035 versioned rename is now accessible inside its selected set card, shared with a Rename action on Today recent imported/manual lessons. Save/Cancel, focused title, progress/conflict error and success are inline. No schema or membership/SRS changes. Check128/lint/types/build PASS, full147/147 browser PASS including persisted rename/cancel/search/member count on desktop/mobile; docs223links PASS. Source9c81821 production READY dpl_AuJKpVMj4ab6is1qAF5JfDdt3Zvw; hosted date manager/Today inline form verified, original13 members/name retained. RemoteCI38048148513 check passed, remaining stages pending at handoff. Next: founder choose and save the intended title. Evidence library-media-and-date-sets.

## Today/API feedback/SEO, ADR-037/038

Due count now has direct scoped review/resume/offline entry; request feedback shows real stages, counts, elapsed and partial errors; favicon/social preview/public SEO implemented. pnpm check128/16files/lint/types/build PASS. Full147/147 browser PASS, docs223links PASS; source78c791c Vercel production READY (dpl_4gPgg1a572P1Jwh4XuXcQKndsf5z), remoteCI38045533305 SUCCESS in [evidence](../evaluations/today-feedback-and-seo.md). Hosted3 due →3-card session verified without ratings; prepare completion and all7 public metadata/assets checks PASS. Transient Git fetch failure resolved by redeploy. Next: founder physical-phone/human acceptance of the live due action and API feedback.

## Pictures / grammar / day sets — ADR-034/035

Founder13 words were saved after live Gemini success. Current code adds catalog177 +1493 licensed online auto-picture lookup/download, removes nested credit links from cards, adds complete project question templates with parent approval, and exposes /library/lessons day grouping/search/rename/new-versus-review/set practice. Manual words share a daily local-date set; each imported photo keeps its own title/date/ID. check121unit14files/lint/types/build PASS; full133/133browserPASS; 7e4dbfc nativeGit production READY/CI38042119163 SUCCESS in [evidence](../evaluations/library-media-and-date-sets.md). Hosted founder13 checked;6 missing art +2 question patterns saved through parent UI.

## Submit / duplicate / imported detail — ADR-036

Latest founder requests automatic handling on every submit, visible dedup, original source grammar/Vietnamese explanations/animation, and reports teacher detail missing. Implemented review badges/duplicate removal, automatic bounded photo-image lookup/download, atomic reviewed learning content, missing-art-only reimport with preserved parent wording,3-step reduced-motion grammar, and one route-param decode for imported colon IDs. pnpm check125/15/lint/types/build PASS; full137/137desktop/mobile/cloud-fixture browser PASS, docs216links PASS; source0c22f0f productionREADY/actual teacher and both learning modes verified in [evidence](../evaluations/library-media-and-date-sets.md). CI38043514632 SUCCESS; check/SQL/full browser/docs all passed. Next: founder/device/human acceptance of a fresh photo submit; no extra AI inference automatically.

## Sửa capture/review theo founder — ADR-031

Upload/camera đã refine Theme C: vùng drag-drop một ảnh/nút tiếng Việt/bàn phím, camera riêng, cùng validation/local draft, bỏ banner chưa kết nối. Extract có ảnh prepared sticky/zoom để đối chiếu; lý do action bị khóa; key/model Gemini cấu hình tại chỗ, không rời nháp; save chỉ mở khi đủ từ/nghĩa/approval. Check104/lint/types/build và full117/117 browser PASS. [Evidence](../evaluations/capture-review-ui.md), screenshots synthetic/manual desktop/mobile. Chưa gọi AI thật, chưa physical camera. Code c74a2e2 nativeGit production READY, alias words-for-kids.vercel.app; CI38028605020 SUCCESS toàn bộ check104/117 browser/SQL/docs. Browser hosted render đúng source prepared1920×1080, không gửi AI. Count ledger giữ nguyên.

## Streaming phân tích ảnh — ADR-032

Gemini SSE/tiến độ bước thực/elapsed/Dừng/preview chưa lưu/strict final validation đã xong; sửa stale chờ khi lỗi và REST enum APPLICATION_JSON. Check109 unit/13files/lint/types/build PASS, full119/119 E2E PASS, docs203links PASS. Real stream CORS OPTIONS200; inference chưa gọi. Evidence capture-review-ui; Source7eeb25e nativeGit production dpl_5GuJjph4QsX362DqJb2e7E8Qe8uT READY, stable words-for-kids.vercel.app; CI38029422569 đang chạy tại mốc ghi này (không claim pass).

## Chẩn đoán Google từ chối — ADR-033

HTTP/status/model/message/field diagnostics đã redact an toàn; check111 unit/13files/lint/types/build và full121/121 E2E PASS, docs203links PASS. Bản0ba9794 production READY; thử một POST trên founder tab thực tế: HTTP400 INVALID_ARGUMENT/Request contains an invalid argument, không field cụ thể. Request JSON tương thích responseMimeType/responseJsonSchema/pruned string constraints + metadata key/model GET đã hoàn tất/check113/full123 E2E/docs203links PASS; source2ec2725 production READY, CI38037820735 SUCCESS. Metadata GET thật chấp nhận key/model; image POST thứ hai vẫn400/no fields. Không kết luận key sai hoặc request JSON đã sửa nguyên nhân. Câu mẫu không ảnh/schema thành công trên837c50f productionREADY dpl_4KAsqShNDN6wzTfdW3BK2c9eQHZy; runtime114unit/full125browserPASS. Thử JSON mode với schema trong prompt, vẫn strict local DTO/evidence/STOP, để tránh backend schema compiler; live ảnh sau sửa thành công:13 từ/SSE/strict final validation và autofill review, chưa parentapprove/save; evidence capture-review-ui. Source581ef67 productionREADY, check114/full125/docs203linksPASS.

## Bản hiện hành

Thêm từ: Datamuse debounce350ms sửa chính tả → Wiktionary nghĩa song ngữ theo gloss/POS/IPA + Wiktionary/Tatoeba ví dụ có nguồn → tự điền/chọn nghĩa → catalog21/174 OpenMoji có license/credit → parent review/save. Live `handsom` → `handsome` → “đẹp trai” đã kiểm cả local và Vercel. Thiếu dữ liệu/hình báo rõ; không bịa hoặc ép hình cho nghĩa trừu tượng. Notes/decks/SRS/4games/backup/scopes vẫn hoạt động.

Ảnh: capture/crop/nháp → Gemini BYOK trực tiếp browser → strict JSON/evidence → phụ huynh sửa/duyệt/lưu. Default3.5FlashLite; presets3.1FlashLite/3.6Flash/3.8Flash + custom Gemini ID. Key standard/auth từ AIStudio chỉ session hoặc localStorage opt-in/delete, không IDB/archive/cloud/sync/server/env/URL. Key OpenAI cũ bỏ qua, không gửi sang Google; nguồn bản AI cũ giữ lịch sử. Chỉ prepare ảnh trên máy, không OCR/WASM/reader assets.

Google streamGenerateContent SSE fixedhost/headerkey/inlineJPEG/responseMimeType+prompt schema/systemInstruction/no tools;50 mục/90s/500KB/cancel/no automatic retry/model fallback/billing/WebLocks một tab. Consent mỗi reopen/crop private data; candidate có preview hình trước parent approve. API free tier theo project; paidproject có thể tính phí. Terms hiện hạn chế app hướng tới/dễ được under18 truy cập, user request không là Google eligibility approval. T00 account/retention/live inference/quality/cost benchmark còn pending. CORS OPTIONS thật200; inference thật một ảnh founder13 từ đã PASS trên581ef67; accuracy/benchmark chưa đạt. AI_PROVIDER=none chỉ gatewayserver planned, không tắt BYOK.

Cloud lifecycle/account deletion/CAS/conflicts/transfer/SQL0001–0006 và optional Commons adapter đã kiểm local fixture/realSQL; Google/Supabase hosted chưaproject. PWA guest/demo library/card/4games/basicparententry vẫn offline, OpenMoji staticallowlist/cache có credit; không offline AI hoặc cache privateAPI/HTML/RSC/account.

## Kiểm và triển khai

[Setup](../../SETUP-PROJECT.md) viết rõ3env tối thiểu, lấy Gemini key/model/freequota và optionalSupabase/Google/media. [Evidence hiện hành](../evaluations/parent-dictionary-byok-deploy.md). Frozeninstall/Chromiuminstall PASS; Gemini check**104 unit/13files/lint/types/build PASS**; **113/113 desktop/mobile E2E PASS**; SQL PASS; full docs validator PASS194links/17skills351resources/25requirements19tasks16screens/27JSON.

NativeGit Vercel project words-for-kids,3productionenv, Node24/Next/pnpm/sin1. Pushmain7b1e997 và Gemini f460e1f đã tựdeploy READY, alias https://words-for-kids.vercel.app. DeploymentGemini dpl_EMHjqzXRtXHRZXm3qE3ZPPPfBGmr; browserhosted xác nhận key/4presets/custom/localStorage/delete, screenshot gemini-hosted.jpg. Hosted dictionary livePASS; Supabase/cloud disabled đúng config. CI7b1e997 SUCCESS; CIf460e1f SUCCESS; toàn bộ steps qua.

Final art rule không gắn noun hình cho orange adjective/pretty adverb; check104 và targeted8/8 browser PASS sau thay rule. Full113 E2E và remoteCI f460e1f SUCCESS là mốc Gemini trước thay rule nhỏ; pushfollow-up tự chạy CI/deploy, không claim tương lai đã pass.

Localproduction4317 đã restart sau build cuối, temporarytestservers/SQLfixtures cleanup. Node24.14.1/pnpm11.25.0 path /Users/trunglk/.nvm/versions/node/v24.14.1/bin. Không reset changes/đụng eng.traineddata chưa rõ nguồn; envlocal/.vercel/credentials không commit. Ledger **4done/2pending_external/10in_progress/3planned**: BYOKcode/deploy đãcó, servergateway/AIbenchmark, hostedcloud, physicalcamera/voice/install/update, human/field/release gates còn pending. Library2.92s/searchp95≈151ms là labbuildtrước, chưa rebaseline.

Mốc13 từ đã được founder lưu;6 hình thiếu và2 mẫu học thêm đã duyệt qua UI. Next action: nghiệm thu sửa submit/chi tiết hiện hành theo phần ADR036 ở đầu file. Key/model hiện hành đã chạy được, không yêu cầu gửi key qua chat. Khi có Supabase chạy hosted smoke theoSetup; đánh giá account/eligibility/retention và realAIbenchmark trước public child pilot. Không tự gọi paid API hoặc coi fixtures là quality evidence.

Câu mẫu diagnostic: pnpm check PASS114 unit/13files/lint/types/build; full pnpm test:e2e PASS125/125 (1.5min), docs validator full PASS203links. Live result/deploy chưa ghi tại mốc này.

JSON mode verification: pnpm check PASS114unit/13files/lint/types/build, full pnpm test:e2e PASS125/125 (1.5min), full docs PASS203links. Deployment/live image result follow.

Checkpoint ADR040/041: source30129b7 nativeGit production READY dpl_6P6SXrqLUuPYzr5KW17MqHhkrka5, stable words-for-kids.vercel.app. RemoteCI38068615704 SUCCESS (check/SQL/full157browser/docs). Founder authenticated live profile/logo/back/newcontrols and13word preview PASS; shared default visible on settings, one metadata GET accepted key/model without photo or inference. Local134check/full157/targeted6/38responsiveviews/docs243PASS. Final settings description clarified shared-or-private AI, no runtime behavior change. Evidence ui-and-hosted-cloud-fixes.
