# Nhật ký bàn giao

## 2026-10-10 — Capture drag-drop, inline key và ảnh đối chiếu, ADR-031

Theo hai steering founder: giải thích thiếu key/consent/privacy và thiếu review data/approval; nhập key ngay tại extract giữ draft/checks, source prepared Blob sticky cạnh nội dung desktop/thumbnail mobile/mở zoom. Upload một ảnh bằng kéo thả/nút tiếng Việt/Enter, cùng normalize/validation/camera cleanup/draft; bỏ stale disconnected banner. Check104/lint/types/build PASS; full117/117 browser PASS. Sửa assertions nhãn cũ/Next announcer ambiguity và input hidden để không trùng role button, không bỏ coverage. Screenshot CUA1280/360 synthetic/manual, không liveAI/physical phone. Source03/ADR/state/tasks/founder updated. [Evidence](../evaluations/capture-review-ui.md). Code c74a2e2 production READY/nativeGit; CI38028605020 SUCCESS toàn bộsteps; hosted capture/sourcephoto verified, không call AI hoặc publish ảnh/key riêng.

## 2026-10-10 — Gemini thay OpenAI theo steering, ADR-030

Founder yêu cầu Gemini free tier/nhiềumodel. Browser directGoogle generateContent/headerkey/inlineJPEG/responseFormatstrict/no tools; default3.5FlashLite/preset3.1FlashLite/3.6Flash/3.8Flash/custom. OldOpenAIconfigignored/no keyforward; standard/authkey formats, session/localStorage opt-in/delete/backupnotkey giữ nguyên. CORSOPTIONS200, official docs/pricing/models/terms checked; freequota perproject/paidprojectcharged, eligibilityunder18restriction/liveinference cònpending. PreviewhìnhAImỗi candidate trước review. Linksettings#parent-ai scroll sauhydrate đã sửa.

Gemini check104units/lint/types/build PASS; browser113/113 PASS. SQL/initial111 browser PASS và remoteCI38022181410 SUCCESS/Vercel7b1e997 READY đã xác nhận. Setup/source02/05/07/09/14/AGENTS/founder/ledger/ADR updated. [Evidence](../evaluations/parent-dictionary-byok-deploy.md). Không có key thật, quota/account/inference/benchmark/liveSupabase/physicalphone/human chưa kiểm.

## 2026-10-10 — Founder setup/deploy/dictionary/BYOK fixes, ADR-029

Thực hiện yêu cầu trực tiếp: setup env/nơi lấy rõràng; Vercel nativeGit/main env; Datamuse/Wiktionary/Tatoeba real suggestions/bilingual senses/IPA/examples/autofill và174licensed OpenMoji; bỏlocalOCR, parentOpenAI BYOK direct/session/localStorage opt-in/delete. Không key vàoappserver/IDB/archive/sync. FixedURL/strict/evidence/consent/90s/cancel/review/error; store:false khôngZDR/livebenchmark. Update source02/05/07/09/14, AGENTS/founder/setup/README/ledger và ADR029.

Frozeninstall/Chromiuminstall/check91unit13files/lint/types/build PASS; E2E111/111 desktop/mobile PASS; SQLrealPostgres PASS. Dictionary handsom→handsome/đẹp trai/IPA/examples livePASS; OpenAI OPTIONS200CORS livePASS, inference dùngfixture/costaccuracykeyretentionpending. [Evidence/screenshots/deployment](../evaluations/parent-dictionary-byok-deploy.md); hosted Google/Supabase, phone/human/field cònpending. RemoteCI/VercelREADY ghi sau quan sát thật.

## 2026-10-09 — T00 dataset/harness, live benchmark pending

Request: tiếp tục sau T04; chọn T00 ready theo routing07/09/10/14. Giữ nguyên app/provider none, Theme C và steering IPA/cách đọc Việt/typed lookup/autocomplete T07. Không overwrite app/storage hoặc thêm SDK/API credentials.

- Implement `scripts/ai-benchmark/render.mjs`: Playwright canvas, chỉ20 worksheets tổng hợp do repo tạo,1100×1556 PNG, network route abort; clear/mixed/cursive-font/shadow/glare/skew/small/duplicates/senses/sentence/phrase/inferred/no-English/injection/metadata/blur. Corpus/ground truth v1 có40 listed-all mode references; font mô phỏng không là handwriting thật. Contact sheet20 ô xem trực tiếp, không mất chữ/VI glyphs.
- Manifest SHA từng ảnh/cases/schema1.0/template prompt/renderer, Chromium156.0.8078.4; offline scorer Python/jsonschema dùng validation virtualenv đã có. Strict JSON/duplicate properties/closed schema/unique IDs/refs/bbox/cited verbatim/source-vs-inferred review; lexical TP/FP/FN theo mode/cohort, invalid outputs vẫn FN, empty denominators null, missing cases rõ. Metadata/injection candidates FP, text không execute/fetch. Record hashes/SDK/model/prompt/cost/latency types/mixed runs checked; scorer hash trong report. Không claim sense preservation/human grammar/UI recovery/shared quota từ scorer này.
-15 tests PASS, CLI40/40 reference self_test, zero missing, latency/cost null; self-test records/report có nhãn reference-fixture, isLiveBenchmark=false/model selection not established. Không vision/enrichment calls/provider results/live runner. `eval:images` và `eval:ai` commands thêm package scripts; Python dependencies dùng requirements-validation trong virtualenv, không thêm app package/đổi lockfile.
- Đối chiếu search+open nguồn chính thức09/10/2026: Gemini Developer Additional Terms hiệu lực23/03/2026 excluded cho child API Client; OpenAI under-18 + data controls/ZDR approval, Anthropic API minors/commercial/retention/model feature rules là conditional candidates. Chưa xác minh account/retention/safeguards/endpoint/model, không bật dịch vụ hoặc claim free vision. URLs/current findings tại [report](../evaluations/ai-benchmark.md).
- Update07/10/11/founder/README/START/STATE/TASKS và ADR024. **T00 pending_external** cho human GT/ảnh thật/provider account/credential/budget/live benchmark/model decision; **4 done/1 ready(T10)/2 pending_external(T00/T04)/12 planned**. T05 chưa ready; next T10 schema/RLS/storage độc lập, đọc DB skill trước SQL. T04 chỉ phone smoke pending; T07 phát âm/tra từ vẫn planned.

Verification thực:

- `PATH=/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH node scripts/ai-benchmark/render.mjs`: PASS20 PNG + manifest/contact sheet. Chạy lại khi bổ sung pin prompt; contact sheet nội dung không đổi, đã xem đủ20 ô.
- `PATH=/tmp/vocabulary-docs-validation/bin:/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH pnpm eval:ai`: PASS15 tests,40 reference outputs; CLI `python -B scripts/ai-benchmark/score.py … --kind self_test …`: PASS40/40, zero missing/no API. Negative pageIndex1 đã bị schema reject; chỉnh test expectation đúng lớp schema, không nới contract.
- `node --check scripts/ai-benchmark/render.mjs`: PASS. `scripts/validate_docs.py --full`: PASS144 links/17 skills351 resources/25 requirements19 tasks16 screens/20 JSON, schemas/positive-negative/crossrefs. `git diff --check` PASS; 20 owned text files whitespace,20 PNG dimensions/bytes/hashes, scorer report hash và ledger counts PASS.

