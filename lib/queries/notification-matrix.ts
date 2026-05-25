import "server-only";
import { cache } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orgSettings } from "@/db/schema";
import type { NotificationMatrix } from "@/lib/notifications/resolve-channels";
import { timed } from "./with-timing";

// Single-row org_settings; `id = 1` is enforced by the table-level CHECK.
export const getNotificationMatrix = cache(
  async (): Promise<NotificationMatrix> => {
    return timed("notification-matrix.getNotificationMatrix", async () => {
      const row = await db.query.orgSettings.findFirst({
        where: eq(orgSettings.id, 1),
      });
      return (row?.notificationMatrix ?? {}) as NotificationMatrix;
    });
  },
);
