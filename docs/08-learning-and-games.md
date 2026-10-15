# Ôn tập, flashcard và minigame

15/10 founder follow-up ADR087: lượt mới của cả **Điền chữ thiếu** và **Tìm ký tự thiếu** giấu ngẫu nhiên2–3chữ khi có ít nhất3chữ cái; từ2chữ chỉ giấu1để còn cue. Sau Kiểm tra hiện nguyên từ đúng phía trên, đúng/sai đều vậy; lời nhắc sai tô đậm riêng đáp án. Online/offline cùng luật; snapshot lượt cũ giữ nguyên, không sửa lịch sử/content/SRS. [Evidence](evaluations/missing-letter-corrections.md).

15/10 ADR095: mọi lượt Speaking đã thu có điểm0–100; không rõ→0, lỗi dịch vụ→tạm0 kèm lý do, không fake lỗi phát âm. Nhận âm Gemini không gửi đáp án, schema v3; app đối chiếu/tính điểm. Endpoint/request đã rút giới hạn chờ; [spec15](15-speaking-practice.md), [evidence](evaluations/speaking-zero-and-latency.md). Acoustic quality vẫn pending.

Checkpoint15/10 ADR094 — **Speaking v2 implemented_local, A scoped verified; B quality_pending**: Gemini trả nhận âm theo contract strict; client tính điểm/màu, phân biệt thiếu/thay/thừa/uncertain, chọn VI tips và replay đúng WAV đã gửi.48unit+8tool+14productionUI/lint/types/build PASS;8live probes có adverse controls, chưa có pilot100human/child. Scope≤5từ, nghe mẫu/IPA/hint/nguồn ADR093 và SRS/data boundaries giữ. [Evidence](evaluations/speaking-assessment-v2.md), [plan/gates](ai/SPEAKING-ASSESSMENT-UPGRADE-PLAN.md), [spec15](15-speaking-practice.md). Các checkpoint local cũ dưới đây là lịch sử, không khôi phục pack355MB.

14/10 ADR088: Chơi & học hiển thị phạm vi **Đang ôn** (bài, nhóm/bộ thẻ, từ hoặc tất cả) trên màn chọn trò chơi, trong lượt và kết quả. URL + `Session.filter` và lựa chọn local IndexedDB theo scope giữ phạm vi qua reload/resume/thoát và điều hướng sang trang khác; quay lại `/practice` hoặc Speaking không có filter khôi phục lựa chọn trước khi mở game. Chỉ Ôn tất cả xóa lựa chọn đã lưu (chọn bài/nhóm mới thay lựa chọn); chọn bài hoặc nhóm mới thay lựa chọn trước. **Ôn tất cả** bỏ mọi bộ lọc, không xóa nội dung/lịch sử. **Chơi lại** tạo session mới từ đúng câu hỏi vừa chơi, giữ mode/chiều ôn, random thứ tự; revalidate toàn bộ approval/revision/grammar/media, fail rõ khi stale. Lượt cũ thiếu scope được ghi rõ, không đoán tên bài. Speaking dùng cùng phạm vi, replay cùng danh sách.

Game **Nghe & hiểu ngữ pháp** (`grammar-card`) là cách ôn nhẹ trước Xếp câu: câu English → IPA toàn câu/Nghe chủ động → mở nghĩa Việt/conditions/analysis đã lưu → hướng dẫn ghép từng bước có Play/Pause/Next/Replay/static reduced-motion. Bé tự chọn Con hiểu rồi/Cần xem lại; Cả hai lựa chọn đều lưu và chuyển sang câu tiếp theo, tăng tiến độ. Cuối lượt thống kê số câu cần xem lại và có nút Làm lại riêng các câu đó, không kéo thêm câu đã hiểu. Đây là self assessment, không chấm đúng sai hay cập nhật SRS của từ. Không sinh nội dung/IPA để lấp dữ liệu thiếu, không bắt gõ, không tự đọc. Nhóm chỉ có grammar vẫn chọn được. SQL0010 mở rộng mode check, giữ rows/RLS/ownership; offline fallback không resume grammar bằng luật game từ. [Evidence](evaluations/game-scope-and-grammar-cards.md).

