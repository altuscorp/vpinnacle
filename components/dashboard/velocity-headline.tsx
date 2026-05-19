import { formatCount } from "@/lib/format";

export function VelocityHeadline({
  totalCreated,
  totalCompleted,
}: {
  totalCreated: number;
  totalCompleted: number;
}) {
  return (
    <div
      className="grid grid-cols-2 max-md:grid-cols-1 max-md:gap-6 items-center pb-7 mb-7 border-b border-hairline"
      style={{ gap: 32 }}
    >
      <Stat label="New tasks" value={totalCreated} tone="blue" />
      <Stat
        label="Finished"
        value={totalCompleted}
        tone="green"
        className="max-md:border-t max-md:border-hairline max-md:pt-6 md:border-l md:border-hairline md:pl-8"
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
  className = "",
}: {
  label: string;
  value: number;
  tone: "blue" | "green";
  className?: string;
}) {
  return (
    <div className={className}>
      <p
        className="text-table-head"
        style={{ color: `var(--color-${tone}-deep)`, letterSpacing: "0.08em" }}
      >
        {label}
      </p>
      <p
        className="tabular-nums leading-none mt-2 max-md:text-[96px]"
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 900,
          fontSize: 160,
          letterSpacing: "-0.04em",
          background: `linear-gradient(135deg, var(--color-${tone}), var(--color-${tone}-deep))`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {formatCount(value)}
      </p>
    </div>
  );
}
