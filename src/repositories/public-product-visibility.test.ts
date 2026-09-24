import { describe, expect, it } from "vitest";
import {
  publicMerchantEligibility,
  publicProductEligibility,
} from "./public-product-visibility";

describe("public eligibility remains independent from verification", () => {
  it("does not use merchant verification as a publication gate", () => {
    expect(publicMerchantEligibility).toEqual({ status: "ACTIVE" });
    expect(publicMerchantEligibility).not.toHaveProperty("verificationStatus");
    expect(publicProductEligibility).toEqual({
      moderationStatus: "ACTIVE",
      merchant: { status: "ACTIVE" },
    });
    expect(publicProductEligibility.merchant).not.toHaveProperty(
      "verificationStatus",
    );
  });
});
