# UI, UX và animation — Words for Kids

12/10 — Tìm hình nhận ảnh riêng theo yêu cầu founder: shared WordPictureSearch có vùng kéo thả focus được, Ctrl+V/⌘V scoped vào từ đang dùng, nút Dán ảnh cho mobile và chọn file. Một ảnh JPEG/PNG/WebP dưới4MB theo upload media hiện có (server12MP, resize512, EXIFstrip/JPEG/receipt giữ). Paste chữ/URL giữ mặc định; không lấy URL ảnh để tự fetch. Clipboard không hỗ trợ/bị từ chối có recovery chọn file; multi-file/format/size sai không upload; lock chống nhận2lượt, abort khi unmount. Reuse upload ký và sense/revision/CAS, editor stage đến Save chung, Prepare lưu hình theo hành vi cũ; không AI/không đổi quota/provider/SQL/env.


12/10 — danh sách gọn và tìm hình có kết quả từng nguồn: bỏ subcards POS/nghĩa và nhãn đếm nghĩa dưới word card, giữ dữ liệu/sense IDs. Detail chooser chỉ hiện mỗi nhãn POS+nghĩa Việt một lần. Tìm hình theo Noto→Twemoji→Fluent→OpenMoji catalog rồi Commons nếu chưa có; lỗi/rỗng/lọc license thử query kế tiếp, báo nguồn/kind/code/status an toàn. They với nghĩa plural people có concept nhóm người; curl body cũ từ candidates=[] nay ra2hình Noto/Twemoji, đã kiểm cả2importJPEG/license thật. Không replay cookie founder. [Bằng chứng](evaluations/simple-word-cards-and-media-fallback.md). Hoàn tất local: 29 tests liên quan + 6 ca UI mobile/desktop PASS, lint/typecheck/build/docs PASS; curl they và 2 import thật PASS. Chưa deploy; không founder data/browser/SQL/env/main.


## ADR081 — Chuông gọn trên header

Chuông Lucide48px cạnh avatar; mobile dùng avatar48px không cắt tên bằng ellipsis; desktop giữ tên profile. Popup neo chuông tối đa380px, giới hạn viewport/safe gutter16px, cuộn nội dung và đọc bằng keyboard. Badge berry số unread; rung650ms hữu hạn khi unread signature thay đổi, không loop hoặc âm thanh; OS/app reduced motion giữ tĩnh. Theme C/Nunito/mascot hiện có, row rõ title/summary/unread, trang detail760px.


12/10 — thư viện tìm từ chính xác và nhiều ảnh: mỗi headword/caseMode một hàng, các sense/POS giữ riêng và có link mở; không gộp/xóa dữ liệu học. Search UI chỉ tên từ/cụm từ + nghĩa Việt, từ đầu token/prefix, không dò ví dụ/definition/tên bài; highlight đúng text có dấu. Chọn/kéo thả tới10ảnh,10MB/20MP mỗiảnh, normalize/EXIF strip tuần tự, local batch có preview/crop/remove/add. Một nút đọc phần còn lại; từng ảnh tuần tự qua adapter/recovery hiện có, stop-on-error, completed checkpoints/CAS/reload giữ; review/save riêng từng ảnh, không auto-save hay auto-upload sau reload. [Bằng chứng](evaluations/search-and-batch.md). Hoàn tất local:35data/search tests+14UIcases mobile/desktop PASS; lint/types/final build/docs PASS; chưa deploy/liveAI/phone-human/cloud/SQL.


12/10 ADR079 — founder bỏ Câu độc lập: library/group chỉ2tab Từ/Ngữ pháp rộng bằng nhau; thêm group chỉ words/grammar hoặc cảbài/ngày, không add sentence refs mới. Ví dụ câu/IPA/audio trong word/grammar vẫn lưu và xem bình thường. Giữ legacy records/refs/backup/cloud; old sentence bookmark mở word chứa ví dụ. Review demo bỏ sentence tab. Supersede3tab cũ; Xếp câu là game grammar vẫn giữ. [Evidence](evaluations/two-learning-types.md).


12/10 — ADR078: thiết kế cảm giác app mobile dùng UI/UX Pro Max + Impeccable: hierarchy rõ, CTA/touch feedback, điều hướng liên tục, form/keyboard, safe-area và trạng thái có minh họa. Responsive chỉ là baseline; giữ Theme C/Next.js/PWA. [Tiêu chí và cách áp dụng](skills/MOBILE-UX.md).

