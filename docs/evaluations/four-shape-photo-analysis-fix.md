# Sửa phân tích bốn ảnh đếm cạnh — 14/10/2026

## Evidence và nguyên nhân

Founder gửi hai screenshot review, chứa preview bốn ảnh: “Let's count the number of sides...”, “It has three sides.”, “Let's count!”, “How many sides does a triangle have?”. Không có bốn ảnh source đầy đủ hay provider response của phiên trên điện thoại. Chỉ thumbnail được crop từ screenshot bằng sharp, 164×355 JPEG; không upload screenshot chứa UI/đồng hồ/account. Các thumbnail crop là probe của task, không thay đổi file user.

Live Gemini3.5FlashLite trước sửa tái hiện **invalid-result**, HTTP200/STOP chứ không quota/output-limit: ảnh1 trả schema wrapper rồi repair đúng; ảnh2 đọc sides; ảnh3 trả literal `Let's count!` với word `Let's count`, repair tiếp trả word `count` và numerical labels1/2/3. Strict compact identity/English-word schema bác cả hai lần, luồng dừng trước ảnh4/enrichment. UI chỉ giữ raw sides/unknown giống evidence founder. [Provider output trước](four-shape-photo-analysis-fix/live-before.json) không có key/image payload. Không khẳng định đó chính là raw response của phiên phone, nhưng cùng input học tập đã tái hiện lỗi thật.

Hai regression fail trước sửa: four-slide scan dừng invalid-result; web search hai nghĩa của sides dùng cùng truy vấn `sides clipart` và cache. Code review tìm thêm: ReviewPictureChoice autoSearch khi chưa có nghĩa dù details chưa mở → web search chỉ word → có thể gắn món ăn; photo background đọc `items` trong khi endpoint trả `results`, nên bỏ mất web results.

## Sửa

- Compact source intake giữ nguyên transcript. Chỉ strip punctuation ở mép literal có evidence; giữ cụm/plural/apostrophe và phục hồi full phrase khi model word là token/phrase con nguyên vẹn. Không fuzzy/lemma/singularize; invented evidence, sides→side/food, invalid mixed numeric label vẫn reject. Numeric counting labels giữ trong transcript, không là English vocabulary target. Prompt yêu cầu DATA JSON với example thật, không schema wrapper. Một content repair và network/quota/size/checkpoint bounds giữ.
- Raw candidate thiếu English definition/sense không auto-search hình. Web/Google truyền nghĩa vào truy vấn, context≤140chars và web cache phân biệt sense. Photo background đọc `results`. Existing prepared art của raw unknown không khớp signature enriched sense nên không tự dùng lại cho nghĩa mới. Không sửa ảnh/nội dung thư viện đã lưu; hình vẫn chờ user review/save. Không khẳng định mọi web result đúng nghĩa.
- Review, scan-all-before-enrich, resume/CAS/dedup và một transaction save giữ.

Live rerun cùng bốn thumbnail sau sửa: **PASS**,9calls=4scan+1meanings+4grammar, đều HTTP200/STOP; complete true, sides noun “các cạnh”, sense “plural of side, geometric boundary line”, thêm Let's count phrase; provider trả5learning items trước merge. [Provider output sau](four-shape-photo-analysis-fix/live-after.json). Không benchmark accuracy/child eligibility; model không chọn triangle làm vocabulary ở probe này dù transcript giữ nguyên câu triangle. Chưa có ảnh gốc/physical-phone/deployed verification. Initial text diagnostic401 dùng fixture canary của Vitest (loadEnvFile không overwrite existing env); sau đó probe đọc configured key trực tiếp, không log/persist key và không retry/rotate provider vì401.

## Verification

Runtime Node24.14.1/pnpm11.25.0. Source commit3853eca8567f83b4c65d55c977705dccc7266f83; final runner fingerprintd15a1e48a02746be9b8a5c3a81bdf77098825f6e6f6b8aaf13515bae38e7ce49 gồm diff game/audio có sẵn. Không overwriting unrelated diff.

- `pnpm test tests/unit/web-image-search.test.ts tests/unit/worksheet-multi.test.ts tests/unit/worksheet-recovery.test.ts tests/unit/byok.test.ts tests/unit/worksheet-review.test.ts tests/integration/worksheet-batch.test.ts`: **90PASS**,0.704s. Giữ quota/cancel/source-limit/invented/evidence/resume/atomic-save coverage. Lượt first scoped sau intake change63PASS/1FAIL: ZodError format thay invalid-result; sửa safeParse mapping rồi80PASS; media additions final90PASS.
- `pnpm lint`, `pnpm typecheck`: **PASS** trên final app source.
- Dev `pnpm test:ui -- search-batch.spec.ts --grep 'four shape|quota during' --port4346`:4PASS, prepare7.8s/browser43.0s; trước media hardening. Không dùng kết quả này để claim final media pass.
- Final `pnpm test:ui -- --mode production search-batch.spec.ts --grep 'four shape|quota during' --port4347`: discovery4cases, **buildPASS33.8s +4UI PASS11.9s**, source identity before/after matches. [Runner result](four-shape-photo-analysis-fix/production-ui-result.json). Raw missing meanings makes no automatic web request; complete queries include sense, reload keeps3exact candidates; save one lesson. UI uses sample fruit image/provider/media mocks, không live OCR/media proof. [Mobile](four-shape-photo-analysis-fix/mobile-review.png), [desktop](four-shape-photo-analysis-fix/desktop-review.png) inspected; no horizontal overflow. Mobile capture includes pending picture-search state; save test waits until enabled and succeeds.
- Impeccable mechanical detector `detect --json` on two changed components:[]; không human UX pass. Layout/theme unchanged.
- `git diff --check`: PASS. `pnpm docs:check`: FAIL do3link temp cũ đã mất trong body-part-photo-analysis-fix.md (9ajoJt/IVyaxC/fzbwuT), không thuộc diff task này; không có lỗi link mới sau tạo evidence. Initial docs check trong lúc evidence chưa viết có thêm2missing links của task, đã hết sau ghi file.

Không push/deploy/thêm Vercel env/control founder browser; không account/cloud/database data change. Local fix +real provider thumbnail probe, hosted/physical device pending. Temporary live probe test removed; no key/image payload stored in repo. Actual tokens unavailable. Risk: provider still can return malformed or truly unreadable content; bounded repair/error/resume remain, review still necessary for meanings/pictures. Next: refresh local và bấm Tiếp tục phân tích trên nháp cũ.
