import { beforeEach, describe, expect, it, vi } from "vitest";

const loadProduct = vi.hoisted(() => vi.fn());

vi.mock("@/services/public-product-detail-service", () => ({
  getPublicProductDetail: loadProduct,
}));

import { generateMetadata } from "./page";

describe("product detail metadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("uses eligible product data and public cover image", async () => {
    loadProduct.mockResolvedValue({
      name: "Kerupuk Ikan",
      slug: "kerupuk-ikan",
      description: "Kerupuk ikan lokal.",
      images: [{ url: "https://media.example/cover.webp", alt: "Kerupuk" }],
    });

    await expect(
      generateMetadata({ params: Promise.resolve({ slug: "kerupuk-ikan" }) }),
    ).resolves.toEqual(
      expect.objectContaining({
        title: "Kerupuk Ikan",
        description: "Kerupuk ikan lokal.",
        alternates: { canonical: "/products/kerupuk-ikan" },
        openGraph: expect.objectContaining({
          images: [{ url: "https://media.example/cover.webp", alt: "Kerupuk" }],
        }),
      }),
    );
  });

  it("does not leak metadata for missing or ineligible products", async () => {
    loadProduct.mockResolvedValue(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "produk-tersembunyi" }),
    });

    expect(metadata.title).toBe("Produk Tidak Ditemukan");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata).not.toHaveProperty("openGraph");
  });
});
