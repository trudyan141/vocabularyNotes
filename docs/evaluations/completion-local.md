# Milestone code độc lập, local QA và setup — 10/10/2026

Theo yêu cầu founder làm liên tục, hoàn thiện phần local/independent và chuẩn bị config Vercel. **Không xong toàn plan**: T00→T05 chưa provider/gateway, Google/Supabase hosted chưa có project, physical/human/field/pilot chưa nghiệm thu. [Setup](../../SETUP-PROJECT.md), [founder plan](../KE-HOACH-FOUNDER.md), [ledger](../ai/TASKS.md).

## Code và behavior đã thêm

- Source photos: authenticated owner/library/lesson, consent riêng, streamed JPEG≤3MB/12MP, EXIF strip/resize, fixed private path, no-store proxy, DELETE/compensation, deterministic bytes/ID retry không nhân đôi.
- Account deletion: recent sign-in≤10min, phrase/backup hoặc explicit skip, SQL write freeze, bounded own-prefix orphan cleanup/retry rồi Auth cascade/local account cache cleanup; guest giữ. Missing admin key/reauth/quota/partial deletion giữ trạng thái thật.
- Notes keep-both tạo ID mới, meanings per-field merge pending parent review; stale guard và immutable review history giữ. Unpublished deterministic duplicate reconciliation; không rewrite accepted event identity tùy tiện.
- Optional Commons adapter: exact hosts/redirect rejection/byte/time caps, supported license/credit metadata, shared SQL leases/day quota/cache, import metadata SHA recheck/JPEG512px/HMAC receipt, approved exact-revision media read/revoke/sync/archive; restored media pending review. Có credits trên app và offline card.
- Catalog21 đủ2 bilingual examples + hints; explicit example positions giữ primary trước secondary; editor complete reapproval và second-example fields, unverified sentence IPA không tự hiện. Enrichment1.1 schema/fixture/closed pronunciation suggestions parser có stale/text/accent checks, không tự cấp verified/approved.
- Library S10: Từ/Câu/Mẫu câu/Ngữ pháp, query/lesson/page50, chỉ approved current revision/scope; sentence IPA khi verified/hints/audio/context, grammar formula/analysis/error/correction do parent nhập.
- Offline fallback: guest/demo library/practice/session/SRS, parent add/basic edit/CAS/dedup; prepare eight OCR worker/language/WASM assets qua hash/bytes validation, local raster OCR/cancel. Không đổi headword/full grammar/media/extras ở fallback; account cold boot cần auth online. Có thể chỉnh đầy đủ khi app React đã mở và dữ liệu local còn sẵn. Lần đầu chưa cache hoặc chưa tải reader cần mạng.
- Vercel Next/region/functions/headers/frozen pnpm, Supabase config/migrations0001–0006, GitHub CI Postgres/browser/docs và README/SETUP. Chưa deployment hoặc hosted stack/CI run.

## Kiểm chứng

`pnpm check` PASS: lint/types/**85 unit-integration tests**/production build. `pnpm test:sql` PASS PostgreSQL15 temporary cluster migrations0001–0006/owner RLS/FK/unique/immutability/CAS/sync/freeze/deletion/storage/media shared quota. Không dùng database người dùng.

`pnpm test:e2e` **105/105 PASS** sau Commons allowlist và build cuối, desktop1280/mobile360/cloud fixture/demo-disabled. Native IndexedDB/storage/image transforms/worker thực; identity Google/Auth và HTTP PostgREST/Storage bridge test-only + PostgreSQL thật. E2E media network fixture khác public provider smoke bên dưới. Hai lượt gặp duplicate hidden SSR summary trong HTML streaming, đã sửa test chỉ chọn visible summary/chờ controls ready rồi rerun; không gọi các lượt fail là pass.

