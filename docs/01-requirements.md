# Yêu cầu có mã và truy vết

## Tính năng

| Mã | Phạm vi | Yêu cầu và tiêu chí chính | Màn hình | Task |
|---|---|---|---|---|
| R01 | P1 | Upload/chụp; preview, crop, xoay, chụp lại; lỗi camera có upload fallback | S04–S05 | T04 |
| R02 | P1 | Phân tích từ/cụm từ, câu, mẫu câu, grammar; giữ evidence; không bịa nội dung nguồn | S06–S07 | T05–T06 |
| R03 | P1 | Duyệt/sửa/chọn bỏ trước khi lưu; tách mới/trùng/cần kiểm tra | S07–S08 | T06 |
| R04 | P1 | Khách lưu IndexedDB, reload vẫn còn; không dùng localStorage làm DB | S01, S03, S16 | T03 |
| R05 | P1 | Google login, cloud library có RLS, cache local và sync; không ghi nhầm tài khoản | S02, S15–S16 | T10–T11 |
| R06 | P1 | Normalize xác định + unique index + idempotency; nghĩa khác không bị xóa | S07, S09 | T03, T06, T11 |
| R07 | P1 | Nghĩa EN–EN/EN–VI, POS; dưới từ có IPA xác minh (UK/US khi có) và cách đọc gần đúng bằng chữ Việt được duyệt; ≥ 2 ví dụ EN+VI/mỗi nghĩa mới được enrich, mỗi câu có IPA và gợi ý cách đọc tương ứng | S09 | T07 |
| R08 | P1 | Câu đã học và câu gợi ý tách nguồn; dưới câu có IPA xác minh và cách đọc gần đúng bằng chữ Việt được duyệt; mẫu câu có slots và ví dụ thay thế | S10 | T07 |
| R09 | P1 | Grammar: công thức, cách dùng EN/VI, ví dụ phân tích, lỗi thường gặp | S10 | T07 |
| R10 | P1 | Note cá nhân và mnemonic có cấu trúc; animation phát lại, dừng, bản tĩnh | S09–S10 | T08 |
| R11 | P1 | Search theo từ, nghĩa VI/EN, tag, bài, loại; lọc trạng thái ôn; thêm từ bằng gõ tay, autocomplete từ liên quan → tra → chọn nghĩa/POS → duyệt/lưu, không cần ảnh | S03, S09–S10 | T03, T07 |
| R12 | P1 | Flashcard hai mặt, nghe, Again/Hard/Good/Easy; lịch ôn cách quãng | S11–S12 | T09 |
| R13 | P1 | Nhìn hình đoán từ; nhìn từ đoán hình; không có ảnh đáng tin thì loại mục đó | S13 | T12 |
| R14 | P1 | Điền ký tự thiếu và gõ cả từ; đáp án/variants/hints xác định | S13 | T12 |
| R15 | P1 | Nghe từ và câu, giọng EN, tốc độ; lỗi/không có giọng có thông báo | S09–S13, S16 | T07, T12 |
| R16 | P1 | Lịch sử bài scan, ngày học, nguồn từng mục, đếm mới/trùng và ôn theo bài | S08–S09 | T06–T07 |
| R17 | P1 | Chuyển guest→cloud có preview merge, retry, verify; export/import backup; delete riêng theo scope | S15–S16 | T11 |
| R18 | P1 | PWA, responsive, offline cho nội dung đã lưu, pending sync; không cache dữ liệu chéo user | Toàn app | T13 |
| R19 | P1 | Ưu tiên 5–8 tuổi, VI/Beginner/child-friendly mặc định; phụ huynh chuẩn bị bài; voice/icon cues cho trẻ chưa đọc; founder29/10 yêu cầu kế hoạch học ké B1–B2 từ kho đã lưu và thêm tay/ảnh, giữ nội dung/SRS của bé; luôn tạo phần nâng cao, setting Ẩn/Hiện mặc định Ẩn, bật mới hiện section thu gọn/bấm bung mới thấy; [ADR110/plan, đã triển khai; toàn kho đã bổ sung, chờ review nội dung](KE-HOACH-MO-RONG-B1-B2.md) | S01, S03, S16 | T02, T07, T17 |
| R20 | P1 | Quota server, consent upload, xử lý dữ liệu cá nhân trong ảnh, không lộ key | S05–S06, S16 | T05, T10, T14 |
| R21 | P1 | Thống kê buổi ôn, từ yếu, tiếp tục phiên dang dở; không quảng cáo mastery giả | S03, S14 | T09, T12 |
| R22 | P2 | OCR chạy máy tùy chọn; đọc text rồi sửa tay; không mặc định sinh nghĩa offline | S05–S07 | T16 |
| R23 | P2 | Nhiều hồ sơ, batch/PDF, cloud TTS cache, semantic search khi cần | Mở rộng | T17 |
| R24 | P1 | Cấu hình AI/API key chỉ ở khu phụ huynh/quản trị, provider eligibility gate; secret server-only, không browser/backup/log; Gemini child-use hiện không được bật; không tự chuyển paid | S16 | T00, T02, T05 |

| R25 | P1 | Catalog ưu tiên, tìm ảnh hoạt họa theo sense khi thiếu, kiểm nguồn/license/credit và phụ huynh duyệt; không chặn text khi media lỗi; tác vụ độc lập chạy song song có giới hạn/cache/quota | S07–S10, S13, S16 | T05, T07, T08, T12, T14 |

## Các yêu cầu xuyên suốt

- N01: UI đẹp, rõ ràng, hierarchy nhất quán, focus/keyboard/screen reader, reduced motion; kiểm tra contrast và thiết bị thật.
- N02: save local là transaction; server merge là transaction; không đánh dấu saved/synced trước acknowledgement đúng scope.
- N03: retry không tạo thêm entry, source link, review event hoặc tiến độ ôn.
- N04: input ảnh/text/AI/backup đều là dữ liệu không tin cậy; validate schema, giới hạn kích thước, escape render.
- N05: nguồn hình/audio có license và attribution; nội dung AI bổ sung được gắn nhãn và có thể sửa.
- N06: lỗi camera, storage, mạng, AI refusal/truncation, OAuth cancel, quota, conflict và thiếu ảnh/audio có đường phục hồi cụ thể.
- N07: dữ liệu cloud tách owner/library; dữ liệu guest tách device scope; logout/account switch xử lý pending writes rõ ràng.
- N08: 3 khu vực chính, một primary action theo state, dùng guest ngay, child-friendly mặc định; QA25 thử ≥5 phụ huynh + ≥5 trẻ 5–8 gồm trẻ chưa đọc, ≥4/5 mỗi nhóm hoàn tất từng task không trợ giúp moderator; app voice cues được phép. T18/T02 thiết kế, T15 kiểm người thật; chi tiết 13.
- N09: budgets và đo performance bằng production build/thiết bị thật; phân biệt lab với field p75 CWV; search 5.000 mục p95 ≤200 ms, motion interruption QA27. Baseline T02, regression T14; chi tiết 13.

## Quy tắc ưu tiên

Không bỏ R08–R10 hoặc R13–R14 chỉ vì MVP thường chỉ có flashcard. Có thể phát triển thành từng task, nhưng P1 nghiệm thu phải có đủ. Chỉ ghi deferred khi bảng trên đã nêu P2 hoặc người dùng đồng ý thay đổi phạm vi.