13/10 ADR087: game **Tìm ký tự thiếu** riêng với Gõ cả từ/Điền chữ thiếu cũ. Giấu ngẫu nhiên1–3chữ ASCII, giữ ít nhất1chữ và toàn bộ khoảng trắng/dấu câu; từ/cụm đủ nghĩa đã duyệt, tối đa80ký tự. Bé gõ từng ô hoặc chạm bank chữ đúng đã trộn; paste phân phối vào ô, Enter khi IME chưa xong không submit. Snapshot positions giữ qua pause/reload/cloud/archive; server check chỉ1–3chữ thiếu, GameAttempts không SRS. Online có nghĩa/hình đã lưu/Nghe; offline cùng luật. [Evidence](evaluations/missing-letters-game.md).

13/10 ADR086: vòng mới đọc toàn bộ nội dung đã duyệt đủ điều kiện rồi random trước giới hạn10câu (Speaking5từ). Không cắt100bản nguồn hoặc luôn chọn10mục đầu. Target/distractor/choice random; ảnh vẫn phải ready/load/decode và grammar giữ construction/forms/CAS. Bộ custom tên trống dùng “Bộ thẻ của con”. Kho tổng dùng aggregate đã duyệt, nhóm/bài giữ nguyên bản nguồn; word có groupMemberships/lessonMemberships đọc từ memberships thật. [Evidence](evaluations/game-pools-and-global-words.md).

12/10 ADR081: hai game picture-word/word-picture lọc word.art đã resolve/approved/ready; không dùng chỉsearchIndexart. Targets+distractors phảicóhình, media stale/revoked/missing bịbỏ. Cần3choice khác nhau; session được revalidate kểcảdistractors trướcresume/mutations và liveUI; không ghiđiểm từảnhold. Flashcard/letters/spelling vẫnnhậnwordthiếuhình. [Evidence](evaluations/free-picture-sources-and-games.md).


12/10 ADR081 bugfix: catalog ID hợp lệ chưa chứng minh ảnh tồn tại. Cả hai game hình phải tải+decode ảnh trước chọn target/distractor và resume; ảnh lỗi/404/HTML/default bị loại, lấy từ có hình khác. Imported art kiểm đúng headword. Lỗi render dừng nhận đáp án; offline giữ cùng kiểm tra. [Evidence](evaluations/picture-game-image-readiness-fix.md).

12/10 ADR076: grammar guide hết stage cuối thì dừng và tự quay về bước1; pause giữ bước đang xem, reduced-motion/manual controls giữ. Ref của grouped grammar phải là key của representative dữ liệu gốc, không đổi theo title UI. Nhóm nhận lựa chọn riêng từng mục, không bắt chọn hết. Xóa bộ ngày chỉ bỏ bộ và membership, giữ từ/câu/ngữ pháp trong global library; history/scope/CAS giữ. [Evidence](evaluations/edit-save-navigation.md).

## Hiện hành12/10 — ADR075

Grammar library groups Is it…?/Yes,it is/No,it isn’t in one unit with all explanations/examples; Xếp câu practices each form in the unit, snapshots parent/related versions and word scope, not just the primary question. Group selection duplicates individually skipped, new items retained; exact word+POS+sense, no near-meaning merge. Zero new/unchanged reports existing-items and does not write another version.


## Hiện hành12/10 — ADR074

Xếp câu từ grammar/pattern đã lưu và approved,2–12tokens/câu≤200chars; ví dụ quá dài không đưa vào buổi beginner này. Chọn token bằng chạm/keyboard, tháo token/xếp lại, gợi ý âm đầu/câu mẫu, feedback câu đúng/IPA/VI/formula. Snapshot phiên≤10questions, pause/resume/version CAS, gameAttempts one-per-question, không reviewStates/rating. Group refs giới hạn đúng cấu trúc đã chọn; stale grammar stops pending session. SQL0008/cloud/archive grammar mode hỗ trợ.


**ADR064/06512/10:** Speaking từng từ nằm ngay chi tiết từ, giữ IPA/định nghĩa/ví dụ/listening. Hiện phần trăm không thêm nhãn “tham khảo”, tô nhóm chữ và mở bảng từng âm. Chơi & học có ô Nói cùng Cáo: vòng tối đa5 từ đã duyệt, tiếp/bỏ qua/hoàn thành/chơi lại sang các từ kế tiếp, không đổi lịch SRS. `/speaking?word=id` redirect chi tiết, `/speaking` redirect game. [Hiện hành](15-speaking-practice.md), [kiểm local](evaluations/speaking-refresh-and-automatic-sync.md).


