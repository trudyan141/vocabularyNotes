# Ôn bài, từ điển, hình và Xếp câu — 12/10/2026

Theo yêu cầu founder ADR074. Không push main, thêm env Vercel, hoặc dùng browser thật/tài khoản founder. Giữ pre-existing work. Deployed bằng CLI theo ADR071.

## Kết quả

- Today chia Ôn bài (đến hạn trên toàn thư viện, chọn nhóm ở trang riêng) / Thêm từ (gõ, ảnh). Selected group mở đúng flashcard; grammar-only group mở Xếp câu.
- Xếp câu từ approved stored grammar/pattern example; không AI khi chơi. Chạm/keyboard token, tháo token/xếp lại/gợi ý/listen, feedback đúng English/IPA/VI/formula; pause/resume, deterministic tile layout, question/version CAS, attempt idempotent. Grammar khác games từ nhưng cùng practiceSessions/gameAttempts và cloud/backup, không tạo SRS rating. SQL0008 mở check mode grammar và giữ mode cũ.
- Recent sessions cards có hình/mode/date/result, grammar tile full-row. Disabled chosen tokens vẫn đọc rõ. ThemeC giữ.
- Dictionary: bilingual translation thiếu không đồng nghĩa thiếu English entry. Thêm English definitions/POS parse trước nguồn dự phòng;404 trả empty match, failure thật vẫn503 nhưng không chặn browser Gemini fallback. Gemini result thêmPOS/sense và2examples/VI/whole IPA nullable. Probe thật `http://127.0.0.1:4317/api/dictionary?word=intense`:200/adjective/5senses; intensely:200/adverb/2senses. Không gọi Gemini thật trong tests lượt này.
- Media: Commons cũ trả historical cartoons có license nhưng sai ngữ cảnh. Search ưu tiên recognizable OpenMoji fixed source, filter Commons subject/illustration và loại political/engraving. BROTHER search200→boy illustration, import200/JPEG1588bytes/receipt true trên4317. SVG chỉ chấp nhận từ trusted OpenMoji ID metadata, uploadedSVG/unknowntype bị chặn.
- Dùng ảnh khác cho phép tìm Google theo click của user và chọn ảnh mua/được phép từ máy, optional sourceURL. User supplied metadata không giảCC/ownership/license verified. Bytes normalizedJPEG512/500KB/EXIF strip, request4MB/12MP, same-origin/quota/receipt/owner/version; cloud provider/source/license và backup giữ. Chỉ ghi nguồn không cấp quyền sử dụng: [U.S. Copyright Office](https://www.copyright.gov/help/faq/faq-fairuse.html).
- Additional actual bug: picture-save changes sense revision; EditorForm giữ revision cũ và complete approval làm asset stale. Own picture callback cập nhật art/revision không mask external edits; explicit complete-word approval rebinds same owned ready asset atomically. Revoked/cross-sense asset không được revive.

## Kiểm tra gọn

- `pnpm lint`, `pnpm typecheck`, production build PASS. One final Vercel build also PASS after a small empty-result status guard.
- `pnpm exec vitest run tests/unit/dictionary.test.ts tests/unit/word-examples.test.ts tests/integration/grammar-practice.test.ts tests/integration/media.test.ts tests/integration/learning.test.ts tests/integration/cloud-sync.test.ts`:50PASS. Final media approval regression + changed-data rerun `media/grammar-practice/learning`:31PASS (includes new test). Không chạy full suite.
- `pnpm exec playwright test --config=playwright.compact.config.ts tests/e2e/review-grammar.spec.ts tests/e2e/simple-lessons.spec.ts`:10PASS mobile360/desktop1280. Final `review-grammar.spec.ts`:6PASS incl forced dictionary503→Gemini fixture/adverb/second example, uploaded source→approve→ready photo, group review, grammarpause/resume/check/result. Every HTTPS blocked except explicit fixture, key disabled/fake; no actual AI or founder browser.
- SQL fixture PGlite0.5.8 in existing temporary runtime: `TASK_PGLITE_MODULE=… node scripts/test-grammar-sql.mjs`:PASS old rows retained, grammar accepted, unknown mode rejected. `node scripts/apply-grammar-practice.mjs`:PASS hosted0008 constraint verified. Only additive check constraint, no ownership/RLS/lesson changes. Local Management token not uploaded/env Vercel unchanged.
- Impeccable scoped detect[]; diff check PASS. Initial visual mobile/desktop inspection found orphan seventh tile/faded chosen text; one batch fix (full-row grammar/opaque chosen buttons/full-row only history item). Final visual confirm mobile recent/full-row tile + desktop grammar feedback PASS. Screenshots in [review-grammar-2026-10-12](review-grammar-2026-10-12/mobile-grammar-feedback.png). These are synthetic fixtures, not human child acceptance.

## Production

Deployment READY/aliased https://words-for-kids.vercel.app, immutable https://words-for-kids-r6lb0kqcj-trudyan141s-projects.vercel.app; inspect https://vercel.com/trudyan141s-projects/words-for-kids/Ae3mZVFxuUajsSXerg1ugXCqCNg5.

`node scripts/verify-hosted-grammar.mjs` runs only own disposable account with two fresh headless contexts, real image upload/signature/cloud/source + grammar content/session/result sync. PASS hosted user-upload image and source sync; PASS hosted grammar content/completed session/result sync; PASS disposable-account cleanup. First script run used obsolete `.word-row` locator (not an app failure), account cleaned; corrected semantic nut locator then rerun PASS. Hosted dictionary intense200/adjective and intensely200/adverb. Account deletion in finally, no founder data touched. Google OAuth redirect/hardwareiPhone/pedagogical benchmark not covered; no claim that every search result is semantically verified or that paid-provider rights were purchased.

Final docs check628links PASS; git diff --check PASS. No paid API calls, no added env, no git push or founder browser. Initial and final test results are reported separately above; final media regression makes51 unique unit/integration cases across focused runs.
