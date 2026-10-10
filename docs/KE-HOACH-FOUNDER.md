# Words for Kids — kế hoạch sản phẩm dành cho founder

**Cập nhật: 10/10/2026.** Mục tiêu: biến bài học trên giấy thành thư viện tiếng Anh cho trẻ 5–8 tuổi, bố mẹ chuẩn bị và kiểm trước khi con học.

**Chụp/upload và duyệt ảnh:** bản mới đã lên Vercel, CI code c74a2e2 qua; đã làm lại vùng kéo thả một ảnh, nút chọn ảnh tiếng Việt và camera riêng. Màn đọc/duyệt hiển thị đúng ảnh đã chỉnh để đối chiếu (cạnh kết quả trên máy tính, giữ phía trên trên điện thoại; bấm ảnh để xem lớn). Nếu thiếu key, thêm ngay tại màn; nút giải thích điều kiện còn thiếu thay vì chỉ mờ. Tick xác nhận không tự gửi ảnh. [Kiểm UI104/117](evaluations/capture-review-ui.md), chưa phải kiểm độ đúng của AI thật.

**Thêm từ:** đã có autocomplete từ điển thật khi gõ sai hoặc thiếu. `handsom` gợi `handsome`; chọn từ sẽ tự điền “đẹp trai”, nghĩa Anh, loại từ, IPA, cách đọc gần đúng, ví dụ song ngữ và hình người từ OpenMoji. Có chọn nghĩa khác và thay hình. Kho 174 hình vector có giấy phép đi kèm catalog. Nếu nguồn thiếu dữ liệu, app nêu rõ để bố mẹ kiểm và bổ sung.

**Ảnh bài học:** đã bỏ OCR chạy trên điện thoại. Bố mẹ vào **Cài đặt → AI riêng của phụ huynh**, gắn Gemini API key và chọn model (mặc định Gemini 3.5 Flash-Lite). Key chỉ ở phiên trang đang mở hoặc nhớ trong localStorage nếu chọn; có nút xóa, không gửi qua server app, cloud hay backup. Cắt bỏ tên, khuôn mặt và thông tin riêng → chọn chế độ tách từ → xác nhận gửi Google → sửa, duyệt và lưu. Có free tier theo quota của project; project bật billing có thể tính phí. Chưa gọi AI thật vì chưa có key; đã kiểm luồng bằng response fixture và CORS endpoint thật. Nhập tay và học offline vẫn dùng được; AI cần mạng.

