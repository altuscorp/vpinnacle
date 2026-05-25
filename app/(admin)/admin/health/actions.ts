"use server";

import { _ringBuffer, type LogEntry } from "@/lib/log";
import { requireAdmin } from "@/lib/auth/current";

export type HealthSnapshot = {
  recentEvents: LogEntry[];
  slowQueryCount: number;
  errorCount: number;
  build: {
    sha: string;
    timestamp: string;
    nodeVersion: string;
  };
};

/**
 * Read the in-process ring buffer of warn/error log entries and a few
 * build identifiers.
 *
 * Admin-gating note: `/admin/*` is already gated at the layout level
 * (`app/(admin)/admin/layout.tsx` calls `requireAdmin()`), but server
 * actions can be invoked from anywhere a caller knows the action name,
 * so we redundantly gate here with the same helper used across every
 * admin action file (`employees/actions.ts`, `settings/actions.ts`, etc.)
 * to keep belt + suspenders defence in depth.
 */
export async function getHealthSnapshot(): Promise<HealthSnapshot> {
  await requireAdmin();
  const items = _ringBuffer.read();
  const slowQueryCount = items.filter((e) => e.msg === "slow_query").length;
  const errorCount = items.filter((e) => e.level === "error").length;
  return {
    recentEvents: items.slice(-20).reverse(),
    slowQueryCount,
    errorCount,
    build: {
      sha: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      timestamp: process.env.VERCEL_BUILD_TIMESTAMP ?? "unknown",
      nodeVersion: process.version,
    },
  };
}
