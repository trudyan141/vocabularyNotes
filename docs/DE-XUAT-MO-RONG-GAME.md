# Đề xuất mở rộng Chơi & học — Words for Kids

> Rà nguồn25/10: giữ Thám tử vì clue lấy trực tiếp approved definition trong selection. [Audit7game và các game đợt trước](evaluations/game-source-audit.md) phân biệt input thật, compiler/templates, điều kiện tham gia và sample fallback; đã sửa mất sense khi trùng headword. Không claim AI sinh câu runtime/mọi grammar.

> Điều chỉnh ADR10825/10: **Truyện ba tranh N6 đã rút** vì cốt truyện cố định chỉ thay danh từ, chưa tạo các sự kiện từ bộ dữ liệu. Hiện còn7game adventure. Game chọn một đáp án chạm là chấm ngay, chạm sai tính sai lần đầu. Nội dung nghiên cứu bên dưới giữ để tra cứu; không đồng nghĩa mọi đề xuất đang bật.

> Cập nhật triển khai25/10/2026 — founder đã giao làm hết gameplay còn lại. V1/V2/N1/N2/N5 đã có; V4 rút theo feedback và gộp gợi ý vào Gõ cả từ. Tám game V3/V5/V6/V7/N3/N4/N6/N7 đã có renderer, binding words/grammar trong scope, mẫu dự phòng, hình mới và touch flow; đã deploy và qua45logic/24productionUI/18hosted checks. Các phần dưới là research proposal ban đầu; current decisions ở AGENTS/PROJECT-RULES và ADR101–107. [Bằng chứng Đợt2–3](evaluations/game-expansion-phase23.md).
>
> Phạm vi bản đầu Đợt2–3: RAM rounds như Trả lời Cáo, không ghi library/coverage/SRS/cloud, chưa persisted resume/replay cho8mode mới. Săn âm dùng full-word cue +approved IPA để tìm âm đầu, không giả audio âm rời bằng tên chữ cái. Những chi tiết persistence/isolated-phoneme/audio chuyên biệt của proposal chưa phải claim đã hoàn tất. Game chính ưu tiên phần đang chọn; thiếu nội dung thì chơi sample có nguồn thu gọn.

Ngày khảo sát: **24/10/2026**. Trạng thái cập nhật25/10: **gameplay Đợt0–3 đã triển khai**, V4 rút/gộp theo feedback; giới hạn persistence/âm rời ghi ở trên. [Contract triển khai](design/GAME-BOARDS-PHASE01.md), [evidence](evaluations/game-expansion-phase01.md).

Đề xuất **14 game mới: 7 từ vựng + 7 ngữ pháp**. Nên làm trước **Nối đôi, Lật thẻ tìm bạn, Xưởng xếp chữ, Câu thiếu mảnh, Trả lời Cáo, Bác sĩ câu**. Sáu game này bổ sung các thao tác nối, nhớ vị trí, xếp, chọn từ trong câu, hội thoại và sửa lỗi; phần lớn tận dụng được nội dung hiện có.

Không cần mua bộ game hay cài game engine để làm đợt đầu. Có thể dùng React/Next hiện có, tham khảo các dự án nguồn mở, rồi cân nhắc thư viện kéo thả khi thật sự cần. Chi phí khó nhất của những game sau là **nội dung đúng, hình đúng tình huống và đáp án không mơ hồ**, không chỉ animation.

## 1. Kết quả cần review

Plan trả lời bốn câu hỏi:

1. Các app khác có cách chơi nào đáng học hỏi?
2. Bé sẽ chơi game mới như thế nào, học phần gì và thấy gì khi đúng/sai?
3. Mỗi game tận dụng được gì, còn thiếu dữ liệu gì, cần repo hoặc skill nào?
4. Nên làm theo thứ tự nào và kiểm tra thế nào trước khi đưa cho bé?

Đây là nghiên cứu từ trang sản phẩm, tài liệu và hướng dẫn gameplay chính thức; đã đối chiếu source của Words for Kids. **Chưa cài/chơi trực tiếp các app thương mại, chưa đánh giá với trẻ thật.** Phần “nên áp dụng” là đề xuất cho sản phẩm này, không phải khẳng định các app có cùng cách chấm, cách lưu hoặc cùng hiệu quả học tập.

## 2. Đã tìm hiểu những app/nền tảng nào?

