// Local fixture-only QA26 baseline. Browser emulation is not a device/field pass.
import { chromium, devices } from "@playwright/test";
import { spawn, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import os from "node:os";

const port = 4324;
const base = `http://127.0.0.1:${port}`;
const out = process.env.WFK_PERF_OUTPUT ?? "docs/evaluations/t02";
mkdirSync(out, { recursive: true });
const sha = (value) => createHash("sha256").update(value).digest("hex");
const files = readdirSync("src", { recursive: true })
  .filter((f) => /\.(tsx?|css|json)$/.test(f))
  .sort();
const sourceHash = sha(
  files.map((f) => `${f}\n${readFileSync("src/" + f)}`).join("\n"),
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
    stdio: "pipe",
  },
);
let logs = "";
server.stdout.on("data", (b) => {
  logs = (logs + b).slice(-4000);
});
server.stderr.on("data", (b) => {
  logs = (logs + b).slice(-4000);
});
let browser;
const report = {
  timestamp: new Date().toISOString(),
  buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
  baseCommit: execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim(),
  sourceHash,
  fixtureHash: sha(readFileSync("src/lib/demo/fixtures.json")),
  fixtureEntries: 20,
  host: {
    os: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    cpu: os.cpus()[0]?.model,
    node: process.version,
  },
  profile: {
    device: "Pixel 7 viewport 360x800; Chromium desktop emulation",
    network: {
      latencyMs: 150,
      downloadBytesPerSecond: 200000,
      uploadBytesPerSecond: 93750,
    },
    cpuRate: 4,
    cache:
      "new browser context per cold run; browser cache disabled; production server warm",
    physicalAndroid: "pending",
    physicalIPhone: "pending",
    fieldINP: "pending, no RUM samples",
  },
  runs: [],
  interaction: {},
  limits: {
    lcpMs: 2500,
    cls: 0.1,
    jsGzipKiB: 300,
    fontKiB: 150,
    pageKiB: 1024,
    feedbackMs: 100,
    searchMs: 200,
  },
};
try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      ready = (await fetch(base + "/api/health")).ok;
    } catch {}
    if (ready) break;
    if (server.exitCode !== null) throw new Error(logs);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("Production server did not start");
  browser = await chromium.launch();
  report.browser = browser.version();
  for (const route of ["/today", "/library", "/practice"]) {
    for (let run = 1; run <= 5; run++) {
      const context = await browser.newContext({
        ...devices["Pixel 7"],
        viewport: { width: 360, height: 800 },
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
      await cdp.send("Network.emulateNetworkConditions", {
        offline: false,
        latency: 150,
        downloadThroughput: 200000,
        uploadThroughput: 93750,
        connectionType: "cellular4g",
      });
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.addInitScript(() => {
        window.__baseline = { lcp: 0, cls: 0 };
        let sessionStart = 0;
        let sessionLast = 0;
        let sessionValue = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            window.__baseline.lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.hadRecentInput) continue;
            if (
              e.startTime - sessionLast > 1000 ||
              e.startTime - sessionStart > 5000
            ) {
              sessionStart = e.startTime;
              sessionValue = 0;
            }
            sessionLast = e.startTime;
            sessionValue += e.value;
            window.__baseline.cls = Math.max(
              window.__baseline.cls,
              sessionValue,
            );
          }
        }).observe({ type: "layout-shift", buffered: true });
      });
      const responses = [];
      const pending = [];
      let collecting=true,captureError=null;
      page.on("response", (response) => {
        const request = response.request();
        if (
          !collecting||!["document", "script", "stylesheet", "font", "image"].includes(
            request.resourceType(),
          )
        )
          return;
        pending.push(
          (async () => {
            const body = await response.body();
            responses.push({
              path: new URL(response.url()).pathname,
              type: request.resourceType(),
              decodedBytes: body.length,
              gzipBytes: gzipSync(body).length,
            });
          })().catch(error=>{captureError=error;}),
        );
      });
      await page.goto(base + route);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      collecting=false;
      await Promise.all(pending);
      if(captureError)throw captureError;
      const timing = await page.evaluate(() => ({
        ...window.__baseline,
        resources: performance
          .getEntriesByType("resource")
          .map((e) => ({
            path: new URL(e.name).pathname,
            transferSize: e.transferSize,
            encodedBodySize: e.encodedBodySize,
            decodedBodySize: e.decodedBodySize,
          })),
        navigation: performance
          .getEntriesByType("navigation")
          .map((e) => ({
            transferSize: e.transferSize,
            encodedBodySize: e.encodedBodySize,
            decodedBodySize: e.decodedBodySize,
          })),
      }));
      const jsGzipBytes = responses
        .filter((r) => r.type === "script")
        .reduce((sum, r) => sum + r.gzipBytes, 0);
      const fontBytes = responses
        .filter((r) => r.type === "font")
        .reduce((sum, r) => sum + r.decodedBytes, 0);
      const transferBytes = [...timing.resources, ...timing.navigation].reduce(
        (sum, r) => sum + r.transferSize,
        0,
      );
      report.runs.push({
        route,
        run,
        ...timing,
        responses,
        jsGzipBytes,
        fontBytes,
        transferBytes,
      });
      console.log(
        `${route} ${run}/5: LCP ${timing.lcp.toFixed(0)}ms; CLS ${timing.cls.toFixed(4)}; JS ${(jsGzipBytes / 1024).toFixed(1)}KiB gzip; page ${(transferBytes / 1024).toFixed(1)}KiB`,
      );
      await context.close();
    }
  }
  const context = await browser.newContext({
    ...devices["Pixel 7"],
    viewport: { width: 360, height: 800 },
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto(base + "/library");
  await page.waitForLoadState("networkidle");
  await page.getByRole("searchbox").fill("apple");
  await page.locator(".word-list li").first().waitFor();
  await cdp.send("Tracing.start", {
    categories: "devtools.timeline,blink.user_timing",
    transferMode: "ReturnAsStream",
  });
  const searchSamples = [];
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => {
      const input = document.querySelector('input[type="search"]');
      window.__paintSample = new Promise((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error("No result mutation within 2s")),
          2000,
        );
        input.addEventListener(
          "input",
          () => {
            const start = performance.now();
            const observer = new MutationObserver(() => {
              observer.disconnect();
              clearTimeout(timeout);
              requestAnimationFrame(() =>
                requestAnimationFrame(() => resolve(performance.now() - start)),
              );
            });
            observer.observe(document.querySelector("main"), {
              subtree: true,
              childList: true,
              characterData: true,
            });
          },
          { once: true, capture: true },
        );
      });
    });
    await page.getByRole("searchbox").fill(i % 2 ? "qua tao" : "bank");
    searchSamples.push(await page.evaluate(() => window.__paintSample));
  }
  const traceDone = new Promise((resolve) =>
    cdp.once("Tracing.tracingComplete", resolve),
  );
  await cdp.send("Tracing.end");
  const { stream } = await traceDone;
  let trace = "";
  for (;;) {
    const chunk = await cdp.send("IO.read", { handle: stream });
    trace += chunk.data;
    if (chunk.eof) break;
  }
  await cdp.send("IO.close", { handle: stream });
  writeFileSync(out + "/search-trace.json.gz", gzipSync(trace));
  const ordered = [...searchSamples].sort((a, b) => a - b);
  report.interaction = {
    type: "native input event -> DOM mutation -> two rAF; paint opportunity upper bound, not field INP",
    cpuRate: 4,
    debounceMs: 0,
    sampleCount: 50,
    entryCount: 20,
    samplesMs: searchSamples,
    p95Ms: ordered[Math.ceil(0.95 * ordered.length) - 1],
    feedbackScope:
      "50 search input actions; listen/reveal/answer/nav trace coverage remains future tasks",
    search5000Entries: "measured separately by measure-local-search; this 20-entry trace is not the 5000-entry gate",
  };
  console.log(
    `Search/visual-feedback 50 actions: p95 ${report.interaction.p95Ms.toFixed(1)}ms (20 entries)`,
  );
  await context.close();
  writeFileSync(out + "/baseline.json", JSON.stringify(report, null, 2) + "\n");
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
