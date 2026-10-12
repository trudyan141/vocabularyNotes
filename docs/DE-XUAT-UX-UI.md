# Đề xuất làm Words for Kids dễ dùng hơn

Ngày review: **12/10/2026**. Trạng thái: **bạn đã duyệt; cả4đợt và hai lỗi nhóm đã sửa trên bản local**.

Mình đã đọc toàn bộ nhóm màn hình trong code, đối chiếu với UI/UX Pro Max và chụp giao diện hiện tại trên điện thoại giả lập 360px, máy tính 1280px. Đây là đánh giá của agent; chưa phải kết quả quan sát trẻ sử dụng thật. Bảng bên dưới giữ lại kế hoạch đã duyệt. [Bằng chứng và ảnh sau sửa](evaluations/ux-ui-implementation.md):46test dữ liệu/logic và66caUI production qua; chưa kiểm với trẻ/điện thoại thật.

## Điều cần sửa trước

App đã có màu sắc, Cáo, hình minh họa, nút lớn và phản hồi trò chơi khá rõ. Điểm vướng lớn nhất là **đường đến việc cần làm còn dài**: phải đi qua nhiều nút quản lý, nhiều ô nhập hoặc cuộn xuống mới tới nút quan trọng.

Mình đề xuất ưu tiên:

1. **Tắt tiếng phải giữ được.** Đã thử: tắt tiếng ở Cài đặt → mở Chơi & học → quay lại Cài đặt thì tiếng tự bật. Sửa việc này trước khi thêm âm thanh mới.
2. **Tìm và học nhanh hơn.** Đưa tìm kiếm, thẻ từ và việc học hôm nay lên cao hơn; gom thao tác quản lý vào phần phụ.
3. **Thêm/sửa từ gọn hơn.** Hiện màn thêm từ có 16 ô nhập khi mở lần đầu và nút Lưu nằm rất xa phía dưới. Cho xem bản tóm tắt dễ kiểm, mở sửa chi tiết khi cần.
4. **Duyệt bài từ ảnh dễ kiểm hơn.** Mỗi hàng nên nhìn được từ + nghĩa + có chọn lưu hay không, thay vì phải mở từng từ mới biết nghĩa.
5. **Thêm tiếng và chuyển động đúng chỗ.** Ưu tiên lúc trả lời, hoàn thành buổi học và thay đổi trạng thái; màn nhập bài và quản lý vẫn yên tĩnh.

Ảnh hiện tại: Thư viện bên trái, Thêm từ bên phải.

![Hai màn cần ưu tiên làm gọn](evaluations/ux-review-2026-10-12/priority-before.webp)

## Rà soát từng màn hình

“Cần sửa” là đề xuất dựa trên quan sát hoặc code. “Giữ” nghĩa là chưa thấy lý do để đổi lớn, không có nghĩa mọi tình huống đã đạt kiểm thử.

