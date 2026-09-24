import { describe, expect, it } from "vitest";
import {
  createPasswordResetTokenMaterial,
  hashPasswordResetToken,
  PASSWORD_RESET_TOKEN_LIFETIME_MS,
} from "./password-reset-token";

describe("password reset token preparation", () => {
  it("creates unique cryptographic tokens, stores only a hash, and expires in 15 minutes", () => {
    const now = Date.parse("2026-09-24T00:00:00.000Z");
    const first = createPasswordResetTokenMaterial(() => now);
    const second = createPasswordResetTokenMaterial(() => now);

    expect(first.rawToken).not.toBe(second.rawToken);
    expect(first.rawToken.length).toBeGreaterThanOrEqual(40);
    expect(first.tokenHash).toBe(hashPasswordResetToken(first.rawToken));
    expect(first.tokenHash).not.toContain(first.rawToken);
    expect(first.expiresAt.getTime()).toBe(
      now + PASSWORD_RESET_TOKEN_LIFETIME_MS,
    );
  });
});
