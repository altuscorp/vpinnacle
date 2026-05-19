import type { Employee } from "@/db/schema";

export type DashboardAccent = "blue" | "amber" | "purple";
export type DashboardIconName = "Building2" | "Receipt" | "ClipboardList";

export interface DashboardLink {
  id: "bank-liasoning" | "mandate-collection" | "task-management";
  label: string;
  description: string;
  url: string;
  accent: DashboardAccent;
  iconName: DashboardIconName;
  visibleTo: (e: Employee) => boolean;
}

// Lowercased once, matched against the also-lowercased employee email.
// Kept here (not in env / DB) because Manan asked for exactly these two
// people; a third address would be a one-line edit + redeploy.
const SPECIAL_EMAILS = new Set<string>([
  "altus@vpinnacle.com",
  "pravin@vpinnacle.com",
]);

function isSpecialOrAdmin(e: Employee): boolean {
  if (e.isAdmin) return true;
  const email = e.email.trim().toLowerCase();
  return SPECIAL_EMAILS.has(email);
}

export const EXTERNAL_DASHBOARDS: readonly DashboardLink[] = [
  {
    id: "bank-liasoning",
    label: "Bank Liasoning",
    description: "Operations dashboard for liasoning",
    url: "https://script.google.com/a/macros/vpinnacle.com/s/AKfycbzTPFV7SaqrkTmdziYWxTYN2h4rJvoSrlLS8Cc9vx_lXcLuRwdPvtDFleppsZx9bZvu/exec",
    accent: "blue",
    iconName: "Building2",
    visibleTo: isSpecialOrAdmin,
  },
  {
    id: "mandate-collection",
    label: "Mandate & Collection",
    description: "Operations dashboard for mandate and collection",
    url: "https://script.google.com/a/macros/vpinnacle.com/s/AKfycbzg_sOjeR2i5u05_-4b65AHZl8uecQsIcfIxIM8UsIK9zFn4OXkV-tzEB5Pt3qiPJ6g5A/exec",
    accent: "amber",
    iconName: "Receipt",
    visibleTo: isSpecialOrAdmin,
  },
  {
    id: "task-management",
    label: "Task Management",
    description: "Legacy Apps Script task tracker",
    url: "https://script.google.com/macros/s/AKfycbzmodREIMnrAo-607RKAyraVApFPr3u7wX3yCv5ny0cqS0jL7Chs77ehL6JVyC_NsOz/exec?page=form",
    accent: "purple",
    iconName: "ClipboardList",
    visibleTo: () => true,
  },
];

/**
 * Serializable shape forwarded from server → client (drops the predicate function).
 */
export interface VisibleDashboard {
  id: DashboardLink["id"];
  label: string;
  description: string;
  url: string;
  accent: DashboardAccent;
  iconName: DashboardIconName;
}

export function getVisibleDashboards(employee: Employee | null): VisibleDashboard[] {
  if (!employee) return [];
  return EXTERNAL_DASHBOARDS.filter((d) => d.visibleTo(employee)).map(
    ({ id, label, description, url, accent, iconName }) => ({
      id,
      label,
      description,
      url,
      accent,
      iconName,
    }),
  );
}
