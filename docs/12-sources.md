# Nguồn đã kiểm tra

Ngày 09/10/2026. Nội dung có thể thay đổi; pin SDK/model/dependencies khi triển khai và xác minh lại trang liên quan. Nguồn GitHub skill + commit đã tải nằm ở `skills/CATALOG.md` và `skills/skills-lock.json`.

## Tài liệu kỹ thuật primary

| Nguồn | Áp dụng vào kế hoạch | Điều không suy ra từ nguồn |
|---|---|---|
| [OpenAI — Images and vision](https://developers.openai.com/api/docs/guides/images-vision) | API nhận ảnh và các giới hạn vision; pipeline review | Không bảo đảm OCR chữ viết tay đúng hoặc giá hiện tại |
| [OpenAI — Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | Output có schema, object đóng và adapter validation | Schema hợp lệ không bảo đảm nghĩa/grammar chính xác |
| [Codex — Build skills](https://learn.chatgpt.com/docs/build-skills) | Skill bundles, progressive disclosure và project discovery | Không chứng minh catalog của phiên đang chạy đã reload |
| [Google Antigravity — Agent skills](https://antigravity.google/docs/skills) | `.agents/skills` workspace và compatibility `.agent/skills` | Chưa kiểm IDE user thật; từng surface/version có thể khác |
| [Supabase — Sign in with Google](https://supabase.com/docs/guides/auth/social-login/auth-google) | Google auth config và callback | Login không đồng nghĩa tự merge guest library |
| [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security) | RLS/grants, owner isolation, service-role server-only | RLS phải viết/test; chọn Supabase không tự làm mọi bảng an toàn |
| [Dexie — Constructor and schema](https://dexie.org/docs/Dexie/Dexie) | IndexedDB wrapper, schema/index/migrations | Không dùng Dexie Cloud; Supabase sync vẫn phải triển khai riêng |
| [MDN — getUserMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) | Camera permissions và secure context | Không bảo đảm camera mọi thiết bị hoạt động như nhau |
| [MDN — Storage quotas and eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) | Backup/quota/persistence và lỗi storage | Không được hứa guest data lưu vĩnh viễn |
| [MDN — SpeechSynthesis](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) | Device voices, voiceschanged, cancel và playback | Không bảo đảm voice EN sẵn/offline/đồng nhất mọi máy |
| [Motion — Accessible animations](https://motion.dev/docs/react-accessibility) | Reduced motion và accessible animation | Vẫn cần static view, keyboard và QA thiết bị |
| [shadcn/ui — Next.js installation](https://ui.shadcn.com/docs/installation/next) | Component setup khi scaffold | Version/toolchain phải chốt lại ở T01 |
| [Serwist — Next integration](https://serwist.pages.dev/docs/next) | Ứng viên service worker PWA | Cần xác minh tương thích và caching policy theo Next version |
| [naptha/tesseract.js](https://github.com/naptha/tesseract.js) | OCR local/browser worker ứng viên P2 | Không là grammar engine hoặc cam kết đọc mọi chữ viết tay |
| [web.dev — Core Web Vitals](https://web.dev/articles/vitals) | LCP ≤2,5 s/INP ≤200 ms/CLS ≤0,1 ở field p75, lab/field distinction | Ngưỡng không có nghĩa app đã đạt; cần samples/profile |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Local design/UX search cho T18/T02 | Kết quả có thể không fit vocabulary product; đã narrow retry và ghi fallback |
| [mblode — agent-skills](https://github.com/mblode/agent-skills) | product-design và ui-animation, interaction/recovery/motion | Hướng dẫn community, không thay human test |
| [Addy Osmani — web-quality-skills](https://github.com/addyosmani/web-quality-skills) | performance/core-web-vitals/accessibility và measurement workflow | Chưa có app để đo score hoặc chứng minh improvement |
| [InspoMCP — setup](https://inspomcp.dev/mcp), [source](https://github.com/Nutlope/inspo) | MCP visual research, đã cài bản npm 0.1.16 local cho Codex | CLI trên máy không hỗ trợ HTTP installer default; app discovery cần reload; không tự cấu hình Antigravity |

Mẫu Inspo được chọn có source/date/capture links và adopt/adapt tại `design/inspo-research.md` + `design/inspo-references.json`; founder có mô tả độc lập trong KE-HOACH-FOUNDER. Thực hiện HTTP calls metadata và browser viewing, không test app nguồn hoặc sao chép brand/assets.

## Research record

Nguồn skill được kiểm thêm bằng GitHub API repository metadata, recursive tree, commit endpoint, raw SKILL/license và tải bundle qua helper skill-installer. Các SHA/commit dates trong lock là phiên bản đã đóng gói, không chỉ một link `main` có thể đổi.

Các đề xuất về thời lượng animation, số ảnh/ngày, SRS, batch size, timeout, TTL và performance targets là quyết định thiết kế của dự án. Chúng không phải hạn mức hay giá được vendor cam kết. Không có live AI calls hoặc learner study đã thực hiện ở lượt planning.

## Media/concurrency và child-provider research — 09/10/2026

| Nguồn primary | Dùng cho | Giới hạn |
|---|---|---|
| [Openverse auth/throttling](https://docs.openverse.org/api/reference/authentication_and_throttling.html) | Adapter/quota metadata search | Curl probe trả JSON; chưa verify ảnh hoặc source license, không hứa quota vô hạn |
| [Commons reuse](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia) | License/attribution/derivative theo file | Không quyền tự lấy mọi ảnh |
| [OpenMoji FAQ](https://github.com/hfg-gmuend/openmoji/blob/master/FAQ.md) | Cartoon/icon curated subset, CC BY-SA 4.0 | Không tự map mọi nghĩa vào emoji; credit và bản sửa giữ license |
| [Node worker threads](https://nodejs.org/api/worker_threads.html), [MDN Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) | CPU-vs-I/O, tránh block UI | Chưa đo app; không hứa worker tăng tốc provider |
| [Gemini terms](https://ai.google.dev/gemini-api/terms), [pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits), [API keys](https://ai.google.dev/gemini-api/docs/api-key) | Child-directed restriction, image free unavailable, project quotas, server-only keys | Không bật Gemini cho child app bằng parent key; model/quota xác minh lại trước integration |
| [mcollina/skills](https://github.com/mcollina/skills/tree/main/skills/node) | Skill node async/performance/caching | Pin SHA+license/19 resources trong lock; demo synthetic không live eval |

SkillMedev stock-photo-finder/API/visual-asset-curation/image-license-rights đã khảo sát, chưa cài: photo/landing defaults không fit brief và một số legal assertions quá rộng. Source-specific terms và pipeline 14 là authority cho media, không community summary.
