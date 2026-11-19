import { GlobalUserRole } from "@prisma/client";
import { prisma } from "../src/lib/db/prisma";
import {
  AdminUsernameProvisioningError,
  provisionAdminUsername,
} from "../src/services/admin-username-provisioning-service";

const EXPECTED_USERNAME = "admin_sungairujing";

const main = async () => {
  const userId = process.env.ADMIN_USER_ID?.trim();
  if (!userId) {
    throw new AdminUsernameProvisioningError(
      "ADMIN_USER_ID wajib berisi User.id Super Admin yang sudah diverifikasi.",
    );
  }

  const result = await provisionAdminUsername(
    { userId, username: EXPECTED_USERNAME },
    {
      findUserById: (id) =>
        prisma.user.findUnique({
          where: { id },
          select: { id: true, globalRole: true, adminUsername: true },
        }),
      findUserByUsername: (adminUsername) =>
        prisma.user.findUnique({
          where: { adminUsername },
          select: { id: true },
        }),
      setUsernameIfUnset: async ({ id, username }) => {
        const result = await prisma.user.updateMany({
          where: {
            id,
            globalRole: GlobalUserRole.SUPER_ADMIN,
            adminUsername: null,
          },
          data: { adminUsername: username },
        });
        return result.count === 1;
      },
    },
  );

  console.info(
    result === "updated"
      ? "Username Super Admin berhasil dipasang pada akun yang sudah ada."
      : "Username Super Admin sudah terpasang; tidak ada perubahan.",
  );
};

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof AdminUsernameProvisioningError
        ? error.message
        : "Provisioning username Super Admin gagal.",
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
