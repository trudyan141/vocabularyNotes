# Mobile UX và tiêu chí chọn skill — ADR078

Founder12/10/2026 yêu cầu UX/UI đẹp như app mobile thực thụ. Agent đã chọn sai `mobile-responsive`: chủ yếu viewport/overflow, nguồn chỉ2stars/0forks. Đã bỏ gói và entry lock/catalog; ADR076 còn là lịch sử, không còn hướng dẫn dùng skill này.

## Chính sách nguồn

Ưu tiên nguồn uy tín, nổi tiếng, nhiều sao, có tín hiệu cộng đồng sử dụng rộng và maintainer rõ. Trước khi lấy: kiểm GitHub chính chủ, stars/forks, hoạt động gần đây, license, nội dung SKILL/references thực tế, stack và phạm vi yêu cầu. Không chọn nguồn ít sao/ít người dùng cho yêu cầu này. Không tự đặt một ngưỡng sao thành yêu cầu founder; popularity phải đi cùng chất lượng/nội dung phù hợp. Stars/forks là tín hiệu cộng đồng, không chứng minh số installs/người dùng hoạt động hay UX pass.

Không cài gói trùng khi nguồn phù hợp đã có; pin commit/checksum, repo-local, không chạy installer/hook upstream hoặc đổi global/runtime chỉ vì skill. Skill không mở rộng quyền browser/AI/deploy. Responsive-only không đáp ứng yêu cầu thiết kế app mobile.

## Nguồn đã kiểm12/10/2026

Public GitHub REST metadata và trang/references upstream, không dùng tài khoản founder. Các số là snapshot, sẽ thay đổi.

