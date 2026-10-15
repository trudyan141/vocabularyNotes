# Game điền chữ: số ô và đáp án hoàn chỉnh

15/10/2026. Direct founder bugfix; clarified “chỉ hiện1” means one missing letter, not one multiple-choice answer. Clean initial working tree; base `0c1e2b4b3ff96d8b77464f924465b838756bf546`. Implemented_local / scoped verified; no deployment.

## Cause and behavior

`letters` always hid one middle character; `missing-letters` randomized1–3. Both now snapshot2–3missing indices for new rounds, retaining one visible letter (two-letter words therefore hide1). Old session masks remain valid and unchanged. Text-entry mode reconstructs the whole-word answer from its typed sequence, retaining its existing answer contract; inline mode still checks only the missing sequence. No content/history/SRS migration.

After Check, the upper word displays the complete correct spelling, including a wrong answer and reload. Wrong-answer feedback wraps the answer itself in `strong`/English language, with600weight surrounding text and900weight answer. Both Next/PWA offline render paths updated. Whole-word spelling also shows its complete correct word after Check.

## Verification

- Red unit reproduction: low random value originally produced1blank for baby/cat; both new assertions failed before helper fix.
- `pnpm exec vitest run tests/unit/missing-letters.test.ts tests/unit/offline-game-syntax.test.ts tests/integration/missing-letters-game.test.ts tests/integration/learning.test.ts`: **35PASS**,1.75s. Mask counts/short words/separators; persisted masks, archive/cloud compatibility, attempt uniqueness/no SRS; text-entry whole-word contract and existing learning regression.
- `pnpm lint`, `pnpm typecheck`, `node --check public/offline-games.js`, `git diff --check`: **PASS**.
- Discovery10cases before execution. Final `pnpm test:ui -- --mode production missing-letters.spec.ts --port 4347`: **10PASS** (desktop1280/mobile360), browser14.3s/build32.9s. Correct/wrong inline answers, bank taps, typing/paste/IME,2blank low-random path, text-entry keyboard submission, full word/bold feedback, reload, offline and overflow.
- Final result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-mBNrNX/result.json`; owned snapshot `wfk-ui-source-BrcV7n`; fingerprint `2aa2f672115c4eee1299a8814c3eacceeeea74434ff0ac968f7b979b98648724`.
- Inspected final desktop and mobile captures: [desktop inline](missing-letter-corrections/desktop-missing-letters-wrong.png), [mobile inline](missing-letter-corrections/mobile-missing-letters-wrong.png), [mobile text entry](missing-letter-corrections/mobile-letter-correction.png), [mobile offline](missing-letter-corrections/mobile-offline-correction.png). Mechanical detector found3pre-existing unrelated CSS findings (side border/bounce); no human UX claim.

## Reruns and limits

First unit command used `pnpm test -- ...`, unexpectedly ran all418tests:2expected red mask assertions plus unrelated existing deletion fixture/auth-session failures. Used direct `pnpm exec vitest run` for actual scoped verification; did not patch unrelated code.

Earlier UI runs hit obsolete pause/finish labels and resume expectations (current app auto-opens the session URL, discards unstarted rounds, and calls its finish button “Chọn trò chơi khác”). Updated tests to current flow. One production mobile text-entry mouse-click produced no submit; final test explicitly uses keyboard Enter. Inline bank/check taps and offline Check are covered; physical/mobile text-entry tap confirmation remains manual. A dev attempt also hit Fast Refresh/full reload and failed8/10; final production run above is the passing evidence. Earlier source/snapshot outputs are not final evidence.

No physical-device, live cloud, live audio, hosted UI or deployment verification. Tokens unavailable. Scope preserves ownership, data and saved session masks; founder starts a new round to see2–3blanks.
