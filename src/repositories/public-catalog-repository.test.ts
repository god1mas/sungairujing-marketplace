import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  $transaction: vi.fn(),
  product: { findMany: vi.fn(), count: vi.fn() },
  category: { findMany: vi.fn() },
  merchant: { findMany: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findPublicCatalog,
  findPublicCatalogFilterOptions,
} from "./public-catalog-repository";

describe("public catalog repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.product.findMany.mockReturnValue(Promise.resolve([]));
    database.product.count.mockReturnValue(Promise.resolve(0));
    database.category.findMany.mockReturnValue(Promise.resolve([]));
    database.merchant.findMany.mockReturnValue(Promise.resolve([]));
    database.$transaction.mockImplementation(async (operations: unknown[]) =>
      Promise.all(operations),
    );
  });

  it("enforces public eligibility alongside every catalog filter", async () => {
    await findPublicCatalog({
      pageSize: 20,
      query: {
        q: "ikan",
        category: "makanan",
        merchant: "dapur-bawean",
        availability: "HABIS",
        minPrice: "10000",
        maxPrice: "50000",
        sort: "price_desc",
        page: 2,
      },
    });

    const call = database.product.findMany.mock.calls[0][0];
    expect(call.where.AND[0]).toEqual({
      moderationStatus: "ACTIVE",
      merchant: { status: "ACTIVE" },
    });
    expect(call.where.AND[1]).toEqual(
      expect.objectContaining({
        category: { slug: "makanan" },
        merchant: { slug: "dapur-bawean" },
        availabilityStatus: "HABIS",
        price: { gte: "10000", lte: "50000" },
      }),
    );
    expect(call.where.AND[1].OR).toHaveLength(4);
    expect(call.orderBy).toEqual([{ price: "desc" }, { id: "asc" }]);
    expect(call.skip).toBe(20);
    expect(call.take).toBe(20);
    expect(database.product.count).toHaveBeenCalledWith({ where: call.where });
  });

  it("loads only active filter options and eligible merchants", async () => {
    await findPublicCatalogFilterOptions();

    expect(database.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true } }),
    );
    expect(database.merchant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "ACTIVE",
          products: { some: { moderationStatus: "ACTIVE" } },
        },
      }),
    );
  });
});
