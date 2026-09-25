import { describe, expect, it } from "vitest";
import { createSecurityHeaders } from "./headers";

const asRecord = (environment: "development" | "production") =>
  Object.fromEntries(
    createSecurityHeaders(environment).map(({ key, value }) => [key, value]),
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

  it("does not force HSTS before the production deployment boundary", () => {
    expect(asRecord("production")).not.toHaveProperty(
      "Strict-Transport-Security",
    );
  });
});
