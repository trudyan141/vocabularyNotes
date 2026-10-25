# Game expansion Đợt0+1 — 24/10/2026

25/10 rollout update: SQL0014hosted applied/verified and current app deployed; see [follow-up evidence](game-expansion-followup.md). Earlier local-only statements below describe original verification. ADR102supersedes mandatory grammar preparation and removes workshop from hub.

Status: **implemented_local / scoped verified; founder device review pending**. Founder approved Đợt0+1 in this chat, then asked to continue after interruption. No subagents, plugins, runtime dependencies or browser-profile access. Existing proposal/docs diff preserved.

## Scope

Six games: match-pairs, memory-pairs, word-builder, grammar-cloze, grammar-repair, grammar-dialogue. Registry and schemas, reviewed annotations in learning content, source invalidation, tap-first renderers, persisted CAS draft, per-member board attempts/coverage, archive/cloud DTOs, SQL0014 projection/validation, grammar preparation form and project-authored review examples. [Board/contract](../design/GAME-BOARDS-PHASE01.md), [proposal](../DE-XUAT-MO-RONG-GAME.md), ADR101.

Board counts represent questions; coverage counts their targets. Only completed/check-then-next boards cover their keys. Wrong entries remain wrong per member, hint is recorded, skips deferred, replay has no cycle link. No game score modifies SRS. Word-builder supports2–8ASCIIletters, duplicate letter IDs. Pair pool≥3distinct approved pictures within selected scope; short remainder can have1–2pairs. Grammar game cannot run without reviewed activity annotations matching its per-activity sourceHash/revision.

Mẫu:12word references +12cloze/8repair/8dialogue in game-examples.ts, suggestions selected manually in author form; no automatic content injection or extra AI/provider calls. Shape for future placement scene documented only; N3gameplay remains Đợt2. Standalone offline shell does not implement six new renderers; it preserves unsupported rounds and links to practice. Cached main app still uses local repository and audio policy; physical PWA/offline not established.

## Verification to date

-8new integration tests initially PASS; expanded scoped run49/49 PASS across7files (new games, coverage, missing letters, grammar, sharing, content copy, offline syntax).
- SQL0014 applied on isolated PostgreSQL15 through test-sharing-sql.mjs. Sharing roles/concurrent claim/expiry/projection/coverage plus new expansion ownership/coverage/projection fixtures PASS. Hosted SQL not applied by this task yet.
- Initial production build PASS46.8s. Initial UI run1/8PASS: fixture issues in saved-state timing, wrong repair token and locator; native browser process also crashed in one desktop case. Corrected fixture waits and dynamic repair token; author select got explicit accessible label. The run is not claimed as passing.
- Lint/typecheck PASS after implementation; final lint after sourceHash hardening PASS.
- Corrected productionUI **8/8 PASS**, build38.2s/browser21.9s; all six games plus preparation and unavailable data on desktop/mobile. Screenshots inspected in a single batch. Found mobile memory labels cramped beside check icons; fixed vertical tile layout and kept completed tiles readable. Final regression run PASS21/21, build37.3s / browser44.3s runner (39.5s Playwright).
- Hardening regression now **53/53 logic tests PASS**:51unit/integration across7files +2review-example schema tests. Added malicious restored-state cases and independent reapproval per activity. A probe exposed JSON property-order comparison treating unchanged activities as changed; fixed using stableJson of content fields, preserving prior hashes and reapproving only explicitly changed/reviewed activity.
- Review sourceHash is now SHA-256 per activity, not a copied source-text signature. This avoids duplicating private/source data and avoids approving all activities when only one is reviewed again. Shared SQL validates all board peer revisions and approved grammar activity against the current source for recipients; owner history can still sync after later edits. SQL rerun PASS with this change.

Artifacts: initial UI `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-SlVN4u/result.json` (8f70821 +45f99f94c0a2); current rerun `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-kzNe0V/result.json` (8f70821 +03f82b82a1c2). Full commit/fingerprint/commands/runtime/durations are in runner manifests. New code between runs also strengthened restored draft validation and preserved authored IPA when text is unchanged.

## Limits

No deployment, hosted sync, native iOS/PWA, physical phone/TV, real voice listening or child/user acceptance claimed. UI providers are fixture blocked, not live quality evidence. Full docs checker has known pre-existing expired temporary-result links; changed-file links/diff need final check. Tokens unavailable; no cost/token estimate inferred from test time.

Final UI execution passed21/21cases across game-expansion/game-start/missing-letters. Runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-iMNfaW/result.json`, source8f70821 +26ffe54cc8e9; no source changes during run. Mechanical detector reported only pre-existing globals.css side-tab/bounce rules at1643/1571/1482 outside this diff; no findings in new components. Those incumbent styles were preserved.

## Final evidence and use

- `pnpm lint` PASS, `pnpm typecheck` PASS.
- `pnpm exec vitest run` scoped7integration/unit files:51/51PASS; `tests/unit/game-expansion.test.ts`:2/2PASS. Total53unique logic/regression cases.
- `node scripts/test-sharing-sql.mjs`:PASS including new migration/fixtures and existing sharing/coverage/lifecycle. Uses an owned nativePG15instance and removes its fixture directory. No hosted changes.
- `pnpm test:ui -- --list game-expansion.spec.ts game-start.spec.ts missing-letters.spec.ts`:21discovered. `pnpm test:ui -- --mode production game-expansion.spec.ts game-start.spec.ts missing-letters.spec.ts --port4359`:21/21PASS (actual CLI uses separate `--port 4359` tokens). Desktop/mobile Chromium cover six new games; existing game-start also runs mobileWebKit. New nativeWebKit gameplay/device acceptance not claimed.
- Final screenshot confirmation: mobile memory text no longer cramped; completed picture/word tiles retain readable opacity; desktop cloze no duplicate correct sentence. Bounded two visual inspection batches; no human UX claim.
- Git diff whitespace and added/new Markdown local link checks:PASS. Full docs checker not rerun because known3expired temporary links outside this task remain.

Open **Chơi & học →6game mới** to find the six modes. Three word games use the selected library content (pair games require distinct approved images). For grammar, use **Từ của con →Ngữ pháp →bài →Chuẩn bị game cho bài này**, select a review example or edit fields, check approval and save. The form saves one reviewed activity at a time; source changes require each activity to be reviewed again.

SQL0014 must be applied to hosted before releasing these new synced modes there. This task delivers the local implementation/migration and scoped verification; it does not publish frontend or apply hosted SQL. The existing standalone offline shell retains the new rounds and points to the main practice page; six new shell renderers are not shipped.
