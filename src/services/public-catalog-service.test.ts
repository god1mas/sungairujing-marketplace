import { Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPublicCatalog,
  getPublicCatalogFilterOptions,
} from "./public-catalog-service";

afterEach(() => vi.restoreAllMocks());

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

  it("logs a sanitized product query failure and preserves rejection", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Prisma.PrismaClientKnownRequestError(
      "secret database URL and credentials",
      { code: "P1000", clientVersion: "6.12.0" },
    );

    await expect(
      getPublicCatalog(
        { sort: "newest", page: 1 },
        { findCatalog: vi.fn().mockRejectedValue(error) },
      ),
    ).rejects.toBe(error);

    expect(log).toHaveBeenCalledTimes(1);
    expect(JSON.parse(log.mock.calls[0][0])).toEqual({
      level: "error",
      event: "public-catalog-failure",
      operation: "product-catalog-query",
      category: "prisma-known-request-error",
      code: "P1000",
    });
    expect(log.mock.calls[0][0]).not.toContain("secret");
  });

  it("distinguishes unexpected result processing without logging payloads", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("sensitive product payload");
    const result = {
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
    };

    await expect(
      getPublicCatalog(
        { sort: "newest", page: 1 },
        {
          findCatalog: vi.fn().mockResolvedValue(result),
          resolveImageUrl: () => {
            throw error;
          },
        },
      ),
    ).rejects.toBe(error);

    expect(JSON.parse(log.mock.calls[0][0])).toEqual({
      level: "error",
      event: "public-catalog-failure",
      operation: "catalog-result-processing",
      category: "non-prisma-error",
    });
    expect(log.mock.calls[0][0]).not.toContain(error.message);
  });

  it("logs a sanitized filter query failure and preserves rejection", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("private query parameter");

    await expect(
      getPublicCatalogFilterOptions(vi.fn().mockRejectedValue(error)),
    ).rejects.toBe(error);

    expect(JSON.parse(log.mock.calls[0][0])).toEqual({
      level: "error",
      event: "public-catalog-failure",
      operation: "filter-options-query",
      category: "non-prisma-error",
    });
    expect(log.mock.calls[0][0]).not.toContain(error.message);
  });
});
