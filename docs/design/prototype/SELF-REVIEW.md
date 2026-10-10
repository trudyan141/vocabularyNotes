# T18 — self-review và bằng chứng

09/10/2026. Đây là tự kiểm của coding agent trên prototype, **chưa thử với phụ huynh/trẻ**, chưa production/WCAG audit hoặc benchmark thiết bị thật. T18 artifact đạt; QA25 chưa pass.

## Thiết kế và skill thực sự dùng

Product-design cho primary action, cardinality, recovery, native controls và reachable states; frontend-design cho Theme C; bilingual-learning-content cho fixture EN/VI; motion-design/ui-animation cho ba note renderers/reduced motion; accessibility cho focus/names/labels. Impeccable mới được cài theo yêu cầu founder, đã đọc SKILL/craft-floor và distill/layout/colorize/typeset; chạy context một lần và detector trên target. Không gọi đây là formal `$impeccable critique` hoặc dual-agent assessment.

Những lỗi nhìn thấy trước sửa: ba đáp án 2+1 tạo thiên lệch diện tích; disabled làm nhạt toàn bộ ảnh; cặp được nhân hóa nên khó nhận ra; diagnostics bị đưa vào flow học; bảng kết quả thiếu màu và chiếm nhiều chỗ; font display dùng system fallback; search Hôm nay đòi Enter nhưng thiếu nút rõ.

Đã sửa: đồ vật/trái cây không có mặt, backpack có quai/ngăn/khóa/zip; ba thẻ ngang nhau tại 360 px, hẹp hơn dùng ba hàng đều nhau; ảnh disabled giữ opacity 1, đúng/sai có icon + border; feedback một nhóm gọn; scores mint/pink/lilac có nhãn; diagnostics chỉ `inspect=1`; Nunito VI self-host; nút Tìm rõ. Rules liên quan: `rule/one-primary-action`, `rule/inline-before-modal`, `rule/control-matches-cardinality`, `rule/error-states-recovery`, `rule/cover-reachable-states`, `rule/accessible-name-required`.

Impeccable detector: [JSON kết quả](impeccable-detect.json), một warning `cream-palette` cho nền `#FFF8F8`. Giữ theo brief Theme C founder đã chốt; không có suppression để che finding. Engine 0.1.14 cache tạm, không hook/global config. Context engine chưa có PRODUCT.md/DESIGN.md theo format riêng, scoped fixes lấy product truth từ AGENTS/04/founder/code, không tạo kế hoạch nguồn cạnh tranh. CLI scan không kiểm đủ HTML được JS dựng động; có browser inspection riêng, không overlay injection.

## Browser behavior đã kiểm bằng thao tác UI

Codex In-app Browser, viewport 360×800 và 1440×1000, desktop host; viewport giả lập không là điện thoại thật.

