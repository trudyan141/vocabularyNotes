# Sửa lỗi phân tích hai ảnh bộ phận cơ thể — 12/10/2026

User evidence: hai screenshot mobile, không có raw provider response/ảnh worksheet gốc. Hình review đã chứa four fingers, two feet, two legs, one mouth nhưng hiện invalid-result/response chung. Không thể xác nhận chính xác lỗi provider của phiên trên điện thoại từ screenshot.

## Reproduction / root cause

Hai regression fail trước sửa trên source hiện tại:

- Compact second scan thiếu required `truncated`: `recoverWorksheet` dừng ngay invalid-result; khác enrichment có bounded content repair. Source đầu giữ được, ảnh sau chưa checkpoint.
- Transcription `four\nfingers` / `two   feet` với literal `four fingers` / `two feet`: compact scan cho qua bằng normalized whitespace, grammar seed checkpoint lại bị `validateWorksheet` bác bằng raw substring (`evidence`). Đây là lỗi code, không phải text quá nhiều hoặc timeout provider.

Fix: `validateWorksheet` so evidence bằng NFKC/case/whitespace như scan/learning, không thay transcript hoặc nội dung từ. Compact scan một content repair tối đa, mỗi request vẫn 6000 tokens/60s/500KB; không retry quota/network/account/refusal/timeout. Invalid source không publish; complete chỉ khi mọi source/enrichment/grammar hợp lệ. Existing checkpoints/sense/POS/review/atomic save giữ.

## Verification

Runtime PATH `/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH`; Node24.14.1/pnpm11.25.0. Source commit `41da64b8f4adaaf755ef6b536954e61c4c46f6cd`, content fingerprint `ad57be9b3beb88ea61f2b2275ea4e4446fdac55390a8884cff4636c170753280` (bao gồm pre-existing workflow diff).

- `pnpm test tests/unit/worksheet-multi.test.ts tests/unit/worksheet-recovery.test.ts tests/unit/byok.test.ts`: **61 PASS**, final duration0.841s. Tests giữ distinct senses, invented evidence rejection, quota/cancel/no retry, bounded repair, resume chỉ failed photo, wrapped labels.
- `pnpm lint`, `pnpm typecheck`: **PASS**.
- UI discovery `pnpm test:ui -- --list search-batch.spec.ts --grep 'body-part|quota during|all photos'`: **6 selected** (3 behaviors × desktop/mobile).
- Dev first run:3PASS/3FAIL (navigation/cold compilation timeout trước AI); prepare9.091s/browser75.297s. [Result](/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-9ajoJt/result.json).
- Same owned snapshot reuse:5PASS/1FAIL, desktop capture→batch navigation timeout trước AI, browser56.6s. [Result](/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-IVyaxC/result.json). Body-part regression desktop/mobile PASS cả hai runs; không patch app/test timeout để che environment failure.
- `pnpm test:ui -- --mode production search-batch.spec.ts --grep 'body-part|quota during|all photos' --port 4344`: **build PASS45.2s, 6/6 UI PASS24.2s**, source identity matches before/after. [Result](/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-fzbwuT/result.json). Production snapshot loại compile-on-navigation khỏi ca cũ; không thay timeout/app vì devfixture.

Fixture nhãn từ screenshot: four fingers, two feet, two legs, one mouth; one mouth, two ears, two hands, two legs, two arms, two feet. Global exact dedup =7phrases. UI fixture dùng ảnh mẫu có sẵn và provider mock, kiểm scan-all→repair→enrich→one review→reload→one save; **không chứng minh live OCR accuracy hoặc phân tích thật hai ảnh gốc**.

Không deploy/push main/thêm Vercel env; không browser founder/database/account data. Pre-existing diff giữ. Actual tokens unavailable; chỉ ghi test durations thật. Không cài dependency/global/plugin; runner dùng dependency có sẵn. Rerun reason environment; initial test failures là reproduced code defects. Các artifact runner nằm trong temp owned paths.
