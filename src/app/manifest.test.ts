import { describe, expect, it } from "vitest";
import { BRAND_DESCRIPTION, BRAND_NAME } from "@/constants/branding";
import manifest from "./manifest";

describe("PWA manifest branding", () => {
  it("uses the official name and logo-derived install icons", () => {
    expect(manifest()).toEqual(
      expect.objectContaining({
        name: BRAND_NAME,
        short_name: BRAND_NAME,
        description: BRAND_DESCRIPTION,
        icons: [
          expect.objectContaining({
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          }),
          expect.objectContaining({
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          }),
        ],
      }),
    );
  });
});
