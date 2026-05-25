// @vitest-environment node
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { log, _ringBuffer } from "@/lib/log";

describe("log", () => {
  let infoSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    _ringBuffer.clear();
  });

  afterEach(() => {
    infoSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("info() routes to console.log", () => {
    log.info("task.created", { taskId: "t1" });
    expect(infoSpy).toHaveBeenCalledOnce();
  });

  it("warn() routes to console.warn and records to ring buffer", () => {
    log.warn("slow_query", { query: "x", ms: 250 });
    expect(warnSpy).toHaveBeenCalledOnce();
    const items = _ringBuffer.read();
    expect(items).toHaveLength(1);
    expect(items[0]?.level).toBe("warn");
    expect(items[0]?.msg).toBe("slow_query");
  });

  it("error() routes to console.error and records to ring buffer", () => {
    log.error("auth.failed", { reason: "stale-cookie" });
    expect(errorSpy).toHaveBeenCalledOnce();
    expect(_ringBuffer.read()).toHaveLength(1);
  });

  it("ring buffer caps at 100 entries (oldest drops)", () => {
    for (let i = 0; i < 105; i++) log.warn("evt", { i });
    const items = _ringBuffer.read();
    expect(items).toHaveLength(100);
    expect(items[0]?.fields?.i).toBe(5); // 0..4 dropped
    expect(items[99]?.fields?.i).toBe(104);
  });

  it("debug() does not touch the ring buffer", () => {
    log.debug("noisy", { foo: 1 });
    expect(_ringBuffer.read()).toHaveLength(0);
  });

  it("info() does not touch the ring buffer", () => {
    log.info("hello");
    expect(_ringBuffer.read()).toHaveLength(0);
  });
});
