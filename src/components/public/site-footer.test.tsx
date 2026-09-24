import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";

describe("public site footer", () => {
  it("renders brand, information, and documented public navigation", () => {
    render(<SiteFooter />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Navigasi footer" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Produk" })).toHaveAttribute(
      "href",
      "/products",
    );
    expect(screen.getByRole("link", { name: "Merchant" })).toHaveAttribute(
      "href",
      "/merchants",
    );
  });
});
