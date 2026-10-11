# Báo cáo tốc độ tải và đồng bộ Words for Kids

**Cập nhật12/10 sau “Sửa theo plan”:** đã làm code và kiểm local. Đăng nhập tự dùng account, thêm/sửa/xóa/hồ sơ tự gửi và nhận; giữ bài khách và hỏi sao chép một lần. Trang chào nhẹ hơn: nội dung lớn hiện khoảng **2,91 → 0,98 giây**, sẵn sàng **2,80 → 2,04 giây**, mã tải giảm41% trong cùng profile kiểm. Hôm nay/Chơi & học **chưa đo được nhanh hơn**, nên không gọi toàn app đã tăng tốc. [Bảng đo trước/sau](evaluations/performance-2026-10-12/README.md), [chức năng/ảnh/giới hạn](evaluations/speaking-refresh-and-automatic-sync.md). SQL0007 chưa kiểm do initdb kernel SHMALL và chưa apply vào Supabase thật; không publish theo ADR049. Báo cáo11/10 bên dưới được giữ là nguyên nhân/đề xuất trước sửa.


Ngày 11/10/2026 · Source được kiểm tra: `058c0c7` · **Điều tra trước khi sửa, chưa thay code app hoặc database.**

## 1. Kết luận để bạn quyết định

Có vấn đề thật trong cách mở thư viện và đồng bộ. **Ưu tiên sửa đúng nơi lưu bài sau đăng nhập trước, rồi giảm thời gian chờ khi mở app.** Chưa có bằng chứng để kết luận phải mua gói Vercel/Supabase hoặc đổi công nghệ.

Bốn việc đề xuất chốt:

1. **Đã đăng nhập thì tự dùng tài khoản đó.** Mọi bài mới, thêm/sửa/xóa phải tự gửi lên; không còn phải chọn “Mở thư viện tài khoản”. Bài khách có sẵn chỉ hỏi sao chép một lần, độc lập với việc lưu bài mới.
2. **Thiết bị khác tự nhận thay đổi.** Dùng Supabase Realtime báo có thay đổi, sau đó lấy đúng phần mới. Giữ hàng đợi chống mất dữ liệu khi mất mạng.
3. **Mở app không chờ việc không cần thiết.** Dùng chung một kết quả kiểm tra đăng nhập; hiển thị thư viện đã lưu của đúng tài khoản trước, xác minh/đồng bộ nền. Không tự đổi sang thư viện khách khi mạng lỗi.
4. **Trang chào nhẹ hơn.** Tách trang chào khỏi phần thư viện/game; giữ hình Cáo khi chào, không xóa rồi tạo lại ảnh; bỏ lượt chuyển trang dư từ `/` sang `/welcome` bằng cách xử lý ở server sớm hoặc phục vụ trực tiếp cùng trang chào.

Giữ Next.js, React, Dexie/IndexedDB và Supabase đang có. Không thêm API tính phí, mua gói hay thuê server. Chưa kiểm hạn mức/gói thật của Supabase; phương án phải nằm trong tài nguyên miễn phí hiện có, không tự nâng gói.

## 2. Đã đo được gì?

Hai loại phép đo được tách riêng: HTTP ẩn danh trên website thật và browser cô lập chạy **bản production local**. Không mở browser/tài khoản thật của bạn; không gửi bài hoặc AI thật.

| Phép đo | Kết quả | Ý nghĩa |
|---|---:|---|
| Website thật: nhận byte đầu `/`, 5 lượt | Trung vị **252 ms**, khoảng 243–590 ms | Trong các lượt này server không mất vài giây để trả trang |
| Website thật: `/welcome`, 5 lượt | **244 ms**, khoảng 237–253 ms | Chưa chứng minh Vercel/cold start là nguyên nhân chính |
| Website thật: `/today`, 5 lượt | **242 ms**, khoảng 233–350 ms | Đây là thời gian HTTP, không phải lúc bấm học được |
| Local: trang chào, 5 lượt | LCP **2,91 giây**, khoảng 2,88–3,18 giây | Vượt mục tiêu dự án 2,5 giây trong profile này |
| Local: Hôm nay, 5 lượt | Nội dung chính **0,96 giây**; thư viện dùng được **3,59 giây** | Nhìn thấy trang sớm chưa đồng nghĩa app đã sẵn sàng |
| Local: Chơi & học, 5 lượt | Nội dung chính **1,02 giây**; nút trò chơi dùng được **3,64 giây** | Thời gian chờ JavaScript/mở thư viện là điểm cần sửa |
| Local: API đăng nhập cố tình chậm 3 giây | Trò chơi sẵn sàng sau **6,62 giây** | Tái hiện việc mạng kiểm đăng nhập làm chậm cả thư viện |
| Local: đăng nhập 3 giây rồi mở cloud 3 giây | Sẵn sàng sau **9,16 giây** | Hai bước đang chờ nối tiếp; đây là fixture, không phải đo Supabase thật |

