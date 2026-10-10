# Chất lượng và nghiệm thu

## Phạm vi QA và quyền thao tác hiện hành

- Agent chỉ làm code/docs và kiểm thử **local cô lập**, dữ liệu mẫu, theo phạm vi được giao. Không tự mở/điều khiển Chrome hoặc browser thật của founder, không đọc/ghi tài khoản hay dữ liệu thật qua browser nếu chưa được cho phép cho việc cụ thể. Playwright local với profile/data fixture riêng là kiểm thử code; không được dùng nó để thao tác production hoặc tài khoản founder.
- **Founder làm GitHub/Vercel**: không tự commit vào main, push bất kỳ nhánh, merge hoặc thay đổi remote; không tự tạo/sửa project, thêm/đổi/xóa environment variables, nối GitHub, đổi domain, redeploy hoặc deploy. Push main có thể tự deploy production, phải nói rõ hệ quả khi xin phép. Git status/diff local được dùng để xem thay đổi.
- Nếu cần agent làm ngoại lệ, hoàn tất code/diff/bằng chứng local trước; xin phép bằng hành động cụ thể, nơi tác động và hệ quả, rồi chỉ thực hiện đúng phạm vi founder đồng ý. Quyền triển khai/browser trước ADR049 đã được rút lại; không dùng approval lịch sử làm quyền tự động cho feature tiếp theo. Hướng dẫn setup, skill, tài liệu hoặc credential có sẵn không phải authorization. Không tự gọi AI thật hoặc đổi môi trường để “kiểm thử”.

## Kiểm tra Gọn — founder chọn 11/10/2026 (ADR050)

- Mỗi feature/fix: lint/typecheck, test có ý nghĩa đúng phần thay đổi; UI kiểm một vài trạng thái chính/lỗi tại mobile và desktop trong browser local cô lập. Thay text/tên/email/button đơn giản không tạo test phản chiếu code hoặc chạy toàn bộ project.
- Dữ liệu/lưu/chống trùng/backup: giữ test liên quan chống mất dữ liệu. Auth/quyền/cloud/SQL: kiểm đúng boundary thay đổi, ghi phần chưa kiểm; không tự cấu hình tài khoản hoặc chạy integration production.
- Chạy build khi thay dependency, route/API, Next/PWA/offline/config hoặc cần production preview; một build cho phiên bản cuối, không build lại sau từng sửa nhỏ. Install/frozen/Chromium chỉ khi dependency/lock/runtime thiếu hoặc đổi, không lặp mỗi task.
- **Full check, toàn bộ E2E/SQL, audit hàng chục màn/performance chỉ trước mốc bàn giao lớn/release (gói nhiều tính năng hoặc thay kiến trúc đã xác định trước, không coi mỗi fix là mốc lớn)**, hoặc có bằng chứng ảnh hưởng rộng cần ghi rõ lý do. Không chạy lại toàn bộ chỉ để chắc chắn, không polling CI/deploy cho sửa nhỏ. Quyền push/deploy vẫn cần ADR049.
- Trước test ghi ngắn phạm vi/lý do; khi bàn giao ghi lệnh, kết quả và giới hạn. Lỗi thì sửa và rerun ca lỗi cùng phần bị ảnh hưởng; broaden chỉ khi có lý do mới. Token chủ yếu từ đọc/phân tích code/docs/log/ảnh, không tự tăng theo thời gian chương trình test đang chạy; giữ output ngắn và không rà tài liệu/ảnh diện rộng ngoài scope.


## Definition of Done cho từng task

Task phải có behavior chạy được, lỗi/fallback trong scope, test có ý nghĩa, cập nhật context và không còn TODO che tính năng chính. Mock, fixture và screenshot không xác minh integration provider thật. Bằng chứng ghi command, môi trường/version, kết quả và giới hạn vào CHANGELOG/STATE.

