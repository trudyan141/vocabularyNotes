# UX đơn giản và performance gates

Đặc tả nguồn cho N08/N09, QA25–QA27 và T18/T02/T14/T15. Các số bên dưới là **target**; T02 đã đo baseline fixture trong [báo cáo](evaluations/ux-performance.md), chưa field/device/human pass. Bản founder tự chứa đủ giải thích tại [KE-HOACH-FOUNDER.md](KE-HOACH-FOUNDER.md).

## Quyết định interaction

Rule IDs dưới đây là trace lịch sử ADR012 của product-design đã gỡ theo ADR078, không còn là routing skill. Quyết định sản phẩm vẫn giữ; thực hiện hiện dùng UI/UX Pro Max + Impeccable shape/operate và steering mới nhất.

| Quyết định | Lý do / rule lịch sử ADR012 | Acceptance |
|---|---|---|
| 3 nav: Hôm nay/Từ của con/Chơi & học | `rule/one-primary-action`, `rule/smallest-intervention` | Account/settings qua header; capture CTA trong Hôm nay; active nav đúng route con |
| Bắt đầu ở guest; Google tùy chọn | `rule/value-before-interruption` | Không buộc chọn level/login; mặc định Beginner, VI, child-friendly on; phụ huynh thiết lập cloud/AI; setting sửa được |
| Một primary CTA theo state | `rule/one-primary-action`, `rule/cover-reachable-states` | Empty→Nhờ bố mẹ thêm bài qua gate; có dữ liệu→Chơi 5 phút; save→Ôn bài này; không mất alternative hữu ích |
| Detail mở thêm tại chỗ | `rule/inline-before-modal` | Nghĩa/nghe/1 ví dụ trước; ví dụ khác/note/nguồn mở thêm; không modal stack |
| Game được gợi ý trước | `rule/control-matches-cardinality` | 4 mode vẫn reachable qua Đổi cách chơi; thiếu ảnh giải thích, có mode thay thế |
| Hai rating trước mắt trong child-friendly | `rule/control-matches-cardinality` | Again/Good hiển thị; Hard/Easy mở chi tiết được; cùng reducer và event contract 08 |
| Nút và label đầy đủ | `rule/gesture-has-control-alternative`, `rule/accessible-name-required` | Swipe/flip không là cách duy nhất; nav icon+text; nút nghe accessible name chứa word/context |
| Retry/back có scope và recovery | `rule/error-states-recovery`, `rule/name-object-scope-consequence` | Camera deny/upload, empty/no results, storage full, AI quota, merge partial có bước tiếp theo |

`ui-ux-pro-max` đã được chạy local CSV search cho `education language learning`, retry `vocabulary study mobile app`; kết quả design-system có phần landing-page Hero/Testimonials và font không phù hợp mặc định VI. UX query `simple navigation progressive disclosure`, retry `progressive disclosure` không tìm đúng rule progressive disclosure. Đây là **fallback có chủ đích** sang rules product-design đã đọc ở thời điểm prototype và quyết định dự án; skill đó hiện đã gỡ theo ADR078, không khẳng định catalog trả đúng pattern. Giữ độ thoáng, spacing và checklist hữu ích; không áp nguyên bộ recommendation hoặc Google Fonts import vào app.

InspoMCP cung cấp visual references theo [bằng chứng nghiên cứu](design/inspo-research.md). Nhận xét screenshot không xác minh flow đăng nhập, SRS, accessibility, animation hay performance của sản phẩm nguồn.

## Prototype T18

Trước prototype: hoàn tất 16 graph/spec trong mục 4 founder plan, tạo một concept S03 để nhận xét theme. S03 đã sinh; Theme C đã tạm chốt, gate nhận xét đạt. Đã có đủ 16 ảnh Words for Kids cùng 9 revisions theo phản hồi founder; không yêu cầu founder chốt lại theme nếu không có thay đổi mới. Theo dõi bằng design/ui-mockup-plan.json. Ảnh concept tĩnh không đáp ứng acceptance clickable bên dưới; không ghi T18 done từ số lượng ảnh.

