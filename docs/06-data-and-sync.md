# Dữ liệu, chống trùng và đồng bộ

**Giữ phiên — kiểm chứng11/10:** đăng nhập đã lưu bằng cookie persistent HttpOnly. Mở lại cùng browser/domain không cần OAuth lại khi phiên còn hợp lệ; server getUser refresh access token bằng refresh token và ghi cookie mới. Cookie lifetime không đồng nghĩa thời hạn phiên server. Logout/xóa cookie/phiên hết hiệu lực hoặc bị thu hồi yêu cầu login lại. Không lưu auth vào IndexedDB/backup và không mở account cache offline bằng cookie chưa kiểm. [Kiểm chứng SDK local](evaluations/auth-session-persistence.md).


**ADR054 (11/10):** scoped CAS deletion writes versioned tombstones, not physical removal. Deleting a sense preserves saved history; the last active sense also tombstones its entry and frees activeKey. Deleting decks/groups leaves words/sentences; deleting a lesson tombstones its links and lesson-specific supplemental content, preserves other sets and global words. Search rebuild excludes deleted examples/links/lessons. Confirmation retains the reviewed version; no newer concurrent content is deleted. Existing cloud/backup DTOs retained; no SQL migration or live cloud test. [Evidence](evaluations/profile-avatar-mobile-paste-delete-grammar.md).


**Hiện hành ADR046 (11/10/2026):** Cài đặt và mọi luồng thêm/sửa/học mở trực tiếp; người dùng tự chuẩn bị và chơi, gia đình tự phân vai. Không có parent gate. Review/approval là kiểm nội dung đúng phiên bản; auth/ownership/scope/CAS vẫn bảo vệ dữ liệu thực. Mô tả phân vai bố mẹ/bé cũ bên dưới được thay bởi quy tắc này; xem03/04.


## Cloud runtime và sync local — 10/10/2026

Auth routes dùng PKCE/cookie HttpOnly và server getUser; secret không vào thư viện hoặc backup. Account cache mang scope `account:owner:library`; đăng nhập chưa kích hoạt upload hoặc chuyển guest. Migrations0001–0004 giữ owner RLS/FK/unique cùng typed records, client IDs và strict payload. API giới hạn100 thay đổi/2MB, kiểm scope/canonical/pronunciation source, RPC atomic CAS/receipt và change cursor. State ôn do server reducer theo accepted order. Hàng chờ durable giữ operation qua retry; xung đột lưu cả hai bản; exact unpublished IDs remap references trong transaction, không đổi accepted event. Guest transfer xem trước, backup, explicit confirm và giữ bản gốc.

[Kiểm cloud local](evaluations/cloud-local.md) phân biệt SDK/API/SQL thật với identity/HTTP bridge giả lập. Chưa Google/Supabase live, source image upload, account deletion hoặc mọi trường hợp merge thiết bị.

## Dữ liệu runtime local v4 — 10/10/2026

v4 additive `learningDrafts` compound scope/id, không reset v1–v3. Draft manual/OCR autosave500ms + optimistic version chống hai tab overwrite. Parent review đầy đủ CAS word revision, canonical/exact sense constraints, giữ proposal và approved snapshot cũ tới lúc commit. Phát âm word/example mang text/contentVersion/approvedContentVersion/verified/sourceUrl; đổi EN xóa nội dung phụ thuộc. Additional second example/pattern/grammar là strict validated scoped document, chỉ child read matching approved revision. Notes3 templates declarative; decks validated sense IDs cùng scope/approval.

Sessions persist mode/questions/direction/progress/revealed/hint/checked feedback/answers/version; gameAttempt id session/question unique, ReviewEvent immutable chỉ flashcard rating, state + event + session cùng transaction. Offline writer dùng SRS source transpile chung, không lịch khác. Child resume đối chiếu từng live snapshot/revision; scoped queries không lấy scope cũ khi đổi thư viện.

Hai backup khác nhau: text v1≤20MB merge deterministic giữ chỉnh sửa trùng, không ảnh/history; full `words-for-kids.archive.v1`≤50MB/ảnh≤30MB chứa sources/blobs/notes/content/decks/events/states/sessions/drafts/receipts. Strict schema/checksum/canonical/foreign references/header JPEG được kiểm trước atomic restore **thư viện trống**, rehome scope, reset image consent và IPA verification, senses pending. Không overwrite/gộp archive vào thư viện đang có, không secrets/auth/outbox trong backup. Parent review lại trước child study. Không gọi local backup là cloud sync/merge/account deletion.


