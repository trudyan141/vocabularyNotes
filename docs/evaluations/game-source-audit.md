# Rà nguồn dữ liệu game —25/10/2026

Founder hỏi Thám tử và các game mới có hardcode nội dung hay tạo lượt từ bộ dữ liệu selected; nếu Thám tử không làm được thì tháo. Kết quả: **giữ Thám tử**, vì gợi ý là nguyên `definitionEn` đã duyệt, không phải kho câu đố cố định. Không gọi AI để bịa gợi ý lúc chấm/chơi. Ảnh, nghĩa và đáp án theo cùng sense/scope. Truyện ba tranh đã tháo ở ADR108 vì chỉ thay noun vào cốt truyện cố định.

## Bảy adventure hiện tại

| Game | Dữ liệu tạo lượt | Luật/cảnh cố định và giới hạn |
|---|---|---|
| Thám tử từ vựng | Nghĩa EN của từ đã duyệt làm clue, ảnh và sense ID trong scope làm lựa chọn/đáp án | Clue12–160ký tự, không lộ headword; ít nhất2lựa chọn; lọc từ có định nghĩa quá giống. Không tự viết lại nghĩa khó thành câu dễ bằng AI. |
| Xếp vào giỏ | Định nghĩa/POS của từ selected suy ra category có bằng chứng; hình đại diện lấy trong scope | Taxonomy5nhóm (đồ ăn/động vật/đồ học/quần áo/phương tiện), không phân loại được mọi nội dung; cần≥2nhóm. Không có bảng headword→answer cho từ user. |
| Bingo nghe từ | Từ và ảnh approved trong scope, xáo vị trí/thứ tự nghe | Bảng4–9ảnh, số lượng và matching là luật chơi; bare-word audio không phân biệt homonym nên chỉ dùng1sense của cùng headword trên board. Không gộp/xóa sense trong thư viện. |
| Săn âm cùng Cáo | Từ, hình và approved IPA cùng accent; chọn2từ khác nhau có cùng âm đầu, thêm từ khác âm | Inventory phụ âm hỗ trợ sẵn; không suy từ chữ cái. Cue là từ nguyên vẹn, không isolated-phoneme pack; phải đủ cặp và distractor. |
| Đặt đúng chỗ | Đồ vật selected đủ điều kiện +quan hệ in/on/under có trong grammar được chọn | Cảnh bàn/hộp và cú pháp câu đặt đồ là template của game; chỉ hỗ trợ quan hệ này, không tự sinh cảnh cho mọi ngữ pháp. Không thay bằng một bộ danh từ cố định. |
| Một hay nhiều? | Danh từ selected +dạng plural thực sự có trong approved example, ảnh được xác nhận một đối tượng | Số1–3và cách lặp ảnh là luật chơi. Chưa suy singular-object cho mọi ảnh upload; plural irregular không tự đoán. |
| Cửa hàng của Cáo | Danh từ/plural selected +mẫu yêu cầu được hỗ trợ trong grammar: Can I have/I want/I would like/quantity please | Quầy và số1–3là luật/cảnh game. Chưa hỗ trợ mọi loại yêu cầu/ngữ pháp, hàng phải countable/portable có evidence. |

Tạo lượt ở đây là compiler xác định từ dữ liệu đã duyệt, **không phải gọi AI sinh nội dung mới tại runtime**. Template luật/cú pháp giúp chơi được nhiều từ; không đồng nghĩa đã hỗ trợ mọi grammar hay mọi ảnh. Các điều kiện trên không đủ thì mở mẫu dự phòng đã được founder cho phép; phần Thông tin bài chơi ghi sample, không ghi giả selected hoặc thêm mẫu vào thư viện. Không bỏ fallback. Network/database/media failure thật vẫn có Retry, không che bằng mẫu.

## Các game thêm ở đợt trước

