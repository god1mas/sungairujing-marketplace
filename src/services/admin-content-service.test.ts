import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ObjectStorage } from "@/lib/storage/types";

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  findMerchant: vi.fn(),
  permanentlyDeleteMerchant: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/authorization", () => ({
  requireSuperAdmin: mocks.authorize,
}));
vi.mock("@/repositories/admin-content-repository", () => ({
  findAdminMerchant: mocks.findMerchant,
  permanentlyDeleteMerchant: mocks.permanentlyDeleteMerchant,
}));

import { deleteMerchant } from "./admin-content-service";

const merchantId = "9f254e72-82de-4d79-a8f7-275b38a34d5a";
const merchant = { id: merchantId, name: "Warung Kosong" };

const storage = (remove = vi.fn(async () => undefined)): ObjectStorage => ({
  upload: vi.fn(),
  remove,
  getPublicUrl: vi.fn(),
  createSignedUrl: vi.fn(),
});

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
