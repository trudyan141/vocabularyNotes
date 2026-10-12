# Bắt đầu / khôi phục / chuyển AI

**12/10 — ADR082, nhiều ảnh thành một bài chung:** supersede review/save riêng từng ảnh. Toàn bộ preview ở trên, Phân tích ở dưới danh sách. Compact vision đọc tất cả ảnh trước, gom headwords/context rồi enrich4từ/lượt và grammar1400chars; một danh sách word/grammar duyệt và một lần Save tạo một lesson. Source/meaning/grammar checkpoints CAS được ghi xong từng phần trước khi đi tiếp; quota/stop/reload Continue, không auto AI. Exact word/POS/sense và declared grammar family/form dedup, giữ nghĩa/POS khác và câu nguồn. Snapshot ảnh/model/mode đổi chặn Save; transaction kiểm source revisions và idempotency; max10ảnh/500raw/100ktext/200learning, per-image caps và source-limit khôngsilentlydrop. Legacy per-photo drafts/lessons giữ. [Bằng chứng](../evaluations/merged-photo-lesson.md). **Hoàn tất local:**61focused tests +14caUI mobile/desktop PASS (gồm regression mộtảnh); lint/typecheck/build/docs PASS. Chưa liveAI/physical-phone/hostedsync/deploy. Next: founder refresh bản local để dùng luồng chung.


12/10 — Bổ sung hình: are/they không lặp headword, group trước pagination12; chọn đúng nghĩa/POS, search/save/skip giữ sense/revision/CAS. Shared tìm hình có kéo thả, Ctrl+V/⌘V scoped, nút Dán ảnh mobile và picker; text paste giữ, one-image/4MB/format/lock và lỗi clipboard/upload. Editor stage→Save chung, Prepare dùng upload/lưu cũ.15data/media tests +8finalUIcases desktop/mobile +lint/types PASS. Primary build bị lock của lượt khác; UI trên snapshot webpack-dev4333 không private.env (test-only signing key), không claim production build/liveprovider/physicalclipboard/cloud/deploy. Local source dùng dev4317; next: founder refresh kiểm luồng. [Evidence](../evaluations/prepare-list-dedup.md).


12/10 — danh sách gọn và tìm hình có kết quả từng nguồn: bỏ subcards POS/nghĩa và nhãn đếm nghĩa dưới word card, giữ dữ liệu/sense IDs. Detail chooser chỉ hiện mỗi nhãn POS+nghĩa Việt một lần. Tìm hình theo Noto→Twemoji→Fluent→OpenMoji catalog rồi Commons nếu chưa có; lỗi/rỗng/lọc license thử query kế tiếp, báo nguồn/kind/code/status an toàn. They với nghĩa plural people có concept nhóm người; curl body cũ từ candidates=[] nay ra2hình Noto/Twemoji, đã kiểm cả2importJPEG/license thật. Không replay cookie founder. [Bằng chứng](../evaluations/simple-word-cards-and-media-fallback.md). Hoàn tất local: 29 tests liên quan + 6 ca UI mobile/desktop PASS, lint/typecheck/build/docs PASS; curl they và 2 import thật PASS. Chưa deploy; không founder data/browser/SQL/env/main.


12/10 — dán ảnh liên tiếp + chia lượt ngay: trang chỉnh ảnh có Ctrl+V/⌘V và Dán thêm ảnh/Chọn thêm ảnh; dán ảnh2 giữ tên/crop/nháp ảnh1, tạo chung batch; màn batch tiếp tục nhận paste,10ảnh cap. Text paste giữ bình thường. Batch gọi mỗiảnh tuần tự, compactvision6k rồi≤4từ/4k và grammar≤1400chars/≤3items/7k, không thử full10k trước. SSE không vượt output limit; validated checkpoints/CAS/ảnhhash+model+mode giữ, quota/cancel dừng/continue đúng pending, không promise AI đọcđủtuyệtđối.50words/20learning/10000text/40calls/5minphoto caps vẫn giữ, quánguồn báo cắtảnh khôngsilentlydrop. [Bằng chứng](../evaluations/continuous-paste-and-chunked-photos.md). Hoàn tất local: 63 test liên quan + 12 ca browser mobile/desktop PASS; lint/typecheck/build/docs PASS. Chưa deploy, chưa kiểm clipboard trên điện thoại thật hoặc live Gemini trong lượt này.


