# Nguồn ảnh miễn phí và game có hình —12/10/2026

Founder yêu cầu2game liên quan hình chỉ đưa word có hình vào game, mở rộng nhiều nguồn free, nghiên cứu nguồn của app/website tiếng Anh. Scope: practice eligibility/session revalidation và media search/import/source licenses, không đổi learning content/SRS. Giữ concurrent workspace changes.

## Nguồn đã nối

Trước lượt này: illustration catalog nội bộ/vendor OpenMoji và Commons API. Search gặp OpenMoji dừng sớm, nên thường chỉ thấy1source. Bổ sung3catalog online pin commit, mapping theo Unicode keys của catalog hiện hữu:

| Source | License của hình | Commit | File keys khớp |
|---|---|---|---|
| Google Noto Emoji2D SVG | Apache-2.0; khác OFL của font | e20cbc2bbec1926686be9f9bee7d1d2cfa1fea0e |1257|
| Twemoji SVG | CC BY4.0; khác MIT của code | b6b55fef1e8636b540a6d016a4729ca8cdf2e60b |1370|
| Microsoft Fluent Emoji Flat2D | MIT |1ffb34c752ecf5d402f04cfb4b392c77f57c54bc|1273|

Đây là số key/path ứng viên của từng nguồn, không phải3900từ unique hoặc toàn bộ ảnh đã được phụ huynh duyệt. Manifest server-only `src/lib/media/free-picture-sources.json`; không bundle ảnh/truy vấn hàng nghìn file mỗi search. Search trả tối đa5candidate, catalog trước; với từ có code phù hợp có3–4style. Tìm thêm trên mạng gọi Commons riêng có cache/dedup/quota như cũ; không tự fan-out/paidAPI/key mới. Unknown word vẫn Commons fallback. Cho chọn từng hình trước khi import; byte cap/timeouts/host fixed IDs/pinnedpaths/receipt/JPEG512px/EXIF stripping/approval giữ. SVG remote scripts/entities/external references bị từ chối; uploaded SVG vẫn không được nhận.

Preview ghi nguồn/license; imported credit có tác giả/source/license/thay đổi JPEG, backup giữ metadata. Cloud mapping đúng noto/twemoji/fluent, signature chặn credit sửa; chưa hosted-sync thật trong lượt này. License/notice copies ở public/licenses, gồm Noto2D/svgLICENSE và Apachefulltext, Twemoji graphics, MicrosoftMIT. Noto root LICENSE là fontOFL nên không dùng nó để gán quyền cho SVG.

Dùng ảnh khác có2link tìm thủ công: Openclipart và Openverse. Chưa automatic import2nguồn này: Openverse không xác minh giấy phép từng ảnh, cần kiểm trang gốc; Openclipart CC0 vẫn review subject/provenance. Download ảnh có quyền rồi upload qua đường hiện có, không biến link nguồn thành giấy phép tự động. Không claim đủ hình cho mọi từ/meaning; ảnh paid/user-owned vẫn dùng được như trước.

## Nghiên cứu app/website

