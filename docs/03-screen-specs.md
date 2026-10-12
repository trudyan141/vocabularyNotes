# Đặc tả màn hình và điều hướng

**12/10 — ADR082, nhiều ảnh thành một bài chung:** supersede review/save riêng từng ảnh. Toàn bộ preview ở trên, Phân tích ở dưới danh sách. Compact vision đọc tất cả ảnh trước, gom headwords/context rồi enrich4từ/lượt và grammar1400chars; một danh sách word/grammar duyệt và một lần Save tạo một lesson. Source/meaning/grammar checkpoints CAS được ghi xong từng phần trước khi đi tiếp; quota/stop/reload Continue, không auto AI. Exact word/POS/sense và declared grammar family/form dedup, giữ nghĩa/POS khác và câu nguồn. Snapshot ảnh/model/mode đổi chặn Save; transaction kiểm source revisions và idempotency; max10ảnh/500raw/100ktext/200learning, per-image caps và source-limit khôngsilentlydrop. Legacy per-photo drafts/lessons giữ. [Bằng chứng](evaluations/merged-photo-lesson.md). **Hoàn tất local:**61focused tests +14caUI mobile/desktop PASS (gồm regression mộtảnh); lint/typecheck/build/docs PASS. Chưa liveAI/physical-phone/hostedsync/deploy. Next: founder refresh bản local để dùng luồng chung.


12/10 — Tìm hình nhận ảnh riêng theo yêu cầu founder: shared WordPictureSearch có vùng kéo thả focus được, Ctrl+V/⌘V scoped vào từ đang dùng, nút Dán ảnh cho mobile và chọn file. Một ảnh JPEG/PNG/WebP dưới4MB theo upload media hiện có (server12MP, resize512, EXIFstrip/JPEG/receipt giữ). Paste chữ/URL giữ mặc định; không lấy URL ảnh để tự fetch. Clipboard không hỗ trợ/bị từ chối có recovery chọn file; multi-file/format/size sai không upload; lock chống nhận2lượt, abort khi unmount. Reuse upload ký và sense/revision/CAS, editor stage đến Save chung, Prepare lưu hình theo hành vi cũ; không AI/không đổi quota/provider/SQL/env.


12/10 — danh sách gọn và tìm hình có kết quả từng nguồn: bỏ subcards POS/nghĩa và nhãn đếm nghĩa dưới word card, giữ dữ liệu/sense IDs. Detail chooser chỉ hiện mỗi nhãn POS+nghĩa Việt một lần. Tìm hình theo Noto→Twemoji→Fluent→OpenMoji catalog rồi Commons nếu chưa có; lỗi/rỗng/lọc license thử query kế tiếp, báo nguồn/kind/code/status an toàn. They với nghĩa plural people có concept nhóm người; curl body cũ từ candidates=[] nay ra2hình Noto/Twemoji, đã kiểm cả2importJPEG/license thật. Không replay cookie founder. [Bằng chứng](evaluations/simple-word-cards-and-media-fallback.md). Hoàn tất local: 29 tests liên quan + 6 ca UI mobile/desktop PASS, lint/typecheck/build/docs PASS; curl they và 2 import thật PASS. Chưa deploy; không founder data/browser/SQL/env/main.


12/10 — Bổ sung hình không lặp headword: founder báo are/they xuất hiện nhiều lần tại `/library/prepare`. Áp dụng projection headword + caseMode hiện có trước pagination12, sau filter approved/missing/skipped/lesson. Mỗi từ một dòng; nghĩa/POS khác nhau giữ nguyên và chọn bằng Nghĩa cần hình. Search/save/skip gắn đúng sense/revision; không bulk-copy ảnh vào nghĩa khác, không gộp/xóa dữ liệu học.


12/10 — Notifications bổ sung theo founder: mỗi item có nút thùng rác riêng (48px), không nằm trong link detail. Bấm xóa chỉ dismiss phiên bản thông báo theo scope/signature bằng IndexedDB metadata, không xóa bài/nháp/queue và không tự chọn Không sao chép. Badge/list cập nhật, popup vẫn mở; bền reload, cùng lỗi retry không hiện lại, draft/công việc mới có thể báo mới. Lỗi lưu dismiss hiện ngay action, không ẩn item/claim success.


12/10 — dán ảnh liên tiếp + chia lượt ngay: trang chỉnh ảnh có Ctrl+V/⌘V và Dán thêm ảnh/Chọn thêm ảnh; dán ảnh2 giữ tên/crop/nháp ảnh1, tạo chung batch; màn batch tiếp tục nhận paste,10ảnh cap. Text paste giữ bình thường. Batch gọi mỗiảnh tuần tự, compactvision6k rồi≤4từ/4k và grammar≤1400chars/≤3items/7k, không thử full10k trước. SSE không vượt output limit; validated checkpoints/CAS/ảnhhash+model+mode giữ, quota/cancel dừng/continue đúng pending, không promise AI đọcđủtuyệtđối.50words/20learning/10000text/40calls/5minphoto caps vẫn giữ, quánguồn báo cắtảnh khôngsilentlydrop. [Bằng chứng](evaluations/continuous-paste-and-chunked-photos.md). Hoàn tất local: 63 test liên quan + 12 ca browser mobile/desktop PASS; lint/typecheck/build/docs PASS. Chưa deploy, chưa kiểm clipboard trên điện thoại thật hoặc live Gemini trong lượt này.


