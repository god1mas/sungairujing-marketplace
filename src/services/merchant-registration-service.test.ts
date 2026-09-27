import { Prisma } from "@prisma/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerMerchant } from "./merchant-registration-service";

const validInput = {
  ownerName: "Siti Aminah",
  merchantName: "Dapur Siti",
  whatsappNumber: "+62 812-3456-7890",
  password: "rahasia8",
  merchantAddress: "Desa Sungairujing",
  termsAccepted: true as const,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("registerMerchant", () => {
  it("hashes the password and persists only the safe registration shape", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const hash = vi.fn().mockResolvedValue("$argon2id$secure-hash");
    const persist = vi.fn().mockResolvedValue({
      userId: "user-id",
      merchantId: "merchant-id",
    });

    const result = await registerMerchant(validInput, {
      hash,
      persist,
      now: () => new Date("2026-09-24T00:00:00.000Z"),
    });

    expect(result).toEqual({
      success: true,
      registration: { userId: "user-id", merchantId: "merchant-id" },
    });
    expect(hash).toHaveBeenCalledWith("rahasia8");
    expect(persist).toHaveBeenCalledWith({
      ownerName: "Siti Aminah",
      merchantName: "Dapur Siti",
      merchantSlugBase: "dapur-siti",
      whatsappNumber: "6281234567890",
      passwordHash: "$argon2id$secure-hash",
      merchantAddress: "Desa Sungairujing",
      termsAcceptedAt: new Date("2026-09-24T00:00:00.000Z"),
    });
    expect(JSON.stringify(persist.mock.calls)).not.toContain("rahasia8");
    expect(logger.mock.calls.map(([message]) => message)).toEqual([
      "[auth-diagnostic] registration-validation-pass",
      "[auth-diagnostic] registration-password-hash-start",
      "[auth-diagnostic] registration-password-hash-pass",
      "[auth-diagnostic] registration-persistence-start",
      "[auth-diagnostic] registration-persistence-pass",
    ]);
  });

  it("rejects equivalent WhatsApp formats through safe unique handling", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const persist = vi.fn().mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError(
        "sensitive unique constraint detail",
        {
          code: "P2002",
          clientVersion: "6.12.0",
          meta: { target: ["whatsapp_number"] },
        },
      ),
    );

    const result = await registerMerchant(
      { ...validInput, whatsappNumber: "081234567890" },
      { hash: vi.fn().mockResolvedValue("$argon2id$hash"), persist },
    );

    expect(result).toEqual({
      success: false,
      message: "Nomor WhatsApp sudah digunakan.",
      fieldErrors: {
        whatsappNumber: ["Nomor WhatsApp sudah digunakan."],
      },
    });
    expect(persist).toHaveBeenCalledWith(
      expect.objectContaining({ whatsappNumber: "6281234567890" }),
    );
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] registration-persistence-error-class:prisma-known-request-error",
    );
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] registration-persistence-prisma-code:P2002",
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      "sensitive unique constraint detail",
    );
  });

  it("keeps hash exceptions generic and does not start persistence", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const persist = vi.fn();

    const result = await registerMerchant(validInput, {
      hash: vi.fn().mockRejectedValue(new Error("sensitive native detail")),
      persist,
    });

    expect(result).toEqual({
      success: false,
      message: "Registrasi belum berhasil. Silakan coba lagi.",
    });
    expect(persist).not.toHaveBeenCalled();
    expect(logger).toHaveBeenLastCalledWith(
      "[auth-diagnostic] registration-password-hash-exception",
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain(
      "sensitive native detail",
    );
  });

  it("does not expose unexpected persistence errors", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const persist = vi
      .fn()
      .mockRejectedValue(
        new Prisma.PrismaClientInitializationError(
          "raw database connection detail",
          "6.12.0",
          "P1001",
        ),
      );

    const result = await registerMerchant(validInput, {
      hash: vi.fn().mockResolvedValue("$argon2id$hash"),
      persist,
    });

    expect(result).toEqual({
      success: false,
      message: "Registrasi belum berhasil. Silakan coba lagi.",
    });
    expect(JSON.stringify(result)).not.toContain("raw database");
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] registration-persistence-exception",
    );
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] registration-persistence-error-class:prisma-initialization-error",
    );
    expect(JSON.stringify(logger.mock.calls)).not.toContain("raw database");
  });

  it("does not persist invalid input", async () => {
    vi.stubEnv("AUTH_DIAGNOSTIC_LOGGING", "true");
    const logger = vi
      .spyOn(console, "info")
      .mockImplementation(() => undefined);
    const persist = vi.fn();
    const result = await registerMerchant(
      { ...validInput, termsAccepted: false },
      { persist },
    );

    expect(result.success).toBe(false);
    expect(persist).not.toHaveBeenCalled();
    expect(logger).toHaveBeenCalledWith(
      "[auth-diagnostic] registration-validation-fail",
    );
  });
});