**Setup và deploy:** [hướng dẫn](../SETUP-PROJECT.md) có ba env tối thiểu và từng nơi lấy key/URL; Supabase/Google là tùy chọn. Vercel project **words-for-kids** đã nối repo: push `main` tự deploy production. [Bản Gemini đã READY](https://words-for-kids.vercel.app/settings#parent-ai), CI runtime SUCCESS. [Dashboard](https://vercel.com/trudyan141s-projects/words-for-kids); trạng thái READY và CI được ghi trong [evidence hiện hành](evaluations/parent-dictionary-byok-deploy.md).

**Đã kiểm:** frozen install, lint/TypeScript/build và 104 unit tests PASS; 113/113 browser tests desktop/mobile PASS; SQL migrations 0001–0006 PASS. Có review, chống trùng, IndexedDB, IPA, notes, decks, SRS, 4 game, backup, offline và code cloud. Google/Supabase hosted chưa có project. Thử với 5 bố mẹ và 5 trẻ, camera/voice/install trên điện thoại, field metrics, benchmark AI thật và điều kiện tài khoản/retention vẫn cần nghiệm thu. Library 2,92s/search p95≈151ms là lab của build trước, chưa đo lại build này. App chưa nghiệm thu toàn bộ plan.

**Ledger:** 4 done / 2 pending_external / 10 in_progress / 3 planned. T05 đã có code BYOK; gateway server vẫn planned. T15 đã có Vercel tự deploy READY, CI bản Gemini SUCCESS; pilot vẫn cần nghiệm thu. T16 OCR thiết bị đã bỏ, không làm lại khi chưa có yêu cầu mới. ADR-030 thay OpenAI bằng Gemini theo yêu cầu mới nhất; ADR-029 thay quyết định cũ về key trong trình duyệt, OCR local và quyền deploy; ADR/artifact cũ giữ lịch sử. Founder thử một lượt trên bản hosted: thêm từ → kiểm hình/IPA → lưu → notes → ôn/game → backup. Muốn AI thì gắn key trong app, không gửi key qua chat.

Bốn model có sẵn và ô nhập model ID khác; không tự chuyển model khi lỗi/quota. Key cũ OpenAI không được gửi sang Google. Điều khoản Google vẫn hạn chế under-18-directed/likely-access API Clients; code/config đã làm theo founder, eligibility/live account chưa được Google chấp thuận. [Nguồn](https://ai.google.dev/gemini-api/terms).

**Cập nhật bộ từ/ngày và hình10/10:** app tự tìm hình nguồn mở khi tra từ, dọn credit khỏi thẻ thư viện, bổ sung mẫu câu/ngữ pháp What is it?/It’s… để phụ huynh duyệt. Thêm màn Bộ từ theo ngày: mỗi ảnh/file giữ bài riêng, từ gõ tay gom cùng ngày, tìm tên/ngày/từ, đếm từ mới/ôn lại, sửa tên/ngày và học từng bộ. check121/14PASS; 133/133 browser PASS; deploy đang hoàn tất, [evidence](evaluations/library-media-and-date-sets.md) ghi kết quả cuối.

## 1. Sản phẩm cần giải quyết điều gì?

Người học đã gặp một từ hoặc cấu trúc câu, nhưng sau vài ngày không nhớ đã học ở đâu. Giấy ghi chú nằm rải rác; chụp ảnh vào điện thoại thì khó tìm kiếm; nhập từng từ vào một ứng dụng ôn tập mất công. Words for Kids nối ba việc thành một luồng: **lưu lại kiến thức đã học → tìm lại đúng ngữ cảnh → ôn để nhớ lâu hơn**.

Bản đầu dành cho **con founder và trẻ 5–8 tuổi**: phụ huynh chụp tờ A4 trường gửi về, duyệt nội dung; trẻ nghe, học và chơi. Người lớn là hướng mở rộng sau. Mặc định tiếng Việt, Beginner và chế độ trẻ em; vẫn có nghĩa Anh–Anh/Anh–Việt. Tuổi và trình độ là hai thuộc tính riêng, không tự suy từ ảnh.

Trải nghiệm mong muốn: trẻ nhận ra hành động từ hình hoạt họa, icon/nút lớn và lời hướng dẫn ngắn; trẻ chưa đọc tốt vẫn nghe/chọn hình. Phụ huynh xử lý chụp/duyệt/cài đặt, không bắt trẻ hiểu cloud, grammar thuật ngữ hay API key. Các chức năng cho người lớn giữ khả năng mở rộng, không chi phối UI bản đầu.

## 2. Quyết định về trải nghiệm

Ưu tiên **web app/PWA**: mở bằng đường dẫn, dùng tốt trên điện thoại, có thể thêm vào màn hình chính. Người dùng bắt đầu ngay trên thiết bị, chưa cần tài khoản.

Chỉ có **ba mục điều hướng chính**:

| Mục | Người dùng tìm đến để làm gì? | Nội dung nhìn thấy trước |
|---|---|---|
| **Hôm nay** | Bắt đầu học hoặc thêm bài mới | Một nút hành động chính; bài vừa học; số từ cần ôn |
| **Từ của con** | Tìm lại kiến thức đã lưu | Ô tìm kiếm; từ vựng; chuyển sang câu/mẫu câu/ngữ pháp khi cần |
| **Chơi & học** | Ôn bằng thẻ hoặc chơi | Một buổi học được gợi ý; các cách chơi khác phía dưới |

Tài khoản và cài đặt nằm ở góc trên. Chụp ảnh là một hành động trong Hôm nay, không cần một tab riêng. Những tính năng ít dùng như sao lưu, gộp thư viện và chọn giọng đọc chỉ xuất hiện khi người dùng cần.

Mỗi màn có một hành động nổi bật. Lúc bé chưa có dữ liệu, đó là **“Nhờ bố mẹ thêm bài”**, mở cổng phụ huynh rồi tới chụp/chọn ảnh; trong khu phụ huynh dùng “Thêm ảnh bài học”. Khi đã có dữ liệu, đó là **“Chơi 5 phút”**, còn thêm ảnh là nút phụ. Không dồn mọi tính năng vào trang đầu.

Màn chào có nút chính **“Bắt đầu”**, vào local với VI/Beginner/chế độ trẻ em bật. Google và thiết lập nằm trong khu phụ huynh. Chỉ ba khu vực với nhãn trẻ em ở bảng trên; icon rõ và voice cue ngắn khi bấm trợ giúp. Chụp/duyệt/cài key/gộp/xóa do phụ huynh; cổng phụ huynh là một dialog trong S16/flow hiện tại, không thêm màn thứ 17. Cổng này tránh mở nhầm, không thay xác thực server.

## 3. Hành trình phụ huynh thêm một tờ bài học

```mermaid
flowchart LR
  A[Thêm ảnh] --> B[Chụp hoặc chọn ảnh]
  B --> C[Xem và chỉnh ảnh]
  C --> D[AI đọc nội dung]
  D --> E[Duyệt và sửa]
  E --> F[Lưu bài học]
  F --> G[Ôn ngay hoặc xem thư viện]
```

**Bước 1 — chọn ảnh.** Có hai nút rõ: “Chụp ảnh” và “Chọn ảnh từ máy”. Chỉ hỏi quyền camera sau khi bấm chụp. Nếu camera không dùng được, lựa chọn tải ảnh vẫn có sẵn.

**Bước 2 — xem lại.** Người dùng thấy ảnh sẽ gửi đi, có thể cắt, xoay hoặc chụp lại. Tên bài/ngày học là tùy chọn. Khi cần AI đọc ảnh, app giải thích ngắn rằng ảnh được gửi để phân tích; lưu trên máy và gửi ảnh cho AI là hai việc riêng biệt.

**Bước 3 — phân tích.** Hiển thị bước đang thực hiện, có thể hủy/thử lại. Không chạy thanh phần trăm giả. Nếu mất mạng, giữ ảnh nháp để làm tiếp; không xóa công sức vừa chụp.

**Bước 4 — duyệt.** Mặc định mở phần từ vựng. Câu, mẫu câu và ngữ pháp xuất hiện khi ảnh có nội dung tương ứng. Người dùng thấy phần mới, phần đã có, phần cần kiểm tra; có thể sửa và bỏ chọn trước khi bấm “Lưu”. Chữ không rõ được đánh dấu, tránh tạo cảm giác AI luôn đúng.

**Sau khi lưu:** thông báo như “Đã thêm 8 từ mới · 3 từ đã có · 2 mẫu câu”. Nút chính là “Ôn bài này”. App giữ ngày và nguồn học để sau này biết từ đến từ bài nào.

Từ trùng không tạo lại bản ghi, nhưng vẫn ghi nhận rằng người dùng gặp nó trong bài mới. Nếu `bank` xuất hiện với nghĩa “ngân hàng” rồi “bờ sông”, app giữ hai nghĩa thay vì bỏ nghĩa thứ hai. AI chỉ đề xuất; người dùng duyệt nội dung cần sửa.

## 4. Graph flow và đặc tả đủ 16 màn hình

**S01–S16 là mã màn hình để đối chiếu graph, nội dung và ảnh UI.** Người dùng vẫn chỉ thấy ba khu vực chính. S09 gồm danh sách và chi tiết từ; S10 gồm câu/mẫu câu/ngữ pháp; S13 gồm bốn trò. Những biến thể này được ghi trong cùng nhóm màn hình, không bị bỏ sót chỉ vì kế hoạch có 16 mã.

Mũi tên ghi tên hành động hoặc điều kiện. Hộp chữ nhật là trang/trạng thái, hình thoi là điều kiện cần xét. Dữ liệu trong các ảnh sau này là ví dụ minh họa; các graph dưới đây mô tả hành vi cần triển khai.

### 4.0. Bản đồ toàn bộ app

```mermaid
flowchart TB
  S01["S01 Chào và bắt đầu"] -->|Bắt đầu trên máy| S03["S03 Hôm nay"]
  S01 -->|Phụ huynh chọn Google| S02["S02 Đăng nhập"]
  S02 -->|Không có dữ liệu khách cần gộp| S03
  S02 -->|Có thư viện khách| S15["S15 Đồng bộ và gộp"]
  S03 -->|Nhờ bố mẹ thêm bài| PG["Cổng phụ huynh, giữ thao tác đang định làm"]
  PG -->|Qua cổng để thêm bài| S04["S04 Camera hoặc tải ảnh"]
  PG -->|Hủy| BACK["Trở về đúng trang mở cổng"]
  S04 -->|Đã có ảnh| S05["S05 Xem và chỉnh ảnh"]
  S05 -->|Cho phép gửi và phân tích| S06["S06 Đang phân tích"]
  S06 -->|Có kết quả hợp lệ| S07["S07 Duyệt kết quả"]
  S07 -->|Lưu thành công| S08["S08 Bài vừa lưu"]
  S08 -->|Ôn bài này| S11["S11 Chọn buổi học"]
  S03 -->|Chơi 5 phút hoặc tab Chơi & học| S11
  S03 -->|Tab Từ của con hoặc tìm từ| S09["S09 Thư viện và chi tiết từ"]
  S08 -->|Xem một từ| S09
  S09 -->|Xem câu hoặc ngữ pháp| S10["S10 Câu, mẫu câu, ngữ pháp"]
  S09 -->|Ôn từ này| S11
  S10 -->|Ôn nội dung này| S11
  S11 -->|Học bằng thẻ| S12["S12 Flashcard"]
  S11 -->|Chơi trò được chọn| S13["S13 Minigame"]
  S12 -->|Hoàn tất phiên| S14["S14 Kết quả buổi học"]
  S13 -->|Hoàn tất phiên| S14
  S14 -->|Ôn lại từ khó| S11
  S14 -->|Về Hôm nay| S03
  S03 -->|Phụ huynh và cài đặt| PG
  S09 -->|Phụ huynh và cài đặt| PG
  PG -->|Qua cổng để quản lý| S16["S16 Cài đặt và sao lưu"]
  S11 -->|Phụ huynh và cài đặt| PG
  S16 -->|Đăng nhập Google| S02
  S16 -->|Quản lý đồng bộ| S15
  S15 -->|Xong hoặc giữ riêng| S03
  S16 -->|Quay lại| S03
```

S16 quay lại đúng nơi đã mở nó; mũi tên về S03 ở graph tổng là đường thường gặp. Lỗi/hủy/quay lại chi tiết nằm ở từng graph dưới đây. Khi đang chụp, duyệt hoặc học, thanh ba tab được ẩn để giữ tập trung; thay bằng nút Quay lại/Đóng có bảo toàn công việc. S03, danh sách S09 và S11 là những nơi dùng thanh ba tab thường xuyên.

| Mã | Tên màn hình | Ảnh đại diện dự kiến sau khi nhận xét theme |
|---|---|---|
| S01 | Chào và bắt đầu | Lần đầu dùng, nút Bắt đầu |
| S02 | Đăng nhập Google | Giải thích đồng bộ và lựa chọn khách |
| **S03** | **Hôm nay** | **Có bài học, 8 từ cần ôn — Theme C tạm chốt** |
| S04 | Camera/tải ảnh | Camera đang mở, có nút chọn ảnh thay thế |
| S05 | Xem và chỉnh ảnh | Tờ A4 đã cắt, nút Phân tích ảnh |
| S06 | Đang phân tích | Bước nhận dạng đang chạy, có Hủy |
| S07 | Duyệt kết quả | Danh sách có từ mới/trùng/cần sửa |
| S08 | Bài vừa lưu | Số mục mới/trùng và nút Ôn bài này |
| S09 | Thư viện/chi tiết từ | Chi tiết apple: nghĩa, nghe, ví dụ, note |
| S10 | Câu/mẫu câu/ngữ pháp | Phân tích câu I am reading a book |
| S11 | Chọn buổi học | Buổi ôn 5 phút được gợi ý |
| S12 | Flashcard | Thẻ đã hiện đáp án, hai nút đánh giá đơn giản |
| S13 | Minigame | Nghe/nhìn apple rồi chọn hình hoạt họa, 2–3 lựa chọn |
| S14 | Kết quả | Phiên game hoàn tất, từ cần ôn tiếp |
| S15 | Đồng bộ/gộp thư viện | Xem trước phần mới/trùng trước khi gộp |
| S16 | Cài đặt/sao lưu | Trình độ, chế độ đơn giản, âm thanh, dữ liệu |

**Đã tạo đủ S01–S16 theo các graph bên dưới.** Mở [gallery 16 màn](design/gallery.html) để so toàn bộ ảnh, hoặc [prototype có bài minh họa](design/prototype/index.html?seed=1) để bấm thử. Theme C đã tạm chốt, 9 ảnh được sửa theo phản hồi về minh họa/bố cục; bản cũ giữ để đối chiếu. Câu hỏi và đáp án của S12/S13 sẽ được kiểm trong cả trạng thái trước/sau; một ảnh đại diện không thay toàn bộ flow.

### 4.1. S01 — Chào và bắt đầu

**Mục đích:** hiểu công dụng và dùng ngay. Đi vào khi mở app lần đầu; lần sau có thư viện/phiên hợp lệ thì vào Hôm nay.

**Bố cục từ trên xuống:** tên sản phẩm Words for Kids; minh họa tờ bài học thành thẻ từ; câu “Lưu từ đã học, ôn lại mỗi ngày”; nút chính **Bắt đầu**; lựa chọn phụ “Đăng nhập Google”; dòng nhỏ giải thích dữ liệu được lưu trên trình duyệt này.

```mermaid
flowchart TD
  A["Mở app"] --> B{"Đã có thư viện hoặc phiên trước?"}
  B -->|Có| H["S03 Hôm nay"]
  B -->|Chưa| W["S01 Chào và bắt đầu"]
  W -->|Bắt đầu| L["Chuẩn bị thư viện trên máy"]
  L -->|Thành công| H
  L -->|Không ghi được bộ nhớ| E["Giải thích lỗi, giữ màn chào"]
  E -->|Thử lại| L
  W -->|Đăng nhập Google| G["S02 Đăng nhập"]
```

**Trạng thái:** lần đầu, đang chuẩn bị thư viện, trình duyệt không cho lưu, trở lại. Không hỏi ngày sinh/trình độ trước khi dùng; không tự bật camera. Nếu không có bộ nhớ local, không báo đã lưu và không hứa cloud sẽ tự khắc phục.

**Ảnh S01:** trạng thái lần đầu, minh họa nhỏ và một nút chính; màu, chữ và nút kế thừa Theme C tạm chốt, wordmark Words for Kids.

### 4.2. S02 — Đăng nhập Google

**Mục đích:** mở khả năng đồng bộ, không cản người muốn học trên máy. Đi vào từ S01, tài khoản ở S16 hoặc khi cần đăng nhập lại.

**Bố cục:** Quay lại; tiêu đề “Học tiếp trên mọi thiết bị”; giải thích ngắn; nút **Đăng nhập Google**; “Tiếp tục trên thiết bị này”; thông tin thư viện khách sẽ được xem trước khi chuyển. Đăng nhập và chuyển dữ liệu là hai bước khác nhau.

```mermaid
flowchart TD
  A["S02 Đăng nhập"] -->|Chọn Google| O["Mở đăng nhập Google"]
  O -->|Hủy hoặc lỗi| E["Giữ thư viện hiện tại và cho thử lại"]
  E -->|Thử lại| O
  O -->|Thành công| C{"Có thư viện khách cần xử lý?"}
  C -->|Có| M["S15 Xem trước gộp"]
  C -->|Không| H["S03 Thư viện tài khoản"]
  A -->|Tiếp tục trên máy| P["S03 Thư viện khách"]
  A -->|Quay lại| R["Nơi mở đăng nhập, không đổi scope"]
```

**Trạng thái:** chưa đăng nhập, đang mở Google, hủy, lỗi, hết phiên. Khi phải đăng nhập lại trong lúc sync, giữ việc đang chờ và trở về S15 sau thành công; không tự gộp nhầm với tài khoản khác.

**Ảnh S02:** trước đăng nhập, không có form mật khẩu riêng của app hoặc nhiều lựa chọn nhà cung cấp chưa triển khai.

### 4.3. S03 — Hôm nay, ảnh kiểm theme đầu tiên

**Mục đích:** có một hành động học rõ ngay khi mở. Đi vào sau Bắt đầu/đăng nhập hoặc tab Hôm nay. Trang này quyết định cảm giác thị giác chung của app.

**Bố cục từ trên xuống:** header tên app và nút tài khoản; tiêu đề “Hôm nay”, câu “Cùng ôn lại từ đã học”; vùng ôn vàng sáng, “Cùng ôn 8 từ nhé!”, bé cáo san hô hoạt họa và nút chính **Chơi 5 phút** màu berry; ô “Tìm từ của con...” ; hai bài học với hình hoạt họa cạnh nhau; một từ gần đây với nút Nghe; hàng phụ **Thêm bài cho con** qua cổng phụ huynh; thanh **Hôm nay / Từ của con / Chơi & học** ở dưới.

```mermaid
flowchart TD
  A["S03 Đọc thư viện trên máy"] --> C{"Thư viện có nội dung?"}
  C -->|Chưa có| E["Màn rỗng, nút chính Nhờ bố mẹ thêm bài"]
  C -->|Có| P["Gợi ý ôn hoặc tiếp tục phiên"]
  E -->|Nhờ phụ huynh thêm bài| M["Cổng phụ huynh, giữ thao tác dự định"]
  P -->|Chơi 5 phút| T["S11 Buổi ôn đã chọn mặc định"]
  P -->|Tiếp tục phiên dang dở| R["S12 hoặc S13 tại câu đang học"]
  P -->|Thêm bài cho con| M
  P -->|Chọn bài vừa học| L["S08 Chi tiết bài"]
  A -->|Tìm hoặc tab Từ của con| W["S09 Thư viện, giữ từ tìm kiếm"]
  A -->|Tab Chơi & học| T
  A -->|Phụ huynh| M
  M -->|Qua cổng để thêm bài| K["S04 Chụp hoặc chọn ảnh"]
  M -->|Qua cổng để quản lý| S["S16 Cài đặt"]
  M -->|Hủy hoặc chưa qua cổng| A
  P -->|Nghe từ gần đây| V["Phát âm tại chỗ, vẫn ở S03"]
```

**Trạng thái:** chưa có bài; đã có từ đến hạn; có bài nhưng chưa có từ đến hạn; phiên dang dở; offline; đang chờ đồng bộ. Khi không có từ đến hạn, gợi ý bài vừa thêm thay vì nút ôn bị khóa. Khi offline, tìm/nghe local nếu thiết bị hỗ trợ/học nội dung đã lưu vẫn dùng được.

**Nội dung minh họa cho ảnh S03:** 8 từ cần ôn; bài `At school` có 12 từ, 2 mẫu câu; `Food & drinks` có 8 từ, 1 mẫu câu; từ gần đây `apple — quả táo`. Đây là fixture thiết kế, không phải dữ liệu thật của người dùng. Từ preview mở chi tiết S09 khi chạm phần chữ; nút Nghe chỉ phát âm.

**Lịch sử theme:** A xanh bị từ chối vì tầm thường. B sổ giấy chưa ấn tượng và không hợp ưu tiên trẻ 5–8; giữ lịch sử, không nhân rộng. Brief mới yêu cầu hoạt họa dễ thương như tinh thần Duolingo, nhưng nhân vật và bố cục riêng.

**Theme C tạm chốt — bé cáo san hô học từ:** hình 2D, mảng lớn, nét rõ, mascot có khuôn mặt thân thiện; đồ vật/trái cây giữ hình dạng tự nhiên và không có mặt; nền hồng rất nhạt `#FFF8F8`, chữ `#38213D`, nút berry `#B52F60`, vàng `#FFE49A`, mint `#DEF3E6`, lilac `#ECE3FB`; mascot san hô `#FF925C`. Không dùng cú xanh/nhân vật/đường học/streak của Duolingo. Font tròn có đủ dấu Việt, body trẻ khoảng 18 px; vùng chạm ít nhất 48 px, primary khoảng 56 px. Hình minh họa học là cartoon, ảnh giấy nguồn của phụ huynh vẫn giữ nguyên để kiểm chữ.

**Đối chiếu ảnh với graph:** Chơi 5 phút→S11 (gợi G02 nghe/nhìn từ chọn hình khi đủ asset, nếu thiếu thì thẻ phù hợp); ô tìm/apple→S09; dòng bài→S08; Nghe ở tại chỗ; Phụ huynh→cổng rồi S16; Thêm bài cho con→cổng rồi S04. Không yêu cầu trẻ thêm API key hoặc đăng nhập Google.

**Ảnh hiện tại — Words for Kids, Theme C v2 đã sửa minh họa:**

![S03 Hôm nay — Words for Kids, đồ vật không có mặt](design/mockups/s03-words-for-kids-theme-c-v2.png)

Ảnh S03 gốc đã chốt trước lần đổi tên được giữ trong lịch sử; bản hiện tại dùng Words for Kids và bỏ mặt trên vật thể. Đủ 16 ảnh/prompt và phiên bản cũ nằm trong manifest; [gallery](design/gallery.html) mở ảnh lớn. Prototype là HTML/CSS/JS thật để thử luồng, dùng font Nunito có tiếng Việt, minh họa SVG chuẩn bị sẵn và dữ liệu mẫu. Kết quả AI, camera, Google/cloud, tìm ảnh mạng và lịch SRS chưa được triển khai. Ảnh concept không thay phép thử với trẻ hoặc số đo hiệu năng.

**Founder đã sửa hướng minh họa và UI khi xem prototype:** đồ vật, trái cây và thức ăn không thêm mắt/miệng/má hồng/tay chân. Dễ thương đến từ màu sạch và nét mềm, vẫn phải nhìn ra ngay là cặp, sách hay thước. Cặp phải có quai xách/quai đeo/khóa/ngăn túi. Mascot cáo giữ biểu cảm riêng. Không ép ảnh tìm trên mạng giống một bộ kawaii độc quyền: ưu tiên vector/illustration có sẵn, cùng bộ khi thuận tiện; đồng bộ bằng khung, nền và kích thước hình. Hình không rõ không đưa vào game.

**Bố cục game/kết quả đã sửa:** ba đáp án bằng nhau, cùng một hàng ở màn từ 360 px; màn quá hẹp dùng ba hàng bằng nhau. Không dùng hai thẻ trên và một thẻ rộng phía dưới vì tạo thiên lệch thị giác. Không làm nhạt cả hình sau khi trả lời; feedback ngắn, có icon/chữ. Kết quả gọn trong một nhóm số đúng/sai/bỏ qua dùng mint/pink/lilac. Panel mã màn/checkbox lỗi chỉ là công cụ QA và được ẩn khỏi giao diện mặc định, không thuộc app cho bé.

**Skill đã vận dụng trong vòng này:** frontend-design tạo mascot/palette/illustration riêng; product-design tách child learning và parent preparation; ui-ux-pro-max được tra và chọn lọc, không áp recommendation landing/blue; bilingual-learning-content giữ đúng nghĩa/ví dụ; motion-design/ui-animation định nghĩa storyboard, thời gian, pause và reduced motion ở mục 8. Hiệu năng dùng catalog/template, không phát video AI hoặc tải mọi asset khi mở app.

### 4.4. S04 — Camera hoặc chọn ảnh

**Mục đích:** lấy ảnh bài học rõ, có đường thay thế khi camera lỗi. Đi vào từ Thêm ảnh ở Hôm nay hoặc Thêm ảnh khác ở một bài.

**Bố cục:** Quay lại, “Thêm ảnh bài học”; lựa chọn Chụp ảnh/Chọn ảnh từ máy; khi mở camera có khung hướng dẫn tờ giấy, đổi camera nếu thiết bị hỗ trợ, nút chụp lớn, nút chọn ảnh. Không mở camera ngay khi vào route.

```mermaid
flowchart TD
  A["S04 Chọn cách thêm ảnh"] -->|Chụp ảnh| P{"Camera có thể dùng?"}
  P -->|Cho phép| C["Preview camera"]
  P -->|Từ chối hoặc không hỗ trợ| E["Giải thích và giữ nút chọn ảnh"]
  C -->|Chụp| V["Kiểm ảnh và dừng camera"]
  A -->|Chọn ảnh từ máy| F["Mở chọn file"]
  E -->|Chọn ảnh từ máy| F
  F -->|Chọn ảnh| V
  F -->|Hủy| A
  V -->|Ảnh dùng được| N["S05 Xem và chỉnh"]
  V -->|Sai định dạng hoặc quá lớn| X["Lỗi cụ thể, chọn ảnh khác"]
  X --> A
  A -->|Quay lại| B["Nơi mở thêm ảnh"]
  C -->|Quay lại| B
```

**Trạng thái:** chưa hỏi quyền, quyền được cấp, bị từ chối, thiếu camera, file picker bị hủy, ảnh không phù hợp. Camera dừng khi sang S05 hoặc rời trang. Quyền camera chỉ được hỏi khi bấm Chụp ảnh.

**Đã triển khai T04 local:** nút `Mở camera` mới hỏi quyền; `Chụp ảnh` trong preview, `Đổi camera`, `Đóng camera` và upload fallback. Dừng tracks khi switch/hidden/leave/capture; late permission không mở lại camera sau hủy. JPEG/PNG/WebP ≤10 MB/20MP, HEIC hướng dẫn chuyển JPEG/chụp mới. Danh sách nháp đúng scope, xác nhận xóa chỉ dọn ảnh nháp đó, nhắc nháp hơn7ngày. QA07 phone thật chưa chạy.

**Ảnh S04:** camera đã được cho phép, tờ A4 trong khung và nút chụp; không vẽ popup quyền của OS như UI do app sở hữu.

### 4.5. S05 — Xem và chỉnh ảnh

**Mục đích:** biết chính xác ảnh sẽ phân tích, sửa trước khi gửi. Đi vào với một ảnh đã chụp/chọn; ảnh và thao tác chỉnh được lưu thành nháp.

**Bố cục:** Quay lại, preview lớn; Cắt/Xoay/Chụp lại; cảnh báo khi ảnh khó đọc; tên bài/ngày tùy chọn; dòng cho phép gửi ảnh này tới dịch vụ AI; nút **Phân tích ảnh**. Công cụ cắt có thao tác nút/điều khiển thay thế kéo bằng tay.

```mermaid
flowchart TD
  A["S05 Preview và nháp"] -->|Cắt hoặc xoay| E["Cập nhật ảnh sẽ gửi"]
  E --> A
  A -->|Chụp lại| K["S04 Lấy ảnh thay thế"]
  A -->|Phân tích ảnh| C{"Có mạng, ảnh hợp lệ, consent và provider phù hợp?"}
  C -->|Đủ điều kiện| N["S06 Đang phân tích"]
  C -->|Thiếu điều kiện| H["Nêu lý do, giữ ảnh và tên bài"]
  H -->|Chỉnh hoặc thử lại| A
  H -->|Lưu nháp và làm sau| T["S03 Có nháp để tiếp tục"]
  H -->|Nhập từ thủ công| W["S09 Editor thêm từ, giữ nháp ảnh"]
  A -->|Quay lại| K
```

**Trạng thái:** chưa chỉnh, sau chỉnh, ảnh mờ, HEIC cần chuyển đổi/hướng dẫn, ảnh quá lớn, offline, chưa cho phép gửi, bộ nhớ đầy. Giới hạn bản đầu: một ảnh/lượt, tối đa 10 MB và 20 megapixel trước xử lý. Tên/ngày/tags không bắt buộc; các giá trị đã nhập không mất khi lỗi.

**Đã triển khai T04 local:** rotate90°, reset, crop bốn mép theo % với keyboard, mở ảnh để zoom; title/date/tags tùy chọn, consent local không gửi ảnh. Autosave500ms/manual/back, nháp + prepared pixels atomic/versioned scoped, quota/conflict giữ phần đang làm, reload giữ ảnh và fields. Chỉ giữ source JPEG đã normalize/bỏ EXIF≤2200 + prepared đúng preview, không giữ raw/GPS/file name. Today có `Tiếp tục nháp ảnh` qua parent gate. `Phân tích ảnh bằng AI` hiện mở màn BYOK theo ADR029; thiếu key có link cài đặt, lỗi/hủy giữnháp; không tự gửi sau restore. Nhập tay/autocomplete thật đã nối.

**Ảnh S05:** A4 đã cắt gọn, preview sắc nét, trạng thái đã cho phép gửi ảnh, nút Phân tích ảnh sẵn sàng. Nhập tay là editor trong nhóm S09, không thêm một màn thứ 17.

### 4.6. S06 — Đang phân tích

**Mục đích:** hiểu app đang làm gì và có thể thoát nếu chờ lâu. Đi vào sau khi đồng ý phân tích một ảnh hợp lệ.

**Bố cục:** thumbnail ảnh, tên bài; các bước Chuẩn bị ảnh/Gửi ảnh/Nhận dạng/Kiểm tra kết quả theo thông tin thật; status text; **Hủy phân tích**; lỗi có Thử lại hoặc Quay lại chỉnh ảnh. Không có phần trăm giả.

```mermaid
flowchart TD
  A["S06 Phân tích nháp đã chọn"] --> C{"Kết quả xử lý"}
  C -->|Hợp lệ| R["S07 Duyệt, chưa tự lưu"]
  C -->|Lỗi, timeout hoặc từ chối| E["Giữ nháp và giải thích lỗi"]
  E -->|Thử lại với cùng ảnh| A
  E -->|Chỉnh hoặc chọn ảnh khác| B["S05 Chỉnh ảnh"]
  E -->|Hết hạn mức| Q["Thông tin hạn mức, làm sau hoặc nhập tay"]
  Q --> B
  A -->|Hủy| B
  A -->|Refresh hoặc mở lại| D{"Có kết quả tạm còn hợp lệ?"}
  D -->|Có| R
  D -->|Chưa có hoặc hết hạn| B
```

**Trạng thái:** bước đang xử lý, hủy, timeout, kết quả lỗi định dạng, refusal, quota, phục hồi sau refresh. Không gửi lại một cách vô hạn; retry giữ nháp, chống tính lặp theo request của cùng nội dung. Hủy không hứa dịch vụ AI hoàn tiền nếu đã chạy.

**Ảnh S06:** bước Nhận dạng đang chạy, bước trước có check, bước sau chưa hoàn tất; có nút Hủy. Một ảnh tĩnh chỉ minh họa trạng thái, chưa chứng minh animation đã hoạt động.

### 4.7. S07 — Duyệt từ, câu và ngữ pháp

**Mục đích:** sửa những gì AI đọc trước khi đưa vào thư viện. Đi vào với kết quả trích từ ảnh hợp lệ và đối chiếu dữ liệu trong thư viện đang dùng.

**Bố cục:** tên bài, số mục đã chọn; nhóm Từ vựng/Câu/Ngữ pháp, mẫu câu nằm trong nhóm Câu; bộ lọc Mới/Đã có/Cần kiểm tra; dòng nội dung có checkbox, nhãn và Sửa; ảnh nguồn mở thêm trên mobile; thanh **Lưu N mục** ở dưới. Desktop đặt ảnh và kết quả cạnh nhau.

```mermaid
flowchart TD
  A["S07 Xem các mục trích từ ảnh"] -->|Chọn nhóm hoặc bộ lọc| A
  A -->|Sửa mục hoặc xem bằng chứng| E["Editor tại chỗ và đoạn ảnh nguồn"]
  E -->|Giữ chỉnh sửa| A
  A -->|Từ đã có nhưng khác nghĩa| M["So sánh và chọn thêm nghĩa mới"]
  M --> A
  A -->|Lưu các mục đã chọn| C{"Đủ mục hợp lệ để lưu hoặc liên kết nguồn?"}
  C -->|Chưa đủ| W["Nêu mục cần sửa, giữ lựa chọn"]
  W --> A
  C -->|Đủ| S["Lưu bài và các liên kết một lần"]
  S -->|Thành công| N["S08 Bài vừa lưu"]
  S -->|Lỗi bộ nhớ hoặc lưu| F["Giữ nháp, không báo đã lưu"]
  F --> A
  A -->|Chỉnh ảnh lại| B["S05 Giữ nháp, phân tích lại khi chọn"]
```

**Trạng thái:** kết quả mới, có mục trùng, nghi chữ không rõ, nghĩa mới, toàn bộ đã có, không có tiếng Anh, thiếu nghĩa/ví dụ, lưu lỗi. Toàn bộ đã có vẫn có thể lưu bài với liên kết nguồn; không tạo lại các từ. Không có mục thì hướng dẫn chọn/chỉnh ảnh hoặc nhập tay.

**Ảnh S07:** bài mới `School objects`, `pencil` mới, `book` đã có, chữ `erqser` cần sửa thành `eraser`; nhãn bằng chữ và icon, không chỉ màu. Từ chưa được bổ sung nghĩa vẫn lưu được; khi đó ghi thiếu nội dung và chưa đưa vào câu hỏi cần nội dung đó.

### 4.8. S08 — Bài vừa lưu và nguồn học

**Mục đích:** biết đã lưu gì, học tiếp ngay, tìm lại nguồn. Đi vào sau lưu thành công hoặc chạm bài trong Hôm nay/Thư viện.

**Bố cục:** tên/ngày bài, trạng thái Đã lưu trên máy/Đang chờ đồng bộ/Đã đồng bộ; số mục mới/đã có/câu/ngữ pháp; nút **Ôn bài này**; danh sách từ và câu; mở ảnh nguồn nếu còn; note/tag và Thêm ảnh khác là phụ.

```mermaid
flowchart TD
  A["S08 Bài và kết quả lưu"] -->|Ôn bài này| P["S11 Bộ ôn theo bài"]
  A -->|Chạm một từ| W["S09 Đúng từ và nghĩa"]
  A -->|Chạm câu hoặc ngữ pháp| G["S10 Chi tiết nội dung"]
  A -->|Xem nguồn| I["Ảnh hoặc đoạn bằng chứng tại chỗ"]
  I --> A
  A -->|Sửa tag hoặc note của bài| E["Lưu chỉnh sửa, vẫn ở S08"]
  A -->|Thêm ảnh khác| C["S04 Bài mới"]
  A -->|Chưa đủ nội dung để ôn| H["Nêu phần thiếu, vẫn đọc bài được"]
  H -->|Bổ sung khi có mạng hoặc sửa tay| A
  A -->|Quay lại| R["S03 hoặc danh sách bài đã mở"]
```

**Trạng thái:** lưu local thành công, sync pending, sync xong, enrichment một phần, ảnh nguồn đã xóa, chưa có mục đủ điều kiện ôn. Không báo đã đồng bộ chỉ vì đã ghi local; ảnh đã xóa vẫn giữ bằng chứng văn bản và ngày học.

**Ảnh S08:** kết quả bài mới `School objects`, 8 từ mới/3 từ đã có/2 mẫu câu; CTA Ôn bài này. Tổng 11 từ được liên kết với bài, trong đó chỉ 8 từ được thêm vào thư viện; không gộp mẫu câu vào số từ. Hai bài `At school`/`Food & drinks` và từ `apple` đã có từ trước trong ảnh S03, giúp chuỗi ảnh nhất quán.

### 4.9. S09 — Từ của con và chi tiết từ

**Thêm từ không cần chụp ảnh — đã chốt 09/10/2026:** phụ huynh bấm `Thêm từ` ở Hôm nay/Từ của con, gõ tiếng Anh và xem autocomplete các từ khớp hoặc liên quan. Gợi ý phân biệt từ đã có và từ mới để thêm; chọn gợi ý hoặc tra nguyên từ đã gõ → xem nghĩa/POS, IPA/cách đọc/ví dụ có nguồn → chọn nghĩa, sửa/duyệt → lưu. Không tự lưu khi chọn autocomplete, không tự đổi thành từ gần giống. Có thể nhập thủ công nếu không tìm thấy, offline hoặc tra lỗi; giữ nháp và báo nội dung còn thiếu. Dùng cùng chống trùng/approval/thư viện với từ từ ảnh. Nguồn tra live chưa chọn, T07 triển khai; editor T03 đã lưu sửa/đề xuất local, chưa tạo/tra/autocomplete T07.

**Phát âm đã chốt:** ngay dưới từ lớn là IPA, phân biệt UK/US khi có dữ liệu; dòng kế là `Cách đọc gần đúng` bằng chữ Việt. Mỗi câu ví dụ cũng có hai dòng tương ứng dưới câu EN và trước bản dịch VI. Nút Nghe/Nghe chậm vẫn đọc tiếng Anh gốc. IPA có nguồn/kiểm xác minh; gợi ý chữ Việt được phụ huynh duyệt, không gọi là IPA chuẩn. Thiếu dữ liệu thì báo phần phát âm chưa đầy đủ ở khu phụ huynh và cho bổ sung; không bịa phiên âm. Các ảnh/mockup cũ giữ lịch sử, bố cục mới chờ T07.

**Mục đích:** tìm được một từ đã học và hiểu đúng nghĩa. Đi vào từ tab Từ của con, tìm ở Hôm nay, một bài hoặc kết quả buổi học; giữ nội dung tìm kiếm/vị trí danh sách khi quay lại.

**Bố cục danh sách:** tiêu đề Từ của con, ô tìm, bộ lọc mở khi cần; từng dòng có từ/nghĩa ngắn/nút Nghe; chuyển sang Câu hoặc Ngữ pháp; tab dưới. **Bố cục chi tiết:** Quay lại; từ lớn và Nghe/Nghe chậm; từ loại và nghĩa đang chọn; nghĩa Anh–Việt/Anh–Anh; một ví dụ; **Ôn từ này**; mở thêm ví dụ, mẹo nhớ, ghi chú, đã học ở đâu. Desktop dùng danh sách/chi tiết hai cột.

```mermaid
flowchart TD
  A["S09 Danh sách từ"] -->|Tìm hoặc lọc| Q{"Có kết quả?"}
  Q -->|Có| L["Danh sách đúng kết quả"]
  Q -->|Không| E["Không tìm thấy, xóa hoặc đổi bộ lọc"]
  E --> A
  L -->|Chọn từ| D["Chi tiết, chọn nghĩa khi có nhiều nghĩa"]
  D -->|Nghe hoặc mở ví dụ, note| D
  D -->|Ôn từ này| P["S11 Bộ ôn nghĩa đang chọn"]
  D -->|Sửa, note hoặc chọn hình| PG["Cổng phụ huynh, giữ thao tác dự định"]
  PG -->|Hủy| D
  PG -->|Qua cổng để sửa hoặc note| S["Phụ huynh lưu bản sửa đã duyệt"]
  S -->|Thành công hoặc lỗi giữ nhập| D
  PG -->|Qua cổng để chọn hình| IM["Catalog hoặc shortlist nguồn mở đúng nghĩa"]
  IM -->|Phụ huynh chọn ảnh hợp lệ| DL["Import được phép, lưu credit, trạng thái đang tải"]
  DL -->|Đã tải và kiểm xong| READY["Ảnh approved và ready, dùng được trong game"]
  READY --> D
  DL -->|Lỗi| IE["Giữ từ, thử lại hình hoặc bỏ qua"]
  IE -->|Thử lại| DL
  IE -->|Bỏ qua| D
  IM -->|Không có hoặc bỏ qua| D
  D -->|Xem nguồn đã học| B["S08 Đúng bài nguồn"]
  A -->|Xem câu hoặc ngữ pháp| G["S10 Danh sách tương ứng"]
  A -->|Nhờ phụ huynh thêm từ thủ công| PM["Cổng phụ huynh cho thao tác thêm"]
  PM -->|Qua cổng| M["S09 Gõ từ mới, autocomplete"]
  PM -->|Hủy| A
  M -->|Chọn gợi ý hoặc tra nguyên input| LOOKUP["Tra nghĩa, POS, IPA, cách đọc và ví dụ có nguồn"]
  LOOKUP -->|Có kết quả| REVIEW["Chọn nghĩa, sửa và duyệt"]
  LOOKUP -->|Không có, offline hoặc lỗi| MANUAL["Giữ input, thử lại hoặc nhập thủ công"]
  MANUAL -->|Thử lại| LOOKUP
  MANUAL -->|Nhập thủ công| REVIEW
  REVIEW -->|Lưu| SAVE["Kiểm trùng, transaction đúng scope"]
  SAVE -->|Thành công hoặc mục đã có| D
  SAVE -->|Lỗi giữ nháp| REVIEW
  M -->|Hủy chưa lưu| A
  D -->|Quay lại| L
```

**Trạng thái:** thư viện rỗng có Thêm ảnh; kết quả tìm rỗng có Xóa bộ lọc; 1 hoặc nhiều nghĩa; nội dung chưa hoàn tất; đang sửa; audio thiếu; mục đã xóa; offline. Sửa/note thất bại giữ văn bản để thử lại. Nghĩa khác không bị mất khi chống trùng hoặc cập nhật AI.

**Ảnh S09:** chi tiết `apple`, nghĩa `quả táo`, giải thích Anh–Anh, ví dụ, Nghe và Ôn từ này; không nhét mọi note/ví dụ dài vào một khung nhỏ. Khi ảnh chỉ đại diện chi tiết, graph và bản wireframe vẫn bao phủ danh sách/editor.

### 4.10. S10 — Câu, mẫu câu và ngữ pháp

Câu học và ví dụ của mẫu câu/grammar dùng cùng bố cục phát âm S09: câu EN → IPA đã xác minh → cách đọc gần đúng bằng chữ Việt đã duyệt → nghĩa VI. Phát âm theo toàn câu và accent được chọn; bản sửa câu cần kiểm lại phiên âm/gợi ý, giữ nhãn nguồn câu riêng với nguồn phần phát âm.

**Mục đích:** hiểu cách dùng tiếng Anh, không chỉ nhớ dịch từng từ. Đi vào từ S09 hoặc mục câu/ngữ pháp của một bài.

**Bố cục:** danh sách chia Câu/Mẫu câu/Ngữ pháp; chi tiết có câu gốc và bản dịch; nhãn nguồn; phân tích cụm từ; mẫu câu có chỗ thay và ví dụ; grammar có công thức/cách dùng/lỗi thường gặp. Mẹo nhớ có **Từng bước/Phát/Dừng/Phát lại**, bản chữ đầy đủ và note của tôi; **Ôn nội dung này** là hành động chính.

```mermaid
flowchart TD
  A["S10 Danh sách theo loại"] -->|Chọn nội dung| D["Chi tiết câu, mẫu câu hoặc grammar"]
  D -->|Nghe câu| D
  D -->|Từng bước hoặc Phát mẹo nhớ| M["Highlight cụm và lời giải thích"]
  M -->|Dừng, phát lại hoặc xem bản tĩnh| D
  D -->|Thay chỗ trong mẫu câu| V["Ví dụ thay thế có nghĩa và phân tích"]
  V --> D
  D -->|Ôn nội dung này| P["S11 Bộ ôn theo nội dung"]
  D -->|Sửa note hoặc tạo lại gợi ý| PG["Cổng phụ huynh, giữ thao tác dự định"]
  PG -->|Hủy| D
  PG -->|Qua cổng để sửa| E["Lưu bản phụ huynh sửa, duyệt version mới"]
  E --> D
  PG -->|Qua cổng để tạo lại khi đủ điều kiện| R["Bản đề xuất, không đè bản sửa đang học"]
  R -->|Phụ huynh duyệt| E
  R -->|Bỏ qua hoặc lỗi| D
  D -->|Quay lại| A
  A -->|Về Từ của con| W["S09 Giữ ngữ cảnh"]
```

**Trạng thái:** câu nguồn/câu AI; mẫu câu có nhiều chỗ thay; grammar đủ hoặc thiếu ví dụ; audio lỗi; animation chạy/dừng/giảm chuyển động; đang sửa; tạo lại gợi ý offline/lỗi. Giữ toàn câu và giải thích tĩnh ngay cả lúc đang highlight. Không bắt xem hết animation mới học tiếp.

**Ảnh S10:** `I / am reading / a book.` với nhãn chủ ngữ/hành động/tân ngữ, “Tôi đang đọc một quyển sách”, thông tin hiện tại tiếp diễn và nút Từng bước. Câu gốc hay AI được ghi rõ trên bản mockup; không thêm trò chat AI tự do.

### 4.11. S11 — Chọn buổi học

**Mục đích:** bắt đầu đúng bộ từ với ít lựa chọn. Đi vào từ Chơi 5 phút, Ôn bài này, Ôn từ này, Ôn nội dung này hoặc tab Chơi & học; mặc định đã chọn bộ theo nơi đi vào.

**Bố cục:** một buổi được gợi ý, số mục và thời lượng; nút **Bắt đầu học**; “Đổi cách học” mở Flashcard/bốn game; tùy chọn Đến hạn/Bài vừa thêm/Hay quên/Tự chọn; nội dung đủ điều kiện và Resume nếu có phiên. Không hỏi lại người dùng phải chọn bộ từ nào khi họ vừa bấm Ôn bài này.

```mermaid
flowchart TD
  A["S11 Bộ học mặc định theo nơi mở"] --> C{"Có mục đủ điều kiện?"}
  C -->|Có| P["Gợi ý một phiên 5 phút"]
  C -->|Không| E["Nêu thiếu gì và cách học thay thế"]
  E -->|Đổi bộ hoặc cách học| A
  E -->|Thêm nội dung| K["S04 Thêm ảnh hoặc S09 sửa nội dung"]
  P -->|Đổi cách học hoặc bộ từ| O["Tùy chọn mở tại chỗ"]
  O --> A
  P -->|Bắt đầu bằng thẻ| F["S12 Snapshot phiên flashcard"]
  P -->|Bắt đầu bằng game| G["S13 Snapshot game đã chọn"]
  P -->|Tiếp tục phiên đã lưu| R["S12 hoặc S13 đúng câu đang học"]
  A -->|Quay lại| B["Trang mở buổi học trước đó"]
```

**Trạng thái:** bộ gợi ý, bộ tự chọn, không đủ nghĩa/ảnh, ít đáp án, phiên dang dở, offline. Game hình cần ảnh đúng nghĩa; với ít lựa chọn dùng chế độ hai lựa chọn có nhãn hoặc gợi ý cách khác, không lặp đáp án để giả đủ bốn.

**Ảnh S11:** gợi ý ôn 8 từ trong khoảng 5 phút, Flashcard được chọn; nút Bắt đầu học; một lựa chọn Đổi cách học. Bốn trò vẫn truy cập được dù không dồn cả bốn vào đầu màn.

### 4.12. S12 — Flashcard

**Mục đích:** tự nhớ trước khi xem đáp án, sau đó ghi mức nhớ để hẹn ôn. Đi vào từ một phiên đã chuẩn bị ở S11 hoặc tiếp tục phiên trước.

**Bố cục:** Quay lại/Tạm dừng và vị trí thẻ; một thẻ lớn; nút Nghe nếu chiều hỏi cho phép; **Hiện đáp án**. Sau reveal: nghĩa, ví dụ và hai nút Chưa nhớ/Nhớ rồi trong chế độ đơn giản; “Đánh giá chi tiết” mở Nhớ khó/Rất dễ. Chế độ chuẩn hiển thị đủ bốn mức. Không có bottom nav trong phiên.

```mermaid
flowchart TD
  A["S12 Câu hỏi, chưa có đáp án"] -->|Nghe khi được phép| A
  A -->|Hiện đáp án| R["Đáp án và ví dụ"]
  R -->|Chưa nhớ hoặc Nhớ rồi| S["Lưu một review event"]
  R -->|Đánh giá chi tiết| D["Thêm Nhớ khó và Rất dễ"]
  D -->|Chọn mức nhớ| S
  S -->|Lưu lỗi| E["Giữ thẻ, cho thử lại"]
  E --> S
  S -->|Lưu xong| C{"Còn thẻ?"}
  C -->|Có| A
  C -->|Hết| F["S14 Kết quả flashcard"]
  A -->|Tạm dừng hoặc rời| P["Lưu điểm tiếp tục, về S11"]
  R -->|Tạm dừng hoặc rời| P
```

**Trạng thái:** câu hỏi, revealed, đang ghi rating, lỗi lưu, thẻ tiếp theo, cuối phiên, pause/resume, offline. Không cho rating trước reveal. Chưa nhớ→Again; Nhớ rồi→Good; chi tiết còn Hard/Easy. Bấm hai lần hoặc mở lại không tạo hai event, không đổi lịch ôn hai lần. Thẻ VI→EN không có nút nghe tiết lộ EN trước reveal; thẻ EN→nghĩa có thể nghe trước.

**Ảnh S12:** đã hiện đáp án của `apple`, có nghĩa và ví dụ, hai nút đánh giá đơn giản. Graph đã ghi riêng mặt câu hỏi để tránh AI chỉ dựng mặt đáp án.

### 4.13. S13 — Bốn minigame

**Mục đích:** nhớ từ qua hình, lựa chọn và gõ. Đi vào theo mode đã chọn ở S11; trang chọn game nằm trong cùng nhóm S13, hiển thị “Đổi cách chơi”.

**Bố cục chơi:** thoát/tạm dừng, vị trí câu; một câu hỏi; ảnh/từ/ngữ cảnh tùy mode; vùng đáp án; Gợi ý/Nghe nếu mode cho phép; nút **Kiểm tra** cho câu gõ, hoặc chạm lựa chọn để kiểm; feedback và **Tiếp tục** sau đúng/skip. Không autoplay hoặc tự nhảy ngay khi người học chưa đọc giải thích.

```mermaid
flowchart TD
  A["S13 Mode và câu hỏi snapshot"] --> C{"Đủ asset và đáp án hợp lệ?"}
  C -->|Có| Q["Hiển thị một câu hỏi"]
  C -->|Không| E["Giải thích và đổi mode hoặc bỏ qua"]
  E -->|Đổi mode| M["S11 Chọn cách học khác"]
  E -->|Bỏ qua, không tính sai| N{"Còn câu?"}
  Q -->|Xin gợi ý| H["Ghi có dùng gợi ý, giữ câu hỏi"]
  H --> Q
  Q -->|Chọn hoặc kiểm tra đáp án| V{"Kết quả"}
  V -->|Sai| W["Giải thích, cho thử lại hoặc bỏ qua"]
  W -->|Thử lại| Q
  W -->|Bỏ qua| N
  V -->|Đúng| R["Ghi đúng một lần, hiện lời giải"]
  R -->|Tiếp tục| N
  N -->|Có| A
  N -->|Hết| F["S14 Kết quả game"]
  Q -->|Tạm dừng hoặc rời| P["Lưu phiên để tiếp tục từ S11"]
```

**Bốn biến thể bắt buộc:**

| Mode | Vùng câu hỏi/đáp án | Trạng thái đặc biệt |
|---|---|---|
| G01 Hình→từ | Ảnh quả táo, chọn apple/banana/orange/grape theo bộ hợp lệ | Ảnh lỗi thì bỏ qua/đổi mode; không tính sai người học |
| G02 Từ/nghe→hình | Từ/nghe và ngữ cảnh, 2–3 ảnh rõ ở Beginner, chọn một | Từ nhiều nghĩa phải rõ nghĩa; ảnh không nhập nhằng |
| G03 Chữ thiếu | `a _ p l e`, ô nhập cho ký tự thiếu | Thiếu một chữ ở mức dễ; không cho xóa ký tự gợi ý cố định |
| G04 Gõ cả từ | Nghĩa/ngữ cảnh/ảnh/âm thanh, ô gõ từ | Không hiện word cần đoán; chờ bàn phím nhập xong; chỉ tính variants đã duyệt |

**Trạng thái:** hỏi, hint, sai, đúng, skip, ảnh tải lỗi, mode không đủ mục, keyboard đang nhập, pause/resume, offline với asset có sẵn. Không dùng điểm game làm mức nhớ đã được xác nhận; sau game có thể gợi ý flashcard từ sai.

**Ảnh S13:** G02, nghe/nhìn `apple` rồi chọn một trong 2–3 hình cartoon; phù hợp đường học của trẻ chưa đọc. G01 có ảnh rồi chọn từ; ba mode khác vẫn có spec/flow. Số liệu/ảnh trong mockup chỉ minh họa; asset thật sau này cần nguồn/license và đúng nghĩa. Ba mode khác có cấu trúc riêng trong bảng để không bị quên.

### 4.14. S14 — Kết quả buổi học

**Mục đích:** hiểu vừa ôn gì và nên làm tiếp gì. Đi vào khi hoàn tất S12/S13; phiên chưa xong dùng nhánh Tiếp tục học.

**Bố cục:** lời hoàn thành ngắn; số câu/thẻ và kết quả đúng theo loại phiên; từ cần ôn; nút **Ôn lại từ khó** nếu có, nếu không thì **Về Hôm nay**; mở chi tiết từng từ; nút phụ kết thúc. Không trình bày tự đánh giá flashcard như bài thi đúng/sai.

```mermaid
flowchart TD
  A["S14 Tổng hợp phiên đã lưu"] --> T{"Loại và trạng thái phiên"}
  T -->|Flashcard hoàn tất| F["Thẻ đã ôn, các mức nhớ và lịch tiếp"]
  T -->|Game hoàn tất| G["Đúng, sai, bỏ qua, dùng gợi ý"]
  T -->|Phiên dang dở| P["Hiển thị Tiếp tục học"]
  P -->|Tiếp tục| R["S12 hoặc S13 tại điểm đã lưu"]
  F --> W{"Có từ cần ôn lại?"}
  G --> W
  W -->|Có| D["Nút chính Ôn lại từ khó"]
  D -->|Bắt đầu bộ từ khó| L["S11 Bộ ôn mới"]
  W -->|Không| H["Nút chính Về Hôm nay"]
  D -->|Xem một từ| V["S09 Chi tiết từ"]
  H -->|Về Hôm nay| B["S03"]
  D -->|Kết thúc| B
```

**Trạng thái:** hoàn tất, kết quả một phần, chưa có từ yếu, có từ yếu, pending sync. Dữ liệu phiên lưu một lần; refresh không thưởng thêm. Kết quả game và lịch ôn flashcard tách nhau. Không gắn “thành thạo” sau một lượt.

**Ảnh S14:** phiên game 10 câu: 7 đúng, 2 sai, 1 bỏ qua; dùng gợi ý ở 2 câu là số riêng có thể trùng nhóm đúng/sai. Có hai từ cần ôn và CTA Ôn lại từ khó, không dùng điểm này làm chứng nhận nhớ lâu.

### 4.15. S15 — Đồng bộ và gộp thư viện

**Mục đích:** dữ liệu theo đúng tài khoản, chuyển từ khách mà không mất hoặc trùng. Đi vào sau login khi có dữ liệu khách hoặc từ Quản lý đồng bộ ở S16.

**Bố cục:** tài khoản/thư viện đang dùng; trạng thái sync; xem trước dữ liệu trên máy và cloud; số mới/trùng/nghĩa cần xem; sao lưu; nút **Gộp lên tài khoản này** khi đã xem; lựa chọn Giữ riêng trên máy; tiến độ thật, retry và xử lý xung đột.

```mermaid
flowchart TD
  A["S15 Kiểm tài khoản và thư viện nguồn"] --> L{"Đã đăng nhập đúng tài khoản?"}
  L -->|Chưa hoặc hết phiên| G["S02 Đăng nhập, giữ checkpoint"]
  L -->|Đúng| P["Xem trước mới, trùng và xung đột"]
  P -->|Giữ riêng| R["Không chuyển dữ liệu khách, về S03"]
  P -->|Sao lưu| B["Xuất bản sao của thư viện nguồn"]
  B --> P
  P -->|Gộp lên tài khoản này| T["Chuyển theo đợt, giữ dữ liệu khách"]
  T -->|Mạng lỗi hoặc dừng| E["Lưu checkpoint, cho tiếp tục"]
  E -->|Tiếp tục cùng lần chuyển| T
  T -->|Có xung đột cần chọn| C["Chọn nội dung muốn giữ, không đè âm thầm"]
  C --> T
  T -->|Chuyển xong| V{"Kiểm dữ liệu đích thành công?"}
  V -->|Có| S["Báo đã đồng bộ, thư viện khách còn giữ"]
  V -->|Chưa| E
  S -->|Xem thư viện tài khoản| H["S03 Đúng thư viện cloud"]
```

**Trạng thái:** chưa login, không có dữ liệu khách, preview, partial transfer, conflict, kiểm đích, xong, retry, đổi tài khoản. Lần login chỉ xác thực; bấm Gộp mới chuyển. Dừng sau một đợt không tự rollback mọi đợt đã ghi; giải thích phần đã chuyển, phần còn chờ. Đổi account không mang checkpoint của account cũ sang account mới.

**Ảnh S15:** preview 20 từ trên máy, 12 từ mới và 8 đã có trong tài khoản; nút Gộp, lựa chọn Giữ riêng. Đây là số minh họa; nghĩa khác vẫn được xử lý riêng. Không xóa thư viện khách tự động sau chuyển.

### 4.16. S16 — Cài đặt, tài khoản và sao lưu

**Mục đích:** phụ huynh chỉnh cách học và quản lý nội dung/dữ liệu. Đi vào qua cổng Phụ huynh giữ thao tác dự định; không là tab thứ tư hoặc màn thứ 17. Hủy về trang mở cổng. Gate tránh bé mở nhầm, server xác thực quyền cloud; BYOK trực tiếp dùng key phụ huynh tại trình duyệt theo ADR029.

**Bố cục:** Quay lại; tài khoản và nơi lưu; nhóm Học tập (VI/EN, trình độ, chế độ đơn giản); Âm thanh/chuyển động; Dữ liệu (đồng bộ, xuất/nhập sao lưu); AI và hình minh họa (provider đủ điều kiện, quota/key được che, ảnh đang chờ chọn); mục xóa nằm cuối, có tên scope rõ. Đổi thiết lập nhẹ có hiệu lực và được lưu tại chỗ, không thêm một nút Lưu lớn cho toàn trang.

```mermaid
flowchart TD
  A["S16 Cài đặt, đúng thư viện"] -->|Đổi thiết lập học hoặc nghe| P["Áp dụng và lưu preference tại chỗ"]
  P -->|Thành công hoặc lỗi giữ giá trị trước| A
  A -->|AI hoặc quản lý key| K{"Phụ huynh có OpenAI API key?"}
  K -->|Có| KE["Thêm đổi hoặc xóa key: phiên trang/localStorage opt-in"]
  KE -->|Thành công hoặc lỗi đã che secret| A
  K -->|Chưa| KN["Nêu chưa cấu hình hoặc không phù hợp, không tự bật paid"]
  KN --> A
  A -->|Ảnh chờ chọn| MP["S09 Shortlist, chọn đúng nghĩa và license"]
  MP --> A
  A -->|Đăng nhập Google| G["S02"]
  A -->|Quản lý đồng bộ| S["S15"]
  A -->|Xuất sao lưu| E["Tạo file của thư viện đã chọn"]
  E --> A
  A -->|Nhập sao lưu| I["Kiểm file, version, preview phần sẽ nhập"]
  I -->|Hợp lệ và người dùng chọn nhập| M["Gộp một lần, giữ bản gốc khi lỗi"]
  M --> A
  I -->|Không hợp lệ hoặc hủy| A
  A -->|Xóa local, cloud hoặc tài khoản| D["Giải thích đúng phạm vi và hậu quả"]
  D -->|Xác nhận xóa đúng phạm vi| X["Xử lý, trạng thái chờ nếu cần mạng"]
  D -->|Hủy| A
  X -->|Xong hoặc lỗi rõ| A
  A -->|Đăng xuất| O["Giải quyết pending edits, tách thư viện tài khoản"]
  O -->|Tiếp tục làm khách| H["S03 Thư viện khách"]
  A -->|Quay lại| R["Đúng trang mở cài đặt"]
```

**Trạng thái:** khách/Google, thay preference, import lỗi/version mới, export lỗi, xóa pending, logout với dữ liệu chưa sync, offline. Tắt chuyển động vẫn có bản tĩnh đầy đủ. Xóa cloud cần mạng thì báo chờ, không báo đã xóa. Xóa từng mục có thể recover/Undo theo thiết kế; xóa hẳn thư viện/tài khoản cần nêu hậu quả trước khi xác nhận.

**Ảnh S16:** khu phụ huynh, VI/Beginner/chế độ trẻ em đang bật; AI hiện chưa chọn provider phù hợp, không có key thật. Nhóm học tập/âm thanh/dữ liệu, vùng xóa không cạnh các công tắc hằng ngày. Ghi rõ thư viện lưu trên máy hay tài khoản.

### 4.17. Quy tắc xuyên suốt để graph không bỏ sót

1. Quay lại giữ ảnh nháp, chữ đang sửa, bộ lọc/vị trí đọc và phiên học; rời công việc đang ghi phải có trạng thái rõ.
2. Hành động bấm nhiều lần chỉ ghi dữ liệu/kết quả một lần; refresh không nhân đôi bài hoặc điểm.
3. Một màn có một hành động nổi bật theo trạng thái; các lựa chọn khác vẫn truy cập được.
4. Trạng thái rỗng/lỗi có lý do và đường tiếp tục; thiếu mạng/audio/ảnh không làm cả app vô dụng.
5. Các dòng nguồn/AI/người dùng sửa được phân biệt; điều kiện game và nghĩa đúng không bị hy sinh để đủ ảnh đẹp.
6. Gate sinh một S03 trước đã đạt khi founder tạm chốt C. A rejected, B superseded; hiện đủ 16 ảnh Words for Kids và prototype core. Giữ bản cũ làm lịch sử; cập nhật bản hiện tại theo phản hồi, không hỏi lại approval theme cũ.

## 5. Một trang từ vựng sẽ trông và hoạt động thế nào?

Lấy `apple` làm ví dụ. Phần đầu chỉ cần đủ để hiểu và học ngay:

```text
apple                         [Nghe]
danh từ
quả táo
a round fruit that grows on a tree

I eat an apple every day.      [Nghe câu]
Tôi ăn một quả táo mỗi ngày.

[Ôn từ này]

Ví dụ khác · Mẹo nhớ · Ghi chú của tôi · Đã học ở đâu
```

Những mục phía dưới mở thêm tại chỗ khi cần, không bật nhiều cửa sổ chồng lên nhau. Từ có nhiều nghĩa sẽ chọn nghĩa rõ ràng trước khi học. Mỗi nghĩa được bổ sung có ít nhất hai câu ví dụ và bản dịch phù hợp trình độ.

Phần tiếng Anh giải thích bằng từ dễ hơn từ đang học. Phần tiếng Việt đúng ngữ cảnh. Câu AI gợi ý được gắn nhãn khác câu có trên giấy. Người dùng sửa nghĩa/note thì app giữ bản sửa khi cập nhật nội dung.

**Câu và mẫu câu:** hiển thị câu gốc, nghĩa, những phần có thể thay. Ví dụ `I like [something]` → `I like apples.` / `I like music.`. Người học thấy thay chỗ nào, không chỉ thấy một công thức.

**Ngữ pháp:** giải thích ngắn cách dùng, công thức, ví dụ đúng và lỗi thường gặp. Ví dụ `She likes apples.` và `They like apples.` có highlight chủ ngữ và động từ, giúp hiểu vì sao có/không có `s`.

## 6. Học và chơi

Buổi học mặc định khoảng 5 phút hoặc 10 câu. Người dùng có thể dừng, tiếp tục hoặc học thêm. Thư viện mới chưa đủ nội dung vẫn tìm được, nhưng chỉ đưa vào câu hỏi khi đủ nghĩa/ảnh/đáp án phù hợp.

**Flashcard:** mặt trước là câu hỏi; người học bấm “Hiện đáp án” rồi đánh giá mức nhớ. Mặc định cho trẻ có hai nút trước mắt: **“Chưa nhớ” / “Nhớ rồi”**; tùy chọn chi tiết vẫn mở được. Hai nút này tương ứng mức chưa nhớ/nhớ được của cùng lịch ôn, không tạo một hệ thống tính điểm khác.

App hẹn ôn lại dựa trên lần trả lời, thay vì bắt người học tự nhớ lịch. Lịch đầu tiên cần đơn giản, dễ kiểm tra; chưa tuyên bố là thuật toán tốt nhất.

| Trò chơi | Người học làm gì? | Cách làm dễ hiểu |
|---|---|---|
| Nhìn hình đoán từ | Chọn từ khớp ảnh | Ít lựa chọn khi mới học; ảnh rõ, đúng nghĩa |
| Nghe/nhìn từ đoán hình | Nghe từ, chọn hình khớp | Gợi ý đầu cho bé chưa đọc; 2–3 lựa chọn, ngữ cảnh rõ cho từ nhiều nghĩa |
| Điền chữ thiếu | Điền `a _ p l e` | Bắt đầu thiếu một chữ, có gợi ý |
| Gõ cả từ | Gõ từ từ nghĩa/câu/ảnh/âm thanh | Có kiểm tra và giải thích, không chấm sai vì bàn phím chưa nhập xong |

Màn Chơi & học gợi ý một cách chơi phù hợp trước, những cách khác nằm dưới “Đổi cách chơi”. Đủ bốn trò ở bản phát hành đầu. Từ trừu tượng hoặc chưa có hình đáng tin sẽ học bằng thẻ/điền chữ; app không ép mọi từ vào trò hình ảnh.

Trả lời sai thì giữ câu hỏi, đưa gợi ý và cho thử lại. Trả lời đúng có phản hồi ngắn rồi tiếp tục. Kết quả nêu rõ từ cần ôn; không gọi một lần đoán đúng là đã “thành thạo”. Điểm game không tự thay lịch ôn flashcard.

Âm thanh phát khi bấm nghe; có nghe chậm. Chuyển câu sẽ dừng âm thanh cũ. Nếu thiết bị chưa có giọng tiếng Anh, app báo rõ và vẫn học bằng chữ được. Khả năng nghe offline cần thử trên thiết bị thật.

## 7. Hướng thiết kế và mẫu InspoMCP phù hợp

**Hướng tạm chốt: cartoon 2D cho trẻ 5–8 — Theme C.** Bé cáo san hô riêng cầm thẻ táo; nút berry nổi bật; nền sáng với vàng/mint/lilac; minh họa dễ nhận ra; biểu cảm dành cho mascot/người/con vật, không thêm mặt cho đồ vật hoặc trái cây. A xanh đã bị từ chối, B sổ giấy được thay vì brief ưu tiên trẻ. Mở rộng người lớn sau bằng presentation khác trên cùng dữ liệu, không bắt bản đầu dung hòa hai nhóm.

Tham khảo Duolingo ở tính thân thiện, nút dễ chạm và phản hồi rõ; không sao chép brand/mascot/path-map/streak. Headspace/Daybridge vẫn hữu ích về khoảng trống và phối nhóm màu, nhưng không là hướng sổ giấy cho trẻ. Đây là quyết định của dự án từ reference và skill, còn cần thử trẻ thật.

Đã nghiên cứu bản chụp và dữ liệu thiết kế của bốn mẫu trên InspoMCP. Những lựa chọn áp dụng dưới đây là đánh giá cho Words for Kids, chưa phải kết quả thử người dùng. Bản chụp có ngày riêng, không đại diện cho mọi màn hình của sản phẩm nguồn.

| Mẫu tham khảo | Phần hợp với dự án | Áp dụng vào app |
|---|---|---|
| [Headspace](https://inspomcp.dev/d/headspace-com/DESIGN.md), bản chụp 18/05/2026 | Nền sáng, khoảng trống, khối bo góc và minh họa tạo cảm giác nhẹ nhàng | Cảm giác chung của Hôm nay, thẻ học và phản hồi sau buổi học |
| [Duolingo](https://inspomcp.dev/d/duolingo-com/DESIGN.md), 04/05/2026 | Nút bắt đầu nổi bật, chữ và hình thân thiện, hành động chính dễ thấy | Nút Bắt đầu, lựa chọn đáp án, chế độ đơn giản; giữ thương hiệu riêng |
| [Daybridge](https://inspomcp.dev/d/daybridge-com/DESIGN.md), 10/09/2026 | Màu pastel, thẻ nhẹ và nhịp khoảng cách thoáng | Màu phân nhóm bài/từ/câu, thẻ bài vừa học; hiệu ứng ngắn khi lưu |
| [Bear](https://inspomcp.dev/d/bear-app/DESIGN.md), 18/05/2026 | Trang giới thiệu có preview danh sách ghi chú và vùng nội dung đọc rõ | Thư viện desktop và trang chi tiết tập trung vào từ, nghĩa, ví dụ, note |

Có thể xem ảnh tham khảo: [Headspace](https://0nme3pk5am3urwa9.public.blob.vercel-storage.com/captures/headspace-com/hero.1440.webp?v=1779110007), [Duolingo](https://0nme3pk5am3urwa9.public.blob.vercel-storage.com/captures/duolingo-com/hero.1440.webp?v=1777918957), [Daybridge](https://0nme3pk5am3urwa9.public.blob.vercel-storage.com/captures/daybridge-com/hero.1440.webp?v=1789043657), [Bear](https://0nme3pk5am3urwa9.public.blob.vercel-storage.com/captures/bear-app/hero.1440.webp?v=1779109199). Thiết kế và ảnh gốc thuộc tác giả nguồn.

Các bản tham khảo chủ yếu là trang giới thiệu. Bố cục học thực tế vẫn được thiết kế riêng: một câu hỏi một lần, ba mục điều hướng, nút nghe gần từ, hành động tiếp theo rõ. Không dùng khoảng cách lớn của landing page cho mọi hàng trong thư viện. Hình ảnh trang tham khảo không chứng minh animation, accessibility hoặc performance của app mình.

**Thông số thiết kế khởi điểm:**

- Nền `#FFF8F8`, chữ `#38213D`, nút berry `#B52F60` với chữ trắng; vàng `#FFE49A`, mint `#DEF3E6`, lilac `#ECE3FB` cho surface/minh họa; cáo san hô `#FF925C`. Đo độ tương phản khi code, không suy luận từ screenshot sinh.
- Font **Nunito có đủ dấu Việt**, đã tự host ở T18 và scaffold T01, có nguồn/OFL; T02 child body 18 px, parent/standard 16 px, title 28–40 px, từ 40–48 px; shared tokens đã vào app.
- Vùng chạm tối thiểu 48×48 px; nút chính cao khoảng 56 px. Icon quan trọng có nhãn chữ như “Nghe”, “Quay lại”, “Lưu”.
- Một màn học chỉ có một câu hỏi chính, tránh nhiều bộ đếm và biểu đồ cạnh tranh với câu hỏi.
- Cùng vị trí cho Nghe, Gợi ý và Tiếp tục giữa các màn. Màu đúng/sai luôn kèm chữ/icon.

Trước khi xây rộng, làm bản thiết kế có thể bấm thử cho Hôm nay, Duyệt kết quả, Chi tiết từ, Flashcard và một game. Đánh giá cả thư viện rỗng, dữ liệu thật, chữ dài và lỗi; không chỉ duyệt một ảnh demo đẹp.

## 8. Animation cần có và dùng để làm gì?

| Tình huống | Chuyển động đề xuất | Giá trị cho người học |
|---|---|---|
| Bấm nút | Nhấn nhẹ, phản hồi nhanh | Biết app đã nhận thao tác |
| Lưu từ từ ảnh | Các từ được chọn chuyển nhẹ thành thẻ, kèm số lượng đã lưu | Hiểu từ trên giấy đã vào thư viện |
| Hiện đáp án | Thẻ chuyển mặt trong khoảng 220–280 ms | Nhìn rõ lúc chuyển từ câu hỏi sang đáp án |
| Trả lời game | Check/gợi ý và một nhịp chuyển nhẹ | Biết đúng/sai, tiếp tục nhanh |
| Mẹo nhớ từ | Từ → hình liên tưởng → câu ví dụ | Nối từ với nghĩa và ngữ cảnh |
| Phân tích câu | Highlight từng cụm khi bấm bước tiếp | Thấy cấu trúc câu được chia thế nào |
| Giải thích grammar | Đánh dấu phần thay đổi giữa hai câu | Thấy quy tắc ảnh hưởng đến câu thực tế |

Mẹo nhớ có Phát/Dừng/Từng bước/Phát lại, cùng bản chữ đầy đủ. Các hiệu ứng giao diện thường khoảng 100–320 ms. Hiệu ứng giải thích dài hơn do người học điều khiển. Có chế độ giảm chuyển động; giảm chuyển động vẫn đọc và học đủ nội dung.

Ưu tiên hiệu ứng nhẹ, dùng lại được. Không để chuyển động giữ người học chờ qua màn thưởng; không phát âm thanh nền bất ngờ. Tạm dừng chuyển động khi tab bị ẩn. Khi người dùng bấm liên tục/quay lại giữa hiệu ứng, trạng thái và dữ liệu vẫn đúng.

## 9. Lưu trên máy và lưu cloud

| Lựa chọn | Hành vi | Điều cần giải thích cho người dùng |
|---|---|---|
| Chưa đăng nhập | Thư viện lưu trong IndexedDB trên trình duyệt/thiết bị | Có thể xuất bản sao lưu; xóa dữ liệu trình duyệt có thể làm mất thư viện |
| Đăng nhập Google | Có thư viện cloud, bản lưu trên máy và đồng bộ | Biết dữ liệu đang chờ đồng bộ hay đã đồng bộ; mở trên thiết bị khác |
| Từ khách chuyển sang Google | Xem trước và chọn gộp thư viện | Không tự chuyển ngay sau đăng nhập; kiểm xong mới báo hoàn tất |

Đăng nhập không tự xóa thư viện khách. Khi gộp gặp mất mạng, app có thể làm tiếp mà không nhân đôi. Người dùng có quyền xuất/nhập sao lưu và xóa đúng thư viện mình chọn.

AI từ xa vẫn cần mạng, kể cả khi người dùng không đăng nhập. Ảnh chưa được đồng ý gửi sẽ không tự gửi. Ảnh có thông tin cá nhân nên được cắt trước; app hạn chế giữ ảnh và không đưa nội dung ảnh vào log thông thường.

## 10. Performance: nhanh đến mức nào mới đạt?

“Mượt” phải được kiểm trên điện thoại thật. Mục tiêu khởi điểm, cần ghi tên thiết bị, mạng và dữ liệu khi đo:

| Việc người dùng làm | Mục tiêu | Cách founder hiểu kết quả |
|---|---|---|
| Mở app lần đầu | Nội dung chính xuất hiện trong khoảng ≤2,5 giây ở cấu hình kiểm chuẩn | Báo cáo thời gian thực, không chỉ ảnh chụp màn hình |
| Bấm/chọn/hiện đáp án | Có phản hồi thị giác trong khoảng ≤100 ms trên thiết bị kiểm | Bấm thấy phản hồi, không tưởng app bị đơ |
| Tìm trong 5.000 mục | 95% lần tìm local hoàn tất ≤200 ms trong bài đo đã định nghĩa | Không phải chờ mạng mới tìm được từ đã lưu |
| Đọc ảnh in rõ | 95% lượt tới màn duyệt ≤30 giây trong bài benchmark | Đo riêng tốc độ AI; có hủy/thử lại nếu lâu |
| Duyệt và lưu 10 từ | ≤90 giây trong thử nghiệm người dùng | Ít thao tác thừa, lỗi dễ sửa |
| Bố cục lúc tải | Không nhảy nội dung gây bấm nhầm | Chừa chỗ cho ảnh/font/trạng thái tải |

Chuẩn theo dõi web sau khi có dữ liệu người dùng là LCP ≤2,5 giây, INP ≤200 ms, CLS ≤0,1 tại phân vị 75. Đây là [ngưỡng Core Web Vitals](https://web.dev/articles/vitals). Kiểm phòng thử trước phát hành và đo sử dụng thật sau đó là hai loại bằng chứng khác nhau; chưa có đủ dữ liệu thực thì ghi “chưa đủ mẫu”, không ghi “đã đạt”.

Đội phát triển cần giới hạn tài nguyên tải ban đầu, chỉ tải camera/game/animation nặng khi mở tính năng, tối ưu ảnh và danh sách dài. Thư viện đọc từ dữ liệu local trước; chỉ đồng bộ thay đổi. Không cache dữ liệu riêng lẫn giữa các tài khoản để đổi lấy tốc độ.

## 11. Kiểm tra “con nít nhìn vào cũng biết xài”

Đây là tiêu chí sản phẩm cần thử với người thật. Pilot có ít nhất **5 phụ huynh và 5 trẻ 5–8 tuổi**, gồm ít nhất 2 trẻ chưa đọc vững, ghi nhóm tuổi/trình độ và thiết bị, phụ huynh đồng ý. Voice cue của app là tính năng được phép; moderator không chỉ vị trí nút. Báo riêng kết quả nhóm chưa đọc; không dùng kết quả trẻ đọc tốt để khẳng định mọi trẻ dùng được.

**Bài thử cho trẻ em:** mở buổi ôn được gợi ý, nghe từ, hiện đáp án/chọn ảnh, trả lời, tìm lại một từ và quay về Hôm nay. Người quan sát không chỉ tay hoặc giải thích trước. Từng nhiệm vụ cần ít nhất 4/5 trẻ hoàn tất không được trợ giúp; ghi nơi trẻ dừng, số lần chạm sai và câu hỏi trẻ hỏi.

**Bài thử cho phụ huynh:** thêm ảnh, sửa một từ nhận dạng sai, lưu, tìm lại, ôn và hiểu thư viện đang lưu ở đâu. Từng nhiệm vụ cần ít nhất 4/5 người hoàn tất không trợ giúp. Người lớn/phụ huynh có thể xử lý bước kiểm ảnh và đồng bộ; trẻ vẫn tự học trong cùng thư viện.

Nếu nhiều người không thấy nút Nghe hoặc không biết phải hiện đáp án, sửa vị trí/nhãn/hierarchy rồi thử lại. Thêm một trang hướng dẫn dài không thay việc sửa điểm khó hiểu.

## 12. Skill và công cụ đã bổ sung

Skill là hướng dẫn giúp AI làm việc theo tiêu chuẩn; app đẹp và dễ dùng còn cần thiết kế, đo và sửa. Bộ hiện có **17 skill: 14 từ GitHub + 3 viết riêng cho dự án**.

| Nhóm | Skill/công cụ | Công việc cụ thể |
|---|---|---|
| UX | **product-design**, **ui-ux-pro-max** — mới | Sắp hành động, chọn điều khiển, giảm lựa chọn, xử lý lỗi/trạng thái; tra cứu mẫu thiết kế |
| UI | frontend-design + **Impeccable mới theo yêu cầu founder** | Đã dùng distill/layout/colorize/typeset để gọn UI, sửa ba đáp án, màu/feedback/kết quả và font; context/detector đã chạy |
| Animation | motion-design + **ui-animation** — bổ sung mới | Nguyên lý chuyển động + cách triển khai, reduced motion, kiểm khi bị ngắt |
| Performance | **performance**, **core-web-vitals** — mới; vercel-react-best-practices đã có | Đo tốc độ, tải tài nguyên, thời gian tương tác, render React/Next |
| Dễ tiếp cận | **accessibility** — mới | Nút chạm, độ tương phản, bàn phím, đọc màn hình, zoom |
| Xử lý song song | **node — mới** từ mcollina/skills | Giới hạn I/O, hủy/timeout, cache và tra trùng; demo độ trễ giả lập đã chạy, chưa đo tốc độ app |
| Dữ liệu cloud | supabase-postgres-best-practices | Quan hệ dữ liệu, chống trùng, quyền riêng từng thư viện |
| Đọc ảnh | worksheet-extraction — riêng dự án | Bằng chứng từ ảnh, duyệt và chống trùng xác định |
| Nội dung học | bilingual-learning-content — riêng dự án | Nghĩa EN–EN/EN–VI, ví dụ, grammar, mẹo nhớ |
| Giữ context | filesystem-context, context-compression, vocabulary-delivery | Task, quyết định, trạng thái, bằng chứng và bước tiếp theo cho AI |
| Tham khảo thiết kế | **InspoMCP 0.1.16** — mới | Tìm ảnh/màu/chữ của mẫu thật; đã dùng để nghiên cứu bốn mẫu ở mục 7 |

Nguồn mới: [Impeccable](https://github.com/pbakaus/impeccable), [mcollina/skills](https://github.com/mcollina/skills/tree/main/skills/node), [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [mblode: product-design và ui-animation](https://github.com/mblode/agent-skills), [Addy Osmani: web-quality-skills](https://github.com/addyosmani/web-quality-skills), [InspoMCP](https://github.com/Nutlope/inspo).

InspoMCP đã được cấu hình cho Codex bằng phương thức chạy local, vì CLI Codex hiện có chưa hỗ trợ cách cài remote mặc định của installer. Đã kiểm khởi động và danh sách công cụ; phiên Codex hiện tại có thể cần khởi động lại để tự hiện công cụ mới. Phần nghiên cứu mẫu đã thực hiện trực tiếp qua endpoint đọc của InspoMCP. Antigravity chưa được cấu hình/kiểm kết nối trong lượt này.

## 13. Thứ tự thực hiện và đầu ra từng chặng

Mỗi chặng bàn giao một kết quả có thể xem và kiểm. Đây là thứ tự công việc, chưa phải lời hứa số tuần hoàn thành. Sau khi kiểm ảnh thực và bản mẫu, mới có căn cứ ước lượng nguồn lực/lịch.

| Chặng | Việc làm | Founder được xem/kiểm | Điều kiện để đi tiếp |
|---|---|---|---|
| **1. Thiết kế trải nghiệm** | Chốt ba mục chính, mẫu thị giác, copy; prototype năm màn và luồng cơ bản | Bản có thể bấm; thư viện rỗng/có dữ liệu/lỗi; kịch bản thử trẻ/phụ huynh | Luồng rõ, nội dung thật, không phụ thuộc giải thích miệng của người thiết kế; ghi phần chưa thử người thật |
| **2. Nền tảng app** | Khung app, dữ liệu trên máy, tìm kiếm, design system; chuẩn bị benchmark AI | Mở app, tìm từ mẫu, reload còn dữ liệu; báo cáo so AI khi đủ điều kiện | Các bước cơ bản chạy và có lệnh kiểm; chưa dùng mock để nhận đã OCR thật |
| **3. Ảnh thành thư viện** | Camera/upload, chỉnh ảnh, AI, duyệt, lưu không trùng | Tờ A4 → từ/câu/grammar → sửa → lưu; xử lý ảnh mờ/mất mạng | Có lần đọc ảnh thật; retry không trùng; đúng nguồn; không mất nháp |
| **4. Nội dung học** | Nghĩa/ví dụ/câu/grammar/nghe; tìm ảnh mở theo nghĩa, phụ huynh chọn, credit; ba animation tái sử dụng | Chi tiết từ/câu, nghe; mẹo nhớ có dừng/từng bước/bản tĩnh | Nội dung được kiểm ngôn ngữ; sửa của người dùng được giữ |
| **5. Ôn và chơi** | Flashcard, lịch ôn, bốn game, kết quả/resume | Một buổi học trọn vẹn và từng game; chế độ đơn giản | Có đáp án/ảnh đúng nghĩa; chấm đúng; bấm hai lần không ghi hai kết quả |
| **6. Google và cloud** | Đăng nhập, phân quyền, đồng bộ, gộp khách, backup | Chuyển thiết bị, mất mạng giữa gộp, hai tài khoản độc lập | Không mất dữ liệu, không nhân đôi, không thấy dữ liệu người khác |
| **7. PWA và chất lượng** | Offline, cài lên màn hình chính, đo performance, accessibility, sửa lỗi | Safari/iPhone và Chrome/Android thật; báo cáo tốc độ/flow lỗi | Chạy đủ tính năng cốt lõi, giới hạn offline được giải thích đúng |
| **8. Pilot và phát hành** | Thử 5 phụ huynh + 5 trẻ 5–8, gồm ít nhất 2 trẻ chưa đọc nhãn, sửa vướng mắc, kiểm chi phí/vận hành | Video/ghi chép thử, số liệu, bản chạy hoàn chỉnh | Đạt tiêu chí dùng dễ, có giới hạn chi phí, biết sao lưu/khôi phục; triển khai khi được yêu cầu |

Thiết kế, scaffold và benchmark có phần chuẩn bị độc lập. Đội phát triển có thể sắp lịch phù hợp nhưng không bỏ nghiệm thu dữ liệu/UX để chạy nhanh hơn. AI cập nhật task và bằng chứng sau mỗi chặng; founder đọc mục tình hình trong tài liệu này để nắm tiến độ.

## 14. Phạm vi bản đầu và mở rộng

**Bản đầu phải có:** brand Words for Kids, VI/Beginner/child-friendly, khu phụ huynh và voice cues; catalog/tìm hình hoạt họa có nguồn/license/duyệt; animation template và pipeline song song giới hạn; camera/upload, duyệt/sửa, local và Google/cloud, chống trùng giữ nghĩa khác, tìm kiếm, nghĩa Anh–Anh/Anh–Việt, ví dụ, câu/mẫu câu/grammar, nghe, ghi chú và ba template animation, flashcard/lịch ôn, đủ bốn game, offline cho nội dung đã lưu, sao lưu và chuyển thư viện.

**Làm sau:** nhiều hồ sơ người học riêng, PDF nhiều trang/nhiều ảnh một lượt, giọng đọc cloud đồng nhất, tìm kiếm ngữ nghĩa nâng cao, thuật toán ôn nâng cao. Những phần này chưa có ở bản đầu thì phải nêu rõ trên sản phẩm.

Giao diện vẫn đơn giản dù chức năng đầy đủ: chức năng nâng cao nằm trong chi tiết hoặc cài đặt, không phải thêm tab cho từng yêu cầu.

## 15. AI đọc bài, tìm ảnh, animation, tốc độ và chi phí

### 15.1. Ảnh tờ A4 thành từ và ví dụ như thế nào?

Phụ huynh cắt ảnh còn nội dung bài học, app kiểm kích thước và gửi tới dịch vụ vision/OCR đủ điều kiện sử dụng cho app trẻ em. Model trả chữ đọc được, từ/câu/mẫu câu và grammar cùng bằng chứng; phần không rõ được đánh dấu. Phụ huynh sửa/chọn trước khi lưu. App tự so từ với thư viện bằng quy tắc xác định, giữ nghĩa khác và liên kết nguồn học mới.

Từ/POS/nghĩa đã xác nhận được bổ sung nghĩa EN–EN/EN–VI, câu ví dụ và giải thích. Câu trên giấy khác câu AI gợi ý; nội dung mới phải được phụ huynh duyệt trước khi bé học. Nếu từ `book` là động từ “đặt chỗ”, không tìm hình quyển sách. Nếu bổ sung thất bại, lưu từ/bằng chứng trước và thử lại phần thiếu; không mất nháp hoặc nhân đôi từ.

### 15.2. Đổi sang tìm ảnh trên mạng: làm được và nên ưu tiên

**Chọn P1: catalog cartoon đã duyệt → tìm nguồn mở khi thiếu → phụ huynh chọn → lưu hình/nguồn/credit → dùng lại.** Không cần API tạo ảnh mỗi từ. AI có thể viết truy vấn và gợi xếp hạng, nhưng search API mới trả kết quả thật; không tin URL model bịa. Có thể dùng query/mapping có sẵn để không cần thêm AI chỉ cho việc tìm hình.

| Ưu tiên | Nguồn | Cách dùng |
|---|---|---|
| 1 | Hình riêng/catalog của Words for Kids | Đã đúng nghĩa và duyệt thì lấy lại ngay, không tìm mỗi lần học |
| 2 | Bộ minh họa mở có phong cách đồng nhất, ví dụ OpenMoji cho một số vật cụ thể | Duyệt subset hợp bé; OpenMoji CC BY-SA 4.0 cần credit và giữ điều kiện bản sửa |
| 3 | Openverse hoặc Wikimedia Commons | Tìm ảnh/vector khi thiếu; xem trang từng file, giấy phép và style trước khi chọn |
| Không có ảnh phù hợp | Phụ huynh thêm hình được quyền dùng, hoặc học bằng thẻ/câu/game khác | Không lấy ảnh sai nghĩa chỉ để đủ trò hình |

Openverse là chỉ mục tìm kiếm; Commons có giấy phép theo từng file. Bản đầu ưu tiên CC0/public-domain có bằng chứng và CC BY; bộ CC BY-SA chỉ dùng với quy trình giữ license/credit rõ. App miễn phí vẫn không có quyền lấy mọi hình từ Google/Pinterest. [Commons: cách dùng lại](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [OpenMoji: giấy phép](https://github.com/hfg-gmuend/openmoji/blob/master/FAQ.md).

**Thứ tự chọn: đúng nghĩa → dễ nhận ra → illustration đơn giản/nền sạch → hợp Theme C.** Loại ảnh có watermark/chữ đáp án/nội dung không hợp trẻ/nhân vật hoặc thương hiệu không được phép. Từ trừu tượng học bằng câu và animation chữ; không bắt mọi từ có hình. Catalog starter cần chuẩn bị cho các chủ đề School objects, Food, Animals, Actions, Colors; mỗi sense được kiểm thật, không hứa số lượng đã có.

S09 chi tiết từ trong khu phụ huynh có “Chọn hình”: 3–5 kết quả với nguồn/credit, chọn hoặc bỏ qua. S16 có danh sách ảnh còn chờ. Bé chỉ thấy hình đã duyệt và tải được, không thấy trang search, link lạ hay giấy phép dài. Vẫn có nơi xem credit hợp yêu cầu giấy phép. Chỉ tải hình được chọn khi nguồn cho phép, tối ưu và cache để học offline; không tải toàn bộ kết quả hoặc hotlink tùy ý. Credits đi cùng sync/sao lưu.

**Đã thử:** API metadata Openverse trả kết quả cho `apple illustration`, có candidate ghi CC0. Chưa xem/duyệt hình và trang nguồn nên chưa dùng những kết quả đó cho trẻ. Kết quả tìm không bảo đảm toàn bộ hình đều đẹp hoặc hợp theme; tìm kiếm là đầu vào cho bước chọn.

### 15.3. Animation vẫn làm được mà không tạo video AI

AI tạo **dữ liệu giải thích**; app chọn một **mẫu animation viết sẵn** rồi gắn từ/câu/hình vào. Ví dụ:

- `apple`: hình quả táo không có mặt xuất hiện nhẹ, bé bấm Nghe, rồi thấy `I eat an apple.`. Một hình tĩnh đủ cho liên tưởng từ/nghĩa.
- `I / am reading / a book.`: sáng lần lượt các cụm và giải thích ai/làm gì; không bắt có hình mới.
- `She likes apples.` và `They like apples.`: đánh dấu chủ ngữ, động từ và phần `s` thay đổi, kèm lời giải thích đã kiểm.

PNG/JPG có thể xuất hiện, nảy nhẹ, dịch/zoom và ghép với text. Muốn cáo vẫy tay hoặc chân chạy thì phải có SVG/layers/sprite riêng dựng một lần; ảnh phẳng tải về không tự có các bộ phận chuyển động. Không tạo video AI mỗi từ ở P1. Có Play/Pause/Replay, bản tĩnh đầy đủ và reduced motion; animation không bắt bé chờ mới bấm học tiếp. Lần ôn tiếp theo dùng dữ liệu/mẫu đã lưu, không gọi AI lại.

### 15.4. Chạy song song để nhanh hơn

```mermaid
flowchart LR
  A["Đọc ảnh và kiểm kết quả"] --> B["Phụ huynh sửa từ, xác định nghĩa"]
  B --> C["Bổ sung nghĩa, ví dụ"]
  B --> D["Tra catalog hoặc tìm hình"]
  C --> E["Kiểm câu rồi chuẩn bị animation mẫu"]
  E --> F["Phụ huynh duyệt, lưu nội dung học trước"]
  D --> G["Phụ huynh chọn ảnh, tải hình hợp lệ"]
  F --> H["Bé học ngay phần đã đủ"]
  G --> H
```

Hai nhánh bổ sung nội dung và tìm hình có thể cùng chạy sau khi biết đúng nghĩa. Animation sentence/grammar đợi ví dụ và token hợp lệ. Không tách thành một lời gọi AI cho từng từ rồi bắn hàng chục request; thường gửi batch nhỏ sẽ tiết kiệm hơn. App hiện phần đã đủ trước, tìm hình chậm không khóa toàn bộ thư viện.

Giới hạn đề xuất để thử: **AI 1 call/người sở hữu cùng lúc, ≤20 mục/batch; tìm metadata 2 request và tải hình đã chọn 2 tác vụ cùng lúc**. Có thêm giới hạn toàn hệ thống theo provider/project, cache và gộp lượt tra trùng; khi 429 thì chờ/thử lại có giới hạn, không tạo nhiều key để né quota. Xử lý crop/resize/OCR nặng có thể dùng Web Worker để màn hình vẫn mượt. Gọi API qua mạng dùng xử lý bất đồng bộ; worker thread hữu ích cho CPU nặng, không tự làm provider sinh câu nhanh hơn. [Node: worker threads](https://nodejs.org/api/worker_threads.html).

Đã chạy demo có độ trễ **giả lập** để kiểm peak concurrency, tra trùng/sense và lỗi một nhánh. Đây không phải số đo tốc độ Gemini, mạng hay app. Chặng triển khai phải so p50/p95 tuần tự và song song trên cùng tập ảnh, ghi quota/cost/cache hit; chưa có cơ sở hứa nhanh gấp mấy lần.

### 15.5. API key và mục tiêu người dùng học miễn phí

| Phần | Có cần key/dịch vụ? |
|---|---|
| Xem/ôn thư viện đã lưu, animation mẫu | Không cần AI key mỗi lần |
| Catalog ảnh bundle/cache đã duyệt | Không cần API tạo ảnh |
| Search ảnh động | Auth/quota tùy API nguồn; kiểm khi tích hợp, không miễn phí vô hạn |
| Nghe bằng giọng thiết bị | Không cần TTS key; voice EN/offline khác nhau theo máy |
| Vision đọc ảnh và bổ sung nội dung | Cần provider đủ điều kiện/key hoặc phương án local/nội dung chuẩn bị sẵn |
| Video/ảnh AI mới | Không thuộc P1; chỉ thêm khi có lý do và ngân sách rõ |

**Gemini Developer API hiện chưa dùng được cho hướng này:** điều khoản không cho API Clients hướng tới hoặc dễ được người dưới 18 truy cập. Key đứng tên phụ huynh không thay điều kiện đó. Free text/vision có quota và điều kiện dữ liệu; các API tạo ảnh được kiểm hiện ghi không có free tier. Thay tạo ảnh bằng search tiết kiệm phần hình, chưa giải quyết eligibility của vision/enrichment. [Điều khoản Gemini](https://ai.google.dev/gemini-api/terms), [bảng giá](https://ai.google.dev/gemini-api/docs/pricing), [quota theo project](https://ai.google.dev/gemini-api/docs/rate-limits).

Ở T00 phải chọn provider phù hợp app trẻ, retention, dữ liệu và quota rồi mới benchmark chất lượng/chi phí. Không tự chuyển sang dịch vụ trả phí hoặc gọi một provider khác là phù hợp khi chưa kiểm. Chưa có key thật trong repo.

Cài AI/key là việc của phụ huynh ở S16. Theo yêu cầu trực tiếp ADR029, OpenAI key ở bộ nhớ phiên hoặc localStorage opt-in; inputche/xóađược, không IndexedDB/backup/cloud/server/env. localStorage khôngmãhóa/ngườidùngchungtrìnhduyệtcóthểđọckey, UI nêu trước khi chọn nhớ. Guest không cầnlogin. Cổng phụ huynh tránh bé mở nhầm; không bảo vệ key trước người dùng chung máy. Server gateway/secretstore là roadmap riêng.

Học thư viện/tra từ điển không cần AIkey. AI đọc ảnh có phíOpenAIaccount; không quảng cáo freevision. Founder đã bỏlocalOCR theo ADR029; zeroAPIspend dùng nhập tay/từ điển/catalog.

### 15.6. Ngân sách và nghiệm thu

Các khoản còn lại: hosting/database/storage/egress, vision đọc bài và bổ sung nội dung, API tìm hình nếu có quota/cost, công chuẩn bị/duyệt catalog và audio tùy dịch vụ. **Người dùng học miễn phí** vẫn có thể có chi phí do founder trả. Học lại bằng cache/templates giảm số call; catalog không tự hoàn thành miễn phí chỉ vì ảnh nguồn mở.

Ngân sách theo **lượt đọc ảnh × chi phí đọc + nghĩa mới/thiếu × chi phí bổ sung + search quota + hosting/media**; tính cả retry. Có daily spend cap/hạn mức rõ, không mất nháp khi hết quota. Chặng nội dung kiểm ảnh đúng sense/style/license, phụ huynh approve và credit/backup; chặng chất lượng kiểm 429/hủy/nhánh media lỗi/response cũ/cache cách ly tài khoản. Provider và quota được chốt sau bằng chứng; Theme C đã tạm chốt, không hỏi lại chỉ vì chưa có code.

## 16. Bảng tình hình và checklist founder

Báo cáo hiện hành ở đầu tài liệu và [bằng chứng local](evaluations/local-end-to-end.md). Các mục 1–15 giữ đặc tả sản phẩm; mục mô tả cloud/AI/search ảnh là đích cần triển khai, không phải claim đã hoàn thành.

1. Nhập hoặc chụp một bài thật, sửa và duyệt lưu.
2. Tìm từ, nghe, xem IPA/gợi ý đọc, kiểm nghĩa/ví dụ/ghi chú.
3. Ôn thẻ, chơi bốn game, dừng rồi tải lại để tiếp tục.
4. Chuyển bài mẫu/thư viện con, xuất/khôi phục backup, mở khi mất mạng.
5. Quan sát con có biết bấm gì, có nghe/chọn hình được không; ghi lỗi thật để sửa sau một lượt.

Bản production local đang mở ở [Words for Kids](http://127.0.0.1:4317/today). Khi cần chạy lại: `nvm use`, `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm start --port 4317`. Dev dùng `pnpm dev`. Cloud code đã nối/kiểm local, chưa có project live; AI BYOK trực tiếp đã triển khai, servergatewayplanned/liveinferencepending. Vercel nativeGit đãnối theo ADR029; cấu hình tại [setup](../SETUP-PROJECT.md), trạng tháiready trongevidencehiệnhành. Prototype T18 tại `design/prototype/index.html` giữ lịch sử thiết kế, dữ liệu sessionStorage khác app IndexedDB.

### Cập nhật10/10 — chờ phân tích ảnh rõ ràng

Theo phản hồi founder, màn đọc ảnh dùng Gemini streaming để hiện dần từ/nghĩa, elapsed và trạng thái từng bước, thanh chờ/nút Dừng/tối đa90giây. Bản tạm chưa lưu; nhận xong/kiểm hợp lệ rồi mới bố mẹ duyệt. Giữ ảnh đối chiếu và drag-drop/camera đã deploy; sửa dòng chờ treo khi lỗi và định dạng JSON REST. Test dùng fixture có nhãn, chưa là AI đọc ảnh thật. Tiến độ/check/deploy ở STATE và capture-review-ui.

### Cập nhật10/10 — Google từ chối phải hiện rõ lý do

Founder yêu cầu thử/fix lỗi Google request. Bản cũ che mất message cụ thể bằng câu cấu hình chung; ADR033 cho thấy HTTP/status/model/thông báo và trường sai đã ẩn key, không log/backup. Kết quả kiểm/request thực và trạng thái deploy được ghi tại STATE/capture-review-ui; không gọi lỗi400 là key sai khi Google chưa nói vậy.

Thử trên founder tab: Google400 INVALID_ARGUMENT, không field cụ thể. Request JSON được đổi dạng tương thích và phần Cài đặt thêm nút kiểm tra key/model không gửi ảnh; không tự đổi model hay bật billing. Kết quả sau sửa ghi STATE/evidence trước bàn giao.

Kiểm tiếp ADR033: Google chấp nhận metadata key/model nhưng request ảnh sau đổi JSON vẫn400/no fields. Thêm nút câu mẫu không gửi ảnh để phân biệt lỗi gọi AI với lỗi ảnh/schema; quota/cost được ghi rõ, không tự đổi model hoặc bật billing. Không báo sửa thành công khi live request còn bị từ chối.

Câu mẫu thật đã thành công cùng key/model3.5FlashLite. Lỗi được thu hẹp về request worksheet, không quy key sai. Đang kiểm JSON mode/schema trong prompt thay schema compiler của Google; kết quả vẫn phải đúng DTO/evidence và phụ huynh duyệt trước lưu.

Đã sửa và kiểm thật trên Vercel581ef67: cùng ảnh/key/model3.5FlashLite nay stream và hoàn tất13 từ, tự điền nghĩa/POS/ví dụ ở màn duyệt. Lỗi400 nằm ở cấu hình request schema; Google không chỉ field sai. Thay backend schema compiler bằng JSON mode + cấu trúc trong prompt, app vẫn kiểm DTO/evidence trước nhận kết quả. Nháp chờ founder kiểm/duyệt, chưa lưu cho con. Check114/full125 browser/docs203links PASS; một ảnh thật không thay benchmark T00.

10/10/2026 ADR036: every future photo submit integrates exact dedup, automatically downloaded/reviewed missing art and original source-pattern excerpts + Vietnamese grammar/3-step reduced-motion teaching. Imported colon-ID detail/edit/notes route fixed after real founder reproduction. Old13-word set completed via hosted parent UI once (6art/2patterns); future imports need no source changes. check125/15/lint/types/build PASS; full137/137browser and full216links docs PASS; deploy evidence to follow in [library evidence](evaluations/library-media-and-date-sets.md). Ledger unchanged; external/device/human gates open.

ADR036 source0c22f0f productionREADY dpl_27FsfRqhma2o2kjekgFnA7F8z9bD, stable words-for-kids.vercel.app. Hosted actual teacher now opens with image/meaning/example; existing13-word set Patterns/Grammar each2approved items,3-step Vietnamese teaching verified. Full local check125/137browser/docs216PASS; remoteCI38043514632 SUCCESS (all check/SQL/browser/docs steps). External/device/human gates unchanged.

### Ôn hôm nay, trạng thái API và nhận diện chia sẻ (10/10/2026)

Đã triển khai nút Ôn N từ hôm nay mở thẳng thẻ đến hạn/tiếp tục phiên, trạng thái bước/thời gian/tiến độ và lỗi tải hình rõ ràng, cùng favicon/thumbnail chia sẻ1200×630/metadata SEO. Chỉ trang giới thiệu công khai cho index; bài của con không đưa vào sitemap. Check128 PASS; 147/147 browser và docs223links PASS; Bản78c791c đã lên Vercel READY và CI38045533305 SUCCESS. Kiểm trên thư viện thật: nút3 từ mở đúng3 thẻ, không ghi điểm ôn khi chỉ mở; trang tìm hình báo hoàn tất cạnh nút, favicon/ảnh chia sẻ/metadata đã trả200 đúng nội dung. Cần founder thử trên điện thoại; cache ảnh chia sẻ của mạng xã hội có thể chưa cập nhật ngay. [Bằng chứng](evaluations/today-feedback-and-seo.md).


10/10/2026: theo yêu cầu sửa tên đã quên lúc tạo, thêm nút Đổi tên ngay tại bài gần đây trên Hôm nay; trang Bộ từ theo ngày mở ô sửa trong chính bộ đang chọn. Lưu/Hủy và thông báo rõ; giữ nguyên từ/lịch ôn. Check128 và toàn bộ147 kiểm thử browser desktop/mobile đã qua; bản9c81821 đã lên Vercel READY. Kiểm trực tiếp ô đổi tên từ trang Hôm nay và Bộ từ theo ngày; không tự đổi tên bài của founder.
