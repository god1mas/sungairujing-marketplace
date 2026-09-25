import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publicProductEligibility } from "./public-product-visibility";

export type PublicProductDetailRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Prisma.Decimal;
  unit: string;
  availabilityStatus: "TERSEDIA" | "HABIS";
  category: { name: string; slug: string };
  merchant: {
    id: string;
    name: string;
    slug: string;
    address: string;
    publicWhatsappNumber: string;
  };
  images: { storageKey: string; altText: string | null; isCover: boolean }[];
};

export const findPublicProductBySlug = async (
  slug: string,
): Promise<PublicProductDetailRecord | null> =>
  prisma.product.findFirst({
    where: {
      AND: [publicProductEligibility, { slug }],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      unit: true,
      availabilityStatus: true,
      category: { select: { name: true, slug: true } },
      merchant: {
        select: {
          id: true,
          name: true,
          slug: true,
          address: true,
          publicWhatsappNumber: true,
        },
      },
      images: {
        orderBy: [{ isCover: "desc" }, { sortOrder: "asc" }, { id: "asc" }],
        take: 5,
        select: { storageKey: true, altText: true, isCover: true },
      },
    },
  });