12/10 ADR077: group select-all bật/tắt giữ lựa chọn ngoài lọc; lesson picker dùng hình/name/ngày học+createdAtHH:mm:ss/counts/word preview. Bài ảnh mới default4từ đã duyệt, giữ custom/legacy. Added mint/duplicate lilac details đóng mặc định. Editor luôn hiện hình hiện tại trước Đổi hình. Bổ sung hình có Không bổ sung bền qua reload, preference local IndexedDB theo scope, không sửa content/SRS và chưa backup/cloud; vẫn sửa hình trong editor. [Evidence](evaluations/group-picker-and-pictures.md).


## 12/10 — ADR076: lưu một lần, phản hồi tại hành động

Editor có1Save; không checkbox review/preview/approve lặp. Hình trong editor staged đến Save chung. Mọi submit API dùng pending/success/fail tại nút; success nền mint/chữ đậm/iconcheck, failure đỏ + lỗi phía trên nút; field validation tại input, mở/focus section lỗi. CSS trạng thái phải thắng variant và hover; không chỉ đổi nhãn. Đổi input đưa nút về idle, giữ nội dung sau lỗi. Không toast/provider payload; thao tác file/background/game có semantics riêng. Shared MainNavigation luôn có ở detail/edit/capture/session/public/error; chừa safe-area + chiều cao footer, sticky Save không nằm dưới nav. Trash icon accessible trên toolbar, không kẹp chữ destructive cạnh title dài.

Empty state ưu tiên hình minh họa thật dễ thương cho bé: mascot gốc + heading dễ hiểu và CTA phù hợp (xóa lọc, thêm từ, về thư viện). Dùng asset có sẵn trước; có thể generate hình gốc nếu thiếu, giữ bản tĩnh/reduced-motion. Không dùng icon sách nhỏ/text trống làm default cho màn no-data. Bổ sung hình phân biệt thư viện chưa có từ với tất cả đã có hình. Việc chọn mobile-responsive ở ADR076 đã bị thay bởi ADR078; xem [hướng dẫn mobile UX](skills/MOBILE-UX.md). Skill không thay local/physical-user evidence. [Verification](evaluations/edit-save-navigation.md).


## Hiện hành12/10 — ADR075

Search/filter card with search icon, compact icon radio chips. Detail toolbar Back and icon trash before title; long title never shares line with destructive text. Grammar detail ALWAYS includes color-coded step guide, exact IPA/audio/VI, finite Play/Pause/Replay/manual steps and reduced-motion static. Generic supplied grammar too; do not remove guide in refactors. Error/correction have separate readable tints. Group results actual-added count/duplicates vs neutral unchanged, not generic success.


## Hiện hành12/10 — ADR074

Today2section Ôn bài/Thêm từ, review-group route. Xếp câu có token buttons, answer area, hint/audio/formula; tile full-row, recent-session cards có hình/mode/date/result. Không popup/extra rules. Theme C giữ.


## Hiện hành12/10 — ADR072/073

Ba tab bằng nhau Từ/Câu/Ngữ pháp. Pattern thuộc grammar, không tab thứ tư. Câu/ngữ pháp card ngắn chỉ structure/example, mở route detail thay Sheet. Filter inline ngay trên danh sách. Bỏ prepared-image picker, từng từ thiếu hình có Tìm hình và chọn thumbnail nguồn mở. WordDetail chỉ examples, không grammar/pattern clutter.


12/10 ADR070: Today no word search/preview strip. Play setup collapsed with labeled selects; no sound toggle. Group mint header with counts/primary Play, secondary Add and top delete;6dated sets/page,12content items/page. Dated set delete inside detail. [Evidence](evaluations/compact-games-and-groups.md).


12/10 ADR069: Today review FeatureAction illustrated card. All six Play tiles use picture-first column layout, including Speaking link. Picture preparation lists missing word/name/VI and licensed picker, contains no supplemental patterns. Group editor success shows one message, hides save/footer until new edits. [Evidence](evaluations/review-pictures-and-group-save.md).


## 12/10 — ADR068: Today/review/backup gọn