**Hiện hành ADR046 (11/10/2026):** Cài đặt và mọi luồng thêm/sửa/học mở trực tiếp; người dùng tự chuẩn bị và chơi, gia đình tự phân vai. Không có parent gate. Review/approval là kiểm nội dung đúng phiên bản; auth/ownership/scope/CAS vẫn bảo vệ dữ liệu thực. Mô tả phân vai bố mẹ/bé cũ bên dưới được thay bởi quy tắc này; xem03/04.


## Bổ sung hiện hành — 10/10/2026

S10 thư viện có Từ/Câu/Mẫu câu/Ngữ pháp trong ba nav chính, search/lesson filter/page50 và links về đúng sense. Sentences lấy primary/second examples approved đúng content version; patterns/grammar lấy supplementary approved khớp entry:sense revision. Có IPA cả câu/hints theo ADR047: verified có bằng chứng; hướng dẫn đọc lexicon/AI mang nhãn Tham khảo. Không gọi bản ghép IPA từng từ là câu đã xác minh. Catalog21 đủ hai ví dụ, parent edit không đảo thứ tự. Form fallback offline chỉ thêm/sửa trường cơ bản, headword cũ read-only; extra/grammar/media đầy đủ chỉnh online và duyệt lại. [Milestone](evaluations/completion-local.md).


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

**11/10/2026 — ADR047/048:** Mọi câu ví dụ tiếng Anh, kể cả ví dụ bổ sung và mẫu hỏi–đáp, đặt IPA của **toàn bộ đúng câu** ngay dưới English, trước bản dịch. Khi generate phải yêu cầu IPA cả câu (`exampleIpa` trong worksheet adapter; `examples[].pronunciations` trong enrichment), gồm mọi mệnh đề; không lấy IPA headword thay thế. Không chắc dùng null; không tự gắn verified. Sửa câu phải xóa IPA và gợi ý đọc chữ Việt cũ, rồi duyệt lại. Nội dung cũ ưu tiên IPA đã lưu; hướng dẫn đọc US từ CMUdict chỉ là **Tham khảo**, không chứng minh connected speech; từ chưa biết/đa cách đọc không đoán. Lưu/backup/cloud giữ optional IPA cùng đúng text/version, không đổi dữ liệu người dùng tự động.

Capture cho dán ảnh bằng Ctrl+V / ⌘V khi ở trang thêm bài: một ảnh JPEG/PNG/WebP qua cùng kiểm tra10MB/20MP, bỏ metadata, lưu nháp và mở preview/crop ngay; không tự gửi AI. Dán chữ giữ hành vi bình thường. [Bằng chứng](evaluations/sentence-ipa-and-image-paste.md).


## 11/10 — Group grammar and first-tap speech (ADR056/057)

Groups include approved grammar in individual/all-lesson/day selection and reading. A single Select all includes all filtered words/sentences/grammar across pages; original source dates/names are shown as group lesson items with deterministic global dedup. Grammar-only groups use reading, not word game/SRS.

Device TTS initializes asynchronously: preload voice enumeration, then wait up to3s for English readiness on the same tap with voiceschanged and bounded fallback polling. Available voice speaks synchronously from the gesture. Stop/route/hide/mute/scope cancel pending requests and reject late events; offline accepts localService English only. Unsupported/no-ready voice still reports recovery rather than claiming universal playback. [Evidence](evaluations/groups-grammar-and-audio.md).

