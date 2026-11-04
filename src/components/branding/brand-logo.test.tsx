import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BRAND_LOGO_HEIGHT, BRAND_LOGO_WIDTH } from "@/constants/branding";
import { BrandLogo } from "./brand-logo";

afterEach(cleanup);

describe("BrandLogo", () => {
  it("renders the official asset with its original proportions and accessible name", () => {
    render(<BrandLogo />);

    const logo = screen.getByRole("img", {
      name: "Logo UMKM DESA SUNGAIRUJING",
    });
    expect(logo).toHaveAttribute("width", String(BRAND_LOGO_WIDTH));
    expect(logo).toHaveAttribute("height", String(BRAND_LOGO_HEIGHT));
    expect(logo.getAttribute("src")).toContain(
      "logo-umkm-desa-sungairujing.png",
    );
  });
});
