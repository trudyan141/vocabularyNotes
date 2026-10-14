# 14/10 — Lượt đã làm mới đang dở, tên phạm vi, Words/Grammar

Founder asks to avoid accidental 0-answer resume cards, keep rounds already worked on, name their game/lesson/group in the existing layout, and separate word/grammar game sections.

## Behavior / boundaries

`sessionStarted` requires an answered/advanced question or checked answer (game feedback waiting for Next). Reveal/hint alone does not qualify. Hub uses `resumableSessions`; older untouched snapshots are excluded without deleting unrelated learning or started rounds. Explicit Back to games discards only the latest scoped unstarted snapshot inside a transaction; completed or concurrently started rounds are kept. A transient saved snapshot still supports reload while actively opening a round; navigating away through another route leaves it hidden, not presented as a saved unfinished session. No unsafe unmount cleanup or cross-tab deletion.

Card heading remains the game name. Existing copy column now has explicit named Group, Lesson (including group-set lesson), Word and due/weak scope labels. Names come from the active library's live rows; older rounds without filter report unknown scope. Long names wrap with the existing card, delete/open controls unchanged.

Game tiles retain incumbent illustrations/controls/layout, separated into two named sections: Words (Speaking and word games), Grammar (Listen & understand and Build sentences). Both use the same filter/start paths. Offline fallback also excludes untouched rounds from resume list.

## Evidence

Initial regression failed because resumable API was absent. `pnpm test tests/integration/grammar-practice.test.ts tests/integration/learning.test.ts tests/unit/offline-game-syntax.test.ts`:36/36 PASS, including reveal-only exclusion, answered preservation, checked feedback preservation and safe discard. Lint/typecheck PASS. Impeccable detector[] and diff check PASS; mechanical detector is not human UX acceptance.

UI fixture updated to represent actual started rounds, not synthetic0-answer cards. Scoped discovery6cases (mobile360/desktop1280); tests exercise untouched exit/reload/tombstone, reveal-only exit, real answered resume with group+lesson names, Words/Grammar placement, deletion failure/retry, paging and reload. Final production result below.

No deployment, physical-device or live-account validation. Existing scope/review/game diff preserved. Actual tokens unavailable.

Pre-audio verification: production build passed twice (27.9/27.7s); UI4/6 each run, with new round fixture reading page.url before router canonical session commit (trace confirms null evaluate argument). Fixture now explicitly waits session URL. Dev rerun6/6 PASS45s, runner `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-M31gjS/result.json`, commit3853eca/fingerprintefa690c1c2ef. Dev intermediate5/6 had cold-route30s timeout in long Profile flow; extended that fixture timeout60s. No app changes to mask those fixture/environment failures.

Founder then requested scoped picture choices and automatic listening. Global distractor pool previously ignored selected group/set; lesson-only pool could not fill shortages. Choices now prioritize eligible peers in selected lesson/group/set (ignoring target-only/due/weak reduction for distractors), then fill remaining slots from approved/loadable library pictures, still distinct word/art/meaning. No change to target scope or SRS. Scoped/group fallback regression57/57 PASS across learning/grammar/groups/missing letters.

AudioControl autoPlay opt-in for word game controls, including Speaking game; default stays manual outside games, Grammar manual. Each new question/visible English control starts once, existing cancel/hide/route/mute/voice-readiness guards retained. Timer cleanup avoids StrictMode double playback; manual stop remains stopped until next question. Reverse flashcard English starts only after reveal. Voice preference controls autoplay; sound effects stay separate. Settings wording updated. Fixture tests verify autoplay text/next/manual replay/mute; physical mobile autoplay policies and installed voices are not proven by mocks. Standalone offline remains its existing manual-listen implementation; offline resume0-answer exclusion added.

Grammar tile alignment: removed legacy `.play-tile-grammar` full-width/row override, so both grammar games share equal columns and tile composition. [Final screenshots/results below.]

Final current-source production run: `pnpm test:ui -- --mode production game-scope-replay.spec.ts --grep 'picture choices|unanswered rounds|unfinished sessions|Profile history' --port 4357`:build PASS60s +8/8productionUI PASS17.9s. Source3853eca/fingerprint880b54198575; full result/logs `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-lYCaKs/result.json`. [Grammar row](started-rounds-and-game-sections/desktop-grammar-games-row.png), [mobile hub/named resume](started-rounds-and-game-sections/mobile-named-resume-and-sections.png), [picture options](started-rounds-and-game-sections/mobile-lesson-picture-choices.png). Mock speech confirms exact dispatch/next/mute, not physical speaker output. Final data57tests PASS; detector[] from earlier section/card pass; no new visual layout in audio change.

Concurrent workspace integration after the production run: another change introduced recorded word audio/API and practice-selection files. Preserved those changes and autoPlay opt-in. Transient lint/type errors were observed during that edit and resolved by its continuing edits; no foreign audio implementation was overwritten. Added a null-recording API fixture for the existing scoped speech test to prevent external provider I/O. Current-source compatibility rerun `pnpm test:ui -- game-scope-replay.spec.ts --grep 'picture choices' --port 4357`:2/2devUI PASS, commitc92c3d9/fingerprintb937b8d83f97, `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-mDlkbU/result.json`. Current lint/typecheck/diff PASS. Previous8productionUI/build describes its exact earlier snapshot, not the new recorded-audio route.

Docs check reported3pre-existing expired temp links and generated ui-ux-pro-max __pycache__ inventory drift; no skill source edits or unrelated cleanup performed.