Today: Gõ từ mới + Thêm bài từ ảnh cùng FeatureAction illustrated card; chỉ một bài gần nhất, tất cả bộ vẫn ở thư viện. Không rename Today/list; edit tên/ngày ở Chi tiết bộ theo ngày trong filtered library. Review mỗi từ accordion đóng mặc định, chỉ hình/tên; bung riêng để chọn/sửa/credit. Settings một Sao lưu và khôi phục, export full archive và restore nhận cả text file cũ. [Bằng chứng](evaluations/compact-home-and-review.md).

## 12/10 — ADR067: luồng ảnh và key đơn giản

Cài đặt chỉ Cài đặt key AI → nhập/Lưu key; bỏ on/off/disclosure/model/test UI và cả khối Chấm phát âm. Editor Phân tích ảnh gửi ngay theo thao tác này, bỏ consent/privacy checkbox và màn xác nhận thứ hai. Review tự loại exact duplicate, chỉ hiện tên trùng khi có, Duyệt và lưu là approval; không checked gate. Autosave/restore/CAS/evidence/IPA, khác nghĩa/POS và atomic save giữ nguyên; reload/restored draft không tự gửi AI. Theo steering trực tiếp, các đoạn consent/checkbox/test UI cũ dưới đây là lịch sử nếu xung đột. [Bằng chứng](evaluations/simple-photo-review.md).

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

Founder yêu cầu kiểm toàn bộ UI mobile để thật đẹp/dễ thương/dễ dùng: mỗi lượt kiểm vài route/state vừa đổi ở360/1280 theo ADR050; chỉ rà toàn bộ16screen-family ở mốc bàn giao lớn, gồm empty/loading/error/disabled/focus/reduced-motion/sound-off; ghi screenshots và lỗi đã xử lý. Giữ Theme C, 3nav, child5–8/parent review/license truth. Automated pass không thay physical-phone hay quan sát bé/bố mẹ thật. [Evidence](evaluations/child-play-and-parent-simplicity.md).


## Action hierarchy refinement — ADR-043, 11/10/2026

Founder asks for stronger, cuter buttons across the project. Shared Button uses solid berry `#B52F60` for save/submit/approve/continue, deeper berry hover, rounded16px corners and soft offset depth with a restrained top highlight. Lavender secondary and berry-text outlined actions retain a quieter role; cancel/back/link/ghost stay light, deletion confirmation uses destructive. Google preserves its brand variant. Press feedback,48px targets, labelled icons, loading text, disabled and visible keyboard focus are required; reduced-motion removes movement. Filled buttons remain flat-colour, no decorative glow or automatic button sound.

Library Add word is berry plus Plus; Filter remains secondary in hierarchy. Content modes are one grouped segmented selection with icon/text and a berry selected state; practice filters share the segment primitive. Whole-function entries (Today typed-word route and Library picture/pattern preparation) use an illustrated horizontal action with title, one short explanation and arrow, reusing existing pencil/book art. ADR046 opens these links directly without a parent gate; these are entry affordances, not automatic lookup/download/upload actions. In-progress image draft gets a compact resume group with FileImage/arrow. [Evidence](evaluations/button-hierarchy.md).

## Theme C refinement — ADR-041, 10/10/2026

Shared controls use berry primary with soft depth, lavender secondary, white outlined controls and icons indicating back/refresh/upload/save. Labels wrap without horizontal overflow; minimum48px default/small and56px large targets. Back has ArrowLeft plus text; Google sign-in/connected state retains original four-colour G, distinct from mascot. Device/account panels use lavender/mint, transfer a white surface and berry CTA; lesson/word cards use white surfaces,16px radius and soft elevation. Reduced-motion disables button movement; loading/error/disabled/focus remain. [Evidence](evaluations/ui-and-hosted-cloud-fixes.md).

## Hướng mỹ thuật tạm chốt: cartoon 2D — Theme C

Ưu tiên trẻ 5–8 tuổi, phụ huynh chuẩn bị bài. Mascot bé cáo san hô riêng, vật/hành động dễ nhận ra, mảng màu sạch và nét mềm; không hình tả thực hoặc mascot/copy/đường học của Duolingo. A xanh bị từ chối, B giấy sổ superseded. Founder đã nói tạm chốt C ngày 09/10/2026: không giữ approval gate cũ. Tên app **Words for Kids** áp dụng từ mockup tiếp theo và code; ảnh/prompt gốc C giữ tên cũ như lịch sử, chưa phải brand cuối đã render.

