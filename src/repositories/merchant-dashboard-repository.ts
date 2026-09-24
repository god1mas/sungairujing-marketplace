import { ProductAvailability, ProductModerationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type MerchantDashboardProductCounts = {
  totalProducts: number;
  availableProducts: number;
  suspendedProducts: number;
};

export const countMerchantDashboardProducts = async (
  merchantId: string,
): Promise<MerchantDashboardProductCounts> => {
  const [totalProducts, availableProducts, suspendedProducts] =
    await Promise.all([
      prisma.product.count({ where: { merchantId } }),
      prisma.product.count({
        where: {
          merchantId,
          availabilityStatus: ProductAvailability.TERSEDIA,
        },
      }),
      prisma.product.count({
        where: {
          merchantId,
          moderationStatus: ProductModerationStatus.SUSPENDED,
        },
      }),
    ]);

  return { totalProducts, availableProducts, suspendedProducts };
};
