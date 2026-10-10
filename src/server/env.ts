import "server-only";
import { parseAppEnv } from "@/lib/env-schema";

export function getServerEnv() {
  return parseAppEnv(process.env);
}
