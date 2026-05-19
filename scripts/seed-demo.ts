/**
 * Demo seed for the live Firebase project — creates 4 test employees with a
 * known password ("demo1234") + a handful of tasks across various statuses.
 *
 * Idempotent: re-running won't duplicate Firebase users or DB rows.
 *
 * Usage:
 *   pnpm tsx scripts/seed-demo.ts
 *
 * After running:
 *   - Sign in as any of the demo emails with password "demo1234"
 *   - Switch personas via header menu → Sign out → /login
 */

import { eq } from "drizzle-orm";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { db } from "../lib/db";
import { employees, tasks, taskEvents } from "../db/schema";
import { deriveShortId } from "../lib/import/short-id";

const DEMO_PASSWORD = "demo1234";

interface SeedEmployee {
  name: string;
  email: string;
  role: "doer" | "initiator" | "both";
  department: string;
  isAdmin: boolean;
}

const DEMO_EMPLOYEES: SeedEmployee[] = [
  { name: "Pravin Joshi",   email: "pravin@vpinnacle.demo",   role: "both",      department: "Operations",   isAdmin: true  },
  { name: "Apeksha Joshi",  email: "apeksha@vpinnacle.demo",  role: "initiator", department: "Operations",   isAdmin: true  },
  { name: "Rohit Sharma",   email: "rohit@vpinnacle.demo",    role: "doer",      department: "Underwriting", isAdmin: false },
  { name: "Priya Iyer",     email: "priya@vpinnacle.demo",    role: "doer",      department: "Sales",        isAdmin: false },
];

interface SeedTask {
  subject: string;
  description: string;
  doerEmail: string;
  initiatorEmail: string;
  priority: "imp_urgent" | "imp_not_urgent" | "not_imp_urgent" | "not_imp_not_urgent";
  status: "not_started" | "initiated" | "follow_up" | "need_help" | "done" | "approved";
  dueOffsetDays: number; // days from today, can be negative for overdue
}

const DEMO_TASKS: SeedTask[] = [
  // Rohit is the doer — these will appear when Rohit signs in
  {
    subject: "KYC verification for borrower 4471",
    description: "Verify PAN + Aadhaar + bank statements. Borrower has flagged a name mismatch — call them to confirm.",
    doerEmail: "rohit@vpinnacle.demo",
    initiatorEmail: "apeksha@vpinnacle.demo",
    priority: "imp_urgent",
    status: "not_started",
    dueOffsetDays: 2,
  },
  {
    subject: "Site visit for project loan — Andheri",
    description: "Visit the construction site, click photos, assess progress against the loan disbursement schedule. Report back by EOD.",
    doerEmail: "rohit@vpinnacle.demo",
    initiatorEmail: "pravin@vpinnacle.demo",
    priority: "imp_urgent",
    status: "follow_up",
    dueOffsetDays: -1, // overdue!
  },
  {
    subject: "Draft sanction letter for builder loan 8821",
    description: "Use the standard template. Loan terms in the file note.",
    doerEmail: "rohit@vpinnacle.demo",
    initiatorEmail: "apeksha@vpinnacle.demo",
    priority: "imp_not_urgent",
    status: "done", // awaiting Apeksha's approval
    dueOffsetDays: 0,
  },
  {
    subject: "Approved disbursal — government scheme loan",
    description: "Process completed, money disbursed, all signatures collected.",
    doerEmail: "rohit@vpinnacle.demo",
    initiatorEmail: "pravin@vpinnacle.demo",
    priority: "not_imp_not_urgent",
    status: "approved",
    dueOffsetDays: -5,
  },
  // Priya is the doer — second doer perspective
  {
    subject: "Follow up with MSME loan applicant Patel & Co",
    description: "They asked for 30 days extension on disbursal. Confirm new timeline.",
    doerEmail: "priya@vpinnacle.demo",
    initiatorEmail: "apeksha@vpinnacle.demo",
    priority: "not_imp_urgent",
    status: "follow_up",
    dueOffsetDays: 3,
  },
  {
    subject: "Hotel chain refinance — initial assessment",
    description: "Big-ticket lead from Pravin. Read the file, draft initial findings.",
    doerEmail: "priya@vpinnacle.demo",
    initiatorEmail: "pravin@vpinnacle.demo",
    priority: "imp_not_urgent",
    status: "initiated",
    dueOffsetDays: 7,
  },
];