| App/nền tảng | Tài liệu chính thức cho thấy gì? | Nên học gì cho Words for Kids? |
|---|---|---|
| **Studycat** | Có nhóm game chạm, kéo, viết, nhớ, nói, phân loại; hướng dẫn cụ thể cho matching, memory và đặt đồ theo lời đọc. | Một bộ từ được dùng qua nhiều hành động: nối, lật, phân loại và làm theo câu lệnh. Giữ nhịp chậm, vị trí ổn định cho bản của mình. [Danh mục gameplay](https://help.studycat.com/hc/en-us/categories/34781881763353-Gameplay), [Memory](https://help.studycat.com/hc/en-us/articles/34783227558681-Memory-matching), [Phân loại](https://help.studycat.com/hc/en-us/articles/58104233239065-Sort-the-cards). |
| **Lingokids** | Tách khu chơi, nội dung xem, bài có lộ trình và hoạt động chơi cùng; có bài English về từ vựng/ngữ pháp. | Cho bé chọn game yêu thích, đồng thời có một lượt ngắn được gợi ý; không dồn mọi game lên một màn dài. [Hướng dẫn các khu](https://help.lingokids.com/hc/en-us/articles/23532720590610-What-Are-the-Sections). |
| **Monkey Junior** | Công bố các nhóm hoạt động học âm, từ, câu, ghép câu và luyện nói. | Từ nhận diện nghĩa chuyển sang dùng từ trong câu và nhiệm vụ; mỗi lượt chỉ tập trung một mục tiêu. Không lấy số lượng game quảng bá làm bằng chứng hiệu quả. [Bộ sưu tập game](https://monkey.edu.vn/tin-tuc/bo-suu-tap-game-noi-bat-trong-monkey-junior). |
| **Khan Academy Kids** | Nội dung ngôn ngữ có từ vựng, trái nghĩa, giới từ, đồ vật, động từ, tính từ và kiểu câu; có kể chuyện. | Ngữ pháp có thể được luyện qua cảnh vật, số lượng và câu chuyện, thay vì chỉ nhớ tên quy tắc. Đây là app học rộng và học đọc, không đồng nhất với app dạy tiếng Anh như ngoại ngữ. [Phạm vi nội dung](https://khankids.zendesk.com/hc/en-us/articles/360014856151-Learning-Topics-Using-Khan-Academy-Kids-in-Educational-Settings). |
| **Duolingo ABC** | Tập trung học đọc: âm chữ, nhận biết âm, giải mã từ, từ thông dụng và truyện tương tác. | Thêm game nghe âm khi đã có dữ liệu phonics đúng. Không coi ABC là nguồn giáo trình ESL/ngữ pháp đầy đủ cho bé Việt. [Cách dạy](https://abc.duolingo.com/how-we-teach?trk=public_post-text), [Trang app chính thức](https://play.google.com/store/apps/details?id=com.duolingo.literacy). |
| **British Council LearnEnglish Kids** | Có nối từ với hình theo chủ đề và game luyện từng điểm ngữ pháp; trang hướng dẫn dành cho trẻ 5–12. | Chia nội dung ngữ pháp thành mục nhỏ; sau khi chơi phải hiểu được câu đúng và cách dùng. [Bắt đầu](https://learnenglishkids.britishcouncil.org/getting-started-for-kids), [Ngữ pháp](https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice). |
| **Wordwall** | Một nội dung có nhiều template: matching, memory, group sort, cloze, anagram, unjumble…; chuyển template tùy loại và lượng dữ liệu. | Tách “bộ bài” khỏi “cách chơi”, kiểm điều kiện trước khi mở game. Đây là công cụ tạo hoạt động cho nhiều độ tuổi, cần tự giản lược cho 5–8. [Template và điều kiện](https://wordwall.net/features), [Mô tả cách chơi](https://wordwall.net/en). |
| **Games to Learn English** | Game giới từ cho di chuyển đồ theo câu; Grammar Bubbles luyện trật tự từ, đại từ và cấu trúc câu. | Ưu tiên game dùng ngữ pháp để thực hiện hành động. Phần xếp câu đã có trong app, không nên chỉ đổi thành bong bóng rồi tính là một game học mới. [Giới từ](https://www.gamestolearnenglish.com/prepositions-game/), [Grammar Bubbles](https://www.gamestolearnenglish.com/grammar-bubbles/). |

**Nhận định:** nên học cách đa dạng hóa hành động và tình huống. Không cần sao chép nhân vật, hình, âm thanh, câu hỏi, giao diện hoặc code độc quyền của các app trên.

## 3. App mình đang có gì, còn thiếu gì?

Source hiện có **8 mode trong Practice** và **Nói cùng Cáo ở luồng riêng**, tổng cộng 9 cách học/chơi:

- Từ vựng: Thẻ ôn, Nhìn hình chọn từ, Nghe từ chọn hình, Điền chữ thiếu, Gõ cả từ, Tìm ký tự thiếu; thêm Nói cùng Cáo.
- Ngữ pháp: Nghe & hiểu ngữ pháp, Xếp câu.

Ba hoạt động chữ đang khá gần nhau. Nói cùng Cáo đã có thu âm/chấm nói; chỉ đổi nhân vật hoặc phần thưởng cho luồng này không tạo ra một kỹ năng mới.

Nền tảng có thể dùng lại: phạm vi từ/bài/nhóm/kho; nội dung đã duyệt theo nghĩa/POS; hình đã duyệt; audio/IPA; ví dụ; grammar forms; lỗi thường gặp/câu sửa; phiên học và vòng phủ bộ; offline, backup và cloud/shared scope. Tuy nhiên **câu ví dụ và nhãn từ loại chưa đủ để tự suy ra mọi câu hỏi mới**.

Các khoảng trống đáng bổ sung:

| Khoảng trống | Game giải quyết |
|---|---|
| Ghép quan hệ giữa nhiều từ/hình cùng lúc | V1 Nối đôi |
| Ghi nhớ liên kết sau khi che nội dung | V2 Lật thẻ |
| Hiểu nhóm nghĩa và thuộc tính | V3 Xếp giỏ, V6 Thám tử |
| Tạo lại toàn bộ từ bằng chạm | V4 Xưởng xếp chữ |
| Nghe trên một bảng nhiều mục, thay đổi nhịp chơi | V5 Bingo |
| Nhận biết âm, không chỉ tên chữ | V7 Săn âm |
| Chọn dạng từ/câu theo ngữ cảnh | N1 Câu thiếu mảnh, N4 Một hay nhiều |
| Hiểu lời hỏi và chọn lời đáp phù hợp | N2 Trả lời Cáo |
| Dùng câu để làm việc | N3 Đặt đúng chỗ, N7 Cửa hàng |
| Nhận ra và sửa lỗi | N5 Bác sĩ câu |
| Hiểu chuỗi sự việc | N6 Truyện ba tranh |

## 4. Danh sách đề xuất và ưu tiên

“Dữ liệu sẵn” nghĩa là dùng **nội dung hợp lệ trong phạm vi đang chọn**, không mặc định tất cả bài đều có đủ. Mức công sức là tương đối, chưa phải cam kết thời gian.

| ID | Game | Bé làm gì? | Ưu tiên | Dữ liệu bổ sung chính | Công sức |
|---|---|---|---|---|---|
| V1 | **Nối đôi** | Chạm hình rồi chạm từ đúng | Đợt 1 | Thường không cần ngoài từ/hình đã duyệt | Nhỏ–vừa |
| V2 | **Lật thẻ tìm bạn** | Lật và tìm hai thẻ cùng nghĩa | Đợt 1 | Thường không cần ngoài V1 | Vừa |
| V3 | **Xếp vào giỏ** | Đưa từ/hình vào đúng nhóm | Đợt 2 | Nhóm nghĩa đã duyệt, không lấy tags tùy ý làm đáp án | Vừa |
| V4 | **Xưởng xếp chữ** | Xếp toàn bộ chữ thành từ | Đợt 1 | Từ phù hợp độ dài | Nhỏ–vừa |
| V5 | **Bingo nghe từ** | Nghe và đánh dấu hình trên bảng | Đợt 2 | 4–9 hình phân biệt được | Vừa |
| V6 | **Thám tử từ vựng** | Nghe mô tả rồi tìm vật | Đợt 2 | Mô tả và bộ đáp án đã kiểm | Vừa–lớn |
| V7 | **Săn âm cùng Cáo** | Chọn từ có âm đầu/cuối được nghe | Đợt 3 | Phoneme và audio âm riêng đã duyệt | Lớn |
| N1 | **Câu thiếu mảnh** | Chọn từ/cụm từ để hoàn thành câu | Đợt 1 | Vị trí khuyết, phương án và giải thích | Vừa |
| N2 | **Trả lời Cáo** | Nghe câu hỏi và chọn lời đáp | Đợt 1 | Quan hệ hỏi–đáp và ngữ cảnh đã duyệt | Vừa |
| N3 | **Đặt đúng chỗ** | Đặt đồ theo in/on/under… | Đợt 2 | Cảnh, vị trí hợp lệ và câu lệnh | Lớn |
| N4 | **Một hay nhiều?** | Ghép số lượng với dạng từ/câu | Đợt 2 | Countability, số nhiều, số lượng cảnh | Vừa |
| N5 | **Bác sĩ câu** | Tìm và thay mảnh sai | Đợt 1 | Có thể tận dụng commonError/correction, cần đánh dấu mảnh | Vừa |
| N6 | **Truyện ba tranh** | Sắp tranh theo câu chuyện vừa nghe | Đợt 3 | Truyện, ba cảnh, thứ tự và liên kết câu | Lớn |
| N7 | **Cửa hàng của Cáo** | Nghe yêu cầu, chọn đúng đồ và số lượng | Đợt 3 | Đơn hàng/mẫu hội thoại có cấu trúc | Lớn |

## 5. Mô tả chi tiết các game từ vựng

### V1 — Nối đôi

**Mục tiêu:** liên kết nghĩa, hình và mặt chữ; xử lý nhiều cặp trong một bảng.

**Bé thấy và chơi:** bên trái có 3 hình táo, mèo, cặp; bên phải có ba từ được trộn. Bé chạm hình mèo, rồi chạm `cat`. Hai thẻ được đánh dấu thành cặp; không cần kéo một đường chính xác bằng ngón tay. Chạm lại thẻ đang chọn để bỏ chọn.

- Ghép đúng: nghe từ tiếng Anh, thấy IPA dưới cặp vừa hoàn thành và lời khen ngắn.
- Ghép sai: hai thẻ trở lại trạng thái chọn được; không xóa các cặp đúng.
- Mới chơi: 3 cặp. Khó hơn: 4 cặp; 6 cặp chỉ khi màn hình còn đủ lớn.
- Có thể thêm biến thể từ Anh–nghĩa Việt cho bé đọc được, nhưng một lượt dùng một kiểu cặp nhất quán.

**Điều kiện:** ít nhất 3 mục đúng nghĩa, hình rõ; cặp có ID riêng. Hai từ cùng hình/đồng nghĩa gây hai đáp án hợp lý thì phải loại hoặc bổ sung ngữ cảnh. Bé chưa đọc được chữ nên được gợi ý sang mode Nghe từ chọn hình hiện có.

**Làm bằng gì:** React, Button, Artwork và AudioControl sẵn có. Tham khảo [Studycat Matching Tiles](https://help.studycat.com/hc/en-us/articles/34786029152409-Matching-Tiles). Không cần repo mới. **Khác mode chọn đáp án:** giữ và xử lý toàn bộ các cặp trên một bảng.

### V2 — Lật thẻ tìm bạn

**Mục tiêu:** nhớ liên kết hình–từ sau khi nội dung được che.

**Bé thấy và chơi:** 6 thẻ úp, gồm 3 cặp hình–từ. Bé lật một thẻ, nghe/nhìn nội dung, rồi tìm thẻ bạn của nó. Ghép đúng giữ cặp mở; ghép sai cho xem đủ lâu rồi úp lại. Không tự đổi vị trí các thẻ trong một lượt.

- Với bé chưa đọc, chế độ hai hình giống nhau có audio để làm quen; ghi nhận đây thiên về nhớ vị trí, không phải bằng chứng bé hiểu từ.
- Mới chơi 3 cặp; sau đó 4 cặp. Không mặc định chạy đồng hồ hoặc trừ mạng.
- Nhắc đáp án bằng việc mở lại một thẻ phù hợp; kết quả ghi rõ đã dùng gợi ý.
- Tạm dừng khi vừa mở hai thẻ không được làm mất cặp đã tìm.

**Dữ liệu:** dùng lại nguồn V1. Mỗi thẻ lưu `pairId` và `cardId`; hai hình giống nhau về giao diện nhưng khác nghĩa không được vô tình thành một cặp.

**Làm bằng gì:** React/CSS; tham khảo [Studycat Memory](https://help.studycat.com/hc/en-us/articles/34783227558681-Memory-matching), [H5P Memory Game](https://h5p.org/memory-game). H5P chỉ là nguồn xem luật/trạng thái; không cần tích hợp hệ H5P.

### V3 — Xếp vào giỏ

**Mục tiêu:** hiểu nhóm nghĩa, không chỉ nhớ hình của từng từ.

**Ví dụ:** hai giỏ **Animals / Động vật** và **School things / Đồ dùng học tập**. Lần lượt xuất hiện `cat`, `pencil`, `dog`, `book`. Bé chạm thẻ rồi chạm giỏ; kéo thả là cách bổ sung nếu được làm sau.

- Đúng: thẻ vào giỏ, đọc từ và tên nhóm khi bé bấm loa.
- Sai: thẻ trở lại, có giải thích ngắn như “A pencil is a school thing.” từ nội dung đã duyệt.
- Bắt đầu 2 giỏ và 4 mục, rồi 3 giỏ. Các giỏ ở vị trí cố định.
- Có thể có chủ đề màu/hình dạng sau, nhưng màu phải là thuộc tính được xác nhận cho đúng ảnh, không suy từ headword.

**Dữ liệu còn thiếu:** quan hệ mục–nhóm dùng để chấm. Tags và tên bài do người dùng nhập không tự trở thành phân loại học thuật. Không dùng nhóm “đồ ăn” đối lập “trái cây” nếu một vật hợp cả hai; câu hỏi phải cho một cách phân loại rõ hoặc chấp nhận tất cả vị trí đúng đã duyệt.

**Làm bằng gì:** React; dnd-kit tùy chọn ở đợt có kéo thả. Tham khảo [Studycat Sort the cards](https://help.studycat.com/hc/en-us/articles/58104233239065-Sort-the-cards) và [Wordwall](https://wordwall.net/features).

### V4 — Xưởng xếp chữ

**Mục tiêu:** tạo lại toàn bộ từ, thao tác hoàn toàn bằng chạm.

**Ví dụ:** có hình mèo và loa đọc `cat`; bên dưới là `t`, `c`, `a`. Bé chạm theo thứ tự `c → a → t`. Chạm chữ trên hàng đáp án để trả về; có nút Xếp lại. Khi đủ chữ mới Kiểm tra.

- Đúng: hiện từ hoàn chỉnh, IPA và đọc lại.
- Sai: hiện từ đúng, làm nổi phần cần sửa rồi cho thử lại theo luồng chung.
- Mới chơi từ 3–4 chữ; sau đó 5–6 chữ; từ dài cần chế độ riêng sau.
- Với `apple`, hai chữ `p` là hai tile độc lập. Có thể gợi ý chữ đầu nhưng phải ghi nhận đã gợi ý.

**Dữ liệu:** từ đã duyệt. Bản đầu chỉ hỗ trợ một từ không khoảng trắng với tập chữ đã hỗ trợ; từ viết tắt, dấu gạch nối, dạng đặc biệt chỉ mở khi có quy tắc rõ. Không tự đổi chính tả/case của nội dung.

**Làm bằng gì:** dùng cách chọn/trả tile của game vừa sửa và kỹ thuật token ID của Xếp câu. Không cần thư viện ngoài. Tham khảo dạng Anagram của [Wordwall](https://wordwall.net/en). **Khác Tìm ký tự thiếu:** phải nhớ và xếp toàn từ; mode cũ có nhiều chữ gợi sẵn.

### V5 — Bingo nghe từ

**Mục tiêu:** luyện nhận diện từ nghe được trên một bảng hình; đổi nhịp so với từng câu hỏi độc lập.

**Bé thấy và chơi:** bảng 2×2 cho người mới hoặc 3×3 cho người đã quen. Loa đọc một từ; bé đánh dấu đúng hình. Bản đầu chơi đến khi tìm hết bảng; bản 3×3 có thể có chiến thắng theo hàng/cột nhưng vẫn cho hoàn thành các từ còn lại.

- Bấm loa để nghe lại, không tự đọc liên tục khi bé chưa chọn.
- Sai chỉ nhắc nghe lại, không lấy mất dấu đúng.
- Cue không lặp mục đã hoàn thành trong cùng lượt. Vị trí bảng giữ nguyên.
- Tắt tiếng hoặc thiếu audio: báo cần bật nghe/chọn game khác; không lặng lẽ biến thành bài đọc chữ rồi gọi là luyện nghe.

**Dữ liệu:** tối thiểu 4 hình phân biệt được; 9 hình cho bảng lớn. Số ô giảm theo dữ liệu hợp lệ, không bù ảnh chưa duyệt. Một lần Bingo không có nghĩa mọi từ trên bảng đã được luyện.

**Làm bằng gì:** React/CSS Grid, bộ đọc hiện có; không cần repo ngoài. Đây là biến thể tổng hợp từ luật Bingo và bài nghe của app mình, ưu tiên sau các cơ chế mới vì kỹ năng nền gần mode Nghe từ chọn hình.

### V6 — Thám tử từ vựng

**Mục tiêu:** hiểu từ qua thuộc tính/công dụng và câu mô tả đơn giản.

**Ví dụ:** có hình `car`, `apple`, `book`. Cáo đọc “It has four wheels. You can ride in it.” Bé chạm xe. Sau đó hiện lại mô tả, nghĩa Việt và IPA cả câu; có thể nghe từng câu hoặc toàn mô tả.

- Mới chơi một gợi ý ngắn và 2–3 lựa chọn; khó hơn hai gợi ý.
- Gợi ý bổ sung phải lấy từ nội dung đã duyệt, không tự gọi AI lúc chơi.
- Đúng thì đọc tên vật; sai cho nghe lại đặc điểm quan trọng.
- Nếu trong đáp án có cả `car` và `bus`, mô tả trên không còn duy nhất: thay bộ đáp án hoặc chấp nhận các đáp án đúng đã được xác nhận.

**Dữ liệu còn thiếu:** mô tả phù hợp trình độ và quan hệ mô tả–đáp án. Definition tiếng Anh hiện có chỉ dùng sau khi đã kiểm ngôn ngữ dễ hiểu và không chứa luôn từ đáp án; không cắt câu ngẫu nhiên để tạo đố.

**Làm bằng gì:** React và audio câu. Hướng tình huống lấy cảm hứng từ nội dung ngôn ngữ của [Khan Academy Kids](https://khankids.zendesk.com/hc/en-us/articles/360014856151-Learning-Topics-Using-Khan-Academy-Kids-in-Educational-Settings); mô tả và luật cụ thể ở đây là đề xuất riêng.

### V7 — Săn âm cùng Cáo

**Mục tiêu:** nhận biết âm trong từ; phân biệt với việc thuộc tên chữ cái.

**Ví dụ:** nghe âm `/m/`, rồi chọn những hình có từ bắt đầu bằng âm đó như `moon`, `milk`. Một lượt chỉ hỏi âm đầu; âm cuối và vần là mức sau. Các từ minh họa chỉ xuất hiện nếu đã nằm trong bộ hợp lệ.

- Có nút nghe âm và nút nghe cả từ; chỉ số 1 chữ cái trên màn hình không thay thế cho audio âm.
- Không lấy TTS đọc tên chữ `M` để giả làm âm `/m/`.
- Không suy âm đầu chỉ từ ký tự đầu: `chair`, `ship` và các trường hợp ngoại lệ phải theo dữ liệu âm.
- Chọn cùng một accent cho một lượt; không chấm sai biến thể hợp lệ.

**Dữ liệu còn thiếu:** phoneme đúng accent, quan hệ với chữ/cụm chữ và audio âm riêng có nguồn/quyền sử dụng. CMU dictionary đang có có thể hỗ trợ tra nhưng không tự chứng minh audio hoặc phân đoạn ngữ âm đã đúng. Chưa đủ dữ liệu thì chưa mở game.

**Làm bằng gì:** React; chưa cần engine. Tham khảo hướng phonemic awareness của [Duolingo ABC](https://abc.duolingo.com/how-we-teach?trk=public_post-text). Để đợt 3 vì cần nội dung chuyên môn hơn, không phải chỉ thêm vài nút chữ.

## 6. Mô tả chi tiết các game ngữ pháp

### N1 — Câu thiếu mảnh

**Mục tiêu:** chọn dạng từ/cụm đúng trong ngữ cảnh, thay vì xếp lại một câu đã có đủ từ.

**Ví dụ:** `She ___ happy.`; ba mảnh `am / is / are`. Bé chạm `is` vào ô. Chạm lại để trả mảnh rồi đổi lựa chọn. Lượt đầu một ô khuyết, sau mới hai ô.

- Sau Kiểm tra hiện **She is happy.**, đọc toàn câu, IPA toàn câu và giải thích “She đi với is trong câu này.”
- Có thể mở các bài `a/an`, `this/these`, `is/are`, `have/has` sau khi có nội dung tương ứng.
- Trước khi trả lời không tự đọc nguyên câu có đáp án; chỉ đọc câu hỏi/hướng dẫn hoặc dùng cue đã được soạn riêng. Sau chấm mới đọc câu hoàn chỉnh.
- Câu có nhiều cách đúng phải lưu tập đáp án hợp lệ hoặc đổi câu; không bắt bé đoán cách viết của người ra đề.

**Dữ liệu:** tái dùng grammar/example đã duyệt nhưng cần đánh dấu ô khuyết và các phương án. Không giấu một từ bất kỳ rồi gọi đó là bài ngữ pháp. `a/an` theo âm, không theo ký tự đầu đơn giản.

**Làm bằng gì:** React, cơ chế tile và grammar forms hiện có. Tham khảo [H5P Blanks](https://h5p.org/fill-in-the-blanks) về câu khuyết; thiết kế mình dùng chạm, không yêu cầu nhập bàn phím.

### N2 — Trả lời Cáo

**Mục tiêu:** hiểu câu hỏi và lời đáp phù hợp tình huống.

**Ví dụ:** tranh một con mèo; Cáo hỏi “Is it a cat?”. Bé chọn `Yes, it is.` giữa các câu trả lời được soạn sẵn. Lượt khác dùng tranh một vật khác, cùng câu hỏi, đáp án `No, it isn't.` để bé không chỉ bấm Yes.

- Câu hỏi được đọc khi mở, có loa nghe lại và IPA đúng câu hỏi.
- Các đáp án có loa riêng; chạm loa không được tự nộp đáp án. Bấm phần trả lời mới chọn.
- Sau chấm, đọc cả cặp hỏi–đáp, hiện nghĩa Việt và giải thích ngắn.
- Bắt đầu hai lựa chọn; sau có `What is it?`, `How many…?`, `Where is…?` khi đã có ngữ cảnh.

**Dữ liệu:** tận dụng unit chứa các forms hỏi/trả lời theo ADR075, nhưng phải thêm quan hệ cặp hỏi–đáp và sự thật của cảnh. Không ghép hai câu cùng chủ đề rồi mặc định chúng là một hội thoại. Một câu khác vẫn đúng ngữ pháp có thể không trả lời đúng câu hỏi; feedback phải nói đúng loại lỗi.

**Làm bằng gì:** React, grammar-card/audio hiện có; không cần live chatbot hoặc provider mới. Đây là ứng dụng ngữ pháp theo tình huống, tham khảo định hướng [British Council](https://learnenglishkids.britishcouncil.org/getting-started-for-kids); cặp thoại cần tự soạn/duyệt.

### N3 — Đặt đúng chỗ

**Mục tiêu:** hiểu và dùng giới từ vị trí qua hành động.

**Ví dụ:** có bàn, hộp và quả bóng; nghe “Put the ball under the table.” Bé chạm bóng, rồi chạm vùng dưới bàn. Khi quen có thể kéo bóng vào vùng đó. Đúng thì cảnh giữ nguyên và đọc câu tả kết quả, nếu câu này đã được duyệt.

- Đầu tiên chỉ `in / on / under`; thêm `next to / behind / between` sau.
- Các vùng bấm rộng, có bước chọn đồ rồi chọn chỗ. Không bắt buộc kéo thả.
- Vùng `behind` cần lớp che/hình minh họa thật sự phân biệt được; không đánh giá từ một tọa độ tùy tiện.
- Sai: đồ trở lại vị trí ban đầu, không đổi những đồ đã đúng.

**Dữ liệu còn thiếu:** scene, đồ vật, vị trí đáp án, số lượng và câu lệnh; duyệt quan hệ giữa câu và cảnh. Một ảnh bàn tải từ thư viện không tự tạo được cảnh có `under`/`behind` rõ ràng. Ảnh vật có sẵn có thể tái dùng nếu tương thích khung cảnh và license.

**Làm bằng gì:** bản đầu React với vị trí/vùng bấm khai báo; dnd-kit tùy chọn. Tham khảo [Studycat Furniture Placement](https://help.studycat.com/hc/en-us/articles/59079765837721-Furniture-Placement) và [Games to Learn English](https://www.gamestolearnenglish.com/prepositions-game/). Chưa cần Phaser.

### N4 — Một hay nhiều?

**Mục tiêu:** nối lượng nhìn thấy với dạng danh từ và cấu trúc câu.

**Ví dụ:** cảnh có đúng 2 quyển sách; bé chọn `These are books.` thay cho câu chỉ một quyển. Mức dễ hơn chọn `book / books`; mỗi lượt chỉ tập trung một điểm trước.

- Đọc số lượng/câu sau chấm; có IPA đúng câu.
- Bắt đầu danh từ đếm được có dạng số nhiều đã duyệt; thêm bất quy tắc như `child/children` sau.
- Không tự thêm `s` cho mọi từ; không đem `water` vào bài đếm đồ vật như `book`.
- Những hình có nhiều vật trong cùng ảnh chỉ dùng khi số lượng thực sự được xác nhận. Hai ảnh bản sao cần hai instance riêng, vẫn cùng một nghĩa từ.

**Dữ liệu còn thiếu:** dạng số ít/số nhiều, countability, lượng của cảnh và câu tương ứng. POS noun hiện có chưa đủ. Không suy `fish → fishs` hay `person → persons` thành đáp án mặc định.

**Làm bằng gì:** React/CSS, media và grammar đã có. Tham khảo nhóm plurals/there is–are của [Grammar Bubbles](https://www.gamestolearnenglish.com/grammar-bubbles/) và [British Council grammar practice](https://learnenglishkids.britishcouncil.org/grammar-vocabulary/grammar-practice).

### N5 — Bác sĩ câu

**Mục tiêu:** nhận ra mảnh sai và sửa để tạo câu đúng.

**Ví dụ:** hiện `She are happy.`. Bé chạm `are`, thấy các mảnh `am / is`, chọn `is`. Kiểm tra xong hiện `She is happy.` và lời giải ngắn.

- Lượt dễ đánh dấu sẵn mảnh cần sửa; lượt sau mới để bé tìm lỗi.
- Chỉ một lỗi mỗi câu ở đợt đầu; không biến thành bài soát lỗi nhiều lớp cho bé nhỏ.
- Không tự đọc câu sai như một mẫu phát âm cần bắt chước. Chỉ đọc hướng dẫn và câu đúng sau khi sửa.
- Nếu câu nguồn chỉ khác sở thích diễn đạt, không có lỗi thật, phải loại. Chấp nhận mọi cách sửa hợp lệ được duyệt.

**Dữ liệu:** app đã có `commonError`, `correction`, IPA liên quan và giải thích ở learning content; cần xác định mảnh lỗi, mảnh thay thế và kiểm tính duy nhất. Đây là lợi thế thực tế để ưu tiên sớm.

**Làm bằng gì:** React và nội dung grammar hiện có; không cần repo ngoài. Nên đặt giao diện nhẹ nhàng “Cùng sửa câu”, không chê bé. Tên Bác sĩ câu chỉ là tên game đề xuất.

### N6 — Truyện ba tranh

**Mục tiêu:** hiểu câu theo mạch sự việc; luyện First/Next/Finally và quan hệ câu–tranh.

**Ví dụ:** nghe câu chuyện đã soạn: Cáo tìm được hạt, gieo hạt, sau đó có hoa mọc. Ba tranh trộn thứ tự; bé chạm để xếp theo câu chuyện. Bấm tranh đã chọn để trả lại. Xong thì phát lại truyện theo thứ tự đúng.

- Mới chơi 2 cảnh, sau 3 cảnh; không yêu cầu bé đọc đoạn dài.
- Thứ tự đúng dựa trên câu chuyện được nghe, không dựa vào việc người ra đề cho rằng một thói quen đời thường chỉ có một thứ tự.
- Có loa nghe lại từng câu, IPA cả câu và nghĩa Việt sau khi chấm.
- Nếu hai cảnh đổi chỗ vẫn đúng truyện, cần chấp nhận nhiều thứ tự hoặc sửa nội dung.

**Dữ liệu còn thiếu:** truyện, các scene và quan hệ thời gian đã duyệt; không ghép ba câu độc lập có trong kho thành truyện tự động. Ưu tiên chủ đề gần gũi, ba cảnh tĩnh đồng bộ nét vẽ.

**Làm bằng gì:** React, tile/scene hiện có nếu đủ; không bắt buộc video hoặc game engine. Tham khảo hướng truyện tương tác của [Duolingo ABC](https://abc.duolingo.com/how-we-teach?trk=public_post-text) và [Khan Academy Kids](https://www.khanacademy.org/kids); truyện cụ thể do mình chuẩn bị.

### N7 — Cửa hàng của Cáo

**Mục tiêu:** dùng từ vựng, số lượng và mẫu yêu cầu trong một nhiệm vụ nhỏ.

**Ví dụ:** Cáo đọc “Two apples, please.”. Bé đưa đúng 2 quả táo vào khay rồi bấm Giao hàng. Sau đó nghe lời xác nhận/cảm ơn. Lượt sau đổi đồ hoặc lượng; không có tiền thật hay mua hàng trong game.

- Mới chơi một món, một yêu cầu; khó hơn hai món, tối đa số lượng nhỏ.
- Chạm món để thêm; chạm món trong khay để bỏ. Không kéo liên tục bằng ngón tay nếu bé thấy khó.
- Trả sai: chỉ rõ “Cần 2 quả táo”, giữ các phần đã đúng khi phù hợp; không coi thiếu số lượng là sai phát âm.
- Có thể thêm “Can I have…?” và câu trả lời lịch sự khi đã có bộ hội thoại tương ứng.

**Dữ liệu còn thiếu:** loại đồ, countability, số lượng yêu cầu, câu yêu cầu và phản hồi, vật thể trong cảnh. Không mở rộng từ việc mọi ảnh trong kho đều được coi là món ăn/hàng đếm được.

**Làm bằng gì:** bản đầu React với khay và item instance. Nếu sau này muốn nhân vật đi lại, va chạm và cảnh chuyển động liên tục mới cân nhắc Phaser. Đây là đề xuất tổng hợp của mình, không khẳng định là một game cụ thể đã xác minh trong các app thương mại.

## 7. Xếp các game trên màn Chơi & học thế nào?

Giữ Theme C, Nunito, Cáo và điều hướng hiện có. Không thêm 14 card vào cuối màn đang dài.

Đề xuất để review:

- Phạm vi bài/nhóm vẫn ở trên; ngay dưới có **“Chơi một lượt ngắn”** và **“Tự chọn game”**.
- Tự chọn chia hai nhóm **Từ vựng / Ngữ pháp**. Trong mỗi nhóm, có thể lọc **Nghe**, **Ghép & nhớ**, **Chữ & câu**, **Tình huống**; đây là lọc nội dung trong trang, không thêm nav chính.
- Card có hình, tên, một câu nói rõ thao tác, và trạng thái đủ/chưa đủ dữ liệu. Ví dụ “Cần ít nhất 3 hình đã duyệt” hoặc “Bài này chưa có cặp hỏi–đáp”.
- Game thiếu dữ liệu có nút chọn phạm vi khác/thêm nội dung đúng luồng hiện có; không tự đổi sang kho khác hoặc gửi AI.
- Gợi ý lượt ngắn là **cách phối các game đã có**, không tính thành game thứ 15. Ưu tiên nội dung chưa làm của đúng phạm vi; không tự đổi SRS hoặc tạo thêm một hệ tiến độ cạnh tranh.

Ví dụ một lượt phối: **Nối 3 cặp → Xếp 2 từ → Hoàn thành 2 câu → Kết quả**. Số câu và thời lượng là thiết kế cần thử, không phải thời gian học đã được đo. Đợt đầu có thể ra mắt sáu game riêng trước, thêm lượt phối sau khi phiên/cách đếm ổn định.

## 8. Dữ liệu: phần nào dùng lại được, phần nào phải chuẩn bị?

| Loại dữ liệu | Đang có | Cần bổ sung cho game mới |
|---|---|---|
| Từ, nghĩa, POS, hình | Có kho theo sense/revision, review và media readiness | Kiểm sự rõ nghĩa cho cả đáp án lẫn nhiễu; số lượng/cảnh không tự suy từ ảnh |
| Audio và IPA | Có audio word/sentence, IPA và nguồn/trạng thái | Câu lệnh/mô tả mới phải có đúng text/version; phoneme audio là loại còn thiếu |
| Ngữ pháp | Có construction/forms, examples, conditions, commonError/correction | Đánh dấu ô khuyết, tập đáp án, cặp hỏi–đáp, mảnh lỗi |
| Nhóm nghĩa/thuộc tính | Có tags và nhóm tổ chức bài | Cần phân loại/thuộc tính học tập được duyệt riêng; không coi tên nhóm cá nhân là sự thật ngôn ngữ |
| Tình huống/truyện | Có từng câu/ví dụ | Cần scene, quan hệ không gian/số lượng/thứ tự và evidence nguồn |

**Đề xuất cách chuẩn bị:** mỗi bộ game có “mô tả bài chơi” khai báo: liên kết nội dung gốc + phiên bản, hướng dẫn, mục tiêu, đáp án hợp lệ, lời giải và media. Bản tự soạn/AI gợi ý phải được review trước khi dùng; sửa câu nguồn làm các mô tả phụ thuộc trở thành cần kiểm lại. Không để AI chạy để quyết định đúng/sai trong lúc bé chơi.

Đợt 1 nên chuẩn bị mẫu để review khoảng **12 từ có hình rõ**, **12 câu khuyết**, **8 tình huống hỏi–đáp**, **8 cặp lỗi–câu sửa**. Đây là mục tiêu chuẩn bị nội dung mới, chưa phải số dữ liệu đã kiểm là có trong kho. Mỗi game vẫn lọc theo phạm vi đang chọn; không âm thầm trộn bộ mẫu vào bài của người dùng.

## 9. Cần những repo GitHub nào?

**Kết luận lựa chọn:** đợt 1 cần **0 dependency runtime mới**. Dùng React/CSS, thư viện hiện có và bộ dữ liệu của mình. Repo ngoài chia thành nguồn đọc tham khảo, thư viện tùy chọn, và engine chưa cần.

Thông tin dưới đây lấy từ GitHub API ngày 24/10/2026; stars/forks là số của **đúng repo**, không phải số của cả hệ sinh thái. Chúng chỉ giúp đánh giá nguồn, không chứng minh phù hợp với trẻ hoặc đã tương thích app.

| Repo / đơn vị duy trì | Stars / forks | License và hoạt động quan sát được | Nên dùng vào đâu? | Quyết định đề xuất |
|---|---:|---|---|---|
| [clauderic/dnd-kit](https://github.com/clauderic/dnd-kit) — maintainer clauderic/cộng đồng | 17.747 / 931 | MIT; HEAD 22/10/2026; không archived | Kéo đồ/vùng thả N3, kéo phân loại V3, sắp tranh N6; có input touch/keyboard | **Tùy chọn sau**. Luôn giữ chạm-chọn/chạm-đặt. Docs hiện có kiến trúc/package mới; không copy mù tutorial API cũ. |
| [motiondivision/motion](https://github.com/motiondivision/motion) — Motion | 34.487 / 1.457 | MIT; HEAD 23/10/2026; không archived | Chuyển vị trí, lật thẻ/nhận phần thưởng nếu CSS chưa đáp ứng | **Chưa cần cài**. CSS hiện có đủ bản đầu; thư viện không tự tạo nội dung hay luật game. |
| [h5p/h5p-memory-game](https://github.com/h5p/h5p-memory-game) — H5P/Joubel | 20 / 66 | `library.json` khai báo MIT; HEAD 16/10/2026; không archived | Xem cấu trúc thẻ, trạng thái matched, audio và feedback của V2 | **Đọc tham khảo**. Ít stars ở repo này; không gọi là repo lớn chỉ vì H5P nổi tiếng. |
| [h5p/h5p-blanks](https://github.com/h5p/h5p-blanks) — H5P/Joubel | 10 / 81 | `library.json` khai báo MIT; HEAD 21/08/2026; không archived | Xem mô hình cloze/đáp án/feedback cho N1 | **Đọc tham khảo**, tự viết renderer React để hợp mobile và data của mình. |
| [h5p/h5p-drag-question](https://github.com/h5p/h5p-drag-question) — H5P/Joubel | 8 / 91 | `library.json` khai báo MIT; HEAD 18/10/2026; không archived | Tham khảo quan hệ vật–vùng thả cho V3/N3 | **Đọc tham khảo**, không nhúng cả runtime/editor H5P. |
| [phaserjs/phaser](https://github.com/phaserjs/phaser) — Phaser Studio | 40.553 / 7.182 | MIT; HEAD 21/08/2026; không archived | Nếu N7 sau này thành game 2D có scene/update loop/va chạm | **Để sau**. Không cần cho bảng thẻ, câu khuyết hay shop tĩnh. |
| [pixijs/pixijs](https://github.com/pixijs/pixijs) — PixiJS | 48.447 / 5.105 | MIT; HEAD 22/10/2026; không archived | Renderer 2D nếu có cảnh nhiều sprite; game rules vẫn tự xây | **Không dùng cùng Phaser chỉ để làm một cảnh**. Chưa cần cho roadmap đầu. |

GitHub API không tự nhận diện license của ba repo H5P; bảng dựa trên trường license trong library.json tại commit đã đọc: [Memory](https://raw.githubusercontent.com/h5p/h5p-memory-game/359c27ea0858d6503223f7a25e188286a0561525/library.json), [Blanks](https://raw.githubusercontent.com/h5p/h5p-blanks/e6d8858d74d628c4dd78924fd306a06cbbcdc90e/library.json), [Drag Question](https://raw.githubusercontent.com/h5p/h5p-drag-question/2db54624d80b38f2851b5046d9a7a4aaddf1120a/library.json). Nếu tái sử dụng code thì còn phải đọc header, dependencies và notices đúng phần lấy. License code không tự cấp quyền sử dụng mọi ảnh/audio mẫu. [H5P phân biệt license nội dung và code](https://h5p.org/licensing).

Tài liệu kỹ thuật đã đối chiếu: [dnd-kit](https://dndkit.com/), [Motion React](https://motion.dev/docs/react), [Phaser](https://docs.phaser.io/phaser/getting-started/what-is-phaser), [PixiJS](https://pixijs.com/8.x/guides/getting-started/intro). Chưa chạy compatibility/bundle benchmark các dependency tùy chọn; khi thực sự chọn sẽ pin version, kiểm React19/Next16, touch/keyboard, SSR/client boundary và tải thêm trên mobile.

### Commit tham chiếu để tra lại

Các hash này là **mốc nghiên cứu, không phải version đã cài**:

| Repo | Commit |
|---|---|
| dnd-kit | `2fcef8180f68a0cff6d629089ed014ea2131cbe6` |
| Motion | `fa2079f101353f1fa1c9463f5ba9709a0ca3d3bf` |
| H5P Memory | `359c27ea0858d6503223f7a25e188286a0561525` |
| H5P Blanks | `e6d8858d74d628c4dd78924fd306a06cbbcdc90e` |
| H5P Drag Question | `2db54624d80b38f2851b5046d9a7a4aaddf1120a` |
| Phaser | `02d8931b626d9764c133cbb3fbf99966c03c757c` |
| PixiJS | `b78ff35152f9b28fdf0289b54bc2deacd62956b6` |

## 10. Cần skill gì?

Repo runtime và coding skill là hai thứ khác nhau: thư viện có thể chạy trong app; skill là hướng dẫn cho agent làm nội dung/code/kiểm tra. **Bộ skill hiện có đã đủ để bắt đầu; không đề xuất cài thêm skill hoặc MCP trong lượt này.**

| Skill đã có | Dùng để làm gì? | Game/phần liên quan |
|---|---|---|
| [bilingual-learning-content](../.agents/skills/bilingual-learning-content/SKILL.md) | Mục tiêu 5–8 tuổi, nghĩa theo sense, câu Việt/Anh, đáp án không mơ hồ, IPA đúng text | Tất cả; đặc biệt V3/V6/V7 và N1–N7 |
| [vocabulary-delivery](../.agents/skills/vocabulary-delivery/SKILL.md) | Phân đợt, giữ boundaries, ghi evidence và bàn giao | Toàn roadmap |
| [ui-ux-pro-max](../.agents/skills/ui-ux-pro-max/SKILL.md) + [impeccable](../.agents/skills/impeccable/SKILL.md) | Luồng chơi dễ hiểu, touch, khoảng cách, trạng thái thiếu nội dung | Hub và các board game |
| [motion-design](../.agents/skills/motion-design/SKILL.md) | Lật thẻ, ghép đúng, trả tile, pause/reduced motion | V1/V2/V3/V4/N3/N6; chuyển động không che bài |
| [accessibility](../.agents/skills/accessibility/SKILL.md) | Chạm thay kéo, keyboard/remote, focus, screen reader | Mọi game, đặc biệt V3/N3/N6 |
| [vercel-react-best-practices](../.agents/skills/react-best-practices/SKILL.md) | State, render, tải code theo game, không làm nặng hub | Tất cả renderer |
| [systematic-debugging](../.agents/skills/systematic-debugging/SKILL.md) | Repro đúng fixture/device, điều tra lỗi lưu/audio/interaction | Khi gặp lỗi, không sửa theo phỏng đoán |
| [performance](../.agents/skills/performance/SKILL.md) / [core-web-vitals](../.agents/skills/core-web-vitals/SKILL.md) | Đo khi có game/assets/dependency mới ảnh hưởng tải hoặc phản hồi | Đợt có scene, dnd-kit, Motion hoặc engine |
| [supabase-postgres-best-practices](../.agents/skills/supabase-postgres-best-practices/SKILL.md) | Schema/validation/RLS/migration và kiểm data boundaries khi triển khai persistence mới | Phiên game/mode mới có sync; đọc trước khi sửa SQL |

Không cần cài skill chung tên “game development” chỉ vì có chữ game. Nếu về sau dùng Phaser, trước hết dùng docs/official examples của đúng version; skill ngoài mới vẫn phải qua quy trình ADR078 về maintainer, nội dung, license, stack, commit/hash. Chưa xác minh một skill ngoài mới nào là cần thiết ở đây.

## 11. Plan triển khai sau khi được duyệt

### Đợt 0 — Nền dùng chung và mẫu nội dung

**Kết quả cần có:** bản thiết kế ba board đại diện (nối/lật, câu có tile, cảnh đặt đồ), bộ ví dụ để founder hiểu luật, và hợp đồng dữ liệu của sáu game đầu.

Việc chính:

1. Registry mô tả game, điều kiện dữ liệu và cách mở, dùng cùng phạm vi hiện có; không làm một hệ thư viện mới.
2. Mô hình câu hỏi phân theo kiểu bài. Session hiện chỉ có một word/choices/missingIndices/grammar; bảng nhiều cặp, cảnh và truyện cần snapshot riêng có version.
3. Chốt cách đếm cho bảng nhiều mục: **một board là một câu trong phiên, có danh sách mục tiêu**; hoàn thành board ghi kết quả chi tiết theo mục. Không cộng coverage vì chỉ xuất hiện trên bảng. Item đã hỗ trợ/hint, sai, skip, replay được phân biệt theo ADR100.
4. Xác định những trạng thái cần giữ khi tạm dừng: cặp đã nối, thẻ đã ghép, tile đã xếp, lựa chọn đang làm. Cần khôi phục đúng thứ tự snapshot, không random lại làm mất tiến độ.
5. Phiên mới vẫn có giới hạn lượt ngắn và đọc toàn pool hợp lệ trước chia lượt; không im lặng cắt kho/giới hạn đầu danh sách.
6. Chuẩn bị mô tả bài chơi có review; không suy đáp án từ tags hoặc gọi AI lúc chấm.

**Điểm kỹ thuật bắt buộc:** thêm mode không chỉ sửa một card. Phải rà types/Zod, local persistence, coverage, archive/backup, cloud codec/validation và các allowlist/projection/shared-progress ở SQL. Session cũ phải đọc được. Nơi shared chỉ đọc nội dung không được mở quyền ghi nội dung để chơi game; kết quả dùng đúng boundary tiến độ đang có.

### Đợt 1 — Sáu game nên làm trước

Thứ tự: **V1 Nối đôi → V4 Xưởng xếp chữ → N1 Câu thiếu mảnh → N5 Bác sĩ câu → V2 Lật thẻ → N2 Trả lời Cáo**.

- V1/V4 mở đầu bằng dữ liệu đơn giản để ổn định board/tile.
- N1/N5 tăng giá trị ngữ pháp, tận dụng câu và lỗi đã có nhưng bổ sung annotations.
- V2 dùng lại cặp của V1, thêm trạng thái memory.
- N2 chốt với bộ hỏi–đáp đã duyệt; không tự bật chỉ vì có câu hỏi.

Ra mắt trước các game đã đủ nội dung và persistence; không để các game đơn giản chờ toàn bộ scene/story của các đợt sau. Phải có kiểm mobile thật trước khi gọi là founder/device acceptance.

### Đợt 2 — Năm game thêm tình huống

**V3 Xếp vào giỏ, V5 Bingo, V6 Thám tử, N3 Đặt đúng chỗ, N4 Một hay nhiều.**

Điều kiện: có tập phân loại, mô tả và một số cảnh/quantity đã duyệt; source/license và audio đúng phiên bản. Chỉ thêm dnd-kit nếu kiểm thao tác cho thấy kéo thả có lợi hơn bản chạm; luôn giữ đường chạm-chọn/chạm-đặt.

### Đợt 3 — Ba game cần nội dung chuyên biệt

**V7 Săn âm, N6 Truyện ba tranh, N7 Cửa hàng của Cáo.**

Điều kiện: phoneme/audio đã đối chiếu, bộ truyện/cảnh/hội thoại đầy đủ. Bản shop tĩnh và truyện ba tranh vẫn ưu tiên React; chỉ làm spike Phaser/Pixi khi yêu cầu scene chuyển động liên tục đã cụ thể.

### Ước lượng để cân nhắc phạm vi

Ước lượng sơ bộ cho **một người triển khai có hiểu repo**, gồm code và kiểm scoped, chưa gồm thời gian founder duyệt/nội dung mới/thiết bị chờ. Không phải lịch cam kết, cũng không quy đổi thành token hay thời gian chạy agent.

| Phần | Khoảng ngày công tham khảo | Yếu tố dễ làm tăng công |
|---|---:|---|
| Đợt 0 | 3–5 | Persistence nhiều mục, backup/cloud/shared validation |
| Đợt 1, sáu game | 8–14 | Annotations/cặp hỏi–đáp thiếu, edge cases resume, kiểm iOS |
| Đợt 2, năm game | 10–18 | Scene, phân loại, quantity và distractor không mơ hồ |
| Đợt 3, ba game | 10–20 | Phonics/audio, tranh truyện và hội thoại mới |

Vì vậy nên duyệt từng đợt. Không cần cam kết toàn bộ 14 game trước khi chơi thử sáu game đầu. Sau đợt 0 phải cập nhật lại ước lượng bằng dữ liệu/contract thật.

## 12. Quy tắc trải nghiệm và nghiệm thu

### Trải nghiệm bé cần nhận được

- Mỗi màn một nhiệm vụ rõ, hướng dẫn Việt ngắn và có audio khi phù hợp. Tăng độ khó theo khả năng, không chỉ theo tuổi.
- Chạm là đường chính; chạm tile đã chọn để bỏ, sửa được trước nộp. Không tự bật keyboard cho game tile.
- Nút/vùng chạm khoảng 48 CSS px trở lên khi có thể, cách nhau đủ; board gọn ở mobile, không chỉ thu nhỏ desktop. Có keyboard/remote alternative.
- Loa dừng được, nghe lại được, tôn trọng tắt tiếng; autoplay chỉ phát đúng cue. Audio bị chặn/không có voice có retry và hướng chuyển game, không treo lượt.
- Chỉ hiện/read đáp án khi đúng thời điểm. IPA cả câu khớp nguyên câu; dữ liệu chưa chắc không mang nhãn verified.
- Không mặc định đếm ngược/trừ mạng; có bản giảm chuyển động. Đúng/sai không chỉ thể hiện bằng màu.
- Hình đúng nghĩa, đã approved+ready, nguồn/license giữ lại; không thêm mặt vào đồ vật/thức ăn chỉ để làm dễ thương. Cáo là nhân vật dẫn riêng.
- Phần thưởng nhẹ trong lượt; không tự suy bé đã nhớ lâu, không thay SRS bằng điểm game.

### Các ca phải qua trước khi release từng đợt

| Boundary | Kiểm gì? |
|---|---|
| Luật và nội dung | Đáp án đúng/sai, nhiều đáp án hợp lệ, chữ trùng, nghĩa/POS khác nhau, câu hỏi không lộ lời giải; người duyệt kiểm cả nội dung chứ không chỉ JSON |
| Board/touch | Chọn/bỏ/đổi, chạm nhanh không nhân đôi, dừng animation, vùng thả sai, không bàn phím mobile ngoài ý muốn |
| Lưu và resume | Pause/reload/offline giữ tiến độ; source sửa/xóa làm stale; CAS và retry không ghi đôi; replay không tăng coverage như mục mới |
| Coverage | Board nhiều mục không cộng những mục chưa làm; skip còn quay lại; set/day vẫn theo scope và hợp đồng hiện có |
| Scope và dữ liệu | Kho riêng/shared, chủ/người nhận, read-only content, logout/switch; không lẫn câu/ảnh giữa kho |
| Backup/cloud | Export/import giữ contract mới và session cũ; validation/projection không làm rơi trường; SQL hosted chỉ claim khi có evidence thật |
| Audio và media | Mute, autoplay policy, nghe lại/stop, mất mạng, ảnh hỏng và thu hồi approval; không gọi provider thật trong test fixture mặc định |
| UI | Một số main/error ở mobile+desktop cô lập; iOS/PWA/TV remote thủ công theo thiết bị thực sự hỗ trợ; detector không thay human pass |
| Performance | Lint/types + behavior scoped; build cuối khi đổi route/config/PWA/offline/dependency; đo tải thêm nếu có engine/library mới, không full suite sau mỗi sửa nhỏ |

Các game dựa vào âm cần nội dung/voice đã có sẵn để chơi offline; không hứa mọi audio online tự hoạt động khi mất mạng. Offline shell cần kế hoạch tương thích theo từng mode; chưa có bản tương ứng thì nói rõ và không làm hỏng phiên đang dở.

## 13. Các hướng để sau

- **Chạy vô tận, né vật cản, bắn/đập mục tiêu tốc độ cao:** có thể vui, nhưng tốn engine/assets và dễ đo phản xạ nhiều hơn ngôn ngữ. Không ưu tiên trước game dùng từ/câu.
- **Hangman:** bài xếp chữ thân thiện đã giải quyết phần chính tả; chưa cần thêm theme treo cổ hoặc mất mạng.
- **Word search/crossword:** để sau cho trẻ đọc tốt, từ dài và bàn phím/ô nhỏ hiện chưa phù hợp ưu tiên mobile.
- **Chatbot hoặc chấm tự do bằng AI trong mọi game:** tăng latency, quota và khó bảo đảm đáp án; đợt đầu chấm bằng dữ liệu đã duyệt. Speaking hiện có giữ boundary riêng.
- **Đổi skin của một quiz thành nhiều tên game:** có thể là theme tùy chọn, không tính thành nhiều cơ chế học mới trong roadmap này.

## 14. Các điểm founder có thể chốt sau khi đọc

1. Giữ đề xuất **6 game đợt đầu**, hay đổi một game bằng Đặt đúng chỗ để có một cảnh trực quan sớm? Đổi như vậy cần thêm cảnh/nội dung và tăng công.
2. Ưu tiên bé **chưa đọc được**, hay bé **đọc từ/câu ngắn**? Mặc định đề xuất vẫn có audio, nhưng V4/N1/N5 cần mức đọc cao hơn V2/N3.
3. Giữ **chạm trước, kéo tùy chọn**, không mặc định đồng hồ/trừ mạng?
4. Nội dung mới sẽ chuẩn bị theo **bài/nhóm hiện có**, kèm các mô tả bài chơi được duyệt; không tự nhập cả giáo trình khác vào kho?

Founder đã chọn làm Đợt0+1 theo danh sách sáu game đề xuất. Các tùy chọn ngoài phạm vi đó vẫn cần review riêng trước khi triển khai.

## Phụ lục — Những vùng source đã đối chiếu

- [Danh sách mode và PracticeRepository](../src/data/local/practice.ts): model câu hỏi/phiên, source revision, picture readiness, coverage.
- [Màn Chơi & học](../src/components/features/practice.tsx), [tên mode](../src/components/features/session-history.tsx), [tile điền chữ](../src/components/features/missing-letters-question.tsx).
- [Xếp câu](../src/components/features/grammar-question.tsx), [grammar snapshot](../src/lib/learning/grammar-game.ts), [learning content](../src/data/local/content.ts): forms, commonError/correction và dữ liệu nguồn.
- [AudioControl](../src/components/app/audio-control.tsx), [WordPronunciation](../src/components/app/word-pronunciation.tsx), [offline games](../public/offline-games.js).
- [Spec game](08-learning-and-games.md), [plan coverage](ai/GAME-COVERAGE-PLAN.md), [skill catalog](skills/CATALOG.md).

Lượt này chỉ tạo proposal/tài liệu; không cài dependency/skill, không thay source app/database, không chạy app tests/build hoặc deploy. Kiểm tài liệu: `git diff --check` PASS;274local Markdown links trong5file thay đổi PASS; inventory14game đủ/không trùng ID PASS. Không chạy full docs checker vì lượt trước đã ghi nhận3link kết quả tạm cũ bị mất ngoài phạm vi; không sửa chúng trong proposal này. Metadata repo được đọc qua API chính thức; HEAD là commit của default branch, không phải chứng nhận release ổn định hoặc tốc độ bảo trì dài hạn.
