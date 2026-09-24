import { GlobalUserRole } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { hashPassword } from "@/lib/auth/password";
import { authenticateCredentials, authenticateLogin } from "./auth-service";

const createAuthUser = async () => ({
  id: "00000000-0000-4000-8000-000000000001",
  name: "Pemilik Merchant",
  whatsappNumber: "6281234567890",
  passwordHash: await hashPassword("password-benar"),
  globalRole: GlobalUserRole.USER,
  isActive: true,
  updatedAt: new Date("2026-09-24T00:00:00.000Z"),
});

describe("authenticateCredentials", () => {
  it("normalizes identity and returns only safe session identity", async () => {
    const user = await createAuthUser();
    const findUser = vi.fn().mockResolvedValue(user);

    const identity = await authenticateCredentials(
      { whatsappNumber: "0812-3456-7890", password: "password-benar" },
      findUser,
    );

    expect(findUser).toHaveBeenCalledWith("6281234567890");
    expect(identity).toEqual({
      id: user.id,
      name: user.name,
      globalRole: GlobalUserRole.USER,
      userVersion: "2026-09-24T00:00:00.000Z",
    });
    expect(identity).not.toHaveProperty("passwordHash");
  });

  it("returns the same null result for malformed identity and invalid password", async () => {
    const user = await createAuthUser();
    const findUser = vi.fn().mockResolvedValue(user);

    await expect(
      authenticateCredentials(
        { whatsappNumber: "nomor-invalid", password: "password-benar" },
        findUser,
      ),
    ).resolves.toBeNull();
    await expect(
      authenticateCredentials(
        { whatsappNumber: user.whatsappNumber, password: "password-salah" },
        findUser,
      ),
    ).resolves.toBeNull();
  });

  it("rejects inactive users", async () => {
    const user = { ...(await createAuthUser()), isActive: false };

    await expect(
      authenticateCredentials(
        { whatsappNumber: user.whatsappNumber, password: "password-benar" },
        vi.fn().mockResolvedValue(user),
      ),
    ).resolves.toBeNull();
  });

  it("returns a Super Admin role only when it comes from the database", async () => {
    const user = {
      ...(await createAuthUser()),
      globalRole: GlobalUserRole.SUPER_ADMIN,
    };

    await expect(
      authenticateCredentials(
        { whatsappNumber: user.whatsappNumber, password: "password-benar" },
        vi.fn().mockResolvedValue(user),
      ),
    ).resolves.toMatchObject({ globalRole: GlobalUserRole.SUPER_ADMIN });
  });
});

describe("authenticateLogin", () => {
  it("allows a valid login without recording a failure", async () => {
    const user = await createAuthUser();
    const limiter = {
      isAllowed: vi.fn().mockResolvedValue(true),
      recordFailure: vi.fn(),
    };

    const identity = await authenticateLogin(
      { whatsappNumber: "0812-3456-7890", password: "password-benar" },
      { ipAddress: "203.0.113.10" },
      { limiter, findUser: vi.fn().mockResolvedValue(user) },
    );

    expect(identity).toMatchObject({ id: user.id, globalRole: "USER" });
    expect(limiter.recordFailure).not.toHaveBeenCalled();
  });

  it.each([null, "wrong-password"])(
    "returns a generic null identity and records unknown/invalid credentials",
    async (failure) => {
      const user = await createAuthUser();
      const limiter = {
        isAllowed: vi.fn().mockResolvedValue(true),
        recordFailure: vi.fn().mockResolvedValue({
          allowed: true,
          remaining: 4,
          retryAfterSeconds: 900,
        }),
      };

      const identity = await authenticateLogin(
        {
          whatsappNumber: "081234567890",
          password: failure ?? "password-benar",
        },
        { ipAddress: "203.0.113.10" },
        {
          limiter,
          findUser: vi.fn().mockResolvedValue(failure ? user : null),
        },
      );

      expect(identity).toBeNull();
      expect(limiter.recordFailure).toHaveBeenCalledOnce();
    },
  );

  it("rejects an attempt before credential lookup when rate limited", async () => {
    const findUser = vi.fn();
    const limiter = {
      isAllowed: vi.fn().mockResolvedValue(false),
      recordFailure: vi.fn(),
    };

    await expect(
      authenticateLogin(
        { whatsappNumber: "081234567890", password: "password-benar" },
        { ipAddress: "203.0.113.10" },
        { limiter, findUser },
      ),
    ).resolves.toBeNull();
    expect(findUser).not.toHaveBeenCalled();
  });
});
