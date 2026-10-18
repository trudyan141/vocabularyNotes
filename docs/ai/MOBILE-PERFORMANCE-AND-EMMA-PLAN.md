# Mobile performance và Emma TTS — hướng dẫn triển khai đã duyệt

Ngày: **18/10/2026**. Trạng thái: **approved / in_progress**. Founder đã duyệt và giao Codex thực hiện toàn bộ docs → baseline → tối ưu → kiểm → deploy → báo cáo để founder test lại. Không dừng sau từng đợt để xin lại cùng quyền. Evidence kết quả phải cập nhật theo thực tế, không coi targets là đã đạt.

Founder báo chậm trên **iPhone 12, PWA đã cài, https://words-for-kids.vercel.app/**, kể cả chuyển trang. Yêu cầu: chọn skill GitHub uy tín/nhiều sao, đo và tối ưu; tham khảo Emma Natural của `eng-vocabulary`; review plan trước khi làm. Phiên bản iOS, mạng và số mục trong thư viện sẽ ghi lúc đo máy thật, không tự giả định.

## 1. Kết quả cần đạt

- Chuyển Hôm nay → Từ của con → chi tiết từ → Chơi & học → Nói cùng Cáo và Cài đặt phản hồi ngay, nội dung sẵn sàng nhanh hơn theo số đo cùng điều kiện.
- Nút Nghe dùng **Emma US Natural (`en-US-EmmaNeural`)** làm nguồn online mặc định; từ, câu ví dụ, game và Nói cùng Cáo dùng chung đường phát. Không phải chờ tìm Commons hoặc chờ giọng thiết bị thất bại mới gọi Emma.
- Có báo cáo trước/sau về cold load, chuyển trang, local query và bấm loa → bắt đầu phát; lỗi/timeout tính vào kết quả.
- Giữ dữ liệu học, sense/POS, lịch ôn, review/save/CAS, quyền guest/account/shared và hủy âm thanh đúng vòng đời. Gemini chấm bản thu vẫn là luồng riêng.

Founder đã duyệt ưu tiên Emma online và cache session theo plan. Cập nhật spec/ADR cùng implementation; giữ Gemini assessment riêng và các boundary đã nêu.

## 2. Skill được chọn và đã xác minh

Snapshot GitHub API ngày **18/10/2026**; stars/forks là của **repository**, không phải số người dùng hoặc sao riêng của từng skill.

| Nguồn chính chủ | Snapshot sao / forks | Activity và license | Dùng vào việc gì |
|---|---:|---|---|
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices), Vercel Engineering | **32.591 / 2.845** | Repo push 14/10/2026; `react-best-practices/SKILL.md` đổi gần nhất 14/04/2026. Skill khai báo MIT; API repo không trả license gốc, không suy MIT cho toàn collection. | React/Next: waterfall, bundle, route loading/prefetch, render và subscriptions |
| [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills), Addy Osmani | **2.960 / 258** | Repo push 24/08/2026; hai SKILL đổi 24/08/2026; MIT; repo không archived | `performance` + `core-web-vitals`: baseline, trace, resource budgets, tách lab/field |

Đã đọc nội dung skill và workflow đo. Hai nguồn phù hợp trực tiếp với Next.js/PWA hiện tại. Repo **đã có cả ba skill**, pin và SHA-256 của SKILL khớp [lock hiện có](../skills/skills-lock.json):

- `vercel-react-best-practices`: commit `063bee94c3f4df8453406c830b0a7df0f2860278`, SHA-256 `71ed7794962fa6e803ee83030517b5b93a9f70fbfeb431ec4535c5480a8d8355`.
- `performance`: commit `afa8da942115f2961fdbfa80807ea0b232ff6c00`, SHA-256 `b0c220185d88c61f7770eb127d8facf86c86d2dd1fd82b86e15a4965a0137265`.
- `core-web-vitals`: cùng commit Addy, SHA-256 `731aa78c0347e8b3e191b75962175bee058ce73817278e610ac0fe546e685914`.

Đề xuất dùng bản đã review/pin; không cần cài trùng, thêm MCP/hooks/global hoặc cập nhật cả bộ để bắt đầu đo. `systematic-debugging` và `vocabulary-delivery` hiện có giữ quy trình tìm nguyên nhân và evidence. Khi sửa UI/React, đọc đúng rule liên quan; không dùng skill để đổi framework, theme, font hoặc cấu trúc nav.