ADR081 bổ sung cùng lượt: nhắc bài/ảnh đang chuẩn bị chuyển vào chuông, bỏ `.draft-resume` khỏi Today. Mở detail có Tiếp tục nháp ảnh về đúng draft hiện tại, không gọi AI/tải ảnh tự động. Guest/demo/account đều có nhắc nháp theo scope; cùng draft sửa không reset unread, draft mới báo mới, draft đã xóa/lưu không còn notice.

## ADR081 — Notifications

Header có chuông thông báo chung, badge số chưa đọc, popup toggle/Close/Escape/outside và link detail `/notifications/[id]`. Bỏ guest-copy banner khỏi Today/mọi main. Detail chứa nội dung + preview/confirm/decline hoặc sync/reconcile đúng loại; đọc không tự submit/copy. Đã xử lý có empty mascot, id lạ404. Không thêm nav thứ năm. Lỗi tại form/nút vẫn ở nơi thao tác.


**Lịch sử (luồng batch bị ADR082 thay thế)** — 12/10 thư viện tìm từ chính xác và nhiều ảnh: mỗi headword/caseMode một hàng, các sense/POS giữ riêng và có link mở; không gộp/xóa dữ liệu học. Search UI chỉ tên từ/cụm từ + nghĩa Việt, từ đầu token/prefix, không dò ví dụ/definition/tên bài; highlight đúng text có dấu. Chọn/kéo thả tới10ảnh,10MB/20MP mỗiảnh, normalize/EXIF strip tuần tự, local batch có preview/crop/remove/add. Một nút đọc phần còn lại; từng ảnh tuần tự qua adapter/recovery hiện có, stop-on-error, completed checkpoints/CAS/reload giữ; review/save riêng từng ảnh, không auto-save hay auto-upload sau reload. [Bằng chứng](evaluations/search-and-batch.md). Hoàn tất local:35data/search tests+14UIcases mobile/desktop PASS; lint/types/final build/docs PASS; chưa deploy/liveAI/phone-human/cloud/SQL.


12/10 ADR079: chỉ2tab Từ/Ngữ pháp rộng bằng nhau; bỏ Câu/list/add độc lập ởmọipage. Group picker còn Từ/Ngữ pháp/Bài-ngày, select all và thêm lesson/day không tạo standalone sentence refs. Ví dụ câu/IPA/audio/VI trong từ/ngữ pháp vẫn lưu bình thường. Legacy refs/data/backup/cloud bảo toàn; sentence bookmark về word chứa ví dụ. [Evidence](evaluations/two-learning-types.md).


## Offline thân thiện cho bé — ADR055, 11/10/2026

Màn fallback khi mất mạng dùng cùng Nunito/Theme C, Cáo và hình đã cache: lời chào ngắn, hai nút có màu/hình để mở Bài của con hoặc Bài mẫu, nút Thử kết nối lại có kiểu nút rõ ràng. Bài tài khoản vẫn cần mạng/đăng nhập; không tự chọn scope hoặc mở dữ liệu tài khoản. Thư viện có CTA ôn đến hạn, năm trò chơi có minh họa, thẻ từ gồm hình/English/nghĩa thay danh sách text. Không có hình hoặc ảnh chưa cache: biểu tượng sách có nhãn Chưa có hình, không đoán hình cho nghĩa. Màn ôn/game có màu, tiến độ, feedback và nút chính; ba lựa chọn ngang bằng nhau ở360px. Chuyển màn đưa focus về heading và đầu màn. Empty/search/error có lời ngắn và cách tiếp tục. Giữ duyệt nội dung, scope/CAS, chống trùng, SRS/resume, consent và attribution/IPA cả câu; không tự gửi AI.

[Bằng chứng local](evaluations/offline-child-ui.md). Không đổi cache của tài khoản hoặc schema; asset trang chào/play dùng catalog đã precache. Không thêm font/icon/network dependency.

## Hồ sơ, dán ảnh mobile, xóa và câu/ngữ pháp — ADR054, 11/10/2026

Theo yêu cầu trực tiếp mới nhất, header mở **Hồ sơ và đăng nhập** bằng avatar. `/profile` chứa đăng nhập Google, trạng thái tài khoản/cloud, phần Bài học và tài khoản và Thư viện đang mở chuyển từ Cài đặt; `/account` giữ tương thích. Tên hiển thị và avatar Cáo/Mèo/Cún là thiết lập nhỏ trên máy, không tự sửa Google metadata hay sync hồ sơ. Google avatar vẫn có fallback. Cài đặt chuyển thành mục thứ tư của nav chính (thanh dưới mobile, bên trái desktop); quy tắc ba nav/header Cài đặt cũ được supersede cho steering này.

Bỏ disclosure “Dữ liệu gửi Google và điều kiện sử dụng” khỏi UI Cài đặt theo yêu cầu; vẫn giữ xác nhận gửi ảnh/chi phí và kiểm nội dung tại hành động phân tích, không thay provider/account eligibility hay tạo claim free/quota.

S04 có nút **Dán ảnh đã sao chép**, đọc clipboard chỉ sau khi bấm. Native Ctrl+V/⌘V và clipboard items tiếp tục dùng cùng intake một ảnh JPEG/PNG/WebP, 10MB/20MP, chuẩn hóa/bỏ metadata/lưu nháp/mở preview, không tự AI. Chỉ có text/link, không hỗ trợ, nhiều ảnh hay từ chối quyền: báo cách chọn ảnh từ máy; dán text ở ô nhập giữ bình thường.

