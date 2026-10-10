import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    clearMocks: true,
    env: {
      NEXT_PUBLIC_GEMINI_DEFAULT_KEY: "AQ." + "test-default-parent-key-canary-123456",
    },
  },
});
