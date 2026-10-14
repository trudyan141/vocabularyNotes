# A/B — Hướng dẫn triển khai chia sẻ thư viện cho Codex

Ngày: **15/10/2026**. Liên quan ADR096, T10/T11/T13 và learning state.

**Status: approved_for_implementation / in_progress. Founder15/10 đã giao “làm hết rồi manual test”; được triển khai theo AGENTS, giữ các diff có sẵn.** Đã code và triển khai cloud theo lệnh trực tiếp; [bằng chứng và manual checklist](../evaluations/library-sharing.md). Các phần thiết kế dưới đây là rationale; phần thực thi hiện hành ở đầu tài liệu.

Founder duyệt trải nghiệm tại [màn hình và flow A/B](../CHIA-SE-THU-VIEN-FLOW-FOUNDER.md). [Bản so sánh phương án](../DE-XUAT-CHIA-SE-THU-VIEN.md) là bối cảnh; tài liệu này chỉ thiết kế A/B. Không mở email/password, co-editor, co-manager, multi-learner profiles, kho công khai hoặc copy/import kho vào tài khoản nhận. Steering mới giữ một library một progress chung, tự cập nhật new content và B receiver không login.

## Thực thi hiện hành

- Public POST `/api/share` → một RPC `wfk_share(action,args)`; owner/A dùng verified Google UID, B dùng cookie HttpOnly `wfk_share_device` độc lập. Không service key trên app hay env mới. QR token trong fragment bị bỏ khỏi URL khi mở trang.
- SQL0011: private invites (membership cùng row, generation chống lời mời cũ), pairings encrypted delivery/hash, devices72h, inbox, budget, immutable paged snapshots. SQL0012: account/library lifecycle cascades và inbox source-library FK. Không sửa migration cũ/learning IDs/constraints.
- Scope local `shared:<accessId>:<libraryId>` qua metadata registry, không đổi schema IndexedDB/libraries PK. `SharedSync` chỉ push3learning entities; owner CloudSync giữ riêng. Snapshot≤100rows/1.8MB/page,15min TTL, apply đủ trang trong transaction; foreground watermark15s, focus/reconnect. Bản này tải snapshot khi watermark đổi thay vì separate delta/progress cursor.
- Nội dung projection whitelist, không nháp/sourceEvidenceText/photos/owner preferences/keys; nested session/grammar cũng sanitized. Content mutation UI/route/repository +SQL đều chặn; lịch sử accepted không xóa bởi người nhận.
- Learning packet stable operationUUID+CAS+receipt của library nguồn; same-session collision báo rõ, giữ riêng và reload, download pending quarantine. Renew cùng source giữ unprepared rows/pending packet/operation IDs, không rehome sang own library.
- Màn `/share`, `/share/receive`, `/connect`, `/libraries`, SharedBanner, NotificationBell A/B. B open/preview không claim; optional email riêng một pairing/recipient. End giữ pending để reconnect, không đưa nút bỏ kết quả nhằm tránh xóa nhầm.

## 1. Phạm vi và tiêu chí hoàn tất

| ID | Contract |
|---|---|
| SH01 | Settings → Share, chỉ chủ thư viện tạo/thu hồi chia sẻ; một hoặc nhiều email Google đã đăng ký app |
| SH02 | Người nhận Google xác thực đúng email, nhận trong app; thư viện riêng và thư viện nhận tách biệt |
| SH03 | Người nhận chỉ đọc/học nội dung; không content mutation, source upload, content AI enrichment, cấp quyền hoặc xóa thư viện gốc |
| SH04 | Owner/A/B cùng đọc/ghi một tiến độ của library được share; không ghi sang own library của recipient hoặc library khác; không multiple learner profiles |
| SH05 | Chủ tạo QR/mã trong Share; một redemption thành công cấp một phiên browser, TTL học72giờ cố định |
| SH06 | Quét/xem trước không tiêu thụ mã; claim race/retry không cấp hai phiên hoặc mất phiên khi HTTP response thất lạc |
| SH07 | A không dùng SMTP; B không cần Google login, không sao chép owner session; không thêm Vercel env/service key |
| SH08 | Revoke/expiry hiệu lực ở server/database cho request tiếp theo; pending progress không silently drop; cache đúng scope |
| SH09 | Legacy library, nghĩa/POS, source/license, events/SRS, guest/account giữ nguyên; không learner backfill, đổi learning IDs/uniques hoặc reset lịch học |
| SH10 | UI main/error desktop/mobile, database authorization và two-device behavior có evidence tách local/hosted/device |
| SH11 | Nút Nhập mã + mã10ký tự chữ/số dễ gõ trên TV/máy không camera; không bắt Google login cho manual code |
| SH12 | Inbox A/B vào NotificationBell hiện có, đúng registered recipient; open/read/dismiss không accept/claim, TTL72h chỉ từ successful claim |
| SH13 | B optional email delivery: mỗi registered recipient một pairing riêng, có authorized code/QR detail để handoff sang TV; không SMTP |
| SH14 | Owner thêm words/grammar và committed cloud updates tự tới active A/B; không re-share/re-pair, có delta/foreground refresh cho nội dung và tiến độ |
| SH15 | B receiver signed-out: manual/QR claim/read/practice/progress/reopen/renew không cần Google/email/signup; notifications chỉ optional cho registered users |

Founder đã xác nhận thêm: một Google account một kho/tiến độ, không tạo/chọn nhiều bé; bên nhận không login vẫn học theo tiến độ kho được share; tự cập nhật từ/ngữ pháp mới. Founder đã chốt vị trí Share, email nhiều người đã đăng ký app, notification A/B trong app, B optional email delivery, nút nhập mã10chữ/số, QR, chỉ học và mong muốn phiên khoảng3ngày. Các chi tiết sau **đề xuất để duyệt**, không tự mở rộng thành yêu cầu đã confirmed: mã chưa nhận15phút; A tồn tại đến revoke; B online verification khi mở lại; giới hạn batch và kiến trúc capability session.

## 2. Source map và khoảng cách hiện trạng

Đã đọc source ngày15/10; task code phải kiểm lại fingerprint/diff.

