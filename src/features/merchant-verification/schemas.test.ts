import { describe, expect, it } from "vitest";
import { verificationReviewSchema } from "./schemas";

describe("verification review schema", () => {
  it("accepts approval without a reason", () => {
    expect(
      verificationReviewSchema.safeParse({ decision: "APPROVE" }).success,
    ).toBe(true);
  });

  it("requires a meaningful rejection reason", () => {
    expect(
      verificationReviewSchema.safeParse({
        decision: "REJECT",
        rejectionReason: "",
      }).success,
    ).toBe(false);
    expect(
      verificationReviewSchema.safeParse({
        decision: "REJECT",
        rejectionReason: "Dokumen tidak terbaca.",
      }).success,
    ).toBe(true);
  });
});
