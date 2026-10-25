# Board game Đợt 0–1 — contract và mẫu review

24/10/2026. Founder đã giao Đợt 0 +1. Đây là thiết kế theo Theme C/Nunito/Cáo hiện có; không thêm game engine/dependency. Đặt đồ chỉ là thiết kế cho contract tương lai, chưa triển khai N3 của Đợt 2.

Follow-up ADR102: Xưởng xếp chữ rút khỏi hub; giữ renderer/contracts cho lượt cũ. Gõ cả từ có gợi ý toàn bộ ký tự xáo trộn (giữ chữ lặp), gồm offline shell. Ba game ngữ pháp mới ưu tiên bài đã duyệt; khi thiếu/hết bài hợp lệ tự mở bộ câu có sẵn. Bộ này có nhãn riêng, không dùng filter, không ghi library/coverage/SRS/cloud; điểm lượt giữ trong màn hiện tại, rời trang bắt đầu lại. Form tùy chỉnh là tùy chọn.

## Ba board đại diện (Xưởng xếp chữ chỉ cho lượt cũ)

### Nối / lật

```text
NỐI ĐÔI                         LẬT THẺ TÌM BẠN
Chạm hình → chạm từ              Lật hai thẻ → xem → tiếp tục
[ảnh mèo]   [book]               [1] [2] [3]
[ảnh sách]  [cat ]               [4] [5] [6]
[ảnh táo]   [apple]
2/3 cặp đã tìm                   1/3 cặp đã tìm
[Nghe cặp vừa ghép]              [Nghe từ vừa mở]
[Kiểm tra] [Gợi ý] [Bỏ qua]      [Tự úp cặp sai] [Kiểm tra]
```

Không đổi vị trí trong lượt. Chạm lại hình đang chọn để bỏ chọn. Theo yêu cầu founder mới: cặp đúng giữ mở và cho lật tiếp ngay; cặp sai tự úp sau1giây, không nút Tiếp tục tìm. Timer hủy khi unmount/đổi version, phục hồi khi reload cặp đang mở. ADR104: bảng mới2–3cặp, pool ít nhất2ảnh. Chia cân đối để không còn1cặp; legacy còn1target kèm done companion cùng cycle bằng key cũ, không tăng coverage hoặc bù ngoài phạm vi. Snapshot1cặp cũ vẫn đọc được cho lịch sử.

### Câu / chữ có tile

```text
CÂU THIẾU MẢNH                  XƯỞNG XẾP CHỮ
She ___ happy.                  [ảnh táo] [Nghe]
[am] [is] [are]                  [a] [p] [p] [l] [e]  ← chạm trả
                                [chữ bank đã trộn]
[Kiểm tra] [Xếp lại]             [Kiểm tra] [Xếp lại]
Sau chấm: câu đúng + IPA         Sau chấm: từ đúng + IPA
+ nghĩa + giải thích             + nghe lại
```

Mảnh sai của Bác sĩ câu được chọn trước khi thay. Trả lời Cáo có ngữ cảnh, loa câu hỏi và loa riêng cho từng lựa chọn; loa không nộp đáp án. Không tự đọc đáp án câu khuyết/câu sai trước khi chấm.

### Cảnh đặt đồ — bản thiết kế Đợt 0, chưa có gameplay

```text
ĐẶT ĐÚNG CHỖ
[Nghe: Put the ball under the table.]
             [mặt bàn = ON]
             |           |
             [vùng UNDER]
[quả bóng]   [hộp có vùng IN]
1. Chạm vật → 2. Chạm vùng → 3. Kiểm tra
```

Đợt 2 cần scene được duyệt, object IDs, target-zone IDs và quan hệ vị trí. Không suy đáp án từ pixel bất kỳ; behind cần layering/occlusion phân biệt được. Vẫn có chạm-chọn/chạm-đặt kể cả khi thêm kéo thả. Không thêm scene vào contract đang lưu của sáu game trước khi triển khai nó.

## Contract được triển khai