Nút xóa ở chi tiết từ, nhóm, bộ thẻ, bộ theo ngày và Câu/Mẫu câu/Ngữ pháp. Xác nhận tại chỗ, giữ phiên bản đã xem để từ chối stale write. Xóa nhóm/bộ thẻ không xóa từ/câu thư viện; xóa bộ theo ngày xóa liên kết và nội dung thêm riêng cho bộ, giữ từ và bộ khác. Xóa từ áp dụng đúng sense, loại khỏi học/search; giữ lịch sử và tombstones trong backup/sync. Xóa mẫu/ngữ pháp chỉ bỏ phần đó; xóa câu bổ sung xóa kèm phần gắn với cùng câu, được nêu trong xác nhận. Không thao tác dữ liệu founder thật.

Adapter Gemini browser mở rộng `learning[]`: câu nguồn và ngữ pháp suy ra, target là từ đã chọn, evidence kiểm với transcript, explanation/formula/conditions/error/correction đầy đủ, IPA cả câu hoặc null. Luồng duyệt cho chỉnh nội dung, đổi câu xóa IPA/hint; lưu atomically vào nội dung approved theo phiên bản/lesson, nháp và archive giữ field optional. Mẫu deterministic cho đúng “Who are they? / They are a family.” giữ hai câu gốc, giải thích who/they/are/a family; không giả là OCR hoặc ngữ pháp in trên ảnh. Ảnh chỉ có câu vẫn yêu cầu AI chọn từ nội dung hữu ích. Kết quả mới đã kiểm bằng fixture; độ chính xác Gemini thật trên ảnh founder chưa đo.

[Bằng chứng và giới hạn](evaluations/profile-avatar-mobile-paste-delete-grammar.md). Chỉ local theo ADR049/050.

## Welcome, footer và metadata học — ADR052/053, 11/10/2026

Founder yêu cầu bỏ phần giải thích khó hiểu cuối Welcome, link Cài đặt lặp lại và strip Nghe từ/Nhìn hình/Chơi và nhớ. Welcome chỉ giữ minh họa Cáo/táo/sách/mèo, lời chào ngắn và primary Bắt đầu; bố cục co giãn theo viewport, không chèn nội dung thừa để lấp chiều cao. Header Cài đặt vẫn truy cập được. Bỏ footer Bài mẫu trên mọi route; nguồn mẫu vẫn phân biệt tại chính bài học và trong dữ liệu, không đổi APP_DEMO_MODE/scope/content.

S09 không render mục Nguồn và ghi chú, provenance/literal evidence/IPA-source links/saved notes phía dưới từ. Chỉ bỏ presentation/query không cần thiết; source/evidence/notes/pronunciations vẫn ở database và giữ qua save/reload/backup/sync. Ghi nguồn/giấy phép hình cần thiết vẫn giữ, không coi việc giấu metadata học là quyền bỏ attribution/license.

404 dùng minh họa bitmap gốc Cáo tìm đường bằng bản đồ, 404 bằng text HTML, lời dễ hiểu và primary Về trang đầu. Thực sự trả HTTP404, VI/EN theo settings, không tự redirect/hỏi quyền/call AI. Asset mới tối ưu WebP50538bytes có alpha; không thay mascot gốc. [Evidence](evaluations/welcome-footer-and-404.md). Chỉ local theo ADR049/050.

## Người dùng tự thêm và học — ADR046, 11/10/2026

Steering trực tiếp mới nhất: app mở cho người dùng tự thêm bài, sửa và học. Header dùng **Cài đặt** với icon bánh răng, mở trực tiếp `/settings`. Bỏ toàn bộ hộp thoại “Nhờ bố mẹ / Bố mẹ tiếp tục” và gate giả ở thêm ảnh/từ, sửa từ/ghi chú, tạo bộ thẻ/nhóm, bổ sung hình/câu và các entry trên Home/Today/Library. Navigation là link thực, giữ shared berry/secondary/feature styles, bàn phím và ba nav.

Bố mẹ chuẩn bị bài và bé chỉ chơi là cách gia đình tự sử dụng, không phải vai trò app áp đặt hoặc permission boundary. Không thêm PIN/age gate/parent confirmation thay thế. Copy mặc định VI/EN và offline dùng “bạn”, “thêm bài”, “kiểm nội dung”; giao diện vẫn dễ thương/dễ dùng cho trẻ. Review trước Save, approval revision cho bài học, consent gửi ảnh/chi phí, xác nhận xóa thật, auth/ownership/RLS/CAS/scope vẫn giữ: chúng bảo vệ thao tác/dữ liệu thực, không xác minh người dùng là bố mẹ.

ADR046 supersede mọi requirement/gate UI dành riêng bố mẹ trong đặc tả/skills trước đó, kể cả ADR044/045 và kế hoạch child-first; không supersede hình/thương hiệu/approval/dedup hay điều kiện provider. AI credential input nâng cao ở Cài đặt, đóng mặc định; không có hộp thoại vai trò. Tên nội bộ parent/BYOK cũ và fixture account là implementation/history, không là role mới cho sản phẩm.


## Founder refinement — ADR-042, 11/10/2026