Deliverable T18 đã có ở `docs/design/prototype/` gồm prototype clickable (HTML hoặc công cụ tương đương), 5 màn S03/S07/S09/S12/S13, design rationale, screenshots và self-review. Dùng data minh họa có nhãn, không gọi đó là AI extraction hoặc cloud integration thật.

Chuỗi bắt buộc: empty Today→capture placeholder→review 10 candidates (mới/trùng/uncertain)→save summary→word detail→flashcard→one game→results/back. Bộ màn có VI dài, multi-sense, asset missing và reduced motion. Camera/OAuth chưa hoạt động được gắn nhãn trong prototype.

T18 done khi prototype bấm được, self-review ghi rule IDs/violations và kịch bản human study có sẵn. Nếu chưa có người thử, ghi pending; **không ghi QA25 pass**. Không yêu cầu approval mới để xây phần đã được user cho phép; gate một ảnh trước đã được đáp ứng khi founder tạm chốt C; đã có đủ ảnh và prototype, không còn chờ theme approval. T02 có thể tiếp tục từ bản tự review; trước release phải có thử người thật và sửa những vấn đề tìm được.

## QA25 — usability người thật

- Nhóm A: ≥5 phụ huynh; task: capture→correct→save→find→practice→giải thích đang lưu máy/cloud.
- Nhóm B: ≥5 trẻ 5–8 tuổi, gồm ít nhất 2 trẻ chưa đọc được nhãn ngắn, phụ huynh đồng ý; ghi tuổi/trình độ, không cần ngày sinh đầy đủ; task: start suggested practice→listen→reveal/choose→answer→find→back.
- Trên mỗi task, ≥4/5 trong **từng nhóm** hoàn tất không hint của moderator. Không cộng hai nhóm thành 8/10 để che một nhóm fail. Người quan sát chỉ đọc mục tiêu task, không dạy vị trí nút.
- Ghi thời gian, kết quả, mis-tap, câu hỏi, điểm dừng; không quay mặt/tên trẻ nếu không cần. Đo flow lưu 10 từ ≤90 s cho nhóm A.
- Khi fail, ghi nguyên nhân và chỉnh hierarchy/copy/control trước khi thử lại. App voice/icon cues được phép nhưng moderator không được chỉ vị trí nút; nếu trẻ chưa đọc fail phải chỉnh flow và retest, không loại khỏi cohort để ghi pass.
- Pilot T15 dùng cùng tiêu chí; không thay bằng heuristic review của AI hoặc Playwright.

## QA26 — budgets và phép đo

| Budget khởi điểm | Phép đo / giới hạn |
|---|---|
| LCP ≤2,5 s, CLS ≤0,1 | Cold load Today/Library/Practice, production build. Lab ≥5 runs/route, median + range; field p75 riêng khi đủ samples |
| INP field p75 ≤200 ms | `web-vitals`/RUM khi có sample và consent thích hợp; Lighthouse/TBT không thay field INP |
| UI feedback ≤100 ms | ≥30 thao tác listen/reveal/answer/nav; performance trace từ event đến visual feedback; ghi device và p95 |
| Local search p95 ≤200 ms | Fixture 5.000 entries với nhiều senses/tags; ≥50 queries EN/VI; đo query→results painted, ghi debounce tách riêng và end-to-end; không chỉ timing DB |
| JS ban đầu ≤300 KiB gzip/route chính | Build analyzer, network transferred; camera/crop/game modules tải khi cần. Nếu framework vượt, báo actual và ADR trước khi sửa target |
| Font transfer ban đầu ≤150 KiB | Một family, ít weights/variable khi nhẹ hơn; đủ Latin+Vietnamese, fallback metrics; font-display phù hợp; không @import blocking từ vendor |
| Initial page transfer ≤1 MiB | Cold primary route, gồm HTML/JS/CSS/font/ảnh đầu; worksheet upload đo riêng, không tính chung page transfer |
| Ảnh game/thumb ≤100 KiB/ảnh thông thường | Responsive WebP/AVIF, dimension/aspect ratio cố định; không load full worksheet trong danh sách |
| AI extraction p95 ≤30 s | T00 ground truth print-clear cohort + server traces; ghi network/model/schema/image size; không cộng latency AI vào kết quả CWV |