- `game-registry.ts`: mode, tên, hướng dẫn và điều kiện thiếu dữ liệu; registry không tách library/scope.
- `GameActivity` version1: kind, prompt, solution, translation, options, answer, explanation; context bắt buộc cho hội thoại, slot cho sửa câu; optional IPA theo đúng text. Câu khuyết có đúng một `___`; thay answer phải ra solution. Câu sửa thay đúng một token phải ra solution. Mỗi learning content tối đa một activity mỗi loại.
- LearningContent giữ `gameActivities`, mỗi activity có `sourceHash` SHA-256 của các trường nội dung gốc dùng chung. Hash chỉ dùng xác định cần review lại, không phải chứng minh nội dung đúng. Duyệt lại một game không duyệt lại các game khác. Sửa câu/meaning/formula/error/conditions/variants làm annotations cũ không dùng được cho vòng mới cho tới khi review lại; giữ nguyên dữ liệu cũ để sửa.
- Question giữ snapshot bất biến: activity hoặc choices + boardKeys. Mỗi boardKey ánh xạ đúng một sense/revision của cycle. Question primary vẫn dùng để tương thích session cũ.
- Session giữ gameState theo CAS: chosen IDs, matched pair indices, open card indices, wrong member indices, selected left và mistakes. Mọi thao tác được kiểm ở repository; component không tự gán điểm. Question order/tile order theo snapshot ID; reload không shuffle lại.
- Check chỉ dùng state hợp lệ, không tin chuỗi answer do caller gửi. Board ghi một GameAttempt cho từng target; mistakes được gán cho các mục liên quan, hint chung của board. SRS không đổi.
- Next ghi coveredKeys sau khi board hoàn thành. Chỉ xuất hiện/mở board chưa cộng coverage; skip defer từng target; replay không có cycleId nên không cộng vào vòng gốc.
- Archive/cloud schema nhận thêm fields optional và giữ session cũ. SQL0014 mở mode/projection/validation, không đổi owner/RLS; chưa apply hosted nếu chưa có evidence.

## Bộ ví dụ tham khảo

[Source game-examples](../../src/lib/learning/game-examples.ts) có12word tham chiếu,12câu khuyết,8câu sửa và8hội thoại có ngữ cảnh. Toàn bộ là nội dung do dự án soạn để review, không lấy từ curriculum app thương mại. Word IDs/hình phải resolve từ kho được chọn; danh sách mẫu không tự nhập hoặc đổi ảnh của người dùng.

Trong chi tiết ngữ pháp: mở **Chuẩn bị game cho bài này → Loại game → Ví dụ tham khảo** để điền form. Chưa có tác dụng lên gameplay cho tới khi người dùng kiểm ngữ cảnh/đáp án/nghĩa, tick duyệt và Lưu. Các ví dụ không tự mang IPA verified; runtime dùng nguồn IPA hiện có và trạng thái thiếu/tham khảo thật.

| Nhóm | Ví dụ | Bé luyện |
|---|---|---|
| I/am | I ___ happy. | Chọn am |
| She/is | She ___ kind. | Chọn is |
| He/is | He ___ tall. | Chọn is |
| They/are | They ___ here. | Chọn are |
| We/are | We ___ ready. | Chọn are |
| It/is | It ___ red. | Chọn is |
| This/is | This ___ a book. | Một vật |
| These/are | These ___ books. | Nhiều vật |
| I/have | I ___ a pen. | Have |
| She/has | She ___ a bag. | Has |
| Can | He can ___. | Swim nguyên mẫu |
| A/an | It is ___ apple. | An theo âm |

Câu sửa dùng8cấu trúc đầu; lời giải chỉ rõ subject + be. Hội thoại gồm Is it…? đúng/sai theo cảnh, Is she happy?, How many apples…?, Where is the ball?, What is it?, Can he swim?, Do you like apples?. Chỉ chấm một đáp án trong **tình huống đã ghi**; không gọi một câu khác sai ngữ pháp chỉ vì không phù hợp tình huống.
