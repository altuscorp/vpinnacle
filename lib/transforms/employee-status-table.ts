import type { Employee, Task } from "@/db/schema";
import type { EmployeeStatusRow, ViewMode } from "@/lib/types";

export function computeEmployeeStatusTable(
  tasks: Task[],
  employees: Employee[],
  view: ViewMode,
): EmployeeStatusRow[] {
  const employeeById = new Map(employees.map((e) => [e.id, e]));
  const rows = new Map<string, EmployeeStatusRow>();

  for (const t of tasks) {
    const id = view === "doer" ? t.doerId : t.initiatorId;
    const emp = employeeById.get(id);
    if (!emp) continue;

    if (!rows.has(id)) {
      rows.set(id, {
        employeeId: id,
        employeeName: emp.name,
        department: emp.department ?? "",
        approved: 0,
        notApproved: 0,
        done: 0,
        transferred: 0,
        cancelled: 0,
        pendingTotal: 0,
        needHelp: 0,
        followUp: 0,
        initiated: 0,
        notStarted: 0,
        total: 0,
        criticalCount: 0,
      });
    }

    const row = rows.get(id)!;
    row.total += 1;

    if (t.priority === "imp_urgent") {
      row.criticalCount += 1;
    }

    switch (t.status) {
      case "approved":
        row.approved += 1;
        break;
      case "not_approved":
        row.notApproved += 1;
        break;
      case "done":
        row.done += 1;
        break;
      case "transferred":
        row.transferred += 1;
        break;
      case "cancelled":
        row.cancelled += 1;
        break;
      case "need_help":
        row.needHelp += 1;
        row.pendingTotal += 1;
        break;
      case "follow_up":
        row.followUp += 1;
        row.pendingTotal += 1;
        break;
      case "initiated":
        row.initiated += 1;
        row.pendingTotal += 1;
        break;
      case "not_started":
        row.notStarted += 1;
        row.pendingTotal += 1;
        break;
    }
  }

  return [...rows.values()].sort((a, b) => b.total - a.total);
}