Không app build/E2E rerun vì không đổi runtime UI/database;57 unit-integration/58 browser là evidence T04 trước đó. Không camera thiết bị/human/provider/cloud/UI recovery verified. Không commit/push/deploy/secret read/paid calls. Benchmark live không được suy từ reference fixture accuracy.


## 2026-10-09 — T04 local capture/drafts, chờ smoke điện thoại

Request: kiểm tiến độ và tiếp tục task ready. Audit T03 artifacts/code/ledger; 4 done/3 ready/12 planned trước triển khai, chọn T04 theo T02/T03. Giữ latest steering IPA/cách đọc Việt và gõ tay/lookup/autocomplete trong T07 planned, không coi docs là runtime features.

Implemented S04/S05: click-only camera permission/environment-user/preview/take; denied/unsupported file fallback; stop tracks capture/switch/close/hidden/leave + late-response guard/double-tap lock. JPEG/PNG/WebP≤10MB/20MP magic/header trước decode, EXIF baked/metadata stripped/JPEG.9/resize2200, rotate/reset/crop percentage controls/zoom. Metadata optional/date valid/consent-no-upload, autosave500ms/manual/back/SPA flush, honest status/error/retry. Local schema v3 additive captureDrafts + localMedia, atomic scoped two JPEG blobs/metadata/version, v1/v2 preserve content, quota rollback/stale editor/delete. Today resume qua parent gate, scoped draft list/reminder7ngày/xóa xác nhận; raw upload/name/GPS không persist. Analysis disabled/provider none; không tạo mock OCR result hay cloud outbox.

Verification actually run: `pnpm check` PASS lint/typegen-tsc/**57 tests (36 unit/21 integration)**/productionbuild; `pnpm test:e2e` PASS **58/58 (28 desktop+28 mobile proxy+2 demo-off)**, native Chromium156/IndexedDB production4320/4322. 8 capture scenarios ×2 include actual image EXIF6/color orientation/metadata strip/resize, consent restore/no network/resume, native quota create-update retry/stale peer. Acquisition mocked canvas MediaStream after GUM fake-device probe returned NotSupportedError; video/playback/tracks native, no OS permission/hardware proof. Legacy v1 test fixture filtered existing schema stores and native upgrade assertion20→30; original content preservation assertions retained. Final lint/typecheck PASS after browser-spec updates.

`node scripts/measure-capture.mjs` PASS six synthetic7,68/20MP JPEG runs Pixel7 CSS360/CPU4×/local production: input→draft commit→preview decode+2rAF269,4–334,5ms, observed main longtask≤60ms, 0 page errors. Raw captures/json at evaluations/t04; source SHA29251d7715086be3472042a3600b06cb40e1db68561f286a18eeb3e108d09f3c/build_gTxx7E-jbHaN0QV7dz2v integrity checked. No worker yet/no real-photo worst-case/device/field/AI accuracy claim. First screenshot batch scroll/focus capture artifacts corrected in harness; all4 recaptured from top/blur and viewed, no product CSS workaround. Scoped Impeccable layout detector via sh returned[]; launcher executable permission unchanged, no hook/global modifications. Review preserves incumbent Theme C and sources; no human QA25/a11y certification. Temporary diagnostics/browser/server4327 cleaned; dev4317 retained.

Docs updated README, founder, 03/05/06/07/10/11/13, START/STATE/TASKS + ADR-023/evaluations/t04-capture.md. Full doc validation PASS **130 local links/17 skills351 resources/25 requirements19 tasks16 screens/17 JSON**, schemas/fixtures/crossrefs. Git diff whitespace PASS; scoped whitespace33 text files PASS, ledger counts matched. Dev4317 health200 vẫn UI-preview/demo true/liveAI false/cloud false. **T04 pending_external** because acceptance11 explicitly requires QA07 smoke điện thoại thật: iPhone Safari/Android Chrome evidence absent. Ledger **4 done/2 ready/1 pending_external/12 planned**. Next **T00** eligibility/ground-truth/harness; live provider needs eligible source+credential. No camera hardware/OCR/provider/cloud/SRS/PWA/human/deploy/commit/push; no new runtime dependencies.


## 2026-10-09 — T03 local repository hoàn tất

- Pin Dexie4.4.6/dexie-react-hooks4.4.0 và fake-indexeddb6.2.5 dev-only. IndexedDB schema logical v1→v2 additive/defaults/derived search, guest/demo metadata scopes riêng; không reset DB/seeding lại parent edits. SSR chỉ import types/modules, instance mở trong client effect.
- Canonical v1 không lemma/semantic merge, compound uniques/sense POS-label/typed lesson links, snapshot reads, atomic save/search/receipts/payload hash/recheck race. Notes target/version và immutable review events có primitives; cloud outbox seam, chưa sync. Demo erqser correction giữ literal evidence. Stores capture/grammar/media/deck/SRS/transfer dự trù, không tick các features.
- Nối T02 UI vào Dexie live queries; draft buffer serialize/retry và persisted corrections/selections/receipts/reload. Library page50/overview20/Today4, derived EN/VI/tag/example/lesson terms và scope guards. Save error/quota/open blocked/stale edit có recovery giữ input; chỉ success sau commit. Đổi EN lưu proposal, giữ approved snapshot cho bé; editor khôi phục proposal và nêu rõ T07 review chưa nối. localStorage chỉ settings, không library/secret.
- Verification đầu sửa TS snapshot/Candidate nullable, Next role alert selector trong test; benchmark broad-query timeout do lexical ID order của harness, sửa expected-order. Không báo failed runs là pass. Format scoped bằng temporary prettier3.9.9, không project dependency/global hooks/config.

