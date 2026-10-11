# Bắt đầu / khôi phục / chuyển AI

**Latest11/10 — ADR062 Speaking app + library fixes (70 unit/integration PASS,9 scoped browser cases PASS/1 desktop-only mobile skip; lint/types/build/docs PASS):** user explicitly permits browser diagnosis/tests and asks implementation. Real desktop profile read-only shows13device words/1set,0cloud words/0sets; no transfer performed. Local code clarifies cloud/local, account default on fresh signed-in device and sync on focus; photo repeat default selection/POS alias/exact dedup; existing group primary Add control. `/speaking` now exposes record/replay, explicit model download/cache/clear, actual Worker recognition, tentative word evidence/colors and optional mocked-tested Gemini coaching. No numerical score/calibration/child/physical-device/live AI/release claims. [Evidence](../evaluations/speaking-app-and-library-fixes.md). Publish remains founder-owned; authorized browser reads do not grant real lesson transfer/deploy.

**Latest11/10 ADR060/061:** sentence IPA + exact-example listening completed locally across shared UI and offline; generation supports full mistake/correction IPA; scoped data round-trip/deletion and origin boundaries checked. [Evidence](../evaluations/sentence-ipa-and-listening.md). Founder confirms Gemini key/project Free Tier/no billing and prefers AI Vietnamese coaching: updated founder17/spec15 with optional target+local-evidence advice, fixed fallback, no audio upload/paid fallback; no live call; this checkpoint is superseded by ADR062 app implementation above. Cache/delete FAQ clarifies355MB+22MB versus old318MB; scoring calibration gates remain open.

11/10 — ADR056/057 local: nhóm thêm grammar, chọn tất cả ba loại qua mọi trang lọc, source-dated/name items và exact dedup toàn nhóm; backup/cloud remap giữ metadata và nhiều supplemental rows/sense. TTS first tap chờ voice readiness/cancel, offline local voice only.46 related unit/integration PASS,6 voice helper final confirmation PASS;10 distinct scoped browser cases PASS (results/evidence below), lint/types/final build PASS. [Evidence](../evaluations/groups-grammar-and-audio.md). Speaking checkpoint này là lịch sử planning; trạng thái SP1 mới nhất ở dưới. Không production/SQL/realAI/physical-phone claims.

**Checkpoint lịch sử — SP1 trước ADR062 (ADR058/059):** founder “tiếp tục” sau plan0đ. Đã pin Transformers.js3.8.1, manifest English Wav2Vec2 q8/revision/SHA355MB, CTC decoder và CLI browser/Worker inference thật. Public fixtures cat/book/cup đúng phone sequence, apple cần variant handling; TTS vẫn có lỗi.11 unit cases, scoped lint/typecheck và final build PASS. [Evidence](../evaluations/speaking-local-feasibility.md), [founder plan17](../KE-HOACH-FOUNDER.md#speaking-review), [AI spec15](../15-speaking-practice.md). Không API/paid fallback/mic/score/child colors/game/real account/deploy; model/runtime không vào app bundle/SW.

**Next action:** local app Speaking flow implemented; validate physical-mobile RAM and scoring calibration before numerical scoring/release. Không chờ founder review lại code local; quality/calibration/phone/child evidence vẫn pending, không bật score/red certainty bằng raw phone match. Founder owns publishing ADR049; ledger tổng chưa đổi.


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
| Speaking SP0–SP4 | 15, 08, founder17, speaking-local-feasibility; current ADR058/059 | vocabulary-delivery, bilingual-learning-content, React; impeccable when UI changes |
| Handoff dài | STATE, TASKS, HANDOFF-TEMPLATE | filesystem-context, context-compression |

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