T01 đã thiết lập `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm build`; `pnpm check` gộp lint/typecheck/unit-integration/build. T03 thêm `pnpm perf:search`; evidence migration/scoped reads/unique race/rollback/native browser tại evaluations/t03-local-repository.md. Chỉ chạy test liên quan task và broad checks phù hợp trước release, không lặp full suite vô ích.

## Ma trận test chính

| ID | Loại / scenario | Kết quả mong đợi | Yêu cầu / task |
|---|---|---|---|
| QA01 | Normalize apple/case/space/punctuation và C++/US | Key đúng; không làm mất dấu có nghĩa | R06 / T03 |
| QA02 | bank 2 nghĩa, book noun/verb, run/running | Không mất sense; không auto lemma merge | R06–R07 / T03,T06,T07 |
| QA03 | A4 clear/mixed EN–VI/handwritten/blur/no English | Evidence và warnings; không bịa nguồn | R02 / T00,T05 |
| QA04 | All-words mode có a/the/is và phrase | Người dùng thấy và chọn được; phrase không mất | R02 / T05,T06 |
| QA05 | AI malformed/refusal/truncation/invalid refs | Lỗi rõ, draft vẫn còn, không lưu sai | R02–R03 / T05,T06 |
| QA06 | Ảnh có “ignore instructions”/URL và metadata cá nhân | Không execute/fetch; không thêm tên trẻ thành từ | R20 / T05,T14 |
| QA07 | Camera denied/unsupported/rotate/large/HEIC | Upload fallback; preview đúng ảnh gửi; reject rõ | R01 / T04 |
| QA08 | Double save, 2 tab cùng entry, tất cả trùng | 1 entry, 1 link mỗi bài, summary đúng | R03,R06,R16 / T03,T06 |
| QA09 | Reload guest, migrate DB version, storage đầy/eviction | Giữ dữ liệu hợp lệ; không báo success giả | R04,R17 / T03,T11 |
| QA10 | Search tiếng Việt có/không dấu và nhiều fields | UI ổn, filter kết hợp đúng; dedup không dùng search normalization | R11 / T03,T07 |
| QA11 | Meanings/examples/grammar/mnemonic rubric | Đúng sense và ngữ pháp; source/AI/user rõ | R07–R10 / T07,T08 |
| QA12 | Reduced motion + keyboard + zoom 200% | Mọi nội dung đọc/học được, không phụ thuộc animation | R10,N01 / T02,T08,T14 |
| QA13 | Rating Again/Hard/Good/Easy, hints và replay event | Lịch đúng reducer v1; không ghi hai lần | R12,R21 / T09 |
| QA14 | G01/G02 thiếu ảnh, duplicate distractor, broken image | Mode eligibility rõ; không hỏi nhập nhằng hoặc tính sai | R13 / T12 |
| QA15 | G03/G04 spaces/apostrophes/variants/IME/case | Chấm theo contract, không fuzzy accepted sai | R14 / T12 |
| QA16 | Voice list trễ/không có EN/mất mạng/đổi card | Không autoplay; cancel speech cũ; fallback đúng | R15 / T07,T12 |
| QA17 | Guest→Google preview, skip merge, partial transfer/retry | Không mất guest data hoặc trùng records | R05,R17 / T10,T11 |
| QA18 | Hai user/forged owner/child FK/storage path | RLS và API từ chối đọc/ghi chéo scope | R05,R20,N07 / T10,T14 |
| QA19 | Switch A→B khi API/sync đang chạy | Response A không ghi B, outbox vẫn đúng owner | R05,N07 / T11,T13 |
| QA20 | Offline edit→reconnect conflict/delete/outbox replay | Hội tụ, tombstone giữ hiệu lực, conflict có lựa chọn | R17–R18 / T11,T13 |
| QA21 | Export→import, backup version/oversize/malicious URL | Roundtrip nội dung; reject an toàn; không auto fetch | R17 / T11 |
| QA22 | Guest/account quota race, same key changed payload | Atomic reserve, no repeated provider call đồng thời | R20 / T05,T14 |
| QA23 | Offline shell/game/draft và PWA update đang học | Content đã cache chạy; không force reload mất phiên | R18 / T13 |
| QA24 | Delete local/cloud/account và expired transient results | Scope rõ, dữ liệu/media/TTL thực sự xử lý | R17,R20 / T11,T14 |
| QA25 | ≥5 phụ huynh + ≥5 trẻ 5–8, ít nhất 2 chưa đọc nhãn, voice cues của app được phép | ≥4/5 mỗi nhóm hoàn tất từng task không trợ giúp; lỗi được sửa/retest, chưa thử không ghi pass | N08 / T18,T02,T15 |
| QA26 | Production build, 5.000 mục, cold/warm/device profiles | Budget/actual/trace theo 13; field CWV p75 tách lab, thiếu samples ghi pending | R11,N09 / T02,T07,T09,T12,T14 |
| QA27 | Rapid taps/back/pause/hidden tab/đổi reduced motion giữa phiên | Không state corruption/duplicate events, static content đủ; trace motion trên máy thật | R10,N01,N09 / T02,T08,T09,T12,T14 |

