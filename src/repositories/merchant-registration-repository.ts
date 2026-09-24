import {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantOperationalStatus,
  MerchantStatus,
  MerchantVerificationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type CreateMerchantRegistrationInput = {
  ownerName: string;
  merchantName: string;
  merchantSlugBase: string;
  whatsappNumber: string;
  passwordHash: string;
  merchantAddress: string;
  termsAcceptedAt: Date;
};

export type MerchantRegistrationRecord = {
  userId: string;
  merchantId: string;
};

const findAvailableMerchantSlug = async (
  transaction: Prisma.TransactionClient,
  base: string,
): Promise<string> => {
  const matching = await transaction.merchant.findMany({
    where: { slug: { startsWith: base } },
    select: { slug: true },
  });
  const existing = new Set(matching.map(({ slug }) => slug));

  if (!existing.has(base)) {
    return base;
  }

  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
};

export const createMerchantRegistration = async (
  input: CreateMerchantRegistrationInput,
): Promise<MerchantRegistrationRecord> => {
  return prisma.$transaction(async (transaction) => {
    const slug = await findAvailableMerchantSlug(
      transaction,
      input.merchantSlugBase,
    );
    const user = await transaction.user.create({
      data: {
        name: input.ownerName,
        whatsappNumber: input.whatsappNumber,
        passwordHash: input.passwordHash,
        globalRole: GlobalUserRole.USER,
        termsAcceptedAt: input.termsAcceptedAt,
      },
      select: { id: true },
    });
    const merchant = await transaction.merchant.create({
      data: {
        name: input.merchantName,
        slug,
        address: input.merchantAddress,
        publicWhatsappNumber: input.whatsappNumber,
        operationalStatus: MerchantOperationalStatus.BUKA,
        status: MerchantStatus.ACTIVE,
        verificationStatus: MerchantVerificationStatus.BELUM_DIVERIFIKASI,
      },
      select: { id: true },
    });

    await transaction.merchantMembership.create({
      data: {
        userId: user.id,
        merchantId: merchant.id,
        role: MerchantMembershipRole.OWNER,
        isActive: true,
      },
    });

    return { userId: user.id, merchantId: merchant.id };
  });
};

export const isWhatsappUniqueConstraintError = (error: unknown): boolean => {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error) ||
    error.code !== "P2002" ||
    !("meta" in error)
  ) {
    return false;
  }

  const target = (error.meta as { target?: unknown } | undefined)?.target;
  return (
    Array.isArray(target) &&
    target.some(
      (field) => field === "whatsapp_number" || field === "whatsappNumber",
    )
  );
};