12/10 — ADR081 Notifications: chuông header gom sao chép bài trên máy, nhắc nháp ảnh và đồng bộ cần xử lý; bỏ2banner khỏi Today. Badge unread, rung hữu hạn/reduced motion, popup toggle/Escape/outside, detail/action riêng, read receipt IndexedDB theo scope bền reload. Draft resume đúng editor/guest cũng có; không tự copy/AI. Account isolation/source/CAS giữ. **Hoàn tất local:**13focused data/sync tests +8UIcases desktop/mobile +lint/typecheck/final build PASS. Chưa deploy/hosted/physical-phone; không founder browser/AI/SQL/env/main. Next: kiểm bản preview khi triển khai. [Bằng chứng](../evaluations/notifications.md).


12/10 ADR081 steering tiếp: ưu tiên tìm GoogleNoto→Twemoji→MicrosoftFluent trướcOpenMoji/Commons theo founder; giữhìnhđãchọn, rankingonly.11mediatestsPASS. [Evidence](../evaluations/free-picture-sources-and-games.md).


**12/10 — ADR081 hoàn tất local:**2picturegames lọc resolved/approved/readyart targets+distractors, reject stale/revoked/missingmedia, session/liveUI revalidate ảnhđổi khôngghiđiểm. Thêm3freepinnedsourcecatalogs Noto2DSVGApache2/TwemojiCCBY4/FluentFlatMIT beside OpenMoji+Commons; giữlicense/credit/JPEGreceipt/backup/cloudmap. Tìm thêm trên mạng gọiCommons; Openclipart/Openverse thủcông+reviewlicense/upload. Nghiêncứu Duolingooriginalart/Quizletgallery+historicalFlickr, khôngcopy.34focuseddata tests+6UIcasesmobile/desktop incl3livesourceimportsave+lint/types/build PASS. Final UI dùng isolatedsnapshot do concurrent.next collision. Chưa deploy/hostedsync/SQL/env/main/founderbrowser/AI. [Evidence](../evaluations/free-picture-sources-and-games.md). **Next:** founder xemtrảinghiệm hoặcdeploykhi cần.


**Lịch sử (luồng batch bị ADR082 thay thế)** — 12/10 thư viện tìm từ chính xác và nhiều ảnh: mỗi headword/caseMode một hàng, các sense/POS giữ riêng và có link mở; không gộp/xóa dữ liệu học. Search UI chỉ tên từ/cụm từ + nghĩa Việt, từ đầu token/prefix, không dò ví dụ/definition/tên bài; highlight đúng text có dấu. Chọn/kéo thả tới10ảnh,10MB/20MP mỗiảnh, normalize/EXIF strip tuần tự, local batch có preview/crop/remove/add. Một nút đọc phần còn lại; từng ảnh tuần tự qua adapter/recovery hiện có, stop-on-error, completed checkpoints/CAS/reload giữ; review/save riêng từng ảnh, không auto-save hay auto-upload sau reload. [Bằng chứng](../evaluations/search-and-batch.md). Hoàn tất local:35data/search tests+14UIcases mobile/desktop PASS; lint/types/final build/docs PASS; chưa deploy/liveAI/phone-human/cloud/SQL.


**12/10 — ADR080:** Đã sửa lỗi phản hồi phân tích ảnh và bổ sung chia lượt/tiếp tục. Replay curl gốc: STOP, 2.387 token input/2.488 output, 12 từ/1 ngữ pháp hợp lệ; chưa xác nhận nguyên nhân lần lỗi đầu, không kết luận quá context. Fast path 1 call; MAX_TOKENS/invalid/context chuyển compact vision rồi 4 từ/lượt và đoạn ≤1.400 ký tự. Checkpoint IndexedDB/CAS gắn image hash/model/mode, reload Continue, edit hủy checkpoint; lỗi riêng tại nút. Một content repair/batch, không retry mạng/quota; 60s/request, 5min/UI, 40 recovery calls/run, tuần tự/Web Lock. Template a/an/plural cùng 1 unit, exact evidence và whole-sentence IPA. **54 focused tests + 8 UI cases mobile/desktop + lint/typecheck/final build PASS**; live final 7 calls sau cutoff mô phỏng giữ 17 mục nguồn (đủ 12 nhãn chính/teddy bears), 1 grammar/3 forms PASS. Chưa deploy; không main/env/cloud/founder browser. [Bằng chứng](../evaluations/worksheet-recovery.md).


**12/10 — ADR079 hoàn tất local:** bỏ Câu độc lập ở library/group/picker/demoReview;2tab Từ/Ngữ pháp rộng bằng nhau, picker3loại kèm Bài/ngày. Select-all chỉ word/grammar, thêm lesson/day không tạo sentence refs mới. Ví dụ/IPA/audio/VI word+grammar và legacy refs/backup/cloud giữ. Old sentence URL về word chứa ví dụ.37data tests +8UIcases mobile/desktop +lint/types/final build PASS. Chưa deploy; không SQL/env/main/founder browser. [Evidence](../evaluations/two-learning-types.md). **Next:** review UX hoặc triển khai khi cần.