**T04 local schema v3:** thêm `captureDrafts` (`[scopeId+id]`, `[scopeId+updatedAt]`) tách khỏi `drafts` review sample T03, tương ứng cùng nhóm domain draft bên dưới. `localMedia` giữ hai Blob JPEG: source đã normalize ≤2200 px/bỏ EXIF và prepared đúng preview sau rotate/crop; không giữ raw file/name/GPS. Create/update/delete draft + pixels trong một transaction. Metadata title≤200, learnedOn tùy chọn/ngày thật, tags text≤500 (T06 parse sang tags domain), crop edges %/rotation90°/version; optimistic edit/delete, quota rollback. Consent flag/version `image-upload-v1` chỉ là lựa chọn local; T05 phải kiểm consent/provider policy hiện hành trước gửi, không coi flag cũ đủ quyền gửi dịch vụ chưa được chọn. Không đưa draft ảnh vào cloud outbox. Autosave500ms, manual save/back flush, unload cảnh báo nếu còn dirty; success chỉ sau commit. List scoped/reminder7 ngày, xóa nháp xác nhận trước và chỉ xóa hai blob của nháp đó. Metadata/blob lỗi không tự clear DB. [T04 evidence](evaluations/t04-capture.md).

## Định danh và trường chung

**T03 đã triển khai:** local Dexie `words-for-kids.local`, v1→v2 thêm derived `searchIndex` và defaults tags/pronunciations, giữ IDs/content/notes/events/receipts. Stores camelCase tương ứng các domain collection dưới đây; T04 dùng captureDrafts/localMedia thật; grammar/media học/deck/SRS/transfer vẫn mới dự trù. Active lexeme unique `(scopeId, language, activeKey, caseMode)`; sense exact identity unique theo POS + sense label được chọn; links unique scope/lesson/sense và receipts scope/operation. Fixture demo giữ IDs route có sẵn, entry/scope/lesson/link IDs mới dùng UUID client. Guest/demo scope UUID giữ trong IndexedDB metadata; account scope chỉ là abstraction. IPA/readingHintVi dự trù trong `pronunciations`, chưa có dữ liệu xác minh/UI/enrichment parser.

UUID tạo ở client, thời gian lưu UTC ISO; ngày học và hạn ôn hiển thị theo timezone setting (mặc định timezone thiết bị). Dữ liệu guest có `scopeId`; cloud record có `ownerId`, `libraryId`. Mutable entity có `createdAt`, `updatedAt`, `version`, `deletedAt`; server tăng version, không tin timestamp client để xử lý conflict.

## Các bảng/domain collection

