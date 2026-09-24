import "server-only";

import { z } from "zod";
import {
  findPublicMerchantBySlug,
  findPublicMerchants,
  type PublicMerchantDetailRecord,
  type PublicMerchantSummaryRecord,
} from "@/repositories/public-merchant-repository";
import { resolvePublicImageUrl } from "./public-catalog-service";
import type { PublicProductCard } from "./public-catalog-service";

export type PublicMerchantSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: { url: string; alt: string } | null;
  address: string;
  operationalStatus: "BUKA" | "TUTUP" | "LIBUR_SEMENTARA";
  isVerified: boolean;
};

export type PublicMerchantDetail = PublicMerchantSummary & {
  whatsappUrl: string | null;
  openingHours: { label: string; value: string }[];
  products: PublicProductCard[];
};

type ImageUrlResolver = (storageKey: string) => string | null;
const openingHoursSchema = z.record(z.string(), z.string());

export const isSafeMerchantSlug = (slug: string): boolean =>
  slug.length > 0 &&
  slug.length <= 160 &&
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

const mapOpeningHours = (
  input: PublicMerchantDetailRecord["openingHours"],
): PublicMerchantDetail["openingHours"] => {
  const parsed = openingHoursSchema.safeParse(input);
  if (!parsed.success) return [];
  return Object.entries(parsed.data).map(([label, value]) => ({
    label,
    value,
  }));
};

const mapMerchantSummary = (
  record: PublicMerchantSummaryRecord,
  resolveImageUrl: ImageUrlResolver,
): PublicMerchantSummary => {
  const logoUrl = record.logoStorageKey
    ? resolveImageUrl(record.logoStorageKey)
    : null;
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    logo: logoUrl ? { url: logoUrl, alt: `Logo ${record.name}` } : null,
    address: record.address,
    operationalStatus: record.operationalStatus,
    isVerified: record.verificationStatus === "TERVERIFIKASI",
  };
};

export const getPublicMerchants = async (
  dependencies: {
    findMerchants?: () => Promise<PublicMerchantSummaryRecord[]>;
    resolveImageUrl?: ImageUrlResolver;
  } = {},
): Promise<PublicMerchantSummary[]> => {
  const records = await (dependencies.findMerchants ?? findPublicMerchants)();
  const resolveImage = dependencies.resolveImageUrl ?? resolvePublicImageUrl;
  return records.map((record) => mapMerchantSummary(record, resolveImage));
};

export const getPublicMerchantDetail = async (
  slug: string,
  dependencies: {
    findMerchant?: (slug: string) => Promise<PublicMerchantDetailRecord | null>;
    resolveImageUrl?: ImageUrlResolver;
  } = {},
): Promise<PublicMerchantDetail | null> => {
  if (!isSafeMerchantSlug(slug)) return null;
  const record = await (dependencies.findMerchant ?? findPublicMerchantBySlug)(
    slug,
  );
  if (!record) return null;

  const resolveImage = dependencies.resolveImageUrl ?? resolvePublicImageUrl;
  const whatsappNumber = /^\d{8,15}$/.test(record.publicWhatsappNumber)
    ? record.publicWhatsappNumber
    : null;

  return {
    ...mapMerchantSummary(record, resolveImage),
    whatsappUrl: whatsappNumber ? `https://wa.me/${whatsappNumber}` : null,
    openingHours: mapOpeningHours(record.openingHours),
    products: record.products.map((product) => {
      const cover = product.images[0];
      const url = cover ? resolveImage(cover.storageKey) : null;
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
