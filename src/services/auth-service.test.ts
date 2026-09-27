import { GlobalUserRole, Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
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

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
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

  it("distinguishes false and exception verification without changing failure behavior", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const user = await createAuthUser();

    await expect(
      authenticateCredentials(
        { whatsappNumber: user.whatsappNumber, password: "password-salah" },
        vi.fn().mockResolvedValue(user),
      ),
    ).resolves.toBeNull();
    await expect(
      authenticateCredentials(
        { whatsappNumber: user.whatsappNumber, password: "password-benar" },
        vi.fn().mockResolvedValue({ ...user, passwordHash: "bukan-hash" }),
      ),
    ).resolves.toBeNull();

    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] password-verify-false",
    );
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] password-verify-exception",
    );
  });

  it("logs successful authorization without logging authentication data", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const user = await createAuthUser();
    const password = "password-benar";

    await authenticateCredentials(
      { whatsappNumber: user.whatsappNumber, password },
      vi.fn().mockResolvedValue(user),
    );

    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] password-verify-pass",
    );
    const output = JSON.stringify(logger.mock.calls);
    expect(output).not.toContain(user.whatsappNumber);
    expect(output).not.toContain(user.passwordHash);
    expect(output).not.toContain(user.id);
    expect(output).not.toContain(password);
  });

  it("categorizes a Prisma lookup exception without changing thrown behavior", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const error = new Prisma.PrismaClientInitializationError(
      "sensitive database provider detail",
      "6.12.0",
      "P1001",
    );

    await expect(
      authenticateCredentials(
        { whatsappNumber: "081234567890", password: "password-benar" },
        vi.fn().mockRejectedValue(error),
      ),
    ).rejects.toBe(error);

    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] user-lookup-exception",
    );
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] user-lookup-error-class:prisma-initialization-error",
    );
    const output = JSON.stringify(logger.mock.calls);
    expect(output).not.toContain(error.message);
    expect(output).not.toContain("P1001");
  });
});

describe("authenticateLogin", () => {
  it("allows a valid login without recording a failure", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
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
    expect(logger).toHaveBeenCalledWith("[auth-diagnostic] authorize-success");
  });

  it("logs fixed key-construction and limiter-initialization success stages", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const sensitiveKey = "rate-limit-key-that-must-not-be-logged";
    const sensitiveIp = "203.0.113.77";
    const sensitiveIdentifier = "081299999999";
    const limiter = {
      isAllowed: vi.fn().mockResolvedValue(false),
      recordFailure: vi.fn(),
    };

    await authenticateLogin(
      {
        whatsappNumber: sensitiveIdentifier,
        password: "credential-that-must-not-be-logged",
      },
      { ipAddress: sensitiveIp },
      {
        createRateLimitKey: vi.fn().mockReturnValue(sensitiveKey),
        getLimiter: vi.fn().mockReturnValue(limiter),
      },
    );

    expect(logger.mock.calls.map(([message]) => message)).toEqual([
      "[auth-diagnostic] input-validation-pass",
      "[auth-diagnostic] rate-limit-key-start",
      "[auth-diagnostic] rate-limit-key-pass",
      "[auth-diagnostic] rate-limiter-init-start",
      "[auth-diagnostic] rate-limiter-init-pass",
      "[auth-diagnostic] rate-limit-check-start",
      "[auth-diagnostic] rate-limit-blocked",
    ]);
    const output = JSON.stringify(logger.mock.calls);
    expect(output).not.toContain(sensitiveKey);
    expect(output).not.toContain(sensitiveIp);
    expect(output).not.toContain(sensitiveIdentifier);
    expect(output).not.toContain("credential-that-must-not-be-logged");
  });

  it("logs only a fixed category when key construction throws", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const error = new Error("sensitive-key-construction-detail");

    await expect(
      authenticateLogin(
        { whatsappNumber: "081234567890", password: "password-benar" },
        { ipAddress: "203.0.113.10" },
        {
          createRateLimitKey: vi.fn(() => {
            throw error;
          }),
        },
      ),
    ).rejects.toBe(error);

    expect(logger).toHaveBeenLastCalledWith(
      "[auth-diagnostic] rate-limit-key-exception",
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(error.message);
  });

  it("logs only a fixed category when limiter initialization throws", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const error = new Error("sensitive-limiter-initialization-detail");

    await expect(
      authenticateLogin(
        { whatsappNumber: "081234567890", password: "password-benar" },
        { ipAddress: "203.0.113.10" },
        {
          getLimiter: vi.fn(() => {
            throw error;
          }),
        },
      ),
    ).rejects.toBe(error);

    expect(logger).toHaveBeenLastCalledWith(
      "[auth-diagnostic] rate-limiter-init-exception",
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(error.message);
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
