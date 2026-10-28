# Học ké cùng con: mở rộng từ và ngữ pháp lên B1–B2

Ngày: 29/10/2026. Trạng thái29/10: **đã triển khai/deploy, founder chấp nhận pilot và đã bổ sung300/300mục toàn kho;596gợi ý chờ duyệt**. [Evidence](evaluations/learning-extensions-b1-b2.md). Yêu cầu trực tiếp của founder; scope đến B2, chưa C1/C2. ADR110 ghi phạm vi, thiết kế dưới đây là đề xuất triển khai.

## 1. Kết quả founder sẽ dùng được

Trong Cài đặt bật **Hiện nội dung B1–B2** → mở một từ hoặc cấu trúc con đã học → bấm bung **Học thêm B1–B2** → thấy cách nói gần nghĩa, cụm từ tự nhiên và câu mở rộng để bố/mẹ học cùng chủ đề. Áp dụng cho cả thư viện đã có, từ gõ tay và bài chụp nhiều ảnh.

**Founder bổ sung29/10: tạo nội dung và hiển thị là hai việc độc lập.** B1/B2 vẫn được tạo khi thêm từ/ngữ pháp qua gõ tay hoặc ảnh, kể cả khi cấu hình đang ẩn. Mặc định cấu hình **Ẩn**; chỉ bật **Hiện** mới xuất hiện phần B1/B2, và phần này luôn thu gọn khi mới mở màn, bấm bung mới thấy nội dung. Tắt hiển thị không xóa dữ liệu hoặc hủy generation; bật lại dùng kết quả đã lưu, không tự gọi AI lại.

- Nội dung gốc vẫn là bản học của con; phần B1/B2 là nội dung bổ sung có thể xem, nghe, sửa, duyệt hoặc bỏ.
- Mỗi mức có tối đa hai gợi ý tốt trong bản đầu, không cố điền cho đủ. Phân biệt **gần nghĩa**, **cụm từ liên quan** và **mở rộng cách diễn đạt**.
- Mỗi gợi ý có nghĩa Việt, cách dùng, khác biệt với câu/từ gốc, hai cặp ví dụ English–Vietnamese. Ngữ pháp có công thức, điều kiện, ví dụ phân tích và lỗi/sửa lỗi.
- Khi bật hiển thị, có mục B1 và B2 riêng để bố/mẹ duyệt học thêm theo bài/nhóm/từ gốc. Khi ẩn, không hiện section, nút vào, badge hay gợi ý B1/B2 trên màn học/thêm/review để tránh con mất tập trung. Giữ navigation, Theme C, Nunito và trải nghiệm mặc định của trẻ.

## 2. Dữ liệu thật đã kiểm tra

Đã truy vấn **chỉ đọc** cloud, lọc theo owner của tài khoản founder chỉ định `trudyan141@gmail.com`, ngày 29/10/2026:

| Loại | Số bản ghi chưa xóa |
|---|---:|
| Từ/cụm từ (`vocabulary_entries`) | 185 |
| Nghĩa từ (`entry_senses`) | 249 |
| Ví dụ (`examples`) | 251 |
| Nội dung học bổ sung (`learning_content`) | 71 |
| Trong đó có tiêu đề ngữ pháp hoặc pattern | 51 |

Đã đọc danh sách từ, POS/nghĩa/ví dụ và các công thức/câu của nội dung bổ sung. Đây là inventory để lập kế hoạch, **chưa phải 249 bộ gợi ý đã sinh/kiểm chất lượng**. Số ngữ pháp trên là bản ghi lưu trữ; app có gom family, lọc approval và revision nên không đồng nghĩa 51 nhóm đang hiện. Chỉ biết dữ liệu đã sync lên cloud; không suy ra dữ liệu chưa sync ở điện thoại.

Chủ đề có thật: gia đình, đồ dùng học tập, động vật, cơ thể, màu/hình/số, thời tiết, mùa và cảm xúc. Cấu trúc có `It is + adjective`, `can + verb`, `Let's + verb`, `There are…`, `How many…`, `Who is this?`, `What is the weather like today?`, số ít/số nhiều và câu hiện tại đơn.

Các ranh giới cần giữ khi bổ sung:

