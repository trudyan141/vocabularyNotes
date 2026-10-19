# Phủ hết bộ từ qua nhiều lượt chơi — đề xuất để founder chọn

Ngày: 19/10/2026. Trạng thái: **implemented / scoped verified — founder chọn hướng 2 ngày19/10/2026**.
Founder đã duyệt triển khai hướng 2, tái sử dụng selection phạm vi ôn hiện có. Chu kỳ xuyên ngày, tiến độ riêng mode/filter/direction, lượt10câu và skip để sau; xem ADR100. Phân tích hai hướng dưới đây giữ để giải thích quyết định.

## 1. Mục tiêu và hiện trạng đã đọc từ source

Mục tiêu: chọn toàn thư viện hoặc một nhóm/bài, chơi được hết nội dung hợp lệ, thoát rồi tiếp tục đúng bộ và vị trí, biết hôm nay đã làm đến đâu.

- [PracticeRepository](../../src/data/local/practice.ts): lượt mới random từ toàn pool đã duyệt/phù hợp phạm vi, tối đa 10 câu; chưa có hàng đợi đảm bảo phủ hết trước khi lặp. `roundWords`, nhánh picture và grammar đều có giới hạn riêng, không chỉ một hằng số.
- `Session` đã lưu scope thư viện, mode, filter, direction, câu hỏi snapshot, vị trí, đáp án/check/hint, ngày tạo/hoàn thành và version. Lưu IndexedDB theo thao tác với transaction/CAS; đã có reload/resume. Chưa có định danh chu kỳ nhiều lượt và thống kê độ phủ theo ngày.
- [Hub/kết quả](../../src/components/features/practice.tsx) có lượt dở và Chơi lại; [SessionCard](../../src/components/features/session-history.tsx) hiện tên bài/nhóm và vị trí. **Chơi lại cố ý lặp đúng bộ vừa chơi**; cần thêm Tiếp 10 từ mới với ý nghĩa khác.
- [Archive](../../src/data/local/archive.ts) giới hạn questions/answers/position ở 10, dùng chung validation với [cloud contracts](../../src/lib/cloud/contracts.ts). [SQL chia sẻ](../../supabase/migrations/202610150011_library_sharing.sql) cũng kiểm 1–10 câu và whitelist trường session.
- Game hình kiểm ảnh của cả session trước mở/chấm; tăng cả session lên vài trăm câu sẽ làm nhiều dữ liệu/ảnh bị kiểm lại hơn. [Tối ưu gần nhất](../evaluations/game-start.md) cố ý chỉ tải/decode đủ lượt ngắn.
- [Speaking](../../src/components/features/speaking.tsx) là luồng riêng, vòng 5 từ. [Offline fallback](../../public/offline-games.js) cũng có logic riêng. Không mặc định sửa PracticeRepository là phủ cả hai.

Đây là kiểm tra source, chưa chạy app hoặc đo hiệu năng mới trong task lập kế hoạch.

## 2. So sánh hai hướng

| Tiêu chí | Hướng 1: một lượt bằng toàn bộ bộ từ | Hướng 2: mỗi lượt tối đa 10, đi hết trước khi lặp |
|---|---|---|
| Ví dụ bộ 47 từ | Một lượt 47 câu; dừng ở 23/47 | 10 + 10 + 10 + 10 + 7; tiến độ bộ 23/47 |
| Tiếp tục | Resume một session dài | Resume lượt ngắn + chu kỳ của bộ |
| Mốc hoàn thành | Chờ hết toàn bộ mới hoàn thành lượt | Có kết quả mỗi 10 câu và kết quả cả bộ |
| Tận dụng code hiện tại | Có resume nhưng phải đổi giới hạn/contract | Giữ session ngắn, thêm tầng quản lý độ phủ |
| Ảnh, snapshot, sync | Session lớn; cần tải theo đoạn để giữ tốc độ | Mỗi lượt vẫn chỉ chuẩn bị tối đa 10 câu |
| Nội dung sửa/xóa giữa chừng | Một câu stale có thể chặn session dài theo luật hiện tại | Ảnh hưởng lượt ngắn; phần chưa cấp phát kiểm lại sau |
| Độ khó tương đối | Trung bình–cao nếu giữ chất lượng/performance | Trung bình cho cùng máy; cao hơn khi thêm phối hợp nhiều thiết bị |
| Phù hợp mục tiêu | Hợp khi cần một bài dài liên tục | Hợp khi cần chơi hết bộ qua nhiều lần ngắn |

