# Full game pools, custom deck Save, and global words with group provenance

13/10/2026. Direct founder task; ADR086. Working tree was clean at start, base commit `57d411f`. No founder browser, push main, Vercel env, provider calls or new SQL schema. Node24.14.1/pnpm11.25.0.

## Root cause and result

- `PracticeRepository.start` hydrated only first100index records and selected first10 in fixed order. Ready picture words beyond100 could not be targets even with an explicit word filter because distractors/readiness were capped. Grammar also sliced first10 before session construction. Regression tests reproduced fixed-order selection before the fix.
- Read the complete scoped/filtered approved pool, retain media load/decode/meaning and grammar bounds, shuffle before cap10. Picture distractors and answer placement randomize. Short rounds retain durable snapshots/CAS and independent game attempts/SRS behavior. Speaking draws5random aggregate words per new round and holds selected IDs through rerenders. Offline vocabulary games also shuffle the full eligible pool.
- Custom Save was disabled on blank name despite158selected words. Name is optional with visible default-name help; Save assigns “Bộ thẻ của con” and displays real pending/success/error. Select-all uses the same aggregate representatives as paged search.

## Global vs source/group data

Founder explicitly approved31listed same-meaning headwords with differing labels, then clarified that dedup applies **only to the global pool**, with group copies and provenance retained. The destructive remapping plan was not applied. Existing source IDs, all memberships, examples, learning content, media and accepted histories remain unchanged.

An explicit `global-word:<opaque key>` tag associates the reviewed source records in existing metadata. New records can share an aggregate only when lexeme/POS and complete EN+VI definitions match deterministically after NFKC/case/whitespace normalization. Different meanings/POS remain separate; meaning/POS/lexeme edits clear the aggregate association. No semantic AI merge or user-text rewrite. Tags survive existing cloud/archive/text-backup contracts; membership labels are live projections and are stripped from persisted game/backup/input data.

`LibraryWord.groupMemberships` and `lessonMemberships` carry IDs/names from all matching source records in the current scope. Global cards list groups/lessons, detail links open the right group/lesson. Group catalogs/details retain their original source IDs and dates; game/custom global sampling uses unique aggregates.

## Hosted operation — verified

Read-only audit:158source senses,123headwords,31repeated headword/POS groups,34extra source copies; no duplicate exact identity keys. Differences came from rewritten sense labels. Backed up before applying metadata only, compared versions/payloads under a library transaction lock, and ran the same SQL with rollback before commit.65source records received aggregate tags; local content revision and every content field stayed unchanged. Remote versions/updated timestamps and sync changes advanced normally.

After commit:124aggregate meanings across123headwords,158source senses retained. Byte comparison of before/after snapshots confirmed that only sense metadata tags/timestamps and remote record versions changed. Source/group references and history are unchanged:

| Records | Before/after |
|---|---:|
| Examples |189|
| Lesson memberships |170|
| Learning content |44|
| Decks/groups |2|
| Media |104|
| Practice sessions |27|
| Review events |12|
| Game attempts |64|
| Review states |10|

Private account backup, approved mapping, before/after snapshots, metadata-only operation scripts and verification report: `/Users/trunglk/.codex/backups/words-for-kids-dedup-20261013/`. No account dump or secrets committed. A temporary fakeIndexedDB probe using the real backup validated cloud parsing,124aggregate results, unchanged source/global grammar eligibility, source IDs/groups, example/history counts and stable SRS due selection; it passed and was moved into that private folder.

## Scoped verification

- `pnpm test tests/integration/word-aggregate.test.ts tests/integration/learning.test.ts tests/integration/grammar-practice.test.ts tests/integration/groups.test.ts tests/integration/cloud-sync.test.ts tests/unit/library-search.test.ts tests/unit/learning-random.test.ts`: **59tests PASS**,2.60s final logic run. Coverage includes501worddeck full-pool sampling, ready target beyond100 in both picture modes, grammar random draws, approved media/CAS, group/source separation, exact-vs-distinct meanings, edit invalidation, cloud/archive/backup compatibility and SRS preservation.
- `pnpm lint`, `pnpm typecheck`: **PASS**.
- Impeccable mechanical detector for changed components: `[]`; this is not human UX evidence.
- Initial custom deck UI: **2dev cases PASS** mobile/desktop,22.6s. A production snapshot build passed but its run was rejected as stale after source changed; it is **not** final production evidence.
- Final `pnpm test:ui -- --mode production compact-games-groups.spec.ts ready-picture-games.spec.ts speaking-refresh.spec.ts --grep 'custom deck|global word|both picture games|Microphone permission|Speaking rounds' --port 4353`: **14production UI cases PASS** across desktop/mobile, build30.8s/browser14.8s. Base `57d411f`, fingerprint prefix `f611ddee165e`; result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-Z9Rckf/result.json`, owned snapshot `wfk-ui-source-ye6e57`. Covers all-pages blank-name Save/reload, global memberships/source group route, ready/missing/broken/imported pictures, microphone permission recovery, random Speaking rounds.
- The Speaking test initially assumed5distinct display labels; trace showed `apple, bag, banana, bank, bank`, where the two bank records have different meanings. Corrected the fixture expectation to retain these senses; no app fix was made to hide them. Visual inspection also found original+alias appearing twice in the sense chooser; comparator now shares the declared aggregate with its untagged root, preserving the current source route. Scoped unit regression+final production assertion pass. Earlier failed/stale runs are not final evidence.
- Fixture screenshot inspection: [desktop custom Save](game-pools-and-global-words/desktop-custom-deck.png), [mobile custom Save](game-pools-and-global-words/mobile-custom-deck.png), [desktop memberships](game-pools-and-global-words/desktop-word-memberships.png), [mobile memberships](game-pools-and-global-words/mobile-word-memberships.png). Main/error controls and mobile overflow checks passed; no human UX/device claim.
- `pnpm docs:check` and `git diff --check`: PASS. Metrics: bootstrap read was scoped to current rules/task/domain files; tokens unavailable. Rerun reasons: new implementation, stale source guard, legitimate-sense fixture assumption and alias-chooser regression.

No live AI/audio/device/human review or UI deployment claimed. Hosted metadata verification proves the retained account data/aggregate mapping, not that the hosted frontend already includes the local code changes. Random rounds can overlap; no guarantee of exhausting every item before repeats. Content requiring images/short grammar examples still follows readiness/approval and token bounds.