Lệnh cuối Node24.14.1/pnpm11.25.0: `pnpm check` PASS lint zero/typegen+tsc/**49 tests** (32 unit/17 integration)/production build; `pnpm test:e2e` **42/42 PASS** native Chromium1280/360 + demo off. `pnpm install --frozen-lockfile` PASS, `pnpm peers check` no issues. `pnpm perf:search` PASS **5.000 rows/50 mixed native inputs/CPU4×**: median141,1 ms, p95165,6 ms, max183,9 ms, 0 page errors; actual snapshot/materialize→matching DOM→two rAF, not field INP. Source/build/hash/gzip trace integrity PASS; screenshot5000mobile viewed. Local content synthetic/repo fixture, no provider/children telemetry. Full cold LCP/CLS/bundle after Dexie not rebaselined; T02 historical evidence kept.

Final docs checks: `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full` PASS **115 local links; 17 skills/351 resources; 25 requirements/19 tasks/16 screens; 16 JSON files**; schemas/positive-negative fixtures/cross-references validated. `git diff --check` và scoped whitespace40 files PASS; ledger4 done/3 ready/12 planned checked. Dev4317 health200 vẫn chỉ liveness UI-preview/demo true/no live AI/cloud.

Evidence evaluations/t03-local-repository.md + t03/search-baseline.json/search-trace.json.gz/library-5000-mobile.png. README/docs/03/05/06/10/11/13/founder/STATE/START/TASKS + ADR-022 updated. T03 done; **4 done/3 ready/12 planned**, P0 3/4, P1 1/13, P2 0/2. T04 camera/crop/drafts next; T00/T10 ready. No SQL/cloud/provider/lookup/autocomplete/IPA/audio verification/SRS/PWA/device/human/GitHubCI/deploy/commit/push. New IPA/cách đọc and manual autocomplete requirements remain T07 planned.


## 2026-10-09 — Bổ sung yêu cầu phát âm và thêm từ nhập tay

- Founder làm rõ phiên âm là IPA như nut /nʌt/, đồng thời xác nhận thêm gợi ý cách đọc gần đúng bằng chữ Việt. Bố cục dưới từ/câu: IPA → cách đọc gần đúng → nghĩa/bản dịch; IPA có kiểm nguồn/xác minh, UK/US khi có, cùng accent với audio; gợi ý qua parent review, thiếu dữ liệu có trạng thái rõ.
- Thêm đường S03/S09 gõ EN → autocomplete từ khớp/liên quan → tra nguyên input hoặc chọn gợi ý → chọn nghĩa/POS, sửa/duyệt → dedup/transaction save. Gợi ý phân biệt từ đã có/từ mới, không auto lưu; query race/cancel/IME/offline/quota/error/retry giữ input, nhập thủ công là fallback. Không cần ảnh/OCR ở đường này.
- Cập nhật source 01/02/03/06/07/08/10/11/contracts README/founder, START/STATE/TASKS; ADR-020/021. T07 vẫn planned; 3 done/2 ready/14 planned, T03 next. Chưa chọn nguồn tra live, chưa thay runtime/DB/schema v1.0/fixtures/mockup lịch sử; T07 cần version contract và triển khai các acceptance bổ sung. T02 editor memory không được coi là lookup/autocomplete/persistence.
- Đã chạy `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS 98 local links, 17 skills/351 resources, 25 requirements/19 tasks/16 screens, 15 JSON; schemas/positive-negative fixtures/cross-references hợp lệ. `git diff --check` PASS; kiểm whitespace 15 file docs thay trong lượt PASS. Đây là kiểm tài liệu; không chạy lại app/provider/cloud/device tests vì không sửa code.



## 2026-10-09 — T02 app shell/UI demo hoàn tất

- Port Theme C S03/S07/S09 vào Next React app, 3 nav/sidebar/bottom, welcome/parent gate, library/detail/editor và review10 candidates; preserve memory draft/edit/select/error/retry/receipt/all duplicates. Capture/Practice nêu rõ chưa connected; không tick T03/T06/T07/T09/T12 từ fixture UI.
- shadcn CLI4.21.4 docs/source add13 files (input/sheet/tabs/empty/field/checkbox/switch/skeleton/toggle-group/dialog + label/separator/toggle), aliases/composition reviewed, runtime deps/lock unchanged. Semantic input contrast3,16/focusopaque3 px/targets48, local Nunito và owned SVG fixtures/provenance từ T18; prototype giữ lịch sử.
- Small settings whitelist localStorage VI/EN/child/level/sound/motion; storage failure fallback/retry. Dữ liệu/secret không persisted. Demo-off empty, no provider, health stage ui-preview/liveness only. Speech controls explicit tap/cancel/stale-token/fallback, adapter test không voice thật. Hydration readiness guard + tests chờ đúng navigation destination.
- Verification sửa test role radio, navigation timing và fake utterance constructor; không báo các lượt fail là pass. Hai UI review batch sửa thiếu-hình flex/checkbox/tab; mechanical contrast/focus acceptance riêng cuối. Impeccable detect CSS trả[], không human gate. Baseline harness sửa query cùng-result không mutation + timeout2s; giữ raw cuối, lượt hủy không pass.

Lệnh cuối (Node24.14.1/pnpm11.25.0): `pnpm check` PASS lint zero/typegen+tsc/**22 unit**/production build; `pnpm test:e2e` **27/27 PASS** production1280/360 + demo off. `pnpm perf:baseline` PASS **15 cold loads + 50 native input actions**, LCPmedian760/1632/1624 ms, maxCLS0,0044, initialJS176,5–186,7KiBgzip, font98,7KiB, page298–322KiB; inputp95≈27,4ms trên20 entries/CPU4×. Exact raw final values/hash at evaluations/t02/baseline.json and ux-performance.md; not field/device/5.000-entry pass. Trace compressed, screenshots8 stored; no secret/child content telemetry.

Final docs/provenance checks: `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full` PASS **98 local links; 17 skills/351 resources; 25 requirements/19 tasks/16 screens; 15 JSON files**. `git diff --check` + scoped whitespace57 files PASS; source/build hash,15-run/50-action raw/trace gzip, owned SVG hashes and Nunito byte-identical PASS. Dev4317 `/api/health`200, ui-preview/demo true/liveAi-cloud false.

T02 done; **3 done/2 ready/14 planned**, P0 3/4, P1 0/13. STATE/START/TASKS/founder/03/04/11/13/README + ADR-019 updated. Next **T03 Dexie schema/canonical dedup/persistence/search5.000**; T00 independent. Human/device/WCAG/field INP/voice/AI/cloud/GitHubCI/PWA pending, no deploy/commit/push.


## 2026-10-09 — T01 scaffold app hoàn tất

- Dựng Next16.4/React19.3/TS6/Tailwind4, Node24.14.1/pnpm11.25.0, exact deps/lockfile; giữ toàn bộ docs/prototype và thay đổi sẵn có. shadcn CLI4.21.4 info/search/docs/add source Button/Badge/Alert/Card từ registry chính thức, review imports/aliases; Nunito/SVG dùng lại T18 với provenance. Trang mẫu có nhãn demo, 404/retry; chưa T02 app shell hoặc library thật.
- Env schema/example, server-only reader, boolean/quota/name guard không log giá trị; chỉ AI_PROVIDER=none. Health requestId/data/no-store chỉ liveness. APP_DEMO_MODE=false bỏ fixture tại runtime. Không secret, provider call, DB/cloud provisioning hoặc deploy.
- Scripts + CI configured; local pass không là remote CI pass. Metadata latest TS7/ESLint10 vướng peer nên chọn TS6/ESLint9, peer check sạch; ESLint9 có deprecation notice. unrs native optional binding đã sẵn, deny postinstall fallback thay allow-all. Serwist9.5.13 docs/metadata compatible ranges, chưa install/runtime/cache test.
- Next dev tự thêm managed rules block AGENTS; dùng bundled version docs và agentRules=false, bỏ đúng block tự sinh, dev restart giữ hướng dẫn repo. Impeccable context launcher permission denied; fallback trực tiếp AGENTS/04/founder/T18/craft-floor, không hook/global config hoặc formal critique. ui-ux-pro-max stack query fit server-components/local-font/env; dọn đúng 3 Python cache sinh ra khi search, không đổi pinned skill sources.
- T01 done, T02/T03 ready; 2 done/3 ready/14 planned. Founder report, STATE/START/TASKS, 05/09/11, ADR-018 và README/AGENTS cập nhật. Next T02 port UI, T03 IndexedDB và T00 harness độc lập; QA25/live AI/device/performance/cloud pending.

Bằng chứng đã chạy (Node24.14.1/pnpm11.25.0):

