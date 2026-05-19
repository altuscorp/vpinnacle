/**
 * Dev-only. Mirrors `pnpm seed`'s employees into the local Firebase emulator
 * and writes back firebase_uid + email into the employees table.
 *
 * Requires NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST + FIREBASE_AUTH_EMULATOR_HOST
 * to be set (handled by .env.local).
 *
 * Usage:
 *   pnpm seed                    # seed Supabase first
 *   pnpm tsx scripts/seed-firebase.ts  # then this
 *
 * Default password for every seeded employee: "dev1234".
 */

import { eq, isNull } from "drizzle-orm";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { db } from "../lib/db";
import { employees } from "../db/schema";

const DEV_PASSWORD = "dev1234";

async function main() {
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.error("Refusing to run: FIREBASE_AUTH_EMULATOR_HOST not set. This script is for the local emulator ONLY.");
    process.exit(1);
  }
  // For the emulator, credentials can be a no-op cert with the project ID
  if (!getApps().length) {
    initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "vpinnacle-dev",
    });
  }
  const auth = getAuth();

  const rows = await db.select().from(employees).where(isNull(employees.firebaseUid));
  console.log(`Found ${rows.length} employees without firebase_uid.`);

  for (const e of rows) {
    try {
      const fbUser = await auth.createUser({
        email: e.email,
        password: DEV_PASSWORD,
        emailVerified: true,
        displayName: e.name,
      });
      await auth.setCustomUserClaims(fbUser.uid, { role: "authenticated" });
      await db.update(employees)
        .set({ firebaseUid: fbUser.uid, joinedAt: new Date() })
        .where(eq(employees.id, e.id));
      console.log(`✓ ${e.email}`);
    } catch (err: any) {
      console.warn(`✗ ${e.email}: ${err.message ?? err}`);
    }
  }

  console.log(`\nDone. All seeded employees can sign in with password: "${DEV_PASSWORD}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
