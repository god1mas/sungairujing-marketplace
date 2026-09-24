import { MerchantOperationalStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { OpeningHours } from "@/features/merchant-profile/profile-schema";

export const findOwnedMerchantProfile = (merchantId: string, userId: string) =>
  prisma.merchant.findFirst({
    where: {
      id: merchantId,
      memberships: { some: { userId, isActive: true } },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoStorageKey: true,
      address: true,
      publicWhatsappNumber: true,
      openingHours: true,
      operationalStatus: true,
      verificationStatus: true,
      status: true,
      memberships: {
        where: { userId, isActive: true },
        take: 1,
        select: { user: { select: { whatsappNumber: true } } },
      },
    },
  });

export const updateOwnedMerchantProfile = (
  merchantId: string,
  input: {
    name: string;
    description: string | null;
    address: string;
    openingHours: OpeningHours;
    operationalStatus: MerchantOperationalStatus;
  },
) =>
  prisma.merchant.updateMany({
    where: { id: merchantId },
    data: {
      ...input,
      openingHours: input.openingHours as Prisma.InputJsonValue,
    },
  });

export const replaceOwnedMerchantLogo = async (
  merchantId: string,
  logoStorageKey: string,
) =>
  prisma.$transaction(async (tx) => {
    const merchant = await tx.merchant.findUnique({
      where: { id: merchantId },
      select: { logoStorageKey: true },
    });
    if (!merchant) return null;
    await tx.merchant.update({
      where: { id: merchantId },
      data: { logoStorageKey },
    });
    return { previousStorageKey: merchant.logoStorageKey };
  });
