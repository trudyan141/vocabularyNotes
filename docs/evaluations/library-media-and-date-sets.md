# Library pictures, grammar and date sets — 10/10/2026

Founder steering: remove distracting credit from word thumbnails, automatically attach missing pictures on lookup, prepare What is it?/It’s… grammar, and manage imported/typed word sets by learning date.

## Implementation

- Fixed nested anchors: Artwork thumbnails have no credit links inside the card link. Detail/review has collapsed “Nguồn hình”; source/author/license remain in saved metadata and attribution. No loss of license records.
- Bundled OpenMoji177 (teacher/jar/box added), CC0 bookshelf imported from SVG Repo; table/ball use existing matching illustrations. Intelligent/smart/clever use a curated brain symbol for the cognitive adjective sense; excluded from picture games, still available in flashcards/spelling. Parent reviews every image.
- Dictionary selection first resolves bundled art; missing noun pictures search1493 indexed licensed OpenMoji17 illustrations and download the selected SVG from the pinned official repository through a fixed same-origin route. No arbitrary URLs/keys/AI image claims. Public route verifies allowlisted code, 100KB/8s/2 in-flight per instance/coalescing/100-entry cache, executable SVG rejection, explicit429/503. This is a public asset catalog, not a quota-bound paid image search provider; existing Commons shared-quota adapter remains optional. Nonmatching meanings stay without an invented picture, with retry/parent review.
- Browser download completes before attaching new art.10s timeout, abort on word/sense change/navigation, no automatic retry; parent approval waits while image lookup is pending. Manual removal/choice survives automatic completion; draft retains selected learning date and image ID. Public selected images can use SW runtime cache; private/API data is not cached. Offline basic learning remains the existing fallback.
- Parent preparation fills only missing art with scoped revision CAS and one transaction. Rebase already-approved text content on image-only revision; preserve parent meanings/examples/art. No overwrite of parent extras. Up to50 words per preparation; sequential network requests with Stop.
- Complete project-authored patterns What is it? → It’s a/an… and Is it…? → Yes, it is./No, it isn’t. Usage, formula, analyzed example and mistake/correction; noun whitelist constrains singular countability, a/an based on the example sound. Vietnamese sentence translations; explicit project addition label, never claim transcribed source. Capture review shows optional patterns; approved words + chosen patterns + receipt save atomically. Existing saved lessons can use Prepare pictures and patterns.
- /library/lessons groups all saved sets by learnedOn descending. Search date/title/English/Vietnamese word, counts new senses versus repeats in previous sets, rename/date CAS, open words, learn set. Each image retains its lesson ID/title/date and literal evidence; upload defaults to file name/current local date, camera to dated title. /add and offline typed entry reuse a daily manual lesson, including handling renamed/moved date sets. No global merge of distinct images or near meanings. Practice honors lesson query; backup archive preserves lesson links.

## Verification

- pnpm check: PASS121 unit/integration tests14files, lint/types/production build.
- Full pnpm test:e2e: PASS133/133 (1.7min), desktop/mobile360 and existing cloud fixture integration; image-download test blocks SW for deterministic interception, no live AI test.
- Live local HTTP: compass lookup returned licensed OpenMoji1F9ED; fixed public route fetched real SVG from GitHub HTTP200/1428bytes. Not a mocked download.
- Imported teacher/box/jar SVGs scanned and rasterized; bookshelf XML duplicate fill discovered during rendering, corrected, rasterized and visually inspected.
- Unit/integration: source separation, correct a/an, no grammar for water, retry/idempotence/atomic invalid target rejection, image CAS + content rebase, no overwrite, scoped lessons, daily grouping, new/review counts, moved date, stale edit and practice membership.
- Browser: automatic download and approval/reload, failure recovery/removal, compact credit-free rows, patterns/grammar, daily set/search/rename/set practice; desktop360px mobile. Download fixture blocks SW to ensure route interception; live HTTP above is separate evidence.

Production deployment / current founder library verification: pending. Real AI benchmark, hosted cloud, physical device and human UX gates remain open; no additional AI inference call in this task.