Profile local: Chromium 156.0.8078.4 trên máy macOS, viewport 360×800, CPU chậm 4 lần; mạng giả lập 150 ms, tải 200.000 byte/giây (~1,6 Mbps). Mỗi lượt dùng browser context mới, cache HTTP tắt, 20 từ mẫu; server local không đại diện Vercel. Phiên bản browser/host đầy đủ trong JSON bằng chứng. “Sẵn sàng” đo bằng nội dung thư viện/nút đã bật, gồm thời gian chờ browser automation, không phải field INP.

JavaScript khai báo trong HTML website thật tổng **343,4 KiB nén**, nhưng có **38,9 KiB dành cho browser cũ**. Phần khai báo cho browser hiện đại khoảng **304,5 KiB**; browser local thực tải khoảng **302–305 KiB**. Vì vậy không nên gọi toàn bộ 343 KiB là tải bắt buộc trên điện thoại mới. Mức này chỉ vượt nhẹ budget 300 KiB, nhưng việc trang chào phải khởi tạo cả phần app làm các nút phải chờ.

Font local khoảng **98,7 KiB**, nằm trong budget 150 KiB. Page transfer local khoảng 435–445 KiB, dưới 1 MiB; chưa gồm đầy đủ tải nền của service worker. CLS tối đa 0,051, dưới 0,1. Không có dữ liệu người dùng thật để kết luận INP hoặc p75: PageSpeed API thử một lần trả **429**, không lấy được Lighthouse/CrUX. Không có “điểm tốc độ 100” hay before/after sau tối ưu trong báo cáo này.

## 3. Vì sao cảm thấy tải chậm, sửa thế nào?

| Nguyên nhân | Bằng chứng | Cách sửa đề xuất |
|---|---|---|
| Thư viện chờ kiểm đăng nhập rồi chờ mở cloud | `provider.tsx`; fixture chậm kéo thời gian sẵn sàng lên 6,62/9,16 giây | Một nguồn trạng thái đăng nhập chung; cache đúng user và mở dữ liệu đã xác định chủ sở hữu, xác minh/đồng bộ nền; không hiện nhầm tài khoản cũ |
| Kiểm đăng nhập lặp | Header và provider gọi cùng `/api/auth/status`; quan sát **2 request** khi mở app mới | Chia sẻ request/kết quả giữa header, provider, profile; vô hiệu hóa cache khi đổi user/logout; không cần cài SWR chỉ để giải quyết một request |
| Trang chào dùng chung phần code với Hôm nay và root provider | `/welcome` import `Welcome` từ file chứa Today; root luôn có provider/cloud | Tách component/trang chào riêng, tách app layout; chỉ nạp repository/cloud/game ở phần cần dùng. Đo lại bundle, không đoán trước giảm được bao nhiêu |
| Cáo bị tạo lại sau khi trang đã hiện | `Image key={wave}`; trace có hai ảnh/node khác nhau, cùng ảnh đã tải xong ~402 ms | Giữ nguyên node ảnh, chạy chuyển động trên khung/class; vẫn có chào và replay, vẫn tôn trọng reduced motion |
| `/` phải chờ JavaScript rồi chuyển `/welcome` | Website trả 200 có `NEXT_REDIRECT`; local thấy request `/welcome` sau ~3,1 giây. Một lượt hoàn tất tới trang chào **3,88 giây** | Chuyển hướng HTTP trước khi gửi app shell, hoặc phục vụ trực tiếp trang chào; giữ URL/SEO đúng. Chưa coi một lượt là trung vị/đảm bảo giảm 1 giây |
| Mọi trang bị dựng động, HTML không cache | `layout.tsx` bật `force-dynamic`; website trả `no-store`, `x-vercel-cache: MISS` | Cho trang chào/public shell tĩnh; auth/API/dữ liệu riêng vẫn private. **Không cache HTML riêng của user lên CDN** |
| Cài offline bắt đầu ngay sau JavaScript | 43 request public từ service worker trong lượt local | Có thể dời tải không thiết yếu sau lúc app sẵn sàng, hoặc chia nhóm nhỏ; phải giữ offline. Một phép đối chiếu chặn SW chưa cho thấy đây là nguyên nhân lớn nhất |

