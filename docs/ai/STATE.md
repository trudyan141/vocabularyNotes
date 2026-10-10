# Trạng thái dự án — Words for Kids

Updated10/10/2026 Asia/Ho_Chi_Minh. Founder trực tiếp yêu cầu sửa setup, triển khai Vercel, autocomplete thật/tự điền/hình và bỏ OCR máy, dùng AI key phụ huynh/direct browser/localStorage opt-in. ADR-029 ưu tiên quyết định này hơn các hạn chế key/OCR cũ. ThemeC/5–8parent-first/ba nav/approved revision giữ nguyên.

## Bản hiện hành

Datamuse debounce350ms real spelling autocomplete → Wiktionary bilingual gloss/POS/IPA + native/Tatoeba examples → auto-fill/sense chooser → catalog21/174licensed OpenMoji image → parent review/save. Live `handsom`→`handsome`/đẹp trai kiểm thật. Missing VI/example/image báo rõ, không invented content. Optional advanced fields nằm trong details. Existing notes/decks/SRS/4games/bilingualpronunciation/backup/guest-demo-account scope vẫn hoạt động.

Capture/crop/nháp → OpenAI BYOK trực tiếp browser → strict/evidence DTO → phụ huynh sửa/duyệt/lưu. Không còn Tesseract/worker/WASM/reader download/offline analysis. ParentSettings key/model, session mặc định/localStorage opt-in/delete; không IDB/archive/sync/server/key in env. Crop privatechilddata+consent, store:false khôngZDR; no auto retry/90s/cancel/locks. Chưa key/inference/accuracy/cost/account retention thật; T00 pending. AI_PROVIDER=none chỉ server gateway planned; BYOK độc lập.

Cloud source lifecycle/account deletion/CAS/conflicts/transfer/SQL0001–0006 và optional Commons adapter đã kiểm local fixture/realSQL. Supabase/Google hosted chưa project. PWA guest/demo library/card/4games/basicparententry vẫn offline; static OpenMoji module/path allowlist và cache viewedasset có credit. Không cache private API/HTML/RSC/account.

## Kiểm và vận hành

[Setup](../../SETUP-PROJECT.md) viết rõ3env tối thiểu/nơi lấy optionalGoogleSupabase/media/parentOpenAI và Vercel. [Evidence hiện hành](../evaluations/parent-dictionary-byok-deploy.md) thay completion-local cho lượt này. Frozen install/Chromium install PASS; check91unit/13files/lint/types/build PASS; E2E111/111 desktop/mobile PASS; SQL PASS. Docs/CI/deployment ghi khi có kết quả thật.

Vercel project words-for-kids nativeGit đã link,3productionenv added; pushmain tựdeploy. Founder cho phép deploy trong lượt này. Node24.14.1/pnpm11.25.0 path /Users/trunglk/.nvm/versions/node/v24.14.1/bin. Localproduction4317 đã restart sau build. Servers4320/4322/4328/SQLfixtures tựcleanup; không reset thay đổi sẵn có/eng.traineddata chưa rõ nguồn.

Ledger hiện **4done/2pending_external/10in_progress/3planned**: T05 BYOKruntime đã triển khai, servergatewayplanned/live pending; T15deploymentinprogress, T16localOCRretired→planned; không coi đó là toàn plan done. Physical camera/voice/install/update, human5parents5children, fieldmetrics, realAIbenchmark và hostedcloud còn pending. Baseline Library2.92s vượt2.5s/searchp95≈151ms là lịch sử build trước, chưa rebaseline.

Next action: xác nhận push/GitHubCI/Vercel READY và ghi evidence. Sau bàn giao founder test qua hosted URL; thêm key trong app nếu muốn AI, không yêu cầu gửi key trong chat. Khi có Supabase chạy hosted smoke theoSetup; không tự bật Gemini/gọi trả phí/claim benchmark.
