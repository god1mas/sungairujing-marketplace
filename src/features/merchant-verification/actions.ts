"use server";

import { revalidatePath } from "next/cache";
import { EvidenceValidationError } from "@/lib/storage/errors";
import {
  decideVerification,
  submitMerchantVerification,
  VerificationConflictError,
  VerificationNotFoundError,
} from "@/services/merchant-verification-service";
import type { VerificationActionState } from "./action-state";
import { verificationReviewSchema } from "./schemas";

const evidenceError = (error: EvidenceValidationError) =>
  ({
    TOO_MANY_FILES: "Maksimal tiga berkas bukti usaha.",
    FILE_TOO_LARGE: "Ukuran setiap berkas maksimal 8 MB.",
    INVALID_MIME: "Berkas harus berformat JPG, PNG, WebP, atau PDF.",
    INVALID_FILE: "Berkas tidak valid, rusak, atau belum dipilih.",
  })[error.code];

export const submitVerificationAction = async (
  _state: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> => {
  const files = formData
    .getAll("evidence")
    .filter((item): item is File => item instanceof File && item.size > 0);
  try {
    await submitMerchantVerification(files);
    revalidatePath("/dashboard/verification");
    revalidatePath("/admin/verifications");
    return { success: true, message: "Pengajuan verifikasi berhasil dikirim." };
  } catch (error) {
    if (error instanceof EvidenceValidationError)
      return { success: false, message: evidenceError(error) };
    if (error instanceof VerificationConflictError)
      return {
        success: false,
        message:
          "Pengajuan tidak dapat dibuat karena masih ditinjau atau merchant sudah terverifikasi.",
      };
    if (error instanceof VerificationNotFoundError)
      return { success: false, message: "Merchant tidak ditemukan." };
    return {
      success: false,
      message: "Pengajuan belum dapat dikirim. Silakan coba lagi.",
    };
  }
};

export const reviewVerificationAction = async (
  submissionId: string,
  _state: VerificationActionState,
  formData: FormData,
): Promise<VerificationActionState> => {
  const parsed = verificationReviewSchema.safeParse({
    decision: formData.get("decision"),
    rejectionReason: formData.get("rejectionReason") || undefined,
  });
  if (!parsed.success)
    return {
      success: false,
      message: "Periksa keputusan verifikasi.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  try {
    await decideVerification({ submissionId, ...parsed.data });
    revalidatePath("/admin/verifications");
    revalidatePath(`/admin/verifications/${submissionId}`);
    revalidatePath("/dashboard/verification");
    revalidatePath("/merchant", "layout");
    return {
      success: true,
      message:
        parsed.data.decision === "APPROVE"
          ? "Verifikasi disetujui."
          : "Verifikasi ditolak.",
    };
  } catch (error) {
    if (error instanceof VerificationConflictError)
      return {
        success: false,
        message: "Pengajuan sudah diproses atau tidak lagi tersedia.",
      };
    return {
      success: false,
      message: "Keputusan belum dapat disimpan. Silakan coba lagi.",
    };
  }
};
