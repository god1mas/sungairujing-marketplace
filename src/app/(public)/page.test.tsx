import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Home, { metadata } from "./page";

afterEach(cleanup);

describe("public homepage shell", () => {
  it("renders the marketplace identity and factual public introduction", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Temukan Produk Lokal Sungairujing",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Mendekatkan produk lokal dengan masyarakat",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/status development/i)).not.toBeInTheDocument();
  });

  it("provides an accessible GET search entry point", async () => {
    render(await Home());

    const search = screen.getByRole("search");
    expect(search).toHaveAttribute("action", "/products");
    expect(search).toHaveAttribute("method", "get");
    expect(
      screen.getByRole("searchbox", { name: "Cari produk atau merchant" }),
    ).toHaveAttribute("name", "q");
    expect(screen.getByRole("button", { name: "Cari" })).toHaveAttribute(
      "type",
      "submit",
    );
  });

  it("defines public canonical and Open Graph metadata", () => {
    expect(metadata.alternates).toEqual({ canonical: "/" });
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: "website",
        locale: "id_ID",
        title: "Sungairujing Marketplace",
      }),
    );
  });
});