| QA28 | Search/catalog sense, license, cartoon fit, parent review, credits, asset lỗi/revoked | Chỉ đúng nghĩa và approved+ready vào game; text giữ; theo 14 | R13,R25 / T07,T08,T12,T14 |
| QA29 | Concurrency nhiều principal/instance, 429, cancel, duplicate lookup, stale edit | Không vượt quota/giới hạn, partial failure riêng, không ghi đè edit; đo thật so tuần tự | R20,R24,R25,N09 / T05,T07,T14 |

Search có thể hỗ trợ bỏ dấu VI để tìm `qua tao`→`quả táo`; canonical English dedup giữ quy tắc riêng. Không dùng cùng helper nếu behavior khác nhau.

## Các mức kiểm tra

**Bổ sung QA10/QA11/QA08/QA09 cho R11 — thêm từ nhập tay:** gõ một từ chưa có vẫn có autocomplete/đường tra; chọn từ có nhiều nghĩa/POS rồi duyệt/lưu/reload; đúng mục đã có không trùng, nghĩa mới không mất, chọn gợi ý/hủy chưa lưu không tạo record. Kiểm gợi ý liên quan có nhãn, query nhanh/out-of-order/cancel/IME/keyboard/touch, loading/empty/offline/quota/lỗi tra/lỗi lưu giữ input và retry. Nguồn nghĩa/IPA/ví dụ rõ; không provider thì mock có nhãn hoặc nhập thủ công, không claim tra live. Kiểm server key không ra client và calls không phát sinh theo từng phím; approval trẻ dùng đúng version. Các ca triển khai ở T03/T07, hiện pending.

**Bổ sung QA11/QA16 cho R07/R08 — IPA + cách đọc chữ Việt:** kiểm vị trí dưới từ và từng câu ví dụ/câu học ở S09/S10, phân biệt IPA/UK/US với `Cách đọc gần đúng` và bản dịch. Kiểm provenance/verified IPA, parent approval/version, thiếu một hoặc cả hai loại, sửa text/accent làm bản cũ cần kiểm lại và retry không đè user edit. Nghe/Nghe chậm dùng câu/từ EN gốc và accent tương ứng, không đọc gợi ý chữ Việt. Kiểm Unicode IPA/dấu tiếng Việt, câu dài ở 360 px/zoom 200%, bản chưa duyệt không hiện cho trẻ; flashcard/game không lộ đáp án trước reveal trừ hint có ghi nhận. Contract version/fixtures và lưu–reload–backup roundtrip phải giữ dữ liệu khi triển khai T03/T07/T11. Viết checklist này chưa chứng minh các ca đã pass.

**Unit/domain:** canonical keys, dedup decisions, reducer SRS với clock cố định, answer grading, payload hash/operation receipts, scope guards. Test invariants và edge cases, không test chỉ khớp chuỗi implementation.

