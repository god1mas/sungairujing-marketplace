"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import {
  submitPublicReport,
  ReportRateLimitError,
  ReportTargetNotFoundError,
} from "@/services/report-service";

export type ReportActionState = {
  success: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
export const initialReportState: ReportActionState = { success: false };

export async function submitReportAction(
  targetType: "PRODUCT" | "MERCHANT",
  targetSlug: string,
  _state: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  try {
    await submitPublicReport({
      targetType,
      targetSlug,
      reason: formData.get("reason"),
      details: formData.get("details"),
      reporterName: formData.get("reporterName"),
      reporterWhatsapp: formData.get("reporterWhatsapp"),
      website: formData.get("website"),
    });
    revalidatePath("/admin/reports");
    return {
      success: true,
      message: "Laporan berhasil dikirim untuk ditinjau.",
    };
  } catch (error) {
    if (error instanceof ZodError)
      return {
        success: false,
        message: "Periksa kembali isi laporan.",
        fieldErrors: error.flatten().fieldErrors,
      };
    if (error instanceof ReportRateLimitError)
      return {
        success: false,
        message: "Batas pengiriman laporan tercapai. Silakan coba lagi nanti.",
      };
    if (error instanceof ReportTargetNotFoundError)
      return { success: false, message: "Target laporan tidak tersedia." };
    return {
      success: false,
      message: "Laporan belum dapat dikirim. Silakan coba lagi.",
    };
  }
}
