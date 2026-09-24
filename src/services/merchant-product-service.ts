import "server-only";

import { ProductAvailability } from "@prisma/client";
import {
  ForbiddenError,
  requireActiveMerchantForMutation,
  requireMerchantAdmin,
} from "@/lib/auth/authorization";
import { createSlug } from "@/lib/slug";
import { persistWithStorageCompensation } from "@/lib/storage/cleanup";
import { assertProductImageCount } from "@/lib/storage/image";
import { uploadProductImages as uploadPublicProductImages } from "@/lib/storage/public-media";
import { createSupabaseStorage } from "@/lib/storage/supabase";
import type { ObjectStorage } from "@/lib/storage/types";
import type { ProductInput } from "@/features/products/product-schema";
import {
  activeCategoryExists,
  addOwnedProductImages,
  createMerchantProduct,
  deleteOwnedProduct,
  findActiveProductCategories,
  findMerchantProducts,
  findOwnedProduct,
  productSlugExists,
  removeOwnedProductImage,
  setOwnedProductCover,
  updateOwnedProduct,
  type MerchantProductRecord,
} from "@/repositories/merchant-product-repository";
import { resolvePublicImageUrl } from "./public-catalog-service";

export class ProductNotFoundError extends Error {}
export class InvalidProductCategoryError extends Error {}
export class ProductImageLimitError extends Error {}

type Membership = Awaited<ReturnType<typeof requireMerchantAdmin>>;
type ReadAuthorizer = () => Promise<Membership>;
type MutationAuthorizer = () => Promise<Membership>;

const authorizeMutation: MutationAuthorizer = async () => {
  const membership = await requireMerchantAdmin();
  await requireActiveMerchantForMutation(membership.merchantId);
  return membership;
};

const defaultDependencies = {
  authorizeRead: requireMerchantAdmin as ReadAuthorizer,
  authorizeMutation,
  listProducts: findMerchantProducts,
  findProduct: findOwnedProduct,
  listCategories: findActiveProductCategories,
  categoryExists: activeCategoryExists,
  slugExists: productSlugExists,
  createProduct: createMerchantProduct,
  updateProduct: updateOwnedProduct,
  deleteProduct: deleteOwnedProduct,
  addImages: addOwnedProductImages,
  setCover: setOwnedProductCover,
  removeImage: removeOwnedProductImage,
  resolveImageUrl: resolvePublicImageUrl,
  removeImages: async (keys: string[]) => {
    const storage = createSupabaseStorage();
    await Promise.all(
      keys.map((path) => storage.remove({ bucket: "publicMedia", path })),
    );
  },
  createStorage: createSupabaseStorage,
};

export type MerchantProductDependencies = Partial<typeof defaultDependencies>;

const dependencies = (overrides: MerchantProductDependencies) => ({
  ...defaultDependencies,
  ...overrides,
});

const mapProduct = (
  product: MerchantProductRecord,
  resolveImageUrl: (key: string) => string | null,
) => {
  const cover = product.images.find((image) => image.isCover);
  const imageUrl = cover ? resolveImageUrl(cover.storageKey) : null;
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price.toFixed(2),
    unit: product.unit,
    categoryId: product.categoryId,
    categoryName: product.category.name,
    categoryActive: product.category.isActive,
    availabilityStatus: product.availabilityStatus,
    moderationStatus: product.moderationStatus,
    suspensionReason: product.suspensionReason,
    image: imageUrl
      ? { url: imageUrl, alt: cover?.altText ?? `Foto ${product.name}` }
      : null,
    images: product.images.map((image) => ({
      id: image.id,
      url: resolveImageUrl(image.storageKey),
      alt: image.altText ?? `Foto ${product.name}`,
      isCover: image.isCover,
      sortOrder: image.sortOrder,
    })),
  };
};

const fileInputs = async (files: File[]) =>
  Promise.all(
    files.map(async (file) => ({
      data: await file.arrayBuffer(),
      mimeType: file.type,
    })),
  );

const uploadAndPersistImages = async ({
  merchantId,
  productId,
  files,
  storage,
  addImages,
}: {
  merchantId: string;
  productId: string;
  files: File[];
  storage: ObjectStorage;
  addImages: typeof addOwnedProductImages;
}) => {
  const uploaded = await uploadPublicProductImages({
    merchantId,
    productId,
    images: await fileInputs(files),
    storage,
  });
  const result = await persistWithStorageCompensation({
    references: uploaded.map((image) => image.reference),
    storage,
    persist: async () => {
      const result = await addImages(
        merchantId,
        productId,
        uploaded.map((image) => ({
          storageKey: image.reference.path,
          mimeType: image.contentType,
          sizeBytes: image.sizeBytes,
          width: image.width,
          height: image.height,
        })),
      );
      if (!result) throw new ProductNotFoundError();
      if (result.tooMany) throw new ProductImageLimitError();
      return result;
    },
  });
  return result;
};

