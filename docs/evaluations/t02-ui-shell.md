# T02 — app shell và ba màn hình chính

09/10/2026. **Hoàn tất T02 UI/demo** trên Next production build; chưa thư viện/AI/cloud/phiên học thật. Theme C đã chốt, giữ Nunito VI, berry/yellow/mint/lilac, cáo riêng và vật không mặt từ asset repo T18. Không đổi prototype lịch sử.

## Phạm vi và hành vi đã kiểm

| Phần | Đã hoạt động trong UI | Ranh giới thật/demo |
|---|---|---|
| Shell/welcome | Bắt đầu guest, 3 nav desktop sidebar/mobile bottom, skip/main focus, parent gate giữ intended destination/cancel focus | Gate tránh mở nhầm, không auth; Google chưa kết nối |
| S03 Hôm nay | Primary theo populated/empty; bài gần đây; EN/VI search; no-results recovery | Dữ liệu mẫu 20 entries; demo off là empty, không bật thư viện thật |
| S07 Duyệt | Nguồn mẫu side-by-side/expand mobile; tabs Từ/Câu/Grammar, Mới/Đã có/Cần kiểm tra; chọn/sửa/validate; save pending/error/retry giữ draft | Memory preview 10 candidates. Câu chỉ content preview, grammar empty; OCR/source transaction T06 chưa có |
| S09 list/detail/editor | Search không dấu, hai senses bank riêng; filter sheet; thiếu hình vẫn đọc; nghe/tốc độ; source inline; parent edit trong phiên | Nghĩa/ví dụ prepared fixture; detail/editor không lưu database; notes/enrichment/media catalog thuộc T07/T08 |
| Preferences/primitives | VI/EN; Beginner/Intermediate preference; child/standard typography; sound/motion; input/sheet/dialog/tabs/status/empty/loading/audio | localStorage whitelist chỉ 5 UI settings. Level preference chưa thay lesson eligibility. Không credential/cloud/API key form |
| Luồng hỗ trợ | Capture và Practice nêu rõ chưa kết nối, cho bước xem/duyệt từ mẫu; receipt new/existing, back/404/retry | Không gọi nút Chơi 5 phút là game/SRS đã hoạt động; không chụp/gửi ảnh |

AppProvider giữ fixture entries/candidates/receipt trong memory riêng mỗi cây React; đi tới/lui giữ draft, reload đặt lại và có nhãn. Save guard chống duplicate click; preview reducer deterministic theo fixture sense IDs, không thay canonical DB identities/unique constraints của T03. APP_DEMO_MODE=false loại mọi fixture ở runtime cùng build, có empty recovery.

Preferences whitelist không khôi phục keys/content lạ; JSON sai fallback VI/Beginner/child on. Storage bị chặn vẫn áp dụng trong phiên và có Thử lưu lại. Readiness guard khóa search/audio/settings trước hydration; test navigation chờ đúng Library thay vì điền nhầm search trên Today. Audio chỉ user tap, chọn voice EN nếu có, dừng các nút khác/navigation/hidden event, token guard chặn stale callbacks. Tests dùng adapter giả để kiểm interruption; chưa xác nhận giọng máy thật.

## Bằng chứng đã chạy

Node24.14.1/pnpm11.25.0, cùng dependencies/lockfile T01; thêm 13 shadcn source files qua CLI4.21.4/registry chính thức, không thêm runtime dependency. Đã đọc docs/source/composition sau add và chỉnh tokens/targets/imports. Prettier3.6.2 dùng một lần như CLI formatter, không app dependency.

- `pnpm check`: lint zero warnings, next typegen + tsc, **22 Vitest tests** (14 env + 8 demo/preferences), production build PASS.
- `pnpm test:e2e`: **27/27 PASS** trên production server 4320/4322; desktop1280×1000, mobile360×800 (Pixel7 Chromium emulation), 13 cases ×2 + demo off. Keyboard gate/sheet focus restoration, source disclosure, search/senses/no-results, uncertain edit validation, error/retry/all duplicates, edit session/reset, VI/EN/preferences storage error, audio fallback/interruption mock, reflow320/orientation800×360, reduced motion and target/focus cues, health no-store/canary, 404 recovery.
- `pnpm perf:baseline`: 15 cold loads + 50 native input actions, raw numbers/limitations in [performance report](ux-performance.md).
- Contrast calculation: white/berry **5,93:1**, text/background **13,79:1**, muted/background **6,38:1**, muted/mint **5,75:1**, active berry/lilac **4,79:1**. Input boundary #9D869F/background **3,16:1**; decorative separators retain lighter token. Checkbox/switch ≥48×48 px and focus opaque 3 px verified browser. Chưa full screen-reader/WCAG audit.
- Impeccable scoped port/refinement: context fallback từ lượt T01, source brief 03/04/founder/T18 + craft-floor; không formal critique/dual-agent workflow hoặc plan nguồn mới. `sh .agents/skills/impeccable/scripts/impeccable detect --target src/app/globals.css --json` trả `[]`; không suy detector clean thành human/contrast pass.

Browser self-review hai batch desktop/mobile: sửa thiếu-hình flex giãn rộng, target checkbox và tab widths cùng lượt; confirm hierarchy, long VI và nav/detail rule. Focus/input contrast là sửa mechanical acceptance riêng cuối, kiểm bằng test/capture. Ảnh viewport từ scroll0; không dùng full-page paint của sticky nav/save bar để đo che nội dung. CSS viewport của ảnh mobile là360 dù raster945 px vì deviceScaleFactor2,625.

| Màn | Desktop1280 | Mobile360 |
|---|---|---|
| Hôm nay | [ảnh](t02/today-desktop.png) | [ảnh](t02/today-mobile.png) |
| Duyệt 10 mục sau sửa uncertain | [ảnh](t02/review-desktop.png) | [ảnh](t02/review-mobile.png) |
| Thư viện: bank hai senses | [ảnh](t02/library-desktop.png) | [ảnh](t02/library-mobile.png) |
| Detail thiếu hình/VI dài | [ảnh](t02/detail-desktop.png) | [ảnh](t02/detail-mobile.png) |

Rule scope: one-primary-action/cover-reachable-states; preserve-user-input/error-states-recovery; inline-before-modal; accessible-name-required; name-object-scope-consequence. Desktop detail là reading page760 px, mobile detail/review không bottom nav; desktop list/detail split là bố cục mở rộng sau, chưa tuyên bố variant đó đã có. Thiếu nghe/non-reader human evidence vẫn pending QA25.

## Giới hạn và bàn giao

T03 IndexedDB/migrations/canonical dedup/search5.000 tiếp theo; không port fixture memory thành localStorage library. T06 source links/proposed senses/transaction/recovery thật; T07 audio service + content/media licensing, T09/T12 practice/SRS/games; T13 PWA. Camera/AI/OAuth/cloud chưa connected. Physical Android/iPhone, screen-reader, human QA25/field INP, full QA12/27 và GitHub CI chưa chạy. Không deploy/commit/push/call provider hoặc global config.

Dev preview4317 còn chạy; `pnpm dev` mặc định3000. Error fixture chỉ khi demo on + `/capture/demo/review?case=save-error`, fail lần đầu rồi retry; không panel diagnostics trong default UI. Đây là seam kiểm error UI, không endpoint production storage.
