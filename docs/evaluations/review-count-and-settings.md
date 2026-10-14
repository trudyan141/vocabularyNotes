# Ôn bài không đếm trùng và Cài đặt theo nhóm

15/10/2026. Founder manual report: Ôn bài175 so với Word141; yêu cầu sửa count, chuyển shared panel lớn thành header icon mở Settings, gom Settings để dễ hiểu.

## Root cause và thay đổi

Read-only hosted count đúng account founder tại thời điểm điều tra:192approved sense rows,141written word groups,158declared aggregate senses;175due rows,137due written word groups,142due declared aggregate senses. Danh sách gom cùng cách viết/case thành một dòng; Today trước đây đếm raw source IDs. Một số copies đã có explicit approved `global-word:` link. Không phải missing cloud sync. Các nghĩa khác vẫn hợp lệ và phải giữ.

`PracticeRepository.dueSummary` đọc pool đến hạn, dùng cùng canonical/case group với Library và `uniqueAggregateWords` với explicit aliases như actual practice. Today hiện số từ, thêm số nghĩa khi cần, ví dụ137từ (142nghĩa) tại dữ liệu điều tra. `dueIds` giữ raw IDs để lesson/group filters không mất memberships. Không xóa/merge content, không ghi review/SRS, không đổi lịch sử.

Shared header có icon Link khi đang nhận kho, aria-label nói rõ Chỉ học hoặc Cần kiểm tra kết nối; pending/error có dot. Bấm mở `/settings#shared-library`; full panel chỉ trong Settings group Thư viện và chia sẻ, giữ expiry/sync/pending/quarantine/Cập nhật/Đổi kho/Kết thúc. Lease/revoke route guards và background sync giữ nguyên.

Settings groups: Thư viện và chia sẻ; Hiển thị & âm thanh; Công cụ thêm bài (AI/Google optional forms vẫn đóng ban đầu); Sao lưu & dữ liệu cho own scope; Về ứng dụng default collapsed. Giữ font/theme/navigation và mọi chức năng hiện có, không thêm main-nav tab.

## Verification

- 29focused tests PASS: review-count, practice-selection, library-sharing, grammar-practice, cloud-sync. Alias collapse count matches actual review question pool; different senses remain; future-due records exclude đúng IDs; source count/reviews/SRS unchanged by summary.
- 12productionUI PASS desktop1280/mobile360: raw fixture22senses/19written words/21distinct meanings; list count19, Today19words(21meanings); header icon→Settings full controls, no panel on learning/deep-link read-only; A/B/own-library switching regression; grouped Settings, key form closed/open, voice persists reload, archive download, no horizontal overflow. [Runner](review-count-and-settings/production-ui-result.json), fingerprint e9d41cdad47475f69e967f37ecfc99eb711be58dd5e16c64e2709ed236c14093, source commit7673714; build29.1s/browser11.4s.
- Initial UI count fixture incorrectly assumed20written words; actual existing demo has20senses/19written words. Inspected exact failure19, corrected test expectation and reran; no app workaround.
- Lint/typecheck/diff PASS, Impeccable detector no findings. [Mobile](review-count-and-settings/settings-mobile.png), [desktop](review-count-and-settings/settings-desktop.png). Detector/Playwright are not human UX/physical device acceptance.
- No SQL migration or founder-data mutation. Existing sharing cloud evidence remains at [A/B](library-sharing.md); no new real Google/TV/PWA claim for this UI-only follow-up.

## Manual

Refresh online: Today number should be written words, meanings separate; may differ from total Library because only due items are included. Open shared library: header icon links to Settings; confirm learning pages are clear of large status block. Check Settings groups, expiry/refresh/switch/end controls. Actual due numbers change with learning/time; do not treat175/137 as permanent constants.

Docs validator retains3missing historical tmp artifacts in body-part-photo-analysis-fix; scoped new doc links resolve.

Production deployed/aliased: [online Settings](https://words-for-kids.vercel.app/settings), [immutable build](https://words-for-kids-3ctga8ptp-trudyan141s-projects.vercel.app), [inspect](https://vercel.com/trudyan141s-projects/words-for-kids/964NsH8dhfrzZdDKFodVWV32RHfM). Vercel build PASS; source fingerprint matches final scoped UI e9d41cdad474. No main push/env changes/operator credential upload.
