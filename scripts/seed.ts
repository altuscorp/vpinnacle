import { faker, fakerEN_IN } from "@faker-js/faker";
import { db, employees, tasks } from "@/lib/db";
import {
  DEPARTMENTS,
  type EmployeeRole,
  type TaskPriority,
  type TaskStatus,
} from "@/db/enums";

faker.seed(20260509);
fakerEN_IN.seed(20260509);

const ROLE_DISTRIBUTION: { value: EmployeeRole; weight: number }[] = [
  { value: "doer", weight: 0.6 },
  { value: "initiator", weight: 0.3 },
  { value: "both", weight: 0.1 },
];

function pickWeighted<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const i of items) {
    r -= i.weight;
    if (r <= 0) return i.value;
  }
  return items[items.length - 1]!.value;
}

const STATUS_DISTRIBUTION: { value: TaskStatus; weight: number }[] = [
  { value: "approved", weight: 0.32 },
  { value: "done", weight: 0.23 },
  { value: "follow_up", weight: 0.08 },
  { value: "initiated", weight: 0.07 },
  { value: "not_started", weight: 0.06 },
  { value: "need_help", weight: 0.04 },
  { value: "not_approved", weight: 0.12 },
  { value: "cancelled", weight: 0.05 },
  { value: "transferred", weight: 0.03 },
];

const PRIORITY_DISTRIBUTION: { value: TaskPriority; weight: number }[] = [
  { value: "imp_urgent",         weight: 0.18 },
  { value: "imp_not_urgent",     weight: 0.32 },
  { value: "not_imp_urgent",     weight: 0.30 },
  { value: "not_imp_not_urgent", weight: 0.20 },
];

const SUBJECT_POOL = [
  "Loan Application",
  "KYC Verification",
  "Document Collection",
  "Disbursement",
  "Followup Call",
  "Site Visit",
  "Underwriting Review",
  "Customer Onboarding",
  "Repayment Reminder",
  "Renewal",
];

function isWeekday(d: Date) {
  const day = d.getDay();
  return day !== 0 && day !== 6;
}

function randomWorkingDateBetween(start: Date, end: Date): Date {
  for (let i = 0; i < 5; i++) {
    const ts =
      start.getTime() +
      Math.random() * (end.getTime() - start.getTime());
    const d = new Date(ts);
    if (isWeekday(d)) return d;
  }
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

async function main() {
  console.log("Seeding employees...");

  const NAMED = [
    { name: "Dhruv Vasa",    email: "dhruv@altuscorp.in",   role: "doer"      as const, department: "Sales"     },
    { name: "Hetesh Patel",  email: "hetesh@altuscorp.in",  role: "both"      as const, department: "Apps"      },
    { name: "Mishtie Shah",  email: "mishtie@altuscorp.in", role: "initiator" as const, department: "Marketing" },
  ];

  const randomRows = Array.from({ length: 17 }).map(() => ({
    name: fakerEN_IN.person.fullName(),
    email: faker.internet.email().toLowerCase(),
    role: pickWeighted(ROLE_DISTRIBUTION),
    department: faker.helpers.arrayElement(DEPARTMENTS),
  }));
  const employeeRows = [...NAMED, ...randomRows];

  const insertedEmployees = await db
    .insert(employees)
    .values(employeeRows)
    .returning();

  // Keep the M3 `departments` table in sync with the legacy text column
  // we just wrote — otherwise /admin/departments shows an empty list.
  const { syncDepartmentsFromEmployees } = await import("./sync-departments");
  const sync = await syncDepartmentsFromEmployees();
  console.log(
    `  → departments table: ${sync.inserted.length} inserted, ${sync.linked} employee rows linked`,
  );

  const doers = insertedEmployees.filter(
    (e) => e.role === "doer" || e.role === "both",
  );
  const initiators = insertedEmployees.filter(
    (e) => e.role === "initiator" || e.role === "both",
  );

  console.log(
    `Inserted ${insertedEmployees.length} employees (${doers.length} doers, ${initiators.length} initiators)`,
  );

  console.log("Seeding tasks...");

  const now = new Date();
  const ninetyDaysAgo = new Date(
    now.getTime() - 90 * 24 * 60 * 60 * 1000,
  );

  const taskRows = Array.from({ length: 1200 }).map(() => {
    const status = pickWeighted(STATUS_DISTRIBUTION);
    const priority = pickWeighted(PRIORITY_DISTRIBUTION);
    const createdAt = randomWorkingDateBetween(ninetyDaysAgo, now);
    const dueAt = new Date(
      createdAt.getTime() +
        faker.number.int({ min: 3, max: 30 }) * 24 * 60 * 60 * 1000,
    );

    const isTerminal =
      status === "approved" ||
      status === "done" ||
      status === "cancelled";
    const completedAt = isTerminal
      ? new Date(
          createdAt.getTime() +
            faker.number.int({ min: 1, max: 21 }) *
              24 *
              60 *
              60 *
              1000,
        )
      : null;

    const doer = faker.helpers.arrayElement(doers);
    let initiator = faker.helpers.arrayElement(initiators);
    let attempts = 0;
    while (initiator.id === doer.id && attempts < 5) {
      initiator = faker.helpers.arrayElement(initiators);
      attempts++;
    }

    return {
      title: faker.hacker.phrase().replace(/[!.]$/, ""),
      description: faker.lorem.sentence(),
      doerId: doer.id,
      initiatorId: initiator.id,
      priority,
      status,
      subject: faker.helpers.arrayElement(SUBJECT_POOL),
      archived: false,
      createdAt,
      dueAt,
      completedAt,
    };
  });

  const archivedRows = Array.from({ length: 20 }).map(() => {
    const doer = faker.helpers.arrayElement(doers);
    const initiator = faker.helpers.arrayElement(initiators);
    const createdAt = randomWorkingDateBetween(
      new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000),
      ninetyDaysAgo,
    );
    return {
      title: faker.hacker.phrase().replace(/[!.]$/, ""),
      description: faker.lorem.sentence(),
      doerId: doer.id,
      initiatorId: initiator.id,
      priority: pickWeighted(PRIORITY_DISTRIBUTION),
      status: "approved" as TaskStatus,
      subject: faker.helpers.arrayElement(SUBJECT_POOL),
      archived: true,
      createdAt,
      dueAt: new Date(createdAt.getTime() + 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(
        createdAt.getTime() + faker.number.int({ min: 5, max: 20 }) * 24 * 60 * 60 * 1000,
      ),
    };
  });
  taskRows.push(...archivedRows);

  const CHUNK = 200;
  for (let i = 0; i < taskRows.length; i += CHUNK) {
    await db.insert(tasks).values(taskRows.slice(i, i + CHUNK));
  }

  console.log(`Inserted ${taskRows.length} tasks.`);
  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
