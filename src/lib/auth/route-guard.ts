import "server-only";

import { redirect } from "next/navigation";
import {
  ForbiddenError,
  requireMerchantAdmin,
  requireSuperAdmin,
  UnauthenticatedError,
} from "./authorization";

export const guardMerchantDashboard = async () => {
  try {
    return await requireMerchantAdmin();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login");
    }
    if (error instanceof ForbiddenError) {
      redirect("/");
    }
    throw error;
  }
};

export const guardAdminArea = async () => {
  try {
    return await requireSuperAdmin();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login");
    }
    if (error instanceof ForbiddenError) {
      redirect("/dashboard");
    }
    throw error;
  }
};
