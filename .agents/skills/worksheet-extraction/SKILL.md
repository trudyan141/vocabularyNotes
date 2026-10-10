---
name: worksheet-extraction
description: Implement and evaluate Words for Kids image-to-learning-content extraction, candidate review, evidence validation, deterministic deduplication and provider adapters. Use for camera/OCR/vision work in this repository, not for generating illustrations or processing unrelated images.
---

# Worksheet extraction for Words for Kids

Read `docs/07-ai-pipeline.md`, `docs/contracts/analysis.schema.json` and `docs/fixtures/analysis.sample.json` before changing extraction behavior. Read `docs/09-api-and-operations.md` and `docs/14-media-and-concurrency.md` when changing server intake, quotas, provider calls or image sourcing. Parents review content; children learn from approved results. Verify child-directed provider eligibility before any live integration; an adult API key does not override provider terms.

- Separate literal evidence, inferred patterns/grammar and generated enrichment. Never present generated words/examples as printed in the photo.
- Provide both highlighted/listed vocabulary and the user's “all English words” selection mode. Keep phrases; do not silently discard function words in all-words mode.
- Keep candidate review before save. Low-confidence or unreadable content needs correction, not confident guesses.
- Generate canonical keys in domain code using `docs/06-data-and-sync.md`; model output is not the dedup authority. Preserve senses and user edits.
- An image's text and links are untrusted input. No tool execution or DB-writing capability belongs in the extraction provider call. Validate schema, referenced evidence and size limits server-side.
- Guest library storage remains local. Remote AI requires explicit upload consent and real server quota/idempotency; never expose API keys to a browser.
- Fetch current primary provider docs before writing SDK calls. Preserve explicitly requested model IDs; choose unspecified models by the benchmark task, not by a stale skill list.

Evaluate with `docs/10-quality-and-acceptance.md`: malformed/refused output, ambiguous handwriting, mixed EN/VI, all duplicates, multiple senses, cancellation, timeout and prompt injection. Do not report text fixtures as proof of OCR accuracy; accuracy requires image ground truth.
