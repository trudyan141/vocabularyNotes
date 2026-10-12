# UX/UI implementation plan — implemented and scoped verified

Date: 2026-10-12. Review target: current dirty working tree based on `bc2983a`; exact run fingerprints in [evidence](../evaluations/ux-review-2026-10-12.md).

Human review is [DE-XUAT-UX-UI](../DE-XUAT-UX-UI.md). Founder explicitly approved all four phases on12/10 and added two group fixes: bulk selection affects new additions only; one headword row in group filters, retaining sense data. Implementation evidence: [UX completion](../evaluations/ux-ui-implementation.md).

## Constraints and evidence method

UI/UX Pro Max requested by founder; Impeccable, Motion Design and Systematic Debugging used for supporting review. Preserve incumbent Theme C, Nunito, Fox, four current main navigation destinations, two reading content types (word/grammar), direct child editing without parent gate. No subagents per project instruction. This was an in-thread review, not Impeccable's independent dual-agent critique; detector advisory is not human UX evidence. No init/new design-system generation, new component framework, icon replacement, package installation or hooks.

Acceptance for this task: inventory screen families/routes; inspect isolated mobile/desktop captures and source; separate observed defects from design hypotheses; publish human-readable staged proposal, technical handoff and honest verification limits; preserve pre-existing diff.

Risk: inferring child usability from screenshots; mistaking fixture-disabled authentication/network for production defects; confusing archived S01–S16 specs with current route implementations; changing data semantics while simplifying forms; invalidating caller-owned unsaved state with sticky controls.

## Findings → implementation boundaries

| ID | Evidence / hypothesis | Owning modules | Proposed scope |
|---|---|---|---|
| UX01 | Reproduced mute reset in settings→practice→settings at both viewports. `PracticePreview` effect forces `sound:true`; `change` passes literal true to unlock/play | `features/practice.tsx:29,59–60`, `app/provider.tsx`, `lib/audio/game-sounds.ts`, `features/settings.tsx` | Remove forced preference mutation; use actual preference for cue creation/play; stop pending cues on mute/pause/route/hide. Keep common setting initially unless splitting approved |
| UX02 | Mobile library search input top ~614px, list below first viewport, management above search | `features/library.tsx`, `lesson-library.tsx`, `groups.tsx`, shared CSS | Reorder reading controls; collapse management under labelled disclosure; scope selection stays explicit. Filtered lesson CTA stays contextual |
| UX03 | Initial add: 16 visible inputs; save ~2380px, total2556px. Edit total2251px; multi-example/IPA fields visible | `features/add-word.tsx`, `word-editor.tsx`, `media-editor.tsx`, `ui/submit-button.tsx` | Word first; default date preserved but collapsed. Review summary and explicit section editing, retain all values/fields. One save owner and one operation state |
| UX04 | Revealed card1116px at360×800; rating actions below first viewport | `features/practice.tsx` QuestionView | Prioritize target/meaning/rating, disclose longer examples/details. Preserve SRS ratings, delayed writes, version/CAS and pronunciation whole-sentence exactness |
| UX05 | Extract summaries only artwork/headword; selection/meaning inside details, expands eight inputs | `features/extract.tsx`, `review.tsx`, `capture-batch.tsx` | Summary word/VI/sense/selection; selection control outside summary trigger to avoid nested interactive elements; expand editor on explicit action; count selected/complete/incomplete; one atomic save |
| UX06 | Three different image-search actions named similarly; upload/paste sections repeated per preparation card | `features/word-picture-search.tsx`, `prepare-library.tsx`, `picture-choices.tsx` | Explicitly name external Google versus internal catalog/Commons search; keep always-visible Google route; collapse upload tools. Preserve candidate arrays, currently-selected art and staging until shared save |
| UX07 | Group selection has whole-library word+grammar vs active-tab all vs page all; save ~2046px. Deck save ~1941px | `features/group-editor.tsx`, `decks.tsx`, `review-groups.tsx` | Scope-aware selection labels; keep global select and current filter/page actions available; condensed sticky selected-count/save only on mobile. Do not remove whole-result selection capability |
| UX08 | Seven mode choices; in-progress sessions below modes/options | `features/practice.tsx`, `today.tsx`, `speaking.tsx` | Prioritize existing resume; deterministic, eligible beginner suggestion without AI or auto-start; preserve selectable modes and query parameters |
| UX09 | Source risks: GrammarSteps only checks OS reduced motion when starting timer; app reduced motion only disables CSS. Need targeted reproduction before implementation | `features/grammar-steps.tsx`, `features/settings.tsx`, `globals.css` | Stop timer on either app/OS reduce/hide; manual steps always work, no autoplay narration. Do not report this as browser-reproduced until probe |
| UX10 | Replay uses icon-only UserRound despite accessible label; detailed phonemes rich but technical | `features/speaking.tsx`, `app/audio-control.tsx` | Visible replay label; one practical advice sentence before detail table; graceful permission/error/replay and no claimed calibrated skill score |
| UX11 | Settings labels Beginner/Intermediate and feature explains no sample adaptation; sound label under-describes game SFX | `features/settings.tsx`, `lib/preferences.ts`, preference persistence | Plain locale copy, optional two audio preferences only if approved. No new parent gate or secret setting persistence |
| UX12 | Empty grammar text has no contextual CTA; speaking empty has description without CTA; legacy review contains stale “not connected” copy | `content-library.tsx`, `speaking.tsx`, `review.tsx`, missing/error/offline paths | Distinguish empty library/search/stale item; provide recovery appropriate to current scope. Legacy route must not imply current extraction unconnected. Preserve redirect/404 semantics |

