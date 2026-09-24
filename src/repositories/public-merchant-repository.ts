import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  publicMerchantEligibility,
  publicProductEligibility,
} from "./public-product-visibility";

export type PublicMerchantSummaryRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoStorageKey: string | null;
  address: string;
  operationalStatus: "BUKA" | "TUTUP" | "LIBUR_SEMENTARA";
  verificationStatus: "BELUM_DIVERIFIKASI" | "TERVERIFIKASI" | "DITOLAK";
};

export type PublicMerchantDetailRecord = PublicMerchantSummaryRecord & {
  publicWhatsappNumber: string;
  openingHours: Prisma.JsonValue | null;
  products: {
    id: string;
    name: string;
    slug: string;
    price: Prisma.Decimal;
    unit: string;
    availabilityStatus: "TERSEDIA" | "HABIS";
    merchant: { name: string; slug: string };
    images: { storageKey: string; altText: string | null }[];
  }[];
};

const merchantSummarySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  logoStorageKey: true,
  address: true,
  operationalStatus: true,
  verificationStatus: true,
} satisfies Prisma.MerchantSelect;

export const findPublicMerchants = async (): Promise<
  PublicMerchantSummaryRecord[]
> =>
  prisma.merchant.findMany({
    where: publicMerchantEligibility,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: merchantSummarySelect,
  });

export const findPublicMerchantBySlug = async (
  slug: string,
): Promise<PublicMerchantDetailRecord | null> =>
  prisma.merchant.findFirst({
    where: { AND: [publicMerchantEligibility, { slug }] },
    select: {
      ...merchantSummarySelect,
      publicWhatsappNumber: true,
      openingHours: true,
      products: {
        where: publicProductEligibility,
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: 20,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          unit: true,
          availabilityStatus: true,
          merchant: { select: { name: true, slug: true } },
          images: {
            where: { isCover: true },
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { storageKey: true, altText: true },
          },
        },
      },
    },
  });
