import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ShareButton } from "./share-button";

describe("ShareButton", () => {
  afterEach(cleanup);
  it("uses Web Share with a same-origin canonical product URL", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: share,
    });
    render(<ShareButton title="Kerupuk" path="/products/kerupuk" />);
    fireEvent.click(screen.getByRole("button", { name: "Bagikan produk" }));
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "Kerupuk",
        url: "http://localhost:3000/products/kerupuk",
      }),
    );
    expect(
      await screen.findByText("Tautan siap dibagikan."),
    ).toBeInTheDocument();
  });
  it("copies the URL when Web Share is unavailable", async () => {
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(<ShareButton title="Kerupuk" path="/products/kerupuk" />);
    fireEvent.click(screen.getByRole("button", { name: "Bagikan produk" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        "http://localhost:3000/products/kerupuk",
      ),
    );
    expect(await screen.findByText("Tautan disalin.")).toBeInTheDocument();
  });
});
