import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { LoginRateLimiter, RateLimitResult } from "./types";

export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_WINDOW_SECONDS = 15 * 60;

type LoginAttempt = {
  identifier: string;
  ipAddress: string;
};

export const createLoginRateLimitKey = ({
  identifier,
  ipAddress,
}: LoginAttempt): string => {
  const digest = createHash("sha256")
    .update(`${identifier}:${ipAddress}`)
    .digest("hex");

  return `auth:login:${digest}`;
};

export const createInMemoryLoginRateLimiter = (
  now: () => number = Date.now,
): LoginRateLimiter => {
  const entries = new Map<string, { count: number; resetAt: number }>();

  const currentEntry = (key: string) => {
    const currentTime = now();
    const current = entries.get(key);

    if (!current || current.resetAt <= currentTime) {
      const next = {
        count: 0,
        resetAt: currentTime + LOGIN_WINDOW_SECONDS * 1000,
      };
      entries.set(key, next);
      return next;
    }

    return current;
  };

  return {
    async isAllowed(key) {
      return currentEntry(key).count < LOGIN_ATTEMPT_LIMIT;
    },
    async recordFailure(key): Promise<RateLimitResult> {
      const entry = currentEntry(key);
      entry.count += 1;

      return {
        allowed: entry.count < LOGIN_ATTEMPT_LIMIT,
        remaining: Math.max(0, LOGIN_ATTEMPT_LIMIT - entry.count),
        retryAfterSeconds: Math.max(
          0,
          Math.ceil((entry.resetAt - now()) / 1000),
        ),
      };
    },
  };
};

export const createProductionLoginRateLimiter = (
  environment: Partial<NodeJS.ProcessEnv> = process.env,
): LoginRateLimiter => {
  const url = environment.UPSTASH_REDIS_REST_URL;
  const token = environment.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Konfigurasi Upstash wajib tersedia untuk login production.",
    );
  }

  const redis = new Redis({ url, token });

  return {
    async isAllowed(key) {
      const count = (await redis.get<number>(key)) ?? 0;
      return count < LOGIN_ATTEMPT_LIMIT;
    },
    async recordFailure(key): Promise<RateLimitResult> {
      const count = Number(
        await redis.eval(
          "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]); end; return count;",
          [key],
          [LOGIN_WINDOW_SECONDS],
        ),
      );
      const ttl = await redis.ttl(key);

      return {
        allowed: count < LOGIN_ATTEMPT_LIMIT,
        remaining: Math.max(0, LOGIN_ATTEMPT_LIMIT - count),
        retryAfterSeconds: Math.max(0, ttl),
      };
    },
  };
};

let developmentLimiter: LoginRateLimiter | undefined;
let productionLimiter: LoginRateLimiter | undefined;

export const getLoginRateLimiter = (): LoginRateLimiter => {
  if (process.env.NODE_ENV === "production") {
    productionLimiter ??= createProductionLoginRateLimiter();
    return productionLimiter;
  }

  developmentLimiter ??= createInMemoryLoginRateLimiter();
  return developmentLimiter;
};