| Màn hình / phần sử dụng | Chỗ bất tiện hoặc điểm cần giữ | Đề xuất dễ hình dung | Ưu tiên |
|---|---|---|---|
| Chào mừng | Một nút Bắt đầu rõ; Cáo chào ngắn đã có | Giữ bố cục và chuyển động hiện có. Không thêm giới thiệu dài hay tiếng tự phát | Giữ |
| Hôm nay | Khối Cáo lớn; Ôn bài hôm nay phải xuống gần cuối màn đầu tiên; Thêm từ ở dưới nữa | Thu gọn khối chào. Khi có từ cần ôn, hiện nút **Ôn 10 từ hôm nay** trong khối đầu; bên dưới vẫn có Gõ từ / Thêm bài từ ảnh. Nếu không có từ đến hạn, hiện Chơi 5 phút | Sớm |
| Thư viện Từ | Ô tìm kiếm bắt đầu ở khoảng 614px; danh sách từ nằm dưới màn đầu trên điện thoại. Các nút quản lý chiếm chỗ | Đặt Từ / Ngữ pháp → Tìm kiếm → danh sách lên trước. Gom Bộ theo ngày / Nhóm / Bổ sung hình dưới **Sắp xếp bài**. Giữ Thêm từ rõ ràng | Sớm |
| Thư viện Ngữ pháp | Dùng cùng phần đầu nhiều nút; khi rỗng chỉ có câu “Chưa có ngữ pháp phù hợp” | Dùng phần đầu gọn như Từ. Phân biệt “chưa thêm ngữ pháp” và “không tìm thấy”; có nút thêm bài hoặc xóa tìm kiếm phù hợp | Sớm |
| Bộ từ theo ngày / bài vừa lưu | Đã có hình, ngày, nút học; tên bài/bộ từ/nhóm dễ làm người mới nhầm | Gọi nhất quán **Bài theo ngày**. Mỗi bài ưu tiên tên + ngày + Học bài này; sửa/xóa là thao tác phụ. Lưu từ ảnh xong hiển thị số từ/ngữ pháp cùng nút Học bài này | Sau |
| Danh sách và chi tiết nhóm | Tạo nhóm, xem số mục và Học ngay đã rõ | Giữ; thêm lời ngắn ở trạng thái trống để biết nhóm dùng để gom bài. Không thêm mục vào thanh điều hướng chính | Sau |
| Tạo/sửa nhóm | Có “Chọn tất cả từ và ngữ pháp”, “Chọn tất cả N mục”, “Chọn cả trang”; dễ nhầm phạm vi. Nút Lưu ở cuối danh sách dài | Một nút chọn tất cả rõ phạm vi đang xem; lựa chọn toàn bộ từ + ngữ pháp vẫn có trong Thêm cách chọn. Luôn thấy **Đã chọn… / Lưu nhóm** khi cuộn trên điện thoại | Sớm |
| Chọn nhóm để ôn | Khi chưa có nhóm đã có Tạo nhóm, nhưng thiếu đường ôn không cần nhóm | Giữ Tạo nhóm, thêm Ôn tất cả từ ngay trạng thái trống; không ép tạo nhóm trước khi học | Sau |
| Tạo/sửa bộ thẻ | Có cách ôn và chọn nhiều trang, nhưng cùng nhiệm vụ chọn từ lặp ở nhóm; Lưu ở xa | Giữ tính năng, giải thích “Bộ thẻ để chọn các từ muốn ôn”. Dùng chung kiểu chọn và thanh Lưu với nhóm. Chưa gộp/xóa nhóm hay bộ thẻ | Sớm |
| Chi tiết từ | Hình, từ, Nghe/Nói/Nghe chậm đã dễ thấy. Khi có nhiều ví dụ sẽ dài | Giữ phần đầu. Thêm ví dụ đặt dưới phần mở rộng; Ôn từ này dễ tìm. Khi tắt tiếng, chỉ cách bật lại thay vì nút Nghe bị mờ mà không giải thích | Sau |
| Thêm từ mới | Ngày học ở trước ô từ; 16 ô nhập và thông tin IPA/tên nghĩa cùng hiện; nút Lưu ở khoảng 2380px | Ô Từ tiếng Anh trước; ngày hôm nay điền sẵn, đổi khi cần. Sau tra, cho kiểm **Từ – nghĩa – hình – một ví dụ**. Mở **Sửa chi tiết** cho POS, tên nghĩa, IPA và ví dụ thứ hai. Một nút Lưu chung, không tự lưu kết quả tra | Sớm |
| Sửa từ | Nhiều ô cách đọc/ví dụ; muốn đổi hình phải cuộn xa. Nút xóa ở đầu gần khu học | Mở đầu bằng bản tóm tắt; chia phần Nội dung / Hình / Ví dụ / Ngữ pháp có thể mở riêng. Một Save chung, có báo Chưa lưu / Đang lưu / Đã lưu / lỗi. Giữ xác nhận xóa | Sớm |
| Ghi chú | Ô nhập trực tiếp đơn giản | Giữ; chỉ cải thiện lời nhắc chưa lưu và lỗi nếu kiểm lại thấy còn thiếu. Không thêm AI/animation chỉ để trang sinh động | Giữ |
| Chọn/chụp/dán ảnh | Có đầy đủ ba cách, nhưng “Kéo thả” là lời chính cả trên điện thoại | Điện thoại ưu tiên **Chọn ảnh từ máy**, Dán ảnh, Chụp ảnh; máy tính vẫn có kéo thả. Chỉ hướng dẫn đúng thiết bị; lỗi có nút dùng cách khác | Sau |
| Xem/cắt/xoay ảnh | Có giữ nháp và kiểm ảnh trước phân tích; nhiều thao tác chỉnh | Giữ preview lớn. Các thao tác chỉnh gom một hàng có nhãn. Thêm dấu bước **1 Chọn ảnh → 2 Đọc ảnh → 3 Kiểm và lưu** bằng chữ/hình nhỏ | Sau |
| Nhiều ảnh chung một bài | Đúng hướng: tất cả preview trước, phân tích sau. 10 ảnh sẽ dài; lời “đợt” hơi khó hiểu | Đổi lời thành “Ảnh trong bài này”, đếm 2/10 ảnh. Thu gọn thumbnail nhưng vẫn hiện đủ ảnh và nút sửa từng ảnh. Nút Phân tích vẫn nằm sau preview theo quyết định hiện hành | Sau |
| Đang đọc ảnh / lỗi / tiếp tục | Đã giữ nháp, có Dừng và Tiếp tục; nhiều chữ tiến độ và lỗi hình có thể làm luồng bị nặng | Ba trạng thái ngắn: **Đang đọc ảnh 2/4 → Đang thêm nghĩa → Sẵn sàng kiểm**. Khi lỗi: nói phần đã giữ + một nút tiếp tục phù hợp. Không dựng phần trăm giả | Sớm |
| Duyệt từ và ngữ pháp trước lưu | Hàng từ thu gọn chỉ thấy từ và hình; phải mở để đọc nghĩa/chọn bỏ. Một từ mở ra nhiều ô | Mỗi hàng hiện **pear · quả lê · Đã chọn**. Có chọn/bỏ rõ ở hàng; mở để sửa. Ngữ pháp hiển thị câu mẫu + bản dịch trước giải thích. Tóm tắt số mục sắp lưu cạnh một nút Lưu chung | Sớm |
| Bổ sung hình / đổi hình | Có ba nút “Tìm hình”, “Tìm ảnh trên web”, “Tìm thêm trên mạng”; khác cách hoạt động nhưng tên dễ lẫn. Trên màn bổ sung, khối nhập ảnh lặp trong từng từ | Dùng **Tìm hình gợi ý** / **Mở Google tìm ảnh** / **Tìm thêm hình trong ứng dụng**. Chỉ mở Dán/chọn ảnh khi cần. Giữ nút web luôn truy cập được và không mất ảnh/kết quả cũ | Sớm |
| Chơi & học | Bảy lựa chọn; chưa có hướng dẫn nên bắt đầu trò nào. Đã có hình và lời mô tả | Thêm một gợi ý nhỏ **Bắt đầu với Thẻ ôn** hoặc Tiếp tục buổi đang dở. Giữ đủ trò bên dưới; tùy chọn nâng cao vẫn đóng | Sau |
| Thẻ ôn | Sau lật thẻ, phần giải thích/cách đọc đẩy Nhớ rồi/Chưa nhớ xuống dưới; dễ cuộn chỉ để đánh giá | Giữ từ + nghĩa + một ví dụ chính. Đưa hai nút đánh giá vào vùng dễ bấm. Giữ đánh giá chi tiết và nội dung khác trong phần mở rộng | Sớm |
| Nhìn hình chọn từ / Nghe từ chọn hình | Ba đáp án ngang hàng, phản hồi đúng/sai có chữ đã tốt | Giữ. Sửa mute; đảm bảo phần Nghe/Nút tiếp theo dễ tìm. Không tự đọc mọi câu hay tự chuyển câu khi chưa bấm | Sớm cho tiếng; giữ bố cục |
| Điền chữ / Gõ từ / Xếp câu | Cần nhập và xử lý bàn phím; có gợi ý, bỏ qua và kiểm tra | Kiểm lại điện thoại có bàn phím mở. Giữ prompt và nút Kiểm tra trong vùng nhìn thấy; Xếp câu có nút bỏ token/chọn lại rõ ràng. Animation ghép từ ngắn, không trì hoãn nút tiếp | Sau |
| Nói cùng Cáo / nói tại từ | Nghe rồi Nói rõ; đã có tiến độ và nhận xét. Nút nghe lại bản thu chỉ có icon; bảng âm chi tiết khá chuyên môn | Thêm nhãn **Giọng của con**. Trước bảng âm, một lời khuyên ngắn dễ làm theo; bảng mở khi muốn xem. Nhắc phần trăm là đánh giá của máy bằng lời nhẹ, không khẳng định là khả năng thật của trẻ | Sau |
| Kết quả / buổi đang dở | Có buổi đang dở và lịch sử, nhưng đặt sau các trò; người dùng phải nhớ để tìm lại | Đưa Tiếp tục buổi đang dở lên trên trò mới. Hoàn thành: số câu đã làm + Chơi lại / Về Hôm nay; điểm trò chơi không gọi là “đã nhớ” | Sau |
| Chi tiết ngữ pháp | Đã có các bước ghép câu và nút Nghe; nhiều công thức/phân tích có thể dài | Câu mẫu + nghĩa trước; giải thích mở thêm. Giữ Bước tiếp để tự học; chuyển động chỉ khi bấm xem. Tôn trọng cả giảm chuyển động của máy và trong app | Sau |
| Chuông / chi tiết thông báo | Có nháp để tiếp tục và xóa thông báo riêng; xóa không xóa bài | Giữ. Giải thích ngắn khi cần: “Bỏ thông báo, bài vẫn giữ”. Không thêm tiếng/rung lặp thúc giục | Giữ |
| Hồ sơ / đăng nhập / chọn thư viện | Nhiều việc gồm tài khoản, avatar và thư viện trong một trang; thông tin kỹ thuật ở trạng thái lỗi dễ dài | Ba phần rõ: **Tên và hình của bạn**, **Đăng nhập để học trên máy khác**, **Bài đang mở**. Lỗi đặt cạnh hành động, giữ lựa chọn thư viện và bản gốc | Sau |
| Sao chép tài khoản / đồng bộ / xóa tài khoản | Quyết định có ảnh hưởng dữ liệu; không nên làm đơn giản bằng cách bỏ kiểm tra | Giữ xem trước và xác nhận cần thiết. Dùng tên thư viện dễ hiểu, số bài và kết quả thật. Xóa tài khoản tách rõ khỏi xóa thông báo/bài | Sau |
| Cài đặt / sao lưu | Trình độ dùng nhãn English trong VI và chưa đổi bài mẫu; âm thanh chỉ ghi “khi bấm nghe” dù trò chơi cũng phát | Đặt nhãn phù hợp, nói rõ điều chưa áp dụng. Đổi âm thanh thành **Tiếng trò chơi / Giọng đọc khi bấm Nghe** nếu duyệt tách. Sao lưu giữ đơn giản và báo đã tải/khôi phục thật | Sớm cho tiếng; sau cho phần còn lại |
| Đang tải / không có dữ liệu / lỗi / 404 / offline | Đã có Cáo và cách quay lại ở nhiều trạng thái. Một số empty ngữ pháp/speaking chưa có hành động ngay | Mỗi trạng thái có một câu hiểu được và một đường tiếp tục. Đang tải không tự phát tiếng. Offline chỉ hứa thao tác thật sự làm được | Sau |

