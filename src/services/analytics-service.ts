import "server-only";

import { WhatsAppClickSource } from "@prisma/client";
import { requireMerchantAdmin } from "@/lib/auth/authorization";
import { hashVisitorId } from "@/lib/analytics/visitor";
import {
  findMerchantAnalyticsEvents,
  recordDeduplicatedProductView,
  resolveWhatsAppAnalyticsTarget,
  createWhatsAppClickEvent,
  findPopularProductRecords,
} from "@/repositories/analytics-repository";
import {
  resolvePublicImageUrl,
  type PublicProductCard,
} from "./public-catalog-service";

export type AnalyticsPeriod =
  "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "ALL_TIME";
export const ANALYTICS_PERIODS: AnalyticsPeriod[] = [
  "TODAY",
  "LAST_7_DAYS",
  "LAST_30_DAYS",
  "ALL_TIME",
];
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const getAnalyticsPeriodStart = (period: AnalyticsPeriod, now: Date) => {
  if (period === "ALL_TIME") return null;
  if (period === "TODAY") {
    const wib = new Date(now.getTime() + WIB_OFFSET_MS);
    return new Date(
      Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate()) -
        WIB_OFFSET_MS,
    );
  }
  const days = period === "LAST_7_DAYS" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
};

export const recordProductView = (
  productId: string,
  visitorId: string,
  dependencies: {
    record?: typeof recordDeduplicatedProductView;
    now?: () => Date;
    hash?: (id: string) => string;
  } = {},
) =>
  (dependencies.record ?? recordDeduplicatedProductView)({
    productId,
    visitorKeyHash: (dependencies.hash ?? hashVisitorId)(visitorId),
    now: (dependencies.now ?? (() => new Date()))(),
  });

export const recordWhatsAppClick = async (
  input: {
    source: WhatsAppClickSource;
    productSlug?: string;
    merchantSlug?: string;
    visitorId?: string;
  },
  dependencies: {
    resolve?: typeof resolveWhatsAppAnalyticsTarget;
    create?: typeof createWhatsAppClickEvent;
    now?: () => Date;
    hash?: (id: string) => string;
  } = {},
) => {
  const target = await (dependencies.resolve ?? resolveWhatsAppAnalyticsTarget)(
    input,
  );
  if (!target) return false;
  await (dependencies.create ?? createWhatsAppClickEvent)({
    ...target,
    source: input.source,
    visitorKeyHash: input.visitorId
      ? (dependencies.hash ?? hashVisitorId)(input.visitorId)
      : null,
    now: (dependencies.now ?? (() => new Date()))(),
  });
  return true;
};

const dayKey = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
export const getMerchantAnalytics = async (
  period: AnalyticsPeriod,
  dependencies: {
    authorize?: typeof requireMerchantAdmin;
    findEvents?: typeof findMerchantAnalyticsEvents;
    now?: () => Date;
  } = {},
) => {
  const membership = await (dependencies.authorize ?? requireMerchantAdmin)();
  const now = (dependencies.now ?? (() => new Date()))();
  const events = await (dependencies.findEvents ?? findMerchantAnalyticsEvents)(
    membership.merchantId,
    getAnalyticsPeriodStart(period, now),
    now,
  );
  const map = new Map<
    string,
    { date: string; productViews: number; whatsappClicks: number }
  >();
  for (const item of events.views) {
    const key = dayKey(item.countedAt);
    const row = map.get(key) ?? {
      date: key,
      productViews: 0,
      whatsappClicks: 0,
    };
    row.productViews += 1;
    map.set(key, row);
  }
  for (const item of events.clicks) {
    const key = dayKey(item.clickedAt);
    const row = map.get(key) ?? {
      date: key,
      productViews: 0,
      whatsappClicks: 0,
    };
    row.whatsappClicks += 1;
    map.set(key, row);
  }
  return {
    period,
    productViews: events.views.length,
    whatsappClicks: events.clicks.length,
    chart: [...map.values()].sort((a, b) => a.date.localeCompare(b.date)),
  };
};

export const getPopularProducts = async (
  dependencies: {
    find?: typeof findPopularProductRecords;
    resolveImageUrl?: (key: string) => string | null;
  } = {},
): Promise<PublicProductCard[]> => {
  const records = await (dependencies.find ?? findPopularProductRecords)();
  const imageUrl = dependencies.resolveImageUrl ?? resolvePublicImageUrl;
  return records.map((product) => {
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
  });
};