Nguồn snapshot: [API Vercel](https://api.github.com/repos/vercel-labs/agent-skills), [API Addy](https://api.github.com/repos/addyosmani/web-quality-skills). Activity của file và nội dung skill cũng được kiểm qua GitHub commits API. Xem [catalog dự án](../skills/CATALOG.md).

## 3. Những gì đã thấy khi đọc source

Source Words for Kids: HEAD `75eff1d5ff26218932fe4a843c8e9908f0b0f210`, working tree sạch lúc bắt đầu. HTTP đọc `/today` trên domain trả 200. Đây không phải phép đo performance, và chưa xác nhận build đang deploy trùng HEAD local.

| Quan sát thật trong source | Giả thuyết cần probe sau duyệt |
|---|---|
| [MainNavigation](../../src/components/app/navigation.tsx), shell và ActionLink đặt `prefetch={false}` | Bấm nav phải đợi route/network; so sánh có/không prefetch có giới hạn và đo phần loading/data riêng |
| [Learning layout](../../src/app/%28learning%29/layout.tsx) có `force-dynamic`; hiện có loading ở root | Kiểm tra trace RSC/server/cache và loading boundary thực sự áp dụng, rồi mới xét thu hẹp dynamic hoặc thêm boundary. Không tự bỏ dynamic/cache dữ liệu riêng tư |
| [AppProvider](../../src/components/app/provider.tsx) chờ auth trước khi chọn scope, sau đó đọc search/draft/receipt; background sync có subscriptions riêng | Đo startup/auth/IDB và render lại khi sync. Chưa có bằng chứng auth được gọi lại ở mọi lần chuyển trang; không bỏ identity check để làm nhanh |
| [Today](../../src/components/features/today.tsx), [PracticeRepository](../../src/data/local/practice.ts) có quét index/review/session và đọc chi tiết để tính summary | Probe với 20 và 5.000 mục, nhiều sense/lịch sử. Nếu đúng hotspot, đọc bounded/indexed hoặc giảm công việc lặp và subscriptions liên quan |
| [AudioControl](../../src/components/app/audio-control.tsx) ưu tiên Commons → device → Edge; lookup metadata có timeout 18s, bản thu có start timeout 10s, device chờ voice tối đa 3s/start 4s tùy nhánh | Chờ nguồn trước có thể lớn hơn thời gian tạo MP3. Đo từng nhánh, bỏ lookup khỏi đường Emma mặc định |
| [Edge server](../../src/server/edge-tts.ts) dùng `msedge-tts@2.1.0`, Emma **Multilingual**, nhận đủ MP3 mới trả; dependency hiện nối trực tiếp `api.msedgeservices.com` | Không có căn cứ coi app này đang dùng proxy trung gian giống đường cũ bên eng-vocabulary. Đo adapter hiện tại trước, chỉ thay nếu có lợi đã chứng minh |
| [Service worker](../../scripts/sw.template.js) cache public assets, không cache API/RSC/private HTML | Đo PWA có SW/không SW, cold/warm/resume và update. Không cache rộng account pages để che độ trễ |

Các hàng trên là source observations và hypotheses, **chưa phải root cause đã đo**. HMR dev loop ở task trước không giải thích lỗi founder đang gặp trên domain production.

## 4. Đợt 1 — baseline và xác định nguyên nhân

1. Đối chiếu deployment/build/assets với source local. Benchmark bản đang deploy và production snapshot local riêng; không gộp kết quả hai phiên bản hoặc dùng `next dev` để chốt mobile performance.
2. Dùng Playwright/headless Chromium + CDP trace có sẵn, profile mobile 360–390px, CPU 4×, down 1,6Mbps/up 0,75Mbps/RTT 150ms; ghi browser/runtime thực tế. WebKit check nếu runtime sẵn có để tìm khác biệt; cả hai vẫn không thay iPhone Safari/PWA thật.
3. Đo cold load `/today`, `/library`, `/practice`: ít nhất 5 runs/route, median + range. Tách browser cache/SW cold/warm và server đã warm hay chưa rõ; không gọi browser cold là Vercel function cold.
4. Đo các chuyển trang ở mục 1, cả lượt đầu và quay lại. Mỗi journey chính có ít nhất 30 lượt để báo median/p95; trace tách tap → visual feedback, route request/TTFB, JS parse/hydration/render, IDB và nội dung dùng được. Spinner không được tính là đã chuyển xong.
5. Fixture riêng: 20 và 5.000 mục, nhiều sense/bài/lịch sử; guest, account và shared theo nhánh có liên quan. Mẫu hosted dùng tài khoản/data kiểm thử riêng và dọn đúng phần tạo. Mạng auth/sync chậm hoặc lỗi là một state cần đo.
6. TTS: cùng synthetic text, giọng, rate, cache và mạng; đo word/câu ngắn/câu dài trong giới hạn endpoint. Ghi tap, request start, server connect/first-audio/complete nếu có, browser `playing`, bytes, lỗi và timeout. Khởi đầu 5 lần cold/5 replay mỗi độ dài; nếu dùng p95 để kết luận thì mở mẫu tối thiểu 30 trong cùng cohort.
7. Trace/report vào output riêng, commit + source fingerprint + build/fixture ID; không nội dung học/key/email. Chọn 2–3 bottleneck lớn nhất từ bằng chứng, không thay nhiều nơi chỉ vì rule gợi ý.

Runner cũ `perf:baseline`/`perf:search` có assumptions fixture/demo/port/output từ T02/T03. Sau duyệt, kiểm và thích ứng với [workflow snapshot hiện hành](WORKFLOW.md) trước khi chạy; không ghi đè evidence cũ hoặc reuse `.next` đang chạy của founder. Trace là lab; nếu CrUX không có dữ liệu thì ghi unavailable. Chưa đề xuất thêm telemetry gửi dữ liệu từ trẻ để hoàn thành task này.

## 5. Đợt 2 — tối ưu chuyển trang và tải dữ liệu theo trace

Thứ tự ưu tiên:

1. **Navigation:** prefetch có giới hạn cho nav chính/đích khả năng cao nếu trace chứng minh lợi ích; có mobile intent/idle strategy phù hợp, không chỉ hover. Loading/pending phản hồi sớm, nội dung trước giữ ổn định, back/forward và cancel đúng. Không bật eager prefetch mọi word link hoặc endpoint có side effect.
2. **Startup và data:** giữ provider/repository sống qua route như contract; giảm truy vấn/derived state lặp; summary/count đọc ít dữ liệu hơn nếu profiler chỉ ra. Tách sync nền khỏi đường render khi an toàn, luôn giữ xác minh scope và chống response cũ sau account switch.
3. **Bundle/main thread:** analyzer theo route; lazy-load capture/crop, recorder/game hoặc tiện ích nặng nếu đang vào chunk dùng chung và trace thấy chi phí. Tách context/subscription khi có rerender lan rộng; không thêm memo đại trà.
4. **Server/cache/PWA:** chỉ sửa dynamic boundary, public asset caching/update hoặc request waterfall đã đo; mọi cache gắn đúng owner/scope và invalidation. Không đưa API/RSC/private content vào SW public cache.

Mỗi thay đổi có probe trước/sau cùng điều kiện. Nếu giả thuyết sai thì bỏ thay đổi; không tích lũy các fix chưa chứng minh. Chỉ sửa schema/index khi evidence cần và đọc Supabase skill nếu chạm Postgres.

## 6. Đợt 3 — đưa Emma từ eng-vocabulary vào đường Nghe mặc định

Đã đọc repo tham khảo tại `/Users/trunglk/Documents/trung-github/eng-vocabulary`, HEAD lúc kiểm `a2ad22a650d3e48aff2ba335026a19dca77dcf4d`; không sửa repo đó.

Bên đó dùng `src/lib/edge-voices.ts` đặt `en-US-EmmaNeural`, `src/lib/edge-tts.server.ts` nối trực tiếp Microsoft, client `src/services/tts/edge.ts`, shared playback/cache ở `src/services/tts/index.ts`. Evidence [bước 1 bên eng-vocabulary](../../../eng-vocabulary/docs/work/edge-tts-step1/findings.md) ngày 17/10 ghi mobile Chromium giả lập tap → playing median **815ms**, replay **19ms**, mỗi loại 3 vòng. Đây là số của project khác, không phải benchmark Words for Kids hoặc iPhone thật. Cả hai adapter vẫn nhận đủ clip trước khi phát.

Đề xuất áp dụng:

1. **Chung giọng và luồng:** Emma US Natural cho Nghe/Nghe chậm ở detail, examples, games và Speaking. Online gọi Emma ngay; Commons/IPA có thể tra riêng nhưng không chặn nút Nghe. Source label phản ánh đúng MP3 đã phát. Nếu giữ nghe bản thu Commons, phải là lựa chọn rõ ràng và giữ credit/license hiện có.
2. **Tận dụng endpoint đang có:** giữ POST same-origin text-only, giới hạn 600 ký tự/1MiB, escape XML, concurrency/deadline/abort và private/no-store. Thêm timing không kèm text. So sánh adapter hiện tại với cách direct WebSocket bên eng chỉ khi timing chỉ ra server synthesis là bottleneck; chọn đường ít thay đổi hơn nếu latency tương đương.
3. **Replay nhanh:** session-memory cache bounded (đề xuất khởi đầu tối đa 32 clips/4MiB/10 phút, tune theo đo), key gồm scope + exact text + voice + rate/format; coalesce cùng yêu cầu. Clear/revoke khi scope/logout, invalidate khi text/voice thay đổi; không chép IDB persistent audio cache bên eng vì spec dự án hiện cấm lưu audio vào IDB/cloud/backup. Cache/cancel ownership giữa nhiều loa phải rõ.
4. **iOS playback:** kiểm user gesture và vòng đời `HTMLAudioElement` thực tế, reuse/unlock chỉ theo hành vi browser được hỗ trợ. Nếu autoplay bị chặn, có nút bấm lại rõ; không báo đang phát khi chưa có `playing`. Nghe 1.0 và chậm 0.6 giữ pitch; stop/mute/hide/mic/unmount/text change abort thật và không phát response đến muộn.
5. **Fallback:** offline hoặc Edge fail dùng device voice khi có, hiển thị nguồn/lỗi đúng, không chờ lần lượt nhiều nguồn mạng. Giới hạn chờ theo kết quả baseline; lỗi hết nguồn có retry. Không thêm paid provider, API key/env mới hoặc ghi nhận đã phát khi không có âm thanh. Câu quá giới hạn không được cắt thầm.

Chưa cần streaming/long-text chunking hoặc pre-generate toàn bộ thư viện cho phạm vi từ/câu này. Không copy nguyên hệ thống provider/settings/cache của eng-vocabulary. Gemini assessment/điểm nói không đổi; demo TTS không chứng minh chất lượng nhận âm.

## 7. Mục tiêu nghiệm thu đã duyệt

Giữ budgets nguồn tại [spec13](../13-ux-performance-gates.md). Các target route/TTS dưới đây đã được founder duyệt; kết quả thực tế và các mục còn vượt budget ở evaluation, không coi target là kết quả.

| Mục | Target / cách báo |
|---|---|
| Visual feedback sau tap | p95 ≤100ms trên journey đo; tách nội dung ready khỏi feedback |
| Chuyển trang đã warm/prefetch | median ≤500ms, p95 ≤1.000ms đến nội dung chính dùng được trong profile đã nêu; báo cold-first transition riêng |
| Bottleneck route đang chậm | Mục tiêu giảm ≥50% nếu baseline đang vượt target; mọi row trước/sau giữ cùng fixture/network/cache, công bố outlier/error |
| Cold load | LCP ≤2,5s, CLS ≤0,1; ≥5 runs/primary route, median + range |
| Local search 5.000 mục | query → painted p95 ≤200ms, ≥50 queries; debounce và end-to-end ghi riêng |
| Tài nguyên route chính | JS ≤300KiB gzip, initial transfer ≤1MiB, font ≤150KiB theo spec; nếu vượt báo actual/nguyên nhân |
| Emma online từ/câu ngắn, cache trống | Target median tap → playing ≤1,5s, p95 ≤3s khi đủ mẫu; câu dài/cohort mạng khác báo riêng |
| Emma replay memory cache | Target p95 ≤200ms; không gọi synthesis lại cho clip cache hợp lệ |
| Độ đúng | Không mất học liệu/progress; auth/shared boundaries nguyên; không nhầm source/voice/text, audio muộn hoặc mic ghi tiếng mẫu |

Không loại lỗi/timeout khỏi tổng mẫu để đạt target. Headless `playing` không chứng minh tiếng nghe được/chất giọng trên loa iPhone. INP field p75≤200ms chỉ kết luận khi có field data đủ mẫu; lab TBT hoặc các lượt tap không đổi tên thành field INP.

## 8. Đợt 4 — regression, bàn giao và iPhone PWA

- Lint/typecheck, unit/integration đúng phần route query/audio thay đổi; giữ data/save/dedup/backup và auth/scope regression cần thiết. UI discovery trước run, không chấp nhận zero-test.
- Production snapshot cuối cho bản cần đo và bản candidate; reuse build khi fingerprint không đổi. UI mobile/desktop: main nav, back/forward, pending/error, account switch, audio normal/slow/replay/cancel/offline/autoplay denied. Chỉ mở rộng suite khi ảnh hưởng rộng hoặc release cần.
- Báo cáo before/after và trace đường chậm nhất, API timings và browser `playing` tách biệt, các giới hạn thật. Đề xuất sửa được đánh giá bằng tốc độ ready, không chỉ spinner hoặc Lighthouse score.
- Khi có candidate đã kiểm, deploy theo phạm vi được duyệt và quy trình hiện có; không push main, không thêm Vercel env. Xác nhận deployment đúng source/build, giữ đường rollback bằng deployment trước. Bản thực thi đã deploy; immutable/source và smoke ở evaluation.
- Founder nghiệm thu trên **iPhone 12/PWA domain**: mở app mới, chuyển nav/back, vào bài/game/Speaking, nghe/replay/chậm, khóa/mở máy/background/resume, mất mạng/kết nối lại, sau app update. Không yêu cầu xóa PWA hoặc data để che cache/update bug.
- Agent không mở/điều khiển browser thật founder. Máy iPhone không có remote control được cấp; physical-device acceptance cần founder thao tác và phản hồi. Lab có thể hoàn tất độc lập, nhưng không ghi là iPhone/PWA pass.
- Cập nhật spec15/ADR cho ưu tiên Emma và cache session; cập nhật spec13 nếu founder chốt target mới; STATE/TASKS/CHANGELOG/evaluation theo kết quả thực tế. Không đổi các con số acceptance sau khi thấy kết quả để ghi pass.

## 9. Checklist thực thi cho Codex

Không spawn agent, không push main, không thêm Vercel env, không mở/điều khiển browser thật founder. Dùng Node24.14.1/pnpm11.25.0 qua PATH runtime sẵn có; không đổi global Node. Giữ diff docs kế hoạch từ lượt trước. Các quy định cũ cấm mọi deploy trong spec10 đã bị yêu cầu trực tiếp/AGENTS hiện hành supersede.

| Bước | Việc và artifact bắt buộc | Trạng thái |
|---|---|---|
| MP1 | Production snapshot baseline; report JSON + trace + nguồn/fixture/runtime; public domain đo riêng | measured; see evaluation |
| MP2 | Probe route/main-thread/IDB; sửa hotspot có bằng chứng; regression scope/auth/data | implemented; final comparison recorded |
| MP3 | Emma mặc định, bounded memory cache/inflight/cancel, source/error/slow/iOS gesture; API timing + unit/UI tests | implemented; real MP3 + scoped tests verified |
| MP4 | Lint/types + scoped behavior/UI; production candidate và cùng harness trước/sau; budgets actual | verified; cold LCP/JS budgets still exceeded |
| MP5 | Spec/ADR/evidence; snapshot deploy sạch secret, alias domain và HTTP/live TTS smoke; founder test list | deployed; hosted smoke recorded; physical device pending |

Discovery: `pnpm test:ui -- --list workflow-smoke.spec.ts`; baseline: `pnpm test:ui -- --mode production workflow-smoke.spec.ts --port 4361`. Runner trả owned snapshot/result path. Không sửa authored source trong khi runner đang kiểm fingerprint. Chạy measurement bằng production snapshot trên port task riêng, profile Chromium/headless/data giả; không reuse browser hoặc port founder.

Sau baseline, bổ sung harness đo riêng có input snapshot/base URL/output; bảo toàn artifact T02/T03. Candidate dùng đúng harness và fixture. Chỉ rebuild khi source liên quan thay đổi, không coi server khỏe là fingerprint khớp. Đối chiếu live deployment bằng immutable deployment và asset/build identity; browser/cold/server cold phân biệt.

Checkpoint và kết quả thực tế: [evaluation](../evaluations/mobile-performance.md). **Next action:** founder test iPhone12/PWA trên domain theo checklist; xem evaluation cho cold-load/JS budgets chưa đạt và field chưa có dữ liệu.
