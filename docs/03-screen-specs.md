# Đặc tả màn hình và điều hướng

S01/S02/S04–S08/S15/S16 là flow phụ huynh; S03/S09–S14 ưu tiên bé học. S09/S10 phần Sửa/Thêm tay/Chọn hình/duyệt AI đi qua parent gate, không thêm screen ID thứ 17. Gate giữ thao tác đang định làm, hủy về trang cũ; gate tránh bấm nhầm, server auth vẫn kiểm quyền và secret. S16 chỉ mở cấu hình key khi provider đủ điều kiện và secret store có thật. Bé không thấy API/provider/quota jargon. Nhãn ngắn kèm icon và voice cues khi chủ động bấm.

**Hiện hành 10/10/2026, ADR-031:** S04 có vùng kéo thả **một ảnh**, nút chọn tiếng Việt/bàn phím và camera riêng. JPEG/PNG/WebP ≤10 MB/20MP, HEIC có hướng dẫn đổi; cùng pipeline metadata-stripped/local draft/crop/rotation/zoom/conflict/quota. Không gửi ảnh khi upload/chụp/mở nháp. S05 → `/capture/:draftId/extract` nối S06/S07: ảnh prepared cạnh kết quả desktop, sticky thumbnail mobile/mở ảnh lớn, cấu hình Gemini key/model ngay tại màn, lý do khóa từng nút, consent trước gửi và parent review trước lưu. Thiếu key không còn bị mô tả là dịch vụ chưa kết nối; thiếu từ hoặc nghĩa không được lưu. Key/session/localStorage theo ADR030; human/device/liveAI pending. [Evidence](evaluations/capture-review-ui.md).

## Khung chung

**Trạng thái local sau T03:** skeleton khi mở/migrate DB, lỗi mở có retry/đóng tab cũ và không xóa dữ liệu để chữa lỗi; lỗi quota/save giữ input/nháp, chỉ báo saved sau commit. Library search đọc derived index theo scope và chia trang 50. Cùng từ/sense không nhân đôi khi save/reload/hai tab, nghĩa khác giữ riêng. Editor giữ input khi stale-version/collision; đổi chữ EN lưu proposal và giữ bản approved đang học, review toàn proposal ở T07. Bài mẫu có nhãn demo và lưu scope riêng, tải lại không reset; không gọi đó là OCR/AI/cloud thật.

Mobile: bottom navigation **`Hôm nay · Từ của con · Chơi & học`**. Desktop: sidebar cùng 3 mục, vùng nội dung rộng tối đa 1.200 px; trang đọc từ/câu tối đa 760 px. Account/settings ở header; capture là CTA trong Hôm nay, mở S04 và không tự bật camera. Search ở trang chủ và thư viện dùng cùng một engine. Route con giữ active nav của khu vực; 16 screen IDs không thành 16 menu items.

Các route dưới đây là đề xuất triển khai; màn hình không có dữ liệu phải có empty state và một hành động tiếp theo. Sheet/dialog dùng URL hoặc state phục hồi được, back không mất draft. Scope thư viện hiện tại hiển thị trong account menu.

Graph tổng thể và graph riêng đủ S01–S16, bố cục, CTA, lỗi/back/retry và trạng thái ảnh đại diện nằm trong **mục 4 của [plan founder](KE-HOACH-FOUNDER.md)**. Đây là bản graph nguồn duy nhất, không cần nhân bản thành 16 tài liệu. Khi đổi hành vi, cập nhật cả graph và bảng route dưới đây. Theme A bị từ chối, B superseded; S03 Theme C hoạt họa đã được founder tạm chốt. Tên app mới Words for Kids; đã có đủ 16 ảnh Words for Kids, 9 revisions theo phản hồi founder và prototype T18; QA25 human pending. Ảnh/prompt cũ giữ nguyên lịch sử tên cũ. Manifest ảnh/prompt/status tại [ui-mockup-plan.json](design/ui-mockup-plan.json).

Bottom nav chỉ hiện thường xuyên trên S03, danh sách S09 và S11. Trong camera/chỉnh ảnh/duyệt/phiên học, dùng Quay lại/Đóng/Tạm dừng để bảo toàn công việc, không để tab đổi màn âm thầm làm mất nháp. S09 có danh sách, chi tiết và editor nhập tay; S10 có câu/mẫu câu/ngữ pháp; S13 có cả bốn mode. Đây là các biến thể thuộc cùng screen ID, không thêm nav chính.

