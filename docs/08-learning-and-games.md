# Ôn tập, flashcard và minigame

**Hiện hành ADR046 (11/10/2026):** Cài đặt và mọi luồng thêm/sửa/học mở trực tiếp; người dùng tự chuẩn bị và chơi, gia đình tự phân vai. Không có parent gate. Review/approval là kiểm nội dung đúng phiên bản; auth/ownership/scope/CAS vẫn bảo vệ dữ liệu thực. Mô tả phân vai bố mẹ/bé cũ bên dưới được thay bởi quy tắc này; xem03/04.


## Bổ sung hiện hành — 10/10/2026

S10 thư viện có Từ/Câu/Mẫu câu/Ngữ pháp trong ba nav chính, search/lesson filter/page50 và links về đúng sense. Sentences lấy primary/second examples approved đúng content version; patterns/grammar lấy supplementary approved khớp entry:sense revision. Có IPA verified/hints câu khi dữ liệu tồn tại; không tự ghép IPA từng từ thành phiên âm câu. Catalog21 đủ hai ví dụ, parent edit không đảo thứ tự. Form fallback offline chỉ thêm/sửa trường cơ bản, headword cũ read-only; extra/grammar/media đầy đủ chỉnh online và duyệt lại. [Milestone](evaluations/completion-local.md).


## Triển khai local đã nối — 10/10/2026

Practice dùng approved stored words, 5 modes, max10 câu/phiên; bộ thẻ riêng/direction EN→VI hoặcVI→EN, lọc bài/đến hạn/cần luyện. Primary mode trên fold360px, nhóm lọc nằm trong disclosure. Flashcards cần reveal rồi rating; Again10min, Hard1.2×/min1day, Good1/3day rồi ease, Easymin4day, ease≥1.3 vàinterval≤365. Chỉ rating đổi SRS, games ghi kết quả/hint/skip độc lập. Picture games cần3different ready artworks/words, ba đáp án bằng nhau một hàng360px; thiếu asset thì dùng mode khác. Letters/spelling normalizeNFKC/space/curly apostrophes nhưng giữ case/accent/punctuation, IME Enter không submit giữa composition. Feedback lưu trướcNext, pause/reload/resume không ghi attempt lần nữa.

IPA nguồn đã đối chiếu toàn catalog21, readingHintVi dưới word/example là gần đúng. TTS chỉ English original, không auto play; device voices có fallback. Notes3 template đã có Play/Pause/Replay/stepper/static/reduced-motion/visibility pause; user-entered declarative content không chạy JS/HTML. Ví dụ thứ hai/mẫu câu/grammar thêm vàparentduyệt nếu đủ trường, không AI bịa để lấp thiếu. Catalog21 đã đủ2examples; grammar bổ sung do phụ huynh. Optional Commons adapter đã kiểm local; AI enrichment/hosted Commons UI còn pending. [Evidence](evaluations/local-end-to-end.md).


Words for Kids ưu tiên 5–8 tuổi: Beginner/child-friendly mặc định, phụ huynh chuẩn bị và duyệt; bé nghe từ/chọn hình không cần đọc nhãn. Hai rating ngắn Chưa nhớ/Nhớ rồi. Người lớn và presentation Standard/Advanced là mở rộng sau. G02 gợi 2–3 lựa chọn cartoon rõ theo sense; G01/G03/G04 dùng khi khả năng đọc/gõ phù hợp. Asset và storyboard tuân 14; đúng nghĩa và dễ nhận ra trước dễ thương, đồ vật/trái cây không thêm mặt, không ảnh unreviewed trong game. Ba đáp án hình cùng kích thước và độ nổi, mặc định cùng một hàng ở 360 px trở lên; không dùng 2 trên/1 rộng dưới. Đáp án disabled vẫn giữ màu rõ; trạng thái có icon/chữ.


Chỉ dùng nội dung learningApprovalStatus=approved khớp contentVersion. Media của G01/G02 thêm điều kiện approved+ready; content pending ở khu phụ huynh, không làm bé học nhầm câu AI chưa duyệt. Parent approval/data state theo 06/14; renderer không lấy model-supplied approved làm nguồn tin.

## Đơn vị học

Card theo **sense + chiều câu hỏi**, không chỉ display word. Một từ có hai nghĩa phải có hai card khác nhau. Phiên học chọn deck, mode và snapshot các câu hỏi/đáp án/assets; session lưu ngay để resume. Từ chưa có nghĩa đầy đủ vẫn tìm được trong thư viện nhưng không vào question cần nghĩa/ví dụ chưa có.

