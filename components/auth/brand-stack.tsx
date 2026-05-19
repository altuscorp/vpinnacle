/**
 * Tall brand stack for the auth surface — mirrors the dashboard header's
 * VPinnacle / Loans / "By Altus Corp" pill treatment but stacked vertically
 * and right-sized for centered card layouts.
 */
export function BrandStack({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      className="mb-8 text-center"
      style={{ animation: "brandFadeIn 700ms cubic-bezier(0.2, 0.7, 0.3, 1) both" }}
    >
      <div className="mb-5 flex items-center justify-center gap-3">
        <span
          className="inline-flex items-center text-brand-pill text-white px-3 py-1 rounded-brand"
          style={{
            background:
              "linear-gradient(135deg, var(--color-altus-red), var(--color-altus-red-deep))",
            animation: "pillShimmer 4s ease-in-out infinite",
            boxShadow: "0 4px 16px rgba(225, 29, 42, 0.35)",
          }}
        >
          By Altus Corp
        </span>
      </div>

      <h1
        className="font-serif text-[#0F172A]"
        style={{
          fontStyle: "italic",
          fontSize: 52,
          lineHeight: 0.95,
          letterSpacing: "-0.03em",
        }}
      >
        VPinnacle{" "}
        <span
          style={{
            display: "inline-block",
            paddingRight: "0.18em",
            background:
              "linear-gradient(135deg, #ff5560, var(--color-altus-red))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Loans
        </span>
      </h1>

      <div
        className="mx-auto mt-5 mb-3 h-px w-16"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(15, 23, 42, 0.25), transparent)",
        }}
      />

      <div
        className="text-table-head"
        style={{ color: "var(--color-altus-red)", letterSpacing: "0.14em" }}
      >
        {eyebrow}
      </div>

      <h2
        className="mt-3 font-serif text-[#0F172A]"
        style={{
          fontStyle: "italic",
          fontSize: 30,
          lineHeight: 1.05,
          letterSpacing: "-0.02em",
          fontWeight: 400,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-2 mx-auto max-w-[360px] text-[14px] leading-[1.55]"
          style={{ color: "var(--color-ink-subtle)" }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
