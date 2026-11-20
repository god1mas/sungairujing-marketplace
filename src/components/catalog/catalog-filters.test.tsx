import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { parseCatalogQuery } from "@/features/catalog/catalog-query";
import { CatalogFilters } from "./catalog-filters";

describe("CatalogFilters", () => {
  afterEach(cleanup);

  it("preserves the catalog query contract and reset destination", () => {
    const { container } = render(
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
    expect(screen.getByRole("button", { name: "Cari" })).toBeVisible();
    const details = container.querySelector("details");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("6 aktif")).toBeInTheDocument();
    expect(screen.getByLabelText("Cari produk atau merchant")).toHaveValue(
      "kopi",
    );
    expect(screen.getByLabelText("Kategori")).toHaveValue("minuman");
    expect(screen.getByLabelText("Merchant")).toHaveValue("kedai-desa");
    expect(screen.getByLabelText("Ketersediaan")).toHaveValue("tersedia");
    expect(screen.getByLabelText("Urutkan")).toHaveValue("price_asc");
    expect(screen.getByLabelText("Harga minimum")).toHaveValue(5000);
    expect(screen.getByLabelText("Harga maksimum")).toHaveValue(50000);
    expect(screen.getByRole("link", { name: /reset filter/i })).toHaveAttribute(
      "href",
      "/products",
    );

    const summary = screen.getByText("Filter produk").closest("summary");
    expect(summary).not.toBeNull();
    fireEvent.click(summary!);
    expect(details).toHaveAttribute("open");
    expect(
      screen.getByRole("button", { name: "Terapkan filter" }),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("Harga minimum"), {
      target: { value: "7000" },
    });
    fireEvent.click(summary!);
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByLabelText("Harga minimum")).toHaveValue(7000);

    const values = new FormData(form as HTMLFormElement);
    expect(Object.fromEntries(values)).toMatchObject({
      q: "kopi",
      category: "minuman",
      merchant: "kedai-desa",
      availability: "tersedia",
      sort: "price_asc",
      minPrice: "7000",
      maxPrice: "50000",
    });
  });

  it("starts collapsed without an active-filter badge for a default query", () => {
    const { container } = render(
      <CatalogFilters
        query={parseCatalogQuery({})}
        options={{ categories: [], merchants: [] }}
      />,
    );

    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(screen.queryByText(/aktif$/)).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cari produk atau merchant")).toBeVisible();
  });
});
