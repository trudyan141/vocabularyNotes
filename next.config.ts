import type { NextConfig } from "next";
import { parseAppEnv } from "./src/lib/env-schema";

// Fail early on unsafe/invalid configuration without printing secret values.
parseAppEnv(process.env);

const nextConfig: NextConfig = {
  // The repository owns AGENTS.md; dev must not append framework instructions.
  agentRules: false,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
