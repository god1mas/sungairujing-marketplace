import { GlobalUserRole } from "@prisma/client";
import {
  isValidAdminUsername,
  normalizeAdminUsername,
} from "@/lib/auth/admin-username";

type ExistingAdmin = {
  id: string;
  globalRole: GlobalUserRole;
  adminUsername: string | null;
};

export type AdminUsernameProvisioningDependencies = {
  findUserById: (id: string) => Promise<ExistingAdmin | null>;
  findUserByUsername: (username: string) => Promise<{ id: string } | null>;
  setUsernameIfUnset: (input: {
    id: string;
    username: string;
  }) => Promise<boolean>;
};

export class AdminUsernameProvisioningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminUsernameProvisioningError";
  }
}

export const provisionAdminUsername = async (
  input: { userId: string; username: string },
  dependencies: AdminUsernameProvisioningDependencies,
): Promise<"updated" | "already-set"> => {
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      input.userId,
    )
  ) {
    throw new AdminUsernameProvisioningError("ADMIN_USER_ID tidak valid.");
  }

  const username = normalizeAdminUsername(input.username);
  if (!isValidAdminUsername(username)) {
    throw new AdminUsernameProvisioningError("ADMIN_USERNAME tidak valid.");
  }

  const user = await dependencies.findUserById(input.userId);
  if (!user || user.globalRole !== GlobalUserRole.SUPER_ADMIN) {
    throw new AdminUsernameProvisioningError(
      "User.id tidak menunjuk akun Super Admin yang terverifikasi.",
    );
  }

  if (user.adminUsername === username) {
    return "already-set";
  }

  if (user.adminUsername !== null) {
    throw new AdminUsernameProvisioningError(
      "Akun Super Admin sudah memiliki username lain; perubahan otomatis ditolak.",
    );
  }

  const owner = await dependencies.findUserByUsername(username);
  if (owner) {
    throw new AdminUsernameProvisioningError(
      "Username sudah digunakan oleh akun lain.",
    );
  }

  const updated = await dependencies.setUsernameIfUnset({
    id: user.id,
    username,
  });
  if (!updated) {
    throw new AdminUsernameProvisioningError(
      "Akun berubah saat provisioning; ulangi verifikasi User.id.",
    );
  }

  return "updated";
};
