# QA25 — kịch bản thử Words for Kids với người thật

**Trạng thái: chưa chạy.** Browser self-review không thay kết quả này. Áp tiêu chí nguồn ở [13](../../13-ux-performance-gates.md); thử prototype trước, thử app camera/cloud thật ở T15.

Mời ít nhất 5 phụ huynh và 5 trẻ 5–8 tuổi, gồm ít nhất 2 trẻ chưa đọc được nhãn ngắn. Có đồng ý của phụ huynh; chỉ ghi mã P01–P05/C01–C05, tuổi theo năm và khả năng đọc, không cần tên/ngày sinh/ảnh mặt. Dùng điện thoại thật, ghi OS/browser và kích thước màn.

Chuẩn bị một tab mới thư viện rỗng cho phụ huynh, một tab `?seed=1` cho trẻ. Không mở inspect trước mặt người thử. Moderator đọc mục tiêu từng task; không chỉ vị trí nút hoặc thao tác hộ. Hình/giọng/note có sẵn trong app được phép dùng. Ghi lúc phải trợ giúp; vẫn cho người thử tiếp tục để tìm vấn đề.

| Nhóm | Task đọc cho người thử | Quan sát |
|---|---|---|
| Phụ huynh | “Thêm bài School objects từ tờ mẫu, kiểm tra và sửa từ bị đọc sai, rồi lưu.” | Có hiểu review trước save? Sửa erqser thành eraser? Có phân biệt mới/đã có? Thời gian lưu 10 từ ≤90 s, ghi rõ dùng fixture |
| Phụ huynh | “Tìm lại thước kẻ và mở nghĩa/ví dụ.” | Tìm EN hoặc VI; có cần biết Enter hay thấy nút Tìm? |
| Phụ huynh | “Cho con ôn một từ rồi chơi một lượt.” | Thấy đường từ detail tới flashcard/game? |
| Phụ huynh | “Bài đang ở đâu? Nếu đóng tab hoặc đổi máy thì sao?” | Hiểu sessionStorage demo; không nhầm đã lưu cloud/Google thật |
| Trẻ | “Bắt đầu trò chơi được gợi ý.” | Nhận ra CTA chính? Có nhầm khu phụ huynh? |
| Trẻ | “Nghe và chọn hình đúng.” | Có nhận ra vật ở 80–120 px? Nhất là book/bag/ruler; ghi lỗi nhận hình riêng lỗi từ |
| Trẻ | “Xem từ này nghĩa là gì rồi cho biết con nhớ chưa.” | Tự lật và chọn hai rating; không cần đọc menu nâng cao |
| Trẻ | “Nghỉ một chút rồi chơi tiếp.” | Pause/resume có rõ, phiên còn giữ? |
| Trẻ | “Chơi xong, xem lại từ cần ôn rồi về Hôm nay.” | Hiểu màu + icon + chữ trên kết quả, biết thao tác tiếp |

Mỗi task phải có ≥4/5 người **trong từng nhóm** hoàn tất không hướng dẫn của moderator. Không gộp nhóm, không bỏ trẻ chưa đọc khỏi mẫu, không lấy score game làm mastery. Với audio không hoạt động trên thiết bị, ghi lỗi/fallback và task ảnh hưởng; không đánh dấu task nghe đã đạt.

Mẫu ghi kết quả:

| Mã | Nhóm/tuổi/đọc nhãn | Task | Thiết bị | Thời gian | Hoàn tất tự làm | Mis-tap | Câu hỏi/điểm dừng | Hint moderator | Vấn đề/độ nặng |
|---|---|---|---|---|---|---|---|---|---|
| Chưa có participant | — | — | — | — | Chưa đo | — | — | — | — |

Sau thử: tổng hợp theo từng task và nhóm, ưu tiên điểm khiến không hoàn tất hoặc nhận sai hình. Sửa bố cục/copy/controls/minh họa, thử lại với mẫu phù hợp, lưu bằng chứng trước khi ghi QA25 pass. Chi phí/độ chính xác AI và Core Web Vitals cần phép đo riêng trên app thật.
