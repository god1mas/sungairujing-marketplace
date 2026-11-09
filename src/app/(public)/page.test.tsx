import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/public-catalog-service", () => ({
  getPublicCatalogFilterOptions: vi.fn(async () => ({
    categories: [
      { name: "Makanan", slug: "makanan" },
      { name: "Kerajinan", slug: "kerajinan" },
    ],
  })),
}));
vi.mock("@/services/analytics-service", () => ({
  getPopularProducts: vi.fn(async () => []),
}));
vi.mock("@/services/admin-content-service", () => ({
  getPublicHomepageContent: vi.fn(async () => ({
    banners: [
      {
        id: "banner-1",
        title: "Promo Produk Lokal",
        description: "Temukan produk unggulan dari UMKM Desa Sungairujing.",
        imageUrl: "https://storage.example.test/banner.webp",
        targetUrl: "/products",
        ctaText: "Lihat produk",
      },
    ],
    featured: [
      {
        id: "merchant-1",
        name: "Dapur Sungairujing",
        slug: "dapur-sungairujing",
        description: "Produk rumahan dari Desa Sungairujing.",
        address: "Desa Sungairujing",
        operationalStatus: "BUKA",
      },
    ],
  })),
}));

import Home, { metadata } from "./page";

afterEach(cleanup);

describe("public homepage shell", () => {
  it("renders the marketplace identity and factual public introduction", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Temukan Produk Lokal Sungairujing",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Mendekatkan produk lokal dengan masyarakat",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/status development/i)).not.toBeInTheDocument();
  });

  it("provides an accessible GET search entry point", async () => {
    render(await Home());

    const search = screen.getByRole("search");
    expect(search).toHaveAttribute("action", "/products");
    expect(search).toHaveAttribute("method", "get");
    expect(
      screen.getByRole("searchbox", { name: "Cari produk atau merchant" }),
    ).toHaveAttribute("name", "q");
    expect(screen.getByRole("button", { name: "Cari" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("keeps category and featured merchant discovery links functional", async () => {
    render(await Home());

    expect(screen.getByRole("link", { name: /Makanan/ })).toHaveAttribute(
      "href",
      "/products?category=makanan",
    );
    expect(
      screen.getByRole("link", { name: /Dapur Sungairujing/ }),
    ).toHaveAttribute("href", "/merchant/dapur-sungairujing");
    expect(
      screen.getByRole("complementary", {
        name: "Cara menggunakan marketplace",
      }),
    ).toBeInTheDocument();
  });

  it("renders a responsive, uncropped banner with a working CTA", async () => {
    render(await Home());

    const image = screen.getByRole("img", { name: "Promo Produk Lokal" });
    const card = image.closest("article");

    expect(card).toHaveClass("lg:grid", "lg:grid-cols-2");
    expect(card).not.toHaveClass("sm:grid", "sm:grid-cols-2");
    expect(image).toHaveClass(
      "h-auto",
      "w-full",
      "max-w-full",
      "max-h-[32rem]",
      "object-contain",
    );
    expect(screen.getByRole("link", { name: "Lihat produk" })).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("defines public canonical and Open Graph metadata", () => {
    expect(metadata.alternates).toEqual({ canonical: "/" });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: "website",
        locale: "id_ID",
        title: "UMKM DESA SUNGAIRUJING",
      }),
    );
  });
});
