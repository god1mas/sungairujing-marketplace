import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TrackedWhatsAppLink } from "./tracked-whatsapp-link";

describe("TrackedWhatsAppLink", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("does not prevent WhatsApp navigation when analytics rejects", () => {
    const fetch = vi.fn().mockRejectedValue(new Error("analytics unavailable"));
    vi.stubGlobal("fetch", fetch);
    render(
      <TrackedWhatsAppLink
        href="https://wa.me/628123456789"
        source="CHECKOUT"
        merchantSlug="merchant-a"
      >
        Lanjut ke WhatsApp
      </TrackedWhatsAppLink>,
    );
    const link = screen.getByRole("link");
    const allowed = fireEvent.click(link);
    expect(allowed).toBe(true);
    expect(link).toHaveAttribute("href", "https://wa.me/628123456789");
    expect(fetch).toHaveBeenCalledWith(
      "/api/analytics/whatsapp",
      expect.objectContaining({ keepalive: true }),
    );
  });
});
