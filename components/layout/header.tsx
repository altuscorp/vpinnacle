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
        {/* Subtle radial accent washes — visible on dark surface */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 100% at 0% 50%, rgba(225, 29, 42, 0.16), transparent 65%), radial-gradient(ellipse 40% 100% at 100% 50%, rgba(168, 85, 247, 0.16), transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-[1600px] h-[96px] px-8 max-md:h-[64px] max-md:px-4 flex items-center gap-6 max-md:gap-3">
          {/* LEFT: brand cluster — two-line stack */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Mark dot */}
            <span
              aria-hidden
              className="inline-block h-[12px] w-[12px] rounded-full shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #ff5560, var(--color-altus-red))",
                boxShadow: "0 0 14px rgba(225, 29, 42, 0.55)",
              }}
            />

            <div className="flex flex-col gap-0.5 min-w-0">
              <span
                className="text-[10px] uppercase tracking-[0.18em] font-bold leading-none max-md:hidden"
                style={{ color: "var(--color-altus-red)" }}
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
                        "linear-gradient(135deg, #ff5560, var(--color-altus-red))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Loans
                  </span>
                </span>

                <span
                  className="inline-flex items-center text-[10px] font-bold uppercase tracking-[0.10em] text-white px-2 py-0.5 rounded-brand mb-1 max-md:hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-altus-red), var(--color-altus-red-deep))",
                    animation: "pillShimmer 4s ease-in-out infinite",
                    boxShadow: "0 2px 8px rgba(225, 29, 42, 0.40)",
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

        {/* Multi-color gradient accent strip */}
        <div
          aria-hidden
          style={{
            height: 2,
            background:
              "linear-gradient(90deg, var(--color-altus-red) 0%, var(--color-rose) 20%, var(--color-purple) 40%, var(--color-blue) 60%, var(--color-green) 80%, var(--color-amber) 100%)",
            opacity: 0.9,
          }}
        />
      </div>
    </header>
  );
}