Người dùng thấy AI ready/off và thao tác bật/tắt; key/model/test API nằm trong mục nâng cao đóng mặc định, không yêu cầu hiểu cấu hình để chuẩn bị bài. Form chọn bài/chiều ôn/bộ thẻ nhóm label-control rõ, không còn select trần. Bộ thẻ không giới hạn 500 từ; tìm EN/VI, 12 từ/trang, chọn/bỏ chọn trang và giữ lựa chọn khi đổi trang/tìm. Lưu/version conflict/backup vẫn theo scope. Mỗi buổi học vẫn ngắn tối đa10 câu, độc lập kích thước bộ thẻ.

Chơi & học có mascot cáo riêng và minh họa catalog cho từng mode. Game có stage hình rõ, 3 đáp án bằng nhau cùng hàng ở360px, progress, đáp án đúng/sai có chữ/màu/mascot; animation finite và âm báo gốc nhẹ sau thao tác, nút sound chung/persist, không autoplay/network audio. Pause/route/hide/mute dừng tiếng; reduced motion giữ bản tĩnh và tắt SFX tùy chọn. Điểm game không đổi SRS.

Founder yêu cầu kiểm toàn bộ UI mobile để thật đẹp/dễ thương/dễ dùng: mọi lượt UI phải kiểm đủ route/state liên quan và rà toàn bộ16screen-family ở360/1280, empty/loading/error/disabled/focus/reduced-motion/sound-off; ghi screenshots và lỗi đã xử lý. Giữ Theme C, 3nav, child5–8/parent review/license truth. Automated pass không thay physical-phone hay quan sát bé/bố mẹ thật. [Evidence](evaluations/child-play-and-parent-simplicity.md).


## Google/account and AI refinement — ADR-040/041

S14: Google G hiện ở cả đăng nhập và trạng thái connected; back có mũi tên. Library readiness tách với auth. Device lavender/account mint, xem trước→confirm upload, local được giữ và ảnh gốc opt-in. S16/S06: key chung sẵn dùng theo founder, private override và AI-off/restore bền qua reload; không tự gửi ảnh khi mở màn. Shared action/card styles áp dụng các routes mà không thêm nav. [Evidence](evaluations/ui-and-hosted-cloud-fixes.md).

S01–S16 mở trực tiếp cho người dùng tự thêm, sửa và học theo ADR046; không có parent gate hoặc phân vai bố mẹ/bé. Server auth vẫn kiểm quyền và secret. Cấu hình AI riêng thuộc phần nâng cao đóng mặc định ở Cài đặt; điều kiện provider theo ADR030/040 vẫn áp dụng. UI mặc định dùng lời dễ hiểu, nhãn ngắn kèm icon và voice cues khi chủ động bấm.

**Hiện hành 10/10/2026, ADR-031:** S04 có vùng kéo thả **một ảnh**, nút chọn tiếng Việt/bàn phím và camera riêng. JPEG/PNG/WebP ≤10 MB/20MP, HEIC có hướng dẫn đổi; cùng pipeline metadata-stripped/local draft/crop/rotation/zoom/conflict/quota. Không gửi ảnh khi upload/chụp/mở nháp. S05 → `/capture/:draftId/extract` nối S06/S07: ảnh prepared cạnh kết quả desktop, sticky thumbnail mobile/mở ảnh lớn, cấu hình Gemini key/model ngay tại màn, lý do khóa từng nút, consent trước gửi và parent review trước lưu. Thiếu key không còn bị mô tả là dịch vụ chưa kết nối; thiếu từ hoặc nghĩa không được lưu. Key/session/localStorage theo ADR030; human/device/liveAI pending. [Evidence](evaluations/capture-review-ui.md).

**Hiện hành 11/10/2026, ADR-051:** S04 chia hai tab **Chọn ảnh / Chụp ảnh**, mặc định Chọn ảnh; chỉ hiện phần đang chọn. Chọn ảnh có picker/kéo thả/dán ảnh và chuyển ngay sang xem trước. Chụp ảnh chỉ hỏi quyền sau nút Mở camera; chọn tab không hỏi quyền. Rời tab camera dừng mọi track và hủy kết quả quyền đến muộn; quay lại phải mở camera lại. Đổi tab giữ nguyên nháp, không tự gửi ảnh/AI. Tab dùng được bằng bàn phím, nút chính màu berry, cùng Theme C mobile/desktop. [Evidence](evaluations/capture-tabs.md).

## Khung chung

**Trạng thái local sau T03:** skeleton khi mở/migrate DB, lỗi mở có retry/đóng tab cũ và không xóa dữ liệu để chữa lỗi; lỗi quota/save giữ input/nháp, chỉ báo saved sau commit. Library search đọc derived index theo scope và chia trang 50. Cùng từ/sense không nhân đôi khi save/reload/hai tab, nghĩa khác giữ riêng. Editor giữ input khi stale-version/collision; đổi chữ EN lưu proposal và giữ bản approved đang học, review toàn proposal ở T07. Bài mẫu được phân biệt tại bài học và lưu scope riêng; không có nhãn demo/footer toàn màn theo ADR052, tải lại không reset; không gọi đó là OCR/AI/cloud thật.

