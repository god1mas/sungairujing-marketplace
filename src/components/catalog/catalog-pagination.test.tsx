import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { parseCatalogQuery } from "@/features/catalog/catalog-query";
import { CatalogPagination } from "./catalog-pagination";

describe("CatalogPagination", () => {
  it("keeps active filters in previous and next links", () => {
    render(
      <CatalogPagination
        query={parseCatalogQuery({
          q: "kopi",
          category: "minuman",
          page: "2",
        })}
        totalPages={4}
      />,
    );

    expect(screen.getByText("Halaman 2 dari 4")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sebelumnya" })).toHaveAttribute(
      "href",
      "/products?q=kopi&category=minuman",
    );
    expect(screen.getByRole("link", { name: "Berikutnya" })).toHaveAttribute(
      "href",
      "/products?q=kopi&category=minuman&page=3",
    );
  });

  it("does not render pagination for a single page", () => {
    const { container } = render(
      <CatalogPagination query={parseCatalogQuery({})} totalPages={1} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
