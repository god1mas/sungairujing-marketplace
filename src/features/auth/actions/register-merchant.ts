"use server";

import { redirect } from "next/navigation";
import { registerMerchant } from "@/services/merchant-registration-service";
import type { RegistrationActionState } from "./register-merchant-state";

export const registerMerchantAction = async (
  _previousState: RegistrationActionState,
  formData: FormData,
): Promise<RegistrationActionState> => {
  const result = await registerMerchant({
    ownerName: String(formData.get("ownerName") ?? ""),
    merchantName: String(formData.get("merchantName") ?? ""),
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    password: String(formData.get("password") ?? ""),
    merchantAddress: String(formData.get("merchantAddress") ?? ""),
    termsAccepted: formData.get("termsAccepted") === "on",
  });

  if (!result.success) {
    return {
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  redirect("/login?registered=1");
};
