"use client";
import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { Sparkline } from "@/components/charts/sparkline";
import { formatCount } from "@/lib/format";
import { useCountUp } from "@/lib/use-count-up";

// Six neon channels, one per KPI. The CSS @theme block in globals.css
// registers --kpi-neon-* RGB triplets matching these keys.
export type NeonKey =
  | "total"
  | "need-help"
  | "not-approved"
  | "done"
  | "pending"
  | "not-started";

interface BaseProps {
  label: string;
  sublabel: string;
  value: number;
  previous: number;
  sparkline: number[];
  neonKey: NeonKey;
  index?: number;
  href: Route;
}

/* Hero tile — Total. Full-width strip across the top of the KPI band.
   Number is set in Bricolage Grotesque at 96–168px (responsive clamp);
   sparkline runs as a wide neon trail; delta + trend annotation in a
   tight right column. */
export function KpiHeroTile(props: BaseProps) {
  return <GlassTile {...props} variant="hero" />;
}

/* Status tile — one of five. Sits in a row below the hero. Number is
   ~48–72px; sparkline at the bottom; delta + "vs last week" in a
   footer row separated by a neon-tinted hairline. */
export function KpiStatusTile(props: BaseProps) {
  return <GlassTile {...props} variant="status" />;
}

function GlassTile({
  label,
  sublabel,
  value,
  previous,
  sparkline,
  neonKey,
  index = 0,
  href,
  variant,
}: BaseProps & { variant: "hero" | "status" }) {
  const animated = useCountUp(value);
  const delta = value - previous;
  const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "→";
  const deltaSign = delta > 0 ? "+" : delta < 0 ? "" : "";

  const neon = `var(--kpi-neon-${neonKey})`;

  return (
    <Link
      href={href}
      aria-label={`Open ${label} task list`}
      className="kpi-glass-tile group block focus-visible:outline-2 focus-visible:outline-offset-4"
      style={
        {
          "--kpi-neon": neon,
          outlineColor: `rgb(${neon})`,
          opacity: 0,
          animation: `kpiTileEnter 720ms cubic-bezier(0.2, 0.7, 0.3, 1) ${
            index * 90
          }ms forwards`,
        } as React.CSSProperties
      }
    >
      {/* Animated chromatic conic rim — perimeter only via mask-composite */}
      <span className="kpi-tile-rim" aria-hidden />
      {/* Inner radial glow — intensifies on hover (in CSS) */}
      <span className="kpi-tile-glow" aria-hidden />

      {variant === "hero" ? (
        <HeroBody
          label={label}
          sublabel={sublabel}
          value={animated}
          delta={delta}
          deltaSign={deltaSign}
          arrow={arrow}
          sparkline={sparkline}
          neon={neon}
        />
      ) : (
        <StatusBody
          label={label}
          sublabel={sublabel}
          value={animated}
          delta={delta}
          deltaSign={deltaSign}
          arrow={arrow}
          sparkline={sparkline}
          neon={neon}
        />
      )}
    </Link>
  );
}

interface BodyProps {
  label: string;
  sublabel: string;
  value: number;
  delta: number;
  deltaSign: string;
  arrow: string;
  sparkline: number[];
  neon: string;
}

