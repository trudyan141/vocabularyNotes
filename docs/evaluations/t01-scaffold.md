# T01 — nền app và bằng chứng kiểm tra

09/10/2026, Asia/Ho_Chi_Minh. **T01 hoàn tất:** scaffold chạy dev/production local; chưa app đầy đủ, camera, IndexedDB, AI/cloud, SRS, PWA hoặc human QA25.

## Đầu ra

- Next.js App Router/TypeScript ở `src/`, trang khởi động + từ mẫu có nhãn Dữ liệu demo, error boundary và 404 recovery. Giữ Theme C/Nunito/SVG từ T18; đây chưa acceptance design system S03/S07/S09 của T02.
- Node 24.14.1, pnpm 11.25.0; dependencies exact và lockfile. Scripts dev/start/lint/typecheck/test/build/E2E/docs đã có. Cách chạy trong README và AGENTS.
- `.env.example` không có secret; Zod parse/validate, server env module có `server-only`, errors không ghi giá trị. Không credential vẫn chạy; chỉ nhận AI_PROVIDER=none. APP_DEMO_MODE=false bỏ từ mẫu ngay khi request, không cần rebuild và không tự bật library thật.
- Health probe `/api/health`: requestId/data, no-store, chỉ liveness scaffold. Không serialize secret hoặc báo AI/cloud ready. Chưa triển khai API `/api/v1`, authentication/capability hoặc shared quota.
- CI GitHub Actions: frozen install → lint/typecheck/unit/build → Chromium smoke → docs/contracts; read-only repo permissions. **Đã cấu hình, chưa chạy trên GitHub.** Chưa push, provision hoặc deploy.

## Versions và compatibility

Next 16.4.0, React/React DOM 19.3.0, TS 6.0.3, Tailwind/PostCSS 4.3.3, ESLint 9.39.5 + eslint-config-next 16.4.0, Vitest 5.0.3, Playwright 1.64.0. shadcn CLI 4.21.4 đã info/search/docs/add từ registry chính thức; source có Button/Badge/Alert/Card, Radix 1.7.0, cn 0.4.0, cva 0.7.1, Lucide 1.53.0. Review source sau add; aliases theo components.json, primary button 56 px và default 48 px, semantic colors; chưa complete T02.

Metadata ban đầu TS 7/ESLint 10 không khớp peer ranges của lint plugins. Chọn TS 6/ESLint 9 và kiểm `pnpm peers check` không còn peer issues. ESLint 9 có deprecation notice; đây là compatibility tradeoff, nâng cấp lint toolchain cần kiểm lại ở quality gate. Native optional binding của unrs-resolver đã có; postinstall fallback bị deny rõ trong pnpm-workspace.yaml, frozen install/lint pass; không allow mọi dependency script.

[Next installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind Next setup](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [shadcn Next](https://ui.shadcn.com/docs/installation/next) được kiểm cùng npm metadata. Serwist 9.5.13 khai báo peer Next >=14/React >=18/TS >=5; [Webpack guide](https://serwist.pages.dev/docs/next/getting-started) và [Turbopack guide](https://serwist.pages.dev/docs/next/turbo) tách adapter. Chưa cài/test Serwist hoặc SW/cache; T13 phải kiểm integration/offline/account scope thật.

Next dev mặc định thêm managed block vào AGENTS.md. Đã đọc docs bundled của version tại `node_modules/next/dist/docs/.../agentRules.md`, đặt agentRules=false, bỏ đúng block tự sinh; dev restart giữ nguyên hướng dẫn repo. Không hook/plugin/global config mới.

## Lệnh đã chạy và kết quả

Mọi lệnh app dùng Node 24.14.1/pnpm 11.25.0. Không suy số đo performance từ thời gian build.

| Kiểm tra | Kết quả |
|---|---|
| pnpm install --frozen-lockfile | PASS |
| pnpm peers check | Không peer issues |
| pnpm check | PASS: lint không warning; route typegen + tsc; 14 Vitest tests; production build Turbopack |
| pnpm exec playwright install chromium | Runtime test đã sẵn sàng |
| pnpm test:e2e | 7/7 PASS trên production server test 4320/4322 |
| pnpm dev --port 4317, GET / và /api/health | PASS 200; brand/demo hiện; liveAi/cloud false |
| Keyboard/mobile/desktop | Skip link Tab/Enter đưa focus vào main; CTA tới từ mẫu; không overflow ngang 360/1440; không page/console errors trong smoke |
| 404 và recovery | Trả 404, link về trang đầu hoạt động |
| Demo off + config boundary | Fixture biến mất ở runtime; probe/HTML không có server canary; unit reject public secret names, provider chưa chọn, boolean/quota sai |

Ảnh được chụp từ scroll 0 để Chromium full-page capture không đưa fixed skip link ngoài viewport vào ảnh. Computed style trước/sau anchor vẫn ẩn skip link khi không focus. Đã xem cả hai ảnh, không có clipping/overflow ở trạng thái này.

- [Desktop 1440 px](t01-scaffold-desktop.png)
- [Mobile 360 px](t01-scaffold-mobile.png)

Font WOFF2 trong app byte-identical với T18 (101.028 bytes, OFL/source pin). SVG được xuất từ code-native assets đã có; provenance ở public/illustrations/source.json. Hình trong demo chưa là catalog/import/license approval runtime của T07.

## Giới hạn và bước tiếp theo

Chưa thử điện thoại thật, nghe giọng, human QA25, screen-reader/WCAG audit, CWV/RUM, provider eligibility/live benchmark hoặc cloud. E2E viewport giả lập trên desktop host, không bằng chứng trẻ dùng dễ hoặc app đạt performance budgets. Error boundary có recovery; chưa fault-injection đầy đủ production errors.

**Next: T02** port prototype thành app shell/design system, S03/S07/S09 và UI states theo 03/04/13. T03 IndexedDB đã ready; T00 ground truth/harness độc lập. Không port sessionStorage demo thành thư viện thật hoặc mặc định bật live provider.
