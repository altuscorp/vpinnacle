import { LiveIndicator } from "./live-indicator";
import { MainNavServer } from "./main-nav-server";
import { NavHistoryButtons } from "./nav-history-buttons";
import { UserMenuServer } from "@/components/header/user-menu-server";
import { NewTaskTrigger } from "@/components/header/new-task-trigger";
import { AdminPill } from "@/components/header/admin-pill";
import { getCurrentEmployee } from "@/lib/auth/current";

/**
 * Light glassy application header — single row, ~72px tall.
 *
 * Cyan triangle mark + bold "VPinnacle Loans" wordmark on the left, primary
 * nav centered with airy spacing, right cluster carries live indicator +
 * actions + avatar. Frosted-glass white surface with a single hairline
 * bottom border — no decorative washes, no rainbow strip. The nav-pill
 * colors flip to ink-on-light via `.header-light` scope.
 *
 * `generatedAt` is accepted to keep the prop contract stable for callers
 * but no longer rendered.
 */
export async function DashboardHeader({
  generatedAt: _generatedAt,
}: { generatedAt: Date }) {
  const me = await getCurrentEmployee();
  const isAdmin = me?.isAdmin ?? false;

  return (
    <header className="sticky top-0 z-50 header-light">
      <div
        className="relative"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          borderBottom: "1px solid var(--color-hairline)",
        }}
      >
        <div className="relative mx-auto max-w-[1600px] h-[96px] px-8 max-md:h-[72px] max-md:px-4 flex items-center gap-10 max-md:gap-3">
          {/* LEFT-MOST: Back / Forward history pills (md+ only) */}
          <NavHistoryButtons />

          {/* LEFT: cyan triangle + bold ink wordmark */}
          <div className="flex items-center gap-3.5 shrink-0">
            <span
              aria-hidden
              className="inline-flex items-center justify-center h-11 w-11 rounded-full shrink-0 max-md:h-9 max-md:w-9"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34, 181, 227, 0.12), rgba(14, 165, 233, 0.04))",
                border: "1.5px solid rgb(var(--vp-cyan))",
                boxShadow:
                  "0 4px 14px rgba(34, 181, 227, 0.32), inset 0 1px 0 rgba(255,255,255,0.7)",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 14 14"
                fill="none"
                className="max-md:w-4 max-md:h-4"
              >
                <defs>
                  <linearGradient
                    id="vp-brand-tri-light"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="rgb(103, 232, 249)" />
                    <stop offset="100%" stopColor="rgb(14, 165, 233)" />
                  </linearGradient>
                </defs>
                <path
                  d="M7 1.5 L12.5 11.5 L1.5 11.5 Z"
                  fill="url(#vp-brand-tri-light)"
                />
              </svg>
            </span>

            <span
              className="inline-flex items-baseline gap-1.5 whitespace-nowrap"
              style={{
                fontFamily: "var(--font-display), system-ui, sans-serif",
                fontWeight: 900,
                fontSize: 28,
                letterSpacing: "-0.024em",
                color: "var(--color-ink-strong)",
                lineHeight: 1,
              }}
            >
              <span className="max-md:hidden">VPinnacle</span>
              <span className="md:hidden" style={{ fontSize: 22 }}>
                VP
              </span>
              <span
                style={{
                  background:
                    "linear-gradient(135deg, rgb(var(--vp-cyan-bright)), rgb(var(--vp-cyan-deep)))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Loans
              </span>
            </span>
          </div>

          {/* CENTER: primary nav — airy, ink-on-light */}
          <div className="flex-1 flex justify-center min-w-0 max-md:hidden">
            <MainNavServer />
          </div>

          {/* RIGHT: live indicator + actions + avatar */}
          <div className="flex items-center gap-3 shrink-0 max-md:gap-1.5">
            <span className="max-md:hidden">
              <LiveIndicator />
            </span>
            <NewTaskTrigger />
            {isAdmin && (
              <span className="max-md:hidden">
                <AdminPill />
              </span>
            )}
            <UserMenuServer />
          </div>
        </div>
      </div>
    </header>
  );
}
