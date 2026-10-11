# Speaking — bước thử chạy miễn phí, 11/10/2026

**Đã chạy bộ nhận âm thật trong trình duyệt local, không gọi API chấm giọng hay gửi audio ra ngoài.** Model chuyên tiếng Anh nhận được `cat`, `book`, `cup` từ các bản đọc công khai; mỗi clip khoảng1,1–1,3s trên máy desktop thử. Đây là nền kỹ thuật cho Speaking, chưa phải bộ chấm phát âm trẻ hoàn tất. Điểm, màu lỗi, mic và game chưa có trong app.

Founder yêu cầu0đ và đã nói “tiếp tục” sau [plan17](../KE-HOACH-FOUNDER.md#speaking-review). Theo ADR049 chỉ dùng code/model/audio fixture local, Playwright profile tạm. Không dùng browser/account của founder, mic thật, giọng trẻ, Gemini/API inference, server scoring, billing, push hay deploy. Download là file công khai miễn phí; không token, trial, quota mua hoặc fallback trả phí.

## Phần đã làm

- Pin Transformers.js3.8.1/package lock, giữ dependency native build scripts tắt. Không global install/plugin/skill mới.
- [Manifest](../../src/lib/speaking/model.ts) chốt một model/revision, byte count/SHA-256, allowlist các file công khai; không URL hosted inference.
- [CTC decoder](../../src/lib/speaking/ctc.ts) dùng logits thật, collapse blank/repeated label, giữ nhãn âm đa ký tự/timing/confidence. Special/word separators bị loại; kiểm output shape/finite/duration/blank ID. Timing là ước tính theo frame; posterior không phải xác suất bé nói đúng.
- [CLI spike](../../scripts/speaking/spike.mjs) yêu cầu fixture và `--download` chủ động nếu chưa có weights; kiểm hash/size, cache file ngoài repo, download timeout180s, inference timeout60s. Fresh Worker CPU/WASM một thread, trực tiếp `AutoProcessor`/`Wav2Vec2ForCTC`/vocab; không đưa câu đích vào inference. Khi hoàn tất đóng browser/server/Worker và xóa runtime/fixture tạm của lần chạy.
- [Bốn audio gốc](../../tests/fixtures/speaking/LICENSE.md), tổng50.175bytes, của Dvortygirl/CC-BY-SA3.0, có source/hash/attribution. Không sửa binary; chỉ mono/resample16kHz/padding250ms mỗi đầu trong RAM khi thử. Không phân phối giọng TTS tổng hợp tạm.
- Inference network chỉ GET asset/fixture từ loopback; chặn mọi external URL/phương thức khác. Không nối model/runtime vào Next routes, main bundle, public/SW precache hoặc upload giọng.

## Model được chọn theo kết quả

[Speako English phoneme ONNX](https://huggingface.co/robg/speako-phoneme-recognizer) là export Apache-2.0 của [Wav2Vec2 English TIMIT](https://huggingface.co/vitouphy/wav2vec2-xls-r-300m-timit-phoneme). Chốt revision `ad0f63cd58fc1bb1e9c261a3b4135997a31c2e58`, q8 file355.216.594bytes; SHA-256 `1e03fc69aa5be1f365a94ffa17c060feafdadb626b8a662b7ba6b36cb9f0577e`, blank41. Runtime/config khoảng22MB ngoài weights. Đây là file size, không phải số RAM cần dùng. [Transformers.js3.8.1](https://huggingface.co/docs/transformers.js/v3.8.1/index)/[ONNX Runtime Web](https://onnxruntime.ai/docs/tutorials/web/) là runtime được dùng thật trong probe.

Model espeak318MB trong plan ban đầu được thử và bỏ làm baseline bước tiếp: nhiều nhãn sai trong từ ngắn TTS. Full-precision diagnostic riêng1.264.009.987bytes cũng nhận `cat → k a d`, cùng lỗi với q8, nên tăng dung lượng không sửa được mẫu đó. Diagnostic này chạy Node ORT/CPU với một clip, không chứng minh nguyên nhân cho mọi lỗi hoặc tốc độ browser. Nó không phải app fallback; file nằm ngoài repo. Giữ [espeak q8 report](speaking-espeak-control.json) và [English q8 TTS report](speaking-local-spike.json), không xóa kết quả kém.

## Kết quả public audio

[Report đầy đủ](speaking-public-fixture-spike.json): Chromium ephemeral profile, viewport360×800 **trên desktop host**, không phải điện thoại. Session/model load2.371ms từ file loopback đã tải; thời gian này không tính network download và không phải browser cache persistence. Lần đo diễn ra đồng thời lint/typecheck, không là benchmark p95.

| Mẫu | Chuỗi âm model xuất | Thời gian xử lý | Diễn giải |
|---|---|---:|---|
| cat, raw | k æ t |790ms|Nhận các âm mục tiêu |
| cat, padded | k æ t |1.225ms|Nhận cả âm cuối |
| book, padded | b ʊ k |1.117ms|Nhận các âm mục tiêu |
| cup, padded | k ə p |1.294ms|STRUT là `ə` trong inventory của model; không dùng nhãn này để đổi IPA bài học |
| apple, padded | æ p l |1.303ms|Chưa có evidence để coi thiếu schwa là lỗi; cần accepted variants/syllabic-consonant handling |
| Im lặng1s | Không có âm |1.071ms|Decoder không tự tạo phone |

15 requests, tất cả GET loopback;0console errors. Sanity targets do agent đặt theo inventory, không phải expert annotation của recording. Một giọng người lớn và bốn từ không đại diện giọng trẻ Việt; không tính tỷ lệ “accuracy” hay score từ bảng này.

Sau final decoder blank-ID guard/CLI cleanup, [confirmation3runs](speaking-final-cat-confirmation.json) nhận lại `cat` raw/padded và silence như cũ;12GET loopback/0console errors. Xác nhận phần mới sau sửa, không dùng lần đo nhỏ này để nâng claim accuracy/device/performance.

Các fixture Samantha vẫn có lỗi: bản English q8 nhận `book → b ə ŋ k`, `cup → k ə m m`; cat raw thiếu âm cuối nhưng padded nhận đủ. Public audio tốt hơn TTS không chứng minh TTS là nguyên nhân duy nhất. Không dùng padding hoặc confidence cao để che false alarms. Câu TTS `They are a family.` có phone output, chưa kiểm missing-word detection.

## Kiểm local và giới hạn

Lệnh đã chạy, dùng Node24.14.1/PATH repo runtime:

```sh
pnpm install --offline --ignore-scripts
pnpm speaking:spike --synthetic --download
pnpm speaking:spike --fixtures=tests/fixtures/speaking/manifest.json --report=docs/evaluations/speaking-public-fixture-spike.json
pnpm exec eslint src/lib/speaking/ctc.ts src/lib/speaking/model.ts tests/unit/speaking-ctc.test.ts scripts/speaking/spike.mjs --max-warnings=0
pnpm exec vitest run tests/unit/speaking-ctc.test.ts
pnpm typecheck
pnpm build
python3 scripts/validate_docs.py
git diff --check
```

Package installation succeeded after explicitly disabling new native build scripts; the first add had stopped for pnpm's unreviewed-build-script setting. Scoped lint/typecheck PASS; final11 decoder/manifest unit cases PASS150ms; final dependency-required build PASS; docs validator/diff whitespace PASS. No app UI changed, so no broad E2E/UI audit performed; browser evidence above exercises actual model inference, not mocked output.

**SP1 vẫn in_progress.** Chưa có browser download progress/cancel/cache integrity/quota/persistence/deletion/offline, peak-memory measurement, physical-phone envelope or responsiveness benchmark. CLI cache/timeout không thay các acceptance đó. Mic permission/lifecycle, adapter/alignment/quality, pronunciation/score calibration, child false-red/omission evidence, Vietnamese coaching and game chưa implemented. Không khẳng định 0API phí đồng nghĩa đã kiểm billing của tài khoản thật hoặc mọi điện thoại dùng được.

Next: hoàn tất SP1 browser download/cache/cancel/memory; SP2 thu/nghe lại + local adapter, giữ score null trước khi có calibration. Lấy mẫu mic/giọng trẻ/điện thoại thật chỉ theo quyền cụ thể sau này, bằng thiết bị sẵn có và người đánh giá tự nguyện trong ngân sách0đ. Founder không cần chọn thêm công nghệ; không đổi sang API/server trả phí.
