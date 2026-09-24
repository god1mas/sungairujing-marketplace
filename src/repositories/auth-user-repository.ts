import type { GlobalUserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AuthUserRecord = {
  id: string;
  name: string;
  whatsappNumber: string;
  passwordHash: string;
  globalRole: GlobalUserRole;
  isActive: boolean;
  updatedAt: Date;
};

export const findAuthUserByWhatsapp = async (
  whatsappNumber: string,
): Promise<AuthUserRecord | null> => {
  return prisma.user.findUnique({
    where: { whatsappNumber },
    select: {
      id: true,
      name: true,
      whatsappNumber: true,
      passwordHash: true,
      globalRole: true,
      isActive: true,
      updatedAt: true,
    },
  });
};
