# ADR110 — học ké B1–B2,29/10/2026

Status29/10 follow-up: **implemented/deployed / full300-parent backfill complete, owner content review pending**. Founder reviewed pilot and explicitly authorized full processing. Final coverage300/300parents,596suggestions,0missing/errors;20pilot preserved and11original tables unchanged. Earlier pilot-only/blocker paragraphs below record the prior checkpoint, superseded by the final verification section.

## Delivered

- Settings → **Hiện nội dung B1–B2**, off by default per browser/library scope, retained on reload, independent of account preferences. Enabled word/grammar sections remain collapsed until expanded; toggling never generates, deletes or approves content.
- Manual add and photo lesson Save generate pending extensions independently of visibility. New manual grammar content through word editor is included. AI failure preserves valid original save; successful results and retry states stay separate from the child's content/SRS.
- Independent B1/B2 practice suggestions distinguish near-synonym, collocation, reformulation and added ideas. Vietnamese meaning/use/differences, two bilingual examples, grammar formula/conditions/analysis/error/correction; original evidence is preserved. AI CEFR is unverified; null IPA is allowed and exact sentence audio stays available.
- Word and grammar detail expose gated disclosures with editing/approve/reject and a common supplement Save, pending/error feedback and CAS. Library supplement list supports B1/B2, current lesson/search and group filters. Reviewed/edited records are preserved on enrichment; source changes mark stale and parent deletion prevents use.
- IndexedDB7 and separate `learningExtensions` collection; SQL0015 `learning_extensions` with composite owner/library parent FKs, indexes, forced owner RLS, deletion guard, change feed and explicit cloud_apply allowlist. Shared projection excludes pending/rejected suggestions and private job ID. Existing shared content stays read-only.
- Archive old/new checksum normalization, backup, guest transfer, content-copy parent remapping and sync include supplements; no artificial child SRS/progress records. Settings includes resumable missing/failed-library generation with backup download and cancellation.

## Scope and target-account state

Read-only inventory:185headwords/249active sense records/251examples/71learning records,51with grammar/pattern. Runtime manifest found249eligible words+51current grammar records =300parents. Raw grammar records are not grouped UI totals.

20pilot parents (12senses+8grammar) were generated with Gemini, reviewed and corrected by this coding agent, then saved **pending** into the specified account. Corrections include watch noun→timekeeping context, avoiding treating cool as a harder synonym for cold, contextual use of can/be able to, rejecting invented grammar errors and advanced/incorrect inversion, and clear added-idea labels. No independent human/CEFR verification is implied. No approvals were fabricated.

Private account backup (~20MB), source manifest, provider checkpoints and pilot curation are under ignored `.local/learning-extensions-private/` with a private directory; no learner export/key is committed or uploaded to Vercel. `.vercelignore` excludes `.local`, `.env*` and Supabase CLI state. The20pilot write used source-version/library locking and cloud_apply so change feed/client payload remain consistent. No original sense/example/grammar/SRS content was rewritten by the backfill operation.

Automatic approval review initially rejected sending the pilot account data to Gemini; founder explicitly replied **“Cho phép Gemini xử lý nội dung này”** and the pilot proceeded. Automatic review subsequently rejected full280remaining processing, saying the conditional approval needed explicit founder confirmation of pilot suitability. That second action has not run; a separate confirmation was presented after deployment and reviewable pilot were ready. Do not bypass that pending approval by changing batch size or destination.

## Verification

