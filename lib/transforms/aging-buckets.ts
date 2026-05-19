import type { Task } from "@/db/schema";
import type { AgingByDate } from "@/lib/types";
import { AGE_BUCKETS, type AgeBucketId } from "@/db/enums";

const PENDING_STATUSES = new Set([
  "not_started",
  "initiated",
  "follow_up",
  "need_help",
]);

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function bucketForAge(days: number): AgeBucketId {
  for (const b of AGE_BUCKETS) {
    if (days >= b.min && days <= b.max) return b.id;
  }
  return "60+";
}

function ageInDays(createdAt: Date, now: Date): number {
  return Math.floor((now.getTime() - createdAt.getTime()) / MS_PER_DAY);
}

export function computeAgingByDate(
  tasks: Task[],
  now: Date,
): AgingByDate[] {
  const counts = new Map<AgeBucketId, number>(
    AGE_BUCKETS.map((b) => [b.id, 0]),
  );

  for (const t of tasks) {
    if (!PENDING_STATUSES.has(t.status)) continue;
    const days = ageInDays(t.createdAt, now);
    const bucket = bucketForAge(days);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }

  return AGE_BUCKETS.map((b) => ({
    bucket: b.id,
    count: counts.get(b.id) ?? 0,
  }));
}