- Nối đôi/Lật thẻ: lấy approved words/pictures trong selection, group2–3pairs theo sense IDs, không bộ đáp án cố định. Ít nhất2cặp, wrong/next như feedback trước.
- Tìm ký tự thiếu: mask/tiles sinh từ chính chuỗi từ selected, giữ ký tự lặp; không list bài chính hardcode.
- Câu thiếu mảnh/Bác sĩ câu: dùng `gameActivities` đã duyệt gắn với grammar/content phiên bản đang chọn. Không tự áp một template bất kỳ cho mọi raw grammar. Thiếu annotation hợp lệ mới dùng câu mẫu; đây là fallback đã được giao giữ, không claim câu mẫu thuộc bộ selected.
- Trả lời Cáo: compiler nhận diện một số cấu trúc identity/naming từ selected grammar +pictured nouns, dựng câu hỏi/đáp theo scope. Ngoài cấu trúc hỗ trợ thì sample; không claim hiểu tất cả grammar.
- Xưởng xếp chữ và Truyện ba tranh đã rút, không thêm lại để tăng số lượng game.

## Probe / fix

Đường dữ liệu: Practice filter→candidates/approved scope→`PracticeRepository.gameInputs`→picturedWords/current grammar→`playWord`→`makeQuestions`; sample chỉ ở `buildAdventure` khi primary không tạo được câu nào. Primary và sample không trộn lẫn trong cùng pack.

Audit phát hiện compiler adventure loại trùng theo headword cho mọi game, làm mất1sense trong Thám tử (bat:gậy/bat:con dơi). Regression đỏ trước fix nhận1target thay vì2. Fix distinct theo sense ID cho các game hình/nghĩa; chỉ Bingo giữ lọc cùng headword vì bare audio không phân biệt được. Săn âm không lấy chính cùng headword khác nghĩa làm từ mẫu.

## Evidence

- `tests/integration/adventure-source.test.ts`:7mode đi qua LocalRepository→approved saved words+grammar→actual scope→compiler. Fixture7từ pencil/rubber/ruler/notebook/fish/car/chair đều không nằm trong fallback word facts; definitions/examples/IPA authored riêng cho fixture. Assert pack.source=selection, mọi target/choice/anchor/request trong scope, đúng grammar mode, ngoài scope chỉ fallback. Một ca sửa definition→đổi clue, definition lộ headword→loại, không ghi session/SRS.
- Existing expansion integration tests verify reviewed grammar activities/source invalidation, Match/Memory source/board state and no review-event writes. Scoped dialogue tests cover selected grammar/words and fallback.
- E2E fixture đầu chọn pencil/ruler/chair nhưng2từ chỉ là candidate import, không phải seeded library entries →selected empty và evaluate thất bại. Đây là lỗi fixture (HIegka), đã sửa dùng3seeded words với3definition mới khác bộ mẫu; không patch app để khớp fixture.
- `pnpm lint && pnpm typecheck && pnpm exec vitest run tests/integration/adventure-source.test.ts tests/unit/adventure-games.test.ts tests/integration/game-expansion.test.ts tests/unit/scoped-dialogue.test.ts` PASS,53logic/4files. Homonym regression red1target→green2targets; Bingo still1bare-headword candidate.
- `pnpm test:ui -- --mode production adventure-games.spec.ts --grep 'detective uses the selected|word-detective sample|sound-hunt sample|Bingo uses exactly' --port 4369` discovery8,build29.9s,browser10.8sPASS;8/8mobile360/desktop1280 cases. Source b4c1d0defa397f12e7ee89480c1316a5cd2c43bd57dd6eae116ab1c1ce67ae51 /HEAD8f70821+dirty. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-bJihre/result.json`, snapshot`wfk-ui-source-SC75SM`. Selected3newdefinition fixture drives exact clues/art and tap grading; sample/fallback and sound/Bingo regressions retained. Reviewed selected-source screenshot.
- `vercel deploy --prod --yes`: ovc29cog6/production alias updated, build29sPASS. `node /tmp/wfk-detective-source.mjs`:4/4hostedPASS, selected3custom definitions/art/tap grading and sample fallback at360/1280. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-detective-source-77OjRU/result.json`; owned disposable sample/guest contexts, SWblocked/audio mocked, no founder account/browser data touched. Không claim live AI/giọng trẻ/điện thoại thật hoặc quality/ambiguity của mọi definition user.
