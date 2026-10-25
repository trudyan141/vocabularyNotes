# Game follow-up —24/10/2026, ADR102

Scope: founder screenshots: automatic memory turns, distinct menu images, remove duplicate workshop, spelling hint bank, immediate grammar play. Existing dirty expansion and offline coverage changes preserved. No subagents, dependencies, browser automation against founder profile, hosted migration or deployment.

## Delivered behavior

- Memory mismatch closes after1second through existing repository/CAS action, including after reload. Effect cleans up on version/question/unmount changes; one automatic close attempt per version avoids repeated writes on failure. Matching cards remain visible and clear open slots immediately, allowing the next flip. No Continue button. Existing board attempts/coverage and resume contracts retained.
- Workshop removed from hub; legacy snapshots/history/replay retained. Spelling Hint shows every character shuffled, including repeated letters; avoids solved order whenever distinct letters permit. Offline spelling hint follows the same rule.
- Three grammar modes first open available reviewed library activities. Only not-ready/complete falls back to an authored ready-to-play pack:12cloze,8repair,8dialogue. Context, question audio, optional per-answer audio, explanations, feedback, progress through the pack and replay work without preparing content. Library activity form remains optional. Built-in pack is visibly labeled; it does not create library content, attempts, coverage, SRS or cloud records. Its round score lasts only while the screen remains open; leaving/reloading restarts it. CAS/storage errors are not disguised as fallback.
-14visible menu modes including Speaking each use a distinct decorative illustration. Built-in imagegen generated the transparent atlas, then refined spacing. Explicit CSS viewports exclude adjacent drawings; WebP is used for delivery, PNG retained as generated source. Atlas is decorative UI, never used as sense illustration.

## Verification

- `pnpm lint`, `pnpm typecheck`:PASS.
- Scoped Vitest `tests/unit/game-expansion.test.ts tests/integration/game-expansion.test.ts tests/integration/practice-coverage.test.ts tests/unit/offline-game-syntax.test.ts`:26/26PASS. Includes duplicate spelling hints/non-solved order, immediate matched-card reopening, existing persistence/CAS/coverage/archive/cloud contracts and offline syntax.
- Discovery selected10cases. Corrected production UI `pnpm test:ui -- --mode production game-expansion.spec.ts --port 4363`:10/10PASS on desktop/mobile Chromium, build38.6s/browser32.7s. Source8f70821 +58c83b598bbd; result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-6NXHWo/result.json`.
- Initial run5/10: reload assertions navigated before IndexedDB commit; fixture now waits for saved state. Another assertion counted Next's empty global alert; now scoped to activity. No app workaround for these fixture issues. Initial production result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-yQbe8o/result.json`.
- Subsequent changes: regenerated art/viewports and ensured Back to games clears any prior completed session. Final menu mobile/desktop dev visual run2/2PASS, prepare6.1s/browser25.7s, source8f70821 +83781e77f545; `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-cALE5e/result.json`. Inspected final mobile menu and grammar fallback; adjacent art fragments fixed. Final lint/typecheckPASS. Final production rerun10/10PASS including menu and all28built-in activities per device plus replay/Back to games. Build39.7s/browser32.5s, source8f70821 +5c6b91205c2a; `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-vq43LD/result.json`. Intermediate dev grammar run timed out with Fast Refresh reloads during compilation; no app workaround, stable production rerun passed. Final typecheck and diff checkPASS. No new SQL changes; previous SQL evidence remains specific to expansion0014.

## Image provenance and prompts

Built-in tool, no external repository art/license claim. Saved source [PNG](../../public/illustrations/game-menu-atlas.png), runtime [WebP](../../public/illustrations/game-menu-atlas.webp), viewports [component](../../src/components/features/game-menu-art.tsx).

Generation prompt:
> Use case: illustration-story. Asset type: ONE square game-menu illustration atlas for Words for Kids ages 5–8. Exactly 4 by 4 equal square cells, transparent backdrop, no dividing lines, each object centered with generous padding inside its cell; never cross cell boundaries. Cohesive adorable flat hand-drawn children's sticker illustrations, thick dark plum outlines, soft peach mint lavender butter-yellow colors. Row 1 left to right: friendly orange fox holding microphone; stack of colorful flashcards with star; framed apple picture with small eye; headphones around a cat picture. Row 2: pencil filling missing alphabet block; small teal keyboard and letter blocks; magnifying glass over missing letter puzzle; two cards joined by curved matching ribbon. Row 3: face-down cards and face-up bear card; open storybook emitting sound waves; train of colorful word blocks; sentence puzzle with one empty piece. Row 4: pencil with doctor's bandage repairing a sentence strip; orange fox with two speech bubbles; closed treasure chest; sparkling trophy. No readable text or letters, no logos or watermark. Each cell visually distinct. Uniform 4x4 layout suitable for CSS background-position cropping.

Final edit prompt, referencing initial atlas:
> Edit target: the attached 4x4 game illustration atlas. Preserve all sixteen exact distinct illustration subjects and their existing row/column ordering, style, colors and transparent background. Fix ONLY layout and spacing: perfectly uniform four columns and four rows on a square canvas. Every illustration must fit fully INSIDE the central 70% width and 70% height of its own equal-sized square cell, leaving 15% transparent padding on ALL four sides of EVERY cell. Reduce the drawings enough to enforce these strict margins. No object, foot, sparkle, ear, shadow or outline may enter the 15% empty padding or any neighboring cell. Do not add any objects or text. This will be used as a CSS sprite sheet; clipping across rows causes visible fragments. Keep genuine alpha transparency.

## Limits

Deployment completed25/10; hosted guest smoke and SQL verification below supersede the earlier local-only status. No physical phone/human-child or full account-sync acceptance claimed. Audio endpoints are fixture blocked in browser tests; not evidence of live pronunciation quality. Built-in grammar rounds intentionally do not claim persisted library coverage. Token/cost metrics unavailable.


## Hosted rollout25/10/2026

- `node scripts/apply-game-expansion.mjs --apply`:PASS hosted rollback fixture, then SQL0014applied; trigger/mode constraint verified, legacy review/game-attempt constraints unchanged and isolated auth fixture absent after rollback. Local management token stayed local. No existing learning records changed. Script supports fixture-only default and guarded rerun.
- `vercel deploy --prod --yes`:PASS, Next build49s; deployment [157hc242i](https://words-for-kids-157hc242i-trudyan141s-projects.vercel.app), production alias [Words for Kids](https://words-for-kids.vercel.app/practice). No push main or Vercel environment changes.
- `node --check scripts/apply-game-expansion.mjs` and `node --check scripts/verify-hosted-game-expansion.mjs`:PASS.
- Hosted UI smoke:8/8PASS — three games on1280px/360px plus active service worker on each. Menu hides workshop, distinct atlasHTTP200, correct feedback/next/back/no-overflow verified; artifacts `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-hosted-games-YwnfKX/result.json`. Initial smoke locator matched pronunciation pending status too; scoped correct-answer locator and reran successfully. Headless contexts are disposable guest profiles; audio requests are blocked with fixtures, no founder account/browser used.