Docs full validator kiểm links/skill hashes/schema positive+negative/crossrefs, không là app tests. `vercel.json` kiểm bằng downloaded official schema qua Draft7Validator, Supabase TOML parse PASS. Automatic `jsonschema.validate` không kiểm được chính schema upstream vì unrelated malformed triggers/items; không dùng config validation thay actual Vercel deployment smoke. SQL/hostedCLI khác nhau.

Public Commons: `node scripts/smoke-commons.mjs --live` PASS, search4 candidates + metadata recheck/download một raster và Sharp JPEG **400×512,23.863bytes**; bytes chỉ RAM, không ghi thư viện/parent approve. [Raw smoke](commons-live-smoke.json). Phát hiện domain thumbnails mới, đã thêm exact `thumb.wikimedia.org` và reject suffix-host tests; [Wikimedia migration](https://phabricator.wikimedia.org/T439443). Đây là adapter smoke, chưa route hosted auth/shared quota/UI end-to-end.

Đã kiểm trực tiếp browser founder: bank `/bæŋk/`, nghĩa ngân hàng/bờ sông riêng; giữ giải thích bờ sông đã sửa. Test browser riêng không ghi đè thư viện founder. [Library360](current-ui/library-360.png), [detail360](current-ui/detail-360.png), [library1280](current-ui/library-1280.png), [detail1280](current-ui/detail-1280.png) từ final native browser suite; đã xem library360 để kiểm bốn nút và hai nghĩa không overflow.

## Performance hiện hành

Build `zEaPtebtAm0oyn0DgxY8I`, src SHA256 `993415564a73515cf950829e8c4f73087955c3a4cbfc219df775ca3d3a112979`. [Raw cold loads](current-ui/baseline.json), [50-input trace](current-ui/search-trace.json.gz), [5.000-item search](current-search/search-baseline.json), [search trace](current-search/search-trace.json.gz). Base git commit cộng workspace chưa commit; pin Node24/pnpm11.25.

Pixel7 viewport360×800 trên desktop M1/Chromium156, CPU4×, network150ms/200.000B/s down/93.750B/s up, five cold contexts per route/browser cache disabled/production server warm. Lab không device hoặc field INP. JS gzip là recompressed bodies, page bytes là Resource/Navigation transfer timing; public SW/assets có thể tải trong profile.

| Route | Median LCP ms | Max CLS | JS gzip KiB max | Page transfer KiB max |
|---|---:|---:|---:|---:|
| /today | 764 | 0.0281 | 262.2 | 386.1 |
| /library | 2920 | 0.0006 | 268.8 | 391.9 |
| /practice | 816 | 0.0045 | 265.4 | 389.1 |

Today/Practice LCP và cả ba route CLS/JS/font/page trong budgets; **Library LCP vẫn vượt2.500ms**, không QA26 full pass. Progressive public shell không chờ DB, giữ private content scope-guarded, reserve due/footer/loading layout, tách detail/notes khỏi library module và lazy-load content modes đã giảm layout shifts. [Before raw](current-ui-before/baseline.json) là build trước các sửa này, không cùng chức năng/timing nên không gọi thử nghiệm A/B chuẩn hoặc hứa speedup.

Search20 entries50 actions p95 **28.2ms**; search5.000/50mixed inputs CPU4× p95 **150.7ms**, max **158.6ms**, target200ms PASS, zero page errors. Hai rAF là paint opportunity proxy, không field INP. Benchmark jobs chạy riêng; historicalT02/T03 không bị ghi đè. Listen/reveal/answer/nav device trace30-action cohort, phone install/camera/voice,5parents+5children và field sample count còn pending.

## Phần còn lại và cách thử

Không cần key để mở4317 và test manual/OCR/approved content/library/notes/decks/games/backup/prepared offline. Google/cloud/Commons UI cần config trong SETUP và hosted smoke2owners. T05 adapter/guest capability/shared AI ledger/TTL/budget chưa runtime; T00 eligibility/account/retention decision trước SDK/model. P2profiles/batch/cloudTTS/FSRS chưa được chọn. Không tự paid call/deploy/commit/push. Không suy package/build/CI config là release pass.
