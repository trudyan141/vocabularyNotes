// Isolated synthetic QA10/QA26 lab: actual IndexedDB + UI, not field INP or a physical phone.
import { chromium, devices } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";
import os from "node:os";
const port = 4326;
const origin = `http://127.0.0.1:${port}`;
const output = process.env.WFK_PERF_OUTPUT ?? "docs/evaluations/t03";
mkdirSync(output, { recursive: true });
const hash = (value) => createHash("sha256").update(value).digest("hex");
const sourceFiles = readdirSync("src", { recursive: true })
  .filter((f) => /\.(tsx?|json|css)$/.test(f))
  .sort();
const sourceHash = hash(
  sourceFiles.map((f) => `${f}\n${readFileSync(`src/${f}`)}`).join("\n"),
);
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    String(port),
  ],
  {
    env: {
      ...process.env,
      APP_DEMO_MODE: "true",
      AI_PROVIDER: "none",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let serverOutput = "";
server.stdout.on("data", (chunk) => {
  serverOutput += String(chunk);
});
server.stderr.on("data", (chunk) => {
  serverOutput += String(chunk);
});
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let browser;
try {
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null)
      throw new Error(`Server exited: ${serverOutput}`);
    try {
      if ((await fetch(origin + "/api/health")).ok) break;
    } catch {}
    if (i === 99) throw new Error("Server did not become ready");
    await pause(100);
  }
  browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin + "/library");
  await page.locator(".library-list li").nth(19).waitFor();
  const fixture = await page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const r = indexedDB.open("words-for-kids.local");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    const library = await new Promise((resolve, reject) => {
      const r = db.transaction("libraries").objectStore("libraries").getAll();
      r.onsuccess = () =>
        resolve(r.result.find((l) => l.scope.kind === "demo"));
      r.onerror = () => reject(r.error);
    });
    const scopeId = library.scopeId;
    const base = (id) => ({
      id,
      scopeId,
      createdAt: "2026-10-09T00:00:00.000Z",
      updatedAt: "2026-10-09T00:00:00.000Z",
      version: 1,
      deletedAt: null,
    });
    const records = [];
    for (let i = 0; i < 4980; i++) {
      const word = `fixtureword${String(i).padStart(5, "0")}`;
      const id = `synthetic-${i}`;
      const entryId = `synthetic-lexeme-${i}`;
      records.push({
        entry: {
          ...base(entryId),
          displayText: word,
          language: "en",
          canonicalKey: word,
          activeKey: word,
          keyVersion: 1,
          caseMode: "fold",
          kind: "word",
        },
        sense: {
          ...base(id),
          entryId,
          identity: JSON.stringify(["noun", id]),
          pos: "noun",
          senseLabel: id,
          definitionEn: `Synthetic performance content ${i}`,
          meaningVi: `Dữ liệu thử ${i}`,
          art: null,
          source: "Synthetic performance fixture",
          origin: "demo",
          contentStatus: "needs_enrichment",
          learningApprovalStatus: "approved",
          contentVersion: 1,
          approvedContentVersion: 1,
          pronunciations: [],
          tags: [`nhóm ${i % 10}`],
        },
        search: {
          scopeId,
          id,
          terms: `${word} du lieu thu ${i} synthetic performance content nhom ${i % 10}`,
          lessonIds: [],
          art: null,
          ordinal: base(id).createdAt + id,
          approval: true,
        },
      });
    }
    await new Promise((resolve, reject) => {
      const tx = db.transaction(
        ["entries", "senses", "searchIndex"],
        "readwrite",
      );
      for (const record of records) {
        tx.objectStore("entries").add(record.entry);
        tx.objectStore("senses").add(record.sense);
        tx.objectStore("searchIndex").add(record.search);
      }
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    return {
      existingDemo: 20,
      synthetic: records.length,
      total: 5000,
      specification: "synthetic-word-v1",
      serializedBytes: JSON.stringify(records).length,
    };
  });
  await page.reload();
  await page.getByRole("status").filter({ hasText: "5000 từ" }).waitFor();
  if ((await page.locator(".library-list li").count()) !== 50)
    throw new Error("Unbounded initial list");
  await page.getByRole("button", { name: "Tiếp", exact: true }).click();
  await page.getByText("51–100 / 5000", { exact: true }).waitFor();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const input = page.getByRole("searchbox");
  await input.fill("fixtureword00000");
  await page
    .locator(".library-list strong")
    .filter({ hasText: "fixtureword00000" })
    .waitFor();
  await cdp.send("Tracing.start", {
    categories: "devtools.timeline,blink.user_timing",
    transferMode: "ReturnAsStream",
  });
  const samples = [];
  for (let i = 1; i <= 50; i++) {
    const scenarios = [
      {
        query: `fixtureword${String(1000 + i).padStart(5, "0")}`,
        first: `fixtureword${String(1000 + i).padStart(5, "0")}`,
        count: 1,
        kind: "exact-English",
      },
      {
        query: "nhom 2",
        first: "fixtureword01002",
        count: 498,
        kind: "unaccented-tag",
      },
      {
        query: "du lieu thu",
        first: "fixtureword00000",
        count: 4980,
        kind: "Vietnamese-meaning",
      },
      {
        query: "nhom 7",
        first: "fixtureword01007",
        count: 498,
        kind: "unaccented-tag",
      },
      { query: `no-result-${i}`, first: null, count: 0, kind: "empty-results" },
      {
        query: "fixtureword0000",
        first: "fixtureword00000",
        count: 10,
        kind: "English-prefix",
      },
    ];
    const scenario = scenarios[(i - 1) % scenarios.length];
    const query = scenario.query;
    await page.evaluate((expected) => {
      const input = document.querySelector('input[type="search"]');
      window.searchPaint = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          observer.disconnect();
          reject(
            new Error(
              `Search exceeded 5s for ${expected.query}; first=${document.querySelector(".library-list strong")?.textContent ?? "none"}`,
            ),
          );
        }, 5000);
        let started = 0;
        let settled = false;
        const observer = new MutationObserver(() => {
          if (
            !started ||
            settled ||
            (expected.first === null
              ? !document
                  .querySelector("main")
                  ?.textContent.includes("Không có từ phù hợp")
              : document.querySelector(".library-list strong")?.textContent !==
                expected.first)
          )
            return;
          settled = true;
          observer.disconnect();
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              clearTimeout(timeout);
              resolve({
                ...expected,
                durationMs: performance.now() - started,
              });
            }),
          );
        });
        input.addEventListener(
          "input",
          () => {
            started = performance.now();
            observer.observe(document.querySelector("main"), {
              subtree: true,
              childList: true,
              characterData: true,
            });
          },
          { once: true, capture: true },
        );
      });
    }, scenario);
    await input.fill(query);
    const sample = await page.evaluate(() => window.searchPaint);
    samples.push(sample);
    if (
      (await page.locator(".library-list li").count()) !==
      Math.min(50, scenario.count)
    )
      throw new Error("Unexpected match count");
  }
  const traceDone = new Promise((resolve) =>
    cdp.once("Tracing.tracingComplete", resolve),
  );
  await cdp.send("Tracing.end");
  const { stream } = await traceDone;
  const chunks = [];
  for (;;) {
    const chunk = await cdp.send("IO.read", { handle: stream });
    chunks.push(
      Buffer.from(chunk.data, chunk.base64Encoded ? "base64" : "utf8"),
    );
    if (chunk.eof) break;
  }
  await cdp.send("IO.close", { handle: stream });
  writeFileSync(
    output + "/search-trace.json.gz",
    gzipSync(Buffer.concat(chunks)),
  );
  await input.fill("QUA TAO");
  await page
    .locator(".library-list strong")
    .filter({ hasText: "apple" })
    .waitFor();
  await input.fill("");
  await page.getByRole("status").filter({ hasText: "5000 từ" }).waitFor();
  if (
    await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)
  )
    throw new Error("Horizontal overflow");
  await page.screenshot({ path: output + "/library-5000-mobile.png" });
  const sorted = samples.map((s) => s.durationMs).sort((a, b) => a - b);
  const p95 = sorted[Math.ceil(sorted.length * 0.95) - 1];
  const report = {
    measuredAt: new Date().toISOString(),
    sourceHash,
    buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
    runtime: {
      node: process.version,
      browser: browser.version(),
      os: `${os.platform()} ${os.release()}`,
      cpu: os.cpus()[0].model,
    },
    profile: {
      emulation: "Pixel 7 / CSS360x800",
      physicalDevice: false,
      cpuSlowdown: 4,
      network: "local search; no provider/cloud",
      metric:
        "native input -> matching DOM -> two requestAnimationFrames (paint-opportunity upper bound, not field INP)",
      warmSearch: true,
    },
    fixture,
    samples,
    medianMs: (sorted[24] + sorted[25]) / 2,
    p95Ms: p95,
    maxMs: sorted.at(-1),
    targetP95Ms: 200,
    passed: p95 <= 200,
    errors,
    limits: [
      "Synthetic dataset; no production/user content",
      "No physical Android/iPhone",
      "No field INP",
      "No OCR/provider/cloud or game/SRS measurement",
    ],
  };
  writeFileSync(
    output + "/search-baseline.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      count: fixture.total,
      actions: samples.length,
      p95Ms: p95,
      maxMs: sorted.at(-1),
      passed: report.passed,
      errors,
    }),
  );
  if (!report.passed || errors.length) process.exitCode = 1;
  await context.close();
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    pause(5000),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}