12/10 — ADR077 bổ sung theo founder: picker Từ/Câu/Ngữ pháp/Bài ưu tiên createdAt mới nhất; nhóm ngày chứa bài tạo mới nhất đứng đầu, trong ngày mới nhất trước. Sort projection sau dedup, giữ refs/content/learnedOn, không dùng updatedAt.11groupdata tests +4UIcases mobile/desktop +lint/types/build PASS. Local only/chưa deploy. [Evidence](../evaluations/group-picker-and-pictures.md).


**Hiện hành12/10 — ADR078, rà soát toàn bộ:** đã gỡ mobile-responsive và2skill mblode product-design/ui-animation (144sao/13forks); còn15skills=12upstream+3custom. Kiểm metadata10nguồn chính chủ, maintainer/activity/license/pinned content và fit cho17skill ban đầu. UI/UX Pro Max134.820sao + Impeccable79.870sao là nguồn mobile UX chính; LottieFiles motion-design hỗ trợ motion. Policy nguồn uy tín/nổi tiếng/nhiều sao/cộng đồng lớn áp dụng mọi upstream mới, bắt buộc ghi evidence trước khi thêm. Routing/spec/catalog/lock/founder đã đồng bộ, historical ADR/evaluation giữ. [Bảng giữ/gỡ và nguồn](../skills/MOBILE-UX.md). Hoàn tất: `PATH=/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH pnpm docs:check` PASS683links/15skills/317resources/48JSON; `git diff --check` PASS. Không sửa app; không chạy lint/build/E2E/schema-validation cho skill/docs-only. **Kiểm lại khi bàn giao:** integrity15skills/317resources PASS; docs:check hiện FAIL chỉ2link ADR079 tới two-learning-types.md chưa tồn tại (ngoài lượt skill), không claim toàn bộ docs hiện pass. Git diff --check PASS.

**Hiện hành12/10 — ADR077:** group select-all toggle giữ chọn ngoài query; lesson picker hình/name/ngày+HH:mm:ss/counts/word preview; photo default tối đa4từ đã duyệt, giữ custom/legacy. Added mint/duplicate lilac details đóng mặc định; data trả addedItems thật/no-op giữ. Editor luôn preview hình hiện tại/staged trước Đổi hình. Không bổ sung lọc trước pagination, IndexedDB preference theo scope bền reload, chưa cloud/backup; không đổi word/SRS.20focused data tests +10UI/regression mobile/desktop +lint/types/final build PASS, docs verification below. Local only/no deploy/main/env/SQL/founder browser/liveAI. [Evidence](../evaluations/group-picker-and-pictures.md). **Next:** founder kiểm trải nghiệm; publish riêng khi cần.


**Hiện hành12/10 — ADR076:** một form/số1Save cho word/edit, hình staged; transaction word/examples/media/learning/CAS và rollback, giữ variants/evidence/IPA. Partial grouped grammar dùng ref nguyên bản, không bắt select all. Trash word trên đầu, trash lesson tile chỉ xóa container/links giữ learning. Shared pending/success/fail API submit, lỗi đỏ trên nút/input, profile không false success. Grammar tự reset step1; nav learning+public/error, safe-area padding; illustrated Fox empty và picture-page clamp. Mobile-responsive repo-local MIT/pin, no hooks/global.56 focused data tests + lint/types/final build PASS; 22unique scoped UI cases PASS sau repair, gồm2final footer/image cases; detector `[]`, docs PASS. Task hoàn tất local. Local only, không founder account/browser/AI thật/SQL/deploy/env/Git. [Evidence](../evaluations/edit-save-navigation.md).


**Hiện hành12/10 — ADR075:** Search/filter trong card có icon/chips; grammar detail toolbar Back/trash icon riêng khỏi title. Khôi phục/bổ sung GrammarSteps có màu theo vai trò, animation play/pause/replay/steps/reduced-motion và ví dụ/IPA/VI thật. Legacy Is it/Yes/No thành1unit lossless ởprojection; model prompt+normalizer lưu1family có grammarVariants, giữ evidence/IPA/backup/cloud và luyện đủcácdạng trong Xếp câu. Group mixed selections skip duplicate individually, keep new, list names; zero-change does not write/version-bump or claim success.100fixture=70duplicate+30added verified.43targeted tests,10UI cases+4final reruns mobile/desktop,lint/types/final build/docs PASS. Final deployREADY; hosted own fixture family/variants1unit3forms+duplicate no-op+cleanup PASS. [Evidence](../evaluations/grammar-guide-and-group-duplicates.md). No founder data changes/real AI calls/newenv/main.


