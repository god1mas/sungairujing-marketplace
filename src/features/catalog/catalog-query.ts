import { ProductAvailability } from "@prisma/client";
import { z } from "zod";

export const CATALOG_PAGE_SIZE = 20;

export const catalogSortValues = ["newest", "price_asc", "price_desc"] as const;

export type CatalogSort = (typeof catalogSortValues)[number];

const firstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const optionalText = z.string().trim().max(100).optional().catch(undefined);
const optionalSlug = z
  .string()
  .trim()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .optional()
  .catch(undefined);
const optionalPrice = z
  .string()
  .trim()
  .regex(/^\d{1,12}(?:\.\d{1,2})?$/)
  .optional()
  .catch(undefined);

const catalogQuerySchema = z.object({
  q: optionalText,
  category: optionalSlug,
  merchant: optionalSlug,
  availability: z
    .enum([ProductAvailability.TERSEDIA, ProductAvailability.HABIS])
    .optional()
    .catch(undefined),
  minPrice: optionalPrice,
  maxPrice: optionalPrice,
  sort: z.enum(catalogSortValues).default("newest").catch("newest"),
  page: z.coerce.number().int().positive().default(1).catch(1),
});

export type CatalogQuery = z.infer<typeof catalogQuerySchema>;
export type CatalogSearchParams = Record<string, string | string[] | undefined>;

export const parseCatalogQuery = (
  searchParams: CatalogSearchParams,
): CatalogQuery => {
  const parsed = catalogQuerySchema.parse({
    q: firstValue(searchParams.q),
    category: firstValue(searchParams.category),
    merchant: firstValue(searchParams.merchant),
    availability: firstValue(searchParams.availability)?.toUpperCase(),
    minPrice: firstValue(searchParams.minPrice),
    maxPrice: firstValue(searchParams.maxPrice),
    sort: firstValue(searchParams.sort),
    page: firstValue(searchParams.page),
  });

  if (
    parsed.minPrice !== undefined &&
    parsed.maxPrice !== undefined &&
    Number(parsed.minPrice) > Number(parsed.maxPrice)
  ) {
    return { ...parsed, minPrice: undefined, maxPrice: undefined };
  }

  return parsed;
};

export const createCatalogHref = (
  query: CatalogQuery,
  overrides: Partial<Record<keyof CatalogQuery, string | number | undefined>>,
): string => {
  const values = { ...query, ...overrides };
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(values)) {
    if (
      value !== undefined &&
      value !== "" &&
      !(key === "page" && value === 1) &&
      !(key === "sort" && value === "newest")
    ) {
      params.set(key, String(value).toLowerCase());
    }
  }

  const serialized = params.toString();
  return serialized ? `/products?${serialized}` : "/products";
};
