import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { UnauthenticatedError } from "@/lib/auth/authorization";
import { getMerchantDashboardOverview } from "./merchant-dashboard-service";

describe("merchant dashboard service", () => {
  it("uses the authorized membership merchant instead of client context", async () => {
    const countProducts = vi.fn().mockResolvedValue({
      totalProducts: 7,
      availableProducts: 4,
      suspendedProducts: 2,
    });

    await expect(
      getMerchantDashboardOverview({
        authorize: vi.fn().mockResolvedValue({ merchantId: "merchant-a" }),
        countProducts,
      }),
    ).resolves.toEqual({
      totalProducts: 7,
      availableProducts: 4,
      suspendedProducts: 2,
    });
    expect(countProducts).toHaveBeenCalledWith("merchant-a");
  });

  it("does not query dashboard data when authorization fails", async () => {
    const countProducts = vi.fn();

    await expect(
      getMerchantDashboardOverview({
        authorize: vi.fn().mockRejectedValue(new UnauthenticatedError()),
        countProducts,
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(countProducts).not.toHaveBeenCalled();
  });

  it("returns a factual zero-product overview", async () => {
    await expect(
      getMerchantDashboardOverview({
        authorize: vi.fn().mockResolvedValue({ merchantId: "merchant-empty" }),
        countProducts: vi.fn().mockResolvedValue({
          totalProducts: 0,
          availableProducts: 0,
          suspendedProducts: 0,
        }),
      }),
    ).resolves.toEqual({
      totalProducts: 0,
      availableProducts: 0,
      suspendedProducts: 0,
    });
  });
});
