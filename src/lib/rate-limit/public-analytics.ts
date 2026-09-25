import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { createDevelopmentRateLimiter } from "./in-memory";
import type { RateLimitResult } from "./types";

export const PUBLIC_ANALYTICS_LIMIT = 60;
export const PUBLIC_ANALYTICS_WINDOW_SECONDS = 60;

type AnalyticsEvent = "product-view" | "whatsapp";
type AnalyticsRateLimiter = {
  consume(key: string): Promise<RateLimitResult> | RateLimitResult;
};

export const createPublicAnalyticsRateLimitKey = (
  event: AnalyticsEvent,
  identifier: string,
) =>
  `analytics:${event}:${createHash("sha256").update(identifier).digest("hex")}`;

let developmentLimiter: AnalyticsRateLimiter | undefined;
let productionLimiter: AnalyticsRateLimiter | undefined;

export const getPublicAnalyticsRateLimiter = (): AnalyticsRateLimiter => {
  if (process.env.NODE_ENV !== "production") {
    developmentLimiter ??= createDevelopmentRateLimiter({
      limit: PUBLIC_ANALYTICS_LIMIT,
      windowMs: PUBLIC_ANALYTICS_WINDOW_SECONDS * 1000,
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
          [PUBLIC_ANALYTICS_WINDOW_SECONDS],
        ),
      );
      const ttl = await redis.ttl(key);
      return {
        allowed: count <= PUBLIC_ANALYTICS_LIMIT,
        remaining: Math.max(0, PUBLIC_ANALYTICS_LIMIT - count),
        retryAfterSeconds: Math.max(0, ttl),
      };
    },
  };
  return productionLimiter;
};

export const consumePublicAnalyticsLimit = async (
  request: Request,
  event: AnalyticsEvent,
): Promise<boolean> => {
  const identifier =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown";

  try {
    const result = await getPublicAnalyticsRateLimiter().consume(
      createPublicAnalyticsRateLimitKey(event, identifier),
    );
    return result.allowed;
  } catch {
    // Analytics must remain fail-open so limiter outages never block core UX.
    return true;
  }
};
