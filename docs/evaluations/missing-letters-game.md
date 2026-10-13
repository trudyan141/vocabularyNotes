# Tìm ký tự thiếu — 1–3-letter spelling game

13/10/2026. Direct founder task, ADR087; base commit57d411f with previous full-pool/global-aggregate task diff preserved. Skills: vocabulary-delivery, bilingual-learning-content, React, scoped Impeccable/UI guidance and Postgres rules. No real founder browser, main push, provider calls or new Vercel env.

## Behavior

New `missing-letters` mode in Play & learn, separate from full spelling and the existing one-letter mode. Random1–3unique letter positions in an approved stored word/phrase; always keep at least one letter visible and every space/apostrophe/punctuation. English ASCII letters only; short words hide fewer letters. Full eligible aggregate pool is shuffled before cap10. No new learning content or media is generated.

Each blank is a48×56px input embedded in the visible word. Type a letter, backspace to the previous slot, paste the missing sequence, or tap the shuffled bank of the correct missing letters (including repeated letters). Typing advances focus; bank taps do not force-open the keyboard. English-word listening and the stored meaning/picture give context. Incomplete answers cannot submit; IME Enter cannot submit while composing. Wrong/correct feedback uses the existing Next flow; checked values are restored after reload.

`Question.missingIndices` is durable and optional for old modes. New-mode cloud/archive validation requires1–3sorted unique indices on letters, within the word, and at least one letter left visible. Server checks only the missing sequence, keeps case-mode/NFKC rules, rejects full-word submissions as incorrect, revalidates approved revisions, and records one attempt per question. No reviewEvent/reviewState/SRS or memory claim.

Offline uses the same transpiled mask helper and validates/checks the missing sequence against saved approved words. The helper is in the shell precache and build fingerprint. An existing extra parenthesis in offline distractor selection was discovered by actual browser parsing, fixed, and covered by a module parse regression. No source group records or previous learning history were changed.

## Verification

Node24.14.1/pnpm11.25.0.

- `pnpm test tests/unit/missing-letters.test.ts tests/unit/offline-game-syntax.test.ts tests/integration/missing-letters-game.test.ts tests/integration/learning.test.ts tests/integration/grammar-practice.test.ts tests/integration/cloud-sync.test.ts`: **44tests PASS**,1.91s. Random mask sizes, preserved separators, invalid/whole-word masks, approved-only eligibility, stable pause/get/archive/cloud snapshots, partial answer checking, stale revisions, one-attempt and no SRS changes; old learning/grammar/cloud regressions retained.
- `pnpm lint`, `pnpm typecheck`: **PASS**. Scoped mechanical detector: `[]`, not a human UX pass.
- Discovery selected6tests in `missing-letters.spec.ts` (three scenarios × desktop/mobile). Final `pnpm test:ui -- --mode production missing-letters.spec.ts --port 4355`: **6PASS**, build28.3s/browser10.8s, owned snapshot `wfk-ui-source-kqtIJk`.
- Cases: three inline blanks and taps, pause/reload preserve mask/checked values, exactly one attempt/no SRS, keyboard/paste/IME guard, incorrect-answer recovery, offline open/tap/check and overflow checks. [Desktop correct](missing-letters-game/desktop-missing-letters-correct.png), [mobile correct](missing-letters-game/mobile-missing-letters-correct.png), [mobile wrong](missing-letters-game/mobile-missing-letters-wrong.png). One batched screenshot inspection; no physical-device/human/child study claim.
- Result: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-S1Ylez/result.json`; final source fingerprint `f561e9e8cf05d5d91e9eaace1749da3335b48d24724e9f8e5a590dbbcfbebddc`.

### SQL0009 — hosted constraint verified

`node scripts/apply-missing-letters-game.mjs`: **PASS** rollback temp fixture retaining all six existing modes, accepting missing-letters, rejecting invalid; **PASS** additive hosted mode constraint apply/verify. Only check constraint DDL; no session rows, RLS, ownership, content, keys or account settings were changed. Local Management token is read from existing local config and is not uploaded or printed. This verifies DB compatibility, not a hosted new-UI/cloud-sync end-to-end session.

### Failures and limits

The early dev runner suffered full HMR reloads during route compilation; no final pass is claimed for those runs and the app was not patched around them. Production probes opened the online game and isolated an offline module SyntaxError (extra parenthesis), then confirmed the fix. Fixture repairs: explicit offline scope opening, named temp-table check matching the migration, textContent comparison for inline-mask whitespace, and the actual existing Next-button label. Temporary diagnostics were removed. All final production cases passed on the current fingerprint.

`pnpm docs:check`/`git diff --check` recorded after evidence update. Runtime logs/setup/build/test timing are available in runner artifacts; tokens unavailable. UI/API have not been deployed; live voices, physical keyboard/phone/PWA install and child pedagogy remain unverified.
