import { timed } from "./with-timing";

type Row = { tags: string[] | null };

/**
 * Case-insensitive dedup that preserves the first observed casing.
 * Pure helper kept separate so it can be unit-tested without a DB.
 */
export function dedupTags(rows: Row[]): string[] {
  const byKey = new Map<string, string>();
  for (const r of rows) {
    if (!r.tags) continue;
    for (const t of r.tags) {
      const k = t.toLowerCase();
      if (!byKey.has(k)) byKey.set(k, t);
    }
  }
  return Array.from(byKey.values()).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
}

export async function getDistinctTags(): Promise<string[]> {
  return timed("distinct-tags.getDistinctTags", async () => {
  // Lazy-imported so the pure `dedupTags` helper above can be unit-tested
  // without booting the env/db modules (no .env.local in test env).
  const { db, tasks } = await import("@/lib/db");
  const { eq } = await import("drizzle-orm");
  const rows = await db
    .select({ tags: tasks.tags })
    .from(tasks)
    .where(eq(tasks.archived, false));
  return dedupTags(rows);
  });
}
