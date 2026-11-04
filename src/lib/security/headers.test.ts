import { describe, expect, it } from "vitest";
import { createSecurityHeaders } from "./headers";

const asRecord = (
  environment: "development" | "production",
  supabaseUrl?: string,
) =>
  Object.fromEntries(
    createSecurityHeaders(environment, supabaseUrl).map(({ key, value }) => [
      key,
      value,
    ]),
  );

describe("security response headers", () => {
  it("sets the documented browser protections and denies framing", () => {
    const headers = asRecord("production");

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Content-Security-Policy"]).toContain(
      "frame-ancestors 'none'",
    );
    expect(headers["Content-Security-Policy"]).toContain("object-src 'none'");
  });

  it("keeps development HMR compatible without weakening production scripts", () => {
    expect(asRecord("development")["Content-Security-Policy"]).toContain(
      "'unsafe-eval'",
    );
    expect(asRecord("development")["Content-Security-Policy"]).toContain(
      "ws: wss:",
    );
    expect(asRecord("production")["Content-Security-Policy"]).not.toContain(
      "'unsafe-eval'",
    );
    expect(asRecord("production")["Content-Security-Policy"]).not.toContain(
      "ws: wss:",
    );
  });

  it("allows only the configured loopback Supabase origin for development images", () => {
    const policy = asRecord("development", "http://127.0.0.1:54321")[
      "Content-Security-Policy"
    ];

    expect(policy).toContain(
      "img-src 'self' data: blob: https: http://127.0.0.1:54321",
    );
    expect(policy).not.toMatch(/img-src[^;]*\shttp:(?:\s|;|$)/);
    expect(policy).not.toContain("*");
  });

  it("never adds a local Storage HTTP origin to the production policy", () => {
    const policy = asRecord("production", "http://127.0.0.1:54321")[
      "Content-Security-Policy"
    ];

    expect(policy).not.toContain("http://127.0.0.1:54321");
  });

  it("rejects non-loopback HTTP Storage origins in development", () => {
    const policy = asRecord("development", "http://storage.example.test")[
      "Content-Security-Policy"
    ];

    expect(policy).not.toContain("http://storage.example.test");
  });

  it("does not force HSTS before the production deployment boundary", () => {
    expect(asRecord("production")).not.toHaveProperty(
      "Strict-Transport-Security",
    );
  });
});
