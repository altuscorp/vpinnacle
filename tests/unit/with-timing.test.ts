// @vitest-environment node
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { timed } from "@/lib/queries/with-timing";
import { _ringBuffer } from "@/lib/log";

describe("timed", () => {
  beforeEach(() => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    _ringBuffer.clear();
  });

  afterEach(() => vi.restoreAllMocks());

  it("returns the wrapped function's value", async () => {
    const out = await timed("test.q", async () => 42);
    expect(out).toBe(42);
  });

  it("does not log when the function is fast", async () => {
    await timed("fast.q", async () => "ok");
    expect(_ringBuffer.read()).toHaveLength(0);
  });

  it("logs slow_query warn when the function exceeds 200ms", async () => {
    await timed("slow.q", async () => {
      await new Promise((r) => setTimeout(r, 220));
    });
    const items = _ringBuffer.read();
    expect(items).toHaveLength(1);
    expect(items[0]?.msg).toBe("slow_query");
    expect(items[0]?.fields?.query).toBe("slow.q");
    expect((items[0]?.fields?.ms as number) >= 200).toBe(true);
  });

  it("propagates errors and still logs if slow", async () => {
    await expect(
      timed("err.q", async () => {
        await new Promise((r) => setTimeout(r, 220));
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
    expect(_ringBuffer.read().filter((e) => e.msg === "slow_query")).toHaveLength(1);
  });
});