| Entity | Trường quan trọng | Quan hệ / unique |
|---|---|---|
| `libraries` | ownerId, name, locale, level, preferences | P1 một cloud library/owner; guest UUID riêng |
| `lessons` | title, learnedOn, sourceType, sourceDigest, notes | Bài học chứa nhiều loại mục; không unique chỉ theo ảnh |
| `source_assets` | lessonId, storageMode, mediaKey/localBlobKey, mime, width, height, expiry | Metadata cho ảnh gốc đã crop; giữ ảnh là tùy chọn |
| `vocabulary_entries` | displayText, canonicalKey, keyVersion, language, kind, caseMode, contentStatus | Unique active `(libraryId, language, canonicalKey, caseMode)` |
| `entry_senses` | entryId, pos, senseLabel, definitionEn, meaningVi, register, domain, verifiedPronunciation, contentOrigin | Nghĩa riêng; không tự gộp hai nghĩa chỉ vì cùng POS |
| `surface_forms` | entryId, surface, variantType, userConfirmed | Plural/irregular/UK–US đã xác nhận; không dùng làm unique entry mặc định |
| `examples` | senseId hoặc patternId hoặc grammarId, textEn, translationVi, targetTokenIds, origin, sourceEvidenceId | CHECK đúng một target; source/generated/user rõ |
| `sentences` | textEn, normalizedKey, translationVi, analysisTokens, origin | Unique active exact-normalized text/library; token analysis validate |
| `patterns` | displayPattern, canonicalPatternKey, slots, explanationEn/Vi | Unique exact pattern key/library; không semantically merge |
| `grammar_items` | title, ruleKey, explanationEn/Vi, formula, commonMistakes, contentStatus | ruleKey từ taxonomy reviewed; không tự unique theo tên AI tự tạo |
| `lesson_items` | lessonId, itemType, itemId, evidenceId | Unique `(lessonId, itemType, itemId)`; dùng typed FK/join tables trong SQL |
| `source_evidence` | lessonId, literalText, optional bbox, pageIndex, confidenceLabel | Bbox optional vì model có thể không định vị chính xác |
| `notes` | targetType/Id, text, mnemonicData, origin | Typed FK hoặc kiểm tra server; model data không executable |
| `media_assets` | senseId, kind, assetKey, provider/assetId, sourcePageUrl, creator, licenseCode/version/url, attributionText, permittedUses, derivativeLicense, verifiedAt, approvalVersion/reviewer, readyStatus, contentHash, dimensions/MIME, style, hintDescription | Ảnh/audio gắn đúng sense; approved và ready riêng; domain/source/credit/revocation theo 14, SQL/RLS chi tiết tại T10 |
| `decks` / `deck_items` | name, queryFilters hoặc senseIds, direction | Custom list dùng senseId; query deck versioned |
| `review_states` | senseId/cardType, algorithmVersion, intervalDays, ease, streak, dueAt, lastEventSeq | Unique `(libraryId, senseId, cardType)` |
| `practice_sessions` | sessionId, mode, deckSnapshot, position, startedAt, completedAt | Snapshot đủ resume và kiểm tra đáp án |
| `review_events` | eventId, sessionId, senseId, rating, hints, responseMs, eventTime, acceptedSequence | Immutable; unique eventId; order authoritative khi sync |
| `game_attempts` | attemptId, sessionId, questionId, answer, isCorrect, hints | Immutable; không đồng nhất với review_events |
| `outbox` (local) | opId, scopeId, entity, baseVersion, payload, attempts, nextRetryAt | Idempotency; chỉ cloud scope |
| `drafts` (local) | draftId, scopeId, localBlobKey, cropTransform, analysisRequestId, analysisResult, selectedCandidateIds, saveOperationId, phase | Resume capture/review; không tự gửi lại ảnh chưa consent |
| `save_receipts` (local) | scopeId, saveOperationId, payloadHash, lessonId, resultSummary | Unique scope+operation; chống double-save qua reload |
| `local_media` (local) | blobKey, scopeId, blob, mime, byteSize, lastAccessAt | Quota/cleanup theo scope; không dùng signed URL làm key |
| `search_index` (local) | scopeId, itemType/Id, normalizedSearchTerms, entryVersion | Derived, rebuild được; không là nguồn dữ liệu gốc |
| `transfer_checkpoints` (local) | transferId, sourceScopeId, targetOwnerId, snapshotHash, nextBatch, mappings, phase | Retry đúng account, giữ guest source |
| `sync_receipts` / `transfer_maps` (private server) | opId hoặc transferId, ownerId, result, localId→remoteId | Unique owner+operation; phục hồi partial transfer |

`itemType+itemId` là biểu diễn domain. SQL không dùng polymorphic FK không kiểm soát: tạo bảng nối typed (`lesson_vocabulary`, `lesson_sentences`, `lesson_patterns`, `lesson_grammar`) hoặc trigger xác minh. Composite FK bao gồm owner/library để ngăn gắn bản ghi tài khoản khác vào quan hệ.

`lesson_vocabulary` giữ entryId và senseId khi người dùng xác định được nghĩa đã học; nếu chưa rõ sense thì link entry và evidence, bổ sung sau. Source evidence không bị mất khi thêm một nghĩa vào entry cũ. Local indexes bắt đầu bằng scopeId cho mọi lookup; schema version và migrations phải bao phủ cả stores phục hồi ở bảng trên.

## Canonical key v1

