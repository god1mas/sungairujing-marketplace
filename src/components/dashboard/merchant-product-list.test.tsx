import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));
vi.mock("@/features/products/actions", () => ({
  initialProductActionState: { success: false },
  deleteProductAction: vi.fn(),
}));

import { MerchantProductList } from "./merchant-product-list";

afterEach(cleanup);

const product = {
  id: "10000000-0000-4000-8000-000000000010",
  name: "Kerupuk Ikan",
  slug: "kerupuk-ikan",
  description: "Kerupuk lokal",
  price: "15000.00",
  unit: "bungkus",
  categoryId: "10000000-0000-4000-8000-000000000001",
  categoryName: "Makanan",
  categoryActive: true,
  availabilityStatus: "HABIS" as const,
  moderationStatus: "SUSPENDED" as const,
  suspensionReason: "Melanggar kebijakan",
  image: null,
};

describe("MerchantProductList", () => {
  it("renders factual availability, suspension, reason, and missing image states", () => {
    render(
      <MerchantProductList
        products={[
          {
            id: "10000000-0000-4000-8000-000000000010",
            name: "Kerupuk Ikan",
            slug: "kerupuk-ikan",
            description: "Kerupuk lokal",
            price: new Prisma.Decimal("15000.00").toFixed(2),
            unit: "bungkus",
            categoryId: "10000000-0000-4000-8000-000000000001",
            categoryName: "Makanan",
            categoryActive: true,
            availabilityStatus: "HABIS",
            moderationStatus: "SUSPENDED",
            suspensionReason: "Melanggar kebijakan",
            image: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Foto belum tersedia")).toBeInTheDocument();
    expect(screen.getByText("Habis")).toBeInTheDocument();
    expect(screen.getByText("Dibekukan")).toBeInTheDocument();
    expect(screen.getByText(/Alasan: Melanggar kebijakan/)).toBeInTheDocument();
  });

  it("keeps product data visible but hides destructive controls in read-only mode", () => {
    render(<MerchantProductList products={[product]} readOnly />);
    expect(screen.getByText("Kerupuk Ikan")).toBeVisible();
    expect(screen.getByRole("link", { name: "Lihat" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: /hapus permanen/i }),
    ).not.toBeInTheDocument();
  });

  it("provides an explicit keyboard-accessible permanent-delete confirmation", () => {
    render(
      <MerchantProductList
        products={[
          {
            id: "10000000-0000-4000-8000-000000000010",
            name: "Kopi Lokal",
            slug: "kopi-lokal",
            description: "Kopi",
            price: "10000.00",
            unit: "pak",
            categoryId: "10000000-0000-4000-8000-000000000001",
            categoryName: "Minuman",
            categoryActive: true,
            availabilityStatus: "TERSEDIA",
            moderationStatus: "ACTIVE",
            suspensionReason: null,
            image: null,
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Hapus permanen Kopi Lokal" }),
    );
    expect(screen.getByRole("alertdialog")).toHaveTextContent(
      "Produk “Kopi Lokal” dan data terkait akan dihapus.",
    );
    expect(
      screen.getByRole("button", { name: "Ya, hapus Kopi Lokal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Batal" })).toBeInTheDocument();
  });

  it("renders a useful empty state", () => {
    render(<MerchantProductList products={[]} />);
    expect(
      screen.getByRole("heading", { name: "Belum ada produk" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tambah Produk" })).toHaveAttribute(
      "href",
      "/dashboard/products/new",
    );
  });

  it("does not advertise product creation in an empty read-only state", () => {
    render(<MerchantProductList products={[]} readOnly />);
    expect(
      screen.queryByRole("link", { name: "Tambah Produk" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Penambahan produk dinonaktifkan/)).toBeVisible();
  });
});