**Hiện hành12/10 — ADR074:** dictionary fallback giữ English Wiktionary definitions/POS; intensely/intense trên4317 thật200. Dictionary error/empty không chặn Gemini tự điền2examples và POS/sense. Today hai section Ôn bài/Thêm từ, có trang chọn nhóm để ôn. Xếp câu dùng approved grammar snapshot, hints/audio/pause/result, CAS và idempotent game attempt, không đổi SRS. Recent sessions illustrated cards. Media ưu tiên OpenMoji cho từ rõ, loại cartoon chính trị/cổ sai nghĩa; upload ảnh mua/user-supplied có nguồn optional, signed normalizedJPEG/backup/cloud. Full-word approval giữ hình đã chọn; callback cập nhật revision từ chính thao tác picture save. Migration0008 hosted verified mở grammar mode giữ mode cũ.50focused tests+media review regression,10UI initial+6finalUI desktop/mobile PASS; lint/types/build/SQL fixture PASS. [Evidence](../evaluations/review-grammar-and-dictionary.md). Hosted grammar/upload/source/session/result sync sau deploy PASS qua2phiên tài khoản thử; cleanup PASS. Hosted intense/intensely200 đúngPOS. Không dùng tài khoản founder.


**Hiện hành12/10 — ADR072/073:** SQL0007 đã được agent apply qua Management API theo yêu cầu mới và local token; RPC/trigger verified. Hosted tài khoản thử riêng xác nhận tự đồng bộ thêm/sửa/xóa từ, nhóm, hồ sơ giữa hai phiên; cleanup PASS. Profile save chờ repository ready để tránh race mất queue. Library/group có3tab đều Từ/Câu/Ngữ pháp; pattern nhập chung grammar, item mở trang detail riêng, filter inline. Remote suggestion cập nhật input ngay, Gemini tự điền2examples/VI/whole-sentence IPA; bỏ optional accordion/check/View library. Missing-image search/import Commons thật200 cho SISTER/BROTHER; bỏ prepared selector, giữ attribution/CAS/grammar.40focused tests,6UI+2cloud fixture cases+2route reruns,lint/types/build/docs PASS. Deploy cuối READY; hosted rerun2162ms/add/edit/profile/group/delete/cleanup PASS không đợi profile ready text. [Evidence](../evaluations/simple-lessons-and-live-cloud.md). Các checkpoint thiếu0007/chờ founder chạy bên dưới là lịch sử.


**Hiện hành12/10 — ADR070/071:** Today bỏ search/word previews; game bỏ sound toggle, options đóng gọn/select; group header/move delete và6lessons/page riêng12items/page, không read query mỗi ký tự; dated deletion trong detail. 4UI cases,2two-device cloud fixture cases incl group,214unit/integration PASS. Native PG SHMALL workaround PGlite0.5.8 toàn SQL fixture/0007 PASS. Hosted probe404/PGRST202: preference RPC missing, founder chọn apply0007. Quyền founder sửa: no push main/no add Vercel env/no founder browser; không cấm DB/deploy. [Evidence](../evaluations/compact-games-and-groups.md). Production verification pending SQL apply.


**Hiện hành12/10 — ADR069:** ôn bài thành card; game Speaking tile đứng giống các game còn lại. Bổ sung ảnh chỉ ảnh, tên/nghĩa từ thiếu rõ + picker có sẵn; normalize POS/common plurals; sửa từ dùng catalog local trước Commons có config. Save nhóm thành công chỉ thông báo, ẩn save/redundant footer, đổi lựa chọn mở save lại. CAS/text/grammar/scope/license giữ. [Evidence](../evaluations/review-pictures-and-group-save.md). Local only, không publish/AI thật/account.


**Hiện hành12/10 — ADR068:** gộp Settings thành Sao lưu và khôi phục (full archive export, nhận cả text backup cũ); Today thêm card ảnh ngang cấp Gõ từ mới, chỉ một bài gần nhất theo learnedOn/updatedAt, bỏ rename. Review word accordions đóng mặc định chỉ hình/tên, bung riêng để chọn/sửa. Edit title/date chuyển vào Chi tiết bộ theo ngày ở library filtered detail; lesson list không inline rename. [Evidence](../evaluations/compact-home-and-review.md). Local only; giữ pre-existing ADR066/067 changes, không publish/account/live AI.

**Hiện hành12/10 — ADR067:** Founder yêu cầu key form ngắn, bỏ Tắt AI/disclosure/tests/checkbox; editor Phân tích ảnh chạy một lần ngay, không consent screen; review tự bỏ exact duplicate, chỉ báo tên trùng, Duyệt và lưu là thao tác approve duy nhất. Draft autosave/CAS/evidence/IPA/atomic save giữ nguyên; blank key lưu = vô hiệu key, existing remembered/session behavior giữ. Bỏ toàn khối Chấm phát âm trong Settings; Nói vẫn tự chấm không hỏi. Launcher Impeccable được chmod u+x theo quyền founder, context/detect chạy bằng engine có sẵn, không tải/cài. [Evidence](../evaluations/simple-photo-review.md). Local only; prior ADR066 changes preserved, no AI thật/account/publish.

