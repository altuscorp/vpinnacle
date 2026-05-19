"use client";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env-client";

export function LiveIndicator() {
  const [connected, setConnected] = useState(false);
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createBrowserClient(
      clientEnv.NEXT_PUBLIC_SUPABASE_URL,
      clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel("tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => {
          if (!debounceTimer) {
            debounceTimer = setTimeout(() => {
              startTransition(() => router.refresh());
              debounceTimer = null;
            }, 1500);
          }
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const dotColor = connected ? "var(--color-green)" : "var(--color-ink-subtle)";

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className="size-2.5 rounded-full"
        style={{
          backgroundColor: dotColor,
          boxShadow: connected ? `0 0 12px ${dotColor}` : "none",
          animation: connected ? "livePulse 1.8s ease-in-out infinite" : "none",
        }}
        aria-hidden
      />
      <span className="text-body-lg text-ink-muted">
        {connected ? "Live" : "Offline"}
      </span>
    </span>
  );
}
