# Group save with unavailable retained members — 14/10/2026

Direct request: a newly created lesson added to an existing group shows a conflict instead of skipping duplicate words and saving new items. Data risk: preserve existing membership/source sets; keep exact identity, current approval for additions, scoped ownership and group CAS.

## Investigation and fix

Clean working tree at task start. Screenshot is the group-editor submit-error conflict path. `saveStudyGroup` already deduplicates words; the actual reproduced blocker is `uniqueRefs` validating retained sentence/grammar refs against the current approved catalog. Editing a parent word invalidates supplemental grammar targetRevision. Thus an existing ref can disappear from the catalog and throw conflict before saving a newly selected lesson.

Integration reproduction uses real repository methods: seed a group with apple/example/grammar, review apple with a changed example, save a new lesson with repeated apple plus new book, then add it with preserveExisting. Before fix: conflict at uniqueRefs. After fix: book added, apple skipped; previous refs and original source sets kept. Repeating the lesson is unchanged with no version increment. An invented new ref still rejects and leaves the row intact.

Fix only permits a missing ref when preserveExisting is active and both senseId and key match an already saved ref. The existing merge preserves that ref. Approval/visibility are not restored. New stale/foreign/invented refs and actual group version conflicts remain errors. No database schema, cloud DTO, API or UI component changes.

## Verification

Runtime Node24.14.1 / pnpm11.25.0.

- `pnpm test tests/integration/groups.test.ts tests/unit/group-selection.test.ts`:17 passed; includes existing exact dedup, scope/CAS, archive/transfer and legacy-ID regressions.
- `pnpm lint` and `pnpm typecheck`: passed. Final test locator-only edit also passed scoped eslint.
- `pnpm test:ui -- --list group-save-retained.spec.ts`:4 tests discovered.
- `pnpm test:ui -- group-save-retained.spec.ts --port 4341`:4 passed in isolated dev snapshot (mobile360 + desktop1280). Covers mixed duplicate/new lesson, repeated save/reload/member retention, actual concurrent edit with selection retained. Screenshots inspected for mobile success and desktop error; no horizontal overflow assertion passes.
- Final UI source: commit `e5c53c1`, fingerprint prefix `1b87517c1665`. Result/logs/screenshots: `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-RrKngX/result.json`; owned snapshot `wfk-ui-source-M6O5eo` in the same tmp root. Browser phase21.9s; prepare6.0s; discovery0.8s.

Test setup corrections: initial integration fixture incorrectly passed example fields to editWord; changed to supported reviewWord. Vitest rejection assertion caused Dexie transaction-context leakage on the next read; used existing expectFailure helper. Initial UI discovery caught a fixture brace typo. First UI run could not launch because Chromium1248 was absent; installed only the missing test Chromium. Next UI run reached expected saved/error states but broad alert selector included Next's route announcer; scoped it to group-editor. Final run passed. No app changes made for these fixture/environment failures.

No production build required for a local data-function fix. No deploy, hosted sync, physical iPhone or founder account-data test. This reproduces a matching code failure; the screenshot alone cannot establish the exact stale member or remote version in the user's database. No user data/browser, Vercel env or main push touched. Actual token count unavailable.

Docs verification: `git diff --check` passed. `pnpm docs:check` reports three pre-existing missing tmp-result links in unchanged `body-part-photo-analysis-fix.md` (9ajoJt, IVyaxC, fzbwuT); no errors reported for this task's docs. Unrelated evidence left intact.
