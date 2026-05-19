"use client";
import * as React from "react";
import {
  BarChart3,
  Building2,
  ClipboardList,
  ExternalLink,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fireToast } from "@/lib/toast";
import { useReducedMotion } from "motion/react";
import type {
  DashboardAccent,
  DashboardIconName,
  VisibleDashboard,
} from "@/lib/external-dashboards";

interface Props {
  links: VisibleDashboard[];
}

const ICONS: Record<DashboardIconName, LucideIcon> = {
  Building2,
  Receipt,
  ClipboardList,
};

// Maps each accent token to the live CSS variable our globals expose.
// `var()` is computed at paint, so the .css var doesn't need to exist yet
// when this map is read.
const ACCENT_VARS: Record<DashboardAccent, string> = {
  blue: "var(--color-blue)",
  amber: "var(--color-amber)",
  purple: "var(--color-purple)",
};

export function LiasoningNavPill({ links }: Props) {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const reduced = useReducedMotion();

  // Mouse-parallax shift — matches MainNavPill's behavior so the new pill
  // feels alive next to its siblings.
  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (reduced) return;
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 6;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 4;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (triggerRef.current) triggerRef.current.style.transform = "translate(0,0)";
  };

  if (links.length === 0) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-label="Liasoning dashboards"
          className={"nav-pill" + (open ? " nav-pill-active" : "")}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={
            open
              ? {
                  background: "rgb(var(--vp-cyan))",
                  color: "#ffffff",
                  borderColor: "transparent",
                  boxShadow:
                    "0 4px 12px rgb(var(--vp-cyan) / 0.35), 0 0 0 4px rgb(var(--vp-cyan) / 0.18)",
                  transition:
                    "transform 120ms ease-out, background 200ms ease, box-shadow 250ms ease, color 200ms ease",
                }
              : {
                  transition:
                    "transform 120ms ease-out, background 200ms ease, box-shadow 250ms ease, color 200ms ease",
                }
          }
        >
          <BarChart3 size={16} strokeWidth={2.2} />
          <span className="max-md:hidden">Liasoning</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[320px] p-0"
      >
        <div className="liasoning-header">
          <span className="liasoning-header-label">External Dashboards</span>
        </div>
        <div className="liasoning-header-strip" aria-hidden />
        <div className="px-1 pb-1.5">
          {links.map((link, idx) => (
            <LiasoningItem
              key={link.id}
              link={link}
              index={idx}
              reduced={!!reduced}
              onLaunched={() => setOpen(false)}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LiasoningItem({
  link,
  index,
  reduced,
  onLaunched,
}: {
  link: VisibleDashboard;
  index: number;
  reduced: boolean;
  onLaunched: () => void;
}) {
  const Icon = ICONS[link.iconName];
  const accent = ACCENT_VARS[link.accent];
  const ref = React.useRef<HTMLAnchorElement>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Ignore re-clicks while a launch is already in flight — keeps the user
    // from opening 2+ tabs by accident.
    if (timerRef.current !== null) return;

    // Open synchronously inside the user gesture so popup blockers
    // don't de-trust the call.  The pulse animates after, independently.
    window.open(link.url, "_blank", "noopener,noreferrer");
    fireToast({ message: `Opening ${link.label}…` });

    const el = ref.current;
    if (reduced || !el) {
      onLaunched();
      return;
    }

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--pulse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--pulse-y", `${e.clientY - rect.top}px`);
    el.classList.add("is-launching");

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      // The anchor may already be unmounted by the time this fires — guard.
      const stillMounted = ref.current;
      if (stillMounted) stillMounted.classList.remove("is-launching");
      onLaunched();
    }, 220);
  };

  return (
    <a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="liasoning-item"
      style={
        {
          "--liasoning-accent": accent,
          "--i": index,
        } as React.CSSProperties
      }
      onClick={handleClick}
    >
      <span className="liasoning-item-icon" aria-hidden>
        <Icon size={18} strokeWidth={2} />
      </span>
      <span className="liasoning-item-text">
        <span className="liasoning-item-label">{link.label}</span>
        <span className="liasoning-item-desc">{link.description}</span>
      </span>
      <ExternalLink size={14} className="liasoning-item-arrow" aria-hidden />
    </a>
  );
}