export const getMerchantProducts = async (
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeRead();
  const products = await deps.listProducts(membership.merchantId);
  return products.map((product) => {
    const { images: _images, ...summary } = mapProduct(
      product,
      deps.resolveImageUrl,
    );
    void _images;
    return summary;
  });
};

export const getProductFormCategories = async (
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  await deps.authorizeRead();
  return deps.listCategories();
};

export const getOwnedProductForEdit = async (
  productId: string,
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeRead();
  const product = await deps.findProduct(membership.merchantId, productId);
  if (!product) throw new ProductNotFoundError();
  return mapProduct(product, deps.resolveImageUrl);
};

const assertActiveCategory = async (
  categoryId: string,
  categoryExists: (id: string) => Promise<boolean>,
) => {
  if (!(await categoryExists(categoryId))) {
    throw new InvalidProductCategoryError();
  }
};

const createAvailableSlug = async (
  name: string,
  slugExists: (slug: string) => Promise<boolean>,
) => {
  const base = createSlug(name);
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    if (!(await slugExists(candidate))) return candidate;
  }
  throw new Error("Product slug unavailable");
};

export const createProduct = async (
  input: ProductInput,
  overrides: MerchantProductDependencies = {},
  files: File[] = [],
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  await assertActiveCategory(input.categoryId, deps.categoryExists);
  const slug = await createAvailableSlug(input.name, deps.slugExists);
  assertProductImageCount(files.length);
  const created = await deps.createProduct({
    ...input,
    merchantId: membership.merchantId,
    slug,
    availabilityStatus: input.availabilityStatus as ProductAvailability,
  });
  if (files.length === 0) return created;
  try {
    await uploadAndPersistImages({
      merchantId: membership.merchantId,
      productId: created.id,
      files,
      storage: deps.createStorage(),
      addImages: deps.addImages,
    });
    return created;
  } catch (error) {
    await deps.deleteProduct(membership.merchantId, created.id);
    throw error;
  }
};

export const uploadProductImages = async (
  productId: string,
  files: File[],
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const product = await deps.findProduct(membership.merchantId, productId);
  if (!product) throw new ProductNotFoundError();
  assertProductImageCount(product.images.length + files.length);
  if (files.length === 0) return;
  await uploadAndPersistImages({
    merchantId: membership.merchantId,
    productId,
    files,
    storage: deps.createStorage(),
    addImages: deps.addImages,
  });
};

export const changeProductCover = async (
  productId: string,
  imageId: string,
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  if (!(await deps.setCover(membership.merchantId, productId, imageId))) {
    throw new ProductNotFoundError();
  }
};

export const removeProductImage = async (
  productId: string,
  imageId: string,
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const removed = await deps.removeImage(
    membership.merchantId,
    productId,
    imageId,
  );
  if (!removed) throw new ProductNotFoundError();
  try {
    await deps.removeImages([removed.storageKey]);
    return { mediaCleanupComplete: true };
  } catch {
    return { mediaCleanupComplete: false };
  }
};

export const updateProduct = async (
  productId: string,
  input: ProductInput,
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const existing = await deps.findProduct(membership.merchantId, productId);
  if (!existing) throw new ProductNotFoundError();
  await assertActiveCategory(input.categoryId, deps.categoryExists);
  const result = await deps.updateProduct(membership.merchantId, productId, {
    ...input,
    availabilityStatus: input.availabilityStatus as ProductAvailability,
  });
  if (result.count !== 1) throw new ProductNotFoundError();
  return { id: productId, slug: existing.slug };
};

export const deleteProduct = async (
  productId: string,
  overrides: MerchantProductDependencies = {},
) => {
  const deps = dependencies(overrides);
  const membership = await deps.authorizeMutation();
  const deleted = await deps.deleteProduct(membership.merchantId, productId);
  if (!deleted) throw new ProductNotFoundError();

  let mediaCleanupComplete = true;
  if (deleted.imageStorageKeys.length > 0) {
    try {
      await deps.removeImages(deleted.imageStorageKeys);
    } catch {
      mediaCleanupComplete = false;
    }
  }
  return { ...deleted, mediaCleanupComplete };
};

export const isProductPermissionError = (error: unknown) =>
  error instanceof ForbiddenError || error instanceof ProductNotFoundError;
