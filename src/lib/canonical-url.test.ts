import { describe, expect, it } from "vitest";
import { buildCanonicalPublicUrl } from "./canonical-url";

describe("buildCanonicalPublicUrl", () => {
  it("builds an absolute merchant URL from the configured origin", () => {
    expect(
      buildCanonicalPublicUrl(
        "/merchant/toko-aman",
        "https://pasar.example/base",
      ),
    ).toBe("https://pasar.example/merchant/toko-aman");
  });
  it("rejects missing, unsafe, and non-http configuration", () => {
    expect(buildCanonicalPublicUrl("/merchant/toko", undefined)).toBeNull();
    expect(
      buildCanonicalPublicUrl("//evil.test", "https://pasar.example"),
    ).toBeNull();
    expect(
      buildCanonicalPublicUrl("/merchant/toko", "javascript:alert(1)"),
    ).toBeNull();
  });
});