- Node24.14.1, pnpm11.25.0; lint PASS and `next typegen` + `tsc --noEmit` PASS.
- `vitest run tests/integration/learning-extensions.test.ts tests/integration/word-edit.test.ts tests/integration/content-copy.test.ts tests/integration/library-sharing.test.ts tests/integration/cloud-sync.test.ts`: **38/38 PASS**,5files. Covers pending/idempotent atomic save, source/CAS/user-edit preservation, scope/deletion, old/new archive, transfer, cloud contract, bounded serial checkpoints/failure and grammar parent/staleness.
- `sh scripts/test-learning-extensions-sql.sh`: isolated native PostgreSQL15 PASS. Applies current migrations then checks owner read, cross-owner denial, draft filtering/reindex in sharing, sync allowlist/change feed. SQL output `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-extensions-pg.EtFh8P/sql.log`. This was scoped SQL verification, not a full release suite.
- UI discovery then `node scripts/test-ui.mjs -- --mode production learning-extensions.spec.ts search-batch.spec.ts --port 49127`: **24/24 PASS**, mobile360/desktop1280,12unique behaviors. Main/error manual add, hidden generation, config/collapse/reload/approve without extra AI calls, photo scan-all/dedup/checkpoints/cancel/resume and previous photo regressions.
- Final source: HEAD `bd8816956e4993ef5f8ff4a297a5f549541077bd` +dirty, fingerprint `37bf82717cf81dd7433400d935616e96667adf1889cc5ccd7e7d5a7778d2bbe3`. Build35.0s/browser33.4s. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-svKwPY/result.json`; owned snapshot `wfk-ui-source-ey3oiC`. These source identities refer to authored app/test/script content; later evidence/bootstrap documentation updates are tracked separately.
- Impeccable scoped mechanical detector returned `[]`; visual inspection of mobile hosted screenshot retained existing theme/readability. Detector success is not human UX acceptance.
- Hosted SQL0015 applied, forced RLS verified. Vercel `rghjw4yah` production build/deploy PASS, aliased to [app](https://words-for-kids.vercel.app); no new env or push to main.
- Hosted smoke `/private/tmp/wfk-verify-extensions-hosted.mjs`: owner push/pull new entity PASS, foreign-account403 PASS,1280/360 hidden→enable/collapsed→expand→reload-collapsed PASS. Two task-created Auth fixtures and their data cleaned in finally. Screenshots `.local/learning-extensions-synthetic/hosted-1280.png` / `hosted-360.png`. No founder browser was opened or controlled; no real Google OAuth claim.

## Repro/fixes and limits

- Sandbox blocked localhost bind with EPERM; runner's generic message said occupied. An explicit bind probe distinguished this from a real collision. Isolated UI/Postgres processes were rerun with necessary sandbox permission; no unrelated server stopped or global setting changed.
- Some pnpm invocations selected Node23 or tried dependency housekeeping from a restricted context. Correct Node24 PATH/direct installed binaries were used; no dependency/version/global-config change. A task-created8KB `.pnpm-store` scratch index was removed.
- Production build exposed a real module cycle: repository→extensions→AI→worksheet/content→repository. AI import is now lazy in the explicit job runner; production build and hosted path pass.
- Dev cold-route timing caused initial UI failures; photo fixture also set input before readiness. Correct readiness/mocks and final production snapshots prove the actual behavior. Legacy mock photo responses were extended to understand the new stage, without weakening scan/dedup assertions.
- Hosted fixture initially read aria-checked before the saved preference hydrated, then toggled it off on the second viewport. Waiting for the stored state before interaction fixed the fixture; no app change was made for that fixture error.
- Direct native response-schema probes got HTTP400; removing schema got HTTP200 but malformed JSON. Reuse of the existing bounded streaming adapter plus strict validation worked. Initial grammar content still omitted required teaching fields; explicit top-level kind plus targeted one-time repair fixed the pilot's last4items. Network/key/quota are not retried as content repair.
- Physical phone/PWA/real camera/audio and human/content quality remain acceptance. Suggestions are pending and CEFR-unverified. The system does not infer the founder's language level or claim mastery. Full remaining280target backfill is pending permission, not a provider-quality or account-sync PASS.

Next action: after explicit founder acceptance of pilot/full processing, resume `node .local/learning-extensions-ops/hosted.mjs backfill`, verify300parent results/statuses and unchanged original content, then update current state/counts. CLI source/config: `scripts/learning-extensions-hosted.ts`, `scripts/learning-extensions.vite.config.mjs`; compile with the installed Vite binary. Never print private JSON/key material.

## Full-library follow-up —29/10/2026, founder authorized

After inspecting the pilot, founder explicitly said “tao thay cung khá đúng ý tao đó h hãy update hết đi”. This satisfies the previously pending pilot-suitability/full-processing authorization. Full300-parent pass (249senses+51grammar) now runs through existing serial4-parent checkpoints, preserving20curated pilot records and all user decisions. Final counts and original-table hash comparisons will be recorded after completion; no new app release is needed for this data-only run.

## Final full-library verification —29/10/2026,04:34 ICT

`node .local/learning-extensions-ops/hosted.mjs backfill` completed300/300parents with existing serial≤4-parent chunks and source/CAS guards. Preserved20pilot records, generated/saved280additional parents (237senses+43grammar). No app/source change or deployment required this turn.

Read-only verifier `/private/tmp/wfk-extension-verify-all.mjs` produced private `.local/learning-extensions-private/verification.json`, checked `2026-10-28T21:34:54.679Z` (29/10,04:34 ICT):

- 300saved parents:249senses+51grammar;300B1statuses+300B2statuses.
- 596suggestions;4explicit `no_suggestion` cells: B1/B2 for proper name Sam and article a. These are completed results with reasons, not errors.
- 0 missing parents,0error results; all300bundles remain pending owner review.20curated pilot results hash-identical to their reviewed versions.
- Strict completeness check on280new checkpoint records found0missing level/example/translation/required grammar fields;0flagged literary-inversion openings. This does not certify every suggestion's level or pedagogical correctness; owner review remains necessary and CEFR remains unverified.
- 11 original tables hash-identical to backup, including all tombstones:185vocabulary_entries,249entry_senses,281examples,74learning_content,39lessons,271lesson_vocabulary,129review_events,81review_states,190practice_sessions,28practice_cycles,495game_attempts. Active-only counts differ from totals including deleted rows (251active examples,71active learning records). No source/SRS/game-history modifications.

Founder now tests/reviews the full saved library through Settings → Hiện nội dung B1–B2; default hidden/collapsed behavior and per-device scope persist. Privacy approval is resolved by the explicit full-processing instruction; the earlier auto-review blockage is no longer an active blocker. Physical device/independent CEFR/content-quality acceptance remains distinct.