**Hiện hành12/10 — ADR066:** Founder đồng ý Gemini chấm bản thu, bỏ tải355MB và trực tiếp yêu cầu bỏ popup xác nhận. Bấm Nói mở mic ngay, cue bắt đầu/kết thúc, tự endpoint→Gemini Flash-Lite với key hiện có; score%/màu chữ/VI sound sheet và game giữ nguyên. Không consent dialog/Hỏi lại setting, Worker/ONNX/Transformers/download; cache pack cũ tự dọn riêng. Cáo loading inline ở HTML/DB/Today và36iOS startup PNG.20 focused tests,12 browser cases desktop/mobile/WebKit PASS; lint/types/final build PASS. [Evidence](../evaluations/mobile-speaking-startup.md). Local only; không live key/AI, iPhone thật/native launch/accuracy/publish claim. ADR058–065 local engine/no audio upload/pack management là lịch sử; account sync ADR064 giữ nguyên. SQL0007 vẫn chưa kiểm/apply, founder owns publishing ADR049. Ledger totals unchanged.

**Hiện hành12/10 — ADR064/065:** “Sửa theo plan” implemented locally: signed-in always account + automatic commit/broadcast/cursor sync + owner-scoped preference queue/RPC; optional one-time guest-copy/retain source/logout. Public Welcome/404 split, auth request shared, stable greeting/HTTP redirect. Speaking embedded WordDetail, IPA/meaning/examples retained, automatic endpoint, phone/spelling colors, percent only (founder rejects “điểm tham khảo” label), ELSA-style bottom sheet. Nói cùng Cáo is finite game tile in Play & learn; pack management only Settings.44 focused unit/integration PASS;21 distinct browser cases PASS across scope confirmations,1 mobile-heavy skip; actual desktop ONNX Worker fixture PASS, lint/types/final build PASS. [Evidence](../evaluations/speaking-refresh-and-automatic-sync.md). **SQL0007 not run: initdb kernel SHMALL error; not applied hosted.** No live AI/real account writes/deploy/phone/calibration/ELSA accuracy/remote CI claim. Prior no-score/main-minimal/mutable-signed-in-guest checkpoint is historical, superseded. **Next: scoped SQL verification on working local PostgreSQL, then founder reviews/applies migration/publishes under ADR049; device/quality testing recorded separately.** Ledger task totals unchanged.


**Latest11/10 — ADR062 Speaking app + library fixes (70 unit/integration PASS,9 scoped browser cases PASS/1 desktop-only mobile skip; lint/types/build/docs PASS):** user explicitly permits browser diagnosis/tests and asks implementation. Real desktop profile read-only shows13device words/1set,0cloud words/0sets; no transfer performed. Local code clarifies cloud/local, account default on fresh signed-in device and sync on focus; photo repeat default selection/POS alias/exact dedup; existing group primary Add control. `/speaking` now exposes record/replay, explicit model download/cache/clear, actual Worker recognition, tentative word evidence/colors and optional mocked-tested Gemini coaching. No numerical score/calibration/child/physical-device/live AI/release claims. [Evidence](../evaluations/speaking-app-and-library-fixes.md). Publish remains founder-owned; authorized browser reads do not grant real lesson transfer/deploy.

**Latest11/10 ADR060/061:** sentence IPA + exact-example listening completed locally across shared UI and offline; generation supports full mistake/correction IPA; scoped data round-trip/deletion and origin boundaries checked. [Evidence](../evaluations/sentence-ipa-and-listening.md). Founder confirms Gemini key/project Free Tier/no billing and prefers AI Vietnamese coaching: updated founder17/spec15 with optional target+local-evidence advice, fixed fallback, no audio upload/paid fallback; no live call; this checkpoint is superseded by ADR062 app implementation above. Cache/delete FAQ clarifies355MB+22MB versus old318MB; scoring calibration gates remain open.

11/10 — ADR056/057 local: nhóm thêm grammar, chọn tất cả ba loại qua mọi trang lọc, source-dated/name items và exact dedup toàn nhóm; backup/cloud remap giữ metadata và nhiều supplemental rows/sense. TTS first tap chờ voice readiness/cancel, offline local voice only.46 related unit/integration PASS,6 voice helper final confirmation PASS;10 distinct scoped browser cases PASS (results/evidence below), lint/types/final build PASS. [Evidence](../evaluations/groups-grammar-and-audio.md). Speaking checkpoint này là lịch sử planning; trạng thái SP1 mới nhất ở dưới. Không production/SQL/realAI/physical-phone claims.

