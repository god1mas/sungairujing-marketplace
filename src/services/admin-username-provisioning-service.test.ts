import { GlobalUserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  AdminUsernameProvisioningError,
  provisionAdminUsername,
  type AdminUsernameProvisioningDependencies,
} from "./admin-username-provisioning-service";

const adminId = "00000000-0000-4000-8000-000000000001";

const dependencies = (
  overrides: Partial<AdminUsernameProvisioningDependencies> = {},
): AdminUsernameProvisioningDependencies => ({
  findUserById: vi.fn().mockResolvedValue({
    id: adminId,
    globalRole: GlobalUserRole.SUPER_ADMIN,
    adminUsername: null,
  }),
  findUserByUsername: vi.fn().mockResolvedValue(null),
  setUsernameIfUnset: vi.fn().mockResolvedValue(true),
  ...overrides,
});

describe("provisionAdminUsername", () => {
  it("updates only the explicitly verified existing admin ID", async () => {
    const deps = dependencies();
    await expect(
      provisionAdminUsername(
        { userId: adminId, username: " ADMIN_SUNGAIRUJING " },
        deps,
      ),
    ).resolves.toBe("updated");
    expect(deps.findUserById).toHaveBeenCalledWith(adminId);
    expect(deps.setUsernameIfUnset).toHaveBeenCalledWith({
      id: adminId,
      username: "admin_sungairujing",
    });
  });

  it("is idempotent and never rewrites an existing username", async () => {
    const deps = dependencies({
      findUserById: vi.fn().mockResolvedValue({
        id: adminId,
        globalRole: GlobalUserRole.SUPER_ADMIN,
        adminUsername: "admin_sungairujing",
      }),
    });
    await expect(
      provisionAdminUsername(
        { userId: adminId, username: "admin_sungairujing" },
        deps,
      ),
    ).resolves.toBe("already-set");
    expect(deps.setUsernameIfUnset).not.toHaveBeenCalled();
  });

  it.each([
    null,
    { id: adminId, globalRole: GlobalUserRole.USER, adminUsername: null },
  ])(
    "rejects an absent or merchant user without promoting it",
    async (user) => {
      const deps = dependencies({
        findUserById: vi.fn().mockResolvedValue(user),
      });
      await expect(
        provisionAdminUsername(
          { userId: adminId, username: "admin_sungairujing" },
          deps,
        ),
      ).rejects.toBeInstanceOf(AdminUsernameProvisioningError);
      expect(deps.setUsernameIfUnset).not.toHaveBeenCalled();
    },
  );

  it("rejects invalid ID, invalid username, collision, and conflicting existing value", async () => {
    const deps = dependencies();
    await expect(
      provisionAdminUsername(
        { userId: "not-a-uuid", username: "admin_sungairujing" },
        deps,
      ),
    ).rejects.toThrow("ADMIN_USER_ID tidak valid.");
    await expect(
      provisionAdminUsername({ userId: adminId, username: "bad name" }, deps),
    ).rejects.toThrow("ADMIN_USERNAME tidak valid.");
    await expect(
      provisionAdminUsername(
        { userId: adminId, username: "admin_sungairujing" },
        dependencies({
          findUserByUsername: vi.fn().mockResolvedValue({ id: "another-id" }),
        }),
      ),
    ).rejects.toThrow("Username sudah digunakan");
    await expect(
      provisionAdminUsername(
        { userId: adminId, username: "admin_sungairujing" },
        dependencies({
          findUserById: vi.fn().mockResolvedValue({
            id: adminId,
            globalRole: GlobalUserRole.SUPER_ADMIN,
            adminUsername: "another_name",
          }),
        }),
      ),
    ).rejects.toThrow("username lain");
  });

  it("rejects a race rather than silently claiming success", async () => {
    await expect(
      provisionAdminUsername(
        { userId: adminId, username: "admin_sungairujing" },
        dependencies({ setUsernameIfUnset: vi.fn().mockResolvedValue(false) }),
      ),
    ).rejects.toThrow("Akun berubah");
  });
});
