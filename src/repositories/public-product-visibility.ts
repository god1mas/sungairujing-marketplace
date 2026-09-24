import {
  MerchantStatus,
  Prisma,
  ProductModerationStatus,
} from "@prisma/client";

export const publicProductEligibility: Prisma.ProductWhereInput = {
  moderationStatus: ProductModerationStatus.ACTIVE,
  merchant: { status: MerchantStatus.ACTIVE },
};

export const publicMerchantEligibility: Prisma.MerchantWhereInput = {
  status: MerchantStatus.ACTIVE,
};