**Đề xuất chọn hướng 2**, hiển thị tiến độ của toàn bộ bộ từ như hướng 1. Đây là nhận định thiết kế dựa trên code hiện tại và đối tượng 5–8 tuổi, chưa phải kết quả nghiên cứu người dùng.

Hướng 1 vẫn khả thi. Nếu chọn, cần chia nội dung và media thành đoạn để không tải/kiểm hàng trăm ảnh mỗi thao tác; mở rộng archive/cloud/shared SQL, kết quả/replay/history và xử lý stale. Khi triển khai đầy đủ, cấu trúc cũng gần giống một chu kỳ chứa nhiều đoạn, nên khó có lợi thế chỉ bằng việc bỏ cap 10.

## 3. Trải nghiệm đề xuất cho hướng 2

Ví dụ nhóm Animals có 47 từ hợp lệ:

1. Chọn Animals → Gõ cả từ → Bắt đầu. App tạo chu kỳ 47 từ, trộn thứ tự một lần rồi cấp tối đa 10 từ đầu.
2. Trong game hiện `Câu 4/10 · Cả bộ: 13/47`; số tổng chỉ tăng khi thao tác chuyển câu đã lưu thành công.
3. Làm hết lượt: có kết quả 10 câu như cũ, thêm `Đã làm 20/47 từ` và nút **Tiếp 10 từ mới**. Chơi lại/Làm lại câu sai vẫn là lựa chọn riêng.
4. Thoát sau câu thứ 23: hub hiện `Animals · Gõ cả từ · Đã làm 23/47 · Lượt hiện tại 3/10 · Lần chơi gần nhất 19/10`. Bấm Tiếp tục mở đúng câu đang dở, kể cả feedback đã check nhưng chưa Next.
5. Hôm sau còn nguyên chu kỳ, tiếp từ vị trí đó. Hoạt động hôm nay thống kê riêng, không reset hàng đợi.
6. Lượt cuối chỉ 7 câu. Hoàn tất 47/47 thì thông báo hết bộ, cho chủ động **Bắt đầu vòng mới**; không tự bù 3 từ cũ để đủ 10.

Một bộ ít hơn 10 từ chỉ có đúng số từ hợp lệ đó. Một từ khác nghĩa/POS vẫn là mục riêng. Ở kho tổng dùng aggregate hiện hành, trong nhóm giữ source/membership đúng phạm vi; không dedup bằng chữ hiển thị hoặc AI.

## 4. Các luật cần chốt trước khi code

### Theo ngày hay theo chu kỳ?

**Đề xuất chu kỳ kéo dài đến hết**, ngày chỉ dùng thống kê. Nếu reset lúc 0 giờ thì bộ 500 từ có thể mãi chỉ chơi một phần, trái mục tiêu phủ hết. Lưu timestamp chuẩn và timezone của hoạt động để chia ngày; giờ hiển thị theo timezone đã chọn, không dùng ngày UTC cắt chuỗi làm ngày học. Chơi qua nửa đêm không đổi thứ tự hay tạo bộ mới.

### Không trùng theo từng game hay chung mọi game?

**Đề xuất độc lập theo game + phạm vi + chiều học + các filter có ý nghĩa.** Animals/Gõ từ và Animals/Chọn hình có hai tiến độ, vì đã thấy từ ở một game chưa nghĩa là đã làm game kia. Cùng một từ ở hai nhóm giao nhau có thể xuất hiện trong mỗi nhóm; bảo đảm không lặp chỉ áp dụng trong chu kỳ đang chọn. Tên nhóm đổi không tạo bộ mới vì khóa dùng ID, không dùng tên.

Filter key chuẩn hóa giá trị mặc định, không dùng raw URL hoặc thứ tự object. Với đến hạn/cần luyện, snapshot danh sách lúc bắt đầu chu kỳ; rating/attempt làm đổi eligibility không được tự reset chu kỳ. Chu kỳ mới lấy trạng thái hiện hành.

