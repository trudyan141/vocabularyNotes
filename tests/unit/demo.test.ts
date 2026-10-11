import { describe, expect, it } from "vitest";
import {
  demoCandidates,
  demoEntries,
  previewSave,
  searchEntries,
} from "../../src/lib/demo/model";
import { defaultPreferences, readPreferences } from "../../src/lib/preferences";
describe("demo UI boundaries", () => {
  it("searches unaccented Vietnamese and retains both bank senses", () => {
    expect(searchEntries(demoEntries, "QUA TAO").map((e) => e.id)).toContain(
      "apple",
    );
    expect(searchEntries(demoEntries, "bank").map((e) => e.id)).toEqual([
      "bank-money",
      "bank-river",
    ]);
  });
  it("keeps old content on duplicate selection and adds new fixtures once", () => {
    const receipt = previewSave(demoEntries, demoCandidates);
    expect(receipt.added).toBe(6);
    expect(receipt.linked).toBe(3);
    expect(previewSave(receipt.entries, demoCandidates).added).toBe(0);
    expect(receipt.entries.find((e) => e.id === "book")).toEqual(
      demoEntries.find((e) => e.id === "book"),
    );
  });
  it("can link an all-duplicate selection without new entries", () => {
    const candidates = demoCandidates.map((c) => ({
      ...c,
      selected: c.existing,
    }));
    expect(previewSave(demoEntries, candidates)).toMatchObject({
      added: 0,
      linked: 3,
      entries: demoEntries,
    });
  });
  it("rejects unclear, empty and missing-meaning selections", () => {
    expect(() => previewSave(demoEntries, [])).toThrow("invalid-selection");
    expect(() =>
      previewSave(
        demoEntries,
        demoCandidates.map((c) => ({ ...c, selected: true })),
      ),
    ).toThrow("invalid-selection");
    expect(() =>
      previewSave(demoEntries, [{ ...demoCandidates[0], vi: " " }]),
    ).toThrow("invalid-selection");
  });
  it("accepts a parent-confirmed correction without changing source evidence", () => {
    const uncertain = demoCandidates.find((c) => c.id === "eraser")!;
    const receipt = previewSave(demoEntries, [
      { ...uncertain, text: "eraser", confirmed: true, selected: true },
    ]);
    expect(receipt.added).toBe(1);
    expect(uncertain.text).toBe("erqser");
  });
});
describe("small settings", () => {
  it("defaults to Vietnamese, beginner and child friendly for absent or corrupt settings", () => {
    for (const raw of [null, "{", "null", "false", "123"])
      expect(readPreferences(raw)).toEqual(defaultPreferences);
  });
  it("whitelists preferences without restoring content or secrets", () => {
    expect(
      readPreferences(
        JSON.stringify({
          locale: "en",
          level: "Intermediate",
          childFriendly: false,
          reduceMotion: true,
          sound: false,
          apiKey: "must-disappear",
          entries: [],
        }),
      ),
    ).toEqual({
      locale: "en",
      level: "Intermediate",
      childFriendly: false,
      reduceMotion: true,
      sound: false,
      profileName: "",
      profileAvatar: "google",
    });
  });
  it("normalizes unsupported preference values safely", () => {
    expect(
      readPreferences(
        '{"locale":"xx","level":"Expert","sound":0,"childFriendly":"false"}',
      ),
    ).toEqual(defaultPreferences);
  });
});
