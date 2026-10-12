# Skill đã tìm, chọn và đóng gói

12/10 — ADR078: bỏ `mobile-responsive` (2 sao, responsive-only), `product-design` và `ui-animation` (nguồn mblode144sao/13forks); dùng UI/UX Pro Max đã pin làm nguồn chính thiết kế mobile, Impeccable hỗ trợ visual polish. Tiêu chí nguồn uy tín/nhiều sao/cộng đồng lớn và cách dùng mobile: [Mobile UX và chọn nguồn skill](MOBILE-UX.md). Không cài lại bản trùng hoặc đổi stack sang Expo.

Ứng dụng cụ thể mới: `node` đã cài project-local pin commit và chạy `scripts/demo_media_concurrency.mjs` với timer giả lập (không gọi AI). Stock/photo finder/API/curation/license của SkillMedev đã đọc nhưng chưa cài: ưu tiên photo/landing chưa phù hợp trẻ; một số diễn giải rights quá rộng, không dùng thay license chính thức. Giữ bộ nhỏ, dùng pipeline 14 với nguồn primary. Skill mới có thể hiện trong catalog IDE từ lượt/chat tiếp theo; hiện đọc trực tiếp SKILL trong repo được. Tên app đổi, ba custom skill giữ invocation ổn định và đã sửa nội dung/lock.

Rà soát lại toàn bộ nguồn ngày **12/10/2026**. Có **15 skill trong repo: 12 upstream + 3 riêng dự án**, đã bổ sung theo yêu cầu UX/UI/animation/performance. Commit/checksum chính xác ở [skills-lock.json](skills-lock.json). InspoMCP là công cụ nghiên cứu riêng, không tính vào số skill.

Skill là hướng dẫn cho coding agent. OCR/vision, storage, animation và audio trong app vẫn là code/runtime/API phải triển khai. Không có skill nào bảo đảm model đọc đúng ảnh hay nghĩa tiếng Việt.

## 13 skill GitHub đã cài theo project

**12/10 — Bổ sung theo yêu cầu founder:** [systematic-debugging](../../.agents/skills/systematic-debugging/SKILL.md) từ `obra/superpowers`, MIT, pin `bb92a77741419a4ab5f06e711a283343f1ada0c3`. Dùng cho bug/test failure, không mỗi task docs/text. [Review nguồn, community signals và project overrides](WORKFLOW-SKILL-REVIEW.md). Current inventory **16 skills = 13 upstream + 3 custom**; các mốc 15 skills trong evaluation cũ là lịch sử. Giữ vocabulary-delivery/context skills hiện có; không cài cả Superpowers hoặc siblings/hooks.

| Thư mục / invocation | Nguồn | Vai trò và task | License / ghi chú |
|---|---|---|---|
| `node` **mới** | [mcollina/skills](https://github.com/mcollina/skills/tree/main/skills/node) | Bounded async concurrency, cancellation, cache/in-flight dedup, CPU-vs-I/O; T05/T07/T14 theo 14 | MIT, root LICENSE giữ; Next toolchain/spec ưu tiên hơn native-TS mặc định của skill |
| `impeccable` **mới, theo yêu cầu founder** | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | T18/T02: distill/layout/colorize/typeset, bỏ chi tiết thừa, hierarchy/màu/font; đã chạy context + detector và sửa prototype | Apache-2.0 + NOTICE; pin `d631a8827f99414d2b6daba4ef08b7f8701751d7`, skill 4.5.2; không cài hook/global config |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | Visual direction, typography, layout, UI critique; T02/T06/T07 | Apache-2.0, LICENSE.txt đi kèm |
| `motion-design` | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill/tree/main/skills/motion-design) | Timing/easing/choreography; T02/T08/T12 | MIT; nguyên lý motion, không bắt dùng runtime Lottie |
| `supabase-postgres-best-practices` | [supabase/agent-skills](https://github.com/supabase/agent-skills/tree/main/skills/supabase-postgres-best-practices) | Schema/index/constraints/RLS/concurrency; T10/T11 | MIT, LICENSE upstream được giữ |
| `react-best-practices` / **`vercel-react-best-practices`** | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices) | React/Next performance, loading/rendering; T02/T07/T13 | MIT theo frontmatter SKILL; nguồn không có LICENSE standalone tại commit đã pin, xem provenance notice |
| `filesystem-context` | [Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/filesystem-context) | Context trên file, targeted retrieval; handoff dài | MIT; dùng docs/ai thay vì tạo ledger mới |
| `context-compression` | [Context Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering/tree/main/skills/context-compression) | Summary giữ decisions/files/next action khi compaction | MIT; không hứa chống mất context tuyệt đối |
| `ui-ux-pro-max` **nguồn chính mobile UX — ADR078** | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/main/.claude/skills/ui-ux-pro-max) | Mobile app UX: navigation, touch feedback, typography, spacing, forms, safe areas, empty/error states; Next.js/PWA implementation; T18/T02 | MIT; local CSV search có kiểm nhưng recommendation phải fit sản phẩm/VI, không áp máy móc |
| `performance` **mới theo project** | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/performance) | Baseline/trace/resource budgets, measure before/after; T02/T13/T14 | MIT; portable project copy, không ghi đè global skill đã có |
| `core-web-vitals` **mới** | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/core-web-vitals) | LCP/INP/CLS, lab vs field p75; T02/T14 | MIT; thiếu CrUX/RUM samples không đồng nghĩa pass |
| `accessibility` **mới** | [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills/tree/main/skills/accessibility) | WCAG/control names/focus/keyboard/contrast, device QA; T18/T02/T14 | MIT; automated audit không thay human usability |

