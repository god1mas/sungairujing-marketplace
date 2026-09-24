import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { getPublicCatalog } from "./public-catalog-service";

describe("getPublicCatalog", () => {
  it("maps database records to serializable cards and pagination", async () => {
    const findCatalog = vi.fn().mockResolvedValue({
      total: 21,
      products: [
        {
          id: "product-id",
          name: "Kerupuk Ikan",
          slug: "kerupuk-ikan",
          price: new Prisma.Decimal("15000.00"),
          unit: "bungkus",
          availabilityStatus: "HABIS",
          merchant: { name: "Dapur Bawean", slug: "dapur-bawean" },
          images: [{ storageKey: "products/cover.webp", altText: null }],
        },
      ],
    });

    const result = await getPublicCatalog(
      { sort: "newest", page: 1 },
      {
        findCatalog,
        resolveImageUrl: (key) => `https://media.example/${key}`,
      },
    );

    expect(findCatalog).toHaveBeenCalledWith({
      query: { sort: "newest", page: 1 },
      pageSize: 20,
    });
    expect(result.totalPages).toBe(2);
    expect(result.products[0]).toEqual(
      expect.objectContaining({
        price: "15000.00",
        availability: "HABIS",
        image: {
          url: "https://media.example/products/cover.webp",
          alt: "Foto Kerupuk Ikan",
        },
      }),
    );
  });

  it("uses a safe image fallback when no public URL is available", async () => {
    const findCatalog = vi.fn().mockResolvedValue({
      total: 1,
      products: [
        {
          id: "product-id",
          name: "Kopi",
          slug: "kopi",
          price: new Prisma.Decimal(10000),
          unit: "pak",
          availabilityStatus: "TERSEDIA",
          merchant: { name: "Warung", slug: "warung" },
          images: [{ storageKey: "products/kopi.webp", altText: "Kopi" }],
        },
      ],
    });

    const result = await getPublicCatalog(
      { sort: "newest", page: 1 },
      { findCatalog, resolveImageUrl: () => null },
    );

    expect(result.products[0].image).toBeNull();
  });
});
