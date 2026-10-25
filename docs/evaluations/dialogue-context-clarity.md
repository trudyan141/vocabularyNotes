# ADR105 — Trả lời Cáo theo hình, cấu trúc và từ đang chọn

25/10/2026. Source8f70821 + dirty fingerprint55b953c06e91.

## Cause and founder steering

Ảnh founder khớp bộ hardcoded fallback: “Cáo chỉ một quyển sách, không phải con mèo” rồi Is it a cat?. Lời dẫn mơ hồ, không có hình làm bằng chứng. Founder chốt: hiện1hình để hỏi; câu hỏi phải theo cấu trúc ngữ pháp và words đang chọn. Copy-only revision triển khai g6qqzonxr trước khi steering đổi, không phải kết quả cuối. Fixed8picture revision đã kiểm UI nhưng bị founder bác vì không theo selection; không deploy bản8picture.

## Final implementation

- Trả lời Cáo mở ScopedDialogue: ưu tiên câu từ scope, khi không có câu phù hợp mở sample8picture theo thứ tự ngẫu nhiên, nhãn/phần giải thích rõ. Founder25/10 xác nhận không được bỏ fallback. Cloze/repair không đổi phạm vi trong task này.
- dialogueInputs lấy approved words bằng candidates selection hiện hành (lesson/deck/set/word/due/weak); hình phải safe/current/load được. Grammar lấy cùng scope lesson/deck/set/word, review/revision và variants hiện hành. Không lấy từ/cấu trúc ngoài selection.
- Cấu trúc có menu chọn rõ; mặc định cấu trúc đầu trong selection, chuyển menu dựng lại lượt. Ảnh/từ hiển thị đúng pool dùng được. Scope không có grammar hoặc construction không hỗ trợ: vẫn chơi bộ mẫu, không chặn bé; lỗi storage là Retry, không che lỗi bằng mẫu.
- Rule compiler hiện hỗ trợ selected example Is it/this/that a/an…?, What is it/this/that? và It/This/That is a/an… . Với câu hỏi yes/no dùng pronoun it trong lời đáp chuẩn. Statement construction được dùng trong câu trả lời, không ép mọi cấu trúc thành Is it. Không claim arbitrary grammar generation; các construction khác dùng sample fallback.
- Từ là noun đã duyệt, tên Latin, có a/an trước đúng lexeme trong approved example. Không đoán countability/article từ spelling hoặc dùng danh sách từ cố định. Một số selected words không đủ bằng chứng sẽ bị loại và có thông báo; naming cần ít nhất2từ phù hợp để có distractor cùng selection.
- Yes/no dựa trên việc ảnh và asked word có cùng ID; No chỉ dùng peer cùng selection khác hình/nghĩa. Ảnh đã duyệt lớn, avatar Cáo/lời hỏi/nghĩa câu hỏi tách rõ. Ảnh lỗi sau load thì dùng context, không trắng. Giữ audio/IPA/mic/replay/manual retry.
- Lượt trong RAM, không ghi game progress/coverage/SRS/cloud hoặc thay user content/schema. Reload/rời trang bắt đầu lại; cấu trúc/ảnh hiện hành cập nhật qua live query.

## Verification

Lint/types PASS;27logic tests PASS (4files), gồm selected words/grammar đổi prompt, exact approved article, unsupported/no fallback, IDB scope/no writes; existing expansion regressions. ProductionUI8/8PASS, build32.4s/browser22.9s: selection fidelity, grammar switch/sample fallback and mic/negation/replay/retry/cancel on mobile/desktop.

First UI fixed-picture run2mainPASS/2fixtureFAIL do strict role=status match2nodes (feedback+IPA); sửa selector, error2/2PASS. Superseded by selection-driven implementation; không dùng các lượt đó để claim final dynamic UI.

No SQL/env/main push. Mechanical detector cho TSX copy-only[] không chứng minh human comprehension. UI providers mocked; không claim child comprehension, physical phone or live voice quality.

Final selection-run eZvFAg:5/8PASS;2fixture locator failures (getByLabel vs combobox, fixed semantic role);1mic page reset during recording, initial metadata-remount hypothesis. Key hardened to semantic grammar/round data, excludes IPA/version-only updates. IPA-remount hypothesis chưa đủ bằng chứng: sentence pronunciation không ghi IDB. Rerunq21jIu7/8PASS, desktop mic bị actual same-URL document navigation với Fast Refresh full reload log; production run phân environment đang chạy. Rerun 8cases under55b953c06e91 pending.

Production runNyTAdm (source55b953c06e91)8/8PASS. Dev full-reload classified environment, no app patch to hide navigation. Final targeted ESLint PASS; inspected mobile selected-word + desktop changed-grammar screenshots. Production deploy/build PASS: https://words-for-kids-c7srqsesb-trudyan141s-projects.vercel.app, alias https://words-for-kids.vercel.app. Hosted4/4PASS1280/360: missing selection→labelled playable pictured sample; exact selected apple+grammar→pictured matching generated question and correct feedback. Output /var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-dialogue-scope-OM9Ff5/result.json.

Evidence: /var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-NyTAdm/result.json; snapshot wfk-ui-source-PPnjkl.

Hosted first attempt: sample branch passed then fixture failed because it inspected profile button before hydration and navigated before library switch. Fixed smoke to await visible switch control and resulting library state; no app patch; final4/4PASS. Disposable guest/sample contexts closed, no founder browser/account data.
