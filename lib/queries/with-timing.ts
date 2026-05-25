import { log } from "@/lib/log";

const SLOW_MS = 200;

/** Time a DB-touching async function. Emits a `slow_query` warn if it exceeds SLOW_MS. */
export async function timed<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    const ms = Math.round(performance.now() - t0);
    if (ms >= SLOW_MS) log.warn("slow_query", { query: name, ms });
  }
}
