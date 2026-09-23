import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "./page";

describe("foundation homepage", () => {
  it("shows the marketplace identity and development status", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Sungairujing Marketplace",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Marketplace lokal UMKM Desa Sungairujing"),
    ).toBeInTheDocument();
    expect(screen.getByText("Status development")).toBeInTheDocument();
  });
});