**Phát âm bổ sung theo R07/R08 (09/10/2026):** T03/T07 cần dự trù dữ liệu IPA và `readingHintVi` cho sense/từ, sentence và example; đây là đặc tả dự kiến, chưa là schema DB đã triển khai. Mỗi bản phát âm giữ text/contentVersion đích, accent (UK/US hoặc loại được xác định), IPA cùng nguồn/trạng thái xác minh, gợi ý chữ Việt cùng origin và phiên bản duyệt. Null là chưa có, không dùng chuỗi rỗng hoặc lấy translationVi thay readingHintVi. Dữ liệu gợi ý không dùng làm canonical key, đáp án chấm hay nguồn cho TTS. Parent approval không tự biến IPA thành verified. Edit text/accent khiến phiên bản phát âm cũ cần kiểm lại; giữ bản user edit qua enrichment, migration, sync và backup. Contract v1.0 hiện chưa mang các trường bổ sung; T07 phải version contract/fixtures, T03/T11 phải kiểm migration/roundtrip khi triển khai.

Child learning approval là trạng thái do phụ huynh xác nhận, tách khỏi AI `contentStatus`. Sense/sentence/pattern/grammar có `contentVersion`, `learningApprovalStatus` (pending/approved/rejected), `approvedContentVersion` và reviewer theo scope. AI không được tự đặt approved. Edit/enrich proposal làm thay đổi version phải được xem lại; bản mới chưa duyệt không đè bản approved đang học. Entity chỉ vào deck/child detail khi approval khớp version và đủ điều kiện mode. Media còn cần approvalVersion + readyStatus theo 14. Guest giữ approval local; cloud ownership/auth vẫn do server/RLS kiểm; không có parent gate theo ADR046.

1. Unicode NFKC; trim; collapse whitespace.
2. Chuẩn hóa apostrophe cong → `'`, dash typographic → `-` theo quy tắc versioned.
3. Loại punctuation bao ngoài do OCR như `apple,`; giữ dấu giữa từ `mother-in-law`, `don't`, `C++`.
4. `caseMode=fold` mặc định lowercase; `caseMode=exact` cho proper name/acronym người dùng giữ. `US` và `us` không tự gộp.
5. Không bỏ accents, không stem/lemmatize, không bỏ các từ chức năng trong cụm từ.
6. Persist `keyVersion=1`; thay thuật toán phải migration kiểm tra collisions, không overwrite.

| Input | Xử lý |
|---|---|
| ` Apple `, `apple,`, `APPLE` kiểu từ thường | Key `apple`, một entry |
| `ice  cream`, `ice cream` | Key `ice cream`, một phrase |
| `ice-cream`, `ice cream` | Hai key; đề xuất variant cho người dùng, không silent merge |
| `run`, `running`, `went`, `go` | Không tự gộp; mapping surface form phải duyệt |
| `bank` nghĩa ngân hàng/bờ sông | Một lexeme, hai sense |
| `book` noun/verb | Một entry, hai sense POS khác nhau |
| `I like apples.`, `I don't like apples.` | Hai sentence/pattern khác nhau |

Unique constraint ở local compound index và Postgres active partial unique index. Kiểm tra trước để UX tốt, nhưng final insert/upsert transaction vẫn xử lý race. Grammar cùng rule nhưng examples khác được gắn vào rule đã duyệt; chưa match ruleKey chắc chắn thì cho compare, không auto merge.

## Lưu một bài

Đổi chữ EN qua editor T03 lưu `pendingEdit` theo base content version; giữ snapshot đã approved và examples hiện tại cho bé, không đổi canonical key cho tới review/commit đầy đủ ở T07. Editor phụ huynh khôi phục đề xuất sau reload và báo rõ chờ nối review; sửa nghĩa của cùng chữ EN được phụ huynh lưu với optimistic revision, không tự approve mục vốn pending.

**Từ nhập tay/tra trực tiếp:** vẫn dùng entry/sense/canonical key/unique constraint hiện có. Nguồn thao tác là manual; metadata nội dung tra có provider/source identifier, thời điểm, license khi cần và origin riêng cho nghĩa/IPA/ví dụ; không bịa sourceEvidence ảnh. Cùng từ/cùng nghĩa thì dùng entry/sense hiện có, không ghi đè bản user edit; nghĩa/POS khác phải giữ theo xác nhận. Autocomplete chỉ là dữ liệu tạm/cache, chọn gợi ý chưa tạo record. Lưu dùng transaction/operation receipt đúng scope để double tap/retry không nhân đôi; có trạng thái thiếu enrichment và approval như từ từ ảnh. Thiết kế storage/contract cụ thể thuộc T03/T07, không là migration đã chạy.