### Chơi đến đâu được tính?

- Chỉ mở lượt/reveal/hint chưa tính đã làm.
- Check đã lưu nhưng chưa Next: giữ feedback và khóa mục trong lượt đó; resume không ghi attempt thêm lần nữa. Chỉ khi Next lưu thành công mới cập nhật số đã làm của bộ.
- Đúng hoặc sai đều là đã làm một lần, không phải đã nhớ. Câu sai luyện lại riêng theo lựa chọn hiện tại; game score không tự đổi SRS. Flashcard giữ rating/SRS đúng một lần.
- **Đề xuất bỏ qua chưa tính hoàn thành mục**: đưa vào danh sách hoãn, ưu tiên đi hết các mục chưa gặp, rồi cho nút Làm các từ đã bỏ qua. Không tự lặp ngay trong cùng lượt; còn mục hoãn thì chưa báo hoàn thành toàn bộ. UI ghi riêng số đã làm/số bỏ qua.
- Chơi lại/Làm lại câu sai là luyện lặp chủ động, không tiến hàng đợi mới và không cộng đôi độ phủ. Lời hứa không lặp áp dụng cho Tiếp từ mới; không áp dụng cho distractor xuất hiện trong đáp án lựa chọn.
- Xóa lượt dở giải phóng mục chưa làm về hàng đợi, giữ độ phủ những câu đã làm và lịch sử học. Không dựng độ phủ chỉ bằng session còn tồn tại, vì xóa session sẽ làm quên tiến độ.

### Thêm/xóa/sửa từ giữa chu kỳ?

**Đề xuất chốt danh sách ở đầu chu kỳ.** Từ thêm sau dành cho vòng sau, hiện số mục mới nếu cần; không tự tăng mẫu số giữa lượt. Giữ identity/revision/source từ snapshot, không đổi representative ngầm khi aggregate thay đổi.

Mục chưa cấp phát bị xóa/bỏ duyệt/không còn hợp lệ: đánh dấu không khả dụng với lý do, không tính đã làm; hiển thị ví dụ `40 đã làm · 2 không còn khả dụng / 42 mục ban đầu`. Hoàn tất chỉ được nói đã làm hết **phần còn hợp lệ**, không tuyên bố đã chơi 42 từ. Không khôi phục nội dung đã xóa chỉ để giữ hàng đợi.

Mục trong lượt đã cấp phát bị sửa hoặc ảnh stale: giữ fail rõ theo luật hiện tại; cho tạo lại phần chưa làm từ nội dung hiện hành sau khi kiểm tra, giữ các mục đã hoàn tất. Không tự đổi câu đang trả lời. Mục chỉ tạm tải ảnh thất bại cần Retry; không coi lỗi mạng là mất nội dung vĩnh viễn. Tổng game hình chỉ hứa trên pool đủ điều kiện; có mục chưa kiểm được thì ghi còn chờ, chưa chốt hoàn tất.

## 5. Cách triển khai đề xuất

Tách hai lớp, không kéo dài session hiện tại:

- **Chu kỳ của bộ**: ID, scope thư viện, mode/filter/direction chuẩn hóa, tên phạm vi snapshot, ngày bắt đầu/lần hoạt động cuối, danh sách mục nhẹ có identity/revision/order, trạng thái pending/reserved/done/deferred/unavailable, current session ID, version.
- **Lượt ngắn**: giữ snapshot câu hỏi/choices/feedback/attempt/SRS như hiện tại, tối đa 10; liên kết với cycle và vị trí mục trong chu kỳ. Counter/ngày là projection từ tiến trình/sự kiện idempotent, không tự tăng một biến ở component.

Đề xuất store/table chuyên dụng cho chu kỳ và mục tiến độ. Khi chốt thiết kế dữ liệu, chọn header + các mục/đoạn nhẹ để tránh ghi lại cả danh sách 5.000 mục mỗi câu; session chỉ snapshot 10 câu. Không nhét ledger vào localStorage, settings hoặc một session giả. Chưa chốt schema hay viết SQL ở plan này.

