import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  transition: vi.fn(),
  suspendProduct: vi.fn(),
  suspendMerchant: vi.fn(),
  reactivateMerchant: vi.fn(),
}));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/authorization", () => ({
  requireSuperAdmin: mocks.authorize,
}));
vi.mock("@/repositories/report-repository", () => ({
  findReportDetail: vi.fn(),
  listReports: vi.fn(),
}));
vi.mock("@/repositories/moderation-repository", () => ({
  listModerationHistory: vi.fn(),
  transitionReport: mocks.transition,
  suspendProduct: mocks.suspendProduct,
  suspendMerchant: mocks.suspendMerchant,
  reactivateMerchant: mocks.reactivateMerchant,
}));
import { changeReportStatus, moderateTarget } from "./moderation-service";

const reportId = "3ee8e4e5-7cf1-4afe-ab0b-24efcbd4af47";
const targetId = "0cd65d14-1120-45bc-880a-f8c9a2cb188d";
describe("moderation service authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({ id: "admin" });
  });
  it("uses the authenticated Super Admin as report reviewer", async () => {
    mocks.transition.mockResolvedValue({ status: "DITINJAU" });
    await changeReportStatus({ reportId, status: "DITINJAU" });
    expect(mocks.transition).toHaveBeenCalledWith(
      expect.objectContaining({ actorUserId: "admin" }),
    );
  });
  it("rejects a Merchant calling a Super Admin-only mutation", async () => {
    mocks.authorize.mockRejectedValue(new Error("merchant forbidden"));
    await expect(
      moderateTarget({
        action: "SUSPEND_MERCHANT",
        targetId,
        reason: "Alasan moderasi",
      }),
    ).rejects.toThrow("merchant forbidden");
    expect(mocks.suspendMerchant).not.toHaveBeenCalled();
  });
  it("uses server-authoritative actor for explicit moderation", async () => {
    mocks.suspendMerchant.mockResolvedValue({ merchantId: targetId });
    await moderateTarget({
      action: "SUSPEND_MERCHANT",
      targetId,
      reason: "Alasan moderasi",
    });
    expect(mocks.suspendMerchant).toHaveBeenCalledWith({
      merchantId: targetId,
      actorUserId: "admin",
      reason: "Alasan moderasi",
    });
  });
});
