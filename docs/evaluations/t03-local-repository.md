# T03 — IndexedDB, migrations, identities và search

09/10/2026, giờ Việt Nam. **Implemented và locally verified trong scope T03.** Bản app Next production; demo/guest là scopes riêng, AI_PROVIDER=none. Không provider/Google/cloud/SRS/PWA hoặc thử người thật. Task T07 tạo/tra/autocomplete/IPA/cách đọc vẫn planned.

## Behavior đã có

- Database `words-for-kids.local` qua Dexie4.4.6/hooks4.4.0, schema logical v1→v2 (native IndexedDB v10→v20). V2 thêm derived search store/defaults; không xóa DB để sửa lỗi. Native migration fixture và fake-indexeddb6.2.5 giữ từ, nghĩa, examples, notes, events, receipts/source links; failed-upgrade giữ v1 để retry.
- Stable guest/demo scope UUID trong IndexedDB metadata, seed bài mẫu một lần ở demo; guest lần đầu rỗng và không nhận demo. Account scope format/outbox là seam, chưa auth/server sync. Scope leading compound keys, read snapshot transaction và live queries; response snapshot có scope tag, không dùng dữ liệu giữ từ scope cũ.
- Lexeme unique scope/language/canonical/case mode; exact sense identity gồm POS + label đã chọn, không AI semantic merge. Apple case/space/punctuation một mục; bank hai senses/book noun-verb giữ riêng; C++, accents, morphology và case exact được bảo toàn. Search bỏ dấu VI độc lập với canonical dedup.
- Atomic save lesson/entries/senses/examples/evidence/typed links/search/receipt; hash payload trước transaction, cùng operation nhận lại receipt, payload đổi bị conflict. Two connections/two native tabs không tạo copies; duplicate link không overwrite parent edits. Quota/mid-transaction failure rollback và không báo success. Demo correction erqser→eraser giữ literal evidence ban đầu.
- Sửa nghĩa cùng chữ EN qua parent editor lưu thật và giữ approval nếu bản cũ đã approved. Đổi chữ EN thành pendingEdit theo content base version: giữ nguyên snapshot approved/examples/IPA đang học, proposal còn sau reload. Preview/commit toàn proposal thuộc T07; editor báo đúng phần chưa nối. Stale edit/canonical collision giữ input, không last-write-wins.
- Draft corrections/selections và save receipts qua reload, serial draft writes giữ thứ tự trong một UI. Lỗi draft có retry giữ buffer. Lỗi open/version blocked có recovery đóng tab cũ/thử lại, không dùng một memory library rồi giả đã saved. localStorage chỉ 5 small settings, không content/secret.
- Notes storage kiểm target+scope+expectedVersion; review event append idempotent/immutable theo UUID. Notes editor/template, session/SRS reducer và cloud conflict UI thuộc tasks sau; stores cho capture/media/grammar/deck/transfer mới dự trù.

## Verification đã chạy

| Command / evidence | Kết quả | Giới hạn |
|---|---|---|
| `pnpm install --frozen-lockfile` + `pnpm peers check` | PASS, no peer issues | Local Node24.14.1/pnpm11.25.0, không remote CI |
| `pnpm check` | PASS lint/typegen+tsc/**49 tests**/production build | 32 unit + 17 integration; integration chạy Dexie thật trên fake-indexeddb |
| `pnpm test:e2e` | **42/42 PASS** | Native Chromium production1280/360 + demo off; không phone thật |
| `pnpm perf:search` | **5.000 mục, 50 mixed native inputs, CPU4× PASS** | Pixel7 emulation, warm local search; không field INP |
| Source/build/raw/trace integrity | PASS | Source hash và BUILD_ID khớp artifact, gzip trace parse hợp lệ |

Native browser scenarios: data/receipt/draft reload, peer live update/stale edit, two tabs same save, quota rollback/retry, storage unavailable/retry, v1 migration giữ word/note/event, guest edit thật và foreign-scope hidden, pending word proposal giữ child snapshot. Regression S03/S07/S09/preferences/audio/focus/VI–EN đều trong suite. Unit/integration kiểm normalization/cases, collision, independent operations race, receipt hash mismatch, scope/no guest outbox, notes/events, full rollback, migration failure.

