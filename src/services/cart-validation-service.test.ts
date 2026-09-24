import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { revalidateCart } from "./cart-validation-service";

const product = (overrides: Record<string, unknown> = {}) => ({
  id: "10000000-0000-4000-8000-000000000001",
  name: "Kerupuk Ikan",
  price: new Prisma.Decimal("15000.00"),
  unit: "bungkus",
  availabilityStatus: "TERSEDIA" as const,
  moderationStatus: "ACTIVE" as const,
  merchant: {
    id: "20000000-0000-4000-8000-000000000001",
    name: "Dapur Bawean",
    slug: "dapur-bawean",
    publicWhatsappNumber: "6281234567890",
    status: "ACTIVE" as const,
  },
  images: [],
  ...overrides,
});

describe("revalidateCart", () => {
  const item = {
    productId: "10000000-0000-4000-8000-000000000001",
    merchantId: "20000000-0000-4000-8000-000000000001",
    quantity: 2,
  };

  it("uses current server price for authoritative subtotal", async () => {
    const result = await revalidateCart([item], {
      findProducts: vi.fn().mockResolvedValue([product()]),
      resolveImageUrl: () => null,
    });
    expect(result.validItems[0]).toEqual(
      expect.objectContaining({ price: "15000.00", subtotal: "30000.00" }),
    );
  });

  it.each([
    ["deleted", [], "NOT_FOUND"],
    [
      "suspended product",
      [product({ moderationStatus: "SUSPENDED" })],
      "PRODUCT_UNAVAILABLE",
    ],
    [
      "suspended merchant",
      [product({ merchant: { ...product().merchant, status: "SUSPENDED" } })],
      "MERCHANT_UNAVAILABLE",
    ],
  ])("blocks %s", async (_label, records, reason) => {
    const result = await revalidateCart([item], {
      findProducts: vi.fn().mockResolvedValue(records),
    });
    expect(result.invalidItems).toEqual([
      { productId: item.productId, reason },
    ]);
  });

  it("keeps HABIS visible but marks it ineligible for checkout", async () => {
    const result = await revalidateCart([item], {
      findProducts: vi
        .fn()
        .mockResolvedValue([product({ availabilityStatus: "HABIS" })]),
      resolveImageUrl: () => null,
    });
    expect(result.validItems[0]).toEqual(
      expect.objectContaining({
        availability: "HABIS",
        checkoutEligible: false,
        invalidReason: "OUT_OF_STOCK",
      }),
    );
  });

  it("blocks injected merchant identity", async () => {
    const result = await revalidateCart(
      [{ ...item, merchantId: "30000000-0000-4000-8000-000000000001" }],
      { findProducts: vi.fn().mockResolvedValue([product()]) },
    );
    expect(result.invalidItems[0].reason).toBe("MERCHANT_MISMATCH");
  });
});
