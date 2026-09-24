import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import {
  getPublicProductDetail,
  isSafeProductSlug,
} from "./public-product-detail-service";

const record = {
  id: "product-id",
  name: "Kerupuk Ikan",
  slug: "kerupuk-ikan",
  description: "Kerupuk ikan lokal.",
  price: new Prisma.Decimal("15000.00"),
  unit: "bungkus",
  availabilityStatus: "HABIS" as const,
  category: { name: "Makanan", slug: "makanan" },
  merchant: {
    id: "merchant-id",
    name: "Dapur Bawean",
    slug: "dapur-bawean",
    address: "Desa Sungairujing",
  },
  images: [
    { storageKey: "products/cover.webp", altText: null, isCover: true },
    { storageKey: "products/missing.webp", altText: null, isCover: false },
  ],
};

describe("public product detail service", () => {
  it("rejects malformed slugs before querying the repository", async () => {
    const findProduct = vi.fn();

    await expect(
      getPublicProductDetail("../private", { findProduct }),
    ).resolves.toBeNull();
    expect(findProduct).not.toHaveBeenCalled();
    expect(isSafeProductSlug("produk-lokal-1")).toBe(true);
  });

  it("maps real relations, HABIS state, price, and available public images", async () => {
    const findProduct = vi.fn().mockResolvedValue(record);

    const result = await getPublicProductDetail("kerupuk-ikan", {
      findProduct,
      resolveImageUrl: (key) =>
        key.endsWith("cover.webp") ? `https://media.example/${key}` : null,
    });

    expect(result).toEqual(
      expect.objectContaining({
        name: "Kerupuk Ikan",
        description: "Kerupuk ikan lokal.",
        price: "15000.00",
        availability: "HABIS",
        category: { name: "Makanan", slug: "makanan" },
        merchant: expect.objectContaining({ address: "Desa Sungairujing" }),
        images: [
          {
            url: "https://media.example/products/cover.webp",
            alt: "Foto Kerupuk Ikan",
            isCover: true,
          },
        ],
      }),
    );
  });

  it("returns null for missing or ineligible products", async () => {
    await expect(
      getPublicProductDetail("produk-tersembunyi", {
        findProduct: vi.fn().mockResolvedValue(null),
      }),
    ).resolves.toBeNull();
  });
});
