# Contracts bàn giao

- `analysis.schema.json`: nội dung trích từ ảnh và suy luận được gắn nhãn; chưa có nghĩa/ví dụ AI mới.
- `enrichment.schema.json`: nội dung AI bổ sung cho candidate đã duyệt; không có quyền tự lưu vào DB.
- Ví dụ hợp lệ: `../fixtures/analysis.sample.json`, `../fixtures/enrichment.sample.json`.
- Ca domain/negative: `../fixtures/domain-cases.json`.

Schema dùng JSON Schema Draft 2020-12, object đóng bằng `additionalProperties:false` và mọi trường đều required; giá trị không biết dùng null. Khi dùng provider structured output, adapter cần kiểm subset JSON Schema được provider/model hỗ trợ và chạy validator riêng phía server. Không chỉ gửi schema rồi tin model đúng.

`candidateId`/evidence IDs là định danh trong analysis response, không phải UUID entry cloud. Server/client validate toàn bộ cross-reference, giới hạn item/text, provenance và token offsets. Candidate IDs giữ nguyên từ review tới enrichment để ghép đúng mục.

Ví dụ token offsets tính theo UTF-16 code units giống JavaScript string offsets; `start` inclusive, `end` exclusive. Token text phải đúng slice textEn, không overlap hoặc vượt biên. Mnemonic highlight IDs phải tồn tại trong ví dụ được target; câu/ảnh không bị đổi sau khi token map đã tạo.

Domain checks chưa được JSON Schema diễn tả hết: mỗi vocabulary item enriched cần sense không null; grammar cần formula và ít nhất một commonMistake; pattern cần explanation và slot constraints được review; ví dụ phải dùng đúng nghĩa. `pronunciationSuggestion` chưa xác minh, không được đổi nhãn thành verified tự động.

Các file này là đặc tả mẫu, chưa phải implementation của API hoặc validator production.

**v1.1, 10/10/2026:** đã mở rộng `items[].pronunciations` và `examples[].pronunciations`: text/contentVersion/accent/IPA/sourceUrl/readingHintVi/origin. Thiếu dữ liệu dùng mảng rỗng hoặc null, không tự sinh nhãn verified/approved. Validator `src/lib/learning/enrichment.ts` kiểm đúng text/revision, tối đa hai accent, không trùng accent, URL nguồn và schema đóng. Fixture v1.1 được cập nhật. Đây là contract/validator đã chuẩn bị; AI provider và gateway live vẫn bị chặn bởi T00, không gọi model hoặc coi schema pass là accuracy pass.

**11/10/2026 — ADR047/048:** Mọi câu ví dụ tiếng Anh, kể cả ví dụ bổ sung và mẫu hỏi–đáp, đặt IPA của **toàn bộ đúng câu** ngay dưới English, trước bản dịch. Khi generate phải yêu cầu IPA cả câu (`exampleIpa` trong worksheet adapter; `examples[].pronunciations` trong enrichment), gồm mọi mệnh đề; không lấy IPA headword thay thế. Không chắc dùng null; không tự gắn verified. Sửa câu phải xóa IPA và gợi ý đọc chữ Việt cũ, rồi duyệt lại. Nội dung cũ ưu tiên IPA đã lưu; hướng dẫn đọc US từ CMUdict chỉ là **Tham khảo**, không chứng minh connected speech; từ chưa biết/đa cách đọc không đoán. Lưu/backup/cloud giữ optional IPA cùng đúng text/version, không đổi dữ liệu người dùng tự động.

Capture cho dán ảnh bằng Ctrl+V / ⌘V khi ở trang thêm bài: một ảnh JPEG/PNG/WebP qua cùng kiểm tra10MB/20MP, bỏ metadata, lưu nháp và mở preview/crop ngay; không tự gửi AI. Dán chữ giữ hành vi bình thường. [Bằng chứng](../evaluations/sentence-ipa-and-image-paste.md).
