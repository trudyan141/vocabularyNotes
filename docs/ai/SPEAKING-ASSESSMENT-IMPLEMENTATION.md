# Codex: triển khai nâng cấp chấm phát âm Nói cùng Cáo

**ADR095 current:** theo yêu cầu mới sau manual failure, v3 schema-enforced/unprompted audio + client alignment; unclear và system-error trả0 có lý do; endpoint/request có giới hạn mới. [Spec15](../15-speaking-practice.md), [evidence](../evaluations/speaking-zero-and-latency.md). Chỉ dẫn v2/null/2candidate dưới đây ghi checkpoint ADR094, đã supersede ở các phần tương ứng; không reset budget15request hoặc bỏ quality gates.

Updated: 15/10/2026. **Application v2 và benchmark tooling đã triển khai; A scoped verified, B quality_pending/pending_external_inputs.** Xem [evidence](../evaluations/speaking-assessment-v2.md) trước khi tiếp tục; không chạy lại A từ đầu.2prompt candidates đã dùng, không tự mở candidate thứ3;9request engineering đã tính budget (8ban đầu+1apple diagnostic khi founder báo lỗi); còn291. Ví dụ alternate prompt trong README công cụ mô tả API chung, không phải quyền khởi động lại tuning của pilot này. Task trực tiếp thuộc T12, chất lượng phụ thuộc đầu vào T00. Tiến độ chỉ cập nhật trong [TASKS](TASKS.md) và [STATE](STATE.md), không dùng file này làm ledger thứ hai.

## 1. Đọc và bắt đầu đúng scope

1. Đọc AGENTS → [START-HERE](START-HERE.md) → STATE → đúng entry nâng cấp Speaking trong TASKS.
2. Đọc [spec15](../15-speaking-practice.md) và [plan đã duyệt](SPEAKING-ASSESSMENT-UPGRADE-PLAN.md). Plan mục3–5 là contract/điểm/UX; mục7 là dữ liệu, budget và ngưỡng benchmark; không tự chọn lại các quyết định đó.
3. Áp dụng vocabulary-delivery, systematic-debugging và bilingual-learning-content; khi thực sự sửa React/UI đọc React + UI skills theo routing. Không spawn subagent, cài plugin hay hooks vì skill gợi ý.
4. `git status --short`, bảo toàn diff; ghi commit và content fingerprint theo [WORKFLOW](WORKFLOW.md). Chỉ tìm/đọc code cần thay, không bootstrap toàn bộ lịch sử.

**Chỉ thị hiện tại là chuẩn bị docs trước khi code.** File này là hướng dẫn cho task triển khai tiếp theo, không tự cho phép bắt đầu code trong lượt docs. Khi được giao triển khai, không hỏi lại founder về schema, công thức, ngưỡng pilot hoặc việc gửi audio Gemini đã được chốt.

## 2. Ranh giới và nguồn chuẩn

| Nội dung | Nguồn chuẩn |
|---|---|
| Contract v2, normalizer và allowlist partial credit | Plan mục3 |
| Công thức, null, rounding và tổng điểm vòng | Plan mục4 |
| Prompt, audio/replay, hướng dẫn và thứ tự lỗi chính | Plan mục5 |
| Dataset, nhãn, budget, metric và gate | Plan mục7 |
| Kiến trúc hiện hành, phần được thay thế | ADR094 và spec15 |
| Lệnh kiểm, snapshot, source identity | WORKFLOW |

Giữ đúng model `gemini-3.5-flash-lite:generateContent`, key/project hiện có, không fallback/auto retry, tối đa một request hợp lệ/lượt; local guard từ chối audio hỏng là 0 request. Giữ dữ liệu học, filter, IPA/source/license, ADR093 audio, SRS, cloud/backup và cơ chế hủy. Không push main, thêm env Vercel, điều khiển browser founder, tải model local355MB hay dựng backend mới.

App không lưu audio/điểm vào IDB, localStorage, cloud, backup hay analytics. Benchmark dùng nguồn được phép, vị trí riêng tư phù hợp và mã clip ẩn danh; không tự thu giọng trẻ/người dùng. Thiếu nguồn, nhãn hoặc quota không chặn hoàn tất code/fixture, nhưng chặn claim mốc B.

## 3. Trình tự làm sau khi được giao code

### A1 — Chứng minh baseline

