import fixtures from "./fixtures.json";

export type DemoEntry = (typeof fixtures.entries)[number];
export type Candidate = DemoEntry & {
  text: string;
  selected: boolean;
  uncertain: boolean;
  existing: boolean;
  confirmed?: boolean;
};
export type Receipt = { added: number; linked: number; entries: DemoEntry[] };
export const demoEntries: DemoEntry[] = fixtures.entries;
export const demoCandidates: Candidate[] = fixtures.candidates;
export const demoPatterns = fixtures.patterns;
export function searchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}
export function searchEntries(entries: DemoEntry[], query: string) {
  const needle = searchText(query);
  return entries.filter((e) =>
    searchText(`${e.word} ${e.vi} ${e.en}`).includes(needle),
  );
}
export function demoKey(entry: DemoEntry) {
  return `${entry.word.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ")}|${entry.pos}|${entry.sense}`;
}
export function validCandidate(candidate: Candidate) {
  return (
    !!candidate.text.trim() &&
    !!candidate.vi.trim() &&
    (!candidate.uncertain || !!candidate.confirmed)
  );
}
// UI fixture reducer only. Database constraints, canonical identities and source
// transactions are T03/T06; this is never a production repository.
export function previewSave(
  entries: DemoEntry[],
  candidates: Candidate[],
): Receipt {
  const selected = candidates.filter((c) => c.selected);
  if (!selected.length || selected.some((c) => !validCandidate(c)))
    throw new Error("invalid-selection");
  const known = new Map(entries.map((e) => [demoKey(e), e]));
  let added = 0;
  let linked = 0;
  for (const candidate of selected) {
    const entry = {
      ...candidate,
      word: candidate.text.trim(),
      vi: candidate.vi.trim(),
    };
    const key = demoKey(entry);
    if (known.has(key)) linked++;
    else {
      known.set(key, entry);
      added++;
    }
  }
  return { added, linked, entries: [...known.values()] };
}
