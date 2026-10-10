import { describe, expect, it } from "vitest";
import {
  canonicalKey,
  exactSenseKey,
  searchTerms,
} from "../../src/domain/identity";
describe("canonical identity v1", () => {
  it.each([
    [" Apple ", "apple"],
    ["apple,", "apple"],
    ["APPLE", "apple"],
    ["ice  cream", "ice cream"],
    ["mother–in–law", "mother-in-law"],
    ["don’t", "don't"],
    ["C++", "c++"],
    ["café", "café"],
  ])("normalizes %s deterministically", (source, key) => {
    expect(canonicalKey(source)).toBe(key);
  });
  it("preserves case mode, accents, morphology and phrase boundaries", () => {
    expect(canonicalKey("US", "exact")).not.toBe(canonicalKey("us"));
    for (const [a, b] of [
      ["ice-cream", "ice cream"],
      ["cafe", "café"],
      ["run", "running"],
      ["go", "went"],
    ])
      expect(canonicalKey(a)).not.toBe(canonicalKey(b));
    expect(exactSenseKey("noun", "river bank")).not.toBe(
      exactSenseKey("noun", "financial bank"),
    );
    expect(exactSenseKey("noun", "book")).not.toBe(
      exactSenseKey("verb", "book"),
    );
  });
  it("rejects punctuation-only words and keeps search normalization separate", () => {
    expect(() => canonicalKey("... , ")).toThrow();
    expect(searchTerms("Đồ dùng / QUẢ TÁO")).toBe("do dung / qua tao");
    expect(canonicalKey("café")).toBe("café");
  });
});
