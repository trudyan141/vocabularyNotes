# Speaking — đặc tả hiện hành cho AI

## ADR095 —15/10/2026: mọi lượt đã thu có điểm, nhận âm độc lập, chờ có giới hạn

Founder yêu cầu sửa SP-SCHEMA, luôn có điểm kể cả0 và giảm thời gian. **Phần này supersede contract v2/uncertain→null/giới hạn tuning cũ ở ADR094** theo yêu cầu trực tiếp mới; các gate acoustic-quality chưa đạt vẫn giữ.

- Runtime request schema v3 `{schemaVersion:3,words:[{index,audibility,heard:string[]}]}` dùng `responseJsonSchema` thực và inventory enum. Gemini chỉ nghe audio, **không gửi target text/IPA/reference**; text part chỉ wordCount. Client chọn một whole reference variant bằng edit-distance, tự xác định thiếu/thay/thừa và tính điểm. Không còn bắt model chép expected hay tự gán status/variantIndex, tránh các trường tự mâu thuẫn làm cả response bị loại. Validator v2 giữ cho baseline/tests, không runtime fallback v1/v2.
- Một lượt thu xong luôn ra0–100: âm uncertain được0credit; whole unclear/no usable speech→0; lỗi network/quota/schema/timeout/reference/decode→**tạm0 vì lỗi chấm**, hiển thị rõ nguyên nhân và không kết luận trẻ đọc sai. Mic bị từ chối/hủy trước khi có bản thu không tạo điểm. Skip chưa làm không được tự nhận là đã chấm. Không lưu score/audio/SRS.
- Replay vẫn đúng WAV gửi. Lỗi không làm kẹt Next/Finish; vòng tính cả lượt0. Tách lời hướng dẫn phát âm khỏi lỗi hệ thống; không fake phones cho service failure.
- EndOfSpeech đủ100ms tiếng và550ms im lặng; dưới ngưỡng/no speech thoát sau2.5s, continuous sound tối đa10s. Guard cũ180ms+voiced nonzero gây short utterance chờ10s đã sửa. Reference request tối đa3s, Gemini request tối đa6s, minimal thinking, prompt/output compact; không retry/fallback/provider swap.6s là cap request sau chuẩn bị audio, không cam kết mọi mạng end-to-end≤6s.
- Structured output và timing đã có live controls nhưng chưa có human/child100clip; schema không chứng minh model nghe đúng. Quality metrics phân biệt0unclear/tạm0system với kết quả âm học đủ chắc chắn, không dùng0để làm đẹp coverage.

[Evidence hiện hành](evaluations/speaking-zero-and-latency.md). Các đoạn ADR094 bên dưới là checkpoint trước steering mới.

## Hướng nâng cấp đã duyệt14/10/2026 — ADR094

**15/10: v2 implemented_local, A scoped verified; B quality_pending, chưa pilot100human/child.** [Evidence](evaluations/speaking-assessment-v2.md) ghi48unit+8tool+14productionUI và8live engineering probes, gồm ca đọc sai được100/invalid output. Không claim acoustic accuracy đã đạt. Founder đã duyệt [plan nâng cấp](ai/SPEAKING-ASSESSMENT-UPGRADE-PLAN.md); Codex triển khai theo [execution guide](ai/SPEAKING-ASSESSMENT-IMPLEMENTATION.md). Gate chất lượng vẫn là yêu cầu chưa nghiệm thu; logic/UI đã có bằng chứng local riêng.

ADR094 thay phần contract/điểm/lời khuyên của ADR066: provider v2 chỉ trả schemaVersion/index/variantIndex/audibility/phones/insertions, không score/advice; client chuẩn hóa substitution thành retry hoặc incorrect, tự tính điểm theo plan mục3–4. Missing chỉ thiếu âm và heardnull; insertion bắt buộc biểu diễn riêng; uncertain làm từ không có điểm. Bất kỳ lỗi nào không thể được100 kể cả do rounding. Màu/nhãn/gợi ý/chi tiết/tổng điểm suy từ cùng kết quả; điểm vòng chỉ khi mọi từ có điểm. Replay đúng WAV đã gửi, VI tips theo loại lỗi/vị trí; một lỗi chính, chi tiết đầy đủ.

Giữ model/key, một request tối đa/lượt, không local pack/backend/fallback/auto retry, không lưu audio/điểm bền. Nghe1.0/chậm0.6, IPA/hint và source/license của ADR093 giữ. Không biến hướng dẫn release/closure/formant thành phép đo Gemini đã chứng minh hoặc buộc trẻ bật hơi mạnh.

Nghiệm thu tách **A logic/UI scoped** và **B pilot âm học**. Contract, allowlist, công thức, dataset100clip, budget≤300request, ngưỡng precision/chấm oan/recall/coverage/latency và tầng trẻ lấy nguyên từ plan mục3–7; không tự hạ gate sau khi thấy output. Thiếu nguồn/nhãn/quota hợp lệ vẫn làm hết A, ghi B pending; không bịa evidence từ fixture/TTS. Live benchmark chỉ khi có đầu vào được phép và task triển khai được giao; 8engineering probes đã gọi bằng key hiện có, không dùng làm human pilot.

