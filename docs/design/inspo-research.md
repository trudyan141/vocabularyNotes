# InspoMCP — cấu hình và nghiên cứu design

**Direction hiện tại:** Words for Kids, trẻ 5–8; Theme C original coral fox/berry đã được founder tạm chốt. B/A và các rationale mọi tuổi bên dưới là lịch sử, superseded về visual/audience. Tham khảo shape/clear controls/pastels, không copy Duo assets/green owl. Wordmark cũ trong PNG C được giữ như bản gốc trước đổi tên; next mockups dùng Words for Kids.

Ngày kiểm: 09/10/2026. Người dùng trực tiếp yêu cầu cài `npx -y inspo-mcp install` và đưa mẫu phù hợp vào plan. Nguồn: [website](https://inspomcp.dev/), [MCP/setup](https://inspomcp.dev/mcp), [GitHub Nutlope/inspo](https://github.com/Nutlope/inspo).

## Cài đặt đã thực hiện

- npm package **inspo-mcp 0.1.16**, tarball integrity `sha512-e9+o+q1sWojRDqBRCMkB7dJXViHy0TIr2c1bxuzaFN6J2JA76CAvdkEdbEGR+po1sXKvKCkBUIhXMZwd5k8Jtw==`. Đã đọc installer/client targets trước khi chạy.
- Chạy dry-run target Codex. Cách HTTP mặc định lỗi: CLI `codex mcp add` hiện trên máy không nhận `--url`; không ghi config ở lần lỗi.
- Chạy `npx -y inspo-mcp@0.1.16 install --client codex --local --yes` thành công; chỉ target Codex. Có backup config trước thay đổi tại `~/.codex/config.toml.vocabulary-inspo-20261009.bak`.
- Đã pin entry `mcp_servers.inspo` thành `command="npx"`, `args=["-y","inspo-mcp@0.1.16"]`; parse TOML lại để xác minh. Không cần sửa project dependencies.
- Đã khởi động stdio bằng chính command đó, initialize và tools/list thành công. Xem CHANGELOG cho số công cụ/server version. Đây là standalone smoke; discovery trong phiên desktop hiện tại chưa tự reload. Installer hướng dẫn restart client; không tự restart app người dùng.
- Chưa cấu hình Antigravity. Khi user yêu cầu, dùng tài liệu bản IDE đang chạy; không đoán location/config format của IDE.

## Nghiên cứu đã làm

Gọi endpoint `https://inspomcp.dev/api/mcp?profile=lite&images=none`: initialize, tools/list, một recommend brief app vocabulary mobile, hai search (education và friendly app). Sau đó lấy get_screen và get_design_system với `live=false` cho 4 slug đã được search trả về. Endpoint không nhận worksheet, credential, thư viện hoặc ảnh trẻ; brief chỉ là mô tả sản phẩm chung.

Recommend chọn Feature Stack và có kết quả marketing không sát product flow. Đánh giá riêng rồi chọn bốn mẫu sau. Đã trực tiếp xem ảnh desktop qua browser; có URL mobile và metadata từ MCP. Chưa trực tiếp kiểm flow bên trong app gốc hoặc animation từ video.

| Slug / ngày chụp | Nguồn và dữ liệu | Adopt cho Words for Kids | Giới hạn |
|---|---|---|---|
| `headspace-com`, 2026-05-18 | [Headspace](https://headspace.com), [DESIGN.md](https://inspomcp.dev/d/headspace-com/DESIGN.md) | Surface sáng, pastel sparing, khối rộng và friendly illustration cho Today/card/results | Capture landing; không lấy banner promo/two competing primary CTAs vào buổi học |
| `duolingo-com`, 2026-05-04 | [Duolingo](https://duolingo.com), [DESIGN.md](https://inspomcp.dev/d/duolingo-com/DESIGN.md) | CTA bắt đầu rõ, lựa chọn bo góc lớn, playful option | Brand/mascot/fonts riêng; screenshot không xác minh SRS hoặc learning UX bên trong |
| `daybridge-com`, 2026-09-10 | [Daybridge](https://daybridge.com), [DESIGN.md](https://inspomcp.dev/d/daybridge-com/DESIGN.md) | Pastel category surfaces, spacing và cards nhẹ cho lessons | Không chạy floating cards liên tục; calendar grid không thành layout học |
| `bear-app`, 2026-05-18 | [Bear](https://bear.app), [DESIGN.md](https://inspomcp.dev/d/bear-app/DESIGN.md) | Preview danh sách/detail là inspiration cho desktop library, reading typography | Không bê toàn bộ sidebar/toolbar notes vào mobile learning |

Chọn nền tảng art direction của 04, ghi áp dụng cụ thể ở founder plan mục 7. Màu/font/spacing extract có heuristic và proprietary faces; không thay token dự án bằng tất cả giá trị nguồn. Kiểm font tiếng Việt, license, contrast và density trên màn app.

Ảnh/capture URLs và ngày được lưu trong [inspo-references.json](inspo-references.json) để phiên sau không phải tìm lại. Không copy nguyên DESIGN.md thành spec dự án. Không tải screenshot nguồn vào production asset catalog; game cần asset riêng đúng sense/license.

## Vòng chỉnh theme sau feedback founder

09/10/2026: founder từ chối S03 Theme A xanh vì tầm thường. Re-read get_design_system live=false cho `headspace-com`/`daybridge-com` qua endpoint hosted; initialize cùng hosted-0e1e636. Đã trực tiếp xem **Headspace mobile 375×812** và **Daybridge desktop 1440×900** trong browser, không download nguồn vào repo.

Chọn B: nền giấy sáng, chữ/nút tím mận, review vàng bơ, camera lilac riêng, bài học như bìa sổ mint/peach, minh họa thẻ từ. Headspace gợi cách phối chữ tối/khối vàng và hình thân thiện; Daybridge gợi selective pastel và khoảng trống. Đây là diễn giải riêng cho app, không phải palette/flow đã được hai nguồn chứng nhận. Không dùng font proprietary hoặc copy mascot. B chưa approved; founder mục 4.3/7 và 04 là nguồn hiện tại, A chỉ là rejected history.

Ui-ux-pro-max design-system search trả layout landing/testimonials, indigo và font thiên trẻ nhỏ; không áp dụng vì không fit screen học mọi tuổi. Retry domain style trả Claymorphism/Soft UI; chỉ dùng để đánh giá khả năng playful, không tự bê inner/outer shadows hay cả font/palette vào app. Quyết định visual theo frontend-design và nội dung thực. Ảnh sinh có shading hơn mức flat của prompt, đã ghi để đánh giá sau.

## Cách dùng khi triển khai

Chỉ dùng Inspo khi đang thiết kế/review có nhu cầu reference. Sau khi design system đã chốt, sửa component theo token/rules dự án. Một recommend + tối đa hai search + get_screen cho 3–5 mẫu là đủ cho một vòng study; lưu quyết định adopt/adapt và coverage gaps.

Inspo là công cụ của coding agent, không là dependency của PWA hoặc API nhận dạng ảnh. UI vẫn phải dùng được khi MCP/website này unavailable. Reference JSX nếu dùng cần review như code ngoài; lượt này chưa fetch/chạy component JSX.
