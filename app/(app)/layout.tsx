import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth/current";
import { getOrgSettings } from "@/lib/queries/org-settings";
import { getTaskManifest } from "@/lib/queries/task-manifest";
import { listEmployees } from "@/lib/queries/employees";
import { IdleTimerClient } from "@/components/auth/idle-timer-client";
import { CommandPalette } from "@/components/layout/command-palette";

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUser();
  const [settings, taskManifest, employees] = await Promise.all([
    getOrgSettings(),
    getTaskManifest(),
    listEmployees(),
  ]);
  return (
    <>
      <IdleTimerClient timeoutMinutes={settings.idleTimeoutMinutes} />
      {children}
      <CommandPalette
        data={{
          tasks: taskManifest,
          employees: employees.map((e) => ({ id: e.id, name: e.name })),
        }}
      />
    </>
  );
}
