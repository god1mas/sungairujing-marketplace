import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "./product-card";

describe("ProductCard", () => {
  it("shows documented product information and an explicit sold-out state", () => {
    render(
      <ProductCard
        product={{
          id: "product-id",
          name: "Kerupuk Ikan",
          slug: "kerupuk-ikan",
          price: "15000.00",
          unit: "bungkus",
          availability: "HABIS",
          merchant: { name: "Dapur Bawean", slug: "dapur-bawean" },
          image: null,
        }}
      />,
    );

    expect(screen.getByText("Kerupuk Ikan")).toBeInTheDocument();
    expect(screen.getByText("Dapur Bawean")).toBeInTheDocument();
    expect(screen.getByText("Habis")).toBeInTheDocument();
    expect(screen.getByText(/Rp\s?15\.000/)).toBeInTheDocument();
    expect(screen.queryByText(/Sungairujing/)).not.toBeInTheDocument();
  });
});