## Phần giữ từ12/10/2026 — ADR066

Founder đồng ý **gửi bản thu qua Gemini Free Tier để chấm**, rồi yêu cầu **bỏ luôn phần tải355MB**. Đây là hướng hiện hành, supersede engine local/không gửi audio của ADR058–065. Không hỏi founder review lại hướng đã đồng ý. Dùng key đang có, project Free Tier/no billing đã được founder xác nhận. Kiểm scoped theo ADR050; live pilot được ADR094 cho phép có điều kiện nguồn/nhãn/key/quota khi được giao triển khai, không tự thay billing hoặc suy quyền deploy từ tài liệu này.

- Chỉ Gemini `gemini-3.5-flash-lite:generateContent` qua browser; không Worker/Wav2Vec2/Transformers/ONNX, tải model hoặc lựa chọn chấm offline.
- Một request/lượt bấm Nói; WAV mono16kHz, tối đa10giây,320044bytes. Không tools, grounding, Files API, cache provider, tự retry, đổi model hoặc dịch vụ trả phí. Key ở header, không URL/log. Không tự thay config/key của tính năng khác.
- Hết quota thì báo thử sau, giữ nghe mẫu/thu/nghe lại; không tạo điểm giả. Không có mạng thì không chấm được. Miễn phí phụ thuộc key/project không billing đã xác nhận; code không tự nâng tier, nhưng không thể chứng minh trạng thái billing của key bằng request chấm.
- Founder đã đồng ý gửi audio và trực tiếp yêu cầu bỏ popup xác nhận. Bấm Nói mở mic, sau nói xong tự gửi/chấm; không thêm popup Đồng ý/Để sau hoặc mục Hỏi lại trong Cài đặt. Không auto mở mic/gửi trên page load.
- Audio gửi chỉ bản thu cùng target/phoneme variants; không thư viện, owner/email/name/key trong body. Không ghi Blob/PCM/điểm vào IndexedDB, localStorage, cloud, backup hay analytics. Câu này không khẳng định chính sách lưu dữ liệu của Google; xem nguồn API bên dưới.

Theo ADR067, bỏ luôn toàn khối Chấm phát âm trong Cài đặt, không notice/Hỏi lại. Key dùng chung qua một form Cài đặt key AI.

## Luồng và UI

WordDetail có nghe/nói/nghe lại dạng icon, giữ nghĩa/POS/IPA và câu ví dụ. Mọi English example vẫn có IPA cả câu ngay dưới English và nút Nghe trước bản dịch. Không dựng trang Speaking riêng cho từng từ. Nói cùng Cáo là game≤5từ đã duyệt trong Chơi & học; Next/Skip/complete/play again, điểm vòng trong RAM, không sửa SRS.

`idle → mic → recording → analysis → result/error`.

Mic chỉ từ thao tác người dùng: unlock AudioContext ngay trong tap, xin permission, báo hai nốt đi lên rồi mới bắt đầu thu. Sustained voice180ms và silence900ms tự kết thúc; silence6s/hard10s. Khi bản thu đóng và tracks dừng, báo hai nốt đi xuống; không đưa tiếng báo vào clip chấm. Hủy/rời trang/ẩn tab/logout/scope/revision đổi: dừng mic/playback, abort request, bỏ response muộn; late permission phải stop tracks. Recording guard≤5MB; resample mono16k, kiểm silence/clipping/finite/duration trước gửi, trim silence giữ120ms hai đầu. Không ghi âm khi vào trang, không phát cue khi trang ẩn.

**Baseline v1 chỉ để tái hiện, không phải contract cho code mới:** Gemini trước nâng cấp trả `words[{index,score,advice,phones[{expected,heard,status,advice}]}]`; parser nhận score provider, missing gộp sai/thiếu và advice AI. ADR094 thay phần này bằng v2 strict theo plan; không giữ nhánh ưu tiên score/advice v1 trong runtime mới. JSON≤50KB, STOP, đúng target/reference/order, bounded output và không HTML/URLs vẫn bắt buộc.

Bấm từ mở sheet có điểm nếu đủ bằng chứng, nghe mẫu/nghe lại, gợi nhớ Việt, bảng âm mẫu/âm nghe được và hướng dẫn VI. `apple`: a/pp/le, không bỏ e hoặc tạo âm /e/ độc lập. Màu/nhãn theo kết quả client; unclear không điểm. Không chạy nội dung AI thành HTML/model code.

Timeout30s, không retry tự động; quota/access/missing-key/network/invalid-response không tô màu/điểm giả, giữ replay và nút nói lại. Target unknown/ambiguous vẫn cho nghe/thu, không tự chế reference. Chỉ20target words/80phones mỗi từ tối đa; current game/detail chủ yếu một từ mỗi lượt. Không claim ELSA phoneme accuracy hoặc trẻ/iPhone calibration từ mock.

