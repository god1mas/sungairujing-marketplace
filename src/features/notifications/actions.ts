"use server";

import { revalidatePath } from "next/cache";
import { markMerchantNotificationRead } from "@/services/notification-service";

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = formData.get("notificationId");
  if (typeof notificationId !== "string") return;
  await markMerchantNotificationRead(notificationId);
  revalidatePath("/dashboard/notifications");
}
