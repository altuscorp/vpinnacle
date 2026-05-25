import { describe, it, expect, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/db", () => ({
  db: {},
  tasks: {},
  employees: {},
}));

import { matchesSearch } from "@/lib/queries/tasks";
import type { TaskListRow } from "@/lib/types";

const row: TaskListRow = {
  id: "t1",
  title: "Loan KYC for Anita Shah",
  subject: "GST",
  status: "not_started",
  priority: "imp_urgent",
  doerId: "e1",
  doerName: "Anita Shah",
  doerDept: "Ops",
  initiatorId: "e2",
  initiatorName: "Ben Singh",
  createdAt: new Date(),
  dueAt: new Date(),
  archived: false,
  createdById: "e2",
  updatedAt: new Date(),
  tags: ["kyc", "priority"],
  ageDays: 0,
} as TaskListRow;

describe("matchesSearch", () => {
  it("matches title substring case-insensitively", () => {
    expect(matchesSearch(row, "kyc")).toBe(true);
    expect(matchesSearch(row, "KYC")).toBe(true);
  });
  it("matches subject", () => {
    expect(matchesSearch(row, "gst")).toBe(true);
  });
  it("matches tags", () => {
    expect(matchesSearch(row, "priority")).toBe(true);
  });
  it("matches doer name", () => {
    expect(matchesSearch(row, "anita")).toBe(true);
  });
  it("matches initiator name", () => {
    expect(matchesSearch(row, "singh")).toBe(true);
  });
  it("returns true on empty query (no filter)", () => {
    expect(matchesSearch(row, "")).toBe(true);
  });
  it("returns false when nothing matches", () => {
    expect(matchesSearch(row, "xyzzy")).toBe(false);
  });
});
