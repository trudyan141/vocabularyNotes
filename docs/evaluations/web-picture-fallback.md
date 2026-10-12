# Web picture fallback — 12/10/2026

Status: implemented_local / scoped verified. Founder steering: prioritize Google Noto, Twemoji and Microsoft Fluent, then find pictures online; users may attach their chosen images. Initial working tree clean at `bc2983a` (prior picture game fix already committed). No deployment, new environment variables or founder browser control.

## Delivered behavior

Keep preferred catalog order and existing OpenMoji alternative. Commons first searches cartoons, then searches the concrete subject without requiring illustration/cartoon metadata, allowing relevant photographs. Still two network queries, existing eight-second/byte limits and quotas, no new search key/provider. Shared family subject mapping makes sister→girl and brother→boy consistent in both query and relevance checks. Existing unsuitable-content metadata filters remain; this is not proof of human-reviewed image suitability.

If automatic sources return empty/unavailable, the existing web-image section opens with Google, Openclipart, Openverse and instructions to paste/upload an image. Google query no longer forces children illustrations. Users can add an image from another website; upload source remains optional and arbitrary HTTPS source URLs are retained. Uploaded images keep truthful `User supplied` metadata rather than claiming MIT/CC permission. They are staged and saved with the common Save, retaining ownership/revision/receipt and media normalization boundaries.

Automatic web results in this implementation come from Wikimedia Commons, not a general Google Images API or scraping every website. Other website selection is user-driven search plus paste/upload. Image selection still goes through review, and games still require actually decoded/ready pictures. MIT project intent does not relabel third-party art.

## Verification

- Failing regression first: two new photo/family fallback tests failed on the prior illustration-only matching.
- `pnpm test tests/unit/media-search-fallback.test.ts tests/unit/media-route-report.test.ts tests/integration/media.test.ts`: **23 PASS**. Preferred sources/order, source failures, photograph fallback, family relevance, truthful licenses, import/receipt/cloud mapping guards.
- `pnpm lint`, `pnpm typecheck`, `git diff --check`: **PASS**.
- Discovery **12** cases, then `pnpm test:ui -- --mode production media-source-errors.spec.ts word-picture-intake.spec.ts --port 4344`: **12 PASS** on desktop1280/mobile360. Empty/error recovery, visible Google link, arbitrary user HTTPS source with actual upload normalization, staged Save/reload, drag/drop/paste, clipboard denial, invalid/multiple/oversize inputs and failed-upload preservation.
- Build **PASS**; source commit `bc2983a`, fingerprint `503a09503763`. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-dhpn1H/result.json`; discovery1.0s/build46.7s/browser18.1s. Node24.14.1/pnpm11.25.0. No rerun required.
- Impeccable scoped context + empty-state UI/UX guidance, mechanical detector returned `[]`; inspected mobile/desktop empty-state screenshots. This does not claim human UX or legal approval. Generated legacy intake screenshots were restored after the run.

No live external photo search/import availability or physical clipboard/device check performed; network search tests use fixtures, upload normalization runs against the isolated app. Tokens unavailable. No broad release suite or hosted user-data writes.

## Follow-up: web button with existing matches

Founder asked for an independent web search action even when licensed catalog images are returned but unsuitable. Shared WordPictureSearch now always shows a styled `Tìm ảnh trên web` link directly below the primary image search action, before results. It opens Google Images for the current word; the user click also opens source/paste/upload controls, including after selecting an image. Existing image and catalog results are preserved. Search breadth does not imply higher accuracy; user chooses and saves the image. No automatic external-tab opening by the agent.

`pnpm lint`, `pnpm typecheck`, `git diff --check` PASS. `pnpm test:ui -- --list media-source-errors.spec.ts` discovered8; `pnpm test:ui -- media-source-errors.spec.ts --port 4345` **8 PASS** desktop1280/mobile360 on isolated dev snapshot. Includes catalog-found web action/preservation and existing empty/error/upload/reload guards. Test prevents external navigation before clicking, so Google availability not tested. Detector `[]`; mobile/desktop captures inspected. No new production build for this small component-only addition; prior production build covers the preceding fallback implementation. Prior uncommitted fallback diff preserved. Source `bc2983a` / `fc490e9c3792`; result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-QosyEh/result.json`; prepare9.1s/browser57.0s; no rerun. Not deployed.
