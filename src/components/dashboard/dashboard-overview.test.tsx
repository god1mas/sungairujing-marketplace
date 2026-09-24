import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DashboardOverview } from "./dashboard-overview";

describe("DashboardOverview", () => {
  it("renders the three factual merchant product metrics", () => {
    render(
      <DashboardOverview
        metrics={{
          totalProducts: 8,
          availableProducts: 5,
          suspendedProducts: 2,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Dashboard Merchant" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Total Produk")).toBeInTheDocument();
    expect(screen.getByText("Produk Tersedia")).toBeInTheDocument();
    expect(screen.getByText("Produk Dibekukan")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText(/penjualan|pendapatan|pesanan/i)).toBeNull();
  });

  it("renders a useful zero-product state without fake metrics", () => {
    render(
      <DashboardOverview
        metrics={{
          totalProducts: 0,
          availableProducts: 0,
          suspendedProducts: 0,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Belum ada produk" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("0")).toHaveLength(3);
  });
});
