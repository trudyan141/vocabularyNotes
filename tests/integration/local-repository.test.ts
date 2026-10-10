import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { Dexie } from "dexie";
import { LibraryDatabase, schemaV1 } from "../../src/data/local/database";
import {
  LocalRepository,
  openLocalRepository,
} from "../../src/data/local/repository";
import { demoEntries } from "../../src/lib/demo/model";
import type { Scope, WordInput } from "../../src/data/local/types";
const opened: LibraryDatabase[] = [];
function database(name = `test-${crypto.randomUUID()}`) {
  const db = new LibraryDatabase(name);
  opened.push(db);
  return db;
}
function repository(
  scope: Scope = { kind: "guest", id: "guest:test" },
  db = database(),
) {
  return new LocalRepository(db, scope);
}
function word(overrides: Partial<WordInput> = {}): WordInput {
  return {
    ...demoEntries[0],
    id: crypto.randomUUID(),
    lesson: "manual",
    origin: "user",
    approved: true,
    ...overrides,
  };
}
function lesson(
  items: WordInput[],
  overrides: Partial<Parameters<LocalRepository["saveLesson"]>[0]> = {},
) {
  return {
    operationId: crypto.randomUUID(),
    title: "My lesson",
    learnedOn: "2026-10-09",
    sourceType: "manual" as const,
    items,
    ...overrides,
  };
}
afterEach(async () => {
  for (const db of opened.splice(0)) {
    db.close();
    await Dexie.delete(db.name);
  }
});
describe("scoped IndexedDB repository", () => {
  it("seeds demo once, keeps guest empty and preserves changed content on reopen", async () => {
    const db = database();
    const demo = await openLocalRepository(db, true);
    expect((await demo.search("")).total).toBe(20);
    const apple = (await demo.word("apple"))!;
    expect((await db.examples.where('[scopeId+senseId]').equals([demo.scope.id,apple.id]).toArray()).filter(e=>!e.deletedAt)).toHaveLength(2);
    await demo.editWord(apple.id, apple.revision, {
      word: apple.word,
      vi: "táo của con",
      en: apple.en,
    });
    const guest = await openLocalRepository(db, false);
    expect(guest.scope.id).not.toBe(demo.scope.id);
    expect((await guest.search("")).total).toBe(0);
    db.close();
    const reopened = database(db.name);
    const same = await openLocalRepository(reopened, true);
    expect(same.scope.id).toBe(demo.scope.id);
    expect((await same.word("apple"))?.vi).toBe("táo của con");
    expect((await same.search("")).total).toBe(20);
  });
  it("deduplicates case/space/punctuation, adds source links and preserves user edits", async () => {
    const repo = repository();
    const initial = word();
    await repo.saveLesson(lesson([initial]));
    const view = (await repo.word(initial.id))!;
    await repo.editWord(initial.id, view.revision, {
      word: "apple",
      vi: "nghĩa bố mẹ sửa",
      en: view.en,
    });
    const repeat = await repo.saveLesson(
      lesson([word({ word: " APPLE, ", vi: "must not replace" })]),
    );
    expect(repeat).toMatchObject({ added: 0, linked: 1 });
    expect(await repo.db.entries.count()).toBe(1);
    expect(await repo.db.senses.count()).toBe(1);
    expect(await repo.db.lessonItems.count()).toBe(2);
    expect((await repo.word(initial.id))?.vi).toBe("nghĩa bố mẹ sửa");
    expect(await repo.db.evidence.count()).toBe(0);
    expect(await repo.db.outbox.count()).toBe(0);
  });
  it("retains bank senses, noun/verb, distinct forms, case modes and accents", async () => {
    const repo = repository();
    const input = [
      word({ word: "bank", sense: "river bank" }),
      word({ word: "bank", sense: "financial bank" }),
      word({ word: "book", pos: "noun", sense: "book" }),
      word({ word: "book", pos: "verb", sense: "book" }),
      word({ word: "US", caseMode: "exact" }),
      word({ word: "us" }),
      word({ word: "run" }),
      word({ word: "running" }),
      word({ word: "café" }),
      word({ word: "cafe" }),
    ];
    const result = await repo.saveLesson(lesson(input));
    expect(result.added).toBe(10);
    expect(result.addedSenses).toBe(2);
    expect(await repo.db.entries.count()).toBe(8);
    expect(await repo.db.senses.count()).toBe(10);
    expect((await repo.search("bank")).total).toBe(2);
  });
  it("uses atomic receipts for simultaneous saves and rejects same operation with changed content", async () => {
    const db = database();
    const a = repository(undefined, db);
    const b = repository(undefined, database(db.name));
    const input = lesson([word()]);
    const [first, second] = await Promise.all([
      a.saveLesson(input),
      b.saveLesson(input),
    ]);
    expect(first).toEqual(second);
    expect(await db.lessons.count()).toBe(1);
    expect(await db.receipts.count()).toBe(1);
    await expect(
      a.saveLesson({ ...input, title: "changed payload" }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(await db.lessons.count()).toBe(1);
  });
  it("rechecks deterministic identities for two tabs with different operation IDs", async () => {
    const db = database();
    const a = repository(undefined, db);
    const b = repository(undefined, database(db.name));
    await Promise.all([
      a.saveLesson(lesson([word()])),
      b.saveLesson(lesson([word({ word: "APPLE," })])),
    ]);
    expect(await db.entries.count()).toBe(1);
    expect(await db.senses.count()).toBe(1);
    expect(await db.lessons.count()).toBe(2);
  });
  it("rolls back all records and receipts if a later item fails mid-transaction", async () => {
    const repo = repository();
    await expect(
      repo.saveLesson(lesson([word(), word({ word: "..." })])),
    ).rejects.toThrow("empty-word");
    for (const table of [
      repo.db.entries,
      repo.db.senses,
      repo.db.examples,
      repo.db.lessons,
      repo.db.lessonItems,
      repo.db.searchIndex,
      repo.db.receipts,
    ])
      expect(await table.count()).toBe(0);
  });
  it("rolls back quota errors without deleting the previous library", async () => {
    const repo = repository();
    const first = word();
    await repo.saveLesson(lesson([first]));
    const fail = () => {
      throw new DOMException("simulated quota", "QuotaExceededError");
    };
    repo.db.senses.hook("creating", fail);
    await expect(
      repo.saveLesson(lesson([word({ word: "pear", sense: "pear" })])),
    ).rejects.toThrow();
    repo.db.senses.hook("creating").unsubscribe(fail);
    expect((await repo.search("")).total).toBe(1);
    expect(await repo.db.lessons.count()).toBe(1);
    expect(await repo.db.receipts.count()).toBe(1);
    await repo.saveLesson(lesson([word({ word: "pear", sense: "pear" })]));
    expect((await repo.search("")).total).toBe(2);
  });
  it("detects stale edits and canonical collisions without losing either record", async () => {
    const repo = repository();
    const apple = word();
    const pear = word({ word: "pear", sense: "pear" });
    await repo.saveLesson(lesson([apple, pear]));
    const old = (await repo.word(apple.id))!;
    await repo.editWord(apple.id, old.revision, {
      word: "apple",
      vi: "updated",
      en: old.en,
    });
    await expect(
      repo.editWord(apple.id, old.revision, {
        word: "apple",
        vi: "stale",
        en: old.en,
      }),
    ).rejects.toMatchObject({ code: "conflict" });
    const current = (await repo.word(apple.id))!;
    await expect(
      repo.editWord(apple.id, current.revision, {
        word: "pear",
        vi: "collision",
        en: current.en,
      }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect((await repo.search("")).total).toBe(2);
    expect((await repo.word(apple.id))?.vi).toBe("updated");
  });
  it("does not resurrect soft-deleted content or include it in search", async () => {
    const repo = repository();
    const input = word();
    await repo.saveLesson(lesson([input]));
    const sense = (await repo.db.senses.get([repo.scope.id, input.id]))!;
    await repo.db.senses.put({ ...sense, deletedAt: new Date().toISOString() });
    await expect(repo.saveLesson(lesson([word()]))).rejects.toMatchObject({
      code: "conflict",
    });
    expect(await repo.word(input.id)).toBeUndefined();
    expect(await repo.db.senses.count()).toBe(1);
  });
  it("keeps scopes separate for words, receipts, notes and events", async () => {
    const db = database();
    const a = repository({ kind: "guest", id: "guest:a" }, db);
    const b = repository({ kind: "guest", id: "guest:b" }, db);
    const input = word();
    await a.saveLesson(lesson([input]));
    expect(await b.word(input.id)).toBeUndefined();
    expect((await b.search("")).total).toBe(0);
    await expect(
      b.saveNote({
        id: "note",
        targetType: "sense",
        targetId: input.id,
        text: "cross scope",
        expectedVersion: null,
      }),
    ).rejects.toMatchObject({ code: "missing" });
    const note = await a.saveNote({
      id: "note",
      targetType: "sense",
      targetId: input.id,
      text: "my note",
      expectedVersion: null,
    });
    const event = {
      id: "event",
      senseId: input.id,
      sessionId: "session",
      rating: "Good" as const,
      hints: false,
      eventTime: new Date().toISOString(),
    };
    await a.appendReviewEvent(event);
    await a.appendReviewEvent(event);
    await expect(
      a.appendReviewEvent({ ...event, rating: "Again" }),
    ).rejects.toMatchObject({ code: "conflict" });
    await expect(
      a.saveNote({
        id: "note",
        targetType: "sense",
        targetId: input.id,
        text: "stale",
        expectedVersion: null,
      }),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(note.version).toBe(1);
    expect(await db.reviewEvents.count()).toBe(1);
    expect(await db.notes.get([b.scope.id, "note"])).toBeUndefined();
  });
  it("does not expose pending content as approved and invalidates approval after word edits", async () => {
    const repo = repository();
    const a = word({ approved: false });
    await repo.saveLesson(lesson([a]));
    expect((await repo.search("", { approvedOnly: true })).total).toBe(0);
    const view = (await repo.word(a.id))!;
    await repo.editWord(a.id, view.revision, {
      word: "peach",
      vi: "quả đào",
      en: "A fruit.",
    });
    expect((await repo.word(a.id))?.approved).toBe(false);
    expect((await repo.search("peach")).total).toBe(0);
    expect((await repo.word(a.id))?.pendingEdit?.patch.word).toBe("peach");
  });
  it("indexes meanings, tags, examples and lesson titles with pagination and filters", async () => {
    const repo = repository();
    const input = word({ tags: ["đồ dùng"], art: null });
    await repo.saveLesson(lesson([input], { title: "Bài học đầu tiên" }));
    for (const query of [
      "QUA TAO",
      "do dung",
      "I eat an apple",
      "bai hoc dau tien",
    ])
      expect((await repo.search(query)).total).toBe(1);
    expect((await repo.search("", { missingArt: true })).total).toBe(1);
    expect((await repo.search("", { offset: 1 })).words).toEqual([]);
  });
  it("persists draft selections/corrections and replays sample save after reopen", async () => {
    const db = database();
    const repo = await openLocalRepository(db, true);
    const draft = (await repo.draft())!;
    const corrected = draft.candidates.map((c) =>
      c.id === "eraser"
        ? { ...c, text: "eraser", confirmed: true, selected: true }
        : c,
    );
    await repo.setDraft(corrected);
    const result = await repo.saveDemo();
    expect(result).toMatchObject({ added: 7, linked: 3 });
    expect(
      (await db.evidence.toArray()).some((e) => e.literalText === "erqser"),
    ).toBe(true);
    db.close();
    const restored = await openLocalRepository(database(db.name), true);
    expect(
      (await restored.draft())?.candidates.find((c) => c.id === "eraser")?.text,
    ).toBe("eraser");
    expect(await restored.lastResult()).toEqual(result);
    expect(await restored.saveDemo()).toEqual(result);
    expect((await restored.search("")).total).toBe(27);
  });
  it("guards account scope format and creates outbox only for account writes", async () => {
    const db = database();
    expect(
      () =>
        new LocalRepository(db, {
          kind: "account",
          id: "guest:wrong",
          ownerId: "a",
          libraryId: "b",
        }),
    ).toThrow("scope");
    const repo = repository(
      { kind: "account", id: "account:a:b", ownerId: "a", libraryId: "b" },
      db,
    );
    await repo.saveLesson(lesson([word()]));
    expect(await db.outbox.count()).toBe(1);
    expect((await db.outbox.toArray())[0].payload.ownerId).toBe("a");
  });
});
describe("approved learning snapshots", () => {
  it("keeps approved words/examples while a changed-word proposal persists across reload", async () => {
    const db = database();
    const repo = repository(undefined, db);
    const input = word();
    await repo.saveLesson(lesson([input]));
    const before = (await repo.word(input.id))!;
    const edit = await repo.editWord(input.id, before.revision, {
      word: "peach",
      vi: "quả đào",
      en: "A fruit.",
    });
    expect(edit.proposed).toBe(true);
    expect(await repo.word(input.id)).toMatchObject({
      word: "apple",
      vi: input.vi,
      example: input.example,
      approved: true,
      pendingEdit: { patch: { word: "peach" } },
    });
    db.close();
    const restored = repository(undefined, database(db.name));
    expect((await restored.word(input.id))?.pendingEdit?.patch.vi).toBe(
      "quả đào",
    );
    expect((await restored.search("peach", { approvedOnly: true })).total).toBe(
      0,
    );
    const current = (await restored.word(input.id))!;
    await restored.editWord(input.id, current.revision, {
      word: "apple",
      vi: "nghĩa đã sửa",
      en: input.en,
    });
    expect((await restored.word(input.id))?.pendingEdit).toBeNull();
    expect((await restored.word(input.id))?.vi).toBe("nghĩa đã sửa");
  });
});

describe("lossless schema migration", () => {
  it("upgrades v1 content/notes/events to current schema and derives search without replacing user fields", async () => {
    const db = database();
    const repo = repository(undefined, db);
    const input = word();
    await repo.saveLesson(lesson([input]));
    await repo.saveNote({
      id: "note",
      targetType: "sense",
      targetId: input.id,
      text: "retain this",
      expectedVersion: null,
    });
    await repo.appendReviewEvent({
      id: "event",
      senseId: input.id,
      sessionId: "session",
      rating: "Good",
      hints: false,
      eventTime: new Date().toISOString(),
    });
    const tables: Record<string, unknown[]> = Object.fromEntries(
      await Promise.all(
        db.tables
          .filter((t) => t.name in schemaV1)
          .map(async (t) => [t.name, await t.toArray()]),
      ),
    );
    db.close();
    await Dexie.delete(db.name);
    const legacy = new Dexie(db.name);
    legacy.version(1).stores(schemaV1);
    await legacy.open();
    await legacy.transaction("rw", legacy.tables, async () => {
      for (const [name, records] of Object.entries(tables)) {
        const oldRecords = records.map((record) => {
          const copy = { ...(record as Record<string, unknown>) };
          if (name === "senses") {
            delete copy.tags;
            delete copy.pronunciations;
          }
          if (name === "examples") delete copy.pronunciations;
          return copy;
        });
        await legacy.table(name).bulkPut(oldRecords);
      }
    });
    legacy.close();
    const upgraded = database(db.name);
    await upgraded.open();
    const migrated = repository(undefined, upgraded);
    expect((await migrated.search("QUA TAO")).words[0].id).toBe(input.id);
    expect((await upgraded.notes.get([repo.scope.id, "note"]))?.text).toBe(
      "retain this",
    );
    expect(await upgraded.reviewEvents.count()).toBe(1);
    for (const [name, records] of Object.entries(tables))
      expect(await upgraded.table(name).toArray()).toEqual(records);
  });
  it("rejects a failed upgrade and preserves v1 records for retry", async () => {
    const name = `test-${crypto.randomUUID()}`;
    const old = new Dexie(name);
    old.version(1).stores(schemaV1);
    await old.open();
    await old.table("metadata").put({ key: "preserved", value: "old content" });
    old.close();
    const broken = new Dexie(name);
    broken.version(1).stores(schemaV1);
    broken
      .version(2)
      .stores({ ...schemaV1, extra: "id" })
      .upgrade(() => {
        throw new Error("simulated-migration-failure");
      });
    await expect(broken.open()).rejects.toThrow("simulated-migration-failure");
    broken.close();
    const check = new Dexie(name);
    check.version(1).stores(schemaV1);
    await check.open();
    expect(await check.table("metadata").get("preserved")).toEqual({
      key: "preserved",
      value: "old content",
    });
    check.close();
    await Dexie.delete(name);
  });
});
