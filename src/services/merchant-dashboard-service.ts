import "server-only";

import { requireMerchantAdmin } from "@/lib/auth/authorization";
import {
  countMerchantDashboardProducts,
  type MerchantDashboardProductCounts,
} from "@/repositories/merchant-dashboard-repository";

type MerchantAuthorizer = typeof requireMerchantAdmin;
type ProductCounter = (
  merchantId: string,
) => Promise<MerchantDashboardProductCounts>;

export const getMerchantDashboardOverview = async (
  dependencies: {
    authorize?: MerchantAuthorizer;
    countProducts?: ProductCounter;
  } = {},
) => {
  const membership = await (dependencies.authorize ?? requireMerchantAdmin)();
  return (dependencies.countProducts ?? countMerchantDashboardProducts)(
    membership.merchantId,
  );
};
