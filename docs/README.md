# Bộ tài liệu triển khai Words for Kids

Ngày chuẩn bị: **09/10/2026**, múi giờ người dùng Asia/Ho_Chi_Minh.

Đây là bản kế hoạch thực thi; T01/T02 có scaffold/app shell, S03/S07/S09 UI/demo; T03 đã có IndexedDB/migration/dedup/search. Sản phẩm đầy đủ chưa hoàn thành; nhận dạng ảnh/tra từ/autocomplete/IPA/cloud/SRS/PWA vẫn cần triển khai theo đặc tả. Evidence T03 ở [local repository](evaluations/t03-local-repository.md). Evidence ở [T01](evaluations/t01-scaffold.md), [T02](evaluations/t02-ui-shell.md) và [baseline](evaluations/ux-performance.md), cách chạy trong README gốc.

**Founder chỉ cần đọc [KE-HOACH-FOUNDER.md](KE-HOACH-FOUNDER.md):** một tài liệu tiếng Việt tự chứa phạm vi, graph tổng thể + graph/bố cục/trạng thái riêng đủ 16 màn, ảnh mẫu S03, UX/UI, mẫu InspoMCP, animation, performance, roadmap và tình hình. Theme C tạm chốt; đủ 16 ảnh, prototype core bấm được và 17 skills (có Impeccable). Tên mới Words for Kids, ưu tiên trẻ 5–8. Founder mục 9/15 có giải thích ảnh/animation/concurrency/API key; bảng dưới dành cho coding AI. Bảng dưới dành cho người triển khai.

## Đọc theo vai trò

| Mục đích | Tài liệu |
|---|---|
| Share A/B đã triển khai: email, QR3ngày, người nhận chỉ học | [Flow founder](CHIA-SE-THU-VIEN-FLOW-FOUNDER.md), [Codex implementation](ai/LIBRARY-SHARING-IMPLEMENTATION-PLAN.md), [manual test/evidence](evaluations/library-sharing.md), [so sánh phương án](DE-XUAT-CHIA-SE-THU-VIEN.md) |
| Speaking ADR095: v3/zero score/latency local verified; quality pending | [15-speaking-practice.md](15-speaking-practice.md), [Codex execution](ai/SPEAKING-ASSESSMENT-IMPLEMENTATION.md), [plan](ai/SPEAKING-ASSESSMENT-UPGRADE-PLAN.md) |
| Tìm ảnh mở, duyệt asset, animation và concurrency | [14-media-and-concurrency.md](14-media-and-concurrency.md) |
| Hiểu sản phẩm và phạm vi | [00-product-brief.md](00-product-brief.md), [01-requirements.md](01-requirements.md) |
| Hiểu hành trình người dùng | [02-user-flows.md](02-user-flows.md) |
| Xây từng màn hình | [03-screen-specs.md](03-screen-specs.md) |
| UI, animation và ghi chú giúp nhớ | [04-design-and-motion.md](04-design-and-motion.md) |
| Simple UX, human usability và performance budgets | [13-ux-performance-gates.md](13-ux-performance-gates.md) |
| InspoMCP: cấu hình, mẫu đã xem, adopt/adapt | [design/inspo-research.md](design/inspo-research.md) |
| Stack và ranh giới client/server | [05-architecture.md](05-architecture.md) |
| Schema, chống trùng, đồng bộ | [06-data-and-sync.md](06-data-and-sync.md) |
| OCR/vision, prompt, chất lượng nội dung | [07-ai-pipeline.md](07-ai-pipeline.md), [contracts/analysis.schema.json](contracts/analysis.schema.json) |
| Flashcard, lịch ôn, bốn minigame | [08-learning-and-games.md](08-learning-and-games.md) |
| API, cấu hình và vận hành | [09-api-and-operations.md](09-api-and-operations.md) |
| Test và điều kiện nghiệm thu | [10-quality-and-acceptance.md](10-quality-and-acceptance.md) |
| Chia giai đoạn và thứ tự thực hiện | [11-delivery-plan.md](11-delivery-plan.md) |
| Skill GitHub đã chọn, đã loại và cách dùng | [skills/CATALOG.md](skills/CATALOG.md), [skills/skills-lock.json](skills/skills-lock.json) |
| Nguồn kỹ thuật đã kiểm tra | [12-sources.md](12-sources.md) |
| Khởi động hoặc chuyển Codex ↔ Antigravity | [ai/START-HERE.md](ai/START-HERE.md) |

## Quy ước trạng thái

- **Confirmed hiện hành:** Words for Kids, web/PWA, trẻ 5–8 trước và phụ huynh chuẩn bị bài; Theme C tạm chốt; camera/upload; cloud khi phụ huynh Google login, guest local; dedup; nghĩa song ngữ/câu/grammar; notes animation; flashcard/bốn game/audio; ảnh hoạt họa search-first có license/duyệt và xử lý song song giới hạn. Người lớn mở rộng sau.
- **Proposed:** lựa chọn kỹ thuật và mặc định do bộ kế hoạch đề xuất. Có thể thay đổi bằng ADR, không cần hỏi lại các yêu cầu confirmed.
- **Deferred:** có kế hoạch ở P2; không được quảng cáo đã có ở P1.
- Task chỉ `done` khi đạt acceptance và ghi bằng chứng. `planned` không có nghĩa đã triển khai.

## Phạm vi phát hành

**P0:** nền tảng, thiết kế, benchmark AI. **P1:** sản phẩm có thể dùng hoàn chỉnh, bao gồm cả bốn game và notes có animation. **P2:** local OCR đầy đủ tùy chọn, nhiều hồ sơ người học, batch ảnh, TTS chất lượng đồng nhất và tính năng mở rộng.

P1 giữ đầy đủ ý tưởng cốt lõi. Những task đầu dùng mock là bước phát triển nội bộ, không thay cho chức năng thật lúc nghiệm thu.

## Kiểm bộ tài liệu khi thay đổi

`python3 scripts/validate_docs.py` kiểm links, inventories/dependencies, JSON và hashes skill. `python3 scripts/validate_docs.py --full` kiểm thêm schemas và fixtures; cần jsonschema theo `docs/requirements-validation.txt` trong virtualenv. PyYAML dùng cho validator skill-creator nếu có trong môi trường. Đây là kiểm tra tài liệu/contract, không thay test app hoặc OCR thật.

Artifact T18: [gallery](design/gallery.html), [prototype](design/prototype/index.html), [cách chạy](design/prototype/README.md), [self-review](design/prototype/SELF-REVIEW.md). Human QA25 còn pending, AI/cloud chưa nối.
