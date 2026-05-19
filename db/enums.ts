export const TASK_STATUSES = [
  "not_started",
  "initiated",
  "follow_up",
  "need_help",
  "done",
  "approved",
  "not_approved",
  "cancelled",
  "transferred",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PENDING_STATUSES = [
  "not_started",
  "initiated",
  "follow_up",
  "need_help",
] as const satisfies readonly TaskStatus[];

export const EMPLOYEE_ROLES = ["doer", "initiator", "both"] as const;
export type EmployeeRole = (typeof EMPLOYEE_ROLES)[number];

export const TASK_PRIORITIES = [
  "imp_urgent",
  "imp_not_urgent",
  "not_imp_urgent",
  "not_imp_not_urgent",
] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  imp_urgent:         "Important & Urgent",
  imp_not_urgent:     "Important, Not Urgent",
  not_imp_urgent:     "Not Important, Urgent",
  not_imp_not_urgent: "Not Important, Not Urgent",
};

export const DEPARTMENTS = [
  "Marketing",
  "Sales",
  "Hand Holding",
  "Consulting",
  "Accounts",
  "Admin",
  "HR",
  "Apps",
] as const;
export type Department = (typeof DEPARTMENTS)[number];

export const AGE_BUCKETS = [
  { id: "0-3", label: "0-3 days", min: 0, max: 3 },
  { id: "4-7", label: "4-7 days", min: 4, max: 7 },
  { id: "8-14", label: "8-14 days", min: 8, max: 14 },
  { id: "15-20", label: "15-20 days", min: 15, max: 20 },
  { id: "21-30", label: "21-30 days", min: 21, max: 30 },
  { id: "31-45", label: "31-45 days", min: 31, max: 45 },
  { id: "46-60", label: "46-60 days", min: 46, max: 60 },
  { id: "60+", label: "60+ days", min: 61, max: Infinity },
] as const;

export type AgeBucketId = (typeof AGE_BUCKETS)[number]["id"];

// M5.1 — palette tokens used by status_settings.color_token and accepted by the
// admin ColorPicker. The 6 names map to canonical pill backgrounds; admins can
// also store a raw hex string (validated by lib/validators/color-token.ts).
export const STATUS_COLOR_TOKENS = [
  "blue",
  "green",
  "amber",
  "red",
  "rose",
  "purple",
] as const;
export type StatusColorToken = (typeof STATUS_COLOR_TOKENS)[number];
