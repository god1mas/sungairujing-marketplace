import { Prisma, WhatsAppClickSource } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  getAnalyticsPeriodStart,
  getMerchantAnalytics,
  getPopularProducts,
  recordProductView,
  recordWhatsAppClick,
} from "./analytics-service";

describe("analytics service", () => {
  it("hashes the visitor server-side and forwards a rolling-view timestamp", async () => {
    const record = vi.fn().mockResolvedValue(true);
    const now = new Date("2026-09-25T10:00:00.000Z");
    await recordProductView("product-a", "raw-browser-id", {
      record,
      hash: () => "server-hash",
      now: () => now,
    });
    expect(record).toHaveBeenCalledWith({
      productId: "product-a",
      visitorKeyHash: "server-hash",
      now,
    });
  });

  it.each([
    [WhatsAppClickSource.PRODUCT_DETAIL, { productSlug: "produk-a" }],
    [WhatsAppClickSource.MERCHANT_PROFILE, { merchantSlug: "merchant-a" }],
    [WhatsAppClickSource.CHECKOUT, { merchantSlug: "merchant-a" }],
  ])(
    "stores the exact WhatsApp source %s without checkout PII",
    async (source, target) => {
      const create = vi.fn().mockResolvedValue({ id: "event-a" });
      await recordWhatsAppClick(
        { source, ...target, visitorId: "raw-id" },
        {
          resolve: vi.fn().mockResolvedValue({
            merchantId: "merchant-a",
            productId: source === "PRODUCT_DETAIL" ? "product-a" : null,
          }),
          create,
          hash: () => "hash",
          now: () => new Date("2026-09-25T00:00:00Z"),
        },
      );
      const stored = create.mock.calls[0][0];
      expect(stored.source).toBe(source);
      expect(stored).not.toHaveProperty("buyer");
      expect(stored).not.toHaveProperty("message");
      expect(stored).not.toHaveProperty("address");
    },
  );

  it("uses deterministic WIB today and rolling 7/30-day boundaries", () => {
    const now = new Date("2026-09-25T18:30:00.000Z");
    expect(getAnalyticsPeriodStart("TODAY", now)?.toISOString()).toBe(
      "2026-09-25T17:00:00.000Z",
    );
    expect(getAnalyticsPeriodStart("LAST_7_DAYS", now)?.toISOString()).toBe(
      "2026-09-18T18:30:00.000Z",
    );
    expect(getAnalyticsPeriodStart("LAST_30_DAYS", now)?.toISOString()).toBe(
      "2026-08-26T18:30:00.000Z",
    );
    expect(getAnalyticsPeriodStart("ALL_TIME", now)).toBeNull();
  });

  it("scopes analytics to the authenticated merchant and returns truthful zero state", async () => {
    const findEvents = vi.fn().mockResolvedValue({ views: [], clicks: [] });
    const result = await getMerchantAnalytics("ALL_TIME", {
      authorize: vi.fn().mockResolvedValue({ merchantId: "merchant-a" }),
      findEvents,
      now: () => new Date("2026-09-25T00:00:00Z"),
    });
    expect(findEvents).toHaveBeenCalledWith(
      "merchant-a",
      null,
      expect.any(Date),
    );
    expect(result).toEqual({
      period: "ALL_TIME",
      productViews: 0,
      whatsappClicks: 0,
      chart: [],
    });
  });

  it("aggregates only presentation-safe daily metrics", async () => {
    const result = await getMerchantAnalytics("LAST_7_DAYS", {
      authorize: vi.fn().mockResolvedValue({ merchantId: "merchant-a" }),
      findEvents: vi.fn().mockResolvedValue({
        views: [
          { countedAt: new Date("2026-09-25T01:00:00Z") },
          { countedAt: new Date("2026-09-25T02:00:00Z") },
        ],
        clicks: [{ clickedAt: new Date("2026-09-25T03:00:00Z") }],
      }),
      now: () => new Date("2026-09-25T10:00:00Z"),
    });
    expect(result.productViews).toBe(2);
    expect(result.whatsappClicks).toBe(1);
    expect(result.chart[0]).toEqual(
      expect.objectContaining({ productViews: 2, whatsappClicks: 1 }),
    );
    expect(result).not.toHaveProperty("visitorKeyHash");
  });

  it("maps at most the authoritative popular records without fabricating zero-view products", async () => {
    const products = await getPopularProducts({
      find: vi.fn().mockResolvedValue([
        {
          id: "p",
          name: "Produk",
          slug: "produk",
          price: new Prisma.Decimal(1000),
          unit: "pcs",
          availabilityStatus: "TERSEDIA",
          merchant: { name: "Merchant", slug: "merchant" },
          images: [],
        },
      ]),
      resolveImageUrl: () => null,
    });
    expect(products).toHaveLength(1);
    expect(products[0].name).toBe("Produk");
  });
});
