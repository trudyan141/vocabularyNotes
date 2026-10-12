# Three picture sources and free Google copy fallback —12/10/2026

Founder screenshot: ruler sense received unrelated British Cartoon Prints from Commons. Source trace showed four catalog sources followed by Commons cartoon/photo requests. Newest steering removes OpenMoji and Commons from new searches. Founder explicitly accepted Google external link/copy instead of paid/API integration.

## Acceptance and implementation

Only Noto/Twemoji/Fluent return new search candidates; no provider network search when no catalog match. Shared WordPictureSearch for add, prepare, edit and worksheet-word controls; missing pictures reveal free Google link and upload/paste. New words preview first catalog candidate automatically, save only through shared word/lesson review. Worksheet staged JPEG uses exact identity+definition and durable draft; saveLesson validates assets before opening transaction, then links media to resolved sense/revision in that transaction. Existing picture is retained when duplicate word is added. Legacy import, original assets and attribution remain supported.

No Google API, paid service, new Vercel env, real founder browser or deploy. Direct Google HTTP probes returned unsupported browser/JS page, not image results. Temporary optional Google API code was removed after founder clarification; no provider key was configured and no billable API ran.

## Verification

39 unit/integration checks across media fallback, route reports, media archive/receipt/sense binding/atomic new-word save/replay/rollback, word edit and worksheet/review PASS. Lint/types PASS. **20/20 production UI PASS**, mobile360 + desktop1280; build/lint/types PASS. [Run metadata](three-picture-sources/result.json), [browser log](three-picture-sources/browser.log), [build log](three-picture-sources/build.log). Exact executed source: bc2983a + b3e6454daaae. After this run, only BYOK unit fixture was updated to expect no old OpenMoji art; application source unchanged. Additional learning/BYOK35tests PASS (74unit/integration total). No hosted/physical-device/live-source claim. Earlier interim API snapshot build passed,18UI passed/2 failed due to changed editor success text; abandoned API source is not current acceptance. Final source restores editor message and tests user-approved link flow.

First free-link snapshot: build PASS,18/20UI PASS; two photo cases used the wrong one-image button (single image goes through crop). Fixed fixture to the two-photo merged flow. Review also added a save guard while manual picture work is pending and protected an already staged user image from late automatic search results. Final20UI passed. BYOK fixture still expected OpenMoji pear; updated to null because new candidate images now go through the three-source path,35tests passed.

Visual review: [new word mobile](three-picture-sources/new-word-mobile.png), [desktop](three-picture-sources/new-word-desktop.png), [photo-word mobile](three-picture-sources/photo-word-mobile.png), [desktop](three-picture-sources/photo-word-desktop.png). Synthetic image colors indicate fixture uploads; not live Google result quality.
