import { getServerEnv } from "@/server/env";

export const dynamic = "force-dynamic";

// Local liveness probe, not a provider/database readiness claim.
export function GET() {
  const { APP_DEMO_MODE: demo } = getServerEnv();
  return Response.json(
    {
      requestId: crypto.randomUUID(),
      data: {
        status: "ok",
        app: "words-for-kids",
        stage: "ui-preview",
        demo,
        liveAi: false,
        cloud: false,
      },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
