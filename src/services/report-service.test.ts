import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import {
  ReportRateLimitError,
  ReportTargetNotFoundError,
  submitPublicReport,
} from "./report-service";

const input = {
  targetType: "PRODUCT" as const,
  targetSlug: "kopi",
  reason: "SPAM" as const,
};
describe("public report service", () => {
  it("creates BARU report from authoritative target without moderation mutation", async () => {
    const create = vi.fn().mockResolvedValue({ id: "report", status: "BARU" });
    await submitPublicReport(input, {
      identify: async () => "visitor",
      consume: () => ({ allowed: true }),
      findTarget: vi.fn().mockResolvedValue({
        id: "product",
        name: "Kopi",
        merchantId: "merchant",
      }),
      create,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ targetSlug: "kopi" }),
      { id: "product", name: "Kopi", merchantId: "merchant" },
    );
    expect(create.mock.calls.flat().join(" ")).not.toContain("SUSPENDED");
  });
  it("rejects unavailable targets safely", async () => {
    await expect(
      submitPublicReport(input, {
        identify: async () => "visitor",
        consume: () => ({ allowed: true }),
        findTarget: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
      }),
    ).rejects.toBeInstanceOf(ReportTargetNotFoundError);
  });
  it("enforces rate limit before persistence without moderating target", async () => {
    const create = vi.fn();
    await expect(
      submitPublicReport(input, {
        identify: async () => "visitor",
        consume: () => ({ allowed: false }),
        findTarget: vi.fn(),
        create,
      }),
    ).rejects.toBeInstanceOf(ReportRateLimitError);
    expect(create).not.toHaveBeenCalled();
  });
  it("normalizes optional reporter WhatsApp", async () => {
    const create = vi.fn().mockResolvedValue({ id: "report" });
    await submitPublicReport(
      { ...input, reporterWhatsapp: "0812-3456-7890" },
      {
        identify: async () => "visitor",
        consume: () => ({ allowed: true }),
        findTarget: vi.fn().mockResolvedValue({
          id: "product",
          name: "Kopi",
          merchantId: "merchant",
        }),
        create,
      },
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ reporterWhatsapp: "6281234567890" }),
      expect.anything(),
    );
  });
});