Observed geometry belongs to a particular fixture, locale and viewport; do not convert scroll height into performance or usability score. Source suggestions need live verification during their approved implementation.

## Delivery order and meaningful acceptance

### Phase 1: UX01–04 + Today priority

- Regression: sound=false persists after navigating practice and reloading; active cues stop on mute. Assert no AudioContext construction/play while disabled, correct cue once after persisted outcome, rejected save produces no success cue. Existing OS/app reduce behavior stays compatible.
- Library VI/EN, initial/filtered lesson/empty/error at360/1280: search and a word card visible in the first mobile viewport with standard fixtures; label/focus/tab ordering follows visual ordering.
- Add/edit: preservation of hidden values and selected sense/POS; query changes don't overwrite newer user input; selected picture stays staged until Save; error and stale revision preserve edits; success only after transaction. Do not add literal-copy tests.
- Revealed flashcard: Again/Good reachable without traversing full pronunciation/extras; no double rating. Secondary detail exposes Hard/Easy and existing examples without truncation/loss.
- Review visually before moving to next phase. Build not required for component reorder unless production preview requested or routing/config changed.

### Phase 2: UX05–06 + capture clarity

- Keep ADR082: all previews before analysis, scan-all before enrich, no silent truncation, one review + one transaction. Do not move analysis before image previews merely to achieve first-fold target.
- Draft checkpoints/CAS source/model/mode snapshots must survive stop, quota and reload. No network call from mounting/reloading drafts; existing explicit analyze action preserved, no new role/confirmation gate.
- Collapsed item summary accurately displays current edit, sense and selection; multi-sense stays separate. Grammar examples show exact sentence audio/IPA, text edit invalidates prior pronunciation/hint as today.
- Google opens only from explicit action; internal source search remains separate. No auto-fetch pasted URL, no upload on merely opening disclosure; signed receipts and license metadata remain.
- Empty source, source error, paste permission denial, multiple/invalid/overlimit files, click re-entry, unmount abort and staged image save errors remain recoverable. Preserve current uncommitted media work.

### Phase 3: UX07–08 + coherent names

