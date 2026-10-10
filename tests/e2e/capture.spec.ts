import { test, expect, type Page } from "@playwright/test";
async function fixture(
  page: Page,
  type = "image/png",
  width = 600,
  height = 400,
) {
  const data = await page.evaluate(
    async ({ type, width, height }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#b52f60";
      ctx.fillRect(0, 0, width / 2, height / 2);
      ctx.fillStyle = "#38213d";
      ctx.font = "36px sans-serif";
      ctx.fillText("Synthetic worksheet", 30, height - 60);
      return canvas.toDataURL(type).split(",")[1];
    },
    { type, width, height },
  );
  return Buffer.from(data, "base64");
}
async function upload(
  page: Page,
  buffer: Buffer,
  mimeType = "image/png",
  name = "worksheet.png",
) {
  await page
    .getByLabel("Chọn ảnh từ máy", { exact: true })
    .setInputFiles({ name, mimeType, buffer });
}
async function records(page: Page) {
  return page.evaluate(async () => {
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
    const drafts = await read("captureDrafts"),
      media = await read("localMedia");
    db.close();
    return {
      drafts,
      media: media.map((row) => ({
        id: row.id,
        scopeId: row.scopeId,
        byteSize: row.byteSize,
      })),
    };
  });
}
// The bundled Chromium returns NotSupportedError for GUM even with fake-device flags.
// Mock only device acquisition; stream, video playback and track lifecycle stay native.
async function cameraFixture(page: Page, late = false) {
  await page.addInitScript(({ late }) => {
    const state = window as unknown as { capturedTracks: MediaStreamTrack[]; lateStream: MediaStream; releasePermission: () => void };
    state.capturedTracks = [];
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement("canvas"); canvas.width = 600; canvas.height = 400;
      const ctx = canvas.getContext("2d")!;
      const timer = setInterval(() => { ctx.fillStyle = "white"; ctx.fillRect(0,0,600,400); ctx.fillStyle = "black"; ctx.fillText("Synthetic camera worksheet",30,100); }, 30);
      const stream = canvas.captureStream(15);
      for (const track of stream.getTracks()) {
        const stop = track.stop.bind(track);
        track.stop = () => { clearInterval(timer); stop(); };
      }
      state.capturedTracks.push(...stream.getTracks());
      if (late) { state.lateStream = stream; await new Promise<void>(resolve => { state.releasePermission = resolve; }); }
      return stream;
    };
  }, { late });
}
test("upload, rotate, crop, optional fields and consent survive reload without an AI upload", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" ||
      (/^https?:/.test(request.url()) && !request.url().startsWith("http://127.0.0.1:"))
    )
      remote.push(request.url());
  });
  await page.goto("/capture");
  await upload(page, await fixture(page));
  await expect(page).toHaveURL(/\/capture\/[^/]+\/edit$/);
  await expect(page.getByText("600 × 400 px", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Xoay 90°" }).click();
  await expect(page.getByText("400 × 600 px", { exact: false })).toBeVisible();
  await page.getByText("Cắt vùng ảnh", { exact: true }).click();
  await page.getByLabel("Mép phải (%)").fill("50");
  await page.getByRole("button", { name: "Áp dụng vùng cắt" }).click();
  await expect(page.getByText("200 × 600 px", { exact: false })).toBeVisible();
  await page.getByLabel("Tên bài (tùy chọn)").fill("Bài của bé");
  await page.getByLabel("Ngày học (tùy chọn)").fill("2026-10-09");
  await page.getByLabel("Tags (tùy chọn)").fill("school, objects");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Lưu nháp trên máy" }).click();
  await expect(
    page.getByText("Đã lưu nháp trên máy", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Phân tích ảnh bằng AI", exact: true }),
  ).toBeEnabled();
  await page.reload();
  await expect(page.getByLabel("Tên bài (tùy chọn)")).toHaveValue("Bài của bé");
  await expect(page.getByLabel("Ngày học (tùy chọn)")).toHaveValue(
    "2026-10-09",
  );
  await expect(page.getByLabel("Tags (tùy chọn)")).toHaveValue(
    "school, objects",
  );
  await expect(page.getByRole("checkbox")).toBeChecked();
  await expect(page.getByText("200 × 600 px", { exact: false })).toBeVisible();
  const rows = await records(page);
  expect(rows.drafts).toHaveLength(1);
  expect(rows.media).toHaveLength(2);
  await page.getByRole("button", { name: "Quay lại và giữ nháp" }).click();
  await expect(page).toHaveURL("/capture");
  await expect(
    page.getByRole("link", { name: "Bài của bé", exact: true }),
  ).toBeVisible();
  await page.goto("/today");
  await page.getByRole("button", { name: "Tiếp tục nháp ảnh" }).click();
  await page.getByRole("button", { name: "Bố mẹ tiếp tục" }).click();
  await expect(page.getByLabel("Tên bài (tùy chọn)")).toHaveValue("Bài của bé");
  expect(remote).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("two editors preserve stale input, and autosave quota failure retains fields until retry", async ({ page, context }) => {
  await page.goto("/capture"); await upload(page,await fixture(page));
  await expect(page).toHaveURL(/\/edit$/); const url = page.url();
  const peer = await context.newPage(); await peer.goto(url);
  await expect(peer.getByLabel("Tên bài (tùy chọn)")).toBeVisible();
  await page.getByLabel("Tên bài (tùy chọn)").fill("Newer title");
  await page.getByRole("button",{name:"Lưu nháp trên máy"}).click();
  await expect(page.getByText("Đã lưu nháp trên máy",{exact:true})).toBeVisible();
  await peer.getByLabel("Tên bài (tùy chọn)").fill("Stale title");
  await peer.getByRole("button",{name:"Lưu nháp trên máy"}).click();
  await expect(peer.getByText(/Nháp đã thay đổi ở tab khác/)).toBeVisible();
  await expect(peer.getByLabel("Tên bài (tùy chọn)")).toHaveValue("Stale title");
  expect((await records(page)).drafts[0].title).toBe("Newer title");
  await peer.close();
  await page.evaluate(() => {
    const state=window as unknown as { capturePut: typeof IDBObjectStore.prototype.put; quota:boolean };
    state.capturePut=IDBObjectStore.prototype.put; state.quota=true;
    IDBObjectStore.prototype.put=function(...args) { if(this.name === "captureDrafts" && state.quota) throw new DOMException("full","QuotaExceededError"); return state.capturePut.apply(this,args); };
  });
  await page.getByLabel("Tên bài (tùy chọn)").fill("Retry title");
  await expect(page.getByText(/Chưa lưu được trên máy/)).toBeVisible();
  await expect(page.getByLabel("Tên bài (tùy chọn)")).toHaveValue("Retry title");
  expect((await records(page)).drafts[0].title).toBe("Newer title");
  await page.evaluate(()=> { (window as unknown as {quota:boolean}).quota=false; });
  await page.getByRole("button",{name:"Lưu nháp trên máy"}).click();
  await expect(page.getByText("Đã lưu nháp trên máy",{exact:true})).toBeVisible();
  await page.reload(); await expect(page.getByLabel("Tên bài (tùy chọn)")).toHaveValue("Retry title");
});
test("camera denied and unsupported retain file upload; permission is asked only after a click", async ({
  page,
}) => {
  await page.addInitScript(() => {
    (window as unknown as { cameraCalls: number }).cameraCalls = 0;
    navigator.mediaDevices.getUserMedia = async () => {
      (window as unknown as { cameraCalls: number }).cameraCalls++;
      throw new DOMException("denied", "NotAllowedError");
    };
  });
  await page.goto("/capture");
  await expect(
    page.getByLabel("Chọn ảnh từ máy", { exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => (window as unknown as { cameraCalls: number }).cameraCalls,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect(page.getByText(/Camera bị từ chối/)).toBeVisible();
  await upload(page, await fixture(page));
  await expect(page).toHaveURL(/\/edit$/);
  await page.goto("/capture");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "mediaDevices", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect(
    page.getByText(/Trình duyệt này chưa dùng được camera/),
  ).toBeVisible();
  await expect(
    page.getByLabel("Chọn ảnh từ máy", { exact: true }),
  ).toBeEnabled();
});
test("live browser camera capture and switching stop old tracks, close and navigation stop all tracks", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["camera"]);
  await cameraFixture(page);
  await page.goto("/capture");
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect(
    page.getByRole("button", { name: "Chụp ảnh", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Đổi camera" }).click();
  await expect(
    page.getByRole("button", { name: "Chụp ảnh", exact: true }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () =>
        (window as unknown as { capturedTracks: MediaStreamTrack[] })
          .capturedTracks[0].readyState,
    ),
  ).toBe("ended");
  await page.getByRole("button", { name: "Chụp ảnh", exact: true }).click();
  await expect(page).toHaveURL(/\/edit$/);
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { capturedTracks: MediaStreamTrack[] }
      ).capturedTracks.every((track) => track.readyState === "ended"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Quay lại và giữ nháp" }).click();
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect(
    page.getByRole("button", { name: "Chụp ảnh", exact: true }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Đóng camera" }).click();
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { capturedTracks: MediaStreamTrack[] }
      ).capturedTracks.every((track) => track.readyState === "ended"),
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect(
    page.getByRole("button", { name: "Chụp ảnh", exact: true }),
  ).toBeEnabled();
  await page.getByRole("link", { name: "Quay lại", exact: true }).click();
  await expect(page).toHaveURL("/today");
  expect(
    await page.evaluate(() =>
      (
        window as unknown as { capturedTracks: MediaStreamTrack[] }
      ).capturedTracks.every((track) => track.readyState === "ended"),
    ),
  ).toBe(true);
});
test("late camera permission after cancellation cannot resurrect the preview or leak tracks", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["camera"]);
  await cameraFixture(page,true);
  await page.goto("/capture");
  await page.getByRole("button", { name: "Mở camera" }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          typeof (window as unknown as { releasePermission: unknown })
            .releasePermission,
      ),
    )
    .toBe("function");
  await page.getByRole("button", { name: "Đóng camera" }).click();
  await page.evaluate(() =>
    (
      window as unknown as { releasePermission: () => void }
    ).releasePermission(),
  );
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { lateStream: MediaStream }).lateStream
          .getTracks()
          .every((track) => track.readyState === "ended"),
      ),
    )
    .toBe(true);
  await expect(page.getByRole("button", { name: "Mở camera" })).toBeEnabled();
});
test("HEIC, MIME mismatch, oversized and corrupt images never create a draft", async ({
  page,
}) => {
  await page.goto("/capture");
  const heic = Buffer.alloc(20);
  heic.write("ftypheic", 4);
  await upload(page, heic, "image/heic", "photo.heic");
  await expect(page.getByText(/Ảnh HEIC chưa được hỗ trợ/)).toBeVisible();
  await upload(page, await fixture(page), "image/jpeg", "fake.jpg");
  await expect(page.getByText(/Không đọc được ảnh này/)).toBeVisible();
  await upload(page, Buffer.alloc(10_000_001), "image/png");
  await expect(
    page.getByText(/Ảnh phải nhỏ hơn hoặc bằng 10 MB/),
  ).toBeVisible();
  const png = Buffer.alloc(24);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(png);
  png.write("IHDR", 12);
  png.writeUInt32BE(6000, 16);
  png.writeUInt32BE(4000, 20);
  await upload(page, png);
  await expect(page.getByText(/Ảnh vượt 20 megapixel/)).toBeVisible();
  await upload(page, Buffer.from("not-an-image"));
  await expect(page.getByText(/Không đọc được ảnh này/)).toBeVisible();
  expect((await records(page)).drafts).toHaveLength(0);
  await upload(page, await fixture(page));
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByText("Cắt vùng ảnh", { exact: true }).click();
  await page.getByLabel("Mép trái (%)").fill("100");
  await page.getByRole("button", { name: "Áp dụng vùng cắt" }).click();
  await expect(page.getByText(/Vùng cắt chưa hợp lệ/)).toBeVisible();
  await expect(page.getByText("600 × 400 px", { exact: false })).toBeVisible();
});
test("EXIF orientation is baked once, metadata is stripped and a large valid image resizes", async ({
  page,
}) => {
  await page.goto("/capture");
  const raw = await fixture(page, "image/jpeg");
  // APP1 Exif/TIFF orientation 6: rotate clockwise. Test data contains no personal metadata.
  const exif = Buffer.from([
    255, 225, 0, 34, 69, 120, 105, 102, 0, 0, 73, 73, 42, 0, 8, 0, 0, 0, 1, 0,
    18, 1, 3, 0, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0,
  ]);
  await upload(
    page,
    Buffer.concat([raw.subarray(0, 2), exif, raw.subarray(2)]),
    "image/jpeg",
    "oriented.jpg",
  );
  await expect(page).toHaveURL(/\/edit$/);
  await expect(page.getByText("400 × 600 px", { exact: false })).toBeVisible();
  const pixels = await page.evaluate(async () => {
    const img = document.querySelector<HTMLImageElement>(".capture-image")!;
    await img.decode();
    const response = await fetch(img.src);
    const blob = await response.blob();
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    return {
      mime: blob.type,
      hasExif: new TextDecoder().decode(bytes).includes("Exif"),
      topRight: Array.from(ctx.getImageData(350, 50, 1, 1).data),
      topLeft: Array.from(ctx.getImageData(50, 50, 1, 1).data),
    };
  });
  expect(pixels.mime).toBe("image/jpeg");
  expect(pixels.hasExif).toBe(false);
  expect(pixels.topRight[0]).toBeLessThan(220);
  expect(pixels.topLeft[0]).toBeGreaterThan(240);
  await page.getByRole("button", { name: "Quay lại và giữ nháp" }).click();
  await upload(
    page,
    await fixture(page, "image/jpeg", 3200, 2400),
    "image/jpeg",
    "large.jpg",
  );
  await expect(
    page.getByText("2200 × 1650 px", { exact: false }),
  ).toBeVisible();
});
test("quota rollback preserves the image for retry and confirmed delete removes only that draft's pixels", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const add = IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add = function (...args) {
      if (
        this.name === "captureDrafts" &&
        !(window as unknown as { allowCapture: boolean }).allowCapture
      )
        throw new DOMException("full", "QuotaExceededError");
      return add.apply(this, args);
    };
  });
  await page.goto("/capture");
  await upload(page, await fixture(page));
  await expect(page.getByText(/Chưa lưu được trên máy/)).toBeVisible();
  expect((await records(page)).media).toHaveLength(0);
  await expect(
    page.getByRole("img", { name: "Ảnh chưa lưu được" }),
  ).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { allowCapture: boolean }).allowCapture = true;
  });
  await page.getByRole("button", { name: "Thử lưu ảnh lại" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByLabel("Tên bài (tùy chọn)").fill("Keep me");
  await page.getByRole("button", { name: "Quay lại và giữ nháp" }).click();
  await upload(page, await fixture(page));
  await page.getByRole("button", { name: "Quay lại và giữ nháp" }).click();
  const remove = page.getByRole("button", {
    name: "Xóa nháp chưa đặt tên",
    exact: true,
  });
  await remove.click();
  expect((await records(page)).drafts).toHaveLength(2);
  await remove.click();
  await expect.poll(async () => (await records(page)).drafts.length).toBe(1);
  expect((await records(page)).media).toHaveLength(2);
  await expect(
    page.getByRole("link", { name: "Keep me", exact: true }),
  ).toBeVisible();
});
