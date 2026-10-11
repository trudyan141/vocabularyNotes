# 12/10 — Card ôn bài, hình còn thiếu và lưu nhóm

Theo yêu cầu founder: ôn đến hạn là FeatureAction có hình notebook/count; Nói cùng Cáo dùng cùng tile đứng với năm game khác. Bổ sung hình cho từ không tạo mẫu câu/ngữ pháp và chỉ lưu ảnh qua CAS hiện có. Liệt kê tên/nghĩa mỗi từ chưa có ảnh và có picker hình có sẵn, giữ attribution khi duyệt.

Nguyên nhân tìm hình: `/api/illustrations` tra catalog OpenMoji, không phải tìm kiếm Internet tùy ý; bấm lại không mở rộng catalog. POS có khoảng trắng/chữ hoa và số nhiều thông dụng không khớp. Đã chuẩn hóa POS/các số nhiều được biết, không đoán ảnh cho pronoun/unknown. Form sửa từ trước chỉ gọi Commons có auth/config/signing/quota; thêm đường catalog local trước và chọn hình sẵn khi không khớp. Commons vẫn là lựa chọn riêng; không cấu hình dịch vụ thật. Từ chưa có ảnh đúng nghĩa vẫn hiện để người dùng chọn, không claim tự tìm mọi từ.

Lưu nhóm vẫn một atomic save/CAS/dedup. Sau thành công chỉ thông báo, ẩn nút Lưu; đổi tên/lựa chọn bật lại nút. Bỏ sticky instruction, OperationStatus lặp và nút Mở nhóm vừa lưu.

Kiểm tra local: lint/typecheck/build PASS. Vitest dictionary và learning với filter picture/plurals: 5 PASS,22 không thuộc scope. Browser desktop1280/mobile360: 6 ca riêng biệt PASS; xác nhận cuối card/missing list 4 PASS9.8s, word editor 2 PASS5.5s. Screenshots ở `review-pictures-2026-10-12/`. card/game/group-save, missing list/manual choice/save và catalog trong sửa từ. Selector test cần sửa (nhiều summary, mở detail thay vì edit, kiểm ảnh ở detail sau save), sửa test và rerun ca lỗi. Không AI thật/account/Commons live/iPhone thật/publish. Impeccable scoped detector clean; không tương đương human UX acceptance. Không đổi SQL/dependency/cloud boundary.

Lệnh: `pnpm lint`, `pnpm typecheck`, `pnpm build`; `pnpm exec vitest run tests/unit/dictionary.test.ts tests/integration/learning.test.ts -t 'picture|plurals|worksheet pictures'`; `pnpm exec playwright test --config=playwright.compact.config.ts simple-cards.spec.ts` và rerun đúng ca lỗi.
