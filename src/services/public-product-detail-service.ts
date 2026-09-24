import "server-only";

import {
  findPublicProductBySlug,
  type PublicProductDetailRecord,
} from "@/repositories/public-product-detail-repository";
import { resolvePublicImageUrl } from "./public-catalog-service";

export type PublicProductDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: string;
  availability: "TERSEDIA" | "HABIS";
  category: { name: string; slug: string };
  merchant: { name: string; slug: string; address: string };
  images: { url: string; alt: string; isCover: boolean }[];
};

type DetailRepository = (
  slug: string,
) => Promise<PublicProductDetailRecord | null>;
type ImageUrlResolver = (storageKey: string) => string | null;

export const isSafeProductSlug = (slug: string): boolean =>
  slug.length > 0 &&
  slug.length <= 160 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

export const getPublicProductDetail = async (
  slug: string,
  dependencies: {
    findProduct?: DetailRepository;
    resolveImageUrl?: ImageUrlResolver;
  } = {},
): Promise<PublicProductDetail | null> => {
  if (!isSafeProductSlug(slug)) return null;

  const record = await (dependencies.findProduct ?? findPublicProductBySlug)(
    slug,
  );
  if (!record) return null;

  const imageUrl = dependencies.resolveImageUrl ?? resolvePublicImageUrl;
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    price: record.price.toFixed(2),
    unit: record.unit,
    availability: record.availabilityStatus,
    category: record.category,
    merchant: record.merchant,
    images: record.images.flatMap((image) => {
      const url = imageUrl(image.storageKey);
      return url
        ? [
            {
              url,
              alt: image.altText ?? `Foto ${record.name}`,
              isCover: image.isCover,
            },
          ]
        : [];
    }),
  };
};
