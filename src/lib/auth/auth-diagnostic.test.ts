import { describe, expect, it, vi } from "vitest";
import { logAuthDiagnostic } from "./auth-diagnostic";

describe("auth diagnostic logging", () => {
  it("is disabled unless explicitly enabled", () => {
    const logger = vi.fn();

    logAuthDiagnostic("user-found", {}, logger);
    logAuthDiagnostic(
      "user-found",
      { AUTH_DIAGNOSTIC_LOGGING: "false" },
      logger,
    );

    expect(logger).not.toHaveBeenCalled();
  });

  it("logs only a fixed categorical stage when enabled", () => {
    const logger = vi.fn();

    logAuthDiagnostic(
      "password-verify-exception",
      { AUTH_DIAGNOSTIC_LOGGING: "true" },
      logger,
    );

    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] password-verify-exception",
    );
    const output = JSON.stringify(logger.mock.calls);
    expect(output).not.toContain("whatsappNumber");
    expect(output).not.toContain("passwordHash");
    expect(output).not.toContain("AUTH_SECRET");
    expect(output).not.toContain("DATABASE_URL");
  });
});