## Âm thanh: thêm ở đâu?

**Đã có:** tiếng đúng, thử lại, lật thẻ, hoàn thành trò chơi; giọng đọc khi bấm Nghe; tín hiệu mic. Ưu tiên sửa và dùng nhất quán trước.

| Khi nào | Đề xuất | Cảm giác cần tạo |
|---|---|---|
| Trả lời đúng | Giữ tiếng ngắn, nhỏ; phát một lần sau kết quả đã ghi được | “Mình làm được rồi” |
| Trả lời sai | Tiếng mềm, ngắn; có thể tắt. Không còi/buzzer hoặc lời chê | “Thử thêm được” |
| Hoàn thành buổi học | Một tiếng vui ngắn cùng Cáo chúc mừng | Có kết thúc rõ ràng |
| Bấm Nghe / nghe lại giọng | Chỉ phát nội dung người dùng yêu cầu; không chồng lên tiếng thưởng | Nghe rõ nội dung |
| Phân tích ảnh sẵn sàng kiểm | Đề xuất **chỉ dấu tích và chữ**, chưa thêm tiếng mặc định | Biết đã xong mà không bị giật mình |
| Lưu từ, chọn hình, chọn nhóm | Chữ Đã lưu/Đã chọn cùng thay đổi nhẹ; không cần tiếng mặc định | Yên tâm kết quả đã được giữ |
| Mở màn, tìm kiếm, thông báo, lỗi mạng | Không thêm âm thanh | Tập trung và không ồn |

