# Welcome gọn, bỏ footer metadata và 404 thân thiện — 11/10/2026

Steering trực tiếp ADR052/053 trong cùng lượt sau ADR051. Dùng Impeccable distill/layout/craft floor và built-in imagegen cho asset mới theo yêu cầu. Giữ Theme C, không cài plugin, không thao tác browser/account thật.

## Thay đổi

- Welcome bỏ đoạn giải thích demo/account dưới Bắt đầu, link Cài đặt lặp và strip Nghe từ/Nhìn hình/Chơi và nhớ. Giữ một Settings entry ở header. Lời chào ngắn **Cùng Cáo học tiếng Anh!** và một CTA; Cáo cùng hình táo/sách/mèo nổi bật. Grid/min-height theo viewport, tự cuộn khi nội dung dài, không chèn text/config để lấp màn.
- AppShell bỏ footer **Bài mẫu** ở tất cả route và CSS không còn dùng. Không đổi demo flag/scope/library hoặc xóa fixture; dữ liệu mẫu có nguồn/tên trong chính bài học.
- WordDetail bỏ disclosure **Nguồn và ghi chú**, source query, provenance/literal-evidence/IPA-source links, note display và note shortcut. Database, source/evidence/pronunciation/note contracts, archive/sync không đổi. Route notes cũ giữ dữ liệu và editor tương thích nhưng không hiện tại chi tiết từ; giấy phép/credit hình là mục riêng, giữ khi cần.
- Trang404: original fox mới cầm bản đồ, nền vàng, số404 HTML, lời thân thiện VI/EN và berry Home CTA. Next vẫn trảHTTP404 cho route lạ, không tự redirect. Home dùng root routing hiện có. Ảnh có alt, hướng đọc/focus bình thường, không có animation liên tục.

## Asset

Built-in imagegen được founder trực tiếp yêu cầu; tham chiếu mascot gốc `public/illustrations/fox.svg` (raster reference tạm). PNG gốc giữ tại Codex generated_images, không thêm ảnh nhiều MB vào repo. Chỉ resize/encode bằng sharp thành [fox-lost-map.webp](../../public/illustrations/fox-lost-map.webp): 768×846, alpha, **50.538 bytes** (~50KB). Không thay mascot gốc hoặc catalog hình học tập.

SHA256 `21ef0844a4805ac516aa5dbca0372c003973bcab7e7a3c65efdf5feb5d994d4b`.

Prompt: giữ coral/cream/plum/pink của Cáo gốc, tư thế tò mò cầm bản đồ, một dấu hỏi; không typography/background/watermark, transparent;404 renderHTML riêng. Generated bitmap đã xem trực tiếp và 4 ảnh màn Welcome/404 cuối đã kiểm.

## Kiểm mức Gọn

- Affected-file ESLint `--max-warnings=0`: PASS cho today/word-detail/shell/not-found/missing-page và scaffold/learning tests.
- `pnpm typecheck`: PASS.
- `pnpm build`: PASS để production preview local. Build trước đó cho Welcome đã xong trước khi founder thêm404; một build mới cần thiết cho source404/asset mới, không lặp build chỉ vì test pass.
- Scoped Playwright config `/tmp/wfk-scoped-ipa.config.ts`, desktop1280×1000/mobile360×800, isolated fixture server4320. Grep đúng welcome/metadata/notes/IPA-save/404 cases: **14/14 PASS,17,7giây**. Không fullSQL/unit/E2E/visualaudit.
- Kiểm Start/keyboard skip/3nav, mascot finite wave/reduced motion, một settings entry, viewport height/nooverflow/VI-EN, không footer trên Welcome/Today/Library/Practice/Settings/Capture/Groups/Detail, thiếu hình/edit/reload, lưuIPA source vẫn ởDB, note+mnemonic vẫn ởDB sau save/reload, ảnh404 tải được/HTTP404 thật/Home VI-EN.
- User-facing source/notes removal không gọi AI học tập, không sửa schema/remote. Imagegen chỉ tạo asset theo yêu cầu. Không kiểm lại cloud/archive bằng live account hoặc iPhone/Android thật; data contract không đổi.

Lệnh browser đã chạy:

```sh
pnpm exec playwright test --config=/tmp/wfk-scoped-ipa.config.ts tests/e2e/scaffold.spec.ts tests/e2e/groups.spec.ts tests/e2e/learning.spec.ts --grep 'welcome, keyboard skip|detail hides navigation and metadata|welcome has recognizable|manual autocomplete, IPA|notes and approved|welcome stays simple|friendly 404'
```

Config tạm chỉ chọn desktop/mobile từ playwright.config.ts và webServer4320; excludes cloud/demo-off servers. Node24.14.1/pnpm11.25.0. Scoped tests trước cho ADR051 có14ca riêng biệt PASS, ghi tại [capture-tabs](capture-tabs.md); không gọi mọi browser test trong repo đã chạy.

## Ảnh cuối

- [Welcome360](founder-fixes/welcome-cleanup/welcome-360.png), [Welcome1280](founder-fixes/welcome-cleanup/welcome-1280.png).
- [404360](founder-fixes/welcome-cleanup/404-360.png), [4041280](founder-fixes/welcome-cleanup/404-1280.png).
- [Detail360](founder-fixes/welcome-cleanup/detail-360.png), [Detail1280](founder-fixes/welcome-cleanup/detail-1280.png).

Tất cả source/docs/asset hiện chỉ local, chưa commit/push/deploy (ADR049). Founder env/key edits giữ nguyên. Human/device ledger không đổi. Các screenshot capture ADR051 chụp trước khi footer toàn app được gỡ ở ADR052, là snapshot lịch sử của tab task.

Kiểm docs cuối: `scripts/validate_docs.py --full` PASS375 local links/34JSON; targeted `git diff --check` sạch. Test server4320 đã tự dừng; không thao tác server dev có sẵn của founder.
