"use client";
import * as React from "react";
import {
  Bar,
  ComposedChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { formatCount } from "@/lib/format";
import type { VelocityPoint } from "@/lib/types";
import { rollingAverage } from "@/lib/transforms/rolling-average";
import { VelocityHeadline } from "./velocity-headline";

interface WeeklyPoint {
  weekStart: string;
  weekLabel: string;
  created: number;
  completed: number;
}

function bucketByWeek(points: VelocityPoint[]): WeeklyPoint[] {
  const buckets = new Map<string, { created: number; completed: number }>();
  for (const p of points) {
    const d = parseISO(p.date);
    if (Number.isNaN(d.getTime())) continue;
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day; // shift to ISO Monday
    const monday = new Date(d);
    monday.setDate(d.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const key = format(monday, "yyyy-MM-dd");
    const b = buckets.get(key) ?? { created: 0, completed: 0 };
    b.created += p.created;
    b.completed += p.completed;
    buckets.set(key, b);
  }
  return [...buckets.entries()]
    .map(([weekStart, v]) => ({
      weekStart,
      weekLabel: format(parseISO(weekStart), "MMM d"),
      created: v.created,
      completed: v.completed,
    }))
    .sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const created =
    Number(payload.find((p) => p.dataKey === "created")?.value ?? 0);
  const completed =
    Number(payload.find((p) => p.dataKey === "completed")?.value ?? 0);
  const avg =
    Number(payload.find((p) => p.dataKey === "avgFinished")?.value ?? 0);
  const net = created - completed;
  const netColor =
    net > 0
      ? "var(--color-amber-deep)"
      : net < 0
        ? "var(--color-green-deep)"
        : "var(--color-ink-muted)";
  return (
    <div
      className="bg-surface-card border border-hairline-strong rounded-chip px-4 py-3"
      style={{
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
        minWidth: 200,
      }}
    >
      <p
        className="text-table-head mb-2"
        style={{ color: "var(--color-ink-subtle)" }}
      >
        Week of {label}
      </p>
      <Row color="var(--color-blue)" label="New tasks" value={created} />
      <Row color="var(--color-green)" label="Finished" value={completed} />
      <Row color="var(--color-altus-red)" label="4-wk avg finished" value={avg} />
      <div className="border-t border-hairline pt-2 mt-2 flex items-center gap-2.5">
        <span className="text-body-lg text-ink-muted flex-1">Net change</span>
        <span
          className="text-display-3xs tabular-nums"
          style={{ color: netColor }}
        >
          {net > 0 ? "+" : ""}
          {net}
        </span>
      </div>
    </div>
  );
}

function Row({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5 mt-1">
      <span
        className="size-2.5 rounded-full shrink-0"
        style={{ background: color }}
      />
      <span className="text-body-lg text-ink-muted flex-1">{label}</span>
      <span className="text-ink-strong font-bold tabular-nums text-base">
        {value}
      </span>
    </div>
  );
}

export function VelocityHero({ data }: { data: VelocityPoint[] }) {
  const weekly = React.useMemo(() => bucketByWeek(data), [data]);

  const totalCreated = weekly.reduce((s, w) => s + w.created, 0);
  const totalCompleted = weekly.reduce((s, w) => s + w.completed, 0);
  const weeks = Math.max(weekly.length, 1);

  const avgFinished = React.useMemo(
    () => rollingAverage(weekly.map((w) => w.completed), 4),
    [weekly],
  );
  const weeklyWithAvg = React.useMemo(
    () => weekly.map((w, i) => ({ ...w, avgFinished: avgFinished[i] ?? 0 })),
    [weekly, avgFinished],
  );
  const avgCreated = Math.round(totalCreated / weeks);
  const avgCompleted = Math.round(totalCompleted / weeks);
  const netPerWeek = avgCreated - avgCompleted;

  let insightTone: "amber" | "green" | "blue";
  let insightEmoji: string;
  let insightText: string;
  if (netPerWeek > 0) {
    insightTone = "amber";
    insightEmoji = netPerWeek >= 10 ? "⚠️" : "📈";
    insightText = `Backlog growing — about ${netPerWeek} more new tasks than finished each week, on average.`;
  } else if (netPerWeek < 0) {
    insightTone = "green";
    insightEmoji = "✅";
    insightText = `Team is catching up — finishing about ${-netPerWeek} more tasks than coming in each week.`;
  } else {
    insightTone = "blue";
    insightEmoji = "➖";
    insightText = `Steady pace — about ${avgCompleted} tasks closing per week, matching incoming.`;
  }

  return (
    <section
      className="mx-auto max-w-[1600px] px-12 max-md:px-4 mt-12 bg-surface-card rounded-section"
      style={{
        border: "1px solid var(--color-hairline)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        padding: "32px",
        opacity: 0,
        animation: "fadeUp 500ms ease-out 300ms forwards",
      }}
    >
      <VelocityHeadline totalCreated={totalCreated} totalCompleted={totalCompleted} />
      <div>
        <header className="mb-5">
          <h2 className="text-display-lg text-ink-strong">
            <span aria-hidden className="mr-2">📈</span>Task Velocity
          </h2>
          <p className="text-body-lg text-ink-subtle mt-1">
            Each bar = one week. Blue = new tasks coming in. Green = tasks
            finished. A healthy team keeps green at or above blue.
          </p>
        </header>

        {/* Auto-generated insight chip */}
        <div
          className="inline-flex items-start gap-2.5 px-4 py-2.5 rounded-chip mb-6 max-w-full"
          style={{
            background: `color-mix(in srgb, var(--color-${insightTone}) 10%, transparent)`,
            border: `1px solid color-mix(in srgb, var(--color-${insightTone}) 22%, transparent)`,
          }}
        >
          <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
            {insightEmoji}
          </span>
          <span
            className="text-body-lg"
            style={{ color: `var(--color-${insightTone}-deep)`, fontWeight: 600 }}
          >
            {insightText}
          </span>
        </div>

        <div className="h-[420px] max-md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={weeklyWithAvg}
              margin={{ top: 10, right: 8, left: 0, bottom: 4 }}
              barGap={4}
              barCategoryGap="22%"
            >
              <defs>
                <linearGradient id="vbar-created" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-blue)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--color-blue-deep)" stopOpacity={1} />
                </linearGradient>
                <linearGradient id="vbar-completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-green)" stopOpacity={1} />
                  <stop offset="100%" stopColor="var(--color-green-deep)" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-hairline)" vertical={false} />
              <XAxis
                dataKey="weekLabel"
                tick={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 13,
                  fill: "var(--color-ink-subtle)",
                  fontWeight: 500,
                }}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis
                tick={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  fill: "var(--color-ink-subtle)",
                }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: "var(--color-surface-soft)", opacity: 0.7 }}
                content={<CustomTooltip />}
              />
              <Bar
                dataKey="created"
                fill="url(#vbar-created)"
                radius={[8, 8, 0, 0]}
                animationDuration={900}
              />
              <Bar
                dataKey="completed"
                fill="url(#vbar-completed)"
                radius={[8, 8, 0, 0]}
                animationDuration={900}
              />
              <Line
                type="monotone"
                dataKey="avgFinished"
                stroke="var(--color-altus-red)"
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={true}
                animationDuration={900}
                name="Avg weekly throughput"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <footer className="mt-5 flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-6 text-body-lg flex-wrap">
            <LegendSwatch
              color="var(--color-blue)"
              label="New tasks"
              value={totalCreated}
            />
            <LegendSwatch
              color="var(--color-green)"
              label="Finished"
              value={totalCompleted}
            />
          </div>
          <div className="text-body-lg text-ink-subtle tabular-nums">
            Avg per week:{" "}
            <span className="text-ink-strong font-medium">
              {avgCreated} new
            </span>
            {" · "}
            <span className="text-ink-strong font-medium">
              {avgCompleted} finished
            </span>
          </div>
        </footer>
      </div>
    </section>
  );
}

function LegendSwatch({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: number;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-ink-muted">
      <span
        className="size-3 rounded-sm"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span>{label}</span>
      <span className="text-mono text-ink-strong font-medium">
        {formatCount(value)}
      </span>
    </span>
  );
}
