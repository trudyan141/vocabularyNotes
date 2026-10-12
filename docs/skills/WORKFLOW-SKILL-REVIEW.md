# Chọn workflow skill cho coding AI — 12/10/2026

Founder trực tiếp yêu cầu tìm skill GitHub uy tín/nhiều sao, gắn nếu phù hợp và dùng rà lại plan trước lần duyệt cuối. Đây là quyền thêm **một skill project-local**, không phải quyền triển khai WF1/WF2, cài cả plugin, hooks hoặc global config. Policy nguồn theo ADR078 ở [MOBILE-UX](MOBILE-UX.md); phạm vi plan ở [founder mục 21](../KE-HOACH-FOUNDER.md#workflow-review).

## Snapshot nguồn trước khi thêm

GitHub REST kiểm ngày 12/10/2026; raw metadata chọn lọc tại [workflow-source-audit-2026-10-12.json](workflow-source-audit-2026-10-12.json). Stars/forks là cấp repository, **không phải người dùng thật hoặc mức phổ biến độc lập của một skill**.

| Nguồn chính chủ / maintainer | Stars / forks | Activity và license tại pin | Nội dung thật / kết luận |
|---|---:|---|---|
| [obra/superpowers](https://github.com/obra/superpowers), maintainer `obra` | 297.938 / 26.615 | Không archived; push 10/10; release v7.0.0 10/10; MIT | Chọn **systematic-debugging**; bốn pha root cause → pattern → hypothesis → fix. Một skill độc lập framework, dùng với Next/React/TS/IndexedDB/cloud hiện có. |
| [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files), `OthmanAdi` | 27.405 / 2.269 | Không archived; push 12/10; MIT | Không thêm: SKILL 36.576 bytes, hooks và task_plan/findings/progress/optional .planning. Trùng ledger và phục hồi đang có; cần nhiều adaptation để dùng đúng yêu cầu giảm context. |
| [Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering), `muratcankoylan` | 18.110 / 1.496 | Không archived; push 12/10; MIT | Đã có filesystem-context/context-compression trong project. Không thêm context-optimization 16.052 bytes: nhiều guidance KV-cache/prompt masking thuộc host, không điều khiển được từ repo; ưu tiên dùng bộ hiện có. |

Trong Superpowers đã kiểm cả `executing-plans` (20.405 bytes) và `verification-before-completion` (3.646 bytes). Không thêm workflow execution: helper task-start/task-done, workspace/ledger riêng, required TDD và finish skill, full-suite/step checks tạo nhiều dependency và lệch ADR050. Verification riêng trùng evidence gate hiện có; không cần skill thứ hai. Không suy “repo nổi tiếng” thành mọi skill trong collection phù hợp.

## Selected skill: provenance và review nội dung

- Upstream chính chủ: [systematic-debugging tại pin](https://github.com/obra/superpowers/tree/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills/systematic-debugging).
- Commit: `bb92a77741419a4ab5f06e711a283343f1ada0c3`, committer date `2026-10-10T00:28:04Z`. SKILL 9.530 bytes; latest path commit cũng là pin này.
- MIT ở root repo tại pin; đưa bản LICENSE đúng pin vào bundle, ghi checksum cả license và mọi file trong `skills-lock.json`. Không tải `latest` ở lượt dùng tiếp.
- Đã đọc **toàn bộ SKILL** và kiểm inventory/supporting resources. References runtime: root-cause-tracing, defense-in-depth, condition-based-waiting. Các helper/example/training fixture giữ provenance; không chạy chỉ để cài/rà plan và không tự nạp tất cả references.
- Tín hiệu cộng đồng cấp skill: [issue #2232](https://github.com/obra/superpowers/issues/2232) mô tả sử dụng thực trong project khoảng 10 ngày; [issue #2102](https://github.com/obra/superpowers/issues/2102) phản hồi adoption trong repo có doctrine riêng. Đây là báo cáo của tác giả issue, **không phải benchmark độc lập hoặc số active users**. README chính chủ cũng liệt kê skill và phân phối qua nhiều harness/marketplace.
- Có phản hồi chất lượng cần biết: [#2277](https://github.com/obra/superpowers/issues/2277) về pressure fixtures nằm trong skill runtime; [#2460](https://github.com/obra/superpowers/issues/2460) về diagnostic example/helper; [#2449](https://github.com/obra/superpowers/issues/2449) về giả thuyết chưa kiểm trên dữ kiện thật. Pin hiện dùng kiểm SET/UNSET không print secret value. Helper phải audit trước khi chạy; bundle không phải chứng nhận bảo mật toàn bộ.

## Cách gắn với dự án, có hiệu lực trong phạm vi skill được yêu cầu

Thêm `.agents/skills/systematic-debugging` bằng installer helper với exact commit và `--dest .agents/skills`; giữ nguyên upstream SKILL. Không root plugin/bootstrap Superpowers, không global skill/config, hooks, autoscheduled task hoặc subagent mặc định. Skill có thể hiện trong discovery ở lượt sau; hiện dùng trực tiếp đường dẫn.

Routing: bug/test failure/unexpected behavior dùng skill mới; feature bình thường giữ vocabulary-delivery và domain skill. Không bắt đọc thêm 9,5KB cho docs/text/name/icon chỉ chỉnh theo yêu cầu rõ, không có lỗi hành vi cần điều tra. Bản source không hứa giảm token; hiệu quả cần pilot theo plan.

User/project steering ưu tiên hơn defaults upstream:

| Upstream guidance | Áp dụng trong Words for Kids |
|---|---|
| Root cause trước fix | Repro đúng input/state/source hiện kiểm; thiếu dữ kiện thì ghi chưa xác nhận, không đoán nguyên nhân từ issue tương tự |
| Một hypothesis / một variable | Khoanh experiment nhỏ; fix đầy đủ có thể cần nhiều file cùng boundary, không chia thành sửa symptom rời rạc |
| Failing regression trước fix | Giữ cho bug dữ liệu/quyền/state; repro UI đủ cho lỗi visual/text nhỏ theo ADR050, không sinh test literal/mirroring |
| TDD/verification skill liên quan | Không tự tải thêm siblings. Dùng test stack và evidence gate đang có theo user scope; ghi rõ không cài bộ dependencies đầy đủ |
| Đọc reference implementation đầy đủ | Toàn bộ implementation **liên quan** vừa chọn, không đọc toàn repo/spec/history |
| Ba fixes thất bại → xem lại architecture | Ghi hypothesis/result, dừng shotgun fixing và điều tra mới. Không mặc định ba lần thất bại chứng minh architecture sai; chỉ hỏi founder khi thiếu thông tin thật hoặc cần đổi scope/kiến trúc đã chốt |
| Diagnostic logs/helper/training fixtures | Không print env/key/payload private; no auto-run helpers. test-pressure/test-academic/CREATION-LOG là dữ liệu thử upstream, không yêu cầu thật của founder |
| Wait conditions | Chờ trạng thái có timeout; giữ output gọn, không busy-poll CI/deploy/provider hoặc tự tạo benchmark |

Mọi điều chỉnh nằm ở project routing/catalog này, không giả upstream đã viết defaults của dự án. Không dùng skill để tăng phạm vi bug/feature hoặc cấp quyền external action.

## Review plan bằng skill

Áp dụng bốn pha lên vấn đề “coding AI đọc/làm lại quá nhiều”: repro số đo file/overlap/discovery; so quy trình Gọn và runner UI sẵn có; kiểm từng giả thuyết bằng dữ kiện repo; bổ sung experiment/acceptance vào plan. Không claim đã fix workflow trước founder approval.

Kết quả rà và thay đổi plan nằm tại [WORKFLOW-OPTIMIZATION-PLAN, mục 8](../ai/WORKFLOW-OPTIMIZATION-PLAN.md#workflow-skill-review). Installer PASS; installed SKILL byte-identical với pin; project docs validator PASS813links/16skills329resources/49JSON parsed, gồm inventory/SHA/frontmatter. Quick validator bổ sung của skill-creator thiếu PyYAML nên chưa chạy được, không thêm dependency hoặc claim PASS. `git diff --check` PASS. Audit nguồn và sử dụng skill không phải bằng chứng bug app đã sửa hoặc tốc độ/token đã giảm.