Đề xuất tách **Tiếng trò chơi** và **Giọng đọc khi bấm Nghe** để tắt tiếng thưởng mà vẫn học nghe được. Đây là thay đổi cần bạn duyệt; nếu muốn giữ một công tắc, trước mắt chỉ sửa việc tự bật lại và đặt tên đúng phạm vi. Không có nhạc nền trong đề xuất này.

## Chuyển động: thêm hoặc chỉnh ở đâu?

| Nơi dùng | Thay đổi đề xuất | Cách giảm chuyển động |
|---|---|---|
| Bấm chọn / chuyển Từ–Ngữ pháp | Màu/nền đổi rõ, phản hồi nhấn nhẹ | Đổi trạng thái ngay, không dịch chuyển |
| Chọn từ vào nhóm/bộ thẻ | Hàng được chọn đổi nền; số mục cập nhật tại chỗ | Chỉ đổi nền và số |
| Lật thẻ | Nghĩa xuất hiện nhẹ, bố cục ổn định; không cần xoay 3D | Hiện nghĩa ngay |
| Game đúng / hoàn thành | Giữ Cáo và sao đã có; chỉnh để ngắn và nhất quán | Chữ + biểu tượng tĩnh vẫn đầy đủ |
| Đọc ảnh → sẵn sàng kiểm | Dấu bước hiện phần đã xong; vùng kết quả xuất hiện nhẹ | Hiện kết quả tĩnh; giữ số ảnh và trạng thái |
| Lưu thành công | Nút chuyển sang dấu tích + Đã lưu sau khi lưu thật | Không cần animation |
| Ngữ pháp | Giữ ghép câu từng bước; tự bấm Bước tiếp là đường chính | Không tự đổi bước theo timer |
| Chào mừng / chuông | Giữ chuyển động hữu hạn hiện có | Bản tĩnh; không thêm vòng lặp |