Lượt test đầu có 2 failures do locator `role=alert` trùng Next route announcer; sửa scope main, không đổi behavior để bỏ conflict. Typecheck sửa typed migration snapshot/Candidate art nullable; formatter tạm chỉ dùng trên files trong task, không thêm project dependency/global config. Benchmark mở rộng từng gặp timeout vì harness giả định thứ tự số của IDs; sửa expected lexical IndexedDB order. Chỉ bộ cuối dưới đây là evidence thành công.

Docs validation full PASS115 local links/17 skills/351 resources/25 requirements/19 tasks/16 screens/16 JSON, positive-negative fixtures và cross-references; git diff check/scoped whitespace PASS.

## Search5.000 — số đo cuối

Build ID `H0FfPnnMaIcUnVYm8YOb2`; SHA256 src TS/TSX/CSS/JSON `ec429a70f463fe3b64849a2d2329213dce2afc3f6ddf7ec527fd1b8e8e7ca125`. Raw đo `2026-10-09T14:14:08.009Z` (UTC), tức khoảng 21:14 giờ Việt Nam. Host darwin 25.6.0, Apple M1, Node v24.14.1, Chromium 156.0.8078.4.

20 demo entries + 4.980 synthetic rows, ephemeral browser context riêng; không ghi 5.000 fixture vào trình duyệt người dùng. Derived terms có scope/ordinal index, scan lightweight rows trong scope, materialize tối đa50/snapshot; không gọi là inverted/full-text index. Search theo từ/VI/tag/câu/lesson; bounded page50, overview20, Today4. B-tree scope lookup + normalized substring hiện đủ target, không thêm full-text library chưa cần.

| Metric | Actual | Target |
|---|---|---|
| Dataset | 5.000 sense rows | 5.000 |
| Native actions | 50 exact EN/prefix/meaning VI/unaccented tag/empty | đủ query→paint cohort search |
| Median | 141.1 ms | — |
| p95 | **165.6 ms** | ≤200 ms |
| Max | 183.9 ms | — |
| Browser page errors | 0 | 0 |

Event input → đúng matching DOM → hai requestAnimationFrames; là paint-opportunity upper bound của harness, gồm query/materialize/React/render, không phải đo display scan-out/field INP hoặc engine timing tách riêng. CPU4× trên desktop emulation360×800, search local warm; network không nằm trong đường query. Script không benchmark đồng thời E2E jobs. Initial/pagination list cap50 và không horizontal overflow; screenshot đã xem. Chưa đo lại full cold LCP/CLS/bundle budgets của build T03; [T02 baseline](ux-performance.md) giữ lịch sử. Device/field/human/AI/cloud vẫn pending.

Artifacts: [raw results](t03/search-baseline.json), [trace gzip](t03/search-trace.json.gz), [mobile5.000](t03/library-5000-mobile.png), [reproduce script](../../scripts/measure-local-search.mjs). `pnpm build` → `pnpm perf:search`, tự mở/đóng production4326; ghi đè riêng outputs T03, không T02. Các mẫu/query chỉ synthetic/repo-owned, không telemetry nội dung trẻ.

Implementation: [schema/migration](../../src/data/local/database.ts), [repository](../../src/data/local/repository.ts), [canonical rules](../../src/domain/identity.ts), [native tests](../../tests/e2e/local-storage.spec.ts), [integration tests](../../tests/integration/local-repository.test.ts). Primary references checked: [Dexie React live queries](https://dexie.org/docs/Tutorial/React), [transaction](https://dexie.org/docs/Dexie/Dexie.transaction%28%29), [versioning](https://dexie.org/docs/API-Reference); no Supabase/Postgres mutation in this task.

T03 done; **4 done/3 ready/12 planned**. Next **T04 camera/upload/crop/drafts**, T00/T10 also ready by dependencies. No deploy/commit/push; app local4317 remains demo, camera/provider/lookup/IPA/games not connected.
