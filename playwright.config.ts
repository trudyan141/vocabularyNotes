import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4320", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop-chromium",
      testMatch: [
        "scaffold.spec.ts",
        "local-storage.spec.ts",
        "capture.spec.ts",
        "learning.spec.ts",
        "groups.spec.ts",
        "seo.spec.ts",
        "account.spec.ts",
        "profile-library.spec.ts",
        "parent-ai.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 1000 },
      },
    },
    {
      name: "mobile-chromium",
      testMatch: [
        "scaffold.spec.ts",
        "local-storage.spec.ts",
        "capture.spec.ts",
        "learning.spec.ts",
        "groups.spec.ts",
        "seo.spec.ts",
        "account.spec.ts",
        "profile-library.spec.ts",
        "parent-ai.spec.ts",
      ],
      use: {
        ...devices["Pixel 7"],
        viewport: { width: 360, height: 800 },
      },
    },
    {
      name: "cloud-integration",
      testMatch: "cloud.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4328" },
    },
    {
      name: "demo-disabled",
      testMatch: "demo-disabled.spec.ts",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:4322" },
    },
  ],
  webServer: [
    {
      command: "node scripts/cloud-test-server.mjs --test",
      url: "http://127.0.0.1:4328/api/health",
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: "pnpm start --port 4320",
      url: "http://127.0.0.1:4320",
      reuseExistingServer: false,
      env: {
        APP_DEMO_MODE: "true",
        AI_PROVIDER: "none",
        OPENAI_API_KEY: "server-boundary-canary",
      },
      timeout: 30_000,
    },
    {
      command: "pnpm start --port 4322",
      url: "http://127.0.0.1:4322",
      reuseExistingServer: false,
      env: { APP_DEMO_MODE: "false", AI_PROVIDER: "none" },
      timeout: 30_000,
    },
  ],
});
