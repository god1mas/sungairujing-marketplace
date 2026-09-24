import {
  MerchantStatus,
  Prisma,
  ProductModerationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CatalogQuery } from "@/features/catalog/catalog-query";
import { publicProductEligibility } from "./public-product-visibility";

export type PublicCatalogRecord = {
  id: string;
  name: string;
  slug: string;
  price: Prisma.Decimal;
  unit: string;
  availabilityStatus: "TERSEDIA" | "HABIS";
  merchant: { name: string; slug: string };
  images: { storageKey: string; altText: string | null }[];
};

export type PublicCatalogFilterOptions = {
  categories: { name: string; slug: string }[];
  merchants: { name: string; slug: string }[];
};

const createCatalogWhere = (query: CatalogQuery): Prisma.ProductWhereInput => ({
  AND: [
    publicProductEligibility,
    {
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
              {
                merchant: { name: { contains: query.q, mode: "insensitive" } },
              },
              {
                merchant: {
                  description: { contains: query.q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.merchant ? { merchant: { slug: query.merchant } } : {}),
      ...(query.availability ? { availabilityStatus: query.availability } : {}),
      ...(query.minPrice || query.maxPrice
        ? {
            price: {
              ...(query.minPrice ? { gte: query.minPrice } : {}),
              ...(query.maxPrice ? { lte: query.maxPrice } : {}),
            },
          }
        : {}),
    },
  ],
});

const createCatalogOrder = (
  sort: CatalogQuery["sort"],
): Prisma.ProductOrderByWithRelationInput[] => {
  if (sort === "price_asc") return [{ price: "asc" }, { id: "asc" }];
  if (sort === "price_desc") return [{ price: "desc" }, { id: "asc" }];
  return [{ createdAt: "desc" }, { id: "asc" }];
};

export const findPublicCatalog = async ({
  query,
  pageSize,
}: {
  query: CatalogQuery;
  pageSize: number;
}): Promise<{ products: PublicCatalogRecord[]; total: number }> => {
  const where = createCatalogWhere(query);
  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy: createCatalogOrder(query.sort),
      skip: (query.page - 1) * pageSize,
      take: pageSize,
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
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
};

export const findPublicCatalogFilterOptions =
  async (): Promise<PublicCatalogFilterOptions> => {
    const [categories, merchants] = await prisma.$transaction([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { name: true, slug: true },
      }),
      prisma.merchant.findMany({
        where: {
          status: MerchantStatus.ACTIVE,
          products: {
            some: { moderationStatus: ProductModerationStatus.ACTIVE },
          },
        },
        orderBy: { name: "asc" },
        select: { name: true, slug: true },
      }),
    ]);

    return { categories, merchants };
  };
