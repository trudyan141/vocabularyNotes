# Chọn nhóm và bổ sung hình —12/10/2026

Scope: founder4screenshots, ADR077. Giữ pre-existing workspace edits, không sửa dữ liệu học thật/SQL/env/main/deploy/browser founder. Dùng vocabulary-delivery, Impeccable narrow layout/refinement, mobile-responsive và React best practices.

- Select all bật/tắt cả từ/câu/ngữ pháp hoặc kết quả tab ở mọi trang; giữ chọn ngoài query. Lesson picker có hình/createdAtHH:mm:ss/ngày học/counts/4word preview, mới nhất trước trong ngày; manual/custom/legacy title giữ.
- Capture bỏ tên file/Ảnh đã dán default. Khi duyệt/lưu photo, default lấy4từ distinct đã chọn; tên tự nhập giữ nguyên. Calendar learnedOn và ISO createdAt không đổi schema. Không sửa lesson cũ.
- saveStudyGroup trả addedItems thực từ delta. UI mint mới thêm và lilac bỏ trùng là details đóng mặc định, tên và số đúng; no-op không ghi/claim thêm.
- Editor luôn preview hình hiện tại hoặc staged trước Đổi hình; CAS/media credit/1Save chung giữ.
- Không bổ sung lưu IndexedDB metadata theo scope trên thiết bị, filter trước pagination; stale revision/error không claim success. Không sửa word/revision/approval/grammar/SRS. Word editor vẫn tìm/chọn ảnh. Đây là device preference, chưa backup/cloud sync.
- Picture items có mascot gốc thật, word/VI rõ, action stack và upload accordion; không tràn ngang ở320/375/414/768/1024/1280/1440px.

Verification scope: dữ liệu membership/persistence/dedup + main UI/error mobile/desktop theo ADR050; không full suite hoặc live provider. Node24.14.1/pnpm11.25.0 qua PATH local runtime.

Commands:

```sh
pnpm lint
pnpm typecheck
pnpm test tests/integration/groups.test.ts tests/integration/media.test.ts tests/unit/photo-lesson-title.test.ts
pnpm build
pnpm exec playwright test --config playwright.compact.config.ts group-picker-pictures.spec.ts grammar-polish.spec.ts edit-and-feedback.spec.ts --grep 'select all toggles|editor shows current|skip missing picture|mixed duplicate save|partial legacy grammar' --output=/tmp/wfk-picker-pictures-final-20261012 --reporter=line
pnpm docs:check
.agents/skills/impeccable/scripts/impeccable detect --json src/components/features/group-editor.tsx src/components/features/prepare-library.tsx src/components/features/word-editor.tsx src/components/features/lesson-library.tsx
```

20focused unit/integration PASS; lint/typecheck/final build PASS.6new UIcases mobile/desktop PASS before final mascot correction, isolated rerun PASS. Final10UI/regression cases PASS (6new +4existing) on mobile/desktop, including final mascot. Screenshots in [artifact directory](group-picker-pictures-2026-10-12/mobile-picture-preparation.png). Detector returned[]; does not prove human UX. Build first had concurrent lock, then an unrelated concurrent AI import before worksheet-recovery.ts existed; no revert/overwrite, rerun after file appeared PASS. Test artifacts written to own /tmp output because shared test-results was overwritten by another concurrent run.

Limitations: no live image provider/AI/cloud preference/physical phone/human test/deploy/remote CI claims. Local fixture auth/network mocked; media failure real local UI503fixture. Saved image editor and local scope isolation tested, no private data read.


## Steering bổ sung — mới nhất lên đầu

Founder yêu cầu cả Từ/Câu/Ngữ pháp/Bài trong picker sắp theo thời điểm thêm mới. groupCatalog đọc words bằng ordinal createdAt giảm dần; sentence/grammar projection mang createdAt bản ghi gốc và sort sau dedup, giữ đại diện/ref hiện hành. Grammar family dùng thời điểm mới nhất trong các dạng thuộc family. Lessons sort createdAt giảm dần trước khi chia nhóm ngày; ngày chứa bài mới nhất đứng đầu, từng ngày mới nhất trước. Không ưu tiên learnedOn hoặc updatedAt, không ghi/sửa dữ liệu học.

`pnpm test tests/integration/groups.test.ts`:11PASS, gồm timestamps đảo ngày học và edit updatedAt không đảo thứ tự bài. `pnpm lint`, `pnpm typecheck`, `pnpm build`:PASS. Scoped Playwright `--grep 'picker puts new|select all toggles'`:2chronological cases PASS mobile/desktop;2toggle cases ban đầu fail vì fixture kỳ vọng apple luôn là preview đầu, sửa assertion preview có words/rerun2PASS. Tổng4UIcases đã xác nhận. Output riêng `/tmp/wfk-picker-order-20261012` và `/tmp/wfk-picker-order-toggle-20261012`. [Mobile newest picker](group-picker-pictures-2026-10-12/mobile-newest-picker.png). No deploy/cloud/liveAI/physicalphone/full-suite claims.
