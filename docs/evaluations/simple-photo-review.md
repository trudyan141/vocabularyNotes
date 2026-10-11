# Thêm ảnh và key AI đơn giản — ADR067,12/10/2026

Theo yêu cầu trực tiếp của founder:

- Cài đặt chỉ một nút **Cài đặt key AI**, bấm mở password input/Lưu key. Bỏ Tắt AI, dòng gửi Google, advanced/model/check/sample/remember-checkbox UI. Model đang chọn vẫn được giữ trong cấu hình. Private key mới mặc định session; key đã opt-in nhớ từ trước giữ chế độ cũ; blank input + Lưu key vô hiệu key qua reload. Không tự nhớ private key lâu dài, không gửi key vào bài/cloud/backup.
- Bỏ toàn khối **Chấm phát âm** trong Cài đặt. Nói trực tiếp mở mic, tự chấm, không Hỏi lại/consent popup; giữ ADR066.
- Capture editor bỏ checkbox Cho phép, giải thích gửi ảnh, nút Chép và thêm từ từ ảnh, nút Lưu nháp/status saved. Bấm Phân tích ảnh lưu pixels hiện hành rồi chạy AI ngay khi review mở. One-shot query được consume trước upload; reload/restored draft không gửi lại. Giữ autosave/CAS/rollback để không mất ảnh/nội dung, không tự AI khi chọn/dán ảnh hoặc chỉ chỉnh ảnh.
- Review bỏ consent/private-image checkbox và checked approval gate. Một Duyệt và lưu là approval, nội dung thiếu vẫn không save. Tự collapse exact word/POS/sense bằng identity chung; chỉ có dòng Từ trùng khi thật sự có repeats/identity trong thư viện. Không nút loại trùng/khung giải thích dài, không merge khác nghĩa/POS hay ghi đè bản user. Source words, IPA, grammar/evidence và atomic save vẫn giữ. Manual recovery chuyển vào Sửa chữ đọc được.

## Kiểm Gọn

| Lệnh | Kết quả |
|---|---|
| `pnpm lint` / `pnpm typecheck` | PASS |
| `pnpm exec vitest run tests/unit/worksheet-review.test.ts tests/unit/byok.test.ts` |36PASS: deterministic duplicates/variants, config/adapter/schema/bounds |
| `pnpm exec vitest run tests/integration/capture-repository.test.ts` |4PASS: atomic/version/scope/image persistence |
| `python3 scripts/validate_docs.py` / `git diff --check` | PASS;588local links |
| `pnpm build` | PASS bản app cuối; một build cho React navigation action/PWA bundle |
| `pnpm exec playwright test --config=playwright.ui.config.ts parent-ai.spec.ts -g 'one key\|editor tap\|quota and cancel\|missing key'` |8PASS12.5s: desktop1280/mobile360 |
| `pnpm exec playwright test --config=playwright.ui.config.ts capture.spec.ts profile-library.spec.ts -g 'upload, rotate\|stale\|sentence worksheet'` |4capture PASS;2family fixture failed trước intake do signed-in fixture thiếu cloud route |
| `pnpm exec playwright test --config=playwright.ui.config.ts profile-library.spec.ts -g 'sentence worksheet'` |2PASS12.1s sau override fixture guest, không sửa app/auth |

Tổng14ca browser khác nhau PASS bản cuối, không full suite. Fixture key giả/Google responses và ảnh mẫu; không tài khoản/browser founder hoặc live AI. Unit duplicate report giữ khác nghĩa/POS và POS aliases; browser pear repeat+tree sense đảm bảo save hai nghĩa không mất source/IPA, archive không key; quota/cancel không retries, restored review không gọi lại, missing key form không mất ảnh. Capture reload/crop/metadata, stale two-tab/quota và source family grammar/save/reload/delete checked. Other legacy test navigation helpers updated; không claim chạy toàn file/toàn bộ.

Impeccable launcher initial permission denied vì mode100644; founder trực tiếp cho phép repo-local chmod, đã `chmod u+x .agents/skills/impeccable/scripts/impeccable` (100755). `IMPECCABLE_LAUNCHER_PROBE=1 ... context --target src/components/features/extract.tsx` dùng engine có sẵn, không download/global install. Context cho phép narrow refinement từ incumbent ThemeC; detect một lần bốnfiles trả `[]`, không thay human UX pass. Vocabulary-delivery + impeccable/distill/craft-floor áp dụng; không mở rộng quyền plugin/browser/deploy.

Ảnh inspected: [mobile review](simple-photo-review-2026-10-12/mobile-review.png), [mobile key](simple-photo-review-2026-10-12/mobile-settings.png), [desktop review](simple-photo-review-2026-10-12/desktop-review.png), [desktop key](simple-photo-review-2026-10-12/desktop-settings.png). Một lần capture keyboard đưa focus skip link được chụp trong ảnh Settings; không dùng screenshot focus này làm lỗi nội dung/default layout.

Không phone/clipboard thật/Google key/accuracy/production/cloudSQL hay publishing được kiểm. Prior Speaking ADR066 changes giữ nguyên; không commit/push/deploy/env hoặc gọi AI thật. Founder sở hữu xuất bản theo ADR049.
