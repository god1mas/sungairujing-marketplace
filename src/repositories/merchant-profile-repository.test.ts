import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  merchant: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findOwnedMerchantProfile,
  replaceOwnedMerchantLogo,
  updateOwnedMerchantProfile,
} from "./merchant-profile-repository";

describe("merchant profile repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation((operation) =>
      operation(database),
    );
  });

  it("scopes profile reads to the authenticated user membership", async () => {
    database.merchant.findFirst.mockResolvedValue(null);
    await findOwnedMerchantProfile("merchant-a", "user-a");
    expect(database.merchant.findFirst.mock.calls[0][0].where).toEqual({
      id: "merchant-a",
      memberships: { some: { userId: "user-a", isActive: true } },
    });
  });

  it("updates only allowed merchant profile fields", async () => {
    database.merchant.updateMany.mockResolvedValue({ count: 1 });
    await updateOwnedMerchantProfile("merchant-a", {
      name: "Dapur",
      description: null,
      address: "Desa",
      openingHours: {
        senin: { closed: true },
        selasa: { closed: true },
        rabu: { closed: true },
        kamis: { closed: true },
        jumat: { closed: true },
        sabtu: { closed: true },
        minggu: { closed: true },
      },
      operationalStatus: "BUKA",
    });
    const call = database.merchant.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: "merchant-a" });
    expect(call.data).not.toHaveProperty("status");
    expect(call.data).not.toHaveProperty("verificationStatus");
    expect(call.data).not.toHaveProperty("publicWhatsappNumber");
    expect(call.data).not.toHaveProperty("slug");
  });

  it("returns the old logo only after replacing the owned merchant reference", async () => {
    database.merchant.findUnique.mockResolvedValue({
      logoStorageKey: "old.webp",
    });
    database.merchant.update.mockResolvedValue({});
    await expect(
      replaceOwnedMerchantLogo("merchant-a", "new.webp"),
    ).resolves.toEqual({ previousStorageKey: "old.webp" });
    expect(database.merchant.update).toHaveBeenCalledWith({
      where: { id: "merchant-a" },
      data: { logoStorageKey: "new.webp" },
    });
  });
});
