import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { Dexie } from "dexie";
import { LibraryDatabase, schemaV2 } from "../../src/data/local/database";
import { LocalRepository } from "../../src/data/local/repository";
import { CaptureRepository } from "../../src/data/local/capture";
import { fullTransform } from "../../src/lib/capture/image";
const opened: LibraryDatabase[] = [];
function setup(id = "guest:test", name = `capture-${crypto.randomUUID()}`) {
  const db = new LibraryDatabase(name);
  opened.push(db);
  return {
    db,
    repo: new CaptureRepository(new LocalRepository(db, { kind: "guest", id })),
  };
}
const image = {
  blob: new Blob(["test-jpeg"], { type: "image/jpeg" }),
  width: 600,
  height: 400,
};
const metadata = {
  title: "My worksheet",
  learnedOn: "2026-10-09",
  tags: "school",
  consent: true,
};
afterEach(async () => {
  for (const db of opened.splice(0)) {
    db.close();
    await Dexie.delete(db.name);
  }
});
describe("local capture drafts", () => {
  it("persists pixels, transform and metadata across reopen without mixing scopes or scheduling upload", async () => {
    const { db, repo } = setup();
    const draft = await repo.create(image);
    const updated = await repo.update(
      draft.id,
      1,
      metadata,
      { ...fullTransform, rotation: 90 },
      { ...image, width: 400, height: 600 },
    );
    expect(updated.consentVersion).toBe("image-upload-v1");
    expect(await db.outbox.count()).toBe(0);
    expect(
      await new CaptureRepository(
        new LocalRepository(db, { kind: "guest", id: "guest:other" }),
      ).get(draft.id),
    ).toBeNull();
    db.close();
    const reopened = setup("guest:test", db.name);
    const loaded = (await reopened.repo.get(draft.id))!;
    expect(loaded.draft.transform.rotation).toBe(90);
    expect(loaded.draft.title).toBe(metadata.title);
    expect(await loaded.prepared.text()).toBe("test-jpeg");
    await reopened.repo.remove(draft.id, 2);
    expect(await reopened.db.localMedia.count()).toBe(0);
    expect(await reopened.repo.get(draft.id)).toBeNull();
  });
  it("rejects stale edits/deletes and invalid metadata without overwriting the newer draft", async () => {
    const { repo } = setup();
    const draft = await repo.create(image);
    await repo.update(draft.id, 1, metadata, fullTransform, image);
    await expect(
      repo.update(
        draft.id,
        1,
        { ...metadata, title: "stale" },
        fullTransform,
        image,
      ),
    ).rejects.toThrow("conflict");
    await expect(repo.remove(draft.id, 1)).rejects.toThrow("conflict");
    await expect(
      repo.update(
        draft.id,
        2,
        { ...metadata, learnedOn: "2026-02-31" },
        fullTransform,
        image,
      ),
    ).rejects.toThrow("invalid");
    expect((await repo.get(draft.id))?.draft.title).toBe(metadata.title);
  });
  it("rolls back both image writes when draft creation or update cannot commit", async () => {
    const { db, repo } = setup();
    await db.open();
    const hook = () => {
      throw new DOMException("full", "QuotaExceededError");
    };
    db.captureDrafts.hook("creating", hook);
    await expect(repo.create(image, "retry")).rejects.toThrow("full");
    expect(await db.localMedia.count()).toBe(0);
    db.captureDrafts.hook("creating").unsubscribe(hook);
    const draft = await repo.create(image, "retry");
    db.captureDrafts.hook("updating", hook);
    await expect(
      repo.update(draft.id, 1, metadata, fullTransform, {
        ...image,
        blob: new Blob(["new"], { type: "image/jpeg" }),
      }),
    ).rejects.toThrow("full");
    expect(await (await repo.get(draft.id))!.prepared.text()).toBe("test-jpeg");
    expect((await repo.get(draft.id))?.draft.version).toBe(1);
    db.captureDrafts.hook("updating").unsubscribe(hook);
  });
  it("upgrades v2 additively and retains review drafts and unrelated local media", async () => {
    const name = `migration-${crypto.randomUUID()}`;
    const old = new Dexie(name);
    old.version(2).stores(schemaV2);
    await old.open();
    await old
      .table("drafts")
      .put({
        scopeId: "demo:test",
        id: "demo",
        candidates: [{ text: "user edit" }],
        version: 8,
      });
    await old
      .table("localMedia")
      .put({ scopeId: "guest:other", id: "keep", blob: image.blob });
    old.close();
    const { db, repo } = setup("guest:test", name);
    await db.open();
    await repo.create(image);
    expect((await db.drafts.get(["demo:test", "demo"]))?.version).toBe(8);
    expect(await db.localMedia.count()).toBe(3);
    expect(db.verno).toBe(5);
  });
});
