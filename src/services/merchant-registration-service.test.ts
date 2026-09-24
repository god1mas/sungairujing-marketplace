import { describe, expect, it, vi } from "vitest";
import { registerMerchant } from "./merchant-registration-service";

const validInput = {
  ownerName: "Siti Aminah",
  merchantName: "Dapur Siti",
  whatsappNumber: "+62 812-3456-7890",
  password: "rahasia8",
  merchantAddress: "Desa Sungairujing",
  termsAccepted: true as const,
};

describe("registerMerchant", () => {
  it("hashes the password and persists only the safe registration shape", async () => {
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
  });

  it("rejects equivalent WhatsApp formats through safe unique handling", async () => {
    const persist = vi.fn().mockRejectedValue({
      code: "P2002",
      meta: { target: ["whatsapp_number"] },
    });

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
  });

  it("does not expose unexpected persistence errors", async () => {
    const persist = vi
      .fn()
      .mockRejectedValue(new Error("raw database connection detail"));

    const result = await registerMerchant(validInput, {
      hash: vi.fn().mockResolvedValue("$argon2id$hash"),
      persist,
    });

    expect(result).toEqual({
      success: false,
      message: "Registrasi belum berhasil. Silakan coba lagi.",
    });
    expect(JSON.stringify(result)).not.toContain("raw database");
  });

  it("does not persist invalid input", async () => {
    const persist = vi.fn();
    const result = await registerMerchant(
      { ...validInput, termsAccepted: false },
      { persist },
    );

    expect(result.success).toBe(false);
    expect(persist).not.toHaveBeenCalled();
  });
});
