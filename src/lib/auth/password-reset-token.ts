import { createHash, randomBytes } from "node:crypto";

export const PASSWORD_RESET_TOKEN_LIFETIME_MS = 15 * 60 * 1000;

export type PasswordResetTokenMaterial = {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
};

export const hashPasswordResetToken = (rawToken: string): string =>
  createHash("sha256").update(rawToken).digest("hex");

export const createPasswordResetTokenMaterial = (
  now: () => number = Date.now,
): PasswordResetTokenMaterial => {
  const rawToken = randomBytes(32).toString("base64url");

  return {
    rawToken,
    tokenHash: hashPasswordResetToken(rawToken),
    expiresAt: new Date(now() + PASSWORD_RESET_TOKEN_LIFETIME_MS),
  };
};