Mobile: bottom navigation **`Hôm nay · Từ của con · Chơi & học`**. Desktop: sidebar cùng 3 mục, vùng nội dung rộng tối đa 1.200 px; trang đọc từ/câu tối đa 760 px. Account/settings ở header; capture là CTA trong Hôm nay, mở S04 và không tự bật camera. Search ở trang chủ và thư viện dùng cùng một engine. Route con giữ active nav của khu vực; 16 screen IDs không thành 16 menu items.

Các route dưới đây là đề xuất triển khai; màn hình không có dữ liệu phải có empty state và một hành động tiếp theo. Sheet/dialog dùng URL hoặc state phục hồi được, back không mất draft. Scope thư viện hiện tại hiển thị trong account menu.

Graph tổng thể và graph riêng đủ S01–S16, bố cục, CTA, lỗi/back/retry và trạng thái ảnh đại diện nằm trong **mục 4 của [plan founder](KE-HOACH-FOUNDER.md)**. Đây là bản graph nguồn duy nhất, không cần nhân bản thành 16 tài liệu. Khi đổi hành vi, cập nhật cả graph và bảng route dưới đây. Theme A bị từ chối, B superseded; S03 Theme C hoạt họa đã được founder tạm chốt. Tên app mới Words for Kids; đã có đủ 16 ảnh Words for Kids, 9 revisions theo phản hồi founder và prototype T18; QA25 human pending. Ảnh/prompt cũ giữ nguyên lịch sử tên cũ. Manifest ảnh/prompt/status tại [ui-mockup-plan.json](design/ui-mockup-plan.json).

Bottom nav chỉ hiện thường xuyên trên S03, danh sách S09 và S11. Trong camera/chỉnh ảnh/duyệt/phiên học, dùng Quay lại/Đóng/Tạm dừng để bảo toàn công việc, không để tab đổi màn âm thầm làm mất nháp. S09 có danh sách, chi tiết và editor nhập tay; S10 có câu/mẫu câu/ngữ pháp; S13 có cả bốn mode. Đây là các biến thể thuộc cùng screen ID, không thêm nav chính.

| ID / route | Nội dung và hành động | Trạng thái bắt buộc / điều hướng |
|---|---|---|
| **S01** `/welcome` | Cáo và 3 hình từ quen thuộc, lời chào ngắn, primary `Bắt đầu`; chỉ một entry Cài đặt ở header; không strip/hướng dẫn/footer mẫu | Lần đầu/returning; default VI/Beginner/child-friendly on, phụ huynh thiết lập; không ép login/onboarding form; → S03 hoặc S02 |
| **S02** `/auth` + `/auth/callback` | Lợi ích cloud, Google CTA, `Tiếp tục không đăng nhập` | Loading, cancel, error, session expired; login từ guest → S15, tài khoản mới không có guest data → S03 |
| **S03** `/today` | Primary theo state: empty→`Thêm bài mới`; có dữ liệu→`Chơi 5 phút`, thêm ảnh là secondary; search và bài gần đây dưới vùng hành động chính | Empty lần đầu, offline, pending sync, có dữ liệu, không có card đến hạn; khi chưa có due cards gợi ý ôn bài mới; → mở trực tiếp S04 hoặc S16; S09/S11 để học |
| **S04** `/capture` | Hai tab Chọn ảnh / Chụp ảnh; picker/kéo thả/dán một ảnh hoặc camera preview, camera trước/sau, chụp; chỉ hiện tab chọn | Mặc định Chọn ảnh; tab không hỏi quyền; denied/unsupported có đổi sang chọn ảnh; cancel/chuyển tab/ẩn/rời dừng track và late result; → S05 |
| **S05** `/capture/:draftId/edit` | Crop/xoay/chụp lại, xem độ rõ; nhập tên bài/ngày/tags tùy chọn; consent gửi ảnh; `Phân tích ảnh` | Mờ/ảnh lớn/HEIC/storage đầy/offline; draft local; → S06 hoặc lưu draft/nhập tay |
| **S06** `/capture/:draftId/analyzing` | Các bước thật: chuẩn bị ảnh, gửi ảnh, nhận dạng, kiểm tra; thời gian chờ và `Hủy` | Không giả progress 95%; timeout, quota, refusal; retry cùng request ID; refresh → khôi phục draft/kết quả TTL nếu có |
| **S07** `/capture/:draftId/review` | Tab `Từ vựng · Câu · Ngữ pháp`; mẫu câu thuộc Câu; bộ lọc `Mới · Đã có · Cần kiểm tra`; ảnh nguồn song song desktop/expand mobile; chọn/sửa/tắt mục; `Lưu N mục` | Confidence label định tính, evidence text; thiếu nghĩa; proposed sense; all duplicates; không có nội dung; save error giữ draft |
| **S08** `/lessons/:lessonId` | Tên/ngày/nguồn bài; kết quả thêm mới và linked; từ/câu/grammar đã chọn; `Ôn bài này` | Local saved/cloud pending/cloud synced tách nhau; image removed vẫn có evidence; có thể thêm tag/note |
| **S09** `/library` và `/library/words/:entryId` | Nhãn nav `Từ của con`; list, search/filter mở khi cần; detail ưu tiên word/nghe/POS/nghĩa/1 ví dụ/Ôn từ này; ví dụ khác/collocation/nội dung học bổ sung; ẩn mục nguồn và ghi chú, giữ dữ liệu trong DB | Loading local migration, thư viện rỗng khác empty search, archived/deleted, content incomplete, sửa nội dung; split list/detail desktop, detail page mobile |
| **S10** `/library/sentences`, `/library/patterns`, `/library/grammar` và `/:id` | Câu gốc/câu AI tách nhãn; pattern slots; grammar dùng/công thức/lỗi; ví dụ phân tích từng thành phần; note storyboard | Hiển thị neutral hoặc child-friendly theo setting; regeneration chỉ khi có mạng và người dùng yêu cầu; giữ bản đã sửa |
| **S11** `/practice` và `/practice/decks/:id` | Một phiên gợi ý primary; `Đổi cách học` mở Đến hạn/Theo bài/Từ hay quên/Tự chọn; chọn sense/chiều thẻ trong tùy chọn chi tiết | Deck rỗng, chưa có ảnh, chỉ 1–2 choices; nêu điều kiện và gợi ý chế độ khác; → S12/S13 |
| **S12** `/practice/flashcards/:sessionId` | Một card, nút `Nghe`; `Hiện đáp án`; Standard có Again/Hard/Good/Easy nhãn VI; child-friendly có Chưa nhớ/Nhớ rồi (Again/Good), Hard/Easy mở qua Chi tiết | Đang hỏi/revealed/rating saved; double tap khóa; bàn phím; resume; xoay màn hình không reset; cùng reducer 08 |
| **S13** `/practice/games` và `/practice/games/:mode/:sessionId` | Một game được gợi ý theo eligibility; `Đổi cách chơi` mở đủ 4 mode; một câu hỏi, hints, kiểm tra, giải thích và nghe, tiếp tục | Thiếu asset, đáp án sai/đúng, hint used, keyboard/IME, asset load lỗi; không auto âm thanh trước consent |
| **S14** `/practice/results/:sessionId` | Số câu đúng/sai/hints, từ cần xem lại, lịch ôn tiếp; `Ôn lại từ khó`, `Về hôm nay` | Phiên hoàn tất/dang dở; metric theo review và game riêng; không gán mastered từ 1 lần chơi |
| **S15** `/settings/sync` | Account, scope local/cloud; preview merge; backup; progress batch; conflicts; retry; logout | Không guest data, cùng source đã merge, partial failure, đổi account; xem trước trước khi upload |
| **S16** `/settings` | Khu phụ huynh: VI/EN, level, child-friendly mặc định on, accent/tốc độ, motion/sound; lưu trữ/quota; AI eligibility/key; duyệt hình còn chờ; export/import, xóa dữ liệu/tài khoản | Export/import validation/version conflict; delete scope rõ; cloud delete pending khi offline; privacy explanation dễ hiểu |

