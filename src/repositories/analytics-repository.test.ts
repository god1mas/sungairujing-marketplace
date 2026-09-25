import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  $executeRaw: vi.fn(),
  $transaction: vi.fn(),
  product: { findFirst: vi.fn(), findMany: vi.fn() },
  productViewEvent: { findFirst: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  whatsAppClickEvent: { create: vi.fn(), findMany: vi.fn() },
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: database }));
import {
  findPopularProductRecords,
  recordDeduplicatedProductView,
} from "./analytics-repository";

describe("analytics repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation((operation) =>
      operation(database),
    );
    database.product.findFirst.mockResolvedValue({
      id: "product-a",
      merchantId: "merchant-a",
    });
    database.productViewEvent.create.mockResolvedValue({ id: "view-a" });
  });

  it("takes an advisory lock before enforcing the rolling 24-hour window", async () => {
    database.productViewEvent.findFirst.mockResolvedValue(null);
    const now = new Date("2026-09-25T12:00:00Z");
    await expect(
      recordDeduplicatedProductView({
        productId: "product-a",
        visitorKeyHash: "hash-a",
        now,
      }),
    ).resolves.toBe(true);
    expect(database.$executeRaw).toHaveBeenCalledTimes(1);
    expect(database.productViewEvent.findFirst).toHaveBeenCalledWith({
      where: {
        productId: "product-a",
        visitorKeyHash: "hash-a",
        countedAt: { gte: new Date("2026-09-24T12:00:00Z"), lte: now },
      },
      select: { id: true },
    });
    expect(database.productViewEvent.create).toHaveBeenCalledWith({
      data: {
        productId: "product-a",
        merchantId: "merchant-a",
        visitorKeyHash: "hash-a",
        countedAt: now,
      },
    });
  });

  it("does not count a repeated same-browser product view inside 24 hours", async () => {
    database.productViewEvent.findFirst.mockResolvedValue({ id: "existing" });
    await expect(
      recordDeduplicatedProductView({
        productId: "product-a",
        visitorKeyHash: "same-hash",
        now: new Date(),
      }),
    ).resolves.toBe(false);
    expect(database.productViewEvent.create).not.toHaveBeenCalled();
  });

  it("permits distinct visitor/product lock keys and views older than the rolling window", async () => {
    database.productViewEvent.findFirst.mockResolvedValue(null);
    await recordDeduplicatedProductView({
      productId: "product-a",
      visitorKeyHash: "visitor-a",
      now: new Date(),
    });
    await recordDeduplicatedProductView({
      productId: "product-a",
      visitorKeyHash: "visitor-b",
      now: new Date(),
    });
    await recordDeduplicatedProductView({
      productId: "product-b",
      visitorKeyHash: "visitor-a",
      now: new Date(),
    });
    expect(database.productViewEvent.create).toHaveBeenCalledTimes(3);
  });

  it("ranks only eligible viewed products and limits results to eight", async () => {
    database.product.findMany.mockResolvedValue([]);
    await findPopularProductRecords();
    const query = database.product.findMany.mock.calls[0][0];
    expect(query.take).toBe(8);
    expect(query.where).toEqual(
      expect.objectContaining({
        moderationStatus: "ACTIVE",
        merchant: { status: "ACTIVE" },
        viewEvents: { some: {} },
      }),
    );
    expect(query.orderBy[0]).toEqual({ viewEvents: { _count: "desc" } });
  });
});