Tất cả bundle giữ references/supporting resources liên quan và attribution. Cài skill theo project, không bật hooks. Đã chạy script search UI/UX Pro Max **local, không persist** để đánh giá fit; chưa chạy video helpers/context demo hoặc lifecycle scripts. Nguồn chính thức của vendor được ưu tiên cho API/DB; community UX skills là hướng dẫn cần đối chiếu spec và đo thật.

Phân vai: UI/UX Pro Max + Impeccable shape/operate hướng dẫn interaction; frontend-design + Impeccable hướng dẫn visual. LottieFiles motion-design + Impeccable animate hướng dẫn purpose/timing/implementation; references của UI/UX Pro Max hỗ trợ reduced motion và interruptions. Spec dự án giữ quyền quyết định. performance đo tổng thể; core-web-vitals đo CWV; React skill giải quyết render/data fetching. Human test cho trẻ/người lớn và budgets tại [13-ux-performance-gates.md](../13-ux-performance-gates.md).

## InspoMCP theo yêu cầu người dùng

Đã cấu hình Codex entry `inspo`, dùng stdio `npx -y inspo-mcp@0.1.16`; initialize/tools/list verified 15 tools. Đã tìm/xem captures Headspace/Duolingo/Daybridge/Bear và đưa adoption vào design + founder plan. [Cấu hình, nguồn, giới hạn](../design/inspo-research.md). Đây là ngoại lệ global config **được user trực tiếp yêu cầu**, không phải quyền do skill cấp; không là app runtime dependency. Desktop tool discovery sau restart và Antigravity connection chưa kiểm.

## 3 skill riêng cho yêu cầu chưa được upstream bao phủ

| Skill | Vấn đề giải quyết | Spec nguồn |
|---|---|---|
| `worksheet-extraction` | Đọc tờ A4, evidence, all-words mode, review, schema, dedup, privacy của guest | 06/07/09 + analysis contract |
| `bilingual-learning-content` | EN–EN/EN–VI đúng sense/level, câu/grammar, notes animation và eligibility game | 04/07/08 + enrichment contract |
| `vocabulary-delivery` | Task dependencies, acceptance, resume, handoff Codex↔Antigravity | docs/ai + 10/11 |

Các skill này được viết riêng, không tuyên bố là skill tải từ GitHub hoặc kỹ năng chứng nhận tiếng Anh. Chúng cho AI quy tắc của dự án thay vì biến app thành một tutoring chatbot chung.

## Nguồn đã khảo sát nhưng chưa cài

