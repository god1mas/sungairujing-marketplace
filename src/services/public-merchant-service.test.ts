import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  getPublicMerchantDetail,
  getPublicMerchants,
} from "./public-merchant-service";

const summary = {
  id: "merchant-id",
  name: "Dapur Sungairujing",
  slug: "dapur-sungairujing",
  description: "Makanan lokal.",
  logoStorageKey: "merchants/logo.webp",
  address: "Desa Sungairujing",
  operationalStatus: "BUKA" as const,
  verificationStatus: "BELUM_DIVERIFIKASI" as const,
};

describe("public merchant service", () => {
  it("keeps unverified active merchants public and maps logo fallback safely", async () => {
    const merchants = await getPublicMerchants({
      findMerchants: vi.fn().mockResolvedValue([summary]),
      resolveImageUrl: () => null,
    });

    expect(merchants[0]).toEqual(
      expect.objectContaining({ isVerified: false, logo: null }),
    );
  });

  it("rejects malformed slugs before database access", async () => {
    const findMerchant = vi.fn();
    await expect(
      getPublicMerchantDetail("../private", { findMerchant }),
    ).resolves.toBeNull();
    expect(findMerchant).not.toHaveBeenCalled();
  });

  it("maps public contact, opening hours, and eligible product cards", async () => {
    const merchant = await getPublicMerchantDetail("dapur-sungairujing", {
      findMerchant: vi.fn().mockResolvedValue({
        ...summary,
        verificationStatus: "TERVERIFIKASI",
        publicWhatsappNumber: "6281234567890",
        openingHours: { Senin: "08.00–16.00", Minggu: "Tutup" },
        products: [
          {
            id: "product-id",
            name: "Kerupuk Ikan",
            slug: "kerupuk-ikan",
            price: new Prisma.Decimal("15000.00"),
            unit: "bungkus",
            availabilityStatus: "HABIS",
            merchant: {
              name: "Dapur Sungairujing",
              slug: "dapur-sungairujing",
            },
            images: [
              { storageKey: "products/cover.webp", altText: "Kerupuk Ikan" },
            ],
          },
        ],
      }),
      resolveImageUrl: (key) => `https://media.example/${key}`,
    });

    expect(merchant).toEqual(
      expect.objectContaining({
        isVerified: true,
        whatsappUrl: "https://wa.me/6281234567890",
        openingHours: [
          { label: "Senin", value: "08.00–16.00" },
          { label: "Minggu", value: "Tutup" },
        ],
        products: [
          expect.objectContaining({
            availability: "HABIS",
            image: {
              url: "https://media.example/products/cover.webp",
              alt: "Kerupuk Ikan",
            },
          }),
        ],
      }),
    );
  });

  it("does not create a WhatsApp link from malformed stored contact data", async () => {
    const merchant = await getPublicMerchantDetail("merchant", {
      findMerchant: vi.fn().mockResolvedValue({
        ...summary,
        publicWhatsappNumber: "javascript:alert(1)",
        openingHours: null,
        products: [],
      }),
    });

    expect(merchant?.whatsappUrl).toBeNull();
    expect(merchant?.openingHours).toEqual([]);
  });

  it("renders the documented structured opening-hours representation", async () => {
    const openingHours = Object.fromEntries(
      ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"].map(
        (day, index) => [
          day,
          index === 6
            ? { closed: true }
            : { closed: false, open: "08:00", close: "17:00" },
        ],
      ),
    );
    const merchant = await getPublicMerchantDetail("merchant", {
      findMerchant: vi.fn().mockResolvedValue({
        ...summary,
        publicWhatsappNumber: "6281234567890",
        openingHours,
        products: [],
      }),
    });
    expect(merchant?.openingHours[0]).toEqual({
      label: "Senin",
      value: "08:00–17:00",
    });
    expect(merchant?.openingHours[6]).toEqual({
      label: "Minggu",
      value: "Tutup",
    });
  });
});
