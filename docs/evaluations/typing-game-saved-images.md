# Saved pictures in typing games

13/10/2026. Founder reported `question` has a library picture but a placeholder in Tìm ký tự thiếu. Existing task diffs preserved; no cloud data changes, approval bypass, real founder browser or deploy.

## Root cause and fix

The shared picture stage for `letters`, `spelling` and `missing-letters` passed `word=""` to hide the answer. Imported media authorization checks the saved word, scope, owner sense, approval and revision. An empty word correctly failed that check, so every `media-*` picture in these modes was rejected while library cards worked.

Pass the actual word for image lookup and use a separate optional `Artwork.hideWord` flag for fallback text/accessibility. Approval and ownership checks remain unchanged. Static catalog artwork and the two picture-choice games retain their existing behavior. Offline already resolves stored media by asset ID and did not use the failing empty-word lookup.

## Verification

- Before fix: production regression saved an uploaded JPEG through Edit, verified the library image, then failed because Điền chữ thiếu had no image. Result `wfk-ui-result-nplZNf/result.json`, source fingerprint prefix `98270d288c55`.
- `pnpm lint`, `pnpm typecheck`: PASS. `pnpm test tests/integration/media.test.ts`: 12 PASS (1.42s), preserving saved-image validation and data boundaries.
- First fixed run rendered all three typing games on desktop/mobile and passed the eight existing picture-game cases. The negative fixture initially mutated IndexedDB directly and expected a Dexie live notification; native writes do not emit it. Corrected the fixture to reload/resume and re-read the invalid asset, without changing application behavior.
- Final `pnpm test:ui -- --mode production ready-picture-games.spec.ts --port 4357`: **10 PASS**, discovery0.8s/build29.9s/browser13.3s. Existing ready/missing/broken/imported picture games and all three typing modes, decoded image dimensions, reload/resume invalid-asset rejection, hidden fallback answer and mobile overflow. Result `/var/folders/lh/rrgp39n11030cwj71gfrld9mf331yr/T/wfk-ui-result-iVskl2/result.json`; snapshot `wfk-ui-source-xf4RSU`; commit `57d411f7e9838cb9a54a7d64dede778cfd9135f6` + fingerprint `5d3809b9cf0855b68d9bf201c002455b14772061e8a16242a3f9d06ba41cf435`.
- [Desktop](typing-game-saved-images/desktop.png), [mobile](typing-game-saved-images/mobile.png) inspected together. Red square is the synthetic uploaded JPEG, not a stock fallback; mobile capture includes the focused skip link from navigation. Mock upload/guest scope; no live-account or physical-device claim.

UI code is local and has not been deployed.