**Checkpoint lịch sử — SP1 trước ADR062 (ADR058/059):** founder “tiếp tục” sau plan0đ. Đã pin Transformers.js3.8.1, manifest English Wav2Vec2 q8/revision/SHA355MB, CTC decoder và CLI browser/Worker inference thật. Public fixtures cat/book/cup đúng phone sequence, apple cần variant handling; TTS vẫn có lỗi.11 unit cases, scoped lint/typecheck và final build PASS. [Evidence](../evaluations/speaking-local-feasibility.md), [founder plan17](../KE-HOACH-FOUNDER.md#speaking-review), [AI spec15](../15-speaking-practice.md). Không API/paid fallback/mic/score/child colors/game/real account/deploy; model/runtime không vào app bundle/SW.

**Historical next action11/10 (superseded above):** local app Speaking flow implemented; validate physical-mobile RAM/scoring calibration. Không chờ founder review lại code local; quality/calibration/phone/child evidence vẫn pending, không bật score/red certainty bằng raw phone match. Founder owns publishing ADR049; ledger tổng chưa đổi.


Latest11/10 session persistence verified locally: existing Supabase SSR cookie survives a new request client and refreshes expired access token.5 SDK/route fixture tests PASS; no runtime changes. [Evidence](../evaluations/auth-session-persistence.md).


Latest11/10 ADR055: offline fallback now uses Theme C/Nunito/Cáo, colored illustrated library/game actions and word tiles, short recovery copy/focus/progress. Scope/review/save/resume preserved;14 browser cases PASS and8 final confirmations. [Evidence](../evaluations/offline-child-ui.md). Local only; ADR049/050 still apply.


Latest11/10 ADR054: Hồ sơ/avatar/login ở header, account/current library vào `/profile`, Settings là nav thứ tư; bỏ Google data/terms disclosure. Clipboard button mobile/fallback, confirmed scoped CAS deletion, worksheet `learning[]` source sentences/inferred grammar/family dialogue saved/reloaded. Local only;96 related tests +24 distinct scoped browser cases PASS; [evidence](../evaluations/profile-avatar-mobile-paste-delete-grammar.md). Physical clipboard/live image recognition remain pending, no publish authorization.


Latest11/10 ADR052/053: Welcome only mascot/short copy/CTA; no global sample footer or word-detail Source and notes disclosure. Provenance/notes preserved in DB. New generated map-fox404 with HTTP404/VI-EN/Home; scoped14browserPASS17,7s. [Evidence](../evaluations/welcome-footer-and-404.md). Local only, permissions/test rules049/050 remain.

Latest11/10 ADR051: S04 Chọn ảnh / Chụp ảnh tabs, only selected panel, camera permission only after Open camera; leave tab stops tracks/late permission. Picker/drop/paste retained. Unused local eng.traineddata removed and *.traineddata ignored at founder request. [Scoped evidence](../evaluations/capture-tabs.md); local only under ADR049/050.

**Ưu tiên mới nhất11/10 — ADR049/050:** Founder làm browser thật/GitHub/Vercel/env/deploy; agent cần xin phép cho hành động cụ thể, không dùng quyền triển khai cũ. Chỉ code/docs + kiểm thử local cô lập. Founder đã chọn **Gọn**: lint/typecheck, tests phần đổi, vài trạng thái mobile/desktop; full suite ở mốc bàn giao lớn. Đọc rule AGENTS/10 trước lệnh thao tác. IPA/paste047/048 còn local, chưa push/hosted mới.

Latest11/10 ADR047/048: whole-English-sentence IPA beneath examples (unverified suggestions labelled Tham khảo), future generation includes every clause; edits clear stale IPA. Capture supports Ctrl+V / ⌘V image paste → immediate local preview, no automatic AI. [Evidence](../evaluations/sentence-ipa-and-image-paste.md).045/046/author runtimeca3626d hosted READY/remote CI173+SQL SUCCESS.

Latest11/10 ADR046: **Cài đặt**, direct add/edit/study with no parent warning gate. Family self-manages parent/child usage. Neutral copy includes offline; content review, actual consent/deletion/auth/ownership still apply. Supersedes older parent-only UI instructions. Source03/04/02/AGENTS and [evidence](../evaluations/plain-language-and-select-all.md).

Latest11/10 ADR045: plain-language default UI/no technical storage or provider diagnostics, Select all across filtered pages for groups/decks. Source04/AGENTS and [evidence](../evaluations/plain-language-and-select-all.md). ADR044 remote CI169/browser+SQL SUCCESS, hosted READY.

Latest11/10 ADR044: readable dated sets/UUID display fallback, topic groups with individual word/sentence or lesson/day addition and deterministic deduplication, illustrated warm welcome/finite fox greeting. [Evidence](../evaluations/groups-and-lesson-ui.md), current STATE govern checkpoint. No automatic founder rename, new nav or SQL migration.

Latest11/10 steering ADR043: stronger shared berry primary/secondary/outline buttons, recognizable feature entries (direct under ADR046) and icon/text segments. [Evidence](../evaluations/button-hierarchy.md). ADR042: simplify parent config,12-word paging without500-member deck cap, illustrated child games/fox/finite motion and original muted/gesture-only sound. Full UI mobile/desktop audit and human/phone acceptance separated in03/04 and [evidence](../evaluations/child-play-and-parent-simplicity.md).

Steering ADR040/041 hiện hành: Gemini shared public default theo founder, private override/off/restore; logo Google/back icons và shared Theme C button/card refinement. Hosted Supabase đã apply0001–0006,24 bảng; authenticated13-word preview PASS, chưa xác nhận chuyển bài thật. Xem [evidence](../evaluations/ui-and-hosted-cloud-fixes.md) và STATE.


## Context tối thiểu cần giữ

Người dùng chốt tên **Words for Kids**, web/PWA ưu tiên con founder và trẻ 5–8 tuổi; phụ huynh chụp A4/duyệt nội dung/chọn hình/quản lý cloud và key. Default VI/Beginner/child-friendly on, cartoon 2D, original coral fox/berry Theme C tạm chốt. Người lớn mở rộng sau. Ảnh → OCR/vision có bằng chứng → parent review → deterministic dedup → local IndexedDB hoặc cloud Google của phụ huynh. Nội dung EN–EN/EN–VI, ví dụ, grammar, audio, notes templates, SRS/flashcard và bốn game; non-reader ưu tiên nghe→chọn 2–3 hình.

**Hiện tại10/10/2026, ADR-030:** real Datamuse/Wiktionary/Tatoeba autocomplete→auto-fill/songngữ/IPA→catalog21+174 OpenMoji hình→parentreview. OCR thiết bị đã bỏ; parentGemini BYOK directbrowser/session hoặc localStorage opt-in/delete, không key ởserver/IDB/backup/cloud. AI_PROVIDER=none chỉ gatewayserverplanned. Review/save/notes/SRS/4games/backup/offline manual còn dùng. Vercel nativeGit project/env3: Gitpush7b1e997 và Gemini f460e1f READY; remoteCI7b1e997 SUCCESS/CIf460e1f SUCCESS. Gemini check104 PASS; Gemini E2E113/113 PASS; SQL PASS; realAIinference/key/accuracy/cost/retention, hostedSupabase/physicalphone/human/field còn pending. [Setup](../../SETUP-PROJECT.md), [evidence](../evaluations/parent-dictionary-byok-deploy.md), STATE/founderplan là current. Không đọc câu OCR/keybrowserforbidden lịch sử thành requirement hiện hành.

Steering tiếp10/10/2026: ADR031 upload drag-drop/source-photo/inline key đã deploy; ADR032 Gemini SSE/elapsed/partial chưa lưu/STOP validation sửa chờ treo và REST enum APPLICATION_JSON. Evidence capture-review-ui và STATE ghi mốc kiểm hiện hành.

Steering ADR034/035: automatic licensed picture download, parent question grammar and searchable learning-date sets. Current checks/deploy at [evidence](../evaluations/library-media-and-date-sets.md) and STATE; follow latest next action there.

## Trình tự bắt đầu

Steering cùng ngày thêm đường gõ tay → autocomplete → tra/chọn nghĩa → duyệt/lưu tại S03/S09, không cần ảnh/OCR; R11/F07/ADR-021, T07 local đã nối; lookup thật đã smoke `handsom`/`handsome`; availability nguồn ngoài có lỗi/fallback.

Steering 09/10/2026 bổ sung: IPA + cách đọc gần đúng bằng chữ Việt dưới từ và từng câu; chi tiết R07/R08, 06/07, founder S09/S10, ADR-020. Đã triển khai local trong app; contract AI enrichment v1.1/parser pronunciation đã mở rộng; live AI chưa có, T07 còn nghiệm thu AI/media.

1. Đọc `AGENTS.md`, `STATE.md`, `TASKS.md` và phần ADR liên quan trong `DECISIONS.md`.
2. Kiểm `git status --short`, package scripts và files thực tế. Không reset thay đổi người dùng.
3. Chọn một task ready; đọc tài liệu theo routing. Đọc skill liên quan, không nạp cả 15 skill và toàn bộ references cùng lúc.
4. Thực hiện và kiểm acceptance. Cập nhật task/state/changelog bằng evidence trước khi kết thúc lượt.

## Routing theo task

| Task | Tài liệu cần đọc | Skill chính |
|---|---|---|
| T00, T05 | 07, 09, 10, 14, contracts, fixtures | worksheet-extraction, node async/caching rules; current official API docs |
| T01 | 05, 09, 11 | vocabulary-delivery |
| T18 | Founder mục 2–8, 03, 04, 13, design/ui-mockup-plan.json, design/inspo-research | ui-ux-pro-max, frontend-design, impeccable; imagegen cho concept raster; Inspo khi cần reference |
| T02 | 00, 03, 04, 13, prototype T18 | ui-ux-pro-max, frontend-design, impeccable, motion-design, accessibility; shadcn nếu môi trường có |
| T03 | 05, 06, 10 | vocabulary-delivery; react best practices khi UI query |
| T04, T06 | 02, 03, 06, 07 | worksheet-extraction, frontend-design |
| T07, T08 | 03, 04, 07, 08, 13, 14, enrichment contract | bilingual-learning-content, motion-design, impeccable animate; node cho media I/O/cache |
| T09, T12 | 03, 08, 10 | bilingual-learning-content; react best practices |
| T10, T11 | 02, 05, 06, 09, 10 | supabase-postgres-best-practices |
| T13, T14, T15 | 05, 09, 10, 11, 13 | performance, core-web-vitals, accessibility; vocabulary-delivery + relevant DB skill |
| Speaking SP0–SP4 | 15, 08, founder17, speaking-local-feasibility; current ADR058/059 | vocabulary-delivery, bilingual-learning-content, React; impeccable when UI changes |
| Handoff dài | STATE, TASKS, HANDOFF-TEMPLATE | filesystem-context, context-compression |
| Bug / test failure / unexpected behavior | Spec và evidence đúng phần lỗi; 10 theo ADR050; docs/skills/WORKFLOW-SKILL-REVIEW.md | systematic-debugging + vocabulary-delivery; domain skill theo boundary, không cài thêm siblings |

Các số 00–14 là file `docs/NN-*.md`, tra tên trong `docs/README.md`. T16/T17 dùng docs mở rộng và ADR riêng trước khi triển khai. Founder đọc KE-HOACH-FOUNDER; AI cập nhật mục tình hình khi có chặng/quyết định thay đổi, ledger vẫn ở docs/ai.

## Prompt copy cho Codex hoặc Antigravity

```text
Tiếp tục dự án Words for Kids trong repo này.
Đọc AGENTS.md và docs/ai/START-HERE.md, STATE.md, TASKS.md.
Thực hiện task ready tiếp theo, dùng skill phù hợp trong .agents/skills/.
Giữ tên Words for Kids, giao diện thân thiện trẻ 5–8, tự thêm/học trực tiếp và Cài đặt theo ADR046, web/PWA và R01–R21/R24–R25; adult expansion ở sau. Theme C tạm chốt, không hỏi lại approval cũ.
Hoàn tất cả behavior, lỗi/fallback và acceptance của task; không gọi mock là tính năng thật.
Cập nhật TASKS/STATE/CHANGELOG, ghi lệnh kiểm tra và một next action rõ ràng.
```

## Dùng skill giữa các môi trường

Skill bundles nằm ở `.agents/skills/<folder>/SKILL.md`. Nguồn/version/checksums tại `docs/skills/skills-lock.json`; thư mục `react-best-practices` có invocation name **vercel-react-best-practices**.

Codex và tài liệu Antigravity hiện tại hỗ trợ workspace skill ở `.agents/skills`; xem [nguồn Codex](https://learn.chatgpt.com/docs/build-skills) và [nguồn Antigravity](https://antigravity.google/docs/skills). Skill mới có thể cần lượt/chat mới để hiện trong catalog. Nếu bản IDE cũ chỉ nhận `.agent/skills`, dùng đường dẫn SKILL trực tiếp hoặc cấu hình/copy có chủ đích theo docs bản đang chạy; không tự tạo hai bản nguồn cần duy trì.

Nếu host không tự đọc AGENTS, dùng prompt trên với đường dẫn file. Không tuyên bố cơ chế discovery đã được thử trong Antigravity ở lượt planning này; phần đó được xác minh từ tài liệu, chưa từ app người dùng.

## Khi bị mất context

Không reconstruct từ trí nhớ. Đọc state/task, diff và artifacts được trỏ; bảo toàn constraints người dùng, chosen task, file đang sửa và test failing. STATE phải có một next action. Nếu task đã done, kiểm evidence rồi tiếp task kế tiếp; không scaffold lại repo hoặc chạy lại benchmark trả phí không cần thiết.
