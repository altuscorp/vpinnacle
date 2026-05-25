import { getHealthSnapshot } from "./actions";
import {
  Activity,
  AlertTriangle,
  Clock,
  GitCommit,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const snap = await getHealthSnapshot();

  return (
    <main className="mx-auto max-w-[1200px] px-12 max-md:px-4 pt-8 pb-16">
      <header className="mb-7">
        <h1
          className="text-ink-strong"
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 900,
            fontSize: "clamp(40px, 4.2vw, 56px)",
            letterSpacing: "-0.025em",
            lineHeight: 1,
          }}
        >
          Health
        </h1>
        <p
          className="mt-2 text-ink-muted tabular-nums font-semibold"
          style={{ fontSize: 18 }}
        >
          Recent process state · refreshes on each request
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 max-lg:grid-cols-1 mb-7">
        <StatCard
          label="Slow queries"
          tone="amber"
          value={snap.slowQueryCount}
          sublabel="In current process"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Errors"
          tone="red"
          value={snap.errorCount}
          sublabel="In current process"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Build"
          tone="blue"
          value={snap.build.sha.slice(0, 7)}
          sublabel={snap.build.nodeVersion}
          icon={<GitCommit size={18} />}
        />
      </div>

      <section className="mb-7 bg-surface-card rounded-section border border-hairline p-6">
        <h2 className="text-display-md text-ink-strong mb-4 inline-flex items-center gap-2">
          <Activity size={20} />
          Recent events (last 20)
        </h2>
        {snap.recentEvents.length === 0 ? (
          <p className="text-[15px] text-ink-subtle">
            No warn/error events recorded in this process.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {snap.recentEvents.map((e, i) => (
              <li
                key={i}
                className="flex items-start gap-3 px-3 py-2.5 rounded-chip border border-hairline"
                style={{
                  background:
                    e.level === "error"
                      ? "var(--color-red-tint, #fef2f2)"
                      : "var(--color-amber-tint, #fffbeb)",
                }}
              >
                <span
                  className="uppercase font-black tracking-[0.08em] tabular-nums"
                  style={{
                    fontSize: 11,
                    color:
                      e.level === "error"
                        ? "var(--color-red-deep)"
                        : "var(--color-amber-deep)",
                  }}
                >
                  {e.level}
                </span>
                <span
                  className="text-[13px] text-ink-subtle tabular-nums"
                  style={{ minWidth: 92 }}
                >
                  {new Date(e.ts).toLocaleTimeString()}
                </span>
                <span
                  className="font-bold text-[14px] text-ink-strong"
                  style={{ minWidth: 180 }}
                >
                  {e.msg}
                </span>
                {e.fields && (
                  <span className="text-[13px] text-ink-subtle font-mono">
                    {JSON.stringify(e.fields)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-surface-card rounded-section border border-hairline p-6">
        <h2 className="text-display-md text-ink-strong mb-4">Web Vitals</h2>
        <p className="text-[15px] text-ink-subtle mb-3">
          Real-user Web Vitals (LCP / CLS / INP / FCP / TTFB) live in the
          Vercel Speed Insights dashboard.
        </p>
        <a
          href="https://vercel.com/altus-corp/vpinnacle/speed-insights"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-ink-strong font-bold hover:underline"
        >
          Open Speed Insights
          <ExternalLink size={14} />
        </a>
      </section>
    </main>
  );
}

function StatCard({
  label,
  tone,
  value,
  sublabel,
  icon,
}: {
  label: string;
  tone: "amber" | "red" | "blue";
  value: number | string;
  sublabel: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="relative bg-surface-card rounded-section overflow-hidden"
      style={{
        border: "1px solid var(--color-hairline)",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        padding: "24px 24px 22px",
      }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0"
        style={{
          height: 5,
          background: `linear-gradient(90deg, var(--color-${tone}), var(--color-${tone}-deep))`,
        }}
      />
      <div className="flex items-center justify-between mb-2">
        <span
          className="uppercase font-black tracking-[0.08em] leading-none"
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontSize: 15,
            color: `var(--color-${tone}-deep)`,
          }}
        >
          {label}
        </span>
        <span style={{ color: `var(--color-${tone}-deep)` }}>{icon}</span>
      </div>
      <span
        className="block mt-2 leading-[0.85] tracking-[-0.035em] tabular-nums text-ink-strong"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontWeight: 900,
          fontSize: "clamp(40px, 3.6vw, 56px)",
        }}
      >
        {value}
      </span>
      <span
        className="block mt-2 font-bold leading-tight"
        style={{ fontSize: 14, color: "var(--color-ink-soft)" }}
      >
        {sublabel}
      </span>
    </div>
  );
}
