import { beforeEach, describe, expect, it, vi } from "vitest";

const loadMerchant = vi.hoisted(() => vi.fn());
vi.mock("@/services/public-merchant-service", () => ({
  getPublicMerchantDetail: loadMerchant,
}));

import { generateMetadata } from "./page";

describe("merchant metadata", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates metadata from an eligible merchant", async () => {
    loadMerchant.mockResolvedValue({
      name: "Dapur Sungairujing",
      slug: "dapur-sungairujing",
      description: "Makanan lokal.",
      logo: { url: "https://media.example/logo.webp", alt: "Logo Dapur" },
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "dapur-sungairujing" }),
    });
    expect(metadata).toEqual(
      expect.objectContaining({
        title: "Dapur Sungairujing",
        alternates: { canonical: "/merchant/dapur-sungairujing" },
        openGraph: expect.objectContaining({
          images: [
            {
              url: "https://media.example/logo.webp",
              alt: "Logo Dapur",
            },
          ],
        }),
      }),
    );
  });

  it("does not leak metadata for suspended or missing merchants", async () => {
    loadMerchant.mockResolvedValue(null);
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "merchant-hidden" }),
    });

    expect(metadata.title).toBe("Merchant Tidak Ditemukan");
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata).not.toHaveProperty("openGraph");
  });
});