Speaking founder “tiếp tục” authorizes local implementation: SP1 actual browser/Worker inference and decoder/manifest now tested; mic/assessment/VI feedback/green-orange-red game remain **not implemented**: [technical spec15](15-speaking-practice.md), [founder plan17](KE-HOACH-FOUNDER.md#speaking-review). ADR058 requires zero added fees; selected browser-local Wav2Vec2 ONNX/Transformers.js + VI templates, no paid/server/Gemini scoring. Feasibility/quality gates precede full UI/game. No app recording/assessment/SRS change or validated child accuracy claim yet. [SP1 evidence](evaluations/speaking-local-feasibility.md); next browser download/cache/cancel/memory, then recorder/local adapter.


**11/10 — ADR060, IPA và nghe câu:** Mọi ví dụ English độc lập (ví dụ từ, bổ sung, hỏi–đáp, câu lỗi/câu sửa, từng bước grammar và thẻ ôn/offline) dùng thứ tự English → IPA toàn câu + nút Nghe → bản dịch nếu có. Nút đọc chính xác text hiện tại, độc lập việc tra IPA. Thiếu IPA chắc chắn hiển thị trạng thái rõ, vẫn cho nghe; không đoán/headword substitute. Công thức/placeholders không là câu ví dụ. Generated worksheet yêu cầu `exampleIpa`, `commonErrorIpa`, `correctionIpa` toàn đúng câu, null khi không chắc; enrichment giữ `examples[].pronunciations`. Hai field lỗi/sửa optional trong JSON, giữ qua backup/cloud và clear khi sửa/xóa phần tương ứng. Không verified tự động. [Evidence](evaluations/sentence-ipa-and-listening.md).


**11/10 — ADR062, Speaking app local:** Chơi & học → Nói cùng Cáo (`/speaking`), hoặc chi tiết từ → Tập phát âm từ này. Thu tối đa10giây, nghe lại bằng WAV có thời lượng, tải/xóa bộ nhận âm riêng≈377MB, nhận âm local và nhận xét từng từ thử nghiệm (xanh/cam/đỏ/xám). Gemini chỉ viết lời khuyên tiếng Việt từ target/evidence khi người dùng bấm, không nhận bản thu và không có paid fallback. Game đi qua tối đa5từ đã duyệt, thưởng lượt thử; không ghi SRS/reviewEvent hay điểm nhớ từ. Chưa có điểm phát âm chuẩn/kiểm chứng trẻ; trạng thái này thay câu “chưa có mic/UI” của SP1 lịch sử ở trên. [Bằng chứng và giới hạn](evaluations/speaking-app-and-library-fixes.md).

14/10 follow-up: lượt đang dở có Xóa lượt riêng (tombstone + version/CAS đúng scope), giữ từ/attempts/SRS. Lịch sử hoàn thành chuyển vào mục Lịch sử buổi học thu gọn mặc định ở Hồ sơ, có link mở kết quả/replay; hub chỉ giữ đường dẫn. [Evidence](evaluations/session-controls-and-review-progress.md).

14/10 ADR090 (founder clarification, replaces ADR089 review behavior): bỏ Tùy chọn chơi; phạm vi mở trực tiếp từ bài/nhóm và có Ôn tất cả. Bài trong nhóm có ảnh tra đúng word owner và Chơi & học bài này; filter.set giữ đúng tập con được gán cho bài trong nhóm qua game/Speaking/reload/replay. Save nhóm chỉ thống kê trùng từ additions, không tính retained members. Nút xóa nằm trong card dưới dạng control riêng. Lịch sử Profile lấy10lượt/trang theo index scope+createdAt; đóng mục chỉ đếm, không tải snapshots. [Evidence](evaluations/review-retry-group-lessons-and-history.md).

14/10 ADR091: Chơi & học chia hai section Từ vựng/Words và Ngữ pháp/Grammar, giữ tile và filter hiện tại. Lượt đang dở chỉ gồm lượt đã trả lời/bỏ qua câu hoặc game đã chấm đang chờ Next; mở/lật thẻ/gợi ý rồi thoát không tính. Về chọn game bỏ snapshot chưa làm; bản cũ0câu và snapshot bỏ dở qua route khác không hiện resume. Card giữ layout, ghi game + tên nhóm/bài (group-set)/từ và due/weak rõ. [Evidence](evaluations/started-rounds-and-game-sections.md).

14/10 follow-up ADR091: hai game Ngữ pháp cùng một hàng/cùng tile; bỏ rule cũ Xếp câu chiếm toàn hàng. Picture distractors ưu tiên bài/nhóm/group-set đang chọn, bỏ target-only/due/weak khi tìm peers; chỉ thêm từ ngoài khi thiếu đủ3lựa chọn hợp lệ. Game Words có Nghe tự đọc English khi vào câu mới (thẻ chiều Việt→English sau reveal), respect voice mute/cancel, Nghe giữ để lặp; Grammar và màn ngoài game vẫn manual. [Evidence](evaluations/started-rounds-and-game-sections.md).