- [Duolingo artwork process](https://blog.duolingo.com/shape-language-duolingos-art-style/): thiết kế/illustration language riêng do độiart xây dựng; không có bằng chứng họ lấy toàn bộ ảnh từ1kho free. Không copy artwork của họ.
- [Quizlet current image gallery/upload help](https://help.quizlet.com/hc/en-ca/articles/360030154311-Adding-your-own-images-to-sets): thư viện ảnh miễn phí trong sản phẩm và upload riêng. [Quizlet Flickr integration2012](https://quizlet.com/blog/improved-adding-flickr-images-to-study-sets) là bằng chứng lịch sử, không khẳng định hiện vẫn Flickr hay được lấy lại gallery của họ.
- [British Council terms](https://www.britishcouncil.org/terms), [LearnEnglishKidsFAQ](https://learnenglishkids.britishcouncil.org/frequently-asked-questions): content được bảo hộ/giới hạn download, không suy “website học tiếng Anh” nghĩa là free image source.

Primary licenses: [Noto2D SVG](https://github.com/googlefonts/noto-emoji/blob/main/2D/svg/LICENSE), [Twemoji graphics](https://github.com/jdecked/twemoji/blob/main/LICENSE-GRAPHICS), [FluentMIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE), [OpenclipartFAQ](https://openclipart.org/faq), [Openverse about](https://openverse.org/en-za/about).

## Game boundary

picture-word và word-picture lọc lại LibraryWord resolved art sau index: thiếu/unknown/dangling media/pending/revoked/notapproved/stalerevision không vào targets hoặc distractors. Cần3đáp án khác hình/word/meaning; câu không đủ choices bị bỏ,0eligible báo recovery. Các game chữ/flashcard vẫn dùng từ thiếu hình. Revalidate toàn bộ snapshots kể cả distractor trước resume/reveal/check/answer. Hình bị đổi khi đang chơi thì livequery thay game bằng recovery, không render old image/ghi điểm. Không đổi SRS bằng điểm game.

## Verification

ADR050 scoped: data eligibility/media contracts/backup/signed cloud mapping và main/error UI mobile+desktop. Không fullsuite/SQL/human/physicalphone/remoteCI.

```sh
pnpm lint
pnpm typecheck
pnpm test tests/integration/media.test.ts tests/integration/learning.test.ts
pnpm build
WFK_LIVE_MEDIA=1 pnpm exec playwright test --config /tmp/wfk-picture-tests.config.ts --output=/tmp/wfk-ready-free-pictures-final-20261012 --reporter=line
```

34focused tests PASS, lint/typecheck/final primary build PASS; docs:check PASS at handoff. Fetched9real SVGsamples (apple/boy/backpack across3sources) fetched with normal TLS/pin, no TLS bypass. Initial2liveUIcases PASS acrossmobile/desktop: actual local API fetched/normalized/signed Noto/Twemoji/Fluent and Twemoji explicit save displayed ownedJPEG. GameUIfixture selectors were corrected (exact button vs recent-session name, app alert vs Next announcer); direct rawIDB mutation was replaced by actual editor in second tab to trigger Dexie cross-tab events.2cross-tab cases subsequentlyPASS. Final rerun collided with concurrent rebuild deleting shared .next manifests; unrelated no source change. Moved final UIcheck to source snapshot /tmp/wfk-media-preview-20261012 with existing dependencies, public test-only signing key and no copied .env/privatecredentials; webpack isolated build used, no source config rewrite/server interruption. Final isolated webpack build PASS;6UIcases PASS mobile/desktop (13.5s) including actual3sourceAPIimports+Twemoji save/render, failedmoresearch keeps previouscandidates, bothgames skipmissing/stalemedia and cross-tabimage removal recovery. `WFK_LIVE_MEDIA=1 pnpm exec playwright test --config /tmp/wfk-isolated-picture-tests.config.ts --output=/tmp/wfk-ready-free-pictures-isolated-20261012 --reporter=line`. Fixture signingkey only/testsourcecopy; no Vercelenv.

Limitations: no deploy/main/Vercelenv/SQL/founderbrowser/AIcalls. Commons broader search failure path mocked for deterministic test, existing search/licensemetadata tests retained. No automatic Openverse/Openclipartimport/liveownedaccountsync claim. Screenshots: [Mobile sources](free-picture-sources-2026-10-12/mobile-three-free-sources.png), [Mobile picture game](free-picture-sources-2026-10-12/mobile-word-picture.png).

Browser profiles all isolated; only own seeded IDB fixtures changed.


Steering tiếp12/10 founder thích3nguồn mới: thứ tự search GoogleNoto→Twemoji→MicrosoftFluent→OpenMoji→Commonsfallback. Điều chỉnh ranking candidates, không thay hình đã chọn. `pnpm test tests/integration/media.test.ts`:11PASS gồmbrother trảnew3first/OpenMojilast;lint/types PASS; priority liveUI lần đầu dùng snapshot build cũ (OpenMoji first), refresh source snapshot/rebuild/rerun exact2cases. Kết quả cuối ghi dưới.

Priority final: isolated webpackbuild PASS;2livecases desktop/mobile PASS (5.2s), brother returns `[noto,twemoji,fluent,openmoji]`, actual source imports/save/failedmoresearch vẫnPASS. Command `WFK_LIVE_MEDIA=1 pnpm exec playwright test --config /tmp/wfk-isolated-picture-tests.config.ts free-picture-sources.spec.ts --output=/tmp/wfk-prioritized-sources-final-20261012 --reporter=line`. Docs:check PASS733links/15skills/317resources sau dọn3pycache tạo bởi researchscript; không sửa skillsource/checksum.
