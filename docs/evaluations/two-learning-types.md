# Hai loại bài học —12/10/2026, ADR079

Theo yêu cầu founder, bỏ tab/list/thêm Câu độc lập ở Library, Groups, GroupEditor và demo Review. Library/group detail dùng hai tab Từ/Ngữ pháp rộng bằng nhau; picker còn Từ/Ngữ pháp/Bài-ngày. Select all áp dụng words/grammar, giữ lựa chọn ngoài query và chronological sort hiện hành. Copy/counts ở nhóm, photo review và Today cập nhật theo2loại.

Ví dụ câu, whole-sentence IPA/audio/VI trong word và grammar vẫn lưu/hiển thị bình thường. UI save nhóm từ lesson/day dùng includeSentences=false, không thêm standalone sentence refs; word và grammar với examples vẫn được giữ. Legacy group refs giữ senseId/key chính xác, không xóa examples/content/backup/cloud. Query mode=sentences về words; old sentence bookmark mở từ chứa ví dụ. Xếp câu là game grammar vẫn giữ. Không migration hoặc sửa nội dung thật.

Scope kiểm theo ADR050: thay navigation/route và group save, kiểm đúng data boundary/UX mobile+desktop; không full suite.

Commands (Node24.14.1/pnpm11.25.0):

```sh
pnpm lint
pnpm typecheck
pnpm test tests/integration/groups.test.ts tests/integration/learning.test.ts tests/integration/word-edit.test.ts
pnpm build
pnpm exec playwright test --config /tmp/wfk-two-types.config.ts two-learning-types.spec.ts group-picker-pictures.spec.ts simple-lessons.spec.ts --grep 'library and groups expose|select all toggles|picker puts new|manual save has no' --output=/tmp/wfk-two-types-20261012 --reporter=line
pnpm docs:check
```

37focused data tests PASS; lint/typecheck/final build PASS;8UI cases PASS mobile/desktop. Chứng minh equal-width tabs, absence sentence action, selected lesson adds word+grammar/no sentence refs, embedded word example/grammar IPA còn nguyên, legacy URL redirect, save/edit examples, chronological picker/toggle/filter preserved. Không overflow ở320/360/768/1280px trong case hai tab. Network/auth mocked; không gọi AI/provider/cloud thật.

Default4320 bị concurrent process dùng, dùng own temporary config4337, không dừng server khác. Một warning unused test variable đã sửa và lint rerun PASS. Mechanical Impeccable detector trả[] trên4UI targets, không gọi là human UX pass. UI/UX Pro Max query2lần không tìm đúng tab-specific guidance; dùng user brief/existing Theme C/grid làm fallback, không lưu search output thành product truth.

Ảnh kiểm: [Mobile library](two-learning-types-2026-10-12/mobile-two-tabs.png), [Desktop group](two-learning-types-2026-10-12/desktop-two-tabs-group.png), [Mobile group](two-learning-types-2026-10-12/mobile-two-tabs-group.png).

Local only/chưa deploy. Không SQL/env/main/founder browser/physical-device/human/remoteCI claims. Giữ pre-existing/concurrent workspace changes. Next: review trải nghiệm hoặc triển khai khi cần.
