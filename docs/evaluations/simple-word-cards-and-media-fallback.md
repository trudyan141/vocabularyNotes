# Danh sách từ gọn và tìm hình có fallback — 12/10/2026

## Sửa theo ảnh/curl founder

Hai hàng “noun · ông” hoặc “verb · là” xuất hiện vì list projection đã gom tên từ, nhưng UI còn render mọi sense bên dưới. Đã bỏ subcards và count “2 nghĩa”; mỗi từ chỉ một card có nghĩa. Detail chooser cũng không lặp cùng nhãn POS/nghĩa Việt. Không xóa sense, example, English definition, source, SRS, backup hay cloud data; các nghĩa khác vẫn mở được trong detail.

Curl body tìm `they` với nghĩa “used to refer to two or more people or things …” trước trả HTTP200 `candidates: []`. Catalog chưa ánh xạ đại từ sang minh họa, Commons tìm nguyên chữ they không có ảnh qua filter. Thêm concept nhóm người cho nghĩa plural people, lấy từ catalog pinned có sẵn, không pretend đây là danh từ hoặc sửa word/sense.

Guest replay cùng body, không cookie/tài khoản founder: sau sửa trả 2 candidates Noto/Twemoji cùng báo cáo 4 catalog. Tải qua API import thật thành JPEG: Noto base64 6.268 ký tự / Apache-2.0; Twemoji 1.332 ký tự / CC BY4.0. Không lưu hai ảnh vào dữ liệu founder. SVG validation, receipt, license, owner/revision và approval giữ nguyên.

## Fallback và lỗi

- Tự động kiểm Noto → Twemoji → Fluent → OpenMoji trong catalog; có metadata phù hợp thì trả choices theo ưu tiên, không tải mọi file chỉ để tìm metadata. Không có thì thử Commons cartoon rồi illustration.
- Query trả rỗng hoặc ảnh bị lọc vì subject/license: thử query tiếp. HTTP lỗi, timeout, JSON sai hoặc HTTP200 có providererror được ghi theo source rồi thử tiếp. Không nhận raw error page thành data.
- `sources[]` gồm source, catalog/network, found/empty/error, count, safe code, optional HTTP status/query. API trả 200 cho zero matches hợp lệ, 503 khi có nguồn lỗi và không phục hồi được. Thất bại không cache; zero matches cache30s, success5min; shared quota/inflight bounds giữ.
- UI có “Kết quả từng nguồn hình” đóng mặc định, thông báo nguồn lỗi bằng lời dễ hiểu, luôn có Tìm thêm trên mạng kể cả zero results. Import chọn ảnh lỗi báo nguồn và giữ ảnh/candidates hiện tại, không tự lưu ảnh khác.
- Openclipart/Openverse hiện là liên kết tìm thủ công, chưa có API adapter; không claim đã tìm trên mọi nguồn. Không đổi URL allowlist hoặc bỏ kiểm license để có kết quả.

## Kiểm tra

- `pnpm exec vitest run tests/unit/media-search-fallback.test.ts tests/unit/media-route-report.test.ts tests/unit/library-search.test.ts tests/integration/library-search.test.ts tests/integration/media.test.ts`: **29 PASS**. Empty→next query, HTTP error→next success, HTTP200 providererror, filtered license, malformed JSON/timeout/source diagnostics, 200/503 route semantics và same-origin boundary; multi-sense storage, label projection và existing media persistence/license tests. Có ca một catalog lỗi nhưng Twemoji/Fluent vẫn trả được kết quả, không lỗi dây chuyền.
- `pnpm lint`, `pnpm typecheck`, `pnpm build`: **PASS**, Node24.14.1. Focused ESLint new/changed files PASS.
- `pnpm exec playwright test --config playwright.search-batch.config.ts tests/e2e/media-source-errors.spec.ts tests/e2e/search-batch.spec.ts --grep "word list groups|empty searches name|upstream failure"`: **6/6 PASS**, 9,1 giây. Word list không subcards/count, empty vs upstream failure, source detail và không raw payload trên mobile360/desktop1280 Chromium cô lập. Network errors là fixtures; they search và2imports nêu trên là request thật localhost4317.
- Impeccable scoped detector:`[]`; không coi là humanUX pass. `pnpm docs:check`: PASS764local links/15skills317resources/48JSON (parse/integrity, không schema-validation); `git diff --check`: PASS.

## Giới hạn

Local, chưa deploy. Không founder cookie replay, browser thật, dữ liệu founder, SQL, newenv hay pushmain. Không claim mọi catalog file đang khả dụng hoặc every-word illustration; không ép hình sai cho từ trừu tượng. Không thử physical iPhone/Android hoặc hosted account sync. Giữ toàn bộ pre-existing changes trong workspace.
