"use client";
import type { StatusDistributionPayload, StatusDistribution } from "@/lib/types";
import type { TaskStatus, StatusColorToken } from "@/db/enums";
import { useCountUp } from "@/lib/use-count-up";
import {
  STATUS_LABELS_FALLBACK,
  STATUS_TONES_FALLBACK,
} from "@/lib/format";

type Tone = StatusColorToken;

function DistributionRow({
  row,
  index,
  max,
  denom,
  labels,
  tones,
}: {
  row: StatusDistribution;
  index: number;
  max: number;
  denom: number;
  labels: Record<TaskStatus, string>;
  tones: Record<TaskStatus, Tone>;
}) {
  const animated = useCountUp(row.count, 1100 + index * 80);
  const tone = tones[row.status];
  const width = max > 0 ? (row.count / max) * 100 : 0;
  return (
    <li className="grid grid-cols-[200px_1fr_72px_72px] items-center gap-5">
      <span className="text-body text-ink">{labels[row.status]}</span>
      <div
        className="rounded-bar h-8"
        style={{
          background: "var(--color-surface-track)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-bar origin-left"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, var(--color-${tone}), var(--color-${tone}-deep))`,
            transform: "scaleX(0)",
            animation: `barGrow 1200ms cubic-bezier(.2,.8,.2,1) ${600 + index * 100}ms forwards`,
          }}
        />
      </div>
      <span className="text-display-xs text-ink-strong text-right tabular-nums w-16">
        {animated}
      </span>
      <span className="text-display-3xs text-ink-muted text-right tabular-nums w-16">
        {denom > 0 ? `${((row.count / denom) * 100).toFixed(1)}%` : "—"}
      </span>
    </li>
  );
}

export function StatusDistributionChart({
  data,
  labels,
  tones,
}: {
  data: StatusDistributionPayload;
  labels?: Record<TaskStatus, string>;
  tones?: Record<TaskStatus, Tone>;
}) {
  const resolvedLabels = labels ?? STATUS_LABELS_FALLBACK;
  const resolvedTones = (tones ?? STATUS_TONES_FALLBACK) as Record<TaskStatus, Tone>;
  const rows = [...data.rows].sort((a, b) => b.count - a.count);
  const max = rows.reduce((m, r) => Math.max(m, r.count), 0);
  const denom = data.denominator;

  if (rows.length === 0) {
    return (
      <section className="rounded-section bg-surface-card border border-hairline p-8">
        <h2
          className="text-display-lg text-ink-strong"
          title="Percent of active work (Total − Approved). Approved tasks are excluded from the denominator."
        >
          <span aria-hidden className="mr-2">📊</span>Status Distribution
        </h2>
        <p className="mt-3 text-body-lg text-ink-subtle">
          No data for the current filter.
        </p>
      </section>
    );
  }

  return (
    <section
      className="rounded-section bg-surface-card border border-hairline p-8"
      style={{
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        opacity: 0,
        animation: "fadeUp 500ms ease-out 500ms forwards",
      }}
    >
      <header className="mb-6">
        <h2
          className="text-display-lg text-ink-strong"
          title="Percent of active work (Total − Approved). Approved tasks are excluded from the denominator."
        >
          <span aria-hidden className="mr-2">📊</span>Status Distribution
        </h2>
        <p className="text-body-lg text-ink-subtle mt-1">
          Tasks by current status
        </p>
      </header>

      <ul className="flex flex-col gap-4">
        {rows.map((r, i) => (
          <DistributionRow
            key={r.status}
            row={r}
            index={i}
            max={max}
            denom={denom}
            labels={resolvedLabels}
            tones={resolvedTones}
          />
        ))}
      </ul>
    </section>
  );
}
