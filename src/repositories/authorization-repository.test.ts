import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  merchantMembership: { findFirst: vi.fn() },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findActiveMerchantMembership,
  findAuthorizationUserById,
} from "./authorization-repository";

describe("authorization repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads current account state without sensitive fields", async () => {
    database.user.findUnique.mockResolvedValue(null);
    await findAuthorizationUserById("user-a");

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-a" },
      select: {
        id: true,
        globalRole: true,
        isActive: true,
        updatedAt: true,
      },
    });
  });

  it("requires the trusted user, target merchant, active state, and role", async () => {
    database.merchantMembership.findFirst.mockResolvedValue(null);
    await findActiveMerchantMembership({
      userId: "user-a",
      merchantId: "merchant-a",
      roles: ["OWNER"],
    });

    expect(database.merchantMembership.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-a",
          merchantId: "merchant-a",
          isActive: true,
          role: { in: ["OWNER"] },
        },
      }),
    );
    const select =
      database.merchantMembership.findFirst.mock.calls[0][0].select;
    expect(select.merchant.select).toEqual({
      status: true,
      verificationStatus: true,
      suspensionReason: true,
    });
    expect(select.merchant.select).not.toHaveProperty("suspendedByUserId");
  });
});
