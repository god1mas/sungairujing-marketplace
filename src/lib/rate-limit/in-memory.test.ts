import { afterEach, describe, expect, it, vi } from "vitest";
import { createDevelopmentRateLimiter } from "./in-memory";

describe("development rate limiter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("limits attempts per key within the configured window", () => {
    let currentTime = 0;
    const limiter = createDevelopmentRateLimiter({
      limit: 2,
      windowMs: 1_000,
      now: () => currentTime,
    });

    expect(limiter.consume("login:identifier:ip").allowed).toBe(true);
    expect(limiter.consume("login:identifier:ip").allowed).toBe(true);
    expect(limiter.consume("login:identifier:ip").allowed).toBe(false);

    currentTime = 1_000;
    expect(limiter.consume("login:identifier:ip").allowed).toBe(true);
  });

  it("refuses production usage", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(() =>
      createDevelopmentRateLimiter({ limit: 5, windowMs: 900_000 }),
    ).toThrow("tidak boleh digunakan di production");
  });
});