| ID / route | Nội dung và hành động | Trạng thái bắt buộc / điều hướng |
|---|---|---|
| **S01** `/welcome` | Một câu giới thiệu, một minh họa; primary `Bắt đầu` vào guest; secondary `Đăng nhập Google`; level/child-friendly đổi sau trong Settings | Lần đầu/returning; default VI/Beginner/child-friendly on, phụ huynh thiết lập; không ép login/onboarding form; → S03 hoặc S02 |
| **S02** `/auth` + `/auth/callback` | Lợi ích cloud, Google CTA, `Tiếp tục không đăng nhập` | Loading, cancel, error, session expired; login từ guest → S15, tài khoản mới không có guest data → S03 |
| **S03** `/today` | Primary theo state: empty→`Nhờ bố mẹ thêm bài`; có dữ liệu→`Chơi 5 phút`, thêm ảnh là secondary; search và bài gần đây dưới vùng hành động chính | Empty lần đầu, offline, pending sync, có dữ liệu, không có card đến hạn; khi chưa có due cards gợi ý ôn bài mới; → parent gate giữ intended action rồi S04 hoặc S16; S09/S11 cho bé |
| **S04** `/capture` | Vùng drag-drop một ảnh, nút chọn ảnh/bàn phím và camera; yêu cầu định dạng và giới hạn; camera preview, camera trước/sau, chụp | Permission chưa hỏi/bị từ chối; unsupported; cancel; track camera dừng khi rời; → S05 |
| **S05** `/capture/:draftId/edit` | Crop/xoay/chụp lại, xem độ rõ; nhập tên bài/ngày/tags tùy chọn; consent gửi ảnh; `Phân tích ảnh` | Mờ/ảnh lớn/HEIC/storage đầy/offline; draft local; → S06 hoặc lưu draft/nhập tay |
| **S06** `/capture/:draftId/analyzing` | Các bước thật: chuẩn bị ảnh, gửi ảnh, nhận dạng, kiểm tra; thời gian chờ và `Hủy` | Không giả progress 95%; timeout, quota, refusal; retry cùng request ID; refresh → khôi phục draft/kết quả TTL nếu có |
| **S07** `/capture/:draftId/review` | Tab `Từ vựng · Câu · Ngữ pháp`; mẫu câu thuộc Câu; bộ lọc `Mới · Đã có · Cần kiểm tra`; ảnh nguồn song song desktop/expand mobile; chọn/sửa/tắt mục; `Lưu N mục` | Confidence label định tính, evidence text; thiếu nghĩa; proposed sense; all duplicates; không có nội dung; save error giữ draft |
| **S08** `/lessons/:lessonId` | Tên/ngày/nguồn bài; kết quả thêm mới và linked; từ/câu/grammar đã chọn; `Ôn bài này` | Local saved/cloud pending/cloud synced tách nhau; image removed vẫn có evidence; có thể thêm tag/note |
| **S09** `/library` và `/library/words/:entryId` | Nhãn nav `Từ của con`; list, search/filter mở khi cần; detail ưu tiên word/nghe/POS/nghĩa/1 ví dụ/Ôn từ này; ví dụ khác, collocation, notes, lịch sử nguồn mở thêm inline | Loading local migration, thư viện rỗng khác empty search, archived/deleted, content incomplete, sửa nội dung; split list/detail desktop, detail page mobile |
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

**Thêm từ trực tiếp S03/S09 — xác nhận 09/10/2026:** `Thêm từ` qua parent gate mở editor mới trong S09; thêm từ là secondary action khi đang có CTA học, không thêm nav chính. Input EN có autocomplete từ liên quan, phân biệt từ đã lưu với gợi ý chưa lưu, cho tra nguyên input dù không chọn gợi ý. Preview nghĩa/POS/IPA/cách đọc/ví dụ có nguồn, chọn sense, sửa/duyệt rồi `Lưu từ`. Keyboard combobox có Arrow/Enter/Escape, touch targets và loading/empty/offline/error; đang IME composition không submit. Đổi query/hủy phải bỏ response cũ, không thay input người dùng. Không tự lưu hoặc đổi sang từ gần giống; lỗi tra/save giữ input, cho retry/nhập thủ công. Editor T03 đã lưu sửa/đề xuất vào IndexedDB, chưa có luồng tạo/tra/autocomplete T07.

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
