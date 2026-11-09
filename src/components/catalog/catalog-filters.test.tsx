import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseCatalogQuery } from "@/features/catalog/catalog-query";
import { CatalogFilters } from "./catalog-filters";

describe("CatalogFilters", () => {
  it("preserves the catalog query contract and reset destination", () => {
    render(
      <CatalogFilters
        query={parseCatalogQuery({
          q: "kopi",
          category: "minuman",
          merchant: "kedai-desa",
          availability: "tersedia",
          minPrice: "5000",
          maxPrice: "50000",
          sort: "price_asc",
        })}
        options={{
          categories: [{ name: "Minuman", slug: "minuman" }],
          merchants: [{ name: "Kedai Desa", slug: "kedai-desa" }],
        }}
      />,
    );

    const form = screen.getByRole("search", {
      name: "Cari dan filter produk",
    });
    expect(form).toHaveAttribute("action", "/products");
    expect(form).toHaveAttribute("method", "get");
    expect(screen.getByLabelText("Cari produk atau merchant")).toHaveValue(
      "kopi",
    );
    expect(screen.getByLabelText("Kategori")).toHaveValue("minuman");
    expect(screen.getByLabelText("Merchant")).toHaveValue("kedai-desa");
    expect(screen.getByLabelText("Ketersediaan")).toHaveValue("tersedia");
    expect(screen.getByLabelText("Urutkan")).toHaveValue("price_asc");
    expect(screen.getByRole("link", { name: /reset filter/i })).toHaveAttribute(
      "href",
      "/products",
    );
  });
});