| Trường hợp | Bằng chứng quan sát |
|---|---|
| Empty → parent → mẫu → consent → review | Gate/dialog có focus; chưa consent không phân tích; fixture hiển thị rồi mới save. Camera/OCR chỉ có nhãn mô phỏng |
| Review/uncertain/edit/selection | 11 candidates, ban đầu 10 selected; erqser không tự chọn; sửa thành eraser, bỏ notebook, vẫn 10 selected |
| Save lỗi/retry | Lỗi giữ eraser/chọn từ; retry lưu 7 mới + 3 đã có + 2 mẫu câu; không thêm bản trùng vào library |
| EN/VI/search | Nút Tìm ở Hôm nay dẫn Library no-match có recovery; `bank` trả hai mục; river-bank có nghĩa VI dài, không overflow ngang |
| Word → flashcard | apple nghĩa EN/VI + example; reveal hiện hai rating, focus vào Chưa nhớ; rating một thẻ tới kết quả |
| G01 | Nhìn apple chọn `apple` → đúng |
| G02, đủ 10 câu | 7 đúng/2 sai/1 bỏ qua, hint 2 câu, kết quả khớp; sau answer focus CTA tiếp tục |
| G03 | `a_ple`, chỉ nhập `p`, maxlength 1 → đúng |
| G04 | ` APPLE ` → đúng sau normalize case/trim |
| Card equality/disabled | Tại 360 px: ba thẻ 102,664 px, cùng top, height 132 px; sau chọn cả ba disabled và opacity 1 |
| Media missing | Apple không hình vẫn học được nghĩa/thẻ; G02 đầu tiên chuyển banana, không đưa apple vào distractors |
| Note templates | Word play; sentence play/pause với state paused; grammar play. Reduced motion có animation-name none và đủ nội dung tĩnh |
| Reload/interruption | Game/flash đang học được giữ và paused khi quay lại; search/draft giữ trong phiên tab |
| Speech | Nút gọi Web Speech và có trạng thái/fallback; đã sửa callback cancellation không tạo lỗi giả sau navigation. Chưa xác nhận nghe/giọng đúng trên điện thoại thật |
| Responsive/diagnostics | Desktop phone rộng 520 px, mobile 360 px, không horizontal overflow trên trạng thái đã xem; tester display none mặc định |

Fixture demo khác raw worksheet thật: seed 20 mục, gồm hai senses bank; khi dùng mẫu trên thư viện rỗng prototype thêm ba mục book/bag/pen có sẵn để thử dedup. 11 candidates có một chưa rõ. PNG S08 thể hiện kịch bản chọn đủ 11 sau sửa (8 mới + 3 cũ); browser test bỏ notebook nên lưu 10 (7 mới + 3 cũ). Không nhầm hai nhánh hoặc gọi fixture là kết quả AI.

## Ảnh và tài nguyên

Đủ 16 ảnh concept trong [gallery](../gallery.html); chín revisions theo feedback founder giữ sibling version với ảnh cũ. [Manifest](../ui-mockup-plan.json) có prompt/source/dimension/hash. Concept không đảm bảo layout pixel chính xác; HTML chạy thật và measurements bên trên là bằng chứng bố cục.

Ảnh browser hiện tại trong `screenshots/*-v2.jpg`: S03/S07/S09/S12/S13, feedback S13 và kết quả S14 mobile/desktop. Các ảnh cũ trước correction giữ để đối chiếu. SVG học tập/code native không gọi API tạo ảnh cho từng từ; mascot nằm riêng, không ép network assets match một style độc quyền.

[Resource/contrast check](resource-check.json) đo byte tĩnh/gzip estimate và các cặp token chính, không số đo CWV/INP. WOFF2 101.028 bytes, Latin + Vietnamese, OFL/source pin ở fonts. Không CDN/runtime provider dependency trong bản thử. Server static chưa bật gzip; không gọi gzip estimate là transfer thực.

## Còn phải làm ở app thật

T01–T14: framework/app shell, IndexedDB/cloud/OAuth/auth/secret store, camera/crop/OCR/evidence/AI provider đủ điều kiện, media license/search/approval/cache, SRS, PWA/offline, request cancellation/idempotency/account isolation, production traces và thiết bị thật. Game options ở prototype xác định, chưa question builder/difficulty/shuffle production. Các số due/count/profile/cloud ở concept không thay những implementation này.

Parent gate chỉ là minh họa. Details và diagnostics chưa là full screen-reader audit; không suy WCAG pass từ contrast của vài token. Xử lý production storage-full/network/merge/conflict chưa được chứng minh bằng error flag demo. UI word detail trong demo còn nav 3 mục; T02 đối chiếu lại quy tắc nav của 03 để giữ phiên/công việc khi port vào app.

[Kịch bản QA25](QA25-HUMAN-STUDY.md) đã có; **human study còn pending**. Không chấm trẻ dùng được hay app nhanh chỉ từ số skill, PNG hoặc browser script.