| Source hiện có | Hành vi / việc phải xử lý |
|---|---|
| `src/server/cloud/auth.ts`, `src/app/api/auth/*`, `src/app/auth/callback/route.ts` | Google SSR HttpOnly cookie, `getUser`, same-origin writes, private/no-store; giữ luồng này cho A |
| `src/app/api/cloud/library/route.ts`, `src/data/cloud/account.ts` | Chỉ mở kho `owner_id=user.id`; không dùng API này để giả người nhận thành owner |
| `src/components/app/provider.tsx`, `src/data/local/types.ts` | Startup tự mở own account khi Google user có, hoặc guest khi không có user. Cần verify active B cookie trước guest fallback và restore shared context không phụ thuộc status.user |
| `src/data/local/database.ts`, `src/data/local/backup.ts`, `src/data/local/archive.ts` | IDB upgrade/backup có scope contracts; `libraries` hiện định danh bằng library ID, cần context registry riêng để cùng remote library không va chạm viewer/access scopes |
| `src/data/local/repository.ts`, `src/data/local/practice.ts` | Content query/writes và learning cùng scope; phải tách quyền soạn content khỏi quyền ghi learning, giữ cùng source library |
| `src/data/cloud/sync.ts`, `src/components/app/cloud-background.tsx` | `CloudSync` quét toàn `cloudTables` rồi push; không attach engine writable này vào shared read cache |
| `src/lib/cloud/contracts.ts`, `src/server/cloud/map.ts` | Owner scope và deterministic remote IDs; không remap thành owner của người nhận hoặc đổi content IDs |
| `supabase/migrations/202610100001_library.sql` | Owner RLS, `review_state_unique(library_id,sense_id,card_type)`; đúng mô hình một library/một tiến độ, giữ constraint hiện có |
| Migrations0004/0006/0008/0010 | `cloud_apply`, review reducer, modes, private change stream; latest replacement function là source cần sửa, không chỉ bản0004 cũ |
| Migration0007, `src/data/cloud/realtime.ts`, `/api/cloud/realtime` | Owner-only private topic/access token; shared không tự subscribe topic owner |
| `src/server/cloud/sources.ts`, `/api/cloud/account`, `/api/cloud/preferences` | Owner photos/account deletion/preferences; giữ owner-only, không mở bằng quyền shared |
| Settings/Profile/Practice scope/Archive tools/Notifications | Thêm entry và selector theo hệ thống hiện có; không tạo main-nav tab mới |
| `src/data/local/notifications.ts`, `src/components/app/notifications.tsx`, `src/components/features/notification-detail.tsx` | Hiện chỉ3notification kinds/IDs tĩnh, scoped local receipts; chưa có cloud recipient inbox. Extend typed dynamic share IDs+verified UID delivery, giữ capture/copy/sync behavior |

Cloud learning hiện dùng owner/library làm partition. **Giữ partition này đúng steering mới**: mọi người/máy được cấp cùng dùng progress của library nguồn. Không thêm learner partition. Chỉ thêm SELECT policy vẫn không đủ vì có nguy cơ lộ preferences/raw capture và cấp content mutation: cần explicit shared projection + limited progress writer, giữ owner API hiện tại.

## 3. Mô hình quyền và context — một library, một tiến độ chung

Tách **library nguồn** và **người/máy đang có quyền**. Không có learner picker, learner table, bé An/bé Na, hoặc progress riêng cho từng recipient trong A/B này. Account profile tên/avatar hiện có vẫn giữ, không biến thành multi-learner feature.

- Owner giữ content edit/manage của library mình. Shared context có `canReadContent=true`, `canWriteContent=false`, `canManageShares=false`, `canPractice=true`; ghi kết quả vào tiến độ của đúng library đã được cấp.
- Context descriptor verified: `libraryId`, `contentOwnerId`, `accessKind=owner|email|device`, `accessId`, `accessVersion`, `libraryLabel`, `progressMode=shared-library`, `expiresAt|null`, `serverTime`, capabilities. Client không tự chọn owner hoặc nâng quyền bằng metadata/query.
- A user có own library+own progress và các shared libraries; mỗi library chọn là một bộ content+progress riêng. Chọn shared library không nhập kết quả vào own library của recipient.
- B signed-out vẫn có verified app capability cookie. Không có Google user cũng được mở shared content, practice, upload results và resume với existing library progress; không tạo account/Auth anonymous user hoặc progress mới. Guest local data cũ không gộp/ghi đè.
- Owner/A/B xem cùng library history/schedule/session state và append kết quả vào đó. Recipient không được xóa/reset history của library; có thể dừng/bỏ lượt hiện tại theo contract hiện hành, không xóa accepted events.
- Dùng một progress sẽ thay đổi lịch ôn chung khi recipient học; founder flow giải thích rõ. Không tách progress riêng ngầm hoặc vẫn tạo profile dưới một tên khác.
- Owner tạo/thu hồi share cloud vẫn cần Google đã xác thực; “không đăng nhập” được founder xác nhận chỉ bên nhận. B không được re-share hoặc tạo own cloud library bằng quyền đã nhận.

