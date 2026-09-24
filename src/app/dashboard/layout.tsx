import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { guardMerchantDashboard } from "@/lib/auth/route-guard";

export const metadata: Metadata = {
  title: "Dashboard Merchant",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const membership = await guardMerchantDashboard();
  const suspension =
    membership.merchant.status === "SUSPENDED"
      ? { reason: membership.merchant.suspensionReason }
      : undefined;
  return <DashboardShell suspension={suspension}>{children}</DashboardShell>;
}
