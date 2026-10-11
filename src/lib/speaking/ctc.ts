/** Acoustic evidence, not a calibrated probability of correct pronunciation. */
export type HeardPhone = {phone: string; confidence: number; startMs: number; endMs: number};
export function decodePhones(
  logits: ArrayLike<number>, width: number, vocabulary: Record<number, string>,
  durationMs: number, blankId = 0,
): HeardPhone[] {
  if (!Number.isSafeInteger(width) || width < 2 || !Number.isSafeInteger(blankId) || blankId < 0 || blankId >= width || !logits.length || logits.length % width ||
      !Number.isFinite(durationMs) || durationMs <= 0 || durationMs > 20000) throw new Error('Invalid acoustic output');
  const frames = logits.length / width;
  const result: HeardPhone[] = [];
  let previous = blankId;
  for (let frame = 0; frame < frames; frame++) {
    const offset = frame * width;
    let winner = 0;
    for (let i = 0; i < width; i++) {
      if (!Number.isFinite(logits[offset + i])) throw new Error('Non-finite acoustic output');
      if (logits[offset + i] > logits[offset + winner]) winner = i;
    }
    let denominator = 0;
    for (let i = 0; i < width; i++) denominator += Math.exp(logits[offset + i] - logits[offset + winner]);
    const confidence = 1 / denominator;
    const phone = vocabulary[winner];
    if (winner !== blankId && phone?.trim() && phone !== '|' && !phone.startsWith('<') && !phone.startsWith('[')) {
      if (winner === previous) {
        const last = result.at(-1)!;
        last.endMs = (frame + 1) * durationMs / frames;
        // Conservative aggregate: a long repeated CTC run must not inflate confidence.
        last.confidence = Math.min(last.confidence, confidence);
      } else result.push({phone, confidence, startMs: frame * durationMs / frames, endMs: (frame + 1) * durationMs / frames});
    }
    previous = winner;
  }
  return result;
}