- Có nhiều bản cùng headword nhưng nhãn nghĩa/nguồn khác nhau, ví dụ `happy`, `apple`, `cold`. Không gộp bằng AI hoặc xóa bản nguồn để làm sạch đợt này.
- `watch` đang là danh từ đồng hồ; không gợi ý `observe` theo nghĩa động từ. `bat` đang là gậy thể thao; không chuyển sang con dơi.
- Chưa có headword `like`, nhưng có trong sáu bản nghĩa qua câu ví dụ. Cần xử lý cả cách diễn đạt trong câu/ngữ pháp, không chỉ tra synonym của headword.
- Không có trường B1/B2 trong `Sense`, `Example`, `LearningContent` hay hợp đồng AI hiện tại. Cần mở rộng xuyên suốt lưu trữ, sync, backup và review; thêm prompt đơn thuần chưa đủ.

Không tạo/sửa tài khoản, ghi database, gọi AI cho dữ liệu tài khoản, điều khiển browser founder hoặc deploy trong bước lập kế hoạch này. Không lưu bản export riêng tư vào Git; dữ liệu đọc tạm được dọn sau khi viết plan.

## 3. Cách hiểu đúng “lên B1/B2”

Tách **mức của từ/cụm từ theo đúng nghĩa** khỏi **mức luyện diễn đạt của cả câu**. Một câu luyện B2 vẫn có nhiều từ A1; không gắn B2 lên mọi thành phần. CEFR là mô tả năng lực sử dụng ngôn ngữ; English Vocabulary Profile phân mức đến từng nghĩa, English Grammar Profile phân theo cách dùng/form/meaning.

`like → enjoy` là gợi ý đa dạng hóa diễn đạt hữu ích, nhưng nghĩa pleasure của `enjoy` được Cambridge xếp **A1**, nên không dùng nó làm bằng chứng “từ B1”. Dạy đúng `enjoy + noun / V-ing`, ví dụ tự soạn `I enjoy reading with my daughter.`, không `enjoy to read`.

`because it is interesting → because it gives me a chance to…` thêm một lý do cụ thể, không bảo toàn nguyên nghĩa. Hiển thị là **mở rộng ý**, với câu hoàn chỉnh, chẳng hạn `I enjoy reading with my daughter because it gives me a chance to spend time with her.` Không tự coi ý mới là dữ kiện có trong ảnh/câu gốc.

### Ví dụ giao diện mong muốn

Các câu dưới đây là ví dụ tự soạn cho thiết kế; cột B1/B2 là **mục tiêu luyện tập dự kiến**, chưa phải câu đã được đánh giá CEFR độc lập.

| Gốc / chủ đề | Hướng luyện B1 | Hướng luyện B2 | Cần giải thích |
|---|---|---|---|
| `happy` / cảm xúc | `I am pleased with my progress.` | `Learning with my daughter gives me a sense of achievement.` | Câu sau diễn tả thành tựu, không thay `happy` ở mọi chỗ. |
| `It is cold.` / thời tiết | `It is cold, so we should wear warm clothes.` | `Despite the cold weather, we decided to go for a walk.` | Thêm hệ quả hoặc nhượng bộ; không gọi là synonym. |
| `We can eat ice cream.` / khả năng | `We will be able to make ice cream at home.` | `Making ice cream together allows us to spend more time as a family.` | Thay thì/nghĩa phải ghi rõ; không tự thay `can` xin phép bằng `be able to`. |
| `apple` / đồ ăn | `I usually have an apple as a snack.` | `Although apples are convenient snacks, I try to eat a variety of fruit.` | Không có “táo B2” bắt buộc; mở rộng bằng collocation/câu cùng chủ đề. |

Nếu không có gợi ý phù hợp: trả trạng thái **Chưa có gợi ý phù hợp**. Nếu nguồn/nghĩa chưa rõ: **Cần bổ sung ngữ cảnh**. Không đánh đồng lỗi mạng với không có gợi ý.

### Kiểm chứng và nguồn

- Ưu tiên đối chiếu nghĩa/POS/cách dùng và CEFR từ nguồn có quyền sử dụng. Lưu URL, nghĩa/construction đối chiếu, thời điểm và trạng thái kiểm chứng.
- Nếu mức chỉ do AI đề xuất, hiển thị **Gợi ý luyện B1/B2 — chưa đối chiếu mức**. Người dùng bấm duyệt không tự biến mức hoặc IPA thành verified.
- Không sao chép hàng loạt định nghĩa/ví dụ/wordlist khi chưa rõ giấy phép/API. Ví dụ app tự tạo, có attribution AI/user rõ; nguồn tham khảo không biến thành giấy phép tái phân phối.
- Không suy trình độ cá nhân hoặc cam kết đạt B1/B2 từ việc đọc/chơi các mục này.