| Nguồn | Phù hợp ở đâu | Lý do chưa cài / cách dùng |
|---|---|---|
| [OthmanAdi/planning-with-files](https://github.com/OthmanAdi/planning-with-files/tree/master/skills/planning-with-files) | Planning và phục hồi qua file | Bản hiện tại có lifecycle hooks và cơ chế plan selectors. Repo đã có một ledger docs/ai; không cài thêm để tránh hai nơi cập nhật trạng thái. Có thể tham khảo phương pháp khi task cần, không tự bật hooks |
| [google-gemini/gemini-skills: gemini-api-dev](https://github.com/google-gemini/gemini-skills/tree/main/skills/gemini-api-dev) | Official API/multimodal/structured outputs cho adapter Gemini | Provider chưa chốt qua benchmark. Skill có model/SDK defaults biến đổi theo thời gian; chỉ dùng nếu chọn Gemini, xác minh official docs và không thay model người dùng yêu cầu một cách tự động |
| [zhouwei713/english-learning-coach-skill](https://github.com/zhouwei713/english-learning-coach-skill) | Adaptive English coaching, vocabulary/context/review | MIT xác minh từ LICENSE; thiên về tương tác tutor và learning records, không đủ contract EN–VI/OCR/cloud của app. Dùng làm nguồn tham khảo, project skill giữ rubric riêng |
| [vercel-labs/agent-skills: web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines) | UI accessibility/UX review | Skill chủ yếu fetch guideline ngoài repo; catalog giữ link để reviewer dùng khi cần. Không xem guideline mới tự fetch là spec sản phẩm |
| [anthropics/skills: webapp-testing](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | Playwright UI checks/screenshots | Workflow mặc định Python, repo đề xuất test TS Playwright. Không cần bundle thứ hai để viết E2E; có thể dùng khi môi trường kiểm UI cần helper |
| [openai/skills](https://github.com/openai/skills) — openai-docs/imagegen/speech | Official docs, tạo minh họa hoặc audio asset | OpenAI Docs đã có trong phiên làm việc; imagegen là tạo ảnh, không OCR. Chỉ dùng asset-generation/audio skill khi task thực sự cần, tránh duplicate bản hệ thống |

Đây là quyết định chọn lọc cho dự án hiện tại; “chưa cài” không có nghĩa nguồn đó chất lượng kém.

## Mức kiểm tra đã thực hiện

Đã kiểm repository/đường dẫn/commit, đọc SKILL của bundle được chọn và references theo task, license provenance và inventory script. UI/UX Pro Max Python search dùng local CSV; design retry vẫn đưa marketing hero, UX query progressive disclosure không match đúng. Giữ accepted/rejected rationale tại 13; không ghi output đó là design đã verified. Scripts của context bundle có demo/cleanup file local: không chạy chúng trực tiếp trong repo chỉ để đọc docs. Bản kiểm tra này chưa là audit bảo mật đầy đủ mọi helper và chưa đo chất lượng skill trên app đã xây.

File downloaded được hash để kiểm thay đổi; update skill cần chọn commit mới, đọc diff và cập nhật lock. Không dùng script cài `latest` tự động. Skill mới có thể xuất hiện từ lượt/chat sau khi host reload discovery.

## Cách dùng

Codex: gọi tên skill hoặc yêu cầu đọc SKILL theo đường dẫn repo. Ví dụ:

```text
Use $worksheet-extraction for T05. Follow docs/07-ai-pipeline.md and keep user review before save.
Use $bilingual-learning-content for T07 and preserve user-edited meanings.
Use $vocabulary-delivery to resume from docs/ai/STATE.md.
```

Antigravity hiện dùng `.agents/skills` theo [tài liệu chính thức](https://antigravity.google/docs/skills); Codex xem [Build skills](https://learn.chatgpt.com/docs/build-skills). Discovery của IDE người dùng chưa được chạy thử ở lượt này. Tên directory và name frontmatter có thể khác, như react skill; dùng name frontmatter cho invocation.

Không đọc cả catalog skills vào production AI prompt. Runtime chỉ dùng prompt/schema ngắn dành cho extraction/enrichment; coding context và learner data được tách riêng.

## Impeccable đã vận dụng ở T18

Cài bằng skill-installer helper với `--dest .agents/skills --ref <commit>`; tên invocation `$impeccable`. Skill mới được IDE discover từ lượt tiếp theo; lượt này đọc trực tiếp SKILL và references. `scripts/impeccable context --target docs/design/prototype/index.html` chạy một lần, engine 0.1.14 cache tạm `/tmp/wfk-impeccable-runtime` được launcher kiểm SHA-256; không thêm dependency app. Context thiếu PRODUCT.md/DESIGN.md theo format Impeccable, scoped fixes dùng AGENTS/04/founder và code, không tạo ledger cạnh tranh.

Áp distill/layout/colorize/typeset: ẩn diagnostics mặc định, ba thẻ đáp án bằng nhau, disabled vẫn rõ, feedback gọn, scores có màu/icon/chữ, Nunito VI tự host và nút tìm rõ. Detector có một `cream-palette` warning, giữ vì Theme C founder đã chốt, ghi rationale trong self-review. Không gọi đây là formal `$impeccable critique` hoặc dual-agent review; không có overlay/browser injection, không ghi UX/WCAG/CWV đã pass từ detector. Xem [self-review](../design/prototype/SELF-REVIEW.md).
