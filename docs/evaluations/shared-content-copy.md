# Shared content copy —15/10/2026

Status: implemented_local / scoped verified; founder manual acceptance pending. Local4317 Settings HTTP200; no deploy, SQL change or founder-data operation for this follow-up.

## Result and boundary

Receiving scope keeps Backup & data visible with download-content, explicit preview/confirm add-to-own, and content-file import. Destination is independently verified signed-in owner library or signed-out own guest, never source/demo. Source access is checked before direct snapshot/export and again before direct confirm. Existing own full archive tools remain available when switching to own library; full restore retains empty-library/owner guards.

Strict content.v1 file includes approved visible words/senses/examples, retained grammar/forms, lesson links/groups, notes and approved images/license. No learning events/SRS/sessions/scores, raw evidence/drafts or access credentials. File copies require new-content review; direct confirmation accepts approved source content. Export strips references to deleted lessons while retaining usable words/grammar.

Exact word identity reuse handles existing target and legacy duplicates inside source. Different POS/sense labels remain distinct. Explanation conflicts preserve target/first accepted content and omit attached incoming notes/grammar. Grammar compares normalized full teaching text, translations, conditions, explanations, examples/errors/corrections and variants; IDs, timestamps, source lesson and IPA changes do not cause duplicate units. Different teaching text stays separate. Remapped groups/notes/lesson links use deterministic exact dedup; existing word examples/art are preserved. CAS plus atomic transaction protects target changes. Copy receipts ignore export timestamp; later source additions add only new content, never learning progress.

## Verification

- `pnpm test tests/integration/content-copy.test.ts tests/integration/learning.test.ts tests/integration/media.test.ts tests/integration/library-sharing.test.ts`: **52 PASS**, including9 new content-copy cases. Full graph/license, independent SRS/events, grammar dedup across IDs/IPA, source-internal duplicates, changed snapshots, conflict preservation, pending file review, source readonly/expired guard, checksum/private-field/FK rejection, CAS and retained grammar after lesson deletion.
- `pnpm lint`, `pnpm typecheck`, `git diff --check`: PASS. Impeccable named-component detector: no findings (not human UX acceptance).
- Discovery12 tests; `pnpm test:ui -- content-copy.spec.ts library-sharing.spec.ts --port 4351 --mode production`: **12 PASS** desktop/mobile in14.3s, isolated build37.7s PASS. [Runner metadata](shared-content-copy/production-ui-result.json): commit7673714 + fingerprint8e409cc97d4946b469bd99d48c852f829eb25b6f26f606cfcfaa63cbc1bc92a0. Four copy flows cover signed-out file import/pending review, signed-in direct copy/account sync, download→reimport idempotency, invalid file, destination selection and existing sharing regression. HTTP/auth/cloud are fixtures, not live Google/hosted copy evidence.
- Earlier UI attempts: missing device-name fixture fixed; dev navigation compiled beyond5s, so used production snapshot. Production selectors corrected for Next inactive Activity DOM (scope visible main) and word cards being links, not headings. Signed-out file import rightly remains pending rather than appearing in approved library. No app changes made to bypass those guards.
- Docs check still reports3 pre-existing missing temporary-result links in body-part-photo-analysis-fix.md; no new missing links. Not a docs-validator pass.

## Screens and manual check

[Account/mobile](shared-content-copy/content-copy-account-mobile-chromium.png), [account/desktop](shared-content-copy/content-copy-account-desktop-chromium.png), [signed-out/mobile](shared-content-copy/content-copy-guest-mobile-chromium.png), [signed-out/desktop](shared-content-copy/content-copy-guest-desktop-chromium.png). Layout fits mobile/desktop without horizontal overflow. Captures retain the existing focused skip-link overlay artifact; detector results do not establish human visual approval.

Refresh local4317/settings while receiving. Test Download content and Add to my library, check destination/count/conflicts, confirm, then Choose library. Repeat unchanged snapshot (no new words/grammar), add source content then copy again (only new content). On another device import downloaded file via Import content file, review new words, verify grammar/images/group links and unchanged own progress. Real Google session transitions, hosted sync races and physical device/download acceptance remain manual.
