# ADR095 — Speaking có điểm, sửa schema flow và giảm chờ

15/10/2026. **Implemented_local/scoped verified; chưa deploy, acoustic quality vẫn pending.** Founder yêu cầu trực tiếp: sửa SP-SCHEMA, bản thu không rõ vẫn0 và giảm thời gian chấm. [Spec15](../15-speaking-practice.md) supersede v2/null ở các phần liên quan; không đảo lại theo plan cũ.

## Điều tra và nguyên nhân

Ảnh founder mới xác định được nhánh `SP-SCHEMA`: JSON đã parse nhưng v2 evidence validator từ chối. Không có payload của lượt đó nên **không biết chính xác field nào sai**, không bịa rằng mic/key hoặc phát âm của founder sai.

V2 chỉ bật JSON MIME, không schema provider thực; model phải chép expected, chọn variant, gán match/substitution/missing/uncertain cùng heard. Bất kỳ thiếu field, lệch reference/order/phone count hoặc status-heard tự mâu thuẫn đều làm mất cả kết quả. Unit đã tái hiện các loại lỗi và rule fail. Thêm mã lỗi ở lượt trước chỉ cho biết nhánh, chưa sửa thiết kế nguồn; ADR095 thay nguồn này.

Live đối chứng mới với cùng synthetic cap: compact nhưng còn target cat vẫn100; **bỏ target hoàn toàn**, model trả p, client phát hiện t→p và tính67. Target-conditioned bias có bằng chứng trên control này, không đủ kết luận cho mọi clip. [CLI aggregate](speaking-zero-and-latency/live-cli-controls.json).

Root latency trong endpoint: voicedMs>0 nhưng <180 không đủ nhánh đã nói, đồng thời vô hiệu nhánh im lặng. Từ rất ngắn hoặc một click bị chờ10s. [So sánh deterministic trước/sau](speaking-zero-and-latency/endpoint-comparison.json),50ms energy samples:

| Tiếng mô phỏng | Trước dừng tại | Sau dừng tại |
|---|---:|---:|
|50ms click|10000ms|2500ms|
|100ms short voice|10000ms|650ms|
|400ms voice|1300ms|950ms|

Đây là thời điểm endpoint trên simulation, không phải máy thật/API benchmark. API cũ có30s timeout; độ dài từ không đảm bảo provider/network nhanh. Bản mới6s cho request, không hứa toàn bộ mic/reference/decode cũng nằm trong6s.

## Thay đổi

- V3 `{schemaVersion:3,words:[{index,audibility,heard}]}`, `responseJsonSchema` với inventory enum, required fields/count/bounds; local validation giữ. Không gửi target text/phones/reference: text part chỉ wordCount. Client chọn **một whole variant**, edit-distance với gần/xa/thiếu/thừa, tạo cùng feedback/VI/score. Không còn model mirrored expected/status có thể tự mâu thuẫn. Một request, không tự retry/paid fallback/model swap.
- Mọi **lượt đã thu xong** có0–100. Không rõ wholeword/no speech→0, partial unknown0credit; lỗi hệ thống→tạm0 và nói rõ chưa đánh giá được phát âm. Không fake phones hoặc gán lỗi đọc cho trẻ. Replay/Next/Finish giữ; score0được tính trong vòng, skipped/hủy/no mic chưa phải assessed attempt. Không audio/score persistence/SRS.
- Voice≥100ms/silence550ms, thiếu sustainedvoice2.5s, continuousaudio cap10s. Reference cap3s; Gemini cap6s, explicit minimal thinking, compact request/output budget. Speech100ms không còn kẹt10s; gap450ms giữa tiếng vẫn được unit kiểm không cắt.
- Neutral0 dùng toneuncertain, không xanh thành công. Mã lỗi giữ cho servicefailure, score và diagnosis tách nhau. Benchmark adapter dùng request/observation module thật; numeric0unclear không được đếm là acoustic coverage hoặc system failure. Gate human/child không hạ.

