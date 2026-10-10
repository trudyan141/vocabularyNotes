# UI, UX và animation — Words for Kids
## Người dùng tự thêm và học — ADR046, 11/10/2026

Steering trực tiếp mới nhất: app mở cho người dùng tự thêm bài, sửa và học. Header dùng **Cài đặt** với icon bánh răng, mở trực tiếp `/settings`. Bỏ toàn bộ hộp thoại “Nhờ bố mẹ / Bố mẹ tiếp tục” và gate giả ở thêm ảnh/từ, sửa từ/ghi chú, tạo bộ thẻ/nhóm, bổ sung hình/câu và các entry trên Home/Today/Library. Navigation là link thực, giữ shared berry/secondary/feature styles, bàn phím và ba nav.

Bố mẹ chuẩn bị bài và bé chỉ chơi là cách gia đình tự sử dụng, không phải vai trò app áp đặt hoặc permission boundary. Không thêm PIN/age gate/parent confirmation thay thế. Copy mặc định VI/EN và offline dùng “bạn”, “thêm bài”, “kiểm nội dung”; giao diện vẫn dễ thương/dễ dùng cho trẻ. Review trước Save, approval revision cho bài học, consent gửi ảnh/chi phí, xác nhận xóa thật, auth/ownership/RLS/CAS/scope vẫn giữ: chúng bảo vệ thao tác/dữ liệu thực, không xác minh người dùng là bố mẹ.

ADR046 supersede mọi requirement/gate UI dành riêng bố mẹ trong đặc tả/skills trước đó, kể cả ADR044/045 và kế hoạch child-first; không supersede hình/thương hiệu/approval/dedup hay điều kiện provider. AI credential input nâng cao ở Cài đặt, đóng mặc định; không có hộp thoại vai trò. Tên nội bộ parent/BYOK cũ và fixture account là implementation/history, không là role mới cho sản phẩm.


## Founder refinement — ADR-042, 11/10/2026

Người dùng thấy AI ready/off và thao tác bật/tắt; key/model/test API nằm trong mục nâng cao đóng mặc định, không yêu cầu hiểu cấu hình để chuẩn bị bài. Form chọn bài/chiều ôn/bộ thẻ nhóm label-control rõ, không còn select trần. Bộ thẻ không giới hạn 500 từ; tìm EN/VI, 12 từ/trang, chọn/bỏ chọn trang và giữ lựa chọn khi đổi trang/tìm. Lưu/version conflict/backup vẫn theo scope. Mỗi buổi học vẫn ngắn tối đa10 câu, độc lập kích thước bộ thẻ.

Chơi & học có mascot cáo riêng và minh họa catalog cho từng mode. Game có stage hình rõ, 3 đáp án bằng nhau cùng hàng ở360px, progress, đáp án đúng/sai có chữ/màu/mascot; animation finite và âm báo gốc nhẹ sau thao tác, nút sound chung/persist, không autoplay/network audio. Pause/route/hide/mute dừng tiếng; reduced motion giữ bản tĩnh và tắt SFX tùy chọn. Điểm game không đổi SRS.

Founder yêu cầu kiểm toàn bộ UI mobile để thật đẹp/dễ thương/dễ dùng: mọi lượt UI phải kiểm đủ route/state liên quan và rà toàn bộ16screen-family ở360/1280, empty/loading/error/disabled/focus/reduced-motion/sound-off; ghi screenshots và lỗi đã xử lý. Giữ Theme C, 3nav, child5–8/parent review/license truth. Automated pass không thay physical-phone hay quan sát bé/bố mẹ thật. [Evidence](evaluations/child-play-and-parent-simplicity.md).


## Action hierarchy refinement — ADR-043, 11/10/2026

Founder asks for stronger, cuter buttons across the project. Shared Button uses solid berry `#B52F60` for save/submit/approve/continue, deeper berry hover, rounded16px corners and soft offset depth with a restrained top highlight. Lavender secondary and berry-text outlined actions retain a quieter role; cancel/back/link/ghost stay light, deletion confirmation uses destructive. Google preserves its brand variant. Press feedback,48px targets, labelled icons, loading text, disabled and visible keyboard focus are required; reduced-motion removes movement. Filled buttons remain flat-colour, no decorative glow or automatic button sound.

