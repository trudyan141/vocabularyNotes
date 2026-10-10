# Ledger triển khai

Status: `ready`, `planned`, `in_progress`, `pending_external`, `done`. Chỉ chuyển done khi có evidence trong CHANGELOG/artifact. Không đánh dấu task app done vì đã viết docs cho task đó.

| ID | Phase | Công việc | Dependencies | Status | Acceptance / evidence |
|---|---|---|---|---|---|
| T00 | P0 | Kiểm child eligibility + benchmark/chọn AI provider/model | None | pending_external | 20 synthetic PNG/40 mode references, scorer15 tests PASS; evaluations/ai-benchmark.md; human GT/account eligibility/live benchmark/model selection pending |
| T01 | P0 | Scaffold, versions, scripts, env, CI | None | done | Scaffold evidence lịch sử; setup viết lại, Vercel nativeGit project/env đã config theo ADR029; remoteCI SUCCESS/nativeGitVercelREADY7b1e997 trong parent-dictionary-byok-deploy |
| T02 | P0 | Design system, shell, high-fidelity 3 màn | T01,T18 | done | S03/S07/S09 + primitives/preferences UI/demo; check/22 unit/27 browser + baseline15 cold/50 input; evaluations/t02-ui-shell.md/ux-performance.md; device/human/field pending |
| T03 | P1 | Local DB/migrations/dedup/search | T01 | done | QA01/02/09/10 + rollback/scopes; 49 unit-integration/42 browser; 5.000 search p95≈166 ms/CPU4×; evaluations/t03-local-repository.md |
| T04 | P1 | Camera/upload/crop/drafts | T02,T03 | pending_external | ADR031 capture drag-drop/inline-key/source-photo comparison checked104/117; evidence capture-review-ui; S04/S05 implemented; check57 + browser58 PASS, EXIF/crop/quota/reload; evaluations/t04-capture.md; còn QA07 smoke iPhone/Android thật |
| T05 | P1 | AI BYOK trực tiếp + gateway/contracts/quota/idempotency | T00,T01 | in_progress | ADR033 concrete/redacted errors/compatible JSON/metadata check113+full123PASS/liveGETaccepted,2imagePOST400; minimaltext actualPASS/check114/full125PASS; JSON mode fix check114/full125PASS/live samephoto13words accepted; parent review retained + ADR032 SSE/progress/elapsed/partial unsaved check109/full119PASS + ADR030 parentGemini/session/localStorage opt-in/direct generateContent/schema/evidence/consent/cancel/errors/review đã kiểm fixture/CORS thật; inference/retention/benchmark pending; servergateway/sharedledger planned |
| T06 | P1 | Review/save/source links | T03,T04,T05 | in_progress | Manual/AI candidate review/source/origin/save/reload kiểm local; one livephoto13words/SSE/review PASS ADR033, benchmark/human review pending; capture-review-ui |
| T07 | P1 | Real autocomplete/bilingual lookup/autofill + IPA/examples/licensed illustrations/enrichment | T02,T06 | in_progress | Datamuse spelling/Wiktionary senses/IPA/Tatoeba examples livehandsome smoke; auto-fill/sense/image174 OpenMoji/review/save/source checked; liveAI/hostedCommons/human content pending |
| T08 | P1 | Notes + 3 animation templates | T07 | in_progress | Notes3 templates persistence/play/pause/static local; human/device QA11/12 pending |
| T09 | P1 | Decks/flashcard/SRS/results | T03,T07 | in_progress | Decks/directions/due/weak/SRS/flashcards/results/resume local; device QA13 pending |
| T10 | P1 | Google/cloud schema/RLS/storage | T01,T03 | in_progress | Code PKCE/server cookie/account scope; local fake identity→SDK/API→real SQL PASS, migrations0001–0006, source upload/read/delete và deletion lifecycle có testsSQL/HTTP; Google/Supabase live pending |
| T11 | P1 | Sync/merge/conflicts/backup/deletion | T06,T10 | in_progress | Local backup/restore; sync/CAS/retry/conflict/guest transfer và server SRS đã kiểm local; source photo consent/idempotent retry/delete, account deletion/freeze/storage cleanup, notes keep-both/per-field meanings đã kiểm local; hosted cleanup và accepted-history merge ngoài whitelist chưa nghiệm thu |
| T12 | P1 | 4 games/assets/grading/hints | T07,T09 | in_progress | 4 games approved words/ready catalog/grading/hints/feedback/resume local; human/device/media external pending |
| T13 | P1 | PWA/offline/scope-safe cache | T08,T11,T12 | in_progress | Offline library/card/4games/resume/SRS/basicparententry and OpenMoji staticpath/cache checked; device install/update/fullparentediting pending; localOCR removed ADR029 |
| T14 | P1 | Cross-cutting QA + quality gate | T08,T13 | in_progress | Gemini check104unit/Gemini E2E113/113 PASS/SQL PASS; evidence parent-dictionary-byok-deploy; human/device/liveAI/cloud/field/performance currentbuild pending |
| T15 | P1 | Pilot, operations, release | T14 | in_progress | Founder authorized Vercel nativeGit deploy/current setup; readiness recorded in evidence; QA25human/physicalphone/pilot gates remain pending |
| T16 | P2 | Local OCR workflow — removed by founder ADR029 | T15 | planned | Tesseract/deviceOCR removed, old ADR026 evidence historical; do not reimplement unless founder explicitly requests scope again |
| T17 | P2 | Chọn expansion: profiles/batch/TTS/FSRS | T15 | planned | ADR + subtasks/acceptance trước triển khai |
| T18 | P0 | Prototype 5 màn, simple UX + kịch bản thử | None | done | Đủ 16 graph/mockup, 9 refinements; core + flow support clickable; browser 360/1440, SELF-REVIEW/screenshots/QA25-HUMAN-STUDY; human QA25 pending, app/camera/cloud/live AI chưa có |

