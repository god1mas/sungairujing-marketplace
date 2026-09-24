import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MerchantDetailView } from "./merchant-detail-view";

const merchant = {
  id: "merchant-id",
  name: "Dapur Sungairujing",
  slug: "dapur-sungairujing",
  description: "Makanan lokal Sungairujing.",
  logo: null,
  address: "Desa Sungairujing",
  operationalStatus: "BUKA" as const,
  isVerified: false,
  whatsappUrl: "https://wa.me/6281234567890",
  openingHours: [{ label: "Senin", value: "08.00–16.00" }],
  products: [],
};

describe("MerchantDetailView", () => {
  it("renders public profile fields, general contact, and empty products", () => {
    render(<MerchantDetailView merchant={merchant} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Dapur Sungairujing",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Desa Sungairujing")).toBeInTheDocument();
    expect(screen.getByText("08.00–16.00")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Hubungi merchant via WhatsApp" }),
    ).toHaveAttribute("href", "https://wa.me/6281234567890");
    expect(screen.queryByText(/terverifikasi/i)).not.toBeInTheDocument();
    expect(screen.getByText("Belum ada produk yang tersedia")).toBeVisible();
  });

  it("contains no cart, checkout, QR, analytics, or private owner data", () => {
    render(<MerchantDetailView merchant={merchant} />);

    expect(
      screen.queryByText(/keranjang|checkout|kode qr|pemilik|anggota/i),
    ).not.toBeInTheDocument();
  });
});
