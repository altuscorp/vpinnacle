type Level = "debug" | "info" | "warn" | "error";

export type LogEntry = {
  level: Level;
  ts: string;
  msg: string;
  fields?: Record<string, unknown>;
};

const IS_PROD = process.env.NODE_ENV === "production";
const RING_CAPACITY = 100;

class RingBuffer {
  private items: LogEntry[] = [];
  push(entry: LogEntry) {
    this.items.push(entry);
    if (this.items.length > RING_CAPACITY) this.items.shift();
  }
  read(): LogEntry[] {
    return [...this.items];
  }
  clear() {
    this.items = [];
  }
}

/** Internal — exported only for tests and /admin/health. */
export const _ringBuffer = new RingBuffer();

function emit(level: Level, msg: string, fields?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    ts: new Date().toISOString(),
    msg,
    ...(fields ? { fields } : {}),
  };

  if (level === "warn" || level === "error") {
    _ringBuffer.push(entry);
  }

  if (IS_PROD) {
    const line = JSON.stringify(entry);
    if (level === "error") console.error(line);
    else if (level === "warn") console.warn(line);
    else console.log(line);
  } else {
    const tag = level.toUpperCase().padEnd(5);
    const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (fields && Object.keys(fields).length > 0) {
      sink(`[${tag}] ${msg}`, fields);
    } else {
      sink(`[${tag}] ${msg}`);
    }
  }
}

export const log = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit("debug", msg, fields),
  info:  (msg: string, fields?: Record<string, unknown>) => emit("info",  msg, fields),
  warn:  (msg: string, fields?: Record<string, unknown>) => emit("warn",  msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
};
