# Đợt2–3: tám game còn lại và feedback rules

25/10/2026. Founder giao ghi feedback vào rules và làm hết plan còn thiếu; không subagent/dependency/plugin mới.

## Scope / decisions

AGENTS có mục feedback game bắt buộc đọc; PROJECT-RULES có steering cụ thể25/10 về selection-first, sample fallback không bỏ, UI gọn/metadata thu gọn, FoxLoading, mobile touch/remove, card đồng đều/min2pairs/auto memory, hình rõ nghĩa, mic sentence replay, không chấm sai vì service, không fake SRS/coverage.

Tám gameplay: sort-baskets/listen-bingo/word-detective/sound-hunt/place-object/one-many/story-order/fox-shop. Hub Game mới lọc8game mới; Tất cả hiện đủ game,8game mới lên đầu từng category. Follow-up bỏ details giấu game sau khi founder không tìm thấy. Word-builder đã bị founder rút không thêm lại. React/CSS; lazy import host/controller, no engine/dependency.

## Data and boundaries

PracticeRepository.gameInputs dùng scope/review/picture checks hiện có; dialogueInputs giữ alias. Fact compiler chỉ dùng approved content: category từ định nghĩa rõ, không tags; plural phải xuất hiện trong approved example, không auto+s; onset theo IPA/source/approval version, không chữ đầu; counting chỉ art có metadata1object đã inspect, không suy lượng từ pixel. Grammar modes cần construction tương ứng đang chọn, không ép mọi grammar vào một template. Proof không đủ thì fallback project sample có metadata nguồn trong details. Mẫu không bao giờ nhập vào user library hoặc giả là dữ liệu đang chọn.

Bản đầu8game dùng RAM rounds như Trả lời Cáo: snapshot order ổn định khi chạm, score không sửa SRS/library/coverage/cloud; reload/rời trang bắt đầu lại. Đây là thay đổi triển khai so với đề xuất persistence toàn bộ trong plan nghiên cứu; không claim resume/sync mới. Legacy sessions/history/backup và SQL contracts giữ nguyên; không có migration/env/main push.

Săn âm dùng từ mẫu nguyên vẹn với approved IPA để tìm cùng âm đầu, không giả TTS tên chữ thành âm rời. Isolated-phoneme audio là hướng mở rộng nội dung sau; trò hiện tại ghi rõ kiểu cue. Chỉ cùng accent trong một câu; consonants theo inventory, không đoán vowel khác accent.

Scene data: on/under/in khai báo theo artwork đã inspect; đúng quan hệ không tùy tọa độ người vẽ. Story3panels notice/pick-up/put-in-basket, cùng approved portable noun overlay; sequencing unit của selection hoặc sample. Shop order uses selected countable goods/forms and requested count, extra goods wrong, tap cart removes individual instance. Metadata hidden, shared Fox loading and Retry.

## Artwork

Built-in image_gen:8icon atlas +3panelstory +emptyroom, inspected and exportedWebP (99/109/27KB). [Prompts/source manifest](../../public/illustrations/adventure-art.source.json). Source originals remain generated_images; no art saved into user library. User authorized generation.

## Verification ledger

- Final command: `pnpm lint && pnpm typecheck && pnpm exec vitest run tests/unit/adventure-games.test.ts tests/unit/scoped-dialogue.test.ts tests/integration/game-expansion.test.ts` — PASS,45tests/3files. Positive/negative definition evidence, grammar eligibility, quantity, onset, scoped input, sample fallback and score stability covered.
- `pnpm test:ui -- --mode production adventure-games.spec.ts game-expansion.spec.ts --grep 'sample plays|scene load failure|Bingo uses exactly|pair and memory|scoped dialogue prioritizes' --port 4369` — discovery24, build33.0sPASS,24/24browser casesPASS31.7s. Source fingerprint29e6d606a57133a6fe6dcc3b962e4902295e6b815557cdcce9d6d92fea16f8c1, HEAD8f70821a8b770e232dd924afdcc2a76f7c6e842c +dirty source. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-m8Cox7/result.json`; owned snapshot `wfk-ui-source-YZReKu`.
- UI covers all8game main interactions/grading, wrong Bingo preserves board, story return, cart removal, collapsed details preserve answer, exact4selected pictures, scene asset failure→Retry, Match/Memory and scoped-dialogue regressions. Reviewed desktop/mobile screenshots and generated scenes. No horizontal overflow in hosted1280/360.
- Intermediate Uk5mtG buildPASS but source manifest added during run → runner rejected stale, not UI pass. LqvP1C16/18PASS with two strict alert locator collisions → fixture scoped, no app patch. HdfC7M24PASS preceded final category evidence hardening; final source run above supersedes it.
- `vercel deploy --prod --yes` — deployment2kc330zq6 Ready, production build55s; [deployment](https://words-for-kids-2kc330zq6-trudyan141s-projects.vercel.app), [alias](https://words-for-kids.vercel.app/practice).
- `node /tmp/wfk-adventure-hosted.mjs` —18/18PASS:8sample game openings/interactions +selected-four-word Bingo at1280/360. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-adventures-IRVzgn/result.json`. Disposable owned headless guest/sample contexts; exact selected source verified; founder browser/account untouched. Audio API mocked and external AI disabled; this verifies hosted gameplay/render/data scope, not live speech.
- No live voice/provider/physical-device/child UX claim. RAM resume/cloud replay and isolated-phoneme audio remain explicitly outside this delivered gameplay version. No new SQL, dependencies or Vercel env changes; no main push.

