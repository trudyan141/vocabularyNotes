# Bản thử giao diện Words for Kids

T18 · 09/10/2026. HTML/CSS/JS thuần, chạy trên trình duyệt, không cần npm.

Từ thư mục gốc repo:

```sh
python3 -m http.server 4319 --bind 127.0.0.1 --directory docs
```

Mở `http://127.0.0.1:4319/design/prototype/index.html?seed=1` để có bài minh họa; mở tab mới không có `seed=1` để bắt đầu với thư viện rỗng. Dừng server bằng Ctrl+C ở terminal đã chạy nó. Server đang dùng cho founder xem thử, chỉ bind localhost.

Bản thử giữ dữ liệu minh họa trong **sessionStorage của tab**; tải lại giữ trạng thái, đóng tab có thể mất. Đây chưa phải IndexedDB/PWA của app thật. Nạp bài minh họa là fixture, không phải kết quả AI.

Luồng chính: Hôm nay → Nhờ bố mẹ thêm bài → tờ mẫu → duyệt/sửa/chọn từ → lưu → từ/nghĩa/ví dụ → flashcard → game → kết quả. Từ của con tìm được EN/VI, giữ hai nghĩa bank riêng. Chơi & học có bốn mode, menu Đổi cách chơi mở thêm. Audio gọi Web Speech nếu thiết bị có giọng tiếng Anh; thiếu giọng/lỗi có thông báo.

Camera/cắt/xoay ảnh, OCR/vision, Google/cloud/merge, AI enrichment/search ảnh và lịch SRS chưa kết nối. Parent gate ở đây chỉ giúp thử flow, chưa khóa bảo mật. Không có ô nhập API key thật.

Công cụ thử lỗi, thiếu hình và nhảy đến màn chỉ xuất hiện khi thêm `&inspect=1` vào URL có seed, hoặc `?inspect=1` vào URL thường. Nó nằm ngoài giao diện mặc định của bé.

- [Gallery 16 ảnh](../gallery.html) và [manifest ảnh](../ui-mockup-plan.json).
- [Quyết định thiết kế](DESIGN-RATIONALE.md), [self-review](SELF-REVIEW.md), [kịch bản thử người thật](QA25-HUMAN-STUDY.md).
- [Plan founder tiếng Việt](../../KE-HOACH-FOUNDER.md).

Nunito self-hosted có Latin/Vietnamese, một variable WOFF2 101.028 bytes; license và nguồn pin trong `fonts/`. SVG icon/minh họa được viết trong repo; đồ vật không có mặt, mascot cáo riêng. Raster imagegen là concept tham khảo, không dùng nguyên screenshot làm app.
