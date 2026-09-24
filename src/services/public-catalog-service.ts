import "server-only";

import { createSupabaseStorage } from "@/lib/storage/supabase";
import {
  findPublicCatalog,
  findPublicCatalogFilterOptions,
  type PublicCatalogFilterOptions,
} from "@/repositories/public-catalog-repository";
import {
  CATALOG_PAGE_SIZE,
  type CatalogQuery,
} from "@/features/catalog/catalog-query";

export type PublicProductCard = {
  id: string;
  name: string;
  slug: string;
  price: string;
  unit: string;
  availability: "TERSEDIA" | "HABIS";
  merchant: { name: string; slug: string };
  image: { url: string; alt: string } | null;
};

export type PublicCatalog = {
  products: PublicProductCard[];
  total: number;
  totalPages: number;
  page: number;
};

type CatalogRepository = typeof findPublicCatalog;
type ImageUrlResolver = (storageKey: string) => string | null;

export const resolvePublicImageUrl: ImageUrlResolver = (storageKey) => {
  try {
    return createSupabaseStorage().getPublicUrl({
      bucket: "publicMedia",
      path: storageKey,
    });
  } catch {
    return null;
  }
};

export const getPublicCatalog = async (
  query: CatalogQuery,
  dependencies: {
    findCatalog?: CatalogRepository;
    resolveImageUrl?: ImageUrlResolver;
  } = {},
): Promise<PublicCatalog> => {
  const result = await (dependencies.findCatalog ?? findPublicCatalog)({
    query,
    pageSize: CATALOG_PAGE_SIZE,
  });
  const imageUrl = dependencies.resolveImageUrl ?? resolvePublicImageUrl;

  return {
    total: result.total,
    totalPages: Math.ceil(result.total / CATALOG_PAGE_SIZE),
    page: query.page,
    products: result.products.map((product) => {
      const cover = product.images[0];
      const url = cover ? imageUrl(cover.storageKey) : null;
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price.toFixed(2),
        unit: product.unit,
        availability: product.availabilityStatus,
        merchant: product.merchant,
        image: url
          ? { url, alt: cover?.altText ?? `Foto ${product.name}` }
          : null,
      };
    }),
  };
};

export const getPublicCatalogFilterOptions = async (
  findOptions: () => Promise<PublicCatalogFilterOptions> = findPublicCatalogFilterOptions,
) => findOptions();
