# UI, UX và animation — Words for Kids

## Founder refinement — ADR-042, 11/10/2026

Phụ huynh thấy AI ready/off và thao tác bật/tắt; key/model/test API nằm trong mục nâng cao đóng mặc định, không yêu cầu hiểu cấu hình để chuẩn bị bài. Form chọn bài/chiều ôn/bộ thẻ nhóm label-control rõ, không còn select trần. Bộ thẻ không giới hạn 500 từ; tìm EN/VI, 12 từ/trang, chọn/bỏ chọn trang và giữ lựa chọn khi đổi trang/tìm. Lưu/version conflict/backup vẫn theo scope. Mỗi buổi học vẫn ngắn tối đa10 câu, độc lập kích thước bộ thẻ.

Chơi & học có mascot cáo riêng và minh họa catalog cho từng mode. Game có stage hình rõ, 3 đáp án bằng nhau cùng hàng ở360px, progress, đáp án đúng/sai có chữ/màu/mascot; animation finite và âm báo gốc nhẹ sau thao tác, nút sound chung/persist, không autoplay/network audio. Pause/route/hide/mute dừng tiếng; reduced motion giữ bản tĩnh và tắt SFX tùy chọn. Điểm game không đổi SRS.

Founder yêu cầu kiểm toàn bộ UI mobile để thật đẹp/dễ thương/dễ dùng: mọi lượt UI phải kiểm đủ route/state liên quan và rà toàn bộ16screen-family ở360/1280, empty/loading/error/disabled/focus/reduced-motion/sound-off; ghi screenshots và lỗi đã xử lý. Giữ Theme C, 3nav, child5–8/parent review/license truth. Automated pass không thay physical-phone hay quan sát bé/bố mẹ thật. [Evidence](evaluations/child-play-and-parent-simplicity.md).


## Theme C refinement — ADR-041, 10/10/2026

Shared controls use berry primary with soft depth, lavender secondary, white outlined controls and icons indicating back/refresh/upload/save. Labels wrap without horizontal overflow; minimum48px default/small and56px large targets. Back has ArrowLeft plus text; Google sign-in/connected state retains original four-colour G, distinct from mascot. Device/account panels use lavender/mint, transfer a white surface and berry CTA; lesson/word cards use white surfaces,16px radius and soft elevation. Reduced-motion disables button movement; loading/error/disabled/focus remain. [Evidence](evaluations/ui-and-hosted-cloud-fixes.md).

## Hướng mỹ thuật tạm chốt: cartoon 2D — Theme C

Ưu tiên trẻ 5–8 tuổi, phụ huynh chuẩn bị bài. Mascot bé cáo san hô riêng, vật/hành động dễ nhận ra, mảng màu sạch và nét mềm; không hình tả thực hoặc mascot/copy/đường học của Duolingo. A xanh bị từ chối, B giấy sổ superseded. Founder đã nói tạm chốt C ngày 09/10/2026: không giữ approval gate cũ. Tên app **Words for Kids** áp dụng từ mockup tiếp theo và code; ảnh/prompt gốc C giữ tên cũ như lịch sử, chưa phải brand cuối đã render.

[S03 Theme C v1](design/mockups/s03-today-theme-c-kids-v1.png), [prompt gốc](design/prompts/s03-today-theme-c-kids-v1.txt) và [manifest](design/ui-mockup-plan.json). S03 gốc là bản lịch sử; bản hiện tại và đủ 16 màn trong gallery. T18 đã có clickable prototype 5 màn S03/S07/S09/S12/S13, self-review và kịch bản human QA; QA25 chưa chạy. T02 đã có shared primitives/mobile+desktop, kiểm contrast/target và baseline fixture ở evaluations/t02-ui-shell.md/ux-performance.md; human/device usability vẫn pending.

Ba nav `Hôm nay · Từ của con · Chơi & học`; CTA `Chơi 5 phút` khi có dữ liệu; lúc rỗng `Nhờ bố mẹ thêm bài` qua gate. Header có Phụ huynh; capture/login/sync/key/edit/media review nằm ở parent context. Trẻ nghe→chọn 2–3 hình là đường gợi ý Beginner; còn bốn game theo khả năng đọc/gõ. Detail ưu tiên hình, từ, Nghe, nghĩa ngắn và một ví dụ; nội dung dài mở thêm. Voice cues do bé bấm cho trẻ chưa đọc, không autoplay.

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