Mô tả chi tiết và deliverables tại `../11-delivery-plan.md`. Nếu thiếu credential ở T00/T05/T10, trạng thái live phần đó `pending_external`; vẫn hoàn tất những việc độc lập. Evidence phải ghi rõ phần nào mock, phần nào real.

Sau T02 ngày 09/10/2026: **3 done (T01/T02/T18), 2 ready (T00/T03), 14 planned**; P0 3/4 done, P1 0/13 done (T03 ready), P2 0/2. Rà soát trước T01 từng ghi 1/19 done; milestone T01/T02 có evidence riêng ở evaluations/t01-scaffold.md/t02-ui-shell.md/ux-performance.md và CHANGELOG. Báo cáo founder đã cập nhật; không tick features P1 vì nền app có build.

## Sau triển khai local T04 — 09/10/2026

**4 done (T01/T02/T03/T18), 2 ready (T00/T10), 1 pending_external (T04), 12 planned.** T04 đã xong phần UI/storage/error trên máy, 57 unit-integration và 58 browser tests PASS; không tăng số done trước smoke điện thoại thật theo acceptance 11. QA07 native Chromium dùng file thật và camera acquisition giả lập bằng canvas stream; không gọi đó là camera thiết bị thật. Evidence [T04](../evaluations/t04-capture.md).

Bước tiếp theo khi bàn giao T04 từng là **T00**; phần chuẩn bị đã hoàn tất ở milestone dưới. T04 chỉ cần QA07 phone evidence để chuyển done; không mở lại phần đã kiểm. T06 còn T05/T04 chưa đạt, T07 IPA/reading hints/manual lookup/autocomplete vẫn planned.

## Sau chuẩn bị T00 — 09/10/2026

**4 done / 1 ready (T10) / 2 pending_external (T00/T04) / 12 planned.** T00 có20 synthetic PNG/ground truth40 modes, manifest/prompt/schema hashes, offline scorer và15 tests PASS; contact sheet đã xem. [Evidence T00](../evaluations/ai-benchmark.md). Self-test records không là OCR; real handwriting/human ground truth/provider account/retention/credential/live quality-cost/model decision chưa đạt. T05 chưa ready vì T00 chưa done.

Next **T10 phần schema/RLS/storage độc lập** theo05/06/09, đọc DB skill trước mọi SQL; Google/staging test khi có cấu hình được phép dùng. Không gọi cloud mock thành RLS pass. T04 chỉ còn smoke điện thoại; T07 IPA/cách đọc Việt và nhập tay/autocomplete vẫn planned.

## Coverage checklist P1

Sau T03 ngày 09/10/2026: **4 done (T01/T02/T03/T18), 3 ready (T00/T04/T10), 12 planned**; P0 3/4, P1 1/13, P2 0/2. R04 local đã kiểm; các nhóm có cloud/T07/game còn không tick toàn bộ. Next T04 camera/crop; T00/T10 có phần làm độc lập, integration credential vẫn pending.

- [ ] R01–R03: ảnh → nhận dạng → duyệt/lưu thật.
- [ ] R04–R06: guest/cloud, ownership và không trùng.
- [ ] R07–R10: nghĩa/ví dụ/câu/grammar/notes animations.
- [ ] R11–R16: search/flashcard/4 games/audio/lịch sử nguồn.
- [ ] R17–R21: merge/backup/PWA/preferences/quota/progress.
- [ ] R24–R25: provider/key đủ điều kiện trẻ em, nguồn hình có license/duyệt và bounded concurrency.
- [ ] N01–N09: rõ/mượt/accessible, lossless, an toàn theo scope, simple UX có human evidence và performance đo được.

