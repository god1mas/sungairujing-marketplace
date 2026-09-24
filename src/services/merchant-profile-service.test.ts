import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ForbiddenError } from "@/lib/auth/authorization";
import type { ObjectStorage } from "@/lib/storage/types";
import {
  getMerchantProfile,
  MerchantProfileNotFoundError,
  replaceMerchantLogo,
  updateMerchantProfile,
} from "./merchant-profile-service";

const membership = { merchantId: "merchant-a", userId: "user-a" };
const closedHours = {
  senin: { closed: true as const },
  selasa: { closed: true as const },
  rabu: { closed: true as const },
  kamis: { closed: true as const },
  jumat: { closed: true as const },
  sabtu: { closed: true as const },
  minggu: { closed: true as const },
};
const profile = {
  id: "merchant-a",
  name: "Dapur",
  slug: "dapur",
  description: null,
  logoStorageKey: null,
  address: "Desa",
  publicWhatsappNumber: "628111111111",
  openingHours: closedHours,
  operationalStatus: "BUKA" as const,
  verificationStatus: "BELUM_DIVERIFIKASI" as const,
  status: "ACTIVE" as const,
  memberships: [{ user: { whatsappNumber: "628111111111" } }],
};
const input = {
  name: "Dapur Baru",
  description: "Masakan lokal",
  address: "Desa Sungairujing",
  openingHours: closedHours,
  operationalStatus: "LIBUR_SEMENTARA" as const,
};

const storage = (): ObjectStorage => ({
  upload: vi.fn(async (value) => ({ bucket: value.bucket, path: value.path })),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(() => "https://media.example/logo.webp"),
  createSignedUrl: vi.fn(async () => "https://example.test/signed"),
});

const logoFile = async () => {
  const data = await sharp({
    create: { width: 4, height: 4, channels: 3, background: "#15803d" },
  })
    .png()
    .toBuffer();
  return new File([data], "logo.png", { type: "image/png" });
};

describe("merchant profile service", () => {
  it("reads only the profile resolved from authenticated membership", async () => {
    const findProfile = vi.fn().mockResolvedValue(profile);
    const result = await getMerchantProfile({
      authorizeRead: vi.fn().mockResolvedValue(membership),
      findProfile,
      resolveImageUrl: () => null,
    });
    expect(findProfile).toHaveBeenCalledWith("merchant-a", "user-a");
    expect(result.loginWhatsappNumber).toBe("628111111111");
    expect(result).not.toHaveProperty("status");
  });

  it("updates the authenticated merchant without admin-controlled fields", async () => {
    const updateProfile = vi.fn().mockResolvedValue({ count: 1 });
    await updateMerchantProfile(input, {
      authorizeMutation: vi.fn().mockResolvedValue(membership),
      updateProfile,
    });
    expect(updateProfile).toHaveBeenCalledWith(
      "merchant-a",
      expect.not.objectContaining({
        status: expect.anything(),
        verificationStatus: expect.anything(),
        publicWhatsappNumber: expect.anything(),
      }),
    );
  });

  it("rejects missing/cross-tenant results and suspended merchant mutations", async () => {
    await expect(
      updateMerchantProfile(input, {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        updateProfile: vi.fn().mockResolvedValue({ count: 0 }),
      }),
    ).rejects.toBeInstanceOf(MerchantProfileNotFoundError);
    await expect(
      updateMerchantProfile(input, {
        authorizeMutation: vi.fn().mockRejectedValue(new ForbiddenError()),
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      replaceMerchantLogo(await logoFile(), {
        authorizeMutation: vi.fn().mockRejectedValue(new ForbiddenError()),
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("reuses logo processing, persists the new key, then removes the old logo", async () => {
    const objectStorage = storage();
    await expect(
      replaceMerchantLogo(await logoFile(), {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        createStorage: () => objectStorage,
        replaceLogo: vi.fn().mockResolvedValue({
          previousStorageKey: "merchants/a/logo/old.webp",
        }),
      }),
    ).resolves.toEqual({ previousCleanupComplete: true });
    expect(objectStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "publicMedia",
        contentType: "image/webp",
      }),
    );
    expect(objectStorage.remove).toHaveBeenCalledWith({
      bucket: "publicMedia",
      path: "merchants/a/logo/old.webp",
    });
  });

  it("cleans the new logo if DB persistence fails", async () => {
    const objectStorage = storage();
    await expect(
      replaceMerchantLogo(await logoFile(), {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        createStorage: () => objectStorage,
        replaceLogo: vi.fn().mockRejectedValue(new Error("database failed")),
      }),
    ).rejects.toThrow("database failed");
    expect(objectStorage.remove).toHaveBeenCalledTimes(1);
  });

  it("reports old-logo cleanup failure after a successful DB replacement", async () => {
    const objectStorage = storage();
    vi.mocked(objectStorage.remove).mockRejectedValue(
      new Error("storage unavailable"),
    );
    await expect(
      replaceMerchantLogo(await logoFile(), {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        createStorage: () => objectStorage,
        replaceLogo: vi
          .fn()
          .mockResolvedValue({ previousStorageKey: "old.webp" }),
      }),
    ).resolves.toEqual({ previousCleanupComplete: false });
  });
});
