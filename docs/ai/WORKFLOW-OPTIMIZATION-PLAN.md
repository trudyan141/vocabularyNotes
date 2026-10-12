# Audit và plan tối ưu flow coding AI — 12/10/2026

**Trạng thái: founder đã duyệt WF1/WF2 ngày12/10 (“ok làm đi”); WF1 done, WF2 implemented_local/scoped verified, cloud pending_environment.** Audit ban đầu chỉ viết plan. Follow-up theo yêu cầu trực tiếp đã thêm một skill project-local `systematic-debugging`, pin/source review/lock/catalog và routing bug; đã dùng skill rà lại plan ở mục 8. Đã triển khai current bootstrap/archive và scoped runner/shared config; xem [implementation evidence](../evaluations/ai-workflow-optimization.md). Không sửa code sản phẩm/CI/provider. Bản dễ đọc cho founder nằm trong [kế hoạch founder, mục 21](../KE-HOACH-FOUNDER.md#workflow-review). Không xem các quy tắc WF đề xuất là yêu cầu đã được chấp thuận.

## 1. Mục tiêu và giới hạn audit

Tối ưu **toàn bộ một task hoàn thành đúng**, gồm đọc → tìm lỗi → sửa → kiểm → bàn giao. Giảm token mỗi request nhưng phải đọc lại nhiều lần hoặc bỏ sót lỗi không đạt mục tiêu. AI được kiểm tra là coding agent của dự án; không thay quota, model hay batch của Gemini trong app theo plan này.

Đã kiểm local: AGENTS, ba file bootstrap, delivery/handoff/context-compression skill, routing/catalog và một phần UI skill để xác định độ rộng hướng dẫn; package scripts, Vitest/Playwright/CI; các evaluation capture-tabs, simple-word-cards-and-media-fallback, prepare-list-dedup, merged-photo-lesson, group-picker-and-pictures và free-picture-sources-and-games. Đo kích thước/đoạn trùng trên file thực tế. Không đọc lịch sử chat ngoài repo, credentials hay browser founder; không chạy app/provider/cloud benchmark.

**Chưa có tổng token, chi phí hoặc thời gian từng pha của các chat coding trước.** Evaluation chứng minh một số lần làm lại và thời gian E2E riêng lẻ, không chứng minh task mất bao lâu hoặc mỗi nguyên nhân chiếm bao nhiêu phần trăm. Phân biệt dữ kiện, suy luận và mục tiêu thử nghiệm trong mọi báo cáo tiếp theo.

## 2. Dữ kiện có thể kiểm lại

Snapshot repo đầu lượt: `git status --short` rỗng. Số đo UTF-8 bytes, không phải token:

| File | Bytes | Vai trò thực tế / vấn đề |
|---|---:|---|
| `docs/ai/START-HERE.md` | 34.379 | Routing chỉ bắt đầu ở dòng 128; phía trên chủ yếu checkpoint |
| `docs/ai/STATE.md` | 50.985 | Current state trộn nhiều trạng thái/next action lịch sử |
| `docs/ai/TASKS.md` | 47.936 | Task ledger trộn bàn giao feature và checkpoint cũ |
| **Ba file bắt buộc bootstrap** | **133.300 ≈ 130,2 KiB** | Phải đọc lại khi bắt đầu/khôi phục |
| `AGENTS.md` | 15.491 | Nhiều steering lịch sử nhưng có bất biến/quyền phải giữ |
| `docs/ai/CHANGELOG.md` | 101.235 | Lịch sử; không cần đọc toàn bộ cho fix nhỏ |
| `docs/ai/DECISIONS.md` | 114.292 | Lịch sử ADR; chỉ đọc quyết định liên quan |
| `docs/KE-HOACH-FOUNDER.md` | 125.407 | Nguồn founder; cần đọc đúng mục khi task yêu cầu |

Đếm đoạn phân cách bằng dòng trống, trim whitespace, chỉ lấy đoạn ≥100 ký tự: START-HERE/STATE có **25 đoạn giống nguyên văn, 21.411 bytes**; START-HERE/TASKS cũng 25/21.411; STATE/TASKS có 38/28.810. Các giao có thể chồng nhau, **không cộng ba số thành tổng lãng phí**.

Các chứng cứ khác:

- [START-HERE](START-HERE.md): dòng 92 giữ quyền ADR049 cũ; dòng 142 routing Speaking vẫn trỏ ADR058/059; dòng 107–115 context tối thiểu còn mô tả parent review/cloud và provider cũ. [AGENTS](../../AGENTS.md) có steering mới supersede. Phần mới ở đầu file giúp xử lý nhưng không loại bỏ chi phí đối chiếu lịch sử.
- [Capture tabs](../evaluations/capture-tabs.md): 14 ca UI unique; hai lượt browser ghi 16,4s và 16,5s. Rerun có lý do ảnh/chọn ca thiếu. Không được gọi mọi rerun là lãng phí.
- [Media fallback](../evaluations/simple-word-cards-and-media-fallback.md): 29 focused tests, 6 UI/9,1s. [Merged photos](../evaluations/merged-photo-lesson.md): 61 tests +14 UI unique, bắt được lỗi checkpoint và có regression một ảnh. Đây là evidence kiểm có ích; không cắt theo số lượng tuyệt đối.
- [Prepare](../evaluations/prepare-list-dedup.md): build bị khóa bởi lượt khác, phải dùng snapshot dev; lệnh config isolated trong evidence hiện không có file cùng tên trong repo. [Group picker](../evaluations/group-picker-and-pictures.md): build lock và import của thay đổi đồng thời; assertion fixture bị sai sau đổi thứ tự. [Free pictures](../evaluations/free-picture-sources-and-games.md): priority UI đầu chạy snapshot build cũ rồi refresh/rebuild/rerun.
- Có **7 Playwright config** ở root. [Default config](../../playwright.config.ts) chọn 13 tên spec trong 29 spec ở `tests/e2e`; **16 spec ngoài default**, gồm notifications/search-batch/edit-and-feedback/grammar-polish. [CI](../../.github/workflows/ci.yml) gọi `pnpm test:e2e` mặc định. Không suy ra 16 spec chưa từng chạy; chúng có scoped evidence. Nhưng full E2E mặc định hiện không bao gồm các file này.
- Default config khai báo ba webServer (app demo/cloud mock/app no-demo); lọc `--grep` hoặc `--project` không tự biến cấu hình này thành runner một app. [UI config](../../playwright.ui.config.ts) đã có một server; các config scoped đang dùng nó là hướng đúng, nên tái sử dụng thay vì viết lại tạm mỗi task.
- `extract.tsx`: 33.320 bytes/113 dòng, 21 dòng >500 ký tự, dài nhất 2.992 ký tự; `byok.ts`: 22.970 bytes/164 dòng, 7 dòng >500 ký tự, dài nhất 3.764 ký tự. Dòng dài làm kết quả tìm kiếm/đọc khó khoanh vùng. `repository.ts` 39.737 bytes/853 dòng; lớn không tự chứng minh cần refactor.

## 3. Nguyên nhân và mức chắc chắn

| Nguyên nhân | Kết luận | Hướng xử lý |
|---|---|---|
| Bootstrap tích lũy lịch sử + copy giữa nhiều file | Chắc chắn có dữ liệu thừa trong đường đọc bắt buộc; chưa đo token thực | Thu gọn current context, archive losslessly, link evidence |
| Current/historical policy lẫn nhau | Chắc chắn có hướng dẫn cũ trong điểm vào; nguy cơ đọc sai là suy luận | Một current policy rõ ràng; supersession chỉ dẫn tới nguồn hiện hành |
| Môi trường build/snapshot va chạm hoặc stale | Có lần cụ thể trong evaluation; chưa biết tần suất toàn dự án | Một owner/môi trường, source identity, kiểm stale trước chạy |
| Chọn test bằng nhiều config/regex tạm | Cấu hình phân mảnh và default bỏ file là dữ kiện | Runner scoped dùng chung + xác nhận discovery; full inventory rõ |
| Code dồn trên dòng dài | Dữ kiện về cấu trúc; tác động thời gian/token chưa đo | Chỉnh cục bộ khi chạm file; chưa refactor toàn bộ |
| Skills UI có vùng chồng lấn | Catalog/routing có nhiều hướng dẫn; không có evidence mọi lượt đọc hết | Đọc skill bắt buộc theo trigger, chỉ references đúng vấn đề |
| Kiểm thử quá nhiều là nguyên nhân chính | **Chưa được chứng minh**; nhiều lượt đã scoped | Giữ ADR050, giảm setup/lặp vô ích trước khi cân nhắc giảm coverage |

## 4. Flow đề xuất sau khi được duyệt

### 4.1. Khởi động ngắn, đọc sâu theo nhu cầu

1. Yêu cầu trực tiếp mới nhất + AGENTS hiện hành; kiểm `git status --short`.
2. START-HERE gọn → STATE hiện tại → task đang được giao trong TASKS. Yêu cầu trực tiếp ưu tiên việc tự chọn task khác.
3. Đọc đúng spec/ADR/skill và vùng code liên quan. Không `cat` cả ledger/ADR/founder plan. Skill bắt buộc theo trigger của host vẫn phải đọc; chỉ giảm references không liên quan.
4. Chốt vài dòng acceptance, rủi ro và test boundary. Bug: tái hiện nhỏ nhất bằng UI/test/log thích hợp; tìm nguyên nhân rồi sửa. Nếu cần fixture cho boundary dữ liệu/quyền, tạo ca đó trước hoặc cùng fix. Không tạo test chỉ so lại literal label.
5. Sửa đầy đủ scope đã giao; kiểm nhanh hành vi trong dev cô lập, rồi các gate cần cho bản cuối. Không dùng ngân sách đọc hoặc timebox làm cớ dừng task chưa xong.
6. Khi pass, bàn giao ngắn và cập nhật trạng thái bằng link. Chỉ broaden sau failure, changed boundary hoặc evidence ảnh hưởng rộng.

Nếu đọc lần đầu chưa xác định được module: dùng `rg --files`, `rg -n` theo symbol/route, sau đó đọc khoảng dòng. Các read-only độc lập có thể batch; edit, setup phụ thuộc, migration và build trên cùng output chạy tuần tự. Tool output dài lưu artifact có redact, trả summary/phần lỗi liên quan; không copy cả log vào chat rồi đọc lại. Output bị truncate là tín hiệu thu hẹp truy vấn, không tiếp tục tăng dump.

### 4.2. Phân nhiệm tài liệu, không mất lịch sử

| Nơi | Chỉ giữ / cách cập nhật |
|---|---|
| AGENTS | Quyền, bất biến và routing ngắn; không append toàn bộ bàn giao mới |
| START-HERE | Quy trình vào repo, bảng route theo **loại công việc** + lệnh cần tìm; không feature changelog |
| STATE | Baseline hiện tại, active task, file/diff đang dở, failure/test evidence, một next action và known external gaps |
| TASKS | Giữ đủ T00–T18/dependencies để validator hoạt động; status+acceptance còn thiếu+link evidence; tách task hiện hành khỏi checkpoint cũ |
| CHANGELOG/evaluations | Lịch sử và bằng chứng chi tiết, đọc theo link |
| DECISIONS/spec nguồn | Quyết định và requirement; lịch sử ADR giữ, không biến giả định thành steering |
| Founder plan | Cập nhật ngắn khi milestone/decision đổi; không paste bản bàn giao kỹ thuật |

Di chuyển checkpoint sang archive có mốc ngày và link từ nguồn cũ; bảo toàn evidence, deployed-vs-local, pending gates, original refs/anchors cần dùng. Giữ nguồn spec có thẩm quyền theo topic; STATE chỉ trỏ, không nhân bản policy. ADR superseded phải có chỉ dẫn current ngay tại nơi hay được đọc. Không claim một checkpoint cũ đang mô tả build/deploy hiện tại.

**Mục tiêu bootstrap đề xuất:** tổng START-HERE+STATE+TASKS ≤12 KiB cho trạng thái bình thường, từ 133.300 bytes hiện tại (giảm khoảng 91% lượng bytes của ba file). AGENTS/required skill/tool schemas/host instructions **không nằm trong con số này**; không quảng cáo giảm 91% tổng token. Nếu current state thật sự cần dài hơn để giữ boundary quan trọng, giữ thông tin và ghi lý do. Không cắt requirement để đạt số.

Handoff dùng template hiện có, thêm source identity và log pointer khi cần. Chỉ giữ objective/latest steering, changed files/diff cần bảo toàn, current bug hypothesis, test đã chạy/fail, failure/dependency, next action. Không ghi lại toàn bộ những file đọc không ảnh hưởng bước tiếp; artifact quan trọng phải giữ đúng tên/symbol. Khi compaction, merge thông tin mới vào state hiện hành, không tái kể toàn session.

### 4.3. Chọn kiểm tra theo boundary — giữ ADR050

| Đổi gì | Kiểm bắt buộc theo phạm vi | Build / kiểm rộng |
|---|---|---|
| Chỉ docs/plan | Docs links/integrity, diff whitespace | Không lint app/build/E2E |
| Text/icon/layout nhỏ | Lint/typecheck; vài UI main/error bị ảnh hưởng tại mobile/desktop | Dev cô lập đủ khi không có lý do production preview; không unit test literal |
| State/UI có logic | Lint/typecheck, behavior tests đúng state; vài UI chính/lỗi | Final build khi route/API/dependency/Next/PWA/offline/config đổi hoặc cần production preview |
| Save/dedup/backup | Transaction/rollback/CAS/idempotency/round-trip đúng boundary + UI save/error/reload | Không cắt ca chống mất dữ liệu để nhanh |
| Auth/cloud/SQL | Ownership/account isolation/RLS/RPC/server boundary liên quan; fixture riêng/cleanup | SQL scoped; live chỉ khi task cần, ghi phần chưa kiểm |
| Provider/parser/media | Fixture success/malformed/quota/stop/retry/resume/source/license liên quan | Live sample chỉ khi cần xác minh integration; không tự benchmark tốn quota |
| Release/ảnh hưởng rộng có chứng cứ | Full check/E2E/SQL/gates theo dự án | Một final build; broadening phải có lý do |

Giữ typecheck toàn app theo lệnh hiện tại, bởi type errors có thể xuyên file. Scoped ESLint được dùng khi phù hợp ADR050 và coverage file thay đổi rõ; không tự đổi chuẩn lint CI. Không install dependency/Chromium khi runtime sẵn và không đổi. Không bỏ release CI hoặc SQL gates.

Dùng discovery `--list` xác nhận filter thực chọn test trước khi chạy; **0 test là lỗi chọn scope**, không pass. Report số ca unique và rerun riêng, tránh count trùng hoặc hiểu `full` là mọi spec khi chưa inventory.

### 4.4. Môi trường test có owner và source identity

- Mỗi checkout chỉ một mutating task/build dùng chung `.next` tại một thời điểm. Nếu có chat khác đang sửa cùng workspace, phối hợp phạm vi; chọn checkout/worktree riêng khi cần. Worktree không tự mang uncommitted changes — phải xác định baseline/diff muốn kiểm. Không reset/kill server hoặc lock của người khác.
- Runner UI chung tham số hóa port/config/scope và artifact output; default một app cho task UI, cloud/no-demo chỉ bật theo boundary. Giữ full runner riêng cho release. Không tái chế snapshot cũ chỉ vì server trả HTTP200.
- Source identity = git commit **và** trạng thái/hash phần source cần kiểm; SHA đơn lẻ không đủ khi worktree dirty. Ghi cả config, runtime, server mode, mock/live. Không hash/read secrets/.env để làm fingerprint.
- Dev preview có output riêng với build/typegen/production preview; kiểm khả năng hỗ trợ của Next hiện cài trước khi chọn cơ chế. Nếu thay Next/distDir/runner config phải chạy final build và smoke đúng phạm vi. Không hardcode một config chưa kiểm là đã dùng được.
- Chỉ reuse server thuộc runner/task, đúng source identity/mode; tách trace/screenshots vào task output. Stale hoặc collision → sửa môi trường trước test, không coi là product regression.
- Dùng fixture đi qua repository/real UI để phát event/state đúng; mock ở network/provider boundary. Query dựa accessible role/test contract, không phụ thuộc vô ý thứ tự demo hoặc tên trùng recent session. Nếu order chính là requirement, assert order.

Scope filter phải dùng được cho tất cả 29 spec; full inventory phân loại desktop/mobile/cloud/no-demo và opt-in live. Không tự thêm mọi spec vào mọi project nếu fixture không phù hợp. Kiểm discovery/skip thực tế; giữ live network opt-in, không gây quota khi CI chạy release.

### 4.5. Skills và locality code

Follow-up founder trực tiếp cho thêm skill phù hợp: đã cài riêng `systematic-debugging` (mục 8), giữ upstream nguyên bản và project overrides ở source review. Không thêm upstream khác, đổi model/global settings hay hooks. Giữ UI/UX Pro Max + Impeccable và các trigger bắt buộc; đọc playbook/rules đúng interaction bị đổi, không design-system search cho mỗi bug nhỏ. Template visual/release audit chỉ áp dụng khi scope tương ứng.

Formatting các vùng dòng dài đang phải sửa, rồi chỉ tách parser/orchestrator/UI khi có evidence task thường phải đọc phần không liên quan. Refactor riêng cần acceptance và behavior baseline; tránh mechanical rewrite toàn file có thay đổi đồng thời. Không đặt target “file tối đa N dòng” hoặc refactor cả app chỉ để giảm token đọc.

Phần prompt/tool catalog được host chèn và overhead model không thể giảm hoàn toàn bằng sửa repo. Không hứa chỉnh repo sẽ loại toàn bộ context/token cố định của Codex/Antigravity; không đọc lịch sử chat ngoài repo để đo.

## 5. Triển khai từng chặng sau review

| Chặng | Output cụ thể | Gate / điều kiện kết thúc |
|---|---|---|
| WF1 — dọn đường đọc | Archive checkpoint; current START/STATE/TASKS; cập nhật AGENTS/delivery/handoff/routing nhất quán | Không mất constraints/pending gates; đủ T00–T18/links/skill lock; probe current permissions/merged photos/Speaking/next action trả lời đúng từ đường đọc mới |
| WF2 — chuẩn hóa test | Một scoped runner dùng chung, scope map/lệnh rõ, source identity/output isolation; full inventory đủ specs | `--list` đúng và không silent zero; một UI happy/error mobile+desktop; smoke cloud/no-demo đúng config; lint/types/final build cho config changes, release inventory không mất boundary |
| WF3 — áp dụng task thật | Ghi metrics gọn ở task evidence; làm 3 task tiếp theo khác loại theo quy trình mới | Report chi phí đọc/thời gian/token nếu có và lỗi/rerun; không dựng benchmark rộng chỉ để có số |
| WF4 — tối ưu hotspot có bằng chứng | Formatting/refactor nhỏ ở module còn gây đọc/làm lại | Chỉ làm nếu WF3 chứng minh cần; relevant regression/data invariants pass |

Ưu tiên WF1 trước WF2 vì không chạm app; mỗi chặng reviewable, rollback được. WF3 không có nghĩa tự phát minh ba feature: chỉ đo trên task founder thực sự giao. Không spawn subagent mặc định; task nhỏ có thể tốn thêm context/coordination, delegation chỉ khi được authorize và có phần độc lập đáng tách.

**Không tạo ADR coi plan đã được duyệt ở lượt audit.** Sau khi founder đồng ý, ghi quyết định workflow ở DECISIONS, đổi nguồn có thẩm quyền và cập nhật custom skill lock theo validator. Không sửa pinned upstream chỉ để thêm quy tắc dự án. Founder vẫn chỉ có ba giới hạn thao tác đã chốt: không push main, không thêm env Vercel, không browser thật founder; các yêu cầu an toàn dữ liệu hiện hành giữ.

## 6. Đo kết quả mà không tạo thêm việc thừa

Baseline hiện có chỉ đủ đo bytes/duplicates/discovery và chỉ ra rerun đã xảy ra. Khi triển khai, ghi ngay trong evidence task (không tạo ledger cạnh tranh):

```text
task + loại/risk; source identity; required context bytes;
started/first fix/verification done/handoff timestamps;
input/output/cached tokens + model nếu host cung cấp; unavailable nếu không;
commands + duration + pass/fail + unique cases;
rerun reason = code change / real bug / fixture / stale / collision;
missed boundary/reopened bug + observation window; known external gaps.
```

Tách thời gian chờ tool khỏi đọc/tìm/sửa nếu metadata có; không suy token từ thời gian test hoặc bytes tiếng Việt. Token có cache là một phần tính phí tùy host, không gộp thành tỷ lệ cost khi thiếu dữ kiện pricing. Không thêm API telemetry/model call riêng. Nếu không có usage metadata, báo bytes/output volume chỉ là proxy và để actual tokens `unavailable`.

Mục tiêu thử nghiệm: bootstrap bytes giảm khoảng 91%; trên task tương đương hướng tới **≥25% giảm thời gian hoàn thành và ≥30% giảm token/task nếu đo được**, đồng thời không bỏ gate/boundary và không tăng lỗi phải mở lại. Đây là target để đánh giá, **chưa là kết quả hay cam kết**. Ba task đầu chỉ pilot định hướng, không đủ chứng minh thống kê; dùng report cả từng task/median và severity lỗi, không median để che task thất bại. Nếu khó so độ phức tạp, nói rõ không suy causal saving từ so hai task khác nhau.

Kiểm runner trước/sau có thể dùng cùng fixture/config/environment để so setup duration. Không replay sửa task trên dữ liệu founder hoặc gọi Gemini thật chỉ để có benchmark. Nếu accuracy giảm, tìm missing boundary và phục hồi gate trước khi mở rộng flow.

## 7. Evidence của lượt lập plan

Đã chạy: `git status --short`, `wc -l -c` file liên quan, Python stdlib đo bytes/đoạn trùng/default spec inventory/dòng dài, scoped `rg`/đọc config/evaluations. Các số snapshot ở mục 2 được đo trước khi thêm tài liệu audit. Một số output đọc đầu lượt bị truncate; đã thu hẹp truy vấn và đo bằng script, không dùng phần bị cắt làm kết luận. Điều này cũng cho thấy vì sao bootstrap dump hiện tại cần được thay.

Kiểm bàn giao docs-only ban đầu: `pnpm docs:check` PASS799links/15skills317resources/48JSON parsed, `git diff --check` PASS. Không chạy lint/typecheck/build/E2E/SQL vì chưa thay app/workflow runtime. Follow-up skill/docs kiểm riêng và ghi CHANGELOG. Không claim tốc độ/token đã cải thiện trước WF1–WF3.

<a id="workflow-skill-review"></a>

## 8. Review lần 2 bằng systematic-debugging

### 8.1. Skill được chọn và phạm vi

Đã cài [systematic-debugging](../../.agents/skills/systematic-debugging/SKILL.md) từ [obra/superpowers tại pin](https://github.com/obra/superpowers/tree/bb92a77741419a4ab5f06e711a283343f1ada0c3/skills/systematic-debugging) theo quyền founder trong follow-up. Review source/maintainer/activity/license và candidates đã loại tại [WORKFLOW-SKILL-REVIEW](../skills/WORKFLOW-SKILL-REVIEW.md). 297.938 stars/26.615 forks là của repository; có phản hồi adoption cụ thể về skill nhưng không có usage count độc lập.

Skill mới giải quyết **điều tra và sửa lỗi ít làm lại**, không phải công cụ đo token hoặc full workflow tự động. Vocabulary-delivery giữ feature/task ledger; filesystem-context/context-compression giữ retrieval/handoff. Không nạp bộ Superpowers hoặc mọi references cho mỗi task. Không benchmark từ các marketing claims của upstream.

### 8.2. Pha 1 — tái hiện bằng dữ kiện thật

Chạy lại phép đo paragraph overlap trên file repo sau khi thêm plan lần 1: START/STATE/TASKS **133.978 bytes**, overlap vẫn25/25/38đoạn (21.411/21.411/28.810bytes). Tăng678bytes là các pointer/status mới; mốc133.300bytes ban đầu vẫn giữ đúng thời điểm. Đây là evidence vấn đề bootstrap tồn tại, **không phải bằng chứng tổng token đã được đo**.

Chạy lại inventory default Playwright: **13 selected /29 total /16 outside default**. Đọc config và evaluation cho collision/stale; không chạy lại app chỉ để tái diễn lỗi lock của lượt khác. Giữ các lỗi fixture/rerun có lý do là dữ kiện, không quy hết thành phí thừa. Phân biệt current source với checkpoint cũ trước khi kết luận.

### 8.3. Pha 2 — đối chiếu pattern đang hoạt động

Pattern tốt sẵn có: ADR050 scoped checks, playwright.ui.config một server, runtime24.14.1/pnpm11.25.0, evidence ghi unique cases/limitations. Pattern gây công việc thừa: append checkpoint vào cả ba file, config tạm không bền, reuse snapshot chưa kiểm revision. WF1/WF2 giữ pattern tốt và sửa đúng nguồn gây lặp, không thay framework/nav/font hoặc release doctrine.

### 8.4. Pha 3 — giả thuyết và experiment riêng từng nguyên nhân

| Hypothesis | Experiment khi được duyệt | Acceptance / không được suy quá |
|---|---|---|
| H1: current/history duplication khiến bootstrap đọc thừa | WF1 archive lossless rồi đo cùng ba file và chạy probes | Đạt ≤12KiB khi đủ nội dung; permissions/current Speaking/ADR082/pending/next action đúng. Chỉ claim bytes giảm; actual token nếu có |
| H2: setup/collision/stale làm UI phải chạy lại | WF2 dùng cùng fixture trước/sau, ghi source identity/mode/setup duration/rerun reason | Đúng source, config/mocks, output riêng; mismatch bị chặn trước test. Không gọi setup error là product regression |
| H3: fragmented discovery làm bỏ ca hoặc chọn thừa | So `--list`/scope inventory của config cũ và runner đề xuất | Không zero silent; release mapping đủ29spec tại snapshot và spec mới; phân desktop/mobile/cloud/live đúng boundary |
| H4: shotgunning fixes làm task tốn công | Trên task bug được giao: ghi repro + một hypothesis + probe result + regression thuộc boundary | Chưa tái hiện thì chưa kết luận cause; fix có evidence; không bundled cleanup/refactor. Đo reopened bugs/reruns, không hứa tỷ lệ từ skill |

Giữ mỗi experiment một biến chính để biết thay đổi nào có ích. Không deploy/migration/provider gọi thật để chứng minh giả thuyết coding-agent overhead nếu không cần task.

### 8.5. Pha 4 — sửa plan, chưa sửa workflow/app

**Các bổ sung áp dụng vào plan:**

1. Trước mỗi fix, có bản repro hoặc boundary evidence nhỏ gắn input/state/source đúng; fixture không thay thế live evidence nếu claim liên quan integration thật.
2. Failure được phân loại **code / fixture / environment / stale / external chưa xác nhận**. Lỗi setup xử lý setup trước, không patch product cho test xanh.
3. Với hypothesis bị bác, ghi kết quả và quay lại dữ kiện; không chồng fix mới lên fix đoán. Ba lần không thành công là tín hiệu cần xem lại evidence/coupling, không chứng minh architecture sai và không tự đổi scope.
4. Data/auth/cloud/parser/state bug giữ failing regression trước fix khi phù hợp; sửa text/layout nhỏ theo ADR050 có repro/UI scoped, không ép test literal hoặc full suite vì skill.
5. Chỉ claim fixed khi ca tái hiện ban đầu pass trên source cuối và boundary liên quan kiểm đủ. Không claim “toàn app pass” từ scoped test hoặc “workflow nhanh hơn” từ docs/integrity pass.
6. WF1 và WF2 phải đo riêng; report saving context, setup và task tổng riêng thay vì gom một tỷ lệ chưa có causal evidence. Pilot không tạo thêm ledger/benchmark rộng.

Upstream SKILL giữ nguyên checksum. TDD/verification siblings không cài; project gate hiện có + explicit founder steering ưu tiên. Supporting pressure fixtures là dữ liệu upstream, không điều khiển session; helper npm polluter không chạy trong project pnpm. Source review mô tả những điểm phải scope, không giả upstream đã được sửa.

**Sau approval12/10:** WF1/WF2 được triển khai theo ADR083; trạng thái/kết quả thật trong STATE và implementation evidence. WF3 đo task được giao tiếp theo, WF4 chỉ khi evidence cần refactor.
