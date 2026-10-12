# Bổ sung hình — không lặp từ (12/10/2026)

Founder báo are/they lặp ở `/library/prepare`. Trang dùng search theo sense trong khi Library đã có projection headword/caseMode. Sửa riêng PrepareLibrary dùng `libraryOnly:true` cho mọi query thiếu hình, gồm query khi clamp page. Group trước pagination12, sau filter approved/missing/lesson/skip, giữ tất cả dữ liệu học.

Một row/headword; nhiều nghĩa có chọn Nghĩa cần hình. Search/skip/save giữ đúng selected sense/id/revision. WordPictureSearch remount theo selected id/revision để không lấy candidate/error/request từ nghĩa trước. Không tự gán cùng hình cho nghĩa khác; sense còn thiếu hình vẫn trong row này. Không SQL/data migration/AI/provider/founder browser.

Scope verification:
- `pnpm exec vitest run tests/integration/library-search.test.ts`:4PASS, gồm are/ARE và2they nghĩa khác,13headwords/16senses, count/pagination trước grouping, exclude selected sense giữ nghĩa khác, case/lesson/missing boundaries.
- `pnpm lint`, `pnpm typecheck`:PASS.
- `pnpm build`: không hoàn tất vì another next build process already running. Không can thiệp build/server của lượt khác; UI kiểm bằng source snapshot `/tmp/wfk-prepare-preview-20261012` không .env/secrets, reuse dependencies, Next webpack dev4333. Không claim production build đã pass trong lượt này.
- `pnpm exec playwright test --config playwright.prepare-isolated.config.ts`: 2PASS cho fix ban đầu; final cả nhóm8PASS. Fixture are/they/13groups, select nghĩa→mock503 payload đúng, skip/reload vẫn1row/headword, page2 không lặp, mobile360/desktop1280 no overflow. First run only final count failed because demo has another missing word; fixture searchIndex now isolates intended rows, no product code change for that failure.
- Impeccable scoped detector `[]`; không human/physical-phone evidence.

Local fix có trong source dùng dev4317; không sửa thư viện founder hoặc deploy. [Mobile](prepare-dedup-mobile-chromium.png), [desktop](prepare-dedup-desktop-chromium.png).

## Follow-up: kéo thả và dán hình cho từ

Shared WordPictureSearch nhận một ảnh bằng file picker, drop, paste event scoped và Clipboard.read qua nút Dán ảnh. Vùng focus không có listener document để tránh nhận cùng ảnh cho nhiều từ. Text paste không preventDefault. Giữ upload media4MB/format/server12MP/512JPEG/strip metadata/signature; source/license và CAS giữ. Không tự tải URL ảnh, không gửi AI.

`pnpm exec vitest run tests/integration/library-search.test.ts tests/integration/media.test.ts`:15PASS. UI snapshot local có test-only MEDIA_IMPORT_SIGNING_SECRET (không private/operator/cloud/.env), gọi upload actual server→JPEG/receipt→IndexedDB stage/save thật; Clipboard.read mocked, drop/paste synthetic. Mock503 chỉ error cases.8cases desktop/mobile: grouping/pagination/select/skip/reload, drop+keyboard paste/save/reload, button paste/denied/text passthrough, invalid/multiple/oversize/no-request/upload fail/current-art unchanged. First8PASS; final feedback/layout rerun8PASS. Lint/typecheck PASS trên source/tests cuối. Chưa physical clipboard/mobile thật/production build/liveprovider/cloud/deploy.
