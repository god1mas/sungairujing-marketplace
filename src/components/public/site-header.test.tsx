import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteHeader } from "./site-header";

describe("public site header", () => {
  it("provides documented desktop and mobile navigation destinations", () => {
    render(<SiteHeader accountHref="/login" accountLabel="Masuk" />);

    const mainNavigation = screen.getByRole("navigation", {
      name: "Navigasi utama",
    });
    expect(
      within(mainNavigation).getByRole("link", { name: "Produk" }),
    ).toHaveAttribute("href", "/products");
    expect(
      within(mainNavigation).getByRole("link", { name: "Merchant" }),
    ).toHaveAttribute("href", "/merchants");
    expect(
      within(mainNavigation).getByRole("link", { name: "Keranjang" }),
    ).toHaveAttribute("href", "/cart");

    const mobileNavigation = screen.getByRole("navigation", {
      name: "Navigasi seluler",
    });
    expect(
      within(mobileNavigation).getByRole("link", { name: "Masuk" }),
    ).toHaveAttribute("href", "/login");
    expect(screen.getByText("Menu").closest("summary")).toBeInTheDocument();
  });
});
