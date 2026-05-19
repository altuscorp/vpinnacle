export function DashboardFooter() {
  return (
    <footer
      className="mt-32"
      style={{
        background:
          "linear-gradient(180deg, var(--color-ink-strong) 0%, #020617 100%)",
        color: "#ffffff",
      }}
    >
      <div className="mx-auto max-w-[1600px] px-12 py-10 max-md:px-4 text-center">
        <p
          className="text-table-head"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          Powered by Altus Corp
          <span className="mx-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            |
          </span>
          altuscorp.in
          <span className="mx-3" style={{ color: "rgba(255,255,255,0.35)" }}>
            |
          </span>
          +91 80970 10410
        </p>
        <p
          className="mt-3 text-xs"
          style={{ color: "rgba(255, 255, 255, 0.55)" }}
        >
          © Manan Vasa 2025–2035 · All rights reserved
        </p>
      </div>
    </footer>
  );
}
