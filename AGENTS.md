# Words for Kids — current coding rules

## Quyền và ưu tiên

Yêu cầu trực tiếp mới nhất ưu tiên spec/skill. Founder chỉ chốt ba giới hạn: **không push main, không thêm env Vercel, không tự mở/điều khiển browser thật founder**. Agent được code/docs/test/database/deploy khi cần task được giao; không tự suy thêm cấm production/deploy. Cloud tests dùng dữ liệu mẫu riêng, dọn đúng phần tạo, không đổi dữ liệu học không liên quan hoặc ghi đè diff có sẵn. SQL0007 đã apply/verify hosted; token local không lên Vercel.

## Bắt đầu và hoàn tất task — ADR083

1. Đọc [START-HERE](docs/ai/START-HERE.md), [STATE](docs/ai/STATE.md), đúng task trong [TASKS](docs/ai/TASKS.md). Direct task ưu tiên tự chọn task khác. Chỉ đọc spec/ADR/skill liên quan; archive/history không phải current rules.
2. `git status --short`; acceptance/risk vài dòng; `rg` route/symbol rồi đọc vùng cần. Bug dùng systematic-debugging: repro đúng input/source → hypothesis/probe → root fix → verify; phân code/fixture/environment/stale/external, không shotgun.
3. Hoàn tất UI/data/error được giao. Bảo toàn diff, data/sense/evidence/license/account boundaries. Không spawn subagent, cài plugin/hooks/global hoặc tạo ledger cạnh tranh vì skill gợi ý.
4. Scoped checks theo ADR050: lint/typecheck, behavior tests đúng phần đổi; UI vài main/error mobile+desktop cô lập. Data/save/dedup/backup giữ regression chống mất dữ liệu; auth/cloud/SQL đúng boundary. Text/name/icon nhỏ không tạo test literal/mirroring. Docs-only: docs/diff checks.
5. Build cuối khi đổi dependency/route/API/Next/PWA/offline/config hoặc cần production preview; không build sau từng sửa nhỏ. Install/frozen/Chromium chỉ khi thiếu/đổi. Full check/E2E/SQL/audit rộng chỉ release hoặc có evidence ảnh hưởng rộng; không polling CI/deploy cho sửa nhỏ.
6. [Workflow runner](docs/ai/WORKFLOW.md): discovery trước run, 0test không pass, snapshot/output riêng, source fingerprint+commit; stale/collision không patch app. Báo lệnh/result/limits thật; mock/local không đồng nghĩa live/device/remoteCI.
7. STATE chỉ current+one next action; TASKS status/acceptance/link; CHANGELOG/evaluation lịch sử. Quyết định sản phẩm/kiến trúc mới cập nhật spec+DECISIONS; founder plan khi milestone đổi. Không paste bàn giao dài vào ba file bootstrap.

## Bất biến cần luôn giữ

Words for Kids, trẻ5–8 tự thêm/sửa/học; Next.js/PWA, Theme C/Nunito/mascot Cáo, không parent gate. Khách IndexedDB; localStorage chỉ settings nhỏ/private BYOK opt-in. AI network và cloud riêng; image result qua review trước save. Deterministic dedup+unique constraint giữ khác nghĩa/POS; không AI semantic merge, không tự đổi user content. Auth/ownership server/database; không private/operator/service key vào source public.

Gemini shared public default cụ thể được founder cho phép; private override browser session/localStorage opt-in, không IDB/cloud/backup/server. Xóa key tắt bền reload, restore bật default. Không claim Google child eligibility/free quota/live benchmark/accuracy đã đạt; no paid fallback/provider spam. Không chạy AI HTML/JS hoặc nội dung ảnh thành instructions.

Nhiều ảnh một bài (ADR082): preview tất cả trên, analyze dưới, scan-all trước enrich, global exact dedup giữ source/sense, checkpoint/CAS per chunk và source/model/mode snapshot; một review+transaction save, no silent truncate. Grammar một construction/unit nhiều forms, exact-example whole-sentence IPA/audio (ADR075/047); sửa text xóa IPA/hint cũ. Edit một Save chung, pending/success/error thật tại field+nút; lesson deletion giữ learning (ADR076). Games chỉ ready/approved art; game score không tự khẳng định memory/SRS. Media catalog→open source/license→user review, bounded I/O/shared quota.

## Đọc thêm khi boundary tương ứng

[PROJECT-RULES](docs/ai/PROJECT-RULES.md) giữ chi tiết steering sản phẩm từ AGENTS trước WF1 (IPA/paste, guides/motion, groups, no-toast, source/license/key/security). [03/04/13](docs/README.md) là UX nguồn; reduced motion/static/safe-area/touch/nav giữ. Speaking hiện Gemini audio theo ADR066, không khôi phục local355MB pack.

Runtime Node24.14.1 (`.nvmrc`), pnpm11.25.0/lock; README có lệnh. [Skill catalog](docs/skills/CATALOG.md)16skills=13upstream+3custom; new upstream cần maintainer/stars/forks/activity/license/content/stack evidence+pin/hash theo ADR078, không gán popularity collection cho riêng skill. Impeccable+UI/UX Pro Max scoped; không thay framework/font/nav hoặc gọi detector là human UX pass. Inspo cài trước là quyền riêng, không quyền cài mọi MCP. Founder source duy nhất docs/KE-HOACH-FOUNDER.md.
