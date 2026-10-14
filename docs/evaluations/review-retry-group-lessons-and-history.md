# 14/10 — Xem lại chuyển câu, bài trong nhóm, card xóa và lịch sử phân trang

Founder clarification replaces the previous interpretation of Cần xem lại. Scope includes all follow-ups in this chat; existing dirty scope/replay/grammar diff preserved. No subagents, founder browser, push main, Vercel env, SQL or deploy.

## Root causes and final behavior

- Previous fix kept the card still; corrected to save the self assessment and advance position/question together. Final results count marked questions; Làm lại N câu cần xem lại copies only those question snapshots with new IDs/reset state, retains scope and revalidates. Grammar self assessment does not change SRS. Two distinct sentences tested through review→advance→reload→finish→subset retry.
- Removed the confusing Play options form. Direct lesson/group/group-set links select scope; visible scope and Ôn tất cả remain. `filter.set` constrains GroupSet wordIds and grammarKeys, used by games/Speaking/URL/session/replay; stale or foreign sets fail. Retains exact assigned set rather than all source lesson words.
- Group picker Artwork passed lesson title; group detail passed empty word. Both fail approvedMedia's exact word owner check. Covers now pass their real word and prefer approved saved media over built-in artwork. No weakening of owner/revision/license checks.
- Group save processed retained members as incoming duplicates. Retention now merges separately; editor sends additions only, selected lessons/day candidates still report actual repeated items. Saved/invalid existing refs and original sets are preserved; CAS remains. Legacy groups without persisted sets reconstruct retained assignments before applying preferred new-lesson sources; no-op save also persists these missing assignments.
- Pending card now contains separate open/delete sibling buttons. Trash control has accessible label and touch target; no nested button. Existing inline pending/error/retry preserved.
- Profile history uses IndexedDBv5 additive [scopeId+createdAt] index; scoped newest-first query counts and takes at most10 snapshots for the visible page. Closed details only count. 23-round fixture yields10/10/3, previous/next limits and scope isolation tested.

## Verification and repair notes

Runtime Node24.14.1/pnpm11.25.0. Initial26-case regression run failed on expected old review behavior, missing history API, retained duplicate report. Root fixes:

- `pnpm test tests/integration/grammar-practice.test.ts tests/integration/groups.test.ts tests/integration/learning.test.ts tests/integration/cloud-sync.test.ts tests/unit/practice-filter.test.ts`:61/61 PASS initially; final expanded run including capture migration and legacy-set regression:66/66 PASS.
- `pnpm test tests/integration/capture-repository.test.ts`:4/4 PASS, v2→v5 upgrade retains drafts/unrelated media. Version assertion updated to current additive schema.
- UI discovery:22 cases across game-scope-replay + group-save-retained, desktop1280/mobile360.
- First production run build PASS28s,20/22UI PASS. Two saved-cover assertions failed: fixture allowed a built-in cover before media, then group cover also selected built-in first. Added a media-only lesson fixture and prioritized saved media. Test typing repaired (removed any; fixture matches asserted non-null). No stale/collision patched app.
- Impeccable detector:[]; bounded screenshot review, not human UX acceptance.

Production runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-WJ5NUo/result.json` commit3853eca/fingerprint66584a826587; intermediate corrected-fixture dev run `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-9epciV/result.json` failed2cover checks. Final results below.

## Limits

Own fixture data only; no live account sync, physical device/audio/provider validation or deployment. Actual tokens unavailable. UI mocks are not live quality evidence. Existing historical docs links may expire independently of this task.

Additional probes: corrected media dev run found retained legacy words assigned to incoming lesson when old group had no sets. Added preservation regression; first regression exposed no-op save discarding reconstructed sets, fixed by comparing assignments too. Final66tests PASS. Runner WjTK8E browser2PASS was correctly discarded as stale after source changed; it is not acceptance evidence. Final lint/typecheck and current-source UI below.

Final `pnpm test:ui -- --mode production game-scope-replay.spec.ts group-save-retained.spec.ts --port 4357`: **build PASS26s +22/22productionUI PASS27s**, current source commit3853eca/fingerprint160615a0536a (full identity/logs in `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-PnETU4/result.json`). Final lint/typecheck PASS. Screenshots reviewed in bounded rounds; [mobile cards](review-retry-group-lessons-and-history/mobile-pending-cards.png), [desktop cards](review-retry-group-lessons-and-history/desktop-pending-cards.png), [review result](review-retry-group-lessons-and-history/mobile-review-results.png), [history page3](review-retry-group-lessons-and-history/mobile-history-page-three.png), [incoming duplicate report](review-retry-group-lessons-and-history/mobile-incoming-duplicates.png). Test image validates media owner rendering in editor/group; own canvas fixture, not founder photo or live provider data.

Final `git diff --check`:PASS. `pnpm docs:check`:FAIL solely on3pre-existing expired temp result links in body-part-photo-analysis-fix.md (9ajoJt/IVyaxC/fzbwuT); no changed-doc errors. Existing history left intact.

## Follow-up — nút Chơi & học nằm trong card

Founder asks for the lesson action inside the card, like the library lesson cards. Outer group-lesson-card now owns border/background/padding; selection button and play link are sibling controls inside, with play aligned under metadata on desktop and within the card on mobile. No nested buttons or scope/data changes. Existing behavior spec only adds scoped screenshots; no mirroring tests. `pnpm lint`, `pnpm typecheck`, `git diff --check`:PASS. Discovery2cases and `pnpm test:ui -- game-scope-replay.spec.ts --grep 'group lesson cards' --port 4357`:2/2devUI PASS, source3853eca/fingerprint82e2b720e873, runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-Zp9gkC/result.json`. Detector[] and visual inspection: [desktop cards](review-retry-group-lessons-and-history/desktop-group-lesson-cards.png), [mobile cards](review-retry-group-lessons-and-history/mobile-group-lesson-cards.png). No extra build for this styling-only change, no deploy.