- `pnpm install --frozen-lockfile` PASS; `pnpm peers check`: no peer issues.
- `NEXT_TELEMETRY_DISABLED=1 pnpm check` PASS sau fixes: lint zero warnings, next typegen + tsc, **14 Vitest tests**, production Turbopack build. Sửa anonymous PostCSS export và lint glob chạm generated next-env.d.ts; không suppress source findings. Vitest config .mts dùng ESM rõ, không còn config warning.
- `pnpm exec playwright install chromium`; `NEXT_TELEMETRY_DISABLED=1 pnpm test:e2e`: **7/7 PASS**. 360/1440, keyboard skip/main/CTA, no horizontal overflow/page/console errors, 404/home, health/HTML server canary, demo off ở server thứ hai cùng build. Viewport giả lập trên desktop host, không device/human pass.
- `pnpm dev --port 4317`: GET / và /api/health 200, brand/demo label và liveAi/cloud false; dev restart sau agentRules=false. Bản app local còn mở cho founder; production test servers tự đóng.
- Xem ảnh desktop/mobile cùng một batch; sửa cách capture từ scroll0 để full-page Chromium không đưa hidden fixed skip link vào ảnh khi đã scroll, kiểm computed styles + keyboard, confirm ảnh lần hai. Ảnh/evidence trong docs/evaluations/t01-scaffold*; không chỉnh UI chỉ để bù artifact screenshot.

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **77 local links; 17 skills/351 resources; 25 requirements/19 tasks/16 screens; 14 JSON files**, schemas + positive/negative fixtures + cross-references.
- `git diff --check` + scoped whitespace **44 text files** PASS; exact direct versions, font byte/hash match T18, SVG provenance hashes, workflow YAML/static read-only/no-deploy checks, AGENTS preservation và ledger 2 done/3 ready/14 planned đều PASS. YAML/static checks không là GitHub CI run.

CI mới có workflow, chưa GitHub run; không app features P1/provider/cloud/device/human tests. Giữ dev preview4317, đã dừng production preview4318 tạo để inspect; E2E servers tự đóng. Không tạo commit/push trong lượt này; lockfile và toàn bộ thay đổi có trong workspace.

## 2026-10-09 — rà soát plan và báo cáo tiến độ cho founder

- Đọc START-HERE/STATE/TASKS, founder plan, delivery plan, ADRs hiện hành và evidence T18/QA25; đối chiếu cây file/code prototype. **App chưa hoàn thành:** 1/19 task done (T18 thiết kế), 2 ready (T00/T01), 16 planned. P0 1/4 done, P1 0/13, P2 0/2; chưa task app production nào được nghiệm thu.
- Bổ sung bảng tiến độ theo 8 chặng + P2 ngay đầu KE-HOACH-FOUNDER; giữ một nguồn plan founder, không tạo report/index cạnh tranh. TASKS/STATE ghi kết quả rà soát, không đổi task statuses, quyết định hay phạm vi. Next action vẫn T01 → T02/T03; chuẩn bị T00 harness độc lập.
- Cây file chưa có package.json/src/app/supabase/CI app. Code prototype dùng fixture/sessionStorage và ghi rõ camera/OCR/OAuth/cloud/SRS chưa kết nối. QA25 human, live AI, thiết bị và performance production vẫn pending; không chạy lại browser trong lượt này.

Bằng chứng kiểm tra:

- Script Python đọc ledger/manifest: counts `ready=2, planned=16, done=1`; đủ 16 màn, 25 asset records hiện tại/lịch sử kiểm file/byte/SHA-256 và prompts đều khớp; 13 screenshot browser đã có.
- `python3 scripts/validate_docs.py --full` chưa chạy được schema validation vì Python mặc định thiếu jsonschema. Dùng virtualenv có sẵn, không cài thêm: `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full` PASS trước và sau cập nhật; lần sau kiểm **72 local links; 17 skills/351 resources; 25 requirements/19 tasks/16 screens; 14 JSON files**, schemas + positive/negative fixtures + cross-references.
- `git diff --check` và kiểm whitespace/fences riêng 4 file founder/TASKS/STATE/CHANGELOG PASS. Đây là validation báo cáo/tài liệu; không app/provider/cloud/device/human tests.

## 2026-10-09 — T18 artifacts hoàn tất, sửa UI và thêm Impeccable

- Đủ 16 ảnh Words for Kids/Theme C theo 16 graph/spec; S02/S16 copy corrections và 9 revisions theo phản hồi founder về no-face objects/equal answers/compact results. Originals/versioned PNGs giữ nguyên, prompts/hash/dimensions có trong manifest/jobs, gallery dùng latest assets.
- Prototype static HTML/CSS/JS core S03/S07/S09/S12/S13 + support flow trong design/prototype, fixture/sessionStorage có nhãn. SVG vật thể không nhân hóa, backpack có quai/ngăn/zip; game ba đáp án ngang nhau, disabled opacity 1, feedback/results màu+icon+label. Diagnostics inspect=1. Nunito Vietnamese variable WOFF2 101.028 bytes, OFL/source commit pin, font-display swap/preload.
- User yêu cầu pbakaus/impeccable: skill-installer download helper pin d631a8827f99414d2b6daba4ef08b7f8701751d7, Apache/NOTICE giữ; 17 skills/351 resources. Đọc craft-floor/distill/layout/colorize/typeset và formal critique workflow; chỉ scoped refinement/self-review, không invoke formal dual-agent critique. Context chạy một lần; engine 0.1.14 tải với SHA sidecar vào cache tạm, no hooks/global config. Detector một cream-palette warning giữ theo founder brief, không claim sạch hoặc UX pass.
- CUA browser tests: empty/parent/consent/review; uncertain sửa/selection; save fail giữ nháp và retry 7 mới+3 có+2 mẫu; no-match search recovery, bank hai senses/long VI; flash reveal/rating; G01–G04; đủ 10 câu G02 với 7 đúng/2 sai/1 skip/2 hints; missing image exclusion; word/sentence/grammar play/pause/reduced motion; reload pause/resume. Mobile360/desktop1440 và screenshots *-v2.jpg. Thêm nút Tìm Hôm nay; cancellation token chặn lỗi audio cũ sau nav. Chưa xác nhận giọng trên điện thoại thật.
- SELF-REVIEW + QA25-HUMAN-STUDY + README cách chạy và giới hạn đã có. T18 done ở mức artifact; QA25 human pending. Founder plan tự chứa cập nhật gallery/tiến độ/Impeccable/no-face/ranking/cách xem; 04/03/08/13/14/AGENTS/STATE/START/TASKS/catalog/lock/ADRs synced.

Bằng chứng kiểm tra:

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **69 local links; 17 skills/351 resources; 25 requirements/19 tasks/16 screens; 14 JSON files**, schemas + positive/negative fixtures + cross-references. Validator được sửa dùng urlsplit().path để link local có query như ?seed=1 không bị nhận nhầm là tên file.
- 16 final PNG/prompt/hash/dimension checks PASS; 3 JS `node --check` PASS; owned-text whitespace + git diff --check PASS.
- Resource check tĩnh: JS total 61.0 KB raw, WOFF2 101.028 bytes; contrast token chính 5,52–11,57:1. Gzip chỉ estimate offline, server chưa bật gzip; không CWV/INP/AI p95/device benchmark.
- Detector exit2 với đúng một cream-palette warning; results ở prototype/impeccable-detect.json, justification trong SELF-REVIEW. Browser overlay không inject.

Chưa camera/crop/OCR/AI provider/key/IndexedDB/cloud/OAuth/SRS/PWA/app framework/live benchmark/device/human usability/deploy. Next T01 scaffold/T02 port UI/T03 IndexedDB, T00 ground-truth/harness độc lập; paid/live cần provider eligible + credential. Không suy runtime features từ concept/docs/skill installation.


## 2026-10-09 — Words for Kids, Theme C tạm chốt, media search và concurrency

