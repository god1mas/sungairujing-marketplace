import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import { createMerchantRegistration } from "./merchant-registration-repository";

describe("createMerchantRegistration", () => {
  const transaction = {
    merchant: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    user: { create: vi.fn() },
    merchantMembership: { create: vi.fn() },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(
      async (callback: (value: typeof transaction) => unknown) =>
        callback(transaction),
    );
    transaction.merchant.findMany.mockResolvedValue([]);
    transaction.user.create.mockResolvedValue({ id: "user-id" });
    transaction.merchant.create.mockResolvedValue({ id: "merchant-id" });
    transaction.merchantMembership.create.mockResolvedValue({
      id: "membership-id",
    });
  });

  it("creates User, unverified active Merchant, and active OWNER atomically", async () => {
    await expect(
      createMerchantRegistration({
        ownerName: "Siti Aminah",
        merchantName: "Dapur Siti",
        merchantSlugBase: "dapur-siti",
        whatsappNumber: "6281234567890",
        passwordHash: "$argon2id$hash",
        merchantAddress: "Desa Sungairujing",
        termsAcceptedAt: new Date("2026-09-24T00:00:00.000Z"),
      }),
    ).resolves.toEqual({ userId: "user-id", merchantId: "merchant-id" });

    expect(database.$transaction).toHaveBeenCalledOnce();
    expect(transaction.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          globalRole: "USER",
          passwordHash: "$argon2id$hash",
        }),
      }),
    );
    expect(transaction.merchant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "ACTIVE",
          verificationStatus: "BELUM_DIVERIFIKASI",
          publicWhatsappNumber: "6281234567890",
        }),
      }),
    );
    expect(transaction.merchantMembership.create).toHaveBeenCalledWith({
      data: {
        userId: "user-id",
        merchantId: "merchant-id",
        role: "OWNER",
        isActive: true,
      },
    });
    expect(transaction).not.toHaveProperty("verificationSubmission");
    expect(transaction).not.toHaveProperty("verificationEvidence");
  });

  it("propagates a transaction failure without attempting later writes", async () => {
    transaction.merchant.create.mockRejectedValue(new Error("failed"));

    await expect(
      createMerchantRegistration({
        ownerName: "Siti Aminah",
        merchantName: "Dapur Siti",
        merchantSlugBase: "dapur-siti",
        whatsappNumber: "6281234567890",
        passwordHash: "$argon2id$hash",
        merchantAddress: "Desa Sungairujing",
        termsAcceptedAt: new Date(),
      }),
    ).rejects.toThrow("failed");

    expect(database.$transaction).toHaveBeenCalledOnce();
    expect(transaction.merchantMembership.create).not.toHaveBeenCalled();
  });
});