Library Add word is berry plus Plus; Filter remains secondary in hierarchy. Content modes are one grouped segmented selection with icon/text and a berry selected state; practice filters share the segment primitive. Whole-function entries (Today typed-word route and Library picture/pattern preparation) use an illustrated horizontal action with title, one short explanation and arrow, reusing existing pencil/book art. ADR046 opens these links directly without a parent gate; these are entry affordances, not automatic lookup/download/upload actions. In-progress image draft gets a compact resume group with FileImage/arrow. [Evidence](evaluations/button-hierarchy.md).

## Theme C refinement — ADR-041, 10/10/2026

Shared controls use berry primary with soft depth, lavender secondary, white outlined controls and icons indicating back/refresh/upload/save. Labels wrap without horizontal overflow; minimum48px default/small and56px large targets. Back has ArrowLeft plus text; Google sign-in/connected state retains original four-colour G, distinct from mascot. Device/account panels use lavender/mint, transfer a white surface and berry CTA; lesson/word cards use white surfaces,16px radius and soft elevation. Reduced-motion disables button movement; loading/error/disabled/focus remain. [Evidence](evaluations/ui-and-hosted-cloud-fixes.md).

## Hướng mỹ thuật tạm chốt: cartoon 2D — Theme C

Ưu tiên trẻ 5–8 tuổi, phụ huynh chuẩn bị bài. Mascot bé cáo san hô riêng, vật/hành động dễ nhận ra, mảng màu sạch và nét mềm; không hình tả thực hoặc mascot/copy/đường học của Duolingo. A xanh bị từ chối, B giấy sổ superseded. Founder đã nói tạm chốt C ngày 09/10/2026: không giữ approval gate cũ. Tên app **Words for Kids** áp dụng từ mockup tiếp theo và code; ảnh/prompt gốc C giữ tên cũ như lịch sử, chưa phải brand cuối đã render.

[S03 Theme C v1](design/mockups/s03-today-theme-c-kids-v1.png), [prompt gốc](design/prompts/s03-today-theme-c-kids-v1.txt) và [manifest](design/ui-mockup-plan.json). S03 gốc là bản lịch sử; bản hiện tại và đủ 16 màn trong gallery. T18 đã có clickable prototype 5 màn S03/S07/S09/S12/S13, self-review và kịch bản human QA; QA25 chưa chạy. T02 đã có shared primitives/mobile+desktop, kiểm contrast/target và baseline fixture ở evaluations/t02-ui-shell.md/ux-performance.md; human/device usability vẫn pending.

Ba nav `Hôm nay · Từ của con · Chơi & học`; CTA `Chơi 5 phút` khi có dữ liệu; lúc rỗng `Thêm bài mới` mở trực tiếp. Header có Cài đặt; capture/login/sync/key/edit/media review không có hộp thoại phân vai theo ADR046. Trẻ nghe→chọn 2–3 hình là đường gợi ý Beginner; còn bốn game theo khả năng đọc/gõ. Detail ưu tiên hình, từ, Nghe, nghĩa ngắn và một ví dụ; nội dung dài mở thêm. Voice cues do bé bấm cho trẻ chưa đọc, không autoplay.

Áp dụng product-design cho một CTA/recovery/control, frontend-design cho visual riêng, motion-design cho purpose/choreography, ui-animation cho SVG/interruptions, bilingual-learning-content cho câu ngắn đúng nghĩa. UI/UX Pro Max local query children education trả cả blue/marketing/claymorphism: không áp phần không phù hợp brief. Inspo Headspace gợi friendliness, Duolingo gợi controls lớn/feedback, Daybridge gợi pastel, Bear gợi thư viện đọc rõ; không copy asset. [Nguồn và giới hạn](design/inspo-research.md).

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
