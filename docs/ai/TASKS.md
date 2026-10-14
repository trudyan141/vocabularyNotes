# Task ledger — current acceptance

Direct user task ưu tiên ready task. Status chỉ done khi có evidence, mock/local/hosted/device phân biệt. WF1 done; WF2 implemented_local/scoped verified, cloud pending_environment (initdb SHMALL); [plan](WORKFLOW-OPTIMIZATION-PLAN.md), [evidence](../evaluations/ai-workflow-optimization.md). WF3 đo các task tiếp theo được giao; WF4 chỉ khi hotspot có evidence. Counts task sản phẩm không đổi vì workflow done.

UX review direct task **UXR01: implemented_local / scoped verified**. [Founder proposal](../DE-XUAT-UX-UI.md), [AI execution guide](UX-UI-IMPLEMENTATION-PLAN.md), [evidence](../evaluations/ux-review-2026-10-12.md).100captures/50states mobile+desktop, source-only/live/device gaps explicit; mute reset reproduced. Founder đã giao cả4đợt + group bulk chỉ mục mới và lọc headword không lặp. [Implementation evidence](../evaluations/ux-ui-implementation.md). Acceptance:46unit/integration+66productionUI/lint/types/build PASS,2live-media skips,74screenshots; follow-up group search highlight2devUI+4unit/lint/types PASS; founder/human/device review pending; product task totals unchanged.

Direct bugfix **14/10 — thêm bài vào nhóm bị conflict: implemented_local / scoped verified**. Giữ refs cũ không khả dụng trong add-only save, bỏ qua mục trùng, lưu additions; CAS/new invalid refs vẫn reject.17unit/integration +4devUI/lint/types PASS; [evidence](../evaluations/group-save-retained-members.md). Chưa deploy/device/account verification.

| ID | Phase | Công việc | Dependencies | Status | Acceptance / evidence còn lại |
|---|---|---|---|---|---|
| T00 | P0 | Provider eligibility/benchmark | None | pending_external | Live quality/cost/account/child eligibility +human GT; ai-benchmark |
| T01 | P0 | Scaffold/runtime/CI | None | done | Node24.14.1/pnpm11.25.0; t01-scaffold |
| T02 | P0 | Theme/shell | T01,T18 | done | t02-ui-shell; human/field UX thuộc release |
| T03 | P1 | Local DB/dedup/search | T01 | done | t03-local-repository; keep data invariants |
| T04 | P1 | Camera/crop/drafts | T02,T03 | pending_external | t04-capture +merged-photo-lesson local; physical phone camera/clipboard pending |
| T05 | P1 | AI BYOK/contracts/checkpoints | T00,T01 | in_progress | ADR082 + [body-photo bugfix](../evaluations/body-part-photo-analysis-fix.md) local; live provider/retention/quality benchmark pending; legacy gateway/shared ledger planned, không thay BYOK |
| T06 | P1 | Review/save/source | T03,T04,T05 | in_progress | Atomic merged save local; human review/live quality pending |
| T07 | P1 | Dictionary/bilingual/IPA/media | T02,T06 | in_progress | [Ba nguồn + Google copy](../evaluations/three-picture-sources.md):74unit/integration+20productionUI/build/lint/types PASS; [Web fallback](../evaluations/web-picture-fallback.md):23unit+integration/12productionUI và nút web8devUI PASS; live web và broad AI/content/media human quality pending |
| T08 | P1 | Grammar/notes/motion | T07 | in_progress | ADR075 grouped guide/IPA local; human/device QA pending |
| T09 | P1 | Flashcard/SRS/results | T03,T07 | in_progress | Local SRS/attempt/CAS; device/human gates pending |
| T10 | P1 | Auth/cloud/schema/RLS | T01,T03 | in_progress | Hosted0007/0008+own fixtures verified; fresh OAuth/storage/deletion complete acceptance pending |
| T11 | P1 | Sync/merge/backup/deletion | T06,T10 | in_progress | Hosted own two-device smoke; accepted-history/conflict/deletion full acceptance pending |
| T12 | P1 | Games/ready art/grammar/speaking | T07,T09 | in_progress | [Saved game pictures](../evaluations/typing-game-saved-images.md): 12media tests/10productionUI/lint/types/build PASS. [Tìm ký tự thiếu](../evaluations/missing-letters-game.md):44scoped tests/6productionUI/lint/types/build PASS; SQL0009 hosted verified. [Full pool + aggregate](../evaluations/game-pools-and-global-words.md) scoped verified; UI chưa deploy, human/device/audio pending |
| T13 | P1 | PWA/offline/cache scopes | T08,T11,T12 | in_progress | Local offline evidence; install/update/physical devices pending |
| T14 | P1 | Cross-cutting QA | T08,T13 | in_progress | Full checks at release; human/field/final performance gates open |
| T15 | P1 | Pilot/operations/release | T14 | in_progress | No push main/new Vercel env/founder browser; pilot readiness pending |
| T16 | P2 | Old local OCR expansion | T15 | planned | Removed by ADR029; historical only, do not reimplement without direct scope |
| T17 | P2 | Expansion/profiles/batch/TTS/FSRS | T15; direct override | in_progress | Profiles/batch delivered scoped; optional expansion needs separate acceptance |
| T18 | P0 | Prototype/UX scenarios | None | done | 16screen prototype; actual child human study pending |

Product totals:4done/2pending_external/10in_progress/3planned (19). Detailed deliverables: [11](../11-delivery-plan.md). Evidence by boundary in [STATE](STATE.md) / [CHANGELOG](CHANGELOG.md). Exact old statuses/counts/commands preserved in [TASKS history](TASKS.history-2026-10-12.md); not current next action.
