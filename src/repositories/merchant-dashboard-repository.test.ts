import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  product: { count: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import { countMerchantDashboardProducts } from "./merchant-dashboard-repository";

describe("merchant dashboard repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.product.count
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
  });

  it("scopes every count to the authenticated merchant", async () => {
    await expect(countMerchantDashboardProducts("merchant-a")).resolves.toEqual(
      {
        totalProducts: 5,
        availableProducts: 3,
        suspendedProducts: 1,
      },
    );

    expect(database.product.count).toHaveBeenNthCalledWith(1, {
      where: { merchantId: "merchant-a" },
    });
    expect(database.product.count).toHaveBeenNthCalledWith(2, {
      where: {
        merchantId: "merchant-a",
        availabilityStatus: "TERSEDIA",
      },
    });
    expect(database.product.count).toHaveBeenNthCalledWith(3, {
      where: {
        merchantId: "merchant-a",
        moderationStatus: "SUSPENDED",
      },
    });
  });
});
