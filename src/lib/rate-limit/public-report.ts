import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { createDevelopmentRateLimiter } from "./in-memory";
import type { RateLimitResult, RateLimiter } from "./types";

export const PUBLIC_REPORT_LIMIT = 5;
const WINDOW_SECONDS = 60 * 60;

export const createPublicReportRateLimitKey = (identifier: string) =>
  `report:public:${createHash("sha256").update(identifier).digest("hex")}`;

let developmentLimiter: RateLimiter | undefined;
type PublicReportRateLimiter = {
  consume(key: string): Promise<RateLimitResult> | RateLimitResult;
};
let productionLimiter: PublicReportRateLimiter | undefined;

export const getPublicReportRateLimiter = (): PublicReportRateLimiter => {
  if (process.env.NODE_ENV !== "production") {
    developmentLimiter ??= createDevelopmentRateLimiter({
      limit: PUBLIC_REPORT_LIMIT,
      windowMs: WINDOW_SECONDS * 1000,
    });
    return developmentLimiter;
  }
  if (productionLimiter) return productionLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Konfigurasi rate limit belum tersedia.");
  const redis = new Redis({ url, token });
  productionLimiter = {
    async consume(key) {
      const count = Number(
        await redis.eval(
          "local count=redis.call('INCR',KEYS[1]); if count==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]); end; return count;",
          [key],
          [WINDOW_SECONDS],
        ),
      );
      const ttl = await redis.ttl(key);
      return {
        allowed: count <= PUBLIC_REPORT_LIMIT,
        remaining: Math.max(0, PUBLIC_REPORT_LIMIT - count),
        retryAfterSeconds: Math.max(0, ttl),
      };
    },
  };
  return productionLimiter!;
};
