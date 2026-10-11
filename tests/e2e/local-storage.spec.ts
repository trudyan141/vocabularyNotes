import { expect, test } from "@playwright/test";
import { schemaV1 } from "../../src/data/local/database";
async function editor(page: import("@playwright/test").Page) {
  await page.goto("/library/words/apple");
  await page.getByRole("link", { name: "Sửa", exact: true }).click();

  await expect(
    page.getByLabel("Nghĩa tiếng Việt", { exact: true }),
  ).toHaveValue("quả táo");
}
test("native IndexedDB save survives reload, updates another tab and rejects a stale parent edit", async ({
  page,
  context,
}) => {
  await editor(page);
  const peer = await context.newPage();
  await editor(peer);
  const watcher = await context.newPage();
  await watcher.goto("/library/words/apple");
  await expect(
    watcher.getByRole("heading", { name: "quả táo", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Nghĩa tiếng Việt", { exact: true })
    .fill("quả táo bố mẹ sửa");
  await page
    .getByRole("button", { name: "Lưu chỉnh sửa", exact: true })
    .click();
  await expect(page.getByRole('button',{name:'Đã lưu chỉnh sửa',exact:true})).toBeVisible();await page.getByRole('link',{name:'Quay lại',exact:true}).click();
  await expect(
    page.getByRole("heading", { name: "quả táo bố mẹ sửa", exact: true }),
  ).toBeVisible();
  await expect(
    watcher.getByRole("heading", { name: "quả táo bố mẹ sửa", exact: true }),
  ).toBeVisible();
  await peer
    .getByLabel("Nghĩa tiếng Việt", { exact: true })
    .fill("bản cũ từ tab khác");
  await peer
    .getByRole("button", { name: "Lưu chỉnh sửa", exact: true })
    .click();
  await expect(peer.locator("main").getByRole("alert")).toContainText(
    "Nội dung đã đổi ở tab",
  );
  await expect(
    peer.getByLabel("Nghĩa tiếng Việt", { exact: true }),
  ).toHaveValue("bản cũ từ tab khác");
  await peer.goto("/library/words/apple");
  await expect(
    peer.getByRole("heading", { name: "quả táo bố mẹ sửa", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "quả táo bố mẹ sửa", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await peer.close();
  await watcher.close();
});
test("native IndexedDB unavailable reports retry and never claims that a library was loaded", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = IDBFactory.prototype.open;
    let blocked = true;
    IDBFactory.prototype.open = function (...args) {
      if (blocked) throw new DOMException("Blocked for test", "SecurityError");
      return original.apply(this, args);
    };
    Object.defineProperty(window, "allowStorageForTest", {
      value: () => {
        blocked = false;
      },
    });
  });
  await page.goto("/library");
  await expect(
    page.getByText("Chưa mở được thư viện trên máy", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Thư viện đang trống", { exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() =>
    (
      window as unknown as { allowStorageForTest: () => void }
    ).allowStorageForTest(),
  );
  await page
    .getByRole("button", { name: "Thử mở lại thư viện", exact: true })
    .click();
  await expect(page.locator(".word-list li")).toHaveCount(20);
});
test("native quota error rolls back a reviewed lesson; retry and receipt survive reload", async ({
  page,
}) => {
  await page.goto("/capture/demo/review");
  await expect(
    page.getByRole("button", { name: "Lưu 9 mục", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => {
    const original = IDBObjectStore.prototype.add;
    let fail = true;
    IDBObjectStore.prototype.add = function (...args) {
      if (fail && this.name === "senses") {
        fail = false;
        throw new DOMException("Test quota", "QuotaExceededError");
      }
      return original.apply(this, args);
    };
  });
  await page.getByRole("button", { name: "Lưu 9 mục", exact: true }).click();
  await expect(page.getByText("Chưa lưu được", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Lưu 9 mục", exact: true }).click();
  await expect(page).toHaveURL("/lessons/demo");
  await expect(
    page.getByText("6 từ mới · 3 từ đã có", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("6 từ mới · 3 từ đã có", { exact: true }),
  ).toBeVisible();
  await page.goto("/capture/demo/review");
  await page.getByRole("button", { name: "Lưu 9 mục", exact: true }).click();
  await expect(
    page.getByText("6 từ mới · 3 từ đã có", { exact: true }),
  ).toBeVisible();
  await page.goto("/library");
  await expect(page.locator(".word-list li")).toHaveCount(26);
});
test("review draft selection and corrected source text survive a real reload", async ({
  page,
}) => {
  await page.goto("/capture/demo/review");
  await page
    .getByRole("checkbox", { name: "Chọn pencil", exact: true })
    .uncheck();
  await page.getByRole("button", { name: "Sửa erqser", exact: true }).click();
  await page.getByLabel("Từ tiếng Anh", { exact: true }).fill("eraser");
  await page.getByRole("button", { name: "Xác nhận sửa", exact: true }).click();
  // A tab close before the IDB transaction completes cannot be advertised as saved.
  await expect
    .poll(async () =>
      page.evaluate(async () => {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open("words-for-kids.local");
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
        const draft = await new Promise<{
          candidates: { id: string; text: string; selected: boolean }[];
        }>((resolve, reject) => {
          const request = db
            .transaction("drafts")
            .objectStore("drafts")
            .getAll();
          request.onsuccess = () => resolve(request.result[0]);
          request.onerror = () => reject(request.error);
        });
        db.close();
        return draft.candidates.find((c) => c.id === "eraser")?.text;
      }),
    )
    .toBe("eraser");
  await page.reload();
  await expect(
    page.getByRole("checkbox", { name: "Chọn eraser", exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole("checkbox", { name: "Chọn pencil", exact: true }),
  ).not.toBeChecked();
});

// Build a native v1 database before loading any React/Dexie code.
test("native version-one migration preserves word, note and event records", async ({
  page,
}) => {
  await page.goto("/illustrations/apple.svg");
  await page.evaluate(async (schema) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("words-for-kids.local", 10); // Dexie logical v1 maps to native v10.
      r.onupgradeneeded = () => {
        const parse = (key: string) =>
          key.startsWith("[") ? key.slice(1, -1).split("+") : key;
        for (const [name, definition] of Object.entries(schema)) {
          const [primary, ...indexes] = definition
            .split(",")
            .map((x) => x.trim());
          const store = r.result.createObjectStore(name, {
            keyPath: parse(primary),
          });
          for (const token of indexes) {
            const key = token.replace(/^&/, "");
            store.createIndex(key, parse(key), {
              unique: token.startsWith("&"),
            });
          }
        }
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const scopeId = "demo:legacy";
    const at = "2026-10-09T00:00:00.000Z";
    const base = (id: string) => ({
      id,
      scopeId,
      createdAt: at,
      updatedAt: at,
      version: 1,
      deletedAt: null,
    });
    const records: Record<string, Record<string, unknown>[]> = {
      metadata: [{ key: "active-demo", value: "legacy" }],
      libraries: [
        {
          id: "legacy",
          scopeId,
          scope: { id: scopeId, kind: "demo" },
          seeded: true,
        },
      ],
      entries: [
        {
          ...base("lexeme"),
          displayText: "apple",
          language: "en",
          canonicalKey: "apple",
          activeKey: "apple",
          keyVersion: 1,
          caseMode: "fold",
          kind: "word",
        },
      ],
      senses: [
        {
          ...base("apple"),
          entryId: "lexeme",
          identity: JSON.stringify(["noun", "apple"]),
          pos: "noun",
          senseLabel: "apple",
          definitionEn: "A fruit.",
          meaningVi: "táo giữ từ bản cũ",
          art: "apple",
          source: "Prepared migration fixture",
          origin: "user",
          contentStatus: "complete",
          contentVersion: 1,
          learningApprovalStatus: "approved",
          approvedContentVersion: 1,
        },
      ],
      examples: [
        {
          ...base("example"),
          senseId: "apple",
          textEn: "I eat an apple.",
          translationVi: "Tôi ăn táo.",
          origin: "user",
        },
      ],
      notes: [
        {
          ...base("note"),
          targetType: "sense",
          targetId: "apple",
          text: "Ghi chú cũ không mất",
          origin: "user",
        },
      ],
      reviewEvents: [
        {
          id: "event",
          scopeId,
          senseId: "apple",
          sessionId: "session",
          rating: "Good",
          hints: false,
          eventTime: at,
        },
      ],
    };
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(Object.keys(records), "readwrite");
      for (const [name, rows] of Object.entries(records))
        for (const row of rows) tx.objectStore(name).add(row);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
  }, schemaV1);
  await page.goto("/library/words/apple");
  await expect(
    page.getByRole("heading", { name: "táo giữ từ bản cũ", exact: true }),
  ).toBeVisible();
  const persisted = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const r = indexedDB.open("words-for-kids.local");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const read = (name: string) =>
      new Promise<Record<string, unknown>[]>((resolve, reject) => {
        const r = db.transaction(name).objectStore(name).getAll();
        r.onsuccess = () => resolve(r.result);
        r.onerror = () => reject(r.error);
      });
    const result = {
      version: db.version,
      notes: await read("notes"),
      events: await read("reviewEvents"),
      senses: await read("senses"),
    };
    db.close();
    return result;
  });
  expect(persisted.version).toBe(40);
  expect(persisted.notes[0].text).toBe("Ghi chú cũ không mất");
  expect(persisted.events).toHaveLength(1);
  expect(persisted.senses[0].tags).toEqual([]);
  await page.goto("/library");
  await page.getByRole("searchbox").fill("TAO GIU TU BAN CU");
  await expect(page.locator(".library-list li")).toHaveCount(1);
});

test("two native tabs save the same reviewed draft once", async ({
  page,
  context,
}) => {
  await page.goto("/capture/demo/review");
  const peer = await context.newPage();
  await peer.goto("/capture/demo/review");
  await expect(
    page.getByRole("button", { name: "Lưu 9 mục", exact: true }),
  ).toBeEnabled();
  await expect(
    peer.getByRole("button", { name: "Lưu 9 mục", exact: true }),
  ).toBeEnabled();
  await Promise.all([
    page.getByRole("button", { name: "Lưu 9 mục", exact: true }).click(),
    peer.getByRole("button", { name: "Lưu 9 mục", exact: true }).click(),
  ]);
  for (const tab of [page, peer]) {
    await expect(tab).toHaveURL("/lessons/demo");
    await expect(
      tab.getByText("6 từ mới · 3 từ đã có", { exact: true }),
    ).toBeVisible();
  }
  await page.goto("/library");
  await expect(page.locator(".library-list li")).toHaveCount(26);
  await peer.close();
});

test('changed English word and its examples are approved together with one save',async({page})=>{
 await editor(page);await page.getByLabel('Từ tiếng Anh',{exact:true}).fill('peach');await page.getByLabel('Nghĩa tiếng Việt',{exact:true}).fill('quả đào');await page.getByLabel('Nghĩa tiếng Anh',{exact:true}).fill('A sweet round fruit.');await page.getByLabel('Câu ví dụ tiếng Anh',{exact:true}).fill('I eat a peach.');await page.getByLabel('Nghĩa câu ví dụ',{exact:true}).fill('Con ăn quả đào.');await page.getByLabel('Câu ví dụ thứ hai',{exact:true}).fill('The peach is sweet.');await page.getByLabel('Nghĩa câu ví dụ thứ hai',{exact:true}).fill('Quả đào ngọt.');await page.getByRole('button',{name:'Lưu chỉnh sửa',exact:true}).click();await expect(page.getByRole('button',{name:'Đã lưu chỉnh sửa',exact:true})).toBeVisible();await page.reload();await expect(page.getByLabel('Từ tiếng Anh',{exact:true})).toHaveValue('peach');await page.getByRole('link',{name:'Quay lại',exact:true}).click();await expect(page.getByRole('heading',{name:'peach',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'quả đào',exact:true})).toBeVisible();
});
