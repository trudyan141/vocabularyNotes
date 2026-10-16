import type { NextConfig } from "next";
import { parseAppEnv } from "./src/lib/env-schema";

// Fail early on unsafe/invalid configuration without printing secret values.
parseAppEnv(process.env);

const nextConfig: NextConfig = {
  // The repository owns AGENTS.md; dev must not append framework instructions.
  async redirects(){return [{source:'/',destination:'/welcome',permanent:false}];},
  agentRules: false,
  poweredByHeader: false,
  // Preserve ws optional-native resolution; bundling can turn its mask helper into a stub.
  serverExternalPackages: ["msedge-tts"],
  reactStrictMode: true,
};

export default nextConfig;
