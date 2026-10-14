# ADR094 pronunciation pilot tools

Use Node24.14.1/pnpm11.25.0. The [approved plan](../../docs/ai/SPEAKING-ASSESSMENT-UPGRADE-PLAN.md) owns thresholds and data requirements. These tools do not supply child voices or human labels, and a successful dry validation is not a quality pass.

## Prepare privately

Copy [the empty template](../../docs/fixtures/speaking-benchmark.template.json) to a private directory outside the repo. Do not set review/permission flags until the required reviews and permissions actually exist. Each clip contains:

```json
{
  "id": "anonymous-clip-id",
  "sourceRecordingId": "anonymous-original-recording-id",
  "speakerId": "anonymous-speaker-id",
  "ageGroup": "child",
  "split": "evaluation",
  "quality": "clear",
  "category": "omission",
  "unreleased": false,
  "audioPath": "relative-private-path.wav",
  "sha256": "SHA256_OF_THE_EXACT_WAV",
  "targets": [{"text": "cat", "variants": [["k", "æ", "t"]]}],
  "events": [{"wordIndex": 0, "kind": "missing", "index": 2, "heard": null}]
}
```

Each pilot clip uses one human-selected reference variant so event coordinates are unambiguous; multi-variant runtime behavior has separate unit tests. Substitution clips also need `substitutionClass: near|gross`. Event kind is missing/substitution/insertion; index is the expected phone position, or afterIndex for an insertion (-1 before first). Correct/unclear clips have no certain error events. Both reviewer IDs are anonymous; `phoneticsReviewer` names one of those IDs. Preserve sourceRecordingId across transformed versions, which must never cross tuning/evaluation splits.

The validator checks the frozen100clip/10speaker distribution, speaker/source/hash separation,15evaluation words and category/age counts. Before live requests, the runner checks all selected files against SHA and bounded mono16kHz/16bit WAV format. Manifest review declarations still require actual human verification.

## Run and freeze

Use the same private output directory for the entire pilot so the cumulative300request budget cannot be reset by a new prompt. Put the already authorized existing key in the process environment (`NEXT_PUBLIC_GEMINI_DEFAULT_KEY` or `GEMINI_API_KEY`); never in arguments, manifest or logs. This does not add any Vercel env. Paths below are placeholders for operator-owned private files.

Through ADR095 this implementation used15explicit engineering/configuration probe requests before the human pilot (8original+1diagnostic+5CLI comparisons+1isolated browser). The template carries `priorRequests: 15`; preserve that offset for this pilot. ADR095 is a founder-directed contract revision; do not mix v2/v3 configs into one frozen quality pilot. The runner includes it in the total budget and freezes it with the manifest. These synthetic probes are not labeled child pilot data and do not contribute to quality sample counts.

```sh
node scripts/speaking/benchmark.mjs --validate --manifest /private/manifest.json
node scripts/speaking/benchmark.mjs --run --manifest /private/manifest.json --out /private/pilot --phase tuning --variant baseline
node scripts/speaking/benchmark.mjs --run --manifest /private/manifest.json --out /private/pilot --phase tuning --variant candidate
# A second candidate can use --prompt-file /private/candidate.txt; no third candidate.
node scripts/speaking/benchmark.mjs --freeze CANDIDATE_CONFIG_HASH --out /private/pilot
node scripts/speaking/benchmark.mjs --run --manifest /private/manifest.json --out /private/pilot --phase evaluation --variant baseline
node scripts/speaking/benchmark.mjs --run --manifest /private/manifest.json --out /private/pilot --phase evaluation --variant candidate
node scripts/speaking/benchmark.mjs --run --manifest /private/manifest.json --out /private/pilot --phase repeat --variant candidate
node scripts/speaking/benchmark.mjs --report --manifest /private/manifest.json --out /private/pilot
```

The source baseline prompt/model/hashes were captured before code changes in [baseline.json](../../docs/evaluations/speaking-assessment-v2/baseline.json). Its adapter preserves provider scores and reports insertion limitations instead of inventing missing evidence. The current candidate uses schema-enforced v3 observed phones without target text, client alignment/score, minimal thinking and a six-second request cap. Current candidate hash includes prompt, scoring, normalization, observation and request fingerprints. Freeze forbids tuning after held-out is opened. Repeat selects five clear child and five clear adult clips already evaluated.

No automatic retry or key/model swap. Quota/access stops the batch with pending status; rerun skips existing attempts. `--retry-failed` is an explicit operator retry in a later invocation, still consuming the shared budget. Reserved interrupted requests remain counted. Do not erase state/locks to bypass budgets or change held-out results. A lock belongs to that private pilot; investigate its owner before recovery.

Audio, raw responses and state remain private outside the repo. Only anonymous aggregate reports suitable for publication may be copied into evidence. CLI latency covers a preprocessed WAV request/parse, not browser mic/decode/trim; without actual browser measurements `latencyEvidence` stays false and the report cannot declare pilot_pass. To report real end-to-end timing use `--latency-file /private/timings.json` with `{configHash, device, network, cases:[{id,latencyMs}]}` for all60evaluation clips, measured from mic stop to displayed result. Do not invent timing values or copy provider-only durations into that file. No dataset, no pilot pass.

## Local checks without audio or provider

```sh
node --test scripts/tests/speaking-benchmark.test.mjs
node scripts/speaking/benchmark.mjs --help
```

The empty template intentionally fails validation. Synthetic test results check metric arithmetic and refusal paths, not model quality.