- Founder xác nhận “Tạm chốt cái UI đó”, sau đó đổi tên app thành **Words for Kids** và yêu cầu project tập trung theo hướng đó. Ưu tiên trẻ 5–8/parent preparation, VI/Beginner/child-friendly on, non-reader nghe/chọn hình. Theme C gate satisfied; 15 ảnh còn lại planned-ready, T18 vẫn in_progress vì chưa clickable. Không sửa prompt/PNG gốc hoặc hứa đã đổi chữ trên ảnh lịch sử; future mockups/code dùng tên mới. Checkout path giữ để không làm hỏng workspace.
- Theme C raster được sinh ở vòng trước steering này: original coral fox/berry, 853×1844, 1.480.731 bytes, SHA-256 `cc347d5f23db54977e4acc4609f26b1c2d02c3a464ae9b60e30710875d98fbbe`. Imagegen integrated; original prompt + PNG retained. A rejected, B superseded. Manifest/checksum checked, no new UI images generated during this media/rebrand response.
- Đồng bộ README/AGENTS/docs00–14/founder/ai STATE/START/TASKS/DECISIONS và custom skill prose/lock. Founder giữ một plan tiếng Việt tự chứa, mục15 gồm vision→examples, catalog→open search→sense/license/parent approval→import/credit/cache, PNG-vs-layered animation, dependency graph/concurrency/cost/key. S03/S09/S10/S16 graphs thêm parent context/image review/key gate, không thêm S17.
- Thêm R24 (parent/admin eligible provider/key), R25 (licensed cartoon sourcing + bounded concurrency) và QA28/29; trace inventory 25 R/19 T/16 S. Domain human learning approval tách AI contentStatus/version, không tự approve từ provider response.
- Official Gemini terms/pricing/rate/key docs được kiểm: Developer API không phù hợp child-directed/likely-under18-accessed app, parent key không bypass; image models checked no free tier; quotas per project. Chưa chọn provider; không tự chuyển paid. Catalog/templates/voice device giảm calls nhưng không cam kết toàn bộ runtime miễn phí.
- Cài `node` từ `mcollina/skills`, commit `72b72751477157ebda36203eaffac701ac5df5ae`, project-local qua skill-installer `--method git` sau Python urllib lỗi CA; không tắt TLS. Root MIT LICENSE và 20 resources giữ; SKILL + async-patterns/performance/caching đọc; không execute supporting server test assets. Tổng 16 skills/287 resources. Native TS/stream recommendations không thay Next/toolchain hoặc ép CSV pipeline cho A4.
- Khảo sát SkillMedev stock-photo-finder/API/visual-asset-curation/image-license-rights commit `6b3044d569595b481a3677da8f68af7aa239dc09`, đọc SKILL/license, chưa cài vì photo/landing focus và legal assertions quá rộng. Nguồn chính thức Openverse/Commons/OpenMoji + contract14 dùng thay việc cài thêm không phù hợp. Không coi community license summary là quyền dùng asset.
- Openverse metadata probe qua normal-TLS curl query `apple illustration`, filter cc0/by/page_size3: response JSON resultCount240, ba candidates ghi CC0 trong index. Record `docs/design/media-search-probe.json`; zero image download/visual review/source-license verification/child-approved assets. Endpoint web fetch từng trả403, curl success. Không lấy ảnh mạng về để né browser display restriction.
- `scripts/demo_media_concurrency.mjs` chạy Node với timer giả lập: sequential peak1,156ms; bounded peak2,78ms; 6 unique calls cho 7 lookups, same-word different senses không gộp; một media failure được tách. Assertions bounded/in-flight dedup/sense/partial failure pass. Không dùng thời gian giả lập làm speedup claim cho API/app; cancellation/global quota/distributed limiter cần QA29 runtime.

Kiểm tra:

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **41 local links; 16 skills/287 resources; 25 requirements/19 tasks/16 screens; 9 JSON files**, schemas + positive/negative fixtures + cross-references.
- skill-creator quick_validate cho bilingual-learning-content/worksheet-extraction/vocabulary-delivery/node: PASS frontmatter/naming; không là UX/performance/behavior audit.
- Mermaid12.1.0 + jsdom26.1.0 parse: PASS **25 graph** trong docs, founder19 gồm tổng thể +16 riêng +2 pipeline; syntax only, chưa render/UX.
- `git diff --check` và whitespace scan43 owned files: PASS; theme approved/gate satisfied, manifest16, checksum cả3 image gốc PASS. Không app/provider/cloud/device tests hoặc public deploy.

## 2026-10-09 — founder từ chối A, dựng lại S03 Theme B

Founder chê màu xanh dương xấu/tầm thường và UI chưa thể hiện chất lượng từ tham khảo Inspo/skills. Ghi A rejected, không tiếp tục nhân rộng hướng xanh.

- Đọc lại frontend-design/ui-ux-pro-max; search design-system rồi một retry domain style. Output landing/testimonials, indigo/font kids không fit screen học mọi tuổi nên không persist hoặc áp cả bộ; Claymorphism/Soft UI là lựa chọn được đánh giá, không làm authority. Art direction theo sản phẩm và frontend-design.
- Hosted Inspo initialize/tools/list verified, get_design_system live=false Headspace/Daybridge đọc lại. Trực tiếp xem capture Headspace mobile 375×812 và Daybridge desktop 1440×900. Python urllib ban đầu lỗi trust store local; chuyển curl TLS bình thường, không disable certificate verification. Không download remote image, không test interaction/performance app nguồn.
- Sinh **một ảnh mới S03 Theme B v1** bằng imagegen tích hợp, composition mới không edit A. Vàng bơ/lilac/tím mận, capture riêng, hai bìa lesson mint/peach, minh họa thẻ từ, Luyện tập icon cards. Copy unmodified vào `docs/design/mockups/s03-today-theme-b-v1.png`; prompt `docs/design/prompts/s03-today-theme-b-v1.txt`. 853×1844 px, 1.434.455 bytes, SHA-256 `08613d97ae7702520d5331c2990dffab93e510d96aca17299857394ef056a4c7`.
- Kiểm bằng mắt text VI/3 nav/CTA/fixtures/apple/Nghe/local status. Ghi rõ ảnh còn shading và số 8 lớn hơn prompt dự kiến, chưa phải bản code/contrast/type-scale đã đo. Theme B chờ feedback; không tự khẳng định đẹp/UX pass.
- Founder mục 4.3/7/16, 03/04, STATE/START-HERE/TASKS/ADR-013, Inspo evidence và manifest cập nhật. A/hash/prompt giữ rejected history; B là current proposed. 15 màn còn lại chưa sinh, T18 vẫn in_progress và chưa clickable. 16 graphs/screens không đổi chức năng.

Validation:

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **40 local links; 15 skills/267 resources; 23 requirements/19 tasks/16 screens; 8 JSON files**. Lần đầu phát hiện 3 pyc cache do local UI search tạo; chỉ dọn các file cache tự sinh, không sửa nguồn skill/lock; chạy lại pass.
- Check manifest: một current S03 B và một rejected A, hash/dimensions/bytes/prompt khớp; 15 trạng thái planned vẫn chưa sinh; approved=false. Founder giữ 16 sections/18 graphs; không còn rejected blue primary token trong founder/04. Whitespace **38 owned text files** và `git diff --check` pass.

Next action: founder nhận xét **B**; chỉnh tiếp nếu cần, sau khi chốt mới sinh 15 màn. App/prototype/animation/a11y/performance/usability/provider/cloud chưa được kiểm bằng runtime.

