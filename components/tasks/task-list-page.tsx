import { TaskTable } from "./task-table";
import type { TaskListRow } from "@/lib/types";
import type { TaskStatus, StatusColorToken } from "@/db/enums";

export function TaskListPage({
  title,
  rows,
  employees,
  me,
  statusLabels,
  statusTones,
}: {
  title: string;
  rows: TaskListRow[];
  employees: { id: string; name: string }[];
  me: { id: string; isAdmin: boolean };
  statusLabels?: Record<TaskStatus, string>;
  statusTones?: Record<TaskStatus, StatusColorToken>;
}) {
  return (
    <main className="mx-auto max-w-[1600px] px-12 max-md:px-4 pt-8 pb-16">
      <header className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-display-lg text-ink-strong">{title}</h1>
          <p className="text-body-lg text-ink-subtle mt-1 tabular-nums">
            {rows.length} {rows.length === 1 ? "task" : "tasks"}
          </p>
        </div>
      </header>
      {rows.length === 0 ? (
        <div
          className="bg-surface-card rounded-section border border-hairline p-10 text-center"
          style={{ boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
        >
          <p className="text-body-lg text-ink-subtle">
            No tasks match the current filter.
          </p>
        </div>
      ) : (
        <TaskTable
          rows={rows}
          employees={employees}
          me={me}
          statusLabels={statusLabels}
          statusTones={statusTones}
        />
      )}
    </main>
  );
}
