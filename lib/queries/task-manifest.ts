import { desc, eq } from "drizzle-orm";
import { db, tasks } from "@/lib/db";

export type TaskManifestEntry = {
  id: string;
  title: string;
  subject: string | null;
};

const MAX_ENTRIES = 500;

/**
 * Lightweight manifest of the 500 most-recently-updated non-archived
 * tasks. Powers the global ⌘K command palette's task fuzzy-match group.
 * Intentionally narrow — id/title/subject only — to keep payload small.
 */
export async function getTaskManifest(): Promise<TaskManifestEntry[]> {
  return db
    .select({ id: tasks.id, title: tasks.title, subject: tasks.subject })
    .from(tasks)
    .where(eq(tasks.archived, false))
    .orderBy(desc(tasks.updatedAt))
    .limit(MAX_ENTRIES);
}