T00/T02 chốt measurement profile: ít nhất một Android tầm trung và iPhone trong device matrix, OS/browser versions, production commit, cold/warm cache, 4G giả lập nêu bandwidth/RTT/CPU throttle chính xác, local fixture version. Browser throttle chỉ proxy; thực hiện smoke/trace trên máy thật. Không chọn máy mạnh nhất để báo “mobile pass”.

Field metrics: cohort theo route/device, sample count/window, p75. Private app hoặc origin mới không có CrUX ≠ đạt hay fail. Có thể có pilot RUM thay thế, ghi cỡ mẫu; không suy ra p75 tin cậy từ vài lượt. Telemetry không ghi từ vựng, ảnh, tên trẻ, query search, email hay nội dung notes.

Ảnh/crop/parse nặng dùng worker khi trace chứng minh cần; abort/throttle rõ. Tránh eager import mọi game/Motion ở app shell, waterfall request và list render toàn bộ 5.000 mục. Đọc local trước, sync nền foreground; cache phân scope theo 05/06/09. Budget là ràng buộc đo, không phải yêu cầu thêm thư viện trước khi cần.

## QA27 — motion và interruption

Kiểm press/sheet/save/flip/feedback/mnemonic trên thiết bị thật, CPU throttle và reduced motion. Trace không có layout thrash do animate width/height/top/left khi transform/opacity giải quyết được. Chỉ dùng `will-change` khi trace cần, gỡ sau animation.

Đi tới lui, rapid double tap, đổi card giữa speech, pause/resume, hidden tab, orientation và reduced motion đổi khi app đang mở không mất state/duplicate event. CSS media query và JS/MotionConfig đều tôn trọng preference; mọi scene có full static content. Animation không chặn nút học tiếp/chốt dữ liệu.

## Evidence và gate

T03 đã đo thêm [search5.000/local repository](evaluations/t03-local-repository.md): 50 mixed native inputs/CPU4× p95≈166 ms, max≈184 ms; read transaction/derived scoped index và list page50. Đạt search target trong lab; cold LCP/CLS/bundle của build T03 chưa đo lại đầy đủ, physical device/field/human vẫn pending. T02 baseline giữ lịch sử riêng.

T02 bắt đầu baseline với fixture; T07/T09/T12 đo lại phần tương tác mới; T14 tổng hợp regression + device matrix; T15 thử người thật. Báo cáo dự kiến `docs/evaluations/ux-performance.md` gồm: commit/build, profile, route/task, raw outputs/screenshots/traces, before/after, actual vs target, limitation, next fix. File đã có sau T02 với raw JSON/trace/screenshots, số đo thật và pending rõ theo scope. Không biến baseline 20 từ thành 5.000-entry hoặc device/field pass.

Nguồn đo: [web.dev Core Web Vitals](https://web.dev/articles/vitals); skill performance/core-web-vitals/accessibility trong repo. Dùng UI/UX Pro Max + Impeccable shape/operate cho interaction, `frontend-design` cho art direction, LottieFiles `motion-design` + Impeccable animate cho motion/implementation; không nạp cả bundle khi chỉ sửa một control.

T18 artifacts và browser evidence ở [self-review](design/prototype/SELF-REVIEW.md), kịch bản riêng ở [QA25](design/prototype/QA25-HUMAN-STUDY.md). Targets production/CWV/device/human vẫn chưa measured; không suy pass từ kích thước WOFF2 hoặc browser demo.

## T04 capture lab bổ sung

[T04 evidence](evaluations/t04-capture.md) + [raw JSON](evaluations/t04/capture-lab.json): sáu synthetic JPEG 7,68/20MP trên Chromium/macOS, Pixel7 CSS360/CPU4×, input→draft commit→preview painted269–335ms, observed main longtask≤60ms; local server, không network throttle/physical phone/field INP. Camera/crop chỉ route capture, Today đọc metadata bounded first record. Lab này chưa thay cold primary-route LCP/CLS/transfer hoặc camera-device/human gates. Chưa worker; đo lại ảnh thực trên điện thoại trước khi chốt tối ưu.
