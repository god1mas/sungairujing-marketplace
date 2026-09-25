"use server";

import {
  requireAuthenticatedUser,
  UnauthenticatedError,
} from "@/lib/auth/authorization";
import { changePassword } from "@/services/account-security-service";
import type { ChangePasswordActionState } from "./change-password-state";

export const changePasswordAction = async (
  _previousState: ChangePasswordActionState,
  formData: FormData,
): Promise<ChangePasswordActionState> => {
  let user: Awaited<ReturnType<typeof requireAuthenticatedUser>>;
  try {
    user = await requireAuthenticatedUser();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return {
        success: false,
        message: "Sesi tidak valid. Silakan login kembali.",
      };
    }
    throw error;
  }

  const result = await changePassword(user.id, {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
  });

  if (!result.success) {
    return {
      success: false,
      message: result.message,
      fieldErrors: result.fieldErrors,
    };
  }

  return {
    success: true,
    message: "Password berhasil diperbarui. Silakan login kembali.",
  };
};
