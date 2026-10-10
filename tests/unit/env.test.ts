import { describe, expect, it } from "vitest";
import { parseAppEnv } from "@/lib/env-schema";

describe("configuration safety", () => {
  it("runs without credentials and keeps live AI disabled", () => {
    const env = parseAppEnv({});
    expect(env.AI_PROVIDER).toBe("none");
    expect(env.OPENAI_API_KEY).toBeUndefined();
    expect(env.SUPABASE_SERVICE_ROLE_KEY).toBeUndefined();
  });
  it("accepts the empty credential placeholders from .env.example", () => {
    expect(parseAppEnv({ OPENAI_API_KEY: "", NEXT_PUBLIC_SUPABASE_URL: "", AI_PROVIDER_RPM_LIMIT: "" }).OPENAI_API_KEY).toBeUndefined();
  });
  it("treats the string false as false, preventing accidental demo data", () => {
    expect(parseAppEnv({ APP_DEMO_MODE: "false" }).APP_DEMO_MODE).toBe(false);
  });
  it("rejects an ambiguous boolean flag", () => {
    expect(() => parseAppEnv({ APP_DEMO_MODE: "yes" })).toThrow("APP_DEMO_MODE");
  });
  it.each(["gemini", "openai"])("cannot enable the unverified provider %s", (provider) => {
    expect(() => parseAppEnv({ AI_PROVIDER: provider })).toThrow("AI_PROVIDER");
  });
  it.each(["NEXT_PUBLIC_OPENAI_API_KEY", "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_GUEST_SESSION_SIGNING_SECRET"])("rejects a public secret %s without leaking its value", (key) => {
    expect(() => parseAppEnv({ [key]: "private-test-canary" })).toThrow(key);
    expect(() => parseAppEnv({ [key]: "private-test-canary" })).not.toThrow("private-test-canary");
  });
  it.each(["0", "-1", "2.5", "not-a-number"])("rejects invalid concurrency %s", (value) => {
    expect(() => parseAppEnv({ AI_CONCURRENCY_PER_PRINCIPAL: value })).toThrow("AI_CONCURRENCY_PER_PRINCIPAL");
  });
  it("does not include supplied values in configuration errors", () => {
    expect(() => parseAppEnv({ NEXT_PUBLIC_APP_URL: "private-test-canary" })).not.toThrow("private-test-canary");
    expect(() => parseAppEnv({ NEXT_PUBLIC_APP_URL: "private-test-canary" })).toThrow("NEXT_PUBLIC_APP_URL");
  });
});
