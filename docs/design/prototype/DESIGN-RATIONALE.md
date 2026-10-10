# Prototype Words for Kids — quyết định thiết kế

T18, 09/10/2026. Hướng đã được founder tạm chốt: trẻ 5–8 tuổi trước, phụ huynh chuẩn bị bài; cáo san hô riêng, cartoon 2D, berry/yellow/mint/lilac. Inspo Headspace cho cảm giác thân thiện, Duo cho controls lớn/feedback, Daybridge cho pastel, Bear cho thư viện dễ đọc; không sao chép asset hoặc mascot. Nguồn đã khảo sát ở ../inspo-research.md.

## Trước khi dựng

- Palette: nền #FFF8F8, chữ #38213D, berry #B52F60, yellow #FFE49A, mint #DEF3E6, lilac #ECE3FB; nét cáo #38213D, thân #FF925C. Màu là nhóm nội dung, trạng thái có cả icon/chữ.
- Typography: prototype dùng Nunito variable tự host, đủ Latin/Vietnamese; 18 px child body, 16 px parent, 28–34 px title, 40–48 px word. WOFF2 101.028 bytes, preload/font-display swap; source pin/OFL trong fonts, không tải vendor font lúc runtime.
- Layout: điện thoại một cột, header gọn → nội dung học → một CTA; nav 3 mục ở các khu chính. Desktop giữ cùng bố cục trong vùng đọc hẹp; công cụ thử nằm ngoài UI của bé.
- Điểm nhận diện là cáo và illustration gắn với từ; không thêm streak/path, badge hay animation trang trí liên tục. SVG học tập được viết riêng trong code; ảnh UI raster từ imagegen nằm ở mockups, không dùng nguyên screenshot làm app.

## Các rule áp dụng

| Rule product-design | Quyết định cụ thể |
|---|---|
| rule/one-primary-action | Today rỗng→Nhờ bố mẹ thêm bài; có bài→Chơi 5 phút; review→Lưu; đã lật thẻ→Nhớ rồi là rating nổi bật |
| rule/value-before-interruption | Bắt đầu trên máy, không yêu cầu Google/level/AI key trước khi thấy cách học |
| rule/inline-before-modal | Nghĩa phụ/ví dụ/note mở details tại chỗ; modal chỉ cho parent gate, sửa ứng viên và thoát phiên |
| rule/control-matches-cardinality | Hai rating trước; Hard/Easy mở thêm; game gợi ý trước, các mode khác nằm trong Đổi cách chơi |
| rule/cover-reachable-states | Empty/no results, uncertain, save error/retry, no image, multisense, pause/reduced motion có đường thử |
| rule/error-states-recovery | Lưu lỗi giữ selection/edit/nháp; retry không nhân đôi từ, quay lại giữ nháp |
| rule/name-object-scope-consequence | Prototype ghi rõ dữ liệu minh họa, chưa có cloud/OCR; nút không giả vờ đã OAuth/AI thành công |
| rule/accessible-name-required | Native button, label form, focus ring, dialog, nghe có tên từ/câu, live status |

## Motion có mục đích

Press 120 ms; chuyển nội dung 160 ms opacity; reveal 220 ms transform/opacity; đáp án đúng 320 ms pop một lần. Ba mnemonic renderer: word đưa hình vào vùng từ; sentence lần lượt nhấn cụm; grammar nhấn subject và phần s. Play/Pause/Replay, static content đầy đủ, OS reduced-motion + toggle đổi ngay, hidden tab/navigation dừng speech và pause scene. Không animate width/height/top/left.

## Giới hạn

Năm màn core S03/S07/S09/S12/S13 được dựng để bấm; màn hỗ trợ nối flow. Camera/crop/OCR/OAuth/cloud/SRS/provider là mô phỏng hoặc chưa có; không có API key, không tải ảnh mạng. Web Speech là khả năng thực của trình duyệt, có fallback khi thiếu voice. Đây là artifact thiết kế T18, không hoàn tất T01–T14. Human QA25/thiết bị thật còn pending.

## Sửa sau phản hồi founder trên bản chạy

Founder thấy cặp khó nhận diện, mặt trên vật không cần thiết, ba thẻ 2+1 thiên lệch, panel kiểm thử rườm rà và kết quả nhạt. Đã bỏ mặt trên toàn bộ vật/fruit/food/sun, vẽ lại backpack đúng các bộ phận; giữ mascot riêng. Ba lựa chọn bằng nhau, disabled không làm nhạt ảnh; feedback gọn, score có icon và màu. Công cụ QA chỉ hiện inspect=1. Đây là correction của implementation, không dùng số skill như bằng chứng chất lượng. Rules liên quan: rule/one-primary-action, rule/smallest-intervention, rule/cover-reachable-states và rule/accessible-name-required.

Impeccable distill/layout/colorize/typeset đã áp dụng vào các corrections, có context/detector evidence trong SELF-REVIEW; một cream-palette warning giữ theo brief. Font hệ thống được thay bằng Nunito VI tự host. Nút tìm Hôm nay rõ; game ảnh có accessible names tiếng Việt, không chỉ số thứ tự.
