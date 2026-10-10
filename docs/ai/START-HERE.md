# Bắt đầu / khôi phục / chuyển AI

Latest11/10 steering ADR042: simplify parent config,12-word paging without500-member deck cap, illustrated child games/fox/finite motion and original muted/gesture-only sound. Full UI mobile/desktop audit and human/phone acceptance separated in03/04 and [evidence](../evaluations/child-play-and-parent-simplicity.md).

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
3. Chọn một task ready; đọc tài liệu theo routing. Đọc skill liên quan, không nạp cả 17 skill và toàn bộ references cùng lúc.
4. Thực hiện và kiểm acceptance. Cập nhật task/state/changelog bằng evidence trước khi kết thúc lượt.

## Routing theo task

| Task | Tài liệu cần đọc | Skill chính |
|---|---|---|
| T00, T05 | 07, 09, 10, 14, contracts, fixtures | worksheet-extraction, node async/caching rules; current official API docs |
| T01 | 05, 09, 11 | vocabulary-delivery |
| T18 | Founder mục 2–8, 03, 04, 13, design/ui-mockup-plan.json, design/inspo-research | product-design, ui-ux-pro-max, frontend-design, impeccable; imagegen cho concept raster; Inspo khi cần reference |
| T02 | 00, 03, 04, 13, prototype T18 | frontend-design, product-design, impeccable, ui-animation, accessibility; shadcn nếu môi trường có |
| T03 | 05, 06, 10 | vocabulary-delivery; react best practices khi UI query |
| T04, T06 | 02, 03, 06, 07 | worksheet-extraction, frontend-design |
| T07, T08 | 03, 04, 07, 08, 13, 14, enrichment contract | bilingual-learning-content, motion-design, ui-animation; node cho media I/O/cache |
| T09, T12 | 03, 08, 10 | bilingual-learning-content; react best practices |
| T10, T11 | 02, 05, 06, 09, 10 | supabase-postgres-best-practices |
| T13, T14, T15 | 05, 09, 10, 11, 13 | performance, core-web-vitals, accessibility; vocabulary-delivery + relevant DB skill |
| Handoff dài | STATE, TASKS, HANDOFF-TEMPLATE | filesystem-context, context-compression |

Các số 00–14 là file `docs/NN-*.md`, tra tên trong `docs/README.md`. T16/T17 dùng docs mở rộng và ADR riêng trước khi triển khai. Founder đọc KE-HOACH-FOUNDER; AI cập nhật mục tình hình khi có chặng/quyết định thay đổi, ledger vẫn ở docs/ai.

## Prompt copy cho Codex hoặc Antigravity

```text
Tiếp tục dự án Words for Kids trong repo này.
Đọc AGENTS.md và docs/ai/START-HERE.md, STATE.md, TASKS.md.
Thực hiện task ready tiếp theo, dùng skill phù hợp trong .agents/skills/.
Giữ tên Words for Kids, trẻ 5–8/parent-first flow, web/PWA và R01–R21/R24–R25; adult expansion ở sau. Theme C tạm chốt, không hỏi lại approval cũ.
Hoàn tất cả behavior, lỗi/fallback và acceptance của task; không gọi mock là tính năng thật.
Cập nhật TASKS/STATE/CHANGELOG, ghi lệnh kiểm tra và một next action rõ ràng.
```

## Dùng skill giữa các môi trường

Skill bundles nằm ở `.agents/skills/<folder>/SKILL.md`. Nguồn/version/checksums tại `docs/skills/skills-lock.json`; thư mục `react-best-practices` có invocation name **vercel-react-best-practices**.

Codex và tài liệu Antigravity hiện tại hỗ trợ workspace skill ở `.agents/skills`; xem [nguồn Codex](https://learn.chatgpt.com/docs/build-skills) và [nguồn Antigravity](https://antigravity.google/docs/skills). Skill mới có thể cần lượt/chat mới để hiện trong catalog. Nếu bản IDE cũ chỉ nhận `.agent/skills`, dùng đường dẫn SKILL trực tiếp hoặc cấu hình/copy có chủ đích theo docs bản đang chạy; không tự tạo hai bản nguồn cần duy trì.

Nếu host không tự đọc AGENTS, dùng prompt trên với đường dẫn file. Không tuyên bố cơ chế discovery đã được thử trong Antigravity ở lượt planning này; phần đó được xác minh từ tài liệu, chưa từ app người dùng.

## Khi bị mất context

Không reconstruct từ trí nhớ. Đọc state/task, diff và artifacts được trỏ; bảo toàn constraints người dùng, chosen task, file đang sửa và test failing. STATE phải có một next action. Nếu task đã done, kiểm evidence rồi tiếp task kế tiếp; không scaffold lại repo hoặc chạy lại benchmark trả phí không cần thiết.
