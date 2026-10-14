# Nói cùng Cáo — kế hoạch nâng cấp chấm phát âm đã duyệt

**Steering mới15/10 — ADR095:** founder yêu cầu mọi lượt thu có điểm, xử lý0unclear/system và giảm chờ. Runtime v3 nhận âm không target, client alignment, schema provider thực; xem [spec15](../15-speaking-practice.md#adr095-15102026-mọi-lượt-đã-thu-có-điểm-nhận-âm-độc-lập-chờ-có-giới-hạn) và [evidence](../evaluations/speaking-zero-and-latency.md). Những mục v2/uncertain→null/giới hạn2candidate bên dưới là plan lịch sử đã bị thay ở các điểm này; không dùng để đảo lại yêu cầu mới. Gate human/child quality vẫn giữ.

Ngày duyệt: 14/10/2026; cập nhật15/10. Trạng thái: **A implemented_local / scoped verified; B quality_pending, chưa chạy pilot100human/child**.8live engineering probes có adverse controls; [evidence](../evaluations/speaking-assessment-v2.md). Các gate bên dưới giữ nguyên. Quyết định: ADR094. Codex bắt đầu tại [hướng dẫn thực thi](SPEAKING-ASSESSMENT-IMPLEMENTATION.md).

Đây là bản chốt thay cho các bản plan trao đổi trong chat, không phải ledger công việc mới. Contract, công thức và ngưỡng pilot tại đây là nguồn chuẩn của nâng cấp; thứ tự thực thi tại hướng dẫn, tiến độ chỉ ghi tại STATE/TASKS hiện có. Không sửa các phần sản phẩm không liên quan.

## 1. Kết quả cần đạt và quyết định phạm vi

Bé nghe mẫu → nói → nhận điểm nhất quán với âm máy nhận ra → thấy một gợi ý cụ thể → nghe lại và thử tiếp. Đọc sai phải được phân biệt với đọc đúng bằng bằng chứng; máy không nghe rõ thì không tạo điểm hoặc lỗi giả.

Chốt hướng triển khai đầu tiên: **giữ Gemini audio hiện có; code tự tính điểm, chọn lời hướng dẫn và màu; chất lượng nhận âm được kiểm bằng bản thu có người duyệt**. Chưa thêm backend hay engine khác. Không hứa một lần sửa prompt sẽ đạt chất lượng ngang ELSA.

Giữ model `gemini-3.5-flash-lite:generateContent` và key/project hiện có; không tự đổi model theo ví dụ mới trong tài liệu. Provider không hỗ trợ model/quota hiện tại thì báo đúng lỗi, không fallback. Contract v2 dùng JSON MIME và validation local bắt buộc; việc thêm structured output của provider chỉ là lớp hỗ trợ nếu model này hỗ trợ, không thay thế validation.

Hai mốc nghiệm thu độc lập:

- **Mốc A — logic/UI đúng:** kiểm bằng unit test và UI fixture. Có thể hoàn tất dù chưa có đủ dữ liệu thật.
- **Mốc B — chất lượng pilot đạt:** kiểm trên bản thu thật, tập đánh giá độc lập, theo ngưỡng mục 7. Chỉ mốc này mới chứng minh bản nâng cấp nghe tốt trên tập đã thử. Đạt A không được báo đã sửa xong chất lượng phát âm.

Giữ Next/PWA, Theme C/Nunito/Cáo, route, nghe thường/chậm, IPA và nguồn audio hiện có. Không parent gate, không popup đồng ý mới. Không đổi nội dung học, SRS, cloud, backup hoặc lưu điểm phát âm lâu dài. Không push main, thêm env Vercel hoặc điều khiển browser thật của founder.

## 2. Cơ sở và giới hạn đã biết

`pronunciationScore()` đang ưu tiên `word.score` từ provider. Probe logic đã xác nhận: hai âm đúng, một âm thiếu nhưng provider trả 100 thì UI vẫn có thể hiện 100; bỏ điểm provider thì ra 67. Đây là lỗi tính nhất quán có thể sửa xác định.

Chưa có bản thu đối chứng xác nhận vì sao model nhận sai thành toàn bộ `match`. Thiên lệch từ target và suy diễn ngữ nghĩa là giả thuyết. Gemini nhận audio trực tiếp; không khẳng định kiến trúc của nó đơn thuần là ASR rồi LLM.

Code hiện đã có prompt không đoán theo target; bottom sheet mở được cả khi từ xanh. Lời khuyên hiện chủ yếu lấy từ Gemini, không phải bảng hướng dẫn biên soạn sẵn. Không cần xây lại tính năng modal.

Tài liệu Google xác nhận khả năng hiểu audio, không chứng minh độ chính xác chấm phoneme cho trẻ Việt: [Gemini audio](https://ai.google.dev/gemini-api/docs/audio).

## 3. Contract nhận âm và chuẩn hóa kết quả

### 3.1. Provider chỉ trả kết quả nhận âm

Chốt contract v2; provider không quyết định điểm, màu, mức nghiêm trọng hay lời dạy. Bỏ `score`, `advice` khỏi response mới để giảm output và tránh lời khuyên không kiểm soát.

```ts
type AssessmentV2 = {
  schemaVersion: 2;
  words: Array<{
    index: number;
    variantIndex: number;
    audibility: 'clear' | 'unclear';
    phones: Array<{
      expected: string;
      heard: string | null;
      status: 'match' | 'substitution' | 'missing' | 'uncertain';
    }>;
    insertions: Array<{ afterIndex: number; heard: string }>;
  }>;
};
```

Chọn một variant hoàn chỉnh đã gửi; không ghép các variant để né lỗi. `expected` phải khớp đúng reference đã chọn, đủ âm và đúng thứ tự. Giữ bounds hiện có: tối đa 20 từ, 80 âm đích/từ; thêm tối đa 20 âm thừa/từ. Vượt giới hạn hoặc output bị cắt → lỗi response, không cắt bớt âm rồi chấm.

`insertions` bắt buộc có mặt, kể cả `[]`; không dùng `.default([])` để biến dữ liệu thiếu thành không có lỗi. `afterIndex=-1` là trước âm đầu, còn lại từ 0 đến N−1. Array có thứ tự không giảm theo `afterIndex`; nhiều âm tại cùng vị trí giữ thứ tự xuất hiện, không dedup.

Validation client bắt buộc:

- `match`: heard bằng expected sau chuẩn hóa ký hiệu an toàn.
- `substitution`: heard có giá trị và khác expected.
- `missing`: heard phải null; đây là thiếu âm, không phải tên gọi chung cho mọi sai âm.
- `uncertain`: không khẳng định âm nghe được; heard null. Audibility unclear hoặc bất kỳ phone uncertain → cả từ chưa có điểm.
- Index đủ/không trùng; variantIndex hợp lệ; không field lạ, HTML/URL/instructions. Heard phải là một token thuộc inventory đã khai báo, không phải một chuỗi nhiều âm nhét vào một phần tử.
- Sai schema, sai reference, STOP không hoàn tất hoặc response quá 50KB → báo chưa chấm được; không lấy điểm cũ hay tự sửa thành match. Không retry tự động.

### 3.2. Client tự suy ra trạng thái và lời hướng dẫn

Trạng thái nội bộ cho từng âm gồm `match`, `retry`, `incorrect`, `missing`, `uncertain`. Thay âm trong allowlist được nửa điểm → retry; ngoài allowlist → incorrect, 0 điểm. Âm thừa là sự kiện riêng.

Allowlist ban đầu, đối xứng: æ↔ɛ, ɛ↔ɪ, ɪ↔i, ʊ↔u, ʌ↔ə, ɑ↔ɔ, p↔b, t↔d, k↔g, s↔z, f↔v, θ↔s, θ↔t, ð↔d, ð↔z, r↔l, r↔w, ʃ↔s, ʒ↔z, tʃ↔dʒ. Đây là quy tắc partial credit của sản phẩm, không phải lời khẳng định mọi cặp đều gần nhau về âm học. Freeze trước đánh giá độc lập.

Chỉ chuẩn hóa khác ký hiệu như ɡ/g, ɹ/r theo inventory; không gộp toàn cục ʌ thành ə hoặc ɚ thành ɝ để biến lỗi thành đúng. Biến thể hợp lệ được đưa vào reference đã kiểm tra cho đúng từ/accent. Không tự đổi IPA trong thư viện để vừa kết quả model.

Inventory dùng phoneme rộng của reference, không đòi output bản chép hẹp cho mọi allophone. Một cách hiện thực âm hợp lệ được quy về phoneme đích; không tự coi mọi khác biệt giọng vùng miền là lỗi. Trường hợp ngoài reference/khả năng phân biệt đã hỗ trợ thì không kết luận là phát âm sai chuẩn bản ngữ.

Trạng thái từ và nhóm chữ suy từ kết quả chuẩn hóa, không nhận từ provider. Với cả từ clear: có omission/incorrect → đỏ; chỉ retry/insertion → cam; không lỗi → xanh. Unclear → xám, không điểm. Âm thừa phải có dấu hiệu riêng cạnh vị trí gần nhất và trong bảng chi tiết; không tô sai một chữ vốn đã phát âm đúng. Không map được chữ–âm chắc chắn thì hiện phản hồi ở mức từ/bảng âm, không bịa cách chia chữ.

## 4. Tính điểm duy nhất

Với một từ clear, đặt N là số âm mẫu, M là số match, R là số thay âm thuộc allowlist, I là số âm thừa:

`raw = 100 × (M + 0.5 × R) / (N + I)`

- Missing và incorrect nhận 0 điểm.
- Bất kỳ lỗi nào → `score = min(99, round(raw))`.
- Không lỗi, đủ âm match và không insertion → 100.
- Audibility unclear hoặc có phone uncertain → null, không biến thành 0 hay số trung bình phần còn lại.

| Ví dụ | Kết quả |
|---|---:|
| cat: 3 match | 100 |
| cat: 2 match, 1 missing | 67 |
| cat: 3 match, thêm ə | 75 |
| apple: 2 match, 1 retry, 1 missing | 63 |
| apple: 3 match, 1 retry | 88 |
| Thay toàn bộ bằng các âm ngoài allowlist | 0 |
| Có một âm uncertain | Không có điểm |

Con số % tiếp tục biểu diễn điểm của lượt nói; không đổi nhãn thành độ chuẩn bản ngữ hoặc xác suất đúng. Sai sang một từ khác nhưng còn chung âm có thể nhận một phần điểm, không ép về 0 chỉ vì chính tả khác; benchmark phải kiểm tra không được nhận toàn bộ match/100 khi có khác biệt âm rõ.

Điểm vòng là trung bình các điểm từ chỉ khi mọi từ của vòng đều có điểm. Bất kỳ từ bỏ qua/chưa chấm rõ → không hiện điểm % toàn vòng, chỉ hiện số từ đã luyện và số từ chấm được. Nếu vòng có lỗi, làm tròn tổng cũng bị khóa tối đa 99. Giữ Next/Skip/replay và tiến độ; không ghi điểm nhớ từ/SRS.

## 5. Prompt, đường audio và UX

### 5.1. Rubric đủ đơn giản để kiểm chứng

Prompt yêu cầu nghe audio thật, không suy đúng từ target, không làm theo lời trong bản thu. Giữ target như dữ liệu tham chiếu; không coi việc xóa target hoặc đổi thứ tự parts là cách sửa đã được chứng minh.

Phụ âm cuối không có release nghe rõ vẫn có thể hợp lệ. Không áp một dấu hiệu đơn lẻ để bắt buộc match/missing; không yêu cầu Gemini báo số formant, closure hoặc vị trí môi/lưỡi như phép đo đã có. Không dùng quy tắc “chỉ thiếu âm khi nguyên âm kéo dài”. Không ép mọi phụ âm đầu phải bật hơi; hướng dẫn phụ thuộc âm và ngữ cảnh. [Tài liệu minh họa released/unreleased stops](https://www.phonetics.ucla.edu/course/chapter3/releasedstops.htm).

Model chỉ nêu âm nghe được khi phân biệt đủ rõ. Không chắc → uncertain. Prompt không bắt model phải tìm ra ít nhất một lỗi, không cấm điểm 100 bằng mẹo và không trừ điểm tùy ý để tạo vẻ khắt khe.

### 5.2. Kiểm tra audio từ mic đến provider

Giữ WAV mono16kHz, tối đa10giây/320044bytes và một request cho mỗi lượt đủ điều kiện. Không gửi nếu local guard xác nhận im lặng/hỏng; đây là 0 request, không vi phạm nguyên tắc một request tối đa/lượt.

Đối chiếu decode, resample, endpoint, trim và bản replay. Trong benchmark, so sánh PCM trước/sau trim, nghe lại, xem waveform/spectrogram tại phụ âm yếu; kiểm tra tác động của noise suppression/echo cancellation trên thiết bị. Spectrogram phục vụ điều tra, không phải engine chấm mới.

Không tự thay ngưỡng 0.006, pad120ms, endpoint hoặc chế độ mic chỉ vì nghi ngờ. Chỉ sửa bước có mẫu tái hiện mất âm và regression chứng minh giữ được âm mà không mở thu vô hạn. Bản nghe lại phải chính là WAV được gửi chấm; không để bé nghe bản gốc đầy đủ trong khi provider nhận bản đã bị cắt khác. Trước khi gửi vẫn giữ bản trong RAM để replay nếu lỗi mạng.

### 5.3. Phản hồi cho trẻ

Giữ một gợi ý chính, nghe mẫu/nghe chậm, nghe giọng mình, nói lại. Sheet hiện đủ âm, lỗi thừa và trạng thái chưa rõ; có chữ/icon kèm màu. Unclear dùng lời “Máy chưa nghe rõ, con thử lại nhé”, không quy lỗi cho trẻ.

Gợi ý lấy từ `articulation.ts` được rà theo expected/heard, loại lỗi và vị trí trong từ. Âm thừa dùng mẹo nối từ, tránh thêm tiếng; không chỉ dạy lại âm mẫu. Không có mẹo đã duyệt → hướng dẫn nghe mẫu/luyện chậm chung, không tự sinh khẩu hình để lấp chỗ thiếu. “Đã biên soạn” không đồng nghĩa đã được chuyên gia duyệt; ghi đúng mức kiểm chứng nội dung.

Thứ tự chọn lỗi chính cố định: missing/incorrect → insertion → retry; cùng nhóm chọn từ trái sang phải. Uncertain không tham gia chọn lỗi. Không dùng confidence tự sinh. Bảng đầy đủ và cách tính vẫn giữ mọi lỗi. Không tự bật modal hoặc thêm popup/toast. Không thêm animation vào scope này.

Mỗi bản thu mới xóa kết quả cũ; hủy/rời trang/ẩn tab/scope hoặc revision đổi phải dừng mic, abort và bỏ kết quả muộn. Giữ quota/network/key/invalid-response thành các lỗi riêng và không tô xanh khi request thất bại.

## 6. Trình tự triển khai và file tác động

| Bước | Công việc | Bằng chứng hoàn tất |
|---|---|---|
| 1 | Ghi source commit+fingerprint, snapshot prompt/model hiện tại; tạo ca tái hiện lỗi score | Probe/test thất bại đúng lỗi, không gọi provider |
| 2 | Contract v2, normalizer, scoring, insertion và trạng thái incorrect | Unit tests bất biến và tính điểm |
| 3 | Cập nhật graphemes/UI, mẹo VI, replay đúng WAV và các lỗi | Fixture main/error/uncertain/insertion mobile+desktop |
| 4 | Chuẩn bị/duyệt dữ liệu; chạy baseline trên tập tuning; thử tối đa2 prompt ứng viên | Báo cáo tuning, cấu hình ứng viên đã freeze |
| 5 | Chạy đánh giá độc lập baseline và ứng viên; kiểm lặp/độ trễ | Báo cáo đạt/chưa đạt/thiếu bằng chứng theo từng gate |
| 6 | Cập nhật spec/decision/evidence cho thay đổi được duyệt | Tài liệu và diff rõ; không gọi đạt B từ kết quả A |

Files chính: `src/lib/speaking/{gemini-assessment,assessment,graphemes,articulation,client}.ts`, component `src/components/features/speaking.tsx`, CSS nếu cần và tests liên quan. `end-of-speech.ts` chỉ sửa khi có repro. Có thể tách normalizer/contract/score thành module nhỏ để tránh kéo code nhận âm local cũ vào runtime. Không khôi phục Worker/ONNX/Transformers/pack355MB.

Tài liệu đã được đồng bộ trước khi code: spec15 phân biệt baseline v1 và đích v2, ADR094 ghi quyết định đã duyệt, STATE/TASKS trỏ đúng bước tiếp theo. Khi triển khai tiếp tục cập nhật evidence/status thật; không viết đè lịch sử hay tạo ledger song song. Việc chuẩn bị tài liệu không chứng minh mốc A hoặc B đã đạt.

## 7. Benchmark pilot và tiêu chí chốt trước

### 7.1. Bộ dữ liệu và ngân sách

Chốt pilot 100 clip: tuning 40 clip/4 người; đánh giá 60 clip/6 người khác, không trùng người hoặc bản audio biến đổi từ cùng bản thu qua hai tập. Tuning gồm 2 trẻ/2 người lớn; đánh giá gồm 3 trẻ/3 người lớn, mỗi người 10 clip. Trẻ thuộc nhóm 5–8 tuổi; khi chưa có nguồn hợp lệ thì dùng người lớn để kiểm kỹ thuật và ghi **chưa đủ evidence trẻ em**, không giả lập bằng pitch-shift/TTS rồi gọi đạt.

Tập đánh giá60clip gồm20đọc đúng,30có lỗi rõ,10không đủ điều kiện nghe. Trong20đọc đúng có ít nhất8âm cuối unreleased được người duyệt xác nhận. Trong30lỗi có8omission,8substitution (4gần/4xa),8insertion và6đọc từ khác. Phân bổ theo nhiều người và tối thiểu15từ; các lớp lỗi có thể có người/từ trùng trong cùng tập. Ground truth chốt trước khi thấy output model.

Chia đều mỗi nhóm giữa trẻ và người lớn: mỗi tầng 10 clip đúng, 15 clip lỗi, 5 clip không đủ điều kiện; ít nhất 4 clip unreleased/tầng. Mỗi tầng có 4 omission, 4 substitution (2 gần/2 xa), 4 insertion, 3 đọc từ khác. Tuning dùng cùng các nhóm nhưng khác người và không sao chép audio đánh giá.

Hai người duyệt độc lập; ít nhất một người có năng lực ngữ âm tiếng Anh. Ghi vị trí, loại lỗi và âm nghe được khi chắc chắn; chấp nhận tập biến thể hợp lệ thay vì ép một cách đọc duy nhất. Bất đồng chưa giải quyết → audio ambiguous, không dùng làm ca đúng/sai chắc chắn. Nếu phải loại quá10% thì sửa bộ dữ liệu, không loại có chọn lọc để tăng điểm. Không gọi nhãn tự nghe của agent là chuyên gia ground truth.

Dữ liệu riêng chỉ xử lý tại nơi được phép, dùng mã clip ẩn danh và thời hạn xóa đã thống nhất; cần quyền sử dụng/phụ huynh cho bản thu trẻ. Không tự thu giọng founder/trẻ. Không đưa audio/private transcript/identity vào repo, public log, IDB, cloud hay analytics. App vẫn chỉ giữ bản thu trong RAM. Định danh file/prompt/config/model phục vụ tái lập không bao gồm key.

Giới hạn toàn pilot **tối đa 300 request**: baseline 40 + tối đa 2 ứng viên × 40 + baseline 60 + ứng viên đã chọn 60 + kiểm lặp 10 = 250; 50 request còn lại chỉ cho probe có lý do. Chạy tuần tự trong quota, không retry tự động; 429 thì dừng và resume phần chưa chạy khi quota cho phép, không đổi key/model hay nâng billing. Không dựa vào tên Free Tier để tuyên bố quota vô hạn. Chỉ gọi live khi có dữ liệu và key được phép dùng cho benchmark; lượt lập plan này không gọi live.

### 7.2. Đo đúng mẫu số và không cho uncertain che lỗi

Đơn vị phát hiện là sự kiện lỗi tại vị trí âm đích/điểm chèn; một sự kiện chỉ match một lần với ground truth. Đúng loại và vị trí mới là TP; lời chẩn đoán thay âm còn phải đúng âm heard đã được người duyệt xác nhận. Đo riêng phát hiện lỗi và đúng lời chẩn đoán; không chỉ báo một điểm tổng tương quan.

- Precision = TP/(TP+FP); báo sai vị trí/loại/âm sửa không được tính là bắt đúng lỗi.
- Tỷ lệ chấm oan ở mức từ = số bản thu đúng nhưng bị báo bất kỳ lỗi / toàn bộ bản thu đúng. Báo thêm FP/(FP+TN) ở mức âm, không gộp âm chèn vào TN không định nghĩa.
- Recall lỗi rõ = số sự kiện lỗi phát hiện đúng / tổng sự kiện lỗi rõ có nhãn. Trả uncertain, lỗi schema, timeout hoặc không chấm được vẫn không tính là bắt được lỗi; đồng thời có thống kê lý do riêng.
- Coverage = số bản thu rõ có điểm / toàn bộ bản thu rõ. Từ chối đúng = số ca không đủ điều kiện không bị tạo điểm /10ca không đủ điều kiện; tách local guard và provider abstention.
- Độ trễ đo từ khi mic dừng đến kết quả, gồm decode/trim/network. Báo p50/p95, thiết bị, mạng và số mẫu; lỗi request tính riêng, không bỏ khỏi tỷ lệ hoàn thành.
- Baseline nguyên trạng và ứng viên được đánh giá trên cùng clip. Baseline cũ chưa hỗ trợ insertion phải ghi thiếu khả năng đó, không mặc định output thiếu field nghĩa là không có âm thừa.

Không xem kết quả held-out để sửa prompt. Nếu mở ra rồi dùng để chỉnh, tập đó trở thành tuning và cần dữ liệu held-out mới. Không lặp vô hạn để chọn lần trả lời đẹp nhất.

### 7.3. Ngưỡng pilot đề xuất được freeze khi duyệt plan

| Gate | Ngưỡng |
|---|---|
| Độ đúng của lỗi/lời sửa được hiển thị | Precision ≥90% |
| Chấm oan trên20clip đúng | ≤5%, tức tối đa1clip |
| Ca unreleased hợp lệ | Không báo lỗi âm cuối trên8ca đã xác nhận |
| Phát hiện lỗi rõ | Recall ≥80% tổng thể; mỗi nhóm omission/substitution/insertion ≥75% |
| Đọc từ khác có khác âm rõ | Không có ca nào được100 |
| Chấm được bản thu rõ | Coverage ≥90%, ít nhất45/50clip |
| Audio không đủ điều kiện | Không tạo điểm ở ít nhất9/10clip |
| 10clip clear chạy thêm một lần | Trạng thái từ và lỗi chính nhất quán ít nhất9/10; sai khác điểm ≤10 ở ít nhất9/10 |
| Trải nghiệm | p50≤3,5s; p95≤8s trên cấu hình mạng/thiết bị đã ghi; timeout vẫn30s |
| Request lỗi kỹ thuật | ≤5%; quota bị chặn thì ghi chưa đủ điều kiện hoàn tất, không gọi lỗi model |

Đây là ngưỡng chấp nhận pilot của sản phẩm, không phải số đã đo hoặc chuẩn khoa học chung. Báo số đếm/numerator/denominator và độ bất định theo người nói; 100 clip không chứng minh chất lượng toàn dân số. Các gate chất lượng cũng phải đạt riêng ở tầng trẻ: precision ≥90%, chấm oan ≤5% (với 10 clip đúng nghĩa là không có ca chấm oan), recall ≥80% tổng và ≥75% từng nhóm, coverage ≥90%, từ chối đúng ≥90% (với 5 clip nghĩa là cả 5), không chấm 100 cho từ sai và không bắt oan 4 ca unreleased. Kiểm lặp 10 clip gồm ít nhất 5 clip trẻ. Không gộp người lớn để che kết quả kém của trẻ; thiếu dữ liệu trẻ thì B chưa đạt. Không tuyên bố cải thiện có ý nghĩa thống kê chỉ từ mẫu nhỏ. Kiểm audio/mic/latency trên host hoặc browser giả lập không thay thế kiểm điện thoại thật; ghi riêng giới hạn thiết bị đã thử.

## 8. Kiểm thử và bàn giao

Unit tests: bỏ tin provider score; các ví dụ mục4; substitution gần/xa; missing heardnull; insertion đầu/giữa/cuối/lặp; index/reference/token sai; thiếu insertions; overflow; unclear; rounding cap từng từ/vòng; null không thành0. Cập nhật expectation82→88 đúng hành vi, không giữ con số12test làm acceptance. Chuẩn hóa IPA phải có ca không gộp các âm khác nhau.

UI fixture: match, missing, substitution, insertion dù mọi âm đích match, unclear, unknown reference, quota/network/invalid response, ghi lại lần2, hủy và response muộn. Kiểm mobile/desktop, sheet, nguồn mẫu/replay, Next/Skip và vòng có từ chưa chấm; không test literal chỉ để khóa câu chữ.

Chạy scoped tests liên quan, lint/typecheck theo ADR050; UI discovery trước run và profile cô lập. Build cuối chỉ khi boundary thay đổi yêu cầu hoặc cần production preview. Không browser founder, full suite hoặc install không có lý do. Báo rõ fixture/local/live/device, lệnh/kết quả/source fingerprint; không gọi mock là chất lượng thật.

Bàn giao gồm code hoàn chỉnh cho A, báo cáo benchmark cho B nếu đủ điều kiện, danh sách lỗi còn lại có clipID ẩn danh và quyết định đạt/chưa đạt. Nếu thiếu dữ liệu/quota thì ghi implemented_local/quality_pending, không tự đánh dấu done toàn bộ.

## 9. Khi Gemini không đạt và phạm vi duyệt cuối

Nếu fail chất lượng: giữ bản sửa logic trên nhánh, không công bố đã giải quyết nhận âm. Nếu chỉ fail độ trễ/quota/environment thì xử lý đúng loại, không kết luận phải thay engine. Không hạ ngưỡng sau khi thấy kết quả, không thêm request hoặc tráo model ngầm.

Chỉ sau fail chất lượng mới lập báo cáo so sánh engine chuyên dụng trên cùng tập dữ liệu. OpenPronounce là ứng viên, không mặc định lựa chọn thắng: benchmark tác giả có precision0,196/recall0,732 ở ngưỡng nhãn cụ thể, không phải độ chính xác mọi tình huống; không suy thẳng đó là FPR. [Benchmark gốc](https://github.com/Halleck45/OpenPronounce/blob/main/benchmarks/README.md).

Không dựng HF Space trong phạm vi này. Tài liệu hiện ghi Docker Space mới cần gói trả phí dù CPU Basic không tính theo giờ; không hứa0đ. Bất kỳ backend thay thế phải có kết quả tốt hơn, license/model evidence, giới hạn tài nguyên, chi phí và phương án kết nối trước khi xin quyết định kiến trúc riêng. [Hugging Face Spaces](https://huggingface.co/docs/hub/en/spaces-overview).

Phạm vi founder đã duyệt là: triển khai A, chuẩn bị và thực hiện B khi có đầu vào được phép theo budget, dùng các mặc định đã ghi; không cần hỏi lại từng công thức, màu, schema hay ngưỡng. Việc code bắt đầu khi task triển khai được giao, không trong lượt chuẩn bị docs. Duyệt plan không cấp quyền tự mua dịch vụ, thay billing, tạo hạ tầng khác hoặc thu bản ghi riêng tư. Nếu không có dữ liệu trẻ/người duyệt hợp lệ, vẫn làm hết A và benchmark kỹ thuật có thể làm, báo rõ phần B cần đầu vào; không bịa kết quả hoặc tự đổi mục tiêu.

**Thành công cuối cùng:** code không tạo điểm mâu thuẫn; phản hồi dễ luyện; pilot đạt các gate đã chốt. Nếu Gemini không đạt, kết quả của pilot phải đủ rõ để quyết định engine khác, không tiếp tục sửa prompt vô hạn.
