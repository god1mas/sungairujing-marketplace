import { describe, expect, it } from "vitest";
import {
  createInMemoryLoginRateLimiter,
  createLoginRateLimitKey,
  createProductionLoginRateLimiter,
  LOGIN_ATTEMPT_LIMIT,
} from "./login";

describe("login rate limiter", () => {
  it("blocks a key after five failures and resets after the window", async () => {
    let currentTime = 0;
    const limiter = createInMemoryLoginRateLimiter(() => currentTime);
    const key = "auth:login:test";

    for (let attempt = 1; attempt <= LOGIN_ATTEMPT_LIMIT; attempt += 1) {
      expect(await limiter.isAllowed(key)).toBe(true);
      await limiter.recordFailure(key);
    }

    expect(await limiter.isAllowed(key)).toBe(false);
    currentTime = 15 * 60 * 1000;
    expect(await limiter.isAllowed(key)).toBe(true);
  });

  it("hashes identifier and IP instead of retaining plaintext PII", () => {
    const key = createLoginRateLimitKey({
      identifier: "6281234567890",
      ipAddress: "203.0.113.10",
    });

    expect(key).toMatch(/^auth:login:[a-f0-9]{64}$/);
    expect(key).not.toContain("6281234567890");
    expect(key).not.toContain("203.0.113.10");
  });

  it("fails safe when production Upstash configuration is missing", () => {
    expect(() => createProductionLoginRateLimiter({})).toThrow(
      "Konfigurasi Upstash wajib tersedia",
    );
  });
});
