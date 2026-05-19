import type { CSSProperties } from "react";
import { LiveIndicator } from "./live-indicator";
import { MainNavServer } from "./main-nav-server";
import { UserMenuServer } from "@/components/header/user-menu-server";
import { NewTaskTrigger } from "@/components/header/new-task-trigger";
import { AdminPill } from "@/components/header/admin-pill";
import { getCurrentEmployee } from "@/lib/auth/current";

/**
 * Sleek dark application header — single row, ~64px tall.
 *
 * Layout: brand mark + Altus pill on the left, primary nav centered, status
 * cluster + actions + avatar on the right.  Backdrop-blurred dark surface
 * with subtle red+purple radial washes; a thin multi-color gradient strip
 * runs along the bottom edge to tie back to the body color washes.
 *
 * `generatedAt` is accepted to keep the prop contract stable for callers
 * (used to live in the meta strip); it's no longer rendered in the
 * compact header.  Move the timestamp into the page body if needed.
 */
export async function DashboardHeader({
  generatedAt: _generatedAt,
}: { generatedAt: Date }) {
  const me = await getCurrentEmployee();
  const isAdmin = me?.isAdmin ?? false;

  return (
    <header className="sticky top-0 z-50 header-dark">
      <div
        className="relative border-b border-hairline"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.86)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
        }}
      >
        {/* Subtle radial accent washes — visible on dark surface.
            Cyan-led now so the brand voice carries through the header. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 100% at 0% 50%, rgba(34, 181, 227, 0.22), transparent 65%), radial-gradient(ellipse 45% 100% at 100% 50%, rgba(168, 85, 247, 0.16), transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-[1600px] h-[96px] px-8 max-md:h-[64px] max-md:px-4 flex items-center gap-6 max-md:gap-3">
          {/* LEFT: brand cluster — VPinnacle cyan triangle + wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Cyan triangle mark — VPinnacle logo, replaces the red dot */}
            <span
              aria-hidden
              className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-white shrink-0"
              style={{
                border: "1.5px solid rgb(var(--vp-cyan))",
                boxShadow:
                  "0 0 14px rgba(34, 181, 227, 0.55), inset 0 0 0 1px rgba(255,255,255,0.85)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <defs>
                  <linearGradient id="vp-brand-tri" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="rgb(103, 232, 249)" />
                    <stop offset="100%" stopColor="rgb(14, 165, 233)" />
                  </linearGradient>
                </defs>
                <path
                  d="M7 1.5 L12.5 11.5 L1.5 11.5 Z"
                  fill="url(#vp-brand-tri)"
                />
              </svg>
            </span>

            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[11px] uppercase tracking-[0.18em] font-bold leading-none max-md:hidden"
                style={{ color: "rgb(var(--vp-cyan-bright))" }}
              >
                Altus Corp · Operations
              </span>

              <div className="flex items-end gap-2.5">
                <span
                  className="font-serif text-[34px] max-md:text-[20px] leading-none whitespace-nowrap"
                  style={{
                    color: "#ffffff",
                    fontStyle: "italic",
                    letterSpacing: "-0.02em",
                  }}
                >
                  VPinnacle{" "}
                  <span
                    style={{
                      display: "inline-block",
                      paddingRight: "0.18em",
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

                <span
                  className="inline-flex items-center text-[11px] font-bold uppercase tracking-[0.10em] text-white px-2.5 py-1 rounded-brand mb-1 max-md:hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgb(var(--vp-cyan)), rgb(var(--vp-cyan-deep)))",
                    animation: "pillShimmer 4s ease-in-out infinite",
                    boxShadow: "0 2px 8px rgba(34, 181, 227, 0.45)",
                  }}
                >
                  By Altus
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: primary nav */}
          <div
            className="flex-1 flex justify-center min-w-0 max-md:hidden"
            style={
              {
                // Glass pills read white-ish on the dark surface
                "--color-ink-strong": "#ffffff",
                "--color-ink-soft": "rgba(255, 255, 255, 0.78)",
                "--color-ink-subtle": "rgba(255, 255, 255, 0.62)",
              } as CSSProperties
            }
          >
            <MainNavServer />
          </div>

          {/* RIGHT: live indicator + actions + avatar */}
          <div
            className="flex items-center gap-2.5 shrink-0 max-md:gap-1.5"
            style={
              {
                "--color-ink-muted": "#ffffff",
                "--color-ink-subtle": "#ffffff",
              } as CSSProperties
            }
          >
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

        {/* Bottom cyan glow strip — replaces the multi-color rainbow.
            Anchors the cyan brand voice along the header boundary. */}
        <div
          aria-hidden
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, rgb(var(--vp-cyan-deep)) 15%, rgb(var(--vp-cyan-bright)) 50%, rgb(var(--vp-cyan-deep)) 85%, transparent 100%)",
            boxShadow: "0 0 12px rgba(34, 181, 227, 0.6)",
            opacity: 0.95,
          }}
        />
      </div>
    </header>
  );
}
