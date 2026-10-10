# Founder fixes — từ điển, ảnh, BYOK và deploy

Ngày10/10/2026. Thực hiện bốn yêu cầu trực tiếp: setup có nơi lấy từng env; Vercel Git deploy; autocomplete sửa chính tả/tự điền/hình; thay OCR thiết bị bằng AI key phụ huynh browser/localStorage opt-in. ADR-029 supersede quyết định cũ. Skill vocabulary-delivery, impeccable scoped harden/clarify/craft-floor, bilingual-learning-content, React best practices, worksheet-extraction, openai-docs.

## Provider hiện hành — Gemini, ADR-030

Steering mới nhất cùng lượt yêu cầu Gemini thay OpenAI, free tier và chọn nhiều model. Runtime hiện Gemini 3.5 Flash-Lite default; presets 3.1 Flash-Lite/3.6 Flash/3.8 Flash + custom ID. Giá/model/API docs chính thức kiểm10/10 xác nhận free tier theo quota project; không claim project cụ thể miễn phí khi bật billing. Không fallback model/billing/retry tự động. Terms hiện vẫn hạn chế child-directed/likely-under18 clients; code/config được user trực tiếp yêu cầu, không claim Google eligibility; T00 vẫn pending.

Direct Google generateContent, key standard/auth trong x-goog-api-key, không URL/app server. inlineJPEG/responseFormat JSON schema/systemInstruction/no tools/strict evidence parse/non-thought STOP; block/refusal/truncation/malformed/400invalidkey/404model/429quota có phục hồi. Old OpenAI settings ignored, không gửi key cũ sang Google. Saved draft provider phân biệt theo model giữ lịch sử. Candidate ảnh có preview/credit trước parent approve. Consent, crop private data, localStorage opt-in/delete/session/backup exclusions giữ nguyên; không mang OpenAI store:false/ZDR sang Google. CORS OPTIONS thật200 cho originproduction/POST/x-goog-api-key; chưa inference/key thật/quality/account retention.

