export type CaseMode = "fold" | "exact";
export function canonicalKey(value: string, caseMode: CaseMode = "fold") {
  const key = value
    .normalize("NFKC")
    .replace(/[‘’]/g, "'")
    .replace(/[‐‑‒–—]/g, "-")
    .trim()
    .replace(/^[.,!?;:"“”()[\]{}\s]+|[.,!?;:"“”()[\]{}\s]+$/g, "")
    .replace(/\s+/g, " ");
  if (!key) throw new Error("empty-word");
  return caseMode === "fold" ? key.toLowerCase() : key;
}
export function exactSenseKey(pos: string, label: string) {
  // Only an explicitly selected sense label participates. No semantic merging.
  return JSON.stringify(
    [pos, label].map((s) =>
      s.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase(),
    ),
  );
}
export function searchTerms(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .filter((k) => record[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stableJson(record[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}
export async function contentHash(value: unknown) {
  const bytes = new TextEncoder().encode(stableJson(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