async function main() {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.error("Missing FIREBASE_* env vars. Aborting.");
    process.exit(1);
  }
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
  const auth = getAuth();

  console.log(`\n=== Seeding ${DEMO_EMPLOYEES.length} demo employees ===\n`);

  // Phase 1 — employees
  const empIdByEmail = new Map<string, string>();
  for (const seed of DEMO_EMPLOYEES) {
    // Check DB for an existing employee
    const existing = await db.query.employees.findFirst({ where: eq(employees.email, seed.email) });
    if (existing) {
      console.log(`= ${seed.email} already in DB (employee ${existing.id})`);
      empIdByEmail.set(seed.email, existing.id);
      // Best-effort: make sure Firebase user has the demo password
      if (existing.firebaseUid) {
        try {
          await auth.updateUser(existing.firebaseUid, { password: DEMO_PASSWORD, emailVerified: true });
        } catch {}
      }
      continue;
    }

    // Create Firebase user
    let fbUid: string;
    try {
      const existingFb = await auth.getUserByEmail(seed.email).catch(() => null);
      if (existingFb) {
        await auth.updateUser(existingFb.uid, { password: DEMO_PASSWORD, emailVerified: true });
        fbUid = existingFb.uid;
        console.log(`= ${seed.email} already in Firebase (uid ${fbUid}, password reset)`);
      } else {
        const fbUser = await auth.createUser({
          email: seed.email,
          password: DEMO_PASSWORD,
          emailVerified: true,
          displayName: seed.name,
          disabled: false,
        });
        fbUid = fbUser.uid;
        console.log(`+ Firebase user created: ${seed.email} (uid ${fbUid})`);
      }
      await auth.setCustomUserClaims(fbUid, { role: "authenticated" });
    } catch (err: any) {
      console.error(`! ${seed.email} Firebase error: ${err.message ?? err}`);
      continue;
    }

    // Insert employee row
    try {
      const [inserted] = await db.insert(employees).values({
        name: seed.name,
        email: seed.email,
        role: seed.role,
        department: seed.department,
        isAdmin: seed.isAdmin,
        isActive: true,
        firebaseUid: fbUid,
        invitedAt: new Date(),
        joinedAt: new Date(), // act as if they already accepted the invite
      }).returning();
      if (inserted) {
        empIdByEmail.set(seed.email, inserted.id);
        console.log(`+ DB row inserted: ${seed.email} (employee ${inserted.id})`);
      }
    } catch (err: any) {
      console.error(`! ${seed.email} DB error: ${err.message ?? err}`);
    }
  }

  // Keep the M3 `departments` table in sync with the legacy text column
  // we just wrote — otherwise /admin/departments shows an empty list.
  const { syncDepartmentsFromEmployees } = await import("./sync-departments");
  const sync = await syncDepartmentsFromEmployees();
  console.log(
    `\n=== Departments sync: ${sync.inserted.length} inserted, ${sync.linked} employee rows linked ===`,
  );

  console.log(`\n=== Seeding ${DEMO_TASKS.length} demo tasks ===\n`);

  // Phase 2 — tasks
  const now = new Date();
  for (const t of DEMO_TASKS) {
    const doerId      = empIdByEmail.get(t.doerEmail);
    const initiatorId = empIdByEmail.get(t.initiatorEmail);
    if (!doerId || !initiatorId) {
      console.warn(`! Skipping "${t.subject}" — missing employee FK`);
      continue;
    }

    // Idempotency check by subject (this is demo seed, not production)
    const existingTask = await db.query.tasks.findFirst({
      where: eq(tasks.subject, t.subject),
    });
    if (existingTask) {
      console.log(`= "${t.subject}" already exists`);
      continue;
    }

    const taskId = crypto.randomUUID();
    const due = new Date(now);
    due.setDate(due.getDate() + t.dueOffsetDays);

    try {
      await db.transaction(async (tx) => {
        await tx.insert(tasks).values({
          id: taskId,
          title: t.subject,
          subject: t.subject,
          description: t.description,
          doerId,
          initiatorId,
          createdById: initiatorId,
          priority: t.priority,
          status: t.status,
          createdAt: now,
          dueAt: due,
          completedAt: t.status === "done" || t.status === "approved" ? new Date(now.getTime() - 86400000) : null,
          approvedAt: t.status === "approved" ? new Date(now.getTime() - 43200000) : null,
          approvedById: t.status === "approved" ? initiatorId : null,
          shortId: deriveShortId(taskId),
        });
        await tx.insert(taskEvents).values({
          taskId,
          actorId: initiatorId,
          eventType: "created",
          note: "demo seed",
          createdAt: now,
        });
        if (t.status === "approved") {
          await tx.insert(taskEvents).values({
            taskId,
            actorId: initiatorId,
            eventType: "approved",
            note: "Looks good — disbursed.",
            createdAt: new Date(now.getTime() - 43200000),
          });
        }
      });
      console.log(`+ "${t.subject}" → ${t.status} (doer: ${t.doerEmail.split("@")[0]})`);
    } catch (err: any) {
      console.error(`! "${t.subject}" DB error: ${err.message ?? err}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`\nSign in with any of these accounts at http://localhost:3000/login`);
  console.log(`Password for all: ${DEMO_PASSWORD}\n`);
  for (const e of DEMO_EMPLOYEES) {
    const role = e.isAdmin ? "admin" : e.role;
    console.log(`  ${e.email.padEnd(28)} (${role.padEnd(10)} — ${e.department})`);
  }
  console.log();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}).then(() => process.exit(0));
