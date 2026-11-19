import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { getPublicCatalog, getPublicCatalogFilterOptions } = vi.hoisted(() => ({
  getPublicCatalog: vi.fn(),
  getPublicCatalogFilterOptions: vi.fn(),
}));

vi.mock("@/services/public-catalog-service", () => ({
  getPublicCatalog,
  getPublicCatalogFilterOptions,
}));

import ProductsPage from "./page";

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe("public catalog error fallback", () => {
  it.each(["catalog", "filters"])(
    "keeps the existing safe message when %s loading fails",
    async (failure) => {
      getPublicCatalog.mockResolvedValue({
        products: [],
        total: 0,
        totalPages: 0,
      });
      getPublicCatalogFilterOptions.mockResolvedValue({
        categories: [],
        merchants: [],
      });
      if (failure === "catalog") {
        getPublicCatalog.mockRejectedValue(new Error("internal details"));
      } else {
        getPublicCatalogFilterOptions.mockRejectedValue(
          new Error("internal details"),
        );
      }

      render(await ProductsPage({ searchParams: Promise.resolve({}) }));

      expect(
        screen.getByText("Katalog belum dapat dimuat"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Silakan coba lagi beberapa saat lagi."),
      ).toBeInTheDocument();
      expect(screen.queryByText("internal details")).not.toBeInTheDocument();
    },
  );
});