Transaction lưu lesson, evidence, entry/senses được chọn, typed links và outbox (cloud). Dedup tính lại ngay trước commit vì DB có thể đổi từ tab khác. Kết quả trả `{created, linkedExisting, addedSenses, skipped, pendingEnrichment}`. Double click dùng `saveOperationId` receipt local; source link unique ngăn lặp.

Mục trùng không overwrite definition/note do người dùng sửa. User edits có `contentOrigin=user`, không bị enrichment hoặc re-import thay thế. Bản AI mới là proposal; người dùng có thể chọn cập nhật. Soft-deleted entry có thể restore explicit; scan lại không tự phục hồi item đã xóa.

Ảnh có cùng sourceDigest với bài đã lưu: hiển thị bài cũ và lựa chọn dùng lại hoặc lưu lần học mới. Không tự tạo thêm bài từ double-submit, nhưng người dùng được giữ hai buổi học khác ngày dùng cùng tài liệu.

## Merge guest → cloud

Một transfer có `transferId`, sourceLibraryId, targetOwnerId/targetLibraryId, snapshotHash, mappings và phase. Export snapshot backup trước. Batches theo thứ tự library/lesson → entries/senses → câu/pattern/grammar → links/media → notes/decks → events. Server xác minh owner, limits và canonical key; dùng transaction mỗi batch và receipt.

Cloud đã có cùng entry: map local entryId sang remoteId. Sense chưa rõ trùng: giữ cả proposal hoặc conflict để chọn; không loại nghĩa local. Notes giữ cả hai theo note UUID, không concat mất attribution. Review events union theo UUID; cloud tái tính lịch theo algorithmVersion và thứ tự accepted sequence, không cộng hai `review_states` snapshot.

Chỉ `verified` khi mapping/counts/checksum subset được kiểm chứng; local guest snapshot không tự xóa. Thay tài khoản trong transfer dừng ngay, không tiếp tục với owner mới. Retry cùng transferId và payload hash; ID cùng payload khác → conflict.

## Sync cloud bình thường

- Push outbox op có opId+baseVersion; batch transaction cho thay đổi liên quan. Pull theo cursor server monotonic (sequence/change log), không theo client clock.
- Field conflict: nội dung user dùng optimistic concurrency; trả 409 và compare dialog. AI enrichment chỉ cập nhật trường trống/AI-owned khi baseVersion khớp. Delete tombstone ưu tiên ngăn resurrect; undo tạo operation restore mới.
- Review/game là event append-only. Bảo toàn UUID event; reducer replay theo server sequence để hội tụ. EventTime để hiển thị, không để thứ tự máy quyết định khi clock lệch.
- Offline edits trên cùng word khác thiết bị: không silent last-write-wins cho note/meaning; cho giữ cả bản hoặc chọn. Preferences đơn giản có thể server last-write-wins và ghi rõ.
- Outbox backoff exponential + jitter, cap 5 phút; auth 401 dừng và yêu cầu login; 403 không retry mãi; 409 cần user giải quyết; 429 theo Retry-After.
- Foreground reconnect/visibility trigger sync; Background Sync tùy hỗ trợ chỉ là bổ trợ. Browser closed không được hứa vẫn sync.

## RLS và xóa

Mọi bảng exposed bật RLS và grants tối thiểu. Policies SELECT/UPDATE/DELETE theo `auth.uid()=owner_id`; INSERT/UPDATE có WITH CHECK. Quyền library cha và composite FK bảo vệ child rows. Không cho client ghi owner/version/server sequence. Endpoint dùng service-role phải kiểm quyền độc lập trước từng operation; ưu tiên RPC SECURITY INVOKER dưới session người dùng. SECURITY DEFINER chỉ nếu có lý do, search_path cố định, grants và checks rõ.

