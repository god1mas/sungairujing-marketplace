import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  verificationSubmission: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
  merchant: { update: vi.fn() },
  notification: { createMany: vi.fn() },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import { reviewVerificationSubmission } from "./merchant-verification-repository";

const pending = {
  id: "submission-a",
  status: "PENDING",
  merchantId: "merchant-a",
  merchant: {
    name: "Warung A",
    memberships: [{ userId: "merchant-user-a" }],
  },
  evidences: [{ id: "evidence-a" }],
};

describe("merchant verification repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation((operation) =>
      operation(database),
    );
    database.verificationSubmission.findUnique.mockResolvedValue(pending);
    database.verificationSubmission.updateMany.mockResolvedValue({ count: 1 });
    database.merchant.update.mockResolvedValue({});
    database.notification.createMany.mockResolvedValue({ count: 1 });
  });

  it("atomically approves the pending submission, merchant, and authoritative recipients", async () => {
    await reviewVerificationSubmission({
      submissionId: "submission-a",
      reviewerUserId: "admin-a",
      decision: "APPROVE",
    });
    expect(database.verificationSubmission.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "submission-a", status: "PENDING" },
        data: expect.objectContaining({
          status: "APPROVED",
          rejectionReason: null,
        }),
      }),
    );
    expect(database.merchant.update).toHaveBeenCalledWith({
      where: { id: "merchant-a" },
      data: { verificationStatus: "TERVERIFIKASI" },
    });
    expect(database.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          recipientUserId: "merchant-user-a",
          merchantId: "merchant-a",
          type: "VERIFICATION_APPROVED",
        }),
      ],
    });
  });

  it("atomically rejects with a reason without touching moderation or operational state", async () => {
    await reviewVerificationSubmission({
      submissionId: "submission-a",
      reviewerUserId: "admin-a",
      decision: "REJECT",
      rejectionReason: "Dokumen tidak terbaca.",
    });
    expect(database.verificationSubmission.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "REJECTED",
          rejectionReason: "Dokumen tidak terbaca.",
        }),
      }),
    );
    const merchantData = database.merchant.update.mock.calls[0][0].data;
    expect(merchantData).toEqual({ verificationStatus: "DITOLAK" });
    expect(merchantData).not.toHaveProperty("status");
    expect(merchantData).not.toHaveProperty("operationalStatus");
    expect(database.notification.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          type: "VERIFICATION_REJECTED",
          message: expect.stringContaining("Dokumen tidak terbaca."),
        }),
      ],
    });
  });

  it("refuses a repeated decision before any state-changing write", async () => {
    database.verificationSubmission.findUnique.mockResolvedValue({
      ...pending,
      status: "APPROVED",
    });
    await expect(
      reviewVerificationSubmission({
        submissionId: "submission-a",
        reviewerUserId: "admin-a",
        decision: "REJECT",
        rejectionReason: "Tidak valid",
      }),
    ).resolves.toBeNull();
    expect(database.merchant.update).not.toHaveBeenCalled();
    expect(database.notification.createMany).not.toHaveBeenCalled();
  });
});
