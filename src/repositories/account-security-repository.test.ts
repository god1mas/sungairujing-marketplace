import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  findAccountPasswordById,
  replaceAccountPasswordHash,
} from "./account-security-repository";

describe("account security repository", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads only the authenticated account password record", async () => {
    database.user.findUnique.mockResolvedValue(null);
    await findAccountPasswordById("authenticated-user");

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: { id: "authenticated-user" },
      select: { id: true, passwordHash: true },
    });
  });

  it("atomically replaces the expected hash and advances userVersion", async () => {
    const changedAt = new Date("2026-09-24T02:00:00.000Z");
    database.user.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      replaceAccountPasswordHash({
        userId: "authenticated-user",
        expectedPasswordHash: "old-hash",
        newPasswordHash: "new-hash",
        changedAt,
      }),
    ).resolves.toBe(true);
    expect(database.user.updateMany).toHaveBeenCalledWith({
      where: {
        id: "authenticated-user",
        passwordHash: "old-hash",
      },
      data: { passwordHash: "new-hash", updatedAt: changedAt },
    });
  });
});