[Model](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [keys](https://ai.google.dev/gemini-api/docs/api-key), [structured output](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [terms](https://ai.google.dev/gemini-api/terms). [Screenshot Gemini](founder-fixes/gemini-settings.jpg); screenshot OpenAI cũ giữ lịch sử trước steering.

`pnpm check` sau Gemini PASS104 unit-integration/13files/lint/typecheck/build. Tests thêm các model URLs, no auto fallback, standard/authkeyformats/oldprovider rejection, strict malformed/injection/evidence/refusal/truncation và sanitized errors; browser full suite **113/113 PASS** desktop/mobile trước push.

## Implementation trước steering Gemini (OpenAI đã superseded)


- Datamuse live `handsom` trả `handsome`; lookup Wiktionary/Tatoeba live trả “đẹp trai”, adjective, `/ˈhæn.səm/`, ví dụ `a handsome man`/`người đẹp trai` và `How handsome!`/`Đẹp trai quá!`, có nguồn/credit. Chọn sense giữ source/IPA trust; response cũ/abort không đè input. Các corpus example có thể khác sense, phụ huynh phải kiểm. EN-only fallback rõ VI còn thiếu.
-174 OpenMoji17 SVG bundle curated, SHA-safe static IDs, không script/foreignObject/remote references, giữ nguyên asset/licenseCCBYSA4/source/author. Catalog trước, rồi exact mapping; handsome→man chỉ appearance sense. Credit hiện trong chi tiết/offline và lưu source; no imagegen/runtime arbitrary URL. Abstract/missing image cho chọn hoặc bỏ qua, không giả mapping đúng nghĩa.
- OpenAI Responses fixed URL/direct Authorization, store:false/strict JSON/no tools/90s/cancel/một tab Web Locks/no auto retry. Key chỉ session hoặc localStorage opt-in; bỏ nhớ/xóa xóa localStorage và session, cross-tab changes reset key/abort. Không ghi key trong bài/IDB/backup/sync/server. Consent/privacy mỗi reopen; transcribed evidence khác AI-generated meanings/examples. Local browser only resize/crop, không OCR/WASM/reader assets. Offline parent/manual/library/practice vẫn hoạt động.
- Browser CORS OPTIONS thật200/allow-origin*; chưa gọi inference có key thật hoặc trả phí. Tests route OpenAI bằng fixture có nhãn và kiểm auth/body/jpeg/store:false/no app POST, lưu review/reload,401/cancel/backup không có key/deletekey. Không gọi đó là live accuracy/cost/retention/account eligibility. store:false không ZDR; luồng yêu cầu ảnh chỉ learning text đã cắt thông tin riêng trẻ. T00 còn benchmark/account/retention pending.
- Setup viết lại:3 env tối thiểu + localrun, Vercel, parent OpenAI key/billing/model/direct storage, optional Supabase URL/publishable/secret từ đâu, migrations0001–0006, Google ClientID/secret và hai callbacks, Commons signing secret và lỗi.

## Verification đã chạy

Node24.14.1/pnpm11.25.0. Frozen install PASS; Playwright Chromium install PASS. `pnpm check` PASS lint/typecheck/**91 unit-integration/13 files**/production build. `pnpm test:e2e` **111/111 PASS** gồm desktop1280/mobile360/guest/cloud fixture; lần đầu107pass/4fail do testselectors bắt cảNextannouncer/hiddenimagepicker, đã sửa selector đúng vùng và rerun fullpass. `pnpm test:sql` PASS ownership/constraints/immutable history/private-storage migrations0001–0006 trên Postgres thật với identity fixture. Không phải Google/Supabase hosted test.

Impeccable context một lần, detector một lần; duy nhất capture blob `<img>` src assigned qua effect bị mechanical warning, đã xem code/lifecycle. Hai QA browser rounds scoped; không claim human parents/children/physicalphone/fieldmetrics pass. Performance baseline lịch sử không được đổi tên thành build hiện hành.

## Deployment

Vercel project words-for-kids trong team trudyan141s-projects đã tạo và link GitHub trudyan141/vocabularyNotes. Native main production / branches previews; Node24, Next, pnpm frozen/region sin1. Ba production env NEXT_PUBLIC_APP_URL, APP_DEMO_MODE=false, AI_PROVIDER=none đã thêm. Chưa Supabase hoặc media secrets, học local/BYOK không cần cloud. Commit/push và kết quả deployment sẽ ghi khi quan sát READY.

Screenshots đã lưu và xem: [desktop](founder-fixes/add-word-desktop.jpg), [mobile](founder-fixes/add-word-mobile.jpg). Mobile DOM: viewport360, document345 (scrollbar15), form313px với lề16px; không overflow ngang. `scripts/validate_docs.py --full` PASS188links/17skills351resources/25requirements19tasks16screens/27JSON. Credential scan979staged files PASS; eng.traineddata và envlocal excluded. Whitespace check sourceowned PASS; upstream skills/OFL giữ nguyên với whitespace lịch sử để không đổi checksum/license.

## Git deployment đầu tiên đã xác nhận

Commit `7b1e997` pushmain trigger Vercel nativeGit (không CLI manual deploy), deployment `dpl_8BynDkHqp723LwyRV3FhcDvrx3sC` READY, alias [words-for-kids.vercel.app](https://words-for-kids.vercel.app), project/Next/Node24/sin1/3env. Remote [CI38022181410](https://github.com/trudyan141/vocabularyNotes/actions/runs/38022181410) SUCCESS, tất cảsteps/no failures. Hosted health200/demo:false/cloud:false/serverliveAi:false; dictionary suggest handsom→handsome và detail đẹp trai/IPA/native+Tatoeba bilingual examples PASS thật từ deployedserver. LượtGemini sẽ push và ghi deploymentREADY khi quan sát.

## Gemini production đã xác nhận

Commit `f460e1fef700f103b26fa1938b1eb362b568b081` pushmain tạo nativeGit production `dpl_EMHjqzXRtXHRZXm3qE3ZPPPfBGmr` READY, [deployment](https://words-for-kids-k8tx88rez-trudyan141s-projects.vercel.app), [stablealias](https://words-for-kids.vercel.app). Browserhosted thấy Gemini key/default3.5FlashLite/4presets/custom và localStorage/delete; [proof screenshot](founder-fixes/gemini-hosted.jpg). Check104unit/lint/types/build và113E2E PASS; full docs validator193links PASS. CIcode [38022925074](https://github.com/trudyan141/vocabularyNotes/actions/runs/38022925074) SUCCESS, tất cả steps pass/no failures. Không realkey/inference/AIquality/cost/account approval; cloud optional/hostedpending.

Bàn giao chỉ cập nhật tài liệu/screenshot sau runtime f460e1f đã READY và CI SUCCESS; không đổi code sau các checks104/113. Docs full validation cuối PASS195links (sau thêm hostedlink founder), owned whitespace PASS. Next founder test hosted và cấu hình Gemini key trongapp, không gửi key qua chat.
