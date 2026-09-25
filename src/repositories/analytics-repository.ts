import { MerchantStatus, WhatsAppClickSource } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { publicProductEligibility } from "./public-product-visibility";

export const recordDeduplicatedProductView = (input: {
  productId: string;
  visitorKeyHash: string;
  now: Date;
}) =>
  prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.productId}), hashtext(${input.visitorKeyHash}))`;
    const product = await tx.product.findFirst({
      where: { id: input.productId, ...publicProductEligibility },
      select: { id: true, merchantId: true },
    });
    if (!product) return false;
    const since = new Date(input.now.getTime() - 24 * 60 * 60 * 1000);
    const existing = await tx.productViewEvent.findFirst({
      where: {
        productId: product.id,
        visitorKeyHash: input.visitorKeyHash,
        countedAt: { gte: since, lte: input.now },
      },
      select: { id: true },
    });
    if (existing) return false;
    await tx.productViewEvent.create({
      data: {
        productId: product.id,
        merchantId: product.merchantId,
        visitorKeyHash: input.visitorKeyHash,
        countedAt: input.now,
      },
    });
    return true;
  });

export const resolveWhatsAppAnalyticsTarget = async (input: {
  source: WhatsAppClickSource;
  productSlug?: string;
  merchantSlug?: string;
}) => {
  if (
    input.source === WhatsAppClickSource.PRODUCT_DETAIL &&
    input.productSlug
  ) {
    const product = await prisma.product.findFirst({
      where: { slug: input.productSlug, ...publicProductEligibility },
      select: { id: true, merchantId: true },
    });
    return product
      ? { productId: product.id, merchantId: product.merchantId }
      : null;
  }
  if (
    (input.source === WhatsAppClickSource.MERCHANT_PROFILE ||
      input.source === WhatsAppClickSource.CHECKOUT) &&
    input.merchantSlug
  ) {
    const merchant = await prisma.merchant.findFirst({
      where: { slug: input.merchantSlug, status: MerchantStatus.ACTIVE },
      select: { id: true },
    });
    return merchant ? { productId: null, merchantId: merchant.id } : null;
  }
  return null;
};

export const createWhatsAppClickEvent = (input: {
  merchantId: string;
  productId: string | null;
  source: WhatsAppClickSource;
  visitorKeyHash: string | null;
  now: Date;
}) =>
  prisma.whatsAppClickEvent.create({
    data: { ...input, clickedAt: input.now },
    select: { id: true },
  });

export const findMerchantAnalyticsEvents = async (
  merchantId: string,
  start: Date | null,
  end: Date,
) => {
  const [views, clicks] = await Promise.all([
    prisma.productViewEvent.findMany({
      where: {
        merchantId,
        countedAt: { ...(start ? { gte: start } : {}), lte: end },
      },
      select: { countedAt: true },
    }),
    prisma.whatsAppClickEvent.findMany({
      where: {
        merchantId,
        clickedAt: { ...(start ? { gte: start } : {}), lte: end },
      },
      select: { clickedAt: true },
    }),
  ]);
  return { views, clicks };
};

export const findPopularProductRecords = () =>
  prisma.product.findMany({
    where: { ...publicProductEligibility, viewEvents: { some: {} } },
    orderBy: [
      { viewEvents: { _count: "desc" } },
      { createdAt: "desc" },
      { id: "asc" },
    ],
    take: 8,
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
  });
