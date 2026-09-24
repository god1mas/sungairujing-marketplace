import type { RateLimiter, RateLimitResult } from "./types";

type Entry = {
  count: number;
  resetAt: number;
};

type InMemoryRateLimiterOptions = {
  limit: number;
  windowMs: number;
  now?: () => number;
};

export const createDevelopmentRateLimiter = ({
  limit,
  windowMs,
  now = Date.now,
}: InMemoryRateLimiterOptions): RateLimiter => {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "In-memory rate limiter tidak boleh digunakan di production.",
    );
  }

  const entries = new Map<string, Entry>();

  return {
    consume(key: string): RateLimitResult {
      const currentTime = now();
      const current = entries.get(key);
      const entry =
        !current || current.resetAt <= currentTime
          ? { count: 0, resetAt: currentTime + windowMs }
          : current;

      entry.count += 1;
      entries.set(key, entry);

      return {
        allowed: entry.count <= limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSeconds: Math.max(
          0,
          Math.ceil((entry.resetAt - currentTime) / 1000),
        ),
      };
    },
  };
};
