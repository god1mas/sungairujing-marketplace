import "server-only";

import { requireMerchantAdmin } from "@/lib/auth/authorization";

export const getMerchantDashboardAccess = async (
  dependencies: { authorize?: typeof requireMerchantAdmin } = {},
) => {
  const membership = await (dependencies.authorize ?? requireMerchantAdmin)();
  return {
    readOnly: membership.merchant.status === "SUSPENDED",
  };
};
