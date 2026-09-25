import { describe, expect, it } from "vitest";
import { publicReportSchema } from "./schema";

const base = { targetType: "PRODUCT", targetSlug: "kopi", reason: "SPAM" };
describe("public report schema", () => {
  it("accepts an anonymous report and optional identity", () => {
    expect(publicReportSchema.safeParse(base).success).toBe(true);
    expect(
      publicReportSchema.safeParse({
        ...base,
        reporterName: "Ayu",
        reporterWhatsapp: "081234567890",
      }).success,
    ).toBe(true);
  });
  it("requires details only for OTHER", () => {
    expect(
      publicReportSchema.safeParse({ ...base, reason: "OTHER" }).success,
    ).toBe(false);
    expect(
      publicReportSchema.safeParse({
        ...base,
        reason: "OTHER",
        details: "Alasan lain yang jelas",
      }).success,
    ).toBe(true);
  });
  it("rejects undocumented target and reason values", () => {
    expect(
      publicReportSchema.safeParse({ ...base, targetType: "USER" }).success,
    ).toBe(false);
    expect(
      publicReportSchema.safeParse({ ...base, reason: "BAD" }).success,
    ).toBe(false);
  });
});
