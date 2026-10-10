# Định hướng sản phẩm

Tên sản phẩm đã chốt: **Words for Kids**. Theme C hoạt họa tạm chốt. Tìm ảnh đúng nghĩa và hợp trẻ bằng catalog/nguồn mở + duyệt của phụ huynh; không tạo ảnh AI mỗi từ ở P1. Animation template và xử lý song song có giới hạn theo 14. Không đổi checkout path chỉ để đổi thương hiệu.

## Vấn đề

Trẻ đã học từ trong tờ A4 trường gửi về nhưng thường quên vì không có thư viện và lịch ôn dễ dùng. **Bản đầu ưu tiên con founder và trẻ 5–8 tuổi; phụ huynh chụp/duyệt bài.** Người lớn là hướng mở rộng sau. Đây là steering mới, thay ưu tiên mọi tuổi trước đó.

## Giá trị chính

**Chụp hoặc tải ảnh → duyệt nội dung nhận dạng → lưu thư viện không trùng → tìm lại → nghe và ôn trong vài phút.**

App giữ nguồn đã học, phân biệt từ/cụm từ, câu ví dụ, mẫu câu và grammar; bổ sung nghĩa Anh–Anh, Anh–Việt, ví dụ và ghi chú dễ nhớ. Không hứa rằng model luôn đọc đúng chữ viết tay hoặc xác định chính xác trình độ.

## Người dùng và chế độ

| Nhóm | Nhu cầu | Điều chỉnh |
|---|---|---|
| Trẻ 5–8 — primary | Nghe, chọn hình, thẻ ngắn, tự quay lại học | Child-friendly mặc định, cartoon 2D, nhãn/voice cues ngắn |
| Phụ huynh — primary | Chụp/duyệt bài, quản lý nội dung/key/cloud | Khu phụ huynh có gate; cùng thư viện trẻ học |
| Người lớn — mở rộng sau | Tìm lại kiến thức, collocation/câu theo trình độ | Presentation Standard/Advanced, chưa thuộc pilot P1 |

Onboarding có primary `Bắt đầu` vào guest; mặc định VI/Beginner/child-friendly on; không bắt form/ngày sinh. Không suy ra tuổi từ ảnh, không bắt trẻ đăng nhập Google. Phụ huynh là chủ thư viện/key/cloud; parent gate tránh trẻ mở nhầm cài đặt, không thay server auth. P1 một thư viện/người sở hữu; nhiều hồ sơ riêng ở P2. Các mode Standard/Advanced chuẩn bị để mở rộng, không là đối tượng pilot chính.

Steering miễn phí: học lại đã lưu, cartoon catalog và animation template không gọi AI mỗi lần. Gemini có free tier text/vision nhưng điều khoản hiện không phù hợp child-directed app; tạo ảnh API không có free tier. Provider phải qua gate tuổi/dữ liệu/quota ở 07 trước benchmark/live. Local OCR + nội dung được phụ huynh chuẩn bị là phương án cần đánh giá nếu bắt buộc không phí API, chưa chứng minh thay thế được AI đầy đủ.

## Trải nghiệm chủ đạo

- Màn hình đầu cho dùng thử không đăng nhập.
- Người dùng luôn xem trước phần mới, phần trùng, phần cần kiểm tra và nội dung AI bổ sung.
- Kết quả lưu cho biết `8 từ mới · 3 từ đã có · 2 mẫu câu · 1 grammar`; từ trùng được liên kết nguồn học mới, không tạo lại bản ghi từ.
- Chỉ 3 khu vực Hôm nay/Từ của con/Chơi & học; account/settings qua header. Empty Today ưu tiên Nhờ bố mẹ thêm bài qua parent gate; có dữ liệu ưu tiên Chơi 5 phút; advanced controls mở khi cần; số lượng từ chỉ là dữ liệu phụ.
- Giao diện hỗ trợ tiếng Việt có dấu và văn bản tiếng Anh. Kiến trúc i18n để thêm giao diện EN, P1 có VI và EN.
- Thư viện đã tải hoạt động khi offline. AI từ xa cần mạng. Âm thanh offline phụ thuộc giọng có sẵn hoặc audio đã tải.

## Phạm vi và giới hạn

P1 nhận JPEG/PNG/WebP; một ảnh/lượt, tối đa 10 MB và 20 megapixel trước xử lý. Đây là giới hạn sản phẩm đề xuất, cần đo trên thiết bị. HEIC dùng chuyển đổi sau feature detection hoặc hướng dẫn xuất JPG; không âm thầm chấp nhận rồi lỗi. PDF nhiều trang và batch ở P2.

P1 không có mạng xã hội, lớp học công khai, bảng xếp hạng, chat AI tự do, chấm điểm phát âm hoặc native app. Chưa có căn cứ để chốt giá bán, provider AI tốt nhất hoặc thời gian hoàn thành; phải benchmark và đo chi phí trước public launch.

## Chỉ số để đo trong pilot

Đây là mục tiêu nghiệm thu đề xuất, không phải số liệu hiện có: từ ảnh in rõ đến màn duyệt trong p95 ≤ 30 giây ở cấu hình benchmark; duyệt và lưu 10 từ trong ≤ 90 giây; tìm local 5.000 mục p95 ≤ 200 ms trên thiết bị thử được ghi rõ; không mất dữ liệu qua retry/import/sync. QA25: ≥4/5 trong từng nhóm 5 phụ huynh và 5 trẻ 5–8, gồm ít nhất 2 trẻ chưa đọc được nhãn hoàn tất từng nhiệm vụ của nhóm không trợ giúp. Performance/field-vs-lab và kịch bản dùng dễ theo 13; chưa đo không ghi pass.

Đo tỷ lệ quay lại ôn, câu trả lời đúng khi nhắc lại sau 7 ngày và số mục cần sửa. Không dùng số lần mở app hoặc streak thay cho bằng chứng đã nhớ.
