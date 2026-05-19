import * as React from "react";
import type { Route } from "next";
import { KpiHeroTile, KpiStatusTile, type NeonKey } from "./kpi-card";
import Aurora from "@/components/effects/Aurora";
import type { KpiSet } from "@/lib/types";

interface Entry {
  key: keyof KpiSet;
  label: string;
  sublabel: string;
  neonKey: NeonKey;
  href: Route;
}

const HERO: Entry = {
  key: "total",
  label: "TOTAL",
  sublabel: "All Tasks",
  neonKey: "total",
  href: "/tasks",
};

const STATUS_ITEMS: Entry[] = [
  {
    key: "needHelp",
    label: "NEED HELP",
    sublabel: "Blocked",
    neonKey: "need-help",
    href: "/tasks?status=need_help",
  },
  {
    key: "notApproved",
    label: "NOT APPROVED",
    sublabel: "Sent Back",
    neonKey: "not-approved",
    href: "/tasks?status=not_approved",
  },
  {
    key: "done",
    label: "DONE",
    sublabel: "Done + Approved",
    neonKey: "done",
    href: "/tasks?status=done,approved",
  },
  {
    key: "pending",
    label: "PENDING",
    sublabel: "In Progress",
    neonKey: "pending",
    href: "/tasks?status=initiated,follow_up",
  },
  {
    key: "notStarted",
    label: "NOT STARTED",
    sublabel: "Awaiting Pickup",
    neonKey: "not-started",
    href: "/tasks?status=not_started",
  },
];

export function KpiStrip({ kpis }: { kpis: KpiSet }) {
  return (
    <section
      className="kpi-strip-shell mt-10 mx-auto max-w-[1600px] rounded-[28px] px-12 pt-12 pb-14 max-md:px-4 max-md:pt-6 max-md:pb-8"
      aria-label="Task summary"
    >
      {/* Aurora — WebGL flowing-gradient background (ReactBits/ogl).
          Sits at z-0 with pointer-events: none. Painted in violet →
          pink → cyan to give the warm-white substrate rich animated
          colour without forcing a dark theme. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ opacity: 0.55 }}
        aria-hidden
      >
        <Aurora
          colorStops={["#A78BFA", "#EC4899", "#06B6D4"]}
          amplitude={1.0}
          blend={0.6}
          speed={0.6}
        />
      </div>
      {/* Subtle grain noise overlay — caps the polish to feel like a
          printed-poster surface rather than flat CSS. */}
      <span className="kpi-strip-grain" aria-hidden />

      <div className="relative z-10 flex flex-col gap-5">
        {/* Hero band — Total */}
        <KpiHeroTile
          index={0}
          neonKey={HERO.neonKey}
          label={HERO.label}
          sublabel={HERO.sublabel}
          value={kpis[HERO.key].current}
          previous={kpis[HERO.key].previous}
          sparkline={kpis[HERO.key].sparkline}
          href={HERO.href}
        />

        {/* Status ticker — 5 tiles. On mobile, scroll-snaps horizontally
            so we never fall back to the cliché 5-stacked-rectangles. */}
        <div
          className="grid grid-cols-5 gap-4 max-lg:grid-cols-2 max-sm:flex max-sm:gap-3 max-sm:overflow-x-auto max-sm:snap-x max-sm:snap-mandatory max-sm:[-webkit-overflow-scrolling:touch] max-sm:px-1 max-sm:pb-2"
          role="list"
        >
          {STATUS_ITEMS.map((item, i) => (
            <div
              key={item.key}
              role="listitem"
              className="max-sm:snap-center max-sm:flex-none max-sm:w-[78%]"
            >
              <KpiStatusTile
                index={i + 1}
                neonKey={item.neonKey}
                label={item.label}
                sublabel={item.sublabel}
                value={kpis[item.key].current}
                previous={kpis[item.key].previous}
                sparkline={kpis[item.key].sparkline}
                href={item.href}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
