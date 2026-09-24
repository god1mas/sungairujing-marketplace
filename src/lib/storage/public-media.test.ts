import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";
import {
  uploadBannerImage,
  uploadMerchantLogo,
  uploadProductImages,
} from "./public-media";
import type { ObjectStorage, StorageUploadInput } from "./types";

const createInput = async () => {
  const data = await sharp({
    create: {
      width: 10,
      height: 10,
      channels: 3,
      background: "#15803d",
    },
  })
    .png()
    .toBuffer();
  return {
    data: Uint8Array.from(data).buffer,
    mimeType: "image/png",
  };
};

const createStorage = (): ObjectStorage => ({
  upload: vi.fn(async (input: StorageUploadInput) => ({
    bucket: input.bucket,
    path: input.path,
  })),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(() => "https://example.test/image.webp"),
  createSignedUrl: vi.fn(async () => "https://example.test/signed"),
});

describe("public media upload helpers", () => {
  it("uploads processed products only to the public product namespace", async () => {
    const storage = createStorage();
    const [result] = await uploadProductImages({
      merchantId: "merchant-1",
      productId: "product-1",
      images: [await createInput()],
      storage,
    });

    expect(storage.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: "publicMedia",
        contentType: "image/webp",
        path: expect.stringMatching(
          /^merchants\/merchant-1\/products\/product-1\/[a-f0-9-]+\.webp$/,
        ),
      }),
    );
    expect(result.reference).toEqual(
      expect.objectContaining({ bucket: "publicMedia" }),
    );
  });

  it("removes already uploaded product objects after a later failure", async () => {
    const storage = createStorage();
    vi.mocked(storage.upload)
      .mockResolvedValueOnce({
        bucket: "publicMedia",
        path: "merchants/merchant-1/products/product-1/first.webp",
      })
      .mockRejectedValueOnce(new Error("provider detail"));

    await expect(
      uploadProductImages({
        merchantId: "merchant-1",
        productId: "product-1",
        images: [await createInput(), await createInput()],
        storage,
      }),
    ).rejects.toThrow();
    expect(storage.remove).toHaveBeenCalledWith({
      bucket: "publicMedia",
      path: "merchants/merchant-1/products/product-1/first.webp",
    });
  });

  it("routes logos and banners through their server-generated public paths", async () => {
    const storage = createStorage();
    const image = await createInput();

    await uploadMerchantLogo({ merchantId: "merchant-1", image, storage });
    await uploadBannerImage({ bannerId: "banner-1", image, storage });

    expect(storage.upload).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        bucket: "publicMedia",
        path: expect.stringMatching(
          /^merchants\/merchant-1\/logo\/[a-f0-9-]+\.webp$/,
        ),
      }),
    );
    expect(storage.upload).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        bucket: "publicMedia",
        path: expect.stringMatching(/^banners\/banner-1\/[a-f0-9-]+\.webp$/),
      }),
    );
  });
});
