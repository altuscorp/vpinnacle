"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { CriticalBadge } from "@/components/ui/critical-badge";
import { PRIORITY_LABELS } from "@/db/enums";
import type { TaskStatus, StatusColorToken } from "@/db/enums";
import type { TaskListRow } from "@/lib/types";
import { TaskRowActions } from "./task-row-actions";
import {
  STATUS_LABELS_FALLBACK,
  STATUS_TONES_FALLBACK,
} from "@/lib/format";

type StatusLabels = Record<TaskStatus, string>;
type StatusTones = Record<TaskStatus, StatusColorToken>;

// My-role chip palette — mirrors the ROLE_CHIP scheme in
// components/admin/employee-list.tsx so the doer/initiator semantics read
// the same everywhere.
const MY_ROLE_CHIP: Record<
  "doer" | "initiator" | "both",
  { bg: string; fg: string; ring: string; label: string }
> = {
  doer:      { bg: "#EFF6FF", fg: "#1D4ED8", ring: "#BFDBFE", label: "Doer" },
  initiator: { bg: "#F5F3FF", fg: "#6D28D9", ring: "#DDD6FE", label: "Initiator" },
  both:      { bg: "linear-gradient(135deg, #EFF6FF, #F5F3FF)", fg: "#3730A3", ring: "#C7D2FE", label: "Doer + Initiator" },
};

function MyRoleCell({
  row,
  me,
}: {
  row: TaskListRow;
  me: { id: string; isAdmin: boolean };
}) {
  const isDoer = row.doerId === me.id;
  const isInitiator = row.initiatorId === me.id;
  if (!isDoer && !isInitiator) {
    return <span className="text-ink-subtle text-body-lg" aria-label="No role on this task">—</span>;
  }
  const role: "doer" | "initiator" | "both" =
    isDoer && isInitiator ? "both" : isDoer ? "doer" : "initiator";
  const c = MY_ROLE_CHIP[role];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap"
      style={{
        background: c.bg,
        color: c.fg,
        boxShadow: `inset 0 0 0 1px ${c.ring}`,
      }}
    >
      {c.label}
    </span>
  );
}

function buildColumns(
  employees: { id: string; name: string }[],
  me: { id: string; isAdmin: boolean },
  statusLabels: StatusLabels,
  statusTones: StatusTones,
): ColumnDef<TaskListRow>[] {
  return [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row, getValue }) => (
        <Link
          href={`/tasks/${row.original.id}` as Route}
          className="text-body text-ink-strong hover:text-altus-red underline-offset-2 hover:underline transition-colors"
        >
          {getValue<string>()}
        </Link>
      ),
    },
    {
      id: "myRole",
      header: "My role",
      cell: ({ row }) => <MyRoleCell row={row.original} me={me} />,
      enableSorting: false,
    },
    {
      accessorKey: "doerName",
      header: "Doer",
      cell: (info) => (
        <span className="text-body-lg text-ink">{info.getValue<string>() ?? "—"}</span>
      ),
    },
    {
      accessorKey: "initiatorName",
      header: "Initiator",
      cell: (info) => (
        <span className="text-body-lg text-ink-muted">
          {info.getValue<string>() ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "doerDept",
      header: "Department",
      cell: (info) => (
        <span className="text-body-lg text-ink-muted">
          {info.getValue<string>() ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: (info) => {
        const p = info.getValue<keyof typeof PRIORITY_LABELS>();
        return p === "imp_urgent" ? (
          <CriticalBadge />
        ) : (
          <span className="text-body-lg text-ink-muted">{PRIORITY_LABELS[p]}</span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: (info) => {
        const s = info.getValue<string>() as TaskStatus;
        const tone = statusTones[s] ?? "amber";
        return (
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-pill text-[13px] font-bold tabular-nums"
            style={{
              background: `color-mix(in srgb, var(--color-${tone}) 12%, transparent)`,
              color: `var(--color-${tone}-deep)`,
            }}
          >
            {statusLabels[s] ?? s}
          </span>
        );
      },
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: (info) => (
        <span className="text-body-lg text-ink-muted">
          {info.getValue<string>() ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: (info) => (
        <span className="text-body-lg text-ink-muted tabular-nums">
          {format(info.getValue<Date>(), "MMM d")}
        </span>
      ),
    },
    {
      accessorKey: "dueAt",
      header: "Due",
      cell: (info) => (
        <span className="text-body-lg text-ink-muted tabular-nums">
          {format(info.getValue<Date>(), "MMM d")}
        </span>
      ),
    },
    {
      accessorKey: "ageDays",
      header: "Age",
      cell: (info) => (
        <span className="text-body-lg text-ink tabular-nums">
          {info.getValue<number>()}d
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => <TaskRowActions row={row.original} employees={employees} me={me} />,
      enableSorting: false,
    },
  ];
}

export function TaskTable({
  rows,
  employees,
  me,
  statusLabels,
  statusTones,
}: {
  rows: TaskListRow[];
  employees: { id: string; name: string }[];
  me: { id: string; isAdmin: boolean };
  statusLabels?: StatusLabels;
  statusTones?: StatusTones;
}) {
  const resolvedLabels = statusLabels ?? STATUS_LABELS_FALLBACK;
  const resolvedTones = statusTones ?? STATUS_TONES_FALLBACK;
  const columns = React.useMemo(
    () => buildColumns(employees, me, resolvedLabels, resolvedTones),
    [employees, me, resolvedLabels, resolvedTones],
  );
  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div
      className="bg-surface-card rounded-section border border-hairline overflow-x-auto"
      style={{ boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
    >
      <table className="min-w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b border-hairline">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-5 py-4 text-table-head text-left whitespace-nowrap"
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-hairline last:border-b-0 transition-colors hover:bg-surface-soft"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  // max-w + overflow + ellipsis caps long values (titles,
                  // names, subjects) so they don't push the actions kebab
                  // off-screen via the wrapper's overflow-x-auto. Short
                  // content (pills, dates, kebab) is well under 32ch so it
                  // flows naturally — this is a cap, not a fixed width.
                  className="px-5 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-[32ch]"
                >
                  {flexRender(
                    cell.column.columnDef.cell ?? ((c) => c.getValue()),
                    cell.getContext(),
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
