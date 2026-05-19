"use client";
import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { AlertTriangle, Flame, ArrowDownUp } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { AGE_BUCKETS, type AgeBucketId } from "@/db/enums";
import type { AgingRow, HeatmapCellTask } from "@/lib/types";

// Age-coded palette: cool/green for fresh, hot/red for old.
// Each bucket maps to its own color and weight, so the bar visually grows
// "hotter" as tasks age — readable at a glance with no learning curve.
const BUCKET_COLOR: Record<
  AgeBucketId,
  { fill: string; deep: string; tint: string }
> = {
  "0-3":   { fill: "#86efac", deep: "#15803d", tint: "#dcfce7" },
  "4-7":   { fill: "#4ade80", deep: "#15803d", tint: "#d1fae5" },
  "8-14":  { fill: "#bef264", deep: "#65a30d", tint: "#ecfccb" },
  "15-20": { fill: "#fcd34d", deep: "#b45309", tint: "#fef3c7" },
  "21-30": { fill: "#fb923c", deep: "#c2410c", tint: "#ffedd5" },
  "31-45": { fill: "#f87171", deep: "#b91c1c", tint: "#fee2e2" },
  "46-60": { fill: "#ef4444", deep: "#991b1b", tint: "#fecaca" },
  "60+":   { fill: "#b91c1c", deep: "#7f1d1d", tint: "#fecaca" },
};

const BUCKET_WEIGHT: Record<AgeBucketId, number> = {
  "0-3": 1, "4-7": 2, "8-14": 3, "15-20": 5,
  "21-30": 7, "31-45": 10, "46-60": 14, "60+": 20,
};

const CRITICAL_BUCKETS: AgeBucketId[] = ["31-45", "46-60", "60+"];

function riskScore(row: AgingRow): number {
  if (row.total === 0) return 0;
  const weighted = AGE_BUCKETS.reduce(
    (s, b) => s + row.buckets[b.id] * BUCKET_WEIGHT[b.id],
    0,
  );
  const raw = weighted / row.total;
  return Math.round(((raw - 1) / 19) * 100);
}

type SortMode = "risk" | "total" | "oldest";

