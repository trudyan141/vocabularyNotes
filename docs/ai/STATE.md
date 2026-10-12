# Trạng thái hiện tại — Words for Kids

Updated: 12/10/2026. Current task: **fix phân tích hai ảnh bộ phận cơ thể — implemented_local/scoped verified:61unit+6productionUI/lint/types/build PASS**. [Evidence](../evaluations/body-part-photo-analysis-fix.md). WF1 done; WF2 scoped verified, cloud fixture pending_environment; baseline bên dưới giữ nguyên. Không suy local thành deployed/live Gemini pass.

## Baseline / current steering

- Next/PWA, Theme C/Nunito/Cáo; trẻ5–8 tự thêm/sửa/học, không parent gate. Từ+Ngữ pháp; examples/whole-sentence IPA giữ trong items. Chi tiết/bất biến ở AGENTS và [PROJECT-RULES](PROJECT-RULES.md).
- Nhiều ảnh **một bài**: scan tất cả trước enrichment, global deterministic dedup giữ sense/POS/source sentences, checkpoint/CAS, một review/save; ADR082. [Merged photos](../evaluations/merged-photo-lesson.md): local61tests/14UI/lint/types/build PASS; chưa liveAI/phone/hostedsync/deploy của thay đổi này.
- Speaking hiện **Gemini audio direct**, endpoint/cue/percent+colors; không local355MB pack/consent dialog, ADR066. [Speaking](../evaluations/mobile-speaking-startup.md): local only; live audio/physical phone/calibration chưa chứng minh.
- Media Noto→Twemoji→Fluent→OpenMoji→Commons, ready+approved đúng sense/license. [Fallback](../evaluations/simple-word-cards-and-media-fallback.md), [prepare](../evaluations/prepare-list-dedup.md); prepare build bị lock ở lượt cũ, không claim production pass. Notifications dismiss giữ data/queue: [notifications](../evaluations/notifications.md).
- Account automatic sync/owner boundaries; **SQL0007 đã apply**,0008 hosted verified trong task cũ. [Cloud evidence](../evaluations/simple-lessons-and-live-cloud.md), [grammar/cloud](../evaluations/review-grammar-and-dictionary.md). Không còn chờ founder apply0007. Không suy hosted evidence cũ chứng minh mọi feature local mới.
- Edit một Save chung content/media/learning/error tại field+nút; lesson deletion giữ words/grammar. [Edit](../evaluations/edit-save-navigation.md), [grammar](../evaluations/grammar-guide-and-group-duplicates.md), [two types](../evaluations/two-learning-types.md).

## Work / verification / gaps

Pre-existing diff ở đầu task: plan/source review/systematic-debugging+lock/catalog và pointers (lượt audit trước), giữ nguyên. WF1 archive lossless trước rewrite; WF2 runner/shared config có7guard tests+dev/productionUI/no-demo PASS, lint/types/final snapshotbuild PASS; cloud smoke chưa chạy qua initdb SHMALL. Source identity = commit + content fingerprint, không SHA đơn lẻ.

External acceptance vẫn mở: child/provider eligibility/quality/cost benchmark, human UX, physical camera/clipboard/audio/PWA/install, field/performance trên final release; xem TASKS. Fixture/mock không chứng minh live quality. Token/time của chat trước unavailable; chỉ đo bootstrap bytes/setup/test metadata có thật.

**Next action:** kiểm live Gemini với ảnh worksheet gốc trên môi trường chạy bản sửa; hiện chưa deploy hoặc kiểm điện thoại thật. WF3 metrics ghi trong evidence task này; không tự refactor WF4.

Lịch sử/checkpoints: [STATE history](STATE.history-2026-10-12.md), [CHANGELOG](CHANGELOG.md). Không append history vào current state.
