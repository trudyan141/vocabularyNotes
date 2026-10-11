# Grammar guide, filter card và lưu nhóm chống trùng — 12/10/2026

Theo yêu cầu trực tiếp ADR075. Giữ pre-existing changes. Không founder browser/data, không thêm env Vercel/push main, không AI thật trong lượt này.

## Thay đổi

Search/filter cùng card trắng, icon search và icon radio chips Tất cả/Chưa có hình. Toolbar detail Back/trash icon-only tách title, confirmation vẫn có tên/scope và snapshot versions. Xóa unit nhiều source rows chạy atomic, không dùng versions mới sau khi mở confirmation.

Grammar detail lại có GrammarSteps; role-color chips dùng câu tiếng Anh thật, finite timer3200ms/step, Play/Pause/Replay/manual steps, reduced-motion static/no animation. Dữ liệu supplied câu/IPA/VI/conditions/analysis dùng đúng từng form; mistake/correction có blocks màu và nhãn. Generic grammar cũng có formula→example guide, không chỉ Is it/What is it. Không model HTML/JS. Điểm score không liên quan; IPA unverified vẫn Tham khảo theo ADR047.

Legacy Is it…?/Yes,it is/No,it isn’t group1unit ở read projection, không đổi/xóa user rows. Detail giữ every example/analysis/evidence, legacy deep links vẫn tìm được unit qua related IDs. Sentence tab không tự gộp câu. New worksheet prompt/normalizer: one construction, primary question, grammarFamily + bounded grammarVariants; preserve per-form IPA/evidence, no silent truncation. Optional fields persist archive/cloud; no SQL migration. Xếp câu expands unit forms as separate questions and keeps parent/version/scope approval.

Group save computes actual new additions and duplicate labels. Select100fixture:70existing skipped/listed,30new retained. Repeat100:0added,100duplicate labels, sameversion/no write. Exact word+POS+sense/ref identity, no near-meaning merge; unavailable/conflict still atomic reject. Rename/removal are updates. Green success count vs neutral unchanged/info; prior message clears when selection/name changes. No generic saved-success for a no-op.

## Bằng chứng gọn

- `pnpm lint`, `pnpm typecheck`, final `pnpm build`:PASS. Initial build caught optional grammarVariants length typing; repaired optional guard and final build PASS.
- `pnpm exec vitest run tests/integration/grammar-family.test.ts tests/integration/grammar-practice.test.ts tests/integration/groups.test.ts tests/integration/deletion.test.ts tests/integration/learning.test.ts tests/unit/worksheet-review.test.ts`:43PASS. Includes100mixed/repeat/no-op version, lossless3rows→1unit, reversed model form order→primaryquestion+2variants, backup fields, practice3forms, approval/CAS/delete scope.
- `pnpm exec playwright test --config=playwright.compact.config.ts tests/e2e/grammar-polish.spec.ts tests/e2e/review-grammar.spec.ts`:10PASS desktop1280/mobile360. Final grammar-polish rerun4PASS after actual-word token rendering: filter card, no wrap/overflow, icon delete, automatic step advances to negative answer, pause/reduced-motion animation-name none, mixed duplicates and stale success cleared.
- Initial new UI test matched a hidden SSR/Suspense copy before hydration and read an assumed entry ID; fixed visible selector/seed-readiness and sense.entryId lookup (app unchanged for that test failure). Initial deletion fixture assumed a removed grammar title meant zero items, but remaining pattern belongs in grammar under3tabs; updated that assertion only. Dated-set deletion still expects0 and passes.
- Impeccable detect[] once scoped; git diff --check PASS. Batched desktop/mobile visual inspection preserved ThemeC. One refinement changed formula jargon chips to actual sentence words in animation. Final confirm no additional polish loop.
- [Mobile grammar](grammar-polish-2026-10-12/mobile-grammar-guide.png), [desktop search](grammar-polish-2026-10-12/desktop-search-card.png), [mobile duplicates](grammar-polish-2026-10-12/mobile-duplicates.png). Other device captures in same folder. Human child acceptance/live Gemini generation not claimed.

## Production/cloud

CLI deployment and `scripts/verify-hosted-grammar-family.mjs` final results appended below. The hosted test creates only one disposable account with two headless contexts: authenticated own fixture row sent through cloud sync to verify optional family/variants round-trip and one-unit/three-form rendering; duplicate group selection reports unchanged. Cleanup finally deletes exactly that test user. No founder account data inspected/modified, no SQL needed.


Final deployment READY/aliased: https://words-for-kids.vercel.app; immutable https://words-for-kids-hhg6tiqfn-trudyan141s-projects.vercel.app; inspect https://vercel.com/trudyan141s-projects/words-for-kids/Fio1XRbFmCJLDueSgWeGxtUVMKyb. Final Vercel build PASS.

`node scripts/verify-hosted-grammar-family.mjs`:PASS hosted family/variants round-trip (one unit, three preserved forms); PASS hosted duplicate grammar selection reports unchanged; PASS disposable-account cleanup. JSON optional fields accepted by actual authenticated sync and rendered on second context, no SQL/env changes. This uses synthetic/manual fixture content, not real Gemini output. Docs check636links and diff check PASS.
