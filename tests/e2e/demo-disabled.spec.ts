import { expect, test } from "@playwright/test";
test("demo off shows empty Today and library without silently activating fixtures or review", async ({
  page,
  request,
}) => {
  await page.goto("/today");
  await expect(
    page.getByRole("link", { name: "Thêm bài mới", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("apple", { exact: true })).toHaveCount(0);
  await expect(page.locator(".demo-note")).toHaveCount(0);
  await page
    .getByRole("link", { name: "Thêm bài mới", exact: true })
    .click();

  await expect(page.getByRole("link", { name: "Duyệt bài mẫu" })).toHaveCount(
    0,
  );
  await page.goto("/library");
  await expect(
    page.getByText("Thư viện đang trống", { exact: true }),
  ).toBeVisible();
  await page.goto("/capture/demo/review");
  await expect(
    page.getByText("Chưa có kết quả để duyệt", { exact: true }),
  ).toBeVisible();
  expect((await (await request.get("/api/health")).json()).data.demo).toBe(
    false,
  );
});

test("guest IndexedDB records can be edited and reloaded while foreign-scope records stay hidden", async ({
  page,
}) => {
  await page.goto("/library");
  await expect(
    page.getByText("Thư viện đang trống", { exact: true }),
  ).toBeVisible();
  await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("words-for-kids.local");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const library = await new Promise<{ scopeId: string }>(
      (resolve, reject) => {
        const r = db.transaction("libraries").objectStore("libraries").getAll();
        r.onsuccess = () =>
          resolve(r.result.find((l) => l.scope.kind === "guest"));
        r.onerror = () => reject(r.error);
      },
    );
    const at = "2026-10-09T00:00:00.000Z";
    const records = (scopeId: string, id: string, word: string) => {
      const base = {
        scopeId,
        createdAt: at,
        updatedAt: at,
        version: 1,
        deletedAt: null,
      };
      return {
        entry: {
          ...base,
          id: `entry-${id}`,
          displayText: word,
          language: "en",
          canonicalKey: word,
          activeKey: word,
          keyVersion: 1,
          caseMode: "fold",
          kind: "word",
        },
        sense: {
          ...base,
          id,
          entryId: `entry-${id}`,
          identity: JSON.stringify(["noun", word]),
          pos: "noun",
          senseLabel: word,
          definitionEn: "Prepared local test content.",
          meaningVi: "nội dung phụ huynh nhập",
          art: null,
          source: "Parent input",
          origin: "user",
          contentStatus: "needs_enrichment",
          learningApprovalStatus: "approved",
          contentVersion: 1,
          approvedContentVersion: 1,
          pronunciations: [],
          tags: [],
        },
        index: {
          scopeId,
          id,
          terms: word,
          lessonIds: [],
          art: null,
          ordinal: at + id,
          approval: true,
        },
      };
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
        ["entries", "senses", "searchIndex"],
        "readwrite",
      );
      for (const r of [
        records(library.scopeId, "manual-test", "pear"),
        records("guest:foreign", "foreign-test", "secretword"),
      ]) {
        tx.objectStore("entries").add(r.entry);
        tx.objectStore("senses").add(r.sense);
        tx.objectStore("searchIndex").add(r.index);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.locator(".library-list li")).toHaveCount(1);
  await page.getByRole("searchbox").fill("secretword");
  await expect(
    page.getByText("Không có từ phù hợp", { exact: true }),
  ).toBeVisible();
  await page.goto("/library/words/manual-test");
  await page.getByRole("link", { name: "Sửa", exact: true }).click();

  await page
    .getByLabel("Nghĩa tiếng Việt", { exact: true })
    .fill("quả lê đã lưu thật");
  await page
    .getByRole("button", { name: "Lưu chỉnh sửa trên máy", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "quả lê đã lưu thật", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "quả lê đã lưu thật", exact: true }),
  ).toBeVisible();
  await page.goto("/library/words/foreign-test");
  await expect(
    page.getByText("Không tìm thấy từ này", { exact: true }),
  ).toBeVisible();
});
