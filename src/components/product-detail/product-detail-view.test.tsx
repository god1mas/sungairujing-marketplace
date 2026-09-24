import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductDetailView } from "./product-detail-view";

describe("ProductDetailView", () => {
  it("renders factual product, category, merchant location, and HABIS state", () => {
    render(
      <ProductDetailView
        product={{
          id: "product-id",
          name: "Kerupuk Ikan",
          slug: "kerupuk-ikan",
          description: "Kerupuk ikan lokal dari Sungairujing.",
          price: "15000.00",
          unit: "bungkus",
          availability: "HABIS",
          category: { name: "Makanan", slug: "makanan" },
          merchant: {
            name: "Dapur Bawean",
            slug: "dapur-bawean",
            address: "Desa Sungairujing",
          },
          images: [],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Kerupuk Ikan" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Rp\s?15\.000/)).toBeInTheDocument();
    expect(screen.getByText("Habis")).toBeInTheDocument();
    expect(screen.getByText("Dapur Bawean")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dapur Bawean" })).toHaveAttribute(
      "href",
      "/merchant/dapur-bawean",
    );
    expect(screen.getByText("Desa Sungairujing")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Makanan" })).toHaveAttribute(
      "href",
      "/products?category=makanan",
    );
    expect(screen.getByText("Foto Kerupuk Ikan belum tersedia")).toBeVisible();
  });

  it("does not introduce cart, WhatsApp, rating, review, or sales behavior", () => {
    render(
      <ProductDetailView
        product={{
          id: "product-id",
          name: "Kopi Lokal",
          slug: "kopi-lokal",
          description: "Kopi lokal.",
          price: "20000.00",
          unit: "pak",
          availability: "TERSEDIA",
          category: { name: "Minuman", slug: "minuman" },
          merchant: {
            name: "Warung Kopi",
            slug: "warung-kopi",
            address: "Sungairujing",
          },
          images: [],
        }}
      />,
    );

    expect(screen.queryByText(/tambah ke keranjang/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/whatsapp/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/rating|review|terjual/i),
    ).not.toBeInTheDocument();
  });
});