[S03 Theme C v1](design/mockups/s03-today-theme-c-kids-v1.png), [prompt gốc](design/prompts/s03-today-theme-c-kids-v1.txt) và [manifest](design/ui-mockup-plan.json). S03 gốc là bản lịch sử; bản hiện tại và đủ 16 màn trong gallery. T18 đã có clickable prototype 5 màn S03/S07/S09/S12/S13, self-review và kịch bản human QA; QA25 chưa chạy. T02 đã có shared primitives/mobile+desktop, kiểm contrast/target và baseline fixture ở evaluations/t02-ui-shell.md/ux-performance.md; human/device usability vẫn pending.

Ba nav `Hôm nay · Từ của con · Chơi & học`; CTA `Chơi 5 phút` khi có dữ liệu; lúc rỗng `Thêm bài mới` mở trực tiếp. Header có Cài đặt; capture/login/sync/key/edit/media review không có hộp thoại phân vai theo ADR046. Trẻ nghe→chọn 2–3 hình là đường gợi ý Beginner; còn bốn game theo khả năng đọc/gõ. Detail ưu tiên hình, từ, Nghe, nghĩa ngắn và một ví dụ; nội dung dài mở thêm. Voice cues do bé bấm cho trẻ chưa đọc, không autoplay.

Áp dụng UI/UX Pro Max + Impeccable shape/operate cho CTA/recovery/control, frontend-design cho visual riêng, LottieFiles motion-design + Impeccable animate cho purpose/choreography/interruptions, bilingual-learning-content cho câu ngắn đúng nghĩa. UI/UX Pro Max local query children education trả cả blue/marketing/claymorphism: không áp phần không phù hợp brief. Inspo Headspace gợi friendliness, Duolingo gợi controls lớn/feedback, Daybridge gợi pastel, Bear gợi thư viện đọc rõ; không copy asset. [Nguồn và giới hạn](design/inspo-research.md).

## Minh họa và bố cục được founder sửa ngày 09/10/2026

**Dễ thương nhưng phải nhận ra ngay.** Đồ vật, trái cây, thức ăn và mặt trời không thêm mắt, miệng, má hồng, tay/chân hoặc biểu cảm. Giữ silhouette, bộ phận và tỉ lệ đặc trưng; màu/đường nét mềm làm hình thân thiện. Mascot cáo có biểu cảm; người và con vật giữ đặc điểm tự nhiên. Cặp học phải rõ quai xách, quai đeo, khóa kéo/ngăn túi; không là một khối có mặt. Book rõ gáy/bìa/trang; ruler rõ thân thẳng và vạch chia. Kiểm ở kích thước ảnh game thực 80–120 px.

Không ép mọi ảnh internet giống một mascot/kawaii riêng. Chọn illustration/vector đơn giản, đúng sense, nền sạch; ưu tiên cùng bộ nguồn nếu có. Chuẩn hóa khung, kích thước, khoảng thở và nền thẻ; không tự vẽ thêm mặt hoặc dùng AI biến đổi ảnh nguồn chỉ để đồng bộ. Thiếu bộ phù hợp thì dùng thẻ từ trong lúc phụ huynh chọn hình. Contract tìm ảnh tại 14.

Game 3 lựa chọn dùng **ba thẻ bằng nhau cùng một hàng** ở chiều rộng từ 360 px, cùng tỉ lệ, kích thước hình và độ nổi. Nếu màn quá hẹp để nhận ra hình, dùng ba hàng bằng nhau; không bố cục 2 trên + 1 toàn hàng dưới. Sau trả lời không hạ opacity toàn bộ đáp án: hình vẫn rõ, đúng/sai có border, icon và chữ. Feedback một khối ngắn; kết quả dùng một nhóm số đúng/sai/bỏ qua có icon và mint/pink/lilac, không chồng nhiều card trắng lớn.

Công cụ test, mã Sxx và checkbox mô phỏng lỗi không xuất hiện trong UI mặc định của bé/founder. Prototype chỉ bật chúng qua URL inspect=1; app thật không ship panel này. Một wordmark, một CTA chính; giảm wrapper và copy lặp. Đây là sửa bản dựng T18, không thay palette Theme C và không yêu cầu chốt lại theme.

## Token khởi điểm