Luồng dữ liệu:

1. Resolve scope/filter → lấy toàn pool, áp dụng eligibility/aggregate hiện hành → tạo thứ tự ổn định của chu kỳ.
2. Khi mở game, tìm lượt dở thuộc chu kỳ trước. Nếu chưa có, reserve tối đa 10 mục pending và tạo session trong cùng transaction/CAS. Ảnh được chuẩn bị trước transaction; vào transaction kiểm lại revision/version để tránh lưu dữ liệu vừa stale.
3. Check/Next giữ cơ chế idempotent hiện tại; Next ghi session + trạng thái mục + hoạt động theo ngày atomic. Lưu lỗi thì UI giữ câu hiện tại và Retry, không tăng tiến độ giả.
4. Lượt hoàn thành → cấp đoạn tiếp khi người chơi bấm. Hai tab cùng máy dùng transaction/CAS và một active session cho cùng khóa chu kỳ, không rút hai bộ khác nhau từ cùng con trỏ.
5. Backup/restore có phiên bản tương thích, remap cycle/item/source refs đúng scope. Import chỉ nội dung không mang tiến độ của chủ khác. Lượt cũ vẫn resume bình thường, không ép ghép lịch sử random cũ thành một chu kỳ có bảo đảm.

Các vị trí dự kiến: `src/data/local/practice.ts`, store/schema local trong `database.ts`, module cycle mới, `archive.ts`, cloud contracts/transfer/reconcile/sync; hub/scope/history/results và `public/offline-games.js`. Nếu hỗ trợ shared phải cập nhật whitelist/projection/validation và quyền ghi tiến độ server; giữ nguồn nội dung chỉ đọc. SQL sau này cần skill Postgres trước khi viết.

### Giới hạn nhiều thiết bị phải nói rõ

Giữ session 10 câu **không đồng nghĩa** tự có cloud support cho cycle mới. Cần thêm đồng bộ header/mục/event, merge tiến độ không ghi đè, owner/library boundaries; A/B tiếp tục dùng tiến độ kho gốc theo ADR096, không tạo tiến độ người nhận riêng ngầm.

- Cùng máy/offline: có thể bảo đảm không cấp lại mục trong chu kỳ bằng IndexedDB transaction.
- Đổi thiết bị sau khi sync thành công: có thể tiếp tục từ checkpoint đã đồng bộ khi feature cycle sync được triển khai.
- Hai máy offline đồng thời: không thể hứa tuyệt đối không trùng khi cả hai chưa biết lượt bên kia. Merge phải giữ cả kết quả, độ phủ tính unique mục, không mất tiến trình.
- Nếu founder muốn không trùng tuyệt đối trên nhiều máy đang online: thêm server claim/version cho đoạn tiếp theo, xử lý lease/thu hồi và mất mạng. Đây là scope cao hơn, áp dụng cho cả hai hướng.

Đề xuất bản đầu bảo đảm cùng máy; account/shared sync phải được thiết kế, kiểm thử và ghi rõ trước khi release toàn bộ, không giới thiệu một checkpoint local như tính năng chơi tiếp trên mọi thiết bị.

## 6. Chia đợt thực hiện nếu được chọn

1. **Chốt luật và contract**: chọn hướng, ngày/cycle, tiến độ theo game, skip, phạm vi account/shared/Speaking. Cập nhật spec/ADR sau khi được chọn; vẽ luồng hub → game → kết quả → tiếp tục.
2. **Engine + lưu local**: cycle/pool/reserve/checkpoint/migration, regression không mất dữ liệu, revalidate content/media, legacy session và backup. Giữ giới hạn session 10.
3. **UI + offline**: một tiến độ chung cho bộ, một tiến độ cho lượt; Tiếp từ mới, resume, vòng mới, pending/save error/retry; parity offline fallback. Không cần thêm lựa chọn 10/20/50 ngay bản đầu.
4. **Account + shared**: sync/version/merge/backup/transfer/projection, tests ownership, A/B và hai thiết bị. Chỉ thêm server claim nếu lựa chọn yêu cầu tuyệt đối đa máy.
5. **Verify + nghiệm thu**: scoped logic/data/UI mobile+desktop, build khi đổi schema/cloud/API/PWA; device test riêng. Chưa hứa thời gian tuyệt đối trước khi chốt scope; account/shared là phần chi phí đáng kể ở cả hai hướng.