Nguồn đã đối chiếu khi lập plan: [Cambridge: enjoy, nghĩa pleasure A1](https://dictionary.cambridge.org/us/dictionary/english/enjoy?a=british), [English Vocabulary Profile](https://englishprofile.org/?menu=english-vocabulary-profile), [English Grammar Profile và điều khoản sử dụng](https://englishprofile.org/?menu=english-grammar-profile), [Council of Europe: CEFR descriptors](https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-descriptors).

## 4. Thiết kế dữ liệu đề xuất

Tạo collection riêng cho **learning extensions**, không chèn từ B1/B2 vào danh sách từ gốc và không nhét vào ghi chú tự do. Bản đầu dùng chung cơ chế cho từ và ngữ pháp; schema cụ thể chốt trong implementation.

Một extension có các nhóm trường:

| Nhóm | Nội dung |
|---|---|
| Liên kết | Scope/owner/library; loại đích `sense` hoặc `learningContent`; ID đích; bản chụp text/POS/nghĩa/form cần thiết; hash nội dung nguồn. |
| Mức | `targetLevel: B1 \| B2`; mức tra được của từ/nghĩa/construction nếu có; trạng thái chưa đối chiếu/đã có bằng chứng nguồn. |
| Nội dung | Quan hệ near-synonym/collocation/reformulation/idea-expansion; từ/cụm/công thức; nghĩa VI; giải thích cách dùng/khác biệt; hai ví dụ và bản dịch; lỗi/sửa lỗi cho grammar. |
| Nguồn | AI/user/reference; model/prompt/schema version; nguồn đối chiếu và ngày; không chứa email/key hay full ảnh. |
| Duyệt và an toàn sửa | Draft/approved/rejected/stale; version/CAS; revision đã duyệt; đánh dấu trường user sửa; timestamps/tombstone. |

Đề xuất bảng cloud tương ứng có RLS owner/library, quan hệ đích và unique key xác định theo parent + level + relation + exact candidate identity. Không đưa source hash vào key để mỗi sửa nguồn lại đẻ bản trùng; hash dùng nhận diện stale. Các proposal mới không ghi đè bản người dùng sửa/đã duyệt. Ràng buộc đích cùng owner/library ở server/database, không chỉ client.

Tích hợp bắt buộc:

- IndexedDB migration additive giữ dữ liệu cũ; database cũ mở được khi chưa có extension.
- Cloud entity/mapping/validation/realtime/change feed; client ID và remote ID đúng cơ chế hiện có; không viết trực tiếp chỉ một cột rồi bỏ qua sync log/client payload.
- Archive/backup version tương thích file cũ, export/import giữ extension; transfer/copy remap parent IDs; deterministic dedup và user overrides không mất.
- Chia sẻ chỉ đọc xem extension **đã duyệt**, giữ quyền ghi của chủ kho; guest/shared/account không lẫn. Copy content không mang lịch sử học của nguồn.
- Xóa parent thì extension không còn hiện/học; tombstone không hồi sinh qua sync/restore/copy. Xóa lesson vẫn giữ từ/ngữ pháp và extension còn được thư viện giữ theo ADR076.
- Thay text/POS/nghĩa/công thức liên quan làm extension stale, cần xem lại; thay ảnh không tự làm mọi extension mất hiệu lực. Kiểm hash trường liên quan đồng thời CAS khi ghi.
- Tái dùng audio/IPA: English → IPA toàn đúng câu → dịch; không chắc IPA thì null, vẫn nghe được. Sửa câu xóa IPA/hint cũ.

## 5. Trải nghiệm trong app

### Thư viện và chi tiết

- Cài đặt có công tắc **Hiện nội dung B1–B2**, mặc định tắt. Đây chỉ là cấu hình hiển thị; không dùng làm điều kiện tạo/lưu nội dung nâng cao. Lưu như setting nhỏ theo browser + scope thư viện, giữ qua reload; thiết bị khác mặc định ẩn để không vô tình bật trên máy con. Không tự đồng bộ lựa chọn hiển thị này qua tài khoản.
- Khi công tắc bật, trong chi tiết từ/ngữ pháp có disclosure **Học thêm B1–B2**. Mỗi lần mở màn/reload/bật lại đều thu gọn; chỉ thao tác bung rõ ràng mới hiện nội dung. Tắt công tắc đóng phần đang mở và ẩn mọi entry B1/B2; không xóa dữ liệu hoặc đổi mức mặc định của kho.
- Người lớn mở danh sách học thêm từ thư viện, chọn B1 hoặc B2, có scope tất cả/bài/nhóm và link quay về từ/cấu trúc gốc. Không thêm parent gate hay ép mọi người chọn hồ sơ mới.
- Thẻ hiện câu gốc và cách diễn đạt mới, nhãn quan hệ, mức đã/chưa đối chiếu, nghĩa/cách dùng ngắn, nghe và ví dụ. Nguồn và giải thích dài thu gọn.
- Sửa/duyệt/bỏ có trạng thái lưu thật tại mục và nút; lỗi giữ nội dung, có thử lại. Tái dùng Fox loading và reduced motion.
- Mở/xem/nghe không ghi điểm/SRS của con. Bản đầu cung cấp học qua nội dung; game mới, SRS riêng của người lớn và profile mới nằm ngoài scope. Không tái dùng chung sense ID để giả vờ có tiến độ riêng.

### Thêm từ bằng gõ tay

1. Tra từ → chọn đúng nghĩa/POS như hiện tại.
2. Tự tạo gợi ý B1–B2 cho nghĩa đã chọn dù cấu hình hiển thị đang tắt; không yêu cầu bật công tắc để chạy AI. Không infer tuổi từ tài khoản/ảnh.
3. Dùng cùng service/contract mở rộng, dựa trên sense đã chọn. Đổi sense trong lúc chờ khiến kết quả cũ bị bỏ qua, không đính nhầm. Bật/tắt hiển thị không phát sinh request mới hay hủy request đang chạy.
4. Một nút Save chung lưu phần gốc và các extension hợp lệ. Khi đang ẩn hoặc chưa xem duyệt, extension được giữ ở trạng thái draft/pending để bố/mẹ duyệt sau; không tự approved. Khi bật hiển thị, phần review B1/B2 vẫn thu gọn, bung mới sửa/bỏ/duyệt được. Chỉ bản đã duyệt mới vào danh sách học thêm; draft chỉ xuất hiện ở review sau khi bật cấu hình.
5. Lỗi AI/quota hoặc chọn bỏ qua vẫn cho lưu nội dung gốc hợp lệ; thông báo rõ phần học thêm chưa tạo. Có thể bổ sung sau, không ép tra lại/ngăn lưu từ.

### Chụp một/nhiều ảnh rồi thêm từ/ngữ pháp

Giữ ADR082: preview mọi ảnh → scan-all → exact dedup toàn bài, giữ sense/source → enrich cơ bản → mở rộng B1/B2 cho các mục đã xác định → một review → một transaction Save. Nội dung B1/B2 là generated supplement; không giả evidence có trên ảnh.

Stage B1/B2 luôn được thực hiện khi tạo nội dung dù đang ẩn. Công tắc chỉ quyết định có hiện phần review hay không; khi bật phần review vẫn thu gọn. Khi ẩn, Save giữ các gợi ý hợp lệ như draft/pending cùng dữ liệu gốc, không bắt trẻ xem hoặc duyệt phần nâng cao. Tiến độ/lỗi không chặn của stage này nằm trong khu công cụ ở Cài đặt khi bị ẩn; không chèn badge/toast vào màn của con. AI tắt/thiếu mạng/quota vẫn theo cơ chế lỗi/nháp/tiếp tục bên dưới, không bịa nội dung đã tạo.

- Stage mở rộng có checkpoint riêng theo chunk và source/model/mode/level/prompt snapshot, phục hồi không gọi lại chunk đã hợp lệ.
- Scan chưa xong không mở rộng sớm; thay/crop/xóa ảnh hoặc đổi mode/level làm checkpoint tương ứng mất hiệu lực. Giữ nguyên các checkpoint cơ bản còn đúng nguồn.
- Từ trùng đã có trong thư viện chỉ bổ sung phần mở rộng còn thiếu theo nghĩa/revision hiện tại; không overwrite user edits và không tạo lại từ gốc.
- Output quá giới hạn chia chunk rõ; không cắt im lặng. Bản đầu tối đa hai gợi ý/mức; nếu phải giảm output thì báo trạng thái, không coi JSON bị cụt là hoàn tất.
- Cancel/timeout/offline/quota dừng an toàn, giữ nháp. Màn review cho lưu phần gốc và các gợi ý thành công được chọn; phần chưa xử lý hiện rõ để bổ sung sau.

## 6. Bổ sung toàn bộ kho hiện có

Chỉ bắt đầu ghi khi triển khai xong contract/save/sync/review và kiểm pilot. Không sửa trực tiếp 249 bản nghĩa bằng một lệnh không thể review.

1. Đồng bộ bản mới nhất trong app; tạo backup đầy đủ phạm vi tài khoản, giữ riêng tư ngoài Git. Inventory lại số lượng, approval, revision và parent đang hoạt động; số ngày 29/10 chỉ là baseline.
2. Tạo job có manifest ID/revision/hash của toàn bộ nghĩa và grammar đủ điều kiện. Giữ parent IDs và các liên kết bài/nhóm; mục thiếu/nghĩa mơ hồ vào hàng cần kiểm tra, không tự đoán.
3. Pilot **20 mục tổng cộng**: 12 nghĩa từ + 8 bản grammar đại diện. Bao gồm cảm xúc, thời tiết, danh từ không có synonym cao hơn, `watch` danh từ, `bat` gậy, `can` và một bản grammar nhiều forms. Kiểm hai mức và kiểm ngôn ngữ thủ công trước mở rộng.
4. Job toàn kho chạy chunk nhỏ mặc định **4 parent/lần**, **1 request tại một thời điểm**, không bật thêm provider/fallback trả phí. Điều chỉnh output theo số candidate, không để một response khổng lồ cho cả kho.
5. Chỉ gửi text/POS/sense/form/ví dụ cần thiết; không gửi email, ID xác thực, full thư viện hoặc ảnh gốc sang AI. Tái dùng key/model/quota/cancel của app; không thêm env Vercel.
6. Lưu proposal/checkpoint có thể resume, báo tổng/đã xong/cần kiểm/lỗi/không có gợi ý; retry chỉ đúng chunk lỗi. Network/key/quota không bị coi là JSON lỗi để spam repair.
7. Founder xem trước theo B1/B2, sửa/bỏ/chọn và lưu các mục được duyệt. UI có thể duyệt hàng loạt các mục đã chọn sau khi xem; không tự duyệt toàn job nền. Lưu theo chunk có CAS/receipt, lỗi giữa chừng báo đúng phần đã lưu, tiếp tục không nhân bản.
8. Chạy lại cùng job/input không tăng số extension. Parent đổi/xóa trong lúc chạy bị skip/conflict/stale rõ, không áp kết quả cũ. Rollback theo job chỉ gỡ extension chưa bị người dùng sửa, không restore đè cả kho.

Mỗi parent hợp lệ được xem xét cả B1 và B2, nhưng nghiệm thu **không đòi 249 × 2 gợi ý**: có thể không có synonym phù hợp, chỉ có cách diễn đạt, thiếu ngữ cảnh hoặc chưa đối chiếu mức. Tất cả parent phải có kết quả xử lý hoặc trạng thái lý do rõ, không mất mục im lặng.

## 7. Các đợt triển khai và điều kiện xong

| Đợt | Công việc | Điều kiện hoàn tất |
|---|---|---|
| 1. Hợp đồng + nền dữ liệu | Content policy, extension schema, parser, local/cloud/backup/copy/share, migration additive. | Roundtrip giữ dữ liệu cũ; quyền owner/shared đúng; exact dedup, CAS, tombstone và user edits được bảo vệ. |
| 2. AI + màn học thêm | Service dùng chung, review/edit/list/detail B1/B2, audio/IPA, error/cancel. | 20 mục pilot đúng sense/form; có ví dụ/dịch/cách dùng; không bịa mức/nguồn; đọc/nghe không đổi SRS của con. |
| 3. Thêm tay + ảnh | Nối service vào hai đường thêm; stage/checkpoint ảnh; Save chung; setting Ẩn/Hiện tách generation. | Đang ẩn vẫn tạo/lưu draft; bật mới hiện section thu gọn; bung mới thấy; toggle không gọi AI lại; đổi nghĩa không nhận kết quả cũ; quota vẫn lưu được phần gốc; reload/retry không mất nháp/nhân mục. |
| 4. Toàn kho + phát hành | Backup, manifest, backfill có review, đồng bộ/reload/offline và deploy theo workflow. | Mọi parent của đúng tài khoản có trạng thái rõ; bản đã duyệt hiện đúng mức trên thiết bị khác; không overwrite bản cũ hoặc đụng tài khoản khác. |

Đợt 1 là dependency của các đợt sau; pilot qua rồi mới backfill toàn kho. Hoàn thiện cả thêm tay và ảnh trước báo hoàn tất mục tiêu. Chưa cam kết nguồn dữ liệu CEFR/API được cấp phép hay chất lượng liveAI trước khi có bằng chứng.

## 8. Kiểm thử và nghiệm thu

- Content review: đúng nghĩa/POS; gần nghĩa có giới hạn; mở rộng ý ghi rõ; collocation tự nhiên; grammar slot hợp lệ; B1/B2 không chỉ là câu dài hơn. Nguồn/mức/IPA không được AI tự nhận verified.
- Regression dữ liệu: save/retry idempotent, giữ nghĩa/POS khác, preserve user edit, source edit/delete lúc generate, transaction rollback, archive cũ/mới, transfer/copy và sync không làm mất extension hay dữ liệu gốc.
- Boundary: guest/account/shared read-only, session/account switch, cache/offline và owner/library mismatch; tài khoản khác không đọc/ghi được. Shared recipient không duyệt lại content nguồn.
- AI: malformed/truncated, timeout, cancel, quota/key failure, một mức không có gợi ý, checkpoint stale/đổi ảnh, prompt injection trong dữ liệu nguồn.
- UI cô lập mobile360/desktop1280: mặc định ẩn toàn bộ entry B1/B2; đang ẩn thêm tay/ảnh vẫn tạo và Save giữ draft; bật chỉ hiện section thu gọn, bung mới thấy; tắt lúc đang mở phải ẩn ngay; reload giữ setting nhưng đóng disclosure; thiết bị/scope khác không kế thừa bật; toggle không gọi AI lại/hủy job/xóa data/tự duyệt. Kiểm nghe đúng câu, review/sửa/Save, lỗi rồi thử lại, đổi sense lúc chờ, reload nháp, nhiều ảnh. Không dùng browser thật founder.
- Lint/typecheck, behavior tests đúng vùng đổi; SQL fixture cô lập khi có schema/RLS. Build cuối khi đổi API/schema integration/PWA và cần production preview. LiveAI pilot, hosted sync và thiết bị thật báo riêng, không dùng mock làm bằng chứng chất lượng.
- Khi chạy cloud tests dùng fixture riêng và dọn đúng fixture. Backfill thật chỉ đụng extension thuộc tài khoản được giao; không dùng dữ liệu thật làm fixture phá/xóa để thử.

## 9. Điểm nối code khi bắt đầu

| Boundary | File hiện có |
|---|---|
| Từ/nghĩa/ví dụ và repository | `src/data/local/types.ts`, `src/data/local/repository.ts`, `src/data/local/database.ts` |
| Grammar/content/revision | `src/data/local/content.ts`, `src/data/local/learning-library.ts` |
| Thêm tay/AI ví dụ | `src/components/features/add-word.tsx`, `src/lib/ai/word-examples.ts` |
| Ảnh/AI/checkpoint/review | `src/lib/ai/worksheet-multi.ts`, `src/lib/ai/worksheet-learning.ts`, `src/lib/ai/worksheet-recovery.ts`, `src/data/local/worksheet-batch.ts`, `src/components/features/capture-batch.tsx` |
| Chi tiết/edit | `src/components/features/word-detail.tsx`, `src/components/features/word-editor.tsx`, `src/components/features/grammar-card.tsx` |
| Cloud/backup/copy/share | `src/lib/cloud/contracts.ts`, `src/server/cloud/map.ts`, `src/data/local/archive.ts`, `src/data/cloud/transfer.ts`, `src/data/cloud/sharing.ts`; tìm thêm snapshot/import/allowlist bằng `rg` khi implement |

**Bước tiếp theo duy nhất:** founder mở phần B1/B2 đã bổ sung để xem/sửa/duyệt. Runtime/SQL0015/deployment đã có; full backfill300mục hoàn tất, xem evidence cho coverage/invariants và giới hạn chất lượng.
