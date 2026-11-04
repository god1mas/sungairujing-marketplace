import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StorageConfigurationError } from "@/lib/storage/errors";
import type { ObjectStorage, StorageUploadInput } from "@/lib/storage/types";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  deleteBanner: vi.fn(),
  findBanner: vi.fn(),
  findMerchant: vi.fn(),
  permanentlyDeleteMerchant: vi.fn(),
  saveBanner: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/authorization", () => ({
  requireSuperAdmin: mocks.authorize,
}));
vi.mock("@/repositories/admin-content-repository", () => ({
  deleteBanner: mocks.deleteBanner,
  findBanner: mocks.findBanner,
  findAdminMerchant: mocks.findMerchant,
  permanentlyDeleteMerchant: mocks.permanentlyDeleteMerchant,
  saveBanner: mocks.saveBanner,
}));

import {
  deleteBanner,
  deleteMerchant,
  saveBanner,
} from "./admin-content-service";

const merchantId = "9f254e72-82de-4d79-a8f7-275b38a34d5a";
const merchant = { id: merchantId, name: "Warung Kosong" };

const storage = (remove = vi.fn(async () => undefined)): ObjectStorage => ({
  upload: vi.fn(async (input: StorageUploadInput) => ({
    bucket: input.bucket,
    path: input.path,
  })),
  remove,
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
});

const bannerId = "18faef4c-aac3-4cb7-b7b8-c786d20cfb13";
const bannerInput = {
  title: "Promo UMKM",
  description: "Produk pilihan minggu ini",
  ctaText: "Lihat produk",
  targetUrl: "/products",
  isActive: true,
};

const bannerFile = async () => {
  const image = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 3,
      background: "#15803d",
    },
  })
    .png()
    .toBuffer();
  return new File([image], "banner.png", { type: "image/png" });
};

describe("admin content merchant deletion", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({ id: "admin-a" });
    mocks.findMerchant.mockResolvedValue(merchant);
  });

  it("deletes an empty merchant without initializing Storage", async () => {
    mocks.permanentlyDeleteMerchant.mockResolvedValue({
      storageReferences: [],
    });
    const createStorage = vi.fn();

    await expect(
      deleteMerchant(merchantId, "HAPUS Warung Kosong", { createStorage }),
    ).resolves.toEqual({ storageReferences: [] });

    expect(mocks.authorize).toHaveBeenCalledOnce();
    expect(mocks.permanentlyDeleteMerchant).toHaveBeenCalledWith({
      id: merchantId,
      actorUserId: "admin-a",
    });
    expect(createStorage).not.toHaveBeenCalled();
  });

  it("removes every public and private object after merchant deletion", async () => {
    const storageReferences = [
      { bucket: "publicMedia", path: "merchants/m/logo.webp" },
      {
        bucket: "publicMedia",
        path: "merchants/m/products/p/product.webp",
      },
      {
        bucket: "privateEvidence",
        path: "verification/m/submission/evidence.pdf",
      },
    ] as const;
    mocks.permanentlyDeleteMerchant.mockResolvedValue({ storageReferences });
    const objectStorage = storage();

    await deleteMerchant(merchantId, "HAPUS Warung Kosong", {
      createStorage: () => objectStorage,
    });

    expect(objectStorage.remove).toHaveBeenCalledTimes(3);
    for (const reference of storageReferences) {
      expect(objectStorage.remove).toHaveBeenCalledWith(reference);
    }
  });

  it("surfaces a Storage cleanup failure after the atomic deletion", async () => {
    const cleanupError = new Error("controlled storage cleanup failure");
    const remove = vi
      .fn()
      .mockRejectedValueOnce(cleanupError)
      .mockResolvedValueOnce(undefined);
    mocks.permanentlyDeleteMerchant.mockResolvedValue({
      storageReferences: [
        { bucket: "publicMedia", path: "merchants/m/logo.webp" },
        {
          bucket: "privateEvidence",
          path: "verification/m/submission/evidence.pdf",
        },
      ],
    });

    await expect(
      deleteMerchant(merchantId, "HAPUS Warung Kosong", {
        createStorage: () => storage(remove),
      }),
    ).rejects.toBe(cleanupError);

    expect(mocks.permanentlyDeleteMerchant).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledTimes(2);
  });
});

describe("admin content banner storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.authorize.mockResolvedValue({ id: "admin-a" });
    mocks.findBanner.mockResolvedValue({
      id: bannerId,
      imageStorageKey: "banners/existing/banner.webp",
    });
    mocks.saveBanner.mockResolvedValue({ id: bannerId });
    mocks.deleteBanner.mockResolvedValue({
      imageStorageKey: "banners/existing/banner.webp",
    });
  });

  it("updates banner metadata without initializing Storage when no file is supplied", async () => {
    const createStorage = vi.fn();

    await expect(
      saveBanner(bannerId, bannerInput, undefined, { createStorage }),
    ).resolves.toBe(bannerId);

    expect(createStorage).not.toHaveBeenCalled();
    expect(mocks.saveBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        id: bannerId,
        imageStorageKey: "banners/existing/banner.webp",
      }),
    );
  });

  it("initializes Storage and persists its generated key when a file is supplied", async () => {
    const objectStorage = storage();
    const createStorage = vi.fn(() => objectStorage);

    await saveBanner(undefined, bannerInput, await bannerFile(), {
      createStorage,
    });

    expect(createStorage).toHaveBeenCalledOnce();
    expect(objectStorage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "publicMedia",
        contentType: "image/webp",
        path: expect.stringMatching(/^banners\/[a-f0-9-]+\/[a-f0-9-]+\.webp$/),
      }),
    );
    expect(mocks.saveBanner).toHaveBeenCalledWith(
      expect.objectContaining({
        imageStorageKey: expect.stringMatching(
          /^banners\/[a-f0-9-]+\/[a-f0-9-]+\.webp$/,
        ),
      }),
    );
  });

  it("does not persist banner metadata when Storage configuration is unavailable", async () => {
    mocks.findBanner.mockResolvedValue(null);

    await expect(
      saveBanner(undefined, bannerInput, await bannerFile(), {
        createStorage: () => {
          throw new StorageConfigurationError();
        },
      }),
    ).rejects.toBeInstanceOf(StorageConfigurationError);

    expect(mocks.saveBanner).not.toHaveBeenCalled();
  });

  it("checks Storage configuration before deleting banner metadata", async () => {
    await expect(
      deleteBanner(bannerId, {
        createStorage: () => {
          throw new StorageConfigurationError();
        },
      }),
    ).rejects.toBeInstanceOf(StorageConfigurationError);

    expect(mocks.deleteBanner).not.toHaveBeenCalled();
  });

  it("deletes banner metadata and then attempts object cleanup", async () => {
    const objectStorage = storage();

    await deleteBanner(bannerId, { createStorage: () => objectStorage });

    expect(mocks.deleteBanner).toHaveBeenCalledWith(bannerId);
    expect(objectStorage.remove).toHaveBeenCalledWith({
      bucket: "publicMedia",
      path: "banners/existing/banner.webp",
    });
  });
});
