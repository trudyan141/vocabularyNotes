# Speaking assessment v2 — evidence15/10/2026

**A implemented_local / scoped verified. B quality_pending / pending_external_inputs.** Logic/UI và công cụ pilot đã triển khai; chưa đạt hoặc chứng minh chất lượng nhận âm người thật/trẻ. Nguồn yêu cầu: [ADR094 plan](../ai/SPEAKING-ASSESSMENT-UPGRADE-PLAN.md), [execution guide](../ai/SPEAKING-ASSESSMENT-IMPLEMENTATION.md).

## Thay đổi và root cause

Regression trước sửa tái hiện provider score100 được ưu tiên dù thiếu1/3âm; test RED nhận100 thay vì67. Runtime v2 bỏ score/advice provider; strict contract chỉ nhận evidence phones/audibility/variant/insertions, giới hạn/order/required fields/IPA được validate trước khi chấm. Client tính `(match + 0.5×near)/(expected + insertions)`, uncertain→không điểm, có lỗi→tối đa99. Tổng vòng chỉ có khi mọi từ đã chấm được; không bỏ qua từ unclear để lấy điểm đẹp. Regression sau sửa GREEN.

Phản hồi tách missing/substitution gần hoặc xa/insertion/uncertain; màu+nhãn+bảng chi tiết nhất quán, mẹo Việt được chọn theo lỗi/vị trí, một lỗi ưu tiên trên màn chính. Âm thêm có badge và hàng riêng. Replay dùng chính WAV đã trim/gửi, không bản gốc khác. Bắt đầu nói lại xóa kết quả cũ; hủy/rời màn không nhận kết quả về muộn. Lỗi provider/schema không đổ thành lỗi phát âm của trẻ.

Target reference CMU trước đây bỏ stress khiến AH gộp thành ə/ER thànhɝ; route hiện giữ AH1/2→ʌ, AH0→ə, ER0→ɚ. Chỉ sửa reference runtime, không đổi IPA/user library. Không collapse ʌ/ə,ɚ/ɝ để biến sai thành đúng; alias chỉ g/ɡ,r/ɹ. Giữ model/key, một request/lượt, không backend/local pack/fallback, không lưu audio/điểm hoặc thay SRS.

Các module mới: contract, feedback, prompt; UI speaking-feedback. Benchmark runner kiểm nguồn/nhãn/speaker split100clip, WAV/SHA, private outputs/lock, budget reservation, freeze/repeat/metrics. [Hướng dẫn công cụ](../../scripts/speaking/README.md), [manifest trống](../fixtures/speaking-benchmark.template.json). Manifest trống cố ý không validate PASS; không bịa audio/nhãn trẻ.

## Kiểm chứng local

Runtime Node24.14.1, pnpm11.25.0. Commit nền `e3ecf94783e496b71ac989942d99966301b6bc20`; authored-source fingerprint final UI `63b20b37371078b2de0c4694907f2d1b0eb0ea81f6e2733ca8af316476355f7d`. [Baseline trước sửa](speaking-assessment-v2/baseline.json) giữ hash file/prompt cũ. Working tree chưa commit; commit nền một mình không định danh thay đổi.

| Lệnh / phạm vi | Kết quả |
|---|---|
| `pnpm test tests/unit/speaking-assessment.test.ts tests/unit/speaking-gemini.test.ts tests/unit/speaking-graphemes.test.ts tests/unit/speaking-lifecycle.test.ts tests/unit/speaking-v2.test.ts` |48PASS,5files |
| `node --test scripts/tests/speaking-benchmark.test.mjs` |8PASS; arithmetic, abstention, split/budget/refusal guards; không gọi provider |
| `pnpm lint`, `pnpm typecheck` | PASS |
| `pnpm test:ui -- --mode production speaking-refresh.spec.ts speaking-assessment.spec.ts --grep 'Microphone\|Speech ends\|Quota failure\|v2' --port 4343` | Discovery14, production build26.394s PASS, browser14PASS41.927s |
| Scoped Impeccable detector | `[]`; không phải human UX pass |