Deck mặc định: `Đến hạn`, `Bài vừa thêm`, `Hay quên`, `Tự chọn`. Người dùng chọn mục muốn ôn, số câu mặc định 10 hoặc 5 phút; không khóa phần mềm khi muốn học thêm. Limit từ mới/ngày đề xuất 10, tùy setting.

## Flashcard P1

Mặt trước EN → sau nghĩa VI/EN + ví dụ hoặc nghĩa VI → nhớ EN; card pattern dùng slot fill, grammar dùng chọn áp dụng đúng. Có nút nghe chủ động, reveal thật và bốn rating có giải thích VI: Again `Chưa nhớ`, Hard `Nhớ khó`, Good `Nhớ được`, Easy `Rất dễ`.

Chế độ child-friendly ưu tiên hai nút sau reveal: `Chưa nhớ`→Again và `Nhớ rồi`→Good. `Đánh giá chi tiết` mở Hard/Easy cùng mô tả; chế độ Standard hiển thị đủ bốn. Đây chỉ là cách trình bày, cùng card/event/reducer/version và due calculations. Không ánh xạ mọi answer game thành Good; không giảm scope R12.

Không cho rating trước reveal. Rating commit eventId một lần; spinner/disabled nếu đang lưu. Rời app/resume không ghi thêm event nếu đã acknowledged.

## Lịch ôn v1: thuật toán đơn giản, versioned

Đây là chính sách sản phẩm khởi điểm, không tuyên bố tối ưu khoa học. Chọn state dễ kiểm chứng, có thể migrate sang FSRS ở P2 sau khi đủ dữ liệu và kiểm docs/license.

State theo card: `intervalDays=0`, `ease=2.5`, `successStreak=0`, `dueAt`, `algorithmVersion=1`. Review event reducer:

| Rating | Quy tắc |
|---|---|
| Again | streak=0, intervalDays=0, ease=max(1.3,ease−0.2), due=event+10 phút; có thể quay lại cuối phiên |
| Hard | streak giữ nguyên; interval=max(1,ceil(max(1,oldInterval)×1.2)); ease=max(1.3,ease−0.15) |
| Good | streak+1; interval=1 ngày ở streak 1, 3 ngày ở streak 2, sau đó ceil(oldInterval×ease) |
| Easy | streak+1; interval=max(4,ceil(max(1,oldInterval)×(ease+0.3))); ease=min(3.0,ease+0.15) |

Clamp interval 1–365 ngày cho Hard/Good/Easy; due dựa trên event time được server chấp nhận và library timezone, lưu UTC. Không làm người dùng ôn lại lúc giữa đêm vì đổi múi giờ: UI có lịch theo ngày và giờ nhắc configurable ở P2. `mastery` nếu dùng là indicator có định nghĩa, không phải bảo đảm người học nhớ.

Local reducer để UI phản hồi ngay; server replay theo accepted sequence khi sync, event ID unique; recomputed state thay local snapshot sau reconcile. Đổi thuật toán cần ADR/migration version, không âm thầm thay dueAt.

## Bốn game bắt buộc P1

| Mode | Câu hỏi / đáp án | Điều kiện, hints và giải thích |
|---|---|---|
| G01 picture-to-word | Một ảnh, chọn 1 trong 4 từ cùng nhóm hoặc gõ nếu chọn khó | Ảnh approved đúng sense; distractors khác key, không synonym cũng đúng; tối thiểu 4 candidates cho 4-choice |
| G02 word-to-picture | Một word+context, chọn đúng ảnh | 4 ảnh approved, không trùng/nhập nhằng; alt không ghi nguyên đáp án; bật context nếu từ nhiều nghĩa |
| G03 missing-letters | `a _ p l e`, điền vị trí thiếu | Beginner thiếu 1 ký tự; Standard 2–3; Advanced nhiều hơn nhưng còn cue; không xóa mọi ký tự; multiword giữ spaces/punctuation |
| G04 full-word | Nghĩa/ngữ cảnh/ảnh/âm thanh, gõ từ đầy đủ | Câu hỏi không hiển thị word; accepted variants theo sense/user-approved; nghe chỉ khi mode cho phép |

Với <4 choices có thể chọn 2-choice riêng với nhãn hoặc chọn mode khác; không giả 4 bằng lặp đáp án. Image asset lỗi mid-session → skip không tính sai. Wrong answer giữ câu hỏi và feedback; correct answer chỉ tính một lần. Không cấp điểm từ guess tạo bởi model không có answer contract.

## Answer normalization