Phép đối chiếu riêng với lời chào tự động: 3 lượt bình thường LCP trung vị **2,93 giây**; 3 lượt đặt trạng thái “đã xem lời chào” LCP **0,97 giây**. Thời gian nút sẵn sàng vẫn khoảng **2,8 giây**. Đây là bằng chứng ảnh bị tạo lại làm LCP muộn; **chỉ sửa animation sẽ chưa giải quyết hết việc chờ bấm**. Chưa sửa source để đạt số thứ hai.

Hình SVG Cáo chỉ khoảng 630 byte nén trong lượt đo, tải xong rất sớm; không có lý do đổi hình sang ảnh nặng hoặc bỏ mascot. Bộ Speaking 377 MB **không được tải lúc mở các trang đã đo**, nên không phải nguyên nhân của các lượt này.

## 4. Lỗi đồng bộ: nguyên nhân và hành vi cần chốt

Ảnh bạn gửi cho thấy thư viện tài khoản đang mở, 13 từ riêng trên máy và số cloud bằng 0. Bài khách trước đây chưa tự chuyển là một khả năng; bộ đếm cloud trên profile cũng chỉ lấy lúc mở/refresh và có thể cũ. **Ảnh này chưa đủ chứng minh mọi thao tác mới bị mất trên database**; chưa đọc database thật của mobile.

Nhưng source và fixture xác nhận các vấn đề sau:

- **Thiết bị từng chọn guest vẫn có thể lưu guest sau đăng nhập.** Provider chỉ tự mở account khi chưa có lựa chọn. Fixture: tạo lựa chọn guest → mô phỏng đăng nhập → mở lại app; header gọi kiểm đăng nhập nhưng **không có request mở thư viện cloud**. Đây là lỗi rõ so với yêu cầu mới.
- **Mạng lỗi khi mở cloud có thể đổi lựa chọn lưu sang guest một cách bền vững.** Người dùng có thể tiếp tục thêm bài nhưng bài đi vào nơi khác. Phải giữ scope tài khoản và hàng đợi; không đổi nơi lưu để che lỗi mạng.
- **Sync hiện chỉ chạy cho repository account.** Bài ghi vào guest sẽ không tự lên cloud dù header báo đã đăng nhập.
- **Gửi chờ 3 giây, nhận thường chờ vòng kiểm tra 30 giây.** Chưa có Realtime subscription. Chưa đáp ứng thiết bị đang mở thấy thay đổi ngay.
- **Tên/avatar tự chọn hiện nằm trong localStorage**, ngoài danh sách cloud. Nếu muốn “bất cứ thay đổi gì” giống nhau trên mọi máy, phải đưa cả hồ sơ/tùy chọn học phù hợp vào tài khoản.
- **Sync quét nhiều bảng và băm lại dữ liệu**, pull còn dựng lại toàn bộ chỉ mục tìm kiếm. Đây là rủi ro với thư viện lớn; chưa có benchmark đủ để nói 13 từ gây chậm vì việc quét.

Hành vi đề xuất triển khai đúng yêu cầu:

| Trạng thái | App phải làm |
|---|---|
| Chưa đăng nhập | Lưu bài trên thiết bị; dùng app được |
| Đăng nhập thành công | Tự mở đúng thư viện user; các thao tác mới tự gửi lên, không cần chọn nơi lưu |
| Có bài khách cũ | Hỏi một lần “Sao chép bài trên máy vào tài khoản này?”; đồng ý thì sao chép chống trùng, từ chối thì giữ nguyên bài cũ. **Cả hai lựa chọn đều không ngăn bài mới lưu vào account** |
| Cùng user trên máy khác | Tự lấy dữ liệu khi mở; đang mở thì tự nhận thông báo thay đổi, cập nhật UI và bộ đếm |
| Mất mạng/lỗi server | Giữ thay đổi chờ gửi trong vùng của account đó, báo “Đang chờ lưu”; có mạng tự gửi, không lưu nhầm guest/không báo đã lên cloud trước ACK |
| Logout/đổi user | Dừng request/kênh của user cũ; không đưa hàng đợi hoặc nội dung sang user mới |

