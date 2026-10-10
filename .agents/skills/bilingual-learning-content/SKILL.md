---
name: bilingual-learning-content
description: Design and validate English-English and English-Vietnamese meanings, examples, sentence patterns, grammar explanations and memory notes for Words for Kids children aged 5–8, with parents preparing and reviewing lessons; adult expansion comes later. Use for enrichment prompts, content fixtures and learning UI; not for general translation or English exam scoring.
---

# Bilingual learning content

Read `docs/07-ai-pipeline.md`, `docs/08-learning-and-games.md` and `docs/contracts/enrichment.schema.json` for the relevant content task. For animated notes read `docs/04-design-and-motion.md`; for licensed image search and runtime concurrency read `docs/14-media-and-concurrency.md`.

- Treat age mode and proficiency separately. Children aged 5–8 are primary; child-friendly/Beginner is the default, parents curate lessons, adults come later. Use short spoken cues for non-readers and recognizable simple 2D illustrations. Cuteness comes from clear color and soft outlines: do not add faces, eyes, mouths, cheeks or limbs to objects, fruit or food. Preserve characteristic shapes and parts (school bag handles, straps, zipper and pocket). The expressive fox mascot is a separate UI asset, not a requirement for word pictures. Prefer compatible licensed illustration families and normalize card framing/scale rather than demanding bespoke kawaii artwork. Avoid inferred age from uploaded photos.
- Keep each sense and POS distinct. A correct example must demonstrate the chosen sense, including bank/river bank and book noun/verb cases.
- Require a clear English definition, contextual Vietnamese meaning, two English examples with Vietnamese translations and source/generated/user attribution. Avoid circular definitions and harder vocabulary than needed.
- Preserve original source sentences. Label alternatives and generated examples; do not replace a teacher's sentence silently.
- Grammar needs conditions of use, formula, analyzed examples and a common error with correction. Pattern slots must have constraints, not just placeholders.
- IPA, CEFR labels and dictionary provenance must not be invented. Show only verified pronunciation as verified; mark AI suggestions appropriately until checked.
- Notes are editable text or approved declarative templates. Provide a complete static explanation, reduced motion and replay. Never render AI-authored HTML, JS or arbitrary SVG.
- Image games require approved media for the exact sense and unambiguous distractors; abstract words may only be eligible for spelling/meaning modes.

Content review should test pedagogical correctness, ambiguity and level suitability, not merely JSON validity. User-edited definitions/notes must survive re-enrichment and merging.
