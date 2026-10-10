# Bản local xuyên suốt — 10/10/2026

App production trên máy: [Words for Kids](http://127.0.0.1:4317/today). Đây là bản local để founder thử toàn luồng; không phải nghiệm thu AI/cloud/release. Quyết định ADR025–026; [báo cáo founder](../KE-HOACH-FOUNDER.md).

## Phạm vi đã triển khai

- Nhập tay: autocomplete keyboard/IME/ESC catalog21 + gợi ý cùng nhóm; tra từ điển chỉ khi bấm. Catalog authored, không giả autocomplete AI/live. Lỗi mạng giữ input; draft500ms CAS chống hai tab. Parent review/approved save/reload/deterministic dedup.
- Ảnh: camera/upload/crop/rotate/resize/nháp T04; Tesseract7 worker/WASM/eng model pinned same-origin, không gửi ảnh, cancel ngay initialization/timeout60s. OCR hai chế độ listed/all tokens≤100, unknown cần parent điền nghĩa; original text evidence giữ nguyên khi sửa. Browser đọc ảnh synthetic01-fruit thực, không mock OCR; không gọi kết quả đó là accuracy corpus/handwriting pass.
- Chi tiết: bilingual meanings/examples; source lesson/date; IPA nguồn đối chiếu nut/book/grapes và gợi ý đọc Việt dưới word/example. Manual/online/import IPA chưaverified không tự hiện chochild. Parent complete review giữ snapshot cũ khiproposal, revision CAS; additional second example/pattern/grammar strict reviewed matchingrevision. Không đảm bảo ≥2examples toàncatalog. Speech chỉEnglishoriginal, giọng thiết bị cần kiểm máy thật.
- Notes: persistent user note, 3 declarative templates, Play/Pause/Replay/stepper, static/reduced-motion/visibilitypause. Không render code model.
- Practice: custom decks và2directions; all/lesson/due/weak filters, actualSRSrating;4games image-word/word-image/letters/spelling. 3equalchoices một hàng360px; feedback/hints/skips/results/pausedsessions persist vàattemptexactonce; game khôngupdateSRS. Primarymode trênfold, filtersdisclosure.
- Dữ liệu: IndexedDBv4 guest/demo riêng; Settingsswitchmetadata khôngmerge/delete. Textbackup≤20MB merge giữexistingedits; fullarchive≤50MB/images≤30MB includesJPEGblobs/sources/notes/content/decks/SRS/events/game/sessions/drafts/receipts. Validatechecksum/schema/FK/canonical beforeatomicrestoreemptylibrary, resetapproval/consent/IPAtrust, parentreviewagain; deleteconfirmation.
- Offline: manifestPNGicons, selfhostNunito/OFL; SWpublicassetwhitelist/hash, network-firstnavigation→offlinefallback, khôngcacheHTML/RSC/API/auth/private. Offline explicitscope approvedlibrary/search/detail/flashcard/4games/resume, sharedSRSsource vànativeIDBatomicwrites; khôngautoupdatemidlesson. OCR assets khôngofflineprecache; fallback chưa cho nhập/chỉnh toàn bộ.
- SQL: 3migrations library/schema/storage/canonical, forcedownerRLS/unique/compositeFK/append-onlyhistory/privatebucket. PostgreSQL15 thậtisolatedlocal tested2owners/anon; authuid/storagebootstrap làfixture, khôngGoogleOAuth/SupabaseAuth/StorageAPI.

## Kiểm chứng

`pnpm check`: lint/typecheck, **71 tests trong8files PASS**, productionbuild PASS. `pnpm test:sql`: **PASS** ownership/constraints/canonical/immutability/storagepolicies; temporaryUnixsocketcluster auto-cleanup, khôngđụngDBsẵncó. `pnpm test:e2e`: **96/96 PASS** (lần chạy cuối, 1 phút); production4320/4322, nativeChromium desktop1280/mobile360 vàdemodisabled.

Các browsercases mới gồm manualIPA/autocomplete/draft/stale2tabs/networkfailure, OCRthực/cancel/local-onlyrequests, completeparentreview/deleteconfirmation, notes/save, SRS/resume/gradingfeedback, reversecards/decks/secondexample, text/fullbackupincludingimagebytes, guest/demoswitch, offlinecard/game/sessionresume. Existingcapture/migration/quota/secretboundarytests giữ nguyên. Hai vòng trước đã phát hiện selectorPOS/nháp không đúng và thao tác scope trướcDBready; đã sửa tests theo sourceactual vàdisablecontroluntilready, kiểm lại.

Screenshots/overflow JSON tại [local-end-to-end](local-end-to-end/layout.json):360/1280today/detail/add/practice/notes/game. Impeccable layoutdetector trả`[]`; selfreview phát hiện filterđẩyCTA xuốngfold vàđã đưa5mode lên trước, filterdisclosure. Đây làbrowser/layoutevidence, khônghumanUXpass.

`pnpm docs:check`: PASS 159 local links,17 skills/351 resources,25 requirements/19 tasks/16 screens,22 JSON files; không chạy schema validation. [Build/source hashes và kết quả](local-end-to-end/verification.json).

## Phần chưa nghiệm thu

AIprovidereligible/account/retention/credential/livebenchmark, gatewaysharedquota/enrichmentcontract/mediaexternalsearch-license review; dictionarylive availability; GoogleOAuth/cloudsync/merge/conflicts/accountdeletion; camera/voice/PWAinstall-update điệnthoại; handwritingaccuracy, currentperformance/fieldINP/humanUX5parents+5children/release. CácfeatureAI/cloud khôngđược bật/giả thànhxong. Khôngdeploy/commit/push/paidcalls. T02/T03/T04 performance numbers giữ lịch sử, khônggáncho buildnày.