NFKC, trim, collapse spaces, normalize apostrophes; case insensitive chỉ khi caseMode fold. Không tự bỏ accents hoặc ký tự trong từ. G04 xét acceptedVariants đã duyệt; fuzzy typo có thể gợi ý `Gần đúng, hãy thử lại`, nhưng không tự tính đúng. Chỉ bỏ dấu chấm ngoài khi question contract cho phép, không biến `can't` thành `cant`.

G03 validate ký tự theo grapheme, giữ các vị trí cố định. IME composition xong mới check; Enter không submit giữa composition. Hint mở chữ đầu hoặc nghe thì ghi hintUsed; không đánh đồng điểm với câu trả lời không hint.

## Progress và reward

Game lưu attempts phục vụ tìm weak words. P1 game không tự thay `review_states`; sau game gợi ý flashcard từ sai để tạo review event có rating rõ. Điều này tránh inflated mastery từ câu multiple choice dễ đoán.

Một phiên có completion note ngắn, có thể confetti nhẹ trong child-friendly và disable được; không leaderboard cạnh tranh. Kết quả hiển thị đúng/sai/skipped/hints và từ nên ôn. Mốc thành tích cần dựa trên hành động thật, không gắn “thành thạo” sau một lượt.

## Audio

Từ/câu được hiển thị trong phần học dùng IPA đã xác minh và dòng `Cách đọc gần đúng` bằng chữ Việt được duyệt theo R07/R08. Nghe/Nghe chậm đọc **text tiếng Anh gốc**, không đọc chuỗi IPA hoặc gợi ý chữ Việt bằng TTS. Accent của IPA và audio phải tương ứng; không có giọng phù hợp thì báo trạng thái thay vì gắn nhãn UK/US sai. Trong câu hỏi yêu cầu nhớ từ, phiên âm/gợi ý có thể tiết lộ đáp án: chỉ hiện cùng đáp án sau reveal hoặc khi người học chủ động xin hint và ghi hintUsed; không thay quy tắc card direction/chấm điểm hiện có.

AudioService dùng voice EN đã load và `voiceschanged`, ưu tiên accent được chọn. `speak()` bắt đầu khi user tap; cancel lời cũ trước lời mới; cancel khi đổi card/route. Rate đề xuất 1.0 và slow 0.8, người dùng điều chỉnh. Không dùng giọng VI đọc từ EN vì không tìm được giọng phù hợp.

Device voice có thể local hoặc remote; offline chỉ hứa khi `localService` phù hợp đã thử trên thiết bị hoặc audio đã cache. Nếu không có tiếng nói, UI vẫn hiển thị phần học và trạng thái `Thiết bị chưa có giọng tiếng Anh`. P2 server TTS lưu asset có model/accent/speed/contentHash để cache và không chạy lại mỗi lần tap.

## Prepared question patterns — ADR-034

Capture review and parent library preparation offer project-authored What is it?/It’s a/an… and Is it…?/Yes, it is./No, it isn’t. Keep the original worksheet text as evidence; label templates as additions. Whitelist concrete singular countable nouns; full usage/formula/analyzed example/common mistake/correction, bilingual example, parent approval and atomic save. Appear in Sentences/Patterns/Grammar, scoped to approved target revision/lesson. Intelligence symbols are not picture-game answers.

ADR036: supported source question/answer excerpts are retained in learning content as optional sourceEvidenceText from the reviewed transcript. Label the original excerpts separately from supplementary Vietnamese explanations/templates. The approved content surfaces in both Patterns and Grammar immediately after photo submit. Three-step declarative question/answer/contraction teaching has explicit next/back/replay, full static grammar explanation and reduced-motion; no model-authored HTML/code. Existing prepared templates remain additions, not retroactively claimed as worksheet quotations.

## Today due entry — ADR-037

Today count and direct flashcard start share scoped approved due selection. Link `/practice?review=due` creates at most10 questions and then includes the saved session ID for refresh; larger counts show remaining-session guidance. New unreviewed approved words count as due. Only explicit ratings alter review events/state. Empty/stale session recovery is visible; offline fallback exposes due review after choosing a local scope.

## Topic groups — ADR044

Parents create groups of approved words and sentences, add individuals or all approved members of one imported/manual lesson or learning date, and edit/rename/remove membership with explicit Save. Duplicate senses/sentence text+translation skip deterministically; never merge different meaning/POS.12-item search/page selection and12-item read views, no total membership cap. Words can start existing short flashcard/games via group deck filter; sentence-only groups use sentence reading/audio/context, never pretend sentence practice or game scores update SRS. Groups preserve underlying source lessons, approvals, examples and review history.
