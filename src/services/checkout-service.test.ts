import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { prepareWhatsAppCheckout } from "./checkout-service";

const item = {
  productId: "10000000-0000-4000-8000-000000000001",
  merchantId: "20000000-0000-4000-8000-000000000001",
  quantity: 2,
};
const record = {
  id: item.productId,
  name: "Kerupuk Ikan",
  price: new Prisma.Decimal("17500.00"),
  unit: "bungkus",
  availabilityStatus: "TERSEDIA" as const,
  moderationStatus: "ACTIVE" as const,
  merchant: {
    id: item.merchantId,
    name: "Dapur Bawean",
    slug: "dapur-bawean",
    publicWhatsappNumber: "6281234567890",
    status: "ACTIVE" as const,
  },
  images: [],
};
const buyer = {
  name: "Dimas",
  whatsappNumber: "081234567890",
  fulfillmentMethod: "AMBIL_SENDIRI" as const,
};

describe("prepareWhatsAppCheckout", () => {
  it("isolates one merchant and generates URL from authoritative data", async () => {
    const result = await prepareWhatsAppCheckout(
      { merchantSlug: "dapur-bawean", items: [item], buyer },
      {
        findProducts: vi.fn().mockResolvedValue([record]),
        referenceCode: () => "SRM-260924-A7K2",
      },
    );
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        estimatedTotal: "35000.00",
        referenceCode: "SRM-260924-A7K2",
      }),
    );
    if (result.success) {
      const decoded = decodeURIComponent(result.whatsappUrl);
      expect(decoded).toContain("Total estimasi: Rp 35.000");
      expect(result.whatsappUrl).toMatch(
        /^https:\/\/wa\.me\/6281234567890\?text=/,
      );
    }
  });

  it("blocks cross-merchant injection and HABIS products", async () => {
    const wrongMerchant = await prepareWhatsAppCheckout(
      { merchantSlug: "merchant-lain", items: [item], buyer },
      { findProducts: vi.fn().mockResolvedValue([record]) },
    );
    expect(wrongMerchant.success).toBe(false);

    const outOfStock = await prepareWhatsAppCheckout(
      { merchantSlug: "dapur-bawean", items: [item], buyer },
      {
        findProducts: vi
          .fn()
          .mockResolvedValue([{ ...record, availabilityStatus: "HABIS" }]),
      },
    );
    expect(outOfStock.success).toBe(false);
  });
});