## Các khung bố cục quan trọng

S07 desktop:

```text
Tên bài             Đã chọn 12 mục             [Lưu 12 mục]
┌──────────────────────┬─────────────────────────────────┐
│ Ảnh nguồn            │ Từ vựng 9 | Câu 2 | Grammar 1   │
│ zoom / crop evidence │ Mới | Đã có | Cần kiểm tra      │
│                      │ ☑ pencil  noun   bút chì        │
│                      │ ☐ book    đã có  [Xem bản cũ]   │
│                      │ ☑ bank    nghĩa mới? [So sánh]  │
└──────────────────────┴─────────────────────────────────┘
```

S09 detail:

```text
← Thư viện                      [Sửa] [Thêm vào bộ ôn]
apple           noun      [Nghe] [Nghe chậm]
IPA UK/US: [phiên âm đã xác minh]
Cách đọc gần đúng: [gợi ý bằng chữ Việt đã duyệt]
a round fruit ...          quả táo
Ví dụ 1: I eat an apple every day.
IPA: [phiên âm câu đã xác minh]
Cách đọc gần đúng: [gợi ý bằng chữ Việt đã duyệt]
Ví dụ 2: There are three apples in the bag.
IPA: [phiên âm câu đã xác minh]
Cách đọc gần đúng: [gợi ý bằng chữ Việt đã duyệt]
[Ví dụ] [Ghi chú dễ nhớ] [Đã gặp trong 3 bài]
```

S12: ưu tiên thẻ lớn vừa màn hình, nút reveal/rating ở vùng ngón tay, không để nút nghe tiết lộ chữ khi đang nhìn hình đoán từ. Rating chỉ hiện sau reveal.

## Microcopy cần nhất quán

**Thêm từ trực tiếp S03/S09 — xác nhận 09/10/2026:** `Thêm từ` mở trực tiếp editor mới trong S09; thêm từ là secondary action khi đang có CTA học, không thêm nav chính. Input EN có autocomplete từ liên quan, phân biệt từ đã lưu với gợi ý chưa lưu, cho tra nguyên input dù không chọn gợi ý. Preview nghĩa/POS/IPA/cách đọc/ví dụ có nguồn, chọn sense, sửa/duyệt rồi `Lưu từ`. Keyboard combobox có Arrow/Enter/Escape, touch targets và loading/empty/offline/error; đang IME composition không submit. Đổi query/hủy phải bỏ response cũ, không thay input người dùng. Không tự lưu hoặc đổi sang từ gần giống; lỗi tra/save giữ input, cho retry/nhập thủ công. Editor T03 đã lưu sửa/đề xuất vào IndexedDB, chưa có luồng tạo/tra/autocomplete T07.

