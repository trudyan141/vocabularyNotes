# Public pronunciation audio fixtures

The four original Ogg files in this directory were created by **[Dvortygirl](https://commons.wikimedia.org/wiki/User:Dvortygirl)** and are distributed under **[Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/)**. The original recordings are unmodified. In-memory mono conversion, resampling and silence padding during evaluation do not change the distributed files. This attribution and license apply to these audio files separately from the application code.

| File | Original source |
|---|---|
| cat.ogg | [En-us-cat.ogg](https://commons.wikimedia.org/wiki/File:En-us-cat.ogg) |
| book.ogg | [En-us-book.ogg](https://commons.wikimedia.org/wiki/File:En-us-book.ogg) |
| cup.ogg | [En-us-cup.ogg](https://commons.wikimedia.org/wiki/File:En-us-cup.ogg) |
| apple.ogg | [En-us-apple.ogg](https://commons.wikimedia.org/wiki/File:En-us-apple.ogg) |

[manifest.json](manifest.json) records source URLs, byte counts and SHA-256 hashes verified on 11 October 2026. The `reference` strings are engineering sanity targets in the selected model's TIMIT-derived symbol inventory. They are not expert audio annotations or verified learning-content IPA; notably this inventory represents STRUT with `ə`, and may omit a reduced vowel in syllabic consonants. Use these four clips to test runtime and obvious recognition failures only. They do not validate pronunciation scoring or Vietnamese children's speech.

Local evaluation command: `pnpm speaking:spike --fixtures=tests/fixtures/speaking/manifest.json --download --report=docs/evaluations/speaking-public-fixture-spike.json`. The explicit download fetches free public model files; inference stays on loopback in an ephemeral browser, with external network blocked. No API token or microphone is used.