function HeroBody({
  label,
  sublabel,
  value,
  delta,
  deltaSign,
  arrow,
  sparkline,
  neon,
}: BodyProps) {
  return (
    <div className="relative z-[3] grid grid-cols-[1fr_auto] gap-8 p-10 max-md:p-6 max-md:grid-cols-1">
      <div className="flex flex-col gap-3 min-w-0">
        <span
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] font-semibold"
          style={{
            fontFamily: "var(--font-mono-display), ui-monospace, monospace",
            color: `rgb(${neon})`,
          }}
        >
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{
              background: `rgb(${neon})`,
              boxShadow: `0 0 12px rgb(${neon} / 0.8)`,
            }}
          />
          {label}
        </span>

        <span
          className="block leading-[0.85] tracking-[-0.04em] tabular-nums text-ink-strong"
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: "clamp(96px, 12vw, 168px)",
            textShadow: `0 0 80px rgb(${neon} / 0.35), 0 1px 0 rgba(255,255,255,0.8)`,
          }}
        >
          {formatCount(value)}
        </span>

        <span className="text-[15px] text-ink-muted font-medium">
          {sublabel}
        </span>

        <div className="mt-2">
          <Sparkline
            values={sparkline}
            color={`rgb(${neon})`}
            width={420}
            height={56}
            strokeWidth={2.5}
            responsive
            glow
            drawIn
          />
        </div>
      </div>

      <div className="flex flex-col items-end justify-between gap-2 max-md:items-start max-md:flex-row max-md:justify-between">
        <div className="flex flex-col items-end gap-1 max-md:items-start">
          <span
            className="inline-flex items-baseline gap-1 text-ink-strong"
            style={{
              fontFamily: "var(--font-display), system-ui, sans-serif",
              fontWeight: 600,
              fontSize: 28,
              lineHeight: 1,
            }}
          >
            <span aria-hidden style={{ color: `rgb(${neon})`, fontSize: 18 }}>
              {arrow}
            </span>
            {deltaSign}
            {Math.abs(delta)}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.24em] text-ink-subtle font-semibold"
            style={{
              fontFamily: "var(--font-mono-display), ui-monospace, monospace",
            }}
          >
            vs last week
          </span>
        </div>

        <span
          className="text-[10px] uppercase tracking-[0.24em] text-ink-subtle/70 max-md:hidden font-medium"
          style={{
            fontFamily: "var(--font-mono-display), ui-monospace, monospace",
          }}
        >
          14-day trend →
        </span>
      </div>
    </div>
  );
}

function StatusBody({
  label,
  sublabel,
  value,
  delta,
  deltaSign,
  arrow,
  sparkline,
  neon,
}: BodyProps) {
  return (
    <div className="relative z-[3] flex flex-col gap-3 p-5">
      <span
        className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] font-semibold"
        style={{
          fontFamily: "var(--font-mono-display), ui-monospace, monospace",
          color: `rgb(${neon})`,
        }}
      >
        <span
          aria-hidden
          className="inline-block h-1 w-1 rounded-full"
          style={{
            background: `rgb(${neon})`,
            boxShadow: `0 0 8px rgb(${neon} / 0.8)`,
          }}
        />
        {label}
      </span>

      <span
        className="block leading-[0.9] tracking-[-0.03em] tabular-nums text-ink-strong"
        style={{
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "clamp(48px, 5vw, 72px)",
          textShadow: `0 0 36px rgb(${neon} / 0.3), 0 1px 0 rgba(255,255,255,0.6)`,
        }}
      >
        {formatCount(value)}
      </span>

      <span className="text-[12px] text-ink-muted font-medium">{sublabel}</span>

      <div className="mt-1">
        <Sparkline
          values={sparkline}
          color={`rgb(${neon})`}
          width={200}
          height={28}
          strokeWidth={1.5}
          responsive
          glow
          drawIn
        />
      </div>

      <div
        className="mt-1 pt-3 flex items-center justify-between"
        style={{
          borderTop: `1px solid rgb(${neon} / 0.22)`,
        }}
      >
        <span
          className="inline-flex items-baseline gap-1 text-ink-strong"
          style={{
            fontFamily: "var(--font-display), system-ui, sans-serif",
            fontWeight: 600,
            fontSize: 17,
            lineHeight: 1,
          }}
        >
          <span aria-hidden style={{ color: `rgb(${neon})`, fontSize: 11 }}>
            {arrow}
          </span>
          {deltaSign}
          {Math.abs(delta)}
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.22em] text-ink-subtle/80 font-semibold"
          style={{
            fontFamily: "var(--font-mono-display), ui-monospace, monospace",
          }}
        >
          vs last wk
        </span>
      </div>
    </div>
  );
}
