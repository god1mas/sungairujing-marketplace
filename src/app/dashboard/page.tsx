import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { getMerchantDashboardOverview } from "@/services/merchant-dashboard-service";

export default async function DashboardPage() {
  const metrics = await getMerchantDashboardOverview();
  return <DashboardOverview metrics={metrics} />;
}
