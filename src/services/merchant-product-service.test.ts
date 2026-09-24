import { Prisma } from "@prisma/client";
import sharp from "sharp";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { ForbiddenError, UnauthenticatedError } from "@/lib/auth/authorization";
import {
  createProduct,
  changeProductCover,
  deleteProduct,
  getMerchantProducts,
  getOwnedProductForEdit,
  InvalidProductCategoryError,
  ProductNotFoundError,
  removeProductImage,
  updateProduct,
  uploadProductImages,
} from "./merchant-product-service";
import type { ObjectStorage } from "@/lib/storage/types";

const membership = { merchantId: "merchant-a" };
const record = {
  id: "10000000-0000-4000-8000-000000000010",
  name: "Kerupuk Ikan",
  slug: "kerupuk-ikan",
  description: "Kerupuk lokal",
  price: new Prisma.Decimal("15000.00"),
  unit: "bungkus",
  availabilityStatus: "TERSEDIA" as const,
  moderationStatus: "SUSPENDED" as const,
  suspensionReason: "Melanggar kebijakan",
  categoryId: "10000000-0000-4000-8000-000000000001",
  category: { name: "Makanan", isActive: true },
  images: [],
};
const input = {
  name: "Kerupuk Ikan",
  description: "Kerupuk lokal",
  price: "15000.00",
  categoryId: "10000000-0000-4000-8000-000000000001",
  unit: "bungkus",
  availabilityStatus: "TERSEDIA" as const,
};

const createImageFile = async () => {
  const data = await sharp({
    create: { width: 4, height: 4, channels: 3, background: "#15803d" },
  })
    .png()
    .toBuffer();
  return new File([data], "product.png", { type: "image/png" });
};

const createStorage = (): ObjectStorage => ({
  upload: vi.fn(async (value) => ({ bucket: value.bucket, path: value.path })),
  remove: vi.fn(async () => undefined),
  getPublicUrl: vi.fn(() => "https://example.test/image.webp"),
  createSignedUrl: vi.fn(async () => "https://example.test/signed"),
});

