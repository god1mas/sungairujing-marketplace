import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductGallery } from "./product-gallery";

describe("ProductGallery", () => {
  it("lets keyboard-compatible thumbnail buttons select the main image", () => {
    render(
      <ProductGallery
        name="Kerupuk Ikan"
        images={[
          { url: "/cover.webp", alt: "Kemasan depan", isCover: true },
          { url: "/detail.webp", alt: "Isi kerupuk", isCover: false },
        ]}
      />,
    );

    const secondThumbnail = screen.getByRole("button", {
      name: "Tampilkan gambar 2 dari Kerupuk Ikan",
    });
    expect(secondThumbnail).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(secondThumbnail);

    expect(secondThumbnail).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByAltText("Isi kerupuk")).toHaveLength(2);
  });
});
