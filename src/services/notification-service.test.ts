import { describe, expect, it, vi } from "vitest";
import {
  getMerchantNotifications,
  markMerchantNotificationRead,
} from "./notification-service";

const membership = { userId: "user-a", merchantId: "merchant-a" } as never;

describe("notification service", () => {
  it("loads only through the authorized session user and maps a fixed safe link", async () => {
    const findMany = vi.fn().mockResolvedValue([
      {
        id: "n",
        type: "PRODUCT_SUSPENDED",
        title: "Produk",
        message: "Ditangguhkan",
        relatedProductId: "product-a",
        readAt: null,
        createdAt: new Date(),
      },
    ]);
    const result = await getMerchantNotifications({
      authorize: async () => membership,
      findMany,
    });
    expect(findMany).toHaveBeenCalledWith("user-a");
    expect(result[0]?.href).toBe("/dashboard/products");
  });
  it("marks read using both notification and authenticated user ids", async () => {
    const markRead = vi.fn().mockResolvedValue({ count: 1 });
    await expect(
      markMerchantNotificationRead("11111111-1111-4111-8111-111111111111", {
        authorize: async () => membership,
        markRead,
      }),
    ).resolves.toBe(true);
    expect(markRead).toHaveBeenCalledWith(
      "11111111-1111-4111-8111-111111111111",
      "user-a",
    );
  });
  it("rejects malformed identifiers before authorization", async () => {
    const authorize = vi.fn();
    await expect(
      markMerchantNotificationRead("../other", { authorize }),
    ).resolves.toBe(false);
    expect(authorize).not.toHaveBeenCalled();
  });
  it("rejects UUID-shaped punctuation that PostgreSQL cannot parse", async () => {
    const authorize = vi.fn();
    await expect(
      markMerchantNotificationRead("------------------------------------", {
        authorize,
      }),
    ).resolves.toBe(false);
    expect(authorize).not.toHaveBeenCalled();
  });
});
