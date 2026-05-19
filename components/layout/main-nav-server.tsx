import { getNavCounts } from "@/lib/queries/nav-counts";
import { getCurrentEmployee } from "@/lib/auth/current";
import { getVisibleDashboards } from "@/lib/external-dashboards";
import { MainNav } from "./main-nav";

export async function MainNavServer() {
  const me = await getCurrentEmployee();
  const { activeTasks, archivedTasks, inboxUnread } = await getNavCounts(
    me
      ? {
          userId: me.id,
          isAdmin: me.isAdmin,
          inboxSince: me.lastInboxVisitAt,
        }
      : undefined,
  );
  const liasoningLinks = getVisibleDashboards(me);
  return (
    <MainNav
      activeTasks={activeTasks}
      archivedTasks={archivedTasks}
      inboxUnread={inboxUnread}
      liasoningLinks={liasoningLinks}
    />
  );
}