## Reopened: không tìm thấy game mới trên local/website

Founder báo không thấy game mới. Repro ở local4317 trong disposable headless context:8tiles trong DOM,0visible,2closed disclosures. Root cause là default all filter giấu8game trong details; tests trước luôn bấm Game mới nên bỏ sót đường vào mặc định. Không phải thiếu renderer/data hoặc lỗi provider. Fix: single grid/category, adventures đứng đầu, legacy modes vẫn hiện ở All; Game mới chỉ lọc nhanh, không cần mở disclosure. Metadata trong game vẫn thu gọn. Không đổi dữ liệu/cách chấm.

- Added regression default hub discovery→open→return→new filter→all. Red run `wfk-ui-result-wQgjXZ` failed2/2 tại nút Xếp vào giỏ hidden, đúng root cause.
- Lint/typesPASS. Production scoped command `pnpm test:ui -- --mode production adventure-games.spec.ts --grep 'new games are discoverable|Bingo uses exactly' --port 4369`:4/4PASS mobile360/desktop1280, build30.5s/browser8.0s. Source8d6aa1f1d1d2e04628f236ff5a01aec7270bb739f16635c9ac8023209d5734f0 /HEAD8f70821+dirty. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-fgf8MO/result.json`, snapshot`wfk-ui-source-FYabVc`.
- Existing local4317 checked read-only using fresh owned contexts:8visible game tiles and direct game openingPASS at360/1280. Reviewed default hub screenshot. Founder browser untouched.
- `vercel deploy --prod --yes`: o2z8xzzfa production/alias completed, Vercel build41sPASS. `node /tmp/wfk-visible-games.mjs`:2/2hosted360/1280PASS, all8visible on default All, direct opening/returnPASS, no overflow. Evidence `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-visible-games-1qBjFO/result.json`. Disposable owned contexts/serviceWorkers blocked; no physical-phone/service-worker-upgrade claim.

## ADR108: chạm chấm ngay và tháo fixed-plot story

Founder requested tap-only grading and conditional story removal. Root probe: `makeQuestions('story-order')` only checks sequence grammar then substitutes selected noun into constant First sees/Next picks up/Finally puts into basket. Art is also fixed3frames. Selected noun identities do not make those events source-derived; remove rather than falsely claim source story.

Removed story registry/renderer/compiler/grammar matcher/sample grammar/CSS/public WebP. Source prompt retained as retired provenance; unused atlas cell6 is not a game entry. Seven adventure modes remain, no user library/sessions changed (story was RAM-only). Single-answer sort/detective/sound/quantity/place now pass clicked next-state directly to grade, no submit button/stale previous selection. Retry retains first score; Bingo first wrong tap records false for board while preserving play/marks. Multi-item shop retains Deliver.

- Red regression before implementation: `pnpm test:ui -- adventure-games.spec.ts --grep 'a basket tap' --port 4369` failed2/2mobile/desktop because Check button still existed. Evidence `wfk-ui-result-Qb2d6z`, no stale/source collision.
- `pnpm lint && pnpm typecheck && pnpm exec vitest run tests/unit/adventure-games.test.ts` PASS,23logic tests. Production UI: `pnpm test:ui -- --mode production adventure-games.spec.ts --port 4369` discovery22/build29.7s/browser22.5sPASS,22/22cases. Source47bc6f8e13008e568f145f8e4df68e9b429165e084256bcbab78364726f8c814/HEAD8f70821+dirty; result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-3nljAr/result.json`, snapshot`wfk-ui-source-VKY38Z`. Covers7game flows, no-submit grading in each single-choice mode, wrong-first retry score0, no story menu, source-bound Bingo, room error/Retry and default discovery. Reviewed mobile sort feedback screenshot. `vercel deploy --prod --yes`: productionnckr5fw0e/alias updated, build41sPASS. `node /tmp/wfk-visible-games.mjs`:2/2hosted360/1280PASS,7visible/no story, no Check, basket tap shows feedback, return preserves menu/no overflow. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-visible-games-WeU6OW/result.json`. Owned disposable headless contexts/SWblocked/audio mocked; physical phone/live speech not claimed.
