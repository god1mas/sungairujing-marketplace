import { prisma } from "../src/lib/db/prisma";
import {
  bootstrapSuperAdmin,
  SuperAdminBootstrapError,
} from "../src/services/super-admin-bootstrap-service";

const main = async () => {
  const result = await bootstrapSuperAdmin(
    {
      SEED_ADMIN_WHATSAPP: process.env.SEED_ADMIN_WHATSAPP,
      SEED_ADMIN_PASSWORD: process.env.SEED_ADMIN_PASSWORD,
    },
    {
      findUserByWhatsapp: (whatsappNumber) =>
        prisma.user.findUnique({
          where: { whatsappNumber },
          select: { id: true, globalRole: true },
        }),
      createUser: (data) =>
        prisma.user.create({
          data,
          select: { id: true },
        }),
    },
  );

  console.info(
    result.status === "created"
      ? "Super Admin production berhasil dibuat."
      : "Super Admin production sudah tersedia; tidak ada perubahan.",
  );
};

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof SuperAdminBootstrapError
        ? error.message
        : "Bootstrap Super Admin production gagal.",
    );
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
