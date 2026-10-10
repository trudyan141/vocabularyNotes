import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const noOverflow = async (page: import("@playwright/test").Page) =>
  expect
    .poll(async () =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);

test("welcome, keyboard skip and Today shell use three clear navigation items", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto("/");
  await expect(page).toHaveURL("/welcome");
  await expect(page).toHaveTitle("Words for Kids – Cùng con học tiếng Anh");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  const skip = page.getByRole("link", { name: "Đến nội dung chính" });
  expect((await skip.boundingBox())?.y).toBeLessThan(0);
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  await page.getByRole("link", { name: "Bắt đầu", exact: true }).click();
  await expect(page.getByRole("navigation").getByRole("link")).toHaveCount(3);
  await expect(page.getByRole("link", { name: "Chơi 5 phút" })).toBeVisible();
  await expect(page.locator("footer")).toHaveCount(0);
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/t02-today-${test.info().project.name}.png`,
    fullPage: false,
  });
  expect(errors).toEqual([]);
});

test("settings and lesson actions navigate directly without an adult warning", async ({ page }) => {
  await page.goto("/today");
  await page.getByRole("link", {name:"Cài đặt",exact:true}).click();
  await expect(page).toHaveURL("/settings");await expect(page.getByRole("heading",{name:"Cài đặt",exact:true})).toBeVisible();await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/today");await page.getByRole("link", {name:"Thêm bài",exact:true}).click();
  await expect(page).toHaveURL("/capture");await expect(page.getByRole("dialog")).toHaveCount(0);await expect(page.getByTestId("worksheet-dropzone")).toBeVisible();
  await page.getByRole("link",{name:"Duyệt bài mẫu",exact:true}).click();await expect(page).toHaveURL("/capture/demo/review");await expect(page.getByRole("navigation")).toHaveCount(0);
});
test("library searches Vietnamese without accents, keeps senses and handles no results and filters", async ({
  page,
}) => {
  await page.goto("/library");
  const search = page.getByRole("searchbox");
  await search.fill("QUA TAO");
  await expect(page.locator(".word-list li")).toHaveCount(1);
  await search.fill("bank");
  await expect(page.locator(".word-list li")).toHaveCount(2);
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/t02-library-${test.info().project.name}.png`,
    fullPage: false,
  });
  await search.fill("no-match-fixture");
  await expect(
    page.getByText("Không có từ phù hợp", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Xóa tìm kiếm và lọc" }).click();
  await expect(page.locator(".word-list li")).toHaveCount(20);
  const filter = page.getByRole("button", { name: "Lọc từ", exact: true });
  await filter.click();
  await page.getByRole("radio", { name: "Chưa có hình", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(filter).toBeFocused();
  await expect(page.locator(".word-list li")).toHaveCount(2);
});

test("review edits uncertain text, preserves corrections on save error and retries once", async ({
  page,
}) => {
  await page.goto("/capture/demo/review?case=save-error");
  await expect(
    page.getByRole("checkbox", { name: "Chọn erqser", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Sửa erqser", exact: true }).click();
  await page.getByLabel("Từ tiếng Anh", { exact: true }).fill("");
  await page.getByRole("button", { name: "Xác nhận sửa" }).click();
  await expect(
    page.getByText("Điền từ và nghĩa trước khi xác nhận.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Từ tiếng Anh", { exact: true }).fill("eraser");
  await page.getByRole("button", { name: "Xác nhận sửa" }).click();
  await page
    .getByRole("checkbox", { name: "Chọn eraser", exact: true })
    .check();
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/t02-review-${test.info().project.name}.png`,
    fullPage: false,
  });
  await page.getByRole("button", { name: "Lưu 10 mục", exact: true }).click();
  await expect(page.getByText("Chưa lưu được", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Chọn eraser", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Lưu 10 mục", exact: true }).click();
  await expect(page).toHaveURL("/lessons/demo");
  await expect(
    page.getByText("7 từ mới · 3 từ đã có", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Xem từ trong thư viện mẫu" }).click();
  await page.getByRole("searchbox").fill("eraser");
  await expect(page.locator(".word-list li")).toHaveCount(1);
});

test("all-duplicate review adds no copies; tab changes and Back preserve draft", async ({
  page,
}) => {
  await page.goto("/capture/demo/review");
  for (const word of ["pencil", "ruler", "scissors", "glue", "desk", "chair"])
    await page
      .getByRole("checkbox", { name: `Chọn ${word}`, exact: true })
      .uncheck();
  await page.getByRole("tab", { name: "Câu", exact: true }).click();
  await expect(
    page.getByText("This is a pencil.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Ngữ pháp", exact: true }).click();
  await expect(
    page.getByText("Bài mẫu chưa có mục ngữ pháp", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Từ vựng", exact: true }).click();
  await page.getByRole("link", { name: "Quay lại", exact: true }).click();
  await page.getByRole("link", { name: "Duyệt bài mẫu" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Chọn pencil", exact: true }),
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Lưu 3 mục", exact: true }).click();
  await expect(
    page.getByText("0 từ mới · 3 từ đã có", { exact: true }),
  ).toBeVisible();
});

test("detail hides navigation and metadata, handles missing art and supports preview edits", async ({
  page,
}) => {
  await page.goto("/library/words/bank-river");
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(
    page.getByText("Từ này chưa có hình", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Nguồn và ghi chú", {exact: true})).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await noOverflow(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/t02-detail-${test.info().project.name}.png`,
    fullPage: false,
  });
  await page.getByRole("link", { name: "Sửa", exact: true }).click();

  await page
    .getByLabel("Nghĩa tiếng Việt", { exact: true })
    .fill("bờ của dòng sông");
  await page.getByRole("button", { name: "Lưu chỉnh sửa trên máy" }).click();
  await expect(
    page.getByRole("heading", { name: "bờ của dòng sông", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "bờ của dòng sông", exact: true }),
  ).toBeVisible();
});

test("locale, mode, motion and sound preferences apply and persist independently of sample lessons", async ({
  page,
}) => {
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page
    .getByRole("switch", { name: "Reduce motion", exact: true })
    .check();
  await page
    .getByRole("switch", { name: "Child-friendly interface", exact: true })
    .uncheck();
  await page
    .getByRole("switch", { name: "Sound when you tap listen", exact: true })
    .uncheck();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "standard");
  await page.getByRole("link", { name: "Back to Today", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Play for 5 minutes" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "My words" })
    .click();
  await expect(page).toHaveURL("/library");
  await page.locator("#library-search").fill("apple");
  await expect(page.locator(".word-list li")).toHaveCount(1);
  await page.locator(".word-list a").click();
  await expect(
    page.getByRole("button", { name: "Listen: apple", exact: true }),
  ).toBeDisabled();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("wfk.preferences.v1")!),
  );
  expect(Object.keys(stored).sort()).toEqual([
    "childFriendly",
    "level",
    "locale",
    "reduceMotion",
    "sound",
  ]);
});

test("blocked settings storage reports recovery while preferences still work for the session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  await page.goto("/settings");
  await page.getByRole("radio", { name: "English", exact: true }).click();
  await expect(
    page.getByText("Settings could not be saved", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try saving again" }),
  ).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("unavailable English voice gives a readable fallback without autoplay", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", {
      value: { cancel() {}, getVoices: () => [] },
      configurable: true,
    });
  });
  await page.goto("/library/words/apple");
  await page.getByRole("button", { name: "Nghe: apple", exact: true }).click();
  await expect(
    page.getByText("Chưa có giọng tiếng Anh trên máy.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("I eat an apple.", { exact: true }),
  ).toBeVisible();
});

test("OS reduced motion, narrow reflow and orientation preserve controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/today");
  expect(
    await page
      .getByRole("link", { name: "Chơi 5 phút" })
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration)),
  ).toBeLessThan(0.01);
  await page.setViewportSize({ width: 320, height: 800 });
  await noOverflow(page);
  await page.setViewportSize({ width: 800, height: 360 });
  await noOverflow(page);
  await page.goto("/capture/demo/review");
  await page
    .getByRole("checkbox", { name: "Chọn pencil", exact: true })
    .uncheck();
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(
    page.getByRole("checkbox", { name: "Chọn pencil", exact: true }),
  ).not.toBeChecked();
  await noOverflow(page);
});