Google tài liệu mô tả [structured JSON Schema](https://ai.google.dev/gemini-api/docs/generate-content/structured-output), [thinking controls](https://ai.google.dev/gemini-api/docs/generate-content/thinking). Đã kiểm thực HTTP200 với responseJsonSchema/minimal ở model hiện có; không lặp lại unsupported responseSchema config400 ở checkpoint cũ. Không claim schema đảm bảo nghe đúng.

## Live và latency thật trong phạm vi kiểm

6request mới (5CLI comparisons +1browser), cộng9trước = **15engineering requests**, template offset15, còn285/300. Audio chỉ Samantha TTS, không founder/child voice, không pilot100mẫu. Tổng hợp public không chứa key/audio/raw output; raw temporary ngoài repo. Không gửi lại audio của founder hoặc điều khiển browser thật.

| Control | Kết quả | Phạm vi thời gian |
|---|---|---|
|V2 apple baseline|100, HTTP200|provider1691ms,718inputtokens|
|Compact + target, apple|75, HTTP200|provider1630ms|
|Compact + target, cap→cat|100 sai, HTTP200|provider1634ms|
|Final unprompted, apple|75, HTTP200|provider2035ms,201inputtokens|
|Final unprompted, cap→cat|67, t→p, HTTP200|provider1913ms|
|Final app browser, apple|100, HTTP200,1request|mic-stop→score2364ms; request→score2107ms; click→score4168ms|

[Browser control](speaking-zero-and-latency/live-browser-control.json): isolated headless Chromium, synthetic WAV đi qua MediaRecorder thật/decode/trim/app/API/DOM; payload không có apple, schema có thật. Click timing gồm fixture chờ phát tiếng0.5s và speech. Browser result không phải mic/giọng founder, iPhone hoặc p50/p95. **Không claim API nhanh hơn từ hai mẫu:** request cuối1.9–2.1s so với baseline1.7s; cải thiện đã chứng minh là hết endpointkẹt10s/giảm silence350ms và caprequest30→6s. Inputtokens718→201 giảm72%, không suy latency giảm72%.

CLIapple75 và browserapple100 cho thấy nhận âm vẫn thay đổi; không bỏ adverse result để báo quality đạt. Syllabic consonants/allophones, mic cắt âm và human false alarms cần kiểm trong pilot có nhãn. Không thêm tweak để ép control100.

## Verification / source identity

Node24.14.1/pnpm11.25.0; base commit e3ecf94783e496b71ac989942d99966301b6bc20, working tree chưa commit.

- `pnpm test tests/unit/speaking-assessment.test.ts tests/unit/speaking-gemini.test.ts tests/unit/speaking-v2.test.ts tests/unit/speaking-graphemes.test.ts tests/unit/speaking-lifecycle.test.ts tests/unit/speaking-observation.test.ts tests/unit/end-of-speech.test.ts`:55PASS/7files.
- `node --test scripts/tests/speaking-benchmark.test.mjs`:9PASS, gồm regression numeric0unclear từng fail trước sửa. `node --check scripts/speaking/benchmark.mjs` PASS; chưa chạy human pilot do thiếu dữ liệu/nhãn được phép.
- `pnpm lint`, `pnpm typecheck`:PASS. Không full suite/hosted/physical device claim.
- Discovery trước run, owned snapshots. `pnpm test:ui -- --mode production speaking-refresh.spec.ts speaking-assessment.spec.ts --grep 'Microphone|Speech ends|Quota failure|v2|v3' --port 4343`:20PASS, build27.1s, browser50.0s. [Result](speaking-zero-and-latency/production-ui-result.json), fingerprint9298fef37719… (full trong result).
- Sau20PASS chỉ đổi tone0uncertain/punctuation, metric tooling và regression của tooling; không inference/endpoint logic đổi. Final source a06f1c641d423c2a7c64ebe49a22abcec85b849cea762af204ebdd632387896e. Scoped final `pnpm test:ui -- --mode production speaking-assessment.spec.ts --grep 'v3 silence|explicit temporary zero' --port 4343`:4PASS, build28.4s/browser11.8s. [Final result](speaking-zero-and-latency/final-zero-ui-result.json). Đã nhìn final [mobile0](speaking-zero-and-latency/mobile-quiet.png)/[desktop serviceerror](speaking-zero-and-latency/desktop-service-error.png):0neutral, lý do đọc được, replay còn dùng. [Desktop0](speaking-zero-and-latency/desktop-quiet.png), [mobile serviceerror](speaking-zero-and-latency/mobile-service-error.png).
- Lượt production đầu16PASS/4FAIL: quota fixture còn đòi không có score (policy cũ), duplicate mic init scripts làm quiet fixture phụ thuộc ordering. Chỉ sửa fixtures theo policy và một mic fixture theo URL; không patch app để che failure. Final dev scoped có3PASS/1navigation ERR_ABORTED khi page.goto hub trong HMR; giữ evidence, kiểm lại production cùng source thay vì sửa app theo dev race.

## Bàn giao

[Local4344](http://127.0.0.1:4344/practice/speaking?word=apple), source snapshot riêng đã cập nhật, HTTP200. Founder reload rồi theo [manual checklist](speaking-assessment-v2-manual-test.md). Không tự mở browser founder, push main, deploy, thêm env Vercel hoặc sửa dữ liệu học. Chưa đủ source/labels100human/child và thiết bị thật để nghiệm thu chất lượng.

Docs/diff checks: `git diff --check` PASS; global docs validator vẫn đúng3link artifact temp cũ trong body-part-photo-analysis-fix.md, không sửa ngoài scope.

Founder manual follow-up15/10: báo trải nghiệm khá ổn và yêu cầu bỏ ghi chú “Điểm lượt nói này…”. Đã bỏ ghi chú thường (VI/EN), giữ thông báo tạm0 khi có lỗi hệ thống để giải thích đúng nguyên nhân. Chỉ copy/UI, scoped ESLint và diff checks; không thêm literal test/build/provider call. Preview4344 cập nhật.
