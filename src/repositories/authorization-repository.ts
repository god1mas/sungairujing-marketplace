import type {
  GlobalUserRole,
  MerchantMembershipRole,
  MerchantStatus,
  MerchantVerificationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type AuthorizationUserRecord = {
  id: string;
  globalRole: GlobalUserRole;
  isActive: boolean;
  updatedAt: Date;
};

export type ActiveMerchantMembershipRecord = {
  id: string;
  userId: string;
  merchantId: string;
  role: MerchantMembershipRole;
  merchant: {
    status: MerchantStatus;
    verificationStatus: MerchantVerificationStatus;
    suspensionReason: string | null;
  };
};

export const findAuthorizationUserById = async (
  userId: string,
): Promise<AuthorizationUserRecord | null> =>
  prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      globalRole: true,
      isActive: true,
      updatedAt: true,
    },
  });

export const findActiveMerchantMembership = async ({
  userId,
  merchantId,
  roles,
}: {
  userId: string;
  merchantId?: string;
  roles?: MerchantMembershipRole[];
}): Promise<ActiveMerchantMembershipRecord | null> =>
  prisma.merchantMembership.findFirst({
    where: {
      userId,
      isActive: true,
      ...(merchantId ? { merchantId } : {}),
      ...(roles?.length ? { role: { in: roles } } : {}),
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      merchantId: true,
      role: true,
      merchant: {
        select: {
          status: true,
          verificationStatus: true,
          suspensionReason: true,
        },
      },
    },
  });