| Nhóm | Giá trị đề xuất | Mục đích |
|---|---|---|
| Background/surface | `#FFF8F8` / `#FFFFFF` | Nền sáng, vùng đọc sạch |
| Input boundary / focus | `#9D869F` / `#B52F60` | T02: input contrast 3,16:1 trên nền; outline bàn phím 3 px opaque |
| Text / secondary | `#38213D` / `#6C526E` | Chữ đậm/phụ, có contrast cần đo |
| Primary | `#B52F60` | Berry CTA, không dùng xanh làm màu chủ đạo |
| Accents | `#FFE49A` / `#DEF3E6` / `#ECE3FB` | Vàng/mint/lilac cho illustration và nhóm nội dung |
| Mascot | `#FF925C` | Cáo san hô riêng, không là màu chữ nhỏ |
| Success / warning / error | `#146B4A` / `#8A4B00` / `#B42318` | Icon + lời giải thích, không chỉ màu |
| Font | Nunito variable Latin/Vietnamese, self-host WOFF2 trong prototype | Chốt family có đủ dấu Việt và license, không mặc định import Comic font |
| Type | 16 parent body, 18 child body, 22 subheading, 28 title, 40 word | Trẻ chưa đọc có nghe/icon; không chỉ tăng cỡ chữ |
| Spacing | 4/8/12/16/24/32/48 | Nhịp rõ; không biến từng hàng thư viện thành card khổng lồ |
| Radius | 12 input, 20 panel, 24 flashcard | Bo mềm, giữ phân cấp |
| Touch target | ≥48×48 px; primary khoảng 56 px cao | Nút nghe và answer dễ chạm |

Token cần contrast WCAG AA và QA thực tại 13. Cartoon asset chuẩn theo 14; thumbnail đúng nghĩa và credits, không game hình khi chưa duyệt/ready. Light mode P1; dark mode P2 nếu chưa đủ QA.

## Motion contract

Animation phục vụ feedback, định hướng hoặc giải thích. CSS cho hover/press đơn giản; Motion (`motion/react`) cho card/sheet/layout và storyboard có state. Chưa cần GSAP hoặc runtime Lottie ở P1; skill LottieFiles hướng dẫn nguyên lý, không bắt cài thư viện Lottie.

| Tương tác | Trigger và hành vi | Thời lượng đề xuất | Reduced motion |
|---|---|---|---|
| Press/selection | Scale 0.98 nhẹ, focus vẫn hiện | 100–140 ms | Đổi màu/border |
| Sheet/dialog | Fade + dịch ≤ 12 px, quản lý focus | 180–240 ms | Fade hoặc xuất hiện ngay |
| Save thành công | Check + số mới/trùng hiện tuần tự | 220–320 ms | Hiện ngay cùng text |
| Flip flashcard | Reveal mặt sau; khóa input đến ổn định | 220–280 ms | Thay nội dung, không quay 3D |
| Đúng/sai game | Icon và một câu giải thích; không phạt bằng rung mạnh | 160–240 ms | Icon/text tĩnh |
| Storyboard mnemonic | Người học chủ động Play/Next/Replay/Pause | 2–4 giây/scene, tối đa 3 scene | Stepper tĩnh có đầy đủ chữ |
| Phân tích ảnh | Chỉ trạng thái server thật, shimmer nhẹ nếu có | Không hứa thời lượng | Status text + spinner tối thiểu |

Easing khởi điểm `cubic-bezier(0.2,0,0,1)`; khoảng cách và thời lượng cần QA trên máy thật. Chỉ animate opacity/transform khi phù hợp; tránh layout thrash, blur lớn, animation khi tab hidden. Không cản hành động bằng animation chờ thưởng. Tôn trọng OS `prefers-reduced-motion` cả CSS và JS/MotionConfig, cho giảm thêm trong Settings. Kiểm rapid taps, interruption, back, đổi preference giữa phiên và cancel audio theo QA27; effect không quyết định thời điểm ghi event/data. Không preload mọi motion/game module trong shell; baseline/budgets theo 13.

## Notes giúp nhớ: ba template P1

**1. Word association:** `apple` → icon quả táo → label `a fruit` → câu `I eat an apple.`. Note viết tay của người dùng luôn tồn tại; mnemonic là gợi ý có thể sửa. Không khẳng định mẹo phát âm gần tiếng Việt là IPA chuẩn.