- Select all spans filtered pages; page-only applies to visible page; query/tab/page changes preserve outside-filter selections. Keep approved-item rules and deterministic dedup; no consolidation of group/deck schemas or entry IDs.
- Sticky footer uses safe-area bottom + main-nav height, does not obscure keyboard/focus/error or form contents; single SubmitButton wired to same form/save function; selection count remains current. Remove sticky mode if it reduces usable height with keyboard.
- Test >12 items and multiple pages, both locales; failed save/stale target leaves name/member choices intact. Lesson deletion preserves learning items.
- Resume shows saved session snapshot, no automatic starting/completing/rating; eligibility suggestion only proposes ready mode. Score remains game/session outcome, not SRS mastery.

### Phase 4: UX09–12 + sounds/motion

Founder decision: keep global sound control or split `gameSounds` / requested speech playback. If split: define backward-compatible mapping from old `sound` without restoring an explicitly muted setting; whitelist small preferences across local/account settings/backup as current contracts require; no credentials inside content stores. Review interface simplicity before adding further controls.

Motion spec for approved additions: press120–150ms; selection120–180ms; result/reveal180–240ms; finite success280–480ms; opacity/transform only. Existing game cues and Fox greeting retained, no ambient loop/confetti/background music/global click sounds. Idle loading activity may indicate pending work but never fake percent or delay actionable controls. Data writes determine success; animation completion never governs persistence or next-question timing.

Audio: short original cues, no new external/provider request for UI sounds; user gesture unlock; no overlap with target speech, recorded replay or mic. Pause/route/hide/mute/unmount stop; reduced motion static and current optional SFX policy preserved until explicitly changed. No sound on error/deletion/network/notification by default.

Test rapid taps, hide/show, preference changes mid-session, missing device voice, mic permission denied, invalid recording, offline, pending/failed provider fixture. Phone/browser audio quality and child response need physical-device/human validation; mocks do not prove live calibration or provider eligibility.

## Required skills and checks when implementing

Read then-relevant UI/UX Pro Max + Impeccable + React skill; Motion Design for motion; Systematic Debugging for reproduced defects; vocabulary-delivery for multi-step project work. Database/schema changes are outside this proposal; if unavoidable, load Supabase/Postgres skill before SQL and obtain scope from founder decision. No new plugin/hooks/global installs/subagents because a skill suggests them.

Discovery via `pnpm test:ui -- --list <existing relevant spec>`, owned snapshot, scoped behaviors per ADR050. Lint/types for app edits; docs:check/diff for docs. Build once at end only when route/API/config/PWA/dependency or production preview requires it. Human visual review ≠ detector pass; release-wide/device/live gates remain separate.

Relevant existing regressions: `compact-home`, `compact-games-groups`, `edit-and-feedback`, `review-grammar`, `search-batch`, `word-picture-intake`, `media-source-errors`, `group-picker-pictures`, `speaking-refresh`, `learning`, `notifications`, `profile-library` (pick exact cases; don't run everything for each phase).

## Handoff after founder review

Record exact approved phases and audio choice in TASKS linked to the human proposal; update applicable spec/DECISIONS only when a product decision is accepted. Implement one phase and show it before the next if founder wants phased review. Keep source fingerprint, test command/result/limits in evaluation. STATE only current task + one next action, no duplicated report. Current next action: founder visual/device review of delivered changes.

## Approved implementation choices

Retain account `sound` as requested-speech preference. Game SFX use a separate tiny per-device `wfk.game-sound.v1` setting with legacy `sound=false` migration; no new server/SQL field. Both controls are explicit in Settings; no cloud claim for device SFX. Existing saved group IDs/refs/sets are protected in add-only editor and transaction; deleted/unapproved saved members cause safe validation failure rather than silent removal. Reading/picker projections group headword+caseMode only, expose sense controls separately.

Completion:46unit/integration+66productionUI/lint/types/build PASS;2explicit live-media skips.74current screenshots and failed-run accounting in [evidence](../evaluations/ux-ui-implementation.md). All4phases and2group fixes implemented; no deploy/live/device/human pass claimed.
