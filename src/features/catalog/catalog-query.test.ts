import { describe, expect, it } from "vitest";
import { createCatalogHref, parseCatalogQuery } from "./catalog-query";

describe("catalog query", () => {
  it("normalizes supported shareable filters", () => {
    expect(
      parseCatalogQuery({
        q: "  kerupuk  ",
        category: "makanan-ringan",
        merchant: "dapur-bawean",
        availability: "tersedia",
        minPrice: "10000",
        maxPrice: "100000",
        sort: "price_asc",
        page: "2",
      }),
    ).toEqual({
      q: "kerupuk",
      category: "makanan-ringan",
      merchant: "dapur-bawean",
      availability: "TERSEDIA",
      minPrice: "10000",
      maxPrice: "100000",
      sort: "price_asc",
      page: 2,
    });
  });

  it("falls back safely for invalid values and inverted prices", () => {
    expect(
      parseCatalogQuery({
        category: "../unsafe",
        availability: "unknown",
        minPrice: "50000",
        maxPrice: "10000",
        sort: "popular",
        page: "-2",
      }),
    ).toEqual({
      q: undefined,
      category: undefined,
      merchant: undefined,
      availability: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      sort: "newest",
      page: 1,
    });
  });

  it("preserves active filters in pagination links", () => {
    const query = parseCatalogQuery({ q: "kopi", page: "2" });
    expect(createCatalogHref(query, { page: 3 })).toBe(
      "/products?q=kopi&page=3",
    );
  });
});