Các ô trống là đúng ở giai đoạn hiện tại. Người tiếp theo không tự tick dựa vào tài liệu mô tả.

## Checkpoint local10/10/2026

**4done/2pending_external/10in_progress/3planned** (T16 kéo lên fallback). T06–T14 chưa full nghiệm thu external; chỉ local scope đã nối/kiểm. [Evidence local](../evaluations/local-end-to-end.md). Ưu tiên tiếp theo AI eligible/live T00→T05, auth+sync T10/T11 và phone/human/currentperformance QA; không tự deploy/gọi paid. Các tổng9/10 ởmilestones trước là lịch sử.

## Milestone code độc lập và setup — 10/10/2026

Source lifecycle, account deletion, merge UI, optional Commons adapter, đủ hai ví dụ catalog/contract1.1, S10 và prepared offline OCR/basic edits đã nối. Cấu hình Vercel/Supabase/CI và setup đầy đủ; [completion-local](../evaluations/completion-local.md) ghi checks/budgets thực tế. Giữ count vì live/device/human gates chưa đạt; T05 phụ thuộc T00, T15 pilot và T17 expansion chưa tự triển khai/deploy.

## Founder fixes10/10/2026 — ADR-030

4done/2pending_external/10in_progress/3planned giữ tổng: T05 directBYOK in_progress, T15 nativeGitdeploy in_progress, T16localOCRretired planned. [Evidence](../evaluations/parent-dictionary-byok-deploy.md). Các mốc trước có OCR/prohibition localStorage/no-deploy là lịch sử đã supersede. Không dùng testsfixture thay liveAIbenchmark; người dùng đã cho phép localStoragekey và deploy, không hỏi lại approval cũ.

## Capture/review UI steering — 10/10/2026

ADR031 hoàn tất local104/117: drag-drop một ảnh, picker tiếng Việt/bàn phím, camera riêng, inline Gemini key, blocked action reasons và ảnh nguồn sticky/zoom đối chiếu. [Evidence](../evaluations/capture-review-ui.md). Không tăng count done vì phone/liveAI/human gates vẫn pending; code c74a2e2 nativeGit production READY và CI38028605020 SUCCESS, hosted UI/sourceimage verified.

## Founder pictures / grammar / daily sets — 10/10/2026

ADR034/035 scope implemented under T07/T08/T09/T12/T14: automatic open-source illustration lookup/download + parent review, compact card credits, complete question patterns, parent fill of existing missing art, lesson/day manager and daily manual group/practice filter. pnpm check121/14PASS; full133/133browserPASS; deployment pending. [Evidence](../evaluations/library-media-and-date-sets.md). Ledger count unchanged; external/device/human gates remain pending.

10/10/2026 ADR036: every future photo submit integrates exact dedup, automatically downloaded/reviewed missing art and original source-pattern excerpts + Vietnamese grammar/3-step reduced-motion teaching. Imported colon-ID detail/edit/notes route fixed after real founder reproduction. Old13-word set completed via hosted parent UI once (6art/2patterns); future imports need no source changes. check125/15/lint/types/build PASS; full137/137browser and full216links docs PASS; deploy evidence to follow in [library evidence](../evaluations/library-media-and-date-sets.md). Ledger unchanged; external/device/human gates open.

ADR036 source0c22f0f productionREADY dpl_27FsfRqhma2o2kjekgFnA7F8z9bD, stable words-for-kids.vercel.app. Hosted actual teacher now opens with image/meaning/example; existing13-word set Patterns/Grammar each2approved items,3-step Vietnamese teaching verified. Full local check125/137browser/docs216PASS; remoteCI38043514632 SUCCESS (all check/SQL/browser/docs steps). External/device/human gates unchanged.

Checkpoint ADR037/038: T09/T14/T18 direct due entry/resume/offline, visible request progress/errors and public SEO/favicon/share assets implemented; check128 PASS, full147/147 browser/docs223links PASS; source78c791c production READY and CI38045533305 SUCCESS, actual due3 session and hosted public metadata/assets verified. No ledger status changes before acceptance. [Evidence](../evaluations/today-feedback-and-seo.md).


10/10/2026 T09/T14 rename discoverability (ADR035 refinement): saved imported/manual sets can be renamed from Today and edited inline in the date manager; shared scoped/versioned editor, Save/Cancel, loading/errors/success. No membership/SRS/schema change. Check128/lint/types/build and full147/147 browser PASS; docs223links PASS. Source9c81821 production READY, hosted rename forms verified with original13 words retained; remoteCI38048148513 full result pending. Evidence library-media-and-date-sets.