- Snapshot prompt/model/contract cũ trước chỉnh; giữ source identity cho baseline benchmark sau này. Chưa đủ audio thật thì lưu cấu hình baseline trước, không bịa kết quả.
- Probe đúng `pronunciationScore`: cat hai match/một missing, provider score100 → code cũ trả100; kết quả đích67.
- Phân loại lỗi riêng: tính điểm, nhận âm, pipeline audio, schema, environment/provider. Không kết luận priming là nguyên nhân đã chứng minh hoặc sửa nhiều giả thuyết cùng lúc.

### A2 — Contract, normalizer và tính điểm

- Bổ sung `schemaVersion:2`, variantIndex, audibility, phones và insertions bắt buộc theo plan; bỏ score/advice khỏi response provider.
- Parser v2 strict; không fallback parse v1, không default insertions thiếu thành `[]`. Field score100 trong response v2 phải bị reject như field lạ. Adapter baseline v1 chỉ ở công cụ đánh giá riêng, không ở runtime app.
- Kiểm index đủ/duy nhất, variant nguyên vẹn, expected đúng thứ tự, bounds và inventory/token; kiểm heard theo từng status, afterIndex động theo N và thứ tự insertion. Không silent truncate hoặc dedup âm lặp.
- Normalizer chuyển substitution thành retry/incorrect bằng allowlist client, không tin mức nghiêm trọng provider. Audibility unclear hoặc bất kỳ phone uncertain làm cả từ unscored; không lấy trung bình phần còn rõ.
- Chỉ normalize khác ký hiệu đã chốt; loại bỏ các phép gộp âm khác nhau ở đường chấm mới. Không sửa user IPA/reference để vừa audio.
- Một nguồn tính điểm/word/group status cho mọi nơi; không còn nhánh ưu tiên `word.score` từ provider. Feedback cũ còn field score không được bypass công thức. Không import lại runtime nhận âm local cũ.

Tests đích tối thiểu: cat67; cat+ə75; apple63; apple3match+retry88; thay xa0; unclearnull; có lỗi không100 sau rounding; thiếu/giả reference/field lạ bị reject. Tiếp tục tests giữ key/quota/cancel và bounded I/O, cập nhật expectation82 cũ có chủ đích.

### A3 — UI, hướng dẫn và audio

- Đưa incorrect và insertion qua mọi consumer: graphemes, màu/nhãn, word status, sheet, gợi ý chính, kết quả vòng. Không để toàn bộ âm đích xanh che lỗi thừa.
- Không map chữ–âm chắc chắn → fallback mức từ/bảng âm; không bịa nhóm chữ. Có chữ/icon kèm màu, unclear xám không có điểm. Chỉ hiện điểm vòng khi tất cả từ có điểm; Skip/unclear vẫn đi tiếp được.
- Hướng dẫn VI có loại lỗi và vị trí từ; một lỗi chính theo thứ tự plan, sheet vẫn đủ lỗi. Không lấy advice AI, không tự bật modal, thêm parent gate/toast hoặc animation.
- Replay đúng WAV đã gửi; giữ bản đó trong RAM để nghe lại khi request lỗi. Chỉ thay endpoint/trim/mic processing khi có mẫu tái hiện và regression; không thay đồng thời nhiều ngưỡng.
- Thu mới xóa kết quả cũ; hủy/hide/unmount/revision/scope/logout bỏ mic, playback, request và late response theo boundary hiện có. Giữ nghe mẫu thường/chậm, attribution thu gọn và fallback giọng thiết bị.

### A4 — Kiểm scoped và ghi đúng trạng thái

Sau discovery route/symbol, kiểm unit thật của phần đổi, lint/typecheck và UI mobile/desktop cô lập có main/error/insertion/uncertain/cancel/late response. Discovery UI trước run; không nhận 0test là pass. Lệnh khởi điểm:

```sh
pnpm test tests/unit/speaking-assessment.test.ts tests/unit/speaking-gemini.test.ts tests/unit/speaking-graphemes.test.ts tests/unit/speaking-lifecycle.test.ts
pnpm lint
pnpm typecheck
pnpm test:ui -- --list speaking-refresh.spec.ts
```

Đọc output discovery rồi chọn spec/grep đúng hành vi đã sửa; nếu cần thêm spec thì discover lại trước run. Build cuối khi đổi dependency/route/API/config/PWA hoặc cần production preview, không build sau mỗi thay đổi nhỏ. Không full suite/SQL/install nếu không có evidence cần mở rộng.

Đạt A ghi `implemented_local / scoped verified`, B vẫn `quality_pending` nếu chưa đo. Không cập nhật SRS/learning hoặc tự báo chất lượng trẻ đạt từ UI mock.

### B1 — Dữ liệu và baseline thật