Storage bucket private; path theo owner/library, policies kiểm owner; signed URL TTL ngắn và không lưu URL làm định danh. Xóa account xóa rows/media và thu hồi sessions qua server. Tombstone có retention đề xuất 90 ngày; thiết bị có cursor cũ hơn retention phải full reconcile, không replay mù outbox cũ.

## Local migration và backup

Dexie schema migrations theo version có fixture nâng cấp; không xóa DB để chữa lỗi. JSON backup có formatVersion, library export, records, checksums; text export P1, media pack có thể P2. Import parse/limits/schema trước khi transaction; preview mới/trùng/conflicts; không chạy code hoặc fetch arbitrary URL từ backup. IndexedDB có thể bị eviction/xóa bởi người dùng hoặc private browsing; đề nghị persistent storage khi hỗ trợ và nhắc export hợp lý, không hứa lưu vĩnh viễn.

## Topic groups — ADR044

No new store/table: existing `decks.payload.deck` has optional `group` with `wordIds` and sentence `{senseId,key}` references. A group may be empty or sentence-only; ordinary deck validation keeps at least one sense. `senseIds` must be the unique exact union of group word IDs and sentence parent IDs, so the existing SQL owner/library member trigger validates every referenced parent. Group schema forbids foreign/missing/duplicate references; display resolves current approved same-scope words/examples/content and flags unavailable members. Word practice reads only group.wordIds.

Group save is one scoped CAS transaction; reads approved library/all lesson links, expands selected lesson/day, deterministically removes duplicate word identity and duplicate EN+VI sentence key, rejects an already-normalized group name, and returns additions/skips. No sentence text copy or AI merge. NFKC, collapse whitespace and case fold for sentence keys; keep accents, punctuation and translation differences. Different POS/senses/case modes remain separate words. Group reading/pickers page12 without total member cap or server search-page truncation. Archives parse/restore group membership while restored approvals remain pending. Cloud existing deck/client_payload/CAS carries group data; guest transfer/identity reconciliation remap both word IDs and sentence parent IDs. No new migration; hosted group sync still needs real multi-device acceptance.


### ADR056 — Grammar and dated membership (11/10, supersedes ADR044 group shape)

Optional `group.grammar` stores approved `{senseId,key}` refs; `group.sets` stores id, optional source lessonId, title/date/sourceType snapshot and wordIds/sentenceKeys/grammarKeys. All group content belongs exactly once across sets; schema validates exact partition and unique set IDs. Legacy optional shape still parses; reads synthesize date items, save persists them. `senseIds` is exact union of word/sentence/grammar parents, existing ownership checks remain. Exact grammar key is NFKC/space/case-normalized title, formula, conditions, analysis, common error and correction; distinct explanations stay separate. No new table or migration.

Save expands approved lesson/day words, sentences and grammar, prefers that source for new membership, preserves prior dated assignment/metadata, and creates no set for duplicate-only additions. Manual individual items use source lesson when available, local-day fallback otherwise. Group CAS rejects stale/foreign/invented refs atomically. Backup/cloud parser preserves optional metadata; restore still requires review. Transfer/reconcile remap all parents/source lesson IDs together. Supplemental content transfer now keeps multiple IDs per sense instead of collapsing all into the legacy extra-sense ID. [Evidence](evaluations/groups-grammar-and-audio.md).


**11/10 — ADR060, IPA và nghe câu:** Mọi ví dụ English độc lập (ví dụ từ, bổ sung, hỏi–đáp, câu lỗi/câu sửa, từng bước grammar và thẻ ôn/offline) dùng thứ tự English → IPA toàn câu + nút Nghe → bản dịch nếu có. Nút đọc chính xác text hiện tại, độc lập việc tra IPA. Thiếu IPA chắc chắn hiển thị trạng thái rõ, vẫn cho nghe; không đoán/headword substitute. Công thức/placeholders không là câu ví dụ. Generated worksheet yêu cầu `exampleIpa`, `commonErrorIpa`, `correctionIpa` toàn đúng câu, null khi không chắc; enrichment giữ `examples[].pronunciations`. Hai field lỗi/sửa optional trong JSON, giữ qua backup/cloud và clear khi sửa/xóa phần tương ứng. Không verified tự động. [Evidence](evaluations/sentence-ipa-and-listening.md).
