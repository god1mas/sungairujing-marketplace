"use server";

import { revalidatePath } from "next/cache";
import { ImageValidationError } from "@/lib/storage/errors";
import { merchantProfileSchema, openingHourDays } from "./profile-schema";
import {
  isMerchantProfilePermissionError,
  replaceMerchantLogo,
  updateMerchantProfile,
} from "@/services/merchant-profile-service";
import type { MerchantProfileActionState } from "./action-state";

const safeError = (error: unknown): MerchantProfileActionState => {
  if (error instanceof ImageValidationError) {
    const messages = {
      INVALID_MIME: "Logo harus berformat JPG, PNG, atau WebP.",
      FILE_TOO_LARGE: "Ukuran logo maksimal 3 MB.",
      INVALID_IMAGE: "Isi berkas logo tidak valid atau rusak.",
      TOO_MANY_FILES: "Pilih satu logo.",
    };
    return { success: false, message: messages[error.code] };
  }
  if (isMerchantProfilePermissionError(error)) {
    return {
      success: false,
      message: "Profil tidak ditemukan atau tidak dapat diubah.",
    };
  }
  return {
    success: false,
    message: "Perubahan profil belum dapat disimpan. Silakan coba lagi.",
  };
};

export const updateMerchantProfileAction = async (
  _state: MerchantProfileActionState,
  formData: FormData,
): Promise<MerchantProfileActionState> => {
  const openingHours = Object.fromEntries(
    openingHourDays.map(([day]) => [
      day,
      {
        closed: formData.get(`${day}.closed`) === "on",
        open: String(formData.get(`${day}.open`) ?? "") || undefined,
        close: String(formData.get(`${day}.close`) ?? "") || undefined,
      },
    ]),
  );
  const parsed = merchantProfileSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    address: formData.get("address"),
    operationalStatus: formData.get("operationalStatus"),
    openingHours,
  });
  if (!parsed.success) {
    return {
      success: false,
      message: "Periksa kembali data profil merchant.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    await updateMerchantProfile(parsed.data);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    revalidatePath("/merchant", "layout");
    return { success: true, message: "Profil merchant berhasil disimpan." };
  } catch (error) {
    return safeError(error);
  }
};

export const replaceMerchantLogoAction = async (
  _state: MerchantProfileActionState,
  formData: FormData,
): Promise<MerchantProfileActionState> => {
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "Pilih satu berkas logo." };
  }
  try {
    const result = await replaceMerchantLogo(file);
    revalidatePath("/dashboard/profile");
    revalidatePath("/merchant", "layout");
    return {
      success: true,
      message: result.previousCleanupComplete
        ? "Logo merchant berhasil diperbarui."
        : "Logo diperbarui, tetapi pembersihan logo lama belum selesai.",
    };
  } catch (error) {
    return safeError(error);
  }
};