Thực hiện đúng plan mục7: tuning40/4người, held-out60/6người, chia trẻ/người lớn, các lớp lỗi và nhãn người duyệt. Thiếu đầu vào thì ghi cụ thể tại TASKS; không tự tạo TTS thay giọng trẻ, dùng output model làm ground truth hoặc loại mẫu chỉ vì model làm sai.

Manifest benchmark chỉ chứa clipID, quyền dùng/mã nguồn hợp lệ, split/speakerID ẩn danh, reference+variant, nhãn đã duyệt, SHA audio được phép, cấu hình xử lý và prompt/model fingerprint. Audio riêng tư/raw response không vào repo/public log. Công cụ báo cáo tách metadata tổng hợp được phép công khai với dữ liệu phải giữ riêng tư.

Không để baseline v1 mặc định bỏ qua insertion như một ca đúng. So sánh cùng clip; baseline contract cũ thiếu năng lực nào phải báo đúng thiếu năng lực đó. Kiểm riêng PCM trước/sau xử lý để phân lỗi model với mất âm do pipeline.

### B2 — Freeze và đánh giá độc lập

Ngân sách tối đa300request theo plan, chạy tuần tự trong quota, tối đa hai prompt ứng viên. Sau tuning chọn một ứng viên, freeze prompt/model/normalization/allowlist/scoring/gates rồi mới mở held-out. Không xem held-out để chỉnh tiếp hoặc chọn lần model trả đẹp nhất. Kiểm lặp đúng10clip có ít nhất5clip trẻ.

Đo đủ các gate plan, báo numerator/denominator và số mẫu theo người nói; chấm oan ở mức từ không nhầm với precision/FPR ở mức âm. Uncertain/schema/timeout không tính là phát hiện đúng lỗi. Báo riêng tầng trẻ, latency/request/quota và giới hạn thiết bị. Không suy đủ provider eligibility/child accuracy/zero cost từ một benchmark thành công.

### B3 — Kết luận và điểm dừng

- Đạt đủ A+B: ghi pilot đạt trên tập/thiết bị đã đo, không claim đạt mọi trẻ/điện thoại hoặc ngang ELSA.
- Thiếu đầu vào/quota: A hoàn tất nếu có evidence; B `pending_external` hoặc `quality_pending`, chỉ rõ phần thiếu và một next action.
- Fail nhận âm: báo nhóm lỗi và clipID ẩn danh; không hạ gate, đổi công thức để đẹp điểm hay dùng fallback. Chuẩn bị so sánh engine theo plan mục9; không tự triển khai backend/mua dịch vụ.
- Fail environment/latency/quota: chẩn đoán đúng loại, không suy thành model phát âm kém.

## 4. Checklist nghiệm thu và bàn giao

Checklist này là điều kiện cần kiểm, không có dấu tick sẵn hoặc trạng thái chạy song song với TASKS.

- A: contract strict và giới hạn đúng; mọi phép tính/rounding/null đúng; không bypass bởi điểm provider; mọi consumer hỗ trợ incorrect/insertion; replay khớp payload; lỗi/mic/cancel hoạt động; scoped checks có evidence thật.
- B: nguồn/nhãn/split hợp lệ; baseline và ứng viên tái lập; budget/quota đúng; mọi gate tính cả tổng lẫn tầng trẻ; thiếu dữ liệu ghi rõ; kết luận đúng giới hạn.
- Bàn giao: danh sách file, source identity, lệnh/kết quả, mock/live/device phân biệt, thay đổi hành vi và phần chưa kiểm. Evidence thực thi chỉ tạo khi có kết quả, không tạo report PASS trước.
- STATE giữ current và một next action; TASKS giữ A/B và link evidence; CHANGELOG lưu lịch sử. Khi hoàn tất từng mốc đồng bộ spec15/founder với trạng thái thực, không đổi các phần ngoài scope.

## 5. Prompt tiếp tục ngắn cho Codex

> Triển khai nâng cấp chấm phát âm Nói cùng Cáo theo ADR094. Đọc START-HERE, STATE, đúng entry TASKS, spec15 và docs/ai/SPEAKING-ASSESSMENT-IMPLEMENTATION.md; contract và gates ở plan đã duyệt được link trong đó. Làm trọn mốc A trước, tiếp tục B khi đủ nguồn/nhãn/key được phép trong budget. Không hỏi lại các lựa chọn đã chốt, không thay engine/hạ ngưỡng/fallback ngầm. Giữ diff và dữ liệu không liên quan; báo code/local/live/device và A/B đúng evidence.
