# Speaking — đặc tả hiện hành cho AI

## Quyết định12/10/2026 — ADR066

Founder đồng ý **gửi bản thu qua Gemini Free Tier để chấm**, rồi yêu cầu **bỏ luôn phần tải355MB**. Đây là hướng hiện hành, supersede engine local/không gửi audio của ADR058–065. Không hỏi founder review lại hướng đã đồng ý. Dùng key đang có, project Free Tier/no billing đã được founder xác nhận. Agent chỉ code và kiểm local fixture theo ADR049/050; không dùng key thật, triển khai hay thay billing.

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

Gemini trả `words[{index,score,advice,phones[{expected,heard,status,advice}]}]`. Kiểm JSON≤50KB, output STOP, index đủ/không trùng, chọn nguyên một reference variant đã cung cấp, đủ từng phone đúng thứ tự, score integer0–100 hoặc null; không HTML/URLs. `match` phải heard=expected; `retry` âm gần; `missing` âm sai/thiếu; `uncertain` bắt buộc null score. Không đoán phone từ transcription hoặc reference khi audio không rõ. Hiển thị % từ Gemini, không ghi nhãn “điểm tham khảo”. Màu xanh/cam/đỏ trên nhóm chữ tương ứng; unclear không tạo điểm. Bấm từ mở sheet: score, nghe mẫu/nghe lại, cách đọc gần chữ Việt đã lưu, bảng âm mẫu/âm nghe được và hướng dẫn môi/lưỡi bằng VI. `apple`: a/pp/le, không bỏ e hoặc tạo âm /e/ độc lập. Nhận xét AI dạng text, không chạy HTML/model code.

Timeout30s, không retry tự động; quota/access/missing-key/network/invalid-response không tô màu/điểm giả, giữ replay và nút nói lại. Target unknown/ambiguous vẫn cho nghe/thu, không tự chế reference. Chỉ20target words/80phones mỗi từ tối đa; current game/detail chủ yếu một từ mỗi lượt. Không claim ELSA phoneme accuracy hoặc trẻ/iPhone calibration từ mock.

## Bỏ bộ nhận âm cũ

Đã bỏ nút tải/xóa pack, Worker và bước prepare-speaking; gỡ dependency Transformers/@noble, runtime/WASM không được copy vào public/build. Các source CTC/manifest/spike còn lại là lịch sử nghiên cứu, không được import runtime hay chạy trong dev/build/app. Xóa cache `wfk-speaking-model-*` khi vào app, và khi SW mới activate; chỉ prefix này, không bài học hay public cache khác. Không tự tải lại. Public Welcome/404 không init nhận âm.

## Mở app sớm có Cáo

Root/DB/Today loading dùng original inline SVG + “Đang tải…” từ HTML, không chờ tải ảnh/hydration/font mới có mascot. Body nềnThemeC. iOS Home Screen có36startup PNGportrait/landscape theo device media, Cáo/nền sáng/chữ cùng app; generate bounded từ asset hiện có, không pre-cache tất cả. Safari/in-app browser trước khi nhận HTML do hệ điều hành điều khiển; HTML loading không bảo đảm đổi được màn đó. Ảnh startup Home Screen cần kiểm bằng iPhone thật; không gọi lab Chromium/WebKit là SLA1s toàn thiết bị.

## Kiểm chứng và nguồn

[Bằng chứng12/10](evaluations/mobile-speaking-startup.md) ghi checks/thất bại sửa lại/local RAM và giới hạn. Dùng fixtures/key giả; không key thật/AI output thật/tài khoản hay deploy. Lịch sử: [feasibility](evaluations/speaking-local-feasibility.md), [UI cũ](evaluations/speaking-refresh-and-automatic-sync.md).

Nguồn primary đã đọc12/10: [Gemini audio](https://ai.google.dev/gemini-api/docs/audio), [generateContent/inlineData](https://ai.google.dev/api/generate-content), [Free Tier Flash-Lite](https://ai.google.dev/gemini-api/docs/pricing), [Apple startup image](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html), [ONNX large models](https://onnxruntime.ai/docs/tutorials/web/large-models.html). Gemini hỗ trợ audio/WAV và JSON; tài liệu không chứng minh chất lượng chấm phoneme ngang ELSA.
