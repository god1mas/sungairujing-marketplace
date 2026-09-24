import { describe, expect, it, vi } from "vitest";
import { changePassword } from "./account-security-service";

const input = {
  currentPassword: "password-lama",
  newPassword: "password-baru",
};

describe("changePassword", () => {
  it("verifies, hashes, and updates only the authenticated user", async () => {
    const verify = vi.fn().mockResolvedValue(true);
    const hash = vi.fn().mockResolvedValue("$argon2id$new-secure-hash");
    const replacePassword = vi.fn().mockResolvedValue(true);
    const changedAt = new Date("2026-09-24T02:00:00.000Z");

    await expect(
      changePassword("authenticated-user", input, {
        findAccount: vi.fn().mockResolvedValue({
          id: "authenticated-user",
          passwordHash: "$argon2id$old-secure-hash",
        }),
        verify,
        hash,
        replacePassword,
        now: () => changedAt,
      }),
    ).resolves.toEqual({ success: true });

    expect(verify).toHaveBeenCalledWith(
      "$argon2id$old-secure-hash",
      "password-lama",
    );
    expect(hash).toHaveBeenCalledWith("password-baru");
    expect(replacePassword).toHaveBeenCalledWith({
      userId: "authenticated-user",
      expectedPasswordHash: "$argon2id$old-secure-hash",
      newPasswordHash: "$argon2id$new-secure-hash",
      changedAt,
    });
    expect(JSON.stringify(replacePassword.mock.calls)).not.toContain(
      "password-baru",
    );
  });

  it("rejects an incorrect current password without writing", async () => {
    const replacePassword = vi.fn();
    const result = await changePassword("authenticated-user", input, {
      findAccount: vi.fn().mockResolvedValue({
        id: "authenticated-user",
        passwordHash: "$argon2id$old-secure-hash",
      }),
      verify: vi.fn().mockResolvedValue(false),
      replacePassword,
    });

    expect(result).toEqual({
      success: false,
      message: "Password lama tidak sesuai.",
      fieldErrors: { currentPassword: ["Password lama tidak sesuai."] },
    });
    expect(replacePassword).not.toHaveBeenCalled();
  });

  it("rejects an invalid new password before reading the account", async () => {
    const findAccount = vi.fn();
    const result = await changePassword(
      "authenticated-user",
      { ...input, newPassword: "pendek" },
      { findAccount },
    );

    expect(result.success).toBe(false);
    expect(findAccount).not.toHaveBeenCalled();
  });

  it("returns a safe error when the conditional update loses a race", async () => {
    const result = await changePassword("authenticated-user", input, {
      findAccount: vi.fn().mockResolvedValue({
        id: "authenticated-user",
        passwordHash: "$argon2id$old-secure-hash",
      }),
      verify: vi.fn().mockResolvedValue(true),
      hash: vi.fn().mockResolvedValue("$argon2id$new-secure-hash"),
      replacePassword: vi.fn().mockResolvedValue(false),
    });

    expect(result).toEqual({
      success: false,
      message: "Password tidak dapat diperbarui. Silakan login kembali.",
    });
  });

  it("does not expose raw repository errors or hashes", async () => {
    const result = await changePassword("authenticated-user", input, {
      findAccount: vi
        .fn()
        .mockRejectedValue(new Error("database secret $argon2id$hash")),
    });

    expect(result).toEqual({
      success: false,
      message: "Password belum berhasil diperbarui. Silakan coba lagi.",
    });
  });
});
