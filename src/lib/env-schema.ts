import { z } from "zod";

const optionalText = z.string().optional();
const positiveInteger = z.coerce.number().int().positive();
const optionalLimit = positiveInteger.optional();

export const appEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  MEDIA_COMMONS_ENABLED: z.enum(["true","false"]).default("false").transform(value=>value==="true"),
  APP_DEMO_MODE: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  // No eligible live provider has been selected. T05 will extend this explicitly.
  AI_PROVIDER: z.literal("none").default("none"),
  NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalText,
  NEXT_PUBLIC_GEMINI_DEFAULT_KEY: optionalText,
  SUPABASE_SERVICE_ROLE_KEY: optionalText,
  SUPABASE_SECRET_KEY: optionalText,
  MEDIA_IMPORT_SIGNING_SECRET: z.string().min(32).optional(),
  OPENAI_API_KEY: optionalText,
  AI_VISION_MODEL: optionalText,
  AI_ENRICH_MODEL: optionalText,
  GUEST_SESSION_SIGNING_SECRET: optionalText,
  TRANSIENT_RESULT_ENCRYPTION_KEY: optionalText,
  AI_CONCURRENCY_PER_PRINCIPAL: positiveInteger.default(1),
  MEDIA_SEARCH_CONCURRENCY_PER_PRINCIPAL: positiveInteger.default(2),
  MEDIA_IMPORT_CONCURRENCY_PER_PRINCIPAL: positiveInteger.default(2),
  AI_PROVIDER_RPM_LIMIT: optionalLimit,
  AI_PROVIDER_TPM_LIMIT: optionalLimit,
  MEDIA_PROVIDER_REQUEST_LIMIT: optionalLimit,
  AI_GUEST_DAILY_LIMIT: positiveInteger.default(5),
  AI_ACCOUNT_DAILY_LIMIT: positiveInteger.default(30),
  AI_GLOBAL_DAILY_BUDGET: z.coerce.number().positive().optional(),
});

export type AppEnv = z.infer<typeof appEnvSchema>;

export function parseAppEnv(
  source: Record<string, string | undefined>,
): AppEnv {
  const unsafeKeys = Object.keys(source).filter((key) =>
    /^NEXT_PUBLIC_.*(?:SECRET|SERVICE_ROLE|API_KEY|ENCRYPTION_KEY|SIGNING)/.test(
      key,
    ),
  );
  if (unsafeKeys.length) {
    throw new Error(
      `Server secrets must not use NEXT_PUBLIC_: ${unsafeKeys.join(", ")}`,
    );
  }
  const normalized = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [
      key,
      value === "" ? undefined : value,
    ]),
  );
  const result = appEnvSchema.safeParse(normalized);
  if (!result.success) {
    // Variable names only: no submitted values, Zod payloads or secrets in logs.
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid app configuration: ${fields.join(", ")}`);
  }
  return result.data;
}
