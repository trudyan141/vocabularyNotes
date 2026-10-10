# T04 — chụp/tải ảnh, chỉnh ảnh và nháp local

09/10/2026, Asia/Ho_Chi_Minh. **Implemented và locally verified; task pending_external vì QA07 smoke điện thoại thật chưa có.** Một task theo dependencies T02/T03, giữ Theme C/S04/S05. Không OCR/provider/cloud/typed lookup/IPA/PWA; provider none, phân tích disabled. Không gọi camera acquisition mock là camera hardware đã pass.

## Kết quả đã triển khai

- `/capture`: mở camera sau click, camera environment/user, preview/take/close; denied/unsupported file fallback, không tự hỏi quyền khi mount. Capture/switch/cancel/hidden/pagehide/unmount dừng tracks; late getUserMedia response có generation guard. Capture khóa double tap, không audio permission. Upload một ảnh, chọn lại được cùng file sau lỗi.
- Header/magic/dimensions trước decode + decoder thật. JPEG/PNG/WebP ≤10.000.000 bytes/20.000.000 pixels; false MIME, corrupt/empty/oversized/HEIC bị reject rõ. HEIC chọn exportJPEG/chụp mới, không converter giả. Client guard không thay server intake T05.
- `createImageBitmap(from-image)` xử lý EXIF, canvas JPEG .9 strip metadata/GPS, white background và cạnh dài≤2200. Base source sạch metadata giúp crop/reset không tích lũy biến đổi. Không persist raw/file name. Prepared image đúng preview và đúng Blob sẽ dùng cho T05; không có upload nào ở T04.
- `/capture/:draftId/edit`: rotate90/reset, crop bốn mép % có keyboard/arrow controls/validation, mở Blob image để zoom. Title/date/tags tùy chọn; ngày phải thật, title≤200/tags text≤500. T06 chuyển tags text thành domain tags. Consent check/uncheck/version là local preference, không enqueue/upload/auto-submit khi restore; T05 phải xác nhận policy/provider/consent hiện hành trước gửi.
- Schema logical v3/native30 thêm typed captureDrafts + dùng localMedia. Existing v1→v2 search migration vẫn giữ content/notes/events/receipts; v2→v3 additive, giữ review draft/foreign media. Scoped primary/index và lookup/list/delete; create/update/delete metadata+hai JPEG blobs atomic. Pending raw input ở memory nếu quota fail, retry cùng ID. Prepared image/fields giữ memory nếu update fail; stale version không overwrite và giữ input.
- Autosave500ms sau edits, manual save/back flush, SPA unmount flush accepted pixels/fields; dirty unload warning. `Đã lưu` chỉ sau transaction commit. Reload giữ metadata/crop/consent/prepared. Parent gate `Tiếp tục nháp ảnh` ở Today; capture list có reminder7ngày, xóa hai lần xác nhận và chỉ dọn đúng draft blobs. Nháp không đẩy vào outbox/cloud, ngay cả account abstraction.
- Preview Blob URLs do effect quản lý/revoke khi thay/unmount. File/model content không chạy script hoặc fetch remote URL. 3 nav cũ giữ nguyên; capture/edit là flow phụ huynh.

## Kiểm tra đã chạy

Node24.14.1/pnpm11.25, Next16.4/React19.3, Dexie4.4.6/hooks4.4.0. Prefix lệnh `PATH=/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH`.

| Lệnh | Kết quả / phạm vi |
|---|---|
| `pnpm check` | PASS lint0 warnings, typegen/tsc, **57 tests** (36 unit +21 integration), production build có capture/edit route |
| `pnpm test:e2e` | PASS **58/58**: 28 desktop +28 Pixel7 CSS360 +2 demo-off; production4320/4322, native Chromium156 macOS |
| `node scripts/measure-capture.mjs` | PASS six synthetic JPEG7,68/20MP runs CPU4× và4 screenshots; no page errors |
| `sh .agents/skills/impeccable/scripts/impeccable detect --json --scope layout ...` | `[]`; scoped layout scan, không thay human UX/device evidence |

8 capture browser scenarios ×2 viewports: upload/rotate/crop/metadata/consent/reload/no network/resume gate; two editors/stale/quota update/input retry; denied/unsupported/click-only permission; video capture/switch/close/leave tracks; late permission cancellation; HEIC/false MIME/10MB/20MP/corrupt/invalid crop; EXIF6 orientation pixels + metadata strip + resize3200×2400→2200×1650; quota create rollback + image retry + confirmed scoped deletion. Existing T03/library/speech/preference regressions retained, native v1 migration now expects native30; unit legacy export fixture only includes v1 stores.