describe("merchant product service", () => {
  it("lists only products queried with the authorized merchant", async () => {
    const listProducts = vi.fn().mockResolvedValue([record]);
    const products = await getMerchantProducts({
      authorizeRead: vi.fn().mockResolvedValue(membership),
      listProducts,
      resolveImageUrl: () => null,
    });
    expect(listProducts).toHaveBeenCalledWith("merchant-a");
    expect(products[0]).toEqual(
      expect.objectContaining({ moderationStatus: "SUSPENDED", image: null }),
    );
  });

  it("rejects a cross-tenant edit read without exposing the product", async () => {
    await expect(
      getOwnedProductForEdit(record.id, {
        authorizeRead: vi.fn().mockResolvedValue(membership),
        findProduct: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("derives ownership, generates a collision-safe slug, and creates ACTIVE", async () => {
    const create = vi.fn().mockResolvedValue({ id: record.id });
    await createProduct(input, {
      authorizeMutation: vi.fn().mockResolvedValue(membership),
      categoryExists: vi.fn().mockResolvedValue(true),
      slugExists: vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
      createProduct: create,
    });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        merchantId: "merchant-a",
        slug: "kerupuk-ikan-2",
      }),
    );
  });

  it("rejects suspended merchant create before persistence", async () => {
    const create = vi.fn();
    await expect(
      createProduct(input, {
        authorizeMutation: vi.fn().mockRejectedValue(new ForbiddenError()),
        createProduct: create,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects suspended merchant edit and delete before repository access", async () => {
    const authorizeMutation = vi.fn().mockRejectedValue(new ForbiddenError());
    const update = vi.fn();
    const remove = vi.fn();
    await expect(
      updateProduct(record.id, input, {
        authorizeMutation,
        updateProduct: update,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      deleteProduct(record.id, {
        authorizeMutation,
        deleteProduct: remove,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(update).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it("rejects an inactive or unknown category server-side", async () => {
    const create = vi.fn();
    await expect(
      createProduct(input, {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        categoryExists: vi.fn().mockResolvedValue(false),
        createProduct: create,
      }),
    ).rejects.toBeInstanceOf(InvalidProductCategoryError);
    expect(create).not.toHaveBeenCalled();
  });

  it("updates an owned suspended product without changing moderation", async () => {
    const update = vi.fn().mockResolvedValue({ count: 1 });
    await updateProduct(record.id, input, {
      authorizeMutation: vi.fn().mockResolvedValue(membership),
      findProduct: vi.fn().mockResolvedValue(record),
      categoryExists: vi.fn().mockResolvedValue(true),
      updateProduct: update,
    });
    expect(update).toHaveBeenCalledWith(
      "merchant-a",
      record.id,
      expect.not.objectContaining({ moderationStatus: expect.anything() }),
    );
  });

  it("rejects cross-tenant edit and delete", async () => {
    await expect(
      updateProduct(record.id, input, {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        findProduct: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(
      deleteProduct(record.id, {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        deleteProduct: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("rejects unauthenticated delete before repository access", async () => {
    const remove = vi.fn();
    await expect(
      deleteProduct(record.id, {
        authorizeMutation: vi
          .fn()
          .mockRejectedValue(new UnauthenticatedError()),
        deleteProduct: remove,
      }),
    ).rejects.toBeInstanceOf(UnauthenticatedError);
    expect(remove).not.toHaveBeenCalled();
  });

  it("deletes owned product and cleans all returned image keys", async () => {
    const removeImages = vi.fn().mockResolvedValue(undefined);
    await expect(
      deleteProduct(record.id, {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        deleteProduct: vi.fn().mockResolvedValue({
          name: record.name,
          imageStorageKeys: ["products/a/one.webp", "products/a/two.webp"],
        }),
        removeImages,
      }),
    ).resolves.toMatchObject({ mediaCleanupComplete: true });
    expect(removeImages).toHaveBeenCalledWith([
      "products/a/one.webp",
      "products/a/two.webp",
    ]);
  });

  it("uploads to an owned product and persists processed metadata", async () => {
    const storage = createStorage();
    const addImages = vi.fn().mockResolvedValue({
      tooMany: false,
      moderationStatus: "SUSPENDED",
    });
    await uploadProductImages(record.id, [await createImageFile()], {
      authorizeMutation: vi.fn().mockResolvedValue(membership),
      findProduct: vi.fn().mockResolvedValue(record),
      createStorage: () => storage,
      addImages,
    });
    expect(addImages).toHaveBeenCalledWith("merchant-a", record.id, [
      expect.objectContaining({ mimeType: "image/webp", width: 4, height: 4 }),
    ]);
  });

  it("rejects existing plus new images above five before storage", async () => {
    const createStorageSpy = vi.fn();
    await expect(
      uploadProductImages(
        record.id,
        [await createImageFile(), await createImageFile()],
        {
          authorizeMutation: vi.fn().mockResolvedValue(membership),
          findProduct: vi.fn().mockResolvedValue({
            ...record,
            images: Array.from({ length: 4 }, (_, index) => ({
              id: `${index}`,
              storageKey: `${index}.webp`,
              altText: null,
              sortOrder: index,
              isCover: index === 0,
            })),
          }),
          createStorage: createStorageSpy,
        },
      ),
    ).rejects.toThrow();
    expect(createStorageSpy).not.toHaveBeenCalled();
  });

  it("rejects cross-tenant upload, removal, and cover changes", async () => {
    const authorizeMutation = vi.fn().mockResolvedValue(membership);
    await expect(
      uploadProductImages(record.id, [await createImageFile()], {
        authorizeMutation,
        findProduct: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(
      removeProductImage(record.id, "image-b", {
        authorizeMutation,
        removeImage: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
    await expect(
      changeProductCover(record.id, "image-b", {
        authorizeMutation,
        setCover: vi.fn().mockResolvedValue(false),
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);
  });

  it("blocks every image mutation when the merchant is suspended", async () => {
    const authorizeMutation = vi.fn().mockRejectedValue(new ForbiddenError());
    await expect(
      uploadProductImages(record.id, [await createImageFile()], {
        authorizeMutation,
      }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      removeProductImage(record.id, "image-a", { authorizeMutation }),
    ).rejects.toBeInstanceOf(ForbiddenError);
    await expect(
      changeProductCover(record.id, "image-a", { authorizeMutation }),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("cleans uploaded files and rolls back a newly created product when metadata fails", async () => {
    const storage = createStorage();
    const deleteProduct = vi.fn().mockResolvedValue({
      name: record.name,
      imageStorageKeys: [],
    });
    await expect(
      createProduct(
        input,
        {
          authorizeMutation: vi.fn().mockResolvedValue(membership),
          categoryExists: vi.fn().mockResolvedValue(true),
          slugExists: vi.fn().mockResolvedValue(false),
          createProduct: vi.fn().mockResolvedValue({ id: record.id }),
          createStorage: () => storage,
          addImages: vi.fn().mockRejectedValue(new Error("database failed")),
          deleteProduct,
        },
        [await createImageFile()],
      ),
    ).rejects.toThrow("database failed");
    expect(storage.remove).toHaveBeenCalledTimes(1);
    expect(deleteProduct).toHaveBeenCalledWith("merchant-a", record.id);
  });

  it("reports storage cleanup failure truthfully after metadata deletion", async () => {
    await expect(
      removeProductImage(record.id, "image-a", {
        authorizeMutation: vi.fn().mockResolvedValue(membership),
        removeImage: vi.fn().mockResolvedValue({ storageKey: "owned.webp" }),
        removeImages: vi
          .fn()
          .mockRejectedValue(new Error("storage unavailable")),
      }),
    ).resolves.toEqual({ mediaCleanupComplete: false });
  });
});
