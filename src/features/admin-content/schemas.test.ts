import { describe, expect, it } from "vitest";
import { bannerSchema, categorySchema, featuredSchema } from "./schemas";
describe("admin content validation", () => {
  it("normalizes category input and rejects empty names", () => {
    expect(categorySchema.parse({ name: "  Makanan Lokal  " }).name).toBe(
      "Makanan Lokal",
    );
    expect(categorySchema.safeParse({ name: " " }).success).toBe(false);
  });
  it("rejects unsafe banner URLs and invalid date ranges", () => {
    for (const targetUrl of [
      "javascript:alert(1)",
      "data:text/html,payload",
      "vbscript:msgbox(1)",
      "//evil.example/phishing",
      "/\\evil.example/phishing",
      "not a url",
    ]) {
      expect(
        bannerSchema.safeParse({ title: "Promo", targetUrl, isActive: true })
          .success,
      ).toBe(false);
    }
    expect(
      bannerSchema.safeParse({
        title: "Promo",
        targetUrl: "/products",
        startAt: "2026-12-02",
        endAt: "2026-12-01",
        isActive: true,
      }).success,
    ).toBe(false);
    expect(
      bannerSchema.safeParse({
        title: "Promo",
        targetUrl: "https://example.com",
        isActive: true,
      }).success,
    ).toBe(true);
    expect(
      bannerSchema.safeParse({
        title: "Promo",
        targetUrl: "/products?category=makanan#catalog",
        isActive: true,
      }).success,
    ).toBe(true);
  });
  it("enforces featured positions one through five", () => {
    const merchantId = "0cd65d14-1120-45bc-880a-f8c9a2cb188d";
    expect(featuredSchema.safeParse({ merchantId, sortOrder: 1 }).success).toBe(
      true,
    );
    expect(featuredSchema.safeParse({ merchantId, sortOrder: 6 }).success).toBe(
      false,
    );
  });
});