Đề xuất chọn **Supabase Realtime private Broadcast** báo phiên bản thay đổi, dùng API sync/cursor hiện có để đọc dữ liệu có kiểm quyền. Thiết bị ghi dùng hàng đợi bền, gửi ngay sau thao tác hoàn tất và gom burst ngắn; server xác nhận rồi thiết bị khác tự pull phần mới. Chỉ mục tìm kiếm cập nhật mục bị đổi; bộ đếm profile cũng tự làm mới. Realtime là tín hiệu, không thay database hoặc bằng chứng đã lưu. Mất thông báo/reconnect vẫn bắt kịp bằng cursor. Không tăng tần suất quét toàn thư viện để giả làm realtime. [Hướng dẫn Supabase](https://supabase.com/docs/guides/realtime/subscribing-to-database-changes).

Kênh chỉ cho đúng owner/library, không broadcast nội dung bài; auth server/HttpOnly hiện tại phải được giữ. Nếu browser cần JWT cho Realtime, thiết kế endpoint kiểm user cấp token ngắn hạn của user, không đưa refresh token/service-role/operator key vào browser; review boundary này trước khi viết SQL. Không dùng policy cho phép mọi người đăng nhập nghe mọi kênh. [Realtime authorization](https://supabase.com/docs/guides/realtime/authorization).

Mục tiêu nghiệm thu đề xuất: hai máy online đang mở, máy B hiện thay đổi **trong 2 giây sau database ACK** trong profile kiểm thử đã chốt. Đây là mục tiêu cần đo, không hứa 0 giây hoặc realtime khi mất mạng. Lỗi quota/kết nối phải được báo và tự phục hồi có giới hạn; không tự mua quota.

Về “localStorage”: hiện bài, ảnh và quan hệ bài học dùng **IndexedDB**, còn localStorage dành cho cấu hình nhỏ. Đề xuất giữ IndexedDB để tránh giới hạn dung lượng/lưu ảnh của localStorage. Điều này vẫn là “bài khách lưu trên máy”; không chuyển dữ liệu cũ sang localStorage trong lượt báo cáo. Nếu bạn yêu cầu đúng API localStorage, đó là thay đổi kỹ thuật riêng cần xét dung lượng, không nên gộp vào sửa đồng bộ.

Phạm vi cần cùng user: từ/nghĩa/ví dụ/IPA/câu/grammar/nhóm/bộ theo ngày/ảnh minh họa đã duyệt/ghi chú/lịch ôn và tiến độ/tên-avatar. Key AI riêng, bộ model và bản thu mic tạm vẫn theo các quy tắc lưu riêng đã chốt trước đó; ảnh gốc vẫn theo lựa chọn gửi ảnh của người dùng. Cần kiểm lại từng kiểu dữ liệu, không chỉ test thêm một từ.

## 5. Thứ tự làm và cách xác nhận

1. **Sửa lưu đúng tài khoản:** state đăng nhập quyết định scope; bỏ chuyển mutable guest khi đã đăng nhập; migration guest hỏi một lần và giữ bản gốc. Test hai tài khoản, reload, revoke/logout, offline, thêm/sửa/xóa mọi loại dữ liệu, chống trùng và retry không gửi hai lần.
2. **Đồng bộ không cần nút:** nối Realtime/cursor, ACK trạng thái, tự cập nhật UI/bộ đếm, đổi scope hủy request; test hai browser fixture độc lập và SQL RLS local. Áp dụng migration thật do founder kiểm soát, chưa thực hiện trong lượt này.
3. **Rút ngắn tải:** shared auth check; dùng đúng cache account; public welcome tĩnh/nhẹ và redirect sớm; giữ node ảnh Cáo. Không thay giao diện trẻ em bằng trang trống chỉ để có số đẹp.
4. **Đo lại cùng profile:** 5 lượt cold/route, thêm warm/navigation; báo LCP và thời gian dùng được, bytes, CLS; test mạng lỗi. Sau đó founder kiểm điện thoại thật/cùng account. Field p75/INP cần dữ liệu riêng, không suy từ lab.

Budget dự án giữ nguyên: LCP ≤2,5 giây; JS đầu ≤300 KiB gzip; font ≤150 KiB; page ≤1 MiB; CLS ≤0,1. Không nâng budget để báo pass. Không cài dependency/plugin mới trong lượt điều tra.

## 6. Các skill đã dùng

| Skill | Dùng cho việc gì |
|---|---|
| [performance](../.agents/skills/performance/SKILL.md) + [measurement workflow](../.agents/skills/performance/references/MEASUREMENT.md) | Tách HTTP/field/lab, đo baseline trước sửa, không tối ưu theo cảm giác |
| [core-web-vitals](../.agents/skills/core-web-vitals/SKILL.md) + LCP reference | Phân tích lúc ảnh hiện, trace/CLS, không nhầm nút sẵn sàng với LCP/INP |
| [vercel-react-best-practices](../.agents/skills/react-best-practices/SKILL.md) | Waterfall, request trùng, tách bundle/Welcome, cache đúng phạm vi |
| [supabase-postgres-best-practices](../.agents/skills/supabase-postgres-best-practices/SKILL.md) | Rà luồng cloud và đề xuất Realtime/RLS/owner; không viết/chạy migration thật |
| [vocabulary-delivery](../.agents/skills/vocabulary-delivery/SKILL.md) | Giữ yêu cầu mới, trạng thái/bằng chứng và quyền triển khai của dự án |

## 7. Bằng chứng cho AI tiếp tục

- [HTTP website thật: 5 lượt mỗi route + bytes/cache headers](evaluations/performance-2026-10-11/public-http.json).
- [15 lượt cold local + fixture auth chậm](evaluations/performance-2026-10-11/local-baseline.json). Thí nghiệm `root redirect` cũ trong file này dừng trước khi redirect xong, **không dùng kết quả đó**.
- [Redirect hoàn tất và lỗi guest sau đăng nhập](evaluations/performance-2026-10-11/local-routing.json).
- [3×2 lượt đối chiếu tự chào Cáo](evaluations/performance-2026-10-11/welcome-greeting.json); trace nén trong cùng thư mục.
- Scripts tái lập: `http-probe.py`, `measure-local.mjs`, `measure-routing.mjs`, `measure-greeting.mjs` trong thư mục bằng chứng. Script HTTP đọc public GET; scripts browser chỉ localhost, chặn external/mock API. Không chạy scripts browser lên production.
- Source chính: [root layout](../src/app/layout.tsx), [root redirect](../src/app/page.tsx), [provider](../src/components/app/provider.tsx), [profile header](../src/components/features/profile.tsx), [Welcome/Today](../src/components/features/today.tsx), [cloud background](../src/components/app/cloud-background.tsx), [sync engine](../src/data/cloud/sync.ts), [account UI](../src/components/features/account.tsx), [cloud contracts](../src/lib/cloud/contracts.ts), [index rebuild](../src/data/local/database.ts), [service worker](../scripts/sw.template.js).
- Tài liệu chính thức: [Next.js caching](https://nextjs.org/docs/app/guides/caching-without-cache-components), [production checklist](https://nextjs.org/docs/app/guides/production-checklist), [LCP breakdown](https://web.dev/articles/optimize-lcp). Các đề xuất source/layout cần kiểm build/boundary; không áp cache public lên dữ liệu riêng.

Lệnh đã chạy: `pnpm build` PASS; `node --check` cho3script browser và Python AST cho HTTP probe PASS; `python3 scripts/validate_docs.py` PASS (534links); `git diff --check` PASS. Scripts đo đã chạy và tạo JSON/trace ở các link trên. Không chạy full test suite vì không đổi code app. Chưa sửa tính năng, deploy, database/env/quota, chuyển 13 bài thật, đo browser production có đăng nhập, điện thoại thật hoặc test realtime thật. **Các cách sửa ở trên là đề xuất để review, chưa phải kết quả đã tối ưu.**


## 8. Những việc đã sửa sau review12/10

Welcome/404 không kéo thư viện/auth/game nữa; learning layout riêng, HTTP redirect sớm, Cáo giữ cùng Image. Auth status dùng chung, không biến lỗi auth thành guest. Account luôn thắng lựa chọn local cũ, background after-commit/private notification/cursor pull tự chạy; preference tên/avatar cũng queue theo owner. Guest vẫn giữ, optional copy có preview/backup/confirm/dedup. Tải model chỉ Settings, không tự tải và không tăng phí dịch vụ.

Bằng chứng hai thiết bị là browser fixtures dùng SDK Realtime thật với WebSocket/HTTP giả lập, **không chứng minh SQL/hosted đã áp**. Migration được chuẩn bị nhưng chưa thực thi ở hosted. [Source migration](../supabase/migrations/202610110007_realtime.sql), [learning layout](../src/app/%28learning%29/layout.tsx), [Welcome](../src/components/features/welcome.tsx). Skills trong mục6 giữ nguyên; thêm [Impeccable](../.agents/skills/impeccable/SKILL.md) cho Speaking/khung âm theo ảnh founder và [bilingual-learning-content](../.agents/skills/bilingual-learning-content/SKILL.md) cho lời sửa âm. Không cài skill/plugin mới.