export function AgingHeatmap({
  rows,
  cellTasks,
}: {
  rows: AgingRow[];
  cellTasks: Record<string, Record<string, HeatmapCellTask[]>>;
}) {
  const [sortMode, setSortMode] = React.useState<SortMode>("risk");

  const enriched = React.useMemo(
    () => rows.map((r) => ({ ...r, risk: riskScore(r) })),
    [rows],
  );

  const sorted = React.useMemo(() => {
    const copy = [...enriched];
    if (sortMode === "total") copy.sort((a, b) => b.total - a.total);
    else if (sortMode === "risk") copy.sort((a, b) => b.risk - a.risk);
    else
      copy.sort(
        (a, b) =>
          CRITICAL_BUCKETS.reduce((s, k) => s + b.buckets[k], 0) -
          CRITICAL_BUCKETS.reduce((s, k) => s + a.buckets[k], 0),
      );
    return copy;
  }, [enriched, sortMode]);

  const top12 = sorted.slice(0, 12);
  const maxTotal = Math.max(...top12.map((r) => r.total), 1);

  const totalAging = enriched.reduce((s, r) => s + r.total, 0);
  const criticalTotal = enriched.reduce(
    (s, r) =>
      s + CRITICAL_BUCKETS.reduce((acc, k) => acc + r.buckets[k], 0),
    0,
  );

  return (
    <section
      className="mx-auto max-w-[1600px] px-12 max-md:px-4 mt-12 mb-16"
      style={{
        opacity: 0,
        animation: "fadeUp 500ms ease-out 900ms forwards",
      }}
    >
      <div
        className="rounded-section bg-surface-card border border-hairline p-8 max-md:p-5"
        style={{ boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)" }}
      >
        <header className="mb-6 flex items-start justify-between gap-6 max-md:flex-col max-md:gap-3">
          <div>
            <h2 className="text-display-lg text-ink-strong flex items-center gap-2.5">
              <Flame className="size-7 text-red-deep" strokeWidth={2.25} />
              Aging Heatmap
            </h2>
            <p className="text-body-lg text-ink-subtle mt-1">
              {enriched.length} {enriched.length === 1 ? "person" : "people"}
              {" · "}
              {totalAging} pending {totalAging === 1 ? "task" : "tasks"} aging
            </p>
          </div>
          <SortControl value={sortMode} onChange={setSortMode} />
        </header>

        {criticalTotal > 0 && <AlertBanner count={criticalTotal} />}

        <Legend />

        {top12.length === 0 ? (
          <p className="text-body-lg text-ink-subtle mt-6">
            No pending tasks for the current filter.
          </p>
        ) : (
          <div className="mt-5 space-y-2">
            <LaneHeader />
            {top12.map((r, i) => (
              <Lane
                key={r.employeeId}
                row={r}
                maxTotal={maxTotal}
                index={i}
                employeeTasks={cellTasks[r.employeeId] ?? {}}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SortControl({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (m: SortMode) => void;
}) {
  const options: { id: SortMode; label: string }[] = [
    { id: "risk", label: "Risk" },
    { id: "total", label: "Total" },
    { id: "oldest", label: "Oldest" },
  ];
  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-chip bg-surface-track border border-hairline"
      role="tablist"
      aria-label="Sort aging table"
    >
      <ArrowDownUp className="size-3.5 text-ink-subtle ml-1.5 mr-0.5" />
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className="px-3.5 py-2 rounded-pill text-[13px] font-bold transition-all duration-200 tabular-nums"
            style={{
              background: active ? "var(--color-surface-card)" : "transparent",
              color: active
                ? "var(--color-ink-strong)"
                : "var(--color-ink-subtle)",
              boxShadow: active ? "0 1px 3px rgba(15,23,42,0.08)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function AlertBanner({ count }: { count: number }) {
  return (
    <div
      className="mt-1 mb-2 flex items-center gap-3 rounded-chip px-4 py-3"
      style={{
        background:
          "linear-gradient(90deg, color-mix(in srgb, #e11d2a 10%, transparent), color-mix(in srgb, #e11d2a 4%, transparent))",
        borderLeft: "3px solid #e11d2a",
      }}
    >
      <AlertTriangle className="size-5 shrink-0" style={{ color: "#b0141f" }} />
      <p className="text-body text-ink-strong">
        <span className="font-bold tabular-nums">{count}</span>
        <span className="text-ink-soft">
          {" "}
          {count === 1 ? "task is" : "tasks are"} aging more than 30 days —
          escalate or close
        </span>
      </p>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 flex items-center gap-1.5 flex-wrap">
      <span className="text-table-head text-ink-subtle mr-1">Age</span>
      {AGE_BUCKETS.map((b) => {
        const c = BUCKET_COLOR[b.id];
        return (
          <div
            key={b.id}
            className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1"
            style={{ background: c.tint }}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: c.fill }}
            />
            <span
              className="text-[13px] font-bold tabular-nums"
              style={{ color: c.deep }}
            >
              {b.id}d
            </span>
          </div>
        );
      })}
    </div>
  );
}

function LaneHeader() {
  return (
    <div
      className="grid items-center gap-4 px-2 pb-1 max-md:hidden"
      style={{ gridTemplateColumns: "160px 64px 1fr 56px" }}
    >
      <span className="text-table-head">Employee</span>
      <span className="text-table-head text-center">Risk</span>
      <span className="text-table-head">Pending by age (oldest →)</span>
      <span className="text-table-head text-right">Total</span>
    </div>
  );
}

function Lane({
  row,
  maxTotal,
  index,
  employeeTasks,
}: {
  row: AgingRow & { risk: number };
  maxTotal: number;
  index: number;
  employeeTasks: Record<string, HeatmapCellTask[]>;
}) {
  const lengthPct = (row.total / maxTotal) * 100;
  return (
    <div
      className="grid items-center gap-4 px-2 py-1.5 rounded-chip hover:bg-surface-soft transition-colors max-md:gap-2"
      style={{
        gridTemplateColumns: "160px 64px 1fr 56px",
        opacity: 0,
        animation: `fadeUp 420ms ease-out ${index * 50 + 200}ms forwards`,
      }}
    >
      <span className="text-body-lg text-ink truncate font-medium">
        {row.employeeName}
      </span>
      <RiskChip score={row.risk} />
      <div className="relative h-9 rounded-bar bg-surface-track overflow-hidden border border-hairline">
        <div
          className="absolute inset-y-0 left-0 flex"
          style={{
            width: `${lengthPct}%`,
            transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {AGE_BUCKETS.map((b) => {
            const v = row.buckets[b.id];
            if (v === 0) return null;
            const segPct = (v / row.total) * 100;
            return (
              <Segment
                key={b.id}
                bucketId={b.id}
                bucketLabel={b.label}
                count={v}
                widthPct={segPct}
                employeeName={row.employeeName}
                tasks={employeeTasks[b.id] ?? []}
              />
            );
          })}
        </div>
      </div>
      <span className="text-display-3xs text-ink-strong text-right tabular-nums">
        {row.total}
      </span>
    </div>
  );
}

function RiskChip({ score }: { score: number }) {
  const tone = score >= 60 ? "red" : score >= 35 ? "amber" : "green";
  const palette = {
    red: { bg: "#fee2e2", fg: "#991b1b", dot: "#dc2626" },
    amber: { bg: "#fef3c7", fg: "#92400e", dot: "#f59e0b" },
    green: { bg: "#d1fae5", fg: "#166534", dot: "#16a34a" },
  }[tone];
  return (
    <div
      className="inline-flex items-center justify-center gap-1.5 rounded-pill px-2 py-1 mx-auto"
      style={{ background: palette.bg, minWidth: 56 }}
      title={`Aging risk score: ${score}/100`}
    >
      <span
        className="size-1.5 rounded-full"
        style={{
          background: palette.dot,
          boxShadow: tone === "red" ? `0 0 6px ${palette.dot}` : "none",
        }}
      />
      <span
        className="text-[13px] font-bold tabular-nums"
        style={{ color: palette.fg }}
      >
        {score}
      </span>
    </div>
  );
}

function Segment({
  bucketId,
  bucketLabel,
  count,
  widthPct,
  employeeName,
  tasks,
}: {
  bucketId: AgeBucketId;
  bucketLabel: string;
  count: number;
  widthPct: number;
  employeeName: string;
  tasks: HeatmapCellTask[];
}) {
  const c = BUCKET_COLOR[bucketId];
  const showLabel = widthPct > 10;
  const isCritical = CRITICAL_BUCKETS.includes(bucketId);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-full flex items-center justify-center text-white font-bold text-[13px] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 hover:brightness-110 hover:scale-y-110 origin-bottom"
          style={{
            width: `${widthPct}%`,
            background: c.fill,
            minWidth: 0,
            outlineColor: "var(--color-altus-red)",
            animation: isCritical
              ? "heatPulse 2.4s ease-in-out infinite"
              : "none",
          }}
          aria-label={`${employeeName}, ${bucketLabel}: ${count} pending`}
        >
          {showLabel && (
            <span className="tabular-nums drop-shadow-sm">{count}</span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={12}
          className="z-[100] bg-surface-card border border-hairline-strong rounded-chip px-4 py-3 text-[15px] max-h-[var(--radix-popover-content-available-height)] overflow-y-auto"
          style={{ boxShadow: "0 12px 32px rgba(15, 23, 42, 0.10)" }}
        >
          <p className="text-ink-strong font-bold">{employeeName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="size-2 rounded-full"
              style={{ background: c.fill }}
            />
            <p className="text-ink-muted">{bucketLabel}</p>
          </div>
          <ul className="mt-2 flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1 min-w-[280px]">
            {tasks.length === 0 && (
              <li className="text-ink-subtle text-[15px] py-1">No tasks.</li>
            )}
            {tasks.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tasks/${t.id}` as Route}
                  className="flex items-center justify-between gap-3 py-1 px-2 rounded-pill hover:bg-surface-soft transition-colors"
                >
                  <span className="text-body-lg text-ink-strong truncate">{t.title}</span>
                  <span className="text-[13px] text-ink-muted tabular-nums shrink-0">{t.ageDays}d</span>
                </Link>
              </li>
            ))}
          </ul>
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