**Phát âm S09/S10 — founder xác nhận 09/10/2026:** đặt IPA ngay dưới từ tiếng Anh và mỗi câu ví dụ/câu học; tiếp theo là dòng `Cách đọc gần đúng` bằng chữ Việt, trước phần nghĩa/bản dịch. IPA từ có UK/US khi nguồn cung cấp; câu và nút Nghe dùng cùng accent được chọn. Hai dòng đọc được trên mobile/desktop, không giấu trong tooltip. Parent editor cho sửa/duyệt từng loại; bản chưa duyệt không vào child detail. Thiếu dữ liệu thì khu phụ huynh báo phần phát âm chưa đầy đủ, vẫn giữ từ/câu/nghĩa đã lưu; không dựng phiên âm chắc chắn hoặc dùng `/…/` cho gợi ý chữ Việt. Mockup/T02 hiện tại chưa thực hiện bố cục mới.

Phần sửa/note/chọn hình hoặc duyệt enrichment mới tại S09/S10 thuộc phụ huynh; child detail chỉ đọc bản nội dung được duyệt. S09 `Chọn hình` mở shortlist tại chỗ có nguồn/credit, preview/chọn/bỏ qua; giữ từ khi search lỗi và cho thử lại. Ảnh approved nhưng đang tải hiển thị pending, chưa đưa vào game. S16 `Hình chờ chọn` dẫn về đúng sense. Approval do parent/domain lưu theo contentVersion, không tin trường approved từ model.

- Guest: `Thư viện được lưu trên trình duyệt này. Bạn có thể xuất bản sao lưu.`
- AI consent: `Ảnh sẽ được gửi tới dịch vụ AI để nhận dạng. Thư viện vẫn được lưu trên thiết bị nếu bạn chưa bật đồng bộ.` Có link chi tiết về xử lý tạm thời.
- Duplicate: `Đã có trong thư viện. Sẽ thêm nguồn học mới, không tạo thêm từ.`
- Incomplete: `Đã lưu từ. Nghĩa và ví dụ chưa hoàn tất.`
- Offline: `Bạn vẫn có thể học nội dung đã lưu. Phân tích ảnh cần kết nối mạng.`
- Storage error: `Chưa lưu được vì bộ nhớ trình duyệt đã đầy. Xuất bản sao lưu hoặc xóa ảnh nháp để tiếp tục.`

Tên nút và toast phải phản ánh trạng thái thật: `Đã lưu trên máy`, `Đang chờ đồng bộ`, `Đã đồng bộ` là ba trạng thái khác nhau.

### S05 — Trạng thái chờ AI theo ADR-032

Sau Phân tích, giữ ảnh đối chiếu, disable chỉnh/saving trong request, hiện bước thực tế Chuẩn bị/Chờ Gemini/Nhận từ/Kiểm tra, elapsed giây, thanh indeterminate có reduced-motion và Dừng. Từ/nghĩa hoàn chỉnh nhận từ SSE hiện dần có nhãn bản tạm chưa lưu. Không %/ETA giả;90s timeout báo lỗi và giữ nháp cũ. Kết thúc STOP/schema/evidence hợp lệ mới vào review. Error/cancel/key change xóa pending UI ngay.

## Founder date sets — ADR-035

S10 links to /library/lessons: date headings, searchable date/title/English/Vietnamese words, set counts (new/review), title/date edits with version conflict handling, View set and Learn this set. S02 recent lessons display dates and link to all sets. Imported/manual recent sets also expose Rename beside the card; a shared title/date editor opens inside the selected card on both S02 and /library/lessons, focuses the title, supports Save/Cancel, reports save/conflict inline and confirms the persisted name. Rename preserves lesson ID, memberships and review history. One image/file keeps its own lesson; manual entry shares local learning-day set and lets parent choose date. S04 defaults filename/date; S05 save opens that set. Practice respects lesson query. No fourth main navigation.

S05 ADR036: show exact existing-sense badges and optional “Loại từ trùng trong danh sách”; never delete library data or merge other meanings. Automatically search/download selected missing illustrations before the parent approval checkbox, with Stop/retry and text-only fallback. Review original sentence excerpts and Vietnamese supplementary grammar together, then one submit saves approved words/art/grammar/dated lesson atomically. Imported detail/edit/notes paths decode encoded IDs exactly once.

## Founder follow-up: visible review and requests (ADR-037/038)

S03 shows Ôn N từ hôm nay beside the count and opens due flashcards directly. Generic play is secondary when due cards exist. S11 refresh resumes the URL session; no ratings from navigation. Requests show stage/elapsed/progress/results/errors near actions. Public welcome has SEO/share metadata; private app screens stay noindex. See [evidence](evaluations/today-feedback-and-seo.md).


ADR039 S15/account: show verified Google display name/email/avatar (initial/icon fallback), sign-out/account selection; separate device-only versus account saved counts and current learning source. Use readable Open account library, Preview device lessons, Back up/save account copy, Sync now. Storage failure and sign-in are independent; safe HTTP details/retry, last success time and pending upload. Source photos/deletion under additional options, no implicit guest upload.


11/10/2026 ADR043 — S03 typed-word entry and S07 picture/pattern preparation become illustrated, labelled feature actions with a short explanation/arrow and direct navigation under ADR046. S07 Add word is primary plus icon; Filter is quieter; content modes are a grouped icon/text segment with visible selected state. Save/approve/submit CTAs across parent/editor/game flows use the shared berry primitive; destructive confirmations stay distinct, Google brand stays intact. All buttons preserve labels, wrapping,48px/focus/disabled/loading/reduced-motion states. See04 and [button evidence](evaluations/button-hierarchy.md).