test("health and HTML do not expose server keys; unknown routes recover", async ({
  request,
  page,
}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  const payload = await response.json();
  expect(payload.requestId).toMatch(/^[0-9a-f-]{36}$/);
  expect(payload.data).toEqual({
    status: "ok",
    app: "words-for-kids",
    stage: "ui-preview",
    demo: true,
    liveAi: false,
    cloud: false,
  });
  expect(JSON.stringify(payload)).not.toContain("server-boundary-canary");
  await page.goto("/today");
  expect(await page.content()).not.toContain("server-boundary-canary");
  const missing = await page.goto("/missing-page");
  expect(missing?.status()).toBe(404);
  await page.getByRole("link", { name: "Về trang đầu" }).click();
  await expect(page).toHaveURL("/welcome");
});

test("speech controls stop each other and navigation cancels active reading", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      configurable: true,
      value: class {
        text: string;
        constructor(text: string) {
          this.text = text;
        }
      },
    });
    const voice = {
      name: "Test",
      lang: "en-US",
      default: true,
      localService: true,
      voiceURI: "test",
    };
    let speaks = 0;
    let cancels = 0;
    Object.defineProperty(window, "speechSynthesis", {
      configurable: true,
      value: {
        getVoices: () => [voice],
        cancel() {
          cancels++;
        },
        speak() {
          speaks++;
        },
      },
    });
    Object.defineProperty(window, "speechProbe", {
      value: () => ({ speaks, cancels }),
    });
  });
  await page.goto("/library/words/apple");
  await page.getByRole("button", { name: "Nghe: apple", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Dừng đọc: apple", exact: true }),
  ).toHaveCount(1);
  await page
    .getByRole("button", { name: "Nghe chậm: apple", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Dừng đọc: apple", exact: true }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Nghe: apple", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Dừng đọc: apple", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Dừng đọc: apple", exact: true }),
  ).toHaveCount(0);
  const readProbe = () =>
    page.evaluate(() =>
      (
        window as unknown as {
          speechProbe: () => { speaks: number; cancels: number };
        }
      ).speechProbe(),
    );
  expect((await readProbe()).speaks).toBe(2);
  const before = (await readProbe()).cancels;
  await page.getByRole("link", { name: "Từ của con", exact: true }).click();
  await expect(page).toHaveURL("/library");
  expect((await readProbe()).cancels).toBeGreaterThan(before);
});

