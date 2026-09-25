import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireAuthenticatedUser: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("@/lib/auth/authorization", () => ({
  requireAuthenticatedUser: mocks.requireAuthenticatedUser,
  UnauthenticatedError: class UnauthenticatedError extends Error {},
}));
vi.mock("@/services/account-security-service", () => ({
  changePassword: mocks.changePassword,
}));

import { changePasswordAction } from "./change-password";
import { initialChangePasswordActionState } from "./change-password-state";

const formData = () => {
  const data = new FormData();
  data.set("currentPassword", "password-lama");
  data.set("newPassword", "password-baru");
  data.set("userId", "attacker-selected-user");
  return data;
};

describe("changePasswordAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects unauthenticated requests before the service", async () => {
    const { UnauthenticatedError } = await import("@/lib/auth/authorization");
    mocks.requireAuthenticatedUser.mockRejectedValue(
      new UnauthenticatedError(),
    );

    await expect(
      changePasswordAction(initialChangePasswordActionState, formData()),
    ).resolves.toEqual({
      success: false,
      message: "Sesi tidak valid. Silakan login kembali.",
    });
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("uses the authenticated user ID and ignores client-selected targets", async () => {
    mocks.requireAuthenticatedUser.mockResolvedValue({ id: "session-user" });
    mocks.changePassword.mockResolvedValue({ success: true });

    await expect(
      changePasswordAction(initialChangePasswordActionState, formData()),
    ).resolves.toEqual({
      success: true,
      message: "Password berhasil diperbarui. Silakan login kembali.",
    });
    expect(mocks.changePassword).toHaveBeenCalledWith("session-user", {
      currentPassword: "password-lama",
      newPassword: "password-baru",
    });
  });
});
