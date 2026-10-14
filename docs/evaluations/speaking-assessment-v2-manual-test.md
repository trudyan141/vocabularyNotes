# Manual test — Nói cùng Cáo (ADR095 current)

Ngày chuẩn bị: 15/10/2026. Code/local checks mới nhất ở [ADR095 evidence](speaking-zero-and-latency.md); [v2 evidence](speaking-assessment-v2.md) là checkpoint lịch sử. Đây là checklist cho người dùng thử bằng tai/giọng thật, không phải biên bản đã PASS.

## Mở bản local

Dùng URL local agent báo ở cuối task; không dùng nhầm app khác đang chạy ở port3000. Mở **Chơi & học → Nói cùng Cáo**, hoặc chọn một từ → bấm Nói ngay trong chi tiết. Bản local kiểm thử dùng origin riêng/dữ liệu mẫu; dữ liệu/bản deploy đang dùng không tự thay đổi.

Thử bằng giọng bình thường, ở chỗ yên tĩnh, cùng mic/khoảng cách. Nghe mẫu trước, chú ý âm thật thay vì đọc máy móc theo chữ Việt. Thử cả Nghe và Nghe chậm. Không cần mở console hay cung cấp key/log riêng tư.

## Các ca cần thử

| Ca | Thao tác | Kỳ vọng / cần ghi nhận |
|---|---|---|
| Đọc đúng | Chọn apple/cat hoặc một từ đã có, đọc đủ âm | Điểm/màu/nhận xét phải nhất quán. Không mặc định mọi lần đúng đều phải100; nếu thường xuyên bị bắt oan thì ghi lỗi chất lượng |
| Thiếu âm cuối | Chọn cat, thử nói chỉ hai âm đầu, không nói âm t | Nếu máy xác định thiếu t: t đỏ, sheet ghi chưa nhận ra âm, điểm67. Nếu chưa phân biệt được thì xám/âm chưa rõ được0credit; không tự chấm100 |
| Thay âm cuối | Chọn cat nhưng đọc cap | Nếu nhận đúng p thay t: phản hồi âm nghe khác, điểm67, có hướng dẫn t. Nếu100 hoặc báo chưa chấm được thì ghi lại — đây là ca cần kiểm đặc biệt từ live control |
| Thêm âm | Sau từ đọc thêm một tiếng “ờ” rõ, chẳng hạn cat + ə | Có dấu +/ə/ riêng và dòng Âm thêm trong sheet; cat đủ3âm+1âm thừa được75. Với apple4âm+1âm thừa được80. Không chỉ hiện toàn chữ xanh rồi100 |
| Không rõ | Giữ im lặng/nói quá nhỏ hoặc thử có tiếng ồn | Im lặng/không rõ hiện0, không gọi Gemini nếu quality fail; service error hiện tạm0 với nguyên nhân, không khẳng định trẻ nói sai. Vẫn có thể nghe lại/nói lại/bỏ qua |
| Xem cách sửa | Bấm từ có màu | Sheet có âm mẫu/âm máy nghe được, loại lỗi và hướng dẫn Việt. Màn chính ưu tiên một lỗi, bảng giữ đủ chi tiết |
| Nghe lại | Sau mỗi lượt bấm Giọng của con | Nghe đúng bản đã gửi chấm; không mất âm cuối so với bản máy nhận. Âm mẫu và giọng mình không phát chồng |
| Nói lại/hủy | Sau khi đã có điểm, bấm Nói rồi hủy lượt mới | Điểm cũ biến mất, không được dùng lại để hoàn thành lượt mới |
| Rời màn | Khi đang chấm, quay lại Chơi & học | Mic dừng; kết quả về muộn không xuất hiện ở từ/màn mới |
| Kết quả vòng | Một từ rõ, một từ chưa rõ, rồi thử bỏ qua từ khác | Vẫn đi tiếp/kết thúc được; unclear/lỗi chấm được tính0 trong lượt, số lượt có điểm đúng; từ bỏ qua chưa làm vẫn ngăn điểm tổng đầy đủ |
| Âm cuối nhẹ hợp lệ | Người biết ngữ âm thử âm tắc cuối không bật release mạnh | Không được bắt thiếu chỉ vì không nghe tiếng bật. Nếu chưa phân biệt chắc thì âm chưa rõ được0credit, không bịa lỗi thiếu |

Nếu thư viện chưa có cat, có thể tự thêm/duyệt một từ cat trong bài thử riêng hoặc dùng một từ phù hợp đã có. Không cần đổi bài học thật chỉ để đạt một con số test.

## Cách phản hồi kết quả

Ghi: từ mẫu, đã cố đọc thế nào, điểm, màu/loại lỗi trong sheet, thiết bị/browser và có nghe rõ bản replay hay không. Phân biệt: sai nhận âm, UI/điểm mâu thuẫn, lỗi mạng/schema, hoặc mic cắt âm. Có thể chụp màn hình điểm/sheet; không gửi key, console toàn bộ hay dữ liệu tài khoản.

Code đã khóa việc điểm provider mâu thuẫn với phones và cách xử lý lỗi thừa. **Gemini vẫn chưa được chứng minh nhận âm ổn định:** control tổng hợp đã có ca cap→cat nhận100 ở ứng viên đầu và ca phản hồi không hợp lệ. Không dùng kết quả fixture hoặc vài lượt manual để tuyên bố đạt pilot100mẫu/giọng trẻ. Cần báo cả đọc đúng bị chấm oan và đọc sai được100, không chỉ các lượt tốt.

Follow-up manual15/10: lỗi chấm hiện có mã SP-JSON/SCHEMA/INCOMPLETE/NETWORK/TIMEOUT/BLOCKED/RESPONSE. Nếu có tạm0 do lỗi chấm, ghi đúng mã và thông báo; không suy là nói sai hoặc key sai khi chưa có bằng chứng. [Điều tra thông báo chung](speaking-grading-errors.md).

ADR095: thử nói một tiếng ngắn, im lặng, và đọc bình thường. Không bị kẹt10s vì tiếng quá ngắn; im lặng khoảng2.5s ra0, tiếng đủngưỡng dừng sau550ms im lặng. Gemini chờ tối đa6s cho request (không gồm mọi bước mic/reference); ghi thời gian quan sát thật, không suy benchmark từ cảm giác.
