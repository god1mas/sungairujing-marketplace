import {
  Prisma,
  ProductAvailability,
  ProductModerationStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const productFields = {
  id: true,
  name: true,
  slug: true,
  description: true,
  price: true,
  unit: true,
  availabilityStatus: true,
  moderationStatus: true,
  suspensionReason: true,
  categoryId: true,
  category: { select: { name: true, isActive: true } },
  images: {
    orderBy: [
      { sortOrder: "asc" as const },
      { createdAt: "asc" as const },
      { id: "asc" as const },
    ],
    select: {
      id: true,
      storageKey: true,
      altText: true,
      sortOrder: true,
      isCover: true,
    },
  },
} satisfies Prisma.ProductSelect;

export type MerchantProductRecord = Prisma.ProductGetPayload<{
  select: typeof productFields;
}>;

export const findMerchantProducts = (merchantId: string) =>
  prisma.product.findMany({
    where: { merchantId },
    orderBy: { createdAt: "desc" },
    select: productFields,
  });

export const findOwnedProduct = (merchantId: string, productId: string) =>
  prisma.product.findFirst({
    where: { id: productId, merchantId },
    select: productFields,
  });

export const findActiveProductCategories = () =>
  prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

export const activeCategoryExists = async (categoryId: string) =>
  Boolean(
    await prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    }),
  );

export const productSlugExists = async (slug: string) =>
  Boolean(
    await prisma.product.findUnique({ where: { slug }, select: { id: true } }),
  );

export const createMerchantProduct = (input: {
  merchantId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  unit: string;
  availabilityStatus: ProductAvailability;
}) =>
  prisma.product.create({
    data: {
      ...input,
      price: new Prisma.Decimal(input.price),
      moderationStatus: ProductModerationStatus.ACTIVE,
    },
    select: { id: true },
  });

export const updateOwnedProduct = async (
  merchantId: string,
  productId: string,
  input: {
    categoryId: string;
    name: string;
    description: string;
    price: string;
    unit: string;
    availabilityStatus: ProductAvailability;
  },
) =>
  prisma.product.updateMany({
    where: { id: productId, merchantId },
    data: { ...input, price: new Prisma.Decimal(input.price) },
  });

export const deleteOwnedProduct = async (
  merchantId: string,
  productId: string,
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, merchantId },
    select: {
      name: true,
      images: { select: { storageKey: true } },
    },
  });
  if (!product) return null;

  const result = await prisma.product.deleteMany({
    where: { id: productId, merchantId },
  });
  return result.count === 1
    ? {
        name: product.name,
        imageStorageKeys: product.images.map((image) => image.storageKey),
      }
    : null;
};

export type NewProductImage = {
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
};

const imageOrder = [
  { sortOrder: "asc" as const },
  { createdAt: "asc" as const },
  { id: "asc" as const },
];

export const addOwnedProductImages = async (
  merchantId: string,
  productId: string,
  images: NewProductImage[],
) =>
  prisma.$transaction(
    async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: productId, merchantId },
        select: {
          name: true,
          moderationStatus: true,
          images: {
            orderBy: imageOrder,
            select: { id: true, isCover: true },
          },
        },
      });
      if (!product) return null;
      if (product.images.length + images.length > 5) return { tooMany: true };

      const start = product.images.length;
      if (start > 0 && !product.images.some((image) => image.isCover)) {
        await tx.productImage.update({
          where: { id: product.images[0].id },
          data: { isCover: true },
        });
      }
      await tx.productImage.createMany({
        data: images.map((image, index) => ({
          productId,
          storageKey: image.storageKey,
          altText: `Foto ${product.name}`,
          sortOrder: start + index,
          isCover: start === 0 && index === 0,
          mimeType: image.mimeType,
          sizeBytes: BigInt(image.sizeBytes),
          width: image.width,
          height: image.height,
        })),
      });
      return { tooMany: false, moderationStatus: product.moderationStatus };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );

export const setOwnedProductCover = async (
  merchantId: string,
  productId: string,
  imageId: string,
) =>
  prisma.$transaction(async (tx) => {
    const image = await tx.productImage.findFirst({
      where: { id: imageId, productId, product: { merchantId } },
      select: { id: true, isCover: true },
    });
    if (!image) return false;
    if (image.isCover) return true;
    await tx.productImage.updateMany({
      where: { productId, isCover: true },
      data: { isCover: false },
    });
    await tx.productImage.update({
      where: { id: image.id },
      data: { isCover: true },
    });
    return true;
  });

export const removeOwnedProductImage = async (
  merchantId: string,
  productId: string,
  imageId: string,
) =>
  prisma.$transaction(async (tx) => {
    const product = await tx.product.findFirst({
      where: { id: productId, merchantId },
      select: {
        images: {
          orderBy: imageOrder,
          select: { id: true, storageKey: true, isCover: true },
        },
      },
    });
    const currentImages = product?.images;
    const target = currentImages?.find((image) => image.id === imageId);
    if (!target || !currentImages) return null;

    await tx.productImage.delete({ where: { id: target.id } });
    const remaining = currentImages.filter((image) => image.id !== target.id);
    if (target.isCover && remaining[0]) {
      await tx.productImage.update({
        where: { id: remaining[0].id },
        data: { isCover: true },
      });
    }
    await Promise.all(
      remaining.map((image, sortOrder) =>
        tx.productImage.update({
          where: { id: image.id },
          data: { sortOrder },
        }),
      ),
    );
    return { storageKey: target.storageKey };
  });
