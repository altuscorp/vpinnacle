"use server";

import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import { sendResetPasswordEmail } from "@/lib/email/resend";

export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  try {
    const link = await getFirebaseAdminAuth().generatePasswordResetLink(email, {
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    });
    await sendResetPasswordEmail({ email, resetLink: link });
  } catch {
    // Swallow auth/user-not-found and SMTP errors — return generic ok
  }
  return { ok: true };
}