## Groups and readable day sets — ADR044,11/10/2026

S09 date manager displays recognizable approved member artwork, localized calendar dates and readable automatic titles; raw UUIDs remain storage IDs, never the visible heading. One Learn CTA; View, pencil edit and Add to group are secondary.12sets/page, search supports ISO/readable dates/title/words, clear search/empty/loading/error, versioned inline Save/Cancel. Detailed new/review definition is collapsed. Today/filtered Library/editor share title presentation without automatic writes.

S09 `/library/groups` is a Library sub-route, no extra main nav. Create/Edit open directly without role warnings, named groups show counts and12-item words/sentences reading tabs, EN/VI search, approved artwork, sentence audio/context and word-only practice. `/library/groups/edit` chooses individual words/cases, sentences or lessons/dates on12-item pages; retains selections and offers all-filtered-pages plus whole-page selection. Date manager supplies `lesson` or `day`; user chooses an existing group or creates one, then reviews and explicitly saves. Report additions and exact duplicates skipped; conflict/name/read/write failures preserve current choices, unapproved/deleted items stay out of child reading. Empty/sentence-only groups work. Rename/unselect members preserves source library and SRS. Existing cloud scope/CAS/archive apply.

S01 welcome retains Start/guest/demo/parent truth, replaces centered empty space with fox/catalog-word illustration stage and warm Theme C surfaces. One finite session greeting, replay through labelled fox button, reduced-motion static. No automatic sound. See04 and [evidence](evaluations/groups-and-lesson-ui.md).

## Founder clarity and bulk selection — ADR045,11/10/2026

All16screen families including offline/error/demo variants follow04’s plain-language rule: remove shared storage footer, shorten Settings/camera/review/edit/account/media copy, no provider HTTP/schema/field/payload diagnostics. Default AI ready/off stays simple; optional credential fields remain behind parent advanced disclosure. Necessary photo consent, charge possibility, backups/deletion/recovery and attribution remain contextual and understandable. S09 Group word/sentence/lesson/day and custom-deck pickers expose Select all N across all filtered pages alongside page-only action, preserve choices outside search, no automatic save. Bulk words use approved scoped search IDs rather than the100-result display cap.

**11/10/2026 — ADR047/048:** Mọi câu ví dụ tiếng Anh, kể cả ví dụ bổ sung và mẫu hỏi–đáp, đặt IPA của **toàn bộ đúng câu** ngay dưới English, trước bản dịch. Khi generate phải yêu cầu IPA cả câu (`exampleIpa` trong worksheet adapter; `examples[].pronunciations` trong enrichment), gồm mọi mệnh đề; không lấy IPA headword thay thế. Không chắc dùng null; không tự gắn verified. Sửa câu phải xóa IPA và gợi ý đọc chữ Việt cũ, rồi duyệt lại. Nội dung cũ ưu tiên IPA đã lưu; hướng dẫn đọc US từ CMUdict chỉ là **Tham khảo**, không chứng minh connected speech; từ chưa biết/đa cách đọc không đoán. Lưu/backup/cloud giữ optional IPA cùng đúng text/version, không đổi dữ liệu người dùng tự động.

Capture cho dán ảnh bằng Ctrl+V / ⌘V khi ở trang thêm bài: một ảnh JPEG/PNG/WebP qua cùng kiểm tra10MB/20MP, bỏ metadata, lưu nháp và mở preview/crop ngay; không tự gửi AI. Dán chữ giữ hành vi bình thường. [Bằng chứng](evaluations/sentence-ipa-and-image-paste.md).


## ADR056/057 — Groups with grammar and voice readiness (11/10)

Group editor adds Grammar and a single Select all words/sentences/grammar across all filtered pages, retaining other selections. Group reader has dated source-named items plus word/sentence/grammar tabs; selecting an item narrows the reading view. Original lessonTitle/date presentation is shared with photo/day sets. Dedup spans the whole group; empty or grammar-only groups work, word practice remains word-only. Selection summaries wrap at mobile360px and editor tabs use four columns. Audio first tap waits for English voice readiness with a stoppable bounded request, rather than reporting a missing voice immediately. [Evidence](evaluations/groups-grammar-and-audio.md). Speaking remains a [review draft](15-speaking-practice.md), not a product screen already shipped.


**11/10 — ADR060, IPA và nghe câu:** Mọi ví dụ English độc lập (ví dụ từ, bổ sung, hỏi–đáp, câu lỗi/câu sửa, từng bước grammar và thẻ ôn/offline) dùng thứ tự English → IPA toàn câu + nút Nghe → bản dịch nếu có. Nút đọc chính xác text hiện tại, độc lập việc tra IPA. Thiếu IPA chắc chắn hiển thị trạng thái rõ, vẫn cho nghe; không đoán/headword substitute. Công thức/placeholders không là câu ví dụ. Generated worksheet yêu cầu `exampleIpa`, `commonErrorIpa`, `correctionIpa` toàn đúng câu, null khi không chắc; enrichment giữ `examples[].pronunciations`. Hai field lỗi/sửa optional trong JSON, giữ qua backup/cloud và clear khi sửa/xóa phần tương ứng. Không verified tự động. [Evidence](evaluations/sentence-ipa-and-listening.md).