UI runner dùng source snapshot riêng, fixtures, Chromium mobile360/desktop1280; không founder browser thật. [Runner result](speaking-assessment-v2/production-ui-result.json) ghi command/identity/timing; log paths trong artifact là temp của lượt chạy. Unit/UI kiểm exact replay bytes, điểm insertions/omissions/gross, unclear/tổng vòng, cancel/stale, schema failure và quota. Screenshot đã đợi dialog hết animation; mobile insertion cuộn tới hàng âm thêm, omission xem phần trên và tiếp tục cuộn được. Đã nhìn cả4ảnh, không overflow ngang/lỗi chữ chồng tại phạm vi này.

| | Mobile | Desktop |
|---|---|---|
| Âm thêm | [Ảnh](speaking-assessment-v2/mobile-insertion.png) | [Ảnh](speaking-assessment-v2/desktop-insertion.png) |
| Thiếu âm | [Ảnh](speaking-assessment-v2/mobile-omission.png) | [Ảnh](speaking-assessment-v2/desktop-omission.png) |

## Live engineering controls — không phải pilot chất lượng

**8request thực bằng key hiện có, model gemini-3.5-flash-lite; chỉ Samantha TTS local, không người thật/trẻ/ground truth human.** [Aggregate đã loại thông tin riêng](speaking-assessment-v2/live-controls.json). Không copy key/audio/raw provider outputs vào repo.

- Candidate1 cat→cat: valid100. cap→cat: một response sai evidence, lần probe lại valid nhưng all-match100. Đây là lỗi nhận âm chưa giải quyết, độc lập với lỗi công thức đã sửa.
- Audio-only cùng cap không target: model trả cap/k æ p. Gợi ý target có thể làm lệch nhận âm trên control này; không đủ suy rộng accuracy.
- Candidate2 audio-first, hướng dẫn nghe độc lập trước đối chiếu, bỏ worked example: cap→cat HTTP200 nhưng không parse được; cat→cat valid100. Không coi từ chối chấm là đã phát hiện đúng lỗi.
- Hai diagnostic responseSchema config trả400 (audio/text); không bật config này trong runtime. App hiện JSON MIME+strict local validation, không tự retry/fallback khi lỗi.

Dừng sau2semantic prompt candidates, không tuning vô hạn/đổi engine/hạ gate.8requests tính vào budget300, còn292; không mở candidate thứ3 trong pilot này. Provider-only1.2–2.2s của vài control không phải mic-stop→result latency hoặc SLO đã đạt. CLI report cần browser timing thật; không điền số giả.

**B chưa chạy:** chưa có100clip human/child với quyền sử dụng,2reviewers/phonetics review, speaker-disjoint split và end-to-end timing theo plan. Không claim precision≥90%, false alarms≤5%, recall≥80%, coverage≥90%, eligibility hoặc accuracy giọng trẻ. Công cụ sẵn sàng không thay nguồn dữ liệu/human review. Phân biệt arithmetic deterministic với acoustic quality: Gemini có thể trả phones sai nhưng hợp lệ, khi đó điểm vẫn có thể100.

## Manual handoff

Preview riêng đã HTTP200: [Nói cùng Cáo local](http://127.0.0.1:4344/practice/speaking?word=apple). Process chạy source snapshot final riêng, demo origin/dữ liệu mẫu; chỉ key shared hiện có được chuyển vào process, không copy secret files, không thay env Vercel. Không đụng app khác ở port3000 hoặc `.next/dev/lock` checkout. Nếu process dừng URL không còn hoạt động.

Founder làm [checklist](speaking-assessment-v2-manual-test.md), đặc biệt đọc cap với target cat, thiếu/thêm âm, unclear, nghe lại và hủy/nói lại. Ghi cả đọc đúng bị bắt oan và đọc sai được100. Physical mic/iPhone/Safari/human listening chưa verified; mock WAV không thay các phép thử này. Chưa push/deploy, không đổi database hoặc dữ liệu học thật.

Docs verification: `git diff --check` PASS. Whole `python3 scripts/validate_docs.py` còn3link temp artifact cũ trong body-part-photo-analysis-fix.md; không chỉnh lịch sử ngoài scope để làm xanh. Tài liệu mới kiểm local links riêng.

Follow-up manual15/10: [điều tra lỗi chấm chung](speaking-grading-errors.md); source preview đã cập nhật, mã SP-* rõ,1apple TTS valid100. Tổng engineering9request/còn291, template offset9 supersede8 ở checkpoint bên trên. Acoustic quality vẫn pending.