Repository mutation guard + API authorization + database enforcement bảo vệ read-only **content**, không chặn legitimate practice writes. Verified identity/capability và grants hiện tại quyết định quyền; không dựa raw_user_meta_data. [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 4. Database rationale (xem thực thi hiện hành ở đầu tài liệu)

Tên dưới đây là proposed; kiểm existing schema/generator trước khi chọn tên migration mới. Không sửa migration đã apply. UUID keys, server `timestamptz`, FK composite theo owner/library, JSON chỉ cho payload bounded và contract có schema.

| Entity | Trường/constraints cần có |
|---|---|
| Email invitations | `id, owner_id, library_id, email_normalized, recipient_user_id, status, version, accepted_user_id, accepted_at, revoked_at`; một invitation hiện hành/library/email; email là dữ liệu riêng chỉ owner và đúng recipient thấy |
| Email memberships | `id, invitation_id, owner_id, library_id, member_user_id, version, revoked_at`; một active membership/library/user; bind user ID khi accept, không authorize lâu dài bằng text email |
| Pairing codes (private) | `id, owner_id, library_id, recipient_user_id nullable, qr_token_hash, manual_code_hash, delivery_ciphertext nullable, delivery_key_version nullable, created_at, claim_expires_at, consumed_session_id, revoked_at`; không plaintext token/code, hash vẫn authoritative cho manual/QR claim |
| Share inbox (private) | `id, recipient_user_id, kind=library-invite|device-invite, source_id, source_generation, created_at`; unique recipient/kind/source/generation; payload metadata sanitized, không raw capability; server derive current availability từ invitation/pairing |
| Delivery encryption key (private, proposed) | DB-generated key/version cho short-lived B delivery payload, không secret literal trong migration/source hoặc Vercel env; restricted decrypt RPC, TTL purge ciphertext |
| Device sessions (private) | `id, owner_id, library_id, session_token_hash, pairing_id, device_label, created_at, expires_at, revoked_at, version`; unique pairing_id và token hash; expires=claimedAt+72h do DB tính |
| Progress receipts / changes (private) | Partition owner/library, op UUID+canonical payload hash, actor audit riêng nếu cần; không viewer-specific progress, accepted result; bounded cursor sequence, không authorize bằng cursor |
| Consistent shared snapshots (private, nếu dùng snapshot bootstrap) | Metadata version/watermark/expiry + projected chunks; không raw token hoặc owner history; TTL cleanup không xóa bài/progress |
| Abuse counters (private) | Bounded buckets cho create/preview/claim/progress; server/database counters, không chỉ RAM một instance; TTL cleanup |

### 4.1. Email normalization và acceptance

Trim + lowercase cho matching provider email. Không tự xóa dấu chấm hoặc `+tag` để coi hai địa chỉ là một người. Batch proposed tối đa20email/request; dài quá thì yêu cầu chia đợt, không silently truncate. Google identity có thể dùng email ngoài Gmail, nên không giới hạn đuôi `gmail.com`.

Theo founder steering mới, A và B-email chỉ gửi tới **existing permanent app users có verified Google identity**. Owner create resolve exact normalized email trong nguồn Auth/project đáng tin, bind recipient UID; email chưa đăng ký trả per-email `recipient-unavailable`, không tạo pending invite cho người dùng tương lai. Đây là deliberate replacement của bản plan cũ. Lookup chỉ trong owner create/share RPC có quota, không expose public account search/list hoặc metadata về user khác.

Invitation discovery/accept kiểm recipient UID+verified Google identity/canonical email; không nhận `recipientEmail` do client khai làm bằng chứng. Invites chưa accept không cho đọc kho. Sau accept, membership bind stable UID; invite/link ID không là mật khẩu đọc kho. Registration không phải thêm email vào Supabase team; không gọi `inviteUserByEmail`/SMTP.

Các wrapper `SECURITY DEFINER` phải fixed `search_path=''`, qualified tables, kiểm caller/owner/grant đầy đủ, narrow return DTO; revoke default EXECUTE/USAGE, chỉ grant đúng RPC. Private tables không expose SELECT. Index các FK/grant lookups; tránh RLS recursion. Không mở policy `owner OR shared` cho mọi bảng.

### 4.2. Giữ progress hiện có và mở limited shared writer

**Bỏ toàn bộ learner_id/backfill/primary-profile/learner-unique proposals ở bản trước.** Giữ tables `practice_sessions`, `review_events`, `game_attempts`, `review_states`, owner/library FKs, IDs, existing `review_state_unique`, accepted_sequence, state values, versions/timestamps/tombstones. Không migration chia SRS sang nhiều hồ sơ; không tính lại lịch ôn khi tạo share.

1. Owner `cloud_apply`/`cloud_pull` tiếp tục hoạt động như cũ. Recipient không gọi packet owner unrestricted, không impersonate auth.uid() hoặc dùng owner JWT.
2. New shared progress RPC validate A membership hoặc B capability current, derive owner/library từ grant; whitelist session transition/review/game attempt; write cùng source library tables trong transaction bảo vệ quyền. Không arbitrary table/column, content writes hoặc delete history.
3. Extract/reuse domain validation/reducer/receipts nếu cần; latest migration replacements0006/0008/0010 là source hiện hành. Trigger reducer derive source owner/library của row đã authorized, không giả caller là owner. Không fork thuật toán SRS riêng cho B.
4. Existing deterministic remote IDs cho content **và learning** giữ nguyên. Project local receiver cache scope khác chỉ tại adapter; normalize event payload thành canonical source identity trước hash/idempotency, không để cùng event đổi hash chỉ vì view scope khác.
5. Review events/attempts immutable; same op/event UUID+canonical data trả accepted receipt cũ, changed payload conflict. Session CAS chống hai máy overwrite cùng lượt; distinct rounds append events hội tụ cùng review state. Derived SRS chỉ server reducer cập nhật.
6. Shared content/progress DTO filter đúng source library và fields cần học; shared view không trả raw owner `cloud_pull` object có settings/photos/secret proposals. History **của library được share** là intentionally shared progress, history library khác không được trả.
7. Grant/session revoke chỉ chặn access, không xóa progress nguồn. Renew cùng library dùng lại tiến độ/IDs/cursor/outbox cũ; không tạo record learning mới để thay history cũ.

Audit legacy counts/hash subset và learning behavior trước/sau app/migration share. `stamp_record`/sync/review triggers hiện có side effects: không UPDATE learning rows chỉ để tag viewer/capability hoặc lấy version mới. Backup/import legacy giữ schema/meaning cũ; không đổi full archive thành shared export. Scope/context registry IDB additive không reset data. Shared cache không được import vào source hoặc own account như tác vụ tự động.

## 5. B authentication — capability session riêng, không thêm env

**Kiến trúc đề xuất:** random bearer capability riêng cho device, lưu hash trong DB và token trong HttpOnly cookie của app. Không dùng owner JWT; không tạo Supabase anonymous user cho mỗi QR. Đây là app design được đề xuất, không phải tính năng QR có sẵn của Supabase.

Lý do: credentials publishable hiện tại + scoped RPC có thể thực hiện đọc/học qua capability, không cần service-role key, SMTP hoặc bật identity provider mới. Supabase anonymous Auth dùng role `authenticated`, cần kiểm RLS và chống lạm dụng/tự dọn users; không chọn nó làm mặc định cho bản này. [Anonymous Auth limitations](https://supabase.com/docs/guides/auth/auth-anonymous).

- QR chứa URL first-party `/connect#token=<random256bit>`. Fragment không gửi lên HTTP logs; client đọc một lần, POST same-origin, xóa fragment bằng replaceState. Không CDN QR generator/analytics/external URL redirect. Manual code **10ký tự** từ alphabet32ký tự `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (bỏ O/0 và I/1), display5-5, random50bit bằng CSPRNG/unbiased choice; accept case-insensitive, ignore separators whitespace/hyphen, reject ký tự không trong alphabet. Ví dụ fixture `K7M3P-9R2TX`; không coi mã10ký tự là session secret256bit. DB unique hash/collision retry bounded +15min TTL +durable guessing limits bắt buộc.
- DB hash QR và manual code, same pairing row; cả hai alias cùng một redemption. B inbox delivery thêm alias **verified recipient UID + pairing ID** cho chính người nhận; click notification chỉ preview, explicit claim mới consume. Nhập mã/QR trên TV vẫn có thể claim bằng bearer proof không Google. Recipient UID kiểm ai được đọc notification/code, không ép TV login khi đã được người nhận đưa mã. Không log raw tokens/codes/cookies; tránh token trong SQL/audit payload/trace URLs. Query dùng bound args, route redaction.
- `wfk_share_pairing` staging cookie random256bit, HttpOnly/Secure/Lax,15min; preview hợp lệ tạo binding phục vụ claim retry. Không thay active `wfk_share_device` trước khi nhận thành công.
- Claim transaction khóa pairing, kiểm library active, code TTL/revoke/unused; insert session bằng hash staging credential, set consumed_session_id. `expires_at` do DB clock tính. Response promote staging credential sang device cookie, Max-Age không vượt thời gian DB còn lại.
- Nếu response cuối mất: staging cookie đã tồn tại từ preview; claim/status với cùng binding lấy đúng session đã claim để promote lại, không cấp session mới hoặc gia hạn. Hai staging bindings khác nhau tranh cùng QR: chỉ một thắng. Raw session secret không cần lưu DB để phục hồi response.
- Device cookie scope root cần để app status đọc nhưng không được route owner Auth sử dụng. Credentials A/B tách biệt; kết thúc B chỉ clear B cookies, không Google signOut. Proposed mỗi browser có một active B context; nối QR khác phải xác nhận thay B context, không silently overwrite pending progress.
- B RPC cho anon-role invocation chỉ nhận verified capability để suy ra context. Không grant general SELECT/UPDATE bảng nội dung. Mỗi read/progress request kiểm hash/session current/revoke/expiry/library và dùng quyền tối thiểu. DB wrappers không tin library/owner do HTTP client gửi.
- Không có owner/admin mutation RPC nào chấp nhận device token. Hash lookup indexed; bearer token là bí mật truy cập, không claim ràng buộc phần cứng vật lý.

Preflight khi triển khai phải prove cookie separation, staging retry, permissions và durable quotas với publishable-key client hiện có. Nếu đường này không làm được an toàn, ghi rõ evidence và đề xuất sửa architecture để founder duyệt; không tự thêm service key/Vercel env hoặc bật anonymous Auth thay thế.

Proposed budgets: owner create≤10pairing/15min và≤20active device/library, preview/claim≤10attempt/min theo trusted network bucket ở HTTP boundary, DB global ceiling bounded và mã entropy là bảo vệ bổ sung cho caller trực tiếp RPC. Không xem header do caller tự gửi như verified IP hoặc lấy RAM counter làm shared quota. DB failed-attempt counters phải commit kể cả khi claim bị từ chối, không raise làm rollback chính counter; return typed denial. Dưới quota errors giữ mã/phiên cũ. Owner create mất response thì refresh overview/receipt; chỉ owner hoặc designated recipient được lấy lại mã từ encrypted delivery khi ready/TTL còn hạn. Không có encrypted delivery (direct-code-only) thì hủy pairing không còn code rồi tạo mã mới; không lưu plaintext để lấy lại QR cũ.

### 5.1. Notification B và dùng mã trên TV

B có optional `recipientEmails[]≤20`. Bỏ trống giữ direct QR/code cho máy không account. Có email thì resolve registered UID, tạo **một pairing per recipient**, cùng source library/tiến độ; notification và pairing commit atomic theo từng người. Không gửi cùng one-use pairing cho nhiều inbox. Notify B không tạo membership A lâu dài; recipient chỉ claim phiên72h.

Notification body chỉ chứa title/library label/progressMode/sourceId/TTL/current state. Authorized detail cho owner/designated recipient lấy code/link/QR khi pairing ready và còn hạn, để copy/đọc trên điện thoại rồi nhập TV; code-read hoặc mark-read không consume. UI popup không tự nhúng raw token vào href, notification metadata, query URL hoặc screenshot telemetry.

Để code lấy lại được từ notification ở máy khác, B-email cần encrypted short-lived delivery, không chỉ hash: đề xuất pgcrypto encryption với key DB-generated ở private table, versioned key access/decrypt wrapper giới hạn đúng owner/recipient +pairing state. Không plaintext secrets trong inbox/user backup/source/env; không coi encryption key cùng DB là bảo vệ khỏi toàn DB compromise. Kiểm extension/role/key rotation trong implementation preflight, chưa tạo key/config trong docs task. Nếu không chứng minh encrypted delivery an toàn dưới quyền hiện tại, báo architecture gap; không silently bỏ khả năng xem mã từ notification hoặc thêm Vercel env.

Claim/cancel/expiry purge ciphertext theo lifecycle (hashes/status/receipts vẫn đủ dedup), cấm decrypt pairing đã used/cancelled/expired. Đọc chi tiết và nhập TV dùng cùng pairing, nên claim từ điện thoại rồi TV nhập lại phải trả used; chỉ owner mới cấp pairing khác. Notification invite claim proof UID cũng phải có staging binding+atomic race/retry như QR/manual path.

## 6. API và state machines dự kiến

Paths/RPC names là tên đề xuất, không tồn tại hiện tại. Dùng Zod strict, UUID checks, body/record/page byte limits; dynamic/no-store/Vary Cookie, timeout bounded. A `getUser` lấy verified user hiện tại như source; không authorize bằng unvalidated `getSession`. [SSR identity/cache guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client).

| HTTP action | Identity / output |
|---|---|
| `GET /api/share/overview?library=…` | Owner; thư viện, invitation/membership/device summaries, không secrets |
| `POST /api/share/invitations` | Owner; library, emails≤20, idempotency UUID; per-email result |
| `GET /api/share/received` | A verified user; owned/shared summaries và invites đúng identity; không list tất cả email/users |
| `POST /api/share/invitations/:id/accept` | A đúng invited identity; atomic membership create, giữ existing library progress, bind UID; retry cùng invite trả membership cũ |
| `POST /api/share/invitations/:id/revoke` | Owner; revoke pending+membership binding của invitation đó; không xóa content/progress |
| `POST /api/share/pairings` | Owner; library, recipientEmails optional≤20; direct pairing hoặc per-email results+pairing IDs/codes+delivery status; no membership A implicit |
| `GET /api/share/inbox` | Verified registered recipient UID; A/B sanitized items, không phụ thuộc library đang học; dynamic IDs+source generation |
| `GET /api/share/inbox/:id` | Verify đúng UID; detail+current invitation/pairing state; ready B có authorized code/QR retrieval, không claim |
| `POST /api/share/pairings/:id/cancel` | Owner; chỉ hủy chưa claim; đã claim thì hướng dẫn revoke session cụ thể |
| `POST /api/share/device/preview` | QR/manual proof hoặc verified notification-recipient proof + rate limits; minimal preview thư viện/tiến độ chung/72h + staging binding, không bài/history/email đầy đủ |
| `POST /api/share/device/claim` / claim-status | QR/manual hoặc notification-recipient proof+staging; atomic claim/replay; device cookie, descriptor |
| `POST /api/share/devices/:id/revoke` | Owner hoặc B current-session end; owner scope kiểm tại DB; một session thôi |
| `GET /api/share/context` | A membership hoặc B cookie; selected library/access verified descriptor; input access-kind explicit, không ưu tiên nhầm cookie |
| `POST /api/share/content/snapshot`, `GET /api/share/content/delta` | Verified context; approved projection bounded pages/cursor, no owner raw payload |
| `POST /api/share/progress`, `GET /api/share/progress` | Authorized shared library only; typed sessions/events, receipts/state, bounded cursor |

RPC có thể gom nhỏ hơn routes nhưng phải giữ caller distinction. A dùng auth UID; B dùng dedicated capability RPC. Common private functions kiểm cùng library và cùng reducer. Không đưa device capability vào default owner `/api/cloud/*`.

State A: `pending → active → revoked`; reject không mở quyền; revoke pending cũng hiệu lực; re-share email từng revoked tạo generation/version mới, không resurrect old invitation link. Trùng active trả Already shared, giữ source library và tiến độ cũ.

State pairing: `ready → consumed` hoặc `ready → expired/cancelled`. Session: `active → expired/revoked/ended`. Server không gia hạn cookie/DB expiry qua refresh app. Cancel/revoke race và progress/revoke cùng dùng authorization record lock theo thứ tự cố định; request được commit trước revoke vẫn giữ, request sau revoke deny. TTL transaction dùng thời gian thực tại authorization check.

Batch A/B-email proposed20email: validate cả batch trước gửi, lỗi từng email ở field; sau submit mỗi normalized email là unit idempotent atomic, trả success/already/error rõ. Retry chỉ failed emails với stable request+email binding. Mất response: refresh overview/receipt trước kết luận fail. Quota không tạo trạng thái active giả. Recipient registration lookup lỗi không được báo là Email chưa đăng ký; trả lookup-unavailable để retry. Source invite/pairing và inbox delivery lưu cùng transaction từng recipient; không create source thành công mà báo delivery đã tạo khi inbox write fail.

### 6.1. Payload contracts để builder không tự đoán

| Packet | Required fields / invariants |
|---|---|
| Invitation create | `requestId, libraryId, emails[]`; library phải thuộc verified owner, không field tạo/chọn learner hoặc progress riêng |
| Invitation result | `email, invitationId?, status=created|already-shared|failed, deliveryStatus?, error?`; unregistered error đúng owner request, không public user-exists search hoặc recipient UID cho unrelated caller |
| Pairing create | `requestId, libraryId, recipientEmails[]?`; direct output hoặc per-email result gồm `pairingId, qrUrl, manualCode, claimExpiresAt, deliveryStatus, sessionDurationSeconds=259200`; không device secret trước claim |
| Preview/claim | Token/manual code hoặc notificationId+verified registered user ở request body, staging cookie ở server; preview sanitized, claim output context+expiresAt, credential chỉ qua cookie |
| Progress packet | `operationId, contextAccessId, libraryId, items[]`; library phải khớp server descriptor;≤100items/≤2MB; allowlist session transition/review event/game attempt, không arbitrary entity name/content payload |
| Progress receipt | Accepted op/item IDs+versions, libraryId, progressCursor, derived states; same UUID+hash retry trả same receipt, UUID khác payload conflict |
| Content page | SnapshotId/watermark, page index/count, canonical source item IDs+versions, projected rows/tombstones, bounded bytes; response context identity phải khớp request generation |

Progress idempotency hash gắn source owner/library/event data ổn định, không gắn mutable access-generation theo cách tạo event mới khi renew. Actor/audit derive từ A UID hoặc B session, không overwrite attribution cũ khi replay receipt. Server từ chối loại entity/field ngoài learning allowlist, không chỉ bỏ qua chúng.

## 7. Nội dung được chia sẻ và đồng bộ

Chia sẻ toàn bộ **bài đã lưu đủ điều kiện học** trong một library: words/POS/senses, exact examples/whole-sentence IPA, grammar/construction/forms, lesson/group links, learning notes đã hiển thị trong bài, approved-ready art và attribution. Không auto-approve dữ liệu pending.

Exclude source photos/capture drafts, source evidence riêng ngoài text cần hiển thị, API keys/consent, owner preference/name/avatar/email không cần thiết, invitation lists, history các library khác, outbox/checkpoints/conflict proposals. Owner hiện vẫn xem dữ liệu đầy đủ của mình.

- Dùng DTO projection explicit whitelist từ typed source, không strip vài field trên owner `client_payload` rồi trả nguyên phần còn lại. Learning session question snapshot chỉ chứa allowed content của shared library context.
- Không thêm shared SELECT toàn bảng `libraries` vì có private preferences; không mở Storage raw source bucket. Approved art embedded/served qua authorized projection, giữ source/license. Unknown media/pending/unapproved không vào game hình.
- Bootstrap phải đủ graph và nhất quán: đề xuất materialize immutable sanitized snapshot trong transaction với watermark content, chia chunks≤100record/≤1.8MB, TTL15min, authorized page access. Sau nhận đủ manifest/count và apply transaction, catch-up delta từ watermark. Hết snapshot TTL thì retry snapshot mới, giữ cache cũ nhưng không báo Đã đồng bộ.
- Snapshot/delta có insert/update/tombstone/approval-removal; sense không còn approved thì remove khỏi shared view, không giữ học stale. Grammar family/forms và exact references giữ; không semantic dedup hoặc đổi content do receiver.
- Separate content cursor và progress cursor; scan sparse sequence phải advance high-water qua rows không được chiếu, không leak rows hoặc mắc vòng page rỗng. Receipt/content hash phiên bản stable cho retries.
- Owner changes hiện đã có private change stream; build projection/delta từ committed changes, kiểm current approval/visibility. Snapshot TTL storage/cleanup bounded; code tasks phải đo counts/bytes trên fixture đủ lớn, không trả danh sách cụt.
- **Automatic new words/grammar updates là SH14:** Owner commit cloud content hợp lệ → library source change cursor tăng → active A/B tự pull delta, không tạo invitation/pairing mới. Proposal check lightweight content+progress watermarks mỗi15s khi foreground, immediate check khi focus/reconnect/chuyển màn/vào lượt mới; chỉ fetch full delta khi watermarks đổi. Hidden/closed tab không background promise, resume catch-up tự động. Đây là polling interval đề xuất để duyệt, không claim instant0ms hoặc actual live latency. Shared refresh không lấy owner Realtime JWT/topic. A/B revoke vẫn kiểm DB mỗi request; UI đang mở nhận khi request kế tiếp/foreground poll. Push realtime dedicated future không cần để ship A/B.
- Chuyển library abort in-flight fetch/audio/recording/game mutation, increment context generation; late response không apply vào context mới. Tombstone learning behavior theo ADR076/075 hiện tại; content deletion giữ learning history, ảnh không hợp lệ dừng game hình đúng source contract.

## 8. Local repository, UI capability và learning writer

Đề xuất composite context keys: content/progress cache theo `(viewer/access-generation, source libraryId)` với durable op IDs không đổi khi renewal cùng source library. Không dùng bare libraryId/senseId làm toàn bộ scope.

Giữ source IDs trong projected rows, re-scope chỉ bản cache receiver. Context registry keyed by contextId riêng khỏi `libraries` owner record; không insert cùng libraryId với scope khác vào PK hiện có hoặc viết đè owner cache. Cursors, search, notification receipts, game filters, outbox và viewer preference đều có context keys; grant generation mới không revive permission của old cache.

`AppProvider` cần owner/email/device selection có verified descriptor. Persist selection là hint, không quyền. Startup verify trước khi mở shared cache; không tự đổi sang own library/guest rồi tiếp tục game của shared scope khi verify fail. UI hiện lựa chọn quay về kho riêng rõ ràng.

Tạo repository capability layer hoặc typed shared adapter: content query như current readers, content mutation throw `read-only`; `PracticeRepository` đọc content cache và ghi progress channel cùng source library; bản cache theo viewer không có nghĩa tạo một progress riêng trên cloud. Tránh cast shared scope thành account để bypass `CloudSync` constructor. Shared sync không scan content cache làm writable diff.

| Surface | Shared behavior |
|---|---|
| Today/Library/Groups/Word/Grammar detail | Đọc và practice bình thường; nhãn library/tiến độ chung/Chỉ học; hide content create/edit/delete/AI prepare |
| Game/Flashcards/Review/Speaking | Allowed approved pool; source-library attempts/SRS; Speaking giữ runtime và audio privacy hiện tại |
| Add photo/manual/editor/prepare routes deep link | Guard và giải thích Chỉ học, có Về kho đang học/Chuyển sang kho của tôi; không tạo guest draft thay thế |
| Group/date/lesson actions | Không thêm/bớt bài, rename/delete; selection cho practice vẫn allowed là local preference của viewer |
| Settings | Locale/sound/reduced motion local viewer preferences, không sửa owner library preferences; Share action chỉ tạo được trên own library |
| Profile/history | Đúng library được cấp; không show email/owner history khác; bản đầu receiver không xóa/reset đồng bộ history, chỉ có thể dừng/bỏ lượt hiện tại của mình theo contract |
| Archive/Cloud tools | Owner data export/import/delete giữ owner-only; receiver không import vào source/shared scope |

Progress writer whitelist chỉ sessions/state transitions và review/game events có ref đúng content snapshot. Client không gửi derived SRS state như authoritative, không owner mutation packet. Server CAS session version, dedup event/question UUID, hash receipt, reducer accepted sequence; score game không đổi SRS trừ flashcard rating đúng contract. Speaker raw audio không persist trong progress.

Nếu owner/A/B cùng làm **cùng một lượt** trên hai máy: CAS trả conflict và offer reload latest hoặc tạo lượt mới, không âm thầm overwrite position/answers. Các lượt khác nhau append events rồi hội tụ state. Đổi library không chuyển queue/events sang library mới.

## 9. Session expiry, offline, pending và privacy

Đề xuất bản đầu cần mạng khi nhận quyền/kết nối và khi mở lại shared context để verify; đang học có thể finish/cache permitted items khi mất mạng trước expiry. Guest và owner offline rules hiện tại giữ nguyên. Không hứa shared cold-start offline nếu chưa chứng minh permission lease/cache contracts.

- B expiry là server authority; client countdown dựa `serverTime`/`expiresAt` + monotonic elapsed, check foreground/before new round. Đổi clock local không gia hạn DB. Không tin clock client để chứng minh event được làm trước expiry.
- Tới expiry/revoke: ngừng bắt đầu câu/lượt mới, stop mic/audio và writes, hiện lý do/hành động nhận QR mới. Không hiện Đã đồng bộ khi chỉ local commit.
- Outbox receipt retry sau expired/revoked bị deny. Giữ pending source-library-tagged tối thiểu trong quarantine, không silently delete hay replay qua quyền khác. Cấp lại cùng source library với quyền hiện tại thì cho retry có idempotency; không cho upload dựa duy nhất eventTime cũ. Nếu quyền mới khác source library, giữ cách xử lý bỏ pending rõ ràng, không tự rehome.
- Quyền được renew cho cùng source library phải giữ history, same op IDs và source event snapshots; content đã đổi/delete xử lý event/snapshot conflict rõ, không ghi lại câu cũ như nội dung mới. Progress đã được server nhận không mất vì revoke/end.
- Kết thúc B có pending: thử sync khi còn quyền; nếu không được thì hiện số pending và lựa chọn Giữ để kết nối lại/Bỏ kết quả chưa đồng bộ. Không claim đã dọn hết trong khi giữ quarantine. Nội dung cache/credential của B dọn theo lựa chọn, Google/private/guest cache không bị xóa.
- Revoke chỉ chặn online quyền ở DB; downloaded content/bản sao không có remote erase guarantee. Mỗi UI boundary dọn hoặc hide cache theo permission; CDN/PWA service worker không cache auth/share API/QR token, không serve scope người trước.
- End B được phép quay lại own/guest sau explicit navigation; không hiện auto merged library. Logout A clear contexts của A, không xóa owner library data. Device contexts quản lý riêng, không owner global signOut.

## 10. UI routes và errors

Founder flow là authority của trải nghiệm. Proposed routes: `/settings/share`, `/library/select`, `/share/receive`, `/connect`; các route là subroutes, không đổi bottom nav/Theme C/Nunito/Cáo. Không bắt scanner library: dùng camera app hệ điều hành scan QR; trong app chỉ cần nhập/dán mã hoặc mở first-party link.

Owner Settings entry với library chưa cloud-synced hiện rõ cần login/sync trước; không auto upload guest hoặc gộp để tạo share. Account source-check không đổi lời mời khi owner đổi tài khoản giữa submit.

Recipient inbox A/B **bắt buộc vào chuông notification hiện có**, cũng truy cập được từ Profile/library selector; B optional recipient email input tại Share. Manual receive entry là Cài đặt → Nhập mã kết nối, input10ký tự+nút Nhập mã. Link gửi tay là optional, không email transport. Wrong Google account hiển thị account đang dùng và Đổi tài khoản/Quay lại, không reveal email đích đầy đủ cho người sai.

Error codes typed: `signed-out, auth-unavailable, owner-required, read-only, recipient-unavailable, recipient-lookup-unavailable, invitation-unavailable, notification-unavailable, pairing-unavailable, pairing-used, access-revoked, session-expired, progress-conflict, rate-limited, cloud-unavailable, invalid-email, invalid-code, too-many-emails`. Invalid/nonexistent pairing/link không tạo enumeration metadata. Success/error inline tại field+nút/list, không toast; giữ input và retry đúng phần lỗi.

Mobile360/desktop1280: email dài wrap, button48px, labels persistent, focus/errors announce; QR đủ tương phản/quiet zone/size, mã text copy luôn available, thời gian label không color-only. Screen-reader không đọc token QR; có instruction/mã field label. Keyboard Back/escape semantics hiện có, no new mandatory motion, safe-area/reduced-motion giữ.

### 10.1. Notification integration theo ADR081

Existing AppNotification chỉ union3static kinds/IDs; extend `library-invite` và `device-invite`, dynamic IDs/source generation+internal detail links. Fetch verified recipient inbox vào cache riêng theo auth UID, merge với capture/copy/sync projections; không lấy shared content owner UID hoặc repo.scope.ownerId làm recipient. Share inbox thấy được khi đang own/shared/B context mà Google recipient còn đăng nhập, không cần chọn kho nguồn để thấy lời mời.

Read/dismiss receipts share scoped auth UID+notification ID+source generation, giữ local persistence semantics ADR081; đổi account abort fetch và không flash inbox cũ. Dismiss chỉ ẩn reminder phiên bản đó, không decline A/revoke B/delete learning. Lời mời chưa nhận còn ở Received list; B ready invitations cũng có nhận lại từ đó. Refresh focus/reconnect/poll60s foreground từ durable inbox; không claim OS push/closed-browser delivery.

Expiry/revoke/claim current state checked khi mở detail: expired/cancelled/used không decrypt hoặc hiện Connect còn hiệu lực; source record tombstone không render thông báo giả. Inbox ID không là bearer proof cho unrelated UID. “Đã tạo thông báo” khác “Đã đọc”/“Đã nhận”/“Đã kết nối”; unread badge không khởi động TTL học hoặc consume mã. Keyboard/remote input focus rõ, bỏ separator không đổi10canonical chars; TV browser storage/cookies/audio support là manual gate, không claim mọi TV tương thích.

## 11. Implementation sequence khi được giao code

| Đợt | Deliverable | Gate |
|---|---|---|
| P0 — Preflight/design lock | Inventory latest migrations/auth/local data writers; prove capability RPC+cookies; data migration/backup manifest; founder flow accepted | Không mã nào đọc/ghi hosted thật trong docs stage; khi code cần source+fixtures riêng |
| P1 — Context/legacy progress compatibility | Giữ library-level legacy progress, shared DTO/progress writer, capability interface | Legacy data hashes/counts, owner/A/B SRS/event convergence/IDB upgrade/auth boundaries pass; signed-out B không tạo progress mới |
| P2 — A end-to-end | Settings Share bulk registered recipients+durable inbox/notification, invite discovery/accept/revoke, selector/readonly UI, shared progress | Own library untouched; right/wrong email; direct mutation denial; same-library shared progress và other-library denial tests |
| P3 — B end-to-end | Pairings10char code/QR/staging/atomic claim +email notification/TV handoff,72h cookie/session, owner device list/end/revoke | Two claimers one winner; lost response recovery; A/B cookie coexistence; expiry/pending |
| P4 — Completion | Scope switching/game/error/mobile+desktop, PWA cache/offline behavior, final build; hosted fixture acceptance when feasible | Không report local/mock như Google/device/hosted verified; no push main/new Vercel env |

A phải hoàn tất thành luồng dùng được trước khi B mở ra; không chỉ dựng màn Share rồi để quyền/learning thiếu. Không chia task sang subagent hoặc tạo ledger cạnh tranh.

## 12. Test matrix và commands

**Test các quyền và mất dữ liệu, không test literal labels hoặc sao chép implementation.** Test matrix dưới đây là inventory rủi ro; chỉ cases có evidence mới được tính là pass. Discover filename/fixture trước run theo WORKFLOW.

| Layer | Cases bắt buộc |
|---|---|
| DB migration | Share-table migrations không đổi legacy learning IDs/counts/state values/uniques, tombstones và same-library FKs giữ nguyên |
| DB auth | Owner1/recipient2/unrelated3; pending invite no read; correct verified Google/registered recipient only; unrelated inbox/code retrieval denied; recipient no direct content/storage/preference/delete/share writes; B token expiry/revoke/guess/cross-library/cross-library progress |
| DB concurrency | Owner/A/B cùng ghi source library progress, không double-event/SRS; Pairing race, cancel-vs-claim, revoke-vs-progress, same op same/different hash, session CAS, simultaneous flashcard events accepted once |
| Unit/integration | Owner tạo words+grammar rồi active A/B tự catch-up không re-share; signed-out B startup/reopen/upload/renew không signup hoặc own library creation; Bulk normalize without Gmail alias folding, registered/unregistered/lookup error,10char normalization/collision/limits, context generation late responses, reader/writer split, codec projection excludes secrets/history, snapshot/delta tombstones/cursor sparse |
| Migration/backup/local | Browser upgrade while old tab, legacy restore giữ library progress, no automatic shared→own transfer; explicit content-only copy with dedup and independent progress, own library+guest unaffected, pending preservation/renewal same source library |
| UI isolated | Owner share2emails, partial retry, recipient private+shared switch, wrong account, read-only deep link, QR+notification+manual-code race/same staging retry, per-recipient distinct codes, notification→TV without consuming on phone, reopen72h/end/revoke, pending reconnect; both360/1280 |
| Hosted fixtures | Two separate sample Google accounts if available + B capability qua publishable-key/anon-role RPC (không Supabase anonymous user), permissions/media/content/progress/concurrency/revoke; cleanup only own sample IDs |
| Physical/manual | Camera app QR→browser, same browser/PWA reopening, mobile cookie persistence, TV no-camera remote input+focus/cookies (when available), actual airplane mode/expiry. Simulation is not physical pass |

Commands pattern after code files exist:

```sh
pnpm lint
pnpm typecheck
pnpm test -- tests/unit/library-sharing.test.ts tests/integration/library-sharing.test.ts
pnpm test:sql
pnpm test:ui -- --list library-sharing.spec.ts
pnpm test:ui -- library-sharing.spec.ts --port 4345
pnpm test:ui -- --list library-sharing-device.spec.ts
pnpm test:ui -- library-sharing-device.spec.ts --port 4346
```

Ports proposed: check free/runner-owned before run, không kill port khác. SQL test suite scope cần discover trong `scripts/test-cloud.sh`; include regressions cũ đúng auth/learning boundary, không chạy broad release vô lý. Runner snapshot có sourceRoot+commit+content fingerprint, logs/result riêng. Build **một lần cuối** vì có routes/API/migration/dependency/PWA contracts; không build sau từng bước nhỏ. Hosted/initdb unavailable ghi environment gap, không patch app để bypass runner.

## 13. Rollout, rollback và acceptance report

Không thêm key/env mới trên Vercel, không push main, không browser thật founder. Khi task code được giao, SQL/deploy nằm trong quyền task theo AGENTS; không tự suy production bị cấm. SQL và app đã deploy theo authorization trực tiếp15/10.

Additive migration deploy trước app supporting descriptors; new Share routes chỉ mở khi schema/RPC capabilities verified. Missing schema trả feature-not-ready tại entry, không fake local sharing. Old owner app và legacy library progress vẫn hoạt động; không backfill/partition learning hoặc tạo profile. Share-table migrations và IDB context upgrade có manifest bảo toàn legacy data; tuyệt đối không sửa nội dung học của founder để fixture pass.

Rollback app: đóng create/new accept/new pairings; revoke B sessions nếu B path không còn được bảo vệ; giữ library/progress và share data, không DROP/reset learning data. Owner-only APIs/learning uniques hiện có vẫn giữ. Rollback migration destructive chỉ có separate reviewed data recovery plan.

Handoff evidence ở evaluation riêng: commands/results/fingerprint, accepted contracts, migration manifest, sample cleanup IDs, permissions proof, screenshot states và gaps. STATE một current+one next, TASKS status/link, CHANGELOG history; founder plan ghi implemented/tested/external đúng mức. Không mark T10/T11 done chỉ vì A/B scoped pass.

## 14. Mặc định để founder manual test

1. Không còn learner defaults; founder đã chốt một account/library một tiến độ, A/B dùng progress của source library. Logged-out receiver qua mã/QR đã được xác nhận.
2. A giữ quyền đến thu hồi; QR/mã chưa nhận15phút (notification có thể hết hạn trước lúc đọc), một phiên máy72giờ cố định; mỗi browser một B context tại một thời điểm.
3. First version verify mạng khi mở lại kho shared; đang học mất mạng có pending; source content/progress watermark polling15s khi foreground là mặc định đề xuất, resume/reconnect catch-up ngay. Hết hạn cần kết nối lại đúng source library để gửi pending.
4. Chia sẻ toàn bộ nội dung đã lưu đủ điều kiện học trong thư viện được chọn; không raw source photos/nháp/keys hoặc mọi history.
5. Capability session/encrypted B notification-delivery architecture và legacy progress compatibility là đề xuất kỹ thuật; implementation preflight phải chứng minh được contracts, chưa có live evidence ở task plan này.

Các điểm1–4 được trình bày không kỹ thuật trong [flow founder](../CHIA-SE-THU-VIEN-FLOW-FOUNDER.md). Founder manual test theo checklist; thay đổi trải nghiệm tiếp theo cập nhật docs cùng code.

### ADR096 follow-up — content-only copy, explicit founder approval15/10

Supersedes earlier no shared→own transfer restriction **only for explicit content copy**. New strict `words-for-kids.content.v1` whitelist omits learning, evidence/raw drafts, credentials, grants, inbox and transfer metadata. Normalize export scope by source library; immutable snapshot checksum/limits/FKs/media bytes validated before writes. Source lease/server access is verified for direct export/copy; owner destination UID is independently verified. Signed-out destination is own guest, never demo/source. Account target sync precedes preview; transaction uses content CAS, new IDs/version1, exact identity reuse, graph remapping, deterministic grammar/content dedup and a snapshot receipt independent of export time. Conflicting meanings keep target and skip attached notes/grammar. All content inserts and receipt commit atomically; learning tables remain untouched. Post-save cloud failure reports local saved/pending rather than failed copy. File import marks new senses/media pending review; direct explicit confirmation accepts source approved content. Original full-archive empty-library/owner guard remains.
