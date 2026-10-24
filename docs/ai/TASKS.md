# Task ledger — current acceptance

Direct follow-up24/10 — **game touch slots + picture audio/IPA: implemented_local / scoped verified**. Chạm chữ điền ô trống, chạm ô trả đúng tile; không input mobile. Nhìn hình chọn từ có loa/tự đọc theo mute/IPA đúng target. [Evidence](../evaluations/game-touch-and-picture-audio.md). 9logic+14productionUI/lint/types/build PASS. Chưa deploy/physical phone.

Direct UI follow-up19/10 — **practice scope/progress card: implemented_local / manual preview**. Phạm vi, số câu trong lượt và tiến độ cả bộ/ngày gom chung một card ở trong game và kết quả. Founder yêu cầu không chạy tests/checks/build; mở local4317/practice để xem thủ công, chưa deploy follow-up này.

Direct task19/10 — **game coverage ADR100: implemented/deployed / founder device acceptance pending**. [Plan](GAME-COVERAGE-PLAN.md), [evidence](../evaluations/game-coverage.md). Existing scope selection; successive≤10-question rounds exhaust stable pool, whole-set/day/resume progress; skip/replay/tombstone/backup/offline/account/shared boundaries.101logic+45productionUI/build/lint/types PASS; SQL0013 hosted applied/rollback fixture PASS. Physical PWA/human acceptance pending; Speaking separate5words, no strict multi-device offline claim.

Direct UI follow-up19/10 — **quiet audio pending status: deployed / ready for founder retest**. Removed preparing/starting text under speaker, keeping Stop/error/retry;3native productionUI Chromium/WebKit/lint/types/build PASS. [Evidence](../evaluations/emma-mobile-playback.md). No new test for literal copy.


Direct bugfix19/10 — **game start preparation: fixed/deployed / ready for founder retest**.54logic+39productionUI incl WebKit/lint/types/build PASS; hosted16/16modes with SWcontroller PASS; selection/progress/reload/back/replay/media invalidation retained. New local session avoids server navigation, target-only revalidation, round-only picture decoding. [Evidence](../evaluations/game-start.md); physical iPhone acceptance pending.


Direct bugfix18/10 — **Emma WordDetail on iPhone12/PWA: fixed/deployed / ready for founder retest**. Founder sees preparing then timeout. Root repro on native WebKit: decode-failed primer promise awaited before actual MP3. Scoped fix+gesture-bound cache retry+cleanup;11logic/33productionUI across3browser profiles/lint/types/build PASS. [Evidence](../evaluations/emma-mobile-playback.md). Hosted WebKit native MP3 normal/slow/replay with active SW controller PASS; physical PWA retest remains founder acceptance. Previous Chromium smoke did not prove iOS playback.


Direct task18/10 — **mobile performance + Emma TTS: implemented/deployed / founder device acceptance pending**. [Guide](MOBILE-PERFORMANCE-AND-EMMA-PLAN.md), [final evidence](../evaluations/mobile-performance.md). MP1–5 execution complete;90logic+100unique productionUI scoped PASS/lint/types/build; main nav/search/replay lab targets met. Cold LCP/initial JS still exceed budget; field/iPhone12 installed PWA acceptance remains open. Current shared Nghe priority supersedes older Commons→device→Edge ordering below.

Direct bugfix16/10 — local4317reload: Turbopack restored / scoped verified; exact initiating trigger unconfirmed. Original liveHMR loop68nav/15s; process restart retaining cache yields1document/12s,0restart/errors.4realTurbo desktop/mobile +sourceHMR/typegen probes PASS; previous4devWebpack+4production/build/lint/types/8scoped tests remain recorded. Founder manual pending. [Evidence](../evaluations/dev-reload-loop.md).

Direct task16/10 — LG TV Edge TTS fallback: implemented_local / scoped verified. Commons/device then Emma Multilingual female MP3 when browser speech unavailable/fails/silent.15scoped tests/lint/types/build PASS;14unique productionUI verified across13/14run +isolated1/1timing-test rerun. Actual production endpoint MP3 PASS; physical LG/deploy pending. [Evidence](../evaluations/lg-tv-edge-tts.md).

Direct bugfix15/10 — game điền chữ: implemented_local / scoped verified. Cả2mode tạo2–3ô khuyết khi đủ chữ, giữ cue và snapshot cũ; chấm xong hiện nguyên từ đúng, nhắc sai tô đậm riêng đáp án.35scoped +10productionUI/build/lint/types PASS; no deployment, physical/mobile text-entry tap manual pending. [Evidence](../evaluations/missing-letter-corrections.md).

