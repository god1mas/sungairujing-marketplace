import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password utilities", () => {
  it("hashes and verifies passwords with Argon2id", async () => {
    const password = "rahasia-development";
    const passwordHash = await hashPassword(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    await expect(verifyPassword(passwordHash, password)).resolves.toBe(true);
    await expect(verifyPassword(passwordHash, "password-salah")).resolves.toBe(
      false,
    );
  });

  it("fails closed for malformed hashes", async () => {
    await expect(verifyPassword("bukan-hash", "password")).resolves.toBe(false);
  });
});
