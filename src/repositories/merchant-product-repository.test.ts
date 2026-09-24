import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  productImage: {
    createMany: vi.fn(),
    findFirst: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  category: { findMany: vi.fn(), findFirst: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: database }));

import {
  createMerchantProduct,
  addOwnedProductImages,
  deleteOwnedProduct,
  findActiveProductCategories,
  findMerchantProducts,
  findOwnedProduct,
  removeOwnedProductImage,
  setOwnedProductCover,
  updateOwnedProduct,
} from "./merchant-product-repository";

describe("merchant product repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.$transaction.mockImplementation(async (operation) =>
      typeof operation === "function" ? operation(database) : operation,
    );
  });

  it("scopes list and edit reads to the authenticated merchant", async () => {
    database.product.findMany.mockResolvedValue([]);
    database.product.findFirst.mockResolvedValue(null);

    await findMerchantProducts("merchant-a");
    await findOwnedProduct("merchant-a", "product-b");

    expect(database.product.findMany.mock.calls[0][0].where).toEqual({
      merchantId: "merchant-a",
    });
    expect(database.product.findFirst.mock.calls[0][0].where).toEqual({
      id: "product-b",
      merchantId: "merchant-a",
    });
  });

  it("only returns active categories for product forms", async () => {
    database.category.findMany.mockResolvedValue([]);
    await findActiveProductCategories();
    expect(database.category.findMany.mock.calls[0][0].where).toEqual({
      isActive: true,
    });
  });

  it("creates an immediately active product for the authorized merchant", async () => {
    database.product.create.mockResolvedValue({ id: "product-a" });
    await createMerchantProduct({
      merchantId: "merchant-a",
      categoryId: "category-a",
      name: "Kopi",
      slug: "kopi",
      description: "Kopi lokal",
      price: "10000.00",
      unit: "pak",
      availabilityStatus: "TERSEDIA",
    });
    const data = database.product.create.mock.calls[0][0].data;
    expect(data.merchantId).toBe("merchant-a");
    expect(data.moderationStatus).toBe("ACTIVE");
  });

  it("scopes update and never writes moderation state", async () => {
    database.product.updateMany.mockResolvedValue({ count: 1 });
    await updateOwnedProduct("merchant-a", "product-a", {
      categoryId: "category-a",
      name: "Kopi Baru",
      description: "Deskripsi",
      price: "12000.00",
      unit: "pak",
      availabilityStatus: "HABIS",
    });
    const call = database.product.updateMany.mock.calls[0][0];
    expect(call.where).toEqual({ id: "product-a", merchantId: "merchant-a" });
    expect(call.data).not.toHaveProperty("moderationStatus");
    expect(call.data).not.toHaveProperty("merchantId");
  });

  it("does not delete a cross-tenant or missing product", async () => {
    database.product.findFirst.mockResolvedValue(null);
    await expect(
      deleteOwnedProduct("merchant-a", "product-b"),
    ).resolves.toBeNull();
    expect(database.product.deleteMany).not.toHaveBeenCalled();
  });

  it("makes the first uploaded image the only cover and preserves moderation", async () => {
    database.product.findFirst.mockResolvedValue({
      name: "Kopi",
      moderationStatus: "SUSPENDED",
      images: [],
    });
    database.productImage.createMany.mockResolvedValue({ count: 2 });
    const result = await addOwnedProductImages("merchant-a", "product-a", [
      {
        storageKey: "one.webp",
        mimeType: "image/webp",
        sizeBytes: 10,
        width: 2,
        height: 2,
      },
      {
        storageKey: "two.webp",
        mimeType: "image/webp",
        sizeBytes: 10,
        width: 2,
        height: 2,
      },
    ]);
    const data = database.productImage.createMany.mock.calls[0][0].data;
    expect(
      data.map(
        ({ isCover, sortOrder }: { isCover: boolean; sortOrder: number }) => ({
          isCover,
          sortOrder,
        }),
      ),
    ).toEqual([
      { isCover: true, sortOrder: 0 },
      { isCover: false, sortOrder: 1 },
    ]);
    expect(result).toEqual({ tooMany: false, moderationStatus: "SUSPENDED" });
  });

  it("rejects existing plus new images above five inside the transaction", async () => {
    database.product.findFirst.mockResolvedValue({
      name: "Kopi",
      moderationStatus: "ACTIVE",
      images: [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }],
    });
    await expect(
      addOwnedProductImages("merchant-a", "product-a", [
        {
          storageKey: "one.webp",
          mimeType: "image/webp",
          sizeBytes: 10,
          width: 2,
          height: 2,
        },
        {
          storageKey: "two.webp",
          mimeType: "image/webp",
          sizeBytes: 10,
          width: 2,
          height: 2,
        },
      ]),
    ).resolves.toEqual({ tooMany: true });
    expect(database.productImage.createMany).not.toHaveBeenCalled();
  });

  it("changes cover by clearing the old cover before setting the owned target", async () => {
    database.productImage.findFirst.mockResolvedValue({
      id: "image-b",
      isCover: false,
    });
    await expect(
      setOwnedProductCover("merchant-a", "product-a", "image-b"),
    ).resolves.toBe(true);
    expect(
      database.productImage.updateMany.mock.invocationCallOrder[0],
    ).toBeLessThan(database.productImage.update.mock.invocationCallOrder[0]);
    expect(database.productImage.findFirst.mock.calls[0][0].where).toEqual({
      id: "image-b",
      productId: "product-a",
      product: { merchantId: "merchant-a" },
    });
  });

  it("deletes a cover, chooses the first ordered replacement, and normalizes order", async () => {
    database.product.findFirst.mockResolvedValue({
      images: [
        { id: "cover", storageKey: "cover.webp", isCover: true },
        { id: "next", storageKey: "next.webp", isCover: false },
        { id: "last", storageKey: "last.webp", isCover: false },
      ],
    });
    await expect(
      removeOwnedProductImage("merchant-a", "product-a", "cover"),
    ).resolves.toEqual({
      storageKey: "cover.webp",
    });
    expect(database.productImage.update).toHaveBeenCalledWith({
      where: { id: "next" },
      data: { isCover: true },
    });
    expect(database.productImage.update).toHaveBeenCalledWith({
      where: { id: "next" },
      data: { sortOrder: 0 },
    });
    expect(database.productImage.update).toHaveBeenCalledWith({
      where: { id: "last" },
      data: { sortOrder: 1 },
    });
  });

  it("deletes a non-cover without changing cover and leaves zero covers after final deletion", async () => {
    database.product.findFirst
      .mockResolvedValueOnce({
        images: [
          { id: "cover", storageKey: "cover.webp", isCover: true },
          { id: "other", storageKey: "other.webp", isCover: false },
        ],
      })
      .mockResolvedValueOnce({
        images: [{ id: "cover", storageKey: "cover.webp", isCover: true }],
      });
    await removeOwnedProductImage("merchant-a", "product-a", "other");
    expect(database.productImage.update).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: { isCover: true } }),
    );
    vi.clearAllMocks();
    await removeOwnedProductImage("merchant-a", "product-a", "cover");
    expect(database.productImage.update).not.toHaveBeenCalled();
  });
});
