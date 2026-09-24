import {
  MerchantStatus,
  Prisma,
  ProductModerationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type CheckoutProductRecord = {
  id: string;
  name: string;
  price: Prisma.Decimal;
  unit: string;
  availabilityStatus: "TERSEDIA" | "HABIS";
  moderationStatus: "ACTIVE" | "SUSPENDED";
  merchant: {
    id: string;
    name: string;
    slug: string;
    publicWhatsappNumber: string;
    status: "ACTIVE" | "SUSPENDED";
  };
  images: { storageKey: string; altText: string | null }[];
};

export const findProductsForCartValidation = async (
  productIds: string[],
): Promise<CheckoutProductRecord[]> =>
  prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true,
      name: true,
      price: true,
      unit: true,
      availabilityStatus: true,
      moderationStatus: true,
      merchant: {
        select: {
          id: true,
          name: true,
          slug: true,
          publicWhatsappNumber: true,
          status: true,
        },
      },
      images: {
        where: { isCover: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { storageKey: true, altText: true },
      },
    },
  });

export const isCheckoutProductPublic = (record: CheckoutProductRecord) =>
  record.moderationStatus === ProductModerationStatus.ACTIVE &&
  record.merchant.status === MerchantStatus.ACTIVE;