Direct backup/share follow-up15/10: implemented_local / ready_for_manual_test. Content-only download/add/import preview; source+destination deterministic word/grammar dedup, conflicts preserve own edits, progress independent, file review +CAS/readonly guards.52data+12productionUI/build/lint/types/diff PASS; local4317, no deployment/live copy acceptance. [Evidence](../evaluations/shared-content-copy.md).


Direct task **15/10 — Share A/B implemented / deployed / ready_for_founder_manual_test**. [Flow](../CHIA-SE-THU-VIEN-FLOW-FOUNDER.md), [implementation](LIBRARY-SHARING-IMPLEMENTATION-PLAN.md), [evidence](../evaluations/library-sharing.md). A registered-email inbox; B signed-out QR/manual10char72h; read-only content/shared source progress; own-library separate, content updates automatically. SQL0011/0012 additive hosted, scoped51tests+16productionUI regression+8final UI/build PASS; final hosted A/B flow/progress/update/switch/end/revoke PASS. Physical TV/QR/PWA and real Google/manual acceptance pending; T10/T11 remain in_progress.

Direct follow-up15/10: sửa nhãn/count ôn và chuyển shared status vào Settings quaheader icon; Settings groups để dễ hiểu. No content/progress migration or source deletion.29scoped integration+12productionUI/lint/types/build PASS; deployed online, founder manual pending. [Follow-up evidence](../evaluations/review-count-and-settings.md).

Direct profile follow-up15/10: implemented_local / scoped verified;5purpose groups, editor/storage/sync/data collapsed, cloud-storage error auto-open, shared scope correct.8devUI+lint/types/diff PASS; local4317 verified; manual pending, no deployment. [Evidence](../evaluations/profile-groups.md).

Direct user task ưu tiên ready task. Status chỉ done khi có evidence, mock/local/hosted/device phân biệt. WF1 done; WF2 implemented_local/scoped verified, cloud pending_environment (initdb SHMALL); [plan](WORKFLOW-OPTIMIZATION-PLAN.md), [evidence](../evaluations/ai-workflow-optimization.md). WF3 đo các task tiếp theo được giao; WF4 chỉ khi hotspot có evidence. Counts task sản phẩm không đổi vì workflow done.

Direct bugfix **15/10 — ADR095 Speaking luôn có điểm và giảm chờ: implemented_local / scoped verified; acoustic quality_pending**. Founder yêu cầu sửa SP-SCHEMA tận luồng: v3 schema provider thực, audio không target, client alignment/score; unclear0, system-error tạm0 có lý do. Endpointshortword10s fixed, silence550ms/no-voice2.5s, request6s.55unit+9tool+20productionUI/lint/types/build PASS; final màu0neutral +4productionUI/build PASS. Live synthetic:15engineering total, browser apple100/2.364s stop→score, cap targetcat67 khi không gửi đáp án. [Evidence](../evaluations/speaking-zero-and-latency.md), [manual](../evaluations/speaking-assessment-v2-manual-test.md). B human/child100clip vẫn pending, không claim accuracy hoặc latency mọi thiết bị. ADR094 checkpoint cũ ở [v2 evidence](../evaluations/speaking-assessment-v2.md); T12/T00 tổng trạng thái giữ nguyên.

Direct audio task **14/10 — IPA/hint, nguồn sound mở và nghe chậm: implemented_local / scoped verified**. IPA+gợi nhớ chữ Việt dưới từ ở game/detail, normal1.0/slow0.6, giữ pitch bản thu; exact US Wiktionary→Commons checkedlicense/credit/MP3, source thật+device fallback/cancel; link nguồn mặc định thu gọn theo founder follow-up.20unit+10productionUI/lint/types/build PASS; live snowy metadata PASS; chưa physicalphone/human listening/deploy. [Evidence](../evaluations/speaking-reading-and-open-audio.md).

Direct bugfix **14/10 — giữ filter ôn qua route: implemented_local / scoped verified**. Lưu lựa chọn theo library scope, hub/Speaking restore trước game; URL mới thay selection, Ôn tất cả clear bền và lỗi cho retry.4data+10devUI/lint/types PASS; rộng ngoài ý định1deletion fixture failure, chưa deploy/device. [Evidence](../evaluations/persistent-practice-selection.md).

Direct bugfix **14/10 — bốn ảnh đếm cạnh: implemented_local / scoped verified**. Live thumbnail repro invalid-result do literal/word punctuation+numeric labels; giữ nguồn/checkpoints và contextual picture queries.90tests+4productionUI/lint/types/build PASS; live four-thumbnail rerun PASS, chưa ảnh gốc/phone/deploy. [Evidence](../evaluations/four-shape-photo-analysis-fix.md).

