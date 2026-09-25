import { describe, expect, it } from "vitest";
import {
  createPublicAnalyticsRateLimitKey,
  getPublicAnalyticsRateLimiter,
  PUBLIC_ANALYTICS_LIMIT,
} from "./public-analytics";

describe("public analytics rate limiting", () => {
  it("hashes the identifier instead of exposing an IP in the key", () => {
    const key = createPublicAnalyticsRateLimitKey(
      "product-view",
      "203.0.113.10",
    );

    expect(key).toMatch(/^analytics:product-view:[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.10");
  });

  it("applies a reasonable per-window burst limit", async () => {
    const limiter = getPublicAnalyticsRateLimiter();
    const key = createPublicAnalyticsRateLimitKey("whatsapp", "198.51.100.24");

    for (let attempt = 0; attempt < PUBLIC_ANALYTICS_LIMIT; attempt += 1) {
      expect(await limiter.consume(key)).toMatchObject({
        allowed: true,
      });
    }
    expect(await limiter.consume(key)).toMatchObject({
      allowed: false,
    });
  });
});