## 2026-10-09 — graph đủ 16 màn và một ảnh UI nhận xét theme

Yêu cầu mới: graph flow riêng từng màn, chi tiết đầy đủ trong founder plan; tạo một ảnh trước để founder nhận xét theme rồi mới sinh toàn bộ.

- Mở rộng mục 4 KE-HOACH-FOUNDER: graph tổng S01–S16, 16 graph riêng và purpose/bố cục/CTA/trạng thái lỗi/back/retry/ảnh đại diện cho từng màn. Giữ founder đọc một file. Tổng file có 18 Mermaid blocks, gồm graph capture trước đó, graph tổng mới và 16 graph riêng.
- Bao phủ các biến thể thuộc S09/S10/S13, bốn game, rating trước/sau reveal, dữ liệu local/cloud, enrichment chưa hoàn tất, permission/network/storage errors, account merge checkpoint. Nav vẫn chỉ 3 mục; focus flows dùng back/pause giữ công việc.
- Dùng product-design shape/spec, frontend-design và imagegen. Decision/rule IDs ghi ADR-012; các quyết định chưa kiểm bằng UI thật. Fixture chuỗi ảnh thống nhất: hai bài cũ ở S03, apple đã có, School objects mới với pencil mới/book đã có; 8 mới + 3 đã có = 11 từ liên kết bài, mẫu câu tính riêng.
- Sinh **đúng một ảnh S03 Theme A v1** bằng imagegen tích hợp, không CLI/API fallback, không regeneration hoặc chỉnh pixel. Copy unmodified vào `docs/design/mockups/s03-today-theme-a-v1.png`; giữ prompt tại `docs/design/prompts/s03-today-v1.txt`. 853×1844 px, 1.244.811 bytes, SHA-256 `9009335e8daa728d250cffd5d27080d710786f01e399f0a6f274413c56d2a091`. Visually checked VI text, 3 nav, primary/secondary CTA, lesson fixtures, apple/Nghe/local status. Icon Luyện tập giống chart sẽ đổi sang thẻ học khi code; theme chưa accepted.
- Thêm `docs/design/ui-mockup-plan.json` đủ 16 records: S03 generated-awaiting-feedback, 15 ảnh planned-waiting-feedback; gồm graph section, route, representative state, planned outputs và asset/prompt evidence. S04 là camera mở, S12 là revealed hai rating, thống nhất với founder.
- Đồng bộ 03/04/13, README, START-HERE/STATE/TASKS/DECISIONS. T18 in_progress: graph/concept pre-stage có, clickable acceptance chưa đạt. Next action là feedback theme S03; gate do **user trực tiếp yêu cầu**, không do skill tự đòi approval.

Bằng chứng kiểm tra:

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **40 local links; 15 skills/267 resources; 23 requirements/19 tasks/16 screens; 8 JSON files**; schemas/fixtures/cross-references hợp lệ.
- Check cấu trúc: đủ 16 section S01–S16 đúng thứ tự, mỗi section có một graph/mục đích/bố cục/trạng thái; manifest đủ 16 records; đúng một PNG; hash/kích thước/bytes/prompt khớp; theme approved=false và 15 ảnh chưa sinh.
- Mermaid 12.1.0 parse toàn bộ **18 graphs** trong DOM jsdom, dependency validation chỉ ở `/tmp/vocabulary-mermaid-validation`, không thêm package/runtime vào repo. Node-only lần đầu thiếu DOMPurify hooks; đã dùng DOM thật từ jsdom để parse. Bản jsdom 30.1.2 parse được nhưng engine range không nhận Node 23; đã thay bằng 26.1.0 hỗ trợ Node >=18 và kiểm lại.
- `git diff --check` pass; kiểm riêng whitespace **37 owned text files**, gồm docs untracked, không lỗi.

Ảnh tĩnh và docs validation chưa chứng minh animation/a11y/performance/usability hoặc OCR/cloud thật. Chưa có app, clickable prototype hay human test. Không sinh các ảnh còn lại trước feedback của founder.

## 2026-10-09 — bổ sung UX/UI/performance, founder plan và InspoMCP

Yêu cầu mới: đẹp/dễ dùng cho cả trẻ em, đủ hướng dẫn UX/UI/animations/performance; founder cần một tài liệu tiếng Việt độc lập; cài và nghiên cứu InspoMCP.

- Thêm 6 upstream bundles project-local pin commit: ui-ux-pro-max, product-design, ui-animation, performance, core-web-vitals, accessibility. Tổng 15 skills/267 resources; LICENSE/supporting resources giữ lại, lock cập nhật. Local CSV design/UX search đã chạy không persist; narrow retry vẫn có kết quả không fit, ghi quyết định fallback theo product-design/project spec tại 13.
- Tạo KE-HOACH-FOUNDER.md tự chứa 16 phần, 16 màn, flow, visual references, motion, performance, roadmap 8 chặng, chi phí, status. README ưu tiên founder file; AI vẫn dùng docs/ai ledger.
- Đồng bộ 00/01/02/03/04/08/10/11/13: 3 nav, một primary CTA theo state, guest Bắt đầu, progressive disclosure, child-friendly hai rating trước mắt dùng cùng reducer. N08/N09, QA25–27, T18 ready trước T02. Tổng 19 tasks; chưa có prototype/human test/app.
- Inspo npm 0.1.16 installer inspected + dry-run. HTTP install thất bại vì Codex CLI trên máy không nhận --url; local install target Codex thành công. Có config backup, TOML parsed, chỉ entry inspo được thêm/pin. Stdio initialize xác minh `{name: inspo, version: 0.1.16}`, tools/list 15 tools gồm recommend/search_screens. Không tự restart desktop; discovery phiên app và Antigravity vẫn chưa kiểm.
- Gọi hosted initialize/tools/list + một recommend, hai search, get_screen/get_design_system live=false cho Headspace/Duolingo/Daybridge/Bear. Trực tiếp xem 4 desktop captures qua browser, lưu metadata/URLs ngày chụp và adopt/adapt, không tải ảnh vào production. Bốn DESIGN.md links trực tiếp trả HTTP 200. Không test interaction/animation của app nguồn hoặc gửi learner data.

Bằng chứng kiểm tra:

- `/tmp/vocabulary-docs-validation/bin/python scripts/validate_docs.py --full`: PASS **33 local links; 15 skills/267 resources; 23 requirements/19 tasks/16 screens; 7 JSON files**, schemas + positive/negative fixtures + cross-references.
- skill-creator quick validator: vocabulary-delivery và ui-ux-pro-max valid; custom delivery manifest/hash cập nhật. Những bundle upstream khác giữ nguyên nội dung nguồn.
- `git diff --check` pass; riêng whitespace check 28 file owned docs/README/AGENTS/validator không lỗi. Founder fences balanced, 16 sections; source link checks phía trên.

Đây là validation bộ kế hoạch, integrity và MCP smoke. **Chưa có app/provider/cloud/device/usability/performance tests đã chạy**. Next action T18 prototype theo STATE; scope lượt này kết thúc ở skill, công cụ nghiên cứu và kế hoạch.

## 2026-10-09 — chuẩn bị kế hoạch

Đã tìm nguồn GitHub, kiểm SKILL/license/provenance, dùng skill-installer cài 6 bundles theo commit vào project và tạo 3 skill riêng. Đã ghi 16 screen specs, requirement/flow/data/API/AI/learning/motion/test plans, contracts/fixtures và ledger triển khai.