UX review direct task **UXR01: implemented_local / scoped verified**. [Founder proposal](../DE-XUAT-UX-UI.md), [AI execution guide](UX-UI-IMPLEMENTATION-PLAN.md), [evidence](../evaluations/ux-review-2026-10-12.md).100captures/50states mobile+desktop, source-only/live/device gaps explicit; mute reset reproduced. Founder đã giao cả4đợt + group bulk chỉ mục mới và lọc headword không lặp. [Implementation evidence](../evaluations/ux-ui-implementation.md). Acceptance:46unit/integration+66productionUI/lint/types/build PASS,2live-media skips,74screenshots; follow-up group search highlight2devUI+4unit/lint/types PASS; founder/human/device review pending; product task totals unchanged.

Direct bugfix **14/10 — thêm bài vào nhóm bị conflict: implemented_local / scoped verified**. Giữ refs cũ không khả dụng trong add-only save, bỏ qua mục trùng, lưu additions; CAS/new invalid refs vẫn reject.17unit/integration +4devUI/lint/types PASS; [evidence](../evaluations/group-save-retained-members.md). Chưa deploy/device/account verification.

Direct follow-up **14/10 — quản lý lượt dở/tiến độ/Profile: implemented_local / scoped verified**. Xóa lượt với CAS/tombstone giữ learning; Diễn giải giữ câu đã được founder sửa bằng ADR090; lịch sử hoàn thành thu gọn trong Hồ sơ vẫn giữ.42data+1offline syntax+12devUI+4productionUI/lint/types/build PASS. [Evidence](../evaluations/session-controls-and-review-progress.md); chưa deploy/device/live-account verification.

Direct clarification **14/10 — xem lại/retry, bài nhóm, card xóa, history10/trang: implemented_local / scoped verified**. Xem lại tăng progress và chuyển câu, cuối lượt luyện subset; bỏ tùy chọn chơi; owner-correct covers và group-set practice links; duplicate report chỉ additions/nguồn bài legacy giữ; xóa trong card; indexed paging10/page.66data tests+22productionUI/lint/types/build PASS; follow-up nút play trong card2devUI/lint/types/diff PASS; chưa deploy/device/live-account verification. [Evidence](../evaluations/review-retry-group-lessons-and-history.md).

Direct follow-up **14/10 — started resume/Words+Grammar/scoped choices/autoplay: implemented_local / scoped verified**. Chưa làm không hiện đang dở; đã làm resume với game+tên phạm vi. Grammar tiles cùng hàng; lựa chọn ưu tiên bài/nhóm rồi fill thư viện; Words audio tự nghe/replay/mute/cancel.57data+8productionUI/lint/types/build PASS. [Evidence](../evaluations/started-rounds-and-game-sections.md); physical autoplay/voice/live-account/deploy chưa verify.

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
| T12 | P1 | Games/ready art/grammar/speaking | T07,T09 | in_progress | [Saved game pictures](../evaluations/typing-game-saved-images.md): 12media tests/10productionUI/lint/types/build PASS. [Tìm ký tự thiếu](../evaluations/missing-letters-game.md):44scoped tests/6productionUI/lint/types/build PASS; SQL0009 hosted verified. [Scope + replay + grammar cards](../evaluations/game-scope-and-grammar-cards.md): phạm vi/replay/Nghe & hiểu, SQL0010 hosted verified; [Full pool + aggregate](../evaluations/game-pools-and-global-words.md) scoped verified; UI chưa deploy, human/device/audio pending |
| T13 | P1 | PWA/offline/cache scopes | T08,T11,T12 | in_progress | Local offline evidence; install/update/physical devices pending |
| T14 | P1 | Cross-cutting QA | T08,T13 | in_progress | Full checks at release; human/field/final performance gates open |
| T15 | P1 | Pilot/operations/release | T14 | in_progress | No push main/new Vercel env/founder browser; pilot readiness pending |
| T16 | P2 | Old local OCR expansion | T15 | planned | Removed by ADR029; historical only, do not reimplement without direct scope |
| T17 | P2 | Expansion/profiles/batch/TTS/FSRS | T15; direct override | in_progress | Profiles/batch delivered scoped; optional expansion needs separate acceptance |
| T18 | P0 | Prototype/UX scenarios | None | done | 16screen prototype; actual child human study pending |

Product totals:4done/2pending_external/10in_progress/3planned (19). Detailed deliverables: [11](../11-delivery-plan.md). Evidence by boundary in [STATE](STATE.md) / [CHANGELOG](CHANGELOG.md). Exact old statuses/counts/commands preserved in [TASKS history](TASKS.history-2026-10-12.md); not current next action.