Acquisition mock: bundled Chromium returns `NotSupportedError` for getUserMedia even with fake-device flags. Harness substitutes device acquisition using canvas.captureStream with synthetic page; HTMLVideoElement playback, MediaStream/track readyState/stop, canvas image encode/decode and IndexedDB stay native. Permission error/late result are injected. No OS permission/hardware/lens proof. Real photo smoke still required.

Failures fixed before passing: legacy v1 test initially tried inserting the new captureDrafts store into v1 fixture; fixed fixture selection without dropping content assertions. Native version test20→30 reflects additive schema. React refs/effects purity and local Blob img lint scoped; no global lint exceptions. Fake-device camera failure isolated, replaced explicitly labeled acquisition fixture. First screenshot batch was captured after scroll/focus and showed skip-link capture artifacts; corrected harness scrollToTop/blur, confirmed computed skip rect≈−79px/focusfalse, recaptured all4 and viewed each; no product CSS workaround. Direct Impeccable launcher lacked executable permission; invocation via `sh` passed without changing skill/global config.

## Lab và screenshots

[Raw capture JSON](t04/capture-lab.json): build `_gTxx7E-jbHaN0QV7dz2v`, source SHA256 `29251d7715086be3472042a3600b06cb40e1db68561f286a18eeb3e108d09f3c`, Chromium156.0.8078.4/macOS arm64. Pixel7 CSS360×800 proxy/CPU4×, local server, không network throttle. Six synthetic text JPEG runs: input→draft commit→image decode→2rAF **269,4–334,5ms**; observed main-thread longtasks **≤60ms**. Not field INP/hardware throughput/physical mobile/OCR accuracy. Source fixtures are sparse text JPEG120–238KB, do not establish worst-case noisy10MB image decoding. Không worker ở cohort này; đo lại ảnh thật trước tối ưu.

- [S04 desktop](t04/capture-desktop.png), [S04 mobile](t04/capture-mobile.png).
- [S05 desktop](t04/editor-desktop.png), [S05 mobile](t04/editor-mobile.png).

Cả4 đã mở xem: Theme C/Nunito/berry và local source truth giữ nguyên, split image/form desktop; stack/controls wrap mobile360, không horizontal overflow. Primary camera/file path rõ, prepared preview trước metadata/consent, honest disabled analysis/retry/storage status. Crop alternative controls có labels; OS file/date text theo browser locale, label VI/EN thuộc app. Scoped detector không proof human QA25/full a11y. Chưa rebaseline cold primary-route LCP/CLS/JS; T02/T03 numbers giữ lịch sử.

Implementation: `src/lib/capture/image.ts`, `src/data/local/capture.ts`, database schema3, `src/components/features/capture.tsx`, capture/edit route, Today resume; tests unit/integration/e2e capture; scripts/measure-capture.mjs. Source API references checked: [MDN createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap), [MDN getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia), official shadcn Radix button/field/input/checkbox/alert docs. No new runtime dependency, no server/paid AI call.

## Gate còn lại và next action

T04 **pending_external** theo acceptance `11-delivery-plan.md`: QA07 web/local đã kiểm, **smoke iPhone Safari và Android Chrome trên máy thật chưa chạy**. Cần ghi device/OS/browser/HTTPS origin/date, quyền cho phép/từ chối/hủy rồi cho phép muộn, camera trước/sau/background/leave, ảnh A4 thật/portrait EXIF/HEIC fallback, crop/zoom/keyboard/title/date, saved/reload và storage recovery. Nếu có lỗi thực thì sửa và retest trước chuyển done. PWA installed smoke ở T13/T14 chưa có SW. Không suy Playwright mobile viewport thành phone pass.

Ledger **4 done/2 ready/1 pending_external/12 planned**; next **T00** eligibility/ảnh ground truth/harness độc lập; live benchmark chỉ sau provider đủ điều kiện + credential. T06 vẫn phụ thuộc T04/T05, T07 IPA/reading hints/manual lookup/autocomplete planned. T10 independently ready. No commit/push/deploy; app dev4317 vẫn demo/no live AI/cloud.