Mỗi lúc chỉ có một phần chính chuyển động. Không để animation chặn nút bấm hoặc dùng chuyển động che việc app chưa lưu xong.

## Chia đợt để bạn duyệt và kiểm dễ

| Đợt | Sửa gì | Kết quả bạn kiểm được |
|---|---|---|
| **1 — Việc thường dùng** | Sửa tự bật tiếng; thư viện tìm nhanh; màn thêm/sửa từ gọn; thẻ ôn dễ đánh giá | Tắt tiếng không tự bật; mở thư viện thấy tìm kiếm và ít nhất một từ trên màn đầu; thêm/sửa không phải đi qua toàn bộ ô IPA để Lưu; lật thẻ xong thấy hai nút đánh giá |
| **2 — Thêm bài từ ảnh** | Tên nút tìm hình; hướng dẫn chọn/dán ảnh; tiến độ; hàng duyệt có nghĩa và lựa chọn; tóm tắt lưu | Biết ảnh nào đang được đọc, nội dung nào sẽ lưu, bỏ/chỉnh một từ dễ; lỗi vẫn tiếp tục được phần đã làm |
| **3 — Gom bài và chọn buổi học** | Nhóm/bộ thẻ chọn rõ phạm vi; thanh Lưu; gợi ý bắt đầu và tiếp tục; tên bài thống nhất | Không nhầm Chọn cả trang với tất cả; đổi trang vẫn giữ lựa chọn; mở Chơi & học thấy buổi đang dở |
| **4 — Âm thanh và cảm giác học** | Nếu duyệt: tách tiếng trò chơi/giọng đọc; nhãn giọng của con; chuyển động bổ sung ngắn; empty/error/profile/settings | Tắt tiếng thưởng vẫn nghe từ được; không chồng tiếng; chế độ giảm chuyển động vẫn dùng đầy đủ; các màn phụ có cách tiếp tục rõ |

Đợt 1–3 giúp thao tác dễ hơn. Đợt 4 làm trải nghiệm học nhất quán hơn. Có thể duyệt riêng từng đợt và bỏ từng mục.

## Cách bạn kiểm bản sửa

Dùng bài thử riêng, trên điện thoại và máy tính:

- Tìm “apple”, mở từ, nghe mẫu, ôn thẻ và chọn Nhớ rồi.
- Thêm một từ mới, kiểm nghĩa/hình, lưu; sửa nghĩa và hình bằng một lần Lưu.
- Thêm hai ảnh vào một bài; dừng giữa chừng, mở lại, duyệt từ/ngữ pháp và lưu một bài.
- Chọn hơn một trang từ vào nhóm; tìm thêm một từ; lưu rồi mở lại.
- Tắt tiếng, đổi màn và tải lại; thử giảm chuyển động; nghe và dùng mic khi bị từ chối quyền.
- Thử với một trẻ 5–8 tuổi: xem trẻ có tự tìm được việc cần làm, có cần người lớn chỉ nút hay không. Ghi chỗ trẻ dừng hoặc bấm nhầm; không suy dễ dùng chỉ từ test tự động.

**Đã làm theo duyệt:** cả4đợt; tiếng trò chơi riêng trên máy, giọng đọc giữ thiết lập hiện có; quản lý thư viện trong Sắp xếp bài và chi tiết nhập/sửa mở khi cần. Hai lỗi nhóm: chọn/bỏ chọn chỉ mục mới, mục cũ khóa và giữ qua Save/reload; tên từ một hàng, các nghĩa vẫn xem/chọn riêng. Bạn có thể refresh bản local để kiểm lại.

[Ảnh và bằng chứng kiểm tra](evaluations/ux-review-2026-10-12.md) · [Tài liệu triển khai riêng cho AI](ai/UX-UI-IMPLEMENTATION-PLAN.md).
