"use server";
import { revalidatePath } from "next/cache";
import { ReportStatus } from "@prisma/client";
import {
  changeReportStatus,
  moderateTarget,
} from "@/services/moderation-service";
import type { ModerationState } from "./action-state";

export async function reportStatusAction(
  reportId: string,
  _state: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  try {
    await changeReportStatus({
      reportId,
      status: formData.get("status") as ReportStatus,
      resolutionNote:
        String(formData.get("resolutionNote") || "").trim() || undefined,
    });
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${reportId}`);
    return { success: true, message: "Status laporan diperbarui." };
  } catch {
    return {
      success: false,
      message: "Transisi status tidak diizinkan atau laporan telah berubah.",
    };
  }
}
export async function moderationAction(
  reportId: string,
  action: "SUSPEND_PRODUCT" | "SUSPEND_MERCHANT" | "REACTIVATE_MERCHANT",
  targetId: string,
  _state: ModerationState,
  formData: FormData,
): Promise<ModerationState> {
  try {
    await moderateTarget({
      action,
      targetId,
      reason: String(formData.get("reason") || ""),
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${reportId}`);
    revalidatePath("/dashboard", "layout");
    return { success: true, message: "Tindakan moderasi berhasil disimpan." };
  } catch {
    return {
      success: false,
      message: "Tindakan tidak valid atau target telah berubah.",
    };
  }
}
