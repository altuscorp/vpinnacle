import type { Task } from "@/db/schema";
import type { KpiTotals, StatusDistribution } from "@/lib/types";
import { TASK_STATUSES, type TaskStatus } from "@/db/enums";

export function computeKpiTotals(tasks: Task[]): KpiTotals {
  let pending = 0;
  let notStarted = 0;
  let needHelp = 0;
  let done = 0;
  let notApproved = 0;

  for (const t of tasks) {
    if (t.status === "done" || t.status === "approved") done++;
    else if (t.status === "not_started") notStarted++;
    else if (t.status === "need_help") needHelp++;
    else if (t.status === "initiated" || t.status === "follow_up") pending++;
    else if (t.status === "not_approved") notApproved++;
  }

  return {
    total: tasks.length,
    pending,
    notStarted,
    needHelp,
    done,
    notApproved,
  };
}

export function computeStatusDistribution(
  tasks: Task[],
): StatusDistribution[] {
  const counts = new Map<TaskStatus, number>(
    TASK_STATUSES.map((s) => [s, 0]),
  );

  for (const t of tasks) {
    counts.set(t.status, (counts.get(t.status) ?? 0) + 1);
  }

  return TASK_STATUSES.map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  })).filter((d) => d.count > 0);
}