**2. Sentence chunks:** `I / am reading / a book.` Mỗi cụm sáng lần lượt khi người dùng bấm bước tiếp: chủ ngữ, hành động đang diễn ra, tân ngữ. Có toggle VI/EN; full sentence không biến mất. Cho replay để nhìn cấu trúc, không ép phải xem hết mới đọc được.

**3. Grammar transformation:** `She likes apples.` → gắn marker vào `She` → highlight `likes` và đuôi `s`; so sánh `They like apples.`. Giữ cả hai câu và lời giải thích tĩnh. Không dạy rằng mọi từ sau he/she đều thêm s.

Renderer nhận dữ liệu whitelist:

```ts
type Mnemonic = {
  template: 'word-association' | 'sentence-chunks' | 'grammar-transform';
  title: string;
  steps: Array<{ textEn: string; textVi: string; highlightTokenIds: string[] }>;
};
```

Tối đa 3 scene, 120 ký tự ngôn ngữ/step, token IDs phải trỏ vào sentence tokens hợp lệ. Asset ID từ catalog/ảnh đã duyệt theo 14, không URL bất kỳ hoặc SVG/HTML/script model tạo. AI chỉ đề xuất dữ liệu; renderer quyết định animation. Notes thường không cần AI.

## Accessibility và tính rõ ràng

Tab order theo flow; focus trap dialog; focus trở về nút mở; live region cho save/error vừa đủ; card có nút reveal thật; game kéo thả nếu có ở P2 phải có thao tác click tương đương. Không dùng màu để phân biệt grammar một mình: có label và underline/shape. Alt của câu hỏi hình mô tả trung tính không lộ đáp án; nếu screen reader không thể tiếp cận game hình tương đương, cung cấp mode nghe/nghĩa và nói rõ thay đổi mode.

Sound mặc định do người dùng bấm; có mute. Không countdown gây áp lực trong chế độ ôn thường; timer game là tùy chọn. Zoom 200%, màn 360 px và keyboard mobile không che answer CTA.

## Bản thử T18 đã dựng và Impeccable

Đủ 16 raster mockup trong [gallery](design/gallery.html); latest assets/prompt/hash trong [manifest](design/ui-mockup-plan.json), 9 revisions theo phản hồi founder được giữ riêng với bản cũ. [Prototype](design/prototype/index.html) có 5 màn core và luồng hỗ trợ, chưa camera/AI/Google/cloud/SRS thật. Nunito variable self-host, đủ tiếng Việt, WOFF2 101.028 bytes, font-display swap + preload; source/OFL trong prototype/fonts.

Impeccable project-local pin commit, đọc craft-floor/distill/layout/colorize/typeset, context + detector chạy. Đã bỏ panel QA mặc định, sửa 3 thẻ đáp án ngang nhau, feedback gọn và kết quả có màu/icon/chữ; kết quả và ảnh học không nhạt khi disabled. Một palette warning giữ theo brief đã chốt. Default kid mode dùng crisp SVG/vector có sẵn trong code; đây là lựa chọn template/cost của sản phẩm, không thêm tranh sketch/doodle chỉ để trang trí. [Self-review](design/prototype/SELF-REVIEW.md) ghi bằng chứng và các giới hạn.

## Dated lesson / topic group / welcome refinement — ADR044

Date manager uses a compact intro, search with recognizable icon, calendar headings and actual member artwork. Cards have a shallow white surface,16px corners,12rem image area beside content on desktop, image above content on mobile. Learn is berry; View/group/pencil are quiet and labelled. Hide raw UUID headings with a display-only factual fallback, format dates independently of timezone, collapse the detailed grouping explanation.12sets/page; no artificial library cap.

Groups use existing mint/lavender surfaces and FolderHeart, grouped icon/text tabs and12-item word/sentence/lesson-day pickers. Search/filter/page switching preserves selections. Day rows clearly include every lesson on that date; selected words/sentences retain EN/VI labels. Save is berry, counts/result near the action, edit is secondary in reading view. Inputs/checkboxes/48px controls/focus/empty/loading/error/CAS and long names must work at360/1280 and English. No cards nested for decoration or diagnostics in normal child view.

