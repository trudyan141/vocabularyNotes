# ADR106 — giao diện Trả lời Cáo gọn và loading có sẵn

25/10/2026; source8f70821 + dirty fingerprint24636c203c6c.

## Cause / acceptance

Founder screenshot: scope, menu formula, danh sách từ dài và lý do loại từ nằm trước trò chơi, làm bé phải đọc/cuộn nhiều. ScopedDialogue loading là đoạn chữ riêng, không dùng loading chuẩn. Yêu cầu thu gọn thông tin vận hành, mở game bằng loading sẵn có.

## Change

Metadata vào details “Đổi bài chơi” mặc định đóng và nằm sau trò chơi: scope, chọn cấu trúc, words, lý do loại từ/fallback và RAM-round note. Không bỏ selection, sample fallback hay thông tin giải thích, không parent gate. Child area chỉ header/back, progress, hình/câu hỏi, audio/IPA, chọn/mic/check. Compact prop chỉ bật cho scoped dialogue; cloze/repair giữ thông tin hiện tại.

Đổi grammar đóng panel, đưa scroll/focus về heading trò chơi; mở/đóng panel không remount quiz hoặc mất đáp án. Existing DatabaseLoading/FoxLoading thay raw opening text; không thêm delay tối thiểu hoặc animation mới. Error đọc dữ liệu vẫn Retry, không giấu lỗi.

## Verification

- Lint/typecheck PASS; targeted ESLint/diff checks.
- ProductionUI6/6PASS (build31.6s/browser11.6s), source24636c203c6c: default collapsed + giữ đáp án, chọn grammar/focus + fallback, gated picture fetch→Fox loading→game; mobile360/desktop1280. Discovery6testsPASS.
- Không đổi game engine, pool/quota, DB/schema, dependencies, Vercel env hoặc push main. Không claim speed benchmark; thay presentation trong lúc tải.

Evidence: /var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-JlDeh0/result.json; owned snapshot wfk-ui-source-tZG9K1. Inspected main mobile+desktop and existing Fox loading screenshot. Bounded visual correction: remove duplicate native triangle from summary, keeping app plus/minus; 2/2dev UI confirmation PASS24.5s, final source1593ceee8097, result /var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-O1h1st/result.json. First production deploykha7qmwo7PASS before this CSS-only correction; Final production deploy/buildPASS https://words-for-kids-7oesx8pi2-trudyan141s-projects.vercel.app, alias https://words-for-kids.vercel.app.

Hosted smoke4/4PASS1280/360: sample still playable/metadata collapsed+expandable, exact selected grammar/word questions still playable/technical metadata hidden. Evidence /var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-dialogue-scope-8hN8Ft/result.json. Disposable headless guest contexts only; no founder browser/account data. No claim physical phone/human UX or live voice quality.
