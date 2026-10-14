# Bắt đầu / khôi phục Words for Kids

Đọc AGENTS → STATE → đúng task trong TASKS; yêu cầu trực tiếp mới nhất ưu tiên. Không đọc các file `.history-*`, CHANGELOG/DECISIONS hoặc founder plan toàn bộ khi không cần.

1. `git status --short`; bảo toàn diff đang có. Đọc STATE current, một next action.
2. Chốt acceptance/risk vài dòng; tìm route/symbol bằng `rg`, đọc vùng liên quan. Đọc domain skill khi trigger áp dụng, references đúng vấn đề.
3. Bug: repro/evidence đúng source, một hypothesis/probe; phân code/fixture/environment/stale/external, không shotgun fix. Feature: hoàn tất scope/UI/data/error.
4. Lint/types và behavior tests theo ADR050; UI vài main/error mobile/desktop. `pnpm test:ui -- --list` trước chạy; 0test là sai scope. Build cuối chỉ khi cần production/config/route/dependency/PWA.
5. Bàn giao evidence thật; STATE current, TASKS status/link, CHANGELOG lịch sử. Product/architecture decision mới cập nhật spec+DECISIONS. Không copy bản bàn giao dài vào cả ba file.

## Đọc theo boundary

| Việc | Nguồn cần tìm | Skill |
|---|---|---|
| UI/navigation/forms/mobile | 03/04, 13; PROJECT-RULES phần ADR075–082 liên quan | ui-ux-pro-max + impeccable; React khi sửa component |
| Capture/AI/review/IPA | 06/07, contracts; PROJECT-RULES IPA/ADR082; merged-photo evidence | worksheet-extraction + bilingual-learning-content |
| Local save/dedup/backup/groups | 05/06/09; transaction/CAS tests liên quan | vocabulary-delivery; React khi query UI |
| Auth/cloud/SQL | 05/06/09/10; migrations/evidence liên quan | supabase-postgres-best-practices trước sửa SQL/schema/RLS |
| Share A/B | ADR096, [flow founder](../CHIA-SE-THU-VIEN-FLOW-FOUNDER.md), [implementation draft](LIBRARY-SHARING-IMPLEMENTATION-PLAN.md); đã giao triển khai, xem evidence | vocabulary-delivery; Supabase cho schema/auth; UI skills khi triển khai |
| Speaking | [spec15](../15-speaking-practice.md); **ADR095** (current0score/contract/latency), ADR094 + [hướng dẫn nâng cấp](SPEAKING-ASSESSMENT-IMPLEMENTATION.md), plan đã duyệt; ADR066 giữ audio/model baseline, không ADR058 local engine | bilingual-learning-content; React; motion khi đổi animation |
| Media/game pictures | 08/14; ADR081 và free-picture-sources-and-games | node cho bounded I/O; UI skills khi cần |
| Bug/test failure | Spec/evidence đúng lỗi + WORKFLOW-SKILL-REVIEW | systematic-debugging; domain skill đúng boundary |
| Handoff/context dài | HANDOFF-TEMPLATE; STATE current | filesystem-context/context-compression |
| Release/performance | 10/13, release task acceptance | performance/CWV/accessibility đúng gate |

File 00–15 tra [docs index](../README.md). Product detail: [PROJECT-RULES](PROJECT-RULES.md). Skill source/pins/project overrides: [catalog](../skills/CATALOG.md). Lệnh scoped và source isolation: [workflow](WORKFLOW.md). Founder đọc [kế hoạch](../KE-HOACH-FOUNDER.md), cập nhật khi milestone đổi.

## Khôi phục

Không reconstruct từ trí nhớ hoặc rerun toàn suite. STATE + diff + đúng artifact đủ để tìm active task/failure/next action. Archived bootstrap giữ nguyên tại [START history](START-HERE.history-2026-10-12.md), [STATE history](STATE.history-2026-10-12.md), [TASKS history](TASKS.history-2026-10-12.md); chỉ tra khi cần checkpoint lịch sử, không dùng quyền/provider/next action cũ làm current.