Welcome is a two-column copy/illustration layout on desktop and stacked on mobile: existing separate original fox among licensed apple/book/cat word cards on yellow, mint learning strip and a berry Start. CSS transforms only for finite700ms fox welcome, cubic-bezier(.16,1,.3,1), once per tab session with a labelled replay button. No infinite ambience, blocked CTA or auto audio; OS reduced motion keeps the static composition. Whole16screen-family sweep remains required; automated evidence does not replace founder/child/physical-phone acceptance. [Evidence](evaluations/groups-and-lesson-ui.md).

## Lời giao diện dễ hiểu và chọn nhiều trang — ADR045, 11/10/2026

UI mặc định dành cho trẻ và phụ huynh phải dùng lời đời thường: nêu việc đang làm, kết quả và cách tiếp tục. Không đưa thông tin triển khai như IndexedDB/localStorage, cloud/cache/server/Supabase, schema/HTTP/JSON/checksum, mã nội bộ/UUID, quota/project/billing/request vào hướng dẫn, footer hay chi tiết lỗi. Không có footer giải thích lưu trữ trên mọi màn. Bài mẫu vẫn có nhãn “Bài mẫu”. Nói “bài trên máy này”, “bài trong tài khoản”, “chưa kết nối được; thử lại” khi cần giúp chọn hành động.

Giữ thông tin thực sự ảnh hưởng quyết định ngay đúng chỗ: ảnh gửi cho Google sau xác nhận, chi phí có thể phát sinh bằng lời dễ hiểu, nguồn/giấy phép minh họa, xóa vĩnh viễn/bản sao, bài chưa gửi xong. Không che lỗi hay bỏ khả năng phục hồi. Key/model riêng là tùy chọn nâng cao đóng mặc định trong phần phụ huynh; chỉ giữ tên trường chính xác cần thiết để nhập, không lộ payload/mã lỗi provider. Chẩn đoán triển khai thuộc tài liệu vận hành và dữ liệu lỗi nội bộ đã ẩn credential, không phải product UI. ADR045 supersede phần trình bày diagnostics của ADR033/039, giữ phân loại lỗi và kiểm transport.

Picker có phân trang phải có **Chọn tất cả N** cho toàn bộ kết quả đang lọc ở mọi trang, bên cạnh **Chọn cả trang**. Giữ mục đã chọn ngoài bộ lọc; nhóm có “Bỏ chọn kết quả” chỉ bỏ các mục đang lọc, bộ thẻ có “Bỏ chọn tất cả” rõ phạm vi. Hiển thị số chọn, không tự lưu, không giới hạn100/500 thành viên theo page size; approvals/scope/dedup/version vẫn kiểm lúc lưu. Busy/error không làm mất lựa chọn. Kiểm danh sách hơn10 trang, tìm kiếm, đổi loại nội dung, lưu/mở lại, hai locale và360/1280px.


11/10 ADR056: Group dated items use source names/dates, recognizable catalog art, mint selected surface and berry outline; Grammar joins reading tabs and one broad Select all action removes repeated selection work. Wrap count summaries and four editor tabs at360px. Audio pending status says preparing voice, Stop remains reachable; no automatic speech or infinite animation. [Evidence](evaluations/groups-grammar-and-audio.md). Proposed Speaking color/feedback/game design is isolated in [15](15-speaking-practice.md) pending founder review.


**11/10 — ADR060, IPA và nghe câu:** Mọi ví dụ English độc lập (ví dụ từ, bổ sung, hỏi–đáp, câu lỗi/câu sửa, từng bước grammar và thẻ ôn/offline) dùng thứ tự English → IPA toàn câu + nút Nghe → bản dịch nếu có. Nút đọc chính xác text hiện tại, độc lập việc tra IPA. Thiếu IPA chắc chắn hiển thị trạng thái rõ, vẫn cho nghe; không đoán/headword substitute. Công thức/placeholders không là câu ví dụ. Generated worksheet yêu cầu `exampleIpa`, `commonErrorIpa`, `correctionIpa` toàn đúng câu, null khi không chắc; enrichment giữ `examples[].pronunciations`. Hai field lỗi/sửa optional trong JSON, giữ qua backup/cloud và clear khi sửa/xóa phần tương ứng. Không verified tự động. [Evidence](evaluations/sentence-ipa-and-listening.md).

12/10 ADR077: picker Từ/Câu/Ngữ pháp/Bài sort createdAt giảm dần để mục mới thêm nằm đầu; ngày group theo bài tạo mới nhất và trong ngày cùng thứ tự. Giữ tên/ngày học và dedup refs.
