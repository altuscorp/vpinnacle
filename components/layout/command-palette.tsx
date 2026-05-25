"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Command } from "cmdk";
import {
  FileText,
  Users,
  LayoutDashboard,
  Settings,
  Activity,
  Building2,
  Bell,
  Archive,
} from "lucide-react";
import type { Route } from "next";

export type PaletteData = {
  tasks: { id: string; title: string; subject: string | null }[];
  employees: { id: string; name: string }[];
};

const PAGES: { label: string; path: Route; icon: React.ReactNode }[] = [
  { label: "Dashboard", path: "/" as Route, icon: <LayoutDashboard size={16} /> },
  { label: "Tasks", path: "/tasks" as Route, icon: <FileText size={16} /> },
  { label: "Archived tasks", path: "/archived" as Route, icon: <Archive size={16} /> },
  { label: "Admin · Employees", path: "/admin/employees" as Route, icon: <Users size={16} /> },
  { label: "Admin · Departments", path: "/admin/departments" as Route, icon: <Building2 size={16} /> },
  { label: "Admin · Settings", path: "/admin/settings" as Route, icon: <Settings size={16} /> },
  { label: "Admin · Activity", path: "/admin/activity" as Route, icon: <Activity size={16} /> },
  { label: "Admin · Notifications", path: "/admin/notifications" as Route, icon: <Bell size={16} /> },
];

/**
 * M6 Task 5 — global command palette.
 *
 * ⌘K / Ctrl+K toggles open on any authenticated page EXCEPT `/tasks` and
 * `/archived`, where Task 4's filter-bar listener owns the chord (it
 * focuses the in-page search input). The two listeners deliberately
 * partition by `pathname` so they never both fire.
 */
export function CommandPalette({ data }: { data: PaletteData }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (!meta || e.key.toLowerCase() !== "k") return;
      // On /tasks and /archived the search bar takes ⌘K; palette stays out.
      if (pathname === "/tasks" || pathname === "/archived") return;
      e.preventDefault();
      setOpen((v) => !v);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pathname]);

  function go(path: Route) {
    setOpen(false);
    router.push(path);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      style={{ background: "rgba(15, 23, 42, 0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-[640px] rounded-section border border-hairline-strong bg-surface-card overflow-hidden"
        style={{ boxShadow: "0 24px 64px rgba(15, 23, 42, 0.24)" }}
      >
        <Command label="Command palette">
          <Command.Input
            autoFocus
            placeholder="Search tasks, employees, pages…"
            className="w-full h-14 px-5 text-[16px] border-b border-hairline bg-transparent outline-none placeholder:text-ink-subtle"
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <Command.List className="max-h-[440px] overflow-auto p-2">
            <Command.Empty className="px-4 py-6 text-center text-[15px] text-ink-subtle">
              No matches.
            </Command.Empty>

            <Command.Group
              heading="Pages"
              className="text-[12px] uppercase tracking-[0.10em] font-extrabold text-ink-subtle px-3 pt-2 pb-1"
            >
              {PAGES.map((p) => (
                <Command.Item
                  key={p.path}
                  value={`page ${p.label}`}
                  onSelect={() => go(p.path)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-chip cursor-pointer text-[15px] text-ink-strong aria-selected:bg-surface-soft"
                >
                  <span className="text-ink-subtle">{p.icon}</span>
                  {p.label}
                </Command.Item>
              ))}
            </Command.Group>

            {data.tasks.length > 0 && (
              <Command.Group
                heading="Tasks"
                className="text-[12px] uppercase tracking-[0.10em] font-extrabold text-ink-subtle px-3 pt-3 pb-1"
              >
                {data.tasks.map((t) => (
                  <Command.Item
                    key={t.id}
                    value={`task ${t.title} ${t.subject ?? ""}`}
                    onSelect={() => go(`/tasks/${t.id}` as Route)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-chip cursor-pointer text-[15px] text-ink-strong aria-selected:bg-surface-soft"
                  >
                    <FileText size={16} className="text-ink-subtle" />
                    <span className="flex-1 truncate">{t.title}</span>
                    {t.subject && (
                      <span className="text-[13px] text-ink-subtle">{t.subject}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {data.employees.length > 0 && (
              <Command.Group
                heading="Employees"
                className="text-[12px] uppercase tracking-[0.10em] font-extrabold text-ink-subtle px-3 pt-3 pb-1"
              >
                {data.employees.map((e) => (
                  <Command.Item
                    key={e.id}
                    value={`employee ${e.name}`}
                    onSelect={() => go(`/tasks?emp=${e.id}` as Route)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-chip cursor-pointer text-[15px] text-ink-strong aria-selected:bg-surface-soft"
                  >
                    <Users size={16} className="text-ink-subtle" />
                    {e.name}
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
