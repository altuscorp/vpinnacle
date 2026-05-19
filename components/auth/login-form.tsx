"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import Link from "next/link";
import type { Route } from "next";
import { Mail, Lock } from "lucide-react";
import { motion } from "motion/react";

import { AuthField } from "./auth-field";
import { AuthSubmit } from "./auth-submit";
import { AuthError } from "./auth-error";
import { PasswordEye } from "./password-eye";

function translateFirebaseError(code: string | undefined): string {
  switch (code) {
    case "auth/user-disabled":
      return "This account has been deactivated. Reach out to your admin to reinstate access.";
    case "auth/too-many-requests":
      return "Too many attempts in a row — give it a minute, then try again.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Wrong password. Try again, or reset it below.";
    case "auth/user-not-found":
    case "auth/invalid-email":
      return "We couldn't find that email. Double-check the address your admin sent.";
    case "auth/network-request-failed":
      return "Network hiccup. Check your connection and try once more.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in cancelled. Try again when you're ready.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google popup. Allow popups for this site and retry.";
    case "auth/account-exists-with-different-credential":
      return "This email is set up with a password. Sign in with your password instead, or ask your admin to switch you to Google.";
    case "auth/unauthorized-domain":
      return "Google sign-in isn't enabled for this domain. Ask your admin to whitelist it.";
    default:
      return "Email or password didn't match. Try again.";
  }
}

async function exchangeIdTokenForSession(idToken: string): Promise<void> {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (res.ok) return;
  // Try to surface a structured error so callers can branch on enrolment.
  let payload: { error?: string } = {};
  try {
    payload = await res.json();
  } catch {
    /* non-JSON */
  }
  if (res.status === 403 && payload.error === "not-enrolled") {
    throw new Error("not-enrolled");
  }
  throw new Error("session-exchange-failed");
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // Every successful sign-in lands on /welcome — the celebration is the
  // post-login habit. If the user deep-linked into a protected page and got
  // bounced to /login?next=/x, we forward /x as a query param on /welcome so
  // the "Take me in" button still respects the original destination.
  const requestedNext = params.get("next") || "/";
  const welcomeTarget = `/welcome?next=${encodeURIComponent(requestedNext)}`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [googlePending, setGooglePending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const cred = await signInWithEmailAndPassword(
          getFirebaseAuth(),
          email,
          password,
        );
        const idToken = await cred.user.getIdToken();
        await exchangeIdTokenForSession(idToken);
        router.replace(welcomeTarget as Route);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if ((err as Error)?.message === "not-enrolled") {
          setError(
            "This email isn't enrolled in VPinnacle. Ask your admin to invite you.",
          );
          try {
            await firebaseSignOut(getFirebaseAuth());
          } catch {
            /* best effort */
          }
          return;
        }
        setError(translateFirebaseError(code));
      }
    });
  }

  async function onGoogleSignIn() {
    if (googlePending || isPending) return;
    setError(null);
    setGooglePending(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(getFirebaseAuth(), provider);
      const idToken = await cred.user.getIdToken();
      await exchangeIdTokenForSession(idToken);
      router.replace(welcomeTarget as Route);
    } catch (err: unknown) {
      if ((err as Error)?.message === "not-enrolled") {
        setError(
          "This Google account isn't enrolled in VPinnacle. Ask your admin to invite the matching work email.",
        );
        try {
          await firebaseSignOut(getFirebaseAuth());
        } catch {
          /* best effort */
        }
      } else {
        const code = (err as { code?: string })?.code;
        setError(translateFirebaseError(code));
      }
    } finally {
      setGooglePending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full" noValidate>
      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.2, 0.7, 0.3, 1] }}
        className="mb-1"
      >
        <h2
          className="font-serif text-[#0F172A]"
          style={{
            fontStyle: "italic",
            fontSize: 48,
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            fontWeight: 400,
          }}
        >
          Sign in
        </h2>
        <p
          className="mt-2"
          style={{
            fontSize: 17,
            lineHeight: 1.5,
            color: "var(--color-ink-muted)",
            fontWeight: 500,
          }}
        >
          to your dashboard
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.18 }}
        className="mt-4 mb-6"
        style={{
          fontSize: 15,
          lineHeight: 1.55,
          color: "var(--color-ink-subtle)",
        }}
      >
        Use the email your admin set up for you.
      </motion.p>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.28, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <AuthField
            label="Work email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-5 w-5" aria-hidden />}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.34, ease: [0.2, 0.7, 0.3, 1] }}
        >
          <AuthField
            label="Password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-5 w-5" aria-hidden />}
            trailing={
              <PasswordEye visible={showPw} onToggle={() => setShowPw((v) => !v)} />
            }
          />
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <AuthError message={error} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.42, delay: 0.42 }}
          className="flex items-center justify-end pt-0.5"
        >
          <Link href={"/forgot-password" as Route} className="auth-link">
            Forgot password?
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, delay: 0.46, ease: [0.2, 0.7, 0.3, 1] }}
          className="pt-2"
        >
          <div className="login-cta-lg">
            <AuthSubmit pending={isPending} pendingLabel="Signing you in">
              Sign in
            </AuthSubmit>
          </div>
        </motion.div>
      </div>

      {/* Divider + Google sign-in */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.42, delay: 0.55 }}
        className="mt-7"
      >
        <div className="flex items-center gap-3">
          <div
            className="h-px flex-1"
            style={{ background: "rgba(15, 23, 42, 0.08)" }}
          />
          <span
            className="text-brand-pill"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--color-ink-subtle)",
            }}
          >
            or continue with
          </span>
          <div
            className="h-px flex-1"
            style={{ background: "rgba(15, 23, 42, 0.08)" }}
          />
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={googlePending || isPending}
            aria-label="Continue with Google"
            className="login-sso-btn login-sso-btn--wide group"
          >
            <span className="login-sso-glyph">
              <GoogleGlyph />
            </span>
            <span className="login-sso-label">
              {googlePending ? "Opening Google…" : "Continue with Google"}
            </span>
          </button>
        </div>
      </motion.div>

      {/* Terms footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.42, delay: 0.65 }}
        className="mt-8 border-t pt-5 text-center"
        style={{ borderColor: "rgba(15, 23, 42, 0.06)" }}
      >
        <p
          style={{
            fontSize: 13,
            color: "var(--color-ink-subtle)",
            lineHeight: 1.55,
          }}
        >
          By signing in you agree to the Altus Corp{" "}
          <Link
            href={"/terms" as Route}
            target="_blank"
            rel="noopener noreferrer"
            className="auth-link font-semibold"
          >
            terms
          </Link>{" "}
          and{" "}
          <Link
            href={"/privacy" as Route}
            target="_blank"
            rel="noopener noreferrer"
            className="auth-link font-semibold"
          >
            privacy policy
          </Link>
          .
        </p>
      </motion.div>
    </form>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.08-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.46-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33C2.45 15.98 5.48 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.71c-.18-.54-.28-1.12-.28-1.71s.1-1.17.28-1.71V4.96H.96C.35 6.17 0 7.55 0 9s.35 2.83.96 4.04l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.45 2.02.96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
