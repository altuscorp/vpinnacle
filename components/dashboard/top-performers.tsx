"use client";
import Link from "next/link";
import type { Route } from "next";
import type { TopPerformer } from "@/lib/types";
import { useCountUp } from "@/lib/use-count-up";

const RANK_GRADIENTS = [
  "linear-gradient(135deg, var(--color-altus-red),  var(--color-altus-red-deep))",
  "linear-gradient(135deg, var(--color-purple),     var(--color-purple-deep))",
  "linear-gradient(135deg, var(--color-blue),       var(--color-blue-deep))",
  "linear-gradient(135deg, var(--color-green),      var(--color-green-deep))",
];
const RANK_NEUTRAL = "linear-gradient(135deg, #94a3b8, #475569)";

export function TopPerformersSection({
  performers,
}: {
  performers: TopPerformer[];
}) {
  const top6 = performers.slice(0, 6);

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
        <h2 className="text-display-lg text-ink-strong">
          <span aria-hidden className="mr-2">🏆</span>Top Performers
        </h2>
        <p className="text-body-lg text-ink-subtle mt-1">
          Ranked by completed tasks
        </p>
      </header>

      {top6.length === 0 ? (
        <p className="text-body-lg text-ink-subtle">
          No data for the current filter.
        </p>
      ) : (
        <ol className="grid grid-cols-2 max-md:grid-cols-1 gap-3">
          {top6.map((p, i) => (
            <LeaderRow
              key={p.employeeId}
              index={i}
              name={p.employeeName}
              count={p.doneCount}
              employeeId={p.employeeId}
            />
          ))}
        </ol>
      )}
    </section>
  );
}

function AnimatedCount({ value, index }: { value: number; index: number }) {
  const n = useCountUp(value, 900 + index * 100);
  return <>{n}</>;
}

function LeaderRow({
  index,
  name,
  count,
  employeeId,
}: {
  index: number;
  name: string;
  count: number;
  employeeId: string;
}) {
  const gradient = RANK_GRADIENTS[index] ?? RANK_NEUTRAL;
  return (
    <li
      className="flex items-center gap-4 bg-surface-soft rounded-leader transition-all"
      style={{ padding: "18px 20px" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(4px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(15, 23, 42, 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span
        className="inline-flex size-10 items-center justify-center rounded-full text-display-2xs text-white"
        style={{ background: gradient }}
      >
        {index + 1}
      </span>
      <Link
        href={`/tasks?initiator=${employeeId}` as Route}
        className="flex-1 text-body text-ink-strong hover:underline decoration-altus-red underline-offset-4 decoration-2 transition-colors"
      >
        {name}
      </Link>
      <span className="text-display-md text-ink-strong">
        <AnimatedCount value={count} index={index} />
      </span>
    </li>
  );
}
