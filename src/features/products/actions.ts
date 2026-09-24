"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ImageValidationError } from "@/lib/storage/errors";
import {
  productIdSchema,
  productInputSchema,
} from "@/features/products/product-schema";
import {
  createProduct,
  changeProductCover,
  deleteProduct,
  InvalidProductCategoryError,
  isProductPermissionError,
  ProductImageLimitError,
  removeProductImage,
  updateProduct,
  uploadProductImages,
} from "@/services/merchant-product-service";

export type ProductActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export const initialProductActionState: ProductActionState = {
  success: false,
};

const parseProductForm = (formData: FormData) =>
  productInputSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    categoryId: formData.get("categoryId"),
    unit: formData.get("unit"),
    availabilityStatus: formData.get("availabilityStatus"),
  });

const mutationError = (error: unknown): ProductActionState => {
  if (error instanceof ProductImageLimitError) {
    return { success: false, message: "Produk hanya dapat memiliki 5 foto." };
  }
  if (error instanceof ImageValidationError) {
    const messages = {
      INVALID_MIME: "Format foto harus JPG, PNG, atau WebP.",
      FILE_TOO_LARGE: "Ukuran setiap foto maksimal 5 MB.",
      TOO_MANY_FILES: "Produk hanya dapat memiliki 5 foto.",
      INVALID_IMAGE: "Isi foto tidak valid atau rusak.",
    };
    return { success: false, message: messages[error.code] };
  }
  if (error instanceof InvalidProductCategoryError) {
    return {
      success: false,
      message: "Kategori tidak tersedia.",
      fieldErrors: { categoryId: ["Pilih kategori aktif."] },
    };
  }
  if (isProductPermissionError(error)) {
    return {
      success: false,
      message: "Produk tidak ditemukan atau tidak dapat diubah.",
    };
  }
  return {
    success: false,
    message: "Perubahan produk belum dapat disimpan. Silakan coba lagi.",
  };
};

export const createProductAction = async (
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data produk.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const files = formData
      .getAll("images")
      .filter(
        (value): value is File => value instanceof File && value.size > 0,
      );
    await createProduct(parsed.data, {}, files);
  } catch (error) {
    return mutationError(error);
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/products");
  redirect("/dashboard/products?created=1");
};

const imageMutationInput = (formData: FormData) =>
  z.object({ productId: z.uuid(), imageId: z.uuid() }).safeParse({
    productId: formData.get("productId"),
    imageId: formData.get("imageId"),
  });

export const uploadProductImagesAction = async (
  productId: string,
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const id = productIdSchema.safeParse(productId);
  const files = formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (!id.success || files.length === 0) {
    return { success: false, message: "Pilih minimal satu foto." };
  }
  try {
    await uploadProductImages(id.data, files);
    revalidatePath(`/dashboard/products/${id.data}/edit`);
    revalidatePath("/dashboard/products");
    return { success: true, message: "Foto berhasil ditambahkan." };
  } catch (error) {
    return mutationError(error);
  }
};

export const changeProductCoverAction = async (
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const parsed = imageMutationInput(formData);
  if (!parsed.success) return mutationError(new Error());
  try {
    await changeProductCover(parsed.data.productId, parsed.data.imageId);
    revalidatePath(`/dashboard/products/${parsed.data.productId}/edit`);
    revalidatePath("/dashboard/products");
    return { success: true, message: "Foto cover berhasil diperbarui." };
  } catch (error) {
    return mutationError(error);
  }
};

export const removeProductImageAction = async (
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const parsed = imageMutationInput(formData);
  if (!parsed.success) return mutationError(new Error());
  try {
    const result = await removeProductImage(
      parsed.data.productId,
      parsed.data.imageId,
    );
    revalidatePath(`/dashboard/products/${parsed.data.productId}/edit`);
    revalidatePath("/dashboard/products");
    return {
      success: true,
      message: result.mediaCleanupComplete
        ? "Foto berhasil dihapus."
        : "Foto dihapus, tetapi pembersihan media belum selesai.",
    };
  } catch (error) {
    return mutationError(error);
  }
};

export const updateProductAction = async (
  productId: string,
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const id = productIdSchema.safeParse(productId);
  const parsed = parseProductForm(formData);
  if (!id.success || !parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data produk.",
      fieldErrors: parsed.success
        ? undefined
        : parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await updateProduct(id.data, parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${id.data}/edit`);
    return { success: true, message: "Produk berhasil disimpan." };
  } catch (error) {
    return mutationError(error);
  }
};

export const deleteProductAction = async (
  _state: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> => {
  const id = productIdSchema.safeParse(formData.get("productId"));
  const confirmation = z
    .literal("DELETE")
    .safeParse(formData.get("confirmation"));
  if (!id.success || !confirmation.success) {
    return { success: false, message: "Konfirmasi penghapusan tidak valid." };
  }
  try {
    const result = await deleteProduct(id.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/products");
    return {
      success: true,
      message: result.mediaCleanupComplete
        ? "Produk berhasil dihapus."
        : "Produk dihapus, tetapi pembersihan media belum selesai.",
    };
  } catch (error) {
    return mutationError(error);
  }
};