User steering được tích hợp: web/PWA trước, mọi người học; không giới hạn trẻ em.

Không thực hiện cloud provisioning/deployment/call AI trả phí. Chưa có app hay live OCR benchmark. Kết quả validation bộ docs sẽ ghi tại phần dưới sau khi chạy, không đồng nhất với app QA.

### Validation planning bundle

Đã chạy thành công:

- `python scripts/validate_docs.py --full` trong virtualenv validation: 22 local links; 9 skills/146 resources; 23 requirements/18 tasks/16 screens; 6 JSON files. Hai schemas Draft 2020-12 hợp lệ, samples hợp lệ, trường dư bị từ chối và evidence/token/mnemonic refs của samples được kiểm tra.
- `skill-creator/scripts/quick_validate.py` cho 3 skill tự viết: cả 3 hợp lệ.
- `git diff --check`: không phát hiện whitespace error trong tracked diff; kiểm riêng docs/skills tự viết cho file mới trước bàn giao.

Libraries validation: jsonschema 4.26.0, PyYAML 6.0.3 trong virtualenv tạm, không cài global. Script upstream không được chạy. Không có app/provider/cloud/device tests được chạy; source script review ở mức inventory và static reading, không phải full security audit.

## 10/10/2026 — bản local học xuyên suốt theo ADR-025/026

Nối manual entry/catalog autocomplete21/explicit dictionary lookup, source-checked IPA nut/book/grapes và reading hints; capture→Tesseract7 same-origin owned worker/cancel→parent batch review/save. Schema v4 autosaved learning drafts/CAS, complete parent review, additional bilingual example/pattern/grammar; notes3 templates với playback/static; decks/directions/filters/SRS và4 games dùng approved stored content, persisted feedback/attempts/resume.

Local scope switch demo/guest không trộn dữ liệu; disable khi DB chưa ready. Text merge backup và full archive chứa ảnh/lịch sử/content/decks, strict checksum/bounds/FK/canonical/atomic empty-library restore, reset approval/consent/IPA trust; delete confirmation. PWA manifest/PNG icons/Nunito, public-only hashed SW, offline approved library/flashcards/4games/session resume/shared SRS/native atomic writes. Migrations0001–0003 owner RLS/constraints/private bucket/canonical với Postgres15 thật local; Auth/Storage fixtures, cloud app chưa nối.

Đã chạy: **pnpm check PASS** lint/typecheck/71 unit-integration/build; **pnpm test:e2e 96/96 PASS** desktop1280/mobile360/demo-disabled trên production; **pnpm test:sql PASS** isolated cluster/owner roles/constraints/history/storage policies; layout screenshots360/1280 và overflow JSON, Impeccable layout detector`[]`. Lần trước phát hiện selector label sai và scope control trước DB ready; sửa rồi full rerun PASS. Bằng chứng [local end-to-end](../evaluations/local-end-to-end.md). **pnpm docs:check PASS** 159 local links/17 skills/25 requirements/19 tasks/16 screens/22 JSON; schema validation không chạy trong lệnh này.

Không gọi camera acquisition mock thành physical smoke, synthetic OCR thành benchmark accuracy, SQL fixture thành Google OAuth/Supabase API, detector thành human UX pass. AI eligible/live gateway/enrichment/media search, auth/sync/merge/account deletion, current performance/device/human/release chưa đạt; 4 done/2 pending_external/10 in_progress/3 planned. T16 local OCR kéo lên fallback, P2 expansion chưa chọn. Founder plan/START/STATE/TASKS và05/06/08/09/11 cập nhật. Không deploy/paid calls/commit/push.


## 10/10/2026 — IPA catalog/bank và cloud local ADR027

Sửa phản hồi founder: IPA có nguồn toàn catalog21, bank `/bæŋk/`, chọn nghĩa ngân hàng/bờ sông theo câu; backfill null giữ meaning/user edit. Thêm pinned Supabase SSR/server PKCE cookie/getUser, account page/scoped cache, durable cloud sync/CAS/receipt/cursor/conflict, exact unpublished ID remap, guest preview/backup/transaction giữ nguồn, server SRS từ immutable review events và logout đa tab/session recheck. Auth không tự gộp guest hoặc upload ảnh.

**pnpm check PASS** lint/types/78 unit-integration/build; **pnpm test:e2e101/101 PASS** production desktop/mobile/demo-disabled/cloud local; **pnpm test:sql PASS** Postgres15 temp cluster migrations0001–0004/ownership/RLS/FK/unique/receipt/CAS/rollback; **pnpm docs:check PASS**163links/17skills/25requirements/19tasks/16screens/23JSON (không schema validation). Test cloud rating từng fail vì điều hướng trước commit; thêm chờ kết quả rồi full rerun PASS.

[Cloud local evidence](../evaluations/cloud-local.md): identity Google/Auth có nhãn và HTTP bridge giả lập; SDK/API và PostgreSQL/RLS thật. Chưa Google/Supabase APIs live, ảnh cloud/account deletion/advanced merge hoặc toàn bộ plan. Restart4317 và kiểm browser founder: `/bæŋk/`, hai lựa chọn nghĩa, giữ định nghĩa founder sửa. Docs nguồn/DECISIONS/founder/ledger cập nhật; taskcounts vẫn4done/2pending_external/10in_progress/3planned. Không deploy/commit/push/paid/provider calls.

## 10/10/2026 — Hoàn thiện code độc lập, Commons live smoke và setup ADR028

Source cloud consent/owner/no-store/EXIF/idempotent bytes retry/delete, account recent-auth deletion/write freeze/orphan cleanup/cascade/local scope clear/guest retain; notes keep-both và per-field meanings pending review. Optional Commons adapter/shared SQL leases quota/HMAC source/hash/time receipt/approved exact-revision image/sync/archive/credit; public live smoke phát hiện thumbnail host2026, thêm exact thumb.wikimedia.org + reject suffix hosts, search4 + raster import JPEG400×512/23.863bytes PASS, không parent approval/library save.

Catalog21 đủ2examples/hints; primary/secondary explicit order/editor reapproval; enrichment1.1 fixture/parser không auto verified. S10 bốn loại approved scope/revision search/lesson/page50. Offline basic parent add/edit/CAS/dedup/prepared reader8assets/hash/WASMvariants/actual raster OCR/cancel; không full fallback grammar/media/headword rename/account cold boot. Progressive public shell/space reserves + detail module split/lazy content modes, private data scope guards giữ.

`pnpm check` PASS lint/types/**85 unit-integration**/build; final `pnpm test:e2e` **105/105 PASS** desktop1280/mobile360/cloud fixture/demo-disabled; `pnpm test:sql` PASS migrations0001–0006/PostgreSQL15 owner RLS/FK/unique/CAS/deletion/storage/media quota. Google/Storage identity/HTTP bridge giả lập, actualSQL/SDK/routes/IDB/worker thật. Hai failed browser runs vì hidden streaming SSR duplicate summary đã sửa locator visible/chờ ready và full rerun PASS; không tính failed runs là pass. Full docs validator schema/fixtures/crossrefs PASS; Vercel config kiểm Draft7 against officialdownloaded schema (upstream schema auto meta-validation có lỗi unrelated triggers/items); Supabase TOML parse PASS, không hosteddeploy/CLIstack/GitHubCI.