Mặc định đề xuất áp dụng engine cho các mode dùng PracticeRepository, với grammar đếm câu/form hợp lệ, không gọi là số từ. Speaking 5 từ chỉ đưa vào nếu founder muốn cùng scope; phải tích hợp riêng checkpoint audio/assessment, không tự đổi thành 10. Bản triển khai chưa hỗ trợ mode nào phải nói rõ, không để tile đó nhận lời hứa phủ hết.

## 7. Acceptance dự kiến

- Bộ 47 mục: 10/10/10/10/7; hợp các mục target ở các lượt mới bằng đúng pool snapshot hợp lệ, giao nhau rỗng trước khi hết; không lấp lượt cuối bằng từ cũ. Kiểm thêm pool 1/9/10/11 và pool lớn.
- Câu sai vẫn tiến độ đã làm; skip/deferred và retry chủ động không giả hoàn thành hoặc cộng đôi; distractor không ảnh hưởng coverage.
- Thoát/reload tại câu 23, kể cả sau Check trước Next: đúng bộ/game/chiều/filter và feedback; không nhân đôi attempt/SRS. Hai tab/double tap không reserve trùng hoặc mất item.
- Qua ngày vẫn đúng chu kỳ; thống kê ngày không reset bộ. Khóa phân biệt all/group/lesson/set, các game và direction; due/weak không đổi key sau từng đáp án.
- Xóa lượt, sửa/bỏ duyệt/xóa từ/ảnh, thêm từ mới, thiếu dữ liệu và lỗi ảnh có hành vi công khai; giữ kết quả đã làm, không silent truncate.
- Restore/legacy sessions, import content-only, account switch, A/B quyền nội dung/tiến độ giữ đúng boundary. Sync conflict/offline concurrent ghi rõ khả năng bảo đảm và giữ cả kết quả.
- Tải/kiểm media theo lượt nhỏ, không decode toàn kho mỗi Next. Đo lại trên pool lớn để không làm mất tối ưu mở game vừa có.

## 8. Lựa chọn founder

**A — Một lượt dài hết bộ:** cần trải nghiệm liên tục và một kết quả cuối bộ; chấp nhận phạm vi sửa contract/media lớn hơn.

**B — Mỗi lượt 10, có tiến độ toàn bộ và không tự lặp trước khi hết (khuyên chọn):** đáp ứng chơi hết bộ, tiếp tục qua nhiều ngày, giữ các lượt ngắn và kết quả quen thuộc.

Đề xuất đi kèm B: chu kỳ không reset theo ngày, tiến độ riêng từng game/phạm vi/chiều, skip để lại luyện sau, hết bộ mới chủ động bắt đầu vòng mới. Đã chọn B; triển khai theo ADR100. [Kết quả và giới hạn](../evaluations/game-coverage.md).

## Kiểm tra tài liệu

19/10: local links/whitespace của ba tài liệu đổi PASS; `git diff --check` không báo lỗi whitespace. `pnpm docs:check` bị chặn do shell đang dùng Node23.11.0 thay vì24.14.1; chạy trực tiếp `python3 scripts/validate_docs.py` báo đúng3link kết quả tạm đã hết hạn trong `body-part-photo-analysis-fix.md`, không báo lỗi link của plan/STATE/TASKS. Không sửa các tài liệu lịch sử đó; không chạy app tests/build cho task chỉ lập plan.


## Chốt triển khai ADR100

Pool immutable `practiceCycles`, session≤10 câu liên kết cycleId/cycleKey, coverage union từ answered-prefix cả tombstone; không store counter cạnh tranh. Local v6, archive/cloud/shared/SQL0013/offline fallback đã có integration. Scope selector hiện có giữ nguyên. Speaking5từ tách riêng theo mục6; không thêm server claim để hứa không trùng khi nhiều máy offline. [Evidence](../evaluations/game-coverage.md) là trạng thái triển khai/verification thật, thay các mô tả triển khai dự kiến ở trên.
