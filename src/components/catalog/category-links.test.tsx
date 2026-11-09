import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryLinks } from "./category-links";

describe("CategoryLinks", () => {
  it("renders accessible category navigation with encoded destinations", () => {
    render(
      <CategoryLinks
        categories={[
          { name: "Makanan & Minuman", slug: "makanan-minuman" },
          { name: "Kerajinan", slug: "kerajinan" },
        ]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Jelajahi Kategori" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Makanan & Minuman/ }),
    ).toHaveAttribute("href", "/products?category=makanan-minuman");
    expect(screen.getByRole("link", { name: "Semua produk" })).toHaveAttribute(
      "href",
      "/products",
    );
  });

  it("renders nothing when no categories are available", () => {
    const { container } = render(<CategoryLinks categories={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
