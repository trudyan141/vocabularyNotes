# Whole-sentence IPA and listening — local evidence, 11/10/2026

Founder requests every concrete English example to have whole-sentence IPA directly underneath and its own listen button, including generated examples. Also asks where the Speaking model is stored/deleted and prefers Gemini Free Tier Vietnamese advice. Founder confirms the chosen key/project is Free Tier without billing; no account inspection or live API call was performed.

## Implemented locally

Shared `SentencePronunciation` owns whole-sentence AudioControl, preserves stored text/version pronunciation precedence, guards async results against changed text, and exposes unknown IPA rather than inventing it. Detail/additional examples, library/group sentences and concrete grammar examples, prepared/reviewed content, grammar steps and revealed practice cards use this row; common mistake/correction examples also have controls. English → IPA/audio → translation. Symbolic formulas remain formulas. Device voice readiness/cancel/sound preferences remain in existing AudioControl. Offline card and revealed offline flashcard add Nghe câu with the same exact-text intent.

Worksheet generation requests optional nullable `commonErrorIpa`/`correctionIpa` alongside `exampleIpa`; validation rejects obvious headword-only IPA on multiword sentences and IPA without matching text, not a proof of phonetic accuracy. Supplement editor clears corresponding IPA when English changes. Optional fields survive backup and existing cloud JSON payload; grammar section deletion clears them. Restore retains the existing review requirement rather than auto-approving imported content. Unknown/unverified readings remain labelled; no automatic user-data migration.

Found and fixed pronunciation lookup403: Next normalized nextUrl hostname to localhost while isolated server used127.0.0.1. Reuse Host-aware sameOrigin boundary; cross-origin and cross-site requests stay rejected. No cloud/database call from this route.

## Scoped checks

- Scoped ESLint:20 changed code/test files, `--max-warnings=0` PASS; `node --check public/offline.js` and `public/offline-games.js` PASS.
- `pnpm typecheck` PASS.
- `pnpm exec vitest run tests/unit/sentence-ipa.test.ts tests/unit/byok.test.ts tests/integration/learning.test.ts tests/integration/deletion.test.ts`: **58/58 PASS** final run. Includes prompt/validation, Host/origin boundary, archive optional IPA preservation and section deletion.
- `pnpm build` PASS. Initial build before UI checks; one additional final build was justified by the observed API403 fix, not repeated after cosmetic/docs changes.
- Playwright isolated localhost4320 fixture profiles, desktop1280/mobile360: existing whole-sentence IPA/edit cases **2 PASS** in earlier focused run; new exact sentence/listen, unknown guide/audio, prepared grammar **6 PASS** final rerun12.6s; new offline full-sentence listen **2 PASS**4.7s. **10 distinct scoped cases passed** across runs. Initial sentence-listen cases failed on403; fixed route and reran failed/affected cases. Initial archive expectation incorrectly assumed auto-approval; corrected to test existing import review boundary, then relevant cases passed.
- `python3 scripts/validate_docs.py` PASS (488 local links); `git diff --check` PASS.

Fixture TTS records the exact utterance text and invokes completion; it proves event/target handling, not device voice/audio quality. Unknown IPA API is mocked. No real Gemini, child audio/mic, production/cloud integration, SQL, physical-phone/human acceptance or full suite. No commit/push/deploy; prior local work preserved.

## Visual evidence

Six screenshots inspected: IPA/audio remain beneath exact English and ahead of translation, no horizontal overflow; mobile controls wrap within the card. Keyboard-focused skip link visible in some screenshots is the existing focus state. Grammar sentence with unsupported slash separator legitimately shows unavailable guide and a listen control.

| View | Desktop | Mobile |
|---|---|---|
| Revealed flashcard | [Screenshot](sentence-listen-screens/desktop-chromium-flashcard.png) | [Screenshot](sentence-listen-screens/mobile-chromium-flashcard.png) |
| Prepared grammar | [Screenshot](sentence-listen-screens/desktop-chromium-grammar.png) | [Screenshot](sentence-listen-screens/mobile-chromium-grammar.png) |
| Offline example | [Screenshot](sentence-listen-screens/desktop-chromium-offline.png) | [Screenshot](sentence-listen-screens/mobile-chromium-offline.png) |

## Speaking design update; not shipped controls

Founder plan17/spec15 explain the old318MB model was replaced by pinned English355MB +≈22MB runtime. Planned origin-specific browser CacheStorage is separate from IndexedDB library; deleting only Speaking model cache must preserve lessons/auth/settings. Clearing all site data can also delete local lessons. Missing/deleted model disables local assessment until downloaded again; supported sample/record/replay remains independent. Browser may evict caches; no permanent-storage claim. Existing experiment uses a temporary local cache, not deployed app download/cache/delete controls.

Optional Gemini advice receives only target and bounded local per-word/phone evidence after gesture, no child audio/name/full library. AI cannot override local score/colors or invent uncertain diagnosis. Structured VI advice has timeout/cancel/schema guards and fixed templates on quota/offline/off/error; no paid fallback/automatic retries/key rotation. Coaching adapter/UI remains planned for SP2; no claim personalized AI advice or speaking scoring already works. User confirms Free Tier/no billing; client cannot prove future billing state. Provider child-facing eligibility remains unresolved before live use.

Primary storage/billing references: [CacheStorage](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage), [browser eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria), [Gemini billing tiers](https://ai.google.dev/gemini-api/docs/billing), [Gemini terms](https://ai.google.dev/gemini-api/terms).
