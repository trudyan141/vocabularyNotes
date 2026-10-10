# T02 — baseline UI/performance

**Build hiện hành10/10/2026:** xem [completion-local](completion-local.md) và raw current-ui/current-search. Library LCP cold lab còn vượt2,5s; không lấy bảng T02 dưới làm chất lượng hiện hành.

**Cập nhật sau T03:** số đo dưới là build T02 lịch sử. [T03](t03-local-repository.md) đo search5.000/50 mixed inputs, p95≈166 ms/CPU4×; local IndexedDB đã nối. Không ghi đè baseline T02 hoặc suy số search mới thành cold LCP/CLS/field INP/device pass của build T03.

09/10/2026. **Baseline lab fixture đã đo; chưa device/human/field pass.** Bản production Next UI preview, APP_DEMO_MODE=true/AI_PROVIDER=none. Practice hiện là trang nêu rõ buổi học chưa kết nối; không suy số đo đó cho flashcard/game tương lai.

Build ID `F5G47VGn6751gdFoWeI3N`; base commit `cff24f58efb62266e151db98e31604b7eac9b7fd` cộng thay đổi workspace chưa commit. SHA256 nội dung src (TS/TSX/CSS/JSON theo script): `c0c424b07c21bf04c52595b3be3184ca19b31049ef3a5203d1a9c359dcf3f432`. Fixture version/hash `1fdf356e3dc450290a3b3cfe77f3eb52f67dd6b5f506a3b6d2d58267e96533c9`, **20 entries**, hai senses của bank; review 10 candidates. [Raw JSON](t02/baseline.json), [trace input gzip](t02/search-trace.json.gz), [UI evidence/screenshots](t02-ui-shell.md). Trace giải nén thành JSON để mở trong DevTools Performance; chỉ nội dung fixture của repo.

## Profile thực sự đã chạy

- Host darwin 25.6.0, arm64, Apple M1; Node v24.14.1, Chromium 156.0.8078.4.
- Pixel 7 emulation, viewport **360×800 CSS px**, desktop host; **CPU throttle 4×**, network RTT/latency **150 ms**, download **200.000 bytes/s (1,6 Mbps)**, upload **93.750 bytes/s (0,75 Mbps)**. Browser/context mới và browser cache disabled cho mỗi cold load; production server warm. Không service worker.
- 5 cold runs/route, 3 routes = 15. LCP observer buffered; CLS dùng max session window (gap 1 s, window 5 s), loại recent input. Chờ network idle/fonts/settle. HTML+JS+CSS+font+ảnh đầu được tính; không upload worksheet.
- JS gzip là tổng gzip lại decoded response bodies bằng Node zlib, **không gọi là wire gzip**. Page transfer lấy Resource/Navigation Timing transferSize gồm overhead; chi tiết từng resource trong raw JSON. Font là body WOFF2 đã nén, không cộng gzip lần nữa.
- Browser throttle là proxy. **Android tầm trung + iPhone thật: pending**, cần ghi model/OS/browser của máy founder khi chạy T14. Không gán cấu hình máy không có vào evidence. Field p75 INP/LCP/CLS và cohort/window/sample count chưa có.

## Số đo cuối so với target

| Route (5 runs) | LCP median (min–max) | CLS max | JS initial gzip | Font body | Page transfer max |
|---|---|---|---|---|---|
| /today | 760 (760–768) ms | 0.0044 | 179.1 KiB | 98.7 KiB | 306.7 KiB |
| /library | 1632 (1624–1656) ms | 0.0002 | 186.7 KiB | 98.7 KiB | 322.0 KiB |
| /practice | 1624 (1616–1632) ms | 0.0002 | 176.5 KiB | 98.7 KiB | 298.0 KiB |

Các số **trong profile lab này** dưới budgets LCP 2.500 ms, CLS 0,1, JS 300 KiB gzip, font 150 KiB và page 1 MiB. Không đồng nhất bảng này với toàn bộ QA26 đạt. Font 101.028 bytes có Latin+Vietnamese/OFL; không vendor font request. SVG fixture nhỏ hơn 100 KiB/ảnh, không catalog/license runtime T07.

**Search/visual feedback:** 50 native input actions, CPU 4×, query EN/VI đổi giữa hai tập kết quả, debounce 0; event → DOM mutation → hai requestAnimationFrame. p95 **27.4 ms**, dưới 100 ms feedback/200 ms search ở **20 entries**. Hai rAF là upper-bound paint opportunity của harness, không xác nhận physical display scan-out hoặc field INP. Trace riêng ghi devtools timeline/user timing. Chưa đo 5.000 entries/index/DB; T03 đo query→paint và query engine riêng. Listen/reveal/answer/nav 30-action cohort chưa đầy đủ vì practice chưa có.

Lượt đầu đã lấy baseline, sau sửa contrast/focus và readiness guard đo lại build cuối; raw file giữ bộ 15 runs cuối. Harness ban đầu đợi mutation khi đổi hai query cùng tập kết quả nên đứng; sửa query alternation và timeout 2 s trước khi ghi evidence thành công. Không báo lượt bị hủy là pass.

## Motion, accessibility và giới hạn

CSS press/sheet/dialog chỉ opacity/translate/transform/color; OS reduced motion và toggle đổi ngay. Browser tests kiểm focus return, 48 px checkbox/switch, opaque outline 3 px, orientation giữ selection, speech stop/replacement/navigation với fake adapter; voice thật chưa verified. Không khẳng định QA27 full pass: device trace, hidden-tab real speech, flip/rating/game/mnemonic thuộc T07–T14. Keyboard checks không thay screen-reader audit hay WCAG certification.

T03: IndexedDB + fixture 5.000/search transaction. T07/T09/T12: thêm tương tác rồi đo lại. T14: Android/iPhone thật và regression/30-action cohort; T15: QA25 ≥5 phụ huynh + ≥5 trẻ. RUM chỉ sau quyết định consent/telemetry, không ghi ảnh/từ/query/tên trẻ vào telemetry.

Reproduce: Node24.14.1/pnpm11.25.0 → `pnpm build` → `pnpm perf:baseline`. Script tự mở/đóng production server 4324 và thay bộ raw outputs này. Giữ server này độc lập với dev/test, không benchmark đồng thời nhiều browser jobs.