test("shared controls retain 48px targets and an opaque keyboard focus cue", async ({
  page,
}) => {
  await page.goto("/library");
  const search = page.getByRole("searchbox");
  await expect(search).toBeEnabled();
  await search.focus();
  expect(await search.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe(
    "3px",
  );
  expect(await search.evaluate((el) => getComputedStyle(el).outlineColor)).toBe(
    "rgb(181, 47, 96)",
  );
  await page.goto("/capture/demo/review");
  const checkbox = await page
    .getByRole("checkbox", { name: "Chọn pencil", exact: true })
    .boundingBox();
  expect(checkbox?.width).toBeGreaterThanOrEqual(48);
  expect(checkbox?.height).toBeGreaterThanOrEqual(48);
  await page.goto("/settings");
  const toggle = await page
    .getByRole("switch", { name: "Giảm chuyển động", exact: true })
    .boundingBox();
  expect(toggle?.width).toBeGreaterThanOrEqual(48);
  expect(toggle?.height).toBeGreaterThanOrEqual(48);
});

test("welcome stays simple and fills the viewport; every page has no sample footer", async ({page}, testInfo) => {
  const directory="docs/evaluations/founder-fixes/welcome-cleanup";
  await mkdir(directory,{recursive:true});
  const width=testInfo.project.use.viewport!.width;
  await page.goto('/welcome');
  await expect(page.getByRole('heading',{name:'Cùng Cáo học tiếng Anh!',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Bắt đầu',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Cài đặt',exact:true})).toHaveCount(1);
  await expect(page.locator('.welcome-learning, .welcome-copy small, footer')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Bắt đầu với bài mẫu');
  await noOverflow(page);
  const bounds=await page.locator('.welcome-world').boundingBox();
  expect(bounds!.y+bounds!.height).toBeGreaterThanOrEqual(testInfo.project.use.viewport!.height-24);
  await page.screenshot({path:`${directory}/welcome-${width}.png`,fullPage:true,animations:'disabled'});
  for (const route of ['/today','/library','/practice','/settings','/capture','/library/groups','/library/words/grapes']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer, .demo-note')).toHaveCount(0);
  }
  await expect(page.getByRole('heading',{name:'grapes',exact:true})).toBeVisible();
  await expect(page.getByText('Nguồn và ghi chú',{exact:true})).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({path:`${directory}/detail-${width}.png`,fullPage:true,animations:'disabled'});
  await page.goto('/settings');
  await page.getByRole('radio',{name:'English',exact:true}).click();
  await page.goto('/welcome');
  await expect(page.getByRole('heading',{name:'Learn English with Fox!',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Settings',exact:true})).toHaveCount(1);
  await page.getByRole('link',{name:'Get started',exact:true}).click();
  await expect(page).toHaveURL('/today');
});

test("friendly 404 has the map fox, stays a 404 and returns home in both languages", async ({page}, testInfo) => {
  const response=await page.goto('/missing-page');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:/Úi, Cáo đi lạc rồi!/})).toBeVisible();
  await expect(page.locator('.not-found-code')).toHaveText('404');
  const fox=page.getByRole('img',{name:'Cáo đang xem bản đồ để tìm đường.',exact:true});
  await expect(fox).toBeVisible();
  await expect.poll(()=>fox.evaluate(node=>(node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('footer, .demo-note')).toHaveCount(0);
  await noOverflow(page);
  const directory='docs/evaluations/founder-fixes/welcome-cleanup';
  await mkdir(directory,{recursive:true});
  await page.screenshot({path:`${directory}/404-${testInfo.project.use.viewport!.width}.png`,fullPage:true,animations:'disabled'});
  await page.getByRole('link',{name:'Về trang đầu',exact:true}).click();
  await expect(page).toHaveURL('/welcome');
  await page.goto('/settings');
  await page.getByRole('radio',{name:'English',exact:true}).click();
  const english=await page.goto('/another-missing-page');
  expect(english?.status()).toBe(404);
  await expect(page.getByRole('heading',{name:/Oops, Fox took a wrong turn!/})).toBeVisible();
  await page.getByRole('link',{name:'Go home',exact:true}).click();
  await expect(page).toHaveURL('/welcome');
});
