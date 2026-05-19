"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { employees } from "@/db/schema";
import { requireUser } from "@/lib/auth/current";

/**
 * M4 — self-serve per-channel opt-in flags.  Only the two channels the
 * employee can fully control today (email + Slack) are mutable here.
 * WhatsApp opt-in is admin-gated because it requires capturing the
 * employee's phone number, which we ask admins to do on their behalf
 * (DPDP / Meta-policy reasons).  Web Push opt-in lives on the
 * subscription itself (one row per device) — not on this scalar.
 */
const PatchSchema = z
  .object({
    emailOptIn: z.boolean().optional(),
    slackOptIn: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "No changes." });

export type UpdateMyChannelsInput = z.infer<typeof PatchSchema>;

export async function updateMyChannels(
  input: UpdateMyChannelsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const me = await requireUser();
  const parsed = PatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid",
    };
  }
  try {
    await db.update(employees).set(parsed.data).where(eq(employees.id, me.id));
  } catch (err) {
    return { ok: false, error: `DB: ${(err as Error).message}` };
  }
  revalidatePath("/profile");
  return { ok: true };
}