Final lab source/build hashes và raw reports ở [completion-local](../evaluations/completion-local.md), current-ui/current-search, screenshots360/1280. Search5.000/50actions CPU4× p95≈150.7ms/max158.6 PASS200, search20p95≈28.2ms; Today/Practice LCP≈0.76/0.82s, CLS all≤.0282, Library LCP≈2.92s vượt2.5s, không QA26 full pass/phone/field/human. HistoricalT02/T03 không ghi đè. Founder browser bank IPA và hai nghĩa giữ definition đã sửa.

SETUP-PROJECT/README/envexample/Vercel/Supabaseconfig/CI đã chuẩn bị: intro/install/run/env nơi lấy/Google2callbacks/migrations/Commons/signing/deploy/troubleshooting/gates. Founderplan/STATE/TASKS/START/DECISIONS và source07/08/09/11/14 cập nhật. Count4done/2pending_external/10in_progress/3planned: T00→T05 eligibility/account/retention và AIgateway runtime chưa làm, không chỉ thiếu key; hosted/physical/human/pilot/P2scope chưa đạt. Production4317 restart build cuối để founder test một lượt. Không commit/push/deploy/paid AI/provider call; Commons public smoke là networkread chủ động.

## 2026-10-10 — Gemini hosted READY

f460e1f pushmain nativeGit→dpl_EMHjqzXRtXHRZXm3qE3ZPPPfBGmr READY, stable https://words-for-kids.vercel.app. Browserhosted verified Geminikey/default/presets/custom/localStorage/delete; screenshot/evidence parent-dictionary-byok-deploy. Full Gemini check104unit/build +113browser PASS; docs193links PASS. CI7b1e997 SUCCESS, CIf460e1f SUCCESS. Providerinference/key/quality/eligibility/accountbudget/livecloud/phone/human chưaclaim.

## 2026-10-10 — Final illustration POS/sense guard

Concrete noun mapping/catalog hoặc appearance adjective có gloss; orange color/pretty adverb không tự nhận fruit/person. Check104/lint/types/build + targeted parent-ai8/8 PASS; full113/remoteCI f460e1f SUCCESS giữ provenance mốc trước. Source/evidence/STATE updated; follow-up Git deploy/CI tự chạy.

## 2026-10-10 — Capture review and streaming follow-up

ADR031 upload drag-drop/source prepared photo/inline key/action reasons: c74a2e2 check104/full117 E2E PASS, nativeGit production READY, CI38028605020 SUCCESS. ADR032 adds real Gemini SSE/stages/elapsed/indeterminate activity/partial unsaved words/90s/stop; removes stale pending text on error and fixes REST JSON format enum. Evidence capture-review-ui; final check109/13files/lint/types/build, full119/119 E2E and docs203links PASS; actual stream CORS OPTIONS200. Live inference and physical/human gates remain pending.

Streaming source7eeb25e production READY (dpl_5GuJjph4QsX362DqJb2e7E8Qe8uT/stable alias); CI38029422569 in progress at record time. No live inference or key access.

## 2026-10-10 — Google rejection diagnostics

ADR033 giữ HTTP/status/model/message/reason/field errors đã redact, không metadata/log/persist; preconditions/non-JSON errors rõ ràng, draft còn nguyên. Check111/13files/lint/types/build và full121/121 E2E PASS; docs203links PASS; deploy/live cause đang kiểm.

Live diagnostics0ba9794 READY, một user-authorized POST trả400 INVALID_ARGUMENT/Request contains an invalid argument/no fields. Chuyển stable GenerateContent JSON fields + provider-only string pruning, thêm metadata GET15s/no image/inference; check113 PASS, full123/123 E2E/docs203links PASS; bản request tương thích đang deploy/thử sau sửa. Không đọc/print key, không parent approve/save.

10/10/2026 ADR033 follow-up: source2ec2725 productionREADY/CI38037820735 SUCCESS; metadata GET thật accepted key/model nhưng compatible image POST vẫn400 INVALID_ARGUMENT/no fields. Thêm nút câu mẫu cố định không ảnh/schema (explicit click/64output/15s/no retries/no persistence) để cô lập inference; check114 unit/13files/lint/types/build PASS, browser/live follow.

Câu mẫu diagnostic: pnpm check PASS114 unit/13files/lint/types/build; full pnpm test:e2e PASS125/125 (1.5min), docs validator full PASS203links. Live result/deploy chưa ghi tại mốc này.

837c50f productionREADY dpl_4KAsqShNDN6wzTfdW3BK2c9eQHZy; actual minimaltext POST thành công samekey/model. No image/worksheet/schema in control; did not display/persist model control output. Next request uses JSON mode and explicit prompt schema while strict local validation remains; live after pending.

JSON mode verification: pnpm check PASS114unit/13files/lint/types/build, full pnpm test:e2e PASS125/125 (1.5min), full docs PASS203links. Deployment/live image result follow.

Live verification10/10/2026: source581ef67 nativeGit production READY dpl_9WVCDSxXJ3EL3XzcDg2SLwercxib/stable words-for-kids.vercel.app. Third image POST on same founder draft/photo/key/model3.5FlashLite succeeded: real SSE provisional9 words observed at8s, then final STOP/DTO/evidence accepted13words; bilingual meanings/POS/sense/examples populated in editable review. No parent approval or child/library save. Removing responseJsonSchema while retaining JSON MIME/explicit prompt schema fixed this observed request; Google400 never identified individual schema field, so do not overclaim which constraint failed. Bounds/schema/evidence remain locally enforced before draft replacement. Total this turn:1metadataGET,1minimaltextPOST,3imagePOSTs; no automatic retry,model,billing,key read/log/secret artifact or external message. Private screenshot stays /tmp/wfk-gemini-live-success.png, not Git. One successful image is integration evidence, not the T00 benchmark/accuracy/retention/cost/eligibility gate.

## 10/10/2026 — Picture autofill, question grammar and learning-day sets

Fixed thumbnail nested anchors/credit overflow; added teacher/box/jar/shelf art. Automatic dictionary noun lookup downloads licensed pinned online SVG, cancellation/timeout/retry and approval gating; intelligent symbolic brain. Parent completion fills missing art with CAS/preserves approved text; complete project templates What is it?/It’s… + Is it…? saved atomically from image review. Day/set manager exposes separate imports and daily typed groups, searchable title/date/word, new/review counts, rename/date CAS and set-specific practice. Upload filename/date defaults; typed date survives draft. check121/14PASS; full133/133browserPASS; deployment result follows in [evidence](../evaluations/library-media-and-date-sets.md).

10/10/2026 ADR036: every future photo submit integrates exact dedup, automatically downloaded/reviewed missing art and original source-pattern excerpts + Vietnamese grammar/3-step reduced-motion teaching. Imported colon-ID detail/edit/notes route fixed after real founder reproduction. Old13-word set completed via hosted parent UI once (6art/2patterns); future imports need no source changes. check125/15/lint/types/build PASS; full137/137browser and full216links docs PASS; deploy evidence to follow in [library evidence](../evaluations/library-media-and-date-sets.md). Ledger unchanged; external/device/human gates open.

ADR036 source0c22f0f productionREADY dpl_27FsfRqhma2o2kjekgFnA7F8z9bD, stable words-for-kids.vercel.app. Hosted actual teacher now opens with image/meaning/example; existing13-word set Patterns/Grammar each2approved items,3-step Vietnamese teaching verified. Full local check125/137browser/docs216PASS; remoteCI38043514632 SUCCESS (all check/SQL/browser/docs steps). External/device/human gates unchanged.
