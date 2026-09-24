import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MerchantCard } from "./merchant-card";

describe("MerchantCard", () => {
  it("shows factual merchant state and only shows verification when verified", () => {
    render(
      <MerchantCard
        merchant={{
          id: "merchant-id",
          name: "Dapur Sungairujing",
          slug: "dapur-sungairujing",
          description: "Makanan lokal.",
          logo: null,
          address: "Desa Sungairujing",
          operationalStatus: "BUKA",
          isVerified: true,
        }}
      />,
    );

    expect(screen.getByText("✓ Terverifikasi")).toBeInTheDocument();
    expect(screen.getByText("Buka")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Lihat merchant" }),
    ).toHaveAttribute("href", "/merchant/dapur-sungairujing");
    expect(
      screen.getByLabelText("Logo Dapur Sungairujing belum tersedia"),
    ).toBeInTheDocument();
  });
});