| Nguồn | Stars / forks | Kết luận |
|---|---:|---|
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 134.820 / 14.332 | Chọn làm nguồn chính mobile UX. MIT, active10/10; có touch/navigation/forms/typography/motion/safe-area và stack Next.js. Đã cài/pin, không cài thêm bản trùng. |
| [Expo skills](https://github.com/expo/skills), [Expo docs](https://docs.expo.dev/skills/) | 2.742 / 167 | Nguồn chính thức Expo, MIT, active07/10; mạnh về triển khai native/Expo. Không chọn để đổi PWA sang Expo. |
| [Agentic Awesome Skills](https://github.com/sickn33/agentic-awesome-skills) | 47.470 / 6.918 | Community collection, không phải Google official. Đã đọc mobile-design: nhiều chỉ thị RN/Flutter/cert-pinning/memoization và score gate không phù hợp PWA; không cài vì chỉ có nhiều sao. Sao của collection không phải riêng mobile-design. |
| [Mobile Responsive](https://github.com/AsadSumbul/mobile-responsive) | 2 / 0 | Responsive-only, active gần nhất28/05; không đáp ứng yêu cầu. Đã gỡ. |

UI/UX Pro Max hiện giữ pin `1a2c459b35f26116fd165b0a0f30597f252749ff` (08/10/2026), license/checksums tại [lock](skills-lock.json). Đây là đổi nguồn ưu tiên và routing mobile, không claim cài mới skill đã có.

## Cách dùng để thiết kế như app mobile

Đọc [SKILL](../../.agents/skills/ui-ux-pro-max/SKILL.md), [quick-reference](../../.agents/skills/ui-ux-pro-max/references/quick-reference.md), phần app phù hợp trong [pro-rules](../../.agents/skills/ui-ux-pro-max/references/pro-rules.md). Kết hợp [Impeccable](../../.agents/skills/impeccable/SKILL.md) cho hierarchy/layout/color/type. Project truth vẫn là [design source](../04-design-and-motion.md), không tạo design-system source cạnh tranh.

- Thiết kế flow/hierarchy trước: một primary action rõ theo state; list→detail→back có định hướng, bộ lọc gọn, options phụ disclosure theo nhu cầu.
- Điều hướng/tab bar liên tục, selected state rõ; safe-area và content inset, không che nút cuối hoặc focus khi keyboard mở. Không tự đổi số nav đã chốt.
- Touch target rộng, icon cùng họ, phản hồi press/pending/success/fail rõ mà không nhảy layout. Native gestures chỉ là tham khảo, giữ visible controls và hỗ trợ keyboard.
- Typography/spacing/card cùng hệ thống Theme C/Nunito; minh họa dễ thương hợp trẻ, không bê font SF Pro/Roboto hoặc style native khác vào từng màn.
- Form ngắn, keyboard phù hợp, một Save theo flow, giữ dữ liệu khi lỗi, error tại field/nút theo steering no-toast. Empty/loading/offline có trạng thái và action có ích.
- Motion giải thích hành động/grammar, có static/reduced-motion; dùng web CSS/React hiện có, không chạy AI HTML/JS hoặc thêm native runtime.

Với PWA, chuyển pt/dp guidance thành vùng chạm CSS phù hợp; không sao chép API native, haptics, dark-mode mandate hay checklist release toàn bộ khi task không cần. Kiểm vài state chính/lỗi tại mobile và desktop cô lập theo ADR050 khi thực sự sửa UI; cài skill không chứng minh UI đã đẹp/human pass.

## Rà soát toàn bộ skill của project — 12/10/2026

Đã kiểm inventory17skill còn ở repo khi bắt đầu, ngoài mobile-responsive đã gỡ. Đọc frontmatter/SKILL và references theo phạm vi; đối chiếu nguồn chính chủ, maintainer public, trạng thái archived, ngày push, license tại pin và community signal. Snapshot REST đầy đủ tại [source-audit-2026-10-12.json](source-audit-2026-10-12.json). Đây là kiểm nguồn/fit và integrity, không phải audit bảo mật toàn bộ mọi script hay đo người dùng thực.

| Skill đã rà soát | Maintainer / nguồn chính chủ | Stars / forks của repo | Push gần nhất | Quyết định và phạm vi phù hợp |
|---|---|---:|---|---|
| ui-ux-pro-max | [NextLevelBuilder](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 134.820 / 14.332 | 10/10/2026 | Giữ; nguồn chính UX app mobile, có navigation/touch/form/safe-area + Next.js. MIT. Recommendation landing/native chỉ áp khi phù hợp PWA. |
| impeccable | [Paul Bakaus](https://github.com/pbakaus/impeccable) | 79.870 / 4.751 | 11/10/2026 | Giữ; shape/operate, layout/distill/type/color, feedback/states và animate; Apache-2.0 + NOTICE. Theme C và product truth ưu tiên hơn default của skill. |
| frontend-design | [Anthropic chính thức](https://github.com/anthropics/skills) | 180.508 / 21.397 | 09/10/2026 | Giữ; visual direction/typography/craft. Apache-2.0 tại thư mục skill đã pin; license metadata của cả collection là null, không suy license cho mọi sibling. |
| motion-design | [LottieFiles chính thức](https://github.com/LottieFiles/motion-design-skill) | 2.116 / 132 | 18/05/2026 | Giữ; MIT, timing/easing/choreography và reduced motion độc lập framework. Repo không archived; ít cập nhật hơn các nguồn khác, dùng nguyên lý ổn định, không dựa vào nó cho API mới. |
| product-design | [mblode](https://github.com/mblode/agent-skills) | 144 / 13 | 10/10/2026 | Gỡ; MIT và nội dung interaction có ích nhưng community signal chưa đạt brief nguồn nổi tiếng. Thay routing bằng UI/UX Pro Max + Impeccable shape/operate; giữ quyết định sản phẩm cũ. |
| ui-animation | [mblode](https://github.com/mblode/agent-skills) | 144 / 13 | 10/10/2026 | Gỡ; thay bằng LottieFiles motion-design + Impeccable animate và animation references của UI/UX Pro Max. Không chuyển helper video sang repo khác để giữ skill đã gỡ. |
| vercel-react-best-practices | [Vercel chính thức](https://github.com/vercel-labs/agent-skills) | 32.241 / 2.823 | 28/08/2026 | Giữ; render/data fetching React/Next. MIT được khai báo trong SKILL; pin không có LICENSE standalone, giữ provenance notice và giới hạn này. |
| supabase-postgres-best-practices | [Supabase chính thức](https://github.com/supabase/agent-skills) | 2.753 / 225 | 02/10/2026 | Giữ; MIT, schema/RLS/index/concurrency đúng backend của app. Không phải nguồn thiết kế mobile. |
| performance | [Addy Osmani](https://github.com/addyosmani/web-quality-skills) | 2.930 / 254 | 24/08/2026 | Giữ; MIT, resource/render/runtime budgets và đo trước/sau. Không tự thêm runtime hay claim performance pass từ checklist. |
| core-web-vitals | [Addy Osmani](https://github.com/addyosmani/web-quality-skills) | 2.930 / 254 | 24/08/2026 | Giữ; MIT, LCP/INP/CLS; phạm vi metric riêng so với performance, không chạy mọi audit cho sửa nhỏ. |
| accessibility | [Addy Osmani](https://github.com/addyosmani/web-quality-skills) | 2.930 / 254 | 24/08/2026 | Giữ; MIT, semantics/focus/keyboard/contrast; kiểm access đúng phần đổi, không thay thử UX với trẻ. |
| node | [Matteo Collina](https://github.com/mcollina/skills) | 1.950 / 148 | 05/10/2026 | Giữ; MIT, async bounded I/O/cancel/cache/concurrency phù hợp14. Không áp native-TS defaults để đổi toolchain Next. |
| filesystem-context | [Murat Can Koylan](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 18.107 / 1.496 | 01/10/2026 | Giữ; MIT, targeted retrieval/file handoff; dùng ledger docs/ai có sẵn, không chạy cleanup demo upstream tùy ý. |
| context-compression | [Murat Can Koylan](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering) | 18.107 / 1.496 | 01/10/2026 | Giữ; MIT, summary cho phiên dài; khác retrieval. Không hứa chống mất context tuyệt đối. |
| worksheet-extraction | Skill riêng Words for Kids | Không áp dụng | Repo-local | Giữ; evidence/review/dedup/provider adapters theo06/07/09. Không gán stars của repo ngoài. |
| bilingual-learning-content | Skill riêng Words for Kids | Không áp dụng | Repo-local | Giữ; EN–EN/EN–VI/whole-sentence IPA/grammar và child-first theo04/07/08. |
| vocabulary-delivery | Skill riêng Words for Kids | Không áp dụng | Repo-local | Giữ; dependency/acceptance/STATE/TASKS/handoff theo docs/ai. |

Sau rà soát còn **15skill:12upstream +3custom**. mobile-responsive không còn directory/entry lock. product-design/ui-animation đã xóa cả bundle sau khi xác nhận toàn bộ file đúng checksum, không có thay đổi local cần giữ. Các rule IDs/prototype/evaluation cũ được giữ như trace lịch sử, active routing/docs nguồn dùng bộ thay thế ở trên. Các skill global/bundled của Codex không thuộc inventory project và không bị sửa.

## Quy tắc cho lần thêm skill tiếp theo

Quy tắc nguồn uy tín/nổi tiếng/nhiều sao/cộng đồng lớn áp dụng cho **mọi skill upstream mới**. Trước khi thêm phải ghi bằng chứng source/maintainer, snapshot stars/forks, activity/archived, license đúng path/pin, phần SKILL/references thực tế giải quyết task và stack fit vào docs/skills. Không có evidence đủ thì không thêm. Popularity ở collection phải ghi đúng cấp repo, không suy ra riêng skill hay số active users. Không thêm skill trùng chức năng khi nguồn phù hợp đã có. Skill riêng dự án được ghi rõ custom để thể hiện các quy tắc sản phẩm mà upstream không bao phủ.

Routing thay thế không cần cài gói mới: UI/UX Pro Max, Impeccable và LottieFiles đã có/pin đủ references. Hướng dẫn interaction dùng UI/UX Pro Max quick-reference phần8/9 và Impeccable shape/operate/harden; motion dùng LottieFiles + Impeccable animate, kiểm interruption/reduced-motion theo reference UI/UX Pro Max. Giữ Next.js/PWA, Theme C, Nunito và mascot.

## Kiểm tra lượt này

Chỉ gỡ skill và cập nhật policy/routing/docs, không sửa app. `PATH=/Users/trunglk/.nvm/versions/node/v24.14.1/bin:$PATH pnpm docs:check` PASS:683local links,15skills/317resources,48JSON; `git diff --check` PASS. JSON parse/integrity/link check, không schema-validation. Lần gọi pnpm ban đầu bị engine guard từ Node23.11.0; rerun bằng Node24.14.1 sẵn có đã qua.3file cache Python có sẵn được chuyển ra thư mục tạm của hệ thống, giữ bản gốc; không sửa nội dung skill đã pin. Không cần lint/build/E2E vì không thay runtime/UI.

Kiểm lại khi bàn giao sau thay đổi ADR079 ở workspace: integrity15skills/317resources PASS,3directory đã gỡ không tồn tại. `pnpm docs:check` hiện FAIL chỉ2link ngoài scope từ04/DECISIONS tới evaluations/two-learning-types.md chưa có; lượt PASS683links ở trên là checkpoint trước các link ADR079 này. Không tạo evidence giả cho feature khác để làm check xanh.