## Nghe mẫu và cách đọc — ADR093, 14/10/2026

Ngay dưới từ ở game và WordDetail có IPA đúng text/version cùng cách đọc chữ Việt gần đúng. Giữ IPA/hint đã duyệt; phần thiếu tra nguồn Wiktionary US hoặc CMUdict ghi Tham khảo, không ghi ngược vào thư viện. Chữ Việt chỉ là gợi nhớ, không tương đương các âm tiếng Anh; âm không map được không đoán. IPA đã lưu khác accent bản thu thì hiện thêm IPA US từ nguồn cho bản thu.

AudioControl dùng bản thu US từ mục English/Pronunciation của Wiktionary, file exact `en-us-{headword}` trên Commons; không lấy audio ngôn ngữ khác, nhiều pronunciation sections hay US IPA đa cách đọc. Commons metadata bắt buộc creator, source, license/LicenseUrl phù hợp allowlist CC0/Public domain/CC BY/CC BY-SA3.0–4.0, không restriction. Ưu tiên MP3 derivative thực do API trả về; không đoán URL hay scrape Cambridge. Link Commons/tác giả/giấy phép ở mục Nguồn phát âm thu gọn mặc định dưới controls; link IPA ở mục Nguồn IPA thu gọn, không đặt inline cạnh phiên âm; playback chậm ghi thay đổi tốc độ60%. Bản thu cộng đồng có thể khác chất lượng; không claim Cambridge quality hay human verification.

Hai nút Nghe1.0 và Nghe chậm0.6 có ở game lẫn detail; HTMLAudioElement giữ pitch, TTS fallback cùng rates (tốc độ thực TTS tùy engine). Thiếu bản phù hợp/mạng/lỗi playback thì giọng thiết bị, nhãn nguồn cập nhật đúng, không dùng provider trả phí. Câu ví dụ vẫn đọc toàn câu bằng thiết bị. Metadata fetch bounded500KB/200KB, timeout8s/request, server tối đa4inflight/128cache, client coalesces headword; không lưu audio vào IDB/cloud/backup. Mute, hide, stop, mic, unmount/text change dừng/abort playback, chặn response muộn; timeout start10s có fallback. Endpoint POST same-origin chỉ nhận headword≤80, private/no-store; không fetch URL do client cung cấp.

Nguồn: [Cambridge licensing](https://dictionary.cambridge.org/license.html), [snowy IPA](https://en.wiktionary.org/wiki/snowy), [snowy audio/CC BY-SA3.0](https://commons.wikimedia.org/wiki/File:En-us-snowy.ogg), [Commons reuse](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia), [preservesPitch](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/preservesPitch). [Evidence](evaluations/speaking-reading-and-open-audio.md).

## Bỏ bộ nhận âm cũ

Đã bỏ nút tải/xóa pack, Worker và bước prepare-speaking; gỡ dependency Transformers/@noble, runtime/WASM không được copy vào public/build. Các source CTC/manifest/spike còn lại là lịch sử nghiên cứu, không được import runtime hay chạy trong dev/build/app. Xóa cache `wfk-speaking-model-*` khi vào app, và khi SW mới activate; chỉ prefix này, không bài học hay public cache khác. Không tự tải lại. Public Welcome/404 không init nhận âm.

## Mở app sớm có Cáo

Root/DB/Today loading dùng original inline SVG + “Đang tải…” từ HTML, không chờ tải ảnh/hydration/font mới có mascot. Body nềnThemeC. iOS Home Screen có36startup PNGportrait/landscape theo device media, Cáo/nền sáng/chữ cùng app; generate bounded từ asset hiện có, không pre-cache tất cả. Safari/in-app browser trước khi nhận HTML do hệ điều hành điều khiển; HTML loading không bảo đảm đổi được màn đó. Ảnh startup Home Screen cần kiểm bằng iPhone thật; không gọi lab Chromium/WebKit là SLA1s toàn thiết bị.

## Kiểm chứng và nguồn

[Bằng chứng12/10](evaluations/mobile-speaking-startup.md) ghi checks/thất bại sửa lại/local RAM và giới hạn. Dùng fixtures/key giả; không key thật/AI output thật/tài khoản hay deploy. Lịch sử: [feasibility](evaluations/speaking-local-feasibility.md), [UI cũ](evaluations/speaking-refresh-and-automatic-sync.md).

Nguồn primary đã đọc12/10: [Gemini audio](https://ai.google.dev/gemini-api/docs/audio), [generateContent/inlineData](https://ai.google.dev/api/generate-content), [Free Tier Flash-Lite](https://ai.google.dev/gemini-api/docs/pricing), [Apple startup image](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [ONNX large models](https://onnxruntime.ai/docs/tutorials/web/large-models.html). Gemini hỗ trợ audio/WAV và JSON; tài liệu không chứng minh chất lượng chấm phoneme ngang ELSA.