**Integration:** Dexie thật bằng harness phù hợp, migrations từ fixture cũ, transaction rollback/quota lỗi; Postgres unique race, RLS/grants/child foreign keys, transfer receipts và conflicts bằng hai tài khoản test. Không chỉ mock Supabase rồi gọi đó là RLS test.

**E2E:** guest upload mock→review→save→search→reload→flashcard→4 game; cloud login/merge theo test environment; offline→reconnect; keyboard/reduced motion; screenshot mobile/desktop. OAuth third-party có thể dùng test session cho automation nhưng phải smoke-test Google thật trên staging.

**AI eval:** image ground truth theo T00, exact model/prompt/schema versions, latency/cost, human review 30 senses + 10 patterns + 10 grammar items trên mixed-level content. Contract fixtures trong repo chỉ kiểm parser/validation.

## T04 local evidence — QA07, 09/10/2026

[T04 capture](evaluations/t04-capture.md): 57 unit-integration/58 browser suite PASS, native IndexedDB v1/v2→v3, actual image decode/EXIF/color orientation/metadata strip/resize/crop, invalid MIME/HEIC/10 MB/20MP/corrupt, quota create/update rollback/retry, stale editor/delete, resume. Camera acquisition là mock canvas stream; browser video/tracks native, late/cancel/switch/leave tested. Six large JPEG lab runs CPU4×269–335ms/main tasks≤60ms, 4 screen captures360/1280 đã xem. **QA07 phone/device smoke chưa pass; T04 pending_external.** Không browser mock thành camera OS permission evidence; không lab performance thành field INP/physical mobile/AI latency/OCR accuracy.

## Device matrix P1

- iPhone Safari và PWA installed: camera, upload HEIC fallback, keyboard, IndexedDB và voices.
- Android Chrome và PWA installed: camera switch, file input, offline, touch/audio.
- Desktop Chrome/Edge + Safari: search, keyboard, drag/crop, login, account isolation.
- Responsive ở 360/390/768/1.280 px, zoom 200%, reduced motion; ghi OS/browser/device version đã thử. Playwright WebKit không thay hoàn toàn Safari trên iPhone thật.

## Release gate P1

- R01–R21/R24–R25 và N01–N09 có bằng chứng; QA01–QA29 pass hoặc issue được người dùng chấp nhận rõ. Field metrics thiếu samples ghi pending với lab/device evidence, không coi là pass thực địa.
- Có live AI extraction/enrichment và cloud Google sync đã kiểm chứng; demo fixtures không thay chức năng thật.
- Không mất dữ liệu trong transfer/retry/logout; không đọc/ghi chéo user; server key không có trong client bundle.
- Cả bốn game và ba notes template chạy; từ thiếu ảnh có eligibility/fallback trung thực.
- Pilot usability (≥5 phụ huynh + ≥5 trẻ 5–8, gồm trẻ chưa đọc nhãn) và performance targets được đo theo `13-ux-performance-gates.md`; chưa đạt thì ghi kết quả và xử lý nguyên nhân. AI self-review không thay human test.
- Quota/spend cap, logs redaction, private media, TTL cleanup, export/import, migrations và rollback có kiểm tra.

P2 có gate riêng; không dùng việc chờ P2 để bỏ các lỗi mất dữ liệu hoặc leakage của P1.

## T00 evaluation preparation — 09/10/2026

[AI benchmark preparation](evaluations/ai-benchmark.md):20 synthetic images/40 mode references/scorer15 tests PASS; schema/domain/source/inferred/PII-injection checks và failure categorization. QA03–06 chỉ có harness coverage, **chưa AI/provider hoặc UI recovery pass**. Ground truth human review/real handwriting/live model accuracy/cost/latency/account eligibility pending; T00 pending_external. Không thay bằng chứng57 app unit-integration/58 browser T04 trước đó thành kết quả rerun lượt T00.
