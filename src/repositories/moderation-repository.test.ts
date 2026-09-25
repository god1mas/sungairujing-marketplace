import { beforeEach, describe, expect, it, vi } from "vitest";
const db = vi.hoisted(() => ({
  $transaction: vi.fn(),
  report: { findUnique: vi.fn(), updateMany: vi.fn() },
  product: { findUnique: vi.fn(), updateMany: vi.fn() },
  merchant: { findUnique: vi.fn(), updateMany: vi.fn() },
  moderationAction: { create: vi.fn(), findMany: vi.fn() },
  notification: { createMany: vi.fn() },
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: db }));
import {
  reactivateMerchant,
  suspendMerchant,
  suspendProduct,
  transitionReport,
} from "./moderation-repository";

describe("moderation repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    db.$transaction.mockImplementation((fn) => fn(db));
    db.report.updateMany.mockResolvedValue({ count: 1 });
    db.product.updateMany.mockResolvedValue({ count: 1 });
    db.merchant.updateMany.mockResolvedValue({ count: 1 });
  });
  it("allows only the documented report lifecycle", async () => {
    db.report.findUnique.mockResolvedValue({ status: "BARU" });
    await expect(
      transitionReport({
        reportId: "r",
        actorUserId: "admin",
        status: "DITINJAU",
      }),
    ).resolves.toEqual({ status: "DITINJAU" });
    db.report.findUnique.mockResolvedValue({ status: "BARU" });
    await expect(
      transitionReport({
        reportId: "r",
        actorUserId: "admin",
        status: "SELESAI",
      }),
    ).resolves.toBeNull();
  });
  it("atomically suspends a product with reason, action and notification", async () => {
    db.product.findUnique.mockResolvedValue({
      id: "p",
      name: "Produk",
      merchantId: "m",
      moderationStatus: "ACTIVE",
      merchant: { memberships: [{ userId: "u" }] },
    });
    await suspendProduct({
      productId: "p",
      actorUserId: "admin",
      reason: "Pelanggaran terkonfirmasi",
    });
    expect(db.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ moderationStatus: "SUSPENDED" }),
      }),
    );
    expect(db.moderationAction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "admin",
        actionType: "PRODUCT_SUSPENDED",
      }),
    });
    expect(db.notification.createMany).toHaveBeenCalled();
  });
  it("suspends and reactivates merchant without changing verification or operational state", async () => {
    db.merchant.findUnique.mockResolvedValue({
      id: "m",
      name: "Merchant",
      status: "ACTIVE",
      memberships: [{ userId: "u" }],
    });
    await suspendMerchant({
      merchantId: "m",
      actorUserId: "admin",
      reason: "Pelanggaran terkonfirmasi",
    });
    expect(db.merchant.updateMany.mock.calls[0][0].data).not.toHaveProperty(
      "verificationStatus",
    );
    expect(db.merchant.updateMany.mock.calls[0][0].data).not.toHaveProperty(
      "operationalStatus",
    );
    db.merchant.findUnique.mockResolvedValue({
      id: "m",
      name: "Merchant",
      status: "SUSPENDED",
      memberships: [{ userId: "u" }],
    });
    await reactivateMerchant({
      merchantId: "m",
      actorUserId: "admin",
      reason: "Pemulihan disetujui",
    });
    expect(db.moderationAction.create).toHaveBeenLastCalledWith({
      data: expect.objectContaining({ actionType: "MERCHANT_REACTIVATED" }),
    });
  });
});
